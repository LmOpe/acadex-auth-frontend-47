
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardFooter 
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertCircle, Calendar, Clock, Search, ArrowUpDown } from 'lucide-react';
import quizService, { CourseQuizzes, Quiz, StudentAttemptSummary } from '@/services/quizService';
import { CourseEnrollment } from '@/services/courseService';

interface PendingQuizzesProps {
  enrolledCourses: CourseEnrollment[];
}

type SortField = 'title' | 'courseTitle' | 'end_date_time';
type SortOrder = 'asc' | 'desc';

const PendingQuizzes = ({ enrolledCourses }: PendingQuizzesProps) => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attemptError, setAttemptError] = useState<string | null>(null);
  const [attemptedQuizIds, setAttemptedQuizIds] = useState<Set<string>>(new Set());
  const [attemptingQuizId, setAttemptingQuizId] = useState<string | null>(null);
  
  // Search and sort states
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('end_date_time');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get all quizzes
        const allCourseQuizzes = await quizService.getAllQuizzes();
        
        // Get attempted quizzes to filter them out
        let attemptedIds = new Set<string>();
        try {
          const attempts = await quizService.getStudentAttempts();
          attemptedIds = new Set(attempts.quizzes.map(attempt => attempt.quiz_id));
          setAttemptedQuizIds(attemptedIds);
        } catch (attemptsErr: any) {
          if (attemptsErr.response?.status === 404) {
            // No attempts exist yet — not an error.
            attemptedIds = new Set();
            setAttemptedQuizIds(new Set());
          } else {
            throw attemptsErr; // Re-throw actual errors
          }
        }

        // Filter quizzes for enrolled courses
        const enrolledCourseIds = new Set(enrolledCourses.map(enrollment => enrollment.course));
        
        // Get active quizzes for enrolled courses that haven't been attempted
        const activeQuizzes: Quiz[] = [];
        allCourseQuizzes.forEach(courseQuiz => {
          if (enrolledCourseIds.has(courseQuiz.course_id)) {
            courseQuiz.quizzes.forEach(quiz => {
              if (quizService.isQuizActive(quiz) && !attemptedIds.has(quiz.id)) {
                // Add course details to quiz for display
                const quizWithDetails = {
                  ...quiz,
                  courseTitle: courseQuiz.course_details.title,
                  courseCode: courseQuiz.course_details.course_code
                };
                activeQuizzes.push(quizWithDetails as Quiz);
              }
            });
          }
        });
        
        setQuizzes(activeQuizzes);
      } catch (err: any) {
        console.error('Error fetching pending quizzes:', err);
        setError(err.response?.data?.detail || 'Failed to load pending quizzes');
      } finally {
        setLoading(false);
      }
    };
    
    if (enrolledCourses.length > 0) {
      fetchQuizzes();
    } else {
      setLoading(false);
    }
  }, [enrolledCourses]);

  // Apply filtering and sorting
  useEffect(() => {
    let filtered = [...quizzes];

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(quiz => {
        const searchTerm = searchQuery.toLowerCase();
        return (
          quiz.title.toLowerCase().includes(searchTerm) ||
          (quiz as any).courseTitle?.toLowerCase().includes(searchTerm) ||
          (quiz as any).courseCode?.toLowerCase().includes(searchTerm)
        );
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortField) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'courseTitle':
          aValue = (a as any).courseTitle?.toLowerCase() || '';
          bValue = (b as any).courseTitle?.toLowerCase() || '';
          break;
        case 'end_date_time':
          aValue = new Date(a.end_date_time);
          bValue = new Date(b.end_date_time);
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredQuizzes(filtered);
  }, [quizzes, searchQuery, sortField, sortOrder]);

  const handleAttemptQuiz = async (quiz: Quiz) => {
    try {
      setAttemptingQuizId(quiz.id);
      setAttemptError(null);
      
      // Try to start the quiz attempt
      const attempt = await quizService.startQuizAttempt(quiz.id);
      
      // Check if the quiz has questions
      if (!attempt.quiz_questions || attempt.quiz_questions.length === 0) {
        setAttemptError('No questions available for this quiz. Please try again later.');
        setAttemptingQuizId(null);
        return;
      }
      
      // If successful, navigate to attempt page
      navigate(`/quizzes/${quiz.id}/attempt`, { 
        state: { 
          quiz,
          attempt,
          returnPath: "/dashboard"
        } 
      });
      
    } catch (err: any) {
      console.error('Error attempting quiz:', err);
      setAttemptError(err.response?.data?.detail || 'Failed to start quiz');
      setAttemptingQuizId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center my-4">
        <div className="animate-pulse text-acadex-primary">Loading pending quizzes...</div>
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

  if (quizzes.length === 0) {
    return (
      <Card className="border-dashed border-2 bg-muted/50">
        <CardContent className="pt-6 pb-6 flex flex-col items-center justify-center">
          <Clock className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No Pending Quizzes</h3>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            You don't have any active quizzes to take at the moment.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {attemptError && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{attemptError}</AlertDescription>
        </Alert>
      )}

      {/* Search and Sort Controls */}
      <div className="flex gap-4 flex-wrap">
        <div className="flex items-center gap-2 flex-1 min-w-60">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search quizzes or courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
          <Select value={`${sortField}-${sortOrder}`} onValueChange={(value) => {
            const [field, order] = value.split('-') as [SortField, SortOrder];
            setSortField(field);
            setSortOrder(order);
          }}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="title-asc">Quiz (A-Z)</SelectItem>
              <SelectItem value="title-desc">Quiz (Z-A)</SelectItem>
              <SelectItem value="courseTitle-asc">Course (A-Z)</SelectItem>
              <SelectItem value="courseTitle-desc">Course (Z-A)</SelectItem>
              <SelectItem value="end_date_time-asc">Deadline (Earliest)</SelectItem>
              <SelectItem value="end_date_time-desc">Deadline (Latest)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredQuizzes.length === 0 ? (
        <Card className="border-dashed border-2 bg-muted/50">
          <CardContent className="pt-6 pb-6 flex flex-col items-center justify-center">
            <Clock className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Quizzes Found</h3>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              No pending quizzes match your search criteria. Try different keywords.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredQuizzes.map((quiz: any) => (
            <Card key={quiz.id} className="border-l-4 border-l-acadex-primary">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg font-medium">{quiz.title}</CardTitle>
                  <Badge>Active</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  Course: {quiz.courseTitle} ({quiz.courseCode})
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Ends: {quizService.formatDateTime(quiz.end_date_time)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>Duration: {quiz.allotted_time}</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full"
                  disabled={attemptingQuizId === quiz.id}
                  onClick={() => handleAttemptQuiz(quiz)}
                >
                  {attemptingQuizId === quiz.id ? "Loading..." : "Start Quiz"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PendingQuizzes;
