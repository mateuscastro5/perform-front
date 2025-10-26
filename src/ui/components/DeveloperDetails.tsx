import { X, TrendingUp, TrendingDown, GitPullRequest, MessageSquare, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/components/ui/avatar";
import { Badge } from "@/ui/components/ui/badge";
import { Button } from "@/ui/components/ui/button";

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
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 overflow-y-auto">
      <div className="min-h-screen p-4 md:p-6">
        <div className="max-w-6xl mx-auto bg-card/50 border border-border rounded-2xl shadow-2xl backdrop-blur-sm">
          {/* Header */}
          <div className="p-6 border-b border-border/50 flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 ring-2 ring-primary/20">
                <AvatarImage src={developer.avatar} alt={developer.name} />
                <AvatarFallback>{developer.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-bold text-foreground">{developer.name}</h2>
                <p className="text-sm text-muted-foreground">{developer.role}</p>
                <p className="text-xs text-accent mt-1">Trabalhando em: {developer.currentWork}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Strengths & Weaknesses */}
            <div className="space-y-6">
              <div className="rounded-xl bg-muted/30 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="h-4 w-4 text-success" />
                  <h3 className="text-sm font-semibold text-foreground">Pontos Fortes</h3>
                </div>
                <div className="space-y-2">
                  {developer.strengths.map((strength, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <CheckCircle2 className="h-3 w-3 text-success flex-shrink-0" />
                      <span className="text-xs text-foreground">{strength}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl bg-muted/30 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingDown className="h-4 w-4 text-destructive" />
                  <h3 className="text-sm font-semibold text-foreground">Pontos de Atenção</h3>
                </div>
                <div className="space-y-2">
                  {developer.weaknesses.map((weakness, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <AlertTriangle className="h-3 w-3 text-destructive flex-shrink-0" />
                      <span className="text-xs text-foreground">{weakness}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl bg-muted/30 p-4">
                <h3 className="text-sm font-semibold text-foreground mb-3">Atividade Recente</h3>
                <div className="space-y-2">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="text-xs">
                      <p className="text-foreground">{activity.message}</p>
                      <p className="text-muted-foreground text-[10px]">{activity.time}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Middle Column - PRs Open & Reviewing */}
            <div className="space-y-6">
              <div className="rounded-xl bg-card/50 border border-border p-4">
                <div className="flex items-center gap-2 mb-3">
                  <GitPullRequest className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-semibold text-foreground">PRs Abertas</h3>
                  <Badge variant="default" className="text-[10px] h-5 ml-auto">
                    {mockPRs.open.length}
                  </Badge>
                </div>
                <div className="space-y-2">
                  {mockPRs.open.map((pr) => (
                    <div key={pr.id} className="rounded-lg bg-muted/30 p-2.5">
                      <h4 className="text-xs font-semibold text-foreground mb-1">{pr.title}</h4>
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-muted-foreground">{pr.created}</span>
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-2.5 w-2.5" />
                          <span>{pr.reviews}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl bg-card/50 border border-border p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="h-4 w-4 text-accent" />
                  <h3 className="text-sm font-semibold text-foreground">Em Revisão</h3>
                  <Badge variant="secondary" className="text-[10px] h-5 ml-auto">
                    {mockPRs.reviewing.length}
                  </Badge>
                </div>
                <div className="space-y-2">
                  {mockPRs.reviewing.map((pr) => (
                    <div key={pr.id} className="rounded-lg bg-muted/30 p-2.5">
                      <h4 className="text-xs font-semibold text-foreground mb-1">{pr.title}</h4>
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-muted-foreground">{pr.created}</span>
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-2.5 w-2.5" />
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
              <div className="rounded-xl bg-card/50 border border-border p-4">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  <h3 className="text-sm font-semibold text-foreground">PRs Concluídas</h3>
                  <Badge variant="success" className="text-[10px] h-5 ml-auto">
                    {mockPRs.completed.length}
                  </Badge>
                </div>
                <div className="space-y-2">
                  {mockPRs.completed.map((pr) => (
                    <div key={pr.id} className="rounded-lg bg-muted/30 p-2.5">
                      <h4 className="text-xs font-semibold text-foreground mb-1">{pr.title}</h4>
                      <div className="flex flex-col gap-0.5 text-[10px] text-muted-foreground">
                        <span>Criado: {pr.created}</span>
                        <span className="text-success">Merged: {pr.merged}</span>
                      </div>
                      <div className="flex items-center gap-1 mt-1 text-[10px]">
                        <MessageSquare className="h-2.5 w-2.5" />
                        <span>{pr.reviews} reviews</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
