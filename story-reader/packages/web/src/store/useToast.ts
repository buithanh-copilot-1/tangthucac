import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number; // ms, 0 = persist
}

interface ToastState {
  toasts: Toast[];
  show: (toast: Omit<Toast, 'id'>) => string;
  success: (message: string, title?: string) => string;
  error: (message: string, title?: string) => string;
  warning: (message: string, title?: string) => string;
  info: (message: string, title?: string) => string;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

export const useToast = create<ToastState>((set, get) => ({
  toasts: [],

  show: ({ type, title, message, duration = 4000 }) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    set((s) => ({ toasts: [...s.toasts, { id, type, title, message, duration }] }));

    if (duration > 0) {
      setTimeout(() => get().dismiss(id), duration);
    }
    return id;
  },

  success: (message, title) => get().show({ type: 'success', message, title }),
  error:   (message, title) => get().show({ type: 'error',   message, title, duration: 6000 }),
  warning: (message, title) => get().show({ type: 'warning', message, title, duration: 5000 }),
  info:    (message, title) => get().show({ type: 'info',    message, title }),

  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
  dismissAll: () => set({ toasts: [] }),
}));
