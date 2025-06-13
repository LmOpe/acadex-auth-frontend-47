
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { toast } from '@/components/ui/sonner';
import authService from '@/services/authService';

interface User {
  id: number;
  role: string;
  firstName: string;
  lastName: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  registerLecturer: (staffId: string, firstName: string, lastName: string, password: string) => Promise<void>;
  registerStudent: (matricNumber: string, firstName: string, lastName: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
    setLoading(false);
  }, []);

  // Login user
  const login = async (username: string, password: string) => {
    try {
      const response = await authService.login(username, password);
      
      const userData = {
        id: response.user_id,
        // Use user_role from API response instead of role
        role: response.user_role || '',
        firstName: response.first_name,
        lastName: response.last_name
      };
      
      // Store tokens and user data
      localStorage.setItem('accessToken', response.access);
      localStorage.setItem('refreshToken', response.refresh);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setUser(userData);
      toast.success('Login successful!');
    } catch (error: any) {
      console.error('Login error:', error);
      console.log('Error response data:', error.response?.data);
      console.log('Error status:', error.response?.status);
      
      // Don't toast error here - let the login component handle it
      // This prevents double error messages
      throw error;
    }
  };

  // Register lecturer
  const registerLecturer = async (staffId: string, firstName: string, lastName: string, password: string) => {
    try {
      await authService.registerLecturer(staffId, firstName, lastName, password);
      toast.success('Registration successful! You can now login.');
    } catch (error: any) {
      console.error('Lecturer registration error:', error);
      console.log('Error response data:', error.response?.data);
      console.log('Error status:', error.response?.status);
      
      const errorMsg = error.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(errorMsg);
      throw error;
    }
  };

  // Register student
  const registerStudent = async (matricNumber: string, firstName: string, lastName: string, password: string) => {
    try {
      await authService.registerStudent(matricNumber, firstName, lastName, password);
      toast.success('Registration successful! You can now login.');
    } catch (error: any) {
      console.error('Student registration error:', error);
      console.log('Error response data:', error.response?.data);
      console.log('Error status:', error.response?.status);
      
      const errorMsg = error.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(errorMsg);
      throw error;
    }
  };

  // Logout user
  const logout = () => {
    authService.logout();
    setUser(null);
    toast.info('You have been logged out');
  };

  const value = {
    user,
    loading,
    login,
    registerLecturer,
    registerStudent,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
