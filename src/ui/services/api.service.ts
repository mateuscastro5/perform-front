import { AuthResponse, LoginDto, RegisterDto, User } from '../types/auth.types';
import type {
  DashboardMetrics,
  PRsResponse,
  TeamActivityResponse,
  ProductivityResponse,
} from '../types/dashboard.types';

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
};

export { ApiError };
