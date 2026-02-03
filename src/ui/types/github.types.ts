// GitHub Repository Filter Types
export interface GithubRepository {
  id: string;
  name: string;
  fullName: string;
  isActive: boolean;
}

// GitHub Analytics Types
export interface GithubDashboardStats {
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
}

export interface GithubWeeklyActivity {
  data: Array<{ day: string; commits: number; date: string }>;
  total: number;
  average: number;
}

export interface GithubDeveloper {
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
}

export interface GithubCollaboration {
  developers: Array<{
    id: string;
    name: string;
    githubUsername: string;
    avatarUrl: string | null;
  }>;
  interactions: Array<{ from: string; to: string; count: number }>;
  totalReviews: number;
}
