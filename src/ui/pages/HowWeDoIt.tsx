import { useState, useMemo, type ReactNode } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  Brain,
  GitBranch,
  GitCommit,
  GitPullRequest,
  Sparkles,
  Target,
  Telescope,
  TrendingUp,
  Users,
} from "lucide-react";
import { DashboardHeader } from "@/ui/components/DashboardHeader";
import { useUIStore, getSidebarOffset } from "@/ui/stores/uiStore";
import { cn } from "@/ui/lib/utils";

/**
 * Public-facing methodology / "manual of intelligence" page.
 *
 * Explains, in plain language, how Artemis turns raw GitHub events into
 * the metrics surfaced across the product. Modeled after Stripe Docs /
 * Linear "The Method" / Notion "How it works" — content-first, hairline
 * dividers, narrow column, gentle motion.
 */
export default function HowWeDoIt() {
  const [activeTab, setActiveTab] = useState("how");
  const { sidebarCollapsed } = useUIStore();
  const contentLeft = getSidebarOffset(sidebarCollapsed);

  // Sticky-TOC active section state, updated on click.
  const [section, setSection] = useState<string>("philosophy");

  const sections = useMemo<TocItem[]>(
    () => [
      { id: "philosophy",  label: "Philosophy",          icon: Telescope },
      { id: "data",        label: "Data sources",        icon: GitBranch },
      { id: "velocity",    label: "Velocity",            icon: TrendingUp },
      { id: "complexity",  label: "Complexity score",    icon: Brain },
      { id: "tier",        label: "Performance tier",    icon: Activity },
      { id: "review",      label: "Review pressure",     icon: GitPullRequest },
      { id: "team",        label: "Team health",         icon: Users },
      { id: "ai",          label: "Where AI fits in",    icon: Sparkles },
      { id: "limits",      label: "What we don't do",    icon: Target },
    ],
    [],
  );

  return (
    <div className="min-h-screen bg-background relative overflow-hidden text-foreground">
      {/* Decorative backdrop */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute -top-40 -right-40 w-[700px] h-[700px] rounded-full opacity-50 blur-3xl"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, hsl(262 95% 70% / 0.10) 0%, transparent 60%)",
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
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-10 lg:gap-14">
          {/* ── Sticky Table of Contents ── */}
          <aside className="hidden lg:block">
            <div className="sticky top-[160px] space-y-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/60 px-2 mb-3">
                Contents
              </p>
              {sections.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setSection(item.id);
                    const el = document.getElementById(item.id);
                    if (el) {
                      // Account for the floating header (~ top:24 + 8 + 66 = 98) + breathing room
                      const HEADER_OFFSET = 130;
                      const target =
                        el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
                      window.scrollTo({ top: target, behavior: "smooth" });
                    }
                  }}
                  className={cn(
                    "w-full flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[12.5px] transition-colors text-left",
                    section === item.id
                      ? "bg-primary/10 text-foreground"
                      : "text-muted-foreground/70 hover:text-foreground hover:bg-muted/30",
                  )}
                >
                  <item.icon className="h-3.5 w-3.5 shrink-0" />
                  <span className="leading-none flex-1">{item.label}</span>
                  {section === item.id && (
                    <span className="h-3.5 w-[2px] rounded-full bg-primary shadow-[0_0_8px_hsl(258_92%_70%/0.7)]" />
                  )}
                </button>
              ))}
            </div>
          </aside>

          {/* ── Article body ── */}
          <article className="max-w-2xl">
            {/* Hero header */}
            <motion.header
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="mb-12"
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/60">
                Method
              </p>
              <h1 className="mt-3 font-display text-[clamp(2.6rem,5vw,3.6rem)] font-light leading-[0.98] tracking-[-0.03em]">
                <span className="artemis-text-lunar">How we turn </span>
                <span className="artemis-text-aurora">GitHub events</span>
                <span className="artemis-text-lunar"> into intelligence.</span>
              </h1>
              <p className="mt-6 text-base leading-relaxed text-muted-foreground max-w-xl">
                Artemis isn't a magic-wand vanity metric tool. Every number you
                see is computed from raw GitHub events with the formulas below.
                No black boxes — read it, audit it, disagree with it.
              </p>
            </motion.header>

            {/* ── Section: Philosophy ── */}
            <Section id="philosophy" eyebrow="01 · Philosophy" title="What we measure, and why">
              <p>
                Engineering teams don't fail because they ship too few commits.
                They fail when <em>velocity, code health and team rhythm</em>{" "}
                drift out of sync — and nobody notices for two months.
              </p>
              <p className="mt-4">
                Artemis surfaces those three signals in one place. We obsess
                about <strong>direction over magnitude</strong>: a 12% drop in
                merge rate matters more than knowing "we shipped 47 PRs". The
                product is built around the deltas, not the absolute numbers.
              </p>
              <Pillars>
                <Pillar
                  icon={TrendingUp}
                  label="Velocity"
                  description="How fast work moves from intent to merged."
                />
                <Pillar
                  icon={Brain}
                  label="Complexity"
                  description="How heavy each unit of work is, perceived honestly."
                />
                <Pillar
                  icon={Activity}
                  label="Health"
                  description="How balanced the load is across humans."
                />
              </Pillars>
            </Section>

            {/* ── Section: Data sources ── */}
            <Section id="data" eyebrow="02 · Data sources" title="Where the numbers come from">
              <p>
                We pull a focused subset of the GitHub REST API. No tracking
                pixels, no IDE telemetry, no 'productivity score' for
                individual developers.
              </p>
              <ApiSourceList />
              <Note>
                Collection runs every <strong>1 hour</strong> automatically (cron),
                and on every login if data is older than 5 minutes. You can also
                hit <em>Sync now</em> on the dashboard at any time.
              </Note>
            </Section>

            {/* ── Section: Velocity ── */}
            <Section id="velocity" eyebrow="03 · Velocity" title="Velocity is a delta, not a count">
              <p>
                The headline number on the home dashboard ("+12%") is computed
                weekly:
              </p>
              <Formula>
                velocity Δ = (commits<sub>this&nbsp;week</sub> − commits<sub>last&nbsp;week</sub>) ÷ commits<sub>last&nbsp;week</sub> × 100
              </Formula>
              <p className="mt-4">
                The sparkline is a 7-day series of daily commit counts, smoothed
                with a quadratic Bezier between data points. The dashed line
                across the chart is the period mean. Nothing in this calculation
                rewards a developer for typing more — we only flag patterns
                that change.
              </p>
              <Caveat>
                A flat series (every day = 0) renders as an empty chart, not
                "−100%". We prefer absent data over invented data.
              </Caveat>
            </Section>

            {/* ── Section: Complexity ── */}
            <Section id="complexity" eyebrow="04 · Complexity score" title="Complexity is fuzzy — so we admit that">
              <p>
                Lines of code are a famously bad complexity proxy. We chose a
                different model: an LLM reads the diff plus the PR description
                and emits a score in <code>0–100</code> with three secondary
                dimensions:
              </p>
              <FormulaList
                items={[
                  ["scope", "How many files / domains the change touches"],
                  ["risk", "Probability of regression at runtime"],
                  ["effort", "How long a fair reviewer would spend reading it"],
                ]}
              />
              <p className="mt-4">
                The model also reports a <strong>confidence</strong> in
                <code> [0, 1]</code>. Anything below <code>0.6</code> is routed
                to the <em>Doubtful queue</em> in <em>Complexity</em> for human
                feedback — never auto-aggregated. Your corrections retrain the
                next batch.
              </p>
            </Section>

            {/* ── Section: Performance tier ── */}
            <Section id="tier" eyebrow="05 · Performance tier" title="From metrics to a closing recommendation">
              <p>
                The narrative on every developer profile ends on a single
                forward-looking sentence — something a tech lead can act on
                today. Concretely, it tells you whether to{" "}
                <em>stretch, hold, protect</em> or <em>intervene</em>.
              </p>
              <p className="mt-4">
                We synthesize that verdict from a weighted score in{" "}
                <code>[0, 100]</code>:
              </p>
              <FormulaList
                items={[
                  ["complexity owned",       "30 pts — how heavy the work this dev consistently ships is"],
                  ["AI confidence",          "20 pts — how legible their PRs are to read and review"],
                  ["tech variety",           "15 pts — breadth across distinct technologies"],
                  ["sustained volume",       "10 pts — sample size we can trust"],
                  ["refactor discipline",    "10 pts — share of work targeting technical debt"],
                  ["test discipline",        "10 pts — share of work dedicated to coverage"],
                  ["PR-size consistency",    "5 pts — low variance in complexity over time"],
                ]}
              />
              <p className="mt-4">
                The score then maps to one of five tiers:
              </p>
              <div className="mt-4 rounded-xl border border-border/40 bg-card/40 backdrop-blur-md overflow-hidden">
                {[
                  { range: "≥ 82", tier: "Staff / Lead",       desc: "Rare combination of heavy work, broad stack, refactor and test discipline." },
                  { range: "65 – 81", tier: "Senior",            desc: "Heavy work owned, broad stack, healthy mix across change types." },
                  { range: "50 – 64", tier: "Advanced mid-level",desc: "Solid contributor, ready for stretch work — promote-ready signal when paired with an upward trajectory." },
                  { range: "35 – 49", tier: "Mid-level",         desc: "Comfortable contributor, growth opportunities visible." },
                  { range: "< 35",    tier: "Junior",            desc: "Early-career signals, ramp-up curve — pair with seniors on stretch work." },
                ].map((row, i, arr) => (
                  <div
                    key={row.tier}
                    className={cn(
                      "grid grid-cols-[80px_180px_1fr] items-start gap-3 px-4 py-3 text-[12.5px]",
                      i < arr.length - 1 && "border-b border-border/30",
                    )}
                  >
                    <span className="font-mono text-[11px] text-primary/85">{row.range}</span>
                    <span className="font-medium text-foreground">{row.tier}</span>
                    <span className="text-muted-foreground/85">{row.desc}</span>
                  </div>
                ))}
              </div>
              <p className="mt-5">
                On top of the tier we layer <strong>trajectory</strong> from
                the complexity-over-time evolution:{" "}
                <em>improving</em>, <em>stable</em>, or <em>declining</em>.
                The closing sentence reflects both — a senior who is
                trending down reads differently from a senior holding
                steady.
              </p>
              <Note>
                Sample sizes under 5 PRs deliberately do <strong>not</strong>{" "}
                produce a verdict. We refuse to make a tier call from a
                handful of analyses — the narrative explicitly asks for
                more data instead.
              </Note>
              <Caveat>
                A "tier" is a <em>conversation starter</em>, not a
                performance review. We surface what the data says today;
                the actual call about scope, promotion or coaching always
                lives with humans who know context the AI doesn't.
              </Caveat>
            </Section>

            {/* ── Section: Review pressure ── */}
            <Section id="review" eyebrow="06 · Review pressure" title="Where bottlenecks actually hide">
              <p>
                "Open PRs" is a lagging indicator. The metric we trust is{" "}
                <strong>awaiting-review time</strong>:
              </p>
              <Formula>
                awaiting<sub>i</sub> = (now − review_requested_at<sub>i</sub>)
              </Formula>
              <p className="mt-4">
                We aggregate the median across all open PRs in the period. A
                team with 30 open PRs but a median wait of 4 hours is healthier
                than a team with 5 open PRs at 4 days each.
              </p>
              <p className="mt-3">
                On the home ticker, <em>Awaiting</em> is the count of PRs
                currently in <code>review_requested</code> state without any{" "}
                <code>APPROVED</code> review yet.
              </p>
            </Section>

            {/* ── Section: Team health ── */}
            <Section id="team" eyebrow="07 · Team health" title="Spread is the metric">
              <p>
                Performance is a team property, not a person property. The
                squad page computes per-developer aggregates and surfaces:
              </p>
              <ul className="mt-3 space-y-2 text-[15px] leading-relaxed text-muted-foreground/95">
                <Li><strong>Concentration</strong> — what % of merged work belongs to the top contributor.</Li>
                <Li><strong>Reciprocity</strong> — distribution of cross-developer reviews. Asymmetric review graphs (one person reviews everyone, nobody reviews them) are a flag.</Li>
                <Li><strong>Cadence</strong> — variance of daily commit counts within a squad over rolling 14 days. Lower variance ⇒ more sustainable rhythm.</Li>
              </ul>
              <Caveat>
                We deliberately don't show "lines of code per dev". It's the
                cheapest metric to game and the noisiest signal of value.
              </Caveat>
            </Section>

            {/* ── Section: AI ── */}
            <Section id="ai" eyebrow="08 · Where AI fits in" title="AI is a co-pilot, not the pilot">
              <p>
                We use LLMs in three narrow places, and only with diff +
                metadata as input — never with private team data outside the
                request scope:
              </p>
              <ol className="mt-4 space-y-3 text-[15px] leading-relaxed text-muted-foreground/95">
                <Li>
                  <strong>Per-PR complexity scoring</strong> — explained above.
                  Always shown with a confidence number and a "Why?" expansion.
                </Li>
                <Li>
                  <strong>Per-commit insight</strong> — for commits big enough
                  to skew a sprint, we generate a one-paragraph summary so
                  reviewers can prep faster.
                </Li>
                <Li>
                  <strong>Doubtful queue feedback loop</strong> — corrections
                  you submit on low-confidence analyses are stored and used to
                  bias the system prompt of the next batch.
                </Li>
              </ol>
              <Note>
                Every AI-derived field is tagged in the API response with{" "}
                <code>aiGenerated: true</code>. The UI marks them with a
                small spark (✦) so you always know what is computed vs.
                inferred.
              </Note>
            </Section>

            {/* ── Section: What we don't do ── */}
            <Section id="limits" eyebrow="09 · What we don't do" title="Things we deliberately won't ship">
              <ul className="space-y-3 text-[15px] leading-relaxed text-muted-foreground/95">
                <Li>
                  <strong>Single-number "developer score".</strong> Aggregating
                  velocity, complexity and review work into a leaderboard
                  number is mathematically convenient and managerially toxic.
                  We won't.
                </Li>
                <Li>
                  <strong>Behavior tracking outside Git.</strong> No keystroke
                  counters, no IDE plugins watching what you type. We respect
                  the line.
                </Li>
                <Li>
                  <strong>Real-time blame surfacing.</strong> Showing who
                  caused regressions live is shame-driven, not improvement-
                  driven. Postmortem-grade tooling lives in your incident
                  platform, not here.
                </Li>
              </ul>
            </Section>

            {/* Closing */}
            <div className="mt-16 pt-8 border-t border-border/40">
              <p className="text-[13px] text-muted-foreground italic">
                If a calculation here disagrees with what you see in the
                dashboard, that's a bug — open an issue and we'll fix it. The
                docs and the code should never disagree.
              </p>
            </div>
          </article>
        </div>
      </main>
    </div>
  );
}

