interface TeamMember {
  name: string;
  avatar?: string;
  status: 'active' | 'away' | 'coding';
  lastActivity: string;
  currentTask?: string;
}

interface TeamActivityPanelProps {
  members?: TeamMember[];
}

const TeamActivityPanel = ({ 
  members = [
    { 
      name: "Alex Rivera", 
      status: "coding", 
      lastActivity: "2m ago",
      currentTask: "Working on authentication"
    },
    { 
      name: "Sarah Chen", 
      status: "active", 
      lastActivity: "5m ago",
      currentTask: "Code review on PR #1847"
    },
    { 
      name: "Marcus Johnson", 
      status: "away", 
      lastActivity: "1h ago",
      currentTask: "Meeting with client"
    },
    { 
      name: "Emma Davis", 
      status: "coding", 
      lastActivity: "15m ago",
      currentTask: "Bug fixing dashboard"
    },
  ]
}: TeamActivityPanelProps) => {
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'coding': return 'bg-green-500 shadow-green-500/30';
      case 'active': return 'bg-blue-500 shadow-blue-500/30';
      case 'away': return 'bg-gray-500 shadow-gray-500/30';
      default: return 'bg-gray-500 shadow-gray-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'coding': return '⚡';
      case 'active': return '💬';
      case 'away': return '💤';
      default: return '👤';
    }
  };

  return (
    <div className="card hover:shadow-2xl transition-all duration-300">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
          <span className="text-blue-400 text-sm">�</span>
        </div>
        <h2 className="text-xl font-semibold text-white">Team Activity</h2>
        <div className="ml-auto">
          <span className="text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded-full">
            {members.filter(m => m.status === 'coding').length} coding
          </span>
        </div>
      </div>
      
      <div className="space-y-3">
        {members.map((member, i) => (
          <div key={i} className="flex items-center gap-3 p-4 bg-slate-800/30 hover:bg-slate-700/40 rounded-xl transition-all duration-200 border border-slate-700/30 group">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm group-hover:scale-110 transition-transform duration-200">
                {member.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-800 ${getStatusColor(member.status)} animate-pulse`} />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm text-white font-medium truncate">{member.name}</p>
                <span className="text-xs">{getStatusIcon(member.status)}</span>
              </div>
              {member.currentTask && (
                <p className="text-xs text-gray-300 truncate mt-1">{member.currentTask}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">{member.lastActivity}</p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t border-slate-700/30">
        <button className="w-full text-center text-sm text-blue-400 hover:text-blue-300 transition-colors duration-200">
          View all team members →
        </button>
      </div>
    </div>
  );
};

export default TeamActivityPanel;
