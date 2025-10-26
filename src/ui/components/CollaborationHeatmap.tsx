import { GitBranch, Users } from "lucide-react";

const collaborationData = [
  { from: "Sarah", to: "Marcus", count: 12, color: "bg-primary/80" },
  { from: "Marcus", to: "Ana", count: 8, color: "bg-accent/80" },
  { from: "Ana", to: "Sarah", count: 15, color: "bg-success/80" },
  { from: "Sarah", to: "David", count: 6, color: "bg-warning/60" },
  { from: "David", to: "Marcus", count: 10, color: "bg-primary/70" },
];

const teamMembers = ["Sarah", "Marcus", "Ana", "David"];

export const CollaborationHeatmap = () => {
  return (
    <div className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-4 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-accent/20 p-2">
            <GitBranch className="h-4 w-4 text-accent" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Team Collaboration</h2>
            <p className="text-[10px] text-muted-foreground">Cross-review patterns</p>
          </div>
        </div>
        <Users className="h-4 w-4 text-muted-foreground" />
      </div>

      <div className="grid grid-cols-5 gap-1.5">
        {/* Header Row */}
        <div />
        {teamMembers.map((member) => (
          <div key={member} className="text-center">
            <span className="text-[10px] font-medium text-muted-foreground">{member}</span>
          </div>
        ))}

        {/* Data Grid */}
        {teamMembers.map((fromMember) => (
          <>
            <div key={`label-${fromMember}`} className="flex items-center justify-end pr-1">
              <span className="text-[10px] font-medium text-muted-foreground">{fromMember}</span>
            </div>
            {teamMembers.map((toMember) => {
              const connection = collaborationData.find(
                (d) => d.from === fromMember && d.to === toMember
              );
              const intensity = connection ? connection.count : 0;
              
              return (
                <div
                  key={`${fromMember}-${toMember}`}
                  className="aspect-square rounded transition-all duration-300 hover:scale-110 cursor-pointer relative group"
                  style={{
                    backgroundColor: fromMember === toMember 
                      ? 'hsl(var(--muted))' 
                      : intensity > 10 
                        ? 'hsl(var(--primary))' 
                        : intensity > 5 
                          ? 'hsl(var(--accent))' 
                          : 'hsl(var(--muted))',
                    opacity: fromMember === toMember ? 0.3 : intensity > 0 ? 0.8 : 0.2,
                  }}
                >
                  {intensity > 0 && (
                    <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-foreground opacity-0 group-hover:opacity-100">
                      {intensity}
                    </span>
                  )}
                </div>
              );
            })}
          </>
        ))}
      </div>

      <div className="flex items-center gap-3 mt-4 pt-3 border-t border-border/50">
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded bg-primary" />
          <span className="text-[10px] text-muted-foreground">High (10+)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded bg-accent" />
          <span className="text-[10px] text-muted-foreground">Medium (5-10)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded bg-muted" />
          <span className="text-[10px] text-muted-foreground">Low (1-5)</span>
        </div>
      </div>
    </div>
  );
};
