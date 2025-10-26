import { Avatar, AvatarFallback, AvatarImage } from "@/ui/components/ui/avatar";
import { Badge } from "@/ui/components/ui/badge";
import { GitPullRequest, MessageSquare, GitCommit, TrendingUp } from "lucide-react";

interface DeveloperCardProps {
  developer: {
    id: number;
    name: string;
    avatar: string;
    role: string;
    activePRs: number;
    reviewsPending: number;
    commitsThisWeek: number;
    status: string;
  };
  onClick: () => void;
}

export const DeveloperCard = ({ developer, onClick }: DeveloperCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "success";
      case "reviewing":
        return "default";
      case "idle":
        return "secondary";
      default:
        return "secondary";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "Ativo";
      case "reviewing":
        return "Revisando";
      case "idle":
        return "Ocioso";
      default:
        return status;
    }
  };

  return (
    <div
      onClick={onClick}
      className="rounded-xl bg-card/50 border border-border p-4 shadow-card backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-glow-green cursor-pointer group"
    >
      <div className="flex items-start gap-3 mb-4">
        <Avatar className="h-12 w-12 ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all">
          <AvatarImage src={developer.avatar} alt={developer.name} />
          <AvatarFallback>{developer.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-foreground truncate">
            {developer.name}
          </h3>
          <p className="text-xs text-muted-foreground truncate">
            {developer.role}
          </p>
        </div>

        <Badge variant={getStatusColor(developer.status)} className="text-[10px] h-5 px-2">
          {getStatusLabel(developer.status)}
        </Badge>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="flex flex-col items-center p-2 rounded-lg bg-muted/30">
          <GitPullRequest className="h-3.5 w-3.5 text-primary mb-1" />
          <span className="text-xs font-bold text-foreground">{developer.activePRs}</span>
          <span className="text-[10px] text-muted-foreground">PRs</span>
        </div>
        
        <div className="flex flex-col items-center p-2 rounded-lg bg-muted/30">
          <MessageSquare className="h-3.5 w-3.5 text-accent mb-1" />
          <span className="text-xs font-bold text-foreground">{developer.reviewsPending}</span>
          <span className="text-[10px] text-muted-foreground">Reviews</span>
        </div>
        
        <div className="flex flex-col items-center p-2 rounded-lg bg-muted/30">
          <GitCommit className="h-3.5 w-3.5 text-success mb-1" />
          <span className="text-xs font-bold text-foreground">{developer.commitsThisWeek}</span>
          <span className="text-[10px] text-muted-foreground">Commits</span>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Ver detalhes</span>
        <TrendingUp className="h-3 w-3 text-primary group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  );
};
