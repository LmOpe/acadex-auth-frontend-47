import authService from './authService';
import { format } from 'date-fns';

const api = authService.getApiInstance();

export interface Quiz {
  id: string;
  title: string;
  instructions: string;
  course: string;
  start_date_time: string;
  end_date_time: string;
  number_of_questions: number;
  allotted_time: string;
  is_active: boolean;
  created_at: string;
  courseTitle?: string;
  courseCode?: string;
}

export interface CourseQuizzes {
  course_id: string;
  course_details: {
    course_id: string;
    title: string;
    course_code: string;
    lecturer_name: string;
  };
  quizzes: Quiz[];
}

export interface QuizQuestion {
  id: string;
  text: string;
  answers: QuizAnswer[];
}

export interface QuizAnswer {
  id: string;
  text: string;
  is_correct?: boolean;
}

export interface QuizAttempt {
  attempt_id: string;
  end_time: string;
  quiz_questions: QuizQuestion[];
}

export interface SelectedAnswer {
  question_id: string;
  selected_option_id: string;
}

export interface QuizQuestionResult {
  question_id: string;
  question_text: string;
  selected_option_text: string;
  is_correct: boolean;
  correct_option_text?: string;
}

export interface QuizSubmissionResponse {
  score: number;
  quiz_questions?: QuizQuestionResult[];
  answers?: {
    question_id: string;
    selected_option: string;
    is_correct: boolean;
    correct_option?: string;
  }[];
}

export interface StudentAttemptSummary {
  quiz_id: string;
  title: string;
  attempt_time: string;
  score: number;
  submitted: boolean;
}

export interface StudentAttemptsResponse {
  quizzes: StudentAttemptSummary[];
}

export interface QuizAttemptStudent {
  student: string;
  score: number;
  attempt_time: string;
  submitted: boolean;
}

export interface QuizAttemptsResponse {
  students: QuizAttemptStudent[];
}

export interface StudentQuizResult {
  score: number;
  answers: {
    question_id: string;
    selected_option: string | null;
    is_correct: boolean;
    correct_option?: string;
  }[];
}

const quizService = {
  // Get all quizzes
  getAllQuizzes: async (): Promise<CourseQuizzes[]> => {
    const response = await api.get('/api/quizzes/all/');
    return response.data;
  },
  
  // Get quizzes for a specific course
  getCourseQuizzes: async (courseId: string): Promise<Quiz[]> => {
    const response = await api.get('/api/quizzes/all/');
    const allCourses = response.data as CourseQuizzes[];
    
    // Find the course with matching ID
    const courseData = allCourses.find(course => course.course_id === courseId);
    return courseData?.quizzes || [];
  },
  
  // Check if a quiz has been attempted
  hasAttemptedQuiz: async (quizId: string): Promise<boolean> => {
    try {
      const response = await api.get('/api/quizzes/students/attempts/');
      const attempts = response.data.quizzes as StudentAttemptSummary[];
      return attempts.some(attempt => attempt.quiz_id === quizId);
    } catch (error) {
      console.error('Error checking if quiz was attempted:', error);
      return false;
    }
  },
  
  // Start a quiz attempt
  startQuizAttempt: async (quizId: string): Promise<QuizAttempt> => {
    const response = await api.post(`/api/quizzes/${quizId}/attempt/`);
    return response.data;
  },
  
  // Submit quiz attempt
  submitQuizAttempt: async (attemptId: string, answers: SelectedAnswer[]): Promise<QuizSubmissionResponse> => {
    const response = await api.post('/api/quizzes/attempt/submit/', {
      attempt_id: attemptId,
      answers: answers
    });
    return response.data;
  },
  
  // Get all quiz attempts by student
  getStudentAttempts: async (): Promise<StudentAttemptsResponse> => {
    const response = await api.get('/api/quizzes/students/attempts/');
    return response.data;
  },
  
  // Get quiz result detail
  getQuizResult: async (quizId: string): Promise<QuizSubmissionResponse> => {
    const response = await api.get(`/api/quizzes/${quizId}/students/result/`);
    return response.data;
  },
  
  // Normalize quiz result data to a consistent format
  normalizeQuizResult: (result: QuizSubmissionResponse): QuizSubmissionResponse => {
    // If the result already has the expected format (with answers array), return as is
    if (result.answers) {
      return result;
    }
    
    // Convert new format (with quiz_questions array) to the expected format
    if (result.quiz_questions) {
      const normalizedResult: QuizSubmissionResponse = {
        score: result.score,
        answers: result.quiz_questions.map(question => ({
          question_id: question.question_id,
          selected_option: question.selected_option_text,
          is_correct: question.is_correct,
          correct_option: question.correct_option_text
        }))
      };
      return normalizedResult;
    }
    
    // If neither format is present, return with an empty answers array
    return {
      score: result.score || 0,
      answers: []
    };
  },
  
  // Helper function to convert UTC date string to local time
  utcToLocalTime: (utcDateString: string): Date => {
    return new Date(utcDateString);
  },
  
  // Helper function to convert local time to UTC
  localToUtcTime: (localDateString: string): string => {
    const date = new Date(localDateString);
    return date.toISOString();
  },
  
  // Helper function to format time remaining
  formatTimeRemaining: (endTimeUTC: string): string => {
    const endTime = new Date(endTimeUTC);
    const now = new Date();
    
    const timeRemaining = endTime.getTime() - now.getTime();
    
    if (timeRemaining <= 0) {
      return "00:00:00";
    }
    
    const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
    const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  },
  
  // Check if a quiz is currently active
  isQuizActive: (quiz: Quiz): boolean => {
    const now = new Date();
    const startTime = new Date(quiz.start_date_time);
    const endTime = new Date(quiz.end_date_time);
    
    return now >= startTime && now <= endTime && quiz.is_active;
  },
  
  // Format date and time to user-friendly string
  formatDateTime: (dateTimeString: string): string => {
    const localDate = new Date(dateTimeString);
    return format(localDate, 'MMM d, yyyy h:mm a');
  },
  
  // Get students who have attempted a quiz (for lecturers)
  getQuizAttempts: async (quizId: string): Promise<QuizAttemptsResponse> => {
    const response = await api.get(`/api/quizzes/${quizId}/attempts/`);
    return response.data;
  },
  
  // Get specific student's quiz result (for lecturers)
  getStudentQuizResult: async (quizId: string, studentMatric: string): Promise<StudentQuizResult> => {
    const response = await api.get(`/api/quizzes/results/${quizId}/?matric-number=${studentMatric}`);
    return response.data;
  }
};

export default quizService;
