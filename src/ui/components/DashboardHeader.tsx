import { useEffect, useState, type CSSProperties, type ComponentType } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  GaugeCircle,
  Home,
  LayoutDashboard,
  LogOut,
  Minus,
  Settings,
  Square,
  User,
  Users,
  X,
  Search,
} from "lucide-react";
import { Button } from "@/ui/components/ui/button";
import { Input } from "@/ui/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/ui/components/ui/dropdown-menu";
import { useAuth } from "@/ui/contexts/AuthContext";
import {
  useUIStore,
  SIDEBAR_LEFT,
  SIDEBAR_COLLAPSED_W,
  SIDEBAR_EXPANDED_W,
  SIDEBAR_GAP,
} from "@/ui/stores/uiStore";
import { ArtemisLogo } from "@/ui/components/cosmic";

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface DashboardHeaderProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  breadcrumb?: BreadcrumbItem[];
}

type NavItem = {
  id: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  path?: string;
  badge?: string;
};

const NAV_ITEMS: NavItem[] = [
  { id: "home",       label: "Home",       icon: LayoutDashboard, path: "/" },
  { id: "squads",     label: "Squads",     icon: Users,           path: "/squads" },
  { id: "complexity", label: "Complexity", icon: GaugeCircle,     path: "/complexity" },
  { id: "profile",    label: "Profile",    icon: User,            path: "/profile" },
  { id: "settings",   label: "Settings",   icon: Settings,        path: "/settings" },
];

const ACTIVE_LABEL: Record<string, string> = {
  home: "Home",
  squads: "Squads",
  complexity: "Complexity",
  profile: "Profile",
  settings: "Settings",
};

const ACTIVE_PATH: Record<string, string> = {
  home: "/",
  squads: "/squads",
  complexity: "/complexity",
  profile: "/profile",
  settings: "/settings",
};

const SPRING = { type: "spring", stiffness: 280, damping: 28 } as const;

