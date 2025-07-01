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
  mode: 'exam' | 'browse' | 'review' | 'instant';
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
  // Handle correctAnswer format for comparison
  let isCorrect = false;
  if (selectedAnswer && question.correctAnswer) {
    if (typeof question.correctAnswer === 'string' && question.correctAnswer.length === 1) {
      // If correctAnswer is just a letter (A, B, C, D), we need to check if selectedAnswer matches the option at that index
      const letterIndex = question.correctAnswer.charCodeAt(0) - 65; // A=0, B=1, C=2, D=3
      if (Array.isArray(question.options)) {
        isCorrect = question.options[letterIndex] === selectedAnswer;
      } else if (typeof question.options === 'string') {
        try {
          const parsedOptions = JSON.parse(question.options);
          if (Array.isArray(parsedOptions)) {
            isCorrect = parsedOptions[letterIndex] === selectedAnswer;
          }
        } catch (error) {
          // Handle error silently
        }
      }
    } else {
      // If correctAnswer is the full text, compare directly
      isCorrect = selectedAnswer === question.correctAnswer;
    }
  }
  
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
              {(() => {
                // Handle different formats for options
                let optionsArray: string[] = [];
                let optionKeys: string[] = [];
                
                if (Array.isArray(question.options)) {
                  // If options is an array of strings
                  optionsArray = question.options;
                  optionKeys = optionsArray.map((_, index) => String.fromCharCode(65 + index)); // A, B, C, D
                } else if (typeof question.options === 'string') {
                  // If options is a JSON string
                  try {
                    const parsedOptions = JSON.parse(question.options);
                    if (Array.isArray(parsedOptions)) {
                      optionsArray = parsedOptions;
                      optionKeys = optionsArray.map((_, index) => String.fromCharCode(65 + index)); // A, B, C, D
                    }
                  } catch (error) {
                    console.warn('Failed to parse options JSON string:', question.options);
                    return null;
                  }
                } else if (typeof question.options === 'object' && question.options !== null) {
                  // If options is an object with keys like 'A', 'B', 'C', 'D'
                  const optionsObj = question.options as Record<string, string>;
                  optionKeys = Object.keys(optionsObj);
                  optionsArray = Object.values(optionsObj);
                } else {
                  // Fallback for unexpected format
                  console.warn('Unexpected options format:', question.options);
                  return null;
                }

                // Handle correctAnswer format
                let correctAnswerText = question.correctAnswer;
                if (typeof question.correctAnswer === 'string' && question.correctAnswer.length === 1) {
                  // If correctAnswer is just a letter (A, B, C, D), find the corresponding option
                  const letterIndex = question.correctAnswer.charCodeAt(0) - 65; // A=0, B=1, C=2, D=3
                  if (letterIndex >= 0 && letterIndex < optionsArray.length) {
                    correctAnswerText = optionsArray[letterIndex];
                  }
                }

                // Filter out options that look like explanations or are empty
                const filteredOptionsArray = optionsArray.filter(option => {
                  // Heuristic: skip options that are very long or contain '=' or look like a solution
                  if (!option || typeof option !== 'string') return false;
                  if (option.length > 120) return false;
                  if (/first term|explanation|solution|=|\n/.test(option.toLowerCase())) {
                    console.warn('Skipping suspicious option (may be explanation/solution):', option);
                    return false;
                  }
                  return true;
                });
                if (filteredOptionsArray.length !== optionsArray.length) {
                  console.warn('Some options were filtered out for question', question.id);
                }
                // Use filteredOptionsArray for rendering
                return filteredOptionsArray.map((option, index) => {
                  const optionKey = optionKeys[index];
                  const isSelected = selectedAnswer === option;
                  const isCorrectOption = option === correctAnswerText;
                  
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
                });
              })()}
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
                {(() => {
                  // Handle correctAnswer format for display
                  let correctAnswerDisplay = question.correctAnswer;
                  if (typeof question.correctAnswer === 'string' && question.correctAnswer.length === 1) {
                    // If correctAnswer is just a letter, show it as "Option A" format
                    correctAnswerDisplay = `Option ${question.correctAnswer}`;
                  }
                  
                  return (
                    <p className="font-medium text-success">Correct Answer: {correctAnswerDisplay}</p>
                  );
                })()}
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
