
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, BookOpen, Calendar, Search, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Link } from 'react-router-dom';
import courseService, { CourseEnrollment } from '@/services/courseService';

interface EnrolledCoursesProps {
  refreshTrigger: number;
}

type SortField = 'course_title' | 'enrollment_date';
type SortOrder = 'asc' | 'desc';

const EnrolledCourses = ({ refreshTrigger }: EnrolledCoursesProps) => {
  const [enrollments, setEnrollments] = useState<CourseEnrollment[]>([]);
  const [filteredEnrollments, setFilteredEnrollments] = useState<CourseEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search and sort states
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('enrollment_date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await courseService.getStudentEnrollments();
        setEnrollments(data);
      } catch (err: any) {
        console.error('Fetch enrollments error:', err);
        setError(err.response?.data?.detail || 'Failed to fetch enrolled courses');
      } finally {
        setLoading(false);
      }
    };
    
    fetchEnrollments();
  }, [refreshTrigger]);

  // Apply filtering and sorting
  useEffect(() => {
    let filtered = [...enrollments];

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(enrollment => 
        enrollment.course_title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortField) {
        case 'course_title':
          aValue = a.course_title.toLowerCase();
          bValue = b.course_title.toLowerCase();
          break;
        case 'enrollment_date':
          aValue = new Date(a.enrollment_date);
          bValue = new Date(b.enrollment_date);
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredEnrollments(filtered);
  }, [enrollments, searchQuery, sortField, sortOrder]);

  if (loading) {
    return (
      <div className="flex justify-center my-8">
        <div className="animate-pulse text-acadex-primary">Loading enrolled courses...</div>
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

  if (enrollments.length === 0) {
    return (
      <Card className="border-dashed border-2 bg-muted/50">
        <CardContent className="pt-6 pb-6 flex flex-col items-center justify-center">
          <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No Enrolled Courses</h3>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            You have not enrolled in any courses yet. Browse available courses and enroll to see them here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Sort Controls */}
      <div className="flex gap-4 flex-wrap">
        <div className="flex items-center gap-2 flex-1 min-w-60">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search courses..."
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
              <SelectItem value="course_title-asc">Course (A-Z)</SelectItem>
              <SelectItem value="course_title-desc">Course (Z-A)</SelectItem>
              <SelectItem value="enrollment_date-desc">Latest Enrolled</SelectItem>
              <SelectItem value="enrollment_date-asc">Earliest Enrolled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredEnrollments.length === 0 ? (
        <Card className="border-dashed border-2 bg-muted/50">
          <CardContent className="pt-6 pb-6 flex flex-col items-center justify-center">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Courses Found</h3>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              No enrolled courses match your search criteria. Try different keywords.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEnrollments.map(enrollment => (
            <Card key={enrollment.enrollment_id} className="h-full flex flex-col">
              <CardHeader>
                <CardTitle className="text-lg font-medium capitalize">{enrollment.course_title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow space-y-2">
                <div className="flex items-center text-sm">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>Enrolled on: {new Date(enrollment.enrollment_date).toLocaleDateString()}</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline" 
                  className="w-full"
                  asChild
                >
                  <Link 
                    to={`/courses/${enrollment.course}/quizzes`} 
                    state={{ courseTitle: enrollment.course_title }}
                  >
                    View Quizzes
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default EnrolledCourses;