/* ─────────── Local presentational primitives ─────────── */

interface TocItem {
  id: string;
  label: string;
  icon: typeof Telescope;
}

interface SectionProps {
  id: string;
  eyebrow: string;
  title: string;
  children: ReactNode;
}

const Section = ({ id, eyebrow, title, children }: SectionProps) => (
  // Static rendering (no whileInView) so element heights don't shift during
  // smooth-scroll, which would otherwise drift the scroll target offset.
  <section id={id} className="scroll-mt-[140px] mb-14">
    <p className="text-[10px] font-mono font-semibold uppercase tracking-[0.18em] text-primary/85">
      {eyebrow}
    </p>
    <h2 className="mt-3 font-display text-[26px] font-medium leading-tight tracking-[-0.018em] text-foreground">
      {title}
    </h2>
    <div className="mt-5 text-[15px] leading-relaxed text-muted-foreground/95 prose-content">
      {children}
    </div>
  </section>
);

const Pillars = ({ children }: { children: ReactNode }) => (
  <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">{children}</div>
);

interface PillarProps {
  icon: typeof TrendingUp;
  label: string;
  description: string;
}

const Pillar = ({ icon: Icon, label, description }: PillarProps) => (
  <div className="rounded-xl border border-border/40 bg-card/30 backdrop-blur-md px-4 py-3.5 transition-colors hover:border-primary/30 hover:bg-card/50">
    <div className="flex items-center gap-2 mb-1.5">
      <div className="h-7 w-7 rounded-lg bg-primary/10 border border-primary/25 flex items-center justify-center text-primary">
        <Icon className="h-3.5 w-3.5" />
      </div>
      <p className="text-[13px] font-semibold text-foreground">{label}</p>
    </div>
    <p className="text-[12px] leading-relaxed text-muted-foreground/85">
      {description}
    </p>
  </div>
);

