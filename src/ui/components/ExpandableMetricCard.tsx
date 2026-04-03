import { useState } from "react";
import { LucideIcon, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/ui/lib/utils";

interface ExpandableMetricCardProps {
  title: string;
  value: string | number;
  change: string;
  changeType: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  iconColor?: string;
  details?: { label: string; value: string }[];
  size?: "small" | "large";
}

export const ExpandableMetricCard = ({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  iconColor = "text-primary",
  details = [],
  size = "small"
}: ExpandableMetricCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const changeColors = {
    positive: "text-success",
    negative: "text-destructive",
    neutral: "text-muted-foreground",
  };

  return (
    <motion.div
      layout
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border/40 transition-colors duration-300 cursor-pointer",
        "bg-card/20 hover:bg-card/40 backdrop-blur-md shadow-sm hover:shadow-md",
        isExpanded ? "row-span-2" : "",
        size === "large" ? "col-span-2" : ""
      )}
      onClick={() => setIsExpanded(!isExpanded)}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <motion.p layout="position" className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
              {title}
            </motion.p>
            <motion.h3 
              layout="position"
              className={cn(
                "font-light text-foreground mb-1 transition-all duration-300",
                isExpanded ? "text-6xl" : "text-4xl"
              )}
            >
              {value}
            </motion.h3>
            <motion.p layout="position" className={cn("text-sm font-medium", changeColors[changeType])}>
              {change}
            </motion.p>
          </div>
          <div className="flex flex-col items-end gap-3">
            <div className={cn("p-3 rounded-xl bg-muted/30", iconColor)}>
              <Icon className="h-7 w-7 opacity-80" />
            </div>
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <ChevronDown className="h-5 w-5 text-muted-foreground/50" />
            </motion.div>
          </div>
        </div>

        {/* Expanded Details */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: "auto", marginTop: 16 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="space-y-2 pt-4 border-t border-border/20">
                {details.map((detail, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 + 0.1 }}
                    className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/30 transition-colors"
                  >
                    <span className="text-sm text-muted-foreground">{detail.label}</span>
                    <span className="text-sm font-medium text-foreground">{detail.value}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
