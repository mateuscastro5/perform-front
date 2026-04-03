import { X, TrendingUp, TrendingDown, GitPullRequest, MessageSquare, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/components/ui/avatar";
import { Badge } from "@/ui/components/ui/badge";
import { Button } from "@/ui/components/ui/button";
import { motion } from "framer-motion";

interface DeveloperDetailsProps {
  developer: {
    id: number;
    name: string;
    avatar: string;
    role: string;
    activePRs: number;
    reviewsPending: number;
    commitsThisWeek: number;
    status: string;
    strengths: string[];
    weaknesses: string[];
    currentWork: string;
  };
  onClose: () => void;
}

const mockPRs = {
  open: [
    { id: 1, title: "Add user authentication flow", status: "open", reviews: 2, created: "2 dias atrás" },
    { id: 2, title: "Fix dashboard layout issues", status: "open", reviews: 0, created: "1 dia atrás" },
    { id: 3, title: "Update API endpoints", status: "open", reviews: 1, created: "3 horas atrás" },
  ],
  reviewing: [
    { id: 4, title: "Database optimization", status: "reviewing", reviews: 3, created: "1 dia atrás" },
    { id: 5, title: "Add tests for auth module", status: "reviewing", reviews: 2, created: "5 horas atrás" },
  ],
  completed: [
    { id: 6, title: "Implement dark mode", status: "completed", reviews: 5, created: "3 dias atrás", merged: "1 dia atrás" },
    { id: 7, title: "Refactor user service", status: "completed", reviews: 3, created: "5 dias atrás", merged: "2 dias atrás" },
    { id: 8, title: "Add loading states", status: "completed", reviews: 2, created: "1 semana atrás", merged: "4 dias atrás" },
  ],
};

const recentActivity = [
  { id: 1, type: "commit", message: "Fix: resolve merge conflicts", time: "30 min atrás" },
  { id: 2, type: "review", message: "Reviewed PR #234 - Database optimization", time: "2 horas atrás" },
  { id: 3, type: "pr", message: "Opened PR #256 - Update API endpoints", time: "3 horas atrás" },
  { id: 4, type: "commit", message: "Feat: add error handling", time: "5 horas atrás" },
  { id: 5, type: "comment", message: "Commented on issue #189", time: "6 horas atrás" },
];

export const DeveloperDetails = ({ developer, onClose }: DeveloperDetailsProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 overflow-y-auto"
    >
      <div className="min-h-screen p-4 md:p-6 flex items-center justify-center">
        <motion.div 
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="w-full max-w-6xl bg-card/50 border border-border/40 rounded-2xl shadow-2xl backdrop-blur-md overflow-hidden"
        >
          {/* Header */}
          <div className="p-8 border-b border-border/40 flex items-start justify-between bg-muted/10">
            <div className="flex items-center gap-6">
              <Avatar className="h-20 w-20 ring-2 ring-primary/20">
                <AvatarImage src={developer.avatar} alt={developer.name} />
                <AvatarFallback>{developer.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-3xl font-light text-foreground tracking-tight mb-1">{developer.name}</h2>
                <p className="text-sm text-muted-foreground">{developer.role}</p>
                {developer.currentWork && (
                  <p className="text-xs text-accent mt-2 font-medium">Working on: {developer.currentWork}</p>
                )}
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-muted/50 rounded-full">
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Strengths & Weaknesses */}
            <div className="space-y-6">
              <div className="rounded-xl bg-transparent border border-border/40 p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-success/10">
                    <TrendingUp className="h-4 w-4 text-success" />
                  </div>
                  <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Strengths</h3>
                </div>
                <div className="space-y-3">
                  {developer.strengths.length > 0 ? developer.strengths.map((strength, idx) => (
                    <div key={idx} className="flex items-start gap-2.5">
                      <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground">{strength}</span>
                    </div>
                  )) : (
                    <p className="text-sm text-muted-foreground italic">No data available</p>
                  )}
                </div>
              </div>

              <div className="rounded-xl bg-transparent border border-border/40 p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-destructive/10">
                    <TrendingDown className="h-4 w-4 text-destructive" />
                  </div>
                  <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Areas for Growth</h3>
                </div>
                <div className="space-y-3">
                  {developer.weaknesses.length > 0 ? developer.weaknesses.map((weakness, idx) => (
                    <div key={idx} className="flex items-start gap-2.5">
                      <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground">{weakness}</span>
                    </div>
                  )) : (
                    <p className="text-sm text-muted-foreground italic">No data available</p>
                  )}
                </div>
              </div>

              <div className="rounded-xl bg-transparent border border-border/40 p-5">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">Recent Activity</h3>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="text-sm border-l-2 border-border/50 pl-3 py-0.5">
                      <p className="text-foreground mb-1">{activity.message}</p>
                      <p className="text-muted-foreground text-xs">{activity.time}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Middle Column - PRs Open & Reviewing */}
            <div className="space-y-6">
              <div className="rounded-xl bg-transparent border border-border/40 p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <GitPullRequest className="h-4 w-4 text-primary" />
                  </div>
                  <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Open PRs</h3>
                  <Badge variant="default" className="text-xs h-6 px-2 ml-auto bg-primary/20 text-primary hover:bg-primary/30 border-none">
                    {mockPRs.open.length}
                  </Badge>
                </div>
                <div className="space-y-3">
                  {mockPRs.open.map((pr) => (
                    <div key={pr.id} className="rounded-lg bg-muted/20 p-3 border border-transparent hover:border-border/30 transition-colors">
                      <h4 className="text-sm font-medium text-foreground mb-2">{pr.title}</h4>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">{pr.created}</span>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <MessageSquare className="h-3.5 w-3.5" />
                          <span>{pr.reviews}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl bg-transparent border border-border/40 p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-accent/10">
                    <Clock className="h-4 w-4 text-accent" />
                  </div>
                  <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">In Review</h3>
                  <Badge variant="secondary" className="text-xs h-6 px-2 ml-auto bg-accent/20 text-accent hover:bg-accent/30 border-none">
                    {mockPRs.reviewing.length}
                  </Badge>
                </div>
                <div className="space-y-3">
                  {mockPRs.reviewing.map((pr) => (
                    <div key={pr.id} className="rounded-lg bg-muted/20 p-3 border border-transparent hover:border-border/30 transition-colors">
                      <h4 className="text-sm font-medium text-foreground mb-2">{pr.title}</h4>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">{pr.created}</span>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <MessageSquare className="h-3.5 w-3.5" />
                          <span>{pr.reviews}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Completed PRs */}
            <div>
              <div className="rounded-xl bg-transparent border border-border/40 p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-success/10">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                  </div>
                  <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Completed PRs</h3>
                  <Badge variant="success" className="text-xs h-6 px-2 ml-auto bg-success/20 text-success hover:bg-success/30 border-none">
                    {mockPRs.completed.length}
                  </Badge>
                </div>
                <div className="space-y-3">
                  {mockPRs.completed.map((pr) => (
                    <div key={pr.id} className="rounded-lg bg-muted/20 p-3 border border-transparent hover:border-border/30 transition-colors">
                      <h4 className="text-sm font-medium text-foreground mb-2">{pr.title}</h4>
                      <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                        <span>Created: {pr.created}</span>
                        <span className="text-success font-medium">Merged: {pr.merged}</span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
                        <MessageSquare className="h-3.5 w-3.5" />
                        <span>{pr.reviews} reviews</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};
