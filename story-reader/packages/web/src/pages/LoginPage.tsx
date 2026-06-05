import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, BookOpen } from 'lucide-react';
import { useStore } from '../store/useStore';
import { translate, type TranslationKey } from '@story-reader/shared';
import { useToast } from '../store/useToast';
import GoogleIcon from '../components/auth/GoogleIcon';
import { useGoogleAuth } from '../components/auth/useGoogleAuth';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

export default function LoginPage() {
  const { readerSettings } = useStore();
  const t = (key: TranslationKey) => translate(readerSettings.language, key);

  useDocumentMeta({
    title: t('login'),
    description: t('loginPrompt'),
  });

  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useStore();
  const toast = useToast();
  const from = (location.state as { from?: string })?.from ?? '/';

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const google = useGoogleAuth(() => {
    toast.success(t('googleLoginSuccess'));
    navigate(from, { replace: true });
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(form.email, form.password);
    setLoading(false);
      if (result.success) {
      toast.success(t('loginSuccess'));
      navigate(from, { replace: true });
    } else {
      setError(result.error ?? t('loginFailed'));
    }
  };

  const isBusy = loading || google.loading;

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-start sm:items-center">
      <div className="w-full max-w-md flex flex-col sm:shadow-xl sm:rounded-3xl sm:overflow-hidden">
        {/* Hero */}
          <div className="bg-gradient-to-br from-primary-500 to-primary-700 pt-16 pb-12 px-6 flex flex-col items-center">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-4">
            <BookOpen size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">{t('welcomeBack')}</h1>
          <p className="text-primary-100 text-sm mt-1">{t('loginPrompt')}</p>
        </div>

        {/* Card */}
        <div className="flex-1 bg-white rounded-t-3xl -mt-6 px-6 pt-8 pb-8">

          {/* Google button — real OAuth */}
          <button
            type="button"
            onClick={google.handleGoogleClick}
            disabled={isBusy}
            className="w-full flex items-center justify-center gap-3 py-3.5 px-4
                       bg-white border border-[#dadce0] rounded-2xl shadow-sm
                       hover:bg-gray-50 active:bg-gray-100 transition-colors
                       disabled:opacity-60 select-none"
          >
            {google.loading ? (
              <>
                <svg className="animate-spin w-5 h-5 text-[#4285F4]" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                  <span className="text-sm font-medium text-gray-600">{t('processing')}</span>
              </>
            ) : (
              <>
                <GoogleIcon size={20} />
                <span className="text-sm font-medium text-gray-700">{t('continueWithGoogle')}</span>
              </>
            )}
          </button>

          {google.error && (
            <div className="mt-3 bg-red-50 border border-red-100 text-red-600 text-xs px-4 py-3 rounded-2xl flex items-center gap-2">
              <span>⚠️</span> {google.error}
            </div>
          )}

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-400">{t('orSignInWithEmail')}</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          {/* Email form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">{t('email')}</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <Mail size={17} className="text-gray-400" />
                </div>
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="your@email.com"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-primary-400 focus:bg-white transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">{t('password')}</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <Lock size={17} className="text-gray-400" />
                </div>
                <input
                  type={showPass ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  className="w-full pl-11 pr-11 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-primary-400 focus:bg-white transition-colors"
                />
                <button type="button" onClick={() => setShowPass((v) => !v)} className="absolute right-4 top-1/2 -translate-y-1/2">
                  {showPass ? <EyeOff size={17} className="text-gray-400" /> : <Eye size={17} className="text-gray-400" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-2xl flex items-center gap-2">
                <span>⚠️</span> {error}
              </div>
            )}

            <div className="flex justify-end -mt-1">
                <Link to="/forgot-password" className="text-xs font-semibold text-primary-500">
                {t('forgotPassword')}
              </Link>
            </div>

            <button
              type="submit"
              disabled={isBusy}
              className="w-full bg-primary-500 text-white font-bold py-4 rounded-2xl text-sm active:bg-primary-600 disabled:opacity-60 transition-all"
            >
              {loading ? (
                  <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {t('processing')}
                </span>
              ) : t('login')}
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-400">{t('noAccount')}</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          <Link
            to="/register"
            state={{ from }}
            className="w-full flex items-center justify-center py-3.5 border-2 border-primary-500 rounded-2xl text-primary-500 text-sm font-bold hover:bg-primary-50 active:bg-primary-100 transition-colors"
          >
            {t('registerNewAccount')}
          </Link>

          <div className="text-center mt-5">
            <Link to="/" className="text-xs text-gray-400 underline">{t('continueWithoutLogin')}</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
