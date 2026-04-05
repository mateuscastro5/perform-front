import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api.service';
import { ComplexityScoreRing } from '../components/ComplexityScoreRing';
import type { SquadXRay } from '../types/analysis.types';

export default function SquadXRayViewPage() {
  const { id: squadId } = useParams<{ id: string }>();
  const { token } = useAuth();
  const [data, setData] = useState<SquadXRay | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || !squadId) return;
    loadData();
  }, [token, squadId]);

  const loadData = async () => {
    if (!token || !squadId) return;
    setLoading(true);
    try {
      const report = await apiService.getSquadXRay(token, squadId);
      setData(report);
    } catch (err) {
      console.error('Failed to load squad X-Ray:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading squad analysis...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No analysis data available for this squad.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Squad X-Ray</h1>
        <p className="text-sm text-muted-foreground">
          Complexity absorption analysis for the squad
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Team Avg Complexity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {Math.round(data.avgTeamComplexity)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Absorbed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {Math.round(data.totalComplexityAbsorbed)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Developers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{data.developers.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Developer cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.developers.map((dev) => (
          <Card key={dev.id} className="hover:border-primary/50 transition-colors">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <ComplexityScoreRing
                  score={dev.avgComplexity}
                  size={64}
                  strokeWidth={5}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{dev.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {dev.prCount} PRs analyzed
                  </p>
                  <Badge
                    variant="outline"
                    className={`text-xs mt-1 ${
                      dev.trend === 'improving'
                        ? 'bg-green-100 text-green-700'
                        : dev.trend === 'declining'
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-blue-100 text-blue-700'
                    } border-0`}
                  >
                    {dev.trend}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {data.developers.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">
              No developer analyses found for this squad. Trigger PR analyses to populate this view.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
