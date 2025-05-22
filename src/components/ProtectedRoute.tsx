
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  
  console.log('ProtectedRoute state:', { 
    user: user ? { 
      ...user, 
      role: user.role,
      roleUppercase: user.role?.toUpperCase() 
    } : null, 
    loading 
  });
  
  // While checking authentication status, show nothing
  if (loading) {
    console.log('Auth is still loading, showing loading state');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-acadex-primary">Loading...</div>
      </div>
    );
  }
  
  // If not authenticated, redirect to login
  if (!user) {
    console.log('User not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }
  
  // If authenticated, show the protected content
  console.log('User authenticated, showing protected content');
  return <>{children}</>;
};

export default ProtectedRoute;
