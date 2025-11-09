import { TrendingUp, TrendingDown } from "lucide-react";
import { useDashboard } from "../contexts/DashboardContext";

export const WeeklyImpact = () => {
  const { githubWeeklyActivity, isLoading } = useDashboard();

  const weeklyData = githubWeeklyActivity?.data || [];
  const total = githubWeeklyActivity?.total || 0;
  const average = githubWeeklyActivity?.average || 0;
  
  const percentageChange = total > 0 ? Math.round(((total - average * 7) / (average * 7)) * 100) : 0;
  
  const maxValue = Math.max(...weeklyData.map(d => d.commits), 1);
  
  return (
    <div className="rounded-xl bg-card/50 border border-border p-4 shadow-card backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
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

      <div className="flex items-end justify-between gap-2 h-24">
        {isLoading ? (
          Array.from({ length: 7 }).map((_, index) => (
            <div key={index} className="flex flex-col items-center gap-1.5 flex-1">
              <div className="relative w-full flex items-end justify-center h-full">
                <div className="w-full h-10 bg-muted/30 rounded-t-lg animate-pulse" />
              </div>
              <span className="text-[10px] font-medium text-muted-foreground">...</span>
            </div>
          ))
        ) : weeklyData.length > 0 ? (
          weeklyData.map((day, index) => {
            const heightPercentage = (day.commits / maxValue) * 100;
            const isLowActivity = day.commits < average;
            
            return (
              <div key={day.day} className="flex flex-col items-center gap-1.5 flex-1">
                <div className="relative w-full flex items-end justify-center h-full">
                  <div
                    className={`w-full bg-gradient-to-t ${isLowActivity ? 'from-destructive to-destructive/50' : 'from-primary to-primary/50'} rounded-t-lg transition-all duration-300 hover:from-primary hover:to-primary/70 hover:shadow-glow-green animate-fade-in`}
                    style={{ 
                      height: `${heightPercentage}%`,
                      animationDelay: `${index * 100}ms` 
                    }}
                  >
                    <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-semibold text-muted-foreground whitespace-nowrap">
                      {day.commits}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-medium text-muted-foreground">{day.day}</span>
              </div>
            );
          })
        ) : (
          <div className="flex items-center justify-center w-full h-full text-muted-foreground text-sm">
            No activity data available
          </div>
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="flex items-center gap-1.5 text-xs">
          <div className="h-2.5 w-2.5 rounded-full bg-primary" />
          <span className="text-muted-foreground text-[10px]">Active days</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          <div className="h-2.5 w-2.5 rounded-full bg-destructive" />
          <span className="text-muted-foreground text-[10px]">Low activity</span>
        </div>
      </div>
    </div>
  );
};
