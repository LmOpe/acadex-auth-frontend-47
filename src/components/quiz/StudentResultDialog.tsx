
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle, XCircle, HelpCircle } from 'lucide-react';
import quizService, { StudentQuizResult } from '@/services/quizService';

interface StudentResultDialogProps {
  quizId: string;
  student: string;
  isOpen: boolean;
  onClose: () => void;
}

const StudentResultDialog = ({ quizId, student, isOpen, onClose }: StudentResultDialogProps) => {
  const [result, setResult] = useState<StudentQuizResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && student) {
      const fetchResult = async () => {
        try {
          setLoading(true);
          setError(null);
          const data = await quizService.getStudentQuizResult(quizId, student.split(" - ")[1]);
          setResult(data);
        } catch (err: any) {
          console.error('Error fetching student result:', err);
          setError(err.response?.data?.detail || 'Failed to load student result');
        } finally {
          setLoading(false);
        }
      };

      fetchResult();
    }
  }, [isOpen, quizId, student]);

  const getAnswerIcon = (answer: StudentQuizResult['answers'][0]) => {
    if (answer.selected_option === null) {
      return <HelpCircle className="h-4 w-4 text-gray-500" />;
    }
    return answer.is_correct ? 
      <CheckCircle className="h-4 w-4 text-green-500" /> : 
      <XCircle className="h-4 w-4 text-red-500" />;
  };

  const getAnswerStatus = (answer: StudentQuizResult['answers'][0]) => {
    if (answer.selected_option === null) {
      return "No Answer";
    }
    return answer.is_correct ? "Correct" : "Incorrect";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Student Quiz Result</DialogTitle>
          <DialogDescription>
            Detailed result for student: {student}
          </DialogDescription>
        </DialogHeader>

        {loading && (
          <div className="flex justify-center py-8">
            <div className="animate-pulse text-muted-foreground">Loading result...</div>
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {result && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Overall Score
                  <Badge variant="outline" className="text-lg px-3 py-1">
                    {result.score} / {result.answers.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
            </Card>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Question-by-Question Analysis</h3>
              {result.answers.map((answer, index) => (
                <Card key={answer.question_id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      {getAnswerIcon(answer)}
                      Question {index + 1}
                      <Badge variant={answer.is_correct ? "default" : answer.selected_option === null ? "secondary" : "destructive"}>
                        {getAnswerStatus(answer)}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Student's Answer:</p>
                      <p className="text-sm">
                        {answer.selected_option || "No answer selected"}
                      </p>
                    </div>
                    {!answer.is_correct && answer.correct_option && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Correct Answer:</p>
                        <p className="text-sm text-green-600">
                          {answer.correct_option}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default StudentResultDialog;
