import { Card, CardContent } from '@/ui/components/ui/card';
import { cn } from '@/ui/lib/utils';

interface MetricCardProps {
  value: string | number;
  label: string;
  subtitle?: string;
  color: 'blue' | 'yellow' | 'green' | 'purple' | 'red';
  onClick?: () => void;
  icon?: React.ReactNode;
}

const MetricCard = ({
  value,
  label,
  subtitle,
  color,
  onClick,
  icon
}: MetricCardProps) => {
  const colorClasses = {
    blue: 'text-accent',
    yellow: 'text-warning',
    green: 'text-success',
    purple: 'text-secondary',
    red: 'text-destructive'
  };

  const glowClasses = {
    blue: 'group-hover:shadow-[0_0_30px_hsl(200_100%_64%_/_0.3)]',
    yellow: 'group-hover:shadow-[0_0_30px_hsl(265_60%_80%_/_0.3)]',
    green: 'group-hover:shadow-glow-green',
    purple: 'group-hover:shadow-glow-purple',
    red: 'group-hover:shadow-[0_0_30px_hsl(0_100%_70%_/_0.3)]'
  };

  return (
    <Card 
      className={cn(
        "group cursor-pointer transition-all duration-300 hover:scale-[1.02] backdrop-blur-sm bg-card/50",
        glowClasses[color],
        onClick && "cursor-pointer"
      )}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <div className={cn("text-3xl font-bold", colorClasses[color])}>
              {value}
            </div>
            {subtitle && (
              <p className={cn("text-xs font-medium", colorClasses[color])}>
                {subtitle}
              </p>
            )}
          </div>
          {icon && (
            <div className={cn(
              "rounded-lg bg-muted/30 p-3 group-hover:bg-muted/50 transition-colors",
              colorClasses[color]
            )}>
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MetricCard;

