
import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, BookOpen } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import courseService, { Course, CourseEnrollment } from '@/services/courseService';

interface AvailableCoursesProps {
  enrolledCourses: CourseEnrollment[];
  onEnrollmentSuccess: () => void;
}

const AvailableCourses = ({ enrolledCourses, onEnrollmentSuccess }: AvailableCoursesProps) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enrollingCourseId, setEnrollingCourseId] = useState<string | null>(null);
  const [searchSubmitted, setSearchSubmitted] = useState(false);

  // Set of enrolled course IDs for efficient filtering
  const enrolledCourseIds = new Set(enrolledCourses.map(enrollment => enrollment.course));

  useEffect(() => {
    // Only fetch courses when component mounts or search is submitted
    if (!searchSubmitted && courses.length > 0) {
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
      } catch (err: any) {
        console.error('Fetch courses error:', err);
        setError(err.response?.data?.detail || 'Failed to fetch available courses');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCourses();
  }, [searchSubmitted, enrolledCourseIds]);

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
                <CardTitle className="text-lg font-semibold">{course.title}</CardTitle>
                <p className="text-sm font-mono text-muted-foreground">{course.course_code}</p>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground mb-2">{course.description || "No description available"}</p>
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
