import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Github,
  Mail,
  Calendar,
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

// ── Score ring (SVG) ─────────────────────────────────────────
interface ScoreRingProps {
  value: number;
  label: string;
  color: string;
  size?: number;
}

const ScoreRing = ({ value, label, color, size = 72 }: ScoreRingProps) => {
  const r = (size / 2) - 7;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  const cx = size / 2;
  const cy = size / 2;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={cx} cy={cy} r={r} fill="none" strokeWidth="5" stroke="currentColor" className="text-muted/25" />
          <circle
            cx={cx} cy={cy} r={r}
            fill="none" strokeWidth="5"
            stroke={color}
            strokeDasharray={circ}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[15px] font-bold text-foreground">{value}</span>
        </div>
      </div>
      <span className="text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider">{label}</span>
    </div>
  );
};

// ── Stat card ─────────────────────────────────────────────────
interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  delay?: number;
}

const StatCard = ({ icon, label, value, delay = 0 }: StatCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.25 }}
    className="flex-1 min-w-0 p-4 rounded-xl border border-border/40 bg-card/50 backdrop-blur-sm"
  >
    <div className="flex items-center gap-2 text-muted-foreground mb-2.5">
      <span className="shrink-0">{icon}</span>
      <span className="text-xs font-semibold uppercase tracking-wider truncate">{label}</span>
    </div>
    <p className="text-2xl font-semibold text-foreground tabular-nums">{value}</p>
  </motion.div>
);

