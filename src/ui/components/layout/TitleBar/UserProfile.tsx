import { useAuth } from '../../../contexts/AuthContext';

interface UserProfileProps {
  userName?: string;
  userInitials?: string;
  onSettingsClick?: () => void;
}

const UserProfile = ({
  userName,
  userInitials,
  onSettingsClick
}: UserProfileProps) => {
  const { user, logout } = useAuth();

  const displayName = userName || user?.name || "Guest";
  const displayInitials = userInitials || 
    displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="flex items-center gap-3" style={{ WebkitAppRegion: 'no-drag' }}>
      <button 
        className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/30 rounded-lg transition-all"
        onClick={onSettingsClick}
        title="Settings"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>

      <button 
        className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-all"
        onClick={logout}
        title="Logout"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      </button>
      
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
          <span className="text-white text-xs font-bold">{displayInitials}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-gray-300 text-sm font-medium">{displayName}</span>
          {user?.role && (
            <span className="text-gray-500 text-xs capitalize">{user.role.replace('_', ' ')}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
