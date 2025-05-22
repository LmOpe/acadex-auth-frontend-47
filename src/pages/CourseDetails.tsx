
import { useState } from 'react';
import { useParams, Link, useLocation, Navigate } from 'react-router-dom';
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
import CourseEnrollments from '@/components/course/CourseEnrollments';
import CourseQuizzes from '@/components/course/CourseQuizzes';
import CreateQuizForm from '@/components/quiz/CreateQuizForm';
import { Course } from '@/services/courseService';

const CourseDetails = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const location = useLocation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  
  // Get course from location state
  const course = location.state?.course as Course;

  // If no course data is available in navigation state, redirect to dashboard
  if (!course) {
    return (
      <div className="container mx-auto p-4">
        <Alert className="my-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Course information not available. Please select a course from the dashboard.</AlertDescription>
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
