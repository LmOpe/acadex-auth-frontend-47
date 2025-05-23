
import { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, ArrowLeft, Clock, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import quizService, { Quiz } from '@/services/quizService';

const StudentCourseQuizzes = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const location = useLocation();
  const courseTitle = location.state?.courseTitle || 'Course';
  
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuizzes = async () => {
      if (!courseId) return;
      
      try {
        setLoading(true);
        setError(null);
        const data = await quizService.getCourseQuizzes(courseId);
        setQuizzes(data);
      } catch (err: any) {
        console.error('Error fetching quizzes:', err);
        setError(err.response?.data?.detail || 'Failed to load quizzes');
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, [courseId]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-acadex-primary">{courseTitle} - Quizzes</h1>
          </div>
          <Button variant="outline" asChild>
            <Link to="/dashboard"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard</Link>
          </Button>
        </div>
        <div className="flex justify-center my-8">
          <div className="animate-pulse text-acadex-primary">Loading quizzes...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-acadex-primary">{courseTitle} - Quizzes</h1>
          </div>
          <Button variant="outline" asChild>
            <Link to="/dashboard"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard</Link>
          </Button>
        </div>
        <Alert variant="destructive" className="my-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-acadex-primary">{courseTitle} - Quizzes</h1>
          <p className="text-muted-foreground">View and attempt quizzes for this course</p>
        </div>
        <Button variant="outline" asChild>
          <Link to="/dashboard"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard</Link>
        </Button>
      </div>

      {quizzes.length === 0 ? (
        <Card className="border-dashed border-2 bg-muted/50">
          <CardContent className="pt-6 pb-6 flex flex-col items-center justify-center">
            <Clock className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Quizzes Available</h3>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              There are no quizzes available for this course at the moment.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {quizzes.map((quiz) => {
            const isActive = quizService.isQuizActive(quiz);
            const hasStarted = new Date() >= new Date(quiz.start_date_time);
            const hasEnded = new Date() > new Date(quiz.end_date_time);
            
            return (
              <Card key={quiz.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-medium">{quiz.title}</CardTitle>
                    <Badge variant={isActive ? "default" : "outline"}>
                      {isActive ? 'Active' : hasEnded ? 'Ended' : hasStarted ? 'Starting Soon' : 'Upcoming'}
                    </Badge>
                  </div>
                  <CardDescription>
                    {quiz.number_of_questions} questions · {quiz.allotted_time} duration
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div className="flex flex-col">
                      <span>Start: {quizService.formatDateTime(quiz.start_date_time)}</span>
                      <span>End: {quizService.formatDateTime(quiz.end_date_time)}</span>
                    </div>
                  </div>
                  <p className="text-muted-foreground line-clamp-2">{quiz.instructions}</p>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    disabled={!isActive}
                    asChild={isActive}
                  >
                    {isActive ? (
                      <Link to={`/quizzes/${quiz.id}/attempt`} state={{ quiz }}>
                        Attempt Quiz
                      </Link>
                    ) : (
                      <span>
                        {hasEnded ? 'Quiz Ended' : hasStarted ? 'Not Available' : 'Not Started Yet'}
                      </span>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StudentCourseQuizzes;
