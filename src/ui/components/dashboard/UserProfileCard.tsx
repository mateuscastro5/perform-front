import { Avatar, AvatarFallback } from '@/ui/components/ui/avatar';
import { Badge } from '@/ui/components/ui/badge';
import { Card, CardContent } from '@/ui/components/ui/card';

interface UserProfileCardProps {
  userName?: string;
  userRole?: string;
  userTag?: string;
  userInitials?: string;
}

const UserProfileCard = ({
  userName,
  userRole,
  userTag,
  userInitials,
}: UserProfileCardProps) => {
  const displayName = userName || "Guest";
  const displayRole = userRole?.replace('_', ' ') || "User";
  const displayInitials = userInitials || 
    displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <Card className="mb-6 backdrop-blur-sm bg-card/50 shadow-glow-green hover:shadow-glow-green transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <Avatar className="w-20 h-20 ring-4 ring-primary/20 shadow-glow-green">
            <AvatarFallback className="bg-gradient-to-br from-primary via-primary/90 to-secondary text-primary-foreground text-2xl font-bold">
              {displayInitials}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-foreground mb-2">{displayName}</h1>
            <div className="flex items-center gap-3">
              <span className="text-primary font-medium capitalize">{displayRole}</span>
              {userTag && (
                <Badge variant="outline" className="text-xs">
                  {userTag}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserProfileCard;

