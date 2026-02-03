import { GitCommit, GitPullRequest, MessageSquare, GitMerge } from "lucide-react";
import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "../contexts/AuthContext";
import { apiService } from "../services/api.service";
import { useDashboard } from "../contexts/DashboardContext";

type Activity = {
  id: string;
  type: 'commit' | 'pull_request' | 'review';
  developer: {
    id: string | null;
    name: string;
    githubUsername: string | null;
    avatarUrl: string | null;
  };
  message: string;
  state?: string;
  reviewState?: string;
  timestamp: string;
  url: string;
};

export const ActivityTimeline = () => {
  const { token } = useAuth();
  const { selectedRepository } = useDashboard();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      if (!token) return;
      
      try {
        setIsLoading(true);
        const data = await apiService.getGithubRecentActivity(
          token,
          selectedRepository ?? undefined,
          20
        );
        setActivities(data);
      } catch (error) {
        console.error('Failed to fetch recent activity:', error);
        setActivities([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivities();
  }, [token, selectedRepository]);

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

  const getActivityIcon = (activity: Activity) => {
    switch (activity.type) {
      case 'commit':
        return GitCommit;
      case 'pull_request':
        return activity.state === 'closed' ? GitMerge : GitPullRequest;
      case 'review':
        return MessageSquare;
      default:
        return GitCommit;
    }
  };

  const getActivityColor = (activity: Activity) => {
    switch (activity.type) {
      case 'commit':
        return "text-primary";
      case 'pull_request':
        return activity.state === 'closed' ? "text-success" : "text-accent";
      case 'review':
        if (activity.reviewState === 'APPROVED') return "text-success";
        if (activity.reviewState === 'CHANGES_REQUESTED') return "text-destructive";
        return "text-muted-foreground";
      default:
        return "text-muted-foreground";
    }
  };

  const getActivityAction = (activity: Activity) => {
    switch (activity.type) {
      case 'commit':
        return "committed";
      case 'pull_request':
        return activity.state === 'closed' ? "merged PR" : "opened PR";
      case 'review':
        if (activity.reviewState === 'APPROVED') return "approved";
        if (activity.reviewState === 'CHANGES_REQUESTED') return "requested changes";
        return "reviewed";
      default:
        return "updated";
    }
  };
  
  return (
    <div className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-4 shadow-card flex flex-col h-[500px]">
      <h2 className="text-lg font-bold text-foreground mb-4">Live Activity</h2>
      
      <div className="relative flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent hover:scrollbar-thumb-primary/40">
        {/* Timeline Line */}
        <div className="absolute left-3 top-0 bottom-0 w-px bg-border" />
        
        <div className="space-y-3 pb-2">
          {activities.map((activity, index) => {
            const Icon = getActivityIcon(activity);
            const color = getActivityColor(activity);
            const action = getActivityAction(activity);
            const timeAgo = formatDistanceToNow(new Date(activity.timestamp), {
              addSuffix: true,
            });

            return (
              <div
                key={activity.id}
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
                      <p className="text-xs font-medium text-foreground">
                        <span className="font-semibold">{activity.developer.name}</span>{" "}
                        <span className="text-muted-foreground">{action}</span>
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                        {activity.message}
                      </p>
                    </div>
                    <span className="text-[9px] text-muted-foreground whitespace-nowrap">
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
