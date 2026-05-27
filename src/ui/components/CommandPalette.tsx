import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import { Command as CommandPrimitive } from "cmdk";
import {
  ArrowRight,
  GitPullRequest,
  Home,
  LayoutDashboard,
  Lightbulb,
  RefreshCw,
  Search,
  Settings as SettingsIcon,
  Shield,
  Sparkles,
  User,
  Users,
} from "lucide-react";

import { Dialog, DialogContent } from "@/ui/components/ui/dialog";
import { useDashboard } from "@/ui/contexts/DashboardContext";
import { useAuth } from "@/ui/contexts/AuthContext";
import { apiService } from "@/ui/services/api.service";
import { cn } from "@/ui/lib/utils";

/* ──────────────────────── Provider context ──────────────────────── */

interface CommandPaletteContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
}

const CommandPaletteContext = createContext<CommandPaletteContextValue | null>(
  null,
);

export function useCommandPalette(): CommandPaletteContextValue {
  const ctx = useContext(CommandPaletteContext);
  if (!ctx) {
    throw new Error(
      "useCommandPalette must be used inside <CommandPaletteProvider>",
    );
  }
  return ctx;
}

interface CommandPaletteProviderProps {
  children: ReactNode;
}

/**
 * Mounts a single global CommandPalette and exposes open/close via context.
 * Also installs the Cmd+K / Ctrl+K keyboard shortcut.
 */
export function CommandPaletteProvider({ children }: CommandPaletteProviderProps) {
  const [open, setOpen] = useState(false);
  const toggle = useCallback(() => setOpen((v) => !v), []);

  // Global keyboard shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isCmdK = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k";
      if (isCmdK) {
        e.preventDefault();
        toggle();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [toggle]);

  const value = useMemo(() => ({ open, setOpen, toggle }), [open, toggle]);

  return (
    <CommandPaletteContext.Provider value={value}>
      {children}
      <CommandPalette />
    </CommandPaletteContext.Provider>
  );
}

/* ──────────────────────── Modal component ──────────────────────── */

type SquadResult = { id: string; name: string; memberCount: number };

const QUICK_ACTIONS: Array<{
  id: string;
  label: string;
  description: string;
  icon: typeof Home;
  href?: string;
  shortcut?: string;
}> = [
  { id: "go-home",      label: "Go to Home",        description: "Velocity, complexity & team health",  icon: LayoutDashboard, href: "/" },
  { id: "go-squads",    label: "Go to Squads",      description: "Manage teams and members",             icon: Users,           href: "/squads" },
  { id: "go-complex",   label: "Go to Complexity",  description: "AI complexity review queue",           icon: Sparkles,        href: "/complexity" },
  { id: "go-how",       label: "Go to How we do it", description: "Methodology, formulas & limits",      icon: Lightbulb,       href: "/how-we-do-it" },
  { id: "go-profile",   label: "Go to Profile",     description: "Identity & GitHub handle",             icon: User,            href: "/profile" },
  { id: "go-settings",  label: "Open Settings",     description: "Integrations and workspace config",    icon: SettingsIcon,    href: "/settings" },
];

