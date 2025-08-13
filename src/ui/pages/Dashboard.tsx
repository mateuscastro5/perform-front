import { motion } from 'motion/react';
import UserProfileCard from '../components/dashboard/UserProfileCard';
import { MetricCard } from '../components/ui/MetricCard';
import TeamActivityPanel from '../components/dashboard/CommitsPanel';
import ImpactChart from '../components/dashboard/ProductivityChart';
import PRsPanel from '../components/dashboard/PRsPanel';
import { animations } from '../lib/design-system';

const Dashboard = () => {
  const handleMetricClick = (metric: string) => {
    console.log('Metric clicked:', metric);
  };

  return (
    <div className="flex-1 p-6 overflow-auto scroll-container">
      <motion.div 
        className="mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <UserProfileCard />

        <motion.div 
          className="grid grid-cols-4 gap-6"
          variants={animations.staggerContainer}
          initial="initial"
          animate="animate"
        >
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
        </motion.div>
      </motion.div>

      <motion.div 
        className="grid grid-cols-3 gap-6 h-[500px] mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <div className="flex flex-col gap-4 h-full">
          <TeamActivityPanel />
          <ImpactChart />
        </div>
        <div className="col-span-2">
          <PRsPanel />
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
