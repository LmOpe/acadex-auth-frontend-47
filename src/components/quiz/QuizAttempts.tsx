
import { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertCircle, Eye, Users, ArrowUpDown, Filter, HelpCircle } from 'lucide-react';
import { format } from 'date-fns';
import quizService, { QuizAttemptStudent } from '@/services/quizService';
import StudentResultDialog from './StudentResultDialog';

interface QuizAttemptsProps {
  quizId: string;
}

type SortField = 'student' | 'score' | 'attempt_time' | 'status';
type SortOrder = 'asc' | 'desc';
type StatusFilter = 'all' | 'submitted' | 'not_submitted';

const QuizAttempts = ({ quizId }: QuizAttemptsProps) => {
  const [attempts, setAttempts] = useState<QuizAttemptStudent[]>([]);
  const [filteredAttempts, setFilteredAttempts] = useState<QuizAttemptStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  
  // Filter and sort states
  const [sortField, setSortField] = useState<SortField>('attempt_time');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  useEffect(() => {
    const fetchAttempts = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await quizService.getQuizAttempts(quizId);
        setAttempts(response.students);
      } catch (err: any) {
        console.error('Error fetching quiz attempts:', err);
        setError(err.response?.data?.detail || 'Failed to load quiz attempts');
      } finally {
        setLoading(false);
      }
    };

    fetchAttempts();
  }, [quizId]);

  // Apply filtering and sorting
  useEffect(() => {
    let filtered = [...attempts];

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(attempt => 
        statusFilter === 'submitted' ? attempt.submitted : !attempt.submitted
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortField) {
        case 'student':
          aValue = a.student.toLowerCase();
          bValue = b.student.toLowerCase();
          break;
        case 'score':
          aValue = a.score;
          bValue = b.score;
          break;
        case 'attempt_time':
          aValue = new Date(a.attempt_time);
          bValue = new Date(b.attempt_time);
          break;
        case 'status':
          aValue = a.submitted ? 1 : 0;
          bValue = b.submitted ? 1 : 0;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredAttempts(filtered);
  }, [attempts, sortField, sortOrder, statusFilter]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleViewResult = (studentMatric: string) => {
    setSelectedStudent(studentMatric);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Student Attempts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <div className="animate-pulse text-muted-foreground">Loading attempts...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Student Attempts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Student Attempts ({attempts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {attempts.length === 0 ? (
            <Card className="border-dashed border-2 bg-muted/50">
              <CardContent className="pt-6 pb-6 flex flex-col items-center justify-center">
                <HelpCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Attempts Yet</h3>
                <p className="text-sm text-muted-foreground text-center max-w-md">
                  No students have attempted this quiz yet. Student attempts will appear here once they start taking the quiz.
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Filter and Sort Controls */}
              <div className="flex gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <Select value={statusFilter} onValueChange={(value: StatusFilter) => setStatusFilter(value)}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="submitted">Submitted</SelectItem>
                      <SelectItem value="not_submitted">Not Submitted</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                  <Select value={`${sortField}-${sortOrder}`} onValueChange={(value) => {
                    const [field, order] = value.split('-') as [SortField, SortOrder];
                    setSortField(field);
                    setSortOrder(order);
                  }}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student-asc">Student (A-Z)</SelectItem>
                      <SelectItem value="student-desc">Student (Z-A)</SelectItem>
                      <SelectItem value="score-desc">Score (High-Low)</SelectItem>
                      <SelectItem value="score-asc">Score (Low-High)</SelectItem>
                      <SelectItem value="attempt_time-desc">Latest First</SelectItem>
                      <SelectItem value="attempt_time-asc">Oldest First</SelectItem>
                      <SelectItem value="status-desc">Submitted First</SelectItem>
                      <SelectItem value="status-asc">Pending First</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <Button variant="ghost" onClick={() => handleSort('student')} className="h-auto p-0 font-medium">
                        Student
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button variant="ghost" onClick={() => handleSort('score')} className="h-auto p-0 font-medium">
                        Score
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button variant="ghost" onClick={() => handleSort('attempt_time')} className="h-auto p-0 font-medium">
                        Attempt Time
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button variant="ghost" onClick={() => handleSort('status')} className="h-auto p-0 font-medium">
                        Status
                      </Button>
                    </TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAttempts.map((attempt, index) => (
                    <TableRow key={`${attempt.student}-${attempt.attempt_time}-${index}`}>
                      <TableCell className="font-medium">
                        {attempt.student}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {attempt.score}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {format(new Date(attempt.attempt_time), 'MMM d, yyyy h:mm a')}
                      </TableCell>
                      <TableCell>
                        <Badge variant={attempt.submitted ? "default" : "secondary"}>
                          {attempt.submitted ? 'Submitted' : 'Not Submitted'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {attempt.submitted ? (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewResult(attempt.student.split(' - ')[1])}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View Result
                          </Button>
                        ) : (
                          <Button 
                            variant="outline" 
                            size="sm"
                            disabled
                            className="opacity-50 cursor-not-allowed"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View Result
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </>
          )}
        </CardContent>
      </Card>

      {selectedStudent && (
        <StudentResultDialog
          quizId={quizId}
          studentMatric={selectedStudent}
          isOpen={!!selectedStudent}
          onClose={() => setSelectedStudent(null)}
        />
      )}
    </>
  );
};

export default QuizAttempts;
