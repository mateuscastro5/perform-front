import { useRef } from "react";
import { Link } from "react-router-dom";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type Variants,
} from "framer-motion";
import {
  ArrowRight,
  Brain,
  Check,
  ChevronDown,
  Download,
  GaugeCircle,
  Github,
  Layers,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";

import { Button } from "@/ui/components/ui/button";
import { ArtemisLogo, StarField } from "@/ui/components/cosmic";

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

const sectionReveal: Variants = {
  hidden: { opacity: 0, y: 36 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.95, ease: EASE_OUT_EXPO },
  },
};

const cardGrid: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.1, delayChildren: 0.08 },
  },
};

const cardItem: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: EASE_OUT_EXPO },
  },
};

const PILLARS = [
  {
    icon: Zap,
    title: "Velocity, without vanity",
    body:
      "Commits, PRs, reviews — measured as deltas, not absolutes. A 12% drop in merge rate matters more than 47 PRs shipped.",
  },
  {
    icon: Brain,
    title: "Complexity, scored honestly",
    body:
      "Per-PR complexity from a dual-LLM pipeline with RAG examples and confidence scores. Every analysis is auditable.",
  },
  {
    icon: Users,
    title: "Team health, surfaced early",
    body:
      "Review pressure, squad rhythm, and individual evolution — so you spot drift before it shows up in the roadmap.",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Connect GitHub",
    body: "One PAT, one click. Artemis pulls a focused subset of the REST API — no tracking pixels, no IDE telemetry.",
  },
  {
    n: "02",
    title: "Watch the signal",
    body: "Velocity, complexity, and team health appear in one calm dashboard. Direction over magnitude, always.",
  },
  {
    n: "03",
    title: "Act on insight",
    body: "AI-graded performance tiers, growth areas, and review pressure. Every score links back to the raw event.",
  },
];

