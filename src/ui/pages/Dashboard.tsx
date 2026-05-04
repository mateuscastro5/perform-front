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
  Circle,
  Clock,
  ExternalLink,
  Filter,
  GitCommit,
  GitPullRequest,
  MessageSquare,
  RefreshCcw,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import {
  BarChart,
  Bar,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Dialog,
  DialogClose,
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
import { Aurora, Comet, StarField } from "@/ui/components/cosmic";

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
    lastSyncedAt,
    isSyncing,
    triggerDataCollection,
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
        console.error("Failed to load dashboard data:", error);
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

  /**
   * Weekly velocity sparkline — driven by real GitHub weekly activity.
   * Returns the SVG geometry (path strings, points, baseline) so the
   * hero chart in the JSX is purely a binding consumer.
   */
  const velocitySparkline = useMemo(() => {
    const data = githubWeeklyActivity?.data ?? [];
    if (data.length < 2) return null;

    const values = data.map((d) => d.commits);
    const rawMax = Math.max(...values);
    const rawMin = Math.min(...values);
    // Guarantee a non-zero range so a flat series still renders.
    const max = rawMax === rawMin ? rawMax + 1 : rawMax;
    const min = rawMax === rawMin ? Math.max(rawMin - 1, 0) : rawMin;
    const range = max - min;

    // Viewbox geometry (matches <svg viewBox="0 0 340 110">)
    const viewW = 340;
    const padX = 6;
    const padTop = 14;
    const padBottom = 16;
    const usableW = viewW - padX * 2;
    const usableH = 110 - padTop - padBottom;

    const points = values.map((v, i) => {
      const x = padX + (i / (values.length - 1)) * usableW;
      const y = padTop + usableH - ((v - min) / range) * usableH;
      return { x, y, value: v };
    });

    // Smooth bezier curve through the points (mild horizontal control points)
    const pathD = points.reduce((acc, pt, i) => {
      if (i === 0) return `M ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`;
      const prev = points[i - 1];
      const dx = pt.x - prev.x;
      const cp1x = prev.x + dx * 0.42;
      const cp1y = prev.y;
      const cp2x = pt.x - dx * 0.42;
      const cp2y = pt.y;
      return `${acc} C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`;
    }, "");

    const areaBottom = (110 - padBottom + 2).toFixed(1);
    const areaD = `${pathD} L ${points[points.length - 1].x.toFixed(1)} ${areaBottom} L ${points[0].x.toFixed(1)} ${areaBottom} Z`;

    // Average baseline (dotted line)
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const avgY = padTop + usableH - ((avg - min) / range) * usableH;

    // Highest single day (for the secondary highlight dot)
    const peakIdx = values.indexOf(rawMax);

    return {
      points,
      pathD,
      areaD,
      avgY,
      peakIdx,
      latest: points[points.length - 1],
      days: data.map((d) => d.day),
    };
  }, [githubWeeklyActivity]);

  const velocityDelta = githubStats?.commits.percentageChange ?? 0;
  const velocityDeltaLabel = `${velocityDelta > 0 ? "+" : ""}${velocityDelta.toFixed(0)}%`;
  const velocityDeltaPositive = velocityDelta >= 0;

  /**
   * Re-render every 30 seconds so the "synced N min ago" label stays fresh
   * without requiring user interaction.
   */
  const [nowTick, setNowTick] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNowTick(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  const lastSyncLabel = useMemo(() => {
    if (isSyncing) return "syncing…";
    if (!lastSyncedAt) return "never synced";
    const diffMs = nowTick - new Date(lastSyncedAt).getTime();
    if (diffMs < 0) return "just now";
    const sec = Math.floor(diffMs / 1000);
    if (sec < 30) return "just now";
    if (sec < 60) return `${sec}s ago`;
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min}m ago`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr}h ago`;
    const day = Math.floor(hr / 24);
    return `${day}d ago`;
  }, [lastSyncedAt, nowTick, isSyncing]);

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
      // The headline value is the all-time total. The helper now keeps the
      // SAME mental model (open + closed = total), so the math reconciles
      // at a glance. We surface "merged this week" as a secondary trend
      // line, not as a slice of the headline number.
      value: githubStats?.pullRequests.total ?? 0,
      helper: `${githubStats?.pullRequests.open ?? 0} open · ${
        githubStats?.pullRequests.closed ?? 0
      } closed · ${githubStats?.pullRequests.merged ?? 0} merged this week`,
      series: prSeries,
      gradientVar: "primary",
      icon: GitPullRequest,
    },
    {
      id: "commits" as const,
      title: "Commits",
      value: commitCardValue,
      helper: `${commitCardWindowLabel} · ${githubStats?.commits.percentageChange.toFixed(1) ?? "0.0"}% vs last week`,
      series: commitSeries,
      gradientVar: "secondary",
      icon: GitCommit,
    },
    {
      id: "review" as const,
      title: "Awaiting Review",
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
      ? "Pull Requests"
      : selectedInsight === "commits"
        ? "Commits"
        : selectedInsight === "review"
          ? "Awaiting Review"
          : "Details";

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
          {/* — Top ticker + hero ——————————————— */}
          <div className="artemis-panel relative overflow-hidden rounded-[24px]">
            <div className="flex flex-wrap items-center gap-x-8 gap-y-3 border-b border-border/30 px-6 py-3.5 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="uppercase tracking-wide">Commits</span>
                <span className="font-display text-sm text-foreground">{githubStats?.commits.thisWeek ?? 0}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="uppercase tracking-wide">Open PRs</span>
                <span className="font-display text-sm text-foreground">{githubStats?.pullRequests.open ?? 0}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="uppercase tracking-wide">Awaiting</span>
                <span className="font-display text-sm text-foreground">{githubStats?.pullRequests.awaitingReview ?? 0}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="uppercase tracking-wide">Reviews</span>
                <span className="font-display text-sm text-foreground">{githubStats?.reviews.total ?? 0}</span>
              </div>
              <div className="ml-auto flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  <span>Synced {lastSyncLabel}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (!isSyncing) triggerDataCollection().catch(() => {});
                  }}
                  disabled={isSyncing}
                  title={isSyncing ? "Sync in progress…" : "Sync now"}
                  className="group inline-flex h-7 items-center gap-1.5 rounded-full border border-border/40 bg-card/40 px-3 text-[11px] font-medium text-muted-foreground transition-all hover:border-primary/40 hover:bg-primary/10 hover:text-primary disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <RefreshCcw className={`h-3 w-3 transition-transform ${isSyncing ? "animate-spin" : "group-hover:rotate-90"}`} />
                  <span>{isSyncing ? "Syncing" : "Sync now"}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 px-6 py-8 md:px-8 md:py-10 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <h1 className="font-display text-[clamp(2.6rem,5.5vw,4rem)] font-light leading-[0.92] tracking-[-0.04em]">
                  <span className="artemis-text-lunar">Engineering,</span>
                  <br />
                  <span className="artemis-text-aurora">at a glance.</span>
                </h1>
                <p className="mt-5 max-w-xl text-sm leading-relaxed text-muted-foreground">
                  Velocity, complexity and team health — together in one view, kept up to date.
                </p>
              </div>

              {/* ── Weekly velocity sparkline — driven by GitHub data ──
                  Real UI element (Linear / Stripe / Vercel style).
                  Sources: githubStats.commits.percentageChange + githubWeeklyActivity.data */}
              {velocitySparkline && (
                <div className="relative hidden h-[164px] w-[340px] lg:block">
                  {/* Header: trend label */}
                  <div className="absolute right-0 top-0 flex items-baseline gap-2">
                    <span
                      className={`font-display text-[32px] font-light leading-none tabular-nums ${
                        velocityDeltaPositive ? "text-foreground" : "text-destructive"
                      }`}
                    >
                      {velocityDeltaLabel}
                    </span>
                    <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground/70">
                      velocity · 7d
                    </span>
                  </div>

                  {/* Sparkline */}
                  <svg
                    viewBox="0 0 340 110"
                    className="absolute bottom-6 left-0 h-[110px] w-full overflow-visible"
                    aria-hidden
                  >
                    <defs>
                      <linearGradient id="spark-fill" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="hsl(262 95% 70%)" stopOpacity="0.32" />
                        <stop offset="60%" stopColor="hsl(262 95% 70%)" stopOpacity="0.06" />
                        <stop offset="100%" stopColor="hsl(262 95% 70%)" stopOpacity="0" />
                      </linearGradient>
                      <linearGradient id="spark-stroke" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="hsl(232 88% 72%)" />
                        <stop offset="55%" stopColor="hsl(262 95% 72%)" />
                        <stop offset="100%" stopColor="hsl(320 88% 74%)" />
                      </linearGradient>
                      <filter id="spark-glow" x="-30%" y="-30%" width="160%" height="160%">
                        <feGaussianBlur stdDeviation="2.4" result="b" />
                        <feMerge>
                          <feMergeNode in="b" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                    </defs>

                    {/* Dotted average baseline */}
                    <line
                      x1="6"
                      y1={velocitySparkline.avgY.toFixed(1)}
                      x2="334"
                      y2={velocitySparkline.avgY.toFixed(1)}
                      stroke="hsl(220 14% 38%)"
                      strokeWidth="1"
                      strokeDasharray="2 4"
                      opacity="0.35"
                    />

                    {/* Area fill under curve */}
                    <path d={velocitySparkline.areaD} fill="url(#spark-fill)" />

                    {/* Line stroke */}
                    <path
                      d={velocitySparkline.pathD}
                      fill="none"
                      stroke="url(#spark-stroke)"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      filter="url(#spark-glow)"
                    />

                    {/* Peak (highest day) — quiet pinpoint */}
                    {velocitySparkline.peakIdx > 0 &&
                      velocitySparkline.peakIdx < velocitySparkline.points.length - 1 && (
                        <circle
                          cx={velocitySparkline.points[velocitySparkline.peakIdx].x}
                          cy={velocitySparkline.points[velocitySparkline.peakIdx].y}
                          r="1.6"
                          fill="hsl(220 30% 80%)"
                          opacity="0.6"
                        />
                      )}

                    {/* Latest point — bright highlight */}
                    <circle
                      cx={velocitySparkline.latest.x}
                      cy={velocitySparkline.latest.y}
                      r="4.5"
                      fill="hsl(262 95% 75%)"
                      opacity="0.25"
                    />
                    <circle
                      cx={velocitySparkline.latest.x}
                      cy={velocitySparkline.latest.y}
                      r="2.4"
                      fill="hsl(0 0% 100%)"
                      style={{ filter: "drop-shadow(0 0 4px hsl(262 95% 75%))" }}
                    />
                  </svg>

                  {/* Day axis — pulled from real weekly data */}
                  <div className="absolute bottom-0 left-0 right-0 flex justify-between font-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground/40">
                    {velocitySparkline.days.map((d, i) => (
                      <span key={`${d}-${i}`}>{d.slice(0, 3)}</span>
                    ))}
                  </div>
                </div>
              )}
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
                    <span className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground/70">
                      Live
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
                      {Math.abs(trendValue)} trend
                    </span>
                    <span className="text-[11px] text-muted-foreground/70">
                      View details →
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
                <h2 className="font-display text-[34px] font-light leading-none tracking-[-0.025em]">
                  Engineering Overview
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Click any developer for details.
                </p>
              </div>
              <Badge variant="cosmic" className="hidden md:inline-flex">
                {engineeringRows.length} developers
              </Badge>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px]">
                <thead>
                  <tr className="border-b border-border/25 text-left text-[11px] uppercase tracking-[0.14em] text-muted-foreground/80">
                    <th className="px-7 py-4 font-medium">#</th>
                    <th className="px-7 py-4 font-medium">Developer</th>
                    <th className="px-7 py-4 font-medium">Commits</th>
                    <th className="px-7 py-4 font-medium">PRs</th>
                    <th className="px-7 py-4 font-medium">Merged</th>
                    <th className="px-7 py-4 font-medium">Reviews</th>
                    <th className="px-7 py-4 font-medium">Merge Rate</th>
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
                        <td className="px-7 py-4 text-xs text-muted-foreground">
                          {String(row.index).padStart(2, "0")}
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
                              <p className="mt-1.5 text-xs text-muted-foreground">
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
                        No data yet.
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
        <DialogContent className="flex h-[calc(100vh-2rem)] max-h-[calc(100vh-2rem)] w-[calc(100vw-2rem)] max-w-[calc(100vw-2rem)] flex-col gap-0 overflow-hidden p-0 border-border/55 bg-card/85 backdrop-blur-2xl">
          {/* Aurora wash behind */}
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-1 rounded-[36px] opacity-25 blur-3xl"
            style={{
              background:
                "linear-gradient(135deg, hsl(262 88% 68% / 0.4), hsl(232 78% 64% / 0.3) 50%, hsl(320 76% 70% / 0.25))",
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent"
          />

          {/* ── Header ── */}
          <div className="relative px-7 pt-6 pb-5 border-b border-border/40">
            <DialogHeader className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-primary/85 mb-1.5">
                    {selectedInsight === "prs"
                      ? "Pull Requests"
                      : selectedInsight === "commits"
                        ? "Commits · Weekly"
                        : "Review Queue"}
                  </p>
                  <DialogTitle className="font-display text-[28px] font-light leading-none tracking-[-0.025em]">
                    <span className="artemis-text-lunar">{insightTitle}</span>
                  </DialogTitle>
                  <DialogDescription className="mt-2 text-[13px] text-muted-foreground/85 max-w-md">
                    {selectedInsight === "prs"
                      ? "Every pull request opened, closed and merged. Filter by author, time window or status."
                      : selectedInsight === "commits"
                        ? "Daily commit volume across the week, with a list of the latest events."
                        : "Open PRs that don't have an APPROVED review yet — sorted by oldest first."}
                  </DialogDescription>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-secondary/30 bg-secondary/10 px-2.5 py-1 text-[11px] font-medium text-secondary tabular-nums">
                    <Sparkles className="h-3 w-3" />
                    {filteredInsightTotal}
                    <span className="text-secondary/55">/</span>
                    {insightTotal}
                  </span>
                  <DialogClose asChild>
                    <button
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border/40 bg-card/40 text-muted-foreground hover:text-foreground hover:border-border/70 transition-colors"
                      aria-label="Close"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </DialogClose>
                </div>
              </div>

              {/* Filter bar — flat, inline */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative flex-1 min-w-[220px] max-w-[360px]">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/55" />
                  <Input
                    value={insightSearch}
                    onChange={(event) => setInsightSearch(event.target.value)}
                    placeholder="Search title, author or #id…"
                    className="h-9 pl-9 text-[13px] bg-card/40 border-border/40"
                  />
                </div>

                <Select value={insightAuthorFilter} onValueChange={setInsightAuthorFilter}>
                  <SelectTrigger className="h-9 w-[180px] text-[13px] bg-card/40 border-border/40">
                    <SelectValue placeholder="Author" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All authors</SelectItem>
                    {authorOptions.map((author) => (
                      <SelectItem key={author} value={author}>{author}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={insightPeriodFilter} onValueChange={setInsightPeriodFilter}>
                  <SelectTrigger className="h-9 w-[160px] text-[13px] bg-card/40 border-border/40">
                    <CalendarRange className="h-3.5 w-3.5 text-muted-foreground/55 mr-1" />
                    <SelectValue placeholder="Window" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">All time</SelectItem>
                    <SelectItem value="7">Last 7 days</SelectItem>
                    <SelectItem value="30">Last 30 days</SelectItem>
                    <SelectItem value="90">Last 90 days</SelectItem>
                  </SelectContent>
                </Select>

                {selectedInsight !== "commits" && (
                  <Select value={insightStatusFilter} onValueChange={setInsightStatusFilter}>
                    <SelectTrigger className="h-9 w-[140px] text-[13px] bg-card/40 border-border/40">
                      <Filter className="h-3.5 w-3.5 text-muted-foreground/55 mr-1" />
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All status</SelectItem>
                      {insightStatusOptions.map((status) => (
                        <SelectItem key={status} value={status}>{formatStatusLabel(status)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </DialogHeader>
          </div>

          {/* ── Body ── */}
          <ScrollArea className="relative min-h-0 flex-1">
            <div className="px-7 py-6 space-y-5">
              {/* ─── PR list ─── */}
              {selectedInsight === "prs" && (
                <PrListPanel
                  prs={detailsLoading ? [] : filteredPrs}
                  loading={detailsLoading}
                  emptyMessage="No pull requests match these filters."
                />
              )}

              {/* ─── Commits ─── */}
              {selectedInsight === "commits" && (
                <CommitsInsightPanel
                  data={commitsByWeekday}
                  events={filteredCommitEvents}
                />
              )}

              {/* ─── Awaiting review ─── */}
              {selectedInsight === "review" && (
                <PrListPanel
                  prs={filteredReviewPrs}
                  loading={false}
                  emptyMessage="No PRs awaiting review match these filters."
                  highlightAge
                />
              )}
            </div>
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
                      {selectedDeveloper.name}
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
                          Select a PR from the left to view details.
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

/* ─────────── Insight modal: shared sub-components ─────────── */

interface PrListItem {
  id: string | number;
  number: number;
  title: string;
  status: string;
  url: string;
  createdAt: string;
  updatedAt: string;
  additions: number;
  deletions: number;
  changedFiles?: number;
  commentsCount?: number;
  reviewsCount?: number;
  author: { name: string; login?: string; avatar?: string };
  reviewers: Array<{ name: string; avatar?: string; state?: string; status?: string }>;
}

interface PrListPanelProps {
  prs: PrListItem[];
  loading: boolean;
  emptyMessage: string;
  highlightAge?: boolean;
}

/**
 * Modern, minimal PR list. Replaces the old shadcn Table — cleaner row,
 * inline avatars, status pill, impact diff, dot-based meta. Used for both
 * "Pull Requests" and "Awaiting Review" tabs of the insight modal.
 */
function PrListPanel({ prs, loading, emptyMessage, highlightAge = false }: PrListPanelProps) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-border/40 bg-card/30 p-12 text-center">
        <div className="inline-flex items-center gap-2 text-muted-foreground/70">
          <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          <span className="text-sm">Loading…</span>
        </div>
      </div>
    );
  }
  if (prs.length === 0) {
    return (
      <div className="rounded-2xl border border-border/40 bg-card/30 p-14 text-center">
        <p className="text-sm text-muted-foreground/65">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border/40 bg-card/35 backdrop-blur-md overflow-hidden">
      {prs.slice(0, 60).map((pr, idx) => (
        <PrRow key={pr.id} pr={pr} highlightAge={highlightAge} isLast={idx === prs.slice(0, 60).length - 1} />
      ))}
      {prs.length > 60 && (
        <div className="px-5 py-3 border-t border-border/30 text-center">
          <p className="text-[11px] text-muted-foreground/55 font-mono">
            Showing first 60 of {prs.length} · refine filters to narrow down
          </p>
        </div>
      )}
    </div>
  );
}

const PR_ROW_STATUS: Record<string, { label: string; tone: string; dot: string }> = {
  merged:            { label: "Merged",   tone: "text-violet-300 border-violet-500/35 bg-violet-500/10", dot: "bg-violet-400" },
  approved:          { label: "Approved", tone: "text-success border-success/35 bg-success/10",          dot: "bg-success" },
  open:              { label: "Open",     tone: "text-secondary border-secondary/35 bg-secondary/10",   dot: "bg-secondary" },
  review_requested:  { label: "Awaiting", tone: "text-amber-300 border-amber-500/35 bg-amber-500/10",   dot: "bg-amber-400" },
  changes_requested: { label: "Changes",  tone: "text-destructive border-destructive/35 bg-destructive/10", dot: "bg-destructive" },
  closed:            { label: "Closed",   tone: "text-muted-foreground border-border/40 bg-card/40",     dot: "bg-muted-foreground/60" },
  draft:             { label: "Draft",    tone: "text-muted-foreground border-border/40 bg-card/40",     dot: "bg-muted-foreground/40" },
};

function ageInDays(iso: string): number {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return 0;
  return Math.floor((Date.now() - t) / 86_400_000);
}

interface PrRowProps {
  pr: PrListItem;
  highlightAge: boolean;
  isLast: boolean;
}

function PrRow({ pr, highlightAge, isLast }: PrRowProps) {
  const statusCfg = PR_ROW_STATUS[pr.status] ?? PR_ROW_STATUS.draft;
  const age = ageInDays(pr.createdAt);
  const ageWarn = highlightAge && age >= 3;

  return (
    <div
      className={`group flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-card/55 ${
        isLast ? "" : "border-b border-border/25"
      }`}
    >
      {/* Author avatar */}
      <Avatar className="h-7 w-7 ring-1 ring-border/40 shrink-0">
        <AvatarImage src={pr.author.avatar} />
        <AvatarFallback className="text-[10px]">
          {(pr.author.name ?? "?").charAt(0)}
        </AvatarFallback>
      </Avatar>

      {/* Title + meta */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] text-muted-foreground/45 tabular-nums">
            #{pr.number}
          </span>
          <a
            href={pr.url}
            target="_blank"
            rel="noreferrer"
            className="text-[13.5px] font-medium text-foreground truncate hover:text-primary transition-colors"
          >
            {pr.title}
          </a>
        </div>
        <div className="mt-1 flex items-center gap-2.5 text-[11px] text-muted-foreground/65">
          <span className="truncate">{pr.author.name}</span>
          <span className="text-muted-foreground/30">·</span>
          <span className={ageWarn ? "text-amber-400 font-medium" : ""}>
            {age === 0 ? "today" : `${age}d ago`}
          </span>
          {(pr.additions > 0 || pr.deletions > 0) && (
            <>
              <span className="text-muted-foreground/30">·</span>
              <span className="font-mono tabular-nums">
                {pr.additions > 0 && <span className="text-success">+{pr.additions}</span>}
                {pr.additions > 0 && pr.deletions > 0 && <span className="text-muted-foreground/35"> </span>}
                {pr.deletions > 0 && <span className="text-destructive">−{pr.deletions}</span>}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Reviewers stack (when present) */}
      {pr.reviewers.length > 0 && (
        <div className="hidden md:flex items-center -space-x-1.5 shrink-0">
          {pr.reviewers.slice(0, 3).map((r, i) => (
            <Avatar key={`${r.name}-${i}`} className="h-5 w-5 ring-1 ring-card">
              <AvatarImage src={r.avatar} />
              <AvatarFallback className="text-[8px]">{r.name?.charAt(0)}</AvatarFallback>
            </Avatar>
          ))}
          {pr.reviewers.length > 3 && (
            <span className="h-5 min-w-5 px-1 rounded-full bg-muted/60 ring-1 ring-card text-[8px] font-semibold flex items-center justify-center text-muted-foreground">
              +{pr.reviewers.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Status pill */}
      <span
        className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10.5px] font-medium ${statusCfg.tone}`}
      >
        <span className={`h-1.5 w-1.5 rounded-full ${statusCfg.dot}`} />
        {statusCfg.label}
      </span>

      {/* External link */}
      <a
        href={pr.url}
        target="_blank"
        rel="noreferrer"
        className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground/55 hover:text-foreground shrink-0"
        aria-label="Open on GitHub"
      >
        <ExternalLink className="h-3.5 w-3.5" />
      </a>
    </div>
  );
}

/* ─────────── Commits insight panel (recharts-powered) ─────────── */

interface CommitsInsightPanelProps {
  data: Array<{ label: string; value: number }>;
  events: RecentActivity[];
}

function CommitsInsightPanel({ data, events }: CommitsInsightPanelProps) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const peakIdx = data.reduce(
    (best, item, i) => (item.value > data[best].value ? i : best),
    0,
  );
  const max = Math.max(...data.map((d) => d.value), 1);
  const avg = total > 0 ? Math.round(total / data.length) : 0;

  const chartData = data.map((d, i) => ({
    name: d.label.toUpperCase(),
    value: d.value,
    isPeak: i === peakIdx && d.value > 0,
  }));

  return (
    <div className="space-y-5">
      {/* Header strip with KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <InsightKpi label="Total" value={total} hint="last 7 days" />
        <InsightKpi label="Peak day" value={data[peakIdx]?.value ?? 0} hint={data[peakIdx]?.label ?? "—"} />
        <InsightKpi label="Daily avg" value={avg} hint="commits/day" />
        <InsightKpi
          label="Active days"
          value={data.filter((d) => d.value > 0).length}
          hint="of 7"
        />
      </div>

      {/* Chart */}
      <div className="rounded-2xl border border-border/40 bg-card/35 backdrop-blur-md p-5 relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 -right-24 w-[420px] h-[420px] rounded-full opacity-30 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, hsl(262 95% 65% / 0.20) 0%, transparent 70%)",
          }}
        />
        <div className="relative">
          <header className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-[14px] font-semibold leading-none">Weekly distribution</h3>
              <p className="mt-1 text-[11.5px] text-muted-foreground/70">
                Daily commits over the last 7 days · peak highlighted
              </p>
            </div>
            <span className="text-[10px] font-mono uppercase tracking-[0.16em] text-muted-foreground/55">
              {total} commits · 7d
            </span>
          </header>

          {total === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-muted-foreground/65">
                No commits in the last 7 days.
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart
                data={chartData}
                margin={{ top: 16, right: 8, left: -16, bottom: 4 }}
                barCategoryGap="22%"
              >
                <defs>
                  <linearGradient id="commits-bar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(262 95% 75%)" stopOpacity={0.95} />
                    <stop offset="60%" stopColor="hsl(245 88% 65%)" stopOpacity={0.85} />
                    <stop offset="100%" stopColor="hsl(232 78% 45%)" stopOpacity={0.25} />
                  </linearGradient>
                  <linearGradient id="commits-bar-peak" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(320 95% 78%)" stopOpacity={1} />
                    <stop offset="55%" stopColor="hsl(280 90% 70%)" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="hsl(262 78% 45%)" stopOpacity={0.3} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  vertical={false}
                  stroke="hsl(220 14% 50%)"
                  strokeOpacity={0.12}
                  strokeDasharray="2 4"
                />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  tick={{
                    fill: "hsl(220 14% 55%)",
                    fontSize: 10,
                    fontFamily: "ui-monospace, monospace",
                    letterSpacing: 2,
                  }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  width={40}
                  tick={{
                    fill: "hsl(220 14% 45%)",
                    fontSize: 10,
                    fontFamily: "ui-monospace, monospace",
                  }}
                  domain={[0, max + Math.ceil(max * 0.15)]}
                />
                <RechartsTooltip
                  cursor={{ fill: "hsl(220 22% 18% / 0.5)", radius: 8 }}
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const p = payload[0].payload;
                    return (
                      <div className="rounded-lg border border-border/55 bg-card/95 backdrop-blur-md px-3 py-2 shadow-orbit">
                        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground/65">
                          {p.name}
                        </p>
                        <p className="mt-1 font-display text-[18px] font-light leading-none tabular-nums">
                          {p.value}
                        </p>
                        <p className="mt-1 text-[10.5px] text-muted-foreground/65">
                          {p.value === 1 ? "commit" : "commits"}
                          {p.isPeak && " · peak"}
                        </p>
                      </div>
                    );
                  }}
                />
                <Bar
                  dataKey="value"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={42}
                >
                  {chartData.map((entry, idx) => (
                    <Cell
                      key={`bar-${idx}`}
                      fill={entry.isPeak ? "url(#commits-bar-peak)" : "url(#commits-bar)"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Recent commits list */}
      <div className="rounded-2xl border border-border/40 bg-card/35 backdrop-blur-md overflow-hidden">
        <header className="flex items-center justify-between px-5 py-3.5 border-b border-border/30">
          <div className="flex items-center gap-2">
            <GitCommit className="h-3.5 w-3.5 text-muted-foreground/60" />
            <h3 className="text-[13px] font-semibold">Recent commits</h3>
            {events.length > 0 && (
              <span className="rounded-full border border-border/45 bg-muted/30 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground/70">
                {events.length}
              </span>
            )}
          </div>
        </header>

        {events.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <p className="text-sm text-muted-foreground/55">No commit events in this window.</p>
          </div>
        ) : (
          events.slice(0, 50).map((activity, i, arr) => (
            <div
              key={activity.id}
              className={`group flex items-center gap-3.5 px-5 py-3 hover:bg-card/55 transition-colors ${
                i === arr.length - 1 ? "" : "border-b border-border/25"
              }`}
            >
              <div className="h-7 w-7 rounded-lg bg-card/50 border border-border/40 flex items-center justify-center text-muted-foreground/65 shrink-0">
                <GitCommit className="h-3 w-3" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-foreground truncate">
                  {activity.message}
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground/65">
                  {activity.developer.name} ·{" "}
                  <span className="font-mono">
                    {new Date(activity.timestamp).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </p>
              </div>
              {activity.url && (
                <a
                  href={activity.url}
                  target="_blank"
                  rel="noreferrer"
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground/55 hover:text-foreground shrink-0"
                  aria-label="Open commit"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

interface InsightKpiProps {
  label: string;
  value: number;
  hint?: string;
}

function InsightKpi({ label, value, hint }: InsightKpiProps) {
  return (
    <div className="rounded-xl border border-border/40 bg-card/35 backdrop-blur-md px-3.5 py-3 transition-colors hover:border-primary/30">
      <p className="text-[10px] font-mono uppercase tracking-[0.14em] text-muted-foreground/55">
        {label}
      </p>
      <p className="mt-1.5 font-display text-[24px] font-light leading-none tabular-nums">
        {value}
      </p>
      {hint && (
        <p className="mt-1 text-[10px] text-muted-foreground/55">{hint}</p>
      )}
    </div>
  );
}
