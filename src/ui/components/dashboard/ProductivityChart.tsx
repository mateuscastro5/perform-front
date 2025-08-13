import { useState, useEffect } from 'react';

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
  teamMembers = [
    { id: 'all', name: 'All Team' },
    { id: 'alex', name: 'Alex Rivera' },
    { id: 'sarah', name: 'Sarah Chen' },
    { id: 'marcus', name: 'Marcus Johnson' },
    { id: 'emma', name: 'Emma Davis' }
  ],
  title = "Weekly Impact"
}: ImpactChartProps) => {
  
  const [selectedMember, setSelectedMember] = useState('all');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (isDropdownOpen) {
        setIsDropdownOpen(false);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isDropdownOpen]);
  
  // For now, showing PRs merged by default
  const selectedMetric = 'prsMerged';
  
  const currentMetric = {
    name: 'PRs Merged',
    color: 'rgb(34, 197, 94)',
    icon: '�'
  };

  const maxValue = Math.max(...data.map(d => d.prsMerged));
  const totalValue = data.reduce((sum, d) => sum + d.prsMerged, 0);
  
  const svgHeight = 120;
  const svgWidth = 280;
  const padding = 20;
  
  // Generate path for the line chart
  const generatePath = () => {
    const points = data.map((point, index) => {
      const x = padding + (index * (svgWidth - 2 * padding)) / (data.length - 1);
      const y = svgHeight - padding - ((point.prsMerged / Math.max(maxValue, 1)) * (svgHeight - 2 * padding));
      return `${x},${y}`;
    });
    return `M ${points.join(' L ')}`;
  };

  // Generate points for circles
  const generatePoints = () => {
    return data.map((point, index) => {
      const x = padding + (index * (svgWidth - 2 * padding)) / (data.length - 1);
      const y = svgHeight - padding - ((point.prsMerged / Math.max(maxValue, 1)) * (svgHeight - 2 * padding));
      return { x, y, value: point.prsMerged, day: point.day };
    });
  };

  const points = generatePoints();

  return (
    <div className="card hover:shadow-2xl transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
            <span className="text-green-400 text-sm">�</span>
          </div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
        </div>
        
        {/* Team member dropdown */}
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 bg-slate-800/50 hover:bg-slate-700/50 px-3 py-2 rounded-lg border border-slate-600/30 transition-colors"
          >
            <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-xs font-semibold text-white">
              {teamMembers.find(m => m.id === selectedMember)?.name.charAt(0) || 'A'}
            </div>
            <span className="text-sm text-gray-300">
              {teamMembers.find(m => m.id === selectedMember)?.name || 'All Team'}
            </span>
            <svg 
              className={`w-4 h-4 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {isDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-slate-800 border border-slate-600/30 rounded-lg shadow-xl z-10 overflow-hidden">
              {teamMembers.map((member) => (
                <button
                  key={member.id}
                  onClick={() => {
                    setSelectedMember(member.id);
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-700/50 transition-colors ${
                    selectedMember === member.id ? 'bg-slate-700/30 text-blue-400' : 'text-gray-300'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold text-white ${
                    member.id === 'all' 
                      ? 'bg-gradient-to-br from-green-500 to-blue-600' 
                      : 'bg-gradient-to-br from-blue-500 to-purple-600'
                  }`}>
                    {member.name.charAt(0)}
                  </div>
                  <span className="font-medium">{member.name}</span>
                  {selectedMember === member.id && (
                    <svg className="w-4 h-4 ml-auto text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main metric display */}
      <div className="flex items-center gap-2 mb-6">
        <span className="text-2xl font-bold text-green-400">
          {totalValue}
        </span>
        <span className="text-sm text-gray-400">
          PRs merged this week
          {selectedMember !== 'all' && (
            <span className="text-blue-400 ml-1">
              • {teamMembers.find(m => m.id === selectedMember)?.name}
            </span>
          )}
        </span>
        <span className="text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded-full ml-auto">
          +18% vs last week
        </span>
      </div>

      <div className="relative">
        <svg 
          width={svgWidth} 
          height={svgHeight} 
          className="overflow-visible"
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        >
          {/* Gradient definition */}
          <defs>
            <linearGradient id={`chartGradient-${selectedMetric}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={currentMetric.color} stopOpacity="0.3" />
              <stop offset="100%" stopColor={currentMetric.color} stopOpacity="0" />
            </linearGradient>
          </defs>
          
          {/* Area under the curve */}
          <path
            d={`${generatePath()} L ${svgWidth - padding},${svgHeight - padding} L ${padding},${svgHeight - padding} Z`}
            fill={`url(#chartGradient-${selectedMetric})`}
            className="transition-all duration-500"
          />
          
          {/* Main line */}
          <path
            d={generatePath()}
            stroke={currentMetric.color}
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="drop-shadow-lg transition-all duration-500"
          />
          
          {/* Data points */}
          {points.map((point, index) => (
            <g key={index}>
              <circle
                cx={point.x}
                cy={point.y}
                r="5"
                fill={currentMetric.color}
                stroke="rgb(30, 58, 138)"
                strokeWidth="2"
                className="hover:r-7 transition-all duration-200 cursor-pointer drop-shadow-lg"
              />
              <circle
                cx={point.x}
                cy={point.y}
                r="3"
                fill="white"
                className="pointer-events-none"
              />
            </g>
          ))}
        </svg>
        
        {/* X-axis labels */}
        <div className="flex justify-between mt-4 px-5">
          {data.map((point, index) => (
            <div key={index} className="text-center">
              <span className="text-xs text-gray-400 font-medium">
                {point.day}
              </span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-slate-700/30">
        <div className="text-center">
          <p className="text-xs text-gray-400">Best Day</p>
          <p className="text-sm font-semibold text-white">
            {data.find(d => d.prsMerged === maxValue)?.day || 'N/A'}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-400">Average</p>
          <p className="text-sm font-semibold text-white">
            {(totalValue / data.length).toFixed(1)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-400">This Week</p>
          <p className="text-sm font-semibold" style={{ color: currentMetric.color }}>
            {totalValue} total
          </p>
        </div>
      </div>
    </div>
  );
};

export default ImpactChart;
