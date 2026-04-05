import { Badge } from './ui/badge';
import type { DifficultyLabel } from '../types/analysis.types';

const DIFFICULTY_CONFIG: Record<
  DifficultyLabel,
  { color: string; bg: string; label: string }
> = {
  trivial: { color: 'text-green-700', bg: 'bg-green-100', label: 'Trivial' },
  easy: { color: 'text-blue-700', bg: 'bg-blue-100', label: 'Easy' },
  medium: { color: 'text-yellow-700', bg: 'bg-yellow-100', label: 'Medium' },
  hard: { color: 'text-orange-700', bg: 'bg-orange-100', label: 'Hard' },
  expert: { color: 'text-red-700', bg: 'bg-red-100', label: 'Expert' },
};

function getScoreColor(score: number): string {
  if (score <= 20) return 'text-green-600';
  if (score <= 40) return 'text-blue-600';
  if (score <= 60) return 'text-yellow-600';
  if (score <= 80) return 'text-orange-600';
  return 'text-red-600';
}

interface PrComplexityBadgeProps {
  score: number;
  label: DifficultyLabel;
  confidence?: number;
  showScore?: boolean;
  size?: 'sm' | 'md';
}

export function PrComplexityBadge({
  score,
  label,
  confidence,
  showScore = true,
  size = 'sm',
}: PrComplexityBadgeProps) {
  const config = DIFFICULTY_CONFIG[label] || DIFFICULTY_CONFIG.medium;
  const scoreColor = getScoreColor(score);

  return (
    <div className="inline-flex items-center gap-1.5">
      <Badge
        variant="outline"
        className={`${config.bg} ${config.color} border-0 ${size === 'sm' ? 'text-xs px-1.5 py-0' : 'text-sm px-2 py-0.5'}`}
      >
        {config.label}
      </Badge>
      {showScore && (
        <span className={`${scoreColor} font-semibold ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
          {Math.round(score)}
        </span>
      )}
      {confidence !== undefined && confidence < 0.7 && (
        <span className="text-xs text-muted-foreground" title="Low confidence">
          ?
        </span>
      )}
    </div>
  );
}
