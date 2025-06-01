
import { useState, useEffect } from 'react';
import { Search, ArrowUpDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertCircle, BookOpen } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import courseService, { Course, CourseEnrollment } from '@/services/courseService';

interface AvailableCoursesProps {
  enrolledCourses: CourseEnrollment[];
  onEnrollmentSuccess: () => void;
}

type SortField = 'title' | 'course_code' | 'instructor_name';
type SortOrder = 'asc' | 'desc';

const AvailableCourses = ({ enrolledCourses, onEnrollmentSuccess }: AvailableCoursesProps) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enrollingCourseId, setEnrollingCourseId] = useState<string | null>(null);
  const [searchSubmitted, setSearchSubmitted] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  
  // Sort states
  const [sortField, setSortField] = useState<SortField>('title');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // Set of enrolled course IDs for efficient filtering
  const enrolledCourseIds = new Set(enrolledCourses.map(enrollment => enrollment.course));

  useEffect(() => {
    // Only fetch courses when component mounts or search is submitted
    if (!searchSubmitted && initialLoadComplete) {
      return;
    }

    const fetchCourses = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await courseService.getAllCourses(searchQuery);
        
        // Filter out courses that the student is already enrolled in
        const availableCourses = data.filter(
          course => !enrolledCourseIds.has(course.course_id)
        );
        
        setCourses(availableCourses);
        setFilteredCourses(availableCourses);
        setSearchSubmitted(false);
        setInitialLoadComplete(true);
      } catch (err: any) {
        console.error('Fetch courses error:', err);
        setError(err.response?.data?.detail || 'Failed to fetch available courses');
        setInitialLoadComplete(true);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCourses();
  }, [searchSubmitted, enrolledCourseIds]);

  // Add this effect to re-filter courses when enrolledCourses prop changes
  useEffect(() => {
    if (courses.length > 0) {
      // Create updated set of enrolled course IDs
      const updatedEnrolledCourseIds = new Set(enrolledCourses.map(enrollment => enrollment.course));
      
      // Re-filter the available courses
      const availableCourses = courses.filter(
        course => !updatedEnrolledCourseIds.has(course.course_id)
      );
      
      setCourses(availableCourses);
    }
  }, [enrolledCourses, courses]);

  // Apply sorting to filtered courses
  useEffect(() => {
    let sorted = [...courses];

    // Apply sorting
    sorted.sort((a, b) => {
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

    setFilteredCourses(sorted);
  }, [courses, sortField, sortOrder]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchSubmitted(true);
  };

  const handleEnroll = async (courseId: string) => {
    try {
      setEnrollingCourseId(courseId);
      await courseService.enrollInCourse(courseId);
      toast.success('Successfully enrolled in course!');
      onEnrollmentSuccess();
    } catch (err: any) {
      console.error('Enrollment error:', err);
      const errorMessage = err.response?.data?.detail || 
                           err.response?.data?.message || 
                           'Failed to enroll in course';
      toast.error(errorMessage);
    } finally {
      setEnrollingCourseId(null);
    }
  };

  if (loading && !initialLoadComplete) {
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
      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          placeholder="Search courses by title, code or instructor..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" variant="secondary">
          <Search className="h-4 w-4 mr-2" />
          Search
        </Button>
      </form>

      {/* Sort Controls */}
      {filteredCourses.length > 0 && (
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
      )}

      {filteredCourses.length === 0 ? (
        <Card className="border-dashed border-2 bg-muted/50">
          <CardContent className="pt-6 pb-6 flex flex-col items-center justify-center">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Available Courses</h3>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              {searchQuery 
                ? "No courses match your search criteria. Try different keywords."
                : "There are no available courses for enrollment at the moment."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCourses.map(course => (
            <Card key={course.course_id} className="h-full flex flex-col">
              <CardHeader>
                <CardTitle className="text-lg font-semibold capitalize">{course.title}</CardTitle>
                <p className="text-sm font-mono text-muted-foreground uppercase">{course.course_code}</p>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground mb-2 capitalize">{course.description || "No description available"}</p>
                <p className="text-sm">
                  <span className="text-muted-foreground">Instructor: </span>
                  {course.instructor_name}
                </p>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  onClick={() => handleEnroll(course.course_id)}
                  disabled={!!enrollingCourseId}
                >
                  {enrollingCourseId === course.course_id ? "Enrolling..." : "Enroll"}
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
