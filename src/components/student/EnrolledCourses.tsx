
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, BookOpen, Calendar } from 'lucide-react';
import courseService, { CourseEnrollment } from '@/services/courseService';

interface EnrolledCoursesProps {
  refreshTrigger: number;
}

const EnrolledCourses = ({ refreshTrigger }: EnrolledCoursesProps) => {
  const [enrollments, setEnrollments] = useState<CourseEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {enrollments.map(enrollment => (
        <Card key={enrollment.enrollment_id} className="h-full flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg font-medium">{enrollment.course_title}</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow space-y-2">
            <div className="flex items-center text-sm">
              <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>Enrolled on: {new Date(enrollment.enrollment_date).toLocaleDateString()}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default EnrolledCourses;
