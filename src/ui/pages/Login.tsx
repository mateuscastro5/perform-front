import { useState, FormEvent, type CSSProperties } from "react";
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
    <div className="relative isolate h-screen overflow-hidden bg-background text-foreground">

      {/* ── Decorative backdrop — minimal, neon, premium ────────────── */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">

        {/* Whisper-faint stars */}
        <StarField className="absolute inset-0 opacity-25" density={0.4} />

        {/* ─── BLOOM 1 — distant violet nebula, bottom-left ──
            Pure luminous color, no edge. Lower opacity, deeper glow. */}
        <div
          aria-hidden
          className="absolute"
          style={{
            width: "820px",
            height: "820px",
            bottom: "-360px",
            left: "-280px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle at 50% 50%, hsl(262 95% 70% / 0.07) 0%, hsl(232 85% 60% / 0.04) 38%, transparent 68%)",
            filter: "blur(40px)",
          }}
        />

        {/* ─── NEON RING 1 — thin ring with strong glow halo ── */}
        <div
          aria-hidden
          className="absolute animate-[artemis-float_18s_ease-in-out_infinite]"
          style={{
            width: "440px",
            height: "440px",
            bottom: "-120px",
            left: "-100px",
            borderRadius: "50%",
            border: "1px solid hsl(262 100% 82% / 0.18)",
            boxShadow:
              "0 0 80px hsl(262 100% 70% / 0.22), 0 0 140px hsl(262 95% 65% / 0.12), inset 0 0 60px hsl(232 90% 60% / 0.06)",
          }}
        />

        {/* ─── NEON RING 2 — smaller sibling, bright neon outline ── */}
        <div
          aria-hidden
          className="absolute"
          style={{
            width: "280px",
            height: "280px",
            bottom: "60px",
            left: "60px",
            borderRadius: "50%",
            border: "1px solid hsl(232 95% 78% / 0.14)",
            boxShadow:
              "0 0 60px hsl(262 95% 70% / 0.16), 0 0 120px hsl(262 90% 65% / 0.08)",
          }}
        />

        {/* ─── BLOOM 2 — rose nebula, top-right ── */}
        <div
          aria-hidden
          className="absolute"
          style={{
            width: "560px",
            height: "560px",
            top: "-220px",
            right: "-180px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle at 50% 50%, hsl(320 90% 70% / 0.06) 0%, hsl(262 85% 65% / 0.03) 40%, transparent 70%)",
            filter: "blur(48px)",
          }}
        />

        {/* ─── NEON RING 3 — top-right accent with bright glow ── */}
        <div
          aria-hidden
          className="absolute animate-[artemis-float_22s_ease-in-out_infinite]"
          style={{
            width: "340px",
            height: "340px",
            top: "-90px",
            right: "-90px",
            borderRadius: "50%",
            border: "1px solid hsl(320 95% 80% / 0.14)",
            boxShadow:
              "0 0 70px hsl(320 95% 70% / 0.18), 0 0 140px hsl(320 90% 65% / 0.08)",
            animationDelay: "-7s",
          }}
        />

        {/* ─── Whisper diagonal color wash ── */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, hsl(262 88% 68% / 0.02) 0%, transparent 30%, transparent 70%, hsl(320 76% 70% / 0.02) 100%)",
          }}
        />
      </div>

      {/* ── Drag strip — invisible, full-width region at very top ─── */}
      <div
        className="absolute inset-x-0 top-0 z-20 h-8"
        style={{ WebkitAppRegion: "drag" } as CSSProperties}
      />

      {/* ── Header ──────────────────────────────────────────────────── */}
      <header
        className="relative z-10 flex items-center justify-between px-8 py-6 lg:px-12"
        style={{ WebkitAppRegion: "drag" } as CSSProperties}
      >
        <Link
          to="/"
          aria-label="Back to Artemis home"
          style={{ WebkitAppRegion: "no-drag" } as CSSProperties}
          className="transition-opacity hover:opacity-80"
        >
          <ArtemisLogo />
        </Link>
      </header>

      {/* ── Main — 2-column at lg, single-column below ──────────────── */}
      <main
        className="relative z-10 mx-auto grid h-[calc(100vh-7rem)] w-full max-w-7xl grid-cols-1 items-center gap-6 overflow-hidden px-6 pb-6 pt-2 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:px-12"
        style={{ WebkitAppRegion: "no-drag" } as CSSProperties}
      >

        {/* ── Left: hero copy ── */}
        <section className="relative hidden flex-col justify-center lg:flex">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-xl"
          >
            <h1 className="font-display text-[clamp(2.4rem,5.4vw,4.4rem)] font-light leading-[0.98] tracking-[-0.035em] text-balance">
              <span className="artemis-text-lunar">A calmer way to see</span>
              <br />
              <span className="artemis-text-aurora">how your team ships.</span>
            </h1>
            <p className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground">
              Track velocity, complexity and team health across every squad —
              with the focused, quiet interface your engineering org deserves.
            </p>
          </motion.div>
        </section>

        {/* ── Right: sign-in card ── */}
        <section className="relative flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-[420px]"
          >
            {/* Aurora wash behind the card */}
            <div
              aria-hidden
              className="absolute -inset-3 rounded-[36px] opacity-25 blur-3xl"
              style={{
                background:
                  "linear-gradient(135deg, hsl(262 88% 68% / 0.45), hsl(232 78% 64% / 0.35) 50%, hsl(320 76% 70% / 0.25))",
              }}
            />

            <div className="artemis-panel relative overflow-hidden rounded-[28px] p-8 sm:p-10">
              {/* Top inner highlight */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent"
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
                      <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
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
                      <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
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
                        Signing in…
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
                  <span className="ml-1 rounded-full border border-border/50 bg-muted/40 px-2 py-0.5 text-[10px] text-muted-foreground">
                    soon
                  </span>
                </Button>
              </div>
            </div>

            <p className="mt-6 text-center text-[11px] text-muted-foreground/50">
              © {new Date().getFullYear()} Artemis · Built for engineering teams
            </p>
          </motion.div>
        </section>
      </main>
    </div>
  );
};

export default Login;
