
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Navigate, Link } from 'react-router-dom';
import CreateCourseForm from '@/components/course/CreateCourseForm';
import CourseList from '@/components/course/CourseList';
import AvailableCourses from '@/components/student/AvailableCourses';
import EnrolledCourses from '@/components/student/EnrolledCourses';
import PendingQuizzes from '@/components/student/PendingQuizzes';
import courseService, { CourseEnrollment } from '@/services/courseService';
import { ClipboardList } from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [enrolledCoursesRefreshTrigger, setEnrolledCoursesRefreshTrigger] = useState(0);
  const [studentActiveTab, setStudentActiveTab] = useState("available");
  const [enrolledCourses, setEnrolledCourses] = useState<CourseEnrollment[]>([]);
  const [loadingEnrollments, setLoadingEnrollments] = useState(true);
  
  // If user is not logged in, redirect to login page
  if (!user) {
    return <Navigate to="/login" />;
  }

  // Check if user is a lecturer
  const isLecturer = user.role && user.role.toUpperCase() === 'LECTURER';

  // For students, fetch enrolled courses only once on initial load
  useEffect(() => {
    if (!isLecturer) {
      const fetchEnrollments = async () => {
        try {
          setLoadingEnrollments(true);
          const data = await courseService.getStudentEnrollments();
          setEnrolledCourses(data);
        } catch (error) {
          console.error("Failed to fetch enrollments:", error);
        } finally {
          setLoadingEnrollments(false);
        }
      };
      
      fetchEnrollments();
    }
  }, [isLecturer, enrolledCoursesRefreshTrigger]);
  
  const handleCourseCreated = () => {
    // Increment refresh trigger to reload course list
    setRefreshTrigger(prev => prev + 1);
  };

  const handleEnrollmentSuccess = () => {
    // Increment triggers to reload both available and enrolled course lists
    setEnrolledCoursesRefreshTrigger(prev => prev + 1);
  };
  
  if (isLecturer) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-acadex-primary">Lecturer Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {user.firstName} {user.lastName}</p>
          </div>
          <Button variant="outline" onClick={logout}>Sign Out</Button>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <CreateCourseForm onSuccess={handleCourseCreated} />
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold">Your Profile</h2>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="text-muted-foreground">Name:</span>
                    <span>{user.firstName} {user.lastName}</span>
                    <span className="text-muted-foreground">Role:</span>
                    <span className="capitalize">{user.role}</span>
                    <span className="text-muted-foreground">ID:</span>
                    <span>{user.id}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <div className="mt-8">
          <CourseList refreshTrigger={refreshTrigger} />
        </div>
      </div>
    );
  }
  
  // Student dashboard
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-acadex-primary">Student Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user.firstName} {user.lastName}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to="/quiz-attempts">
              <ClipboardList className="h-4 w-4 mr-2" />
              Quiz History
            </Link>
          </Button>
          <Button variant="outline" onClick={logout}>Sign Out</Button>
        </div>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card className="md:col-span-2">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Your Profile</h2>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-muted-foreground">Name:</span>
                <span>{user.firstName} {user.lastName}</span>
                <span className="text-muted-foreground">Role:</span>
                <span className="capitalize">{user.role}</span>
                <span className="text-muted-foreground">ID:</span>
                <span>{user.id}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Pending Quizzes Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Pending Quizzes</h2>
        <PendingQuizzes enrolledCourses={enrolledCourses} />
      </div>
      
      <Tabs value={studentActiveTab} onValueChange={setStudentActiveTab}>
        <TabsList className="mb-8">
          <TabsTrigger value="available">Available Courses</TabsTrigger>
          <TabsTrigger value="enrolled">My Enrolled Courses</TabsTrigger>
        </TabsList>
        
        <TabsContent value="available" className="space-y-6">
          <h2 className="text-2xl font-semibold">Available Courses</h2>
          <AvailableCourses 
            enrolledCourses={enrolledCourses} 
            onEnrollmentSuccess={handleEnrollmentSuccess} 
          />
        </TabsContent>
        
        <TabsContent value="enrolled" className="space-y-6">
          <h2 className="text-2xl font-semibold">My Enrolled Courses</h2>
          <EnrolledCourses 
            refreshTrigger={enrolledCoursesRefreshTrigger} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
