import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Eye, RotateCcw, Lock, CheckCircle, Crown } from 'lucide-react';
import type { Paper } from '@shared/schema';

interface YearCardProps {
  paper: Paper;
  accessType: 'free' | 'premium' | null;
  attemptStatus?: 'new' | 'attempted' | 'completed';
  onStartExam: (paperId: number) => void;
  onBrowse: (paperId: number) => void;
  onReviewAttempt: (paperId: number) => void;
}

export default function YearCard({ 
  paper, 
  accessType,
  attemptStatus = 'new',
  onStartExam,
  onBrowse,
  onReviewAttempt 
}: YearCardProps) {
  const hasPremiumAccess = accessType === 'premium';
  const hasFreeAccess = accessType === 'free';
  const canAccessPaper = hasPremiumAccess || (paper.isFree && hasFreeAccess);

  const getStatusBadge = () => {
    switch (attemptStatus) {
      case 'completed':
        return <Badge variant="secondary" className="bg-success/10 text-success">Completed</Badge>;
      case 'attempted':
        return <Badge variant="secondary" className="bg-warning/10 text-warning">Attempted</Badge>;
      default:
        return <Badge variant="outline">New</Badge>;
    }
  };

  const getAccessBadge = () => {
    if (canAccessPaper) {
      return (
        <Badge className="bg-success/10 text-success border-success/30">
          <CheckCircle className="w-3 h-3 mr-1" />
          Accessible
        </Badge>
      );
    }
    
    if (paper.isFree) {
      return (
        <Badge className="bg-info/10 text-info border-info/30">
          Free - Enroll to Access
        </Badge>
      );
    }
    
    return (
      <Badge className="bg-warning/10 text-warning border-warning/30">
        <Crown className="w-3 h-3 mr-1" />
        Premium Only
      </Badge>
    );
  };

  return (
    <Card className={`hover:shadow-lg transition-all duration-300 ${
      !canAccessPaper ? 'opacity-75 border-dashed' : ''
    }`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-semibold">{paper.title}</h3>
              {!canAccessPaper && <Lock className="w-4 h-4 text-muted-foreground" />}
            </div>
            <p className="text-sm text-muted-foreground">
              {paper.totalQuestions} Questions • {paper.duration} Minutes
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {getStatusBadge()}
            {getAccessBadge()}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {canAccessPaper ? (
            <>
              <Button
                size="sm"
                onClick={() => onStartExam(paper.id)}
                className="flex items-center space-x-1"
              >
                <Play className="w-4 h-4" />
                <span>Start Full Exam</span>
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => onBrowse(paper.id)}
                className="flex items-center space-x-1"
              >
                <Eye className="w-4 h-4" />
                <span>Browse Paper</span>
              </Button>

              {attemptStatus !== 'new' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onReviewAttempt(paper.id)}
                  className="flex items-center space-x-1"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Review Attempt</span>
                </Button>
              )}
            </>
          ) : (
            <div className="w-full">
              <Button
                size="sm"
                variant="outline"
                className="flex items-center space-x-1 w-full justify-center"
                disabled
              >
                <Lock className="w-4 h-4" />
                <span>
                  {paper.isFree 
                    ? 'Enroll to get Free Access' 
                    : 'Upgrade to Premium to Access'
                  }
                </span>
              </Button>
              {!paper.isFree && (
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  This paper requires premium access (₹99)
                </p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
