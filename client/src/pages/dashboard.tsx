import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  TrendingUp, 
  Clock, 
  Trophy,
  Play,
  BarChart3,
  Zap,
  Eye,
  Target,
  ArrowRight,
  Calendar,
  Users,
  Award
} from 'lucide-react';
import NavigationMenu from '@/components/NavigationMenu';
import Footer from '@/components/Footer';
import ExamCard from '@/components/ExamCard';
import { useAuthContext } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { isUnauthorizedError } from '@/lib/authUtils';
import { mockExams } from '@/lib/mockData';
import { StatsLoader, ExamCardLoader } from '@/components/ui/loading';
import { PageLoadingWrapper } from '@/components/LoadingWrapper';
import type { Exam, Purchase, Attempt } from '@shared/schema';

export default function Dashboard() {
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

  const { data: exams, isLoading: examsLoading } = useQuery<Exam[]>({
    queryKey: ['/api/exams'],
    retry: false,
  });

  const { data: purchases, isLoading: purchasesLoading } = useQuery<Purchase[]>({
    queryKey: ['/api/user/purchases'],
    retry: false,
  });

  const { data: attempts, isLoading: attemptsLoading } = useQuery<Attempt[]>({
    queryKey: ['/api/user/attempts'],
    retry: false,
  });

  const isLoading = authLoading || examsLoading || purchasesLoading || attemptsLoading;

  if (isLoading) {
    return (
      <PageLoadingWrapper isLoading={isLoading}>
        <div className="min-h-screen bg-background">
          <NavigationMenu />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="animate-pulse space-y-8">
              <div className="h-8 bg-muted rounded w-1/3"></div>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-32 bg-muted rounded-lg"></div>
                ))}
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-64 bg-muted rounded-lg"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </PageLoadingWrapper>
    );
  }

  const allExams = exams || mockExams;
  const userPurchases = purchases || [];
  const userAttempts = attempts || [];
  
  const examAccessInfo = new Map(userPurchases.map(p => [p.examId, { hasAccess: true, type: p.type as 'free' | 'premium' }]));

  const myExams = allExams.filter(exam => examAccessInfo.has(exam.id));
  const exploreExams = allExams.filter(exam => !examAccessInfo.has(exam.id));

  // Calculate stats
  const totalAttempts = userAttempts.length;
  const completedAttempts = userAttempts.filter((a: any) => a.status === 'completed').length;
  const averageScore = userAttempts.length > 0 
    ? Math.round(userAttempts.reduce((sum: number, a: any) => sum + (a.score || 0), 0) / userAttempts.length)
    : 0;

  return (
    <PageLoadingWrapper isLoading={isLoading}>
      <div className="min-h-screen bg-background">
        <NavigationMenu />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Welcome back, {user?.firstName || 'Student'}! 👋
            </h1>
            <p className="text-muted-foreground">
              Ready to ace your next exam? Let's continue your preparation journey.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="mb-8">
            {isLoading ? (
              <StatsLoader />
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Attempts</CardTitle>
                    <Target className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{attempts?.length || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      +{Math.floor(Math.random() * 5) + 1} from last week
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {attempts && attempts.length > 0 
                        ? Math.round(attempts.reduce((sum, a) => sum + (a.score || 0), 0) / attempts.length)
                        : 0}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      +{Math.floor(Math.random() * 10) + 5}% from last month
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Study Time</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {attempts && attempts.length > 0 
                        ? Math.round(attempts.reduce((sum, a) => sum + (a.timeSpent || 0), 0) / 60)
                        : 0}h
                    </div>
                    <p className="text-xs text-muted-foreground">
                      +{Math.floor(Math.random() * 3) + 1}h this week
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Exams Enrolled</CardTitle>
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{purchases?.length || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      {purchases && purchases.length > 0 ? 'Active subscriptions' : 'No enrollments yet'}
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">Recent Activity</h2>
              <Link href="/analysis">
                <Button variant="outline" size="sm">
                  View All
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>

            {isLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <ExamCardLoader key={i} />
                ))}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {attempts && attempts.slice(0, 6).map((attempt, index) => {
                  // For now, we'll use a placeholder since we don't have examId in attempts
                  const examName = `Exam ${attempt.paperId || 'Unknown'}`;
                  return (
                    <Card key={attempt.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{examName}</CardTitle>
                          <Badge variant={attempt.status === 'completed' ? 'default' : 'secondary'}>
                            {attempt.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Score</span>
                            <span className="font-medium">{attempt.score || 0}%</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Duration</span>
                            <span className="font-medium">{Math.round((attempt.timeSpent || 0) / 60)}m</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Date</span>
                            <span className="font-medium">
                              {attempt.startedAt ? new Date(attempt.startedAt).toLocaleDateString() : 'Unknown'}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* My Exams (if user has enrollments) */}
          {myExams.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-foreground">My Exams</h2>
                <Badge variant="secondary">{myExams.length} Enrolled</Badge>
              </div>

              {isLoading ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(Math.min(myExams.length, 6))].map((_, i) => (
                    <ExamCardLoader key={i} />
                  ))}
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myExams.slice(0, 6).map((exam) => (
                    <div key={exam.id} className="relative">
                      <ExamCard 
                        exam={exam} 
                        userAccess={examAccessInfo.get(exam.id)}
                      />
                      {/* Access badge - positioned to avoid overlap with popular badge */}
                      <div className={`absolute top-3 text-xs font-bold px-3 py-1 rounded-full shadow-lg border-2 z-20 ${
                        exam.isPopular 
                          ? 'left-3 bg-success text-success-foreground border-success' 
                          : 'right-3 bg-success text-success-foreground border-success'
                      }`}>
                        {examAccessInfo.get(exam.id)?.type === 'premium' ? 'Premium' : 'Free'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Available Exams (unenrolled exams) */}
          {exploreExams.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-foreground">
                  {myExams.length > 0 ? 'Explore More Exams' : 'Available Exams'}
                </h2>
                <Link href="/dashboard">
                  <Button variant="outline" size="sm">
                    View All
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>

              {isLoading ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <ExamCardLoader key={i} />
                  ))}
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {exploreExams.slice(0, 6).map((exam) => (
                    <div key={exam.id} className="relative">
                      <ExamCard 
                        exam={exam} 
                        userAccess={{ hasAccess: false, type: null }}
                      />
                      {/* Enrollment badge - positioned to avoid overlap with popular badge */}
                      <div className={`absolute top-3 text-xs font-bold px-3 py-1 rounded-full shadow-lg border-2 z-20 ${
                        exam.isPopular 
                          ? 'left-3 bg-warning text-warning-foreground border-warning' 
                          : 'right-3 bg-warning text-warning-foreground border-warning'
                      }`}>
                        Enroll for ₹99
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Show message if no exams available */}
          {!isLoading && myExams.length === 0 && exploreExams.length === 0 && (
            <div className="mb-8">
              <Card>
                <CardContent className="p-8 text-center">
                  <h3 className="text-lg font-semibold mb-2">No Exams Available</h3>
                  <p className="text-muted-foreground mb-4">
                    There are currently no exams available. Please check back later.
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  <span>Performance Analytics</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Get detailed insights into your performance and identify areas for improvement.
                </p>
                <Link href="/analysis">
                  <Button className="w-full">
                    View Analytics
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-primary" />
                  <span>AI Doubt Clearing</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Get instant help with difficult questions and concepts from our AI tutor.
                </p>
                <Link href="/doubt-clearing">
                  <Button className="w-full">
                    Ask Questions
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>

        <Footer />
      </div>
    </PageLoadingWrapper>
  );
}
