import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Eye, RotateCcw, Lock } from 'lucide-react';
import type { Paper } from '@shared/schema';

interface YearCardProps {
  paper: Paper;
  hasAccess: boolean;
  attemptStatus?: 'new' | 'attempted' | 'completed';
  onStartExam?: () => void;
  onBrowsePaper?: () => void;
  onReviewAttempt?: () => void;
}

export default function YearCard({ 
  paper, 
  hasAccess, 
  attemptStatus = 'new',
  onStartExam,
  onBrowsePaper,
  onReviewAttempt 
}: YearCardProps) {
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

  return (
    <Card className="hover:shadow-lg transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">{paper.title}</h3>
            <p className="text-sm text-muted-foreground">
              {paper.totalQuestions} Questions • {paper.duration} Minutes
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {getStatusBadge()}
            {!hasAccess && !paper.isFree && (
              <Lock className="w-4 h-4 text-warning" />
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {(hasAccess || paper.isFree) ? (
            <>
              <Button
                size="sm"
                onClick={onStartExam}
                className="flex items-center space-x-1"
              >
                <Play className="w-4 h-4" />
                <span>Start Full Exam</span>
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={onBrowsePaper}
                className="flex items-center space-x-1"
              >
                <Eye className="w-4 h-4" />
                <span>Browse Paper</span>
              </Button>

              {attemptStatus !== 'new' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onReviewAttempt}
                  className="flex items-center space-x-1"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Review Attempt</span>
                </Button>
              )}
            </>
          ) : (
            <Button
              size="sm"
              variant="outline"
              className="flex items-center space-x-1"
              disabled
            >
              <Lock className="w-4 h-4" />
              <span>Purchase Access (₹99)</span>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
