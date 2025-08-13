import { motion } from "motion/react";
import { Users, Zap } from "lucide-react";
import { Card } from "../ui/base-components";
import { Avatar } from "../ui/base-components";
import { Badge } from "../ui/base-components";
import { animations } from "../../lib/design-system";

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

  const codingMembers = members.filter(m => m.status === 'coding').length;

  return (
    <Card className="flex-1" animated={false}>
      <motion.div {...animations.slideUp} className="flex flex-col h-full">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Users className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <h2 className="text-base font-semibold leading-tight">Team Activity</h2>
          </div>
          
          <Badge variant="green" className="gap-1">
            <Zap className="w-3 h-3" />
            {codingMembers} coding
          </Badge>
        </div>
        
        <div className="flex-1 space-y-2">
          {members.map((member, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-lg border border-slate-700/30"
            >
              <div className="relative">
                <Avatar
                  name={member.name.split(' ').map(n => n[0]).join('')}
                  size="sm"
                />
                <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-800 ${getStatusColor(member.status)} animate-pulse`} />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium truncate">{member.name}</p>
                  <span className="text-xs">{getStatusIcon(member.status)}</span>
                </div>
                {member.currentTask && (
                  <p className="text-xs text-gray-300 truncate mt-0.5">{member.currentTask}</p>
                )}
                <p className="text-xs text-gray-500 mt-0.5">{member.lastActivity}</p>
              </div>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-4 pt-3 border-t border-slate-700/30">
          <button className="w-full text-center text-xs text-blue-400 hover:text-blue-300 transition-colors">
            View all team members →
          </button>
        </div>
      </motion.div>
    </Card>
  );
};

export default TeamActivityPanel;
