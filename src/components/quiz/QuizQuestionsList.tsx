
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, HelpCircle } from 'lucide-react';
import courseService, { QuizQuestion } from '@/services/courseService';
import EditQuestionDialog from '@/components/quiz/EditQuestionDialog';

interface QuizQuestionsListProps {
  quizId: string;
  refreshTrigger: number;
}

const QuizQuestionsList = ({ quizId, refreshTrigger }: QuizQuestionsListProps) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await courseService.getQuizQuestions(quizId);
        setQuestions(data);
      } catch (err: any) {
        console.error('Error fetching questions:', err);
        setError(err.response?.data?.detail || 'Failed to load questions');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [quizId, refreshTrigger]);

  const handleQuestionUpdate = async () => {
    try {
      const data = await courseService.getQuizQuestions(quizId);
      setQuestions(data);
    } catch (err: any) {
      console.error('Error refreshing questions:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center my-8">
        <div className="animate-pulse text-acadex-primary">Loading questions...</div>
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

  if (questions.length === 0) {
    return (
      <Card className="border-dashed border-2 bg-muted/50">
        <CardContent className="pt-6 pb-6 flex flex-col items-center justify-center">
          <HelpCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No Questions Found</h3>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            No questions have been created for this quiz yet. Add questions using the "Add Questions" tab.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Quiz Questions ({questions.length})</h2>
      
      {questions.map((question, index) => (
        <Card key={question.id} className="mb-6">
          <CardHeader className="flex flex-row items-start justify-between">
            <div>
              <h3 className="text-lg font-medium">
                <span className="inline-block bg-muted rounded-full px-2 py-1 text-sm mr-2">
                  Q{index + 1}
                </span>
                {question.text}
              </h3>
            </div>
            <EditQuestionDialog 
              quizId={quizId}
              question={question}
              onQuestionUpdate={handleQuestionUpdate}
            />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {question.answers.map((answer) => (
                <div 
                  key={answer.id} 
                  className={`p-3 rounded-md flex items-center justify-between ${
                    answer.is_correct ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'
                  }`}
                >
                  <span>{answer.text}</span>
                  {answer.is_correct && <Badge>Correct</Badge>}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default QuizQuestionsList;
