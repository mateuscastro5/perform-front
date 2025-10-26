import { GitCommit, GitPullRequest, MessageSquare, CheckCircle } from "lucide-react";

const activities = [
  {
    type: "commit",
    icon: GitCommit,
    user: "Sarah Chen",
    action: "pushed 5 commits",
    repo: "backend-api",
    time: "5 min ago",
    color: "text-primary",
  },
  {
    type: "pr",
    icon: GitPullRequest,
    user: "Marcus Lee",
    action: "opened PR #234",
    repo: "frontend-app",
    time: "12 min ago",
    color: "text-accent",
  },
  {
    type: "review",
    icon: MessageSquare,
    user: "Ana Silva",
    action: "reviewed PR #233",
    repo: "backend-api",
    time: "25 min ago",
    color: "text-warning",
  },
  {
    type: "merge",
    icon: CheckCircle,
    user: "David Kim",
    action: "merged PR #232",
    repo: "frontend-app",
    time: "1 hour ago",
    color: "text-success",
  },
];

export const ActivityTimeline = () => {
  return (
    <div className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-4 shadow-card h-full">
      <h2 className="text-lg font-bold text-foreground mb-4">Live Activity</h2>
      
      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-3 top-0 bottom-0 w-px bg-border" />
        
        <div className="space-y-3">
          {activities.map((activity, index) => {
            const Icon = activity.icon;
            return (
              <div
                key={index}
                className="relative pl-8 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Timeline Dot */}
                <div className={cn(
                  "absolute left-1.5 top-0.5 h-4 w-4 rounded-full border-2 border-background flex items-center justify-center",
                  activity.color
                )}>
                  <Icon className="h-2.5 w-2.5" />
                </div>
                
                <div className="rounded-lg bg-muted/30 p-2 hover:bg-muted/50 transition-all">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-foreground truncate">
                        <span className="font-semibold">{activity.user}</span>{" "}
                        <span className="text-muted-foreground">{activity.action}</span>
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {activity.repo}
                      </p>
                    </div>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                      {activity.time}
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

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}
