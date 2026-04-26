import { useState } from "react";
import { DashboardHeader } from "@/ui/components/DashboardHeader";
import { DeveloperCard } from "@/ui/components/DeveloperCard";
import { DeveloperDetails } from "@/ui/components/DeveloperDetails";
import { useDashboard } from "@/ui/contexts/DashboardContext";
import { Loader2 } from "lucide-react";

const Developers = () => {
  const { githubDevelopers, isLoading, repositories } = useDashboard();
  const [selectedDeveloper, setSelectedDeveloper] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("developers");

  const developers = githubDevelopers
    .filter((dev) => {
      const u = dev.githubUsername ?? '';
      return !u.includes('[bot]') && !u.includes('@') && u.length > 0;
    })
    .map((dev) => ({
    id: dev.id,
    name: dev.name,
    avatar: dev.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(dev.name)}&background=random`,
    role: dev.githubUsername ? `@${dev.githubUsername}` : "Developer",
    activePRs: dev.stats?.pullRequests || 0,
    reviewsPending: dev.stats?.reviews || 0,
    commitsThisWeek: dev.stats?.commits || 0,
    status: (dev.stats?.commits || 0) > 0 ? "active" : "idle",
    strengths: [],
    weaknesses: [],
    currentWork: "",
    email: dev.email,
    githubUsername: dev.githubUsername,
    repositories: repositories.filter(repo =>
      true
    ),
  }))
  .filter((dev) => (dev.activePRs + dev.commitsThisWeek + dev.reviewsPending) > 0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading developers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="container mx-auto p-4 md:p-6 pt-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-2">Squad Developers</h1>
          <p className="text-sm text-muted-foreground">
            Track performance and activities of each developer in your squad
          </p>
        </div>

        {developers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-lg text-muted-foreground mb-2">No developers found</p>
            <p className="text-sm text-muted-foreground">
              Connect to GitHub and collect data to see your team members
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {developers.map((dev) => (
              <DeveloperCard
                key={dev.id}
                developer={dev}
                onClick={() => setSelectedDeveloper(dev)}
              />
            ))}
          </div>
        )}
      </main>

      {selectedDeveloper && (
        <DeveloperDetails
          developer={selectedDeveloper}
          onClose={() => setSelectedDeveloper(null)}
        />
      )}
    </div>
  );
};

export default Developers;
