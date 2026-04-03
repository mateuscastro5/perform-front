import { Avatar, AvatarFallback, AvatarImage } from "@/ui/components/ui/avatar";
import { MessageSquare, CheckCircle2, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { apiService } from "../services/api.service";
import { useAuth } from "../contexts/AuthContext";
import { ReviewerDetailsModal } from "./ReviewerDetailsModal";
import { motion } from "framer-motion";

interface TopReviewer {
  reviewer: {
    id: string | null;
    name: string;
    login: string;
    avatar: string;
  };
  stats: {
    prsReviewed: number;
    totalReviews: number;
    approved: number;
    changesRequested: number;
    commented: number;
  };
}

export const TopReviewers = () => {
  const { token } = useAuth();
  const [reviewers, setReviewers] = useState<TopReviewer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReviewer, setSelectedReviewer] = useState<TopReviewer | null>(null);

  useEffect(() => {
    const fetchReviewers = async () => {
      if (!token) return;
      
      try {
        setIsLoading(true);
        const data = await apiService.getGithubTopReviewers(token, 10); // Fetch more items
        setReviewers(data);
      } catch (error) {
        console.error('Failed to fetch top reviewers:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviewers();
  }, [token]);

  if (isLoading) {
    return (
      <div className="rounded-xl bg-transparent border border-border/40 p-6 h-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Top Reviewers</h2>
          <MessageSquare className="h-4 w-4 text-muted-foreground/50" />
        </div>
        <div className="h-32 flex items-center justify-center text-muted-foreground text-sm">
          <div className="animate-pulse">Loading reviewers...</div>
        </div>
      </div>
    );
  }

  if (reviewers.length === 0) {
    return (
      <div className="rounded-xl bg-transparent border border-border/40 p-6 h-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Top Reviewers</h2>
          <MessageSquare className="h-4 w-4 text-muted-foreground/50" />
        </div>
        <div className="h-32 flex items-center justify-center text-muted-foreground text-sm">
          No reviews found
        </div>
      </div>
    );
  }

  return (
    <>
      {selectedReviewer && (
        <ReviewerDetailsModal
          reviewerLogin={selectedReviewer.reviewer.login}
          reviewerName={selectedReviewer.reviewer.name}
          reviewerAvatar={selectedReviewer.reviewer.avatar}
          onClose={() => setSelectedReviewer(null)}
        />
      )}
      
      <div className="rounded-xl bg-transparent border border-border/40 p-6 flex flex-col h-[500px]">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Top Reviewers</h2>
          <MessageSquare className="h-5 w-5 text-muted-foreground/50" />
        </div>

        <div className="space-y-3 flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-accent/20 scrollbar-track-transparent hover:scrollbar-thumb-accent/40">
          {reviewers.map((reviewer: TopReviewer, index: number) => (
            <motion.div
              key={reviewer.reviewer.login}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ scale: 1.01, x: 4 }}
              className="flex items-center gap-3 rounded-lg bg-muted/20 p-3 transition-colors duration-200 hover:bg-muted/40 cursor-pointer border border-transparent hover:border-border/30"
              onClick={() => setSelectedReviewer(reviewer)}
            >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <span className="text-sm font-bold text-muted-foreground/50 w-5">
                #{index + 1}
              </span>
              
              <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                <AvatarImage src={reviewer.reviewer.avatar} alt={reviewer.reviewer.name} />
                <AvatarFallback>
                  {reviewer.reviewer.name.split(" ").map((n: string) => n[0]).join("")}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-foreground truncate">
                  {reviewer.reviewer.name}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {reviewer.stats.prsReviewed} PRs reviewed
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div 
                className="bg-success/10 border border-success/30 text-success text-[10px] px-2 py-1 rounded-md flex items-center gap-1"
                title="Approved"
              >
                <CheckCircle2 className="h-3 w-3" />
                <span className="font-medium">{reviewer.stats.approved}</span>
              </div>

              {reviewer.stats.changesRequested > 0 && (
                <div 
                  className="bg-destructive/10 border border-destructive/30 text-destructive text-[10px] px-2 py-1 rounded-md flex items-center gap-1"
                  title="Changes Requested"
                >
                  <XCircle className="h-3 w-3" />
                  <span className="font-medium">{reviewer.stats.changesRequested}</span>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
    </>
  );
};
