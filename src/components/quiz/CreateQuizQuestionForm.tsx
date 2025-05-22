
import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { X, Plus, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import courseService, { CreateQuestionRequest } from '@/services/courseService';

interface CreateQuizQuestionFormProps {
  quizId: string;
  onSuccess: () => void;
}

const questionSchema = z.object({
  text: z.string().min(3, 'Question text is required'),
  answers: z.array(
    z.object({
      text: z.string().min(1, 'Answer text is required'),
      is_correct: z.boolean().default(false),
    })
  ).min(2, 'At least 2 answers are required'),
  correctAnswerIndex: z.number().min(0, 'Please select a correct answer'),
});

const formSchema = z.object({
  questions: z.array(questionSchema),
});

type FormValues = z.infer<typeof formSchema>;

const CreateQuizQuestionForm = ({ quizId, onSuccess }: CreateQuizQuestionFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      questions: [
        {
          text: '',
          answers: [
            { text: '', is_correct: false },
            { text: '', is_correct: false },
          ],
          correctAnswerIndex: -1,
        },
      ],
    },
  });

  const { fields: questionFields, append: appendQuestion, remove: removeQuestion } = useFieldArray({
    control: form.control,
    name: "questions",
  });

  const handleAddQuestion = () => {
    appendQuestion({
      text: '',
      answers: [
        { text: '', is_correct: false },
        { text: '', is_correct: false },
      ],
      correctAnswerIndex: -1,
    });
  };

  const handleRemoveQuestion = (index: number) => {
    if (questionFields.length > 1) {
      removeQuestion(index);
    } else {
      toast({
        title: "Cannot remove",
        description: "You need at least one question.",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (data: FormValues) => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Process form data to match API expectation
      const questionsToSubmit: CreateQuestionRequest[] = data.questions.map(q => {
        // Apply the correctAnswerIndex to mark the right answer
        const answers = q.answers.map((answer, idx) => ({
          text: answer.text,
          is_correct: idx === q.correctAnswerIndex
        }));
        
        return {
          text: q.text,
          answers: answers
        };
      });
      
      await courseService.createQuizQuestions(quizId, questionsToSubmit);
      
      toast({
        title: "Success",
        description: "Questions created successfully",
      });
      
      form.reset({
        questions: [
          {
            text: '',
            answers: [
              { text: '', is_correct: false },
              { text: '', is_correct: false },
            ],
            correctAnswerIndex: -1,
          },
        ],
      });
      
      onSuccess();
    } catch (err: any) {
      console.error('Error creating questions:', err);
      setError(err.response?.data?.detail || 'Failed to create questions');
      
      toast({
        title: "Error",
        description: "Failed to create questions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Quiz Questions</CardTitle>
        <CardDescription>
          Add one or more questions to this quiz. Each question must have at least two answers with one marked as correct.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {questionFields.map((questionField, questionIndex) => {
              const answersName = `questions.${questionIndex}.answers` as const;
              const correctAnswerName = `questions.${questionIndex}.correctAnswerIndex` as const;
              
              return (
                <div key={questionField.id} className="border rounded-md p-4 relative">
                  <div className="absolute top-2 right-2">
                    <Button 
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveQuestion(questionIndex)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="mb-4">
                    <h3 className="text-lg font-medium mb-2">Question {questionIndex + 1}</h3>
                    <FormField
                      control={form.control}
                      name={`questions.${questionIndex}.text`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Question Text</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Enter your question here" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="mb-4">
                    <FormLabel className="block mb-2">Answers</FormLabel>
                    <FormField
                      control={form.control}
                      name={correctAnswerName}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <RadioGroup
                              onValueChange={(value) => field.onChange(parseInt(value))}
                              value={field.value?.toString()}
                              className="space-y-2"
                            >
                              {form.watch(answersName)?.map((_, answerIndex) => {
                                return (
                                  <div key={answerIndex} className="flex items-center gap-2">
                                    <RadioGroupItem value={answerIndex.toString()} id={`q${questionIndex}-a${answerIndex}`} />
                                    <FormField
                                      control={form.control}
                                      name={`${answersName}.${answerIndex}.text`}
                                      render={({ field }) => (
                                        <FormItem className="flex-1">
                                          <FormControl>
                                            <Input placeholder={`Answer ${answerIndex + 1}`} {...field} />
                                          </FormControl>
                                        </FormItem>
                                      )}
                                    />
                                    {answerIndex > 1 && (
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                          const answers = form.getValues(answersName);
                                          const correctAnswerIndex = form.getValues(correctAnswerName);
                                          const newAnswers = [...answers];
                                          newAnswers.splice(answerIndex, 1);
                                          form.setValue(answersName, newAnswers);
                                          
                                          // Adjust correctAnswerIndex if needed
                                          if (answerIndex === correctAnswerIndex) {
                                            form.setValue(correctAnswerName, -1);
                                          } else if (answerIndex < correctAnswerIndex) {
                                            form.setValue(correctAnswerName, correctAnswerIndex - 1);
                                          }
                                        }}
                                      >
                                        <X className="h-4 w-4" />
                                      </Button>
                                    )}
                                  </div>
                                );
                              })}
                            </RadioGroup>
                          </FormControl>
                          <FormDescription>Select the correct answer</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const answers = form.getValues(answersName);
                      form.setValue(answersName, [...answers, { text: '', is_correct: false }]);
                    }}
                    className="mt-2"
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add Answer Option
                  </Button>
                </div>
              );
            })}
            
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleAddQuestion}
            >
              <Plus className="h-4 w-4 mr-1" /> Add Another Question
            </Button>
            
            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Questions'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default CreateQuizQuestionForm;
