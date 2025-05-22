
import { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import courseService from '@/services/courseService';
import CourseEnrollments from '@/components/course/CourseEnrollments';
import CourseQuizzes from '@/components/course/CourseQuizzes';
import CreateQuizForm from '@/components/quiz/CreateQuizForm';

const CourseDetails = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const location = useLocation();
  const { user } = useAuth();
  const [course, setCourse] = useState<any>(location.state?.course || null);
  const [loading, setLoading] = useState(!location.state?.course);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    // Only fetch if we don't have the course data from navigation state
    if (!location.state?.course && courseId) {
      const fetchCourseDetails = async () => {
        try {
          setLoading(true);
          setError(null);
          
          const courseData = await courseService.getCourseDetails(courseId);
          setCourse(courseData);
        } catch (err: any) {
          console.error('Error fetching course details:', err);
          setError(err.response?.data?.detail || 'Failed to load course details');
        } finally {
          setLoading(false);
        }
      };

      fetchCourseDetails();
    }
  }, [courseId, location.state?.course]);

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-center my-8">
          <div className="animate-pulse text-acadex-primary">Loading course details...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <Alert variant="destructive" className="my-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button asChild variant="outline">
            <Link to="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container mx-auto p-4">
        <Alert className="my-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Course not found</AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button asChild variant="outline">
            <Link to="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="flex items-center mb-4">
          <Button asChild variant="ghost" className="mr-2">
            <Link to="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Link>
          </Button>
          <h1 className="text-3xl font-bold text-acadex-primary">{course.title}</h1>
        </div>
        <div className="text-muted-foreground font-mono">{course.course_code}</div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
          <TabsTrigger value="create-quiz">Create Quiz</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Course Details</CardTitle>
              <CardDescription>Information about this course</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Description</h3>
                  <p>{course.description || 'No description provided.'}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium mb-2">Instructor</h3>
                    <p>{course.instructor_name}</p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Created</h3>
                    <p>{new Date(course.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="quizzes">
          <CourseQuizzes courseId={courseId || ''} />
        </TabsContent>
        
        <TabsContent value="create-quiz">
          <CreateQuizForm courseId={courseId || ''} onSuccess={() => setActiveTab("quizzes")} />
        </TabsContent>
        
        <TabsContent value="students">
          <CourseEnrollments courseId={courseId || ''} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CourseDetails;
