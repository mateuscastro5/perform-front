import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { DashboardHeader } from "@/ui/components/DashboardHeader";
import { useDashboard } from "@/ui/contexts/DashboardContext";
import { useAuth } from "@/ui/contexts/AuthContext";
import { apiService } from "@/ui/services/api.service";
import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarRange,
  ExternalLink,
  Filter,
  GitCommit,
  GitPullRequest,
  MessageSquare,
  Radar,
  Rocket,
  Search,
  Signal,
  Sparkles,
  Telescope,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/ui/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/components/ui/card";
import { Badge } from "@/ui/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/ui/components/ui/table";
import { ScrollArea } from "@/ui/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/components/ui/avatar";
import { Button } from "@/ui/components/ui/button";
import { Separator } from "@/ui/components/ui/separator";
import { Input } from "@/ui/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/components/ui/select";
import { Aurora, Comet, MoonOrb, StarField } from "@/ui/components/cosmic";

type InsightType = "prs" | "commits" | "review" | null;

type DetailedPR = {
  id: string;
  title: string;
  number: number;
  state: string;
  status: string;
  author: {
    id: string | null;
    name: string;
    login: string;
    avatar: string;
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
  reviewsCount: number;
  commitsCount?: number;
  reviewers: Array<{
    id: string | null;
    name: string;
    login: string;
    avatar: string;
    state: string;
    submittedAt: string;
  }>;
};

type RecentActivity = {
  id: string;
  type: "commit" | "pull_request" | "review";
  developer: {
    id: string | null;
    name: string;
    githubUsername: string | null;
    avatarUrl: string | null;
  };
  message: string;
  timestamp: string;
  url: string;
};

function toCompact(value: number) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function OrbitSparkline({ values, gradientId }: { values: number[]; gradientId: string }) {
  if (values.length === 0) {
    return <div className="h-[80px] rounded-xl border border-border/30 bg-card/20" />;
  }

  const maxValue = Math.max(...values);
  const minValue = Math.min(...values);
  const sameValueSeries = maxValue === minValue;
  const padding = sameValueSeries ? 1 : (maxValue - minValue) * 0.15;
  const domainMin = minValue - padding;
  const domainMax = maxValue + padding;
  const range = Math.max(domainMax - domainMin, 1);

  const points = values.map((value, index) => {
    const x = (index / Math.max(values.length - 1, 1)) * 280;
    const y = 70 - ((value - domainMin) / range) * 60;
    return { x, y };
  });

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPath = `${linePath} L 280 80 L 0 80 Z`;

  return (
    <div className="relative h-[80px] overflow-hidden rounded-xl border border-border/30 bg-gradient-to-b from-transparent to-background/30">
      <svg viewBox="0 0 280 80" preserveAspectRatio="none" className="h-full w-full">
        <defs>
          <linearGradient id={`${gradientId}-area`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={`hsl(var(--${gradientId}))`} stopOpacity="0.45" />
            <stop offset="100%" stopColor={`hsl(var(--${gradientId}))`} stopOpacity="0" />
          </linearGradient>
          <linearGradient id={`${gradientId}-line`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={`hsl(var(--${gradientId}))`} stopOpacity="0.4" />
            <stop offset="100%" stopColor={`hsl(var(--${gradientId}))`} stopOpacity="1" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill={`url(#${gradientId}-area)`} />
        <path d={linePath} fill="none" stroke={`url(#${gradientId}-line)`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={1.6} fill={`hsl(var(--${gradientId}))`} opacity="0.6" />
        ))}
        {points.length > 0 && (
          <circle
            cx={points[points.length - 1].x}
            cy={points[points.length - 1].y}
            r={3.2}
            fill={`hsl(var(--${gradientId}))`}
            className="drop-shadow-[0_0_8px_hsl(var(--primary))]"
          />
        )}
      </svg>
    </div>
  );
}

function dateKeyLocal(input: Date) {
  const year = input.getFullYear();
  const month = String(input.getMonth() + 1).padStart(2, "0");
  const day = String(input.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function groupByTimeWindow(dates: string[], points: number) {
  if (points <= 0) return [];

  const validDates = dates
    .map((value) => new Date(value))
    .filter((date) => !Number.isNaN(date.getTime()));

  const endDate = validDates.length
    ? new Date(Math.max(...validDates.map((date) => date.getTime())))
    : new Date();

  const buckets = Array.from({ length: points }, (_, index) => {
    const date = new Date(endDate);
    date.setDate(endDate.getDate() - (points - 1 - index));
    return { key: dateKeyLocal(date), value: 0 };
  });

  const bucketMap = new Map(buckets.map((bucket) => [bucket.key, bucket]));

  for (const inputDate of validDates) {
    const key = dateKeyLocal(inputDate);
    const bucket = bucketMap.get(key);
    if (bucket) bucket.value += 1;
  }

  return buckets.map((bucket) => bucket.value);
}

function hasSeriesVariance(values: number[]) {
  if (values.length <= 1) return false;
  return values.some((value) => value !== values[0]);
}

function formatStatusLabel(status: string) {
  return status.split("_").join(" ").replace(/\b\w/g, (char: string) => char.toUpperCase());
}

function getStatusBadgeVariant(status: string): "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "cosmic" {
  if (["merged", "approved"].includes(status)) return "success";
  if (["changes_requested", "rejected"].includes(status)) return "destructive";
  if (["review_requested", "pending"].includes(status)) return "warning";
  if (["open"].includes(status)) return "cosmic";
  if (["closed"].includes(status)) return "secondary";
  return "outline";
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("home");
  const [selectedInsight, setSelectedInsight] = useState<InsightType>(null);
  const [selectedDeveloperId, setSelectedDeveloperId] = useState<string | null>(null);
  const [selectedPrNumber, setSelectedPrNumber] = useState<number | null>(null);
  const [insightSearch, setInsightSearch] = useState("");
  const [insightAuthorFilter, setInsightAuthorFilter] = useState("all");
  const [insightPeriodFilter, setInsightPeriodFilter] = useState("0");
  const [insightStatusFilter, setInsightStatusFilter] = useState("all");
  const [developerPrSearch, setDeveloperPrSearch] = useState("");
  const [developerPrStatusFilter, setDeveloperPrStatusFilter] = useState("all");

  const { token } = useAuth();
  const {
    githubDevelopers,
    githubStats,
    githubWeeklyActivity,
    selectedRepository,
    isLoading,
  } = useDashboard();

  const [detailedPrs, setDetailedPrs] = useState<DetailedPR[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!token || isLoading) return;
      try {
        setDetailsLoading(true);
        const [prs, activity] = await Promise.all([
          apiService.getGithubRecentPullRequests(token, selectedRepository ?? undefined, 500),
          apiService.getGithubRecentActivity(token, selectedRepository ?? undefined, 1000),
        ]);
        setDetailedPrs(prs as DetailedPR[]);
        setRecentActivity(activity as RecentActivity[]);
      } catch (error) {
        console.error("Failed to load mission telemetry:", error);
      } finally {
        setDetailsLoading(false);
      }
    };

    fetchDetails();
  }, [token, selectedRepository, isLoading]);

  const prDates = useMemo(() => detailedPrs.map((pr) => pr.createdAt), [detailedPrs]);
  const commitDates = useMemo(
    () => recentActivity.filter((activity) => activity.type === "commit").map((activity) => activity.timestamp),
    [recentActivity],
  );
  const reviewDates = useMemo(
    () => detailedPrs.flatMap((pr) => pr.reviewers.map((review) => review.submittedAt)),
    [detailedPrs],
  );

  const commitSeries = useMemo(() => {
    const weeklySeries = (githubWeeklyActivity?.data ?? []).map((day) => day.commits);
    if (hasSeriesVariance(weeklySeries)) return weeklySeries;
    const activitySeries = groupByTimeWindow(commitDates, 10);
    if (hasSeriesVariance(activitySeries)) return activitySeries;
    return weeklySeries.length ? weeklySeries : activitySeries;
  }, [githubWeeklyActivity, commitDates]);

  const prSeries = useMemo(() => groupByTimeWindow(prDates, 10), [prDates]);
  const reviewSeries = useMemo(() => groupByTimeWindow(reviewDates, 10), [reviewDates]);

  const commitCardValue = useMemo(() => {
    const seriesTotal = commitSeries.reduce((acc, value) => acc + value, 0);
    if (seriesTotal > 0) return seriesTotal;
    return githubStats?.commits.thisWeek ?? 0;
  }, [commitSeries, githubStats]);

  const commitCardWindowLabel = commitSeries.length > 7 ? "last 10 days" : "last 7 days";

  const insightCards = [
    {
      id: "prs" as const,
      title: "Pull Requests",
      mission: "Orbit · Code Review",
      value: githubStats?.pullRequests.total ?? 0,
      helper: `${githubStats?.pullRequests.open ?? 0} open · ${githubStats?.pullRequests.merged ?? 0} merged`,
      series: prSeries,
      gradientVar: "primary",
      icon: GitPullRequest,
    },
    {
      id: "commits" as const,
      title: "Commits",
      mission: "Trajectory",
      value: commitCardValue,
      helper: `${commitCardWindowLabel} · ${githubStats?.commits.percentageChange.toFixed(1) ?? "0.0"}% vs last week`,
      series: commitSeries,
      gradientVar: "secondary",
      icon: GitCommit,
    },
    {
      id: "review" as const,
      title: "Awaiting Review",
      mission: "Telescope Queue",
      value: githubStats?.pullRequests.awaitingReview ?? 0,
      helper: `${githubStats?.reviews.pending ?? 0} reviews pending`,
      series: reviewSeries,
      gradientVar: "accent",
      icon: MessageSquare,
    },
  ];

  const engineeringRows = useMemo(() => {
    return githubDevelopers
      .filter((developer) => {
        const u = developer.githubUsername ?? "";
        return !u.includes("[bot]") && !u.includes("@") && u.length > 0;
      })
      .map((developer, index) => {
        const mergeRate = developer.stats.pullRequests
          ? (developer.stats.mergedPRs / developer.stats.pullRequests) * 100
          : 0;

        return {
          id: developer.id,
          index: index + 1,
          name: developer.name,
          handle: developer.githubUsername,
          commits: developer.stats.commits,
          prs: developer.stats.pullRequests,
          merged: developer.stats.mergedPRs,
          reviews: developer.stats.reviews,
          mergeRate,
          avatar: developer.avatarUrl,
          periodDays: developer.stats.period.days,
          periodSince: developer.stats.period.since,
        };
      });
  }, [githubDevelopers]);

  const selectedDeveloper = engineeringRows.find((row) => row.id === selectedDeveloperId) ?? null;

  const selectedDeveloperPrs = useMemo(() => {
    if (!selectedDeveloper) return [];
    return detailedPrs.filter(
      (pr) =>
        pr.author.id === selectedDeveloper.id ||
        pr.author.login === selectedDeveloper.handle ||
        pr.author.name.toLowerCase() === selectedDeveloper.name.toLowerCase(),
    );
  }, [detailedPrs, selectedDeveloper]);

  const developerPrStatusOptions = useMemo(
    () => Array.from(new Set(selectedDeveloperPrs.map((pr) => pr.status))).sort((a, b) => a.localeCompare(b)),
    [selectedDeveloperPrs],
  );

  const filteredDeveloperPrs = useMemo(() => {
    const query = developerPrSearch.trim().toLowerCase();
    return selectedDeveloperPrs.filter((pr) => {
      const matchesStatus = developerPrStatusFilter === "all" || pr.status === developerPrStatusFilter;
      const matchesQuery =
        !query ||
        pr.title.toLowerCase().includes(query) ||
        String(pr.number).includes(query) ||
        pr.status.toLowerCase().includes(query);

      return matchesStatus && matchesQuery;
    });
  }, [selectedDeveloperPrs, developerPrSearch, developerPrStatusFilter]);

  useEffect(() => {
    if (!filteredDeveloperPrs.length) {
      setSelectedPrNumber(null);
      return;
    }

    if (!selectedPrNumber || !filteredDeveloperPrs.some((pr) => pr.number === selectedPrNumber)) {
      setSelectedPrNumber(filteredDeveloperPrs[0].number);
    }
  }, [filteredDeveloperPrs, selectedPrNumber]);

  const selectedPr = filteredDeveloperPrs.find((pr) => pr.number === selectedPrNumber) ?? null;

  const prsInReview = useMemo(() => {
    return detailedPrs.filter((pr) => {
      const isOpen = pr.status === "open";
      const hasApprovedReview = pr.reviewers.some(
        (reviewer) => reviewer.state?.toUpperCase() === "APPROVED",
      );
      return isOpen && !hasApprovedReview;
    });
  }, [detailedPrs]);

  const commitEvents = useMemo(
    () => recentActivity.filter((activity) => activity.type === "commit"),
    [recentActivity],
  );

  const selectedDeveloperSummary = useMemo(() => {
    if (!selectedDeveloper) {
      return {
        commits: 0,
        prs: 0,
        merged: 0,
        reviews: 0,
        mergeRate: 0,
        periodDays: 30,
        periodSince: null as string | null,
      };
    }
    return {
      commits: selectedDeveloper.commits,
      prs: selectedDeveloper.prs,
      merged: selectedDeveloper.merged,
      reviews: selectedDeveloper.reviews,
      mergeRate: selectedDeveloper.mergeRate,
      periodDays: selectedDeveloper.periodDays,
      periodSince: selectedDeveloper.periodSince,
    };
  }, [selectedDeveloper]);

  const insightTitle =
    selectedInsight === "prs"
      ? "Pull Requests · Orbit"
      : selectedInsight === "commits"
        ? "Commits · Trajectory"
        : selectedInsight === "review"
          ? "Telescope Queue"
          : "Mission Details";

  const insightTotal =
    selectedInsight === "prs"
      ? detailedPrs.length
      : selectedInsight === "commits"
        ? commitEvents.length
        : selectedInsight === "review"
          ? prsInReview.length
          : 0;

  const insightPeriodDays = Number(insightPeriodFilter);

  const periodStartDate = useMemo(() => {
    if (insightPeriodDays <= 0) return null;
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - Math.max(insightPeriodDays - 1, 0));
    return date;
  }, [insightPeriodDays]);

  const authorOptions = useMemo(() => {
    const fromPrs = detailedPrs.map((pr) => pr.author.name).filter(Boolean);
    const fromEvents = recentActivity.map((activity) => activity.developer.name).filter(Boolean);
    return Array.from(new Set([...fromPrs, ...fromEvents])).sort((a, b) => a.localeCompare(b));
  }, [detailedPrs, recentActivity]);

  const filteredPrs = useMemo(() => {
    const query = insightSearch.trim().toLowerCase();
    return detailedPrs.filter((pr) => {
      const matchesAuthor = insightAuthorFilter === "all" || pr.author.name === insightAuthorFilter;
      const matchesStatus = insightStatusFilter === "all" || pr.status === insightStatusFilter;
      const matchesTime =
        !periodStartDate ||
        new Date(pr.updatedAt || pr.createdAt).getTime() >= periodStartDate.getTime();
      const matchesSearch =
        !query ||
        pr.title.toLowerCase().includes(query) ||
        String(pr.number).includes(query) ||
        pr.author.name.toLowerCase().includes(query);

      return matchesAuthor && matchesStatus && matchesTime && matchesSearch;
    });
  }, [detailedPrs, insightAuthorFilter, insightStatusFilter, periodStartDate, insightSearch]);

  const filteredReviewPrs = useMemo(() => {
    const query = insightSearch.trim().toLowerCase();
    return prsInReview.filter((pr) => {
      const matchesAuthor = insightAuthorFilter === "all" || pr.author.name === insightAuthorFilter;
      const matchesStatus = insightStatusFilter === "all" || pr.status === insightStatusFilter;
      const matchesTime =
        !periodStartDate ||
        new Date(pr.updatedAt || pr.createdAt).getTime() >= periodStartDate.getTime();
      const matchesSearch =
        !query ||
        pr.title.toLowerCase().includes(query) ||
        String(pr.number).includes(query) ||
        pr.author.name.toLowerCase().includes(query);

      return matchesAuthor && matchesStatus && matchesTime && matchesSearch;
    });
  }, [prsInReview, insightAuthorFilter, insightStatusFilter, periodStartDate, insightSearch]);

  const filteredCommitEvents = useMemo(() => {
    const query = insightSearch.trim().toLowerCase();
    return commitEvents.filter((activity) => {
      const matchesAuthor = insightAuthorFilter === "all" || activity.developer.name === insightAuthorFilter;
      const matchesTime = !periodStartDate || new Date(activity.timestamp).getTime() >= periodStartDate.getTime();
      const matchesSearch =
        !query ||
        activity.message.toLowerCase().includes(query) ||
        activity.developer.name.toLowerCase().includes(query);

      return matchesAuthor && matchesTime && matchesSearch;
    });
  }, [commitEvents, insightAuthorFilter, periodStartDate, insightSearch]);

  const commitsByWeekday = useMemo(() => {
    const labels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const counts = [0, 0, 0, 0, 0, 0, 0];

    for (const event of filteredCommitEvents) {
      const dayIndex = new Date(event.timestamp).getDay();
      counts[dayIndex] += 1;
    }

    const hasEvents = counts.some((value) => value > 0);
    if (!hasEvents && githubWeeklyActivity?.data?.length) {
      for (const entry of githubWeeklyActivity.data) {
        const normalized = entry.day.slice(0, 3).toLowerCase();
        const map: Record<string, number> = { dom: 0, sun: 0, seg: 1, mon: 1, ter: 2, tue: 2, qua: 3, wed: 3, qui: 4, thu: 4, sex: 5, fri: 5, sáb: 6, sab: 6, sat: 6 };
        const mappedIndex = map[normalized];
        if (mappedIndex !== undefined) counts[mappedIndex] += entry.commits;
      }
    }

    return labels.map((label, index) => ({ label, value: counts[index] }));
  }, [filteredCommitEvents, githubWeeklyActivity]);

  const commitBarMax = Math.max(...commitsByWeekday.map((item) => item.value), 1);

  const insightStatusOptions = useMemo(() => {
    const source = selectedInsight === "review" ? prsInReview : detailedPrs;
    return Array.from(new Set(source.map((pr) => pr.status))).sort((a, b) => a.localeCompare(b));
  }, [selectedInsight, detailedPrs, prsInReview]);

  const filteredInsightTotal =
    selectedInsight === "prs"
      ? filteredPrs.length
      : selectedInsight === "commits"
        ? filteredCommitEvents.length
        : selectedInsight === "review"
          ? filteredReviewPrs.length
          : 0;

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      {/* — Cosmic backdrop —————————————————— */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <StarField className="absolute inset-0" density={0.6} speed={0.6} />
        <Aurora intensity="soft" />
        <Comet top="12%" duration={16} delay="-3s" size="md" />
        <Comet top="78%" duration={20} delay="-12s" size="sm" angle={-8} />
      </div>

      <DashboardHeader activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="relative z-10 pb-12 pl-[316px] pr-6 pt-[122px]">
        <div className="space-y-6">
          {/* — Mission ticker ——————————————— */}
          <div className="artemis-panel relative overflow-hidden rounded-[24px]">
            <div className="flex flex-wrap items-center gap-x-8 gap-y-3 border-b border-border/30 px-6 py-3.5 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              <div className="flex items-center gap-2">
                <Signal className="h-3 w-3 text-success" />
                <span>Telemetry · Live</span>
              </div>
              <Separator orientation="vertical" className="h-3" />
              <div className="flex items-center gap-2">
                <span>Commits</span>
                <span className="font-display text-foreground text-sm">{githubStats?.commits.thisWeek ?? 0}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>Open PRs</span>
                <span className="font-display text-foreground text-sm">{githubStats?.pullRequests.open ?? 0}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>Awaiting</span>
                <span className="font-display text-foreground text-sm">{githubStats?.pullRequests.awaitingReview ?? 0}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>Reviews</span>
                <span className="font-display text-foreground text-sm">{githubStats?.reviews.total ?? 0}</span>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <Radar className="h-3 w-3 text-secondary" />
                <span>Last sync · {isLoading ? "syncing..." : "just now"}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 px-6 py-7 md:px-8 md:py-9 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <span className="artemis-tag mb-5">
                  <Rocket className="h-3 w-3" /> Mission Brief · {new Date().toLocaleDateString()}
                </span>
                <h1 className="font-display text-[clamp(2.6rem,5.5vw,4rem)] font-light leading-[0.92] tracking-[-0.04em]">
                  <span className="artemis-text-lunar">Live engineering</span>
                  <br />
                  <span className="artemis-text-aurora">at lunar precision.</span>
                </h1>
                <p className="mt-5 max-w-xl text-sm text-muted-foreground leading-relaxed">
                  Your fleet at a glance — every commit a thruster, every PR a maneuver,
                  every review a course correction. Welcome to Mission Control.
                </p>
              </div>

              {/* Decorative moon — desktop only */}
              <div className="hidden lg:block">
                <MoonOrb size={170} phase="aurora" rings />
              </div>
            </div>
          </div>

          {/* — Insight cards ——————————————— */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            {insightCards.map((card, index) => {
              const Icon = card.icon;
              const trendValue = card.series.length > 1 ? card.series[card.series.length - 1] - card.series[0] : 0;
              const positive = trendValue >= 0;

              return (
                <motion.button
                  key={card.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  onClick={() => setSelectedInsight(card.id)}
                  className="group artemis-panel relative overflow-hidden rounded-[24px] p-6 text-left transition-all hover:border-primary/40 hover:-translate-y-0.5 hover:shadow-[0_30px_60px_-30px_hsl(258_92%_70%/0.55)]"
                >
                  {/* Aurora glow on hover */}
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -right-20 -top-20 h-44 w-44 rounded-full bg-primary/15 blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  />

                  <div className="mb-5 flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-border/40 bg-card/40 text-foreground/85 transition-all group-hover:border-primary/40 group-hover:bg-primary/10 group-hover:text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/80">
                      {card.mission}
                    </span>
                  </div>

                  <p className="text-sm text-muted-foreground">{card.title}</p>
                  <p className="mt-2 font-display text-[52px] font-light leading-none tracking-[-0.03em] artemis-text-lunar">
                    {toCompact(card.value)}
                  </p>
                  <p className="mt-2.5 text-xs text-muted-foreground">{card.helper}</p>

                  <div className="mt-5 flex items-center justify-between">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${
                        positive
                          ? "border-success/35 bg-success/15 text-success"
                          : "border-destructive/35 bg-destructive/15 text-destructive"
                      }`}
                    >
                      {positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                      {Math.abs(trendValue)} vector
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">
                      Open scope →
                    </span>
                  </div>

                  <div className="mt-5">
                    <OrbitSparkline values={card.series} gradientId={card.gradientVar} />
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* — Engineering Overview ——————————————— */}
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.32, duration: 0.6 }}
            className="artemis-panel overflow-hidden rounded-[24px]"
          >
            <div className="flex items-center justify-between border-b border-border/30 px-7 py-5">
              <div>
                <span className="artemis-tag">
                  <Telescope className="h-3 w-3" /> Crew Telemetry
                </span>
                <h2 className="mt-3 font-display text-[34px] font-light leading-none tracking-[-0.025em]">
                  Engineering Overview
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Click any operator to inspect their orbit.
                </p>
              </div>
              <Badge variant="cosmic" className="hidden md:inline-flex">
                {engineeringRows.length} crew on shift
              </Badge>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px]">
                <thead>
                  <tr className="border-b border-border/25 text-left font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/80">
                    <th className="px-7 py-4 font-medium">Pos</th>
                    <th className="px-7 py-4 font-medium">Operator</th>
                    <th className="px-7 py-4 font-medium">Commits</th>
                    <th className="px-7 py-4 font-medium">PRs</th>
                    <th className="px-7 py-4 font-medium">Merged</th>
                    <th className="px-7 py-4 font-medium">Reviews</th>
                    <th className="px-7 py-4 font-medium">Trajectory</th>
                  </tr>
                </thead>
                <tbody>
                  {engineeringRows.map((row, index) => {
                    const positive = row.mergeRate >= 50;
                    return (
                      <motion.tr
                        key={row.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.04 * index }}
                        className="group cursor-pointer border-b border-border/20 transition-colors hover:bg-primary/5"
                        onClick={() => setSelectedDeveloperId(row.id)}
                      >
                        <td className="px-7 py-4 font-mono text-xs text-muted-foreground">
                          #{String(row.index).padStart(2, "0")}
                        </td>
                        <td className="px-7 py-4">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <span className="absolute -inset-0.5 rounded-full bg-aurora-gradient opacity-0 blur-sm transition-opacity duration-500 group-hover:opacity-70" />
                              <div className="relative h-9 w-9 overflow-hidden rounded-full border border-border/50 bg-muted/30">
                                {row.avatar ? (
                                  <img src={row.avatar} alt={row.name} className="h-full w-full object-cover" />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center text-xs font-semibold">
                                    {row.name.charAt(0)}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div>
                              <p className="text-sm font-medium leading-none">{row.name}</p>
                              <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                                @{row.handle}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-7 py-4 font-display text-base">{row.commits}</td>
                        <td className="px-7 py-4 font-display text-base">{row.prs}</td>
                        <td className="px-7 py-4 font-display text-base">{row.merged}</td>
                        <td className="px-7 py-4 font-display text-base">{row.reviews}</td>
                        <td className="px-7 py-4">
                          <div className="flex items-center gap-3">
                            <span
                              className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs ${
                                positive
                                  ? "border-success/35 bg-success/15 text-success"
                                  : "border-destructive/35 bg-destructive/15 text-destructive"
                              }`}
                            >
                              {row.mergeRate.toFixed(1)}%
                            </span>
                            <div className="hidden h-1.5 w-16 overflow-hidden rounded-full bg-muted/30 md:block">
                              <div
                                className={positive ? "h-full bg-success/70" : "h-full bg-destructive/70"}
                                style={{ width: `${Math.min(row.mergeRate, 100)}%` }}
                              />
                            </div>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                  {engineeringRows.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-7 py-12 text-center text-sm text-muted-foreground">
                        Awaiting crew telemetry...
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.section>
        </div>
      </main>

      {/* — Insight Drilldown Dialog ——————————————— */}
      <Dialog open={selectedInsight !== null} onOpenChange={(open) => !open && setSelectedInsight(null)}>
        <DialogContent className="flex h-[calc(100vh-2rem)] max-h-[calc(100vh-2rem)] w-[calc(100vw-2rem)] max-w-[calc(100vw-2rem)] flex-col gap-0 overflow-hidden p-0">
          <div className="bg-gradient-to-r from-primary/15 via-card/60 to-secondary/10 p-6 pb-4">
            <DialogHeader className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                    Mission Drilldown
                  </p>
                  <DialogTitle className="mt-1 font-display text-2xl font-medium tracking-[-0.01em]">
                    {insightTitle}
                  </DialogTitle>
                  <DialogDescription className="mt-1">
                    Telemetry stream from GitHub analytics and persisted mission records.
                  </DialogDescription>
                </div>
                <Badge variant="aurora" className="gap-1">
                  <Sparkles className="h-3.5 w-3.5" />
                  {filteredInsightTotal} of {insightTotal} signals
                </Badge>
              </div>

              <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={insightSearch}
                    onChange={(event) => setInsightSearch(event.target.value)}
                    placeholder="Search by title, operator or ID..."
                    className="pl-9"
                  />
                </div>

                <Select value={insightAuthorFilter} onValueChange={setInsightAuthorFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by operator" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All operators</SelectItem>
                    {authorOptions.map((author) => (
                      <SelectItem key={author} value={author}>{author}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={insightPeriodFilter} onValueChange={setInsightPeriodFilter}>
                  <SelectTrigger>
                    <div className="flex items-center gap-2">
                      <CalendarRange className="h-4 w-4 text-muted-foreground" />
                      <SelectValue placeholder="Time window" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">All time</SelectItem>
                    <SelectItem value="7">Last 7 days</SelectItem>
                    <SelectItem value="30">Last 30 days</SelectItem>
                    <SelectItem value="90">Last 90 days</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={insightStatusFilter}
                  onValueChange={setInsightStatusFilter}
                  disabled={selectedInsight === "commits"}
                >
                  <SelectTrigger>
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4 text-muted-foreground" />
                      <SelectValue placeholder="Status" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All status</SelectItem>
                    {insightStatusOptions.map((status) => (
                      <SelectItem key={status} value={status}>{formatStatusLabel(status)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                <Card className="bg-background/40 shadow-none">
                  <CardContent className="p-3">
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Window</p>
                    <p className="mt-1 text-sm font-medium">{insightPeriodFilter === "0" ? "All time" : `Last ${insightPeriodFilter} days`}</p>
                  </CardContent>
                </Card>
                <Card className="bg-background/40 shadow-none">
                  <CardContent className="p-3">
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Operator</p>
                    <p className="mt-1 text-sm font-medium">{insightAuthorFilter === "all" ? "All operators" : insightAuthorFilter}</p>
                  </CardContent>
                </Card>
                <Card className="bg-background/40 shadow-none">
                  <CardContent className="p-3">
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Search</p>
                    <p className="mt-1 truncate text-sm font-medium">{insightSearch.trim() ? insightSearch : "No keyword"}</p>
                  </CardContent>
                </Card>
              </div>
            </DialogHeader>
          </div>

          <Separator />

          <ScrollArea className="min-h-0 flex-1 px-6 py-5">
            {selectedInsight === "prs" && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Pull Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>PR</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Operator</TableHead>
                        <TableHead>Delta</TableHead>
                        <TableHead>Files</TableHead>
                        <TableHead>Reviews</TableHead>
                        <TableHead className="text-right">Link</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(detailsLoading ? [] : filteredPrs).slice(0, 40).map((pr) => (
                        <TableRow key={pr.id}>
                          <TableCell className="max-w-[420px] truncate font-medium">#{pr.number} {pr.title}</TableCell>
                          <TableCell>
                            <Badge variant={getStatusBadgeVariant(pr.status)}>{formatStatusLabel(pr.status)}</Badge>
                          </TableCell>
                          <TableCell>{pr.author.name}</TableCell>
                          <TableCell>+{pr.additions} / -{pr.deletions}</TableCell>
                          <TableCell>{pr.changedFiles}</TableCell>
                          <TableCell>{pr.reviewsCount}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" asChild>
                              <a href={pr.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1">
                                GitHub <ExternalLink className="h-3.5 w-3.5" />
                              </a>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {!detailsLoading && filteredPrs.length === 0 && (
                    <p className="py-6 text-center text-sm text-muted-foreground">
                      No pull requests in this orbit. Try changing window, operator, status or search.
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {selectedInsight === "commits" && (
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Weekly Trajectory</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-xl border border-border/40 bg-background/30 p-4">
                      <div className="flex h-[190px] items-end gap-3">
                        {commitsByWeekday.map((item) => {
                          const heightPercent = Math.max((item.value / commitBarMax) * 100, item.value > 0 ? 14 : 4);
                          return (
                            <div key={item.label} className="flex flex-1 flex-col items-center gap-2">
                              <span className="text-xs text-muted-foreground">{item.value}</span>
                              <div className="flex h-[130px] w-full items-end rounded-md border border-border/40 bg-card/30 p-1">
                                <div
                                  className="w-full rounded-[6px] bg-aurora-gradient opacity-90"
                                  style={{ height: `${heightPercent}%` }}
                                />
                              </div>
                              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                                {item.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Recent Commit Stream</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {filteredCommitEvents.slice(0, 40).map((activity) => (
                      <div key={activity.id} className="rounded-xl border border-border/40 bg-card/25 p-3 backdrop-blur-md">
                        <p className="line-clamp-1 text-sm font-medium">{activity.message}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {activity.developer.name} · {new Date(activity.timestamp).toLocaleString()}
                        </p>
                        <div className="mt-2">
                          <Button variant="link" className="h-auto p-0 text-xs" asChild>
                            <a href={activity.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1">
                              Open event <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          </Button>
                        </div>
                      </div>
                    ))}
                    {filteredCommitEvents.length === 0 && (
                      <p className="py-6 text-center text-sm text-muted-foreground">No commit events in this window.</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {selectedInsight === "review" && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">PRs Awaiting Telescope</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>PR</TableHead>
                        <TableHead>Operator</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Reviewers</TableHead>
                        <TableHead>Comments</TableHead>
                        <TableHead className="text-right">Link</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredReviewPrs.slice(0, 40).map((pr) => (
                        <TableRow key={pr.id}>
                          <TableCell className="max-w-[420px] truncate font-medium">#{pr.number} {pr.title}</TableCell>
                          <TableCell>{pr.author.name}</TableCell>
                          <TableCell>
                            <Badge variant={getStatusBadgeVariant(pr.status)}>{formatStatusLabel(pr.status)}</Badge>
                          </TableCell>
                          <TableCell>{pr.reviewers.length}</TableCell>
                          <TableCell>{pr.commentsCount}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" asChild>
                              <a href={pr.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1">
                                GitHub <ExternalLink className="h-3.5 w-3.5" />
                              </a>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {filteredReviewPrs.length === 0 && (
                    <p className="py-6 text-center text-sm text-muted-foreground">No review PRs match the filters.</p>
                  )}
                </CardContent>
              </Card>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* — Operator Drilldown Dialog ——————————————— */}
      <Dialog open={selectedDeveloperId !== null} onOpenChange={(open) => !open && setSelectedDeveloperId(null)}>
        <DialogContent className="flex h-[calc(100vh-2rem)] max-h-[calc(100vh-2rem)] w-[calc(100vw-2rem)] max-w-[calc(100vw-2rem)] flex-col gap-0 overflow-hidden p-0">
          {selectedDeveloper ? (
            <>
              <div className="bg-gradient-to-r from-primary/15 via-card/60 to-secondary/10 p-6 pb-4">
                <DialogHeader className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <DialogTitle className="flex items-center gap-3 font-display text-2xl font-medium">
                      <div className="relative">
                        <span className="absolute -inset-0.5 rounded-full bg-aurora-gradient opacity-70 blur" />
                        <Avatar className="relative h-10 w-10 border">
                          <AvatarImage src={selectedDeveloper.avatar ?? undefined} alt={selectedDeveloper.name} />
                          <AvatarFallback>{selectedDeveloper.name.slice(0, 1)}</AvatarFallback>
                        </Avatar>
                      </div>
                      {selectedDeveloper.name} · Operator File
                    </DialogTitle>
                    <Badge variant="cosmic">
                      Window: last {selectedDeveloperSummary.periodDays} days
                    </Badge>
                  </div>
                  <DialogDescription>
                    Counts reflect the last {selectedDeveloperSummary.periodDays} days of trajectory.
                  </DialogDescription>
                </DialogHeader>
              </div>

              <Separator />

              <ScrollArea className="min-h-0 flex-1 px-6 py-5">
                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                    {[
                      { label: "Commits", value: selectedDeveloperSummary.commits },
                      { label: "PRs", value: selectedDeveloperSummary.prs },
                      { label: "Merged", value: selectedDeveloperSummary.merged },
                      { label: "Reviews", value: selectedDeveloperSummary.reviews },
                      { label: "Merge Rate", value: `${selectedDeveloperSummary.mergeRate.toFixed(1)}%` },
                    ].map((stat) => (
                      <Card key={stat.label} className="bg-card/40">
                        <CardContent className="p-4">
                          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{stat.label}</p>
                          <p className="mt-2 font-display text-3xl font-light tracking-[-0.02em]">{stat.value}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <div className="grid gap-4 xl:grid-cols-[340px,1fr]">
                    <Card className="bg-card/40">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between gap-2">
                          <CardTitle className="text-base">PR Navigator</CardTitle>
                          <Badge variant="outline">{filteredDeveloperPrs.length} filtered</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="space-y-2">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              value={developerPrSearch}
                              onChange={(event) => setDeveloperPrSearch(event.target.value)}
                              placeholder="Search PR by title or number"
                              className="pl-9"
                            />
                          </div>
                          <Select value={developerPrStatusFilter} onValueChange={setDeveloperPrStatusFilter}>
                            <SelectTrigger>
                              <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All status</SelectItem>
                              {developerPrStatusOptions.map((status) => (
                                <SelectItem key={status} value={status}>{formatStatusLabel(status)}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <ScrollArea className="h-[430px] rounded-md border border-border/50">
                          <div className="space-y-2 p-2">
                            {filteredDeveloperPrs.map((pr) => (
                              <button
                                key={pr.id}
                                type="button"
                                onClick={() => setSelectedPrNumber(pr.number)}
                                className={`w-full rounded-xl border p-3 text-left transition-colors ${
                                  selectedPrNumber === pr.number
                                    ? "border-primary/60 bg-primary/15 shadow-[0_0_22px_-8px_hsl(258_92%_70%/0.6)]"
                                    : "border-border/40 bg-background/30 hover:bg-card/50"
                                }`}
                              >
                                <p className="truncate text-sm font-semibold">#{pr.number} {pr.title}</p>
                                <div className="mt-2 flex items-center justify-between gap-2">
                                  <Badge variant={getStatusBadgeVariant(pr.status)}>{formatStatusLabel(pr.status)}</Badge>
                                  <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                                    {new Date(pr.updatedAt).toLocaleDateString()}
                                  </span>
                                </div>
                                <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] text-muted-foreground">
                                  <span>+{pr.additions} / -{pr.deletions}</span>
                                  <span>{pr.changedFiles} files</span>
                                </div>
                              </button>
                            ))}

                            {filteredDeveloperPrs.length === 0 && (
                              <div className="rounded-xl border border-dashed border-border/60 p-4 text-center text-sm text-muted-foreground">
                                No PRs match this filter.
                              </div>
                            )}
                          </div>
                        </ScrollArea>
                      </CardContent>
                    </Card>

                    {selectedPr ? (
                      <div className="space-y-4">
                        <Card className="bg-card/40">
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <CardTitle className="text-xl">#{selectedPr.number} {selectedPr.title}</CardTitle>
                                <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                                  Updated {new Date(selectedPr.updatedAt).toLocaleString()}
                                </p>
                                <div className="mt-2 flex items-center gap-2">
                                  <Badge variant={getStatusBadgeVariant(selectedPr.status)}>
                                    {formatStatusLabel(selectedPr.status)}
                                  </Badge>
                                  <Badge variant="outline">{selectedPr.reviewers.length} reviewers</Badge>
                                </div>
                              </div>
                              <Button variant="secondary" size="sm" asChild>
                                <a href={selectedPr.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1">
                                  Open on GitHub <ExternalLink className="h-3.5 w-3.5" />
                                </a>
                              </Button>
                            </div>
                          </CardHeader>

                          <CardContent className="space-y-4">
                            <div className="grid gap-3 md:grid-cols-4">
                              {[
                                { label: "Additions", value: `+${selectedPr.additions}` },
                                { label: "Deletions", value: `-${selectedPr.deletions}` },
                                { label: "Files", value: selectedPr.changedFiles },
                                { label: "Reviews / Comments", value: `${selectedPr.reviewsCount} / ${selectedPr.commentsCount}` },
                              ].map((s) => (
                                <Card key={s.label} className="bg-background/40 shadow-none">
                                  <CardContent className="p-3">
                                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{s.label}</p>
                                    <p className="mt-1.5 font-display text-lg font-medium">{s.value}</p>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>

                            <Card className="bg-background/40 shadow-none">
                              <CardHeader className="pb-3">
                                <CardTitle className="text-base">Change Footprint</CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-3">
                                {(() => {
                                  const totalChanges = selectedPr.additions + selectedPr.deletions;
                                  const additionsPct = totalChanges > 0 ? (selectedPr.additions / totalChanges) * 100 : 0;
                                  const deletionsPct = totalChanges > 0 ? (selectedPr.deletions / totalChanges) * 100 : 0;
                                  return (
                                    <>
                                      <div>
                                        <div className="mb-1 flex items-center justify-between text-xs">
                                          <span className="text-muted-foreground">Additions</span>
                                          <span>+{selectedPr.additions}</span>
                                        </div>
                                        <div className="h-2 overflow-hidden rounded-full bg-muted/30">
                                          <div className="h-full bg-success/70" style={{ width: `${additionsPct}%` }} />
                                        </div>
                                      </div>
                                      <div>
                                        <div className="mb-1 flex items-center justify-between text-xs">
                                          <span className="text-muted-foreground">Deletions</span>
                                          <span>-{selectedPr.deletions}</span>
                                        </div>
                                        <div className="h-2 overflow-hidden rounded-full bg-muted/30">
                                          <div className="h-full bg-destructive/70" style={{ width: `${deletionsPct}%` }} />
                                        </div>
                                      </div>
                                    </>
                                  );
                                })()}
                              </CardContent>
                            </Card>
                          </CardContent>
                        </Card>

                        <Card className="bg-card/40">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-base">Reviewers</CardTitle>
                          </CardHeader>
                          <CardContent>
                            {selectedPr.reviewers.length ? (
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Reviewer</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Submitted At</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {selectedPr.reviewers.map((reviewer) => (
                                    <TableRow key={`${selectedPr.id}-${reviewer.login}-${reviewer.submittedAt}`}>
                                      <TableCell>
                                        <div className="flex items-center gap-2">
                                          <Avatar className="h-7 w-7">
                                            <AvatarImage src={reviewer.avatar || undefined} alt={reviewer.name} />
                                            <AvatarFallback>{reviewer.name.slice(0, 1)}</AvatarFallback>
                                          </Avatar>
                                          <span>{reviewer.name}</span>
                                        </div>
                                      </TableCell>
                                      <TableCell>
                                        <Badge variant={getStatusBadgeVariant(reviewer.state.toLowerCase())}>
                                          {formatStatusLabel(reviewer.state.toLowerCase())}
                                        </Badge>
                                      </TableCell>
                                      <TableCell>
                                        {reviewer.submittedAt ? new Date(reviewer.submittedAt).toLocaleString() : "-"}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            ) : (
                              <div className="rounded-xl border border-dashed border-border/60 p-4 text-sm text-muted-foreground">
                                No reviewer activity yet.
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    ) : (
                      <Card className="bg-card/40">
                        <CardContent className="p-8 text-center text-sm text-muted-foreground">
                          Select a PR from the left to inspect its orbit.
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              </ScrollArea>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
