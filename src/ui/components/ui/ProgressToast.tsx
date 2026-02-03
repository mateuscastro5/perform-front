import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Loader2, X } from 'lucide-react';
import { cn } from '@/ui/lib/utils';

export type ToastStatus = 'loading' | 'success' | 'error';

export interface ProgressToastProps {
  id: string;
  title: string;
  description?: string;
  status: ToastStatus;
  progress?: number;
  duration?: number;
  onClose?: () => void;
}

export const ProgressToast = ({
  title,
  description,
  status,
  progress = 0,
  duration = 5000,
  onClose,
}: ProgressToastProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [autoProgress, setAutoProgress] = useState(0);

  useEffect(() => {
    if (status === 'success' || status === 'error') {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onClose?.(), 300);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [status, duration, onClose]);

  useEffect(() => {
    if (status === 'loading' && progress === 0) {
      const interval = setInterval(() => {
        setAutoProgress((prev) => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 5;
        });
      }, 200);

      return () => clearInterval(interval);
    }
  }, [status, progress]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose?.(), 300);
  };

  const currentProgress = progress > 0 ? progress : autoProgress;

  const getIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="h-5 w-5 animate-spin text-primary" />;
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-success" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-destructive" />;
    }
  };

  const getStyles = () => {
    switch (status) {
      case 'loading':
        return {
          border: 'border-primary/30',
          bg: 'bg-card/95',
          progressBg: 'bg-primary',
        };
      case 'success':
        return {
          border: 'border-success/30',
          bg: 'bg-card/95',
          progressBg: 'bg-success',
        };
      case 'error':
        return {
          border: 'border-destructive/30',
          bg: 'bg-card/95',
          progressBg: 'bg-destructive',
        };
    }
  };

  const styles = getStyles();

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className={cn(
            'relative w-full max-w-md rounded-xl border backdrop-blur-sm shadow-2xl overflow-hidden',
            styles.border,
            styles.bg
          )}
        >
          {/* Progress bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-muted/20">
            <motion.div
              className={cn('h-full', styles.progressBg)}
              initial={{ width: 0 }}
              animate={{ width: status === 'loading' ? `${currentProgress}%` : '100%' }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            />
          </div>

          {/* Content */}
          <div className="flex items-start gap-3 p-4 pt-5">
            <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>

            <div className="flex-1 space-y-1">
              <h3 className="text-sm font-semibold text-foreground">{title}</h3>
              {description && (
                <p className="text-xs text-muted-foreground">{description}</p>
              )}

              {/* Progress percentage for loading */}
              {status === 'loading' && (
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-1 h-1.5 bg-muted/30 rounded-full overflow-hidden">
                    <motion.div
                      className={cn('h-full rounded-full', styles.progressBg)}
                      initial={{ width: 0 }}
                      animate={{ width: `${currentProgress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground font-medium min-w-[3ch]">
                    {Math.round(currentProgress)}%
                  </span>
                </div>
              )}
            </div>

            {/* Close button */}
            <button
              onClick={handleClose}
              className="flex-shrink-0 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/20 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
