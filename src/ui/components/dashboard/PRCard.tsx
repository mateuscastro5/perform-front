import { motion } from 'motion/react';
import { Card, Badge, Avatar } from '../ui/base-components';
import { cn, getColorClasses, type ColorVariant } from '../../lib/design-system';

export type PRStatus = 'merged' | 'approved' | 'review_requested' | 'changes_requested' | 'draft' | 'closed';

interface PRCardProps {
  id: number;
  title: string;
  author: {
    name: string;
    avatar?: string;
  };
  status: PRStatus;
  createdAt: string;
  branch: string;
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
      case 'merged': return { color: 'purple' as ColorVariant, label: 'Merged' };
      case 'approved': return { color: 'green' as ColorVariant, label: 'Approved' };
      case 'changes_requested': return { color: 'red' as ColorVariant, label: 'Changes Requested' };
      case 'review_requested': return { color: 'yellow' as ColorVariant, label: 'Review Requested' };
      case 'draft': return { color: 'blue' as ColorVariant, label: 'Draft' };
      default: return { color: 'blue' as ColorVariant, label: 'Open' };
    }
  };

  const statusConfig = getStatusConfig(status);
  const statusColors = getColorClasses(statusConfig.color);

  return (
    <Card 
      animated={true}
      onClick={onClick}
      className="group transition-all duration-300"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-3"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn('w-2 h-2 rounded-full', statusColors.text.replace('text-', 'bg-'))} />
            <span className={cn('text-xs font-medium', statusColors.text)}>
              #{id} • {statusConfig.label}
            </span>
          </div>
          <span className="text-xs text-gray-400">{createdAt}</span>
        </div>

        <h3 className="text-white font-medium text-sm line-clamp-2 group-hover:text-gray-100 transition-colors">
          {title}
        </h3>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Avatar 
              name={author.name}
              src={author.avatar}
              size="sm"
            />
            <span className="text-gray-300">{author.name}</span>
          </div>
          <Badge variant="gray" size="sm">{branch}</Badge>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span className="text-green-400">+{additions}</span>
            <span className="text-red-400">-{deletions}</span>
          </div>
          
          {reviewers.length > 0 && (
            <div className="flex -space-x-1">
              {reviewers.slice(0, 3).map((reviewer, i) => (
                <Avatar
                  key={i}
                  name={reviewer.name}
                  src={reviewer.avatar}
                  size="sm"
                  className="border-2 border-slate-800"
                />
              ))}
              {reviewers.length > 3 && (
                <div className="w-6 h-6 bg-slate-600 rounded-full border-2 border-slate-700 flex items-center justify-center text-xs text-gray-300">
                  +{reviewers.length - 3}
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </Card>
  );
};

export default PRCard;