import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  AppWindow,
  ArrowLeft,
  ArrowRight,
  Check,
  Cpu,
  Download as DownloadIcon,
  ShieldCheck,
} from "lucide-react";

import { Button } from "@/ui/components/ui/button";
import { ArtemisLogo, StarField } from "@/ui/components/cosmic";

const WINDOWS_URL =
  import.meta.env.VITE_DOWNLOAD_URL ??
  "https://github.com/mateuscastro5/perform-front/releases/latest/download/Artemis-setup.exe";

type Platform = {
  id: string;
  os: string;
  arch: string;
  iconPath: string;
  available: boolean;
  size?: string;
  href?: string;
  filename?: string;
};

const PLATFORMS: Platform[] = [
  {
    id: "windows",
    os: "Windows",
    arch: "x64 · 10 / 11",
    iconPath:
      "M3 5.5 12 4v8H3V5.5Zm10 -1.5 8 -1v10h-8V4Zm0 11h8v10l-8 -1v-9Zm-10 0h9v8.5L3 22V15Z",
    available: true,
    size: "~89 MB",
    href: WINDOWS_URL,
    filename: "Artemis-setup.exe",
  },
  {
    id: "macos",
    os: "macOS",
    arch: "Intel + Apple Silicon",
    iconPath:
      "M16.5 3a4 4 0 0 1 -3.6 4 4 4 0 0 1 3.6 -4Zm3.7 7.8c-.7 1.6 -2 4.3 -3.6 4.3 -1.2 0 -1.7 -.6 -3 -.6 -1.3 0 -2 .6 -3.1 .6 -1.7 0 -3.6 -3 -4.3 -5 -1 -2.7 -1 -5.6 .5 -6.9 1 -1 2.5 -1.4 3.7 -1.4 1.1 0 2.3 .7 3.1 .7 .9 0 2.3 -.8 3.6 -.7 .6 0 2.5 .1 3.6 1.7 -.1 .1 -2 1.2 -2 3.5 0 2.6 2.3 3.5 2.3 3.5 -.1 .1 -.4 1.2 -.8 2.3z",
    available: false,
  },
  {
    id: "linux",
    os: "Linux",
    arch: ".AppImage · .deb · .rpm",
    iconPath:
      "M12 3c-2.3 0 -3.7 1.6 -3.7 4 0 1.3 .4 2.4 1 3.2 -.7 .8 -1.4 1.7 -1.9 2.7 -.5 1 -.8 2 -.8 2.8 0 1.1 .4 2 1.2 2.6 -.5 .4 -.8 1 -.8 1.5 0 .6 .4 1.2 1 1.5 .6 .3 1.2 .4 1.8 .3 .6 -.1 1.1 -.3 1.5 -.5 .4 .3 1 .5 1.7 .5 .7 0 1.3 -.2 1.7 -.5 .4 .2 .9 .4 1.5 .5 .6 .1 1.2 0 1.8 -.3 .6 -.3 1 -.9 1 -1.5 0 -.5 -.3 -1.1 -.8 -1.5 .8 -.6 1.2 -1.5 1.2 -2.6 0 -.8 -.3 -1.8 -.8 -2.8 -.5 -1 -1.2 -1.9 -1.9 -2.7 .6 -.8 1 -1.9 1 -3.2 0 -2.4 -1.4 -4 -3.7 -4Z",
    available: false,
  },
];

const HIGHLIGHTS = [
  {
    icon: ShieldCheck,
    title: "Same login as the web",
    body: "JWT auth shared with artemis-api. Sign in once, switch surfaces freely.",
  },
  {
    icon: Cpu,
    title: "Native performance",
    body: "Local Chromium runtime, no browser tabs eating focus.",
  },
  {
    icon: AppWindow,
    title: "Custom window chrome",
    body: "Distraction-free titlebar with sidebar always at hand.",
  },
];

function OsIcon({ d, className }: { d: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="currentColor"
      aria-hidden
      className={className}
    >
      <path d={d} />
    </svg>
  );
}

