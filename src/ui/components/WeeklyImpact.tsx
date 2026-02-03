import { TrendingUp, TrendingDown } from "lucide-react";
import { useDashboard } from "../contexts/DashboardContext";

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
    <div className="rounded-xl bg-card/50 border border-border p-4 shadow-card backdrop-blur-sm h-[320px] flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-lg font-bold text-foreground mb-0.5">Weekly Impact</h2>
          <p className="text-[10px] text-muted-foreground">
            {isLoading ? "Loading..." : `${total} commits this week`}
          </p>
        </div>
        <div className={`flex items-center gap-1.5 ${percentageChange >= 0 ? 'text-success' : 'text-destructive'}`}>
          {percentageChange >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
          <span className="text-xl font-bold">
            {percentageChange >= 0 ? '+' : ''}{percentageChange}%
          </span>
        </div>
      </div>

      <div className="flex items-end justify-between gap-2 h-[180px] pb-6">
        {isLoading ? (
          Array.from({ length: 7 }).map((_: unknown, index: number) => (
            <div key={index} className="flex flex-col items-center gap-1.5 flex-1">
              <div className="relative w-full flex items-end justify-center h-full">
                <div className="w-full h-10 bg-muted/30 rounded-t-lg animate-pulse" />
              </div>
              <span className="text-[10px] font-medium text-muted-foreground">...</span>
            </div>
          ))
        ) : weeklyData.length > 0 ? (
          weeklyData.map((day: WeeklyDataItem) => {
            const heightPercentage = day.commits > 0 
              ? Math.max((day.commits / maxValue) * 100, 10) // Min 10% height for visibility
              : 0;
            const isLowActivity = day.commits < average;
            
            return (
              <div key={day.day} className="flex flex-col items-center gap-1 flex-1 h-full">
                {/* Label with number */}
                {day.commits > 0 && (
                  <span className="text-[10px] font-semibold text-muted-foreground mb-1">
                    {day.commits}
                  </span>
                )}
                
                {/* Bar container */}
                <div className="relative w-full flex-1 flex items-end justify-center">
                  {day.commits > 0 ? (
                    <div
                      className={`w-full ${isLowActivity ? 'bg-destructive hover:bg-destructive/80' : 'bg-primary hover:bg-primary/80'} rounded-t transition-all duration-300 cursor-pointer hover:shadow-lg`}
                      style={{ 
                        height: `${heightPercentage}%`,
                        minHeight: '10px'
                      }}
                    />
                  ) : (
                    <div className="w-full h-1 bg-muted/20 rounded" />
                  )}
                </div>
                
                {/* Day label */}
                <span className="text-[10px] font-medium text-muted-foreground mt-1">{day.day}</span>
              </div>
            );
          })
        ) : (
          <div className="flex items-center justify-center w-full h-full text-muted-foreground text-sm">
            No activity data available
          </div>
        )}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="flex items-center gap-1.5 text-xs">
          <div className="h-2 w-2 rounded-full bg-primary" />
          <span className="text-muted-foreground text-[9px]">Active days</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          <div className="h-2 w-2 rounded-full bg-destructive" />
          <span className="text-muted-foreground text-[9px]">Low activity</span>
        </div>
      </div>
    </div>
  );
};
