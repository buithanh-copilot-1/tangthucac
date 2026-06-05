import { useStore } from '../store/useStore';

const BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/api';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function request<T = unknown>(
  path: string,
  options: RequestInit & { skipAuth?: boolean } = {},
  _retry = true,
): Promise<T> {
  const { skipAuth, ...init } = options;
  const { accessToken } = useStore.getState();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string>),
  };
  if (!skipAuth && accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const res = await fetch(`${BASE}${path}`, { ...init, headers });

  if (res.status === 401 && _retry && !skipAuth) {
    const { refreshToken, setTokens, clearAuth } = useStore.getState();
    if (refreshToken) {
      const rr = await fetch(`${BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      if (rr.ok) {
        const d = await rr.json() as { accessToken: string; refreshToken: string };
        setTokens(d.accessToken, d.refreshToken);
        return request<T>(path, options, false);
      }
    }
    clearAuth();
    throw new ApiError(401, 'Phiên đăng nhập đã hết hạn');
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { message?: string | string[] };
    const msg = Array.isArray(body.message) ? body.message[0] : (body.message ?? `Lỗi ${res.status}`);
    throw new ApiError(res.status, msg);
  }

  return res.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string) => request<T>(path, { method: 'GET' }),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
};
