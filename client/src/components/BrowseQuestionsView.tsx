import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  Filter, 
  BookOpen, 
  Eye, 
  EyeOff, 
  ChevronLeft, 
  ChevronRight,
  Lightbulb,
  Target,
  Clock
} from "lucide-react";
import type { Question } from "@shared/schema";

interface BrowseQuestionsViewProps {
  questions: Question[];
  paperTitle: string;
}

export default function BrowseQuestionsView({ questions, paperTitle }: BrowseQuestionsViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [showExplanations, setShowExplanations] = useState<Record<number, boolean>>({});
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});

  const questionsPerPage = 5;

  // Get unique subjects and difficulties
  const subjects = [...new Set(questions.map(q => q.subject).filter(Boolean))];
  const difficulties = [...new Set(questions.map(q => q.difficulty).filter(Boolean))];

  // Filter questions
  const filteredQuestions = questions.filter(question => {
    const matchesSearch = question.questionText.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (question.subject?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
                         (question.topic?.toLowerCase() || "").includes(searchTerm.toLowerCase());
    
    const matchesSubject = selectedSubject === "all" || question.subject === selectedSubject;
    const matchesDifficulty = selectedDifficulty === "all" || question.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesSubject && matchesDifficulty;
  });

  // Pagination
  const totalPages = Math.ceil(filteredQuestions.length / questionsPerPage);
  const startIndex = (currentPage - 1) * questionsPerPage;
  const paginatedQuestions = filteredQuestions.slice(startIndex, startIndex + questionsPerPage);

  const toggleExplanation = (questionId: number) => {
    setShowExplanations(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  const selectAnswer = (questionId: number, answer: string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'bg-green-100 text-green-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'hard': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getAnswerStatus = (questionId: number, optionKey: string) => {
    const question = questions.find(q => q.id === questionId);
    const selectedAnswer = selectedAnswers[questionId];
    const showExplanation = showExplanations[questionId];
    
    if (!showExplanation && !selectedAnswer) {
      return "default";
    }
    
    if (showExplanation) {
      if (optionKey === question?.correctAnswer) {
        return "correct";
      }
      if (selectedAnswer === optionKey && optionKey !== question?.correctAnswer) {
        return "incorrect";
      }
    }
    
    if (selectedAnswer === optionKey) {
      return "selected";
    }
    
    return "default";
  };

  const getAnswerButtonClass = (status: string) => {
    switch (status) {
      case "correct": return "bg-green-100 border-green-500 text-green-700";
      case "incorrect": return "bg-red-100 border-red-500 text-red-700";
      case "selected": return "bg-blue-100 border-blue-500 text-blue-700";
      default: return "bg-white border-gray-200 hover:bg-gray-50";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Browse Questions</h1>
          <p className="text-gray-600">{paperTitle}</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <BookOpen className="h-4 w-4" />
          <span>{filteredQuestions.length} questions available</span>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="h-5 w-5" />
            Filter Questions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search questions, topics..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Subject</label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {subjects.map(subject => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Difficulty</label>
              <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  {difficulties.map(difficulty => (
                    <SelectItem key={difficulty} value={difficulty}>
                      {difficulty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Actions</label>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm("");
                  setSelectedSubject("all");
                  setSelectedDifficulty("all");
                  setCurrentPage(1);
                }}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Questions */}
      <div className="space-y-6">
        {paginatedQuestions.map((question, index) => {
          const questionNumber = startIndex + index + 1;
          const options = Array.isArray(question.options) ? question.options : [];
          
          return (
            <Card key={question.id} className="overflow-hidden">
              <CardHeader className="bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge variant="secondary">Q{questionNumber}</Badge>
                      {question.subject && (
                        <Badge variant="outline">{question.subject}</Badge>
                      )}
                      {question.difficulty && (
                        <Badge className={getDifficultyColor(question.difficulty)}>
                          {question.difficulty}
                        </Badge>
                      )}
                      {question.topic && (
                        <span className="text-sm text-gray-600">• {question.topic}</span>
                      )}
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {question.questionText}
                    </h3>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Options */}
                  <div className="grid gap-3">
                    {options.map((option, optionIndex) => {
                      const optionKey = String.fromCharCode(65 + optionIndex); // A, B, C, D
                      const status = getAnswerStatus(question.id, optionKey);
                      
                      return (
                        <button
                          key={optionKey}
                          onClick={() => selectAnswer(question.id, optionKey)}
                          className={`text-left p-3 rounded-lg border-2 transition-all ${getAnswerButtonClass(status)}`}
                        >
                          <div className="flex items-start gap-3">
                            <span className="font-medium text-sm">{optionKey}.</span>
                            <span className="flex-1">{option}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 pt-4 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleExplanation(question.id)}
                      className="flex items-center gap-2"
                    >
                      {showExplanations[question.id] ? (
                        <>
                          <EyeOff className="h-4 w-4" />
                          Hide Solution
                        </>
                      ) : (
                        <>
                          <Lightbulb className="h-4 w-4" />
                          Show Solution
                        </>
                      )}
                    </Button>
                    
                    {selectedAnswers[question.id] && (
                      <div className="flex items-center gap-2 text-sm">
                        <Target className="h-4 w-4 text-blue-500" />
                        <span className="text-gray-600">
                          Your answer: <span className="font-medium">{selectedAnswers[question.id]}</span>
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Explanation */}
                  {showExplanations[question.id] && question.explanation && (
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-blue-900 mb-2">
                            Correct Answer: {question.correctAnswer}
                          </h4>
                          <p className="text-blue-800">{question.explanation}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {startIndex + 1} to {Math.min(startIndex + questionsPerPage, filteredQuestions.length)} of {filteredQuestions.length} questions
          </p>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => 
                  page === 1 || 
                  page === totalPages || 
                  Math.abs(page - currentPage) <= 1
                )
                .map((page, index, array) => (
                  <div key={page} className="flex items-center">
                    {index > 0 && array[index - 1] !== page - 1 && (
                      <span className="px-2 text-gray-400">...</span>
                    )}
                    <Button
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className="min-w-[40px]"
                    >
                      {page}
                    </Button>
                  </div>
                ))}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredQuestions.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Questions Found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search terms or filters to find more questions.
            </p>
            <Button 
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setSelectedSubject("all");
                setSelectedDifficulty("all");
              }}
            >
              Clear All Filters
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}