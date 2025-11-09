import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react';
import { apiService } from '../services/api.service';
import { useAuth } from './AuthContext';
import type {
  DashboardMetrics,
  PRsResponse,
  TeamActivityResponse,
  ProductivityResponse,
} from '../types/dashboard.types';
import type {
  GithubRepository,
  GithubDashboardStats,
  GithubWeeklyActivity,
  GithubDeveloper,
  GithubCollaboration,
} from '../types/github.types';

interface DashboardContextType {
  metrics: DashboardMetrics | null;
  pullRequests: PRsResponse | null;
  teamActivity: TeamActivityResponse | null;
  productivity: ProductivityResponse | null;
  isLoading: boolean;
  error: string | null;
  refreshDashboard: () => Promise<void>;
  // GitHub Analytics
  githubStats: GithubDashboardStats | null;
  githubWeeklyActivity: GithubWeeklyActivity | null;
  githubDevelopers: GithubDeveloper[];
  githubCollaboration: GithubCollaboration | null;
  repositories: GithubRepository[];
  selectedRepository: string | null;
  setSelectedRepository: (repoId: string | null) => void;
  isGithubConnected: boolean;
  triggerDataCollection: () => Promise<void>;
}

const DashboardContext = createContext<DashboardContextType | null>(null);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const { token, user } = useAuth();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [pullRequests, setPullRequests] = useState<PRsResponse | null>(null);
  const [teamActivity, setTeamActivity] = useState<TeamActivityResponse | null>(
    null,
  );
  const [productivity, setProductivity] = useState<ProductivityResponse | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [githubStats, setGithubStats] = useState<GithubDashboardStats | null>(
    null,
  );
  const [githubWeeklyActivity, setGithubWeeklyActivity] =
    useState<GithubWeeklyActivity | null>(null);
  const [githubDevelopers, setGithubDevelopers] = useState<GithubDeveloper[]>(
    [],
  );
  const [githubCollaboration, setGithubCollaboration] =
    useState<GithubCollaboration | null>(null);
  const [repositories, setRepositories] = useState<GithubRepository[]>([]);
  const [selectedRepository, setSelectedRepository] = useState<string | null>(
    null,
  );
  const [isGithubConnected, setIsGithubConnected] = useState(false);

  const fetchDashboardData = async () => {
    if (!token || !user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      let repos: GithubRepository[] = [];
      let githubConnected = false;

      try {
        repos = await apiService.getGithubMonitoredRepositories(token);
        githubConnected = repos.length > 0;
        setRepositories(repos);
        setIsGithubConnected(githubConnected);
      } catch (err) {
        console.log('GitHub não conectado ou sem repositórios');
        githubConnected = false;
      }

      if (githubConnected) {
        const [
          githubDashboard,
          weeklyActivity,
          developers,
          collaboration,
        ] = await Promise.all([
          apiService.getGithubDashboardStats(token, 30, selectedRepository ?? undefined),
          apiService.getGithubWeeklyActivity(token, selectedRepository ?? undefined),
          apiService.getGithubDevelopers(token, 30, selectedRepository ?? undefined),
          apiService.getGithubCollaboration(token, selectedRepository ?? undefined),
        ]);

        setGithubStats(githubDashboard);
        setGithubWeeklyActivity(weeklyActivity);
        setGithubDevelopers(developers);
        setGithubCollaboration(collaboration);

        setMetrics({
          commitsThisWeek: githubDashboard.commits.thisWeek,
          commitsLastWeek: githubDashboard.commits.lastWeek,
          commitsPercentageChange: githubDashboard.commits.percentageChange,
          openPRs: githubDashboard.pullRequests.open,
          awaitingReview: githubDashboard.pullRequests.awaitingReview,
          reviewsDone: githubDashboard.reviews.approved,
          reviewsPending: githubDashboard.reviews.pending,
          uptime: 100,
        });

        setProductivity({
          data: weeklyActivity.data.map((day) => ({
            day: day.day,
            date: day.date,
            commits: day.commits,
            prsMerged: 0, // GitHub não separa isso no weekly
            deploysToProduction: 0,
            codeReviews: 0,
          })),
          period: 'week',
          startDate: weeklyActivity.data[0]?.date || new Date().toISOString(),
          endDate:
            weeklyActivity.data[weeklyActivity.data.length - 1]?.date ||
            new Date().toISOString(),
          userId: user.id,
        });
      } else {
        const [metricsData, prsData, productivityData, activityData] =
          await Promise.all([
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
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to load dashboard data',
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [token, user?.id, selectedRepository]);

  const refreshDashboard = async () => {
    await fetchDashboardData();
  };

  const triggerDataCollection = async () => {
    if (!token) return;
    try {
      await apiService.triggerGithubDataCollection(token);
      setTimeout(() => {
        fetchDashboardData();
      }, 2000);
    } catch (err) {
      console.error('Failed to trigger data collection:', err);
      throw err;
    }
  };

  const value: DashboardContextType = {
    metrics,
    pullRequests,
    teamActivity,
    productivity,
    isLoading,
    error,
    refreshDashboard,
    githubStats,
    githubWeeklyActivity,
    githubDevelopers,
    githubCollaboration,
    repositories,
    selectedRepository,
    setSelectedRepository,
    isGithubConnected,
    triggerDataCollection,
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
