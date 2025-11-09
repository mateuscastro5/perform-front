import { GitCommit, GitPullRequest, MessageSquare } from "lucide-react";
import { useDashboard } from "../contexts/DashboardContext";
import { formatDistanceToNow } from "date-fns";
import type { TeamMember } from "../types/dashboard.types";

export const ActivityTimeline = () => {
  const { teamActivity, isLoading } = useDashboard();

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-4 shadow-card h-full">
        <h2 className="text-lg font-bold text-foreground mb-4">Live Activity</h2>
        <div className="h-32 flex items-center justify-center text-muted-foreground text-sm">
          <div className="animate-pulse">Loading activity...</div>
        </div>
      </div>
    );
  }

  const activities = teamActivity?.members || [];

  if (activities.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-4 shadow-card h-full">
        <h2 className="text-lg font-bold text-foreground mb-4">Live Activity</h2>
        <div className="h-32 flex items-center justify-center text-muted-foreground text-sm">
          No recent activity
        </div>
      </div>
    );
  }

  const getActivityIcon = (status: string) => {
    switch (status) {
      case 'coding':
        return GitCommit;
      case 'active':
        return GitPullRequest;
      default:
        return MessageSquare;
    }
  };

  const getActivityColor = (status: string) => {
    switch (status) {
      case 'coding':
        return "text-primary";
      case 'active':
        return "text-accent";
      default:
        return "text-muted-foreground";
    }
  };

  const getActivityAction = (member: typeof activities[0]) => {
    if (member.currentTask) {
      return member.currentTask;
    }
    switch (member.status) {
      case 'coding':
        return "is coding";
      case 'active':
        return "is active";
      default:
        return "is away";
    }
  };
  
  return (
    <div className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-4 shadow-card h-full">
      <h2 className="text-lg font-bold text-foreground mb-4">Live Activity</h2>
      
      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-3 top-0 bottom-0 w-px bg-border" />
        
        <div className="space-y-3">
          {activities.slice(0, 4).map((member: TeamMember, index: number) => {
            const Icon = getActivityIcon(member.status);
            const color = getActivityColor(member.status);
            const action = getActivityAction(member);
            const timeAgo = formatDistanceToNow(new Date(member.lastActivity), {
              addSuffix: true,
            });

            return (
              <div
                key={member.id}
                className="relative pl-8 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Timeline Dot */}
                <div className={`absolute left-0 mt-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-background bg-card ${color}`}>
                  <Icon className="h-3 w-3" />
                </div>

                {/* Activity Content */}
                <div className="rounded-lg bg-muted/30 p-2.5 transition-all duration-200 hover:bg-muted/50">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-foreground">
                        <span className="font-semibold">{member.name}</span>{" "}
                        <span className="text-muted-foreground">{action}</span>
                      </p>
                      {member.role && (
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {member.role}
                        </p>
                      )}
                    </div>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                      {timeAgo}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
