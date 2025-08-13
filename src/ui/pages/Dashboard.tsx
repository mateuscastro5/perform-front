import UserProfileCard from '../components/dashboard/UserProfileCard';
import MetricCard from '../components/dashboard/MetricCard';
import TeamActivityPanel from '../components/dashboard/CommitsPanel';
import ImpactChart from '../components/dashboard/ProductivityChart';
import PRsPanel from '../components/dashboard/PRsPanel';

const Dashboard = () => {
  const handleMetricClick = (metric: string) => {
    console.log('Metric clicked:', metric);
  };

  return (
    <div className="flex-1 p-6 overflow-auto scroll-container">
      <div className="mb-8">
        <UserProfileCard />

        <div className="grid grid-cols-4 gap-6">
          <MetricCard
            value={47}
            label="Commits this week"
            subtitle="+12% vs last week"
            color="blue"
            onClick={() => handleMetricClick('commits')}
          />
          <MetricCard
            value={12}
            label="Open PRs"
            subtitle="3 awaiting review"
            color="yellow"
            onClick={() => handleMetricClick('prs')}
          />
          <MetricCard
            value={8}
            label="Reviews done"
            subtitle="2 pending"
            color="green"
            onClick={() => handleMetricClick('reviews')}
          />
          <MetricCard
            value="95%"
            label="Uptime"
            subtitle="Excellent ✨"
            color="purple"
            onClick={() => handleMetricClick('uptime')}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="space-y-6">
          <TeamActivityPanel />
          <ImpactChart />
        </div>
        <div className="col-span-2">
          <PRsPanel />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
