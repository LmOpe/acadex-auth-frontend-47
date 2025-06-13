
import authService from './authService';

const BASE_URL = 'https://acadex.run.place';

// Reuse axios instance with interceptors from authService
const api = authService.getApiInstance();

export interface Course {
  course_id: string;
  course_code: string;
  title: string;
  description: string;
  created_at: string;
  instructor_name: string;
}

export interface CreateCourseRequest {
  course_code: string;
  title: string;
  description: string;
}

export interface QuizRequest {
  title: string;
  instructions: string;
  course: string;
  start_date_time: string;
  end_date_time: string;
  number_of_questions: number;
  allotted_time: string;
  is_active?: boolean;
}

export interface QuizUpdateRequest {
  title: string;
  instructions: string;
  start_date_time: string;
  end_date_time: string;
  number_of_questions: number;
  allotted_time: string;
  is_active: boolean;
}

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

export interface CourseEnrollment {
  enrollment_id: string;
  student: string;
  course: string;
  enrollment_date: string;
  student_name: string;
  course_title: string;
}

export interface QuizQuestion {
  id: string;
  text: string;
  answers: QuizAnswer[];
}

export interface QuizAnswer {
  id: string;
  text: string;
  is_correct: boolean;
}

export interface CreateQuestionRequest {
  text: string;
  answers: Array<{
    text: string;
    is_correct: boolean;
  }>;
}

export interface UpdateQuestionRequest {
  text: string;
  answers: QuizAnswer[];
}

const courseService = {
  // Create a new course
  createCourse: async (courseData: CreateCourseRequest): Promise<Course> => {
    const response = await api.post('/api/courses/', courseData);
    return response.data;
  },
  
  // Get all courses for the logged-in lecturer
  getLecturerCourses: async (): Promise<Course[]> => {
    const response = await api.get('/api/courses/');
    return response.data;
  },
  
  // Get all courses (for students) with optional search
  getAllCourses: async (searchQuery?: string): Promise<Course[]> => {
    const url = searchQuery ? `/api/courses/?search=${encodeURIComponent(searchQuery)}` : '/api/courses/';
    const response = await api.get(url);
    return response.data;
  },
  
  // Enroll in a course
  enrollInCourse: async (courseId: string): Promise<CourseEnrollment> => {
    const user = authService.getCurrentUser();
    const response = await api.post(`/api/courses/${courseId}/enroll/`, {
      student: user.id,
      course: courseId
    });
    return response.data;
  },
  
  // Get student course enrollments
  getStudentEnrollments: async (): Promise<CourseEnrollment[]> => {
    const response = await api.get('/api/courses/students/enrollments/');
    return response.data;
  },
  
  // Get all quizzes (optionally filtered by active status)
  getQuizzes: async (isActive?: boolean): Promise<CourseQuizzes[]> => {
    const url = isActive !== undefined 
      ? `/api/quizzes/all/?is_active=${isActive}` 
      : '/api/quizzes/all/';
    const response = await api.get(url);
    return response.data;
  },
  
  // Get quizzes for a specific course
  getCourseQuizzes: async (courseId: string, isActive?: boolean): Promise<Quiz[]> => {
    const url = isActive !== undefined 
      ? `/api/quizzes/all/?is_active=${isActive}` 
      : '/api/quizzes/all/';
    const response = await api.get(url);
    const allCourses = response.data as CourseQuizzes[];
    
    // Find the course with matching ID
    const courseData = allCourses.find(course => course.course_id === courseId);
    return courseData?.quizzes || [];
  },
  
  // Create a new quiz
  createQuiz: async (quizData: QuizRequest): Promise<Quiz> => {
    const response = await api.post('/api/quizzes/', quizData);
    return response.data;
  },
  
  // Update a quiz
  updateQuiz: async (quizId: string, quizData: QuizUpdateRequest): Promise<Quiz> => {
    const response = await api.patch(`/api/quizzes/detail/${quizId}/`, quizData);
    return response.data;
  },
  
  // Get students enrolled in a course
  getCourseEnrollments: async (courseId: string): Promise<CourseEnrollment[]> => {
    const response = await api.get(`/api/courses/${courseId}/enroll/`);
    return response.data;
  },
  
  // Create questions for a quiz (bulk create)
  createQuizQuestions: async (quizId: string, questions: CreateQuestionRequest[]): Promise<QuizQuestion[]> => {
    const response = await api.post(`/api/quizzes/${quizId}/questions/`, questions);
    return response.data;
  },
  
  // Get all questions for a quiz
  getQuizQuestions: async (quizId: string): Promise<QuizQuestion[]> => {
    const response = await api.get(`/api/quizzes/${quizId}/questions/`);
    return response.data.data;
  },
  
  // Update a specific question
  updateQuizQuestion: async (quizId: string, questionId: string, question: UpdateQuestionRequest): Promise<QuizQuestion> => {
    const response = await api.patch(`/api/quizzes/${quizId}/questions/${questionId}/`, question);
    return response.data;
  }
};

export default courseService;
