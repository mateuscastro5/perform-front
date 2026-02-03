import { ProgressToast } from './ProgressToast';
import { useProgressToastStore } from '@/ui/hooks/useProgressToast';

export const ProgressToastContainer = () => {
  const toasts = useProgressToastStore((state: any) => state.toasts);

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      <div className="flex flex-col gap-2 pointer-events-auto">
        {toasts.map((toast: any) => (
          <ProgressToast key={toast.id} {...toast} />
        ))}
      </div>
    </div>
  );
};
