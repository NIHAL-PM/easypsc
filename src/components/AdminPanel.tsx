
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Loader2Icon, 
  UsersIcon, 
  BarChartIcon, 
  CreditCardIcon, 
  ActivityIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  BadgeIcon,
  TrendingUpIcon,
  UserPlusIcon,
  ShieldIcon 
} from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';
import { useAppStore } from '@/lib/store';
import { User, ExamType } from '@/types';
import AnimatedText from './AnimatedText';

const AdminPanel = () => {
  const { toast } = useToast();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [usersLoaded, setUsersLoaded] = useState(false);
  const [displayedUsers, setDisplayedUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  
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
      
      // Use real data from store
      setTimeout(() => {
        const users = [...allUsers];
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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-muted/40">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full mx-auto px-4"
        >
          <Card className="overflow-hidden border-2 border-primary/10 shadow-lg bg-card/95 backdrop-blur-sm rounded-xl">
            <CardHeader className="pb-2 space-y-1">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mx-auto mb-2"
              >
                <AnimatedText />
              </motion.div>
              <CardTitle className="text-xl text-center">Admin Login</CardTitle>
              <CardDescription className="text-center">
                Please enter your credentials to access the admin panel
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-2"
              >
                <Label htmlFor="username">Username</Label>
                <Input 
                  id="username" 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                  placeholder="Enter username"
                  className="border-input/60 focus:border-primary"
                />
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-2"
              >
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="Enter password"
                  className="border-input/60 focus:border-primary"
                />
              </motion.div>
            </CardContent>
            <CardFooter>
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="w-full"
              >
                <Button 
                  onClick={handleLogin} 
                  className="w-full bg-gradient-to-r from-primary/90 to-primary shadow-md"
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
              </motion.div>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    );
  }
  
  // Dashboard stats
  const totalUsers = displayedUsers.length;
  const premiumUsers = displayedUsers.filter(u => u.isPremium).length;
  const totalQuestionsAnswered = displayedUsers.reduce((sum, user) => sum + user.questionsAnswered, 0);
  const averageAccuracy = totalQuestionsAnswered > 0
    ? Math.round((displayedUsers.reduce((sum, user) => sum + user.questionsCorrect, 0) / totalQuestionsAnswered) * 100)
    : 0;

  // Calculate revenue (₹20 per premium user)
  const revenue = premiumUsers * 20;
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-background to-muted/40"
    >
      <div className="container mx-auto p-4 max-w-6xl">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-2"
          >
            <ShieldIcon className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              EasyPSC Admin
            </h1>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="flex gap-2 items-center"
            >
              <span>Logout</span>
            </Button>
          </motion.div>
        </div>
        
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab} 
          className="w-full"
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <TabsList className="grid grid-cols-4 mb-6 p-1 bg-muted/50 rounded-lg">
              <TabsTrigger 
                value="dashboard" 
                className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <BarChartIcon className="h-4 w-4" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger 
                value="users" 
                className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <UsersIcon className="h-4 w-4" />
                Users
              </TabsTrigger>
              <TabsTrigger 
                value="payments" 
                className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <CreditCardIcon className="h-4 w-4" />
                Payments
              </TabsTrigger>
              <TabsTrigger 
                value="activity" 
                className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <ActivityIcon className="h-4 w-4" />
                Activity
              </TabsTrigger>
            </TabsList>
          </motion.div>
          
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <TabsContent value="dashboard" className="space-y-6">
                <Card className="border border-border/40 shadow-md bg-card/95 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChartIcon className="h-5 w-5 text-primary" />
                      Overview
                    </CardTitle>
                    <CardDescription>
                      Platform statistics at a glance
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="border border-border/20 bg-accent/10 hover:bg-accent/20 transition-colors">
                      <CardContent className="p-4 flex flex-col">
                        <p className="text-muted-foreground text-sm">Total Users</p>
                        <div className="flex items-end justify-between mt-2">
                          <h3 className="text-3xl font-bold">{totalUsers}</h3>
                          <div className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800 flex items-center">
                            <UserPlusIcon className="h-3 w-3 mr-1" />
                            +12%
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="border border-border/20 bg-accent/10 hover:bg-accent/20 transition-colors">
                      <CardContent className="p-4 flex flex-col">
                        <p className="text-muted-foreground text-sm">Premium Users</p>
                        <div className="flex items-end justify-between mt-2">
                          <h3 className="text-3xl font-bold">{premiumUsers}</h3>
                          <div className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800 flex items-center">
                            <TrendingUpIcon className="h-3 w-3 mr-1" />
                            +8%
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="border border-border/20 bg-accent/10 hover:bg-accent/20 transition-colors">
                      <CardContent className="p-4 flex flex-col">
                        <p className="text-muted-foreground text-sm">Revenue</p>
                        <div className="flex items-end justify-between mt-2">
                          <h3 className="text-3xl font-bold">₹{revenue}</h3>
                          <div className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800 flex items-center">
                            <TrendingUpIcon className="h-3 w-3 mr-1" />
                            +15%
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="border border-border/20 bg-accent/10 hover:bg-accent/20 transition-colors">
                      <CardContent className="p-4 flex flex-col">
                        <p className="text-muted-foreground text-sm">Avg. Accuracy</p>
                        <div className="flex items-end justify-between mt-2">
                          <h3 className="text-3xl font-bold">{averageAccuracy}%</h3>
                          <div className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800 flex items-center">
                            <TrendingUpIcon className="h-3 w-3 mr-1" />
                            +5%
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </CardContent>
                </Card>
                
                {/* More dashboard content would go here */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="border border-border/40 shadow-md bg-card/95 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-lg">Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {isLoading ? (
                        <div className="flex justify-center py-10">
                          <LoadingSpinner size="md" text="Loading activity data..." />
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {displayedUsers.slice(0, 3).map((user) => (
                            <div key={`activity-${user.id}`} className="flex items-center gap-3 border-b pb-3">
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                {user.name.charAt(0)}
                              </div>
                              <div className="flex-1">
                                <p className="font-medium">{user.name}</p>
                                <p className="text-sm text-muted-foreground">Answered {user.questionsAnswered} questions</p>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {new Date().toLocaleDateString()}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  
                  <Card className="border border-border/40 shadow-md bg-card/95 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-lg">User Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {isLoading ? (
                        <div className="flex justify-center py-10">
                          <LoadingSpinner size="md" text="Loading distribution data..." />
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {/* Group users by exam type */}
                          {Object.entries(
                            displayedUsers.reduce((acc, user) => {
                              acc[user.examType] = (acc[user.examType] || 0) + 1;
                              return acc;
                            }, {} as Record<string, number>)
                          ).map(([examType, count]) => (
                            <div key={examType} className="flex items-center gap-3">
                              <div className="w-full">
                                <div className="flex justify-between mb-1">
                                  <span className="text-sm font-medium">{examType}</span>
                                  <span className="text-sm text-muted-foreground">{count} users</span>
                                </div>
                                <div className="w-full bg-muted rounded-full h-2">
                                  <div 
                                    className="bg-primary rounded-full h-2" 
                                    style={{ width: `${(count / displayedUsers.length) * 100}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="users" className="space-y-4">
                <Card className="border border-border/40 shadow-md bg-card/95 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <UsersIcon className="h-5 w-5 text-primary" />
                      User Management
                    </CardTitle>
                    <CardDescription>
                      Manage user accounts and permissions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="flex justify-center py-10">
                        <LoadingSpinner size="md" text="Loading user data..." />
                      </div>
                    ) : displayedUsers.length === 0 ? (
                      <div className="text-center py-10 text-muted-foreground">
                        No users found. Create some users to get started.
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
                              <tr key={user.id} className="border-b hover:bg-muted/50 transition-colors">
                                <td className="py-3 px-3 font-medium">{user.name}</td>
                                <td className="py-3 px-3">{user.email}</td>
                                <td className="py-3 px-3">
                                  <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
                                    {user.examType}
                                  </span>
                                </td>
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
                                  <div className="flex flex-col">
                                    <span>{user.questionsAnswered} answered</span>
                                    <span className="text-xs text-muted-foreground">
                                      {user.questionsCorrect} correct ({Math.round((user.questionsCorrect / Math.max(1, user.questionsAnswered)) * 100)}%)
                                    </span>
                                  </div>
                                </td>
                                <td className="py-3 px-3">
                                  {!user.isPremium && (
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      className="flex items-center gap-1 text-xs hover:bg-primary hover:text-primary-foreground transition-colors"
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
                <Card className="border border-border/40 shadow-md bg-card/95 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCardIcon className="h-5 w-5 text-primary" />
                      Payment History
                    </CardTitle>
                    <CardDescription>
                      View and manage payment transactions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="flex justify-center py-10">
                        <LoadingSpinner size="md" text="Loading payment data..." />
                      </div>
                    ) : displayedUsers.filter(u => u.isPremium).length === 0 ? (
                      <div className="text-center py-10 text-muted-foreground">
                        No payment records found. Upgrade users to premium to view payment history.
                      </div>
                    ) : (
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
                              <tr key={`payment-${user.id}`} className="border-b hover:bg-muted/50 transition-colors">
                                <td className="py-3 px-3">PAY-{100 + index}</td>
                                <td className="py-3 px-3 font-medium">{user.name}</td>
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
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="activity" className="space-y-4">
                <Card className="border border-border/40 shadow-md bg-card/95 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ActivityIcon className="h-5 w-5 text-primary" />
                      User Activity
                    </CardTitle>
                    <CardDescription>
                      Track user engagement and question statistics
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading || displayedUsers.length === 0 ? (
                      <div className="flex justify-center py-10">
                        <LoadingSpinner size="md" text="Loading activity data..." />
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Card className="border border-border/20 bg-accent/10">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm">Total Questions Answered</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="text-3xl font-bold">{totalQuestionsAnswered}</div>
                            </CardContent>
                          </Card>
                          
                          <Card className="border border-border/20 bg-accent/10">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm">Average Accuracy</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="text-3xl font-bold">{averageAccuracy}%</div>
                            </CardContent>
                          </Card>
                        </div>
                        
                        <div className="space-y-4">
                          <h3 className="font-medium">Recent User Activity</h3>
                          {displayedUsers.map((user) => (
                            <div key={`activity-detail-${user.id}`} className="border rounded-lg p-3 hover:bg-accent/5 transition-colors">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="font-medium">{user.name}</h4>
                                  <p className="text-sm text-muted-foreground">{user.email}</p>
                                </div>
                                <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
                                  {user.examType}
                                </span>
                              </div>
                              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                                <div>
                                  <span className="text-muted-foreground">Questions Answered:</span>
                                  <span className="font-medium ml-1">{user.questionsAnswered}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Correct Answers:</span>
                                  <span className="font-medium ml-1">{user.questionsCorrect}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Accuracy:</span>
                                  <span className="font-medium ml-1">
                                    {user.questionsAnswered > 0 
                                      ? `${Math.round((user.questionsCorrect / user.questionsAnswered) * 100)}%` 
                                      : 'N/A'}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Account Type:</span>
                                  <span className={`font-medium ml-1 ${user.isPremium ? 'text-green-500' : 'text-red-500'}`}>
                                    {user.isPremium ? 'Premium' : 'Free'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </motion.div>
          </AnimatePresence>
        </Tabs>
      </div>
    </motion.div>
  );
};

export default AdminPanel;
