const API_URL = 'http://localhost:3000';
const TOKEN_KEY = 'perform_token';

function getAuthHeaders() {
  const token = localStorage.getItem(TOKEN_KEY);
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

interface Repository {
  id: number;
  name: string;
  fullName: string;
  private: boolean;
  description?: string;
}

interface GitHubStatus {
  connected: boolean;
  githubUsername?: string;
  repositories?: Repository[];
  selectedRepos?: number[];
  dataRange?: number;
}

interface GitHubConfiguration {
  repositories: number[];
  dataRange: number;
}

interface ConnectResponse {
  success: boolean;
  message: string;
  username: string;
}

export const githubService = {
  async getStatus(): Promise<GitHubStatus> {
    return apiRequest<GitHubStatus>('/github/status');
  },

  async connectWithToken(token: string): Promise<ConnectResponse> {
    return apiRequest<ConnectResponse>('/github/connect', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  },

  async listRepositories(): Promise<Repository[]> {
    return apiRequest<Repository[]>('/github/repositories');
  },

  async saveConfiguration(config: GitHubConfiguration): Promise<{ success: boolean; message: string }> {
    return apiRequest<{ success: boolean; message: string }>('/github/configure', {
      method: 'POST',
      body: JSON.stringify(config),
    });
  },

  async disconnect(): Promise<{ success: boolean }> {
    return apiRequest<{ success: boolean }>('/github/disconnect', {
      method: 'DELETE',
    });
  },
};
