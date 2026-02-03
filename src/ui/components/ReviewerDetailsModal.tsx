import { useEffect, useState } from "react";
import { X, CheckCircle2, XCircle, MessageCircle, GitMerge, Clock } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/components/ui/avatar";
import { apiService } from "../services/api.service";
import { useAuth } from "../contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";

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
      <div className="space-y-2">
        {prList.map((pr) => (
          <div
            key={pr.id}
            className="flex items-start gap-3 rounded-lg bg-muted/30 p-3 transition-all duration-200 hover:bg-muted/50 cursor-pointer"
            onClick={() => window.open(pr.url, '_blank')}
          >
            <Avatar className="h-8 w-8 ring-2 ring-primary/20 flex-shrink-0">
              <AvatarImage src={pr.author.avatar} alt={pr.author.name} />
              <AvatarFallback>{pr.author.name.split(" ").map((n: string) => n[0]).join("")}</AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h4 className="text-sm font-semibold text-foreground line-clamp-2">
                  {pr.title}
                </h4>
                {getStatusIcon(pr.status)}
              </div>
              
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                <span>#{pr.number}</span>
                <span>•</span>
                <span>{pr.author.name}</span>
                <span>•</span>
                <span>Reviewed {formatDistanceToNow(new Date(pr.reviewedAt), { addSuffix: true })}</span>
              </div>

              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <span className="text-success">+{pr.additions}</span>
                  <span className="text-destructive">-{pr.deletions}</span>
                </span>
                <span>{pr.changedFiles} files</span>
              </div>
            </div>
          </div>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm" onClick={onClose}>
      <div className="relative w-full max-w-4xl max-h-[90vh] mx-4 bg-card border border-border rounded-xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12 ring-2 ring-primary/20">
              <AvatarImage src={reviewerAvatar} alt={reviewerName} />
              <AvatarFallback>{reviewerName.split(" ").map((n: string) => n[0]).join("")}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-bold text-foreground">{reviewerName}</h2>
              <p className="text-sm text-muted-foreground">@{reviewerLogin}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-muted/50 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 px-6 pt-4 border-b border-border">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-t-lg transition-all ${
                  activeTab === tab.key
                    ? 'bg-card border-b-2 border-primary text-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                }`}
              >
                <Icon className={`h-4 w-4 ${activeTab === tab.key ? tab.color : ''}`} />
                <span className="text-sm font-medium">{tab.label}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  activeTab === tab.key
                    ? 'bg-primary/20 text-primary'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-pulse text-muted-foreground">Loading pull requests...</div>
            </div>
          ) : (
            <>
              {activeTab === 'approved' && renderPRList(prs.approved, 'No approved pull requests')}
              {activeTab === 'changesRequested' && renderPRList(prs.changesRequested, 'No pull requests with changes requested')}
              {activeTab === 'commented' && renderPRList(prs.commented, 'No commented pull requests')}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
