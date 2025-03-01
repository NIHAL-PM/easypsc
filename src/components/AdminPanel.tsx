
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { Loader2Icon, UsersIcon, BarChartIcon, CreditCardIcon, ActivityIcon } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

const AdminPanel = () => {
  const { toast } = useToast();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  const handleLogin = () => {
    setIsLoading(true);
    
    // Simple authentication - in a real app, you would use secure authentication
    setTimeout(() => {
      if (username === 'bluewaterbottle' && password === 'waterbottle') {
        setIsLoggedIn(true);
        toast({
          title: 'Login successful',
          description: 'Welcome to the admin panel',
        });
      } else {
        toast({
          title: 'Login failed',
          description: 'Invalid username or password',
          variant: 'destructive'
        });
      }
      setIsLoading(false);
    }, 1500);
  };
  
  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername('');
    setPassword('');
    toast({
      title: 'Logged out',
      description: 'You have been successfully logged out',
    });
  };
  
  if (!isLoggedIn) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-md mx-auto mt-10"
      >
        <Card className="overflow-hidden border border-border/40 shadow-md bg-card/95 backdrop-blur-sm neo-morphism">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Admin Login</CardTitle>
            <CardDescription>
              Please enter your credentials to access the admin panel
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input 
                id="username" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                placeholder="Enter username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="Enter password"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleLogin} 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                <>Login</>
              )}
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    );
  }
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto p-4 max-w-5xl"
    >
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">EasyPSC Admin Panel</h1>
        <Button variant="outline" onClick={handleLogout}>Logout</Button>
      </div>
      
      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChartIcon className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <UsersIcon className="h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center gap-2">
            <CreditCardIcon className="h-4 w-4" />
            Payments
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <ActivityIcon className="h-4 w-4" />
            Activity
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
              <CardDescription>Your platform at a glance</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg bg-accent/20">
                <p className="text-muted-foreground text-sm">Total Users</p>
                <h3 className="text-2xl font-bold">1,245</h3>
                <p className="text-green-500 text-xs mt-1">+12% this month</p>
              </div>
              <div className="p-4 border rounded-lg bg-accent/20">
                <p className="text-muted-foreground text-sm">Premium Users</p>
                <h3 className="text-2xl font-bold">328</h3>
                <p className="text-green-500 text-xs mt-1">+8% this month</p>
              </div>
              <div className="p-4 border rounded-lg bg-accent/20">
                <p className="text-muted-foreground text-sm">Revenue</p>
                <h3 className="text-2xl font-bold">₹6,560</h3>
                <p className="text-green-500 text-xs mt-1">+15% this month</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage user accounts and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center py-10">
                <LoadingSpinner size="md" text="Loading user data..." />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>View and manage payment transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center py-10">
                <LoadingSpinner size="md" text="Loading payment data..." />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Activity</CardTitle>
              <CardDescription>Track user engagement and question statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center py-10">
                <LoadingSpinner size="md" text="Loading activity data..." />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default AdminPanel;
