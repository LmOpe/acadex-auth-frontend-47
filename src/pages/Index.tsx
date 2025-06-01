
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';

const Index = () => {
  const { user } = useAuth();
  
  // If user is already logged in, redirect to dashboard
  if (user) {
    return <Navigate to="/dashboard" />;
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-white p-6">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-acadex-primary">AcadEx</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/login">
              <Button variant="outline" size="sm">Sign In</Button>
            </Link>
            <Link to="/register">
              <Button size="sm">Register</Button>
            </Link>
          </div>
        </div>
      </header>
      
      {/* Hero section */}
      <section className="flex-1 flex items-center bg-gradient-to-b from-acadex-accent to-white">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold text-acadex-primary">
                Academic Excellence Platform
              </h1>
              <p className="text-lg text-gray-600">
                A comprehensive platform for students and lecturers to manage courses, 
                communicate, and enhance the learning experience.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Link to="/register">
                  <Button size="lg" className="w-full sm:w-auto">Get Started</Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    Sign In
                  </Button>
                </Link>
              </div>
            </div>
            <div className="hidden md:flex justify-center">
              <div className="relative w-80 h-80 bg-acadex-primary rounded-full opacity-10"></div>
              <div className="absolute w-72 h-72 bg-acadex-secondary rounded-full opacity-20 -translate-x-10 translate-y-6"></div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-acadex-primary">
            Key Features
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="w-12 h-12 bg-acadex-accent rounded-full flex items-center justify-center mb-4">
                <span className="text-acadex-primary text-xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Easy Registration</h3>
              <p className="text-gray-600">Seamless registration process for both students and lecturers.</p>
            </div>
            
            <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="w-12 h-12 bg-acadex-accent rounded-full flex items-center justify-center mb-4">
                <span className="text-acadex-primary text-xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure Login</h3>
              <p className="text-gray-600">Advanced authentication to keep your academic data safe.</p>
            </div>
            
            <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="w-12 h-12 bg-acadex-accent rounded-full flex items-center justify-center mb-4">
                <span className="text-acadex-primary text-xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Personalized Dashboard</h3>
              <p className="text-gray-600">Access all your academic information in one place.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-acadex-primary text-white py-6">
        <div className="container mx-auto px-4 text-center">
          <p>© 2025 AcadEx. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
