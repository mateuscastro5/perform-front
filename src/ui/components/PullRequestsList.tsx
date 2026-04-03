import { Avatar, AvatarFallback, AvatarImage } from "@/ui/components/ui/avatar";
import { Badge } from "@/ui/components/ui/badge";
import { GitPullRequest, GitMerge, Clock, XCircle } from "lucide-react";
import { useDashboard } from "../contexts/DashboardContext";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import type { PullRequest } from "../types/dashboard.types";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/ui/components/ui/tooltip";

export const PullRequestsList = () => {
  const { pullRequests, isLoading } = useDashboard();

  if (isLoading) {
    return (
      <div className="rounded-xl bg-transparent border border-border/40 p-6 h-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Recent Pull Requests</h2>
          <GitPullRequest className="h-4 w-4 text-muted-foreground/50" />
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
      <div className="rounded-xl bg-transparent border border-border/40 p-6 h-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Recent Pull Requests</h2>
          <GitPullRequest className="h-4 w-4 text-muted-foreground/50" />
        </div>
        <div className="h-32 flex items-center justify-center text-muted-foreground text-sm">
          No pull requests found
        </div>
      </div>
    );
  }

  const getStatusBadge = (pr: PullRequest) => {
    if (pr.mergedAt) {
      return (
        <Badge className="bg-success/20 text-success border-success/30 text-[9px] px-1.5 py-0 flex items-center gap-1">
          <GitMerge className="h-2.5 w-2.5" />
          merged
        </Badge>
      );
    }
    if (pr.closedAt) {
      return (
        <Badge variant="outline" className="border-destructive/30 text-destructive text-[9px] px-1.5 py-0 flex items-center gap-1">
          <XCircle className="h-2.5 w-2.5" />
          closed
        </Badge>
      );
    }
    return (
      <Badge className="bg-warning/20 text-warning border-warning/30 text-[9px] px-1.5 py-0 flex items-center gap-1">
        <Clock className="h-2.5 w-2.5" />
        open
      </Badge>
    );
  };
  
  return (
    <TooltipProvider>
      <div className="rounded-xl bg-transparent border border-border/40 p-6 flex flex-col h-[500px]">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Recent Pull Requests</h2>
          <GitPullRequest className="h-5 w-5 text-muted-foreground/50" />
        </div>

        <div className="space-y-3 flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-accent/20 scrollbar-track-transparent hover:scrollbar-thumb-accent/40">
          {prs.map((pr: PullRequest, index: number) => {
            const updatedAgo = formatDistanceToNow(new Date(pr.updatedAt), {
              addSuffix: true,
            });
            const createdAgo = formatDistanceToNow(new Date(pr.createdAt), {
              addSuffix: true,
            });

            return (
              <motion.div
                key={pr.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{ scale: 1.01, x: 4 }}
                className="flex items-center gap-3 rounded-lg bg-muted/20 p-3 transition-colors duration-200 hover:bg-muted/40 cursor-pointer border border-transparent hover:border-border/30"
                onClick={() => pr.url && window.open(pr.url, '_blank')}
              >
                <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                  <AvatarImage src={pr.author.avatar} alt={pr.author.name} />
                  <AvatarFallback>{pr.author.name.split(" ").map((n: string) => n[0]).join("")}</AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-foreground mb-1 truncate">
                    {pr.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1.5">
                    <span className="font-medium">{pr.author.name}</span>
                    <span>•</span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="hover:text-foreground transition-colors">
                          created {createdAgo}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">Updated {updatedAgo}</p>
                        {pr.closedAt && (
                          <p className="text-xs">
                            Closed {formatDistanceToNow(new Date(pr.closedAt), { addSuffix: true })}
                          </p>
                        )}
                        {pr.mergedAt && (
                          <p className="text-xs">
                            Merged {formatDistanceToNow(new Date(pr.mergedAt), { addSuffix: true })}
                          </p>
                        )}
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  {pr.reviewers && pr.reviewers.length > 0 && (
                    <div className="flex items-center gap-1.5 mt-2">
                      <div className="flex -space-x-2">
                        {pr.reviewers.slice(0, 3).map((reviewer, idx) => (
                          <Tooltip key={idx}>
                            <TooltipTrigger asChild>
                              <Avatar className="h-5 w-5 ring-2 ring-background">
                                <AvatarImage src={reviewer.avatar} alt={reviewer.name} />
                                <AvatarFallback className="text-[8px]">
                                  {reviewer.name.split(" ").map((n: string) => n[0]).join("")}
                                </AvatarFallback>
                              </Avatar>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs font-medium">{reviewer.name}</p>
                              <p className="text-[10px] text-muted-foreground capitalize">
                                {(reviewer.state ?? reviewer.status).replace('_', ' ').toLowerCase()}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        ))}
                      </div>
                      {pr.reviewers.length > 3 && (
                        <span className="text-[10px] text-muted-foreground font-medium bg-muted/50 px-1.5 rounded-full">
                          +{pr.reviewers.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  {getStatusBadge(pr)}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </TooltipProvider>
  );
};
