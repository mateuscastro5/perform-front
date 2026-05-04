import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  type ReactNode,
} from 'react';
import { apiService } from '../services/api.service';
import { useAuth } from './AuthContext';
import { useProgressToast } from '../hooks/useProgressToast';
import { useNotificationStore } from '../stores/notificationStore';
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
  /** ISO timestamp of the last successful GitHub data collection; null when never synced. */
  lastSyncedAt: string | null;
  /** True while a manual or background sync is currently running. */
  isSyncing: boolean;
}

const DashboardContext = createContext<DashboardContextType | null>(null);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const { token, user } = useAuth();
  const toast = useProgressToast();
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
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  /** Tracks whether the auto-on-login sync has fired this session, so we don't re-run on every re-render. */
  const autoSyncFiredRef = useRef(false);

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
          recentPRs,
          githubStatus,
        ] = await Promise.all([
          apiService.getGithubDashboardStats(token, 30, selectedRepository ?? undefined),
          apiService.getGithubWeeklyActivity(token, selectedRepository ?? undefined),
          apiService.getGithubDevelopers(token, 30, selectedRepository ?? undefined),
          apiService.getGithubCollaboration(token, selectedRepository ?? undefined),
          apiService.getGithubRecentPullRequests(token, selectedRepository ?? undefined, 6),
          apiService.getGithubStatus(token).catch(() => null),
        ]);

        if (githubStatus?.lastSyncedAt !== undefined) {
          setLastSyncedAt(githubStatus.lastSyncedAt);
        }

        setGithubStats(githubDashboard);
        setGithubWeeklyActivity(weeklyActivity);
        setGithubDevelopers(developers);
        setGithubCollaboration(collaboration);

        // Set PRs from GitHub
        setPullRequests({
          prs: recentPRs.map((pr) => ({
            id: pr.number,
            title: pr.title,
            author: {
              id: pr.author.id ?? pr.author.login,
              name: pr.author.name,
              avatar: pr.author.avatar,
            },
            status: (pr.status as 'draft' | 'review_requested' | 'approved' | 'changes_requested' | 'merged') ?? 'review_requested',
            createdAt: pr.createdAt,
            updatedAt: pr.updatedAt,
            branch: 'unknown',
            targetBranch: 'main',
            additions: pr.additions,
            deletions: pr.deletions,
            reviewers: pr.reviewers.map((reviewer) => ({
              id: reviewer.id ?? reviewer.login,
              name: reviewer.name,
              avatar: reviewer.avatar,
              status:
                reviewer.state === 'APPROVED'
                  ? 'approved'
                  : reviewer.state === 'CHANGES_REQUESTED'
                    ? 'changes_requested'
                    : 'pending',
              state: reviewer.state,
            })),
            url: pr.url,
            closedAt: pr.closedAt,
            mergedAt: pr.mergedAt,
          })),
          total: githubDashboard.pullRequests.total,
          page: 1,
          limit: 6,
          totalPages: Math.ceil(githubDashboard.pullRequests.total / 6),
        });

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
            Promise.resolve(null),
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
    const toastId = toast.showLoading(
      'Refreshing dashboard...',
      'Fetching latest data from GitHub'
    );

    try {
      await fetchDashboardData();
      toast.completeWithSuccess(
        toastId,
        'Dashboard refreshed!',
        'All data has been updated successfully'
      );
    } catch (err) {
      toast.completeWithError(
        toastId,
        'Failed to refresh',
        err instanceof Error ? err.message : 'An error occurred while refreshing'
      );
    }
  };

  const triggerDataCollection = async () => {
    if (!token) return;

    const notif = useNotificationStore.getState();

    // ── Pre-flight: ensure GitHub is connected before hitting the API.
    // This avoids a confusing 4xx and gives the user an actionable CTA.
    if (!isGithubConnected) {
      const id = notif.add({
        category: 'sync',
        status: 'error',
        title: 'GitHub not connected',
        description:
          'Connect your GitHub account in Settings before syncing engineering data.',
        action: { label: 'Connect GitHub', href: '/settings' },
      });
      toast.showError(
        'GitHub not connected',
        'Open Settings to connect your account before syncing.',
      );
      // Auto-clear the bell entry after a while if the user ignores it
      setTimeout(() => useNotificationStore.getState().remove(id), 60_000);
      return;
    }

    setIsSyncing(true);
    const toastId = toast.showLoading(
      'Collecting GitHub data...',
      'This may take a few moments',
    );
    const notifId = notif.add({
      category: 'sync',
      status: 'in_progress',
      title: 'Syncing GitHub data',
      description: 'Pulling commits, pull requests and reviews…',
      progress: 10,
    });

    try {
      toast.updateProgress(toastId, 20);
      notif.update(notifId, { progress: 25 });

      const result = await apiService.triggerGithubDataCollection(token);

      toast.updateProgress(toastId, 70);
      notif.update(notifId, { progress: 75 });
      await fetchDashboardData();
      toast.updateProgress(toastId, 95);

      const summary = result.summary;
      const durationSeconds = summary
        ? Math.max(summary.durationMs / 1000, 0.1).toFixed(1)
        : null;

      const summaryDescription = summary
        ? `${summary.repositoriesProcessed}/${summary.repositoriesTotal} repos · +${summary.commitsNew} commits · PRs ${summary.prsCreated} new / ${summary.prsUpdated} updated · ${summary.reviewsNew} reviews · ${durationSeconds}s${summary.errors > 0 ? ` · ${summary.errors} repo errors` : ''}`
        : 'GitHub data has been successfully collected and updated';

      toast.completeWithSuccess(
        toastId,
        'Sync complete',
        summaryDescription,
      );
      notif.update(notifId, {
        status: 'success',
        title: 'Sync complete',
        description: summaryDescription,
        progress: 100,
      });
    } catch (err) {
      const rawMessage =
        err instanceof Error ? err.message : 'Failed to trigger data collection';

      // Classify the error so we can route the user to the right place.
      const lower = rawMessage.toLowerCase();
      const isAuth =
        lower.includes('401') ||
        lower.includes('unauthor') ||
        lower.includes('token') ||
        lower.includes('credentials') ||
        lower.includes('not connected');
      const isRateLimit =
        lower.includes('rate limit') || lower.includes('429');
      const isNetwork =
        lower.includes('failed to fetch') ||
        lower.includes('network') ||
        lower.includes('econnrefused');

      let title = 'Sync failed';
      let description = rawMessage;
      let action: { label: string; href: string } | undefined;

      if (isAuth) {
        title = 'GitHub credentials expired';
        description =
          'Your GitHub token is invalid or no longer authorized. Reconnect in Settings to keep syncing.';
        action = { label: 'Reconnect GitHub', href: '/settings' };
      } else if (isRateLimit) {
        title = 'GitHub rate limit hit';
        description =
          "GitHub temporarily blocked further requests. Try again in a few minutes — your previous data is still safe.";
      } else if (isNetwork) {
        title = 'Cannot reach the server';
        description =
          'The Artemis API is unreachable. Check that the backend is running and try again.';
      }

      toast.completeWithError(toastId, title, description);
      notif.update(notifId, {
        status: 'error',
        title,
        description,
        progress: 100,
        action,
      });
      throw err;
    } finally {
      setIsSyncing(false);
    }
  };

  /**
   * Auto-sync on login (Strategy D).
   * Fires once per session, after the first dashboard load completes,
   * and only when:
   *   - GitHub is connected
   *   - The data hasn't been synced in the last 5 minutes
   *
   * Runs in the background (no toast, no spinner) so it doesn't disrupt
   * the user's first impression of the dashboard.
   */
  useEffect(() => {
    if (autoSyncFiredRef.current) return;
    if (!token || !user) return;
    if (isLoading) return;
    if (!isGithubConnected) return;

    const FRESHNESS_WINDOW_MS = 5 * 60 * 1000; // 5 min
    const last = lastSyncedAt ? new Date(lastSyncedAt).getTime() : 0;
    const stale = Date.now() - last > FRESHNESS_WINDOW_MS;
    if (!stale) {
      autoSyncFiredRef.current = true;
      return;
    }

    autoSyncFiredRef.current = true;
    setIsSyncing(true);

    const notif = useNotificationStore.getState();
    const notifId = notif.add({
      category: 'sync',
      status: 'in_progress',
      title: 'Refreshing data',
      description: 'Pulling the latest GitHub activity in the background…',
      progress: 30,
    });

    apiService
      .triggerGithubDataCollection(token)
      .then(async () => {
        notif.update(notifId, { progress: 80 });
        await fetchDashboardData();
        notif.update(notifId, {
          status: 'success',
          title: 'Up to date',
          description: 'Latest GitHub activity has been loaded.',
          progress: 100,
        });
        // Auto-clear the silent success after a few seconds — it's not noisy.
        setTimeout(
          () => useNotificationStore.getState().remove(notifId),
          6_000,
        );
      })
      .catch((err) => {
        console.warn('Background sync on login failed:', err);
        const rawMessage =
          err instanceof Error ? err.message : 'Background sync failed';
        const lower = rawMessage.toLowerCase();
        const isAuth =
          lower.includes('401') ||
          lower.includes('unauthor') ||
          lower.includes('token') ||
          lower.includes('credentials');

        notif.update(notifId, {
          status: 'error',
          title: isAuth
            ? 'GitHub credentials expired'
            : 'Background sync failed',
          description: isAuth
            ? 'Reconnect your GitHub account in Settings to keep data fresh.'
            : rawMessage,
          progress: 100,
          action: isAuth
            ? { label: 'Reconnect GitHub', href: '/settings' }
            : undefined,
        });
      })
      .finally(() => setIsSyncing(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, user, isLoading, isGithubConnected, lastSyncedAt]);

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
    lastSyncedAt,
    isSyncing,
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
