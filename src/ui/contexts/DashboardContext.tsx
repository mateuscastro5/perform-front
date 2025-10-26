import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { apiService } from '../services/api.service';
import { useAuth } from './AuthContext';
import type {
  DashboardMetrics,
  PRsResponse,
  TeamActivityResponse,
  ProductivityResponse,
} from '../types/dashboard.types';

interface DashboardContextType {
  metrics: DashboardMetrics | null;
  pullRequests: PRsResponse | null;
  teamActivity: TeamActivityResponse | null;
  productivity: ProductivityResponse | null;
  isLoading: boolean;
  error: string | null;
  refreshDashboard: () => Promise<void>;
}

const DashboardContext = createContext<DashboardContextType | null>(null);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const { token, user } = useAuth();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [pullRequests, setPullRequests] = useState<PRsResponse | null>(null);
  const [teamActivity, setTeamActivity] = useState<TeamActivityResponse | null>(null);
  const [productivity, setProductivity] = useState<ProductivityResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    if (!token || !user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const [metricsData, prsData, productivityData, activityData] = await Promise.all([
        apiService.getDashboardMetrics(token, user.id),
        apiService.getPullRequests(token, { page: 1, limit: 6 }),
        apiService.getWeeklyProductivity(token, user.id),
        user.squad?.id
          ? apiService.getSquadActivity(token, user.squad.id)
          : Promise.resolve(null),
      ]);

      setMetrics(metricsData);
      setPullRequests(prsData);
      setProductivity(productivityData);
      setTeamActivity(activityData);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [token, user?.id]);

  const refreshDashboard = async () => {
    await fetchDashboardData();
  };

  const value: DashboardContextType = {
    metrics,
    pullRequests,
    teamActivity,
    productivity,
    isLoading,
    error,
    refreshDashboard,
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}
