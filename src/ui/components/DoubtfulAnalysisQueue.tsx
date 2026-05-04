import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { PrComplexityBadge } from './PrComplexityBadge';
import { AnalysisFeedbackModal } from './AnalysisFeedbackModal';
import type { PrAnalysis, DifficultyLabel, SubmitFeedback } from '../types/analysis.types';

interface DoubtfulAnalysisQueueProps {
  analyses: PrAnalysis[];
  onSubmitFeedback: (analysisId: string, feedback: SubmitFeedback) => Promise<void>;
}

export function DoubtfulAnalysisQueue({
  analyses,
  onSubmitFeedback,
}: DoubtfulAnalysisQueueProps) {
  const [selectedAnalysis, setSelectedAnalysis] = useState<PrAnalysis | null>(null);

  if (analyses.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Review Queue</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            No analyses pending review.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Review Queue</CardTitle>
          <Badge variant="secondary" className="text-xs">
            {analyses.length} pending
          </Badge>
        </CardHeader>
        <CardContent className="space-y-2">
          {analyses.map((analysis) => (
            <div
              key={analysis.id}
              className="flex items-center justify-between p-2 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {analysis.githubPullRequest
                    ? `#${analysis.githubPullRequest.prNumber} ${analysis.githubPullRequest.title}`
                    : `Analysis ${analysis.id.slice(0, 8)}`}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <PrComplexityBadge
                    score={analysis.complexityScore}
                    label={analysis.difficultyLabel as DifficultyLabel}
                    confidence={analysis.confidence}
                  />
                  <span className="text-xs text-muted-foreground">
                    {Math.round(analysis.confidence * 100)}% confidence
                  </span>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSelectedAnalysis(analysis)}
              >
                Review
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {selectedAnalysis && (
        <AnalysisFeedbackModal
          analysis={selectedAnalysis}
          open={!!selectedAnalysis}
          onClose={() => setSelectedAnalysis(null)}
          onSubmit={(feedback) =>
            onSubmitFeedback(selectedAnalysis.id, feedback)
          }
        />
      )}
    </>
  );
}
