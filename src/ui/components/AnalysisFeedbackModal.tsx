import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Slider } from './ui/slider';
import { ComplexityScoreRing } from './ComplexityScoreRing';
import type { PrAnalysis, DifficultyLabel, SubmitFeedback } from '../types/analysis.types';

const LABELS: DifficultyLabel[] = ['trivial', 'easy', 'medium', 'hard', 'expert'];

function scoreTolabel(score: number): DifficultyLabel {
  if (score <= 20) return 'trivial';
  if (score <= 40) return 'easy';
  if (score <= 60) return 'medium';
  if (score <= 80) return 'hard';
  return 'expert';
}

interface AnalysisFeedbackModalProps {
  analysis: PrAnalysis;
  open: boolean;
  onClose: () => void;
  onSubmit: (feedback: SubmitFeedback) => Promise<void>;
}

export function AnalysisFeedbackModal({
  analysis,
  open,
  onClose,
  onSubmit,
}: AnalysisFeedbackModalProps) {
  const [score, setScore] = useState(analysis.complexityScore);
  const [label, setLabel] = useState<DifficultyLabel>(
    analysis.difficultyLabel as DifficultyLabel,
  );
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleScoreChange = (values: number[]) => {
    const newScore = values[0];
    setScore(newScore);
    setLabel(scoreTolabel(newScore));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await onSubmit({ correctedScore: score, correctedLabel: label, feedbackNote: note });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Correct AI Analysis</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* AI's original assessment */}
          <div className="rounded-lg bg-muted/50 p-3 space-y-2">
            <p className="text-xs text-muted-foreground font-medium">AI Assessment</p>
            <div className="flex items-center gap-3">
              <ComplexityScoreRing score={analysis.complexityScore} size={56} strokeWidth={5} />
              <div className="flex-1 text-sm">
                <p className="font-medium">{analysis.difficultyLabel} - Score {Math.round(analysis.complexityScore)}</p>
                <p className="text-muted-foreground text-xs">
                  Confidence: {Math.round(analysis.confidence * 100)}%
                </p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">{analysis.justification}</p>
          </div>

          {/* Correction controls */}
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium mb-2">
                Corrected Score: <span className="text-primary">{Math.round(score)}</span>
              </p>
              <Slider
                value={[score]}
                onValueChange={handleScoreChange}
                max={100}
                min={0}
                step={1}
              />
            </div>

            <div>
              <p className="text-sm font-medium mb-2">Difficulty Label</p>
              <div className="flex gap-1.5 flex-wrap">
                {LABELS.map((l) => (
                  <Badge
                    key={l}
                    variant={l === label ? 'default' : 'outline'}
                    className="cursor-pointer capitalize"
                    onClick={() => setLabel(l)}
                  >
                    {l}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium mb-2">Note (optional)</p>
              <Textarea
                placeholder="Why is this correction needed?"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Saving...' : 'Submit Correction'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
