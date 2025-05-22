
import { useState, useEffect } from 'react';
import courseService, { Quiz } from '@/services/courseService';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Calendar, Clock, List } from 'lucide-react';
import { format } from 'date-fns';
import EditQuizDialog from '@/components/quiz/EditQuizDialog';

interface CourseQuizzesProps {
  courseId: string;
}

const CourseQuizzes = ({ courseId }: CourseQuizzesProps) => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await courseService.getCourseQuizzes(courseId, filter);
        setQuizzes(data);
      } catch (err: any) {
        console.error('Error fetching quizzes:', err);
        setError(err.response?.data?.detail || 'Failed to load quizzes');
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, [courseId, filter]);

  const handleQuizUpdate = async () => {
    try {
      const data = await courseService.getCourseQuizzes(courseId, filter);
      setQuizzes(data);
    } catch (err: any) {
      console.error('Error refreshing quizzes:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center my-8">
        <div className="animate-pulse text-acadex-primary">Loading quizzes...</div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Course Quizzes</h2>
        <div className="flex items-center space-x-2">
          <Button 
            variant={filter === undefined ? "default" : "outline"} 
            size="sm"
            onClick={() => setFilter(undefined)}
          >
            All
          </Button>
          <Button 
            variant={filter === true ? "default" : "outline"} 
            size="sm"
            onClick={() => setFilter(true)}
          >
            Active
          </Button>
          <Button 
            variant={filter === false ? "default" : "outline"} 
            size="sm"
            onClick={() => setFilter(false)}
          >
            Inactive
          </Button>
        </div>
      </div>

      {quizzes.length === 0 ? (
        <Card className="border-dashed border-2 bg-muted/50">
          <CardContent className="pt-6 pb-6 flex flex-col items-center justify-center">
            <List className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Quizzes Found</h3>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              {filter !== undefined 
                ? `No ${filter ? 'active' : 'inactive'} quizzes found for this course.` 
                : 'No quizzes have been created for this course yet.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {quizzes.map((quiz) => (
            <Card key={quiz.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg font-medium">{quiz.title}</CardTitle>
                    <CardDescription>{quiz.number_of_questions} questions</CardDescription>
                  </div>
                  <Badge variant={quiz.is_active ? "default" : "outline"}>
                    {quiz.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {format(new Date(quiz.start_date_time), 'MMM d, yyyy h:mm a')} - 
                      {format(new Date(quiz.end_date_time), 'MMM d, yyyy h:mm a')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>Allotted time: {quiz.allotted_time}</span>
                  </div>
                  <p className="text-muted-foreground">{quiz.instructions}</p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <EditQuizDialog 
                  quiz={quiz} 
                  onQuizUpdate={handleQuizUpdate} 
                />
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseQuizzes;
