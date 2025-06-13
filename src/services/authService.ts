import axios from 'axios';

const BASE_URL = 'https://acadex.run.place';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to handle authentication
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Skip token refresh for login requests - let the login component handle the error
    if (originalRequest.url?.includes('/api/auth/token/') && !originalRequest.url?.includes('/refresh/')) {
      return Promise.reject(error);
    }
    
    // If error is 401 and we haven't tried to refresh the token yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          // No refresh token available, clear storage but don't force redirect
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          
          // Let React Router handle navigation instead of forcing reload
          // Only redirect if we're not already on login page
          if (!window.location.pathname.includes('/login')) {
            // Use a more gentle navigation approach
            window.dispatchEvent(new CustomEvent('auth-logout'));
          }
          return Promise.reject(error);
        }
        
        // Try to refresh token
        const response = await axios.post(`${BASE_URL}/api/auth/token/refresh/`, {
          refresh: refreshToken
        });
        
        // If successful, update tokens
        if (response.data) {
          localStorage.setItem('accessToken', response.data.access);
          localStorage.setItem('refreshToken', response.data.refresh);
          
          // Retry original request with new token
          originalRequest.headers['Authorization'] = `Bearer ${response.data.access}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh token expired or invalid, clear storage
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        
        // Let React Router handle navigation instead of forcing reload
        // Only redirect if we're not already on login page
        if (!window.location.pathname.includes('/login')) {
          window.dispatchEvent(new CustomEvent('auth-logout'));
        }
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Auth services
export const authService = {
  login: async (username: string, password: string) => {
    const response = await api.post('/api/auth/token/', { username, password });
    return response.data;
  },
  
  registerLecturer: async (staffId: string, firstName: string, lastName: string, password: string) => {
    const response = await api.post('/api/auth/lecturer/register/', {
      staff_id: staffId,
      first_name: firstName,
      last_name: lastName,
      password: password
    });
    return response.data;
  },
  
  registerStudent: async (matricNumber: string, firstName: string, lastName: string, password: string) => {
    const response = await api.post('/api/auth/student/register/', {
      matric_number: matricNumber,
      first_name: firstName,
      last_name: lastName,
      password: password
    });
    return response.data;
  },
  
  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },
  
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  },
  
  // Expose API instance for other services
  getApiInstance: () => api
};

export default authService;