const ApiSourceList = () => (
  <div className="mt-5 rounded-xl border border-border/40 bg-card/40 backdrop-blur-md overflow-hidden">
    {[
      { icon: GitCommit, endpoint: "GET /repos/{r}/commits", purpose: "Daily commit series + author attribution" },
      { icon: GitPullRequest, endpoint: "GET /repos/{r}/pulls", purpose: "Open / closed / merged status, diff size, author" },
      { icon: Users, endpoint: "GET /repos/{r}/pulls/{n}/reviews", purpose: "Reviewer graph, approvals, change-requests" },
      { icon: GitBranch, endpoint: "GET /repos/{r}", purpose: "Repository metadata for grouping" },
    ].map((row, i) => (
      <div
        key={row.endpoint}
        className={cn(
          "flex items-start gap-3 px-4 py-3",
          i > 0 && "border-t border-border/30",
        )}
      >
        <row.icon className="h-3.5 w-3.5 mt-0.5 text-muted-foreground/65 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="font-mono text-[11.5px] text-foreground/95 truncate">
            {row.endpoint}
          </p>
          <p className="text-[12px] text-muted-foreground/75 mt-0.5">
            {row.purpose}
          </p>
        </div>
      </div>
    ))}
  </div>
);

const Formula = ({ children }: { children: ReactNode }) => (
  <div className="mt-4 rounded-xl border border-primary/25 bg-primary/5 px-4 py-3.5 font-mono text-[13px] text-foreground leading-relaxed overflow-x-auto">
    {children}
  </div>
);

