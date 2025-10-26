import api from './api.service';

interface Repository {
  id: number;
  name: string;
  fullName: string;
  private: boolean;
  description?: string;
}

interface GitHubStatus {
  connected: boolean;
  repositories?: Repository[];
  selectedRepos?: number[];
  dataRange?: number;
}

interface GitHubConfiguration {
  repositories: number[];
  dataRange: number;
}

export const githubService = {
  async checkConnection(): Promise<GitHubStatus> {
    const response = await api.get('/github/status');
    return response.data;
  },

  async getOAuthUrl(): Promise<{ url: string }> {
    const response = await api.get('/github/oauth-url');
    return response.data;
  },

  async handleOAuthCallback(code: string): Promise<{ success: boolean; token?: string }> {
    const response = await api.post('/github/oauth-callback', { code });
    return response.data;
  },

  async listRepositories(): Promise<Repository[]> {
    const response = await api.get('/github/repositories');
    return response.data;
  },

  async saveConfiguration(config: GitHubConfiguration): Promise<{ success: boolean; message: string }> {
    const response = await api.post('/github/configure', config);
    return response.data;
  },

  async disconnect(): Promise<{ success: boolean }> {
    const response = await api.delete('/github/disconnect');
    return response.data;
  },

  async syncData(): Promise<{ success: boolean; message: string }> {
    const response = await api.post('/github/sync');
    return response.data;
  },

  async getConfiguration(): Promise<GitHubConfiguration> {
    const response = await api.get('/github/configuration');
    return response.data;
  },
};
