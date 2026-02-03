import { create } from 'zustand';
import { ProgressToastProps, ToastStatus } from '@/ui/components/ui/ProgressToast';

interface ToastStore {
  toasts: ProgressToastProps[];
  addToast: (toast: Omit<ProgressToastProps, 'id' | 'onClose'>) => string;
  updateToast: (id: string, updates: Partial<ProgressToastProps>) => void;
  removeToast: (id: string) => void;
  clearAll: () => void;
}

export const useProgressToastStore = create<ToastStore>((set) => ({
  toasts: [],

  addToast: (toast) => {
    const id = Math.random().toString(36).substr(2, 9);
    set((state) => ({
      toasts: [
        ...state.toasts,
        {
          ...toast,
          id,
          onClose: () => {
            set((state) => ({
              toasts: state.toasts.filter((t) => t.id !== id),
            }));
          },
        },
      ],
    }));
    return id;
  },

  updateToast: (id, updates) => {
    set((state) => ({
      toasts: state.toasts.map((toast) =>
        toast.id === id ? { ...toast, ...updates } : toast
      ),
    }));
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    }));
  },

  clearAll: () => {
    set({ toasts: [] });
  },
}));

// Helper hook for easier usage
export const useProgressToast = () => {
  const { addToast, updateToast, removeToast } = useProgressToastStore();

  const showLoading = (title: string, description?: string) => {
    return addToast({
      title,
      description,
      status: 'loading' as ToastStatus,
      progress: 0,
    });
  };

  const showSuccess = (title: string, description?: string, duration = 3000) => {
    return addToast({
      title,
      description,
      status: 'success' as ToastStatus,
      progress: 100,
      duration,
    });
  };

  const showError = (title: string, description?: string, duration = 5000) => {
    return addToast({
      title,
      description,
      status: 'error' as ToastStatus,
      progress: 100,
      duration,
    });
  };

  const updateProgress = (id: string, progress: number) => {
    updateToast(id, { progress });
  };

  const completeWithSuccess = (
    id: string,
    title?: string,
    description?: string
  ) => {
    updateToast(id, {
      status: 'success' as ToastStatus,
      progress: 100,
      ...(title && { title }),
      ...(description && { description }),
      duration: 3000,
    });
  };

  const completeWithError = (
    id: string,
    title?: string,
    description?: string
  ) => {
    updateToast(id, {
      status: 'error' as ToastStatus,
      progress: 100,
      ...(title && { title }),
      ...(description && { description }),
      duration: 5000,
    });
  };

  return {
    showLoading,
    showSuccess,
    showError,
    updateProgress,
    completeWithSuccess,
    completeWithError,
    removeToast,
  };
};
