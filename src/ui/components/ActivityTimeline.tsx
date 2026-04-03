import { GitCommit, GitPullRequest, MessageSquare, GitMerge } from "lucide-react";
import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
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
    <div className="rounded-xl border border-border/40 bg-transparent p-6 flex flex-col h-[500px]">
      <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-6">Live Activity</h2>
      
      <div className="relative flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent hover:scrollbar-thumb-primary/40">
        {/* Timeline Line */}
        <div className="absolute left-3 top-0 bottom-0 w-px bg-border/50" />
        
        <div className="space-y-4 pb-2">
          {activities.map((activity, index) => {
            const Icon = getActivityIcon(activity);
            const color = getActivityColor(activity);
            const action = getActivityAction(activity);
            const timeAgo = formatDistanceToNow(new Date(activity.timestamp), {
              addSuffix: true,
            });

            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05, ease: "easeOut" }}
                className="relative pl-10"
              >
                {/* Timeline Dot */}
                <div className={`absolute left-0 mt-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-background bg-card ${color} shadow-sm`}>
                  <Icon className="h-3.5 w-3.5" />
                </div>

                {/* Activity Content */}
                <motion.div 
                  whileHover={{ scale: 1.01, x: 4 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className="rounded-lg bg-muted/20 p-3 transition-colors duration-200 hover:bg-muted/40 border border-transparent hover:border-border/30"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        <span className="font-semibold">{activity.developer.name}</span>{" "}
                        <span className="text-muted-foreground font-normal">{action}</span>
                      </p>
                      <p className="text-xs text-muted-foreground truncate mt-1">
                        {activity.message}
                      </p>
                    </div>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap font-medium bg-muted/30 px-2 py-0.5 rounded-full">
                      {timeAgo}
                    </span>
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
