import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Camera,
  Check,
  ExternalLink,
  Github,
  Loader2,
  LogOut,
  Mail,
  Pencil,
  ShieldCheck,
  Sparkles,
  Trash2,
  User as UserIcon,
} from "lucide-react";

import { DashboardHeader } from "@/ui/components/DashboardHeader";
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/components/ui/avatar";
import { Button } from "@/ui/components/ui/button";
import { Input } from "@/ui/components/ui/input";
import { Label } from "@/ui/components/ui/label";
import { useAuth } from "@/ui/contexts/AuthContext";
import { useDashboard } from "@/ui/contexts/DashboardContext";
import { apiService } from "@/ui/services/api.service";
import { useProgressToast } from "@/ui/hooks/useProgressToast";
import { useUIStore, getSidebarOffset } from "@/ui/stores/uiStore";
import { useIsMobile } from "@/ui/hooks/useIsMobile";
import { cn } from "@/ui/lib/utils";

const MAX_AVATAR_SIZE_BYTES = 2 * 1024 * 1024;

type ProfileFormState = {
  name: string;
  email: string;
  githubUsername: string;
};

const ROLE_LABEL: Record<string, string> = {
  admin: "Admin",
  tech_lead: "Tech Lead",
  developer: "Developer",
};

/**
 * Format a member-since string. Falls back to ISO date when the
 * relative duration becomes uninteresting (>= 1 year).
 */
function memberSinceLabel(iso: string): string {
  const created = new Date(iso).getTime();
  if (!created) return "Unknown";
  const days = Math.floor((Date.now() - created) / (24 * 60 * 60 * 1000));
  if (days < 1) return "Joined today";
  if (days === 1) return "Joined 1 day ago";
  if (days < 30) return `Joined ${days} days ago`;
  if (days < 60) return "Joined 1 month ago";
  if (days < 365) return `Joined ${Math.floor(days / 30)} months ago`;
  return `Joined ${new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    year: "numeric",
  })}`;
}

