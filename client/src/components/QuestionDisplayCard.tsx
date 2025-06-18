import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Flag, RotateCcw } from 'lucide-react';
import type { Question } from '@shared/schema';

interface QuestionDisplayCardProps {
  question: Question;
  selectedAnswer?: string | null;
  showSolution?: boolean;
  mode: 'exam' | 'browse' | 'review';
  isMarkedForReview?: boolean;
  onAnswerSelect?: (answer: string) => void;
  onClearResponse?: () => void;
  onMarkForReview?: () => void;
  onShowSolution?: () => void;
}

export default function QuestionDisplayCard({
  question,
  selectedAnswer,
  showSolution = false,
  mode,
  isMarkedForReview = false,
  onAnswerSelect,
  onClearResponse,
  onMarkForReview,
  onShowSolution,
}: QuestionDisplayCardProps) {
  const isCorrect = selectedAnswer === question.correctAnswer;
  const isAnswered = selectedAnswer !== null && selectedAnswer !== undefined;

  return (
    <div className="space-y-6">
      {/* Question Card */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Badge variant="outline">Question {question.questionNumber}</Badge>
              {question.subject && (
                <Badge variant="secondary">{question.subject}</Badge>
              )}
              {question.difficulty && (
                <Badge 
                  variant={
                    question.difficulty === 'Easy' ? 'default' : 
                    question.difficulty === 'Medium' ? 'secondary' : 'destructive'
                  }
                >
                  {question.difficulty}
                </Badge>
              )}
            </div>
            {isMarkedForReview && (
              <Flag className="w-5 h-5 text-warning fill-current" />
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="prose dark:prose-invert max-w-none mb-6">
            <p className="text-lg leading-relaxed">{question.questionText}</p>
          </div>

          {/* Options */}
          <div className="space-y-3">
            <RadioGroup
              value={selectedAnswer || ''}
              onValueChange={mode !== 'review' ? onAnswerSelect : undefined}
              disabled={mode === 'review'}
            >
              {(question.options as string[]).map((option, index) => {
                const optionKey = String.fromCharCode(65 + index); // A, B, C, D
                const isSelected = selectedAnswer === option;
                const isCorrectOption = option === question.correctAnswer;
                
                return (
                  <div
                    key={index}
                    className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
                      showSolution
                        ? isCorrectOption
                          ? 'border-success bg-success/5'
                          : isSelected && !isCorrectOption
                          ? 'border-destructive bg-destructive/5'
                          : 'border-border'
                        : isSelected
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <RadioGroupItem
                      value={option}
                      id={`option-${index}`}
                      className={
                        showSolution
                          ? isCorrectOption
                            ? 'border-success text-success'
                            : isSelected && !isCorrectOption
                            ? 'border-destructive text-destructive'
                            : ''
                          : ''
                      }
                    />
                    <Label
                      htmlFor={`option-${index}`}
                      className="flex-1 cursor-pointer font-medium"
                    >
                      <span className="font-semibold mr-2">({optionKey})</span>
                      {option}
                    </Label>
                    {showSolution && (
                      <div className="flex items-center">
                        {isCorrectOption ? (
                          <CheckCircle className="w-5 h-5 text-success" />
                        ) : isSelected && !isCorrectOption ? (
                          <XCircle className="w-5 h-5 text-destructive" />
                        ) : null}
                      </div>
                    )}
                  </div>
                );
              })}
            </RadioGroup>
          </div>

          {/* Action Buttons */}
          {mode !== 'review' && (
            <div className="flex flex-wrap gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={onClearResponse}
                disabled={!isAnswered}
                className="flex items-center space-x-1"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Clear Response</span>
              </Button>

              <Button
                variant={isMarkedForReview ? "default" : "outline"}
                size="sm"
                onClick={onMarkForReview}
                className="flex items-center space-x-1"
              >
                <Flag className="w-4 h-4" />
                <span>{isMarkedForReview ? 'Marked' : 'Mark for Review'}</span>
              </Button>

              {mode === 'browse' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onShowSolution}
                  className="flex items-center space-x-1"
                >
                  <span>Show Solution</span>
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Solution Card */}
      {showSolution && question.explanation && (
        <Card className="border-l-4 border-l-primary">
          <CardHeader>
            <h3 className="text-lg font-semibold flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-success" />
              <span>Solution</span>
            </h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="font-medium text-success">Correct Answer: {question.correctAnswer}</p>
                {mode === 'review' && selectedAnswer && (
                  <p className={`font-medium ${isCorrect ? 'text-success' : 'text-destructive'}`}>
                    Your Answer: {selectedAnswer}
                    {isCorrect ? (
                      <CheckCircle className="inline w-4 h-4 ml-2" />
                    ) : (
                      <XCircle className="inline w-4 h-4 ml-2" />
                    )}
                  </p>
                )}
              </div>
              <div className="prose dark:prose-invert max-w-none">
                <p>{question.explanation}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
