
import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardFooter, 
  CardDescription 
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { AlertCircle, ArrowLeft, ArrowRight, Clock, AlertTriangle } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import quizService, { QuizAttempt, QuizQuestion, SelectedAnswer } from '@/services/quizService';

const QuizAttemptPage = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const quiz = location.state?.quiz;
  
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Map<string, string>>(new Map());
  const [timeRemaining, setTimeRemaining] = useState<string>("00:00:00");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const timerIntervalRef = useRef<number | null>(null);
  const endTimeRef = useRef<string | null>(null);
  const autoSubmitTimeoutRef = useRef<number | null>(null);

  // Function to start the quiz
  const startQuiz = useCallback(async () => {
    if (!quizId) return;
    
    try {
      setLoading(true);
      setError(null);
      const quizAttempt = await quizService.startQuizAttempt(quizId);
      setAttempt(quizAttempt);
      endTimeRef.current = quizAttempt.end_time;
      
      // Calculate time remaining and start countdown
      const endTime = new Date(quizAttempt.end_time).getTime();
      const now = new Date().getTime();
      const timeToEnd = endTime - now;
      
      // Set up timer to update every second
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = window.setInterval(() => {
        const remaining = quizService.formatTimeRemaining(quizAttempt.end_time);
        setTimeRemaining(remaining);
      }, 1000);
      
      // Set up auto-submit when time runs out
      if (autoSubmitTimeoutRef.current) clearTimeout(autoSubmitTimeoutRef.current);
      if (timeToEnd > 0) {
        autoSubmitTimeoutRef.current = window.setTimeout(() => {
          toast.info("Time's up! Your quiz is being submitted automatically.");
          handleSubmit(true);
        }, timeToEnd);
      }
      
    } catch (err: any) {
      console.error('Error starting quiz:', err);
      setError(err.response?.data?.detail || 'Failed to start quiz');
    } finally {
      setLoading(false);
    }
  }, [quizId]);

  // Initialize quiz attempt
  useEffect(() => {
    startQuiz();
    
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (autoSubmitTimeoutRef.current) clearTimeout(autoSubmitTimeoutRef.current);
    };
  }, [startQuiz]);

  // Handle answer selection
  const handleAnswerSelect = (questionId: string, answerId: string) => {
    const updatedAnswers = new Map(selectedAnswers);
    updatedAnswers.set(questionId, answerId);
    setSelectedAnswers(updatedAnswers);
  };

  // Navigate between questions
  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const goToNextQuestion = () => {
    if (attempt && currentQuestionIndex < attempt.quiz_questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  // Submit quiz answers
  const handleSubmit = async (isAutoSubmit = false) => {
    if (!attempt) return;
    
    try {
      setSubmitting(true);
      
      // Convert Map to array of selected answers
      const answers: SelectedAnswer[] = [];
      selectedAnswers.forEach((answerId, questionId) => {
        answers.push({
          question_id: questionId,
          selected_option_id: answerId
        });
      });
      
      // For questions with no answer selected, we need to add them with empty selection
      attempt.quiz_questions.forEach(question => {
        if (!selectedAnswers.has(question.id)) {
          // If this is an auto-submit and no answer selected, we don't include it
          if (!isAutoSubmit) {
            answers.push({
              question_id: question.id,
              selected_option_id: ""  // Empty selection
            });
          }
        }
      });
      
      const response = await quizService.submitQuizAttempt(attempt.attempt_id, answers);
      
      // Clear timers
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (autoSubmitTimeoutRef.current) clearTimeout(autoSubmitTimeoutRef.current);
      
      // Navigate to result page
      navigate(`/quizzes/${quizId}/result`, { 
        state: { 
          result: response,
          quizTitle: quiz?.title || "Quiz"
        } 
      });
      
    } catch (err: any) {
      console.error('Error submitting quiz:', err);
      toast.error(err.response?.data?.detail || 'Failed to submit quiz');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-acadex-primary">Loading Quiz...</h1>
        </div>
        <div className="flex justify-center my-8">
          <div className="animate-pulse text-acadex-primary">Preparing your quiz attempt...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-acadex-primary">Quiz Error</h1>
          <Button variant="outline" asChild>
            <a href="/dashboard"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard</a>
          </Button>
        </div>
        <Alert variant="destructive" className="my-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  // Add a guard clause to prevent rendering if attempt is null or questions are empty
  if (!attempt || !attempt.quiz_questions || attempt.quiz_questions.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-acadex-primary">Quiz Error</h1>
          <Button variant="outline" asChild>
            <a href="/dashboard"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard</a>
          </Button>
        </div>
        <Alert variant="destructive" className="my-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>No quiz questions found. Please try again later.</AlertDescription>
        </Alert>
      </div>
    );
  }

  // Make sure we have a valid currentQuestionIndex
  if (currentQuestionIndex >= attempt.quiz_questions.length) {
    setCurrentQuestionIndex(0);
    return null; // Return null to avoid rendering with invalid index
  }

  const currentQuestion: QuizQuestion = attempt.quiz_questions[currentQuestionIndex];
  const totalQuestions = attempt.quiz_questions.length;
  const answeredQuestions = selectedAnswers.size;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-acadex-primary">{quiz?.title || "Quiz"}</h1>
          <p className="text-muted-foreground">
            Question {currentQuestionIndex + 1} of {totalQuestions}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="text-base px-3 py-1">
            <Clock className="mr-1 h-4 w-4" /> {timeRemaining}
          </Badge>
          <Badge variant="outline" className="text-base px-3 py-1">
            {answeredQuestions}/{totalQuestions} Answered
          </Badge>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-xl">Question {currentQuestionIndex + 1}</CardTitle>
          <CardDescription>{currentQuestion.text}</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup 
            value={selectedAnswers.get(currentQuestion.id) || ""} 
            onValueChange={(value) => handleAnswerSelect(currentQuestion.id, value)}
          >
            {currentQuestion.answers.map((answer) => (
              <div key={answer.id} className="flex items-center space-x-2 mb-3 p-3 border rounded-md hover:bg-muted/50">
                <RadioGroupItem value={answer.id} id={answer.id} />
                <Label htmlFor={answer.id} className="flex-grow cursor-pointer">
                  {answer.text}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {answeredQuestions < totalQuestions && (
        <Alert className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You have {totalQuestions - answeredQuestions} unanswered questions.
            Make sure to answer all questions before submitting.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={goToPreviousQuestion}
          disabled={currentQuestionIndex === 0 || submitting}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Previous
        </Button>
        
        <Button 
          onClick={() => handleSubmit()} 
          disabled={submitting}
        >
          Submit Quiz
        </Button>
        
        <Button 
          variant="outline" 
          onClick={goToNextQuestion}
          disabled={currentQuestionIndex === totalQuestions - 1 || submitting}
        >
          Next <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default QuizAttemptPage;
