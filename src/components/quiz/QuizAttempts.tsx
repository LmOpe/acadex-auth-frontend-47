
import { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AlertCircle, Eye, Users } from 'lucide-react';
import { format } from 'date-fns';
import quizService, { QuizAttemptStudent } from '@/services/quizService';
import StudentResultDialog from './StudentResultDialog';

interface QuizAttemptsProps {
  quizId: string;
}

const QuizAttempts = ({ quizId }: QuizAttemptsProps) => {
  const [attempts, setAttempts] = useState<QuizAttemptStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);

  useEffect(() => {
    const fetchAttempts = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await quizService.getQuizAttempts(quizId);
        setAttempts(response.students);
      } catch (err: any) {
        console.error('Error fetching quiz attempts:', err);
        setError(err.response?.data?.detail || 'Failed to load quiz attempts');
      } finally {
        setLoading(false);
      }
    };

    fetchAttempts();
  }, [quizId]);

  const handleViewResult = (studentMatric: string) => {
    setSelectedStudent(studentMatric);
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
            <div className="animate-pulse text-muted-foreground">Loading attempts...</div>
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
                    <TableCell className="font-medium">
                      {attempt.student}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {attempt.score}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {format(new Date(attempt.attempt_time), 'MMM d, yyyy h:mm a')}
                    </TableCell>
                    <TableCell>
                      <Badge variant={attempt.submitted ? "default" : "secondary"}>
                        {attempt.submitted ? 'Submitted' : 'Not Submitted'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {attempt.submitted ? (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewResult(attempt.student.split(' - ')[1])}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Result
                        </Button>
                      ) : (
                        <span className="text-muted-foreground text-sm">No result available</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {selectedStudent && (
        <StudentResultDialog
          quizId={quizId}
          studentMatric={selectedStudent}
          isOpen={!!selectedStudent}
          onClose={() => setSelectedStudent(null)}
        />
      )}
    </>
  );
};

export default QuizAttempts;