export const DashboardHeader = ({ activeTab, onTabChange, breadcrumb }: DashboardHeaderProps) => {
  const [, setIsMaximized] = useState(false);
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();

  const sidebarWidth = sidebarCollapsed ? SIDEBAR_COLLAPSED_W : SIDEBAR_EXPANDED_W;
  const headerLeft = SIDEBAR_LEFT + sidebarWidth + SIDEBAR_GAP;

  const roleLabel = user?.role?.replace("_", " ") ?? "User";
  const displayName = user?.name ?? "User";
  const displayEmail = user?.email ?? "";
  const avatarFallback =
    displayName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? "")
      .join("") || "U";

  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.window.onMaximized(() => setIsMaximized(true));
      window.electronAPI.window.onUnmaximized(() => setIsMaximized(false));
    }
  }, []);

  const handleMinimize = async () => { if (window.electronAPI) await window.electronAPI.window.minimize(); };
  const handleMaximize = async () => { if (window.electronAPI) await window.electronAPI.window.maximize(); };
  const handleClose = async () => { if (window.electronAPI) await window.electronAPI.window.close(); };

  const handleTabChange = (item: NavItem) => {
    onTabChange(item.id);
    if (item.path) navigate(item.path);
  };

  const breadcrumbItems: BreadcrumbItem[] = breadcrumb ?? [{
    label: ACTIVE_LABEL[activeTab] ?? "Home",
    path: ACTIVE_PATH[activeTab],
  }];

  return (
    <>
      {/* ── Sidebar ── */}
      <motion.aside
        initial={{ width: sidebarWidth }}
        animate={{ width: sidebarWidth }}
        transition={SPRING}
        className="fixed left-6 top-6 bottom-6 z-40 flex flex-col overflow-hidden rounded-[28px] border border-border/55 bg-sidebar/70 backdrop-blur-2xl shadow-orbit"
      >
        {/* Aurora wash inside sidebar */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 50% -10%, hsl(258 92% 70% / 0.35), transparent 55%), radial-gradient(circle at 0% 110%, hsl(196 96% 64% / 0.18), transparent 55%), linear-gradient(180deg, hsl(var(--sidebar-background) / 0.6), hsl(var(--sidebar-background) / 0.85))",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
        />

        {/* Logo row */}
        <div
          className={`relative z-10 flex shrink-0 items-center border-b border-white/5 px-4 py-5 ${
            sidebarCollapsed ? "justify-center" : ""
          }`}
          style={{ minHeight: 72 }}
        >
          {sidebarCollapsed ? (
            <ArtemisLogo withWordmark={false} size={36} />
          ) : (
            <ArtemisLogo size={34} />
          )}
        </div>

        {/* Welcome — only when expanded */}
        <AnimatePresence initial={false}>
          {!sidebarCollapsed && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22 }}
              className="relative z-10 shrink-0 overflow-hidden border-b border-white/5"
            >
              <div className="px-6 pt-6 pb-5">
                <p className="text-xs text-muted-foreground">
                  Welcome back
                </p>
                <p className="mt-2 font-display text-[34px] font-light leading-[0.95] tracking-[-0.03em] text-foreground">
                  {displayName.split(" ")[0] ?? "there"}
                </p>
                <p className="mt-3 text-xs text-muted-foreground">
                  {new Date().toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "short" })}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <nav
          className={`relative z-10 flex-1 overflow-y-auto py-4 space-y-1 ${
            sidebarCollapsed ? "px-2" : "px-3"
          }`}
          style={{ paddingBottom: "5rem" }}
        >
          {!sidebarCollapsed && (
            <p className="px-2 pb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/60">
              Navigation
            </p>
          )}
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleTabChange(item)}
                title={sidebarCollapsed ? item.label : undefined}
                className={`group relative flex w-full items-center rounded-2xl transition-colors ${
                  sidebarCollapsed ? "justify-center px-0 py-2.5" : "gap-3 px-3 py-2.5"
                } ${
                  isActive
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active-bg"
                    className="absolute inset-0 rounded-2xl border border-primary/35 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent shadow-[0_0_24px_-8px_hsl(258_92%_70%/0.6)]"
                    transition={{ type: "spring", stiffness: 360, damping: 30 }}
                  />
                )}
                <span
                  className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-all ${
                    isActive
                      ? "border-primary/50 bg-primary/15 text-primary"
                      : "border-border/40 bg-card/30 group-hover:border-border/70 group-hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </span>
                {!sidebarCollapsed && (
                  <div className="relative z-10 flex flex-1 items-center justify-between">
                    <p className="text-[14px] font-medium leading-none">{item.label}</p>
                    <div className="flex items-center gap-2">
                      {item.badge && (
                        <span className="rounded-full border border-border/50 bg-card/40 px-1.5 py-0.5 text-[10px] text-muted-foreground">
                          {item.badge}
                        </span>
                      )}
                      {isActive && (
                        <span className="h-5 w-[2px] rounded-full bg-primary shadow-[0_0_12px_hsl(258_92%_70%/0.7)]" />
                      )}
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* ── Bottom toggle ── */}
        <div className="relative z-10 border-t border-white/5 px-3 py-3 backdrop-blur-sm">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={toggleSidebar}
            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={`flex w-full items-center rounded-xl py-2 text-muted-foreground transition-colors hover:bg-muted/30 hover:text-foreground ${
              sidebarCollapsed ? "justify-center px-0" : "gap-2.5 px-3"
            }`}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4 shrink-0" />
                <span className="text-[13px] font-medium">Collapse</span>
              </>
            )}
          </motion.button>
        </div>
      </motion.aside>

      {/* ── Top header ── */}
      <motion.header
        initial={{ left: headerLeft }}
        animate={{ left: headerLeft }}
        transition={SPRING}
        className="fixed right-6 top-6 z-50 overflow-hidden rounded-[24px] border border-border/55 bg-card/35 backdrop-blur-2xl shadow-orbit"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/8 via-background/30 to-secondary/8" />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
        />

        {/* Window controls strip */}
        <div
          className="relative z-10 flex h-8 items-center justify-end px-2"
          style={{ WebkitAppRegion: "drag" } as CSSProperties}
        >
          <div className="flex" style={{ WebkitAppRegion: "no-drag" } as CSSProperties}>
            <Button variant="ghost" size="icon" className="h-8 w-10 rounded-none hover:bg-muted/30" onClick={handleMinimize}>
              <Minus className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-10 rounded-none hover:bg-muted/30" onClick={handleMaximize}>
              <Square className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-10 rounded-none hover:bg-destructive/80 hover:text-destructive-foreground" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Main header row */}
        <div
          className="relative z-10 flex h-[66px] items-center justify-between border-t border-white/5 px-6"
          style={{ WebkitAppRegion: "no-drag" } as CSSProperties}
        >
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-1.5 rounded-md px-1.5 py-1 transition-colors hover:bg-muted/20 hover:text-foreground"
            >
              <Home className="h-3.5 w-3.5" />
              <span>Home</span>
            </button>
            {breadcrumbItems.map((item, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <ChevronRight className="h-3 w-3 text-muted-foreground/40" />
                {item.path ? (
                  <button
                    onClick={() => navigate(item.path!)}
                    className="rounded-md px-1.5 py-1 font-medium transition-colors hover:bg-muted/20 hover:text-foreground"
                  >
                    {item.label}
                  </button>
                ) : (
                  <span className="px-1.5 font-medium text-foreground">{item.label}</span>
                )}
              </div>
            ))}
          </div>

          {/* Right: search + bell + user */}
          <div className="flex items-center gap-3" style={{ WebkitAppRegion: "no-drag" } as CSSProperties}>
            <div className="relative w-[260px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search..." className="h-10 rounded-xl pl-10" />
              <kbd className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 rounded border border-border/50 bg-muted/40 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:inline">
                ⌘K
              </kbd>
            </div>

            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-muted/30">
              <Bell className="h-4 w-4" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2.5 border-l border-border/35 pl-3 transition-opacity hover:opacity-80">
                  <div className="relative">
                    <span className="absolute -inset-0.5 rounded-full bg-aurora-gradient opacity-70 blur-sm" />
                    <Avatar className="relative h-9 w-9 ring-1 ring-border/60">
                      <AvatarImage src={user?.avatarUrl ?? undefined} />
                      <AvatarFallback>{avatarFallback}</AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold leading-none">{displayName}</p>
                    <p className="mt-1 text-xs capitalize text-muted-foreground">
                      {roleLabel}
                    </p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem className="cursor-pointer" onClick={() => navigate("/profile")}>
                  <User className="mr-2 h-4 w-4" />
                  <span>View profile</span>
                </DropdownMenuItem>
                {displayEmail && (
                  <DropdownMenuItem className="cursor-default opacity-70">
                    <span className="truncate text-xs">{displayEmail}</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive" onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </motion.header>
    </>
  );
};
