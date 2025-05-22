
import { useState, useEffect } from 'react';
import courseService, { CourseEnrollment } from '@/services/courseService';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Users } from 'lucide-react';

interface CourseEnrollmentsProps {
  courseId: string;
}

const CourseEnrollments = ({ courseId }: CourseEnrollmentsProps) => {
  const [enrollments, setEnrollments] = useState<CourseEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await courseService.getCourseEnrollments(courseId);
        setEnrollments(data);
      } catch (err: any) {
        console.error('Error fetching enrollments:', err);
        setError(err.response?.data?.detail || 'Failed to load student enrollments');
      } finally {
        setLoading(false);
      }
    };

    fetchEnrollments();
  }, [courseId]);

  if (loading) {
    return (
      <div className="flex justify-center my-8">
        <div className="animate-pulse text-acadex-primary">Loading enrolled students...</div>
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
          <Users className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No Students Enrolled</h3>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            No students have enrolled in this course yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Enrolled Students</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student Name</TableHead>
              <TableHead>Student ID</TableHead>
              <TableHead>Enrollment Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {enrollments.map((enrollment) => (
              <TableRow key={enrollment.enrollment_id}>
                <TableCell className="font-medium">{enrollment.student_name}</TableCell>
                <TableCell>{enrollment.student}</TableCell>
                <TableCell>
                  {new Date(enrollment.enrollment_date).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default CourseEnrollments;
