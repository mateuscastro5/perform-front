interface PerformanceMetric {
  label: string;
  value: number;
  color: 'blue' | 'green' | 'purple';
}

interface PerformancePanelProps {
  metrics?: PerformanceMetric[];
}

const PerformancePanel = ({
  metrics = [
    { label: "Productivity", value: 87, color: "blue" },
    { label: "Code Quality", value: 94, color: "green" },
    { label: "Collaboration", value: 76, color: "purple" },
  ]
}: PerformancePanelProps) => {
  const colorClasses = {
    blue: {
      text: 'text-blue-400',
      gradient: 'from-blue-600 to-blue-400',
      shadow: 'shadow-blue-500/30'
    },
    green: {
      text: 'text-green-400',
      gradient: 'from-green-600 to-green-400',
      shadow: 'shadow-green-500/30'
    },
    purple: {
      text: 'text-purple-400',
      gradient: 'from-purple-600 to-purple-400',
      shadow: 'shadow-purple-500/30'
    }
  };

  return (
    <div className="card hover:shadow-2xl transition-all duration-300">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
          <span className="text-blue-400 text-sm">📊</span>
        </div>
        <h2 className="text-xl font-semibold text-white">Weekly Performance</h2>
      </div>
      <div className="space-y-6">
        {metrics.map((metric, i) => (
          <div key={i}>
            <div className="flex justify-between text-sm mb-3">
              <span className="text-gray-300 font-medium">{metric.label}</span>
              <span className={`font-bold ${colorClasses[metric.color].text}`}>
                {metric.value}%
              </span>
            </div>
            <div className="w-full bg-slate-700/50 rounded-full h-3 overflow-hidden">
              <div 
                className={`bg-gradient-to-r ${colorClasses[metric.color].gradient} h-3 rounded-full shadow-lg ${colorClasses[metric.color].shadow} transition-all duration-1000`}
                style={{ width: `${metric.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PerformancePanel;
