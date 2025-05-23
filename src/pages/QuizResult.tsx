
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { QuizSubmissionResponse } from '@/services/quizService';

const QuizResult = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  
  const result = location.state?.result as QuizSubmissionResponse;
  const quizTitle = location.state?.quizTitle || 'Quiz';
  const returnPath = location.state?.returnPath || '/dashboard';
  
  if (!result) {
    navigate('/dashboard');
    return null;
  }
  
  const totalQuestions = result.answers.length;
  const correctAnswers = result.answers.filter(answer => answer.is_correct).length;
  const scorePercentage = Math.round((correctAnswers / totalQuestions) * 100);
  
  const handleGoBack = () => {
    navigate(returnPath);
  };
  
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
        
        {result.answers.map((answer, index) => (
          <Card key={answer.question_id} className={`border-l-4 ${answer.is_correct ? 'border-l-green-500' : 'border-l-red-500'}`}>
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
        ))}
      </div>
    </div>
  );
};

export default QuizResult;
