
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
  }
};

export default courseService;
