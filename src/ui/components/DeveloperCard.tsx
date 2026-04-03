import { Avatar, AvatarFallback, AvatarImage } from "@/ui/components/ui/avatar";
import { Badge } from "@/ui/components/ui/badge";
import { GitPullRequest, MessageSquare, GitCommit, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

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
    <motion.div
      onClick={onClick}
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      className="rounded-xl bg-transparent border border-border/40 p-6 transition-all duration-300 hover:border-border/80 hover:bg-card/20 cursor-pointer group shadow-sm hover:shadow-md"
    >
      <div className="flex items-start gap-4 mb-6">
        <Avatar className="h-14 w-14 ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all">
          <AvatarImage src={developer.avatar} alt={developer.name} />
          <AvatarFallback>{developer.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-foreground truncate mb-0.5">
            {developer.name}
          </h3>
          <p className="text-sm text-muted-foreground truncate">
            {developer.role}
          </p>
        </div>

        <Badge variant={getStatusColor(developer.status)} className="text-[10px] h-5 px-2 uppercase tracking-wider font-medium">
          {getStatusLabel(developer.status)}
        </Badge>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col items-center p-3 rounded-lg bg-muted/20 border border-transparent group-hover:border-border/30 transition-colors">
          <GitPullRequest className="h-5 w-5 text-primary mb-2 opacity-80" />
          <span className="text-sm font-bold text-foreground">{developer.activePRs}</span>
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">PRs</span>
        </div>
        
        <div className="flex flex-col items-center p-3 rounded-lg bg-muted/20 border border-transparent group-hover:border-border/30 transition-colors">
          <MessageSquare className="h-5 w-5 text-accent mb-2 opacity-80" />
          <span className="text-sm font-bold text-foreground">{developer.reviewsPending}</span>
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">Reviews</span>
        </div>
        
        <div className="flex flex-col items-center p-3 rounded-lg bg-muted/20 border border-transparent group-hover:border-border/30 transition-colors">
          <GitCommit className="h-5 w-5 text-success mb-2 opacity-80" />
          <span className="text-sm font-bold text-foreground">{developer.commitsThisWeek}</span>
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">Commits</span>
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-border/40 flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">View details</span>
        <TrendingUp className="h-4 w-4 text-primary group-hover:translate-x-1 transition-transform" />
      </div>
    </motion.div>
  );
};
