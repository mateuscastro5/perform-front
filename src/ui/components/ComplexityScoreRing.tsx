interface ComplexityScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
}

function getScoreGradient(score: number): { from: string; to: string } {
  if (score <= 20) return { from: '#22c55e', to: '#16a34a' };
  if (score <= 40) return { from: '#3b82f6', to: '#2563eb' };
  if (score <= 60) return { from: '#eab308', to: '#ca8a04' };
  if (score <= 80) return { from: '#f97316', to: '#ea580c' };
  return { from: '#ef4444', to: '#dc2626' };
}

export function ComplexityScoreRing({
  score,
  size = 80,
  strokeWidth = 6,
  label,
}: ComplexityScoreRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const gradientId = `score-gradient-${Math.random().toString(36).slice(2)}`;
  const colors = getScoreGradient(score);

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <defs>
            <linearGradient id={gradientId}>
              <stop offset="0%" stopColor={colors.from} />
              <stop offset="100%" stopColor={colors.to} />
            </linearGradient>
          </defs>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-muted/20"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold">{Math.round(score)}</span>
        </div>
      </div>
      {label && (
        <span className="text-xs text-muted-foreground">{label}</span>
      )}
    </div>
  );
}
