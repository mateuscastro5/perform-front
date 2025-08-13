import { forwardRef } from 'react';
import { motion } from 'motion/react';
import * as Tooltip from '@radix-ui/react-tooltip';
import { cn, componentClasses, getColorClasses, type ColorVariant } from '../../lib/design-system';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  animated?: boolean;
  onClick?: () => void;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ children, className, animated = true, onClick, ...props }, ref) => {
    if (animated) {
      return (
        <motion.div
          ref={ref}
          className={cn(componentClasses.card, className)}
          onClick={onClick}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.02, y: -4 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          {...props}
        >
          {children}
        </motion.div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(componentClasses.card, className)}
        onClick={onClick}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onDrag'> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, className, variant = 'primary', size = 'md', loading, disabled, ...props }, ref) => {
    const variantClasses = {
      primary: 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg hover:shadow-blue-500/25',
      secondary: 'bg-slate-700 hover:bg-slate-600 text-gray-300 hover:text-white',
      ghost: 'hover:bg-slate-700/50 text-gray-400 hover:text-white'
    };

    const sizeClasses = {
      sm: 'h-8 px-3 text-sm',
      md: 'h-10 px-4 text-sm',
      lg: 'h-12 px-6 text-base'
    };

    return (
      <motion.button
        ref={ref}
        className={cn(
          componentClasses.button,
          variantClasses[variant],
          sizeClasses[size],
          (disabled || loading) && 'opacity-50 cursor-not-allowed',
          className
        )}
        disabled={disabled || loading}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        {...props}
      >
        {loading && (
          <motion.div
            className="w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
        )}
        {children}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

interface BadgeProps {
  children: React.ReactNode;
  variant?: ColorVariant | 'gray';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ children, className, variant = 'gray', size = 'sm', ...props }, ref) => {
    const variantClasses = variant === 'gray' 
      ? 'bg-slate-500/10 text-slate-400 border-slate-500/20'
      : cn(
          getColorClasses(variant as ColorVariant).bg,
          getColorClasses(variant as ColorVariant).text,
          getColorClasses(variant as ColorVariant).border
        );

    const sizeClasses = {
      sm: 'px-2 py-1 text-xs',
      md: 'px-3 py-1.5 text-sm'
    };

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center rounded-full border font-medium',
          variantClasses,
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

interface AvatarProps {
  name?: string;
  initials?: string;
  src?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  status?: 'online' | 'away' | 'coding' | 'offline';
  className?: string;
}

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ name, initials, src, size = 'md', status, className, ...props }, ref) => {
    const sizeClasses = {
      sm: 'w-6 h-6 text-xs',
      md: 'w-8 h-8 text-sm',
      lg: 'w-10 h-10 text-sm',
      xl: 'w-20 h-20 text-2xl'
    };

    const statusColors = {
      online: 'bg-green-500 shadow-green-500/50',
      coding: 'bg-blue-500 shadow-blue-500/50 animate-pulse',
      away: 'bg-yellow-500 shadow-yellow-500/50',
      offline: 'bg-gray-500 shadow-gray-500/50'
    };

    const displayInitials = initials || (name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : '??');

    return (
      <div ref={ref} className={cn('relative', className)} {...props}>
        {src ? (
          <img
            src={src}
            alt={name}
            className={cn(
              'rounded-full object-cover bg-gradient-to-br from-blue-500 to-purple-600',
              sizeClasses[size]
            )}
          />
        ) : (
          <div
            className={cn(
              'rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold',
              sizeClasses[size]
            )}
          >
            {displayInitials}
          </div>
        )}
        
        {status && (
          <div 
            className={cn(
              'absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-800',
              statusColors[status]
            )}
          />
        )}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';

interface TooltipProps {
  children: React.ReactNode;
  content: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
}

export const TooltipWrapper = ({ children, content, side = 'top' }: TooltipProps) => {
  return (
    <Tooltip.Provider>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          {children}
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            side={side}
            className="bg-slate-900 text-white px-3 py-2 rounded-lg shadow-xl border border-slate-700 text-sm"
            sideOffset={5}
          >
            {content}
            <Tooltip.Arrow className="fill-slate-900" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
};
