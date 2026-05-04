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
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from 'recharts';

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

/**
 * Performance tier verdict — synthesized from the same metrics that
 * power the strengths/growth lists, but reduced to a single closing
 * recommendation sentence appended to the narrative summary.
 *
 * Score model (0–100):
 *   complexity owned     → 30 pts
 *   AI confidence        → 20 pts
 *   tech variety         → 15 pts
 *   sustained volume     → 10 pts
 *   refactor discipline  → 10 pts
 *   test discipline      → 10 pts
 *   PR-size consistency  →  5 pts
 *
 * Tiers:
 *   ≥ 82 → 'staff'      (rare combination of high complexity, broad stack, refactor/test discipline)
 *   65–81 → 'senior'     (heavy work, broad stack, healthy mix)
 *   50–64 → 'mid+'       (advanced mid-level, ready for stretch)
 *   35–49 → 'mid'        (solid contributor, growth opportunities visible)
 *   < 35  → 'junior'     (early-career signals, ramp-up curve)
 *
 * Trajectory tone is layered on top of the tier so the closing sentence
 * reflects both *where* the developer is and *which way they're going*.
 */
type PerformanceTier = 'junior' | 'mid' | 'mid+' | 'senior' | 'staff';

interface VerdictInput {
  avgComplexity: number;
  avgConfidence: number;
  techCount: number;
  total: number;
  refactorRatio: number;
  testRatio: number;
  stdDev: number;
  trend: string;
}

