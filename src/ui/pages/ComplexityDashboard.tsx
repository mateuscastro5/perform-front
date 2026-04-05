import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api.service';
import { PrComplexityBadge } from '../components/PrComplexityBadge';
import { DoubtfulAnalysisQueue } from '../components/DoubtfulAnalysisQueue';
import type { PrAnalysis, DifficultyLabel, SubmitFeedback } from '../types/analysis.types';

export default function ComplexityDashboard() {
  const { token } = useAuth();
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading complexity data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
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
    </div>
  );
}
