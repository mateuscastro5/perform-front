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
    <div className="flex items-center gap-4 mb-6">
      <div className="w-20 h-20 bg-gradient-to-br from-blue-600 via-blue-500 to-purple-600 rounded-full flex items-center justify-center ring-4 ring-blue-500/20">
        <span className="text-white text-2xl font-bold">{displayInitials}</span>
      </div>
      
      <div>
        <h1 className="text-3xl font-bold text-white mb-1">{displayName}</h1>
        <div className="flex items-center gap-3">
          <span className="text-blue-300 font-medium capitalize">{displayRole}</span>
          {userTag && (
            <span className="text-gray-400 text-sm bg-slate-800/50 px-2 py-1 rounded">{userTag}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfileCard;
