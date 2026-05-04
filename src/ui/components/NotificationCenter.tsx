import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  AlertTriangle,
  CheckCircle2,
  Info,
  Loader2,
  X,
  ArrowRight,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/ui/components/ui/popover";
import { Button } from "@/ui/components/ui/button";
import {
  useNotificationStore,
  type AppNotification,
} from "@/ui/stores/notificationStore";
import { cn } from "@/ui/lib/utils";

/** "12s ago" / "5m ago" / "2h ago" / "Mar 4" — relative time, capped */
function formatRelative(iso: string, now: number) {
  const diff = now - new Date(iso).getTime();
  if (diff < 0) return "just now";
  const sec = Math.floor(diff / 1000);
  if (sec < 30) return "just now";
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d ago`;
  return new Date(iso).toLocaleDateString();
}

const STATUS_META: Record<
  AppNotification["status"],
  {
    icon: typeof Info;
    iconClass: string;
    accentClass: string;
  }
> = {
  in_progress: {
    icon: Loader2,
    iconClass: "text-primary animate-spin",
    accentClass: "border-primary/30 bg-primary/5",
  },
  success: {
    icon: CheckCircle2,
    iconClass: "text-success",
    accentClass: "border-success/25 bg-success/5",
  },
  error: {
    icon: AlertTriangle,
    iconClass: "text-destructive",
    accentClass: "border-destructive/30 bg-destructive/5",
  },
  info: {
    icon: Info,
    iconClass: "text-muted-foreground",
    accentClass: "border-border/40 bg-card/40",
  },
};

interface NotificationItemProps {
  notification: AppNotification;
  onAction: (n: AppNotification) => void;
  onDismiss: (id: string) => void;
  now: number;
}

const NotificationItem = ({
  notification: n,
  onAction,
  onDismiss,
  now,
}: NotificationItemProps) => {
  const meta = STATUS_META[n.status];
  const Icon = meta.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
      transition={{ duration: 0.22 }}
      className={cn(
        "group relative rounded-xl border px-3.5 py-3 transition-colors",
        meta.accentClass,
      )}
    >
      <div className="flex items-start gap-3">
        <Icon className={cn("h-4 w-4 mt-0.5 shrink-0", meta.iconClass)} />
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-2">
            <p className="text-[13px] font-medium leading-tight text-foreground">
              {n.title}
            </p>
            <span className="text-[10px] font-mono text-muted-foreground/60 shrink-0">
              {formatRelative(n.createdAt, now)}
            </span>
          </div>
          {n.description && (
            <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground/85">
              {n.description}
            </p>
          )}

          {/* Progress bar — only while in_progress */}
          {n.status === "in_progress" && (
            <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-muted/40">
              <motion.div
                className="h-full bg-gradient-to-r from-secondary via-primary to-accent"
                initial={false}
                animate={{ width: `${Math.max(2, Math.min(100, n.progress ?? 0))}%` }}
                transition={{ type: "spring", stiffness: 120, damping: 22 }}
              />
            </div>
          )}

          {/* Action button — when present */}
          {n.action && (
            <button
              onClick={() => onAction(n)}
              className="mt-2.5 inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:text-primary/80 transition-colors"
            >
              {n.action.label}
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
            </button>
          )}
        </div>

        {/* Dismiss — only on hover, terminal states only */}
        {n.status !== "in_progress" && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDismiss(n.id);
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground/50 hover:text-foreground shrink-0 -mr-1"
            title="Dismiss"
            aria-label="Dismiss notification"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </motion.div>
  );
};

export const NotificationCenter = () => {
  const navigate = useNavigate();
  const notifications = useNotificationStore((s) => s.notifications);
  const isOpen = useNotificationStore((s) => s.isOpen);
  const setOpen = useNotificationStore((s) => s.setOpen);
  const remove = useNotificationStore((s) => s.remove);
  const clearAll = useNotificationStore((s) => s.clearAll);

  // Re-derive "N min ago" labels every 30s while the panel is open
  const now = useNow(isOpen ? 30_000 : null);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications],
  );
  const activeCount = useMemo(
    () => notifications.filter((n) => n.status === "in_progress").length,
    [notifications],
  );

  const handleAction = (n: AppNotification) => {
    if (n.action?.href) navigate(n.action.href);
    n.action?.onClick?.();
    setOpen(false);
  };

  const badge = activeCount > 0 ? activeCount : unreadCount;

  return (
    <Popover open={isOpen} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="relative h-10 w-10 rounded-xl flex items-center justify-center text-foreground hover:bg-muted/30 transition-colors"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          {badge > 0 && (
            <span
              className={cn(
                "absolute top-1.5 right-1.5 min-w-[16px] h-[16px] rounded-full px-1 text-[9px] font-bold flex items-center justify-center text-white shadow-[0_0_10px_hsl(258_92%_70%/0.55)]",
                activeCount > 0
                  ? "bg-aurora-gradient"
                  : "bg-destructive",
              )}
            >
              {badge > 9 ? "9+" : badge}
            </span>
          )}
          {/* Pulsing dot when there's an active sync */}
          {activeCount > 0 && (
            <span className="absolute top-1.5 right-1.5 h-[16px] w-[16px] rounded-full bg-primary/40 animate-ping" />
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={10}
        className="w-[380px] p-0 overflow-hidden border-border/55 bg-card/85 backdrop-blur-2xl shadow-orbit"
      >
        {/* Top hairline aurora highlight */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
        />

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/40">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold tracking-tight">Notifications</p>
            {notifications.length > 0 && (
              <span className="rounded-full border border-border/50 bg-muted/30 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                {notifications.length}
              </span>
            )}
          </div>
          {notifications.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-[11px] text-muted-foreground hover:text-foreground"
              onClick={clearAll}
            >
              Clear all
            </Button>
          )}
        </div>

        {/* Body */}
        <div className="max-h-[480px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="py-14 px-6 flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-2xl bg-muted/20 border border-border/30 flex items-center justify-center mb-3">
                <Bell className="h-5 w-5 text-muted-foreground/40" />
              </div>
              <p className="text-sm font-medium text-foreground">All quiet</p>
              <p className="mt-1 text-xs text-muted-foreground/70 max-w-[260px] leading-relaxed">
                Sync events, errors and system messages will appear here.
              </p>
            </div>
          ) : (
            <div className="p-2 space-y-1.5">
              <AnimatePresence mode="popLayout">
                {notifications.map((n) => (
                  <NotificationItem
                    key={n.id}
                    notification={n}
                    onAction={handleAction}
                    onDismiss={remove}
                    now={now}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

/**
 * Returns Date.now() and re-renders every `interval` ms. Pass `null` to pause.
 * Used by the notification center to keep "Nm ago" labels fresh while open.
 */
function useNow(interval: number | null) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (interval == null) return;
    const id = setInterval(() => setNow(Date.now()), interval);
    return () => clearInterval(id);
  }, [interval]);
  return now;
}
