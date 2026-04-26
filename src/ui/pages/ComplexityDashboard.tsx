import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api.service';
import { DoubtfulAnalysisQueue } from '../components/DoubtfulAnalysisQueue';
import { DashboardHeader } from '../components/DashboardHeader';
import { useUIStore, getSidebarOffset } from '../stores/uiStore';
import type { PrAnalysis, SubmitFeedback } from '../types/analysis.types';

export default function ComplexityDashboard() {
  const { token } = useAuth();
  const { sidebarCollapsed } = useUIStore();
  const contentLeft = getSidebarOffset(sidebarCollapsed);
  const [activeTab, setActiveTab] = useState('complexity');
  const [doubtful, setDoubtful] = useState<PrAnalysis[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    loadData();
  }, [token]);

  const loadData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const d = await apiService.getDoubtfulAnalyses(token);
      setDoubtful(d);
    } catch (err) {
      console.error('Failed to load complexity data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = async (analysisId: string, feedback: SubmitFeedback) => {
    if (!token) return;
    await apiService.submitAnalysisFeedback(token, analysisId, feedback);
    setDoubtful((prev) => prev.filter((a) => a.id !== analysisId));
  };

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_22%_16%,hsl(var(--accent)/0.14),transparent_40%),radial-gradient(circle_at_86%_8%,hsl(var(--primary)/0.1),transparent_38%)]" />

      <DashboardHeader activeTab={activeTab} onTabChange={setActiveTab} />

      <main
        className="flex-1 overflow-y-auto pt-[138px] pr-8 pb-10 relative z-10 transition-[padding-left] duration-300"
        style={{ paddingLeft: contentLeft + 16 }}
      >
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">AI Complexity Analysis</h1>
              <p className="text-sm text-muted-foreground">
                Review and manage PR complexity scores from the AI pipeline
              </p>
            </div>
            {doubtful.length > 0 && (
              <Badge variant="destructive">{doubtful.length} need review</Badge>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">Loading complexity data...</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Pending Reviews
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{doubtful.length}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Pipeline Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-green-600">Active</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Avg Confidence
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">
                      {doubtful.length > 0
                        ? `${Math.round(
                            (doubtful.reduce((s, a) => s + a.confidence, 0) /
                              doubtful.length) *
                              100,
                          )}%`
                        : '--'}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <DoubtfulAnalysisQueue
                analyses={doubtful}
                onSubmitFeedback={handleFeedback}
              />
            </>
          )}
        </div>
      </main>
    </div>
  );
}
