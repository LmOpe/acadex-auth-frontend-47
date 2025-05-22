
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { UserIcon } from 'lucide-react';

const Register = () => {
  return (
    <div className="auth-container">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-acadex-primary">AcadEx</h1>
        <p className="text-muted-foreground">Academic Excellence Platform</p>
      </div>
      
      <Card className="auth-card">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Create Account</CardTitle>
          <CardDescription className="text-center">Choose your registration type</CardDescription>
        </CardHeader>
        
        <CardContent className="flex flex-col gap-4">
          <Link to="/register/student" className="w-full">
            <Card className="border-2 hover:border-acadex-secondary transition-all">
              <CardContent className="flex items-center gap-4 p-4 cursor-pointer">
                <div className="p-2 rounded-full bg-acadex-accent">
                  <UserIcon className="h-6 w-6 text-acadex-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Register as Student</h3>
                  <p className="text-sm text-muted-foreground">For students with matric number</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          
          <Link to="/register/lecturer" className="w-full">
            <Card className="border-2 hover:border-acadex-secondary transition-all">
              <CardContent className="flex items-center gap-4 p-4 cursor-pointer">
                <div className="p-2 rounded-full bg-acadex-accent">
                  <UserIcon className="h-6 w-6 text-acadex-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Register as Lecturer</h3>
                  <p className="text-sm text-muted-foreground">For faculty with staff ID</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </CardContent>
        
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-acadex-secondary hover:underline">
              Sign In
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Register;
