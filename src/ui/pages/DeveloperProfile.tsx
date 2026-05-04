import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Github,
  Mail,
  Calendar,
  GitCommitHorizontal,
  GitCommit,
  GitPullRequest,
  GitMerge,
  Eye,
  BrainCircuit,
  Zap,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Clock,
  ExternalLink,
  Search,
  SlidersHorizontal,
  RefreshCw,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { Input } from '../components/ui/input';
import { DashboardHeader } from '../components/DashboardHeader';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { useDashboard } from '../contexts/DashboardContext';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api.service';
import { useUIStore, getSidebarOffset } from '../stores/uiStore';
import type { GithubDeveloper } from '../types/github.types';
import type { PullRequest, PRStatus } from '../types/dashboard.types';
import type { PrAnalysis, DeveloperEvolution, DeveloperInsights } from '../types/analysis.types';

// ── AI Insights derived from real analyses ────────────────────
interface AiInsights {
  summary: string;
  strengths: string[];
  areasForImprovement: string[];
  complexityScore: number;   // avg PR complexity (0-100)
  confidenceScore: number;   // avg AI confidence * 100
  volumeScore: number;       // PR throughput score
  hasData: boolean;
}

function deriveInsights(
  analyses: import('../types/analysis.types').PrAnalysis[],
  trend: string,
): AiInsights {
  if (!analyses.length) {
    return {
      summary: 'No analyzed PRs yet. Trigger an analysis on a PR to generate insights.',
      strengths: [],
      areasForImprovement: [],
      complexityScore: 0,
      confidenceScore: 0,
      volumeScore: 0,
      hasData: false,
    };
  }

  const avgComplexity = Math.round(
    analyses.reduce((s, a) => s + a.complexityScore, 0) / analyses.length,
  );
  const avgConfidence = Math.round(
    analyses.reduce((s, a) => s + a.confidence, 0) / analyses.length * 100,
  );

  // Change type distribution
  const typeCounts = analyses.reduce<Record<string, number>>((acc, a) => {
    acc[a.changeType] = (acc[a.changeType] ?? 0) + 1;
    return acc;
  }, {});
  const topType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'feature';

  // Unique technologies
  const techSet = new Set<string>();
  analyses.forEach((a) => {
    try { (JSON.parse(a.technologies) as string[]).forEach((t) => techSet.add(t)); } catch {}
  });
  const techList = [...techSet].slice(0, 3).join(', ') || 'multiple technologies';

  const trendLabel = trend === 'improving' ? 'increasing complexity' : trend === 'declining' ? 'decreasing complexity' : 'stable complexity';
  const complexityLabel = avgComplexity > 70 ? 'complex' : avgComplexity > 40 ? 'moderate' : 'low-complexity';

  const summary = `Works primarily on ${topType} tasks with ${complexityLabel} PRs (avg score ${avgComplexity}/100). `
    + `${techList ? `Main technologies: ${techList}. ` : ''}`
    + `AI scoring shows ${trendLabel} over the tracked period, with ${avgConfidence}% average confidence in assessments.`;

  const strengths: string[] = [];
  const areasForImprovement: string[] = [];

  if (avgConfidence >= 75) strengths.push('Consistent and predictable code changes (high AI confidence)');
  if (topType === 'feature') strengths.push('Strong focus on feature delivery');
  if (topType === 'refactor') strengths.push('Actively improves code quality through refactoring');
  if (topType === 'test') strengths.push('Invests in test coverage');
  if (trend === 'improving') strengths.push('Taking on increasingly complex work over time');
  if (avgComplexity <= 50 && analyses.length >= 5) strengths.push('Delivers manageable, reviewable PRs');

  if (avgConfidence < 60) areasForImprovement.push('PRs could benefit from more descriptive titles and descriptions');
  if (avgComplexity > 75) areasForImprovement.push('Consider breaking large PRs into smaller reviewable units');
  if (!typeCounts['test']) areasForImprovement.push('No test-only PRs detected — consider adding dedicated test coverage');
  if (!typeCounts['docs'] && !typeCounts['refactor']) areasForImprovement.push('Technical debt and documentation PRs are underrepresented');

  if (!strengths.length) strengths.push('Active contributor with analyzed PRs');
  if (!areasForImprovement.length) areasForImprovement.push('Maintain current PR quality standards');

  const volumeScore = Math.min(100, Math.round(analyses.length * 5));

  return {
    summary,
    strengths: strengths.slice(0, 3),
    areasForImprovement: areasForImprovement.slice(0, 2),
    complexityScore: avgComplexity,
    confidenceScore: avgConfidence,
    volumeScore,
    hasData: true,
  };
}

// ── PR status config ──────────────────────────────────────────
const PR_STATUS_CONFIG: Record<PRStatus, { label: string; dot: string; badge: string }> = {
  draft:             { label: 'Draft',      dot: 'bg-muted-foreground/50',  badge: 'bg-muted/40 text-muted-foreground border-border/40' },
  review_requested:  { label: 'In Review',  dot: 'bg-amber-400',            badge: 'bg-amber-500/10 text-amber-500 border-amber-500/25 dark:text-amber-400' },
  approved:          { label: 'Approved',   dot: 'bg-emerald-400',          badge: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/25 dark:text-emerald-400' },
  changes_requested: { label: 'Changes',   dot: 'bg-red-400',              badge: 'bg-red-500/10 text-red-600 border-red-500/25 dark:text-red-400' },
  merged:            { label: 'Merged',     dot: 'bg-violet-400',           badge: 'bg-violet-500/10 text-violet-600 border-violet-500/25 dark:text-violet-400' },
};

// ── Stat card — minimal, glassy, on-brand ────────────────────
interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  delay?: number;
  hint?: string;
}

