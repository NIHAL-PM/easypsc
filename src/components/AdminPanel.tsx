
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { Loader2Icon, UsersIcon, BarChartIcon, CreditCardIcon, ActivityIcon, CheckCircleIcon, XCircleIcon, BadgeIcon } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';
import { useAppStore } from '@/lib/store';
import { User, ExamType } from '@/types';

// Sample mock users for the admin panel
const mockUsers: User[] = [
  {
    id: 'user1',
    name: 'Rahul Sharma',
    email: 'rahul.sharma@example.com',
    examType: 'PSC',
    questionsAnswered: 142,
    questionsCorrect: 97,
    isPremium: false,
    monthlyQuestionsRemaining: 12
  },
  {
    id: 'user2',
    name: 'Priya Patel',
    email: 'priya.patel@example.com',
    examType: 'UPSC',
    questionsAnswered: 235,
    questionsCorrect: 187,
    isPremium: true,
    monthlyQuestionsRemaining: 999
  },
  {
    id: 'user3',
    name: 'Ajay Kumar',
    email: 'ajay.kumar@example.com',
    examType: 'SSC',
    questionsAnswered: 87,
    questionsCorrect: 54,
    isPremium: false,
    monthlyQuestionsRemaining: 3
  }
];

const AdminPanel = () => {
  const { toast } = useToast();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [usersLoaded, setUsersLoaded] = useState(false);
  const [displayedUsers, setDisplayedUsers] = useState<User[]>([]);
  
  const { allUsers, upgradeUserToPremium, addUser } = useAppStore();
  
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
  
  // Load users after login
  useEffect(() => {
    if (isLoggedIn && !usersLoaded) {
      setIsLoading(true);
      
      // Add mock users if there are no users in the store yet
      setTimeout(() => {
        let users = [...allUsers];
        
        if (users.length === 0) {
          // Add mock users to the store
          mockUsers.forEach(user => {
            addUser(user);
          });
          users = mockUsers;
        }
        
        setDisplayedUsers(users);
        setUsersLoaded(true);
        setIsLoading(false);
      }, 1500);
    }
  }, [isLoggedIn, usersLoaded, allUsers, addUser]);
  
  const handleUpgradeUser = (userId: string) => {
    upgradeUserToPremium(userId);
    
    // Update the displayed users
    setDisplayedUsers(prevUsers => 
      prevUsers.map(user => 
        user.id === userId 
          ? { ...user, isPremium: true, monthlyQuestionsRemaining: 999 } 
          : user
      )
    );
    
    toast({
      title: 'User upgraded',
      description: 'User has been upgraded to premium successfully',
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
                <h3 className="text-2xl font-bold">{displayedUsers.length}</h3>
                <p className="text-green-500 text-xs mt-1">+12% this month</p>
              </div>
              <div className="p-4 border rounded-lg bg-accent/20">
                <p className="text-muted-foreground text-sm">Premium Users</p>
                <h3 className="text-2xl font-bold">{displayedUsers.filter(u => u.isPremium).length}</h3>
                <p className="text-green-500 text-xs mt-1">+8% this month</p>
              </div>
              <div className="p-4 border rounded-lg bg-accent/20">
                <p className="text-muted-foreground text-sm">Revenue</p>
                <h3 className="text-2xl font-bold">₹{displayedUsers.filter(u => u.isPremium).length * 20}</h3>
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
              {isLoading ? (
                <div className="flex justify-center py-10">
                  <LoadingSpinner size="md" text="Loading user data..." />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="py-2 px-3 text-left">Name</th>
                        <th className="py-2 px-3 text-left">Email</th>
                        <th className="py-2 px-3 text-left">Exam Type</th>
                        <th className="py-2 px-3 text-left">Premium</th>
                        <th className="py-2 px-3 text-left">Questions</th>
                        <th className="py-2 px-3 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayedUsers.map((user) => (
                        <tr key={user.id} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-3">{user.name}</td>
                          <td className="py-3 px-3">{user.email}</td>
                          <td className="py-3 px-3">{user.examType}</td>
                          <td className="py-3 px-3">
                            {user.isPremium ? (
                              <div className="flex items-center text-green-500">
                                <CheckCircleIcon className="h-4 w-4 mr-1" />
                                <span>Yes</span>
                              </div>
                            ) : (
                              <div className="flex items-center text-red-500">
                                <XCircleIcon className="h-4 w-4 mr-1" />
                                <span>No</span>
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-3">
                            {user.questionsAnswered} / {user.questionsCorrect} correct
                          </td>
                          <td className="py-3 px-3">
                            {!user.isPremium && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="flex items-center gap-1 text-xs"
                                onClick={() => handleUpgradeUser(user.id)}
                              >
                                <BadgeIcon className="h-3 w-3" />
                                Upgrade to Premium
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
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
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="py-2 px-3 text-left">ID</th>
                      <th className="py-2 px-3 text-left">User</th>
                      <th className="py-2 px-3 text-left">Amount</th>
                      <th className="py-2 px-3 text-left">Date</th>
                      <th className="py-2 px-3 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedUsers.filter(u => u.isPremium).map((user, index) => (
                      <tr key={`payment-${user.id}`} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-3">PAY-{100 + index}</td>
                        <td className="py-3 px-3">{user.name}</td>
                        <td className="py-3 px-3">₹20.00</td>
                        <td className="py-3 px-3">{new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                            Completed
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
