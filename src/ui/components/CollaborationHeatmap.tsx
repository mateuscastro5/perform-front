import { GitBranch, Users } from "lucide-react";
import { useDashboard } from "../contexts/DashboardContext";
import { motion } from "framer-motion";

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
      <div className="rounded-xl border border-border/40 bg-transparent p-6">
        <div className="flex items-center gap-2 mb-6">
          <div className="rounded-lg bg-accent/10 p-2">
            <GitBranch className="h-4 w-4 text-accent" />
          </div>
          <div>
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Team Collaboration</h2>
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
      <div className="rounded-xl border border-border/40 bg-transparent p-6">
        <div className="flex items-center gap-2 mb-6">
          <div className="rounded-lg bg-accent/10 p-2">
            <GitBranch className="h-4 w-4 text-accent" />
          </div>
          <div>
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Team Collaboration</h2>
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
    <div className="rounded-xl border border-border/40 bg-transparent p-6 h-[420px] flex flex-col overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-accent/10 p-2.5">
            <GitBranch className="h-5 w-5 text-accent" />
          </div>
          <div>
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Team Collaboration</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {interactions.length} cross-reviews
            </p>
          </div>
        </div>
        <Users className="h-5 w-5 text-muted-foreground/50" />
      </div>

      <div className="overflow-auto flex-1 flex items-center justify-center p-2">
        <div className="grid gap-2 w-full max-w-full" style={{ gridTemplateColumns: `70px repeat(${teamMembers.length}, 1fr)` }}>
        {/* Header Row */}
        <div />
        {teamMembers.map((member: string) => (
          <div key={member} className="text-center flex items-center justify-center min-h-[24px]">
            <span className="text-xs font-medium text-muted-foreground truncate" title={member}>
              {member}
            </span>
          </div>
        ))}

        {/* Data Grid */}
        {teamMembers.map((fromMember: string, fromIndex: number) => (
          <div key={`row-${fromIndex}`} className="contents">
            <div className="flex items-center justify-end pr-3 min-h-[48px]">
              <span className="text-xs font-medium text-muted-foreground truncate" title={fromMember}>
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
                <motion.div
                  key={`cell-${fromIndex}-${toIndex}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: (fromIndex * teamMembers.length + toIndex) * 0.02 }}
                  whileHover={{ scale: 1.1, zIndex: 10 }}
                  className="aspect-square rounded-md cursor-pointer relative group shadow-sm"
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
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-foreground opacity-0 group-hover:opacity-100 transition-opacity bg-background/50 rounded-md backdrop-blur-sm">
                      {intensity}
                    </span>
                  )}
                </motion.div>
              );
            })}
          </div>
        ))}
        </div>
      </div>

      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border/50 flex-shrink-0 justify-center">
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-sm bg-primary shadow-sm" />
          <span className="text-xs text-muted-foreground font-medium">High</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-sm bg-accent shadow-sm" />
          <span className="text-xs text-muted-foreground font-medium">Medium</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-sm bg-muted shadow-sm" />
          <span className="text-xs text-muted-foreground font-medium">Low</span>
        </div>
      </div>
    </div>
  );
};
