
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import courseService from '@/services/courseService';
import { toast } from '@/components/ui/sonner';

interface CreateCourseFormProps {
  onSuccess: () => void;
}

const CreateCourseForm = ({ onSuccess }: CreateCourseFormProps) => {
  const [courseCode, setCourseCode] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!courseCode.trim() || !title.trim()) {
      setError('Course code and title are required');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      await courseService.createCourse({
        course_code: courseCode,
        title,
        description
      });
      
      // Reset form
      setCourseCode('');
      setTitle('');
      setDescription('');
      
      toast.success('Course created successfully');
      onSuccess(); // Trigger refresh of courses list
    } catch (err: any) {
      console.error('Create course error:', err);
      console.log('Error response data:', err.response?.data);
      
      // Handle different error formats
      if (err.response?.data) {
        if (typeof err.response.data === 'string') {
          setError(err.response.data);
        } else if (err.response.data.detail) {
          setError(err.response.data.detail);
        } else if (typeof err.response.data === 'object') {
          const errorMessages = Object.values(err.response.data)
            .flat()
            .filter(Boolean)
            .join(', ');
          setError(errorMessages || 'Failed to create course. Please check your input.');
        }
      } else {
        setError('An error occurred while creating the course. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Course</CardTitle>
      </CardHeader>
      
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="courseCode">Course Code</Label>
            <Input
              id="courseCode"
              placeholder="e.g. CSC101"
              value={courseCode}
              onChange={(e) => setCourseCode(e.target.value)}
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="title">Course Title</Label>
            <Input
              id="title"
              placeholder="Introduction to Computer Science"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter course description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
              rows={4}
            />
          </div>
          
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Create Course'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreateCourseForm;