const Download = () => {
  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-background text-foreground">
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
      </div>

      <header className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6 lg:px-12">
        <Link to="/" aria-label="Artemis home" className="transition-opacity hover:opacity-80">
          <ArtemisLogo />
        </Link>
        <nav className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link to="/how-we-do-it">How we do it</Link>
          </Button>
          <Button asChild size="sm">
            <Link to="/login">Sign in</Link>
          </Button>
        </nav>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-24 pt-12 lg:px-12 lg:pt-16">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to home
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6 max-w-3xl"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-border/40 bg-card/40 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-muted-foreground backdrop-blur-md">
            <DownloadIcon className="h-3 w-3" />
            Native desktop
          </span>
          <h1 className="mt-6 font-display text-[clamp(2.4rem,5.4vw,4.4rem)] font-light leading-[0.98] tracking-[-0.03em]">
            <span className="artemis-text-lunar">Get Artemis</span>
            <br />
            <span className="artemis-text-aurora">on your machine.</span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground">
            Pick your platform. The web app works everywhere, but the desktop
            build gives you native window chrome and offline-capable focus.
          </p>
        </motion.div>

        <section className="mt-14 grid gap-4 md:grid-cols-3">
          {PLATFORMS.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.1 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              className={`relative flex flex-col rounded-2xl border p-6 backdrop-blur-md transition-colors ${
                p.available
                  ? "border-border/50 bg-card/30 hover:border-primary/40"
                  : "border-border/30 bg-card/15"
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`inline-flex h-11 w-11 items-center justify-center rounded-xl border ${
                    p.available
                      ? "border-primary/40 bg-primary/10 text-primary"
                      : "border-border/40 bg-card/30 text-muted-foreground/70"
                  }`}
                >
                  <OsIcon d={p.iconPath} className="h-5 w-5" />
                </span>
                {!p.available && (
                  <span className="rounded-full border border-border/40 bg-muted/30 px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                    Coming soon
                  </span>
                )}
              </div>

              <div className="mt-5">
                <h2 className="font-display text-2xl">{p.os}</h2>
                <p className="mt-1 text-xs text-muted-foreground">{p.arch}</p>
              </div>

              {p.size && (
                <p className="mt-4 text-[11px] text-muted-foreground/70">
                  {p.size}
                  {p.filename && (
                    <>
                      {" · "}
                      <span className="font-mono">{p.filename}</span>
                    </>
                  )}
                </p>
              )}

              <div className="mt-6">
                {p.available ? (
                  <Button asChild size="lg" className="group w-full">
                    <a href={p.href} target="_blank" rel="noreferrer">
                      <DownloadIcon className="h-4 w-4" />
                      Download
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </a>
                  </Button>
                ) : (
                  <Button size="lg" className="w-full" disabled>
                    Notify me
                  </Button>
                )}
              </div>
            </motion.div>
          ))}
        </section>

        <section className="mt-20 grid gap-6 sm:grid-cols-3">
          {HIGHLIGHTS.map((h) => (
            <div
              key={h.title}
              className="rounded-2xl border border-border/30 bg-card/20 p-5"
            >
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary">
                <h.icon className="h-4 w-4" />
              </span>
              <h3 className="mt-3 text-sm font-medium">{h.title}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                {h.body}
              </p>
            </div>
          ))}
        </section>

        <section className="mt-16 rounded-2xl border border-border/30 bg-card/20 p-6">
          <h3 className="text-sm font-medium">Why no Mac / Linux yet?</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            The desktop build uses Electron, so cross-platform installers are a
            matter of CI and code signing — not architecture. macOS and Linux
            builds ship next. In the meantime, the web app is fully featured
            and runs on any modern browser.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
            <Check className="h-3.5 w-3.5 text-primary" />
            <span className="text-muted-foreground">
              Same auth, same data, same UI as desktop.
            </span>
          </div>
          <div className="mt-5">
            <Button asChild variant="ghost" size="sm">
              <Link to="/login">Use the web app instead</Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-border/30">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-3 px-6 py-8 text-xs text-muted-foreground/70 sm:flex-row lg:px-12">
          <span>© {new Date().getFullYear()} Artemis · Built for engineering teams</span>
          <div className="flex items-center gap-4">
            <Link to="/" className="transition-colors hover:text-foreground">
              Home
            </Link>
            <Link to="/how-we-do-it" className="transition-colors hover:text-foreground">
              How we do it
            </Link>
            <Link to="/login" className="transition-colors hover:text-foreground">
              Sign in
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Download;