const Landing = () => {
  const rootRef = useRef<HTMLDivElement>(null);
  const prefersReduced = useReducedMotion();

  // Parallax: backdrop halos drift slower than content while scrolling.
  const { scrollYProgress } = useScroll({
    target: rootRef,
    offset: ["start start", "end start"],
  });
  const haloLeftY = useTransform(
    scrollYProgress,
    [0, 1],
    prefersReduced ? ["0%", "0%"] : ["0%", "-32%"],
  );
  const haloRightY = useTransform(
    scrollYProgress,
    [0, 1],
    prefersReduced ? ["0%", "0%"] : ["0%", "-46%"],
  );
  const starsY = useTransform(
    scrollYProgress,
    [0, 1],
    prefersReduced ? ["0%", "0%"] : ["0%", "-14%"],
  );
  const heroOpacity = useTransform(scrollYProgress, [0, 0.18], [1, 0]);
  const scrollHintOpacity = useTransform(scrollYProgress, [0, 0.06], [1, 0]);

  return (
    <div
      ref={rootRef}
      className="relative isolate min-h-screen overflow-x-clip bg-background text-foreground"
    >
      {/* Backdrop — cosmic but quiet, with parallax */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <motion.div style={{ y: starsY }} className="absolute inset-0">
          <StarField className="absolute inset-0 opacity-25" density={0.4} />
        </motion.div>
        <motion.div
          aria-hidden
          style={{
            y: haloLeftY,
            width: "920px",
            height: "920px",
            top: "-340px",
            left: "-320px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle at 50% 50%, hsl(262 95% 70% / 0.10) 0%, hsl(232 85% 60% / 0.05) 38%, transparent 68%)",
            filter: "blur(40px)",
          }}
          className="absolute"
        />
        <motion.div
          aria-hidden
          style={{
            y: haloRightY,
            width: "560px",
            height: "560px",
            top: "-180px",
            right: "-200px",
            borderRadius: "50%",
            border: "1px solid hsl(320 95% 80% / 0.14)",
            boxShadow:
              "0 0 70px hsl(320 95% 70% / 0.18), 0 0 140px hsl(320 90% 65% / 0.08)",
          }}
          className="absolute animate-[artemis-float_22s_ease-in-out_infinite]"
        />
      </div>

      {/* Header */}
      <header className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6 lg:px-12">
        <ArtemisLogo />
        <nav className="flex items-center gap-2 sm:gap-4">
          <Link
            to="/how-we-do-it"
            className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground sm:inline"
          >
            How we do it
          </Link>
          <a
            href="https://github.com/mateuscastro5/perform-front"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
            className="hidden h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground sm:inline-flex"
          >
            <Github className="h-4 w-4" />
          </a>
          <Button asChild variant="ghost" size="sm">
            <Link to="/login">Sign in</Link>
          </Button>
        </nav>
      </header>

      {/* Hero */}
      <main className="relative z-10">
        <section className="relative mx-auto flex min-h-[calc(100vh-7rem)] w-full max-w-7xl flex-col justify-center px-6 pb-40 pt-16 lg:px-12 lg:pb-56 lg:pt-24">
          <motion.div
            style={{ opacity: heroOpacity }}
            className="mx-auto max-w-4xl text-center"
          >
            <motion.h1
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: EASE_OUT_EXPO }}
              className="font-display text-[clamp(2.8rem,7vw,6rem)] font-light leading-[0.95] tracking-[-0.04em]"
            >
              <span className="artemis-text-lunar">Ship engineering</span>
              <br />
              <span className="artemis-text-aurora">signal, not noise.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.12, ease: EASE_OUT_EXPO }}
              className="mx-auto mt-7 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl"
            >
              Artemis turns raw GitHub events into honest signal — velocity,
              complexity, and team health — without vanity metrics or black
              boxes.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.24, ease: EASE_OUT_EXPO }}
              className="mt-10 flex flex-wrap items-center justify-center gap-3"
            >
              <Button asChild size="lg" className="group">
                <Link to="/login">
                  Sign in
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <Link to="/download">
                  <Download className="h-4 w-4" />
                  Download for Desktop
                </Link>
              </Button>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mt-5 text-xs text-muted-foreground/70"
            >
              Free during beta · Available on the web and as a native Windows
              app
            </motion.p>
          </motion.div>

          {/* Scroll hint */}
          <motion.div
            style={{ opacity: scrollHintOpacity }}
            className="pointer-events-none absolute inset-x-0 bottom-10 flex flex-col items-center gap-2 text-muted-foreground/55"
            aria-hidden
          >
            <span className="text-[10px] uppercase tracking-[0.28em]">
              Scroll
            </span>
            <motion.span
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
              className="flex h-6 w-6 items-center justify-center rounded-full border border-border/50"
            >
              <ChevronDown className="h-3.5 w-3.5" />
            </motion.span>
          </motion.div>
        </section>

        {/* Three pillars */}
        <motion.section
          variants={sectionReveal}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-120px" }}
          className="mx-auto w-full max-w-7xl px-6 py-24 lg:px-12 lg:py-32"
        >
          <div className="mb-12 max-w-2xl">
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Built around three signals
            </p>
            <h2 className="mt-3 font-display text-3xl font-light tracking-[-0.02em] sm:text-5xl">
              <span className="artemis-text-lunar">
                Direction over magnitude.
              </span>
            </h2>
            <p className="mt-4 max-w-xl text-base text-muted-foreground">
              Teams don&apos;t fail because they ship too few commits. They fail
              when velocity, complexity, and team rhythm drift out of sync —
              and nobody notices for two months.
            </p>
          </div>

          <motion.div
            variants={cardGrid}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            className="grid gap-4 md:grid-cols-3"
          >
            {PILLARS.map((p) => (
              <motion.div
                key={p.title}
                variants={cardItem}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.3, ease: EASE_OUT_EXPO }}
                className="group rounded-2xl border border-border/40 bg-card/30 p-6 backdrop-blur-md transition-colors hover:border-primary/40"
              >
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-primary/40 bg-primary/10 text-primary">
                  <p.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-5 font-display text-xl">{p.title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
                  {p.body}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        {/* How it works */}
        <motion.section
          variants={sectionReveal}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-120px" }}
          className="relative"
        >
          <div
            aria-hidden
            className="absolute inset-x-0 top-1/2 -z-10 h-[1px] -translate-y-1/2 bg-gradient-to-r from-transparent via-border to-transparent"
          />
          <div className="mx-auto w-full max-w-7xl px-6 py-24 lg:px-12 lg:py-32">
            <div className="mb-14 max-w-2xl">
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                How it works
              </p>
              <h2 className="mt-3 font-display text-3xl font-light tracking-[-0.02em] sm:text-5xl">
                <span className="artemis-text-aurora">
                  Three steps. No black boxes.
                </span>
              </h2>
            </div>

            <motion.ol
              variants={cardGrid}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-80px" }}
              className="grid gap-6 md:grid-cols-3"
            >
              {STEPS.map((s) => (
                <motion.li
                  key={s.n}
                  variants={cardItem}
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.3, ease: EASE_OUT_EXPO }}
                  className="relative rounded-2xl border border-border/30 bg-card/20 p-6"
                >
                  <span className="font-mono text-xs text-primary/80">
                    {s.n}
                  </span>
                  <h3 className="mt-3 font-display text-lg">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {s.body}
                  </p>
                </motion.li>
              ))}
            </motion.ol>

            <div className="mt-10">
              <Button asChild variant="ghost" size="sm" className="group">
                <Link to="/how-we-do-it">
                  Read the full method
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </Button>
            </div>
          </div>
        </motion.section>

        {/* AI / methodology card */}
        <motion.section
          variants={sectionReveal}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-120px" }}
          className="mx-auto w-full max-w-7xl px-6 py-24 lg:px-12 lg:py-32"
        >
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 lg:items-center">
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                AI insights, with humility
              </p>
              <h2 className="mt-3 font-display text-3xl font-light tracking-[-0.02em] sm:text-5xl">
                <span className="artemis-text-lunar">
                  Confidence scores, not verdicts.
                </span>
              </h2>
              <p className="mt-5 text-base leading-relaxed text-muted-foreground">
                A dual-LLM pipeline grades every PR for complexity, with RAG
                examples drawn from a curated gold set. Each developer gets a
                performance tier — but we refuse to call a tier from a handful
                of analyses.
              </p>

              <ul className="mt-7 space-y-3">
                {[
                  "Per-PR complexity with confidence interval",
                  "Per-developer growth areas and tier evolution",
                  "Every score links back to the raw GitHub event",
                  "Methodology is public — read it, audit it, disagree",
                ].map((line) => (
                  <li
                    key={line}
                    className="flex items-start gap-2.5 text-sm text-muted-foreground"
                  >
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* AI score mock */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
            >
              <div
                aria-hidden
                className="absolute -inset-3 rounded-[32px] opacity-20 blur-3xl"
                style={{
                  background:
                    "linear-gradient(135deg, hsl(262 88% 68% / 0.45), hsl(320 76% 70% / 0.3))",
                }}
              />
              <div className="artemis-panel relative rounded-[24px] p-7">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/40 bg-primary/10 text-primary">
                      <Sparkles className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm font-medium">PR #1284 · core-api</p>
                      <p className="text-[11px] text-muted-foreground">
                        feat: streaming response cache
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-emerald-300">
                    High confidence
                  </span>
                </div>

                <div className="mt-6 grid grid-cols-3 gap-3">
                  {[
                    { label: "Complexity", value: "7.2", scale: "/10" },
                    { label: "Confidence", value: "88", scale: "%" },
                    { label: "Risk", value: "Low", scale: "" },
                  ].map((m) => (
                    <div
                      key={m.label}
                      className="rounded-xl border border-border/30 bg-background/40 p-3"
                    >
                      <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                        {m.label}
                      </p>
                      <p className="mt-1 font-display text-2xl text-foreground">
                        {m.value}
                        <span className="ml-0.5 text-xs text-muted-foreground/70">
                          {m.scale}
                        </span>
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-5 rounded-xl border border-border/30 bg-background/30 p-4">
                  <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    Verdict
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    Reasonable scope, two non-trivial async refactors in the
                    cache layer. Suggest a second reviewer with infra context.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* Desktop CTA */}
        <motion.section
          variants={sectionReveal}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-120px" }}
          className="mx-auto w-full max-w-7xl px-6 pb-24 lg:px-12 lg:pb-32"
        >
          <div className="artemis-panel relative overflow-hidden rounded-[28px] p-8 sm:p-12">
            <div
              aria-hidden
              className="absolute -right-20 -top-20 h-72 w-72 rounded-full opacity-25 blur-3xl"
              style={{
                background:
                  "radial-gradient(circle, hsl(320 95% 70% / 0.5), transparent 70%)",
              }}
            />
            <div className="relative grid gap-6 sm:grid-cols-[1fr_auto] sm:items-center">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-border/40 bg-card/40 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  <Layers className="h-3 w-3" />
                  Native desktop
                </span>
                <h2 className="mt-4 font-display text-2xl tracking-[-0.02em] sm:text-4xl">
                  Same data. Same login.{" "}
                  <span className="artemis-text-aurora">
                    Calmer focus sessions.
                  </span>
                </h2>
                <p className="mt-3 max-w-xl text-sm text-muted-foreground">
                  Get the Windows installer for a distraction-free desk
                  experience. Auto-updates coming soon.
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-3 sm:flex-nowrap">
                <Button asChild size="lg">
                  <Link to="/download">
                    <Download className="h-4 w-4" />
                    See downloads
                  </Link>
                </Button>
                <Button asChild variant="ghost" size="lg">
                  <Link to="/login">Use the web app</Link>
                </Button>
              </div>
            </div>
          </div>
        </motion.section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/30">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-4 px-6 py-10 sm:flex-row lg:px-12">
          <div className="flex items-center gap-3 text-xs text-muted-foreground/70">
            <GaugeCircle className="h-4 w-4 text-primary/80" />
            <span>© {new Date().getFullYear()} Artemis · Built for engineering teams</span>
          </div>
          <div className="flex items-center gap-5 text-xs text-muted-foreground/70">
            <Link to="/how-we-do-it" className="transition-colors hover:text-foreground">
              How we do it
            </Link>
            <Link to="/login" className="transition-colors hover:text-foreground">
              Sign in
            </Link>
            <Link to="/download" className="transition-colors hover:text-foreground">
              Download
            </Link>
            <a
              href="https://github.com/mateuscastro5/perform-front"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 transition-colors hover:text-foreground"
            >
              <Github className="h-3.5 w-3.5" />
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