interface FormulaListProps {
  items: [string, string][];
}

const FormulaList = ({ items }: FormulaListProps) => (
  <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
    {items.map(([key, desc]) => (
      <div
        key={key}
        className="rounded-xl border border-border/40 bg-card/30 backdrop-blur-md px-3.5 py-3"
      >
        <p className="font-mono text-[11px] text-primary/90 uppercase tracking-wider">
          {key}
        </p>
        <p className="mt-1 text-[12.5px] text-muted-foreground/90 leading-relaxed">
          {desc}
        </p>
      </div>
    ))}
  </div>
);

const Note = ({ children }: { children: ReactNode }) => (
  <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-secondary/25 bg-secondary/5 px-4 py-3 text-[13px] leading-relaxed text-muted-foreground/95">
    <Sparkles className="h-3.5 w-3.5 mt-0.5 text-secondary shrink-0" />
    <p>{children}</p>
  </div>
);

const Caveat = ({ children }: { children: ReactNode }) => (
  <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-amber-500/25 bg-amber-500/5 px-4 py-3 text-[13px] leading-relaxed text-amber-100/90">
    <Target className="h-3.5 w-3.5 mt-0.5 text-amber-400 shrink-0" />
    <p>{children}</p>
  </div>
);

const Li = ({ children }: { children: ReactNode }) => (
  <li className="flex items-start gap-2.5">
    <span
      aria-hidden
      className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary/65"
    />
    <span>{children}</span>
  </li>
);
