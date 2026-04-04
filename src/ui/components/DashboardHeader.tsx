import { useEffect, useState, type CSSProperties, type ComponentType } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Home,
  LayoutDashboard,
  LogOut,
  Minus,
  Settings,
  Shield,
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
  getSidebarOffset,
  SIDEBAR_LEFT,
  SIDEBAR_COLLAPSED_W,
  SIDEBAR_EXPANDED_W,
  SIDEBAR_GAP,
} from "@/ui/stores/uiStore";

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
  { id: "home", label: "Home", icon: LayoutDashboard, path: "/" },
  { id: "squads", label: "Squads", icon: Users, path: "/squads" },
  { id: "projects", label: "Projects", icon: Briefcase, path: "/" },
  { id: "profile", label: "Profile", icon: User, path: "/profile" },
  { id: "settings", label: "Settings", icon: Settings, path: "/settings" },
];

const ACTIVE_LABEL: Record<string, string> = {
  home: "Home",
  squads: "Squads",
  projects: "Projects",
  profile: "Profile",
  settings: "Settings",
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

  const breadcrumbItems: BreadcrumbItem[] = breadcrumb ?? [{ label: ACTIVE_LABEL[activeTab] ?? "Dashboard" }];

  return (
    <>
      {/* ── Sidebar ── */}
      <motion.aside
        initial={{ width: sidebarWidth }}
        animate={{ width: sidebarWidth }}
        transition={SPRING}
        className="fixed left-6 top-6 bottom-6 z-40 rounded-[28px] border border-border/40 bg-card/35 backdrop-blur-2xl shadow-[0_20px_70px_-30px_hsl(var(--background)/0.95)] overflow-hidden flex flex-col"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_8%,hsl(var(--accent)/0.2),transparent_26%),linear-gradient(180deg,hsl(var(--background)/0.35),hsl(var(--background)/0.7))]" />

        {/* Logo row */}
        <div className={`relative z-10 px-4 py-5 flex items-center border-b border-border/30 shrink-0 min-h-[68px] ${sidebarCollapsed ? "justify-center" : "gap-3"}`}>
          <div className="h-9 w-9 rounded-xl bg-muted/40 border border-border/40 flex items-center justify-center shrink-0">
            <Shield className="h-4 w-4 text-foreground/90" />
          </div>
          <AnimatePresence initial={false}>
            {!sidebarCollapsed && (
              <motion.div
                key="logo-text"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.18 }}
                className="overflow-hidden flex-1 min-w-0"
              >
                <p className="text-[17px] font-semibold leading-none whitespace-nowrap">Perform</p>
                <p className="text-[10px] text-muted-foreground mt-1 whitespace-nowrap">AI-Powered Engineering</p>
              </motion.div>
            )}
          </AnimatePresence>
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
              className="relative z-10 overflow-hidden border-b border-border/30 shrink-0"
            >
              <div className="px-6 pt-6 pb-5">
                <p className="text-[38px] leading-[0.88] tracking-[-0.03em] font-light text-foreground">
                  Welcome
                  <br />
                  Back, {displayName.split(" ")[0] ?? "User"}
                </p>
                <p className="text-sm text-muted-foreground mt-3">
                  Last login: {new Date().toLocaleDateString()}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <nav className={`relative z-10 flex-1 overflow-y-auto py-4 space-y-0.5 ${sidebarCollapsed ? "px-2" : "px-4"}`} style={{ paddingBottom: "4.5rem" }}>
          {!sidebarCollapsed && (
            <p className="text-[10px] text-muted-foreground/50 px-2 pb-2 font-semibold uppercase tracking-widest">
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
                className={`relative w-full flex items-center ${
                  sidebarCollapsed ? "justify-center py-2.5 px-0" : "justify-between px-3 py-2.5"
                } rounded-xl transition-colors ${
                  isActive
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/20"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active-bg"
                    className="absolute inset-0 rounded-xl border border-border/60 bg-gradient-to-r from-muted/40 via-muted/25 to-transparent"
                    transition={{ type: "spring", stiffness: 360, damping: 30 }}
                  />
                )}
                <div className="relative z-10 flex items-center gap-3">
                  <Icon className="h-4 w-4 shrink-0" />
                  {!sidebarCollapsed && (
                    <span className="text-[14px] font-medium">{item.label}</span>
                  )}
                </div>
                {!sidebarCollapsed && (
                  <div className="relative z-10 flex items-center gap-2">
                    {item.badge && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted/50 border border-border/40 text-muted-foreground">
                        {item.badge}
                      </span>
                    )}
                    {isActive && <div className="h-4 w-[2px] rounded-full bg-foreground/70" />}
                  </div>
                )}
              </button>
            );
          })}
        </nav>
        {/* ── Bottom toggle ── */}
        <div className={`relative z-10 absolute bottom-0 left-0 right-0 px-3 py-3 border-t border-border/25 bg-card/10 backdrop-blur-sm`}>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={toggleSidebar}
            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={`w-full flex items-center rounded-xl py-2 text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors ${sidebarCollapsed ? "justify-center px-0" : "gap-2.5 px-3"}`}
          >
            {sidebarCollapsed
              ? <ChevronRight className="h-4 w-4" />
              : (
                <>
                  <ChevronLeft className="h-4 w-4 shrink-0" />
                  <span className="text-[13px] font-medium">Collapse</span>
                </>
              )
            }
          </motion.button>
        </div>
      </motion.aside>

      {/* ── Top header ── */}
      <motion.header
        initial={{ left: headerLeft }}
        animate={{ left: headerLeft }}
        transition={SPRING}
        className="fixed right-6 top-6 z-50 overflow-hidden rounded-[24px] border border-border/40 bg-card/28 backdrop-blur-2xl shadow-[0_18px_60px_-32px_hsl(var(--background)/0.95)]"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-background/65 via-background/35 to-background/30" />

        {/* Window controls strip */}
        <div
          className="relative z-10 h-8 flex items-center justify-end px-2"
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
        <div className="relative z-10 h-[66px] px-6 flex items-center justify-between border-t border-border/25">
          {/* Breadcrumb — clickable */}
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-1.5 hover:text-foreground transition-colors rounded-md px-1.5 py-1 hover:bg-muted/20"
            >
              <Home className="h-3.5 w-3.5" />
              <span>Overview</span>
            </button>
            {breadcrumbItems.map((item, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <ChevronRight className="h-3 w-3 text-muted-foreground/40" />
                {item.path ? (
                  <button
                    onClick={() => navigate(item.path!)}
                    className="hover:text-foreground transition-colors font-medium rounded-md px-1.5 py-1 hover:bg-muted/20"
                  >
                    {item.label}
                  </button>
                ) : (
                  <span className="text-foreground font-medium px-1.5">{item.label}</span>
                )}
              </div>
            ))}
          </div>

          {/* Right: search + bell + user */}
          <div className="flex items-center gap-3" style={{ WebkitAppRegion: "no-drag" } as CSSProperties}>
            <div className="relative w-[260px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search..." className="h-10 rounded-xl pl-10 bg-background/45 border-border/40" />
            </div>

            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-muted/30">
              <Bell className="h-4 w-4" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2.5 pl-3 border-l border-border/35 hover:opacity-80 transition-opacity">
                  <Avatar className="h-9 w-9 ring-1 ring-border/60">
                    <AvatarImage src={user?.avatarUrl ?? undefined} />
                    <AvatarFallback>{avatarFallback}</AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                    <p className="text-sm font-semibold leading-none">{displayName}</p>
                    <p className="text-xs text-muted-foreground mt-1">{roleLabel}</p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem className="cursor-pointer" onClick={() => navigate("/profile")}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Edit Profile</span>
                </DropdownMenuItem>
                {displayEmail && (
                  <DropdownMenuItem className="cursor-default opacity-70">
                    <span className="text-xs truncate">{displayEmail}</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive" onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </motion.header>
    </>
  );
};
