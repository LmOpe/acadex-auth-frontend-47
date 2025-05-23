
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardFooter 
} from '@/components/ui/card';
import { 
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowLeft, CheckCircle2, Clock } from 'lucide-react';
import quizService, { StudentAttemptSummary } from '@/services/quizService';

const QuizAttemptHistory = () => {
  const [attempts, setAttempts] = useState<StudentAttemptSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAttempts = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await quizService.getStudentAttempts();
        setAttempts(data.quizzes);
      } catch (err: any) {
        console.error('Error fetching quiz attempts:', err);
        setError(err.response?.data?.detail || 'Failed to load quiz attempts');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAttempts();
  }, []);

  const handleGoBack = () => {
    // Directly navigate to dashboard instead of using navigate(-1)
    navigate('/dashboard');
  };

  const handleViewResult = (attempt: StudentAttemptSummary) => {
    navigate(`/quizzes/${attempt.quiz_id}/result`, {
      state: {
        result: null, // This will be fetched in the result page
        quizTitle: attempt.title,
        returnPath: "/dashboard" // Always return to dashboard
      }
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-acadex-primary">Quiz Attempts</h1>
          <Button variant="outline" onClick={handleGoBack}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
        </div>
        <div className="flex justify-center my-8">
          <div className="animate-pulse text-acadex-primary">Loading your quiz attempts...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-acadex-primary">Quiz Attempts</h1>
          <Button variant="outline" onClick={handleGoBack}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
        </div>
        <Alert variant="destructive" className="my-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (attempts.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-acadex-primary">Quiz Attempts</h1>
          <Button variant="outline" onClick={handleGoBack}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
        </div>
        <Card className="border-dashed border-2 bg-muted/50">
          <CardContent className="pt-6 pb-6 flex flex-col items-center justify-center">
            <Clock className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Quiz Attempts</h3>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              You haven't attempted any quizzes yet.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-acadex-primary">Quiz Attempts</h1>
          <p className="text-muted-foreground">View your past quiz attempts</p>
        </div>
        <Button variant="outline" onClick={handleGoBack}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quiz Attempt History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Quiz Title</TableHead>
                <TableHead>Attempt Date</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attempts.map((attempt) => (
                <TableRow key={attempt.quiz_id}>
                  <TableCell className="font-medium">{attempt.title}</TableCell>
                  <TableCell>{quizService.formatDateTime(attempt.attempt_time)}</TableCell>
                  <TableCell>{attempt.score}</TableCell>
                  <TableCell>
                    {attempt.submitted ? (
                      <span className="inline-flex items-center text-green-600">
                        <CheckCircle2 className="h-4 w-4 mr-1" /> Submitted
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-amber-600">
                        <Clock className="h-4 w-4 mr-1" /> Incomplete
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleViewResult(attempt)}
                    >
                      View Result
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuizAttemptHistory;