function derivePerformanceVerdict(input: VerdictInput): {
  tier: PerformanceTier;
  score: number;
  sentence: string;
} {
  const { avgComplexity, avgConfidence, techCount, total, refactorRatio, testRatio, stdDev, trend } = input;

  // Sample too small → bail with an explicit "not enough data" sentence.
  if (total < 5) {
    return {
      tier: 'mid',
      score: 0,
      sentence: `Sample size (${total} PR${total === 1 ? '' : 's'}) is too small for a confident performance read — analyze more PRs to sharpen the signal.`,
    };
  }

  // ── Score the developer ──
  let score = 0;
  // Complexity owned (30)
  if (avgComplexity >= 70) score += 30;
  else if (avgComplexity >= 55) score += 22;
  else if (avgComplexity >= 40) score += 14;
  else score += 6;

  // AI confidence (20) — high confidence = code reads cleanly
  if (avgConfidence >= 85) score += 20;
  else if (avgConfidence >= 70) score += 14;
  else if (avgConfidence >= 55) score += 8;
  else score += 3;

  // Tech variety (15)
  if (techCount >= 25) score += 15;
  else if (techCount >= 12) score += 11;
  else if (techCount >= 6) score += 7;
  else if (techCount >= 3) score += 4;

  // Sustained volume (10)
  if (total >= 50) score += 10;
  else if (total >= 25) score += 7;
  else if (total >= 12) score += 4;
  else score += 1;

  // Refactor discipline (10)
  if (refactorRatio >= 0.2) score += 10;
  else if (refactorRatio >= 0.1) score += 6;
  else if (refactorRatio >= 0.05) score += 3;

  // Test discipline (10)
  if (testRatio >= 0.2) score += 10;
  else if (testRatio >= 0.1) score += 6;
  else if (testRatio >= 0.05) score += 3;

  // PR-size consistency (5)
  if (stdDev < 12) score += 5;
  else if (stdDev < 20) score += 3;
  else if (stdDev < 28) score += 1;

  // ── Map score → tier ──
  let tier: PerformanceTier;
  if (score >= 82) tier = 'staff';
  else if (score >= 65) tier = 'senior';
  else if (score >= 50) tier = 'mid+';
  else if (score >= 35) tier = 'mid';
  else tier = 'junior';

  // ── Trajectory-aware sentence ──
  // The action verb at the end of each sentence is what tech leads
  // care about: hold, stretch, protect, invest, intervene.
  const sentencesByTier: Record<PerformanceTier, Record<'improving' | 'stable' | 'declining', string>> = {
    staff: {
      improving:
        'Performance reads at staff/lead caliber and the trajectory is still climbing — protect their focus and trust them with cross-cutting work.',
      stable:
        'Performance reads at staff/lead caliber — give them the hardest, most ambiguous problems and watch the rest of the team learn from their PRs.',
      declining:
        'Still operating at staff/lead caliber but recent complexity is trending down — check whether they\'re unblocked or being pulled into too many side projects.',
    },
    senior: {
      improving:
        'Currently performing at senior level with a clearly upward trajectory — promote-ready signal, stretch them with cross-team work.',
      stable:
        'Holds steady at senior level — consistent contributor the team relies on. Worth pairing them on the heaviest upcoming work.',
      declining:
        'Performance reads at senior level, but recent complexity is trending down — worth a 1:1 to understand whether scope, focus or motivation is shifting.',
    },
    'mid+': {
      improving:
        'Sits at advanced mid-level with a clear upward trajectory — promote-ready candidate, invest in stretch projects this quarter.',
      stable:
        'Solidly at advanced mid-level — consistent performer, ready for slightly heavier challenges to unlock the next step.',
      declining:
        'Currently at advanced mid-level, but momentum is slipping — protect their focus and clear blockers before complexity drops further.',
    },
    mid: {
      improving:
        'Mid-level today and growing fast — invest in stretch work and pair with a senior on the next ambitious project.',
      stable:
        'Comfortable mid-level performer — ready for slightly heavier challenges to keep growing.',
      declining:
        'Mid-level with declining complexity — worth a 1:1 to understand context before assuming this is just scope, not motivation.',
    },
    junior: {
      improving:
        'Early-career signals, but the trajectory is healthy — pair with seniors on stretch work to accelerate the ramp.',
      stable:
        'Junior-level signals — pair with seniors on stretch work and gradually increase scope to build confidence.',
      declining:
        'Early-career signals are dropping — likely needs more support, clearer requirements and a steadier mentor cycle.',
    },
  };

  const traj = (trend === 'improving' || trend === 'declining' ? trend : 'stable') as
    | 'improving'
    | 'stable'
    | 'declining';
  return {
    tier,
    score,
    sentence: sentencesByTier[tier][traj],
  };
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

  // ── Performance tier verdict (appended to the summary) ──
  // We synthesize a tier and a forward-looking sentence so the narrative
  // doesn't end on a number — it ends on a recommendation.
  const verdict = derivePerformanceVerdict({
    avgComplexity,
    avgConfidence,
    techCount: techSet.size,
    total: analyses.length,
    refactorRatio: (typeCounts['refactor'] ?? 0) / Math.max(analyses.length, 1),
    testRatio: (typeCounts['test'] ?? 0) / Math.max(analyses.length, 1),
    stdDev: (() => {
      const m = analyses.reduce((s, a) => s + a.complexityScore, 0) / Math.max(analyses.length, 1);
      const v = analyses.reduce((s, a) => s + Math.pow(a.complexityScore - m, 2), 0) / Math.max(analyses.length, 1);
      return Math.sqrt(v);
    })(),
    trend,
  });

  const summary = `Works primarily on ${topType} tasks with ${complexityLabel} PRs (avg score ${avgComplexity}/100). `
    + `${techList ? `Main technologies: ${techList}. ` : ''}`
    + `AI scoring shows ${trendLabel} over the tracked period, with ${avgConfidence}% average confidence in assessments. `
    + verdict.sentence;

  // ── Distribution math used by several signals ──
  const total = analyses.length;
  const featureRatio = (typeCounts['feature'] ?? 0) / total;
  const refactorRatio = (typeCounts['refactor'] ?? 0) / total;
  const testRatio = (typeCounts['test'] ?? 0) / total;
  const bugfixRatio = (typeCounts['bugfix'] ?? 0) / total;
  const docsRatio = (typeCounts['docs'] ?? 0) / total;

  // Variance over complexity scores — proxy for consistency
  const meanCplx = analyses.reduce((s, a) => s + a.complexityScore, 0) / total;
  const variance =
    analyses.reduce((s, a) => s + Math.pow(a.complexityScore - meanCplx, 2), 0) / total;
  const stdDev = Math.sqrt(variance);

  // Recent activity — last 14 days
  const fourteenDaysAgo = Date.now() - 14 * 86_400_000;
  const recentCount = analyses.filter(
    (a) => new Date(a.createdAt).getTime() >= fourteenDaysAgo,
  ).length;

  // Tech variety
  const techCount = techSet.size;

  /**
   * Tier-aware insight signals.
   *
   * Each signal is a `[priority, message]` tuple. The priority lets us
   * sort so the strongest, most differentiating observations land at the
   * top of the list. Most signals also pick *different copy* depending
   * on a tier (e.g. someone with 42 technologies reads a different
   * sentence than someone with 8 — we explicitly call out the difference
   * instead of using the same generic 'versatile' label for both).
   */
  type Signal = [priority: number, msg: string];
  const strengthSignals: Signal[] = [];
  const growthSignals: Signal[] = [];

  // ─── Tech variety — graded by breadth ───
  if (techCount >= 25) {
    strengthSignals.push([95, `Stack omnivore — fluent across ${techCount} distinct technologies, exceptionally rare breadth`]);
  } else if (techCount >= 15) {
    strengthSignals.push([88, `Polyglot contributor — ${techCount} technologies with confident handling across the codebase`]);
  } else if (techCount >= 8) {
    strengthSignals.push([78, `Strong cross-stack presence — works across ${techCount} technologies`]);
  } else if (techCount >= 4) {
    strengthSignals.push([60, `Comfortable across ${techCount} technologies — covers the core stack`]);
  } else if (techCount >= 2) {
    strengthSignals.push([45, `Focused on ${techCount} primary technologies — deep over wide`]);
  }
  if (techCount === 1 && total >= 5) {
    growthSignals.push([72, 'Work concentrated on a single technology — cross-stack exposure could broaden impact']);
  }

  // ─── AI confidence — graded ───
  if (avgConfidence >= 90) {
    strengthSignals.push([92, `Crystal-clear changes — AI nails ${avgConfidence}% of assessments, top-tier code legibility`]);
  } else if (avgConfidence >= 80) {
    strengthSignals.push([82, `Highly legible code — ${avgConfidence}% AI confidence means PRs are easy to review`]);
  } else if (avgConfidence >= 70) {
    strengthSignals.push([68, `Consistent, predictable code changes — ${avgConfidence}% AI confidence sits comfortably`]);
  }
  if (avgConfidence < 50) {
    growthSignals.push([90, `Low ${avgConfidence}% AI confidence — PRs land without enough context to read confidently`]);
  } else if (avgConfidence < 65) {
    growthSignals.push([70, `${avgConfidence}% AI confidence — descriptive titles and bodies would lift signal quality`]);
  }

  // ─── Complexity range / impact ───
  if (avgComplexity > 75 && avgConfidence >= 70) {
    strengthSignals.push([90, `High-impact contributor — avg complexity ${avgComplexity}/100 owned with clear AI signal`]);
  } else if (avgComplexity >= 55 && avgComplexity <= 75 && avgConfidence >= 65) {
    strengthSignals.push([70, `Owns moderate-weight work — ${avgComplexity}/100 average sits in productive territory`]);
  } else if (avgComplexity <= 35 && total >= 5) {
    strengthSignals.push([55, `Ships small, fast-merge PRs (avg ${avgComplexity}/100) — keeps the queue moving`]);
  } else if (avgComplexity <= 50 && total >= 5) {
    strengthSignals.push([50, `Manageable, reviewable PRs (avg ${avgComplexity}/100) — friendly to the review queue`]);
  }
  if (avgComplexity > 80) {
    growthSignals.push([85, `Heavy PR scope (avg ${avgComplexity}/100) — splitting large changes would speed reviews`]);
  } else if (avgComplexity > 70) {
    growthSignals.push([60, `Borderline-heavy PRs (avg ${avgComplexity}/100) — a couple of splits could ease the load`]);
  }

  // ─── Variance / consistency ───
  if (stdDev < 8 && total >= 5) {
    strengthSignals.push([72, `Highly predictable PR sizing — almost no variance, planning is easy`]);
  } else if (stdDev < 14 && total >= 5) {
    strengthSignals.push([55, `Predictable PR sizing — low complexity variance makes review estimates accurate`]);
  }
  if (stdDev > 28 && total >= 5) {
    growthSignals.push([62, `PR size swings widely (σ=${Math.round(stdDev)}) — narrower scope per PR would speed reviews`]);
  } else if (stdDev > 22 && total >= 5) {
    growthSignals.push([45, `Moderate variance in PR size — try to keep changes within a tighter scope`]);
  }

  // ─── Recent momentum ───
  if (recentCount >= 10) {
    strengthSignals.push([85, `High recent throughput — ${recentCount} PRs analyzed in the last 14 days`]);
  } else if (recentCount >= 5) {
    strengthSignals.push([62, `Steady recent momentum — ${recentCount} PRs analyzed in the last 14 days`]);
  } else if (recentCount >= 2) {
    strengthSignals.push([40, `Active in the last 14 days — ${recentCount} fresh PRs analyzed`]);
  }
  if (recentCount === 0 && total > 0) {
    growthSignals.push([55, 'No PRs analyzed in the last 14 days — fresh data would sharpen the assessment']);
  }

  // ─── Sustained contribution ───
  if (total >= 60) {
    strengthSignals.push([75, `Power user — ${total} analyzed PRs give exceptionally rich signal`]);
  } else if (total >= 25) {
    strengthSignals.push([55, `High-throughput contributor — ${total} PRs in the dataset deliver high signal quality`]);
  } else if (total >= 12) {
    strengthSignals.push([42, `Sustained contributor — ${total} PRs is enough to trust the signals`]);
  }
  if (total < 5) {
    growthSignals.push([35, `Only ${total} PR${total === 1 ? '' : 's'} analyzed — analyze more for sturdier insights`]);
  }

  // ─── Feature delivery ratio ───
  if (featureRatio >= 0.7 && featureRatio <= 0.85) {
    strengthSignals.push([58, `Heavy feature focus (${Math.round(featureRatio * 100)}%) — most work moves the product forward`]);
  } else if (featureRatio >= 0.5 && featureRatio < 0.7) {
    strengthSignals.push([48, `Solid feature cadence (${Math.round(featureRatio * 100)}%) — balanced output`]);
  }
  if (featureRatio > 0.9) {
    growthSignals.push([70, `${Math.round(featureRatio * 100)}% of work is features — debt and refactor will accumulate without explicit time for them`]);
  } else if (featureRatio > 0.85) {
    growthSignals.push([50, `Feature-dominant (${Math.round(featureRatio * 100)}%) — schedule occasional refactor blocks to balance`]);
  }

  // ─── Refactor discipline ───
  if (refactorRatio >= 0.3) {
    strengthSignals.push([65, `Strong refactoring discipline — ${Math.round(refactorRatio * 100)}% of work targets technical debt`]);
  } else if (refactorRatio >= 0.15) {
    strengthSignals.push([50, `Actively pays down technical debt — ${Math.round(refactorRatio * 100)}% refactor PRs`]);
  } else if (refactorRatio >= 0.07) {
    strengthSignals.push([35, `Touches refactor work occasionally (${Math.round(refactorRatio * 100)}%)`]);
  }

  // ─── Test discipline ───
  if (testRatio >= 0.3) {
    strengthSignals.push([65, `Test-first leader — ${Math.round(testRatio * 100)}% dedicated test PRs, exceptional discipline`]);
  } else if (testRatio >= 0.15) {
    strengthSignals.push([52, `Strong test investment — ${Math.round(testRatio * 100)}% of work is dedicated coverage`]);
  } else if (testRatio >= 0.07) {
    strengthSignals.push([38, `Mixes in test PRs (${Math.round(testRatio * 100)}%) alongside features`]);
  }
  if (testRatio < 0.05 && total >= 8) {
    growthSignals.push([60, 'Almost no test-only PRs — dedicated coverage work could harden the codebase']);
  }

  // ─── Bugfix balance ───
  if (bugfixRatio >= 0.18 && bugfixRatio <= 0.32) {
    strengthSignals.push([42, `Healthy mix of fixes and features (${Math.round(bugfixRatio * 100)}% bugfix) — keeps the codebase honest`]);
  }
  if (bugfixRatio > 0.55) {
    growthSignals.push([78, `${Math.round(bugfixRatio * 100)}% of work is bugfixes — investigate upstream root causes`]);
  } else if (bugfixRatio > 0.4) {
    growthSignals.push([45, `${Math.round(bugfixRatio * 100)}% bugfix ratio is on the high side — root-cause work could reduce it`]);
  }

  // ─── Trend ───
  if (trend === 'improving') {
    strengthSignals.push([72, 'Taking on progressively heavier work — clear sign of growth']);
  } else if (trend === 'declining') {
    growthSignals.push([35, 'Complexity trending down — confirm this matches the planned trajectory']);
  }

  // ─── Documentation gap ───
  if (docsRatio < 0.03 && refactorRatio < 0.1 && total >= 8) {
    growthSignals.push([40, 'Documentation and refactor PRs are rare — schedule explicit time for them']);
  }

  // Sort by priority (highest first), then drop priority and use the message
  strengthSignals.sort((a, b) => b[0] - a[0]);
  growthSignals.sort((a, b) => b[0] - a[0]);
  const strengths = strengthSignals.map(([, m]) => m);
  const areasForImprovement = growthSignals.map(([, m]) => m);

  // Always guarantee at least 3 strengths and 3 growth areas. Pad with
  // baseline observations rather than leaving the lists thin.
  while (strengths.length < 3) {
    if (total >= 5 && !strengths.some((s) => s.startsWith('Active'))) {
      strengths.push('Active engineer with a steady stream of analyzed PRs');
    } else if (!strengths.some((s) => s.startsWith('AI scoring'))) {
      strengths.push(`AI scoring shows ${trendLabel} — useful baseline for reviews`);
    } else if (!strengths.some((s) => s.startsWith('Code is'))) {
      strengths.push('Code is legible enough that AI summaries land coherently');
    } else {
      strengths.push('Maintains current PR quality standards');
    }
  }
  while (areasForImprovement.length < 3) {
    if (!areasForImprovement.some((g) => g.startsWith('Pair more'))) {
      areasForImprovement.push('Pair more recent PRs with descriptive bodies — even 2 lines of context boost AI confidence');
    } else if (!areasForImprovement.some((g) => g.startsWith('Consider'))) {
      areasForImprovement.push('Consider squad-level reviews on the heaviest PRs to spread context');
    } else if (!areasForImprovement.some((g) => g.startsWith('Document'))) {
      areasForImprovement.push('Document architectural decisions inline so future analyses have richer signal');
    } else {
      areasForImprovement.push('Maintain current cadence and revisit insights monthly');
    }
  }

  const volumeScore = Math.min(100, Math.round(total * 5));

  return {
    summary,
    strengths: strengths.slice(0, 4),
    areasForImprovement: areasForImprovement.slice(0, 4),
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

          {/* ── AI Insights — full redesign with rich data viz ── */}
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

            // ─── Build chart data from PrAnalysis array ───
            // X axis uses the array index (categorical), so each analysis
            // gets its own slot regardless of when the AI happened to
            // process it. `createdAt` is *the analysis timestamp*, not
            // the PR creation date — a single batch-analyze run produces
            // dozens of analyses within seconds of each other and a
            // time-scale axis squashes them all together.
            const sortedAnalyses = [...aiAnalyses].sort(
              (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
            );
            const complexityTimeSeries = sortedAnalyses.map((a, index) => {
              const hasPr = !!a.githubPullRequest;
              const created = new Date(a.createdAt);
              return {
                idx: index,
                date: created.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                fullDate: created.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                }),
                complexity: a.complexityScore,
                confidence: Math.round(a.confidence * 100),
                title: hasPr
                  ? a.githubPullRequest!.title
                  : (a.technicalSummary?.slice(0, 80) || 'Commit-level analysis'),
                ref: hasPr
                  ? `#${a.githubPullRequest!.prNumber}`
                  : `${a.changeType ?? 'analysis'}`.toLowerCase(),
                kind: hasPr ? 'pr' : 'commit',
                difficulty: a.difficultyLabel,
              };
            });

            // Pick ~5 evenly-spaced indices for the X-axis labels.
            const tickIndices = (() => {
              const n = complexityTimeSeries.length;
              if (n <= 5) return complexityTimeSeries.map((_, i) => i);
              const step = (n - 1) / 4;
              return [0, 1, 2, 3, 4].map((k) => Math.round(k * step));
            })();

            // Work distribution by changeType — palette tuned so each slice
            // is clearly distinguishable side-by-side. Avoids the previous
            // violet/iris collision (refactor was too close to feature).
            const typeColors: Record<string, string> = {
              feature:  'hsl(262 88% 68%)',  // violet
              bugfix:   'hsl(8 86% 62%)',    // coral red
              refactor: 'hsl(195 92% 55%)',  // cyan
              test:     'hsl(152 72% 50%)',  // green
              docs:     'hsl(40 95% 65%)',   // amber
              chore:    'hsl(220 12% 55%)',  // slate
              other:    'hsl(320 76% 68%)',  // pink
            };
            const typeCounts = aiAnalyses.reduce<Record<string, number>>((acc, a) => {
              const k = a.changeType?.toLowerCase() ?? 'other';
              acc[k] = (acc[k] ?? 0) + 1;
              return acc;
            }, {});
            const workDistribution = Object.entries(typeCounts)
              .map(([name, value]) => ({
                name: name.charAt(0).toUpperCase() + name.slice(1),
                value,
                color: typeColors[name] ?? typeColors.other,
              }))
              .sort((a, b) => b.value - a.value);

            // Recent analyses for the bottom section (newest first)
            const recentAnalyses = [...aiAnalyses]
              .sort(
                (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
              )
              .slice(0, 4);

            // Stand-out PR — highest complexity in the set
            const heaviestPr = aiAnalyses.length > 0
              ? aiAnalyses.reduce((heaviest, a) =>
                  a.complexityScore > heaviest.complexityScore ? a : heaviest,
                )
              : null;

            return (
              <>
                {/* ── Action toolbar ── */}
                <motion.section
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08, duration: 0.4 }}
                  className="flex items-center justify-between gap-3 flex-wrap"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-xl border border-primary/30 bg-primary/10 flex items-center justify-center text-primary">
                      <BrainCircuit className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-primary/85">
                          Intelligence
                        </p>
                        <span className="inline-flex items-center gap-1 rounded-full border border-secondary/30 bg-secondary/10 px-2 py-0.5 text-[9.5px] font-medium text-secondary">
                          <Sparkles className="h-2.5 w-2.5" />
                          AI
                        </span>
                      </div>
                      <h2 className="mt-0.5 font-display text-[18px] font-light leading-none tracking-[-0.01em]">
                        Performance Insights
                      </h2>
                    </div>
                  </div>

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
                          ? `Analyzing ${Math.max(0, aiAnalyses.length - commitBaseline)}/${commitQueued}`
                          : 'Analyze commits'
                      }
                      onClick={handleAnalyzeCommits}
                      disabled={isAnalyzingCommits || isAnalyzing || isClearingMemory}
                      variant="secondary"
                      loading={isAnalyzingCommits}
                      title="Analyze recent unanalyzed commits"
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
                </motion.section>

                {analyzeError && (
                  <div className="rounded-lg border border-destructive/30 bg-destructive/8 px-3 py-2 text-[12px] text-destructive">
                    {analyzeError}
                  </div>
                )}
                {clearMemoryFeedback && (
                  <div className="rounded-lg border border-success/30 bg-success/8 px-3 py-2 text-[12px] text-success">
                    {clearMemoryFeedback}
                  </div>
                )}

                {/* ── KPI strip — at-a-glance numbers tech leads care about ── */}
                <motion.section
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.5 }}
                  className="grid grid-cols-2 lg:grid-cols-4 gap-3"
                >
                  <AiKpi
                    label="Avg complexity"
                    value={aiInsights.complexityScore}
                    unit="/100"
                    hint={
                      aiInsights.complexityScore > 70
                        ? 'heavy work'
                        : aiInsights.complexityScore > 40
                          ? 'moderate'
                          : 'light work'
                    }
                    color="hsl(262 88% 68%)"
                    trend={
                      aiEvolution?.trend === 'improving'
                        ? 'up'
                        : aiEvolution?.trend === 'declining'
                          ? 'down'
                          : null
                    }
                  />
                  <AiKpi
                    label="AI confidence"
                    value={aiInsights.confidenceScore}
                    unit="%"
                    hint={aiInsights.confidenceScore >= 75 ? 'high signal' : 'noisy data'}
                    color="hsl(152 72% 50%)"
                  />
                  <AiKpi
                    label="PRs analyzed"
                    value={aiAnalyses.length}
                    hint={
                      useServer
                        ? `${serverInsights!.memoryCount} memories`
                        : aiAnalyses.length > 0
                          ? 'in dataset'
                          : 'not yet'
                    }
                    color="hsl(232 78% 64%)"
                  />
                  <AiKpi
                    label="Heaviest PR"
                    value={heaviestPr?.complexityScore ?? 0}
                    unit="/100"
                    hint={
                      heaviestPr?.githubPullRequest?.prNumber
                        ? `#${heaviestPr.githubPullRequest.prNumber}`
                        : '—'
                    }
                    color="hsl(320 76% 70%)"
                  />
                </motion.section>

                {/* ── Charts row: complexity over time + work distribution ── */}
                {hasInsights && complexityTimeSeries.length > 0 && (
                  <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-5">
                    {/* Complexity over time — overflow-visible so the
                        tooltip can render outside the panel; explicit
                        z-index keeps it above the sibling 'Work
                        distribution' card whose framer-motion transform
                        creates its own stacking context. */}
                    <motion.section
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15, duration: 0.5 }}
                      className="artemis-panel relative rounded-[24px] p-6 z-20"
                    >
                      <div
                        aria-hidden
                        className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent overflow-hidden"
                      />
                      <header className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-[14px] font-semibold leading-none">Complexity over time</h3>
                          <p className="mt-1 text-[11.5px] text-muted-foreground/70">
                            Per-PR difficulty score, ordered chronologically.
                          </p>
                        </div>
                        {trendInfo && trendInfo.kind !== 'narrative' && (
                          <TrendPill kind={trendInfo.kind} label={trendInfo.label} />
                        )}
                      </header>

                      <ResponsiveContainer width="100%" height={260}>
                        <AreaChart
                          data={complexityTimeSeries}
                          // Generous top margin so the tooltip card has
                          // headroom when a point is near the top of the
                          // chart — combined with allowEscapeViewBox below.
                          margin={{ top: 16, right: 12, left: -12, bottom: 4 }}
                        >
                          <defs>
                            <linearGradient id="cplx-fill" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="hsl(262 95% 70%)" stopOpacity={0.45} />
                              <stop offset="80%" stopColor="hsl(262 95% 70%)" stopOpacity={0.04} />
                              <stop offset="100%" stopColor="hsl(262 95% 70%)" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="cplx-stroke" x1="0" y1="0" x2="1" y2="0">
                              <stop offset="0%" stopColor="hsl(232 88% 72%)" />
                              <stop offset="55%" stopColor="hsl(262 95% 72%)" />
                              <stop offset="100%" stopColor="hsl(320 88% 74%)" />
                            </linearGradient>
                          </defs>
                          <CartesianGrid
                            vertical={false}
                            stroke="hsl(220 14% 50%)"
                            strokeOpacity={0.12}
                            strokeDasharray="2 4"
                          />
                          <XAxis
                            dataKey="idx"
                            type="number"
                            domain={[0, Math.max(complexityTimeSeries.length - 1, 0)]}
                            tickLine={false}
                            axisLine={false}
                            ticks={tickIndices}
                            tickFormatter={(value: number) =>
                              complexityTimeSeries[value]?.date ?? ''
                            }
                            tick={{
                              fill: 'hsl(220 14% 55%)',
                              fontSize: 10,
                              fontFamily: 'ui-monospace, monospace',
                            }}
                          />
                          <YAxis
                            tickLine={false}
                            axisLine={false}
                            domain={[0, 100]}
                            ticks={[0, 50, 100]}
                            width={32}
                            tick={{
                              fill: 'hsl(220 14% 45%)',
                              fontSize: 10,
                              fontFamily: 'ui-monospace, monospace',
                            }}
                          />
                          <RechartsTooltip
                            cursor={{ stroke: 'hsl(262 95% 75% / 0.4)', strokeWidth: 1 }}
                            offset={20}
                            allowEscapeViewBox={{ x: true, y: true }}
                            // wrapperStyle is applied to the tooltip's
                            // outer div. A very high z-index here is
                            // ignored because sibling motion.sections
                            // create their own stacking contexts. We rely
                            // on the parent panel's z-20 to outrank them.
                            wrapperStyle={{
                              outline: 'none',
                              zIndex: 9999,
                              pointerEvents: 'none',
                            }}
                            content={({ active, payload }) => {
                              if (!active || !payload?.length) return null;
                              const p = payload[0].payload;
                              const cplxTone =
                                p.complexity >= 75
                                  ? 'text-amber-400'
                                  : p.complexity >= 50
                                    ? 'text-primary'
                                    : 'text-success';
                              const confTone =
                                p.confidence >= 75
                                  ? 'text-success'
                                  : p.confidence >= 60
                                    ? 'text-foreground'
                                    : 'text-amber-400';
                              return (
                                <div className="rounded-xl border border-border/55 bg-card/95 backdrop-blur-md px-3.5 py-2.5 shadow-orbit min-w-[240px] max-w-[300px]">
                                  <div className="flex items-center gap-2 mb-1.5">
                                    <span
                                      className={`inline-flex items-center rounded-full border px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider ${
                                        p.kind === 'pr'
                                          ? 'border-primary/35 bg-primary/10 text-primary'
                                          : 'border-secondary/35 bg-secondary/10 text-secondary'
                                      }`}
                                    >
                                      {p.kind === 'pr' ? p.ref : p.ref}
                                    </span>
                                    <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground/55 ml-auto">
                                      {p.fullDate}
                                    </span>
                                  </div>
                                  <p className="text-[12px] text-foreground/95 leading-snug line-clamp-2">
                                    {p.title}
                                  </p>
                                  <div className="mt-2.5 pt-2.5 border-t border-border/30 grid grid-cols-3 gap-2">
                                    <div>
                                      <p className="text-[9px] font-mono uppercase text-muted-foreground/55">
                                        Cplx
                                      </p>
                                      <p className={`mt-0.5 font-display text-[18px] font-light leading-none tabular-nums ${cplxTone}`}>
                                        {p.complexity}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-[9px] font-mono uppercase text-muted-foreground/55">
                                        Conf
                                      </p>
                                      <p className={`mt-0.5 font-display text-[18px] font-light leading-none tabular-nums ${confTone}`}>
                                        {p.confidence}%
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-[9px] font-mono uppercase text-muted-foreground/55">
                                        Level
                                      </p>
                                      <p className="mt-0.5 text-[11px] font-medium text-foreground/85 leading-none capitalize">
                                        {p.difficulty ?? '—'}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              );
                            }}
                          />
                          <Area
                            type="monotone"
                            dataKey="complexity"
                            stroke="url(#cplx-stroke)"
                            strokeWidth={2}
                            fill="url(#cplx-fill)"
                            dot={{
                              r: 3,
                              fill: 'hsl(262 95% 75%)',
                              strokeWidth: 0,
                            }}
                            activeDot={{
                              r: 5,
                              fill: 'hsl(0 0% 100%)',
                              stroke: 'hsl(262 95% 75%)',
                              strokeWidth: 2,
                            }}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </motion.section>

                    {/* Work distribution donut */}
                    <motion.section
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2, duration: 0.5 }}
                      className="artemis-panel relative overflow-hidden rounded-[24px] p-6"
                    >
                      <div
                        aria-hidden
                        className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent"
                      />
                      <header className="mb-3">
                        <h3 className="text-[14px] font-semibold leading-none">Work distribution</h3>
                        <p className="mt-1 text-[11.5px] text-muted-foreground/70">
                          Where their PRs land by change type.
                        </p>
                      </header>

                      <div className="grid grid-cols-[140px_1fr] gap-4 items-center">
                        <ResponsiveContainer width="100%" height={140}>
                          <PieChart>
                            <Pie
                              data={workDistribution}
                              dataKey="value"
                              nameKey="name"
                              innerRadius={42}
                              outerRadius={64}
                              strokeWidth={0}
                              paddingAngle={2}
                            >
                              {workDistribution.map((slice, i) => (
                                <Cell key={i} fill={slice.color} />
                              ))}
                            </Pie>
                            <RechartsTooltip
                              content={({ active, payload }) => {
                                if (!active || !payload?.length) return null;
                                const p = payload[0].payload;
                                const pct = Math.round(
                                  (p.value / workDistribution.reduce((s, w) => s + w.value, 0)) * 100,
                                );
                                return (
                                  <div className="rounded-lg border border-border/55 bg-card/95 backdrop-blur-md px-3 py-2 shadow-orbit">
                                    <p className="text-[12px] font-medium" style={{ color: p.color }}>
                                      {p.name}
                                    </p>
                                    <p className="mt-0.5 font-mono text-[10.5px] tabular-nums text-muted-foreground/85">
                                      {p.value} PR{p.value !== 1 ? 's' : ''} · {pct}%
                                    </p>
                                  </div>
                                );
                              }}
                            />
                          </PieChart>
                        </ResponsiveContainer>

                        <ul className="space-y-1.5 min-w-0">
                          {workDistribution.slice(0, 5).map((slice) => {
                            const pct = Math.round(
                              (slice.value / workDistribution.reduce((s, w) => s + w.value, 0)) * 100,
                            );
                            return (
                              <li
                                key={slice.name}
                                className="flex items-center gap-2 text-[11.5px]"
                              >
                                <span
                                  aria-hidden
                                  className="h-2 w-2 rounded-full shrink-0"
                                  style={{ background: slice.color }}
                                />
                                <span className="text-foreground/85 truncate">{slice.name}</span>
                                <span className="ml-auto font-mono tabular-nums text-muted-foreground/60">
                                  {pct}%
                                </span>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    </motion.section>
                  </div>
                )}

                {/* ── Narrative + Strengths/Growth ── */}
                <motion.section
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25, duration: 0.5 }}
                  className="artemis-panel relative overflow-hidden rounded-[24px] p-6 md:p-7"
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
                        'radial-gradient(circle, hsl(262 95% 65% / 0.25) 0%, transparent 70%)',
                    }}
                  />

                  <div className="relative">
                    <header className="mb-4">
                      <p className="text-[10px] font-mono uppercase tracking-[0.16em] text-secondary/85 mb-1.5">
                        Narrative
                      </p>
                      <h3 className="font-display text-[20px] font-light leading-tight tracking-[-0.015em]">
                        How they ship
                      </h3>
                    </header>

                    {!hasInsights ? (
                      <div className="py-10 text-center max-w-md mx-auto">
                        <div className="h-12 w-12 rounded-2xl bg-card/50 border border-border/40 flex items-center justify-center mx-auto mb-3">
                          <BrainCircuit className="h-5 w-5 text-muted-foreground/60" />
                        </div>
                        <p className="text-[14px] font-medium text-foreground">No analyses yet</p>
                        <p className="mt-1.5 text-[12.5px] text-muted-foreground/75 leading-relaxed">
                          Click <span className="text-primary font-medium">Analyze PRs</span> at the top to
                          let the AI build a narrative based on real diffs.
                        </p>
                      </div>
                    ) : (
                      <>
                        {/* Quote-style narrative */}
                        <blockquote className="relative pl-5 border-l-2 border-primary/40 max-w-3xl">
                          <p className="text-[14.5px] leading-relaxed text-foreground/90">
                            {summaryText}
                          </p>
                        </blockquote>

                        {/* Strengths + Growth */}
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

                        {/* Tech tags */}
                        {techList.length > 0 && (
                          <div className="mt-6 pt-4 border-t border-border/30 flex flex-wrap items-center gap-1.5">
                            <span className="text-[10px] font-mono uppercase tracking-[0.16em] text-muted-foreground/55 mr-1">
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
                      </>
                    )}
                  </div>
                </motion.section>

                {/* ── Recent analyses with AI reasoning ── */}
                {recentAnalyses.length > 0 && (
                  <motion.section
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="space-y-3"
                  >
                    <header className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-mono uppercase tracking-[0.16em] text-primary/85 mb-1.5">
                          Evidence
                        </p>
                        <h3 className="font-display text-[18px] font-light leading-none tracking-[-0.01em]">
                          Recent analyses
                        </h3>
                      </div>
                      <span className="text-[11px] text-muted-foreground/55 font-mono">
                        {recentAnalyses.length} of {aiAnalyses.length}
                      </span>
                    </header>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {recentAnalyses.map((a) => (
                        <AnalysisCard
                          key={a.id}
                          analysis={a}
                          typeColor={typeColors[a.changeType?.toLowerCase() ?? 'other'] ?? typeColors.other}
                        />
                      ))}
                    </div>
                  </motion.section>
                )}
              </>
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

/* ─────────── AI KPI tile (with optional trend arrow) ─────────── */

interface AiKpiProps {
  label: string;
  value: number;
  unit?: string;
  hint?: string;
  color: string;
  trend?: 'up' | 'down' | null;
}

const AiKpi = ({ label, value, unit, hint, color, trend }: AiKpiProps) => (
  <div className="artemis-panel relative overflow-hidden rounded-2xl p-4">
    <div
      aria-hidden
      className="pointer-events-none absolute -top-6 -right-6 h-24 w-24 rounded-full opacity-25 blur-2xl"
      style={{ background: color }}
    />
    <div className="relative">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] font-mono uppercase tracking-[0.14em] text-muted-foreground/55">
          {label}
        </p>
        {trend && (
          <span
            className={`inline-flex h-4 w-4 items-center justify-center rounded-full ${
              trend === 'up'
                ? 'bg-success/15 text-success'
                : 'bg-destructive/15 text-destructive'
            }`}
          >
            {trend === 'up' ? (
              <ArrowUpRight className="h-2.5 w-2.5" />
            ) : (
              <ArrowDownRight className="h-2.5 w-2.5" />
            )}
          </span>
        )}
      </div>
      <p className="mt-2 flex items-baseline gap-1">
        <span className="font-display text-[28px] font-light leading-none tabular-nums">
          {value}
        </span>
        {unit && (
          <span className="text-[12px] text-muted-foreground/55 tabular-nums">
            {unit}
          </span>
        )}
      </p>
      {hint && (
        <p className="mt-1.5 text-[10.5px] text-muted-foreground/60">
          {hint}
        </p>
      )}
    </div>
  </div>
);

/* ─────────── Analysis card — didactic, shows AI reasoning ─────────── */

interface AnalysisCardProps {
  analysis: PrAnalysis;
  typeColor: string;
}

const AnalysisCard = ({ analysis, typeColor }: AnalysisCardProps) => {
  const pr = analysis.githubPullRequest;
  const conf = Math.round(analysis.confidence * 100);
  const cplx = analysis.complexityScore;
  const cplxTone =
    cplx >= 75 ? 'text-amber-400' : cplx >= 50 ? 'text-primary' : 'text-success';

  // Extract first 2 technologies
  let techs: string[] = [];
  try {
    techs = (JSON.parse(analysis.technologies) as string[]).slice(0, 3);
  } catch {
    /* ignore */
  }

  const summary = analysis.justification?.trim() || analysis.technicalSummary?.trim() || '';

  return (
    <article className="artemis-panel relative overflow-hidden rounded-2xl p-5 group">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/12 to-transparent"
      />

      {/* Header: complexity + type + PR link */}
      <header className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          {/* Complexity badge */}
          <div className="shrink-0 flex flex-col items-center justify-center h-12 w-12 rounded-xl border border-border/40 bg-card/60">
            <span className={`font-display text-[18px] font-light leading-none tabular-nums ${cplxTone}`}>
              {cplx}
            </span>
            <span className="text-[8px] font-mono uppercase tracking-wider text-muted-foreground/55 mt-0.5">
              cplx
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span
                className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider"
                style={{
                  background: `${typeColor}1f`,
                  color: typeColor,
                  border: `1px solid ${typeColor}40`,
                }}
              >
                {analysis.changeType ?? 'other'}
              </span>
              <span
                className={`text-[10px] font-mono uppercase tracking-wider ${
                  conf >= 75
                    ? 'text-success'
                    : conf >= 60
                      ? 'text-muted-foreground/70'
                      : 'text-amber-400'
                }`}
              >
                {conf}% conf
              </span>
            </div>
            {pr ? (
              <a
                href={pr.htmlUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[13px] font-medium text-foreground hover:text-primary transition-colors line-clamp-1"
              >
                <span className="font-mono text-[11px] text-muted-foreground/45 mr-1.5 tabular-nums">
                  #{pr.prNumber}
                </span>
                {pr.title}
              </a>
            ) : (
              <p className="text-[13px] font-medium text-foreground line-clamp-1">
                Analysis #{analysis.id.slice(0, 8)}
              </p>
            )}
          </div>
        </div>
      </header>

      {/* AI reasoning */}
      {summary && (
        <p className="text-[12px] leading-relaxed text-muted-foreground/85 line-clamp-3 mb-3">
          {summary}
        </p>
      )}

      {/* Footer: techs + date */}
      <footer className="flex items-center justify-between gap-3 pt-3 border-t border-border/25">
        <div className="flex flex-wrap gap-1 min-w-0">
          {techs.map((t) => (
            <span
              key={t}
              className="text-[10px] px-1.5 py-0.5 rounded border border-border/40 bg-card/40 text-muted-foreground/85"
            >
              {t}
            </span>
          ))}
        </div>
        <span className="text-[10px] font-mono text-muted-foreground/55 shrink-0">
          {formatDate(analysis.createdAt)}
        </span>
      </footer>
    </article>
  );
};
