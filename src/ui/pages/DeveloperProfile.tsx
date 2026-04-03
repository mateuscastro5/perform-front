import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Github, 
  Mail, 
  Calendar, 
  Activity, 
  GitCommit, 
  GitPullRequest, 
  TrendingUp,
  BrainCircuit,
  Zap,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { DashboardHeader } from '../components/DashboardHeader';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { useDashboard } from '../contexts/DashboardContext';
import type { GithubDeveloper } from '../types/github.types';
import type { PullRequest } from '../types/dashboard.types';

// Mock AI Insights Data
const MOCK_AI_INSIGHTS = {
  summary: "Highly productive developer with a strong focus on backend architecture. Shows excellent consistency in code reviews and maintains a low bug-introduction rate.",
  strengths: [
    "Consistent commit patterns",
    "High code review participation",
    "Quick PR turnaround time"
  ],
  areasForImprovement: [
    "Could add more unit tests to complex PRs",
    "Documentation updates sometimes lag behind code changes"
  ],
  productivityScore: 92,
  qualityScore: 88,
  collaborationScore: 95
};

export default function DeveloperProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { githubDevelopers, pullRequests } = useDashboard();
  
  const [developer, setDeveloper] = useState<GithubDeveloper | null>(null);
  const [devPRs, setDevPRs] = useState<PullRequest[]>([]);

  useEffect(() => {
    if (id && githubDevelopers.length > 0) {
      const dev = githubDevelopers.find((developerItem) => developerItem.id === id);
      if (dev) {
        setDeveloper(dev);

        const allPrs = pullRequests?.prs ?? [];
        const filteredPRs = allPrs.filter(
          (pr) => pr.author.id === id || pr.author.name === dev.name,
        );
        setDevPRs(filteredPRs);
      }
    }
  }, [id, githubDevelopers, pullRequests]);

  if (!developer) {
    return (
      <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_22%_16%,hsl(var(--accent)/0.14),transparent_40%),radial-gradient(circle_at_86%_8%,hsl(var(--primary)/0.1),transparent_38%),radial-gradient(circle_at_46%_86%,hsl(var(--secondary)/0.12),transparent_42%)]" />
        <DashboardHeader activeTab="squads" onTabChange={() => {}} />
        <div className="flex-1 flex items-center justify-center pl-[316px] pt-[122px] relative z-10">
          <div className="animate-pulse flex flex-col items-center gap-4">
            <div className="h-24 w-24 rounded-full bg-muted/50"></div>
            <div className="h-6 w-48 bg-muted/50 rounded"></div>
            <div className="h-4 w-32 bg-muted/50 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_22%_16%,hsl(var(--accent)/0.14),transparent_40%),radial-gradient(circle_at_86%_8%,hsl(var(--primary)/0.1),transparent_38%),radial-gradient(circle_at_46%_86%,hsl(var(--secondary)/0.12),transparent_42%)]" />
      <DashboardHeader activeTab="squads" onTabChange={() => {}} />
      
      <main className="flex-1 overflow-y-auto pl-[316px] pr-6 md:pr-10 pt-[122px] pb-10 relative z-10">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Back Button & Header */}
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(-1)}
              className="p-2 rounded-full hover:bg-muted/50 transition-colors border border-transparent hover:border-border/50"
            >
              <ArrowLeft className="h-5 w-5 text-muted-foreground" />
            </motion.button>
            <h1 className="text-2xl font-light tracking-tight text-foreground">Developer Profile</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Profile Info */}
            <div className="lg:col-span-1 space-y-8">
              {/* Profile Card */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-8 rounded-2xl border border-border/40 bg-muted/5 backdrop-blur-sm flex flex-col items-center text-center"
              >
                <Avatar className="h-32 w-32 ring-4 ring-primary/10 mb-6">
                  <AvatarImage src={developer.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(developer.name)}&background=random`} />
                  <AvatarFallback className="text-4xl">{developer.name.charAt(0)}</AvatarFallback>
                </Avatar>
                
                <h2 className="text-2xl font-semibold text-foreground mb-1">{developer.name}</h2>
                <p className="text-muted-foreground mb-6 flex items-center gap-2">
                  <Github className="h-4 w-4" />
                  {developer.githubUsername || 'No GitHub linked'}
                </p>

                <div className="w-full space-y-4 text-sm text-left">
                  {developer.email && (
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span>{developer.email}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Since {new Date(developer.stats.period.since).toLocaleDateString()}</span>
                  </div>
                </div>
              </motion.div>

              {/* Quick Stats */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-2 gap-4"
              >
                <div className="p-6 rounded-2xl border border-border/40 bg-muted/5 backdrop-blur-sm">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <GitCommit className="h-4 w-4" />
                    <span className="text-sm font-medium">Commits</span>
                  </div>
                  <p className="text-3xl font-light text-foreground">{developer.stats?.commits ?? 0}</p>
                </div>
                <div className="p-6 rounded-2xl border border-border/40 bg-muted/5 backdrop-blur-sm">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <GitPullRequest className="h-4 w-4" />
                    <span className="text-sm font-medium">PRs</span>
                  </div>
                  <p className="text-3xl font-light text-foreground">{devPRs.length}</p>
                </div>
              </motion.div>
            </div>

            {/* Right Column: AI Insights & Activity */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* AI Insights Panel */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="p-8 rounded-2xl border border-primary/20 bg-primary/5 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-6 opacity-10">
                  <BrainCircuit className="h-32 w-32 text-primary" />
                </div>
                
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-primary/20 text-primary">
                      <BrainCircuit className="h-5 w-5" />
                    </div>
                    <h3 className="text-xl font-medium text-foreground">AI Performance Insights</h3>
                  </div>

                  <p className="text-muted-foreground leading-relaxed mb-8 max-w-2xl">
                    {MOCK_AI_INSIGHTS.summary}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Productivity</span>
                        <span className="font-medium text-primary">{MOCK_AI_INSIGHTS.productivityScore}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${MOCK_AI_INSIGHTS.productivityScore}%` }} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Quality</span>
                        <span className="font-medium text-primary">{MOCK_AI_INSIGHTS.qualityScore}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${MOCK_AI_INSIGHTS.qualityScore}%` }} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Collaboration</span>
                        <span className="font-medium text-primary">{MOCK_AI_INSIGHTS.collaborationScore}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${MOCK_AI_INSIGHTS.collaborationScore}%` }} />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="text-sm font-medium flex items-center gap-2 text-foreground">
                        <Zap className="h-4 w-4 text-yellow-500" /> Strengths
                      </h4>
                      <ul className="space-y-2">
                        {MOCK_AI_INSIGHTS.strengths.map((strength, i) => (
                          <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                            {strength}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="space-y-4">
                      <h4 className="text-sm font-medium flex items-center gap-2 text-foreground">
                        <TrendingUp className="h-4 w-4 text-blue-500" /> Areas for Growth
                      </h4>
                      <ul className="space-y-2">
                        {MOCK_AI_INSIGHTS.areasForImprovement.map((area, i) => (
                          <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                            <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
                            {area}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Recent Activity */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="p-8 rounded-2xl border border-border/40 bg-muted/5 backdrop-blur-sm"
              >
                <div className="flex items-center gap-3 mb-6">
                  <Activity className="h-5 w-5 text-muted-foreground" />
                  <h3 className="text-xl font-medium text-foreground">Recent Activity</h3>
                </div>

                {devPRs.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No recent activity found for this developer.
                  </div>
                ) : (
                  <div className="space-y-6">
                    {devPRs.slice(0, 5).map((pr) => (
                      <div key={pr.id} className="flex gap-4">
                        <div className="mt-1">
                          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center border border-border/50">
                            <GitPullRequest className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </div>
                        <div className="flex-1 pb-6 border-b border-border/40 last:border-0 last:pb-0">
                          <p className="text-sm font-medium text-foreground mb-1">
                            {pr.title}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="font-mono bg-muted/50 px-1.5 py-0.5 rounded">#{pr.id}</span>
                            <span>•</span>
                            <span>{new Date(pr.createdAt).toLocaleDateString()}</span>
                            <span>•</span>
                            <span className="capitalize">{pr.status.replace('_', ' ')}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
