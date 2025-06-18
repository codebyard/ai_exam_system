import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight,
  Clock,
  Flag,
  Eye,
  PlayCircle,
  PauseCircle,
  Home,
  AlertTriangle
} from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import NavigationMenu from '@/components/NavigationMenu';
import QuestionDisplayCard from '@/components/QuestionDisplayCard';
import QuestionPalette from '@/components/QuestionPalette';
import Timer from '@/components/Timer';
import { useExamStore } from '@/lib/examStore';
import { useAuthContext } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { isUnauthorizedError } from '@/lib/authUtils';
import { apiRequest } from '@/lib/queryClient';
import { mockQuestions } from '@/lib/mockData';
import type { Paper, Question } from '@shared/schema';

export default function ExamSimulation() {
  const { paperId } = useParams<{ paperId: string }>();
  const [location] = useLocation();
  const { user, isLoading: authLoading } = useAuthContext();
  const { toast } = useToast();
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [showSolution, setShowSolution] = useState(false);

  // Get mode from URL params
  const urlParams = new URLSearchParams(location.split('?')[1] || '');
  const mode = (urlParams.get('mode') as 'exam' | 'browse') || 'exam';

  const {
    session,
    startSession,
    endSession,
    goToQuestion,
    nextQuestion,
    previousQuestion,
    selectAnswer,
    clearAnswer,
    toggleMarkForReview,
    updateTimer,
    getCurrentQuestion,
    getQuestionState,
    getSessionSummary,
    pauseSession,
    resumeSession
  } = useExamStore();

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

  const { data: paper, isLoading: paperLoading } = useQuery<Paper>({
    queryKey: [`/api/papers/${paperId}`],
    retry: false,
  });

  const { data: questions, isLoading: questionsLoading } = useQuery<Question[]>({
    queryKey: [`/api/papers/${paperId}/questions`],
    retry: false,
    enabled: !!paperId,
  });

  // Start session when data is loaded
  useEffect(() => {
    if (paper && questions && !session) {
      const duration = mode === 'exam' ? paper.duration || 180 : 0;
      startSession(paper.id, questions, mode, duration);
    }
  }, [paper, questions, session, mode, startSession]);

  // Timer update effect
  useEffect(() => {
    if (session?.isTimerRunning) {
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    }
  }, [session?.isTimerRunning, updateTimer]);

  // Auto-submit when timer reaches 0
  useEffect(() => {
    if (session?.timeRemaining === 0 && mode === 'exam') {
      handleSubmitExam();
    }
  }, [session?.timeRemaining, mode]);

  const submitAttemptMutation = useMutation({
    mutationFn: async (attemptData: any) => {
      return await apiRequest('POST', '/api/attempts', attemptData);
    },
    onSuccess: () => {
      toast({
        title: "Exam Submitted Successfully",
        description: "Your responses have been saved.",
      });
      endSession();
      window.location.href = '/dashboard';
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Submission Failed",
        description: "Failed to submit exam. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmitExam = async () => {
    if (!session || mode !== 'exam') return;

    const summary = getSessionSummary();
    const responses: Record<number, string> = {};
    
    session.questions.forEach(q => {
      const state = getQuestionState(q.id);
      if (state.selectedAnswer) {
        responses[q.id] = state.selectedAnswer;
      }
    });

    // Calculate score
    let correctAnswers = 0;
    session.questions.forEach(q => {
      const state = getQuestionState(q.id);
      if (state.selectedAnswer === q.correctAnswer) {
        correctAnswers++;
      }
    });

    const score = Math.round((correctAnswers / session.questions.length) * 100);
    const timeSpent = (session.timeRemaining > 0) 
      ? ((paper?.duration || 180) * 60) - session.timeRemaining 
      : (paper?.duration || 180) * 60;

    const attemptData = {
      paperId: session.paperId,
      mode: session.mode,
      responses,
      score,
      totalQuestions: session.questions.length,
      timeSpent,
      status: 'completed',
      completedAt: new Date(),
    };

    submitAttemptMutation.mutate(attemptData);
  };

  const handleQuestionSelect = (answer: string) => {
    const currentQuestion = getCurrentQuestion();
    if (currentQuestion) {
      selectAnswer(currentQuestion.id, answer);
    }
  };

  const handleClearResponse = () => {
    const currentQuestion = getCurrentQuestion();
    if (currentQuestion) {
      clearAnswer(currentQuestion.id);
    }
  };

  const handleMarkForReview = () => {
    const currentQuestion = getCurrentQuestion();
    if (currentQuestion) {
      toggleMarkForReview(currentQuestion.id);
    }
  };

  const handleTogglePause = () => {
    if (session?.isPaused) {
      resumeSession();
    } else {
      pauseSession();
    }
  };

  const handleShowSolution = () => {
    setShowSolution(!showSolution);
  };

  const handleBackToDashboard = () => {
    endSession();
    window.location.href = '/dashboard';
  };

  if (authLoading || paperLoading || questionsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading exam...</p>
        </div>
      </div>
    );
  }

  if (!paper || !questions || questions.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <NavigationMenu />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <AlertTriangle className="w-12 h-12 text-warning mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-4">Paper Not Available</h1>
              <p className="text-muted-foreground mb-6">
                The exam paper you're looking for is not available or has no questions.
              </p>
              <Button onClick={handleBackToDashboard}>
                <Home className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Use mock questions as fallback
  const examQuestions = questions.length > 0 ? questions : mockQuestions;
  const currentQuestion = getCurrentQuestion();
  const currentQuestionState = currentQuestion ? getQuestionState(currentQuestion.id) : null;
  const summary = getSessionSummary();

  if (!session || !currentQuestion) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Setting up exam...</p>
        </div>
      </div>
    );
  }

  const isLastQuestion = session.currentQuestionIndex === session.questions.length - 1;

  return (
    <div className="min-h-screen bg-background">
      {/* Fixed Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleBackToDashboard}
                className="flex items-center space-x-2"
              >
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </Button>
              <div className="h-4 w-px bg-border"></div>
              <div>
                <h1 className="text-lg font-semibold">{paper.title}</h1>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Badge variant={mode === 'exam' ? 'default' : 'secondary'}>
                    {mode === 'exam' ? 'Exam Mode' : 'Browse Mode'}
                  </Badge>
                  <span>Question {session.currentQuestionIndex + 1} of {session.questions.length}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {mode === 'exam' && session.timeRemaining > 0 && (
                <>
                  <Timer
                    initialTime={session.timeRemaining}
                    isRunning={session.isTimerRunning}
                    onTogglePause={handleTogglePause}
                    showControls={true}
                    size="sm"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleTogglePause}
                  >
                    {session.isPaused ? (
                      <PlayCircle className="w-4 h-4" />
                    ) : (
                      <PauseCircle className="w-4 h-4" />
                    )}
                  </Button>
                </>
              )}

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
                    questions={session.questions}
                    questionStates={session.questionStates}
                    currentQuestionIndex={session.currentQuestionIndex}
                    onQuestionSelect={goToQuestion}
                  />
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Question Area */}
          <div className="lg:col-span-3">
            <QuestionDisplayCard
              question={currentQuestion}
              selectedAnswer={currentQuestionState?.selectedAnswer}
              showSolution={mode === 'browse' ? showSolution : false}
              mode={mode === 'browse' ? 'browse' : 'exam'}
              isMarkedForReview={currentQuestionState?.isMarkedForReview}
              onAnswerSelect={handleQuestionSelect}
              onClearResponse={handleClearResponse}
              onMarkForReview={handleMarkForReview}
              onShowSolution={mode === 'browse' ? handleShowSolution : undefined}
            />
          </div>

          {/* Side Panel */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Summary Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Progress</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-success">{summary.answered}</p>
                      <p className="text-xs text-muted-foreground">Answered</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-warning">{summary.marked}</p>
                      <p className="text-xs text-muted-foreground">Marked</p>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-muted-foreground">{summary.unanswered}</p>
                    <p className="text-xs text-muted-foreground">Unanswered</p>
                  </div>
                </CardContent>
              </Card>

              {/* Desktop Question Palette */}
              <div className="hidden lg:block">
                <QuestionPalette
                  questions={session.questions}
                  questionStates={session.questionStates}
                  currentQuestionIndex={session.currentQuestionIndex}
                  onQuestionSelect={goToQuestion}
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
                disabled={session.currentQuestionIndex === 0}
                className="flex items-center space-x-2"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </Button>

              <div className="flex items-center space-x-4">
                {mode === 'exam' && (
                  <AlertDialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">
                        Submit Exam
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Submit Exam?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to submit your exam? You have answered {summary.answered} out of {summary.total} questions.
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleSubmitExam}
                          disabled={submitAttemptMutation.isPending}
                        >
                          {submitAttemptMutation.isPending ? 'Submitting...' : 'Submit'}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}

                {isLastQuestion ? (
                  mode === 'exam' ? (
                    <Button 
                      onClick={() => setIsSubmitDialogOpen(true)}
                      className="flex items-center space-x-2"
                    >
                      <Flag className="w-4 h-4" />
                      <span>Finish</span>
                    </Button>
                  ) : (
                    <Button 
                      onClick={handleBackToDashboard}
                      className="flex items-center space-x-2"
                    >
                      <Home className="w-4 h-4" />
                      <span>Done</span>
                    </Button>
                  )
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
      </div>
    </div>
  );
}
