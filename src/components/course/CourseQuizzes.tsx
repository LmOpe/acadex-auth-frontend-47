
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertCircle, Calendar, Clock, List, Filter, ArrowUpDown } from 'lucide-react';
import { format } from 'date-fns';
import EditQuizDialog from '@/components/quiz/EditQuizDialog';

interface CourseQuizzesProps {
  courseId: string;
}

type SortField = 'title' | 'start_date_time' | 'created_at' | 'number_of_questions';
type SortOrder = 'asc' | 'desc';
type StatusFilter = 'all' | 'active' | 'inactive';

const CourseQuizzes = ({ courseId }: CourseQuizzesProps) => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();
  const course = location.state?.course;

  // Filter and sort states
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await courseService.getCourseQuizzes(courseId);
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

  // Apply filtering and sorting
  useEffect(() => {
    let filtered = [...quizzes];

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(quiz => 
        statusFilter === 'active' ? quiz.is_active : !quiz.is_active
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortField) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'start_date_time':
          aValue = new Date(a.start_date_time);
          bValue = new Date(b.start_date_time);
          break;
        case 'created_at':
          aValue = new Date(a.created_at);
          bValue = new Date(b.created_at);
          break;
        case 'number_of_questions':
          aValue = a.number_of_questions;
          bValue = b.number_of_questions;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredQuizzes(filtered);
  }, [quizzes, sortField, sortOrder, statusFilter]);

  const handleQuizUpdate = async () => {
    try {
      const data = await courseService.getCourseQuizzes(courseId);
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
      </div>

      {/* Filter and Sort Controls */}
      <div className="flex gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={(value: StatusFilter) => setStatusFilter(value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
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
              <SelectItem value="title-asc">Title (A-Z)</SelectItem>
              <SelectItem value="title-desc">Title (Z-A)</SelectItem>
              <SelectItem value="start_date_time-desc">Start Date (Latest)</SelectItem>
              <SelectItem value="start_date_time-asc">Start Date (Earliest)</SelectItem>
              <SelectItem value="created_at-desc">Created (Latest)</SelectItem>
              <SelectItem value="created_at-asc">Created (Earliest)</SelectItem>
              <SelectItem value="number_of_questions-desc">Most Questions</SelectItem>
              <SelectItem value="number_of_questions-asc">Least Questions</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredQuizzes.length === 0 ? (
        <Card className="border-dashed border-2 bg-muted/50">
          <CardContent className="pt-6 pb-6 flex flex-col items-center justify-center">
            <List className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Quizzes Found</h3>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              {statusFilter !== 'all' 
                ? `No ${statusFilter} quizzes found for this course.` 
                : 'No quizzes have been created for this course yet.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filteredQuizzes.map((quiz) => (
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
              <CardFooter className="flex justify-end gap-2">
                <Button asChild variant="outline">
                  <Link to={`/quizzes/${quiz.id}`} state={{ quiz, courseId, course }}>
                    Quiz Details
                  </Link>
                </Button>
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
