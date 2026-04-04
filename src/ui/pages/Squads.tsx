import { useState, useEffect, type MouseEvent, type ChangeEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardHeader } from "@/ui/components/DashboardHeader";
import { useDashboard } from "@/ui/contexts/DashboardContext";
import { useAuth } from "@/ui/contexts/AuthContext";
import { apiService } from "@/ui/services/api.service";
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/components/ui/avatar";
import { Plus, Trash2, Users, Check, X, UserPlus, Search, Shield, ChevronRight, GitCommit, GitPullRequest, GitMerge, Eye } from "lucide-react";
import { Input } from "@/ui/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useUIStore, getSidebarOffset } from "@/ui/stores/uiStore";

interface Squad {
  id: string;
  name: string;
  members: string[];
}

interface SquadApiDeveloper {
  id: string;
}

interface SquadApiResponse {
  id: string;
  name: string;
  developers?: SquadApiDeveloper[];
}

interface DevPreview {
  id: string;
  name: string;
  avatarUrl?: string;
  githubUsername?: string;
}

interface DeveloperDirectoryItemProps {
  dev: DevPreview;
  isAssigned: boolean;
  index: number;
  onToggle: () => void;
}

const DeveloperDirectoryItem = ({ dev, isAssigned, index, onToggle }: DeveloperDirectoryItemProps) => (
  <motion.button
    initial={{ opacity: 0, y: 6 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.02 }}
    onClick={onToggle}
    className={`w-full flex items-center gap-3 px-2 py-2.5 rounded-lg text-sm transition-all group ${
      isAssigned ? "hover:bg-destructive/8" : "hover:bg-muted/40"
    }`}
  >
    <Avatar className="h-7 w-7 shrink-0">
      <AvatarImage
        src={
          dev.avatarUrl ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(dev.name)}&background=random&size=56`
        }
      />
      <AvatarFallback className="text-xs">{dev.name.charAt(0)}</AvatarFallback>
    </Avatar>
    <div className="flex-1 min-w-0 text-left">
      <p className="text-sm font-medium text-foreground truncate leading-none">{dev.name}</p>
      {dev.githubUsername && (
        <p className="text-[11px] text-muted-foreground/60 mt-0.5 truncate">@{dev.githubUsername}</p>
      )}
    </div>
    <div
      className={`h-6 w-6 rounded-md flex items-center justify-center shrink-0 transition-all ${
        isAssigned
          ? "bg-primary/15 text-primary group-hover:bg-destructive/15 group-hover:text-destructive"
          : "bg-muted/50 text-muted-foreground group-hover:bg-primary/15 group-hover:text-primary"
      }`}
    >
      {isAssigned ? (
        <>
          <Check className="h-3.5 w-3.5 group-hover:hidden" />
          <X className="h-3 w-3 hidden group-hover:block" />
        </>
      ) : (
        <Plus className="h-3.5 w-3.5" />
      )}
    </div>
  </motion.button>
);

const Squads = () => {
  const [activeTab, setActiveTab] = useState("squads");
  const { githubDevelopers } = useDashboard();
  const { token } = useAuth();
  const navigate = useNavigate();

  const { sidebarCollapsed } = useUIStore();
  const contentLeft = getSidebarOffset(sidebarCollapsed);

  const [squads, setSquads] = useState<Squad[]>([]);
  const [selectedSquadId, setSelectedSquadId] = useState<string | null>(null);
  const [isCreatingSquad, setIsCreatingSquad] = useState(false);
  const [newSquadName, setNewSquadName] = useState("");
  const [isAssigning, setIsAssigning] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchSquads = async () => {
      if (!token) return;
      try {
        const data = await apiService.getSquads(token);
        const formattedSquads = data.map((s: SquadApiResponse) => ({
          id: s.id,
          name: s.name,
          members: s.developers ? s.developers.map((d: SquadApiDeveloper) => d.id) : [],
        }));
        setSquads(formattedSquads);
        if (formattedSquads.length > 0) {
          setSelectedSquadId((currentId) => {
            if (currentId && formattedSquads.some((squad: Squad) => squad.id === currentId)) {
              return currentId;
            }
            return formattedSquads[0].id;
          });
        }
      } catch (error) {
        console.error("Failed to fetch squads:", error);
      }
    };
    fetchSquads();
  }, [token]);

  const selectedSquad = squads.find((squad) => squad.id === selectedSquadId);

  const handleCreateSquad = async () => {
    if (newSquadName.trim() && token) {
      try {
        const newSquad = await apiService.createSquad(token, newSquadName.trim());
        const formattedSquad = { id: newSquad.id, name: newSquad.name, members: [] };
        setSquads([...squads, formattedSquad]);
        setNewSquadName("");
        setIsCreatingSquad(false);
        setSelectedSquadId(formattedSquad.id);
      } catch (error) {
        console.error("Failed to create squad:", error);
      }
    }
  };

  const handleDeleteSquad = async (id: string) => {
    if (!token) return;
    try {
      await apiService.deleteSquad(token, id);
      setSquads(squads.filter((squad) => squad.id !== id));
      if (selectedSquadId === id) setSelectedSquadId(null);
      setIsAssigning(false);
    } catch (error) {
      console.error("Failed to delete squad:", error);
    }
  };

  const handleToggleMember = async (devId: string) => {
    if (!selectedSquad || !token) return;
    const isMember = selectedSquad.members.includes(devId);
    const newSquadId = isMember ? null : selectedSquad.id;
    try {
      await apiService.updateDeveloperSquad(token, devId, newSquadId);
      setSquads(
        squads.map((squad) => {
          if (squad.id !== selectedSquad.id) return squad;
          return {
            ...squad,
            members: isMember
              ? squad.members.filter((memberId) => memberId !== devId)
              : [...squad.members, devId],
          };
        })
      );
    } catch (error) {
      console.error("Failed to update developer squad:", error);
    }
  };

  const getDevById = (id: string) => githubDevelopers.find((d) => d.id === id);

  const filteredDevelopers = githubDevelopers.filter(
    (dev) =>
      dev.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (dev.githubUsername && dev.githubUsername.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const inSquad = filteredDevelopers.filter(
    (dev) => selectedSquad?.members.includes(dev.id)
  );
  const available = filteredDevelopers.filter(
    (dev) => !selectedSquad?.members.includes(dev.id)
  );

  const squadStats = selectedSquad
    ? selectedSquad.members.reduce(
        (acc, memberId) => {
          const dev = githubDevelopers.find((d) => d.id === memberId);
          if (!dev) return acc;
          return {
            commits: acc.commits + (dev.stats.commits ?? 0),
            pullRequests: acc.pullRequests + (dev.stats.pullRequests ?? 0),
            reviews: acc.reviews + (dev.stats.reviews ?? 0),
            mergedPRs: acc.mergedPRs + (dev.stats.mergedPRs ?? 0),
          };
        },
        { commits: 0, pullRequests: 0, reviews: 0, mergedPRs: 0 }
      )
    : null;

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_14%,hsl(var(--accent)/0.14),transparent_40%),radial-gradient(circle_at_88%_8%,hsl(var(--primary)/0.1),transparent_40%),radial-gradient(circle_at_42%_88%,hsl(var(--secondary)/0.12),transparent_42%)]" />
      <DashboardHeader activeTab={activeTab} onTabChange={setActiveTab} />

      <main
        className="flex-1 flex overflow-hidden pr-6 md:pr-10 pt-[122px] pb-8 relative z-10 gap-4 transition-[padding-left] duration-300"
        style={{ paddingLeft: contentLeft + 16 }}
      >
        {/* ─── Sidebar ─── */}
        <div className="w-[264px] shrink-0 flex flex-col gap-3">
          {/* Label + new squad button */}
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-widest">
              Squads
            </span>
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.93 }}
              onClick={() => setIsCreatingSquad(true)}
              className="h-6 w-6 rounded-md bg-primary/10 hover:bg-primary/20 text-primary flex items-center justify-center transition-colors"
            >
              <Plus className="h-3 w-3" />
            </motion.button>
          </div>

          {/* Inline create input */}
          <AnimatePresence>
            {isCreatingSquad && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -8 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0, y: -8 }}
                className="overflow-hidden"
              >
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-card/60 border border-primary/30 backdrop-blur-xl shadow-sm">
                  <Shield className="h-3 w-3 text-primary/60 shrink-0" />
                  <input
                    autoFocus
                    type="text"
                    value={newSquadName}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setNewSquadName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleCreateSquad();
                      if (e.key === "Escape") setIsCreatingSquad(false);
                    }}
                    placeholder="Squad name..."
                    className="bg-transparent border-none outline-none text-sm w-full text-foreground placeholder:text-muted-foreground/40"
                  />
                  <button
                    onClick={handleCreateSquad}
                    className="text-primary hover:text-primary/70 transition-colors"
                  >
                    <Check className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => { setIsCreatingSquad(false); setNewSquadName(""); }}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* List */}
          <div className="flex-1 overflow-y-auto space-y-0.5 scrollbar-thin scrollbar-thumb-border/40 scrollbar-track-transparent">
            {squads.map((squad) => {
              const isSelected = selectedSquadId === squad.id;
              const previewDevs = squad.members
                .slice(0, 4)
                .map(getDevById)
                .filter(Boolean) as DevPreview[];

              return (
                <button
                  key={squad.id}
                  onClick={() => {
                    setSelectedSquadId(squad.id);
                    setIsAssigning(false);
                  }}
                  className={`relative w-full text-left px-3 py-2.5 rounded-xl transition-all group ${
                    isSelected ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {isSelected && (
                    <motion.div
                      layoutId="squad-active-bg"
                      className="absolute inset-0 rounded-xl bg-card/60 border border-border/50 backdrop-blur-xl shadow-sm"
                      transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                    />
                  )}

                  <div className="relative z-10 flex items-center gap-2.5">
                    {/* Icon */}
                    <div
                      className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? "bg-primary/15 text-primary"
                          : "bg-muted/40 group-hover:bg-muted/70 text-muted-foreground/70"
                      }`}
                    >
                      <Shield className="h-3.5 w-3.5" />
                    </div>

                    {/* Name + count */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium truncate leading-none mb-0.5">
                        {squad.name}
                      </p>
                      <p className="text-[11px] text-muted-foreground/50">
                        {squad.members.length} {squad.members.length === 1 ? "member" : "members"}
                      </p>
                    </div>

                    {/* Stacked avatar preview */}
                    {previewDevs.length > 0 && (
                      <div className="flex items-center -space-x-1.5 shrink-0">
                        {previewDevs.slice(0, 3).map((dev) => (
                          <Avatar key={dev.id} className="h-4.5 w-4.5 ring-1 ring-background" style={{ height: 18, width: 18 }}>
                            <AvatarImage
                              src={
                                dev.avatarUrl ||
                                `https://ui-avatars.com/api/?name=${encodeURIComponent(dev.name)}&background=random&size=36`
                              }
                            />
                            <AvatarFallback className="text-[8px]">{dev.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                        ))}
                        {squad.members.length > 3 && (
                          <div
                            className="rounded-full bg-muted/80 ring-1 ring-background flex items-center justify-center"
                            style={{ height: 18, width: 18 }}
                          >
                            <span className="text-[7px] font-semibold text-muted-foreground">
                              +{squad.members.length - 3}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}

            {squads.length === 0 && !isCreatingSquad && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-12 px-4 text-center"
              >
                <div className="h-12 w-12 rounded-2xl bg-muted/20 border border-border/30 flex items-center justify-center mx-auto mb-3">
                  <Shield className="h-5 w-5 text-muted-foreground/25" />
                </div>
                <p className="text-xs text-muted-foreground/50 leading-relaxed mb-3">
                  No squads yet.
                  <br />
                  Create one to get started.
                </p>
                <button
                  onClick={() => setIsCreatingSquad(true)}
                  className="text-xs text-primary hover:text-primary/70 flex items-center gap-1 mx-auto transition-colors"
                >
                  <Plus className="h-3 w-3" /> New Squad
                </button>
              </motion.div>
            )}
          </div>
        </div>

        {/* ─── Main content ─── */}
        <div className="flex-1 min-w-0 overflow-hidden rounded-2xl border border-border/40 bg-card/30 backdrop-blur-2xl flex flex-col">
          <AnimatePresence mode="wait">
            {selectedSquad ? (
              <motion.div
                key={selectedSquad.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="h-full flex flex-col"
              >
                {/* ── Hero header ── */}
                <div className="relative border-b border-border/40 overflow-hidden">
                  {/* Decorative blurred avatar blobs */}
                  <div className="absolute inset-0 pointer-events-none">
                    {selectedSquad.members.slice(0, 5).map((memberId, i) => {
                      const dev = getDevById(memberId);
                      if (!dev?.avatarUrl) return null;
                      return (
                        <div
                          key={memberId}
                          className="absolute blur-3xl rounded-full overflow-hidden opacity-[0.06]"
                          style={{
                            width: 180,
                            height: 180,
                            top: `${-30 + (i % 2) * 50}%`,
                            right: `${2 + i * 10}%`,
                          }}
                        >
                          <img src={dev.avatarUrl} className="w-full h-full object-cover" alt="" />
                        </div>
                      );
                    })}
                  </div>

                  <div className="relative z-10 px-8 pt-7 pb-6 flex items-start justify-between gap-6">
                    <div>
                      {/* Chip */}
                      <div className="flex items-center gap-1.5 mb-2">
                        <div className="h-5 w-5 rounded-md bg-primary/12 flex items-center justify-center">
                          <Shield className="h-3 w-3 text-primary" />
                        </div>
                        <span className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-widest">
                          Squad
                        </span>
                      </div>

                      {/* Name */}
                      <h1 className="text-[28px] font-semibold tracking-tight text-foreground leading-none">
                        {selectedSquad.name}
                      </h1>

                      {/* Member stack + count */}
                      <div className="flex items-center gap-3 mt-3.5">
                        {selectedSquad.members.length > 0 && (
                          <div className="flex items-center -space-x-2">
                            {selectedSquad.members.slice(0, 6).map((memberId) => {
                              const dev = getDevById(memberId);
                              if (!dev) return null;
                              return (
                                <Avatar key={memberId} className="ring-2 ring-card" style={{ height: 26, width: 26 }}>
                                  <AvatarImage
                                    src={
                                      dev.avatarUrl ||
                                      `https://ui-avatars.com/api/?name=${encodeURIComponent(dev.name)}&background=random&size=52`
                                    }
                                  />
                                  <AvatarFallback className="text-[10px]">{dev.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                              );
                            })}
                            {selectedSquad.members.length > 6 && (
                              <div
                                className="rounded-full bg-muted border-2 border-card flex items-center justify-center"
                                style={{ height: 26, width: 26 }}
                              >
                                <span className="text-[9px] font-semibold text-muted-foreground">
                                  +{selectedSquad.members.length - 6}
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                        <span className="text-sm text-muted-foreground">
                          {selectedSquad.members.length === 0
                            ? "No members yet"
                            : `${selectedSquad.members.length} ${selectedSquad.members.length === 1 ? "member" : "members"}`}
                        </span>
                      </div>
                    </div>

                    {/* Aggregate stats strip */}
                    {squadStats && selectedSquad.members.length > 0 && (
                      <div className="flex items-center gap-3 mt-4 flex-wrap">
                        {[
                          { icon: <GitCommit className="h-3 w-3" />, label: "Commits", value: squadStats.commits },
                          { icon: <GitPullRequest className="h-3 w-3" />, label: "PRs", value: squadStats.pullRequests },
                          { icon: <Eye className="h-3 w-3" />, label: "Reviews", value: squadStats.reviews },
                          { icon: <GitMerge className="h-3 w-3" />, label: "Merged", value: squadStats.mergedPRs },
                        ].map((stat) => (
                          <div
                            key={stat.label}
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted/20 border border-border/30 text-muted-foreground"
                          >
                            {stat.icon}
                            <span className="text-[11px] font-semibold text-foreground tabular-nums">{stat.value}</span>
                            <span className="text-[10px] font-medium opacity-60">{stat.label}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 shrink-0 pb-0.5">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setIsAssigning(!isAssigning)}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-2 ${
                          isAssigning
                            ? "bg-muted text-foreground border border-border/60"
                            : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
                        }`}
                      >
                        {isAssigning ? (
                          <>
                            <Check className="h-3.5 w-3.5" /> Done
                          </>
                        ) : (
                          <>
                            <UserPlus className="h-3.5 w-3.5" /> Manage Members
                          </>
                        )}
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDeleteSquad(selectedSquad.id)}
                        className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors border border-transparent hover:border-destructive/20"
                        title="Delete Squad"
                      >
                        <Trash2 className="h-4 w-4" />
                      </motion.button>
                    </div>
                  </div>
                </div>

                {/* ── Body ── */}
                <div className="flex-1 overflow-hidden flex">
                  {/* Members grid */}
                  <div className={`flex-1 overflow-y-auto transition-all duration-300 ${isAssigning ? "p-5" : "p-7"}`}>
                    {selectedSquad.members.length === 0 ? (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="h-full min-h-[280px] flex flex-col items-center justify-center text-center max-w-xs mx-auto"
                      >
                        <div className="h-14 w-14 rounded-2xl bg-muted/20 border border-border/30 flex items-center justify-center mb-4">
                          <Users className="h-7 w-7 text-muted-foreground/30" />
                        </div>
                        <h3 className="text-[15px] font-semibold text-foreground mb-1.5">No members yet</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                          Add developers to start tracking this squad's collective performance.
                        </p>
                        {!isAssigning && (
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setIsAssigning(true)}
                            className="px-5 py-2 bg-primary/10 text-primary font-medium rounded-lg hover:bg-primary/20 transition-colors flex items-center gap-2 text-sm"
                          >
                            <UserPlus className="h-3.5 w-3.5" /> Add Members
                          </motion.button>
                        )}
                      </motion.div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3">
                        <AnimatePresence mode="popLayout">
                          {selectedSquad.members.map((memberId, index) => {
                            const dev = getDevById(memberId);
                            if (!dev) return null;

                            return (
                              <motion.div
                                layout
                                key={dev.id}
                                initial={{ opacity: 0, scale: 0.93, y: 14 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.93, transition: { duration: 0.15 } }}
                                transition={{ duration: 0.22, delay: index * 0.04 }}
                                onClick={() => !isAssigning && navigate(`/developer/${dev.id}`)}
                                className={`group relative rounded-xl border border-border/40 bg-card/50 hover:bg-card/80 hover:border-border/70 backdrop-blur-sm overflow-hidden transition-all duration-200 ${
                                  isAssigning ? "cursor-default" : "cursor-pointer"
                                }`}
                              >
                                <div className="p-4">
                                  <div className="flex items-start justify-between mb-3">
                                    <Avatar className="ring-2 ring-background shadow-sm group-hover:ring-primary/15 transition-all" style={{ height: 44, width: 44 }}>
                                      <AvatarImage
                                        src={
                                          dev.avatarUrl ||
                                          `https://ui-avatars.com/api/?name=${encodeURIComponent(dev.name)}&background=random&size=88`
                                        }
                                      />
                                      <AvatarFallback className="text-sm font-medium">
                                        {dev.name.charAt(0)}
                                      </AvatarFallback>
                                    </Avatar>

                                    {isAssigning ? (
                                      <motion.button
                                        initial={{ opacity: 0, scale: 0.7 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={(e: MouseEvent<HTMLButtonElement>) => {
                                          e.stopPropagation();
                                          handleToggleMember(dev.id);
                                        }}
                                        className="h-7 w-7 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 flex items-center justify-center transition-colors"
                                        title="Remove from squad"
                                      >
                                        <X className="h-3.5 w-3.5" />
                                      </motion.button>
                                    ) : (
                                      <div className="opacity-0 group-hover:opacity-60 transition-opacity mt-0.5">
                                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                      </div>
                                    )}
                                  </div>

                                  <p className="text-[13px] font-semibold text-foreground truncate leading-tight">
                                    {dev.name}
                                  </p>
                                  <p className="text-[11px] text-muted-foreground/60 mt-0.5 truncate">
                                    {dev.githubUsername ? `@${dev.githubUsername}` : "Developer"}
                                  </p>
                                </div>

                                {/* Bottom accent line */}
                                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/35 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                              </motion.div>
                            );
                          })}
                        </AnimatePresence>
                      </div>
                    )}
                  </div>

                  {/* ── Assign panel ── */}
                  <AnimatePresence>
                    {isAssigning && (
                      <motion.div
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 320, opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        transition={{ type: "spring", bounce: 0, duration: 0.32 }}
                        className="border-l border-border/40 bg-background/50 backdrop-blur-xl flex flex-col overflow-hidden shrink-0"
                      >
                        {/* Panel header */}
                        <div className="p-4 border-b border-border/40 shrink-0">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-semibold text-foreground">Members</h3>
                            <span className="text-[11px] text-muted-foreground/60 bg-muted/40 px-2 py-0.5 rounded-full border border-border/30">
                              {githubDevelopers.length} total
                            </span>
                          </div>
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50" />
                            <Input
                              placeholder="Search developers..."
                              className="pl-9 h-8 text-sm bg-background/60 border-border/40 placeholder:text-muted-foreground/40"
                              value={searchQuery}
                              onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                            />
                          </div>
                        </div>

                        {/* Developer list */}
                        <div className="flex-1 overflow-y-auto p-3 scrollbar-thin scrollbar-thumb-border/40 scrollbar-track-transparent">
                          {filteredDevelopers.length === 0 ? (
                            <div className="py-12 text-center">
                              <p className="text-sm text-muted-foreground/50">No developers found</p>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {/* In Squad section */}
                              {inSquad.length > 0 && (
                                <div>
                                  <p className="text-[10px] font-semibold text-muted-foreground/40 uppercase tracking-widest px-2 py-1.5">
                                    In Squad · {inSquad.length}
                                  </p>
                                  <div className="space-y-0.5">
                                    {inSquad.map((dev, index) => (
                                      <DeveloperDirectoryItem
                                        key={dev.id}
                                        dev={dev}
                                        isAssigned={true}
                                        index={index}
                                        onToggle={() => handleToggleMember(dev.id)}
                                      />
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Available section */}
                              {available.length > 0 && (
                                <div>
                                  <p className="text-[10px] font-semibold text-muted-foreground/40 uppercase tracking-widest px-2 py-1.5">
                                    Available · {available.length}
                                  </p>
                                  <div className="space-y-0.5">
                                    {available.map((dev, index) => (
                                      <DeveloperDirectoryItem
                                        key={dev.id}
                                        dev={dev}
                                        isAssigned={false}
                                        index={index}
                                        onToggle={() => handleToggleMember(dev.id)}
                                      />
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ) : (
              /* Empty state — no squad selected */
              <motion.div
                key="no-squad"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col items-center justify-center text-center px-8"
              >
                <div className="h-16 w-16 rounded-2xl bg-muted/15 border border-border/30 flex items-center justify-center mb-5">
                  <Shield className="h-8 w-8 text-muted-foreground/20" />
                </div>
                <h2 className="text-lg font-semibold text-foreground mb-1.5">Select a Squad</h2>
                <p className="text-sm text-muted-foreground max-w-[260px] leading-relaxed">
                  Choose a squad from the sidebar, or create a new one to start organizing your team.
                </p>
                {squads.length === 0 && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsCreatingSquad(true)}
                    className="mt-6 px-5 py-2.5 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 text-sm shadow-sm"
                  >
                    <Plus className="h-4 w-4" /> Create First Squad
                  </motion.button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default Squads;
