import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Download,
  GaugeCircle,
  LayoutDashboard,
  Sparkles,
  Users,
} from "lucide-react";

import { Button } from "@/ui/components/ui/button";
import { ArtemisLogo, StarField } from "@/ui/components/cosmic";

const DOWNLOAD_URL = import.meta.env.VITE_DOWNLOAD_URL ?? "#";

const FEATURES = [
  {
    icon: LayoutDashboard,
    title: "Dashboard",
    body: "Atividade do squad em tempo real — commits, PRs, reviews, top reviewers — sem precisar abrir o GitHub.",
  },
  {
    icon: Users,
    title: "Squads & X-Ray",
    body: "Composição de times, métricas agregadas e raios-X profundos por squad com tendências de entrega.",
  },
  {
    icon: Sparkles,
    title: "AI Insights",
    body: "Análise de PRs por IA: pontos fortes, áreas de melhoria, evolução individual e feedback contextual.",
  },
  {
    icon: GaugeCircle,
    title: "Complexity",
    body: "Fila de análises de complexidade, score de confiança e priorização para code review focado.",
  },
];

const Landing = () => {
  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-background text-foreground">
      {/* Backdrop */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <StarField className="absolute inset-0 opacity-25" density={0.4} />

        <div
          aria-hidden
          className="absolute"
          style={{
            width: "820px",
            height: "820px",
            top: "-260px",
            left: "-280px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle at 50% 50%, hsl(262 95% 70% / 0.08) 0%, hsl(232 85% 60% / 0.04) 38%, transparent 68%)",
            filter: "blur(40px)",
          }}
        />
        <div
          aria-hidden
          className="absolute animate-[artemis-float_22s_ease-in-out_infinite]"
          style={{
            width: "520px",
            height: "520px",
            top: "-160px",
            right: "-180px",
            borderRadius: "50%",
            border: "1px solid hsl(320 95% 80% / 0.14)",
            boxShadow:
              "0 0 70px hsl(320 95% 70% / 0.18), 0 0 140px hsl(320 90% 65% / 0.08)",
          }}
        />
      </div>

      {/* Header */}
      <header className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6 lg:px-12">
        <ArtemisLogo />
        <nav className="flex items-center gap-4">
          <Link
            to="/how-we-do-it"
            className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground sm:inline"
          >
            How we do it
          </Link>
          <Button asChild variant="ghost" size="sm">
            <Link to="/login">Sign in</Link>
          </Button>
        </nav>
      </header>

      {/* Hero */}
      <main className="relative z-10 mx-auto w-full max-w-7xl px-6 pb-24 pt-8 lg:px-12 lg:pt-16">
        <section className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-border/40 bg-card/30 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-muted-foreground backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_hsl(258_92%_70%/0.9)]" />
              Mission Control · Engineering
            </span>
            <h1 className="mt-6 font-display text-[clamp(2.6rem,5.6vw,4.8rem)] font-light leading-[0.98] tracking-[-0.035em] text-balance">
              <span className="artemis-text-lunar">A calmer way to see</span>
              <br />
              <span className="artemis-text-aurora">how your team ships.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground">
              Artemis reúne velocidade, complexidade e saúde do time em uma
              interface focada — pensada para Tech Leads que precisam decidir
              rápido sem ruído.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Button asChild size="lg" className="group">
                <Link to="/login">
                  Entrar no Artemis
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <a href={DOWNLOAD_URL} target="_blank" rel="noreferrer">
                  <Download className="h-4 w-4" />
                  Baixar para Desktop
                </a>
              </Button>
            </div>

            <p className="mt-6 text-xs text-muted-foreground/70">
              Disponível na web e como app nativo para Windows. Mesmo login,
              mesmos dados.
            </p>
          </motion.div>

          {/* Hero card */}
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <div
              aria-hidden
              className="absolute -inset-3 rounded-[36px] opacity-25 blur-3xl"
              style={{
                background:
                  "linear-gradient(135deg, hsl(262 88% 68% / 0.45), hsl(232 78% 64% / 0.35) 50%, hsl(320 76% 70% / 0.25))",
              }}
            />
            <div className="artemis-panel relative overflow-hidden rounded-[28px] p-8">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent"
              />
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                This week · all squads
              </p>
              <div className="mt-4 grid grid-cols-3 gap-3">
                {[
                  { k: "Commits", v: "1,284" },
                  { k: "PRs merged", v: "186" },
                  { k: "Reviews", v: "412" },
                ].map((item) => (
                  <div
                    key={item.k}
                    className="rounded-xl border border-border/40 bg-card/30 px-3 py-3 backdrop-blur-md"
                  >
                    <dt className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                      {item.k}
                    </dt>
                    <dd className="mt-1 font-display text-xl text-foreground">
                      {item.v}
                    </dd>
                  </div>
                ))}
              </div>
              <div className="mt-6 space-y-3">
                {[
                  { name: "core-api", trend: "+12% velocity" },
                  { name: "web-platform", trend: "−4% complexity" },
                  { name: "data-pipelines", trend: "Stable" },
                ].map((squad) => (
                  <div
                    key={squad.name}
                    className="flex items-center justify-between rounded-xl border border-border/30 bg-card/20 px-4 py-3"
                  >
                    <span className="text-sm font-medium">{squad.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {squad.trend}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </section>

        {/* Features */}
        <section className="mt-28">
          <div className="mb-10 max-w-2xl">
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              O que você vê
            </p>
            <h2 className="mt-3 font-display text-3xl font-light tracking-[-0.02em] sm:text-4xl">
              <span className="artemis-text-lunar">
                Quatro lentes para olhar a engenharia.
              </span>
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="group rounded-2xl border border-border/40 bg-card/30 p-6 backdrop-blur-md transition-colors hover:border-border/70"
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-primary/40 bg-primary/10 text-primary">
                  <f.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-display text-lg">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {f.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Methodology link */}
        <section className="mt-24">
          <div className="artemis-panel flex flex-col items-start justify-between gap-6 rounded-[28px] p-8 sm:flex-row sm:items-center">
            <div>
              <h3 className="font-display text-2xl tracking-[-0.02em]">
                Como Artemis calcula as métricas
              </h3>
              <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                Transparência sobre a metodologia, os pesos e o que entra (ou
                não) em cada score. Sem caixa-preta.
              </p>
            </div>
            <Button asChild variant="secondary" size="lg" className="group">
              <Link to="/how-we-do-it">
                Ver a metodologia
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/30">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-3 px-6 py-8 text-xs text-muted-foreground/70 sm:flex-row lg:px-12">
          <span>© {new Date().getFullYear()} Artemis · Built for engineering teams</span>
          <div className="flex items-center gap-4">
            <Link to="/how-we-do-it" className="hover:text-foreground transition-colors">
              How we do it
            </Link>
            <Link to="/login" className="hover:text-foreground transition-colors">
              Sign in
            </Link>
            <a
              href={DOWNLOAD_URL}
              target="_blank"
              rel="noreferrer"
              className="hover:text-foreground transition-colors"
            >
              Download
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
