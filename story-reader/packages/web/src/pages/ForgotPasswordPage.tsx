import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Mail } from 'lucide-react';
import { authApi } from '../services/auth.api';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

export default function ForgotPasswordPage() {
  useDocumentMeta({
    title: 'Quen mat khau',
    description: 'Tao yeu cau dat lai mat khau tai khoan TruyenHay.',
  });

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setResetToken('');
    setLoading(true);
    try {
      const res = await authApi.forgotPassword(email);
      setMessage(res.message);
      if (res.resetToken) setResetToken(res.resetToken);
    } catch (err: any) {
      setError(err?.message ?? 'Khong tao duoc yeu cau dat lai mat khau');
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
          <h1 className="text-2xl font-bold text-white">Quen mat khau</h1>
          <p className="text-primary-100 text-sm mt-1 text-center">Nhap email de tao yeu cau dat lai mat khau</p>
        </div>

        <div className="flex-1 bg-white rounded-t-3xl -mt-6 px-6 pt-8 pb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Email</label>
              <div className="relative">
                <Mail size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-primary-400 focus:bg-white"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            {error && <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}
            {message && <div className="rounded-2xl border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-700">{message}</div>}

            {resetToken && (
              <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3">
                <p className="text-xs font-semibold text-amber-700">Dev reset token</p>
                <p className="mt-1 break-all text-xs text-amber-800">{resetToken}</p>
                <Link
                  to={`/reset-password?token=${encodeURIComponent(resetToken)}`}
                  className="mt-3 inline-flex text-sm font-semibold text-primary-600"
                >
                  Dat lai mat khau bang token nay
                </Link>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-500 text-white font-bold py-4 rounded-2xl text-sm active:bg-primary-600 disabled:opacity-60"
            >
              {loading ? 'Dang xu ly...' : 'Gui yeu cau'}
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
