
import { useEffect, useState } from 'react';
import courseService, { Course } from '@/services/courseService';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

interface CourseListProps {
  refreshTrigger: number;
}

const CourseList = ({
  refreshTrigger
}: CourseListProps) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await courseService.getLecturerCourses();
        setCourses(data);
      } catch (err: any) {
        console.error('Fetch courses error:', err);
        console.log('Error response data:', err.response?.data);

        // Handle different error formats
        if (err.response?.data) {
          if (typeof err.response.data === 'string') {
            setError(err.response.data);
          } else if (err.response.data.detail) {
            setError(err.response.data.detail);
          } else {
            setError('Failed to fetch courses. Please try again.');
          }
        } else {
          setError('An error occurred while fetching courses');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [refreshTrigger]);

  if (loading) {
    return <div className="flex justify-center my-8">
        <div className="animate-pulse text-acadex-primary">Loading courses...</div>
      </div>;
  }

  if (error) {
    return <Alert variant="destructive" className="my-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>;
  }

  if (courses.length === 0) {
    return <Card className="border-dashed border-2 bg-muted/50">
        <CardContent className="pt-6 pb-6 flex flex-col items-center justify-center">
          <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No Courses Yet</h3>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            You haven't created any courses yet. Create your first course using the form above.
          </p>
        </CardContent>
      </Card>;
  }

  return <div className="space-y-4">
      <h2 className="text-xl font-semibold text-acadex-primary">Your Courses</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map(course => <Card key={course.course_id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg font-medium capitalize">{course.title}</CardTitle>
                  <CardDescription className="font-mono text-sm uppercase">{course.course_code}</CardDescription>
                </div>
                <BookOpen className="h-5 w-5 text-acadex-secondary" />
              </div>
            </CardHeader>
            
            <CardFooter>
              <Button variant="outline" className="w-full" asChild>
                <Link to={`/courses/${course.course_id}`} state={{ course }}>View Details</Link>
              </Button>
            </CardFooter>
          </Card>)}
      </div>
    </div>;
};

export default CourseList;
