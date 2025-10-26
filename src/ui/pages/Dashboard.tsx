import { useState } from "react";
import { DashboardHeader } from "@/ui/components/DashboardHeader";
import { ExpandableMetricCard } from "@/ui/components/ExpandableMetricCard";
import { CollaborationHeatmap } from "@/ui/components/CollaborationHeatmap";
import { ActivityTimeline } from "@/ui/components/ActivityTimeline";
import { PullRequestsList } from "@/ui/components/PullRequestsList";
import { WeeklyImpact } from "@/ui/components/WeeklyImpact";
import { GitPullRequest, GitCommit, MessageSquare, Activity } from "lucide-react";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("home");

  return (
    <div className="min-h-screen w-full bg-background">
      <DashboardHeader activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="p-6">
        <div className="max-w-[1600px] mx-auto space-y-6">
          {/* Header Section */}
          <div className="animate-fade-in">
            <h1 className="text-3xl font-bold text-foreground mb-1">
              Welcome back, <span className="text-primary">Tech Lead</span>
            </h1>
            <p className="text-sm text-muted-foreground">
              Here's what's happening with your squad today
            </p>
          </div>

          {/* Top Metrics Row - 4 Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <ExpandableMetricCard
              title="Total Pull Requests"
              value={24}
              change="+12% from last week"
              changeType="positive"
              icon={GitPullRequest}
              iconColor="text-accent"
              details={[
                { label: "Open PRs", value: "8" },
                { label: "In Review", value: "5" },
                { label: "Approved", value: "7" },
                { label: "Merged Today", value: "4" },
              ]}
            />

            <ExpandableMetricCard
              title="Commits"
              value={156}
              change="+8% from last week"
              changeType="positive"
              icon={GitCommit}
              iconColor="text-primary"
              details={[
                { label: "Today", value: "23" },
                { label: "This Week", value: "156" },
                { label: "Top Contributor", value: "Sarah" },
              ]}
            />

            <ExpandableMetricCard
              title="Reviews"
              value={42}
              change="-3% from last week"
              changeType="negative"
              icon={MessageSquare}
              iconColor="text-warning"
              details={[
                { label: "Pending", value: "8" },
                { label: "Completed", value: "34" },
                { label: "Avg Time", value: "4.2h" },
              ]}
            />

            <ExpandableMetricCard
              title="Uptime"
              value="99.8%"
              change="All systems go"
              changeType="positive"
              icon={Activity}
              iconColor="text-success"
              details={[
                { label: "Production", value: "100%" },
                { label: "Staging", value: "99.5%" },
                { label: "Last Incident", value: "12d ago" },
              ]}
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-1">
              <ActivityTimeline />
            </div>
            
            <div className="lg:col-span-1">
              <PullRequestsList />
            </div>
            
            <div className="lg:col-span-1 space-y-4">
              <WeeklyImpact />
              <CollaborationHeatmap />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
