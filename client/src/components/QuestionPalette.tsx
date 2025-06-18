import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Grid3X3, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Question } from '@shared/schema';

interface QuestionState {
  questionId: number;
  selectedAnswer: string | null;
  isMarkedForReview: boolean;
  isAnswered: boolean;
  timeSpent: number;
}

interface QuestionPaletteProps {
  questions: Question[];
  questionStates: Record<number, QuestionState>;
  currentQuestionIndex: number;
  onQuestionSelect: (index: number) => void;
  reviewMode?: boolean;
  userResponses?: Record<string, string>;
}

export default function QuestionPalette({
  questions,
  questionStates,
  currentQuestionIndex,
  onQuestionSelect,
  reviewMode = false,
  userResponses = {},
}: QuestionPaletteProps) {
  const getQuestionStatus = (question: Question, index: number) => {
    if (reviewMode) {
      const userAnswer = userResponses[question.id.toString()];
      if (!userAnswer) return 'unanswered';
      return userAnswer === question.correctAnswer ? 'correct' : 'incorrect';
    }

    const state = questionStates[question.id];
    if (!state) return 'unanswered';

    if (state.isAnswered && state.isMarkedForReview) {
      return 'answered-marked';
    } else if (state.isAnswered) {
      return 'answered';
    } else if (state.isMarkedForReview) {
      return 'marked';
    } else {
      return 'unanswered';
    }
  };

  const getStatusColor = (status: string, isCurrent: boolean) => {
    if (isCurrent) {
      return 'bg-primary text-primary-foreground border-primary';
    }

    switch (status) {
      case 'answered':
        return 'question-status-answered';
      case 'marked':
        return 'question-status-marked';
      case 'answered-marked':
        return 'question-status-answered-marked';
      case 'correct':
        return 'bg-success text-success-foreground border-success';
      case 'incorrect':
        return 'bg-destructive text-destructive-foreground border-destructive';
      case 'unanswered':
      default:
        return 'question-status-unanswered';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'correct':
        return <CheckCircle className="w-3 h-3" />;
      case 'incorrect':
        return <XCircle className="w-3 h-3" />;
      case 'unanswered':
        return <AlertTriangle className="w-3 h-3" />;
      default:
        return null;
    }
  };

  // Calculate summary for non-review mode
  const summary = reviewMode ? null : {
    answered: Object.values(questionStates).filter(s => s?.isAnswered && !s?.isMarkedForReview).length,
    marked: Object.values(questionStates).filter(s => s?.isMarkedForReview).length,
    unanswered: questions.length - Object.values(questionStates).filter(s => s?.isAnswered || s?.isMarkedForReview).length,
  };

  // Calculate review summary
  const reviewSummary = reviewMode ? {
    correct: questions.filter(q => {
      const userAnswer = userResponses[q.id.toString()];
      return userAnswer === q.correctAnswer;
    }).length,
    incorrect: questions.filter(q => {
      const userAnswer = userResponses[q.id.toString()];
      return userAnswer && userAnswer !== q.correctAnswer;
    }).length,
    unanswered: questions.filter(q => !userResponses[q.id.toString()]).length,
  } : null;

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Grid3X3 className="w-5 h-5" />
          <span>Question Palette</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Legend */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Legend:</h4>
          <div className="grid grid-cols-1 gap-2 text-xs">
            {reviewMode ? (
              <>
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded bg-success border flex items-center justify-center">
                    <CheckCircle className="w-3 h-3 text-white" />
                  </div>
                  <span>Correct</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded bg-destructive border flex items-center justify-center">
                    <XCircle className="w-3 h-3 text-white" />
                  </div>
                  <span>Incorrect</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded question-status-unanswered flex items-center justify-center">
                    <AlertTriangle className="w-3 h-3" />
                  </div>
                  <span>Not Attempted</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded question-status-answered"></div>
                  <span>Answered</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded question-status-marked"></div>
                  <span>Marked for Review</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded question-status-answered-marked"></div>
                  <span>Answered & Marked</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded question-status-unanswered"></div>
                  <span>Not Answered</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Summary */}
        {summary && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Summary:</h4>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div>
                <div className="text-lg font-bold text-success">{summary.answered}</div>
                <div className="text-muted-foreground">Answered</div>
              </div>
              <div>
                <div className="text-lg font-bold text-warning">{summary.marked}</div>
                <div className="text-muted-foreground">Marked</div>
              </div>
              <div>
                <div className="text-lg font-bold text-muted-foreground">{summary.unanswered}</div>
                <div className="text-muted-foreground">Unanswered</div>
              </div>
            </div>
          </div>
        )}

        {/* Review Summary */}
        {reviewSummary && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Performance:</h4>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div>
                <div className="text-lg font-bold text-success">{reviewSummary.correct}</div>
                <div className="text-muted-foreground">Correct</div>
              </div>
              <div>
                <div className="text-lg font-bold text-destructive">{reviewSummary.incorrect}</div>
                <div className="text-muted-foreground">Wrong</div>
              </div>
              <div>
                <div className="text-lg font-bold text-muted-foreground">{reviewSummary.unanswered}</div>
                <div className="text-muted-foreground">Skipped</div>
              </div>
            </div>
          </div>
        )}

        {/* Question Grid */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Questions:</h4>
          <div className="grid grid-cols-5 gap-2">
            {questions.map((question, index) => {
              const status = getQuestionStatus(question, index);
              const isCurrent = index === currentQuestionIndex;
              const statusColor = getStatusColor(status, isCurrent);
              const statusIcon = getStatusIcon(status);

              return (
                <Button
                  key={question.id}
                  variant="outline"
                  size="sm"
                  onClick={() => onQuestionSelect(index)}
                  className={cn(
                    "w-full h-10 text-xs font-medium border-2 relative",
                    statusColor
                  )}
                >
                  <span>{index + 1}</span>
                  {statusIcon && (
                    <div className="absolute -top-1 -right-1">
                      {statusIcon}
                    </div>
                  )}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Navigation Shortcuts */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Quick Navigation:</h4>
          <div className="flex flex-wrap gap-2">
            {reviewMode ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const incorrectIndex = questions.findIndex(q => {
                      const userAnswer = userResponses[q.id.toString()];
                      return userAnswer && userAnswer !== q.correctAnswer;
                    });
                    if (incorrectIndex !== -1) onQuestionSelect(incorrectIndex);
                  }}
                  className="text-xs"
                >
                  First Wrong
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const unansweredIndex = questions.findIndex(q => !userResponses[q.id.toString()]);
                    if (unansweredIndex !== -1) onQuestionSelect(unansweredIndex);
                  }}
                  className="text-xs"
                >
                  First Skipped
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const markedIndex = questions.findIndex(q => questionStates[q.id]?.isMarkedForReview);
                    if (markedIndex !== -1) onQuestionSelect(markedIndex);
                  }}
                  className="text-xs"
                >
                  First Marked
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const unansweredIndex = questions.findIndex(q => !questionStates[q.id]?.isAnswered);
                    if (unansweredIndex !== -1) onQuestionSelect(unansweredIndex);
                  }}
                  className="text-xs"
                >
                  First Unanswered
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
