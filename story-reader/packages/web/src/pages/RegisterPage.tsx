import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, BookOpen, CheckCircle2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import { translate, type TranslationKey } from '@story-reader/shared';
import { useToast } from '../store/useToast';
import GoogleIcon from '../components/auth/GoogleIcon';
import { useGoogleAuth } from '../components/auth/useGoogleAuth';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

interface FieldError {
  username?: string;
  email?: string;
  password?: string;
  confirm?: string;
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { register, readerSettings } = useStore();
  const t = (k: TranslationKey) => translate(readerSettings.language, k);

  useDocumentMeta({
    title: t('registerNewAccount'),
    description: t('registerPrompt'),
  });

  const from = (location.state as { from?: string })?.from ?? '/';

  const toast = useToast();
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldError>({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const google = useGoogleAuth(() => {
    toast.success(t('googleLoginSuccess'));
    navigate(from, { replace: true });
  });

  function validate(username: string, email: string, password: string, confirm: string): FieldError {
    const errs: FieldError = {};
    if (!username.trim()) errs.username = t('usernameRequired');
    else if (username.trim().length < 3) errs.username = t('usernameTooShort');
    else if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) errs.username = t('usernameInvalid');

    if (!email.trim()) errs.email = t('emailRequired');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errs.email = t('emailInvalid');

    if (!password) errs.password = t('passwordRequired');
    else if (password.length < 6) errs.password = t('passwordTooShort');

    if (!confirm) errs.confirm = t('confirmRequired');
    else if (password !== confirm) errs.confirm = t('passwordConfirmMismatch');

    return errs;
  }

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setFieldErrors((fe) => ({ ...fe, [key]: undefined }));
    setServerError('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const errs = validate(form.username, form.email, form.password, form.confirm);
    if (Object.keys(errs).length > 0) { setFieldErrors(errs); return; }

    setLoading(true);
    const result = await register(form.username, form.email, form.password);
    setLoading(false);

    if (result.success) {
      toast.success(t('registerSuccess'));
      navigate(from, { replace: true });
    } else {
      setServerError(result.error ?? t('registerFailed'));
    }
  };

  const PasswordStrength = () => {
    const p = form.password;
    if (!p) return null;
    const score = [p.length >= 6, /[A-Z]/.test(p), /[0-9]/.test(p), /[^a-zA-Z0-9]/.test(p)].filter(Boolean).length;
    const labels = ['', 'Yếu', 'Trung bình', 'Tốt', 'Mạnh'];
    const colors = ['', 'bg-red-400', 'bg-yellow-400', 'bg-blue-400', 'bg-green-400'];
    return (
      <div className="mt-1.5">
        <div className="flex gap-1 mb-1">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= score ? colors[score] : 'bg-gray-100'}`} />
          ))}
        </div>
        {score > 0 && <p className={`text-[10px] font-medium ${score <= 1 ? 'text-red-500' : score === 2 ? 'text-yellow-600' : 'text-green-600'}`}>{labels[score]}</p>}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-start sm:items-center">
      <div className="w-full max-w-md flex flex-col sm:shadow-xl sm:rounded-3xl sm:overflow-hidden">
        {/* Top gradient */}
        <div className="bg-gradient-to-br from-primary-500 to-primary-700 pt-14 pb-10 px-6 flex flex-col items-center">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-4">
            <BookOpen size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">{t('registerNewAccount')}</h1>
          <p className="text-primary-100 text-sm mt-1">{t('registerPrompt')}</p>
        </div>

        {/* Form card */}
        <div className="flex-1 bg-white rounded-t-3xl -mt-6 px-6 pt-8 pb-8 shadow-sm">

          {/* Google button — real OAuth */}
          <button
            type="button"
            onClick={google.handleGoogleClick}
            disabled={loading || google.loading}
            className="w-full flex items-center justify-center gap-3 py-3.5 px-4
                       bg-white border border-[#dadce0] rounded-2xl shadow-sm
                       hover:bg-gray-50 active:bg-gray-100 transition-colors
                       disabled:opacity-60 select-none mb-2"
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
            <div className="mb-3 bg-red-50 border border-red-100 text-red-600 text-xs px-4 py-3 rounded-2xl flex items-center gap-2">
              <span>⚠️</span> {google.error}
            </div>
          )}

          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-400">{t('orSignInWithEmail')}</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <Field
              label={t('username')}
              icon={<User size={17} className="text-gray-400" />}
              error={fieldErrors.username}
            >
              <input
                type="text"
                autoComplete="username"
                placeholder="vd: nguyen_van_a"
                value={form.username}
                onChange={set('username')}
                className={inputCls(!!fieldErrors.username)}
              />
            </Field>

            {/* Email */}
            <Field
              label={t('email')}
              icon={<Mail size={17} className="text-gray-400" />}
              error={fieldErrors.email}
            >
              <input
                type="email"
                autoComplete="email"
                placeholder="your@email.com"
                value={form.email}
                onChange={set('email')}
                className={inputCls(!!fieldErrors.email)}
              />
            </Field>

            {/* Password */}
            <Field
              label={t('password')}
              icon={<Lock size={17} className="text-gray-400" />}
              error={fieldErrors.password}
              suffix={
                <button type="button" onClick={() => setShowPass((v) => !v)}>
                  {showPass ? <EyeOff size={17} className="text-gray-400" /> : <Eye size={17} className="text-gray-400" />}
                </button>
              }
            >
              <input
                type={showPass ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="••••••••"
                value={form.password}
                onChange={set('password')}
                className={inputCls(!!fieldErrors.password)}
              />
              <PasswordStrength />
            </Field>

            {/* Confirm password */}
            <Field
              label={t('confirmNewPassword')}
              icon={
                form.confirm && form.confirm === form.password
                  ? <CheckCircle2 size={17} className="text-green-500" />
                  : <Lock size={17} className="text-gray-400" />
              }
              error={fieldErrors.confirm}
            >
              <input
                type={showPass ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="••••••••"
                value={form.confirm}
                onChange={set('confirm')}
                className={inputCls(!!fieldErrors.confirm)}
              />
            </Field>

            {/* Server error */}
            {serverError && (
              <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-2xl flex items-center gap-2">
                <span className="text-base">⚠️</span>
                {serverError}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-500 text-white font-bold py-4 rounded-2xl text-sm active:bg-primary-600 disabled:opacity-60 transition-all mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {t('processing')}
                </span>
              ) : t('register')}
            </button>
          </form>

          {/* Login link */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-400">hoặc</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          <p className="text-center text-sm text-gray-500">
            Đã có tài khoản?{' '}
            <Link to="/login" state={{ from }} className="text-primary-500 font-semibold">
              {t('login')}
            </Link>
          </p>
          <div className="text-center mt-4">
            <Link to="/" className="text-xs text-gray-400 underline">
              {t('continueWithoutLogin')}
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
}

function inputCls(hasError: boolean) {
  return `w-full pl-11 pr-11 py-3.5 bg-gray-50 border rounded-2xl text-sm text-gray-900
    placeholder:text-gray-400 focus:outline-none focus:bg-white transition-colors
    ${hasError ? 'border-red-300 focus:border-red-400' : 'border-gray-200 focus:border-primary-400'}`;
}

function Field({
  label, icon, suffix, error, children,
}: {
  label: string;
  icon: React.ReactNode;
  suffix?: React.ReactNode;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">{label}</label>
      <div className="relative">
        <div className="absolute left-4 top-3.5 pointer-events-none">{icon}</div>
        {children}
        {suffix && <div className="absolute right-4 top-3.5">{suffix}</div>}
      </div>
      {error && <p className="text-xs text-red-500 mt-1 ml-1">{error}</p>}
    </div>
  );
}
