export type DifficultyLabel = 'trivial' | 'easy' | 'medium' | 'hard' | 'expert';

export interface PrAnalysis {
  id: string;
  githubPullRequestId: string;
  developerId: string | null;
  complexityScore: number;
  confidence: number;
  difficultyLabel: DifficultyLabel;
  justification: string;
  technicalSummary: string;
  technologies: string;
  changeType: string;
  status: 'pending' | 'confirmed' | 'corrected' | 'doubtful';
  correctedScore: number | null;
  correctedLabel: string | null;
  correctedBy: string | null;
  correctedAt: string | null;
  feedbackNote: string | null;
  processingTimeMs: number;
  similarExamplesUsed: string;
  createdAt: string;
  updatedAt: string;
  githubPullRequest?: {
    id: string;
    title: string;
    prNumber: number;
    authorLogin: string;
    state: string;
    htmlUrl: string;
    additions: number;
    deletions: number;
    changedFiles: number;
  };
  developer?: {
    id: string;
    name: string;
    githubUsername: string;
  } | null;
}

export interface DeveloperEvolution {
  periods: {
    date: string;
    avgComplexity: number;
    prCount: number;
    maxComplexity: number;
  }[];
  trend: 'improving' | 'stable' | 'declining';
}

export interface SquadXRay {
  developers: {
    id: string;
    name: string;
    avgComplexity: number;
    prCount: number;
    trend: string;
  }[];
  totalComplexityAbsorbed: number;
  avgTeamComplexity: number;
}

export interface SubmitFeedback {
  correctedScore: number;
  correctedLabel: DifficultyLabel;
  feedbackNote?: string;
}

export interface BatchAnalysisResult {
  prId: string;
  status: 'success' | 'error';
  analysis?: PrAnalysis;
  error?: string;
}
