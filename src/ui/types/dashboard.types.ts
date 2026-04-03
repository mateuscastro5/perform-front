// Dashboard Metrics Types
export interface DashboardMetrics {
  commitsThisWeek: number;
  commitsLastWeek: number;
  commitsPercentageChange: number;
  openPRs: number;
  awaitingReview: number;
  reviewsDone: number;
  reviewsPending: number;
  uptime: number;
}

export type PRStatus = 'draft' | 'review_requested' | 'approved' | 'changes_requested' | 'merged';
export type ReviewerStatus = 'approved' | 'pending' | 'changes_requested';

export interface PRReviewer {
  id: string;
  name: string;
  avatar?: string;
  status: ReviewerStatus;
  state?: string;
}

export interface PRAuthor {
  id: string;
  name: string;
  avatar?: string;
}

export interface PullRequest {
  id: number | string;
  title: string;
  author: PRAuthor;
  status: PRStatus;
  createdAt: string;
  updatedAt: string;
  branch?: string;
  targetBranch?: string;
  additions: number;
  deletions: number;
  reviewers: PRReviewer[];
  url?: string;
  closedAt?: string | null;
  mergedAt?: string | null;
  description?: string;
  labels?: string[];
}

export interface PRsResponse {
  prs: PullRequest[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type TeamMemberStatus = 'active' | 'away' | 'coding';

export interface TeamMember {
  id: string;
  name: string;
  avatar?: string;
  status: TeamMemberStatus;
  lastActivity: string;
  currentTask?: string;
  role?: string;
}

export interface TeamActivityResponse {
  members: TeamMember[];
  total: number;
  activeCount: number;
  codingCount: number;
  awayCount: number;
}

export interface ProductivityDataPoint {
  day: string;
  date: string;
  commits: number;
  prsMerged: number;
  deploysToProduction: number;
  codeReviews: number;
}

export interface ProductivityResponse {
  data: ProductivityDataPoint[];
  period: 'week' | 'month';
  startDate: string;
  endDate: string;
  userId?: string;
}

export interface DashboardData {
  metrics: DashboardMetrics;
  prs: PRsResponse;
  teamActivity: TeamActivityResponse;
  productivity: ProductivityResponse;
}