export default function Profile() {
  const [activeTab, setActiveTab] = useState("profile");
  const { user, token, updateAuthenticatedUser, logout } = useAuth();
  const { isGithubConnected, githubStats } = useDashboard();
  const toast = useProgressToast();
  const navigate = useNavigate();

  const { sidebarCollapsed } = useUIStore();
  const isMobile = useIsMobile();
  const contentLeft = getSidebarOffset(sidebarCollapsed, isMobile);

  const [form, setForm] = useState<ProfileFormState>({
    name: "",
    email: "",
    githubUsername: "",
  });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarPayload, setAvatarPayload] = useState<string | undefined>(undefined);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    setForm({
      name: user.name ?? "",
      email: user.email ?? "",
      githubUsername: user.githubUsername ?? "",
    });
    setAvatarPreview(user.avatarUrl ?? null);
    setAvatarPayload(undefined);
  }, [user]);

  const hasChanges = useMemo(() => {
    if (!user) return false;
    return (
      form.name.trim() !== (user.name ?? "") ||
      form.email.trim().toLowerCase() !== (user.email ?? "").toLowerCase() ||
      form.githubUsername.trim() !== (user.githubUsername ?? "") ||
      avatarPayload !== undefined
    );
  }, [form, avatarPayload, user]);

  const handleInputChange =
    (field: keyof ProfileFormState) => (event: ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const handleAvatarUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.showError("Invalid file", "Please choose an image file.");
      return;
    }
    if (file.size > MAX_AVATAR_SIZE_BYTES) {
      toast.showError("Image too large", "Choose an image up to 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const value = typeof reader.result === "string" ? reader.result : null;
      if (!value) return;
      setAvatarPreview(value);
      setAvatarPayload(value);
    };
    reader.onerror = () =>
      toast.showError("Failed to read image", "Try another image.");
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const handleRemoveAvatar = () => {
    setAvatarPreview(null);
    setAvatarPayload("");
  };

  const handleSave = async () => {
    if (!token || !user || isSaving || !hasChanges) return;
    const toastId = toast.showLoading("Saving profile…", "Updating your account");
    setIsSaving(true);
    try {
      const updatedProfile = await apiService.updateProfile(token, {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        githubUsername: form.githubUsername.trim(),
        ...(avatarPayload !== undefined ? { avatarUrl: avatarPayload } : {}),
      });
      updateAuthenticatedUser(updatedProfile);
      setAvatarPayload(undefined);
      toast.completeWithSuccess(
        toastId,
        "Profile updated",
        "Your information has been saved.",
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to save profile";
      toast.completeWithError(toastId, "Update failed", message);
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background relative overflow-hidden">
        <DashboardHeader activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    );
  }

  const roleLabel = ROLE_LABEL[user.role] ?? user.role;
  const initials =
    user.name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? "")
      .join("") || "U";

  return (
    <div className="min-h-screen bg-background relative overflow-hidden text-foreground">
      {/* Backdrop wash — same vocabulary as Dashboard */}
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
        className="relative z-10 pr-6 md:pr-10 pt-[148px] pb-12 transition-[padding-left] duration-300"
        style={{ paddingLeft: contentLeft + 16 }}
      >
        <div className="max-w-5xl mx-auto space-y-5">
          {/* ── Page heading ── */}
          <div className="px-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/60">
              Account
            </p>
            <h1 className="mt-2 font-display text-[32px] font-light leading-none tracking-[-0.025em]">
              <span className="artemis-text-lunar">Your profile.</span>
            </h1>
            <p className="mt-2 text-sm text-muted-foreground max-w-xl">
              How you appear across Artemis dashboards, reports and team views.
            </p>
          </div>

          {/* ── Hero card: avatar + identity + (optional) stats ── */}
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="artemis-panel relative overflow-hidden rounded-[28px]"
          >
            {/* Aurora glow inside the panel — pure decoration */}
            <div
              aria-hidden
              className="pointer-events-none absolute -top-32 -right-24 w-[420px] h-[420px] rounded-full opacity-50 blur-3xl"
              style={{
                background:
                  "radial-gradient(circle, hsl(262 95% 65% / 0.18) 0%, transparent 70%)",
              }}
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent"
            />

            <div className="relative p-7 md:p-9 grid grid-cols-1 md:grid-cols-[auto_1fr] gap-7 items-center">
              {/* Avatar + neon ring + edit controls */}
              <div className="relative flex flex-col items-center md:items-start">
                <div className="relative">
                  {/* Aurora ring */}
                  <div
                    aria-hidden
                    className="absolute -inset-2 rounded-full bg-aurora-gradient opacity-50 blur-md"
                  />
                  <Avatar className="relative h-32 w-32 ring-2 ring-background shadow-[0_18px_40px_-12px_hsl(232_60%_2%/0.7)]">
                    <AvatarImage src={avatarPreview ?? undefined} alt={user.name} />
                    <AvatarFallback className="text-3xl font-display font-light">
                      {initials}
                    </AvatarFallback>
                  </Avatar>

                  {/* Camera shortcut overlay */}
                  <Label
                    htmlFor="avatar-upload"
                    className="absolute -bottom-1 -right-1 h-9 w-9 rounded-xl bg-card/85 backdrop-blur-md border border-border/60 flex items-center justify-center cursor-pointer transition-all hover:bg-primary/15 hover:border-primary/45 hover:text-primary"
                    title="Upload new image"
                  >
                    <Camera className="h-4 w-4" />
                  </Label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                  />
                </div>

                {avatarPreview && (
                  <button
                    onClick={handleRemoveAvatar}
                    className="mt-3 inline-flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="h-3 w-3" />
                    Remove image
                  </button>
                )}
              </div>

              {/* Identity */}
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="font-display text-[36px] font-light leading-none tracking-[-0.025em]">
                    {user.name}
                  </h2>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/35 bg-primary/8 px-2.5 py-0.5 text-[11px] font-medium text-primary">
                    <ShieldCheck className="h-3 w-3" />
                    {roleLabel}
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[13px] text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground/60" />
                    <span>{user.email}</span>
                  </div>
                  {user.githubUsername && (
                    <div className="flex items-center gap-1.5">
                      <Github className="h-3.5 w-3.5 text-muted-foreground/60" />
                      <span>@{user.githubUsername}</span>
                    </div>
                  )}
                  <span className="text-muted-foreground/45">·</span>
                  <span>{memberSinceLabel(user.createdAt)}</span>
                </div>

                {/* Stats strip — only when connected (real data) */}
                {isGithubConnected && githubStats && (
                  <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-2 max-w-xl">
                    <ProfileStat
                      label="Commits"
                      value={githubStats.commits.thisWeek}
                      hint="this week"
                    />
                    <ProfileStat
                      label="Open PRs"
                      value={githubStats.pullRequests.open}
                      hint="across team"
                    />
                    <ProfileStat
                      label="Reviews"
                      value={githubStats.reviews.approved}
                      hint="approved"
                    />
                    <ProfileStat
                      label="Awaiting"
                      value={githubStats.pullRequests.awaitingReview}
                      hint="needs review"
                    />
                  </div>
                )}
              </div>
            </div>
          </motion.section>

          {/* ── Body grid: editable form (lg) + sidebar (sm) ── */}
          <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-5">
            {/* Editable form */}
            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="artemis-panel rounded-[24px] p-7"
            >
              <div className="flex items-center gap-2.5 mb-5">
                <div className="h-9 w-9 rounded-xl bg-primary/12 border border-primary/30 flex items-center justify-center text-primary">
                  <Pencil className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-[15px] font-semibold leading-none">Identity</h3>
                  <p className="text-xs text-muted-foreground/70 mt-1">
                    These details identify you in dashboards and reports.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <FieldRow label="Display name" htmlFor="profile-name">
                  <div className="relative">
                    <UserIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/55" />
                    <Input
                      id="profile-name"
                      value={form.name}
                      onChange={handleInputChange("name")}
                      placeholder="Your name"
                      className="pl-10"
                    />
                  </div>
                </FieldRow>

                <FieldRow label="Email" htmlFor="profile-email">
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/55" />
                    <Input
                      id="profile-email"
                      type="email"
                      value={form.email}
                      onChange={handleInputChange("email")}
                      placeholder="you@company.com"
                      className="pl-10"
                    />
                  </div>
                </FieldRow>

                <FieldRow
                  label="GitHub handle"
                  htmlFor="profile-github"
                  hint={
                    isGithubConnected
                      ? undefined
                      : "Tip: connect GitHub in Settings to enable analytics."
                  }
                >
                  <div className="relative">
                    <Github className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/55" />
                    <Input
                      id="profile-github"
                      value={form.githubUsername}
                      onChange={handleInputChange("githubUsername")}
                      placeholder="github handle"
                      className="pl-10"
                    />
                  </div>
                </FieldRow>
              </div>

              {/* Footer actions */}
              <div className="mt-6 pt-5 border-t border-border/40 flex items-center justify-between gap-3">
                <p className="text-[11px] text-muted-foreground/65 font-mono">
                  Last updated {new Date(user.updatedAt).toLocaleDateString()} ·{" "}
                  {new Date(user.updatedAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
                <Button
                  onClick={handleSave}
                  disabled={isSaving || !hasChanges}
                  size="default"
                  className="min-w-[160px]"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving…
                    </>
                  ) : hasChanges ? (
                    <>
                      <Check className="h-4 w-4" />
                      Save changes
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      No changes
                    </>
                  )}
                </Button>
              </div>
            </motion.section>

            {/* Sidebar — integrations + danger zone */}
            <div className="space-y-5">
              {/* GitHub status card */}
              <motion.section
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className={cn(
                  "artemis-panel rounded-[24px] p-6 relative overflow-hidden",
                  isGithubConnected ? "" : "border-amber-500/25",
                )}
              >
                {/* Decorative bloom in corner */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute -top-16 -right-16 w-40 h-40 rounded-full opacity-40 blur-2xl"
                  style={{
                    background: isGithubConnected
                      ? "radial-gradient(circle, hsl(152 72% 50% / 0.20) 0%, transparent 70%)"
                      : "radial-gradient(circle, hsl(40 95% 65% / 0.20) 0%, transparent 70%)",
                  }}
                />

                <div className="relative">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="h-9 w-9 rounded-xl bg-card/60 border border-border/50 flex items-center justify-center">
                        <Github className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-[14px] font-semibold leading-none">
                          GitHub
                        </p>
                        <p className="mt-1 text-[11px] text-muted-foreground/70">
                          Source of truth for engineering data
                        </p>
                      </div>
                    </div>

                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                        isGithubConnected
                          ? "bg-success/15 text-success border border-success/30"
                          : "bg-amber-500/15 text-amber-400 border border-amber-500/30",
                      )}
                    >
                      <span
                        className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          isGithubConnected ? "bg-success" : "bg-amber-400",
                        )}
                      />
                      {isGithubConnected ? "Connected" : "Not linked"}
                    </span>
                  </div>

                  <p className="mt-4 text-[13px] leading-relaxed text-muted-foreground">
                    {isGithubConnected
                      ? "Velocity and team analytics are pulling from your linked repositories."
                      : "Connect your GitHub account to unlock velocity, PR and review analytics."}
                  </p>

                  <Button
                    variant="secondary"
                    size="sm"
                    className="mt-4 w-full"
                    onClick={() => navigate("/settings")}
                  >
                    {isGithubConnected ? "Manage integration" : "Connect GitHub"}
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </motion.section>

              {/* Account meta + sign out */}
              <motion.section
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 }}
                className="artemis-panel rounded-[24px] p-6"
              >
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="h-9 w-9 rounded-xl bg-card/60 border border-border/50 flex items-center justify-center">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <p className="text-[14px] font-semibold leading-none">
                    Account
                  </p>
                </div>

                <dl className="space-y-3 text-[12.5px]">
                  <MetaRow
                    label="User ID"
                    value={
                      <span className="font-mono text-[11px]">
                        {user.id.slice(0, 8)}…{user.id.slice(-4)}
                      </span>
                    }
                  />
                  <MetaRow
                    label="Status"
                    value={
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                          user.active
                            ? "bg-success/15 text-success"
                            : "bg-muted/40 text-muted-foreground",
                        )}
                      >
                        {user.active ? "Active" : "Inactive"}
                      </span>
                    }
                  />
                  <MetaRow
                    label="Member since"
                    value={
                      <span className="text-foreground/85">
                        {new Date(user.createdAt).toLocaleDateString(undefined, {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    }
                  />
                </dl>

                <div className="mt-5 pt-4 border-t border-border/40">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive justify-center"
                    onClick={logout}
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </Button>
                </div>
              </motion.section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

/* ─────────────────── small presentational helpers ─────────────────── */

interface ProfileStatProps {
  label: string;
  value: number;
  hint?: string;
}

const ProfileStat = ({ label, value, hint }: ProfileStatProps) => (
  <div className="rounded-xl border border-border/40 bg-card/30 backdrop-blur-md px-3 py-2.5">
    <dt className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground/65">
      {label}
    </dt>
    <dd className="mt-0.5 flex items-baseline gap-1.5">
      <span className="font-display text-[20px] font-light tabular-nums text-foreground leading-none">
        {value}
      </span>
      {hint && (
        <span className="text-[10px] text-muted-foreground/55">{hint}</span>
      )}
    </dd>
  </div>
);

interface FieldRowProps {
  label: string;
  htmlFor: string;
  hint?: string;
  children: React.ReactNode;
}

const FieldRow = ({ label, htmlFor, hint, children }: FieldRowProps) => (
  <div className="space-y-1.5">
    <Label
      htmlFor={htmlFor}
      className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground/75"
    >
      {label}
    </Label>
    {children}
    {hint && (
      <p className="text-[11px] text-muted-foreground/60 mt-1.5">{hint}</p>
    )}
  </div>
);

interface MetaRowProps {
  label: string;
  value: React.ReactNode;
}

const MetaRow = ({ label, value }: MetaRowProps) => (
  <div className="flex items-center justify-between">
    <dt className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground/65">
      {label}
    </dt>
    <dd>{value}</dd>
  </div>
);
