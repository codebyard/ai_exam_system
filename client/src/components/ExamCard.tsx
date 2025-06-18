import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, HelpCircle, Crown } from 'lucide-react';
import { Link } from 'wouter';
import type { Exam } from '@shared/schema';

interface ExamCardProps {
  exam: Exam;
  hasPremiumAccess?: boolean;
  showPricing?: boolean;
}

const getExamIcon = (iconName: string) => {
  // You can expand this mapping based on your needs
  switch (iconName) {
    case 'calculator':
      return '🧮';
    case 'heartbeat':
      return '❤️';
    case 'cogs':
      return '⚙️';
    default:
      return '📚';
  }
};

export default function ExamCard({ exam, hasPremiumAccess = false, showPricing = true }: ExamCardProps) {
  return (
    <Card className="group hover:shadow-xl transition-all duration-300 overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="bg-primary/10 p-3 rounded-lg">
            <span className="text-2xl">{getExamIcon(exam.icon || 'book')}</span>
          </div>
          {exam.isPopular && (
            <Badge variant="secondary" className="bg-success/10 text-success hover:bg-success/20">
              Popular
            </Badge>
          )}
        </div>
        
        <h3 className="text-xl font-semibold text-foreground mb-2">{exam.name}</h3>
        <p className="text-muted-foreground mb-4 line-clamp-2">{exam.description}</p>
        
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-1" />
            <span>{exam.yearsAvailable} Years</span>
          </div>
          <div className="flex items-center">
            <HelpCircle className="w-4 h-4 mr-1" />
            <span>{exam.totalQuestions?.toLocaleString()} Questions</span>
          </div>
        </div>

        {showPricing && (
          <div className="mb-4">
            <div className="text-sm">
              <span className="text-success font-medium">2022-2023: Free</span>
              <div className="flex items-center text-warning mt-1">
                <Crown className="w-3 h-3 mr-1" />
                <span>Earlier years: ₹99</span>
              </div>
            </div>
          </div>
        )}

        <Link href={`/exams/${exam.id}`}>
          <Button className="w-full">
            Start Now
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
