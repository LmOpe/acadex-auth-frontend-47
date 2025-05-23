
import { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { QuizSubmissionResponse } from '@/services/quizService';
import quizService from '@/services/quizService';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

const QuizResult = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [result, setResult] = useState<QuizSubmissionResponse | null>(
    location.state?.result || null
  );
  const quizTitle = location.state?.quizTitle || 'Quiz';
  const returnPath = location.state?.returnPath || '/dashboard';
  
  const [loading, setLoading] = useState(!location.state?.result);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResult = async () => {
      if (result || !quizId) return;
      
      try {
        setLoading(true);
        const resultData = await quizService.getQuizResult(quizId);
        setResult(resultData);
      } catch (err: any) {
        console.error('Error fetching quiz result:', err);
        setError(err.response?.data?.detail || 'Failed to load quiz result');
      } finally {
        setLoading(false);
      }
    };
    
    fetchResult();
  }, [quizId, result]);
  
  const handleGoBack = () => {
    navigate(returnPath);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-acadex-primary">{quizTitle} Results</h1>
          </div>
          <Button variant="outline" onClick={handleGoBack}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
        </div>
        <div className="flex justify-center my-8">
          <div className="animate-pulse text-acadex-primary">Loading quiz results...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-acadex-primary">{quizTitle} Results</h1>
          </div>
          <Button variant="outline" onClick={handleGoBack}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
        </div>
        <Alert variant="destructive" className="my-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }
  
  if (!result) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-acadex-primary">{quizTitle} Results</h1>
          </div>
          <Button variant="outline" onClick={handleGoBack}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
        </div>
        <Alert variant="destructive" className="my-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>No result data available.</AlertDescription>
        </Alert>
      </div>
    );
  }
  
  // Add null check for answers array
  const answers = result.answers || [];
  const totalQuestions = answers.length;
  const correctAnswers = answers.filter(answer => answer.is_correct).length;
  const scorePercentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-acadex-primary">{quizTitle} Results</h1>
          <p className="text-muted-foreground">Your quiz has been submitted successfully</p>
        </div>
        <Button variant="outline" onClick={handleGoBack}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
      </div>
      
      <Card className="mb-8">
        <CardHeader className="text-center border-b pb-6">
          <CardTitle className="text-2xl">
            Your Score: {scorePercentage}%
          </CardTitle>
          <p className="text-muted-foreground">
            {correctAnswers} correct out of {totalQuestions} questions
          </p>
        </CardHeader>
      </Card>
      
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Answers Review</h2>
        
        {answers.length > 0 ? (
          answers.map((answer, index) => (
            <Card key={answer.question_id || index} className={`border-l-4 ${answer.is_correct ? 'border-l-green-500' : 'border-l-red-500'}`}>
              <CardContent className="py-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    {answer.is_correct ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Question {index + 1}</p>
                    <p className="text-muted-foreground mb-2">Your answer: {answer.selected_option || 'No answer'}</p>
                    {!answer.is_correct && answer.correct_option && (
                      <p className="text-sm text-green-600">Correct answer: {answer.correct_option}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="py-4 text-center">
              <p className="text-muted-foreground">No answer details available.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default QuizResult;
