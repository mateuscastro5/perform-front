import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import type { DeveloperEvolution } from '../types/analysis.types';

interface DeveloperEvolutionChartProps {
  data: DeveloperEvolution;
}

const TREND_CONFIG = {
  improving: { label: 'Improving', color: 'text-green-600', bg: 'bg-green-100' },
  stable: { label: 'Stable', color: 'text-blue-600', bg: 'bg-blue-100' },
  declining: { label: 'Declining', color: 'text-orange-600', bg: 'bg-orange-100' },
};

export function DeveloperEvolutionChart({ data }: DeveloperEvolutionChartProps) {
  const trend = TREND_CONFIG[data.trend] || TREND_CONFIG.stable;

  const chartData = data.periods.map((p) => ({
    period: p.date,
    avg: Math.round(p.avgComplexity),
    max: Math.round(p.maxComplexity),
    prs: p.prCount,
  }));

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Complexity Evolution</CardTitle>
        <Badge variant="outline" className={`${trend.bg} ${trend.color} border-0 text-xs`}>
          {trend.label}
        </Badge>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">
            No analysis data yet. Trigger PR analyses to see evolution.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="avgGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="maxGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
              <XAxis
                dataKey="period"
                tick={{ fontSize: 11 }}
                className="text-muted-foreground"
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 11 }}
                className="text-muted-foreground"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                formatter={(value, name) => [
                  value as number,
                  name === 'avg' ? 'Avg Complexity' : name === 'max' ? 'Max Complexity' : 'PRs',
                ]}
              />
              <Area
                type="monotone"
                dataKey="max"
                stroke="#f97316"
                fill="url(#maxGradient)"
                strokeWidth={1.5}
                dot={false}
              />
              <Area
                type="monotone"
                dataKey="avg"
                stroke="#3b82f6"
                fill="url(#avgGradient)"
                strokeWidth={2}
                dot={{ r: 3, fill: '#3b82f6' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
