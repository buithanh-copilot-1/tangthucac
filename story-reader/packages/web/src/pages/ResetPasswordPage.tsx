import { useMemo, useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { BookOpen, Lock, KeyRound } from 'lucide-react';
import { authApi } from '../services/auth.api';
import { useToast } from '../store/useToast';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

export default function ResetPasswordPage() {
  useDocumentMeta({
    title: 'Dat lai mat khau',
    description: 'Dat lai mat khau tai khoan TruyenHay bang reset token.',
  });

  const [params] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();
  const initialToken = useMemo(() => params.get('token') ?? '', [params]);
  const [form, setForm] = useState({ token: initialToken, password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) {
      setError('Mat khau moi phai it nhat 6 ky tu');
      return;
    }
    if (form.password !== form.confirm) {
      setError('Xac nhan mat khau khong khop');
      return;
    }
    setLoading(true);
    try {
      await authApi.resetPassword(form.token.trim(), form.password);
      toast.success('Da dat lai mat khau. Hay dang nhap lai.');
      navigate('/login', { replace: true });
    } catch (err: any) {
      setError(err?.message ?? 'Dat lai mat khau that bai');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center">
      <div className="w-full max-w-mobile flex flex-col">
        <div className="bg-gradient-to-br from-primary-500 to-primary-700 pt-16 pb-12 px-6 flex flex-col items-center">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-4">
            <BookOpen size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Dat lai mat khau</h1>
          <p className="text-primary-100 text-sm mt-1 text-center">Nhap token va mat khau moi</p>
        </div>

        <div className="flex-1 bg-white rounded-t-3xl -mt-6 px-6 pt-8 pb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Reset token</label>
              <div className="relative">
                <KeyRound size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  required
                  value={form.token}
                  onChange={(e) => setForm((f) => ({ ...f, token: e.target.value }))}
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-primary-400 focus:bg-white"
                  placeholder="Token"
                />
              </div>
            </div>

            <PasswordInput
              label="Mat khau moi"
              value={form.password}
              onChange={(password) => setForm((f) => ({ ...f, password }))}
            />
            <PasswordInput
              label="Xac nhan mat khau"
              value={form.confirm}
              onChange={(confirm) => setForm((f) => ({ ...f, confirm }))}
            />

            {error && <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-500 text-white font-bold py-4 rounded-2xl text-sm active:bg-primary-600 disabled:opacity-60"
            >
              {loading ? 'Dang xu ly...' : 'Dat lai mat khau'}
            </button>
          </form>

          <div className="mt-5 text-center">
            <Link to="/login" className="text-sm font-semibold text-primary-500">Quay lai dang nhap</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function PasswordInput({
  label, value, onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">{label}</label>
      <div className="relative">
        <Lock size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="password"
          required
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-primary-400 focus:bg-white"
          placeholder="••••••••"
        />
      </div>
    </div>
  );
}
