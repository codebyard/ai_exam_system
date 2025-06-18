import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  TrendingUp, 
  Clock, 
  Trophy,
  Play,
  BarChart3,
  Zap,
  Eye
} from 'lucide-react';
import NavigationMenu from '@/components/NavigationMenu';
import Footer from '@/components/Footer';
import ExamCard from '@/components/ExamCard';
import { useAuthContext } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { isUnauthorizedError } from '@/lib/authUtils';
import { mockExams } from '@/lib/mockData';
import type { Exam, Purchase } from '@shared/schema';

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

  const { data: attempts, isLoading: attemptsLoading } = useQuery({
    queryKey: ['/api/user/attempts'],
    retry: false,
  });

  if (authLoading || examsLoading) {
    return (
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
    );
  }

  const allExams = exams || mockExams;
  const userPurchases = purchases || [];
  const userAttempts = attempts || [];

  // Get purchased exam IDs
  const purchasedExamIds = new Set(userPurchases.map(p => p.examId));
  
  // Separate purchased and unpurchased exams
  const purchasedExams = allExams.filter(exam => purchasedExamIds.has(exam.id));
  const unpurchasedExams = allExams.filter(exam => !purchasedExamIds.has(exam.id));

  // Calculate stats
  const totalAttempts = userAttempts.length;
  const completedAttempts = userAttempts.filter((a: any) => a.status === 'completed').length;
  const averageScore = userAttempts.length > 0 
    ? Math.round(userAttempts.reduce((sum: number, a: any) => sum + (a.score || 0), 0) / userAttempts.length)
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <NavigationMenu />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome back, {user?.firstName || 'Student'}! 👋
          </h1>
          <p className="text-muted-foreground">
            Ready to continue your exam preparation journey?
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Attempts</p>
                  <p className="text-2xl font-bold text-foreground">{totalAttempts}</p>
                </div>
                <BookOpen className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold text-foreground">{completedAttempts}</p>
                </div>
                <Trophy className="w-8 h-8 text-success" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Average Score</p>
                  <p className="text-2xl font-bold text-foreground">{averageScore}%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-warning" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Purchased Exams</p>
                  <p className="text-2xl font-bold text-foreground">{purchasedExams.length}</p>
                </div>
                <Clock className="w-8 h-8 text-destructive" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Start Actions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-primary" />
              <span>Quick Start</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button className="flex items-center space-x-2">
                <Play className="w-4 h-4" />
                <span>Start Instant Test</span>
              </Button>
              <Link href="/analysis">
                <Button variant="outline" className="flex items-center space-x-2">
                  <BarChart3 className="w-4 h-4" />
                  <span>My Performance Analytics</span>
                </Button>
              </Link>
              <Link href="/doubt-clearing">
                <Button variant="outline" className="flex items-center space-x-2">
                  <span>🤖</span>
                  <span>AI Doubt Clearing</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* My Exams Section */}
        {purchasedExams.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">My Exams</h2>
              <Badge variant="secondary">{purchasedExams.length} Purchased</Badge>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {purchasedExams.map(exam => (
                <ExamCard
                  key={exam.id}
                  exam={exam}
                  hasPremiumAccess={true}
                  showPricing={false}
                />
              ))}
            </div>
          </div>
        )}

        {/* Explore More Exams */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">
              {purchasedExams.length > 0 ? 'Explore More Exams' : 'Available Exams'}
            </h2>
            <Badge variant="outline">{unpurchasedExams.length} Available</Badge>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {unpurchasedExams.slice(0, 6).map(exam => (
              <ExamCard
                key={exam.id}
                exam={exam}
                hasPremiumAccess={false}
                showPricing={true}
              />
            ))}
          </div>
          {unpurchasedExams.length > 6 && (
            <div className="text-center mt-6">
              <Button variant="outline">
                <Eye className="w-4 h-4 mr-2" />
                View All Exams
              </Button>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        {userAttempts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userAttempts.slice(0, 5).map((attempt: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div>
                      <p className="font-medium">Paper #{attempt.paperId}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(attempt.startedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{attempt.score || 0}%</p>
                      <Badge variant={attempt.status === 'completed' ? 'default' : 'secondary'}>
                        {attempt.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Footer />
    </div>
  );
}
