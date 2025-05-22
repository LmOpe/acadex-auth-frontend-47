
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Edit, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { toast } from "sonner";
import { Quiz } from '@/services/courseService';
import courseService from '@/services/courseService';
import { cn } from '@/lib/utils';

interface EditQuizDialogProps {
  quiz: Quiz;
  onQuizUpdate: () => void;
}

// Format time duration as HH:MM:SS
const formatDuration = (hours: number, minutes: number): string => {
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
};

// Parse time duration from HH:MM:SS to { hours, minutes }
const parseDuration = (duration: string): { hours: number, minutes: number } => {
  const parts = duration.split(':');
  return {
    hours: parseInt(parts[0], 10),
    minutes: parseInt(parts[1], 10),
  };
};

const editQuizSchema = z.object({
  title: z.string().min(1, "Title is required"),
  instructions: z.string().min(1, "Instructions are required"),
  start_date_time: z.date({
    required_error: "Start date and time is required",
  }),
  end_date_time: z.date({
    required_error: "End date and time is required",
  }),
  number_of_questions: z.coerce.number().int().min(1, "At least 1 question is required"),
  hours: z.coerce.number().int().min(0).max(23),
  minutes: z.coerce.number().int().min(0).max(59),
  is_active: z.boolean(),
}).refine((data) => data.end_date_time > data.start_date_time, {
  message: "End date must be after start date",
  path: ["end_date_time"],
}).refine((data) => data.hours > 0 || data.minutes > 0, {
  message: "Duration must be greater than 0",
  path: ["minutes"],
});

type EditQuizFormValues = z.infer<typeof editQuizSchema>;

const EditQuizDialog = ({ quiz, onQuizUpdate }: EditQuizDialogProps) => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const duration = parseDuration(quiz.allotted_time);
  
  const form = useForm<EditQuizFormValues>({
    resolver: zodResolver(editQuizSchema),
    defaultValues: {
      title: quiz.title,
      instructions: quiz.instructions,
      start_date_time: new Date(quiz.start_date_time),
      end_date_time: new Date(quiz.end_date_time),
      number_of_questions: quiz.number_of_questions,
      hours: duration.hours,
      minutes: duration.minutes,
      is_active: quiz.is_active,
    },
  });
  
  const onSubmit = async (data: EditQuizFormValues) => {
    setIsSubmitting(true);
    
    try {
      const quizData = {
        title: data.title,
        instructions: data.instructions,
        start_date_time: data.start_date_time.toISOString(),
        end_date_time: data.end_date_time.toISOString(),
        number_of_questions: data.number_of_questions,
        allotted_time: formatDuration(data.hours, data.minutes),
        is_active: data.is_active,
      };
      
      await courseService.updateQuiz(quiz.id, quizData);
      toast.success("Quiz updated successfully");
      onQuizUpdate();
      setOpen(false);
    } catch (error: any) {
      console.error("Failed to update quiz:", error);
      
      if (error.response?.data) {
        const errorData = error.response.data;
        if (typeof errorData === 'string') {
          toast.error(errorData);
        } else if (errorData.detail) {
          toast.error(errorData.detail);
        } else {
          const errors = Object.entries(errorData)
            .map(([key, value]) => `${key}: ${value}`)
            .join(', ');
          toast.error(`Failed to update quiz: ${errors}`);
        }
      } else {
        toast.error("Failed to update quiz. Please try again later.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Edit className="h-4 w-4 mr-1" />
          Edit Quiz
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Quiz</DialogTitle>
          <DialogDescription>
            Update quiz details and settings
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quiz Title</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="instructions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instructions</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_date_time"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Start Date & Time</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP HH:mm")
                            ) : (
                              <span>Pick a date and time</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                        <div className="p-3 border-t border-border">
                          <Input
                            type="time"
                            onChange={(e) => {
                              const [hours, minutes] = e.target.value.split(':').map(Number);
                              const newDate = new Date(field.value || new Date());
                              newDate.setHours(hours);
                              newDate.setMinutes(minutes);
                              field.onChange(newDate);
                            }}
                            value={field.value ? format(field.value, "HH:mm") : ""}
                          />
                        </div>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="end_date_time"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>End Date & Time</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP HH:mm")
                            ) : (
                              <span>Pick a date and time</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                        <div className="p-3 border-t border-border">
                          <Input
                            type="time"
                            onChange={(e) => {
                              const [hours, minutes] = e.target.value.split(':').map(Number);
                              const newDate = new Date(field.value || new Date());
                              newDate.setHours(hours);
                              newDate.setMinutes(minutes);
                              field.onChange(newDate);
                            }}
                            value={field.value ? format(field.value, "HH:mm") : ""}
                          />
                        </div>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="number_of_questions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of Questions</FormLabel>
                  <FormControl>
                    <Input {...field} type="number" min="1" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="hours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (Hours)</FormLabel>
                    <FormControl>
                      <div className="flex items-center">
                        <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                        <Input {...field} type="number" min="0" max="23" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="minutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (Minutes)</FormLabel>
                    <FormControl>
                      <div className="flex items-center">
                        <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                        <Input {...field} type="number" min="0" max="59" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Quiz Status</FormLabel>
                    <FormDescription>
                      {field.value ? 'Quiz is active and available to students' : 'Quiz is inactive and hidden from students'}
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Updating..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditQuizDialog;
