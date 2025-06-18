import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ArrowLeft, 
  TrendingUp, 
  Clock, 
  Target,
  Trophy,
  Calendar,
  Eye,
  BarChart3
} from 'lucide-react';
import { Link } from 'wouter';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import NavigationMenu from '@/components/NavigationMenu';
import Footer from '@/components/Footer';
import { useAuthContext } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { isUnauthorizedError } from '@/lib/authUtils';
import type { Attempt, Exam } from '@shared/schema';

export default function Analysis() {
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

  const { data: attempts, isLoading: attemptsLoading } = useQuery<Attempt[]>({
    queryKey: ['/api/user/attempts'],
    retry: false,
  });

  const { data: exams, isLoading: examsLoading } = useQuery<Exam[]>({
    queryKey: ['/api/exams'],
    retry: false,
  });

  if (authLoading || attemptsLoading || examsLoading) {
    return (
      <div className="min-h-screen bg-background">
        <NavigationMenu />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="grid md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-muted rounded-lg"></div>
              ))}
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="h-80 bg-muted rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const userAttempts = attempts || [];
  const allExams = exams || [];

  // Calculate analytics data
  const totalAttempts = userAttempts.length;
  const completedAttempts = userAttempts.filter(a => a.status === 'completed');
  const averageScore = completedAttempts.length > 0 
    ? Math.round(completedAttempts.reduce((sum, a) => sum + (a.score || 0), 0) / completedAttempts.length)
    : 0;
  const totalTimeSpent = userAttempts.reduce((sum, a) => sum + (a.timeSpent || 0), 0);
  const averageTimePerQuestion = totalAttempts > 0 
    ? Math.round(totalTimeSpent / userAttempts.reduce((sum, a) => sum + (a.totalQuestions || 0), 0))
    : 0;

  // Prepare chart data
  const scoreProgressData = completedAttempts
    .sort((a, b) => new Date(a.startedAt!).getTime() - new Date(b.startedAt!).getTime())
    .map((attempt, index) => ({
      attempt: index + 1,
      score: attempt.score || 0,
      date: new Date(attempt.startedAt!).toLocaleDateString(),
    }));

  // Mock subject-wise accuracy data (in real app, this would come from detailed attempt analysis)
  const subjectAccuracyData = [
    { subject: 'Mathematics', accuracy: 78, attempted: 45, correct: 35 },
    { subject: 'Physics', accuracy: 72, attempted: 40, correct: 29 },
    { subject: 'Chemistry', accuracy: 85, attempted: 35, correct: 30 },
    { subject: 'Biology', accuracy: 68, attempted: 30, correct: 20 },
  ];

  const performanceDistributionData = [
    { range: '0-25%', count: completedAttempts.filter(a => (a.score || 0) < 25).length, color: '#ef4444' },
    { range: '25-50%', count: completedAttempts.filter(a => (a.score || 0) >= 25 && (a.score || 0) < 50).length, color: '#f97316' },
    { range: '50-75%', count: completedAttempts.filter(a => (a.score || 0) >= 50 && (a.score || 0) < 75).length, color: '#eab308' },
    { range: '75-100%', count: completedAttempts.filter(a => (a.score || 0) >= 75).length, color: '#22c55e' },
  ];

  const handleAskAI = (topic: string) => {
    const question = `Why is my ${topic} performance weak? How can I improve?`;
    window.location.href = `/doubt-clearing?question=${encodeURIComponent(question)}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <NavigationMenu />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/dashboard">
              <Button variant="ghost" className="flex items-center space-x-2 mb-4">
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Dashboard</span>
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-foreground">My Performance Analytics</h1>
            <p className="text-muted-foreground mt-2">
              Track your progress and identify areas for improvement
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Select defaultValue="all">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Exam" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Exams</SelectItem>
                {allExams.map(exam => (
                  <SelectItem key={exam.id} value={exam.id.toString()}>
                    {exam.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Attempts</p>
                  <p className="text-3xl font-bold text-foreground">{totalAttempts}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {completedAttempts.length} completed
                  </p>
                </div>
                <BarChart3 className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Average Score</p>
                  <p className="text-3xl font-bold text-foreground">{averageScore}%</p>
                  <p className="text-xs text-success mt-1">
                    {averageScore >= 75 ? 'Excellent' : averageScore >= 60 ? 'Good' : 'Needs Improvement'}
                  </p>
                </div>
                <Target className="w-8 h-8 text-success" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Time per Question</p>
                  <p className="text-3xl font-bold text-foreground">{averageTimePerQuestion}s</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Average across all attempts
                  </p>
                </div>
                <Clock className="w-8 h-8 text-warning" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Best Score</p>
                  <p className="text-3xl font-bold text-foreground">
                    {completedAttempts.length > 0 ? Math.max(...completedAttempts.map(a => a.score || 0)) : 0}%
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Personal best
                  </p>
                </div>
                <Trophy className="w-8 h-8 text-warning" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Score Trend */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <span>Score Trend Over Time</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {scoreProgressData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={scoreProgressData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="attempt" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip 
                      formatter={(value) => [`${value}%`, 'Score']}
                      labelFormatter={(label) => `Attempt ${label}`}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="score" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No completed attempts yet</p>
                    <p className="text-sm">Take some exams to see your progress</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Subject-wise Accuracy */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Target className="w-5 h-5 text-success" />
                  <span>Subject-wise Accuracy</span>
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAskAI('weakest subject')}
                  className="flex items-center space-x-1"
                >
                  <span>🤖</span>
                  <span>Ask AI</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={subjectAccuracyData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis dataKey="subject" type="category" width={80} />
                  <Tooltip 
                    formatter={(value) => [`${value}%`, 'Accuracy']}
                  />
                  <Bar 
                    dataKey="accuracy" 
                    fill="hsl(var(--primary))"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Performance Distribution */}
        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Score Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={performanceDistributionData.filter(d => d.count > 0)}
                    dataKey="count"
                    nameKey="range"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ range, count }) => `${range}: ${count}`}
                  >
                    {performanceDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Subject Performance Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {subjectAccuracyData.map((subject, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{subject.subject}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground">
                          {subject.correct}/{subject.attempted}
                        </span>
                        <Badge 
                          variant={subject.accuracy >= 75 ? 'default' : subject.accuracy >= 60 ? 'secondary' : 'destructive'}
                        >
                          {subject.accuracy}%
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleAskAI(subject.subject)}
                          className="h-6 px-2"
                        >
                          🤖
                        </Button>
                      </div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary rounded-full h-2 transition-all"
                        style={{ width: `${subject.accuracy}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Attempts Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-primary" />
              <span>Recent Attempts</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {userAttempts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-medium">Paper</th>
                      <th className="text-left py-3 px-4 font-medium">Date</th>
                      <th className="text-left py-3 px-4 font-medium">Score</th>
                      <th className="text-left py-3 px-4 font-medium">Time</th>
                      <th className="text-left py-3 px-4 font-medium">Status</th>
                      <th className="text-left py-3 px-4 font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userAttempts.slice(0, 10).map((attempt, index) => (
                      <tr key={index} className="border-b border-border/50">
                        <td className="py-3 px-4">Paper #{attempt.paperId}</td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {new Date(attempt.startedAt!).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <Badge 
                            variant={
                              (attempt.score || 0) >= 75 ? 'default' : 
                              (attempt.score || 0) >= 60 ? 'secondary' : 'destructive'
                            }
                          >
                            {attempt.score || 0}%
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {Math.round((attempt.timeSpent || 0) / 60)}m
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={attempt.status === 'completed' ? 'default' : 'secondary'}>
                            {attempt.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          {attempt.status === 'completed' && (
                            <Link href={`/review/${attempt.id}`}>
                              <Button variant="ghost" size="sm">
                                <Eye className="w-4 h-4 mr-2" />
                                Review
                              </Button>
                            </Link>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">No attempts yet</p>
                <p className="text-sm text-muted-foreground">Take some exams to see your performance data</p>
                <Link href="/dashboard">
                  <Button className="mt-4">
                    Start Practicing
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}
