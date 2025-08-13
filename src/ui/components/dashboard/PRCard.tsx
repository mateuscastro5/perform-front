import React from 'react';

export type PRStatus = 'merged' | 'approved' | 'review_requested' | 'changes_requested' | 'draft' | 'closed';

interface PRCardProps {
  id: number;
  title: string;
  author: {
    name: string;
    avatar?: string;
  };
  status: PRStatus;
  createdAt: string;
  branch: string;
  additions: number;
  deletions: number;
  reviewers: Array<{
    name: string;
    avatar?: string;
    status: 'approved' | 'pending' | 'changes_requested';
  }>;
  onClick?: () => void;
}

const PRCard = ({
  id,
  title,
  author,
  status,
  createdAt,
  branch,
  additions,
  deletions,
  reviewers,
  onClick
}: PRCardProps) => {
  const getStatusColors = (status: PRStatus) => {
    switch (status) {
      case 'merged':
        return {
          bg: 'bg-gradient-to-r from-purple-500/5 via-purple-600/8 to-purple-500/5',
          hover: 'hover:bg-gradient-to-br hover:from-purple-500/20 hover:via-purple-600/30 hover:to-purple-400/20',
          indicator: 'bg-gradient-to-r from-purple-400 to-purple-500',
          text: 'text-purple-300',
          glow: 'hover:shadow-2xl hover:shadow-purple-500/30',
          spotlight: 'purple'
        };
      case 'approved':
        return {
          bg: 'bg-gradient-to-r from-emerald-500/5 via-green-600/8 to-emerald-500/5',
          hover: 'hover:bg-gradient-to-br hover:from-emerald-500/20 hover:via-green-600/30 hover:to-emerald-400/20',
          indicator: 'bg-gradient-to-r from-emerald-400 to-green-500',
          text: 'text-emerald-300',
          glow: 'hover:shadow-2xl hover:shadow-emerald-500/30',
          spotlight: 'emerald'
        };
      case 'changes_requested':
        return {
          bg: 'bg-gradient-to-r from-red-500/5 via-rose-600/8 to-red-500/5',
          hover: 'hover:bg-gradient-to-br hover:from-red-500/20 hover:via-rose-600/30 hover:to-red-400/20',
          indicator: 'bg-gradient-to-r from-red-400 to-rose-500',
          text: 'text-red-300',
          glow: 'hover:shadow-2xl hover:shadow-red-500/30',
          spotlight: 'red'
        };
      case 'review_requested':
        return {
          bg: 'bg-gradient-to-r from-amber-500/5 via-yellow-600/8 to-orange-500/5',
          hover: 'hover:bg-gradient-to-br hover:from-amber-500/20 hover:via-yellow-600/30 hover:to-orange-400/20',
          indicator: 'bg-gradient-to-r from-amber-400 to-orange-500',
          text: 'text-amber-300',
          glow: 'hover:shadow-2xl hover:shadow-amber-500/30',
          spotlight: 'amber'
        };
      case 'draft':
        return {
          bg: 'bg-gradient-to-r from-slate-500/5 via-gray-600/8 to-slate-500/5',
          hover: 'hover:bg-gradient-to-br hover:from-slate-500/20 hover:via-gray-600/30 hover:to-slate-400/20',
          indicator: 'bg-gradient-to-r from-slate-400 to-gray-500',
          text: 'text-slate-300',
          glow: 'hover:shadow-2xl hover:shadow-slate-500/30',
          spotlight: 'slate'
        };
      default:
        return {
          bg: 'bg-gradient-to-r from-sky-500/5 via-blue-600/8 to-indigo-500/5',
          hover: 'hover:bg-gradient-to-br hover:from-sky-500/20 hover:via-blue-600/30 hover:to-indigo-400/20',
          indicator: 'bg-gradient-to-r from-sky-400 to-blue-500',
          text: 'text-sky-300',
          glow: 'hover:shadow-2xl hover:shadow-sky-500/30',
          spotlight: 'sky'
        };
    }
  };

  const statusColors = getStatusColors(status);

  const getStatusText = (status: PRStatus) => {
    switch (status) {
      case 'merged': return 'Merged';
      case 'approved': return 'Approved';
      case 'changes_requested': return 'Changes Requested';
      case 'review_requested': return 'Review Requested';
      case 'draft': return 'Draft';
      case 'closed': return 'Closed';
      default: return 'Open';
    }
  };

  return (
    <div 
      className={`
        relative overflow-hidden group
        ${statusColors.bg} ${statusColors.hover}
        rounded-xl p-4 cursor-pointer transition-all duration-700
        ${statusColors.glow} hover:scale-[1.02]
        before:absolute before:inset-0 before:bg-gradient-radial 
        before:from-current/10 before:via-transparent before:to-transparent
        before:opacity-0 before:transition-opacity before:duration-700
        hover:before:opacity-100
      `}
      onClick={onClick}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      
      <div className="relative z-10 flex items-center gap-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
            </svg>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-3 h-3 rounded-full ${statusColors.indicator} shadow-lg shadow-current/50 group-hover:animate-pulse`} />
            <span className={`text-xs font-medium ${statusColors.text} group-hover:text-opacity-90 transition-all duration-300`}>
              #{id} • {getStatusText(status)}
            </span>
            <span className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors duration-300">{createdAt}</span>
          </div>

          <h3 className="text-white font-medium text-sm mb-2 line-clamp-2 group-hover:text-gray-100 transition-colors duration-300">
            {title}
          </h3>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-300 group-hover:text-gray-200 transition-colors duration-300">{author.name}</span>
              <div className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
                {branch}
              </div>
              <div className="flex items-center gap-1 text-xs">
                <span className="text-green-400">+{additions}</span>
                <span className="text-red-400">-{deletions}</span>
              </div>
            </div>

            <div className="flex -space-x-2">
              {reviewers.slice(0, 3).map((reviewer, index) => (
                <div
                  key={index}
                  className={`w-6 h-6 rounded-full border-2 border-slate-700 flex items-center justify-center text-xs font-bold transition-all duration-300 group-hover:scale-110 ${
                    reviewer.status === 'approved' ? 'bg-green-600 text-white group-hover:bg-green-500' :
                    reviewer.status === 'changes_requested' ? 'bg-red-600 text-white group-hover:bg-red-500' :
                    'bg-gray-600 text-gray-300 group-hover:bg-gray-500'
                  }`}
                  title={`${reviewer.name} - ${reviewer.status}`}
                >
                  {reviewer.name.charAt(0).toUpperCase()}
                </div>
              ))}
              {reviewers.length > 3 && (
                <div className="w-6 h-6 bg-slate-600 rounded-full border-2 border-slate-700 flex items-center justify-center text-xs text-gray-300 group-hover:scale-110 group-hover:bg-slate-500 transition-all duration-300">
                  +{reviewers.length - 3}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PRCard;