const StatCard = ({ icon, label, value, delay = 0, hint }: StatCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.25 }}
    className="flex-1 min-w-0 px-3.5 py-3 rounded-xl border border-border/40 bg-card/35 backdrop-blur-md transition-colors hover:border-primary/30"
  >
    <div className="flex items-center gap-1.5 text-muted-foreground/65 mb-1.5">
      <span className="shrink-0 opacity-80">{icon}</span>
      <span className="text-[10px] font-mono font-medium uppercase tracking-[0.14em] truncate">{label}</span>
    </div>
    <p className="font-display text-[24px] font-light leading-none tabular-nums text-foreground">{value}</p>
    {hint && (
      <p className="mt-1 text-[10px] text-muted-foreground/55">{hint}</p>
    )}
  </motion.div>
);

// ── Performance tier ──────────────────────────────────────────
function getPerformanceTier(score: number) {
  if (score >= 90) return { label: 'Top Performer',     bg: 'bg-success/12',    text: 'text-success',    border: 'border-success/25',    glow: 'hsl(152 72% 50%)' };
  if (score >= 75) return { label: 'Strong Performer',  bg: 'bg-secondary/12',  text: 'text-secondary',  border: 'border-secondary/25',  glow: 'hsl(232 78% 64%)' };
  if (score >= 60) return { label: 'Solid Contributor', bg: 'bg-primary/12',    text: 'text-primary',    border: 'border-primary/25',    glow: 'hsl(262 88% 68%)' };
  return             { label: 'Needs Attention',       bg: 'bg-amber-500/12',  text: 'text-amber-400',  border: 'border-amber-500/25',  glow: 'hsl(40 95% 60%)' };
}

// ── Donut score — single elegant ring used in Performance Breakdown ──
interface DonutScoreProps {
  value: number;
  /** 0–100 baseline used for the trailing ring outline */
  size?: number;
  color: string;
  unit?: string;
}

const DonutScore = ({ value, size = 92, color, unit }: DonutScoreProps) => {
  const r = (size / 2) - 8;
  const circ = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, value));
  const offset = circ - (clamped / 100) * circ;
  const cx = size / 2;
  const cy = size / 2;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={cx} cy={cy} r={r} fill="none" strokeWidth="3.5" stroke="currentColor" className="text-border/40" />
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          strokeWidth="3.5"
          stroke={color}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 6px ${color}88)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-[22px] font-light leading-none tabular-nums">{value}</span>
        {unit && <span className="text-[8px] font-mono mt-0.5 text-muted-foreground/55 uppercase tracking-wider">{unit}</span>}
      </div>
    </div>
  );
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
  if (diff > 0 && diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff > 0 && diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff > 0 && diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  const sameYear = d.getFullYear() === now.getFullYear();
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    ...(sameYear ? {} : { year: 'numeric' }),
  });
}

