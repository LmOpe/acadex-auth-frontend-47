
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Eye, Users } from 'lucide-react';
import quizService, { StudentAttempt, StudentQuizResult } from '@/services/quizService';
import StudentResultDialog from './StudentResultDialog';

interface QuizAttemptsProps {
  quizId: string;
}

const QuizAttempts = ({ quizId }: QuizAttemptsProps) => {
  const [attempts, setAttempts] = useState<StudentAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedResult, setSelectedResult] = useState<StudentQuizResult | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [resultDialogOpen, setResultDialogOpen] = useState(false);
  const [loadingResult, setLoadingResult] = useState(false);

  useEffect(() => {
    const fetchAttempts = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await quizService.getQuizAttempts(quizId);
        setAttempts(response.students);
      } catch (err: any) {
        console.error('Error fetching quiz attempts:', err);
        setError(err.response?.data?.detail || err.response?.data?.message || 'Failed to load quiz attempts');
      } finally {
        setLoading(false);
      }
    };

    if (quizId) {
      fetchAttempts();
    }
  }, [quizId]);

  const handleViewResult = async (studentName: string) => {
    try {
      setLoadingResult(true);
      setSelectedStudent(studentName);
      
      // Extract student matric from the student name format "Name - Matric"
      const studentMatric = studentName.split(' - ')[1];
      
      const result = await quizService.getStudentQuizResult(quizId, studentMatric);
      setSelectedResult(result);
      setResultDialogOpen(true);
    } catch (err: any) {
      console.error('Error fetching student result:', err);
      setError(err.response?.data?.detail || err.response?.data?.message || 'Failed to load student result');
    } finally {
      setLoadingResult(false);
    }
  };

  const formatDateTime = (dateTimeString: string): string => {
    const date = new Date(dateTimeString);
    return format(date, 'MMM d, yyyy h:mm a');
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Student Attempts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <div className="animate-pulse text-acadex-primary">Loading attempts...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Student Attempts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Student Attempts ({attempts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {attempts.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Attempts Yet</h3>
              <p className="text-muted-foreground">
                No students have attempted this quiz yet.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Attempt Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attempts.map((attempt, index) => (
                  <TableRow key={`${attempt.student}-${attempt.attempt_time}-${index}`}>
                    <TableCell className="font-medium">{attempt.student}</TableCell>
                    <TableCell>{attempt.score}</TableCell>
                    <TableCell>{formatDateTime(attempt.attempt_time)}</TableCell>
                    <TableCell>
                      <Badge variant={attempt.submitted ? "default" : "secondary"}>
                        {attempt.submitted ? "Submitted" : "In Progress"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {attempt.submitted ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewResult(attempt.student)}
                          disabled={loadingResult}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          {loadingResult && selectedStudent === attempt.student ? 'Loading...' : 'View Result'}
                        </Button>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <StudentResultDialog
        open={resultDialogOpen}
        onOpenChange={setResultDialogOpen}
        studentName={selectedStudent}
        result={selectedResult}
      />
    </>
  );
};

export default QuizAttempts;
