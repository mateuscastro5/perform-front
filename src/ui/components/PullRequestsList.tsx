import { Avatar, AvatarFallback, AvatarImage } from "@/ui/components/ui/avatar";
import { Badge } from "@/ui/components/ui/badge";
import { GitPullRequest, CheckCircle2, Clock } from "lucide-react";

const pullRequests = [
  {
    id: 1,
    title: "Add user authentication flow",
    author: "Sarah Chen",
    avatar: "https://i.pravatar.cc/150?img=1",
    status: "approved",
    comments: 5,
    time: "2 hours ago",
  },
  {
    id: 2,
    title: "Optimize database queries for dashboard",
    author: "Marcus Lee",
    avatar: "https://i.pravatar.cc/150?img=2",
    status: "pending",
    comments: 2,
    time: "5 hours ago",
  },
  {
    id: 3,
    title: "Update API documentation",
    author: "Ana Silva",
    avatar: "https://i.pravatar.cc/150?img=3",
    status: "approved",
    comments: 8,
    time: "1 day ago",
  },
];

export const PullRequestsList = () => {
  return (
    <div className="rounded-xl bg-card/50 border border-border p-4 shadow-card backdrop-blur-sm h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-foreground">Recent Pull Requests</h2>
        <GitPullRequest className="h-4 w-4 text-accent" />
      </div>

      <div className="space-y-2">
        {pullRequests.map((pr) => (
          <div
            key={pr.id}
            className="flex items-center gap-2 rounded-lg bg-muted/30 p-2.5 transition-all duration-200 hover:bg-muted/50"
          >
            <Avatar className="h-8 w-8 ring-2 ring-primary/20">
              <AvatarImage src={pr.avatar} alt={pr.author} />
              <AvatarFallback>{pr.author.split(" ").map(n => n[0]).join("")}</AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <h3 className="text-xs font-semibold text-foreground mb-0.5 truncate">
                {pr.title}
              </h3>
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <span>{pr.author}</span>
                <span>•</span>
                <span>{pr.time}</span>
              </div>
            </div>

            <Badge
              variant={pr.status === "approved" ? "default" : "secondary"}
              className="flex items-center gap-1 text-[10px] h-5 px-1.5"
            >
              {pr.status === "approved" ? (
                <CheckCircle2 className="h-2.5 w-2.5" />
              ) : (
                <Clock className="h-2.5 w-2.5" />
              )}
              {pr.status}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
};
