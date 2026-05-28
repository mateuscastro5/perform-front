import { useState, type ComponentType } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Palette,
  Plug,
  Shield,
} from "lucide-react";

import { DashboardHeader } from "@/ui/components/DashboardHeader";
import { GitHubIntegration } from "@/ui/components/settings/GitHubIntegration";
import { useUIStore, getSidebarOffset } from "@/ui/stores/uiStore";
import { useIsMobile } from "@/ui/hooks/useIsMobile";
import { cn } from "@/ui/lib/utils";

interface SettingsSection {
  id: string;
  label: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  badge?: string;
}

/**
 * Settings — vertical-rail navigation pattern (Linear / Notion / GitHub).
 * Sections are addressable, each rendered as a panel on the right.
 * Glass surfaces, narrow content column, generous whitespace.
 */
const Settings = () => {
  const [activeTab, setActiveTab] = useState("settings");
  const [section, setSection] = useState<string>("integrations");

  const { sidebarCollapsed } = useUIStore();
  const isMobile = useIsMobile();
  const contentLeft = getSidebarOffset(sidebarCollapsed, isMobile);

  const sections: SettingsSection[] = [
    {
      id: "integrations",
      label: "Integrations",
      description: "GitHub, repositories, webhooks",
      icon: Plug,
    },
    {
      id: "notifications",
      label: "Notifications",
      description: "Sync alerts, mentions, daily digest",
      icon: Bell,
      badge: "Soon",
    },
    {
      id: "appearance",
      label: "Appearance",
      description: "Theme, density, accent color",
      icon: Palette,
      badge: "Soon",
    },
    {
      id: "security",
      label: "Security",
      description: "Sessions, tokens, password",
      icon: Shield,
      badge: "Soon",
    },
  ];

  const activeSection = sections.find((s) => s.id === section);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden text-foreground">
      {/* Soft backdrop blooms — same vocabulary as Profile */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full opacity-50 blur-3xl"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, hsl(262 95% 70% / 0.10) 0%, transparent 60%)",
          }}
        />
        <div
          className="absolute -bottom-32 -right-32 w-[640px] h-[640px] rounded-full opacity-40 blur-3xl"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, hsl(320 80% 65% / 0.08) 0%, transparent 60%)",
          }}
        />
      </div>

      <DashboardHeader activeTab={activeTab} onTabChange={setActiveTab} />

      <main
        className="relative z-10 pr-6 md:pr-10 pt-[148px] pb-20 transition-[padding-left] duration-300"
        style={{ paddingLeft: contentLeft + 16 }}
      >
        <div className="max-w-6xl mx-auto">
          {/* Heading */}
          <header className="mb-8 px-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/60">
              Workspace
            </p>
            <h1 className="mt-2 font-display text-[32px] font-light leading-none tracking-[-0.025em]">
              <span className="artemis-text-lunar">Settings</span>
            </h1>
            <p className="mt-2 text-sm text-muted-foreground max-w-xl">
              Connect data sources, tune the experience, and govern access.
            </p>
          </header>

          {/* Two-column layout: rail + panel */}
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
            {/* ── Vertical rail ── */}
            <nav className="space-y-1">
              {sections.map((item) => {
                const Icon = item.icon;
                const isActive = section === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setSection(item.id)}
                    className={cn(
                      "group relative w-full text-left rounded-xl px-3.5 py-3 transition-all flex items-start gap-3",
                      isActive
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="settings-rail-active"
                        className="absolute inset-0 rounded-xl border border-primary/35 bg-gradient-to-r from-primary/15 via-primary/8 to-transparent shadow-[0_0_28px_-10px_hsl(258_92%_70%/0.55)]"
                        transition={{ type: "spring", stiffness: 360, damping: 30 }}
                      />
                    )}

                    <span
                      className={cn(
                        "relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-all",
                        isActive
                          ? "border-primary/50 bg-primary/15 text-primary"
                          : "border-border/40 bg-card/30 group-hover:border-border/70",
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </span>

                    <div className="relative z-10 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-[13.5px] font-medium leading-none">
                          {item.label}
                        </p>
                        {item.badge && (
                          <span className="rounded-full border border-border/50 bg-muted/40 px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-muted-foreground">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-[11px] leading-snug text-muted-foreground/70">
                        {item.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </nav>

            {/* ── Panel ── */}
            <AnimatePresence mode="wait">
              <motion.section
                key={section}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4, transition: { duration: 0.12 } }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                className="artemis-panel rounded-[24px] p-7 md:p-9 relative overflow-hidden"
              >
                {/* Top hairline highlight */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent"
                />

                <div className="relative">
                  {/* Section header */}
                  {activeSection && (
                    <div className="mb-6 flex items-start justify-between gap-4">
                      <div>
                        <h2 className="font-display text-[22px] font-medium leading-tight tracking-[-0.015em]">
                          {activeSection.label}
                        </h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {activeSection.description}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Sections */}
                  {section === "integrations" && (
                    <div className="-mx-1">
                      <GitHubIntegration />
                    </div>
                  )}

                  {section === "notifications" && (
                    <ComingSoon
                      icon={Bell}
                      title="Notification preferences"
                      description="Control which sync events, PR mentions and digest emails reach you. We're polishing the wiring — expect this in the next sprint."
                      bullets={[
                        "Per-channel mute (sync, AI, security)",
                        "Daily digest at 9am, weekly recap on Mondays",
                        "Slack + email destinations",
                      ]}
                    />
                  )}

                  {section === "appearance" && (
                    <ComingSoon
                      icon={Palette}
                      title="Theme & density"
                      description="Switch accent palette, dial information density, and pick between standard / compact layouts. Content is staying minimal — knobs are coming."
                      bullets={[
                        "Aurora · Iris · Rose accent palettes",
                        "Compact mode (denser tables, smaller padding)",
                        "Reduced motion respect (already automatic)",
                      ]}
                    />
                  )}

                  {section === "security" && (
                    <ComingSoon
                      icon={Shield}
                      title="Security & sessions"
                      description="Manage active sessions, rotate tokens, and enable two-factor. The auth foundation is ready — UI surfaces land alongside the next backend pass."
                      bullets={[
                        "Active sessions with revoke",
                        "Personal access tokens for the API",
                        "TOTP-based two-factor authentication",
                      ]}
                    />
                  )}
                </div>
              </motion.section>
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;

/* ─────────── Local sections ─────────── */

interface ComingSoonProps {
  icon: ComponentType<{ className?: string }>;
  title: string;
  description: string;
  bullets: string[];
}

const ComingSoon = ({ icon: Icon, title, description, bullets }: ComingSoonProps) => (
  <div className="py-2">
    <div className="flex items-center gap-3 mb-4">
      <div className="h-11 w-11 rounded-xl bg-card/40 border border-border/40 flex items-center justify-center">
        <Icon className="h-4.5 w-4.5 text-muted-foreground" />
      </div>
      <div>
        <p className="text-[14px] font-semibold leading-none">{title}</p>
        <p className="mt-1 text-[11px] uppercase tracking-[0.16em] font-mono text-secondary/85">
          Coming soon
        </p>
      </div>
    </div>

    <p className="text-[13px] leading-relaxed text-muted-foreground max-w-xl mb-5">
      {description}
    </p>

    <ul className="space-y-2.5 text-[13px] text-muted-foreground/85">
      {bullets.map((b) => (
        <li key={b} className="flex items-start gap-2.5">
          <span
            aria-hidden
            className="mt-1.5 h-1 w-1 rounded-full bg-primary/55 shrink-0"
          />
          <span>{b}</span>
        </li>
      ))}
    </ul>

    <div className="mt-7 rounded-xl border border-secondary/25 bg-secondary/5 px-4 py-3 text-[12px] leading-relaxed text-muted-foreground">
      Want this prioritized? Mention it in your next sync — every feature
      shipped maps to a real conversation with someone shipping in production.
    </div>
  </div>
);

