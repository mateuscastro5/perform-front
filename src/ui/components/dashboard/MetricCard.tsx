interface MetricCardProps {
  value: string | number;
  label: string;
  subtitle?: string;
  color: 'blue' | 'yellow' | 'green' | 'purple' | 'red';
  onClick?: () => void;
}

const MetricCard = ({
  value,
  label,
  subtitle,
  color,
  onClick
}: MetricCardProps) => {
  const colorClasses = {
    blue: 'text-blue-400',
    yellow: 'text-yellow-400',
    green: 'text-green-400',
    purple: 'text-purple-400',
    red: 'text-red-400'
  };

  const subtitleColorClasses = {
    blue: 'text-blue-500',
    yellow: 'text-yellow-500',
    green: 'text-green-500',
    purple: 'text-purple-500',
    red: 'text-red-500'
  };

  return (
    <div 
      className="metric-card group cursor-pointer"
      onClick={onClick}
    >
      <div className={`text-3xl font-bold mb-2 ${colorClasses[color]}`}>
        {value}
      </div>
      <div className="text-gray-300 text-sm">{label}</div>
      {subtitle && (
        <div className={`text-xs mt-1 ${subtitleColorClasses[color]}`}>
          {subtitle}
        </div>
      )}
    </div>
  );
};

export default MetricCard;
