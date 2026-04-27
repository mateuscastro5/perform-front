import { useState, FormEvent } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Lock, Mail, Loader2, Rocket } from "lucide-react";

import { useAuth } from "../contexts/AuthContext";
import { Input } from "@/ui/components/ui/input";
import { Label } from "@/ui/components/ui/label";
import { Button } from "@/ui/components/ui/button";
import { Alert, AlertDescription } from "@/ui/components/ui/alert";
import {
  ArtemisLogo,
  Aurora,
  Comet,
  MoonOrb,
  StarField,
} from "@/ui/components/cosmic";

const Login = () => {
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      await login({ email, password });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign in to Mission Control");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      {/* — Cosmic backdrop ————————————————————————————— */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <StarField className="absolute inset-0" density={1.1} />
        <Aurora intensity="medium" />
        <Comet top="14%" duration={11} delay="-2s" size="lg" />
        <Comet top="62%" duration={14} delay="-7s" size="md" angle={-12} />
      </div>

      {/* — Top bar ———————————————————————————————————— */}
      <header className="relative z-10 flex items-center justify-between px-8 py-6 lg:px-12">
        <ArtemisLogo tagline="Mission Control" />
        <div className="flex items-center gap-3 text-xs">
          <span className="artemis-tag artemis-tag-live">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success/70" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-success" />
            </span>
            Mission Live
          </span>
          <span className="hidden text-muted-foreground sm:inline">
            New to Artemis?{" "}
            <Link to="/register" className="font-medium text-foreground hover:text-primary transition-colors">
              Request access →
            </Link>
          </span>
        </div>
      </header>

      {/* — Main grid ——————————————————————————————————— */}
      <main className="relative z-10 grid min-h-[calc(100vh-7rem)] grid-cols-1 items-center gap-8 px-6 pb-12 pt-4 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:px-16">
        {/* — Left: Hero copy + Moon ————————————————————— */}
        <section className="relative flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-xl"
          >
            <span className="artemis-tag mb-6">
              <Rocket className="h-3 w-3" /> Artemis · Engineering Intelligence
            </span>
            <h1 className="font-display text-[clamp(2.6rem,6vw,4.8rem)] font-light leading-[0.95] tracking-[-0.035em] text-balance">
              <span className="artemis-text-lunar">Where engineering</span>
              <br />
              <span className="artemis-text-aurora">meets the stars.</span>
            </h1>
            <p className="mt-6 max-w-md text-base text-muted-foreground leading-relaxed">
              Welcome to Mission Control. Track velocity, complexity and mission readiness across
              every squad — with the calm of deep space and the precision of a lunar landing.
            </p>

            <dl className="mt-10 grid grid-cols-3 gap-4 max-w-md">
              {[
                { k: "Squads", v: "ALL" },
                { k: "Latency", v: "12ms" },
                { k: "Uptime", v: "99.98%" },
              ].map((item) => (
                <div key={item.k} className="rounded-xl border border-border/40 bg-card/30 px-3 py-3 backdrop-blur-md">
                  <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    {item.k}
                  </dt>
                  <dd className="mt-1 font-display text-lg text-foreground">{item.v}</dd>
                </div>
              ))}
            </dl>
          </motion.div>

          {/* Floating moon — only on lg+ screens, peeking from behind */}
          <div className="pointer-events-none absolute -bottom-24 -left-24 hidden lg:block">
            <MoonOrb size={420} phase="lunar" />
          </div>
        </section>

        {/* — Right: Sign-In Card ———————————————————————— */}
        <section className="relative flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-md"
          >
            {/* Aurora glow behind card */}
            <div
              aria-hidden
              className="absolute -inset-1 rounded-[28px] bg-aurora-gradient opacity-40 blur-2xl"
            />

            <div className="artemis-panel relative overflow-hidden rounded-[28px] p-8 sm:p-10">
              {/* Top inner highlight */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent"
              />
              {/* Decorative orbital ring */}
              <div
                aria-hidden
                className="artemis-orbit-ring -right-32 -top-32 h-64 w-64 opacity-50"
              />

              <div className="relative">
                <div className="mb-7 flex items-center justify-between">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                      Mission Sign-in
                    </p>
                    <h2 className="mt-2 font-display text-3xl font-medium tracking-[-0.01em]">
                      Begin Sequence
                    </h2>
                  </div>
                  <ArtemisLogo withWordmark={false} size={36} />
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      Operator ID
                    </Label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70" />
                      <Input
                        id="email"
                        type="email"
                        required
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="commander@artemis.io"
                        disabled={isSubmitting}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                        Access Code
                      </Label>
                      <a
                        href="#"
                        className="text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Forgot?
                      </a>
                    </div>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70" />
                      <Input
                        id="password"
                        type="password"
                        required
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••"
                        disabled={isSubmitting}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {error && (
                    <Alert variant="destructive" className="border-destructive/40 bg-destructive/10">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    disabled={isSubmitting || isLoading}
                    size="lg"
                    className="w-full"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                        Engaging thrusters...
                      </>
                    ) : (
                      <>
                        Launch Mission
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                      </>
                    )}
                  </Button>
                </form>

                <div className="my-6 flex items-center gap-3 text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                  <span className="artemis-divider flex-1" />
                  <span>or</span>
                  <span className="artemis-divider flex-1" />
                </div>

                <Button variant="secondary" size="lg" className="w-full" disabled>
                  <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    SSO · GitHub coming soon
                  </span>
                </Button>

                <p className="mt-7 text-center text-xs text-muted-foreground sm:hidden">
                  New to Artemis?{" "}
                  <Link to="/register" className="font-medium text-foreground hover:text-primary">
                    Request access
                  </Link>
                </p>
              </div>
            </div>

            <p className="mt-6 text-center font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground/70">
              © 2026 Artemis Mission Control · All systems nominal
            </p>
          </motion.div>
        </section>
      </main>
    </div>
  );
};

export default Login;
