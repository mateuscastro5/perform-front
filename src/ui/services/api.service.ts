import {
  AuthResponse,
  LoginDto,
  RegisterDto,
  UpdateProfileDto,
  User,
} from '../types/auth.types';
import type {
  DashboardMetrics,
  PRsResponse,
  TeamActivityResponse,
  ProductivityResponse,
} from '../types/dashboard.types';
import type {
  PrAnalysis,
  DeveloperEvolution,
  SquadXRay,
  SubmitFeedback,
  BatchAnalysisResult,
  DeveloperInsights,
  ClearMemoryResult,
} from '../types/analysis.types';

const API_URL = 'http://localhost:3000';

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new ApiError(
      error.message || 'An error occurred',
      response.status,
      error,
    );
  }
  return response.json();
}

function getAuthHeaders(token: string) {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

export const apiService = {
  async register(data: RegisterDto): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    return handleResponse<AuthResponse>(response);
  },

  async login(credentials: LoginDto): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    return handleResponse<AuthResponse>(response);
  },

  async getProfile(token: string): Promise<User> {
    const response = await fetch(`${API_URL}/auth/profile`, {
      method: 'GET',
      headers: getAuthHeaders(token),
    });

    return handleResponse<User>(response);
  },

  async updateProfile(token: string, data: UpdateProfileDto): Promise<User> {
    const response = await fetch(`${API_URL}/auth/profile`, {
      method: 'PATCH',
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    });

    return handleResponse<User>(response);
  },

  async getUsers(token: string): Promise<User[]> {
    const response = await fetch(`${API_URL}/users`, {
      method: 'GET',
      headers: getAuthHeaders(token),
    });

    return handleResponse<User[]>(response);
  },

  async getDashboardMetrics(token: string, userId?: string): Promise<DashboardMetrics> {
    const url = new URL(`${API_URL}/commits/metrics`);
    if (userId) url.searchParams.append('userId', userId);

    const commitsResponse = await fetch(url.toString(), {
      headers: getAuthHeaders(token),
    });
    const commitsMetrics = await handleResponse<{
      thisWeek: number;
      lastWeek: number;
      percentageChange: number;
    }>(commitsResponse);

    const prsUrl = new URL(`${API_URL}/pull-requests/metrics`);
    if (userId) prsUrl.searchParams.append('userId', userId);

    const prsResponse = await fetch(prsUrl.toString(), {
      headers: getAuthHeaders(token),
    });
    const prsMetrics = await handleResponse<{
      open: number;
      awaitingReview: number;
      mergedThisWeek: number;
    }>(prsResponse);

    return {
      commitsThisWeek: commitsMetrics.thisWeek,
      commitsLastWeek: commitsMetrics.lastWeek,
      commitsPercentageChange: commitsMetrics.percentageChange,
      openPRs: prsMetrics.open,
      awaitingReview: prsMetrics.awaitingReview,
      reviewsDone: 0,
      reviewsPending: 0,
      uptime: 100,
    };
  },

  async getPullRequests(
    token: string,
    options?: {
      status?: string;
      userId?: string;
      page?: number;
      limit?: number;
    },
  ): Promise<PRsResponse> {
    const url = new URL(`${API_URL}/pull-requests`);
    if (options?.status) url.searchParams.append('status', options.status);
    if (options?.userId) url.searchParams.append('userId', options.userId);
    if (options?.page) url.searchParams.append('page', options.page.toString());
    if (options?.limit) url.searchParams.append('limit', options.limit.toString());

    const response = await fetch(url.toString(), {
      headers: getAuthHeaders(token),
    });

    return handleResponse<PRsResponse>(response);
  },

  async getSquadActivity(token: string, squadId: string): Promise<TeamActivityResponse> {
    const response = await fetch(`${API_URL}/squads/${squadId}/members`, {
      headers: getAuthHeaders(token),
    });

    return handleResponse<TeamActivityResponse>(response);
  },

  async getWeeklyProductivity(token: string, userId?: string): Promise<ProductivityResponse> {
    const url = new URL(`${API_URL}/commits/weekly`);
    if (userId) url.searchParams.append('userId', userId);

    const response = await fetch(url.toString(), {
      headers: getAuthHeaders(token),
    });

    const weeklyData = await handleResponse<
      Array<{
        day: string;
        commits: number;
        linesAdded: number;
        linesDeleted: number;
      }>
    >(response);

    const now = new Date();
    const data = weeklyData.map((item, index) => ({
      day: item.day,
      date: new Date(now.getTime() - (6 - index) * 24 * 60 * 60 * 1000).toISOString(),
      commits: item.commits,
      prsMerged: 0,
      deploysToProduction: 0,
      codeReviews: 0,
    }));

    return {
      data,
      period: 'week',
      startDate: data[0]?.date || new Date().toISOString(),
      endDate: data[data.length - 1]?.date || new Date().toISOString(),
      userId,
    };
  },

  async getGithubDashboardStats(
    token: string,
    days = 30,
    repositoryId?: string,
  ): Promise<{
    commits: {
      total: number;
      thisWeek: number;
      lastWeek: number;
      percentageChange: number;
    };
    pullRequests: {
      total: number;
      open: number;
      closed: number;
      merged: number;
      awaitingReview: number;
    };
    reviews: {
      total: number;
      approved: number;
      changesRequested: number;
      pending: number;
    };
    period: {
      days: number;
      since: string;
    };
  }> {
    const url = new URL(`${API_URL}/github/analytics/dashboard`);
    url.searchParams.append('days', days.toString());
    if (repositoryId) url.searchParams.append('repositoryId', repositoryId);

    const response = await fetch(url.toString(), {
      headers: getAuthHeaders(token),
    });

    return handleResponse(response);
  },

  async getGithubWeeklyActivity(
    token: string,
    repositoryId?: string,
  ): Promise<{
    data: Array<{ day: string; commits: number; date: string }>;
    total: number;
    average: number;
  }> {
    const url = new URL(`${API_URL}/github/analytics/weekly-activity`);
    if (repositoryId) url.searchParams.append('repositoryId', repositoryId);

    const response = await fetch(url.toString(), {
      headers: getAuthHeaders(token),
    });

    return handleResponse(response);
  },

  async getGithubCollaboration(
    token: string,
    repositoryId?: string,
  ): Promise<{
    developers: Array<{
      id: string;
      name: string;
      githubUsername: string;
      avatarUrl: string | null;
    }>;
    interactions: Array<{ from: string; to: string; count: number }>;
    totalReviews: number;
  }> {
    const url = new URL(`${API_URL}/github/analytics/collaboration`);
    if (repositoryId) url.searchParams.append('repositoryId', repositoryId);

    const response = await fetch(url.toString(), {
      headers: getAuthHeaders(token),
    });

    return handleResponse(response);
  },

  async getGithubDevelopers(
    token: string,
    days = 30,
    repositoryId?: string,
  ): Promise<
    Array<{
      id: string;
      name: string;
      githubUsername: string;
      email: string;
      avatarUrl: string | null;
      stats: {
        commits: number;
        pullRequests: number;
        reviews: number;
        mergedPRs: number;
        period: { days: number; since: string };
      };
    }>
  > {
    const url = new URL(`${API_URL}/github/analytics/developers`);
    url.searchParams.append('days', days.toString());
    if (repositoryId) url.searchParams.append('repositoryId', repositoryId);

    const response = await fetch(url.toString(), {
      headers: getAuthHeaders(token),
    });

    return handleResponse(response);
  },

  async getGithubMonitoredRepositories(
    token: string,
  ): Promise<
    Array<{
      id: string;
      name: string;
      fullName: string;
      isActive: boolean;
    }>
  > {
    const response = await fetch(`${API_URL}/github/analytics/repositories`, {
      headers: getAuthHeaders(token),
    });

    return handleResponse(response);
  },

  /**
   * Returns the current GitHub integration status for the authenticated
   * user, including `lastSyncedAt` (ISO string or null) used by the
   * dashboard's "Synced N min ago" indicator.
   */
  async getGithubStatus(token: string): Promise<{
    connected: boolean;
    githubUsername?: string;
    dataRange?: number;
    lastSyncedAt?: string | null;
  }> {
    const response = await fetch(`${API_URL}/github/status`, {
      headers: getAuthHeaders(token),
    });
    return handleResponse(response);
  },

  async triggerGithubDataCollection(token: string): Promise<{
    success: boolean;
    message: string;
    summary?: {
      repositoriesTotal: number;
      repositoriesProcessed: number;
      commitsNew: number;
      prsCreated: number;
      prsUpdated: number;
      reviewsNew: number;
      errors: number;
      since: string;
      dataRangeMonths: number;
      durationMs: number;
    };
  }> {
    const response = await fetch(`${API_URL}/github/collect-data`, {
      method: 'POST',
      headers: getAuthHeaders(token),
    });

    return handleResponse(response);
  },

  async getGithubRecentActivity(
    token: string,
    repositoryId?: string,
    limit = 20,
  ): Promise<
    Array<{
      id: string;
      type: 'commit' | 'pull_request' | 'review';
      developer: {
        id: string | null;
        name: string;
        githubUsername: string | null;
        avatarUrl: string | null;
      };
      message: string;
      state?: string;
      reviewState?: string;
      timestamp: string;
      url: string;
    }>
  > {
    const url = new URL(`${API_URL}/github/analytics/recent-activity`);
    if (repositoryId) url.searchParams.append('repositoryId', repositoryId);
    url.searchParams.append('limit', limit.toString());

    const response = await fetch(url.toString(), {
      headers: getAuthHeaders(token),
    });

    return handleResponse(response);
  },

  async getGithubRecentPullRequests(
    token: string,
    repositoryId?: string,
    limit = 10,
  ): Promise<
    Array<{
      id: string;
      title: string;
      number: number;
      state: string;
      author: {
        id: string | null;
        name: string;
        avatar: string;
        login: string;
      };
      createdAt: string;
      updatedAt: string;
      closedAt: string | null;
      mergedAt: string | null;
      url: string;
      additions: number;
      deletions: number;
      changedFiles: number;
      commentsCount: number;
      reviewers: Array<{
        id: string | null;
        name: string;
        login: string;
        avatar: string;
        state: string;
        submittedAt: string;
      }>;
      reviewsCount: number;
      status: string;
    }>
  > {
    const url = new URL(`${API_URL}/github/analytics/recent-pull-requests`);
    if (repositoryId) url.searchParams.append('repositoryId', repositoryId);
    url.searchParams.append('limit', limit.toString());

    const response = await fetch(url.toString(), {
      headers: getAuthHeaders(token),
    });

    return handleResponse(response);
  },

  async getGithubTopReviewers(
    token: string,
    limit = 10,
  ): Promise<
    Array<{
      reviewer: {
        id: string | null;
        name: string;
        login: string;
        avatar: string;
      };
      stats: {
        prsReviewed: number;
        totalReviews: number;
        approved: number;
        changesRequested: number;
        commented: number;
      };
    }>
  > {
    const url = new URL(`${API_URL}/github/analytics/top-reviewers`);
    url.searchParams.append('limit', limit.toString());

    const response = await fetch(url.toString(), {
      headers: getAuthHeaders(token),
    });

    return handleResponse(response);
  },

  async getGithubDeveloperPRStatus(
    token: string,
  ): Promise<
    Array<{
      developer: {
        id: string;
        name: string;
        githubUsername: string;
        avatar: string;
        squad: {
          id: string;
          name: string;
        } | null;
      };
      prStatus: {
        total: number;
        open: number;
        merged: number;
        closed: number;
      };
    }>
  > {
    const response = await fetch(
      `${API_URL}/github/analytics/developer-pr-status`,
      {
        headers: getAuthHeaders(token),
      },
    );

    return handleResponse(response);
  },

  async getReviewerPullRequests(
    token: string,
    reviewerLogin: string,
  ): Promise<{
    approved: Array<any>;
    changesRequested: Array<any>;
    commented: Array<any>;
    pending: Array<any>;
  }> {
    const response = await fetch(
      `${API_URL}/github/analytics/reviewer/${reviewerLogin}/pull-requests`,
      {
        headers: getAuthHeaders(token),
      },
    );

    return handleResponse(response);
  },

  // Squads API
  async getSquads(token: string): Promise<any[]> {
    const response = await fetch(`${API_URL}/squads`, {
      headers: getAuthHeaders(token),
    });
    return handleResponse(response);
  },

  async createSquad(token: string, name: string): Promise<any> {
    const response = await fetch(`${API_URL}/squads`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify({ name }),
    });
    return handleResponse(response);
  },

  async updateSquad(token: string, id: string, payload: { name?: string }): Promise<any> {
    const response = await fetch(`${API_URL}/squads/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(token),
      body: JSON.stringify(payload),
    });
    return handleResponse(response);
  },

  async deleteSquad(token: string, id: string): Promise<any> {
    const response = await fetch(`${API_URL}/squads/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(token),
    });
    return handleResponse(response);
  },

  async updateDeveloperSquad(token: string, developerId: string, squadId: string | null): Promise<any> {
    const normalizedSquadId =
      typeof squadId === 'string' && squadId.trim().length > 0
        ? squadId
        : null;

    const response = await fetch(`${API_URL}/developers/${developerId}`, {
      method: 'PATCH',
      headers: getAuthHeaders(token),
      body: JSON.stringify({ squadId: normalizedSquadId }),
    });
    return handleResponse(response);
  },

  // AI Analysis API
  async triggerPrAnalysis(token: string, prId: string): Promise<PrAnalysis> {
    const response = await fetch(`${API_URL}/ai-analysis/trigger/${prId}`, {
      method: 'POST',
      headers: getAuthHeaders(token),
    });
    return handleResponse<PrAnalysis>(response);
  },

  async triggerBatchAnalysis(token: string, prIds: string[]): Promise<BatchAnalysisResult[]> {
    const response = await fetch(`${API_URL}/ai-analysis/trigger-batch`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify({ githubPullRequestIds: prIds }),
    });
    return handleResponse<BatchAnalysisResult[]>(response);
  },

  async getPrAnalysis(token: string, prId: string): Promise<PrAnalysis | null> {
    const response = await fetch(`${API_URL}/ai-analysis/pr/${prId}`, {
      headers: getAuthHeaders(token),
    });
    return handleResponse<PrAnalysis | null>(response);
  },

  async getDeveloperAnalyses(token: string, developerId: string, limit = 50): Promise<PrAnalysis[]> {
    const url = new URL(`${API_URL}/ai-analysis/developer/${developerId}`);
    url.searchParams.append('limit', limit.toString());
    const response = await fetch(url.toString(), {
      headers: getAuthHeaders(token),
    });
    return handleResponse<PrAnalysis[]>(response);
  },

  async getDeveloperEvolution(token: string, developerId: string, days = 90): Promise<DeveloperEvolution> {
    const url = new URL(`${API_URL}/ai-analysis/developer/${developerId}/evolution`);
    url.searchParams.append('days', days.toString());
    const response = await fetch(url.toString(), {
      headers: getAuthHeaders(token),
    });
    return handleResponse<DeveloperEvolution>(response);
  },

  async getSquadXRay(token: string, squadId: string, days = 30): Promise<SquadXRay> {
    const url = new URL(`${API_URL}/ai-analysis/squad/${squadId}/report`);
    url.searchParams.append('days', days.toString());
    const response = await fetch(url.toString(), {
      headers: getAuthHeaders(token),
    });
    return handleResponse<SquadXRay>(response);
  },

  async submitAnalysisFeedback(token: string, analysisId: string, feedback: SubmitFeedback): Promise<PrAnalysis> {
    const response = await fetch(`${API_URL}/ai-analysis/${analysisId}/feedback`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(feedback),
    });
    return handleResponse<PrAnalysis>(response);
  },

  async getDoubtfulAnalyses(token: string, limit = 50): Promise<PrAnalysis[]> {
    const url = new URL(`${API_URL}/ai-analysis/doubtful`);
    url.searchParams.append('limit', limit.toString());
    const response = await fetch(url.toString(), {
      headers: getAuthHeaders(token),
    });
    return handleResponse<PrAnalysis[]>(response);
  },

  async getDeveloperInsights(
    token: string,
    developerId: string,
    refresh = false,
  ): Promise<DeveloperInsights> {
    const url = new URL(`${API_URL}/ai-analysis/developer/${developerId}/insights`);
    if (refresh) url.searchParams.append('refresh', 'true');
    const response = await fetch(url.toString(), {
      headers: getAuthHeaders(token),
    });
    return handleResponse<DeveloperInsights>(response);
  },

  async clearDeveloperMemory(
    token: string,
    developerId: string,
  ): Promise<ClearMemoryResult> {
    const response = await fetch(
      `${API_URL}/ai-analysis/developer/${developerId}/memory`,
      {
        method: 'DELETE',
        headers: getAuthHeaders(token),
      },
    );
    return handleResponse<ClearMemoryResult>(response);
  },

  async getUnanalyzedCommits(
    token: string,
    developerId: string,
    limit = 20,
  ): Promise<{ id: string; sha: string; message: string }[]> {
    const url = new URL(`${API_URL}/ai-analysis/developer/${developerId}/unanalyzed-commits`);
    url.searchParams.append('limit', String(limit));
    const response = await fetch(url.toString(), { headers: getAuthHeaders(token) });
    return handleResponse(response);
  },

  async triggerCommitsBatch(
    token: string,
    githubCommitIds: string[],
  ): Promise<{ status: string; queued: number; message: string }> {
    const response = await fetch(`${API_URL}/ai-analysis/trigger-commits-batch`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify({ githubCommitIds }),
    });
    return handleResponse(response);
  },
};

export { ApiError };
