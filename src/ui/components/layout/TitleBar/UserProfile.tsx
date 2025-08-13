import { Settings } from 'lucide-react';
import { Button, Avatar } from '../../ui/base-components';

interface UserProfileProps {
  userName?: string;
  userInitials?: string;
  onSettingsClick?: () => void;
}

const UserProfile = ({
  userName = "mateusfa",
  userInitials = "MT",
  onSettingsClick
}: UserProfileProps) => {
  return (
    <div className="flex items-center gap-3" style={{ WebkitAppRegion: 'no-drag' } as never}>
      <Button 
        variant="ghost"
        size="sm"
        onClick={onSettingsClick}
        className="p-2 hover:bg-slate-700/30"
      >
        <Settings className="w-4 h-4" />
      </Button>
      
      <div className="flex items-center gap-2">
        <Avatar
          initials={userInitials}
          className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600"
        />
        <span className="text-slate-300 text-sm font-medium">{userName}</span>
      </div>
    </div>
  );
};

export default UserProfile;