// ─────────────────────────────────────────────────────────────
export default function DeveloperProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { githubDevelopers } = useDashboard();
  const { token } = useAuth();
  const { sidebarCollapsed } = useUIStore();
  const contentLeft = getSidebarOffset(sidebarCollapsed);

  const [developer, setDeveloper] = useState<GithubDeveloper | null>(null);
  const [devPRs, setDevPRs] = useState<PullRequest[]>([]);
  const [devCommits, setDevCommits] = useState<number | null>(null);
  const [devReviews, setDevReviews] = useState<number | null>(null);
  const [prSearch, setPrSearch] = useState('');
  const [prStatusFilter, setPrStatusFilter] = useState<PRStatus | 'all'>('all');
  const [aiAnalyses, setAiAnalyses] = useState<PrAnalysis[]>([]);
  const [aiEvolution, setAiEvolution] = useState<DeveloperEvolution | null>(null);
  const [serverInsights, setServerInsights] = useState<DeveloperInsights | null>(null);
  const [devPrUuids, setDevPrUuids] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const [analyzeQueued, setAnalyzeQueued] = useState(0);
  const [analyzeBaseline, setAnalyzeBaseline] = useState(0);
  const [isClearingMemory, setIsClearingMemory] = useState(false);
  const [clearMemoryFeedback, setClearMemoryFeedback] = useState<string | null>(null);
  const [isAnalyzingCommits, setIsAnalyzingCommits] = useState(false);
  const [commitQueued, setCommitQueued] = useState(0);
  const [commitBaseline, setCommitBaseline] = useState(0);

  useEffect(() => {
    if (!id || githubDevelopers.length === 0) return;
    const dev = githubDevelopers.find((d) => d.id === id);
    if (dev) setDeveloper(dev);
  }, [id, githubDevelopers]);

  // Fetch PRs directly for this developer using their GitHub username
  useEffect(() => {
    if (!developer || !token) return;

    const fetchDevPRs = async () => {
      try {
        const login = developer.githubUsername?.toLowerCase();
        const displayName = developer.name?.toLowerCase();

        const [raw, activity] = await Promise.all([
          apiService.getGithubRecentPullRequests(token, undefined, 100),
          apiService.getGithubRecentActivity(token, undefined, 500),
        ]);

        // Count commits and reviews from activity feed
        const matchActivity = (a: { developer: { githubUsername: string | null; name: string } }) => {
          const aLogin = a.developer.githubUsername?.toLowerCase();
          const aName = a.developer.name?.toLowerCase();
          return (
            (login && (aLogin === login || aName === login)) ||
            (displayName && (aName === displayName || aLogin === displayName))
          );
        };
        const myActivity = activity.filter(matchActivity);
        setDevCommits(myActivity.filter((a) => a.type === 'commit').length);
        setDevReviews(myActivity.filter((a) => a.type === 'review').length);

        const matched = raw.filter((pr) => {
          const authorLogin = pr.author.login?.toLowerCase();
          const authorName = pr.author.name?.toLowerCase();
          return (
            (login && (authorLogin === login || authorName === login)) ||
            (displayName && (authorName === displayName || authorLogin === displayName))
          );
        });

        setDevPrUuids(matched.map((pr) => pr.id));

        setDevPRs(
          matched.map((pr) => ({
            id: pr.number,
            title: pr.title,
            author: {
              id: pr.author.login,
              name: pr.author.name,
              avatar: pr.author.avatar,
            },
            status: (pr.status as PRStatus) ?? 'review_requested',
            createdAt: pr.createdAt,
            updatedAt: pr.updatedAt,
            branch: undefined,
            targetBranch: undefined,
            additions: pr.additions,
            deletions: pr.deletions,
            reviewers: pr.reviewers.map((r) => ({
              id: r.login,
              name: r.name,
              avatar: r.avatar,
              status:
                r.state === 'APPROVED'
                  ? 'approved'
                  : r.state === 'CHANGES_REQUESTED'
                  ? 'changes_requested'
                  : 'pending',
              state: r.state,
            })),
            url: pr.url,
            closedAt: pr.closedAt,
            mergedAt: pr.mergedAt,
          }))
        );
      } catch (err) {
        console.error('Failed to fetch developer PRs:', err);
      }
    };

    fetchDevPRs();
  }, [developer, token]);

  // Fetch AI analyses, evolution and narrated insights for this developer
  useEffect(() => {
    if (!developer || !token) return;
    const fetchAiData = async () => {
      try {
        const [analyses, evolution] = await Promise.all([
          apiService.getDeveloperAnalyses(token, developer.id, 50),
          apiService.getDeveloperEvolution(token, developer.id, 90),
        ]);
        setAiAnalyses(analyses);
        setAiEvolution(evolution);
      } catch {
        // AI data is optional — silently fail
      }
      try {
        const insights = await apiService.getDeveloperInsights(token, developer.id);
        setServerInsights(insights);
      } catch {
        // Insights endpoint may be unavailable — silently fall back to derived
      }
    };
    fetchAiData();
  }, [developer, token]);

  const refreshAiData = async (forceInsightsRefresh = false) => {
    if (!developer || !token) return;
    try {
      const [analyses, evolution] = await Promise.all([
        apiService.getDeveloperAnalyses(token, developer.id, 50),
        apiService.getDeveloperEvolution(token, developer.id, 90),
      ]);
      setAiAnalyses(analyses);
      setAiEvolution(evolution);
    } catch {
      // silently fail
    }
    try {
      const insights = await apiService.getDeveloperInsights(
        token,
        developer.id,
        forceInsightsRefresh,
      );
      setServerInsights(insights);
    } catch {
      // silently fail
    }
  };

  const handleClearMemory = async () => {
    if (!token || !developer || isClearingMemory) return;
    if (!window.confirm(`Clear all AI memory for ${developer.name}? This deletes their mem0 entries and cached insight snapshot. Past analyses (in pr_analyses) are kept.`)) return;
    setIsClearingMemory(true);
    setClearMemoryFeedback(null);
    try {
      const result = await apiService.clearDeveloperMemory(token, developer.id);
      const deleted = (result as { memoriesDeleted?: number; deletedCount?: number; deleted?: number }).memoriesDeleted
        ?? (result as { deletedCount?: number }).deletedCount
        ?? (result as { deleted?: number }).deleted
        ?? 0;
      setClearMemoryFeedback(`Memory cleared (${deleted} entries removed). Re-run "Analyze code" to rebuild insights.`);
      setServerInsights(null);
    } catch (err) {
      setClearMemoryFeedback(err instanceof Error ? `Failed: ${err.message}` : 'Failed to clear memory');
    } finally {
      setIsClearingMemory(false);
    }
  };

  const handleAnalyzePRs = async () => {
    if (!token || !developer || devPrUuids.length === 0 || isAnalyzing) return;
    setIsAnalyzing(true);
    setAnalyzeError(null);
    const ids = devPrUuids.slice(0, 20);
    setAnalyzeBaseline(aiAnalyses.length);
    setAnalyzeQueued(ids.length);
    try {
      // Backend now returns immediately and processes in background.
      await apiService.triggerBatchAnalysis(token, ids);
    } catch (err: unknown) {
      setAnalyzeError(err instanceof Error ? err.message : 'Analysis failed');
      setIsAnalyzing(false);
      setAnalyzeQueued(0);
      return;
    }
  };

  // Poll for new analyses while a background batch is running.
  useEffect(() => {
    if (!isAnalyzing || !developer || !token) return;
    const expectedTotal = analyzeBaseline + analyzeQueued;
    const interval = setInterval(async () => {
      try {
        const fresh = await apiService.getDeveloperAnalyses(token, developer.id, 50);
        setAiAnalyses(fresh);
        if (fresh.length >= expectedTotal) {
          clearInterval(interval);
          setIsAnalyzing(false);
          setAnalyzeQueued(0);
          await refreshAiData(true);
        }
      } catch {
        // keep polling on transient errors
      }
    }, 4000);

    // Safety timeout: stop polling after 12 minutes
    const timeout = setTimeout(() => {
      clearInterval(interval);
      setIsAnalyzing(false);
      setAnalyzeQueued(0);
    }, 12 * 60 * 1000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [isAnalyzing, developer, token, analyzeBaseline, analyzeQueued]);

  const handleAnalyzeCommits = async () => {
    if (!token || !developer || isAnalyzingCommits) return;
    setIsAnalyzingCommits(true);
    setAnalyzeError(null);
    try {
      const unanalyzed = await apiService.getUnanalyzedCommits(token, developer.id, 10);
      if (unanalyzed.length === 0) {
        setAnalyzeError('No unanalyzed commits available for this developer.');
        setIsAnalyzingCommits(false);
        return;
      }
      setCommitBaseline(aiAnalyses.length);
      setCommitQueued(unanalyzed.length);
      await apiService.triggerCommitsBatch(token, unanalyzed.map((c) => c.id));
    } catch (err: unknown) {
      setAnalyzeError(err instanceof Error ? err.message : 'Commit analysis failed');
      setIsAnalyzingCommits(false);
      setCommitQueued(0);
    }
  };

  // Poll while commit batch is running
  useEffect(() => {
    if (!isAnalyzingCommits || !developer || !token) return;
    const expected = commitBaseline + commitQueued;
    const interval = setInterval(async () => {
      try {
        const fresh = await apiService.getDeveloperAnalyses(token, developer.id, 50);
        setAiAnalyses(fresh);
        if (fresh.length >= expected) {
          clearInterval(interval);
          setIsAnalyzingCommits(false);
          setCommitQueued(0);
          await refreshAiData(true);
        }
      } catch {
        // keep polling on transient errors
      }
    }, 4000);
    const timeout = setTimeout(() => {
      clearInterval(interval);
      setIsAnalyzingCommits(false);
      setCommitQueued(0);
    }, 12 * 60 * 1000);
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [isAnalyzingCommits, developer, token, commitBaseline, commitQueued]);

  // ── Loading skeleton ──
  if (!developer) {
    return (
      <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_22%_16%,hsl(var(--accent)/0.14),transparent_40%),radial-gradient(circle_at_86%_8%,hsl(var(--primary)/0.1),transparent_38%)]" />
        <DashboardHeader activeTab="squads" onTabChange={() => {}} />
        <div
          className="flex-1 flex items-center justify-center pt-[138px] pb-10 relative z-10"
          style={{ paddingLeft: contentLeft }}
        >
          <div className="flex flex-col items-center gap-4">
            <div className="h-20 w-20 rounded-full bg-muted/40 animate-pulse" />
            <div className="h-5 w-44 bg-muted/40 rounded-lg animate-pulse" />
            <div className="h-4 w-28 bg-muted/30 rounded-lg animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  // ── Derived values ──
  const aiInsights = deriveInsights(aiAnalyses, aiEvolution?.trend ?? 'stable');
  const overallScore = aiInsights.hasData
    ? Math.round((aiInsights.complexityScore + aiInsights.confidenceScore + aiInsights.volumeScore) / 3)
    : Math.round(
        ((developer.stats.pullRequests > 0 ? 70 : 40) +
          (developer.stats.mergedPRs > 0 ? 75 : 40) +
          (developer.stats.reviews > 0 ? 65 : 40)) / 3,
      );
  const tier = getPerformanceTier(overallScore);
  const sinceDate = new Date(developer.stats.period.since).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long',
  });

  // Always use API stats (last 30 days, server-side filter) so the numbers
  // here match the Engineering Overview table on the dashboard. The locally
  // fetched activity feed may span a different window and would diverge.
  const realPRCount = developer.stats.pullRequests;
  const realMerged  = developer.stats.mergedPRs;
  const realCommits = developer.stats.commits;
  const realReviews = developer.stats.reviews;

  // ── Bound the PR list to the same 30-day window the StatCards use,
  //    so the counts above and the rows below come from one mental model.
  const periodWindowDays = developer.stats.period.days;
  const periodCutoff = new Date();
  periodCutoff.setDate(periodCutoff.getDate() - periodWindowDays);

  const devPRsInWindow = devPRs.filter((pr) => {
    const ref = new Date(pr.updatedAt || pr.createdAt);
    return !Number.isNaN(ref.getTime()) && ref.getTime() >= periodCutoff.getTime();
  });

  // Status counts for filter pills (window-aligned)
  const statusCounts = devPRsInWindow.reduce<Record<string, number>>((acc, pr) => {
    acc[pr.status] = (acc[pr.status] ?? 0) + 1;
    return acc;
  }, {});

  // Filtered PR list (window-aligned)
  const filteredPRs = devPRsInWindow.filter((pr) => {
    const matchesSearch = !prSearch || pr.title.toLowerCase().includes(prSearch.toLowerCase());
    const matchesStatus = prStatusFilter === 'all' || pr.status === prStatusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden text-foreground">
      {/* Backdrop blooms — same vocabulary as Profile/Settings */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full opacity-50 blur-3xl"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, hsl(262 95% 70% / 0.10) 0%, transparent 60%)",
          }}
        />
        <div
          className="absolute -bottom-32 -right-32 w-[640px] h-[640px] rounded-full opacity-40 blur-3xl"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, hsl(320 80% 65% / 0.08) 0%, transparent 60%)",
          }}
        />
      </div>

      <DashboardHeader
        activeTab="squads"
        onTabChange={() => {}}
        breadcrumb={[
          { label: 'Squads', path: '/squads' },
          { label: developer.name },
        ]}
      />

      <main
        className="flex-1 overflow-y-auto pr-6 md:pr-10 pt-[148px] pb-16 relative z-10 transition-[padding-left] duration-300"
        style={{ paddingLeft: contentLeft + 16 }}
      >
        <div className="max-w-6xl mx-auto space-y-5">

          {/* Back link */}
          <motion.button
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ x: -2 }}
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-[12px] font-medium text-muted-foreground/70 hover:text-foreground transition-colors px-1"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </motion.button>

          {/* ── Hero card ── */}
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="artemis-panel relative overflow-hidden rounded-[28px]"
          >
            {/* Aurora bloom in corner */}
            <div
              aria-hidden
              className="pointer-events-none absolute -top-32 -right-24 w-[420px] h-[420px] rounded-full opacity-50 blur-3xl"
              style={{
                background: `radial-gradient(circle, ${tier.glow}26 0%, transparent 70%)`,
              }}
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent"
            />

            <div className="relative p-7 md:p-9">
              {/* Top row: avatar + identity + overall score */}
              <div className="grid grid-cols-1 md:grid-cols-[auto_1fr_auto] gap-7 items-center">
                {/* Avatar with aurora ring */}
                <div className="relative">
                  <div
                    aria-hidden
                    className="absolute -inset-2 rounded-full bg-aurora-gradient opacity-50 blur-md"
                  />
                  <Avatar className="relative h-[112px] w-[112px] ring-2 ring-background shadow-[0_18px_40px_-12px_hsl(232_60%_2%/0.7)]">
                    <AvatarImage
                      src={
                        developer.avatarUrl ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(developer.name)}&background=random&size=224`
                      }
                    />
                    <AvatarFallback className="text-3xl font-display font-light">
                      {developer.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </div>

                {/* Identity */}
                <div className="min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h1 className="font-display text-[36px] font-light leading-none tracking-[-0.025em]">
                      {developer.name}
                    </h1>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${tier.bg} ${tier.text} ${tier.border}`}
                    >
                      <Sparkles className="h-3 w-3" />
                      {tier.label}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[13px] text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Github className="h-3.5 w-3.5 text-muted-foreground/60" />
                      <span>{developer.githubUsername ? `@${developer.githubUsername}` : 'No GitHub linked'}</span>
                    </div>
                    {developer.email && (
                      <div className="flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5 text-muted-foreground/60" />
                        <span>{developer.email}</span>
                      </div>
                    )}
                    <span className="text-muted-foreground/45">·</span>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground/60" />
                      <span>Member since {sinceDate}</span>
                    </div>
                  </div>
                </div>

                {/* Overall score donut */}
                <div className="hidden md:flex flex-col items-center gap-2">
                  <DonutScore value={overallScore} color={tier.glow} size={92} unit="score" />
                  <span className="text-[10px] font-mono uppercase tracking-[0.16em] text-muted-foreground/55">
                    Overall
                  </span>
                </div>
              </div>

              {/* KPI strip */}
              <div className="mt-7 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-[0.16em] text-muted-foreground/55">
                    Last {periodWindowDays} days
                  </span>
                  <span className="h-px flex-1 bg-border/40" />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <StatCard icon={<GitCommit className="h-3 w-3" />} label="Commits" value={realCommits} delay={0.05} />
                  <StatCard icon={<GitPullRequest className="h-3 w-3" />} label="Pull Requests" value={realPRCount} delay={0.1} />
                  <StatCard icon={<Eye className="h-3 w-3" />} label="Reviews" value={realReviews} delay={0.15} />
                  <StatCard icon={<GitMerge className="h-3 w-3" />} label="Merged PRs" value={realMerged} delay={0.2} />
                </div>
              </div>
            </div>
          </motion.section>

          {/* ── AI Insights + Performance Breakdown ── */}
          {(() => {
            const useServer = serverInsights && serverInsights.memoryCount > 0;
            const summaryText = useServer ? serverInsights!.summary : aiInsights.summary;
            const strengthsList = useServer ? serverInsights!.strengths : aiInsights.strengths;
            const growthList = useServer ? serverInsights!.growthAreas : aiInsights.areasForImprovement;
            const techList = useServer ? serverInsights!.dominantTechnologies : [];
            const hasInsights = useServer || aiInsights.hasData;

            const trendInfo = useServer && serverInsights!.trendNarrative
              ? { label: serverInsights!.trendNarrative, kind: 'narrative' as const }
              : aiEvolution
                ? {
                    label: aiEvolution.trend.charAt(0).toUpperCase() + aiEvolution.trend.slice(1),
                    kind: aiEvolution.trend as 'improving' | 'declining' | 'stable',
                  }
                : null;

            return (
              <div className="grid grid-cols-1 lg:grid-cols-[1.55fr_1fr] gap-5">
                {/* ── AI Insights ── */}
                <motion.section
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.5 }}
                  className="artemis-panel relative overflow-hidden rounded-[24px]"
                >
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent"
                  />
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -top-24 -right-12 w-72 h-72 rounded-full opacity-30 blur-3xl"
                    style={{
                      background:
                        "radial-gradient(circle, hsl(262 95% 65% / 0.30) 0%, transparent 70%)",
                    }}
                  />

                  <div className="relative p-6 md:p-7">
                    {/* Header row: title + actions */}
                    <header className="flex items-start justify-between gap-3 flex-wrap mb-5">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl border border-primary/30 bg-primary/10 flex items-center justify-center text-primary">
                          <BrainCircuit className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-[15px] font-semibold leading-none">
                              AI Performance Insights
                            </h3>
                            <span className="inline-flex items-center gap-1 rounded-full border border-secondary/30 bg-secondary/10 px-2 py-0.5 text-[10px] font-medium text-secondary">
                              <Sparkles className="h-2.5 w-2.5" />
                              AI
                            </span>
                          </div>
                          <p className="mt-1 text-[11.5px] text-muted-foreground/70 leading-relaxed">
                            Narrative built from {aiAnalyses.length} analyzed PR{aiAnalyses.length !== 1 ? 's' : ''}
                            {useServer ? ` · ${serverInsights!.memoryCount} memories` : ''}.
                          </p>
                        </div>
                      </div>

                      {/* Action group — same actions, much cleaner visual */}
                      <div className="flex items-center gap-1.5">
                        <ActionButton
                          icon={isAnalyzing ? RefreshCw : Sparkles}
                          label={
                            isAnalyzing
                              ? `Analyzing ${Math.max(0, aiAnalyses.length - analyzeBaseline)}/${analyzeQueued}`
                              : 'Analyze PRs'
                          }
                          onClick={handleAnalyzePRs}
                          disabled={isAnalyzing || devPrUuids.length === 0 || isAnalyzingCommits || isClearingMemory}
                          variant="primary"
                          loading={isAnalyzing}
                        />
                        <ActionButton
                          icon={isAnalyzingCommits ? RefreshCw : GitCommitHorizontal}
                          label={
                            isAnalyzingCommits
                              ? `Commits ${Math.max(0, aiAnalyses.length - commitBaseline)}/${commitQueued}`
                              : 'Commits'
                          }
                          onClick={handleAnalyzeCommits}
                          disabled={isAnalyzingCommits || isAnalyzing || isClearingMemory}
                          variant="secondary"
                          loading={isAnalyzingCommits}
                          title="Analyze the developer's recent unanalyzed commits"
                        />
                        <ActionButton
                          icon={isClearingMemory ? RefreshCw : Trash2}
                          label=""
                          onClick={handleClearMemory}
                          disabled={isClearingMemory || isAnalyzing || isAnalyzingCommits}
                          variant="ghost-destructive"
                          loading={isClearingMemory}
                          title="Clear AI memory"
                        />
                      </div>
                    </header>

                    {/* Inline feedback / errors */}
                    {analyzeError && (
                      <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/8 px-3 py-2 text-[12px] text-destructive">
                        {analyzeError}
                      </div>
                    )}
                    {clearMemoryFeedback && (
                      <div className="mb-4 rounded-lg border border-success/30 bg-success/8 px-3 py-2 text-[12px] text-success">
                        {clearMemoryFeedback}
                      </div>
                    )}

                    {/* Body */}
                    {!hasInsights ? (
                      <div className="py-10 text-center max-w-md mx-auto">
                        <div className="h-12 w-12 rounded-2xl bg-card/50 border border-border/40 flex items-center justify-center mx-auto mb-3">
                          <BrainCircuit className="h-5 w-5 text-muted-foreground/60" />
                        </div>
                        <p className="text-[14px] font-medium text-foreground">No analyses yet</p>
                        <p className="mt-1.5 text-[12.5px] text-muted-foreground/75 leading-relaxed">
                          Click <span className="text-primary font-medium">Analyze PRs</span> above to generate
                          a narrative on how this developer ships code.
                        </p>
                      </div>
                    ) : (
                      <>
                        {/* Narrative */}
                        <p className="text-[13.5px] leading-relaxed text-muted-foreground/95 max-w-2xl">
                          {summaryText}
                        </p>

                        {/* Strengths + Growth — clean two-column */}
                        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
                          <InsightList
                            heading="Strengths"
                            items={strengthsList}
                            tone="success"
                            icon={Zap}
                          />
                          <InsightList
                            heading="Growth areas"
                            items={growthList}
                            tone="warning"
                            icon={TrendingUp}
                          />
                        </div>

                        {/* Tech tags + trend footer */}
                        {(techList.length > 0 || trendInfo) && (
                          <div className="mt-6 pt-4 border-t border-border/30 flex flex-wrap items-center gap-x-4 gap-y-2.5">
                            {techList.length > 0 && (
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="text-[10px] font-mono uppercase tracking-[0.16em] text-muted-foreground/55">
                                  Stack
                                </span>
                                {techList.map((t) => (
                                  <span
                                    key={t}
                                    className="text-[11px] px-2 py-0.5 rounded-full border border-primary/25 bg-primary/8 text-primary"
                                  >
                                    {t}
                                  </span>
                                ))}
                              </div>
                            )}

                            {trendInfo && (
                              <div className="flex items-center gap-2 ml-auto">
                                <span className="text-[10px] font-mono uppercase tracking-[0.16em] text-muted-foreground/55">
                                  Trend
                                </span>
                                <TrendPill kind={trendInfo.kind} label={trendInfo.label} />
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </motion.section>

                {/* ── Performance Breakdown ── */}
                <motion.section
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15, duration: 0.5 }}
                  className="artemis-panel rounded-[24px] p-6 md:p-7 flex flex-col"
                >
                  <header className="mb-5">
                    <h3 className="text-[15px] font-semibold leading-none">Performance Breakdown</h3>
                    <p className="mt-1 text-[11.5px] text-muted-foreground/70">
                      Three signals derived from analyzed PRs.
                    </p>
                  </header>

                  <div className="flex-1 flex flex-col gap-4">
                    <BreakdownRow
                      label="Avg PR complexity"
                      sublabel="0 = trivial · 100 = heavy"
                      value={aiInsights.complexityScore}
                      unit="/100"
                      color="hsl(232 88% 65%)"
                    />
                    <div className="h-px bg-border/35" />
                    <BreakdownRow
                      label="AI confidence"
                      sublabel="how sure the model is"
                      value={aiInsights.confidenceScore}
                      unit="%"
                      color="hsl(152 72% 50%)"
                    />
                    <div className="h-px bg-border/35" />
                    <BreakdownRow
                      label="Analyzed volume"
                      sublabel={`${aiAnalyses.length} PR${aiAnalyses.length !== 1 ? 's' : ''} processed`}
                      value={aiInsights.volumeScore}
                      unit="/100"
                      color="hsl(320 76% 70%)"
                    />
                  </div>
                </motion.section>
              </div>
            );
          })()}

          {/* ── Pull Request Activity ── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="artemis-panel rounded-[24px] overflow-hidden relative"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent"
            />
            {/* Table header */}
            <div className="px-6 pt-4 pb-3 border-b border-border/40 space-y-3">
              {/* Title row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <GitPullRequest className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-semibold text-foreground">Pull Request Activity</h3>
                  {devPRsInWindow.length > 0 && (
                    <span className="text-xs text-muted-foreground/60 bg-muted/40 px-2 py-0.5 rounded-full border border-border/30">
                      {filteredPRs.length}
                      {filteredPRs.length !== devPRsInWindow.length && `/${devPRsInWindow.length}`}
                    </span>
                  )}
                  <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-muted-foreground/50">
                    last {periodWindowDays}d
                  </span>
                </div>
                {/* Search */}
                {devPRsInWindow.length > 0 && (
                  <div className="relative w-52">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50" />
                    <Input
                      placeholder="Search PRs..."
                      value={prSearch}
                      onChange={(e) => setPrSearch(e.target.value)}
                      className="h-8 pl-8 text-xs bg-background/50 border-border/40 placeholder:text-muted-foreground/40"
                    />
                  </div>
                )}
              </div>

              {/* Status filter pills */}
              {devPRsInWindow.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  <SlidersHorizontal className="h-3 w-3 text-muted-foreground/40 mr-0.5" />
                  {(['all', 'merged', 'review_requested', 'approved', 'changes_requested', 'draft'] as const).map((status) => {
                    const count = status === 'all' ? devPRsInWindow.length : (statusCounts[status] ?? 0);
                    if (status !== 'all' && count === 0) return null;
                    const cfg = status === 'all' ? null : PR_STATUS_CONFIG[status];
                    const isActive = prStatusFilter === status;
                    return (
                      <button
                        key={status}
                        onClick={() => setPrStatusFilter(status)}
                        className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full border transition-all ${
                          isActive
                            ? cfg
                              ? `${cfg.badge} opacity-100`
                              : 'bg-foreground/10 text-foreground border-foreground/20'
                            : 'bg-muted/20 text-muted-foreground/60 border-border/30 hover:text-foreground hover:border-border/60'
                        }`}
                      >
                        {status === 'all' ? 'All' : cfg?.label} <span className="opacity-60">{count}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {devPRsInWindow.length === 0 ? (
              <div className="py-16 flex flex-col items-center justify-center text-center">
                <div className="h-12 w-12 rounded-2xl bg-muted/20 border border-border/30 flex items-center justify-center mb-4">
                  <GitPullRequest className="h-6 w-6 text-muted-foreground/30" />
                </div>
                <p className="text-sm font-medium text-foreground mb-1">No pull requests yet</p>
                <p className="text-xs text-muted-foreground/60">PRs authored by this developer will appear here.</p>
              </div>
            ) : (
              <div className="divide-y divide-border/30">
                {/* Column headers */}
                <div className="px-6 py-2.5 grid grid-cols-[1fr_100px_100px_80px_80px] gap-4 items-center">
                  <span className="text-[10px] font-semibold text-muted-foreground/40 uppercase tracking-widest">Title</span>
                  <span className="text-[10px] font-semibold text-muted-foreground/40 uppercase tracking-widest">Status</span>
                  <span className="text-[10px] font-semibold text-muted-foreground/40 uppercase tracking-widest">Branch</span>
                  <span className="text-[10px] font-semibold text-muted-foreground/40 uppercase tracking-widest text-right">Impact</span>
                  <span className="text-[10px] font-semibold text-muted-foreground/40 uppercase tracking-widest text-right">Date</span>
                </div>

                {filteredPRs.length === 0 && (
                  <div className="py-10 text-center">
                    <p className="text-sm text-muted-foreground/50">No PRs match your filters.</p>
                  </div>
                )}
                <AnimatePresence>
                  {filteredPRs.map((pr, i) => {
                    const statusCfg = PR_STATUS_CONFIG[pr.status] ?? PR_STATUS_CONFIG.draft;
                    const hasAdditions = pr.additions > 0;
                    const hasDeletions = pr.deletions > 0;

                    return (
                      <motion.div
                        key={pr.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="px-6 py-3.5 grid grid-cols-[1fr_100px_100px_80px_80px] gap-4 items-center group hover:bg-muted/10 transition-colors"
                      >
                        {/* Title */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] text-muted-foreground/40">#{pr.id}</span>
                            {pr.url ? (
                              <button
                                className="text-sm font-medium text-foreground truncate hover:text-primary transition-colors flex items-center gap-1 group/link text-left"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // In Electron, target="_blank" navigates the renderer window.
                                  // Use window.open which Electron handles correctly via webContents.
                                  window.open(pr.url, '_blank');
                                }}
                              >
                                <span className="truncate">{pr.title}</span>
                                <ExternalLink className="h-3 w-3 opacity-0 group-hover/link:opacity-50 shrink-0" />
                              </button>
                            ) : (
                              <span className="text-sm font-medium text-foreground truncate">{pr.title}</span>
                            )}
                          </div>
                        </div>

                        {/* Status badge */}
                        <div>
                          <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-md border ${statusCfg.badge}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${statusCfg.dot}`} />
                            {statusCfg.label}
                          </span>
                        </div>

                        {/* Branch */}
                        <div className="min-w-0">
                          {pr.branch ? (
                            <span className="font-mono text-[11px] text-muted-foreground/60 bg-muted/30 px-2 py-0.5 rounded truncate block">
                              {pr.branch.length > 14 ? `${pr.branch.slice(0, 14)}…` : pr.branch}
                            </span>
                          ) : (
                            <span className="text-muted-foreground/30 text-xs">—</span>
                          )}
                        </div>

                        {/* Code impact */}
                        <div className="flex items-center justify-end gap-1.5 tabular-nums">
                          {hasAdditions && (
                            <span className="text-[11px] font-semibold text-emerald-500 flex items-center gap-0.5">
                              <ArrowUpRight className="h-3 w-3" />
                              {pr.additions}
                            </span>
                          )}
                          {hasDeletions && (
                            <span className="text-[11px] font-semibold text-red-500 flex items-center gap-0.5">
                              <ArrowDownRight className="h-3 w-3" />
                              {pr.deletions}
                            </span>
                          )}
                          {!hasAdditions && !hasDeletions && (
                            <Minus className="h-3.5 w-3.5 text-muted-foreground/30" />
                          )}
                        </div>

                        {/* Date */}
                        <div className="text-right">
                          <span className="text-[11px] text-muted-foreground/50">
                            {formatDate(pr.createdAt)}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

              </div>
            )}
          </motion.div>

        </div>
      </main>
    </div>
  );
}

/* ─────────────── Local presentational helpers ─────────────── */

interface ActionButtonProps {
  icon: typeof Sparkles;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant: 'primary' | 'secondary' | 'ghost-destructive';
  title?: string;
}

const ActionButton = ({
  icon: Icon,
  label,
  onClick,
  disabled,
  loading,
  variant,
  title,
}: ActionButtonProps) => {
  const variantClass = {
    primary:
      'border-primary/30 bg-primary/10 text-primary hover:border-primary/50 hover:bg-primary/15',
    secondary:
      'border-secondary/25 bg-secondary/8 text-secondary hover:border-secondary/45 hover:bg-secondary/12',
    'ghost-destructive':
      'border-border/40 bg-card/30 text-muted-foreground/70 hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive',
  }[variant];

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`group inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11.5px] font-medium transition-all disabled:cursor-not-allowed disabled:opacity-40 ${variantClass}`}
    >
      <Icon
        className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''} ${
          variant === 'primary' && !loading ? 'group-hover:rotate-12' : ''
        } transition-transform`}
      />
      {label && <span>{label}</span>}
    </button>
  );
};

interface InsightListProps {
  heading: string;
  items: string[];
  tone: 'success' | 'warning';
  icon: typeof Zap;
}

const InsightList = ({ heading, items, tone, icon: Icon }: InsightListProps) => {
  const accentClass = {
    success: {
      border: 'border-success/25',
      bg: 'bg-success/[0.04]',
      icon: 'text-success',
      dot: 'bg-success',
    },
    warning: {
      border: 'border-amber-500/25',
      bg: 'bg-amber-500/[0.04]',
      icon: 'text-amber-400',
      dot: 'bg-amber-400',
    },
  }[tone];

  return (
    <div className={`rounded-xl border ${accentClass.border} ${accentClass.bg} p-4`}>
      <div className="flex items-center gap-2 mb-3">
        <Icon className={`h-3.5 w-3.5 ${accentClass.icon}`} />
        <h4 className="text-[10.5px] font-mono font-semibold uppercase tracking-[0.16em] text-muted-foreground/85">
          {heading}
        </h4>
      </div>
      <ul className="space-y-2.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2.5 text-[12.5px] leading-relaxed text-muted-foreground/95">
            <span className={`mt-1.5 h-1 w-1 rounded-full ${accentClass.dot} shrink-0`} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

interface TrendPillProps {
  kind: 'improving' | 'declining' | 'stable' | 'narrative';
  label: string;
}

const TrendPill = ({ kind, label }: TrendPillProps) => {
  if (kind === 'narrative') {
    return (
      <span className="text-[12px] text-foreground/85 italic">{label}</span>
    );
  }
  const cfg = {
    improving: { icon: ArrowUpRight, cls: 'text-success border-success/30 bg-success/8' },
    declining: { icon: ArrowDownRight, cls: 'text-destructive border-destructive/30 bg-destructive/8' },
    stable: { icon: Minus, cls: 'text-muted-foreground border-border/40 bg-card/30' },
  }[kind];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${cfg.cls}`}>
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
};

interface BreakdownRowProps {
  label: string;
  sublabel: string;
  value: number;
  unit: string;
  color: string;
}

const BreakdownRow = ({ label, sublabel, value, unit, color }: BreakdownRowProps) => (
  <div className="flex items-center gap-4">
    <DonutScore value={value} size={68} color={color} />
    <div className="flex-1 min-w-0">
      <p className="text-[13px] font-medium text-foreground leading-none">{label}</p>
      <p className="mt-1 text-[11px] text-muted-foreground/65">{sublabel}</p>
      <div className="mt-2.5 flex items-center gap-2">
        <div className="h-1 flex-1 rounded-full bg-muted/40 overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${value}%`, background: color }}
          />
        </div>
        <span className="font-mono text-[10.5px] tabular-nums text-foreground/85">
          {value}{unit}
        </span>
      </div>
    </div>
  </div>
);
