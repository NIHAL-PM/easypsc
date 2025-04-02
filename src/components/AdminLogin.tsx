
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Lock, Shield } from 'lucide-react';

interface AdminLoginProps {
  onAdminAuthenticated: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onAdminAuthenticated }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Hardcoded admin credentials
    const ADMIN_USERNAME = 'bluewaterbottle';
    const ADMIN_PASSWORD = 'waterbottle';

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      // Set admin authenticated flag in localStorage
      localStorage.setItem('isAdminAuthenticated', 'true');
      
      toast({
        title: 'Admin access granted',
        description: 'Welcome to the admin panel',
        variant: 'default',
      });
      
      onAdminAuthenticated();
    } else {
      toast({
        title: 'Authentication failed',
        description: 'Invalid username or password',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Card className="w-full max-w-md border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm relative">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-red-500 via-amber-500 to-orange-500"></div>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
            <Shield className="h-5 w-5 text-amber-500" />
            Admin Authentication
          </CardTitle>
          <CardDescription>
            Please enter your administrator credentials to continue
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Admin username"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-password">Password</Label>
              <Input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Admin password"
                required
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-red-500 via-amber-500 to-orange-500 hover:opacity-90"
              disabled={isLoading}
            >
              <Lock className="mr-2 h-4 w-4" />
              {isLoading ? 'Authenticating...' : 'Authenticate'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default AdminLogin;
