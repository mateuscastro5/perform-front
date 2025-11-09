import { Avatar, AvatarFallback, AvatarImage } from "@/ui/components/ui/avatar";
import { Badge } from "@/ui/components/ui/badge";
import { GitPullRequest } from "lucide-react";
import { useDashboard } from "../contexts/DashboardContext";
import { formatDistanceToNow } from "date-fns";
import type { PullRequest } from "../types/dashboard.types";

export const PullRequestsList = () => {
  const { pullRequests, isLoading } = useDashboard();

  if (isLoading) {
    return (
      <div className="rounded-xl bg-card/50 border border-border p-4 shadow-card backdrop-blur-sm h-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-foreground">Recent Pull Requests</h2>
          <GitPullRequest className="h-4 w-4 text-accent" />
        </div>
        <div className="h-32 flex items-center justify-center text-muted-foreground text-sm">
          <div className="animate-pulse">Loading pull requests...</div>
        </div>
      </div>
    );
  }

  const prs = pullRequests?.prs || [];

  if (prs.length === 0) {
    return (
      <div className="rounded-xl bg-card/50 border border-border p-4 shadow-card backdrop-blur-sm h-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-foreground">Recent Pull Requests</h2>
          <GitPullRequest className="h-4 w-4 text-accent" />
        </div>
        <div className="h-32 flex items-center justify-center text-muted-foreground text-sm">
          No pull requests found
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
      case 'merged':
        return <Badge className="bg-success/20 text-success border-success/30 text-[9px] px-1.5 py-0">approved</Badge>;
      case 'review_requested':
        return <Badge variant="outline" className="border-warning/30 text-warning text-[9px] px-1.5 py-0">pending</Badge>;
      case 'changes_requested':
        return <Badge variant="outline" className="border-destructive/30 text-destructive text-[9px] px-1.5 py-0">changes req</Badge>;
      default:
        return <Badge variant="outline" className="text-[9px] px-1.5 py-0">draft</Badge>;
    }
  };
  
  return (
    <div className="rounded-xl bg-card/50 border border-border p-4 shadow-card backdrop-blur-sm h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-foreground">Recent Pull Requests</h2>
        <GitPullRequest className="h-4 w-4 text-accent" />
      </div>

      <div className="space-y-2">
        {prs.slice(0, 3).map((pr: PullRequest) => {
          const timeAgo = formatDistanceToNow(new Date(pr.updatedAt), {
            addSuffix: true,
          });

          return (
            <div
              key={pr.id}
              className="flex items-center gap-2 rounded-lg bg-muted/30 p-2.5 transition-all duration-200 hover:bg-muted/50"
            >
              <Avatar className="h-8 w-8 ring-2 ring-primary/20">
                <AvatarImage src={pr.author.avatar} alt={pr.author.name} />
                <AvatarFallback>{pr.author.name.split(" ").map((n: string) => n[0]).join("")}</AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <h3 className="text-xs font-semibold text-foreground mb-0.5 truncate">
                  {pr.title}
                </h3>
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <span>{pr.author.name}</span>
                  <span>•</span>
                  <span>{timeAgo}</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {getStatusBadge(pr.status)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
