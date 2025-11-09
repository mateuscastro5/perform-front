import { useState } from "react";
import { DashboardHeader } from "@/ui/components/DashboardHeader";
import { ExpandableMetricCard } from "@/ui/components/ExpandableMetricCard";
import { CollaborationHeatmap } from "@/ui/components/CollaborationHeatmap";
import { ActivityTimeline } from "@/ui/components/ActivityTimeline";
import { PullRequestsList } from "@/ui/components/PullRequestsList";
import { WeeklyImpact } from "@/ui/components/WeeklyImpact";
import { GitPullRequest, GitCommit, MessageSquare, Activity } from "lucide-react";
import { useDashboard } from "@/ui/contexts/DashboardContext";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("home");
  const { githubStats, githubDevelopers, isLoading } = useDashboard();

  const totalPRs = githubStats?.pullRequests.total || 0;
  const openPRs = githubStats?.pullRequests.open || 0;
  const closedPRs = githubStats?.pullRequests.closed || 0;
  const mergedPRs = githubStats?.pullRequests.merged || 0;
  const awaitingReview = githubStats?.pullRequests.awaitingReview || 0;
  
  const totalCommits = githubStats?.commits.total || 0;
  const commitsThisWeek = githubStats?.commits.thisWeek || 0;
  const commitsLastWeek = githubStats?.commits.lastWeek || 0;
  const commitsChange = githubStats?.commits.percentageChange || 0;
  
  const totalReviews = githubStats?.reviews.total || 0;
  const approvedReviews = githubStats?.reviews.approved || 0;
  const changesRequested = githubStats?.reviews.changesRequested || 0;
  const pendingReviews = githubStats?.reviews.pending || 0;
  
  const activeDevelopers = githubDevelopers?.length || 0;

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
              value={isLoading ? "..." : totalPRs}
              change={isLoading ? "Loading..." : `${totalPRs > 0 ? 'Active PRs' : 'No active PRs'}`}
              changeType="positive"
              icon={GitPullRequest}
              iconColor="text-accent"
              details={[
                { label: "Open PRs", value: isLoading ? "..." : String(openPRs) },
                { label: "Awaiting Review", value: isLoading ? "..." : String(awaitingReview) },
                { label: "Merged", value: isLoading ? "..." : String(mergedPRs) },
                { label: "Closed", value: isLoading ? "..." : String(closedPRs) },
              ]}
            />

            <ExpandableMetricCard
              title="Commits"
              value={isLoading ? "..." : totalCommits}
              change={isLoading ? "Loading..." : `${commitsChange >= 0 ? '+' : ''}${commitsChange.toFixed(1)}% from last week`}
              changeType={commitsChange >= 0 ? "positive" : "negative"}
              icon={GitCommit}
              iconColor="text-primary"
              details={[
                { label: "This Week", value: isLoading ? "..." : String(commitsThisWeek) },
                { label: "Last Week", value: isLoading ? "..." : String(commitsLastWeek) },
                { label: "Avg/Day", value: isLoading ? "..." : String(Math.round(commitsThisWeek / 7)) },
              ]}
            />

            <ExpandableMetricCard
              title="Reviews"
              value={isLoading ? "..." : totalReviews}
              change={isLoading ? "Loading..." : `${approvedReviews} approved`}
              changeType="positive"
              icon={MessageSquare}
              iconColor="text-warning"
              details={[
                { label: "Pending", value: isLoading ? "..." : String(pendingReviews) },
                { label: "Approved", value: isLoading ? "..." : String(approvedReviews) },
                { label: "Changes Req.", value: isLoading ? "..." : String(changesRequested) },
              ]}
            />

            <ExpandableMetricCard
              title="Active Developers"
              value={isLoading ? "..." : activeDevelopers}
              change="Contributing this week"
              changeType="positive"
              icon={Activity}
              iconColor="text-success"
              details={[
                { label: "Total Devs", value: isLoading ? "..." : String(activeDevelopers) },
                { label: "Active", value: isLoading ? "..." : String(activeDevelopers) },
                { label: "Engagement", value: isLoading ? "..." : activeDevelopers > 0 ? "100%" : "0%" },
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
