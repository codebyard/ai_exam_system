import { useEffect } from 'react';
import { useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, HelpCircle, Zap, Crown } from 'lucide-react';
import { Link } from 'wouter';
import NavigationMenu from '@/components/NavigationMenu';
import Footer from '@/components/Footer';
import YearCard from '@/components/YearCard';
import { useAuthContext } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { mockExams, mockPapers } from '@/lib/mockData';
import type { Exam, Paper } from '@shared/schema';

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

  const { data: accessInfo, isLoading: accessLoading } = useQuery({
    queryKey: [`/api/exams/${examId}/access`],
    retry: false,
  });

  if (authLoading || examLoading || papersLoading) {
    return (
      <div className="min-h-screen bg-background">
        <NavigationMenu />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-32 bg-muted rounded-lg"></div>
            <div className="grid gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 bg-muted rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Use mock data as fallback
  const currentExam = exam || mockExams.find(e => e.id === parseInt(examId || '0'));
  const examPapers = papers || mockPapers.filter(p => p.examId === parseInt(examId || '0'));
  const hasAccess = accessInfo?.hasAccess || false;

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

  const handleStartExam = (paperId: number) => {
    // Navigate to exam simulation
    window.location.href = `/exam-simulation/${paperId}?mode=exam`;
  };

  const handleBrowsePaper = (paperId: number) => {
    // Navigate to browse mode
    window.location.href = `/exam-simulation/${paperId}?mode=browse`;
  };

  const handleReviewAttempt = (paperId: number) => {
    // Navigate to review attempt (you'd need to find the attempt ID)
    window.location.href = `/review/1`; // Placeholder
  };

  const handleInstantTest = () => {
    // Start instant test mode
    toast({
      title: "Starting Instant Test",
      description: "Preparing random questions for practice...",
    });
    // You would implement instant test logic here
  };

  const handlePurchaseAccess = () => {
    // Handle payment flow
    toast({
      title: "Purchase Access",
      description: "Redirecting to payment page...",
    });
    // You would implement Stripe payment flow here
  };

  return (
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
            <div className="grid md:grid-cols-3 gap-6">
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
                <Crown className="w-5 h-5 text-warning" />
                <div>
                  <p className="font-medium">
                    {hasAccess ? 'Full Access' : 'Free + Premium'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {hasAccess ? 'All years unlocked' : '2 years free, rest ₹99'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-primary" />
              <span>Quick Actions</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button 
                onClick={handleInstantTest}
                className="flex items-center space-x-2"
              >
                <Zap className="w-4 h-4" />
                <span>Instant Test for {currentExam.name}</span>
              </Button>
              {!hasAccess && (
                <Button 
                  variant="outline"
                  onClick={handlePurchaseAccess}
                  className="flex items-center space-x-2"
                >
                  <Crown className="w-4 h-4" />
                  <span>Purchase Full Access (₹99)</span>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Year-wise Papers */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">Previous Year Papers</h2>
            <Badge variant="outline">{examPapers.length} Papers Available</Badge>
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
                <YearCard
                  key={paper.id}
                  paper={paper}
                  hasAccess={hasAccess || paper.isFree}
                  attemptStatus="new" // You would determine this from user attempts
                  onStartExam={() => handleStartExam(paper.id)}
                  onBrowsePaper={() => handleBrowsePaper(paper.id)}
                  onReviewAttempt={() => handleReviewAttempt(paper.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
