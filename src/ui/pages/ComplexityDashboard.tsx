import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  Brain,
  CheckCircle2,
  Gauge,
  Layers,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import { useAuth } from "../contexts/AuthContext";
import { apiService } from "../services/api.service";
import { DoubtfulAnalysisQueue } from "../components/DoubtfulAnalysisQueue";
import { DashboardHeader } from "../components/DashboardHeader";
import { useUIStore, getSidebarOffset } from "../stores/uiStore";
import { useIsMobile } from "../hooks/useIsMobile";
import { cn } from "../lib/utils";
import type { PrAnalysis, SubmitFeedback } from "../types/analysis.types";

/**
 * ComplexityDashboard — full UI/UX rewrite.
 *
 * Layout: hero with explanatory copy + 3 KPI tiles, then the queue.
 * Aesthetic: artemis-panel glass surfaces, hairline highlights,
 * data-first / decoration-light.
 */
export default function ComplexityDashboard() {
  const { token } = useAuth();
  const { sidebarCollapsed } = useUIStore();
  const isMobile = useIsMobile();
  const contentLeft = getSidebarOffset(sidebarCollapsed, isMobile);
  const [activeTab, setActiveTab] = useState("complexity");
  const [doubtful, setDoubtful] = useState<PrAnalysis[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    void loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const loadData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const d = await apiService.getDoubtfulAnalyses(token);
      setDoubtful(d);
    } catch (err) {
      console.error("Failed to load complexity data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = async (analysisId: string, feedback: SubmitFeedback) => {
    if (!token) return;
    await apiService.submitAnalysisFeedback(token, analysisId, feedback);
    setDoubtful((prev) => prev.filter((a) => a.id !== analysisId));
  };

  const avgConfidence = useMemo(() => {
    if (doubtful.length === 0) return null;
    return Math.round(
      (doubtful.reduce((s, a) => s + a.confidence, 0) / doubtful.length) * 100,
    );
  }, [doubtful]);

  const lowestConfidence = useMemo(() => {
    if (doubtful.length === 0) return null;
    return Math.round(Math.min(...doubtful.map((a) => a.confidence)) * 100);
  }, [doubtful]);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden text-foreground">
      {/* Decorative backdrop — same vocabulary as Profile / Settings */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute -top-40 -right-40 w-[700px] h-[700px] rounded-full opacity-50 blur-3xl"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, hsl(262 95% 70% / 0.12) 0%, transparent 60%)",
          }}
        />
        <div
          className="absolute -bottom-32 -left-32 w-[640px] h-[640px] rounded-full opacity-40 blur-3xl"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, hsl(232 78% 64% / 0.08) 0%, transparent 60%)",
          }}
        />
      </div>

      <DashboardHeader activeTab={activeTab} onTabChange={setActiveTab} />

      <main
        className="relative z-10 pr-6 md:pr-10 pt-[148px] pb-20 transition-[padding-left] duration-300"
        style={{ paddingLeft: contentLeft + 16 }}
      >
        <div className="max-w-6xl mx-auto space-y-6">
          {/* ── Page heading ── */}
          <header className="px-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/60">
              Intelligence
            </p>
            <h1 className="mt-2 font-display text-[32px] font-light leading-none tracking-[-0.025em]">
              <span className="artemis-text-lunar">Complexity</span>
            </h1>
            <p className="mt-2 text-sm text-muted-foreground max-w-xl">
              Per-PR difficulty scores from the AI pipeline, with a queue for
              the items the model isn't sure about.
            </p>
          </header>

          {/* ── Hero overview ── */}
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="artemis-panel relative overflow-hidden rounded-[24px]"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -top-32 -right-24 w-[420px] h-[420px] rounded-full opacity-50 blur-3xl"
              style={{
                background:
                  "radial-gradient(circle, hsl(262 95% 65% / 0.15) 0%, transparent 70%)",
              }}
            />

            <div className="relative grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-7 items-end p-7 md:p-9">
              {/* Left: explanatory copy */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-secondary/30 bg-secondary/8 px-2.5 py-0.5 text-[11px] font-medium text-secondary">
                    <Sparkles className="h-3 w-3" />
                    AI assisted
                  </span>
                  {!loading && doubtful.length > 0 && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-medium text-amber-400">
                      <AlertTriangle className="h-3 w-3" />
                      {doubtful.length} need review
                    </span>
                  )}
                  {!loading && doubtful.length === 0 && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-2.5 py-0.5 text-[11px] font-medium text-success">
                      <CheckCircle2 className="h-3 w-3" />
                      All clear
                    </span>
                  )}
                </div>

                <h2 className="font-display text-[clamp(1.8rem,3.4vw,2.6rem)] font-light leading-[1.05] tracking-[-0.02em]">
                  <span className="artemis-text-lunar">Read the diff,</span>
                  <br />
                  <span className="artemis-text-aurora">judge the difficulty.</span>
                </h2>
                <p className="mt-4 text-[14px] leading-relaxed text-muted-foreground max-w-xl">
                  Every merged PR is scored on{" "}
                  <strong className="text-foreground/95">scope, risk and effort</strong>.
                  When confidence dips below 60% we route the analysis here for
                  a human to confirm or correct — and your feedback retrains
                  the next batch.
                </p>
              </div>

              {/* Right: KPI tiles — only when there's something to show */}
              {!loading && doubtful.length > 0 && (
                <div className="grid grid-cols-3 gap-2.5">
                  <KpiTile
                    icon={Layers}
                    label="Pending"
                    value={String(doubtful.length)}
                    hint="awaiting review"
                    tone="warning"
                  />
                  <KpiTile
                    icon={Gauge}
                    label="Avg conf"
                    value={avgConfidence != null ? `${avgConfidence}%` : "—"}
                    hint="across queue"
                    tone="neutral"
                  />
                  <KpiTile
                    icon={Activity}
                    label="Pipeline"
                    value="Active"
                    hint="cron · hourly"
                    tone="success"
                  />
                </div>
              )}
            </div>
          </motion.section>

          {/* ── Loading state ── */}
          {loading && (
            <motion.section
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="artemis-panel rounded-[24px] p-12 text-center"
            >
              <div className="flex items-center justify-center gap-3 text-muted-foreground/70">
                <span className="inline-flex h-2 w-2 rounded-full bg-primary animate-pulse" />
                <span className="text-sm">Loading complexity data…</span>
              </div>
            </motion.section>
          )}

          {/* ── Empty state — celebratory ── */}
          {!loading && doubtful.length === 0 && (
            <motion.section
              key="empty"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="artemis-panel relative overflow-hidden rounded-[24px] p-10 md:p-14"
            >
              {/* Aurora bloom centerpiece */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 flex items-center justify-center"
              >
                <div
                  className="h-[420px] w-[420px] rounded-full opacity-40 blur-3xl"
                  style={{
                    background:
                      "radial-gradient(circle at 50% 50%, hsl(152 72% 50% / 0.20) 0%, hsl(262 80% 65% / 0.10) 45%, transparent 70%)",
                  }}
                />
              </div>

              <div className="relative max-w-md mx-auto text-center">
                {/* Animated check icon */}
                <motion.div
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    delay: 0.15,
                    type: "spring",
                    stiffness: 220,
                    damping: 16,
                  }}
                  className="relative mx-auto h-16 w-16 mb-5"
                >
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background:
                        "radial-gradient(circle, hsl(152 72% 50% / 0.45) 0%, transparent 70%)",
                      filter: "blur(14px)",
                    }}
                  />
                  <div className="relative h-16 w-16 rounded-2xl bg-success/15 border border-success/35 flex items-center justify-center shadow-[0_0_30px_-4px_hsl(152_72%_50%/0.5)]">
                    <Sparkles className="h-7 w-7 text-success" />
                  </div>
                </motion.div>

                <h3 className="font-display text-[28px] font-light leading-tight tracking-[-0.02em]">
                  <span className="artemis-text-lunar">Every little thing is </span>
                  <span className="artemis-text-aurora">gonna be alright.</span>
                </h3>
                <p className="mt-4 text-[14px] leading-relaxed text-muted-foreground max-w-sm mx-auto">
                  Our AI got all done — no analyses are pending review. The
                  pipeline will route new low-confidence items here as they
                  come in.
                </p>

                {/* Tiny pipeline status row */}
                <div className="mt-7 inline-flex items-center gap-2.5 rounded-full border border-border/40 bg-card/40 px-3 py-1.5 text-[11px] font-medium">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success/70" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-success" />
                  </span>
                  <span className="uppercase tracking-[0.14em] text-muted-foreground/85">
                    Pipeline active · cron hourly
                  </span>
                </div>
              </div>
            </motion.section>
          )}

          {/* ── How it works + Queue (only when there are pending items) ── */}
          {!loading && doubtful.length > 0 && (
            <>
              <motion.section
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.05 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-3"
              >
                <Step
                  n="01"
                  icon={Brain}
                  title="Score"
                  body="LLM reads the diff + PR description, emits scope, risk, effort and a confidence."
                />
                <Step
                  n="02"
                  icon={AlertTriangle}
                  title="Triage"
                  body="Anything below 60% confidence lands in this queue. High-confidence analyses go straight to dashboards."
                />
                <Step
                  n="03"
                  icon={CheckCircle2}
                  title="Learn"
                  body="Your corrections feed back into the system prompt of the next batch."
                />
              </motion.section>

              <motion.section
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="artemis-panel rounded-[24px] p-7 md:p-8"
              >
                <header className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-xl bg-primary/12 border border-primary/30 flex items-center justify-center text-primary">
                      <TrendingUp className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-[15px] font-semibold leading-none">
                        Review queue
                      </h3>
                      <p className="text-xs text-muted-foreground/70 mt-1">
                        Confirm, correct, or skip — your call retrains the model.
                      </p>
                    </div>
                  </div>
                  {lowestConfidence != null && (
                    <div className="text-right">
                      <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground/55">
                        Lowest conf
                      </p>
                      <p className="mt-0.5 font-display text-[18px] font-light tabular-nums text-amber-400">
                        {lowestConfidence}%
                      </p>
                    </div>
                  )}
                </header>

                <DoubtfulAnalysisQueue
                  analyses={doubtful}
                  onSubmitFeedback={handleFeedback}
                />
              </motion.section>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

/* ─────────── Local primitives ─────────── */

interface KpiTileProps {
  icon: typeof Brain;
  label: string;
  value: string;
  hint: string;
  tone: "neutral" | "success" | "warning";
}

const KpiTile = ({ icon: Icon, label, value, hint, tone }: KpiTileProps) => {
  const toneClass = {
    neutral: "border-border/45 text-foreground",
    success: "border-success/35 text-success",
    warning: "border-amber-500/35 text-amber-400",
  }[tone];

  return (
    <div
      className={cn(
        "rounded-xl bg-card/40 backdrop-blur-md px-3.5 py-3 min-w-[110px] border",
        toneClass,
      )}
    >
      <div className="flex items-center gap-1.5 text-muted-foreground/65">
        <Icon className="h-3 w-3" />
        <span className="text-[10px] uppercase tracking-[0.14em]">{label}</span>
      </div>
      <p className="mt-1.5 font-display text-[22px] font-light leading-none tabular-nums">
        {value}
      </p>
      <p className="mt-1 text-[10px] text-muted-foreground/65">{hint}</p>
    </div>
  );
};

interface StepProps {
  n: string;
  icon: typeof Brain;
  title: string;
  body: string;
}

const Step = ({ n, icon: Icon, title, body }: StepProps) => (
  <div className="rounded-xl border border-border/40 bg-card/30 backdrop-blur-md px-4 py-4 transition-colors hover:border-primary/30">
    <div className="flex items-center gap-2.5 mb-2">
      <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-primary/85">
        {n}
      </span>
      <Icon className="h-3.5 w-3.5 text-muted-foreground/65" />
      <p className="text-[13px] font-semibold text-foreground">{title}</p>
    </div>
    <p className="text-[12px] leading-relaxed text-muted-foreground/85">
      {body}
    </p>
  </div>
);