// ── Performance tier ──────────────────────────────────────────
function getPerformanceTier(score: number) {
  if (score >= 90) return { label: 'Top Performer',      bg: 'bg-emerald-500/12', text: 'text-emerald-500', border: 'border-emerald-500/25' };
  if (score >= 75) return { label: 'Strong Performer',   bg: 'bg-blue-500/12',    text: 'text-blue-500',    border: 'border-blue-500/25' };
  if (score >= 60) return { label: 'Solid Contributor',  bg: 'bg-yellow-500/12',  text: 'text-yellow-500',  border: 'border-yellow-500/25' };
  return             { label: 'Needs Attention',        bg: 'bg-red-500/12',     text: 'text-red-500',     border: 'border-red-500/25' };
}

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

  // Compute real counts from fetched data (API stats may lag or be filtered differently)
  const realPRCount   = devPRs.length > 0 ? devPRs.length            : developer.stats.pullRequests;
  const realMerged    = devPRs.length > 0
    ? devPRs.filter((p) => p.status === 'merged').length
    : developer.stats.mergedPRs;
  const realCommits   = devCommits !== null ? devCommits : developer.stats.commits;
  const realReviews   = devReviews !== null ? devReviews : developer.stats.reviews;

  // Status counts for filter pills
  const statusCounts = devPRs.reduce<Record<string, number>>((acc, pr) => {
    acc[pr.status] = (acc[pr.status] ?? 0) + 1;
    return acc;
  }, {});

  // Filtered PR list
  const filteredPRs = devPRs.filter((pr) => {
    const matchesSearch = !prSearch || pr.title.toLowerCase().includes(prSearch.toLowerCase());
    const matchesStatus = prStatusFilter === 'all' || pr.status === prStatusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_22%_16%,hsl(var(--accent)/0.14),transparent_40%),radial-gradient(circle_at_86%_8%,hsl(var(--primary)/0.1),transparent_38%),radial-gradient(circle_at_46%_86%,hsl(var(--secondary)/0.12),transparent_42%)]" />

      <DashboardHeader
        activeTab="squads"
        onTabChange={() => {}}
        breadcrumb={[
          { label: 'Squads', path: '/squads' },
          { label: developer.name },
        ]}
      />

      <main
        className="flex-1 overflow-y-auto pt-[138px] pr-8 pb-10 relative z-10 transition-[padding-left] duration-300"
        style={{ paddingLeft: contentLeft + 16 }}
      >
        <div className="max-w-6xl mx-auto space-y-5">

          {/* Back button */}
          <motion.button
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ x: -2 }}
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </motion.button>

          {/* ── Hero card ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="relative rounded-2xl border border-border/40 bg-card/40 backdrop-blur-xl overflow-hidden"
          >
            {/* Decorative avatar blobs */}
            {developer.avatarUrl && (
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div
                  className="absolute blur-3xl rounded-full opacity-[0.08]"
                  style={{ width: 300, height: 300, top: '-60px', left: '-40px' }}
                >
                  <img src={developer.avatarUrl} className="w-full h-full object-cover rounded-full" alt="" />
                </div>
                <div
                  className="absolute blur-3xl rounded-full opacity-[0.05]"
                  style={{ width: 200, height: 200, bottom: '-40px', right: '10%' }}
                >
                  <img src={developer.avatarUrl} className="w-full h-full object-cover rounded-full" alt="" />
                </div>
              </div>
            )}

            <div className="relative z-10 p-7">
              {/* Top row: avatar + info + overall score */}
              <div className="flex items-start gap-6 mb-6">
                {/* Avatar */}
                <div className="relative shrink-0">
                  <Avatar className="h-20 w-20 ring-2 ring-border/50 shadow-lg">
                    <AvatarImage
                      src={
                        developer.avatarUrl ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(developer.name)}&background=random&size=160`
                      }
                    />
                    <AvatarFallback className="text-2xl font-semibold">
                      {developer.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </div>

                {/* Name + handles */}
                <div className="flex-1 min-w-0 pt-1">
                  <div className="flex items-center gap-3 flex-wrap mb-1">
                    <h1 className="text-2xl font-bold text-foreground tracking-tight">{developer.name}</h1>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${tier.bg} ${tier.text} ${tier.border}`}>
                      {tier.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-3">
                    <Github className="h-3.5 w-3.5" />
                    <span>{developer.githubUsername || 'No GitHub linked'}</span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    {developer.email && (
                      <span className="flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5 shrink-0" />
                        {developer.email}
                      </span>
                    )}
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 shrink-0" />
                      Member since {sinceDate}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 shrink-0" />
                      {developer.stats.period.days} days tracked
                    </span>
                  </div>
                </div>

                {/* Overall score */}
                <div className="shrink-0 flex flex-col items-center gap-1.5 pt-1">
                  <div className="relative">
                    <svg width="80" height="80" style={{ transform: 'rotate(-90deg)' }}>
                      <circle cx="40" cy="40" r="33" fill="none" strokeWidth="6" stroke="currentColor" className="text-muted/20" />
                      <circle
                        cx="40" cy="40" r="33"
                        fill="none" strokeWidth="6"
                        stroke={overallScore >= 90 ? '#10b981' : overallScore >= 75 ? '#3b82f6' : overallScore >= 60 ? '#f59e0b' : '#ef4444'}
                        strokeDasharray={2 * Math.PI * 33}
                        strokeDashoffset={2 * Math.PI * 33 * (1 - overallScore / 100)}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-lg font-bold text-foreground leading-none">{overallScore}</span>
                      <span className="text-[8px] text-muted-foreground font-medium mt-0.5">SCORE</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wider">Overall</span>
                </div>
              </div>

              {/* Stats strip */}
              <div className="flex gap-3">
                <StatCard icon={<GitCommit className="h-3.5 w-3.5" />} label="Commits" value={realCommits} delay={0.05} />
                <StatCard icon={<GitPullRequest className="h-3.5 w-3.5" />} label="Pull Requests" value={realPRCount} delay={0.1} />
                <StatCard icon={<Eye className="h-3.5 w-3.5" />} label="Reviews" value={realReviews} delay={0.15} />
                <StatCard icon={<GitMerge className="h-3.5 w-3.5" />} label="Merged PRs" value={realMerged} delay={0.2} />
              </div>
            </div>
          </motion.div>

          {/* ── AI Insights + Score rings ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* AI Insights (2/3) */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.3 }}
              className="lg:col-span-2 rounded-2xl border border-primary/15 bg-primary/[0.03] backdrop-blur-xl p-6 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-5 opacity-[0.06] pointer-events-none">
                <BrainCircuit className="h-28 w-28 text-primary" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center justify-between gap-2.5 mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-lg bg-primary/15 flex items-center justify-center">
                      <BrainCircuit className="h-4 w-4 text-primary" />
                    </div>
                    <h3 className="text-base font-semibold text-foreground">AI Performance Insights</h3>
                  </div>
                  <button
                    onClick={handleAnalyzePRs}
                    disabled={isAnalyzing || devPrUuids.length === 0}
                    className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    {isAnalyzing ? (
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="h-3.5 w-3.5" />
                    )}
                    {isAnalyzing
                      ? `Analyzing… ${Math.max(0, aiAnalyses.length - analyzeBaseline)}/${analyzeQueued}`
                      : 'Analyze code'}
                  </button>
                </div>
                {analyzeError && (
                  <p className="text-xs text-red-400 mb-3">{analyzeError}</p>
                )}

                {(() => {
                  const useServer = serverInsights && serverInsights.memoryCount > 0;
                  const summaryText = useServer ? serverInsights!.summary : aiInsights.summary;
                  const strengthsList = useServer ? serverInsights!.strengths : aiInsights.strengths;
                  const growthList = useServer ? serverInsights!.growthAreas : aiInsights.areasForImprovement;
                  const techList = useServer ? serverInsights!.dominantTechnologies : [];
                  const showCard = useServer || aiInsights.hasData;
                  return (
                    <>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-6 max-w-xl">
                        {summaryText}
                      </p>

                      {showCard ? (
                        <>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div>
                              <h4 className="text-xs font-semibold text-foreground flex items-center gap-2 mb-3 uppercase tracking-wider">
                                <Zap className="h-3.5 w-3.5 text-amber-400" />
                                Strengths
                              </h4>
                              <ul className="space-y-2">
                                {strengthsList.map((s, i) => (
                                  <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                                    {s}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <h4 className="text-xs font-semibold text-foreground flex items-center gap-2 mb-3 uppercase tracking-wider">
                                <TrendingUp className="h-3.5 w-3.5 text-blue-400" />
                                Areas for Growth
                              </h4>
                              <ul className="space-y-2">
                                {growthList.map((a, i) => (
                                  <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                                    <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                                    {a}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          {techList.length > 0 && (
                            <div className="mt-5 flex flex-wrap items-center gap-2">
                              <span className="text-xs text-muted-foreground/60 uppercase tracking-wider">
                                Dominant tech:
                              </span>
                              {techList.map((t) => (
                                <span
                                  key={t}
                                  className="text-xs px-2 py-1 rounded-md border border-primary/25 bg-primary/10 text-primary"
                                >
                                  {t}
                                </span>
                              ))}
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground/60 border border-border/30 rounded-lg px-4 py-3 bg-muted/10">
                          <BrainCircuit className="h-4 w-4 shrink-0" />
                          Trigger an analysis on this developer's PRs to generate real insights.
                        </div>
                      )}

                      {(useServer || (aiEvolution && aiInsights.hasData)) && (
                        <div className="mt-4 flex flex-wrap items-center gap-2">
                          <span className="text-xs text-muted-foreground/60">Complexity trend:</span>
                          {useServer && serverInsights!.trendNarrative ? (
                            <span className="text-xs text-foreground/80">
                              {serverInsights!.trendNarrative}
                            </span>
                          ) : aiEvolution ? (
                            <span className={`text-xs font-semibold flex items-center gap-1 ${
                              aiEvolution.trend === 'improving' ? 'text-emerald-500' :
                              aiEvolution.trend === 'declining' ? 'text-red-400' : 'text-muted-foreground'
                            }`}>
                              {aiEvolution.trend === 'improving' ? <ArrowUpRight className="h-3.5 w-3.5" /> :
                               aiEvolution.trend === 'declining' ? <ArrowDownRight className="h-3.5 w-3.5" /> :
                               <Minus className="h-3.5 w-3.5" />}
                              {aiEvolution.trend.charAt(0).toUpperCase() + aiEvolution.trend.slice(1)}
                            </span>
                          ) : null}
                          <span className="text-xs text-muted-foreground/50">
                            · {aiAnalyses.length} PR{aiAnalyses.length !== 1 ? 's' : ''} analyzed
                            {useServer ? ` · ${serverInsights!.memoryCount} memories` : ''}
                          </span>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            </motion.div>

            {/* Score rings (1/3) */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              className="rounded-2xl border border-border/40 bg-card/40 backdrop-blur-xl p-6 flex flex-col"
            >
              <h3 className="text-xs font-semibold text-muted-foreground/60 uppercase tracking-wider mb-6">
                Performance Breakdown
              </h3>
              <div className="flex-1 flex flex-col justify-around gap-4">
                <div className="flex items-center gap-4">
                  <ScoreRing value={aiInsights.complexityScore} label="Complexity" color="#3b82f6" />
                  <div className="flex-1">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-muted-foreground/70">Avg PR Complexity</span>
                      <span className="font-semibold text-foreground">{aiInsights.complexityScore}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted/30 overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${aiInsights.complexityScore}%` }} />
                    </div>
                  </div>
                </div>
                <div className="w-full h-px bg-border/30" />
                <div className="flex items-center gap-4">
                  <ScoreRing value={aiInsights.confidenceScore} label="Confidence" color="#10b981" />
                  <div className="flex-1">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-muted-foreground/70">AI Confidence</span>
                      <span className="font-semibold text-foreground">{aiInsights.confidenceScore}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted/30 overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${aiInsights.confidenceScore}%` }} />
                    </div>
                  </div>
                </div>
                <div className="w-full h-px bg-border/30" />
                <div className="flex items-center gap-4">
                  <ScoreRing value={aiInsights.volumeScore} label="Volume" color="#a855f7" />
                  <div className="flex-1">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-muted-foreground/70">PRs Analyzed</span>
                      <span className="font-semibold text-foreground">{aiAnalyses.length}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted/30 overflow-hidden">
                      <div className="h-full bg-violet-500 rounded-full" style={{ width: `${aiInsights.volumeScore}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* ── Pull Request Activity ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.3 }}
            className="rounded-2xl border border-border/40 bg-card/40 backdrop-blur-xl overflow-hidden"
          >
            {/* Table header */}
            <div className="px-6 pt-4 pb-3 border-b border-border/40 space-y-3">
              {/* Title row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <GitPullRequest className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-semibold text-foreground">Pull Request Activity</h3>
                  {devPRs.length > 0 && (
                    <span className="text-xs text-muted-foreground/60 bg-muted/40 px-2 py-0.5 rounded-full border border-border/30">
                      {filteredPRs.length}{filteredPRs.length !== devPRs.length && `/${devPRs.length}`}
                    </span>
                  )}
                </div>
                {/* Search */}
                {devPRs.length > 0 && (
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
              {devPRs.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  <SlidersHorizontal className="h-3 w-3 text-muted-foreground/40 mr-0.5" />
                  {(['all', 'merged', 'review_requested', 'approved', 'changes_requested', 'draft'] as const).map((status) => {
                    const count = status === 'all' ? devPRs.length : (statusCounts[status] ?? 0);
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

            {devPRs.length === 0 ? (
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
