import { TrendingUp, TrendingDown } from "lucide-react";

const weeklyData = [
  { day: "Mon", value: 45, height: "h-10" },
  { day: "Tue", value: 62, height: "h-14" },
  { day: "Wed", value: 58, height: "h-12" },
  { day: "Thu", value: 78, height: "h-18" },
  { day: "Fri", value: 85, height: "h-20" },
  { day: "Sat", value: 40, height: "h-8" },
  { day: "Sun", value: 35, height: "h-6" },
];

export const WeeklyImpact = () => {
  return (
    <div className="rounded-xl bg-card/50 border border-border p-4 shadow-card backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-foreground mb-0.5">Weekly Impact</h2>
          <p className="text-[10px] text-muted-foreground">Team productivity overview</p>
        </div>
        <div className="flex items-center gap-1.5 text-success">
          <TrendingUp className="h-4 w-4" />
          <span className="text-xl font-bold">+18%</span>
        </div>
      </div>

      <div className="flex items-end justify-between gap-2 h-24">
        {weeklyData.map((day, index) => (
          <div key={day.day} className="flex flex-col items-center gap-1.5 flex-1">
            <div className="relative w-full flex items-end justify-center h-full">
              <div
                className={`w-full ${day.height} bg-gradient-to-t from-primary to-primary/50 rounded-t-lg transition-all duration-300 hover:from-primary hover:to-primary/70 hover:shadow-glow-green animate-fade-in`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-semibold text-muted-foreground">
                  {day.value}
                </span>
              </div>
            </div>
            <span className="text-[10px] font-medium text-muted-foreground">{day.day}</span>
          </div>
        ))}
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
