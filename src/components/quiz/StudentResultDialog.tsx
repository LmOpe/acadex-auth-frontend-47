
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle } from 'lucide-react';
import { StudentQuizResult } from '@/services/quizService';

interface StudentResultDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentName: string;
  result: StudentQuizResult | null;
}

const StudentResultDialog = ({ 
  open, 
  onOpenChange, 
  studentName, 
  result 
}: StudentResultDialogProps) => {
  if (!result) return null;

  const totalQuestions = result.answers.length;
  const correctAnswers = result.answers.filter(answer => answer.is_correct).length;
  const scorePercentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Quiz Result - {studentName}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Score Summary */}
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-acadex-primary mb-2">
                  {scorePercentage}%
                </div>
                <p className="text-muted-foreground">
                  {correctAnswers} correct out of {totalQuestions} questions
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Total Score: {result.score}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Answers */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Answer Details</h3>
            
            {result.answers.map((answer, index) => (
              <Card 
                key={answer.question_id} 
                className={`border-l-4 ${answer.is_correct ? 'border-l-green-500' : 'border-l-red-500'}`}
              >
                <CardContent className="py-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {answer.is_correct ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium">Question {index + 1}</span>
                        <Badge variant={answer.is_correct ? "default" : "destructive"}>
                          {answer.is_correct ? "Correct" : "Incorrect"}
                        </Badge>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-sm">
                          <span className="font-medium">Student's Answer:</span> {answer.selected_option}
                        </p>
                        
                        {!answer.is_correct && answer.correct_option && (
                          <p className="text-sm text-green-600">
                            <span className="font-medium">Correct Answer:</span> {answer.correct_option}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StudentResultDialog;
