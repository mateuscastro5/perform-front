import { Card, CardContent, CardHeader, CardTitle } from '@/ui/components/ui/card';
import { Avatar, AvatarFallback } from '@/ui/components/ui/avatar';
import { Badge } from '@/ui/components/ui/badge';
import { Button } from '@/ui/components/ui/button';
import { Separator } from '@/ui/components/ui/separator';
import { Users, Zap, MessageSquare, Moon } from 'lucide-react';
import { cn } from '@/ui/lib/utils';

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

const TeamActivityPanel = ({ members = [] }: TeamActivityPanelProps) => {
  
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'coding': 
        return {
          color: 'bg-success shadow-glow-green',
          icon: <Zap className="w-3 h-3" />,
          variant: 'success' as const
        };
      case 'active': 
        return {
          color: 'bg-accent shadow-[0_0_20px_hsl(200_100%_64%_/_0.3)]',
          icon: <MessageSquare className="w-3 h-3" />,
          variant: 'default' as const
        };
      case 'away': 
        return {
          color: 'bg-muted',
          icon: <Moon className="w-3 h-3" />,
          variant: 'secondary' as const
        };
      default: 
        return {
          color: 'bg-muted',
          icon: <Users className="w-3 h-3" />,
          variant: 'secondary' as const
        };
    }
  };

  const codingCount = members.filter(m => m.status === 'coding').length;

  return (
    <Card className="backdrop-blur-sm bg-card/50 hover:shadow-glow-green transition-all duration-300">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <CardTitle>Team Activity</CardTitle>
          </div>
          {codingCount > 0 && (
            <Badge variant="success">
              {codingCount} coding
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {members.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No team activity data available</p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {members.map((member, i) => {
                const statusConfig = getStatusConfig(member.status);
                return (
                  <div 
                    key={i} 
                    className="flex items-center gap-3 p-4 bg-muted/20 hover:bg-muted/40 rounded-lg transition-all duration-200 border border-border/50 group"
                  >
                    <div className="relative">
                      <Avatar className="w-10 h-10 group-hover:scale-110 transition-transform duration-200">
                        <AvatarFallback className="bg-gradient-to-br from-primary via-primary/90 to-secondary text-primary-foreground font-bold text-sm">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className={cn(
                        "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-card flex items-center justify-center animate-pulse",
                        statusConfig.color
                      )}>
                        {statusConfig.icon}
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-foreground font-medium truncate">{member.name}</p>
                      </div>
                      {member.currentTask && (
                        <p className="text-xs text-muted-foreground truncate mt-1">{member.currentTask}</p>
                      )}
                      <p className="text-xs text-muted-foreground/70 mt-1">{member.lastActivity}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <Separator className="my-4" />
            
            <Button variant="ghost" className="w-full">
              View all team members →
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default TeamActivityPanel;

