import { useEffect, useState } from "react";
import { X, CheckCircle2, XCircle, MessageCircle, GitMerge, Clock } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/components/ui/avatar";
import { apiService } from "../services/api.service";
import { useAuth } from "../contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";

interface ReviewerDetailsModalProps {
  reviewerLogin: string;
  reviewerName: string;
  reviewerAvatar: string;
  onClose: () => void;
}

interface PullRequest {
  id: string;
  title: string;
  number: number;
  state: string;
  author: {
    id: string | null;
    name: string;
    avatar: string;
    login: string;
  };
  createdAt: string;
  updatedAt: string;
  closedAt: string | null;
  mergedAt: string | null;
  url: string;
  additions: number;
  deletions: number;
  changedFiles: number;
  reviewState: string;
  reviewedAt: string;
  status: string;
}

export const ReviewerDetailsModal = ({
  reviewerLogin,
  reviewerName,
  reviewerAvatar,
  onClose,
}: ReviewerDetailsModalProps) => {
  const { token } = useAuth();
  const [prs, setPrs] = useState<{
    approved: PullRequest[];
    changesRequested: PullRequest[];
    commented: PullRequest[];
    pending: PullRequest[];
  }>({ approved: [], changesRequested: [], commented: [], pending: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'approved' | 'changesRequested' | 'commented' | 'pending'>('approved');

  useEffect(() => {
    const fetchPRs = async () => {
      if (!token) return;

      try {
        setIsLoading(true);
        const data = await apiService.getReviewerPullRequests(token, reviewerLogin);
        setPrs(data as any);
      } catch (error) {
        console.error("Failed to fetch reviewer PRs:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPRs();
  }, [token, reviewerLogin]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'merged':
        return <GitMerge className="h-3.5 w-3.5 text-success" />;
      case 'closed':
        return <XCircle className="h-3.5 w-3.5 text-destructive" />;
      default:
        return <Clock className="h-3.5 w-3.5 text-warning" />;
    }
  };

  const renderPRList = (prList: PullRequest[], emptyMessage: string) => {
    if (prList.length === 0) {
      return (
        <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
          {emptyMessage}
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {prList.map((pr, index) => (
          <motion.div
            key={pr.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            whileHover={{ scale: 1.01, x: 4 }}
            className="flex items-start gap-4 rounded-lg bg-muted/20 p-4 transition-colors duration-200 hover:bg-muted/40 cursor-pointer border border-transparent hover:border-border/30"
            onClick={() => window.open(pr.url, '_blank')}
          >
            <Avatar className="h-10 w-10 ring-2 ring-primary/20 flex-shrink-0">
              <AvatarImage src={pr.author.avatar} alt={pr.author.name} />
              <AvatarFallback>{pr.author.name.split(" ").map((n: string) => n[0]).join("")}</AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3 mb-1.5">
                <h4 className="text-sm font-medium text-foreground line-clamp-2">
                  {pr.title}
                </h4>
                <div className="mt-0.5">
                  {getStatusIcon(pr.status)}
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2.5">
                <span className="font-medium">#{pr.number}</span>
                <span>•</span>
                <span>{pr.author.name}</span>
                <span>•</span>
                <span>Reviewed {formatDistanceToNow(new Date(pr.reviewedAt), { addSuffix: true })}</span>
              </div>

              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5 bg-muted/30 px-2 py-0.5 rounded-md">
                  <span className="text-success font-medium">+{pr.additions}</span>
                  <span className="text-destructive font-medium">-{pr.deletions}</span>
                </span>
                <span className="bg-muted/30 px-2 py-0.5 rounded-md">{pr.changedFiles} files</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    );
  };

  const tabs = [
    { key: 'approved' as const, label: 'Approved', count: prs.approved.length, icon: CheckCircle2, color: 'text-success' },
    { key: 'changesRequested' as const, label: 'Changes Requested', count: prs.changesRequested.length, icon: XCircle, color: 'text-destructive' },
    { key: 'commented' as const, label: 'Commented', count: prs.commented.length, icon: MessageCircle, color: 'text-muted-foreground' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm" 
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative w-full max-w-4xl max-h-[90vh] mx-4 bg-card/50 border border-border/40 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-md" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-border/40 bg-muted/10">
          <div className="flex items-center gap-6">
            <Avatar className="h-16 w-16 ring-2 ring-primary/20">
              <AvatarImage src={reviewerAvatar} alt={reviewerName} />
              <AvatarFallback>{reviewerName.split(" ").map((n: string) => n[0]).join("")}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-light text-foreground tracking-tight mb-1">{reviewerName}</h2>
              <p className="text-sm text-muted-foreground">@{reviewerLogin}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 rounded-full hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-4 px-8 pt-6 border-b border-border/40">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2.5 px-4 py-3 rounded-t-lg transition-all relative ${
                  activeTab === tab.key
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/20'
                }`}
              >
                <Icon className={`h-4 w-4 ${activeTab === tab.key ? tab.color : ''}`} />
                <span className="text-sm font-medium">{tab.label}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  activeTab === tab.key
                    ? 'bg-primary/20 text-primary'
                    : 'bg-muted/50 text-muted-foreground'
                }`}>
                  {tab.count}
                </span>
                {activeTab === tab.key && (
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 220px)' }}>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-pulse text-muted-foreground">Loading pull requests...</div>
            </div>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === 'approved' && renderPRList(prs.approved, 'No approved pull requests')}
              {activeTab === 'changesRequested' && renderPRList(prs.changesRequested, 'No pull requests with changes requested')}
              {activeTab === 'commented' && renderPRList(prs.commented, 'No commented pull requests')}
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};
