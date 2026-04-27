import { useState, FormEvent } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Github, Lock, Mail, Loader2 } from "lucide-react";

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
      setError(err instanceof Error ? err.message : "Failed to sign in");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      {/* Cosmic backdrop — purely decorative, low contrast against content */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <StarField className="absolute inset-0 opacity-60" density={0.7} />
        <Aurora intensity="soft" />

        {/* Hero planet — sits far to the right, mostly off-screen, behind everything.
            This is the "grand" centerpiece à la Comet / Perplexity. */}
        <div className="absolute -right-[32vw] top-1/2 hidden -translate-y-1/2 lg:block">
          <MoonOrb size={920} variant="twilight" rings opacity={0.55} />
        </div>

        {/* Smaller violet companion behind the form — adds depth */}
        <div className="absolute right-[18vw] top-[18%] hidden -translate-y-1/2 xl:block">
          <MoonOrb size={220} variant="rose" rings={false} opacity={0.45} float />
        </div>

        <Comet top="22%" duration={14} delay="-3s" size="lg" />
        <Comet top="68%" duration={18} delay="-9s" size="md" angle={-10} />

        {/* Soft vignette so content stays legible */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,hsl(var(--background)/0.85)_100%)]" />
      </div>

      <header className="relative z-10 flex items-center justify-between px-8 py-6 lg:px-12">
        <ArtemisLogo />
        <span className="hidden text-sm text-muted-foreground sm:inline">
          New here?{" "}
          <Link to="/register" className="font-medium text-foreground transition-colors hover:text-primary">
            Create an account →
          </Link>
        </span>
      </header>

      <main className="relative z-10 mx-auto grid min-h-[calc(100vh-7rem)] w-full max-w-7xl grid-cols-1 items-center gap-10 px-6 pb-12 pt-4 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:px-12">
        {/* Left — hero copy */}
        <section className="relative flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-xl"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/30 px-3 py-1 text-[11px] text-muted-foreground backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_10px_hsl(var(--primary))]" />
              Engineering intelligence
            </span>
            <h1 className="mt-6 font-display text-[clamp(2.4rem,5.4vw,4.4rem)] font-light leading-[0.98] tracking-[-0.035em] text-balance">
              <span className="artemis-text-lunar">A calmer way to see</span>
              <br />
              <span className="artemis-text-aurora">how your team ships.</span>
            </h1>
            <p className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground">
              Track velocity, complexity and team health across every squad —
              with the focused, quiet interface your engineering org deserves.
            </p>

            <dl className="mt-10 grid max-w-md grid-cols-3 gap-3">
              {[
                { k: "Squads", v: "All" },
                { k: "Latency", v: "12ms" },
                { k: "Uptime", v: "99.98%" },
              ].map((item) => (
                <div
                  key={item.k}
                  className="rounded-xl border border-border/40 bg-card/30 px-3 py-3 backdrop-blur-md transition-colors hover:border-border/70"
                >
                  <dt className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                    {item.k}
                  </dt>
                  <dd className="mt-1 font-display text-lg text-foreground">{item.v}</dd>
                </div>
              ))}
            </dl>
          </motion.div>
        </section>

        {/* Right — sign-in card (floats over the planet) */}
        <section className="relative flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-[420px]"
          >
            {/* Soft aurora wash directly behind the card */}
            <div
              aria-hidden
              className="absolute -inset-2 rounded-[32px] bg-aurora-gradient opacity-30 blur-3xl"
            />

            <div className="artemis-panel relative overflow-hidden rounded-[28px] p-8 sm:p-10">
              {/* Top inner highlight */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
              />

              <div className="relative">
                <div className="mb-7">
                  <h2 className="font-display text-[28px] font-medium leading-tight tracking-[-0.01em]">
                    Welcome back
                  </h2>
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    Sign in to continue to your dashboard.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs text-muted-foreground">
                      Email
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
                        placeholder="you@company.com"
                        disabled={isSubmitting}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="text-xs text-muted-foreground">
                        Password
                      </Label>
                      <a
                        href="#"
                        className="text-[11px] text-muted-foreground transition-colors hover:text-foreground"
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
                        Signing in...
                      </>
                    ) : (
                      <>
                        Sign in
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                      </>
                    )}
                  </Button>
                </form>

                <div className="my-6 flex items-center gap-3 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  <span className="artemis-divider flex-1" />
                  <span>or</span>
                  <span className="artemis-divider flex-1" />
                </div>

                <Button variant="secondary" size="lg" className="w-full" disabled>
                  <Github className="h-4 w-4" />
                  <span>Continue with GitHub</span>
                  <span className="ml-1 rounded-full border border-border/60 bg-muted/40 px-2 py-0.5 text-[10px] text-muted-foreground">
                    soon
                  </span>
                </Button>

                <p className="mt-7 text-center text-xs text-muted-foreground sm:hidden">
                  New here?{" "}
                  <Link to="/register" className="font-medium text-foreground hover:text-primary">
                    Create an account
                  </Link>
                </p>
              </div>
            </div>

            <p className="mt-6 text-center text-[11px] text-muted-foreground/70">
              © {new Date().getFullYear()} Artemis · Built for engineering teams
            </p>
          </motion.div>
        </section>
      </main>
    </div>
  );
};

export default Login;
