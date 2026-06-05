import { useEffect, useState } from 'react';
import { X, CheckCircle2, XCircle, AlertTriangle, Info } from 'lucide-react';
import { useToast, type Toast, type ToastType } from '../../store/useToast';

const ICONS: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 size={18} className="text-green-500 flex-shrink-0 mt-0.5" />,
  error:   <XCircle     size={18} className="text-red-500   flex-shrink-0 mt-0.5" />,
  warning: <AlertTriangle size={18} className="text-yellow-500 flex-shrink-0 mt-0.5" />,
  info:    <Info        size={18} className="text-blue-500  flex-shrink-0 mt-0.5" />,
};

const BG: Record<ToastType, string> = {
  success: 'border-green-200  bg-green-50',
  error:   'border-red-200    bg-red-50',
  warning: 'border-yellow-200 bg-yellow-50',
  info:    'border-blue-200   bg-blue-50',
};

const TITLE_COLOR: Record<ToastType, string> = {
  success: 'text-green-800',
  error:   'text-red-800',
  warning: 'text-yellow-800',
  info:    'text-blue-800',
};

const MSG_COLOR: Record<ToastType, string> = {
  success: 'text-green-700',
  error:   'text-red-700',
  warning: 'text-yellow-700',
  info:    'text-blue-700',
};

function ToastItem({ toast }: { toast: Toast }) {
  const { dismiss } = useToast();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // slide-in
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  const handleDismiss = () => {
    setVisible(false);
    setTimeout(() => dismiss(toast.id), 300);
  };

  return (
    <div
      className={`
        relative flex items-start gap-3 px-4 py-3 rounded-2xl border shadow-lg
        transition-all duration-300 max-w-sm w-full
        ${BG[toast.type]}
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
      `}
      role="alert"
    >
      {ICONS[toast.type]}

      <div className="flex-1 min-w-0">
        {toast.title && (
          <p className={`text-sm font-semibold leading-tight ${TITLE_COLOR[toast.type]}`}>
            {toast.title}
          </p>
        )}
        <p className={`text-sm leading-snug ${toast.title ? 'mt-0.5' : ''} ${MSG_COLOR[toast.type]}`}>
          {toast.message}
        </p>
      </div>

      <button
        onClick={handleDismiss}
        className="flex-shrink-0 opacity-50 hover:opacity-100 transition-opacity mt-0.5"
        aria-label="Đóng"
      >
        <X size={15} />
      </button>

      {/* Progress bar (chỉ khi có duration) */}
      {toast.duration && toast.duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-b-2xl overflow-hidden bg-black/10">
          <div
            className="h-full bg-current opacity-30 origin-left"
            style={{
              animation: `shrink ${toast.duration}ms linear forwards`,
            }}
          />
        </div>
      )}
    </div>
  );
}

export default function ToastContainer() {
  const { toasts } = useToast();

  if (!toasts.length) return null;

  return (
    <>
      <style>{`
        @keyframes shrink {
          from { transform: scaleX(1); }
          to   { transform: scaleX(0); }
        }
      `}</style>
      <div
        className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2 w-full max-w-[380px] px-4 pointer-events-none"
        aria-live="polite"
      >
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem toast={toast} />
          </div>
        ))}
      </div>
    </>
  );
}
