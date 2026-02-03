import { useState } from "react";
import { LucideIcon, ChevronDown } from "lucide-react";
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
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border border-border transition-all duration-300 cursor-pointer backdrop-blur-sm",
        "bg-card/50 hover:bg-card/80 shadow-card hover:shadow-glow-green",
        isExpanded ? "row-span-2" : "",
        size === "large" ? "col-span-2" : ""
      )}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <p className="text-xs font-medium text-muted-foreground mb-1">{title}</p>
            <h3 className={cn(
              "font-bold text-foreground mb-0.5 transition-all",
              isExpanded ? "text-4xl" : "text-2xl"
            )}>
              {value}
            </h3>
            <p className={cn("text-xs font-semibold", changeColors[changeType])}>
              {change}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <div className={cn("rounded-lg bg-muted/50 p-2 transition-all", iconColor)}>
              <Icon className="h-4 w-4" />
            </div>
            <ChevronDown
              className={cn(
                "h-3 w-3 text-muted-foreground transition-transform duration-300",
                isExpanded ? "rotate-180" : ""
              )}
            />
          </div>
        </div>

        {/* Expanded Details */}
        <div
          className={cn(
            "transition-all duration-300 overflow-hidden",
            isExpanded ? "max-h-96 opacity-100 mt-3" : "max-h-0 opacity-0"
          )}
        >
          <div className="space-y-2 pt-3 border-t border-border/50">
            {details.map((detail, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-lg bg-muted/30 p-2 animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <span className="text-xs text-muted-foreground">{detail.label}</span>
                <span className="text-xs font-semibold text-foreground">{detail.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-primary/20 via-primary to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
};
