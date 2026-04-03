import { Card, CardContent } from '@/ui/components/ui/card';
import { Badge } from '@/ui/components/ui/badge';
import { Avatar, AvatarFallback } from '@/ui/components/ui/avatar';
import { cn } from '@/ui/lib/utils';
import { GitPullRequest } from 'lucide-react';

export type PRStatus = 'merged' | 'approved' | 'review_requested' | 'changes_requested' | 'draft' | 'closed';

interface PRCardProps {
  id: number | string;
  title: string;
  author: {
    name: string;
    avatar?: string;
  };
  status: PRStatus;
  createdAt: string;
  branch?: string;
  additions: number;
  deletions: number;
  reviewers: Array<{
    name: string;
    avatar?: string;
    status: 'approved' | 'pending' | 'changes_requested';
  }>;
  onClick?: () => void;
}

const PRCard = ({
  id,
  title,
  author,
  status,
  createdAt,
  branch,
  additions,
  deletions,
  reviewers,
  onClick
}: PRCardProps) => {
  const getStatusConfig = (status: PRStatus) => {
    switch (status) {
      case 'merged':
        return {
          variant: 'default' as const,
          glow: 'hover:shadow-glow-purple',
          text: 'Merged'
        };
      case 'approved':
        return {
          variant: 'success' as const,
          glow: 'hover:shadow-glow-green',
          text: 'Approved'
        };
      case 'changes_requested':
        return {
          variant: 'destructive' as const,
          glow: 'hover:shadow-[0_0_30px_hsl(0_100%_70%_/_0.3)]',
          text: 'Changes Requested'
        };
      case 'review_requested':
        return {
          variant: 'default' as const,
          glow: 'hover:shadow-[0_0_30px_hsl(265_60%_80%_/_0.3)]',
          text: 'Review Requested'
        };
      case 'draft':
        return {
          variant: 'secondary' as const,
          glow: 'hover:shadow-card',
          text: 'Draft'
        };
      default:
        return {
          variant: 'outline' as const,
          glow: 'hover:shadow-card',
          text: 'Open'
        };
    }
  };

  const statusConfig = getStatusConfig(status);

  return (
    <Card 
      className={cn(
        "group cursor-pointer transition-all duration-300 hover:scale-[1.02] backdrop-blur-sm bg-card/50",
        statusConfig.glow,
        onClick && "cursor-pointer"
      )}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center group-hover:bg-primary/30 transition-colors">
              <GitPullRequest className="w-6 h-6 text-primary" />
            </div>
          </div>

          <div className="flex-1 min-w-0 space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={statusConfig.variant}>
                #{id} • {statusConfig.text}
              </Badge>
              <span className="text-xs text-muted-foreground">{createdAt}</span>
            </div>

            <h3 className="text-foreground font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
              {title}
            </h3>

            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3 text-sm">
                <span className="text-muted-foreground">{author.name}</span>
                <span className="text-xs text-muted-foreground">{branch ?? "unknown"}</span>
                <div className="flex items-center gap-1 text-xs">
                  <span className="text-success">+{additions}</span>
                  <span className="text-destructive">-{deletions}</span>
                </div>
              </div>

              <div className="flex -space-x-2">
                {reviewers.slice(0, 3).map((reviewer, index) => {
                  const reviewerStatusColor = 
                    reviewer.status === 'approved' ? 'bg-success text-success-foreground' :
                    reviewer.status === 'changes_requested' ? 'bg-destructive text-destructive-foreground' :
                    'bg-muted text-muted-foreground';
                  
                  return (
                    <Avatar
                      key={index}
                      className={cn(
                        "w-6 h-6 border-2 border-card transition-all duration-300 group-hover:scale-110",
                        reviewerStatusColor
                      )}
                      title={`${reviewer.name} - ${reviewer.status}`}
                    >
                      <AvatarFallback className={reviewerStatusColor}>
                        {reviewer.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  );
                })}
                {reviewers.length > 3 && (
                  <Avatar className="w-6 h-6 border-2 border-card bg-muted group-hover:scale-110 transition-all">
                    <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                      +{reviewers.length - 3}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PRCard;

