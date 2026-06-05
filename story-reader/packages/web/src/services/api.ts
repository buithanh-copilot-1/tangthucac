import { useStore } from '../store/useStore';
import { useToast } from '../store/useToast';
import { translate } from '@story-reader/shared';

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
  /** Nếu true, lỗi sẽ KHÔNG tự show toast — caller tự xử lý */
  silent?: boolean;
}

async function request<T = unknown>(
  path: string,
  options: RequestOptions = {},
  _retry = true,
): Promise<T> {
  const { skipAuth, silent, ...init } = options;
  const { accessToken } = useStore.getState();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string>),
  };
  if (!skipAuth && accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, { ...init, headers });
  } catch {
    const lang = useStore.getState().readerSettings.language;
    const msg = translate(lang, 'networkError');
    const err = new ApiError(0, msg);
    if (!silent) useToast.getState().error(err.message, translate(lang, 'serverErrorTitle'));
    throw err;
  }

  // Auto-refresh khi access token hết hạn
  if (res.status === 401 && _retry && !skipAuth) {
    const { refreshToken, setTokens, clearAuth } = useStore.getState();
    if (refreshToken) {
      const rr = await fetch(`${BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      if (rr.ok) {
        const data = await rr.json() as { accessToken: string; refreshToken: string };
        setTokens(data.accessToken, data.refreshToken);
        return request<T>(path, options, false);
      }
    }
    clearAuth();
    const lang = useStore.getState().readerSettings.language;
    const msg = translate(lang, 'sessionExpired');
    const err = new ApiError(401, msg);
    if (!silent) useToast.getState().warning(err.message, translate(lang, 'sessionExpiredTitle'));
    throw err;
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as {
      message?: string | string[] | { message?: string | string[] };
    };

    // Backend có thể trả: string | string[] | { message: string | string[] }
    const raw = body.message;
    let msg: string;
    if (Array.isArray(raw)) {
      msg = raw[0];
    } else if (raw && typeof raw === 'object') {
      // AllExceptionsFilter wrap: { message: "...", error: "Conflict", statusCode: ... }
      const inner = (raw as any).message;
      msg = Array.isArray(inner) ? inner[0] : (inner ?? `Lỗi ${res.status}`);
    } else {
      msg = String(raw ?? `Lỗi ${res.status}`);
    }

    const err = new ApiError(res.status, msg);
    if (!silent && res.status >= 500) {
      const lang = useStore.getState().readerSettings.language;
      useToast.getState().error(msg, translate(lang, 'serverErrorTitle'));
    }
    throw err;
  }

  return res.json() as Promise<T>;
}

export const api = {
  get:    <T>(path: string, opts?: RequestOptions) =>
    request<T>(path, { method: 'GET', ...opts }),
  post:   <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body), ...opts }),
  put:    <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body), ...opts }),
  patch:  <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body), ...opts }),
  delete: <T>(path: string, opts?: RequestOptions) =>
    request<T>(path, { method: 'DELETE', ...opts }),
};
