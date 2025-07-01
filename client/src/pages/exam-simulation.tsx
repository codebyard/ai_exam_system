import { useEffect, useState } from 'react';
import { useParams } from 'wouter';
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
  AlertTriangle,
  User,
  RotateCcw,
  Maximize2,
  Minimize2
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function ExamSimulation() {
  const { paperId } = useParams<{ paperId: string }>();
  const { user, isLoading: authLoading } = useAuthContext();
  const { toast } = useToast();
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showTimeUpModal, setShowTimeUpModal] = useState(false);

  // Get mode and instant test params from URL params
  const urlParams = new URLSearchParams(window.location.search);
  const mode = (urlParams.get('mode') as 'exam' | 'browse' | 'instant') || 'exam';
  const isInstantTest = mode === 'instant';
  
  // Instant test configuration
  const instantDuration = parseInt(urlParams.get('duration') || '60');
  const instantSubjects = urlParams.get('subjects')?.split(',') || [];
  const instantQuestionCount = parseInt(urlParams.get('questionCount') || '50');

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

  // Generate random questions for instant test
  const generateInstantQuestions = (): Question[] => {
    const questions: Question[] = [];
    const subjects = instantSubjects.length > 0 ? instantSubjects : ['Physics', 'Chemistry', 'Mathematics'];
    
    for (let i = 1; i <= instantQuestionCount; i++) {
      const subject = subjects[i % subjects.length];
      const options = [
        `Option A for question ${i}`,
        `Option B for question ${i}`,
        `Option C for question ${i}`,
        `Option D for question ${i}`
      ];
      const correctAnswerIndex = i % 4;
      
      questions.push({
        id: i,
        paperId: 0, // Virtual paper ID for instant test
        questionNumber: i,
        questionText: `This is a sample ${subject} question ${i} for instant test practice.`,
        options: options,
        correctAnswer: options[correctAnswerIndex],
        explanation: `Explanation for question ${i}: This is a practice question to help you prepare for your exam.`,
        subject: subject,
        topic: `${subject} Topic ${i % 5 + 1}`,
        difficulty: ['easy', 'medium', 'hard'][i % 3],
        createdAt: new Date(),
      });
    }
    
    return questions;
  };

  const { data: paper, isLoading: paperLoading } = useQuery<Paper>({
    queryKey: [`/api/papers/${paperId}`],
    retry: false,
    enabled: !isInstantTest, // Don't fetch paper for instant tests
  });

  const { data: questions, isLoading: questionsLoading } = useQuery<Question[]>({
    queryKey: [`/api/papers/${paperId}/questions`],
    retry: false,
    enabled: !!paperId && !isInstantTest, // Don't fetch questions for instant tests
  });

  // Use generated questions for instant test or fetched questions for regular tests
  const currentQuestions = isInstantTest ? generateInstantQuestions() : questions;
  const currentPaper = isInstantTest ? {
    id: 0,
    examId: 0,
    year: new Date().getFullYear(),
    title: 'Instant Test',
    totalQuestions: instantQuestionCount,
    duration: instantDuration,
    isFree: true,
    createdAt: new Date(),
  } : paper;

  // Start session when data is loaded
  useEffect(() => {
    if (currentPaper && currentQuestions && currentQuestions.length > 0 && !session) {
      const duration = mode === 'exam' || mode === 'instant' ? currentPaper.duration || 180 : 0;
      console.log('Starting session:', { mode, duration, questionsCount: currentQuestions.length });
      startSession(currentPaper.id, currentQuestions, mode, duration);
    }
  }, [currentPaper, currentQuestions, session, mode, startSession]);

  // Timer update effect
  useEffect(() => {
    if (session?.isTimerRunning) {
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    }
  }, [session?.isTimerRunning, updateTimer]);

  // Auto-submit when timer reaches 0
  useEffect(() => {
    if (session?.timeRemaining === 0 && (mode === 'exam' || mode === 'instant')) {
      setShowTimeUpModal(true);
      setTimeout(() => {
        handleSubmitExam();
      }, 2000); // 2 seconds delay for modal
    }
  }, [session?.timeRemaining, mode]);

  const submitAttemptMutation = useMutation({
    mutationFn: async (attemptData: any) => {
      console.log('Submitting attempt data:', attemptData);
      return await apiRequest('POST', '/api/attempts', attemptData);
    },
    onSuccess: (data: any) => {
      toast({
        title: isInstantTest ? "Instant Test Completed" : "Exam Submitted Successfully",
        description: isInstantTest ? "Your instant test has been completed!" : "Your responses have been saved.",
      });
      endSession();
      // Try to redirect to review page if attempt id is present
      const attemptId = data?.id || data?.attemptId;
      if (attemptId) {
        window.location.href = `/review/${attemptId}`;
      } else {
        window.location.href = '/dashboard';
      }
    },
    onError: (error) => {
      console.error('Attempt submission error:', error);
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
        description: error.message || "Failed to submit exam. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmitExam = async () => {
    if (!session || (mode !== 'exam' && mode !== 'instant')) return;

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
      if (state.selectedAnswer) {
        // Handle different correctAnswer formats
        let isCorrect = false;
        if (typeof q.correctAnswer === 'string' && q.correctAnswer.length === 1) {
          // If correctAnswer is just a letter (A, B, C, D), find the corresponding option
          const letterIndex = q.correctAnswer.charCodeAt(0) - 65; // A=0, B=1, C=2, D=3
          if (Array.isArray(q.options)) {
            isCorrect = q.options[letterIndex] === state.selectedAnswer;
          } else if (typeof q.options === 'string') {
            try {
              const parsedOptions = JSON.parse(q.options);
              if (Array.isArray(parsedOptions)) {
                isCorrect = parsedOptions[letterIndex] === state.selectedAnswer;
              }
            } catch (error) {
              console.warn('Failed to parse options for score calculation:', error);
            }
          }
        } else {
          // If correctAnswer is the full text, compare directly
          isCorrect = state.selectedAnswer === q.correctAnswer;
        }
        
        if (isCorrect) {
          correctAnswers++;
        }
      }
    });

    const score = Math.round((correctAnswers / session.questions.length) * 100);
    const timeSpent = (session.timeRemaining > 0) 
      ? ((currentPaper?.duration || 180) * 60) - session.timeRemaining 
      : (currentPaper?.duration || 180) * 60;

    const attemptData = {
      paperId: isInstantTest ? null : session.paperId,
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

  // Timer color logic
  const timerWarning = session && session.timeRemaining <= 5 * 60;

  // Fullscreen handlers
  const handleToggleFullscreen = () => {
    if (!isFullscreen) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };
  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  useEffect(() => {
    if (mode === 'exam' || mode === 'instant') {
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        e.preventDefault();
        e.returnValue = '';
        return '';
      };
      window.addEventListener('beforeunload', handleBeforeUnload);
      return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }
  }, [mode]);

  if (authLoading || (!isInstantTest && (paperLoading || questionsLoading))) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            {isInstantTest ? "Preparing instant test..." : "Loading exam..."}
          </p>
        </div>
      </div>
    );
  }

  // For instant tests, check if we have the required data
  if (isInstantTest && (!currentQuestions || currentQuestions.length === 0)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-warning mx-auto mb-4" />
          <p className="text-muted-foreground">Failed to generate instant test questions</p>
          <Button onClick={handleBackToDashboard} className="mt-4">
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            {isInstantTest ? "Failed to start instant test session" : "Failed to load exam session"}
          </p>
          <Button onClick={handleBackToDashboard} className="mt-4">
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const currentQuestion = getCurrentQuestion();
  const questionState = currentQuestion ? getQuestionState(currentQuestion.id) : null;
  const summary = getSessionSummary();

  return (
    <div className="min-h-screen bg-background">
      {/* Time Up Modal */}
      <Dialog open={showTimeUpModal}>
        <DialogContent className="max-w-md text-center">
          <DialogHeader>
            <DialogTitle>Time's up!</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-lg font-semibold text-destructive">Your exam is being submitted automatically.</p>
            <p className="text-muted-foreground mt-2">Please wait...</p>
          </div>
        </DialogContent>
      </Dialog>
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-background border-b border-border shadow-sm flex items-center justify-between px-6 h-16">
        <div className="flex items-center gap-4">
          <span className="text-xl font-bold text-primary">{isInstantTest ? 'Instant Test' : currentPaper?.title}</span>
          <Badge variant="secondary">Simulation</Badge>
        </div>
        <div className="flex items-center gap-6">
          {/* Timer */}
          {mode === 'exam' || mode === 'instant' ? (
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-lg font-bold ${timerWarning ? 'bg-red-100 text-red-700 border border-red-300 animate-pulse' : 'bg-muted text-foreground'}`}>
              <Clock className="w-5 h-5" />
              <Timer 
                timeRemaining={session.timeRemaining}
                isRunning={session.isTimerRunning}
                onTogglePause={handleTogglePause}
              />
            </div>
          ) : null}
          {/* Fullscreen Toggle */}
          <Button variant="ghost" size="icon" onClick={handleToggleFullscreen} aria-label="Toggle Fullscreen">
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </Button>
          {/* User Info */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="w-5 h-5" />
            Demo User
          </div>
          {/* All changes saved indicator */}
          <span className="text-xs text-green-600 font-medium hidden md:inline-block">All changes saved</span>
          {/* Instructions Button */}
          <Dialog open={showInstructions} onOpenChange={setShowInstructions}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">Instructions</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Exam Instructions</DialogTitle>
              </DialogHeader>
              <div className="prose dark:prose-invert max-w-none">
                <ul className="list-disc pl-6 space-y-2">
                  <li>Read all questions carefully. Each question may have one correct answer.</li>
                  <li>Use the palette to navigate between questions. Color codes indicate your progress.</li>
                  <li>Mark questions for review if you want to revisit them later.</li>
                  <li>Click "Clear Response" to remove your answer for a question.</li>
                  <li>Timer is visible at the top. The exam will auto-submit when time is up.</li>
                  <li>Click "Submit" when you are done. You cannot change answers after submission.</li>
                  <li>Do not refresh or close the browser tab during the exam.</li>
                </ul>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>
      {/* Spacer for header */}
      <div className="h-16" />
      <NavigationMenu />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={handleBackToDashboard}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-2xl font-bold">
                {isInstantTest ? 'Instant Test' : currentPaper?.title}
              </h1>
              <p className="text-muted-foreground">
                {isInstantTest 
                  ? `${instantQuestionCount} questions • ${instantDuration} minutes • ${instantSubjects.join(', ')}`
                  : `${(currentQuestions ? currentQuestions.length : 0)} questions • ${currentPaper?.duration || 180} minutes`}
              </p>
            </div>
          </div>
        </div>
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {currentQuestion && (
              <QuestionDisplayCard
                question={currentQuestion}
                selectedAnswer={questionState?.selectedAnswer}
                isMarkedForReview={questionState?.isMarkedForReview}
                showSolution={showSolution}
                onAnswerSelect={handleQuestionSelect}
                onClearResponse={handleClearResponse}
                onMarkForReview={handleMarkForReview}
                onShowSolution={handleShowSolution}
                mode={mode}
              />
            )}
          </div>
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <QuestionPalette
              questions={session.questions}
              questionStates={session.questionStates}
              currentQuestionIndex={session.currentQuestionIndex}
              onQuestionSelect={goToQuestion}
            />
          </div>
        </div>
      </div>
      {/* Fixed Footer */}
      <footer className="fixed bottom-0 left-0 right-0 z-40 bg-background border-t border-border shadow flex items-center justify-center px-6 h-20">
        <div className="flex w-full max-w-5xl items-center justify-between gap-4">
          {/* Navigation */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={previousQuestion}
              disabled={session.currentQuestionIndex === 0}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Question {session.currentQuestionIndex + 1} of {session.questions.length}
            </span>
            <Button
              variant="outline"
              onClick={nextQuestion}
              disabled={session.currentQuestionIndex === session.questions.length - 1}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleClearResponse}
              disabled={!questionState?.selectedAnswer}
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              Clear Response
            </Button>
            <Button
              variant={questionState?.isMarkedForReview ? "default" : "outline"}
              onClick={handleMarkForReview}
            >
              <Flag className="w-4 h-4 mr-1" />
              {questionState?.isMarkedForReview ? 'Marked' : 'Mark for Review'}
            </Button>
            {(mode === 'exam' || mode === 'instant') && (
              <AlertDialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
                <AlertDialogTrigger asChild>
                  <Button size="lg" className="bg-primary hover:bg-primary/90">
                    Submit {isInstantTest ? 'Instant Test' : 'Exam'}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Submit {isInstantTest ? 'Instant Test' : 'Exam'}?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to submit your {isInstantTest ? 'instant test' : 'exam'}? 
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleSubmitExam}>
                      Submit
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}