function CommandPalette() {
  const { open, setOpen } = useCommandPalette();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const { token } = useAuth();
  const {
    githubDevelopers,
    pullRequests,
    isGithubConnected,
    triggerDataCollection,
    isSyncing,
  } = useDashboard();

  // Fetch squads on first open. Keep them around between opens.
  const [squads, setSquads] = useState<SquadResult[]>([]);
  const [squadsFetched, setSquadsFetched] = useState(false);

  useEffect(() => {
    if (!open || squadsFetched || !token) return;
    let alive = true;
    apiService
      .getSquads(token)
      .then((data) => {
        if (!alive) return;
        setSquads(
          data.map((s: any) => ({
            id: s.id,
            name: s.name,
            memberCount: Array.isArray(s.developers) ? s.developers.length : 0,
          })),
        );
        setSquadsFetched(true);
      })
      .catch((err) => {
        console.warn("Command palette failed to load squads:", err);
      });
    return () => {
      alive = false;
    };
  }, [open, token, squadsFetched]);

  // Reset query when closing
  useEffect(() => {
    if (!open) setSearch("");
  }, [open]);

  const handleSelect = (action: () => void) => {
    setOpen(false);
    // Tiny delay so the close animation can start
    setTimeout(() => action(), 80);
  };

  const developers = useMemo(
    () => githubDevelopers.slice(0, 50),
    [githubDevelopers],
  );

  const recentPrs = useMemo(
    () => pullRequests?.prs.slice(0, 20) ?? [],
    [pullRequests],
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="p-0 overflow-hidden border-border/55 bg-card/85 backdrop-blur-2xl shadow-orbit max-w-[640px]"
        onOpenAutoFocus={(e) => {
          // Let cmdk own focus
          e.preventDefault();
        }}
      >
        {/* Aurora wash behind the modal */}
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-1 rounded-[36px] opacity-25 blur-3xl"
          style={{
            background:
              "linear-gradient(135deg, hsl(262 88% 68% / 0.4), hsl(232 78% 64% / 0.3) 50%, hsl(320 76% 70% / 0.25))",
          }}
        />

        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent"
        />

        <CommandPrimitive
          shouldFilter
          className="relative flex flex-col overflow-hidden"
          loop
        >
          {/* ── Search input ── */}
          <div className="flex items-center gap-3 border-b border-border/40 px-5 py-4">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground/55" />
            <CommandPrimitive.Input
              autoFocus
              value={search}
              onValueChange={setSearch}
              placeholder="Search squads, developers, PRs, actions…"
              className="flex h-7 w-full bg-transparent text-[14.5px] text-foreground placeholder:text-muted-foreground/45 outline-none"
            />
            <kbd className="rounded border border-border/50 bg-muted/40 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
              esc
            </kbd>
          </div>

          {/* ── Results list ── */}
          <CommandPrimitive.List className="max-h-[420px] overflow-y-auto py-2 px-2 scrollbar-thin scrollbar-thumb-border/40 scrollbar-track-transparent">
            <CommandPrimitive.Empty className="py-12 text-center text-sm text-muted-foreground/65">
              <div className="flex flex-col items-center gap-2">
                <Search className="h-5 w-5 text-muted-foreground/40" />
                <p>No results for "{search}".</p>
                <p className="text-[11px] text-muted-foreground/45">
                  Try a developer name, squad, PR title, or action.
                </p>
              </div>
            </CommandPrimitive.Empty>

            {/* ── Quick actions ── */}
            <Group heading="Quick actions">
              {QUICK_ACTIONS.map((a) => (
                <Item
                  key={a.id}
                  value={`action ${a.label} ${a.description}`}
                  icon={a.icon}
                  label={a.label}
                  description={a.description}
                  onSelect={() => {
                    if (a.href) handleSelect(() => navigate(a.href!));
                  }}
                  trailing={<ArrowRight className="h-3.5 w-3.5 opacity-55" />}
                />
              ))}
              {isGithubConnected && (
                <Item
                  value="action sync github now refresh data"
                  icon={RefreshCw}
                  label={isSyncing ? "Syncing GitHub data…" : "Sync GitHub now"}
                  description="Pull latest commits, PRs and reviews"
                  onSelect={() => {
                    if (isSyncing) return;
                    handleSelect(() => triggerDataCollection().catch(() => {}));
                  }}
                  trailing={
                    <kbd className="rounded border border-border/50 bg-muted/40 px-1.5 py-0.5 font-mono text-[9.5px] text-muted-foreground">
                      sync
                    </kbd>
                  }
                />
              )}
            </Group>

            {/* ── Squads ── */}
            {squads.length > 0 && (
              <Group heading={`Squads · ${squads.length}`}>
                {squads.map((s) => (
                  <Item
                    key={s.id}
                    value={`squad ${s.name}`}
                    icon={Shield}
                    label={s.name}
                    description={`${s.memberCount} ${s.memberCount === 1 ? "member" : "members"}`}
                    onSelect={() =>
                      handleSelect(() => navigate("/squads"))
                    }
                  />
                ))}
              </Group>
            )}

            {/* ── Developers ── */}
            {developers.length > 0 && (
              <Group heading={`Developers · ${developers.length}`}>
                {developers.map((dev) => (
                  <Item
                    key={dev.id}
                    value={`developer ${dev.name} ${dev.githubUsername ?? ""} ${dev.email ?? ""}`}
                    avatarUrl={dev.avatarUrl ?? undefined}
                    fallback={dev.name?.charAt(0) ?? "?"}
                    label={dev.name}
                    description={
                      dev.githubUsername
                        ? `@${dev.githubUsername}`
                        : dev.email ?? "Developer"
                    }
                    onSelect={() =>
                      handleSelect(() => navigate(`/developer/${dev.id}`))
                    }
                  />
                ))}
              </Group>
            )}

            {/* ── Recent PRs ── */}
            {recentPrs.length > 0 && (
              <Group heading={`Recent pull requests · ${recentPrs.length}`}>
                {recentPrs.map((pr) => (
                  <Item
                    key={pr.id}
                    value={`pr ${pr.title} #${pr.id} ${pr.author?.name ?? ""}`}
                    icon={GitPullRequest}
                    label={pr.title}
                    description={`#${pr.id} · ${pr.author?.name ?? "unknown"} · ${pr.status ?? "open"}`}
                    onSelect={() => {
                      if (pr.url) {
                        handleSelect(() => window.open(pr.url, "_blank"));
                      } else {
                        handleSelect(() => navigate("/dashboard"));
                      }
                    }}
                  />
                ))}
              </Group>
            )}

            {/* Hint when both squads / devs / prs empty (signed-in but no data yet) */}
            {!squadsFetched && squads.length === 0 && developers.length === 0 && recentPrs.length === 0 && (
              <div className="px-3 py-8 text-center text-[12px] text-muted-foreground/55">
                <span className="inline-flex h-1.5 w-1.5 rounded-full bg-primary animate-pulse mr-2" />
                Loading workspace data…
              </div>
            )}
          </CommandPrimitive.List>

          {/* ── Footer ── */}
          <div className="flex items-center justify-between border-t border-border/40 px-4 py-2.5 text-[10.5px] text-muted-foreground/65">
            <div className="flex items-center gap-3">
              <KbdHint keys={["↑", "↓"]} label="navigate" />
              <KbdHint keys={["↵"]} label="open" />
            </div>
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-3 w-3 text-primary/85" />
              <span className="font-mono uppercase tracking-[0.14em]">
                Artemis · cmd-k
              </span>
            </div>
          </div>
        </CommandPrimitive>
      </DialogContent>
    </Dialog>
  );
}

