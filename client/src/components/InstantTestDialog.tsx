import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, BookOpen, Zap } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Exam } from "@shared/schema";

interface InstantTestDialogProps {
  trigger: React.ReactNode;
  onStartTest: (config: TestConfig) => void;
}

interface TestConfig {
  examId: number;
  examName: string;
  duration: number;
  subjects: string[];
  questionCount: number;
}

const DURATION_OPTIONS = [
  { value: 30, label: "30 minutes" },
  { value: 60, label: "1 hour" },
  { value: 90, label: "1.5 hours" },
  { value: 120, label: "2 hours" },
  { value: 180, label: "3 hours" },
];

const SUBJECT_OPTIONS: Record<string, string[]> = {
  "JEE Main": ["Physics", "Chemistry", "Mathematics"],
  "NEET": ["Physics", "Chemistry", "Biology", "Botany", "Zoology"],
  "GATE": ["Computer Science", "Electronics", "Mechanical", "Civil"],
  "CAT": ["Verbal Ability", "Data Interpretation", "Quantitative Aptitude", "Logical Reasoning"],
};

export default function InstantTestDialog({ trigger, onStartTest }: InstantTestDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [duration, setDuration] = useState<number>(60);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [questionCount, setQuestionCount] = useState(50);

  const { data: userPurchases = [] } = useQuery({
    queryKey: ["/api/user/purchases"],
  });

  const { data: allExams = [] } = useQuery({
    queryKey: ["/api/exams"],
  });

  // Filter exams user has access to (either purchased or enrolled)
  const accessibleExams = allExams.filter((exam: Exam) => 
    userPurchases.some((purchase: any) => purchase.examId === exam.id)
  );

  const handleExamSelect = (examId: string) => {
    const exam = accessibleExams.find((e: Exam) => e.id === parseInt(examId));
    setSelectedExam(exam || null);
    if (exam) {
      const subjects = SUBJECT_OPTIONS[exam.name] || [];
      setSelectedSubjects(subjects); // Start with all subjects selected
    }
  };

  const handleSubjectToggle = (subject: string) => {
    setSelectedSubjects(prev => 
      prev.includes(subject) 
        ? prev.filter(s => s !== subject)
        : [...prev, subject]
    );
  };

  const handleStartTest = () => {
    if (!selectedExam || selectedSubjects.length === 0) return;

    const config: TestConfig = {
      examId: selectedExam.id,
      examName: selectedExam.name,
      duration: duration,
      subjects: selectedSubjects,
      questionCount: questionCount,
    };

    onStartTest(config);
    setOpen(false);
    
    // Reset form
    setSelectedExam(null);
    setSelectedSubjects([]);
    setDuration(60);
    setQuestionCount(50);
  };

  const availableSubjects = selectedExam ? SUBJECT_OPTIONS[selectedExam.name] || [] : [];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            Start Instant Test
          </DialogTitle>
          <DialogDescription>
            Create a custom test from your enrolled exams with specific duration and subjects
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Exam Selection */}
          <div className="space-y-2">
            <Label htmlFor="exam-select">Select Exam</Label>
            {accessibleExams.length === 0 ? (
              <Card className="border-amber-200 bg-amber-50">
                <CardContent className="pt-4">
                  <p className="text-sm text-amber-700">
                    You need to enroll in at least one exam to start an instant test. 
                    Go to the dashboard and enroll for free or purchase an exam.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Select onValueChange={handleExamSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an exam you have access to" />
                </SelectTrigger>
                <SelectContent>
                  {accessibleExams.map((exam: Exam) => (
                    <SelectItem key={exam.id} value={exam.id.toString()}>
                      <div className="flex items-center gap-2">
                        <span>{exam.icon}</span>
                        <span>{exam.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {selectedExam && (
            <>
              {/* Duration Selection */}
              <div className="space-y-2">
                <Label>Test Duration</Label>
                <Select value={duration.toString()} onValueChange={(value) => setDuration(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DURATION_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value.toString()}>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          {option.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Subject Selection */}
              <div className="space-y-3">
                <Label>Select Subjects</Label>
                <div className="grid grid-cols-2 gap-3">
                  {availableSubjects.map((subject) => (
                    <div key={subject} className="flex items-center space-x-2">
                      <Checkbox
                        id={subject}
                        checked={selectedSubjects.includes(subject)}
                        onCheckedChange={() => handleSubjectToggle(subject)}
                      />
                      <Label
                        htmlFor={subject}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {subject}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Question Count */}
              <div className="space-y-2">
                <Label>Number of Questions</Label>
                <Select value={questionCount.toString()} onValueChange={(value) => setQuestionCount(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="25">25 Questions</SelectItem>
                    <SelectItem value="50">50 Questions</SelectItem>
                    <SelectItem value="75">75 Questions</SelectItem>
                    <SelectItem value="100">100 Questions</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Test Summary */}
              <Card className="bg-blue-50 border-blue-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Test Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Exam:</span> {selectedExam.name}
                    </div>
                    <div>
                      <span className="font-medium">Duration:</span> {duration} minutes
                    </div>
                    <div>
                      <span className="font-medium">Questions:</span> {questionCount}
                    </div>
                    <div>
                      <span className="font-medium">Subjects:</span> {selectedSubjects.length}
                    </div>
                  </div>
                  {selectedSubjects.length > 0 && (
                    <div className="mt-3">
                      <span className="font-medium text-sm">Selected Subjects:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedSubjects.map((subject) => (
                          <span
                            key={subject}
                            className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs"
                          >
                            {subject}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleStartTest}
            disabled={!selectedExam || selectedSubjects.length === 0}
            className="bg-yellow-500 hover:bg-yellow-600 text-white"
          >
            <Zap className="h-4 w-4 mr-2" />
            Start Test
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}