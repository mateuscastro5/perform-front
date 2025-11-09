import { GitBranch, Users } from "lucide-react";
import { useDashboard } from "../contexts/DashboardContext";

interface Developer {
  name: string;
  [key: string]: string | number;
}

interface Interaction {
  from: string;
  to: string;
  count: number;
}

export const CollaborationHeatmap = () => {
  const { githubCollaboration, isLoading } = useDashboard();

  const developers = (githubCollaboration?.developers || []) as Developer[];
  const interactions = (githubCollaboration?.interactions || []) as Interaction[];
  
  // Get only the first 4-5 developers to fit in the heatmap
  const teamMembers = developers.slice(0, 5).map((d) => d.name.split(' ')[0]); // First name only
  
  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-4 shadow-card">
        <div className="flex items-center gap-2 mb-4">
          <div className="rounded-lg bg-accent/20 p-2">
            <GitBranch className="h-4 w-4 text-accent" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Team Collaboration</h2>
            <p className="text-[10px] text-muted-foreground">Loading...</p>
          </div>
        </div>
        <div className="h-32 flex items-center justify-center text-muted-foreground text-sm">
          <div className="animate-pulse">Loading collaboration data...</div>
        </div>
      </div>
    );
  }

  if (teamMembers.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-4 shadow-card">
        <div className="flex items-center gap-2 mb-4">
          <div className="rounded-lg bg-accent/20 p-2">
            <GitBranch className="h-4 w-4 text-accent" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Team Collaboration</h2>
            <p className="text-[10px] text-muted-foreground">No data available</p>
          </div>
        </div>
        <div className="h-32 flex items-center justify-center text-muted-foreground text-sm">
          No collaboration data yet
        </div>
      </div>
    );
  }

  const maxInteractions = Math.max(...interactions.map((i) => i.count), 1);
  
  return (
    <div className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-4 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-accent/20 p-2">
            <GitBranch className="h-4 w-4 text-accent" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Team Collaboration</h2>
            <p className="text-[10px] text-muted-foreground">
              {interactions.length} cross-reviews
            </p>
          </div>
        </div>
        <Users className="h-4 w-4 text-muted-foreground" />
      </div>

      <div className="grid gap-1.5" style={{ gridTemplateColumns: `auto repeat(${teamMembers.length}, 1fr)` }}>
        {/* Header Row */}
        <div />
        {teamMembers.map((member: string) => (
          <div key={member} className="text-center">
            <span className="text-[10px] font-medium text-muted-foreground truncate" title={member}>
              {member}
            </span>
          </div>
        ))}

        {/* Data Grid */}
        {teamMembers.map((fromMember: string, fromIndex: number) => (
          <div key={`row-${fromIndex}`} className="contents">
            <div className="flex items-center justify-end pr-1">
              <span className="text-[10px] font-medium text-muted-foreground truncate" title={fromMember}>
                {fromMember}
              </span>
            </div>
            {teamMembers.map((toMember: string, toIndex: number) => {
              const connection = interactions.find(
                (i) => i.from.split(' ')[0] === fromMember && i.to.split(' ')[0] === toMember
              );
              const intensity = connection ? connection.count : 0;
              const normalizedIntensity = intensity / maxInteractions;
              
              return (
                <div
                  key={`cell-${fromIndex}-${toIndex}`}
                  className="aspect-square rounded transition-all duration-300 hover:scale-110 cursor-pointer relative group"
                  style={{
                    backgroundColor: fromMember === toMember 
                      ? 'hsl(var(--muted))' 
                      : normalizedIntensity > 0.66
                        ? 'hsl(var(--primary))' 
                        : normalizedIntensity > 0.33
                          ? 'hsl(var(--accent))' 
                          : 'hsl(var(--muted))',
                    opacity: fromMember === toMember ? 0.3 : intensity > 0 ? 0.8 : 0.2,
                  }}
                  title={intensity > 0 ? `${fromMember} → ${toMember}: ${intensity} reviews` : ''}
                >
                  {intensity > 0 && (
                    <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-foreground opacity-0 group-hover:opacity-100">
                      {intensity}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 mt-4 pt-3 border-t border-border/50">
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded bg-primary" />
          <span className="text-[10px] text-muted-foreground">High (66%+)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded bg-accent" />
          <span className="text-[10px] text-muted-foreground">Medium (33-66%)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded bg-muted" />
          <span className="text-[10px] text-muted-foreground">Low (&lt;33%)</span>
        </div>
      </div>
    </div>
  );
};
