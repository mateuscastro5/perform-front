import { motion } from "motion/react";
import { BarChart3, TrendingUp, Users } from "lucide-react";
import { Card } from "../ui/base-components";
import { animations } from "../../lib/design-system";

interface DataPoint {
  day: string;
  commits: number;
  prsMerged: number;
  deploysToProduction: number;
  codeReviews: number;
}

interface TeamMember {
  id: string;
  name: string;
  avatar?: string;
}

interface ImpactChartProps {
  data?: DataPoint[];
  teamMembers?: TeamMember[];
  title?: string;
}

const ImpactChart = ({ 
  data = [
    { day: 'Mon', commits: 5, prsMerged: 2, deploysToProduction: 1, codeReviews: 3 },
    { day: 'Tue', commits: 3, prsMerged: 1, deploysToProduction: 0, codeReviews: 4 },
    { day: 'Wed', commits: 8, prsMerged: 3, deploysToProduction: 2, codeReviews: 2 },
    { day: 'Thu', commits: 4, prsMerged: 2, deploysToProduction: 1, codeReviews: 5 },
    { day: 'Fri', commits: 6, prsMerged: 4, deploysToProduction: 3, codeReviews: 1 },
    { day: 'Sat', commits: 2, prsMerged: 1, deploysToProduction: 0, codeReviews: 2 },
    { day: 'Sun', commits: 1, prsMerged: 0, deploysToProduction: 0, codeReviews: 1 }
  ],
  title = "Weekly Impact"
}: ImpactChartProps) => {
  
  const maxValue = Math.max(...data.map(d => d.prsMerged));
  const totalPRs = data.reduce((sum, d) => sum + d.prsMerged, 0);
  const totalCommits = data.reduce((sum, d) => sum + d.commits, 0);
  const totalReviews = data.reduce((sum, d) => sum + d.codeReviews, 0);

  const chartHeight = 120;
  const chartWidth = 280;
  const padding = 20;
  
  const createPath = () => {
    const points = data.map((point, index) => {
      const x = padding + (index * (chartWidth - padding * 2)) / (data.length - 1);
      const y = chartHeight - padding - ((point.prsMerged / maxValue) * (chartHeight - padding * 2));
      return `${x},${y}`;
    });
    
    return `M ${points.join(' L ')}`;
  };

  return (
    <Card className="flex-1" animated={false}>
      <motion.div {...animations.slideUp} className="flex flex-col h-full">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <h2 className="text-base font-semibold leading-tight">{title}</h2>
          </div>
          
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <TrendingUp className="w-3 h-3 text-green-400" />
            <span>+12% this week</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="text-center p-2 bg-slate-800/30 rounded-lg">
            <div className="text-base font-bold text-blue-400 leading-tight">{totalPRs}</div>
            <div className="text-xs text-gray-400 mt-0.5">PRs Merged</div>
          </div>
          <div className="text-center p-2 bg-slate-800/30 rounded-lg">
            <div className="text-base font-bold text-green-400 leading-tight">{totalCommits}</div>
            <div className="text-xs text-gray-400 mt-0.5">Commits</div>
          </div>
          <div className="text-center p-2 bg-slate-800/30 rounded-lg">
            <div className="text-base font-bold text-purple-400 leading-tight">{totalReviews}</div>
            <div className="text-xs text-gray-400 mt-0.5">Reviews</div>
          </div>
        </div>

        <div className="flex-1 bg-slate-800/20 rounded-lg p-3">
          <svg width="100%" height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="overflow-visible">
            {[0, 1, 2, 3, 4].map((_, i) => (
              <line
                key={i}
                x1={padding}
                y1={padding + (i * (chartHeight - padding * 2)) / 4}
                x2={chartWidth - padding}
                y2={padding + (i * (chartHeight - padding * 2)) / 4}
                stroke="rgb(71 85 105 / 0.3)"
                strokeWidth="1"
              />
            ))}
            
            <motion.path
              d={createPath()}
              fill="none"
              stroke="rgb(59 130 246)"
              strokeWidth="2"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            />
            
            {data.map((point, index) => {
              const x = padding + (index * (chartWidth - padding * 2)) / (data.length - 1);
              const y = chartHeight - padding - ((point.prsMerged / maxValue) * (chartHeight - padding * 2));
              
              return (
                <motion.circle
                  key={point.day}
                  cx={x}
                  cy={y}
                  r="4"
                  fill="rgb(59 130 246)"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 + 0.5, duration: 0.3 }}
                />
              );
            })}
          </svg>
          
          <div className="flex justify-between mt-2 px-3">
            {data.map((point) => (
              <div key={point.day} className="text-xs text-gray-400 font-medium">
                {point.day}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-700/30 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Users className="w-3 h-3" />
            <span>All Team Members</span>
          </div>
          
          <button className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
            View Details →
          </button>
        </div>
      </motion.div>
    </Card>
  );
};

export default ImpactChart;
