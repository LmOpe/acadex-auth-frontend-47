import { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, ArrowLeft } from 'lucide-react';
import quizService, { QuizSubmissionResponse } from '@/services/quizService';

const QuizResult = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const location = useLocation();
  const navigate = useLocation();
  
  const [result, setResult] = useState<QuizSubmissionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Get result either from navigation state or fetch from API
  useEffect(() => {
    const fetchResult = async () => {
      // Check if we already have the result from navigation state
      if (location.state?.result) {
        setResult(location.state.result);
        setLoading(false);
        return;
      }
      
      // Otherwise fetch from API
      if (!quizId) return;
      
      try {
        setLoading(true);
        setError(null);
        const data = await quizService.getQuizResult(quizId);
        setResult(data);
      } catch (err: any) {
        console.error('Error fetching quiz result:', err);
        setError(err.response?.data?.detail || 'Failed to load quiz result');
      } finally {
        setLoading(false);
      }
    };
    
    fetchResult();
  }, [quizId, location.state]);
  
  const quizTitle = location.state?.quizTitle || "Quiz Result";
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-acadex-primary">Loading Result...</h1>
        </div>
        <div className="flex justify-center my-8">
          <div className="animate-pulse text-acadex-primary">Loading your quiz result...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-acadex-primary">Quiz Result Error</h1>
          <Button variant="outline" asChild>
            <Link to="/dashboard"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard</Link>
          </Button>
        </div>
        <Alert variant="destructive" className="my-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!result) return null;
  
  const totalQuestions = result.answers.length;
  const correctAnswers = result.answers.filter(answer => answer.is_correct).length;
  const scorePercentage = Math.round((correctAnswers / totalQuestions) * 100);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-acadex-primary">{quizTitle}</h1>
          <p className="text-muted-foreground">Your quiz result</p>
        </div>
        <Button variant="outline" asChild>
          <Link to="/dashboard"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard</Link>
        </Button>
      </div>
      
      <div className="mb-8 text-center">
        <div className="text-4xl font-bold mb-2">{scorePercentage}%</div>
        <p className="text-xl">
          You got <span className="font-semibold">{correctAnswers}</span> out of <span className="font-semibold">{totalQuestions}</span> questions correct
        </p>
      </div>
      
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Question Review</h2>
        
        {result.answers.map((answer, index) => (
          <Card key={answer.question_id} className={answer.is_correct ? "border-green-200" : "border-red-200"}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Question {index + 1}</CardTitle>
                {answer.is_correct ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base mb-2">Your answer: {answer.selected_option}</CardDescription>
              {!answer.is_correct && answer.correct_option && (
                <CardDescription className="text-base font-medium text-green-600">
                  Correct answer: {answer.correct_option}
                </CardDescription>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default QuizResult;
