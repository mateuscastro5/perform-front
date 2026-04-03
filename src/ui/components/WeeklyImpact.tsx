import { TrendingUp, TrendingDown } from "lucide-react";
import { useDashboard } from "../contexts/DashboardContext";
import { motion } from "framer-motion";

interface WeeklyDataItem {
  day: string;
  commits: number;
  date: string;
}

export const WeeklyImpact = () => {
  const { githubWeeklyActivity, isLoading } = useDashboard();

  const weeklyData: WeeklyDataItem[] = githubWeeklyActivity?.data || [];
  const total = githubWeeklyActivity?.total || 0;
  const average = githubWeeklyActivity?.average || 0;
  
  const percentageChange = total > 0 ? Math.round(((total - average * 7) / (average * 7)) * 100) : 0;
  
  const maxValue = weeklyData.length > 0 ? Math.max(...weeklyData.map((d) => d.commits), 1) : 1;
  
  if (weeklyData.length > 0) {
    weeklyData.forEach((day, i) => {
      const heightPercentage = day.commits > 0 
        ? Math.max((day.commits / maxValue) * 100, 10)
        : 0;
      console.log(`Day ${i} (${day.day}):`, {
        commits: day.commits,
        heightPercentage,
        maxValue
      });
    });
  }
  
  return (
    <div className="rounded-xl bg-transparent border border-border/40 p-6 h-[320px] flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">Weekly Impact</h2>
          <p className="text-xs text-muted-foreground">
            {isLoading ? "Loading..." : `${total} commits this week`}
          </p>
        </div>
        <div className={`flex items-center gap-2 ${percentageChange >= 0 ? 'text-success' : 'text-destructive'}`}>
          {percentageChange >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
          <span className="text-2xl font-light">
            {percentageChange >= 0 ? '+' : ''}{percentageChange}%
          </span>
        </div>
      </div>

      <div className="flex items-end justify-between gap-3 h-[180px] pb-6">
        {isLoading ? (
          Array.from({ length: 7 }).map((_: unknown, index: number) => (
            <div key={index} className="flex flex-col items-center gap-2 flex-1">
              <div className="relative w-full flex items-end justify-center h-full">
                <div className="w-full h-10 bg-muted/30 rounded-t-lg animate-pulse" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">...</span>
            </div>
          ))
        ) : weeklyData.length > 0 ? (
          weeklyData.map((day: WeeklyDataItem, index: number) => {
            const heightPercentage = day.commits > 0 
              ? Math.max((day.commits / maxValue) * 100, 10) // Min 10% height for visibility
              : 0;
            const isLowActivity = day.commits < average;
            
            return (
              <div key={day.day} className="flex flex-col items-center gap-1.5 flex-1 h-full">
                {/* Label with number */}
                {day.commits > 0 && (
                  <motion.span 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 + 0.3 }}
                    className="text-xs font-semibold text-muted-foreground mb-1"
                  >
                    {day.commits}
                  </motion.span>
                )}
                
                {/* Bar container */}
                <div className="relative w-full flex-1 flex items-end justify-center">
                  {day.commits > 0 ? (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${heightPercentage}%` }}
                      transition={{ duration: 0.5, delay: index * 0.1, type: "spring", stiffness: 100 }}
                      whileHover={{ scaleY: 1.05, originY: 1 }}
                      className={`w-full ${isLowActivity ? 'bg-destructive hover:bg-destructive/80' : 'bg-primary hover:bg-primary/80'} rounded-t-md cursor-pointer shadow-sm`}
                      style={{ 
                        minHeight: '10px'
                      }}
                    />
                  ) : (
                    <div className="w-full h-1 bg-muted/20 rounded-md" />
                  )}
                </div>
                
                {/* Day label */}
                <span className="text-xs font-medium text-muted-foreground mt-2">{day.day}</span>
              </div>
            );
          })
        ) : (
          <div className="flex items-center justify-center w-full h-full text-muted-foreground text-sm">
            No activity data available
          </div>
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="flex items-center gap-2 text-sm">
          <div className="h-2.5 w-2.5 rounded-full bg-primary shadow-sm" />
          <span className="text-muted-foreground text-xs font-medium">Active days</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="h-2.5 w-2.5 rounded-full bg-destructive shadow-sm" />
          <span className="text-muted-foreground text-xs font-medium">Low activity</span>
        </div>
      </div>
    </div>
  );
};
