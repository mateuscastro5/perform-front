import { motion } from "motion/react";
import { Avatar, Badge } from "../ui/base-components";
import { animations } from "../../lib/design-system";

interface UserProfileCardProps {
  userName?: string;
  userRole?: string;
  userTag?: string;
  userInitials?: string;
  avatar?: string;
}

const UserProfileCard = ({
  userName = "Mateus Castro",
  userRole = "Tech Lead",
  userTag = "#4625",
  userInitials = "MT",
  avatar
}: UserProfileCardProps) => {
  return (
    <motion.div 
      {...animations.slideUp}
      className="flex items-center gap-4 mb-6"
    >
      <Avatar
        src={avatar}
        name={userInitials}
        size="xl"
        className="ring-4 ring-blue-500/20"
      />
      
      <div>
        <motion.h1 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="text-3xl font-bold mb-1"
        >
          {userName}
        </motion.h1>
        <div className="flex items-center gap-3">
          <motion.span 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-blue-300 font-medium"
          >
            {userRole}
          </motion.span>
          <Badge variant="gray" className="text-sm">
            {userTag}
          </Badge>
        </div>
      </div>
    </motion.div>
  );
};

export default UserProfileCard;
