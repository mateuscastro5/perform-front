import { motion } from 'framer-motion';
import { cn, getColorClasses, type ColorVariant } from '../../lib/design-system';
import { Card, TooltipWrapper } from './base-components';

// ==========================================
// METRIC CARD - 100% MODERNO (SEM CSS LEGACY)
// ==========================================

interface MetricCardProps {
  value: string | number;
  label: string;
  subtitle?: string;
  color: ColorVariant;
  onClick?: () => void;
  className?: string;
}

export const MetricCard = ({ 
  value, 
  label, 
  subtitle, 
  color, 
  onClick, 
  className 
}: MetricCardProps) => {
  const colorClasses = getColorClasses(color);

  return (
    <TooltipWrapper content={`Click to view detailed ${label.toLowerCase()} analytics`}>
      <Card 
        animated={true}
        onClick={onClick}
        className={cn(
          // Styling 100% baseado em Tailwind + componentes
          'text-center',
          className
        )}
      >
        {/* Main value with animation */}
        <motion.div 
          className={cn('text-3xl font-bold mb-2', colorClasses.text)}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ 
            delay: 0.2, 
            type: "spring", 
            stiffness: 400,
            damping: 15 
          }}
        >
          {value}
        </motion.div>
        
        {/* Label */}
        <div className="text-gray-300 text-sm font-medium">{label}</div>
        
        {/* Subtitle with animation */}
        {subtitle && (
          <motion.div 
            className={cn('text-xs mt-1 font-medium', colorClasses.textSubtle)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {subtitle}
          </motion.div>
        )}
      </Card>
    </TooltipWrapper>
  );
};