/* ──────────────────────── Local primitives ──────────────────────── */

interface GroupProps {
  heading: string;
  children: ReactNode;
}

const Group = ({ heading, children }: GroupProps) => (
  <CommandPrimitive.Group
    heading={heading}
    className={cn(
      "px-1 py-1",
      "[&_[cmdk-group-heading]]:px-2.5 [&_[cmdk-group-heading]]:pt-2 [&_[cmdk-group-heading]]:pb-1.5",
      "[&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.16em]",
      "[&_[cmdk-group-heading]]:text-muted-foreground/55 [&_[cmdk-group-heading]]:font-mono",
    )}
  >
    {children}
  </CommandPrimitive.Group>
);

interface ItemProps {
  value: string;
  label: string;
  description?: string;
  icon?: typeof Home;
  avatarUrl?: string;
  fallback?: string;
  onSelect: () => void;
  trailing?: ReactNode;
}

const Item = ({
  value,
  label,
  description,
  icon: Icon,
  avatarUrl,
  fallback,
  onSelect,
  trailing,
}: ItemProps) => (
  <CommandPrimitive.Item
    value={value}
    onSelect={onSelect}
    className={cn(
      "group flex items-center gap-3 rounded-lg px-2.5 py-2 cursor-pointer",
      "transition-colors",
      "data-[selected=true]:bg-primary/10",
      "data-[selected=true]:text-foreground",
      "text-foreground/90",
    )}
  >
    {/* Leading: avatar OR icon */}
    {avatarUrl ? (
      <span className="h-7 w-7 shrink-0 rounded-md bg-card overflow-hidden border border-border/50">
        <img
          src={avatarUrl}
          alt=""
          className="h-full w-full object-cover"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />
      </span>
    ) : Icon ? (
      <span className="h-7 w-7 shrink-0 rounded-md bg-card/60 border border-border/40 flex items-center justify-center text-muted-foreground group-data-[selected=true]:text-primary group-data-[selected=true]:border-primary/30 group-data-[selected=true]:bg-primary/10 transition-colors">
        <Icon className="h-3.5 w-3.5" />
      </span>
    ) : (
      <span className="h-7 w-7 shrink-0 rounded-md bg-muted/50 border border-border/40 flex items-center justify-center text-[11px] text-muted-foreground font-semibold uppercase">
        {fallback ?? "?"}
      </span>
    )}

    {/* Body */}
    <div className="flex-1 min-w-0">
      <p className="text-[13.5px] font-medium leading-none truncate">{label}</p>
      {description && (
        <p className="mt-1 text-[11.5px] leading-none text-muted-foreground/70 truncate">
          {description}
        </p>
      )}
    </div>

    {/* Trailing */}
    {trailing && (
      <span className="shrink-0 opacity-0 group-data-[selected=true]:opacity-100 transition-opacity">
        {trailing}
      </span>
    )}
  </CommandPrimitive.Item>
);

interface KbdHintProps {
  keys: string[];
  label: string;
}

const KbdHint = ({ keys, label }: KbdHintProps) => (
  <span className="inline-flex items-center gap-1">
    {keys.map((k) => (
      <kbd
        key={k}
        className="rounded border border-border/50 bg-muted/40 px-1 py-0.5 font-mono text-[9.5px] text-muted-foreground"
      >
        {k}
      </kbd>
    ))}
    <span>{label}</span>
  </span>
);
