
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Navigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, logout } = useAuth();
  
  // If user is not logged in, redirect to login page
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-acadex-primary">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user.firstName} {user.lastName}</p>
        </div>
        <Button variant="outline" onClick={logout}>Sign Out</Button>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Your Profile</CardTitle>
            <CardDescription>Your account information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Name:</span>
                <span>{user.firstName} {user.lastName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Role:</span>
                <span className="capitalize">{user.role}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">ID:</span>
                <span>{user.id}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Frequently used functions</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Button>View Schedule</Button>
            <Button variant="outline">Access Resources</Button>
            <Button variant="outline">Contact Support</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
