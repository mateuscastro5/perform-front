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
    <div className="flex items-center gap-3" style={{ WebkitAppRegion: 'no-drag' }}>
      <button 
        className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/30 rounded-lg transition-all"
        onClick={onSettingsClick}
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>
      
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
          <span className="text-white text-xs font-bold">{userInitials}</span>
        </div>
        <span className="text-gray-300 text-sm font-medium">{userName}</span>
      </div>
    </div>
  );
};

export default UserProfile;
