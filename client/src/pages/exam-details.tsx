import { useEffect } from 'react';
import { useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, HelpCircle, Zap, Crown, CheckCircle, Lock, Star } from 'lucide-react';
import { Link } from 'wouter';
import NavigationMenu from '@/components/NavigationMenu';
import Footer from '@/components/Footer';
import YearCard from '@/components/YearCard';
import InstantTestDialog from '@/components/InstantTestDialog';
import { useAuthContext } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { mockExams, mockPapers } from '@/lib/mockData';
import { PageLoadingWrapper } from '@/components/LoadingWrapper';
import type { Exam, Paper } from '@shared/schema';

type AccessInfo = {
  hasAccess: boolean;
  type: 'free' | 'premium' | null;
};

interface TestConfig {
  examId: number;
  examName: string;
  duration: number;
  subjects: string[];
  questionCount: number;
}

export default function ExamDetails() {
  const { examId } = useParams<{ examId: string }>();
  const { user, isLoading: authLoading } = useAuthContext();
  const { toast } = useToast();

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

  const { data: exam, isLoading: examLoading } = useQuery<Exam>({
    queryKey: [`/api/exams/${examId}`],
    retry: false,
  });

  const { data: papers, isLoading: papersLoading } = useQuery<Paper[]>({
    queryKey: [`/api/exams/${examId}/papers`],
    retry: false,
  });

  const { data: accessInfo, isLoading: accessLoading } = useQuery<AccessInfo>({
    queryKey: [`/api/exams/${examId}/access`],
    retry: false,
    enabled: !!user,
  });

  const isLoading = authLoading || examLoading || papersLoading || accessLoading;

  // Use mock data as fallback
  const currentExam = exam || mockExams.find(e => e.id === parseInt(examId || '0'));
  const examPapers = papers || mockPapers.filter(p => p.examId === parseInt(examId || '0'));
  const userAccess = accessInfo || { hasAccess: false, type: null };

  // Calculate access statistics
  const totalPapers = examPapers.length;
  const freePapers = examPapers.filter(p => p.isFree).length;
  const premiumPapers = totalPapers - freePapers;
  const hasPremiumAccess = userAccess.type === 'premium';
  const hasFreeAccess = userAccess.type === 'free';
  const accessiblePapers = hasPremiumAccess ? totalPapers : (hasFreeAccess ? freePapers : 0);

  const handleStartExam = (paperId: number) => {
    // Navigate to exam simulation
    window.location.href = `/exam-simulation/${paperId}?mode=exam`;
  };

  const handleBrowsePaper = (paperId: number) => {
    // Navigate to browse mode
    window.location.href = `/browse-paper/${paperId}`;
  };

  const handleReviewAttempt = (paperId: number) => {
    // Navigate to review attempt (you'd need to find the attempt ID)
    window.location.href = `/review/1`; // Placeholder
  };

  const handleInstantTest = (config: TestConfig) => {
    // Start instant test mode
    toast({
      title: "Starting Instant Test",
      description: `Preparing ${config.questionCount} questions for ${config.examName}...`,
    });
    
    // Navigate to instant test mode with the configuration
    // For now, we'll use a placeholder paper ID and add instant mode
    // In a real implementation, you'd create a virtual paper with random questions
    const instantPaperId = `instant-${config.examId}-${Date.now()}`;
    const queryParams = new URLSearchParams({
      mode: 'instant',
      duration: config.duration.toString(),
      subjects: config.subjects.join(','),
      questionCount: config.questionCount.toString(),
    });
    
    window.location.href = `/exam-simulation/${instantPaperId}?${queryParams.toString()}`;
  };

  const handlePurchaseAccess = () => {
    // Handle payment flow
    toast({
      title: "Purchase Access",
      description: "Redirecting to payment page...",
    });
    // You would implement Stripe payment flow here
  };

  if (!currentExam) {
    return (
      <div className="min-h-screen bg-background">
        <NavigationMenu />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <h1 className="text-2xl font-bold mb-4">Exam Not Found</h1>
              <p className="text-muted-foreground mb-6">
                The exam you're looking for doesn't exist or has been removed.
              </p>
              <Link href="/dashboard">
                <Button>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <PageLoadingWrapper 
      isLoading={isLoading}
      fallback={
        <div className="min-h-screen bg-background">
          <NavigationMenu />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-6">
              <div className="h-10 bg-muted rounded w-32"></div>
            </div>
            <div className="space-y-8">
              <div className="h-32 bg-muted rounded-lg"></div>
              <div className="grid gap-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-24 bg-muted rounded-lg"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      }
    >
      <div className="min-h-screen bg-background">
        <NavigationMenu />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Button */}
          <div className="mb-6">
            <Link href="/dashboard">
              <Button variant="ghost" className="flex items-center space-x-2">
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Dashboard</span>
              </Button>
            </Link>
          </div>

          {/* Access Status Banner */}
          <Card className={`mb-6 ${hasPremiumAccess ? 'bg-success/10 border-success/30' : hasFreeAccess ? 'bg-info/10 border-info/30' : 'bg-warning/10 border-warning/30'}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-full ${hasPremiumAccess ? 'bg-success/20' : hasFreeAccess ? 'bg-info/20' : 'bg-warning/20'}`}>
                    {hasPremiumAccess ? (
                      <CheckCircle className="w-6 h-6 text-success" />
                    ) : hasFreeAccess ? (
                      <CheckCircle className="w-6 h-6 text-info" />
                    ) : (
                      <Lock className="w-6 h-6 text-warning" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">
                      {hasPremiumAccess ? (
                        <span className="text-success">Premium Access Active</span>
                      ) : hasFreeAccess ? (
                        <span className="text-info">Free Access Active</span>
                      ) : (
                        <span className="text-warning">No Access</span>
                      )}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {hasPremiumAccess 
                        ? `You have premium access to all ${totalPapers} papers for ${currentExam.name}`
                        : hasFreeAccess
                        ? `You have free access to ${accessiblePapers} out of ${totalPapers} papers (${premiumPapers} premium papers locked)`
                        : `You have access to ${accessiblePapers} out of ${totalPapers} papers (${freePapers} free + ${premiumPapers} premium)`
                      }
                    </p>
                  </div>
                </div>
                {!hasPremiumAccess && (
                  <Button 
                    onClick={handlePurchaseAccess}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    Upgrade to Premium (₹99)
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Exam Header */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <span className="text-2xl">
                      {currentExam.icon === 'calculator' ? '🧮' : 
                       currentExam.icon === 'heartbeat' ? '❤️' : 
                       currentExam.icon === 'cogs' ? '⚙️' : '📚'}
                    </span>
                  </div>
                  <div>
                    <CardTitle className="text-3xl">{currentExam.name}</CardTitle>
                    <p className="text-muted-foreground mt-2">{currentExam.description}</p>
                  </div>
                </div>
                {currentExam.isPopular && (
                  <Badge className="bg-success/10 text-success">Popular</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-6">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{currentExam.yearsAvailable} Years Available</p>
                    <p className="text-sm text-muted-foreground">Previous question papers</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <HelpCircle className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{currentExam.totalQuestions?.toLocaleString()} Questions</p>
                    <p className="text-sm text-muted-foreground">Authentic PYQs</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <div>
                    <p className="font-medium">{accessiblePapers} Papers Accessible</p>
                    <p className="text-sm text-muted-foreground">
                      {hasPremiumAccess ? 'All papers unlocked' : hasFreeAccess ? `${freePapers} free papers` : `${freePapers} free + ${premiumPapers} premium`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Crown className="w-5 h-5 text-warning" />
                  <div>
                    <p className="font-medium">
                      {hasPremiumAccess ? 'Premium Active' : hasFreeAccess ? 'Free Plan' : 'No Plan'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {hasPremiumAccess ? 'Full features unlocked' : hasFreeAccess ? 'Upgrade for ₹99' : 'Enroll for free access'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upsell Banner for this exam */}
          {!hasPremiumAccess && (
            <Card className="mb-8 bg-gradient-to-r from-warning/10 to-primary/10 border border-warning/40 shadow-lg rounded-2xl">
              <CardContent className="flex flex-col md:flex-row items-center justify-between gap-8 p-8">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <Star className="w-6 h-6 text-warning" />
                    <h2 className="text-2xl font-bold text-primary">Unlock Premium for {currentExam.name}</h2>
                  </div>
                  <p className="text-lg text-muted-foreground max-w-2xl mb-4">
                    Get access to <b className="text-primary">{premiumPapers} additional papers</b>, detailed solutions, 
                    instant tests, performance analytics, and AI-powered doubt clearing. 
                    <b className="text-primary"> One-time payment of ₹99</b>, lifetime access!
                  </p>
                  {/* Why Go Premium Section */}
                  <div className="mt-4 p-4 rounded-xl bg-background/50 border border-muted">
                    <h3 className="font-bold text-foreground mb-3 text-lg flex items-center gap-2">
                      <span className="inline-block">
                        <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="10" fill="currentColor" className="text-accent" opacity=".15"/>
                          <path d="M12 8v4l2 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </span>
                      What you'll get with Premium:
                    </h3>
                    <ul className="list-none space-y-2 text-base text-foreground">
                      <li className="flex items-center gap-2">
                        <span>📚</span> 
                        <span>Access to <b>{premiumPapers} additional papers</b> for {currentExam.name}</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span>📝</span> 
                        <span><b>Detailed solutions and explanations</b> for every question</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span>⚡</span> 
                        <span>Generate <b>instant tests</b> for focused practice</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span>📈</span> 
                        <span><b>Performance analytics</b> and progress tracking</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span>🤖</span> 
                        <span><b>AI-powered doubt clearing</b> for tough questions</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span>🔒</span> 
                        <span><b>One-time payment</b>, lifetime access for this exam</span>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">₹99</div>
                    <div className="text-sm text-muted-foreground">One-time payment</div>
                  </div>
                  <Button 
                    size="lg" 
                    onClick={handlePurchaseAccess}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 text-xl px-10 py-5 rounded-full shadow-md transition-all duration-200"
                  >
                    <Crown className="w-5 h-5 mr-2" />
                    Upgrade Now
                  </Button>
                  <span className="text-xs text-muted-foreground">Safe & Secure Payment</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-primary" />
                <span>Quick Actions</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4 items-center">
                <InstantTestDialog
                  trigger={
                    <Button 
                      className="flex items-center space-x-2"
                      disabled={!hasPremiumAccess}
                    >
                      <Zap className="w-4 h-4" />
                      <span>Instant Test for {currentExam.name}</span>
                      {!hasPremiumAccess && <Lock className="w-3 h-3 ml-1" />}
                    </Button>
                  }
                  onStartTest={handleInstantTest}
                />
                {!hasPremiumAccess && (
                  <Button 
                    variant="outline"
                    onClick={handlePurchaseAccess}
                    className="flex items-center space-x-2 border-warning text-warning-foreground hover:bg-warning/20"
                  >
                    <Crown className="w-4 h-4" />
                    <span>Upgrade to Premium (₹99)</span>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Year-wise Papers */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">Previous Year Papers</h2>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{accessiblePapers}/{totalPapers} Papers Accessible</Badge>
                {!hasPremiumAccess && (
                  <Badge className="bg-warning/10 text-warning">
                    {premiumPapers} Papers Locked
                  </Badge>
                )}
              </div>
            </div>
            
            {examPapers.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">No papers available for this exam yet.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {examPapers.map(paper => (
                  <div className="relative" key={paper.id}>
                    <YearCard
                      paper={paper}
                      accessType={userAccess.type}
                      onStartExam={handleStartExam}
                      onBrowse={handleBrowsePaper}
                      onReviewAttempt={handleReviewAttempt}
                    />
                    {!hasPremiumAccess && !paper.isFree && (
                      <div className="absolute top-2 right-2 bg-warning text-warning-foreground text-xs font-bold px-3 py-1 rounded-full shadow border border-warning z-10">
                        <Lock className="w-3 h-3 inline mr-1" />
                        Premium Only
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <Footer />
      </div>
    </PageLoadingWrapper>
  );
}
