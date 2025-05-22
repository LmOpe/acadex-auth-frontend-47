
import { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Clock, Calendar, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import CreateQuizQuestionForm from '@/components/quiz/CreateQuizQuestionForm';
import QuizQuestionsList from '@/components/quiz/QuizQuestionsList';
import courseService, { Quiz } from '@/services/courseService';

const QuizDetails = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const location = useLocation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Get quiz from location state
  const quiz = location.state?.quiz as Quiz;
  const courseId = location.state?.courseId as string;
  
  // If no quiz data is available, show an error
  if (!quiz || !courseId) {
    return (
      <div className="container mx-auto p-4">
        <Alert className="my-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Quiz information not available. Please select a quiz from the course page.</AlertDescription>
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

  const handleQuestionsUpdated = () => {
    setRefreshTrigger(prev => prev + 1);
    setActiveTab("questions");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="flex items-center mb-4">
          <Button asChild variant="ghost" className="mr-2">
            <Link to={`/courses/${courseId}`}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Course
            </Link>
          </Button>
          <h1 className="text-3xl font-bold text-acadex-primary">{quiz.title}</h1>
        </div>
        <div className="text-muted-foreground">Quiz ID: {quiz.id}</div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="questions">Quiz Questions</TabsTrigger>
          <TabsTrigger value="add-questions">Add Questions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Quiz Details</CardTitle>
              <CardDescription>Information about this quiz</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Instructions</h3>
                  <p>{quiz.instructions || 'No instructions provided.'}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium mb-2">Status</h3>
                    <p className={`font-medium ${quiz.is_active ? 'text-green-600' : 'text-gray-500'}`}>
                      {quiz.is_active ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Number of Questions</h3>
                    <p>{quiz.number_of_questions}</p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Allotted Time</h3>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{quiz.allotted_time}</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Created</h3>
                    <p>{new Date(quiz.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Time Period</h3>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {format(new Date(quiz.start_date_time), 'MMM d, yyyy h:mm a')} - {format(new Date(quiz.end_date_time), 'MMM d, yyyy h:mm a')}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="questions">
          <QuizQuestionsList quizId={quizId || ''} refreshTrigger={refreshTrigger} />
        </TabsContent>
        
        <TabsContent value="add-questions">
          <CreateQuizQuestionForm quizId={quizId || ''} onSuccess={handleQuestionsUpdated} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default QuizDetails;
