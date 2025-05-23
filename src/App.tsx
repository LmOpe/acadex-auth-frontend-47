
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import RegisterStudent from "./pages/RegisterStudent";
import RegisterLecturer from "./pages/RegisterLecturer";
import Dashboard from "./pages/Dashboard";
import CourseDetails from "./pages/CourseDetails"; 
import QuizDetails from "./pages/QuizDetails";
import StudentCourseQuizzes from "./pages/StudentCourseQuizzes";
import QuizAttempt from "./pages/QuizAttempt";
import QuizResult from "./pages/QuizResult";
import QuizAttemptHistory from "./pages/QuizAttemptHistory";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/register/student" element={<RegisterStudent />} />
            <Route path="/register/lecturer" element={<RegisterLecturer />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/courses/:courseId" 
              element={
                <ProtectedRoute>
                  <CourseDetails />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/courses/:courseId/quizzes" 
              element={
                <ProtectedRoute>
                  <StudentCourseQuizzes />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/quizzes/:quizId" 
              element={
                <ProtectedRoute>
                  <QuizDetails />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/quizzes/:quizId/attempt" 
              element={
                <ProtectedRoute>
                  <QuizAttempt />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/quizzes/:quizId/result" 
              element={
                <ProtectedRoute>
                  <QuizResult />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/quiz-attempts" 
              element={
                <ProtectedRoute>
                  <QuizAttemptHistory />
                </ProtectedRoute>
              } 
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
