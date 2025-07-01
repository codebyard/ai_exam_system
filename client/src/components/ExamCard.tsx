import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock, Star, Lock, Crown } from "lucide-react";
import { Link } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Exam } from "@shared/schema";

interface ExamCardProps {
  exam: Exam;
  userAccess?: { hasAccess: boolean; type: 'free' | 'premium' | null };
  showActions?: boolean;
  showAccessBadge?: boolean;
}

export default function ExamCard({ exam, userAccess, showActions = true, showAccessBadge = false }: ExamCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const enrollFreeMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', `/api/exams/${exam.id}/enroll-free`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/purchases'] });
      queryClient.invalidateQueries({ queryKey: [`/api/exams/${exam.id}/access`] });
      toast({
        title: "Enrolled Successfully!",
        description: `You now have free access to ${exam.name} recent papers.`,
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Enrollment Failed",
        description: error.message || "Failed to enroll for free access",
        variant: "destructive",
      });
    },
  });

  const purchaseMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('/api/purchases', 'POST', {
        examId: exam.id,
        type: 'premium',
        amount: '99.00',
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/purchases'] });
      queryClient.invalidateQueries({ queryKey: [`/api/exams/${exam.id}/access`] });
      toast({
        title: "Purchase Successful!",
        description: `You now have full access to all ${exam.name} papers.`,
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Purchase Failed",
        description: error.message || "Failed to purchase full access",
        variant: "destructive",
      });
    },
  });

  const handleEnrollFree = () => {
    enrollFreeMutation.mutate();
  };

  const handlePurchaseFull = () => {
    purchaseMutation.mutate();
  };

  const renderActionButtons = () => {
    if (!showActions) return null;

    // User has premium access
    if (userAccess?.hasAccess && userAccess.type === 'premium') {
      return (
        <Link href={`/exams/${exam.id}`}>
          <Button className="w-full bg-purple-600 hover:bg-purple-700">
            <Crown className="h-4 w-4 mr-2" />
            Access All Papers
          </Button>
        </Link>
      );
    }

    // User has free access
    if (userAccess?.hasAccess && userAccess.type === 'free') {
      return (
        <div className="space-y-2">
          <Link href={`/exams/${exam.id}`}>
            <Button variant="outline" className="w-full">
              <BookOpen className="h-4 w-4 mr-2" />
              View Free Papers
            </Button>
          </Link>
          <Button 
            onClick={handlePurchaseFull}
            disabled={purchaseMutation.isPending}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            <Crown className="h-4 w-4 mr-2" />
            {purchaseMutation.isPending ? "Processing..." : "Upgrade to Premium - ₹99"}
          </Button>
        </div>
      );
    }

    // User has no access
    return (
      <div className="space-y-2">
        <Button 
          onClick={handleEnrollFree}
          disabled={enrollFreeMutation.isPending}
          variant="outline" 
          className="w-full"
        >
          <Lock className="h-4 w-4 mr-2" />
          {enrollFreeMutation.isPending ? "Enrolling..." : "Enroll Free"}
        </Button>
        <Button 
          onClick={handlePurchaseFull}
          disabled={purchaseMutation.isPending}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          <Crown className="h-4 w-4 mr-2" />
          {purchaseMutation.isPending ? "Processing..." : "Purchase Full Access - ₹99"}
        </Button>
      </div>
    );
  };

  return (
    <Card className="hover:shadow-lg hover:shadow-primary/10 hover:border-primary/20 transition-all duration-300 group relative overflow-hidden">
      {exam.isPopular && (
        <div className="absolute top-3 left-3 z-10">
          <Badge className="bg-yellow-500 text-white">
            <Star className="h-3 w-3 mr-1" />
            Popular
          </Badge>
        </div>
      )}
      
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-primary/2 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <CardHeader className="relative">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="text-2xl">{exam.icon}</div>
            <div>
              <CardTitle className="text-xl font-bold">{exam.name}</CardTitle>
              <CardDescription className="mt-1">{exam.description}</CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="relative space-y-4">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            <span>{exam.totalQuestions} Questions</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{exam.yearsAvailable} Years</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="text-xs">
            {exam.category}
          </Badge>
        </div>
        
        <div className="pt-2 border-t">
          <div className="flex items-center justify-between mb-3 text-sm">
            <div className="text-center">
              <div className="text-success font-medium">Free Access</div>
              <div className="text-muted-foreground">Recent 2 years</div>
            </div>
            <div className="text-center">
              <div className="text-purple-600 dark:text-purple-400 font-medium">Premium Access</div>
              <div className="text-lg font-bold">₹99</div>
            </div>
          </div>
          
          {renderActionButtons()}
        </div>
        
        <Link href={`/exams/${exam.id}`}>
          <Button variant="ghost" className="w-full mt-2 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
            View Details
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}