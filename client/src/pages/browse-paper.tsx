import { useState } from 'react';
import { useParams, Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import NavigationMenu from '@/components/NavigationMenu';
import Footer from '@/components/Footer';
import { CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import type { Question, Paper } from '@shared/schema';

interface LocalState {
  selected: string | null;
  showSolution: boolean;
}

export default function BrowsePaper() {
  const { paperId } = useParams<{ paperId: string }>();
  const [localStates, setLocalStates] = useState<Record<number, LocalState>>({});

  const { data: paper, isLoading: paperLoading } = useQuery<Paper>({
    queryKey: [`/api/papers/${paperId}`],
    retry: false,
    enabled: !!paperId,
  });

  const { data: questions, isLoading: questionsLoading } = useQuery<Question[]>({
    queryKey: [`/api/papers/${paperId}/questions`],
    retry: false,
    enabled: !!paperId,
  });

  const handleSelect = (questionId: number, answer: string, correctAnswer: string, options: any) => {
    // Determine correct answer text (handle letter or text)
    let correctText = correctAnswer;
    if (typeof correctAnswer === 'string' && correctAnswer.length === 1 && Array.isArray(options)) {
      const idx = correctAnswer.charCodeAt(0) - 65;
      correctText = options[idx];
    }
    setLocalStates(prev => ({
      ...prev,
      [questionId]: {
        selected: answer,
        showSolution: true,
      },
    }));
  };

  if (paperLoading || questionsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading paper...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <NavigationMenu />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex items-center gap-4">
          <Link href="/exam-details/" asChild>
            <Button variant="ghost" className="flex items-center space-x-2">
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">{paper?.title || 'Browse Paper'}</h1>
        </div>
        <div className="space-y-8">
          {questions && questions.length > 0 ? (
            questions.map((q, idx) => {
              // Handle options as array or JSON string
              let optionsArray: string[] = [];
              if (Array.isArray(q.options)) {
                optionsArray = q.options;
              } else if (typeof q.options === 'string') {
                try {
                  const parsed = JSON.parse(q.options);
                  if (Array.isArray(parsed)) optionsArray = parsed;
                } catch {}
              }
              const local = localStates[q.id] || { selected: null, showSolution: false };
              // Determine correct answer text
              let correctText = q.correctAnswer;
              if (typeof q.correctAnswer === 'string' && q.correctAnswer.length === 1 && Array.isArray(optionsArray)) {
                const idx = q.correctAnswer.charCodeAt(0) - 65;
                correctText = optionsArray[idx];
              }
              const isCorrect = local.selected === correctText;
              return (
                <Card key={q.id} className="">
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">Q{q.questionNumber}</Badge>
                      {q.subject && <Badge variant="secondary">{q.subject}</Badge>}
                      {q.difficulty && <Badge>{q.difficulty}</Badge>}
                    </div>
                    <CardTitle className="text-lg font-semibold mb-2">{q.questionText}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {optionsArray.map((option, i) => {
                        const optionKey = String.fromCharCode(65 + i);
                        return (
                          <div key={i} className="flex items-center space-x-3">
                            <input
                              type="radio"
                              id={`q${q.id}-opt${i}`}
                              name={`q${q.id}`}
                              value={option}
                              checked={local.selected === option}
                              onChange={() => handleSelect(q.id, option, q.correctAnswer, optionsArray)}
                              className="form-radio h-4 w-4 text-primary"
                              disabled={local.showSolution}
                            />
                            <label htmlFor={`q${q.id}-opt${i}`} className="cursor-pointer">
                              <span className="font-semibold mr-2">({optionKey})</span>
                              {option}
                            </label>
                          </div>
                        );
                      })}
                    </div>
                    {local.showSolution && (
                      <div className="mt-4 p-4 rounded-lg border bg-muted">
                        {isCorrect ? (
                          <div className="flex items-center text-success font-semibold mb-2">
                            <CheckCircle className="w-5 h-5 mr-2" /> Correct!
                          </div>
                        ) : (
                          <div className="flex items-center text-destructive font-semibold mb-2">
                            <XCircle className="w-5 h-5 mr-2" /> Wrong! Correct answer: <span className="ml-2">{correctText}</span>
                          </div>
                        )}
                        <div className="prose dark:prose-invert max-w-none mt-2">
                          <p>{q.explanation}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <div className="text-center text-muted-foreground">No questions found for this paper.</div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
} 