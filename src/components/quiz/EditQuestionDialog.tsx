
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/hooks/use-toast';
import courseService, { QuizQuestion, UpdateQuestionRequest, QuizAnswer } from '@/services/courseService';

interface EditQuestionDialogProps {
  quizId: string;
  question: QuizQuestion;
  onQuestionUpdate: () => void;
}

const formSchema = z.object({
  text: z.string().min(3, 'Question text is required'),
  answers: z.array(
    z.object({
      id: z.string(),
      text: z.string().min(1, 'Answer text is required'),
      is_correct: z.boolean(),
    })
  )
  .refine(answers => answers.some(answer => answer.is_correct), {
    message: "At least one answer must be marked as correct",
  }),
});

type FormValues = z.infer<typeof formSchema>;

const EditQuestionDialog = ({ quizId, question, onQuestionUpdate }: EditQuestionDialogProps) => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      text: question.text,
      answers: question.answers.map(answer => ({
        id: answer.id,
        text: answer.text,
        is_correct: answer.is_correct,
      })),
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      const updateData: UpdateQuestionRequest = {
        text: data.text,
        answers: data.answers as QuizAnswer[],
      };
      
      await courseService.updateQuizQuestion(quizId, question.id, updateData);
      
      toast({
        title: "Success",
        description: "Question updated successfully",
      });
      
      onQuestionUpdate();
      setOpen(false);
    } catch (err: any) {
      console.error('Error updating question:', err);
      setError(err.response?.data?.detail || 'Failed to update question');
      
      toast({
        title: "Error",
        description: "Failed to update question",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">Edit</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Question</DialogTitle>
          <DialogDescription>
            Make changes to the question and its answer options.
          </DialogDescription>
        </DialogHeader>
        
        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Question Text</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter your question here" 
                      className="min-h-[80px]" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="space-y-4">
              <FormLabel>Answer Options</FormLabel>
              {question.answers.map((answer, index) => (
                <div key={answer.id} className="flex items-start gap-2 border p-3 rounded">
                  <FormField
                    control={form.control}
                    name={`answers.${index}.is_correct`}
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 pt-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal mt-0">
                          Correct answer
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                  <div className="flex-1">
                    <FormField
                      control={form.control}
                      name={`answers.${index}.text`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input placeholder="Answer text" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`answers.${index}.id`}
                      render={({ field }) => <input type="hidden" {...field} />}
                    />
                  </div>
                </div>
              ))}
            </div>
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditQuestionDialog;
