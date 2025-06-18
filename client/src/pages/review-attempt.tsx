import { useEffect, useState } from 'react';
import { useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight,
  Clock,
  Target,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  Home,
  BarChart3,
  Trophy,
  AlertTriangle
} from 'lucide-react';
import { Link } from 'wouter';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import NavigationMenu from '@/components/NavigationMenu';
import Footer from '@/components/Footer';
import QuestionDisplayCard from '@/components/QuestionDisplayCard';
import QuestionPalette from '@/components/QuestionPalette';
import { useAuthContext } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { isUnauthorizedError } from '@/lib/authUtils';
import { mockQuestions } from '@/lib/mockData';
import type { Attempt, Paper, Question } from '@shared/schema';

export default function ReviewAttempt() {
  const { attemptId } = useParams<{ attemptId: string }>();
  const { user, isLoading: authLoading } = useAuthContext();
  const { toast } = useToast();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showSolutions, setShowSolutions] = useState(true);

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [user, authLoading, toast]);

  const { data: attempt, isLoading: attemptLoading } = useQuery<Attempt>({
    queryKey: [`/api/attempts/${attemptId}`],
    retry: false,
  });

  const { data: paper, isLoading: paperLoading } = useQuery<Paper>({
    queryKey: [`/api/papers/${attempt?.paperId}`],
    enabled: !!attempt?.paperId,
    retry: false,
  });

  const { data: questions, isLoading: questionsLoading } = useQuery<Question[]>({
    queryKey: [`/api/papers/${attempt?.paperId}/questions`],
    enabled: !!attempt?.paperId,
    retry: false,
  });

  if (authLoading || attemptLoading || paperLoading || questionsLoading) {
    return (
      <div className="min-h-screen bg-background">
        <NavigationMenu />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-32 bg-muted rounded-lg"></div>
            <div className="h-96 bg-muted rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!attempt || !paper) {
    return (
      <div className="min-h-screen bg-background">
        <NavigationMenu />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <AlertTriangle className="w-12 h-12 text-warning mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-4">Attempt Not Found</h1>
              <p className="text-muted-foreground mb-6">
                The attempt you're looking for doesn't exist or you don't have access to it.
              </p>
              <Link href="/dashboard">
                <Button>
                  <Home className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Use mock questions as fallback
  const examQuestions = questions && questions.length > 0 ? questions : mockQuestions;
  const userResponses = (attempt.responses as Record<string, string>) || {};

  if (examQuestions.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <NavigationMenu />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <AlertTriangle className="w-12 h-12 text-warning mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-4">No Questions Available</h1>
              <p className="text-muted-foreground mb-6">
                This attempt has no questions to review.
              </p>
              <Link href="/dashboard">
                <Button>
                  <Home className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const currentQuestion = examQuestions[currentQuestionIndex];
  const userAnswer = userResponses[currentQuestion.id.toString()];
  const isCorrect = userAnswer === currentQuestion.correctAnswer;

  // Calculate statistics
  const totalQuestions = examQuestions.length;
  const answeredQuestions = Object.keys(userResponses).length;
  const correctAnswers = examQuestions.filter(q => 
    userResponses[q.id.toString()] === q.correctAnswer
  ).length;
  const incorrectAnswers = examQuestions.filter(q => 
    userResponses[q.id.toString()] && userResponses[q.id.toString()] !== q.correctAnswer
  ).length;
  const unanswered = totalQuestions - answeredQuestions;

  // Create question states for palette
  const questionStates = examQuestions.reduce((acc, q, index) => {
    const response = userResponses[q.id.toString()];
    acc[q.id] = {
      questionId: q.id,
      selectedAnswer: response || null,
      isMarkedForReview: false,
      isAnswered: !!response,
      timeSpent: 0,
    };
    return acc;
  }, {} as Record<number, any>);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${remainingSeconds}s`;
    }
    return `${minutes}m ${remainingSeconds}s`;
  };

  const goToQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < examQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const getQuestionStatus = (question: Question) => {
    const response = userResponses[question.id.toString()];
    if (!response) return 'unanswered';
    return response === question.correctAnswer ? 'correct' : 'incorrect';
  };

  const isLastQuestion = currentQuestionIndex === examQuestions.length - 1;

  return (
    <div className="min-h-screen bg-background">
      {/* Fixed Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                  <Home className="w-4 h-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Button>
              </Link>
              <div className="h-4 w-px bg-border"></div>
              <div>
                <h1 className="text-lg font-semibold">Review: {paper.title}</h1>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Badge variant="secondary">Review Mode</Badge>
                  <span>Question {currentQuestionIndex + 1} of {totalQuestions}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSolutions(!showSolutions)}
                className="flex items-center space-x-2"
              >
                {showSolutions ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                <span>{showSolutions ? 'Hide Solutions' : 'Show Solutions'}</span>
              </Button>

              {/* Question Palette Trigger */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-2" />
                    Questions
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[400px] sm:w-[540px]">
                  <QuestionPalette
                    questions={examQuestions}
                    questionStates={questionStates}
                    currentQuestionIndex={currentQuestionIndex}
                    onQuestionSelect={goToQuestion}
                    reviewMode={true}
                    userResponses={userResponses}
                  />
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Header */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Trophy className="w-5 h-5 text-primary" />
                <span>Attempt Summary</span>
              </CardTitle>
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span>Completed: {new Date(attempt.completedAt!).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-5 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-1">{attempt.score || 0}%</div>
                <div className="text-sm text-muted-foreground">Overall Score</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-success mb-1">{correctAnswers}</div>
                <div className="text-sm text-muted-foreground">Correct</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-destructive mb-1">{incorrectAnswers}</div>
                <div className="text-sm text-muted-foreground">Incorrect</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-muted-foreground mb-1">{unanswered}</div>
                <div className="text-sm text-muted-foreground">Unanswered</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-warning mb-1">
                  {formatTime(attempt.timeSpent || 0)}
                </div>
                <div className="text-sm text-muted-foreground">Time Taken</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Question Area */}
          <div className="lg:col-span-3">
            <QuestionDisplayCard
              question={currentQuestion}
              selectedAnswer={userAnswer}
              showSolution={showSolutions}
              mode="review"
              onAnswerSelect={undefined}
              onClearResponse={undefined}
              onMarkForReview={undefined}
            />
          </div>

          {/* Side Panel */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Question Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <Target className="w-5 h-5" />
                    <span>Question Status</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center mb-4">
                    {getQuestionStatus(currentQuestion) === 'correct' ? (
                      <div className="flex items-center space-x-2 text-success">
                        <CheckCircle className="w-8 h-8" />
                        <span className="font-semibold">Correct!</span>
                      </div>
                    ) : getQuestionStatus(currentQuestion) === 'incorrect' ? (
                      <div className="flex items-center space-x-2 text-destructive">
                        <XCircle className="w-8 h-8" />
                        <span className="font-semibold">Incorrect</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2 text-muted-foreground">
                        <AlertTriangle className="w-8 h-8" />
                        <span className="font-semibold">Not Attempted</span>
                      </div>
                    )}
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span>Your Answer:</span>
                      <span className={userAnswer ? 'font-medium' : 'text-muted-foreground'}>
                        {userAnswer || 'Not attempted'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Correct Answer:</span>
                      <span className="font-medium text-success">
                        {currentQuestion.correctAnswer}
                      </span>
                    </div>
                    {currentQuestion.subject && (
                      <div className="flex justify-between">
                        <span>Subject:</span>
                        <Badge variant="outline">{currentQuestion.subject}</Badge>
                      </div>
                    )}
                    {currentQuestion.difficulty && (
                      <div className="flex justify-between">
                        <span>Difficulty:</span>
                        <Badge variant={
                          currentQuestion.difficulty === 'Easy' ? 'default' : 
                          currentQuestion.difficulty === 'Medium' ? 'secondary' : 'destructive'
                        }>
                          {currentQuestion.difficulty}
                        </Badge>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Overall Progress */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Overall Progress</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div>
                      <div className="text-lg font-bold text-success">{correctAnswers}</div>
                      <div className="text-muted-foreground">Correct</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-destructive">{incorrectAnswers}</div>
                      <div className="text-muted-foreground">Wrong</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-muted-foreground">{unanswered}</div>
                      <div className="text-muted-foreground">Skipped</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Accuracy</span>
                      <span className="font-medium">
                        {answeredQuestions > 0 ? Math.round((correctAnswers / answeredQuestions) * 100) : 0}%
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-success rounded-full h-2 transition-all"
                        style={{ 
                          width: `${answeredQuestions > 0 ? (correctAnswers / answeredQuestions) * 100 : 0}%` 
                        }}
                      />
                    </div>
                  </div>

                  <Link href="/analysis">
                    <Button variant="outline" className="w-full" size="sm">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      View Detailed Analysis
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Desktop Question Palette */}
              <div className="hidden lg:block">
                <QuestionPalette
                  questions={examQuestions}
                  questionStates={questionStates}
                  currentQuestionIndex={currentQuestionIndex}
                  onQuestionSelect={goToQuestion}
                  reviewMode={true}
                  userResponses={userResponses}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Footer */}
        <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={previousQuestion}
                disabled={currentQuestionIndex === 0}
                className="flex items-center space-x-2"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </Button>

              <div className="flex items-center space-x-4">
                <span className="text-sm text-muted-foreground">
                  Question {currentQuestionIndex + 1} of {totalQuestions}
                </span>
              </div>

              {isLastQuestion ? (
                <Link href="/dashboard">
                  <Button className="flex items-center space-x-2">
                    <Home className="w-4 h-4" />
                    <span>Done</span>
                  </Button>
                </Link>
              ) : (
                <Button
                  onClick={nextQuestion}
                  className="flex items-center space-x-2"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
