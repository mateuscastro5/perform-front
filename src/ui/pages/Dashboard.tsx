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
  Clock3,
  ExternalLink,
  Filter,
  GitCommit,
  GitPullRequest,
  MessageSquare,
  Search,
  Sparkles,
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

function Sparkline({ values, colorClass }: { values: number[]; colorClass: string }) {
  if (values.length === 0) {
    return <div className="h-[70px] rounded-xl border border-border/20 bg-background/20" />;
  }

  const maxValue = Math.max(...values);
  const minValue = Math.min(...values);
  const sameValueSeries = maxValue === minValue;
  const padding = sameValueSeries ? 1 : (maxValue - minValue) * 0.15;
  const domainMin = minValue - padding;
  const domainMax = maxValue + padding;
  const range = Math.max(domainMax - domainMin, 1);

  const path = values
    .map((value, index) => {
      const x = (index / Math.max(values.length - 1, 1)) * 260;
      const y = 62 - ((value - domainMin) / range) * 52;
      return `${x},${y}`;
    })
    .join(" L ");

  return (
    <div className="h-[70px] rounded-xl border border-border/20 bg-gradient-to-b from-background/0 to-background/45 relative overflow-hidden">
      <svg viewBox="0 0 260 70" className="w-full h-full">
        <path d={`M ${path}`} fill="none" className={colorClass} strokeWidth="2.2" strokeLinecap="round" />
        {values.map((value, index) => {
          const x = (index / Math.max(values.length - 1, 1)) * 260;
          const y = 62 - ((value - domainMin) / range) * 52;
          return <circle key={`${x}-${y}`} cx={x} cy={y} r={1.8} className={colorClass} />;
        })}
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

function getStatusBadgeVariant(status: string): "default" | "secondary" | "destructive" | "outline" | "success" {
  if (["merged", "approved"].includes(status)) return "success";
  if (["changes_requested", "rejected"].includes(status)) return "destructive";
  if (["review_requested", "pending", "open"].includes(status)) return "default";
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
        console.error("Failed to load dashboard detail data:", error);
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

  const commitCardWindowLabel = commitSeries.length > 7 ? "últimos 10 dias" : "últimos 7 dias";

  const insightCards = [
    {
      id: "prs" as const,
      title: "PRs",
      value: githubStats?.pullRequests.total ?? 0,
      helper: `${githubStats?.pullRequests.open ?? 0} abertas · ${githubStats?.pullRequests.merged ?? 0} merged`,
      series: prSeries,
      colorClass: "stroke-[hsl(var(--accent)/0.75)]",
      icon: GitPullRequest,
    },
    {
      id: "commits" as const,
      title: "Commits",
      value: commitCardValue,
      helper: `${commitCardWindowLabel} · ${githubStats?.commits.percentageChange.toFixed(1) ?? "0.0"}% vs semana anterior`,
      series: commitSeries,
      colorClass: "stroke-[hsl(var(--primary)/0.75)]",
      icon: GitCommit,
    },
    {
      id: "review" as const,
      title: "PRs em Review",
      value: githubStats?.pullRequests.awaitingReview ?? 0,
      helper: `${githubStats?.reviews.pending ?? 0} reviews pendentes`,
      series: reviewSeries,
      colorClass: "stroke-[hsl(var(--warning)/0.75)]",
      icon: MessageSquare,
    },
  ];

  const engineeringRows = useMemo(() => {
    return githubDevelopers
    .filter((developer) => {
      const u = developer.githubUsername ?? '';
      return !u.includes('[bot]') && !u.includes('@') && u.length > 0;
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

  const selectedDeveloperCommitEvents = useMemo(() => {
    if (!selectedDeveloper) return [];
    return commitEvents.filter(
      (activity) =>
        activity.developer.id === selectedDeveloper.id ||
        activity.developer.githubUsername === selectedDeveloper.handle ||
        activity.developer.name.toLowerCase() === selectedDeveloper.name.toLowerCase(),
    );
  }, [commitEvents, selectedDeveloper]);

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

    // Use the API-provided window stats so the modal numbers always match
    // the row in the Engineering Overview table (both reflect the same
    // 30-day backend query).
    return {
      commits:    selectedDeveloper.commits,
      prs:        selectedDeveloper.prs,
      merged:     selectedDeveloper.merged,
      reviews:    selectedDeveloper.reviews,
      mergeRate:  selectedDeveloper.mergeRate,
      periodDays: selectedDeveloper.periodDays,
      periodSince: selectedDeveloper.periodSince,
    };
  }, [selectedDeveloper]);

  const insightTitle =
    selectedInsight === "prs"
      ? "PRs Details"
      : selectedInsight === "commits"
        ? "Commits Details"
        : selectedInsight === "review"
          ? "PRs in Review"
          : "Engineering Details";

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
    const labels = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    const counts = [0, 0, 0, 0, 0, 0, 0];

    for (const event of filteredCommitEvents) {
      const dayIndex = new Date(event.timestamp).getDay();
      counts[dayIndex] += 1;
    }

    const hasEvents = counts.some((value) => value > 0);
    if (!hasEvents && githubWeeklyActivity?.data?.length) {
      for (const entry of githubWeeklyActivity.data) {
        const normalized = entry.day.slice(0, 3).toLowerCase();
        const map: Record<string, number> = { dom: 0, seg: 1, ter: 2, qua: 3, qui: 4, sex: 5, sáb: 6, sab: 6 };
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
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_12%,hsl(var(--accent)/0.18),transparent_38%),radial-gradient(circle_at_88%_8%,hsl(var(--primary)/0.12),transparent_34%),radial-gradient(circle_at_45%_86%,hsl(var(--secondary)/0.1),transparent_42%)]" />
      <DashboardHeader activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="pl-[316px] pr-6 pt-[122px] pb-8 relative z-10">
        <div className="rounded-[24px] border border-border/35 bg-card/18 backdrop-blur-2xl overflow-hidden">
          <div className="h-[44px] border-b border-border/25 px-5 flex items-center gap-8 text-sm text-muted-foreground overflow-x-auto">
            <div className="flex items-center gap-2 whitespace-nowrap">
              <span className="text-xs tracking-wide">COMMITS</span>
              <span className="text-foreground font-medium">{githubStats?.commits.thisWeek ?? 0}</span>
            </div>
            <div className="flex items-center gap-2 whitespace-nowrap">
              <span className="text-xs tracking-wide">OPEN PRS</span>
              <span className="text-foreground font-medium">{githubStats?.pullRequests.open ?? 0}</span>
            </div>
            <div className="flex items-center gap-2 whitespace-nowrap">
              <span className="text-xs tracking-wide">AWAITING REVIEW</span>
              <span className="text-foreground font-medium">{githubStats?.pullRequests.awaitingReview ?? 0}</span>
            </div>
            <div className="flex items-center gap-2 whitespace-nowrap">
              <span className="text-xs tracking-wide">REVIEWS</span>
              <span className="text-foreground font-medium">{githubStats?.reviews.total ?? 0}</span>
            </div>
          </div>

          <div className="p-6 md:p-7">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
              <Circle className="h-2.5 w-2.5 fill-muted-foreground/80" />
              <span>Last update: {isLoading ? "loading..." : "just now"}</span>
            </div>

            <h1 className="text-[54px] leading-[0.9] tracking-[-0.04em] font-light text-foreground max-w-[720px]">
              Live Engineering
              <br />
              Intelligence
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-8">
              {insightCards.map((card, index) => {
                const Icon = card.icon;
                const trendValue = card.series.length > 1 ? card.series[card.series.length - 1] - card.series[0] : 0;
                const positive = trendValue >= 0;

                return (
                  <motion.button
                    key={card.id}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.08 }}
                    onClick={() => setSelectedInsight(card.id)}
                    className="text-left rounded-[24px] border border-border/35 bg-background/42 backdrop-blur-xl px-6 py-5 hover:border-border/60 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="h-10 w-10 rounded-xl border border-border/30 bg-muted/25 flex items-center justify-center">
                        <Icon className="h-5 w-5 text-foreground/85" />
                      </div>
                      <span className="text-xs text-muted-foreground">API</span>
                    </div>

                    <p className="text-sm text-muted-foreground">{card.title}</p>
                    <p className="text-[44px] tracking-[-0.02em] leading-none font-light mt-2 text-foreground">
                      {toCompact(card.value)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">{card.helper}</p>

                    <div className="mt-4 flex items-center justify-between">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs ${positive ? "text-emerald-300 bg-emerald-500/15" : "text-rose-300 bg-rose-500/15"}`}>
                        {positive ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                        {Math.abs(trendValue)} trend
                      </span>
                      <span className="text-xs text-muted-foreground">click for details</span>
                    </div>

                    <div className="mt-4">
                      <Sparkline values={card.series} colorClass={card.colorClass} />
                    </div>
                  </motion.button>
                );
              })}
            </div>

            <section className="mt-8 rounded-[22px] border border-border/35 bg-background/35 backdrop-blur-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-border/25 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Clock3 className="h-3.5 w-3.5" />
                    <span>Engineering Data</span>
                  </div>
                  <h2 className="text-[34px] leading-none tracking-[-0.03em] font-light mt-2">Engineering Overview</h2>
                </div>

                <div className="text-xs text-muted-foreground">
                  click any engineer for details
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[980px]">
                  <thead>
                    <tr className="text-left text-xs text-muted-foreground border-b border-border/25">
                      <th className="px-6 py-3 font-medium">No</th>
                      <th className="px-6 py-3 font-medium">Developer</th>
                      <th className="px-6 py-3 font-medium">Commits</th>
                      <th className="px-6 py-3 font-medium">PRs</th>
                      <th className="px-6 py-3 font-medium">Merged PRs</th>
                      <th className="px-6 py-3 font-medium">Reviews</th>
                      <th className="px-6 py-3 font-medium">Merge Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {engineeringRows.map((row) => {
                      const positive = row.mergeRate >= 50;
                      return (
                        <tr
                          key={row.id}
                          className="border-b border-border/20 hover:bg-muted/20 transition-colors cursor-pointer"
                          onClick={() => setSelectedDeveloperId(row.id)}
                        >
                          <td className="px-6 py-4 text-muted-foreground">#{row.index}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full overflow-hidden bg-muted/30 border border-border/30">
                                {row.avatar ? (
                                  <img src={row.avatar} alt={row.name} className="h-full w-full object-cover" />
                                ) : (
                                  <div className="h-full w-full flex items-center justify-center text-xs font-semibold">
                                    {row.name.charAt(0)}
                                  </div>
                                )}
                              </div>
                              <div>
                                <p className="text-sm font-medium leading-none">{row.name}</p>
                                <p className="text-xs text-muted-foreground mt-1">@{row.handle}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm">{row.commits}</td>
                          <td className="px-6 py-4 text-sm">{row.prs}</td>
                          <td className="px-6 py-4 text-sm">{row.merged}</td>
                          <td className="px-6 py-4 text-sm">{row.reviews}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs ${positive ? "bg-emerald-500/15 text-emerald-300" : "bg-rose-500/15 text-rose-300"}`}>
                              {row.mergeRate.toFixed(1)}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Dialog open={selectedInsight !== null} onOpenChange={(open) => !open && setSelectedInsight(null)}>
        <DialogContent className="flex h-[calc(100vh-2rem)] max-h-[calc(100vh-2rem)] w-[calc(100vw-2rem)] max-w-[calc(100vw-2rem)] flex-col gap-0 overflow-hidden p-0">
          <div className="p-6 pb-4 bg-gradient-to-r from-card/80 via-card/40 to-background">
            <DialogHeader className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <DialogTitle className="text-2xl font-semibold">{insightTitle}</DialogTitle>
                  <DialogDescription className="mt-1">
                    Data loaded from GitHub analytics endpoints and persisted backend records.
                  </DialogDescription>
                </div>
                <Badge variant="outline" className="gap-1">
                  <Sparkles className="h-3.5 w-3.5" />
                  {filteredInsightTotal} of {insightTotal} records
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={insightSearch}
                    onChange={(event) => setInsightSearch(event.target.value)}
                    placeholder="Search by title, author or ID..."
                    className="pl-9"
                  />
                </div>

                <Select value={insightAuthorFilter} onValueChange={setInsightAuthorFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by author" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All authors</SelectItem>
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <Card className="shadow-none border-border/60 bg-background/60">
                  <CardContent className="p-3">
                    <p className="text-xs text-muted-foreground">Filtered window</p>
                    <p className="text-sm font-medium mt-1">{insightPeriodFilter === "0" ? "All time" : `Last ${insightPeriodFilter} days`}</p>
                  </CardContent>
                </Card>
                <Card className="shadow-none border-border/60 bg-background/60">
                  <CardContent className="p-3">
                    <p className="text-xs text-muted-foreground">Author</p>
                    <p className="text-sm font-medium mt-1">{insightAuthorFilter === "all" ? "All authors" : insightAuthorFilter}</p>
                  </CardContent>
                </Card>
                <Card className="shadow-none border-border/60 bg-background/60">
                  <CardContent className="p-3">
                    <p className="text-xs text-muted-foreground">Search</p>
                    <p className="text-sm font-medium mt-1 truncate">{insightSearch.trim() ? insightSearch : "No keyword"}</p>
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
                        <TableHead>Author</TableHead>
                        <TableHead>Delta</TableHead>
                        <TableHead>Files</TableHead>
                        <TableHead>Reviews</TableHead>
                        <TableHead className="text-right">Link</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(detailsLoading ? [] : filteredPrs).slice(0, 40).map((pr) => (
                        <TableRow key={pr.id}>
                          <TableCell className="font-medium max-w-[420px] truncate">#{pr.number} {pr.title}</TableCell>
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
                    <p className="text-sm text-muted-foreground py-6 text-center">
                      {insightTotal > 0
                        ? "No pull requests match the current filters. Try changing window, author, status or search."
                        : "No pull requests found for current filters."}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {selectedInsight === "commits" && (
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Weekly Commit Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-xl border border-border/60 bg-background/40 p-4">
                      <div className="flex items-end gap-3 h-[190px]">
                        {commitsByWeekday.map((item) => {
                          const heightPercent = Math.max((item.value / commitBarMax) * 100, item.value > 0 ? 14 : 4);
                          return (
                            <div key={item.label} className="flex-1 flex flex-col items-center gap-2">
                              <span className="text-xs text-muted-foreground">{item.value}</span>
                              <div className="w-full h-[130px] rounded-md border border-border/50 bg-card/40 p-1 flex items-end">
                                <div
                                  className="w-full rounded-[6px] bg-gradient-to-t from-primary/80 to-primary/20"
                                  style={{ height: `${heightPercent}%` }}
                                />
                              </div>
                              <span className="text-xs font-medium text-muted-foreground">{item.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Recent Commit Events</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {filteredCommitEvents.slice(0, 40).map((activity) => (
                      <div key={activity.id} className="rounded-md border p-3">
                        <p className="text-sm font-medium line-clamp-1">{activity.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">
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
                      <p className="text-sm text-muted-foreground py-6 text-center">No commit events found for current filters.</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {selectedInsight === "review" && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">PRs Awaiting Review</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>PR</TableHead>
                        <TableHead>Author</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Reviewers</TableHead>
                        <TableHead>Comments</TableHead>
                        <TableHead className="text-right">Link</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredReviewPrs.slice(0, 40).map((pr) => (
                        <TableRow key={pr.id}>
                          <TableCell className="font-medium max-w-[420px] truncate">#{pr.number} {pr.title}</TableCell>
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
                    <p className="text-sm text-muted-foreground py-6 text-center">No review PRs found for current filters.</p>
                  )}
                </CardContent>
              </Card>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <Dialog open={selectedDeveloperId !== null} onOpenChange={(open) => !open && setSelectedDeveloperId(null)}>
        <DialogContent className="flex h-[calc(100vh-2rem)] max-h-[calc(100vh-2rem)] w-[calc(100vw-2rem)] max-w-[calc(100vw-2rem)] flex-col gap-0 overflow-hidden p-0">
          {selectedDeveloper ? (
            <>
              <div className="p-6 pb-4">
                <DialogHeader className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <DialogTitle className="flex items-center gap-3 text-2xl font-semibold">
                      <Avatar className="h-10 w-10 border">
                        <AvatarImage src={selectedDeveloper.avatar ?? undefined} alt={selectedDeveloper.name} />
                        <AvatarFallback>{selectedDeveloper.name.slice(0, 1)}</AvatarFallback>
                      </Avatar>
                      {selectedDeveloper.name} · Engineering Details
                    </DialogTitle>
                    <Badge variant="outline">
                      Window: last {selectedDeveloperSummary.periodDays} days
                      {selectedDeveloperSummary.periodSince
                        ? ` · since ${new Date(selectedDeveloperSummary.periodSince).toLocaleDateString()}`
                        : ""}
                    </Badge>
                  </div>
                  <DialogDescription>
                    Counts reflect the last {selectedDeveloperSummary.periodDays} days; the PR list below shows the most recent matches in this window.
                  </DialogDescription>
                </DialogHeader>
              </div>

              <Separator />

              <ScrollArea className="min-h-0 flex-1 px-6 py-5">
                <div className="space-y-5">
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    <Card className="border-border/60 bg-card/60">
                      <CardContent className="p-4">
                        <p className="text-xs text-muted-foreground">Commits</p>
                        <p className="text-2xl font-semibold mt-1">{selectedDeveloperSummary.commits}</p>
                      </CardContent>
                    </Card>
                    <Card className="border-border/60 bg-card/60">
                      <CardContent className="p-4">
                        <p className="text-xs text-muted-foreground">PRs</p>
                        <p className="text-2xl font-semibold mt-1">{selectedDeveloperSummary.prs}</p>
                      </CardContent>
                    </Card>
                    <Card className="border-border/60 bg-card/60">
                      <CardContent className="p-4">
                        <p className="text-xs text-muted-foreground">Merged PRs</p>
                        <p className="text-2xl font-semibold mt-1">{selectedDeveloperSummary.merged}</p>
                      </CardContent>
                    </Card>
                    <Card className="border-border/60 bg-card/60">
                      <CardContent className="p-4">
                        <p className="text-xs text-muted-foreground">Reviews in this scope</p>
                        <p className="text-2xl font-semibold mt-1">{selectedDeveloperSummary.reviews}</p>
                      </CardContent>
                    </Card>
                    <Card className="border-border/60 bg-card/60">
                      <CardContent className="p-4">
                        <p className="text-xs text-muted-foreground">Merge Rate</p>
                        <p className="text-2xl font-semibold mt-1">{selectedDeveloperSummary.mergeRate.toFixed(1)}%</p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid xl:grid-cols-[340px,1fr] gap-4">
                    <Card className="border-border/60 bg-card/60">
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

                        <ScrollArea className="h-[430px] rounded-md border border-border/60">
                          <div className="p-2 space-y-2">
                            {filteredDeveloperPrs.map((pr) => (
                              <button
                                key={pr.id}
                                type="button"
                                onClick={() => setSelectedPrNumber(pr.number)}
                                className={`w-full rounded-lg border p-3 text-left transition-colors ${
                                  selectedPrNumber === pr.number
                                    ? "border-primary/70 bg-primary/10"
                                    : "border-border/50 bg-background/40 hover:bg-muted/40"
                                }`}
                              >
                                <p className="text-sm font-semibold truncate">#{pr.number} {pr.title}</p>
                                <div className="mt-2 flex items-center justify-between gap-2">
                                  <Badge variant={getStatusBadgeVariant(pr.status)}>{formatStatusLabel(pr.status)}</Badge>
                                  <span className="text-[11px] text-muted-foreground">
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
                              <div className="rounded-md border border-dashed border-border/70 p-4 text-center text-sm text-muted-foreground">
                                No PRs found with current search/filter.
                              </div>
                            )}
                          </div>
                        </ScrollArea>
                      </CardContent>
                    </Card>

                    {selectedPr ? (
                      <div className="space-y-4">
                        <Card className="border-border/60 bg-card/60">
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <CardTitle className="text-xl">#{selectedPr.number} {selectedPr.title}</CardTitle>
                                <p className="text-xs text-muted-foreground mt-1">
                                  Updated {new Date(selectedPr.updatedAt).toLocaleString()}
                                </p>
                                <div className="mt-2 flex items-center gap-2">
                                  <Badge variant={getStatusBadgeVariant(selectedPr.status)}>
                                    {formatStatusLabel(selectedPr.status)}
                                  </Badge>
                                  <Badge variant="outline">{selectedPr.reviewers.length} reviewers</Badge>
                                </div>
                              </div>
                              <Button variant="outline" size="sm" asChild>
                                <a href={selectedPr.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1">
                                  Open on GitHub <ExternalLink className="h-3.5 w-3.5" />
                                </a>
                              </Button>
                            </div>
                          </CardHeader>

                          <CardContent className="space-y-4">
                            <div className="grid md:grid-cols-4 gap-3">
                              <Card className="shadow-none border-border/60 bg-background/45">
                                <CardContent className="p-3">
                                  <p className="text-xs text-muted-foreground">Additions</p>
                                  <p className="text-lg font-semibold mt-1">+{selectedPr.additions}</p>
                                </CardContent>
                              </Card>
                              <Card className="shadow-none border-border/60 bg-background/45">
                                <CardContent className="p-3">
                                  <p className="text-xs text-muted-foreground">Deletions</p>
                                  <p className="text-lg font-semibold mt-1">-{selectedPr.deletions}</p>
                                </CardContent>
                              </Card>
                              <Card className="shadow-none border-border/60 bg-background/45">
                                <CardContent className="p-3">
                                  <p className="text-xs text-muted-foreground">Files changed</p>
                                  <p className="text-lg font-semibold mt-1">{selectedPr.changedFiles}</p>
                                </CardContent>
                              </Card>
                              <Card className="shadow-none border-border/60 bg-background/45">
                                <CardContent className="p-3">
                                  <p className="text-xs text-muted-foreground">Reviews / Comments</p>
                                  <p className="text-lg font-semibold mt-1">{selectedPr.reviewsCount} / {selectedPr.commentsCount}</p>
                                </CardContent>
                              </Card>
                            </div>

                            <Card className="shadow-none border-border/60 bg-background/45">
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
                                        <div className="flex items-center justify-between text-xs mb-1">
                                          <span className="text-muted-foreground">Additions</span>
                                          <span>+{selectedPr.additions}</span>
                                        </div>
                                        <div className="h-2 rounded-full bg-muted/40 overflow-hidden">
                                          <div className="h-full bg-emerald-500/70" style={{ width: `${additionsPct}%` }} />
                                        </div>
                                      </div>
                                      <div>
                                        <div className="flex items-center justify-between text-xs mb-1">
                                          <span className="text-muted-foreground">Deletions</span>
                                          <span>-{selectedPr.deletions}</span>
                                        </div>
                                        <div className="h-2 rounded-full bg-muted/40 overflow-hidden">
                                          <div className="h-full bg-rose-500/70" style={{ width: `${deletionsPct}%` }} />
                                        </div>
                                      </div>
                                    </>
                                  );
                                })()}
                              </CardContent>
                            </Card>
                          </CardContent>
                        </Card>

                        <Card className="border-border/60 bg-card/60">
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
                              <div className="rounded-md border border-dashed border-border/70 p-4 text-sm text-muted-foreground">
                                No reviewer activity yet.
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    ) : (
                      <Card className="border-border/60 bg-card/60">
                        <CardContent className="p-8 text-sm text-muted-foreground text-center">
                          Select a PR from the left to inspect details.
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
