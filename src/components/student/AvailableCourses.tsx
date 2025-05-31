import { useState, useEffect } from 'react';
import { Search, ArrowUpDown, BookOpen, AlertCircle } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/sonner';
import courseService, { Course, CourseEnrollment } from '@/services/courseService';

interface AvailableCoursesProps {
  enrolledCourses: CourseEnrollment[];
  onEnrollmentSuccess: () => void;
}

type SortField = 'title' | 'course_code' | 'instructor_name';
type SortOrder = 'asc' | 'desc';

const AvailableCourses = ({ enrolledCourses, onEnrollmentSuccess }: AvailableCoursesProps) => {
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enrollingCourseId, setEnrollingCourseId] = useState<string | null>(null);

  const [sortField, setSortField] = useState<SortField>('title');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const enrolledCourseIds = new Set(enrolledCourses.map(enrollment => enrollment.course));

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await courseService.getAllCourses('');
        setAllCourses(data);
      } catch (err: any) {
        console.error('Fetch courses error:', err);
        setError(err.response?.data?.detail || 'Failed to fetch available courses');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  useEffect(() => {
    let available = allCourses.filter(course => !enrolledCourseIds.has(course.course_id));

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      available = available.filter(course =>
        course.title.toLowerCase().includes(q) ||
        course.course_code.toLowerCase().includes(q) ||
        course.instructor_name.toLowerCase().includes(q)
      );
    }

    available.sort((a, b) => {
      let aValue: any, bValue: any;
      switch (sortField) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'course_code':
          aValue = a.course_code.toLowerCase();
          bValue = b.course_code.toLowerCase();
          break;
        case 'instructor_name':
          aValue = a.instructor_name.toLowerCase();
          bValue = b.instructor_name.toLowerCase();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredCourses(available);
  }, [allCourses, searchQuery, sortField, sortOrder, enrolledCourses]);

  const handleEnroll = async (courseId: string) => {
    try {
      setEnrollingCourseId(courseId);
      await courseService.enrollInCourse(courseId);
      toast.success('Successfully enrolled in course!');
      onEnrollmentSuccess();
    } catch (err: any) {
      console.error('Enrollment error:', err);
      toast.error(err.response?.data?.detail || 'Failed to enroll in course');
    } finally {
      setEnrollingCourseId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center my-8">
        <div className="animate-pulse text-acadex-primary">Loading available courses...</div>
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
    <div className="space-y-4">
      <div className="flex gap-4 flex-wrap">
        <div className="flex items-center gap-2 flex-1 min-w-60">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search courses by title, code, or instructor..."
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
              <SelectItem value="title-asc">Title (A-Z)</SelectItem>
              <SelectItem value="title-desc">Title (Z-A)</SelectItem>
              <SelectItem value="course_code-asc">Code (A-Z)</SelectItem>
              <SelectItem value="course_code-desc">Code (Z-A)</SelectItem>
              <SelectItem value="instructor_name-asc">Instructor (A-Z)</SelectItem>
              <SelectItem value="instructor_name-desc">Instructor (Z-A)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredCourses.length === 0 ? (
        <Card className="border-dashed border-2 bg-muted/50">
          <CardContent className="pt-6 pb-6 flex flex-col items-center justify-center">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Available Courses</h3>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              No courses match your search or you're already enrolled in all available courses.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCourses.map(course => (
            <Card key={course.course_id} className="h-full flex flex-col">
              <CardHeader>
                <CardTitle className="text-lg font-medium">{course.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow space-y-2 text-sm">
                <div>Code: {course.course_code}</div>
                <div>Instructor: {course.instructor_name}</div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  onClick={() => handleEnroll(course.course_id)}
                  disabled={enrollingCourseId === course.course_id}
                >
                  {enrollingCourseId === course.course_id ? 'Enrolling...' : 'Enroll'}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AvailableCourses;
