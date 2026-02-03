import UserProfileCard from '../components/dashboard/UserProfileCard';
import MetricCard from '../components/dashboard/MetricCard';
import TeamActivityPanel from '../components/dashboard/CommitsPanel';
import ImpactChart from '../components/dashboard/ProductivityChart';
import PRsPanel from '../components/dashboard/PRsPanel';
import { useDashboard } from '../contexts/DashboardContext';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const { metrics, pullRequests, teamActivity, productivity, isLoading, error } = useDashboard();
  const { user } = useAuth();

  const handleMetricClick = (metric: string) => {
    console.log('Metric clicked:', metric);
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <svg 
            className="animate-spin h-12 w-12 text-blue-500 mx-auto mb-4" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
          >
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
            ></circle>
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p className="text-alpha-text-muted">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">Failed to load dashboard</p>
          <p className="text-alpha-text-muted text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 overflow-auto scroll-container">
      <div className="mb-8">
        <UserProfileCard 
          userName={user?.name}
          userRole={user?.role}
        />

        <div className="grid grid-cols-4 gap-6">
          <MetricCard
            value={metrics?.commitsThisWeek || 0}
            label="Commits this week"
            subtitle={`${metrics?.commitsPercentageChange || 0 > 0 ? '+' : ''}${metrics?.commitsPercentageChange || 0}% vs last week`}
            color="blue"
            onClick={() => handleMetricClick('commits')}
          />
          <MetricCard
            value={metrics?.openPRs || 0}
            label="Open PRs"
            subtitle={`${metrics?.awaitingReview || 0} awaiting review`}
            color="yellow"
            onClick={() => handleMetricClick('prs')}
          />
          <MetricCard
            value={metrics?.reviewsDone || 0}
            label="Reviews done"
            subtitle={`${metrics?.reviewsPending || 0} pending`}
            color="green"
            onClick={() => handleMetricClick('reviews')}
          />
          <MetricCard
            value={`${metrics?.uptime || 0}%`}
            label="Uptime"
            subtitle={metrics?.uptime === 100 ? "Excellent ✨" : "Good"}
            color="purple"
            onClick={() => handleMetricClick('uptime')}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="space-y-6">
          <TeamActivityPanel members={teamActivity?.members} />
          <ImpactChart data={productivity?.data} />
        </div>
        <div className="col-span-2">
          <PRsPanel pullRequests={pullRequests?.prs} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
