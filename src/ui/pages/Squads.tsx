import { useState, useEffect, type MouseEvent, type ChangeEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardHeader } from "@/ui/components/DashboardHeader";
import { useDashboard } from "@/ui/contexts/DashboardContext";
import { useAuth } from "@/ui/contexts/AuthContext";
import { apiService } from "@/ui/services/api.service";
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/components/ui/avatar";
import { Plus, Trash2, Users, Check, X, UserPlus, Search, Shield } from "lucide-react";
import { Input } from "@/ui/components/ui/input";
import { useNavigate } from "react-router-dom";

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

const Squads = () => {
  const [activeTab, setActiveTab] = useState("squads");
  const { githubDevelopers } = useDashboard();
  const { token } = useAuth();
  const navigate = useNavigate();
  
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
          members: s.developers ? s.developers.map((d: SquadApiDeveloper) => d.id) : []
        }));
        setSquads(formattedSquads);
        if (formattedSquads.length > 0) {
          setSelectedSquadId((currentId) => {
            if (currentId && formattedSquads.some((squad) => squad.id === currentId)) {
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
        const formattedSquad = {
          id: newSquad.id,
          name: newSquad.name,
          members: []
        };
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
      
      const updatedSquads = squads.map((squad) => {
        if (squad.id === selectedSquad.id) {
          return {
            ...squad,
            members: isMember 
              ? squad.members.filter((memberId) => memberId !== devId)
              : [...squad.members, devId]
          };
        }
        return squad;
      });
      
      setSquads(updatedSquads);
    } catch (error) {
      console.error("Failed to update developer squad:", error);
    }
  };

  const filteredDevelopers = githubDevelopers.filter((dev) => 
    dev.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (dev.githubUsername && dev.githubUsername.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_14%,hsl(var(--accent)/0.14),transparent_40%),radial-gradient(circle_at_88%_8%,hsl(var(--primary)/0.1),transparent_40%),radial-gradient(circle_at_42%_88%,hsl(var(--secondary)/0.12),transparent_42%)]" />
      <DashboardHeader activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="flex-1 flex overflow-hidden pl-[316px] pr-6 md:pr-10 pt-[122px] pb-8 relative z-10">
        {/* Sidebar - Modern Navigation */}
        <div className="w-72 border border-border/40 rounded-2xl bg-card/35 backdrop-blur-2xl flex flex-col">
          <div className="p-6 pb-4 flex items-center justify-between">
            <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Your Squads</h2>
            <motion.button 
              whileHover={{ scale: 1.05, backgroundColor: "rgba(var(--primary), 0.1)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsCreatingSquad(true)}
              className="text-primary transition-colors p-1.5 rounded-md flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
            </motion.button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 space-y-1 scrollbar-thin scrollbar-thumb-border/50 scrollbar-track-transparent">
            <AnimatePresence>
              {isCreatingSquad && (
                <motion.div 
                  initial={{ opacity: 0, height: 0, y: -10 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -10 }}
                  className="mb-4 overflow-hidden"
                >
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/20 border border-primary/30 shadow-sm">
                    <input
                      autoFocus
                      type="text"
                      value={newSquadName}
                      onChange={(event: ChangeEvent<HTMLInputElement>) => setNewSquadName(event.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleCreateSquad()}
                      placeholder="Squad name..."
                      className="bg-transparent border-none outline-none text-sm w-full text-foreground placeholder:text-muted-foreground/50"
                    />
                    <button onClick={handleCreateSquad} className="text-primary hover:text-primary/80 p-1">
                      <Check className="h-4 w-4" />
                    </button>
                    <button onClick={() => setIsCreatingSquad(false)} className="text-muted-foreground hover:text-foreground p-1">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {squads.map((squad) => {
              const isSelected = selectedSquadId === squad.id;
              return (
                <button
                  key={squad.id}
                  onClick={() => setSelectedSquadId(squad.id)}
                  className={`relative w-full flex items-center justify-between p-3 rounded-xl text-sm transition-colors group ${
                    isSelected ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {isSelected && (
                    <motion.div
                      layoutId="active-squad-bg"
                      className="absolute inset-0 bg-muted/30 border border-border/50 rounded-xl"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <div className="relative z-10 flex items-center gap-3">
                    <div className={`p-1.5 rounded-md transition-colors ${isSelected ? 'bg-primary/20 text-primary' : 'bg-muted/50 group-hover:bg-muted'}`}>
                      <Shield className="h-4 w-4" />
                    </div>
                    <span className="font-medium truncate">{squad.name}</span>
                  </div>
                  <span className="relative z-10 text-xs bg-background/50 px-2 py-0.5 rounded-full border border-border/40">
                    {squad.members.length}
                  </span>
                </button>
              );
            })}
            
            {squads.length === 0 && !isCreatingSquad && (
              <div className="text-center py-8 px-4">
                <Shield className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No squads created yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Main Content - Premium Minimalist Details */}
        <div className="flex-1 overflow-hidden bg-card/30 border border-border/40 rounded-2xl ml-4 backdrop-blur-2xl relative">
          {selectedSquad ? (
            <div className="h-full flex flex-col">
              {/* Header */}
              <div className="px-10 py-8 border-b border-border/40 flex items-end justify-between bg-muted/5 backdrop-blur-sm">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={`header-${selectedSquad.id}`}
                >
                  <h1 className="text-4xl font-light tracking-tight text-foreground mb-2">
                    {selectedSquad.name}
                  </h1>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    {selectedSquad.members.length} {selectedSquad.members.length === 1 ? 'member' : 'members'}
                  </p>
                </motion.div>
                
                <div className="flex items-center gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsAssigning(!isAssigning)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-2 ${
                      isAssigning 
                        ? 'bg-muted text-foreground border border-border/50' 
                        : 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm'
                    }`}
                  >
                    {isAssigning ? (
                      <>Done</>
                    ) : (
                      <><UserPlus className="h-4 w-4" /> Manage Members</>
                    )}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDeleteSquad(selectedSquad.id)}
                    className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors border border-transparent hover:border-destructive/20"
                    title="Delete Squad"
                  >
                    <Trash2 className="h-5 w-5" />
                  </motion.button>
                </div>
              </div>

              {/* Content Area */}
              <div className="flex-1 overflow-hidden flex">
                {/* Members Grid */}
                <div className={`flex-1 overflow-y-auto p-10 transition-all duration-500 ${isAssigning ? 'pr-6' : ''}`}>
                  {selectedSquad.members.length === 0 ? (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto"
                    >
                      <div className="h-20 w-20 rounded-full bg-muted/30 flex items-center justify-center mb-6 border border-border/50">
                        <Users className="h-10 w-10 text-muted-foreground/50" />
                      </div>
                      <h3 className="text-xl font-medium text-foreground mb-2">No members yet</h3>
                      <p className="text-sm text-muted-foreground mb-8">
                        This squad is currently empty. Add developers to start tracking their collective performance and metrics.
                      </p>
                      {!isAssigning && (
                        <motion.button 
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setIsAssigning(true)}
                          className="px-6 py-2.5 bg-primary/10 text-primary font-medium rounded-lg hover:bg-primary/20 transition-colors flex items-center gap-2"
                        >
                          <UserPlus className="h-4 w-4" />
                          Add First Member
                        </motion.button>
                      )}
                    </motion.div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      <AnimatePresence mode="popLayout">
                        {selectedSquad.members.map((memberId: string, index: number) => {
                          const dev = githubDevelopers.find((developer) => developer.id === memberId);
                          if (!dev) return null;
                          
                          return (
                            <motion.div
                              layout
                              key={dev.id}
                              initial={{ opacity: 0, scale: 0.9, y: 20 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                              transition={{ duration: 0.3, delay: index * 0.05 }}
                              onClick={() => navigate(`/developer/${dev.id}`)}
                              className="group relative flex items-center gap-4 p-4 rounded-xl border border-border/40 bg-transparent hover:bg-muted/20 transition-all hover:border-border/80 cursor-pointer"
                            >
                              <Avatar className="h-12 w-12 ring-2 ring-primary/10 group-hover:ring-primary/30 transition-all">
                                <AvatarImage src={dev.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(dev.name)}&background=random`} />
                                <AvatarFallback>{dev.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-foreground truncate">{dev.name}</p>
                                <p className="text-xs text-muted-foreground truncate">
                                  {dev.githubUsername ? `@${dev.githubUsername}` : 'Developer'}
                                </p>
                              </div>
                              {isAssigning && (
                                <motion.button
                                  initial={{ opacity: 0, scale: 0.5 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  whileHover={{ scale: 1.1, rotate: 90 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={(event: MouseEvent<HTMLButtonElement>) => {
                                    event.stopPropagation();
                                    handleToggleMember(dev.id);
                                  }}
                                  className="absolute top-2 right-2 text-muted-foreground hover:text-destructive p-1.5 rounded-md hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all"
                                >
                                  <X className="h-4 w-4" />
                                </motion.button>
                              )}
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </div>
                  )}
                </div>

                {/* Slide-in Assignment Panel */}
                <AnimatePresence>
                  {isAssigning && (
                    <motion.div
                      initial={{ width: 0, opacity: 0, x: 50 }}
                      animate={{ width: 380, opacity: 1, x: 0 }}
                      exit={{ width: 0, opacity: 0, x: 50 }}
                      transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                      className="border-l border-border/40 bg-muted/5 flex flex-col"
                    >
                      <div className="p-6 border-b border-border/40">
                        <h3 className="text-sm font-medium text-foreground mb-4">Directory</h3>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input 
                            placeholder="Search developers..." 
                            className="pl-9 bg-background border-border/50"
                            value={searchQuery}
                            onChange={(event: ChangeEvent<HTMLInputElement>) => setSearchQuery(event.target.value)}
                          />
                        </div>
                      </div>
                      
                      <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-thin scrollbar-thumb-border/50 scrollbar-track-transparent">
                        {filteredDevelopers.map((dev, index: number) => {
                          const isAssigned = selectedSquad.members.includes(dev.id);
                          
                          return (
                            <motion.button
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.03 }}
                              key={dev.id}
                              onClick={() => handleToggleMember(dev.id)}
                              className={`w-full flex items-center justify-between p-3 rounded-xl text-sm transition-all group ${
                                isAssigned 
                                  ? 'bg-primary/10 border border-primary/20' 
                                  : 'bg-background border border-border/40 hover:border-border/80 hover:bg-muted/30'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={dev.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(dev.name)}&background=random`} />
                                  <AvatarFallback>{dev.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="text-left">
                                  <p className={`font-medium text-sm ${isAssigned ? 'text-primary' : 'text-foreground'}`}>
                                    {dev.name}
                                  </p>
                                </div>
                              </div>
                              <div className={`h-6 w-6 rounded-full flex items-center justify-center transition-colors ${
                                isAssigned ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary'
                              }`}>
                                {isAssigned ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                              </div>
                            </motion.button>
                          );
                        })}
                        {filteredDevelopers.length === 0 && (
                          <div className="text-center py-8">
                            <p className="text-sm text-muted-foreground">No developers found.</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <Shield className="h-16 w-16 mb-6 mx-auto opacity-20" />
                <h2 className="text-2xl font-light text-foreground mb-2">Select a Squad</h2>
                <p className="text-sm">Choose a squad from the sidebar or create a new one.</p>
              </motion.div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Squads;
