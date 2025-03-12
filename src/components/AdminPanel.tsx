import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
  ShieldIcon,
  BookOpenIcon,
  PlusCircleIcon,
  Trash2Icon,
  EditIcon
} from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';
import { useAppStore } from '@/lib/store';
import { useQuestionStore } from '@/services/questionStore';
import { User, ExamType, Question } from '@/types';
import AnimatedText from './AnimatedText';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const AdminPanel = () => {
  const { toast } = useToast();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [usersLoaded, setUsersLoaded] = useState(false);
  const [displayedUsers, setDisplayedUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  
  const [questionDialogOpen, setQuestionDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [questionFormData, setQuestionFormData] = useState<Partial<Question>>({
    text: '',
    options: ['', '', '', ''],
    correctOption: 0,
    explanation: '',
    category: '',
    difficulty: 'medium'
  });
  const [displayedQuestions, setDisplayedQuestions] = useState<Question[]>([]);
  const [questionSearchTerm, setQuestionSearchTerm] = useState('');
  const [questionExamFilter, setQuestionExamFilter] = useState<string>('all');
  
  const { allUsers, upgradeUserToPremium, addUser } = useAppStore();
  const { 
    customQuestions,
    addQuestion,
    updateQuestion,
    deleteQuestion
  } = useQuestionStore();
  
  const handleLogin = () => {
    setIsLoading(true);
    
    // Simple authentication - in a real app, you would use secure authentication
    setTimeout(() => {
      if (username === 'bluewaterbottle' && password === 'waterbottle') {
        setIsLoggedIn(true);
        setLoginDialogOpen(false);
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
  
  useEffect(() => {
    if (isLoggedIn) {
      setDisplayedQuestions(customQuestions);
    }
  }, [isLoggedIn, customQuestions]);
  
  const handleQuestionSearch = () => {
    let filtered = [...customQuestions];
    
    // Filter by search term
    if (questionSearchTerm) {
      const term = questionSearchTerm.toLowerCase();
      filtered = filtered.filter(q => 
        q.text.toLowerCase().includes(term) || 
        q.category.toLowerCase().includes(term) ||
        q.options.some(opt => opt.toLowerCase().includes(term))
      );
    }
    
    // Filter by exam type
    if (questionExamFilter && questionExamFilter !== 'all') {
      filtered = filtered.filter(q => {
        if (questionExamFilter === 'PSC') {
          // For PSC, look for Malayalam content or PSC in category
          return q.category.includes('കേരള') || 
                 q.category.includes('PSC') ||
                 q.text.match(/[അ-ഹ]/); // Contains Malayalam characters
        } else {
          return q.category.includes(questionExamFilter);
        }
      });
    }
    
    setDisplayedQuestions(filtered);
  };
  
  useEffect(() => {
    handleQuestionSearch();
  }, [questionSearchTerm, questionExamFilter, customQuestions]);
  
  const openAddQuestionDialog = () => {
    setIsEditMode(false);
    setCurrentQuestion(null);
    setQuestionFormData({
      text: '',
      options: ['', '', '', ''],
      correctOption: 0,
      explanation: '',
      category: '',
      difficulty: 'medium'
    });
    setQuestionDialogOpen(true);
  };
  
  const openEditQuestionDialog = (question: Question) => {
    setIsEditMode(true);
    setCurrentQuestion(question);
    setQuestionFormData({
      text: question.text,
      options: [...question.options],
      correctOption: question.correctOption,
      explanation: question.explanation,
      category: question.category,
      difficulty: question.difficulty
    });
    setQuestionDialogOpen(true);
  };
  
  const handleQuestionFormChange = (field: string, value: string | string[] | number) => {
    setQuestionFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...questionFormData.options as string[]];
    newOptions[index] = value;
    setQuestionFormData(prev => ({
      ...prev,
      options: newOptions
    }));
  };
  
  const handleSaveQuestion = () => {
    // Form validation
    if (!questionFormData.text || !questionFormData.explanation || !questionFormData.category) {
      toast({
        title: 'Missing fields',
        description: 'Please fill all required fields',
        variant: 'destructive'
      });
      return;
    }
    
    if (questionFormData.options?.some(opt => !opt)) {
      toast({
        title: 'Missing options',
        description: 'Please fill all four options',
        variant: 'destructive'
      });
      return;
    }
    
    // Prepare question object
    const questionToSave: Question = {
      id: isEditMode && currentQuestion ? currentQuestion.id : `q-custom-${Date.now()}`,
      text: questionFormData.text as string,
      options: questionFormData.options as string[],
      correctOption: questionFormData.correctOption as number,
      explanation: questionFormData.explanation as string,
      category: questionFormData.category as string,
      difficulty: questionFormData.difficulty as 'easy' | 'medium' | 'hard'
    };
    
    // Save question
    if (isEditMode && currentQuestion) {
      updateQuestion(currentQuestion.id, questionToSave);
      toast({
        title: 'Question updated',
        description: 'The question has been updated successfully'
      });
    } else {
      addQuestion(questionToSave);
      toast({
        title: 'Question added',
        description: 'New question has been added successfully'
      });
    }
    
    // Close dialog and refresh list
    setQuestionDialogOpen(false);
  };
  
  const handleDeleteQuestion = (questionId: string) => {
    if (confirm('Are you sure you want to delete this question?')) {
      deleteQuestion(questionId);
      toast({
        title: 'Question deleted',
        description: 'The question has been deleted successfully'
      });
    }
  };
  
  const totalUsers = displayedUsers.length;
  const premiumUsers = displayedUsers.filter(u => u.isPremium).length;
  const totalQuestionsAnswered = displayedUsers.reduce((sum, user) => sum + user.questionsAnswered, 0);
  const averageAccuracy = totalQuestionsAnswered > 0
    ? Math.round((displayedUsers.reduce((sum, user) => sum + user.questionsCorrect, 0) / totalQuestionsAnswered) * 100)
    : 0;

  const revenue = premiumUsers * 20;
  
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
              <div className="block md:hidden">
                <Button 
                  onClick={() => setLoginDialogOpen(true)} 
                  className="w-full bg-gradient-to-r from-primary/90 to-primary shadow-md"
                >
                  Login
                </Button>
                
                <Dialog open={loginDialogOpen} onOpenChange={setLoginDialogOpen}>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Admin Login</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="username-mobile">Username</Label>
                        <Input 
                          id="username-mobile" 
                          value={username} 
                          onChange={(e) => setUsername(e.target.value)} 
                          placeholder="Enter username"
                          className="border-input/60 focus:border-primary"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password-mobile">Password</Label>
                        <Input 
                          id="password-mobile" 
                          type="password" 
                          value={password} 
                          onChange={(e) => setPassword(e.target.value)} 
                          placeholder="Enter password"
                          className="border-input/60 focus:border-primary"
                        />
                      </div>
                    </div>
                    <DialogFooter>
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
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              
              <div className="hidden md:block space-y-4">
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
              </div>
            </CardContent>
            <CardFooter>
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="w-full hidden md:block"
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
            <TabsList className="grid grid-cols-5 mb-6 p-1 bg-muted/50 rounded-lg">
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
                value="questions" 
                className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <BookOpenIcon className="h-4 w-4" />
                Questions
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
              
              <TabsContent value="questions" className="space-y-4">
                <Card className="border border-border/40 shadow-md bg-card/95 backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <BookOpenIcon className="h-5 w-5 text-primary" />
                          Question Management
                        </CardTitle>
                        <CardDescription>
                          Create, edit and manage custom questions for different exams
                        </CardDescription>
                      </div>
                      <Button 
                        onClick={openAddQuestionDialog} 
                        className="flex items-center gap-2 bg-primary"
                      >
                        <PlusCircleIcon className="h-4 w-4" />
                        Add Question
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="w-full md:w-2/3">
                          <Input
                            placeholder="Search questions..."
                            value={questionSearchTerm}
                            onChange={(e) => setQuestionSearchTerm(e.target.value)}
                          />
                        </div>
                        <div className="w-full md:w-1/3">
                          <Select
                            value={questionExamFilter}
                            onValueChange={setQuestionExamFilter}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Filter by exam type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Exam Types</SelectItem>
                              <SelectItem value="UPSC">UPSC</SelectItem>
                              <SelectItem value="PSC">Kerala PSC (Malayalam)</SelectItem>
                              <SelectItem value="SSC">SSC</SelectItem>
                              <SelectItem value="Banking">Banking</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      {isLoading ? (
                        <div className="flex justify-center py-10">
                          <LoadingSpinner size="md" text="Loading questions..." />
                        </div>
                      ) : displayedQuestions.length === 0 ? (
                        <div className="text-center py-10 text-muted-foreground">
                          No questions found. Add some questions to get started.
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {displayedQuestions.map((question) => (
                            <Card key={question.id} className="border border-border/20 hover:bg-accent/5 transition-colors">
                              <CardContent className="pt-4">
                                <div className="flex justify-between gap-4">
                                  <div className="flex-1">
                                    <div className="flex gap-2 mb-2">
                                      <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
                                        {question.category}
                                      </span>
                                      <span className={`px-2 py-1 rounded-full text-xs ${
                                        question.difficulty === 'easy' 
                                          ? 'bg-green-100 text-green-800' 
                                          : question.difficulty === 'medium'
                                            ? 'bg-amber-100 text-amber-800'
                                            : 'bg-red-100 text-red-800'
                                      }`}>
                                        {question.difficulty}
                                      </span>
                                    </div>
                                    <h3 className="font-medium mb-2">{question.text}</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                                      {question.options.map((option, index) => (
                                        <div key={index} className={`text-sm p-2 border rounded ${
                                          index === question.correctOption 
                                            ? 'bg-green-50 border-green-200 text-green-700' 
                                            : 'bg-gray-50 border-gray-200'
                                        }`}>
                                          {String.fromCharCode(65 + index)}: {option}
                                        </div>
                                      ))}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      <span className="font-medium">Explanation:</span> {question.explanation}
                                    </div>
                                  </div>
                                  <div className="flex flex-col gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => openEditQuestionDialog(question)}
                                      className="flex items-center gap-1"
                                    >
                                      <EditIcon className="h-3 w-3" />
                                      Edit
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleDeleteQuestion(question.id)}
                                      className="flex items-center gap-1 text-red-500 hover:text-red-700"
                                    >
                                      <Trash2Icon className="h-3 w-3" />
                                      Delete
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                <Dialog open={questionDialogOpen} onOpenChange={setQuestionDialogOpen}>
                  <DialogContent className="sm:max-w-[650px]">
                    <DialogHeader>
                      <DialogTitle>{isEditMode ? 'Edit Question' : 'Add New Question'}</DialogTitle>
                      <DialogDescription>
                        {isEditMode 
                          ? 'Update the question details below' 
                          : 'Fill in the details to create a new question'}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="question-text">Question Text</Label>
                        <Textarea
                          id="question-text"
                          value={questionFormData.text || ''}
                          onChange={(e) => handleQuestionFormChange('text', e.target.value)}
                          placeholder="Enter the question"
                          className="min-h-20"
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="question-category">Category</Label>
                          <Input
                            id="question-category"
                            value={questionFormData.category || ''}
                            onChange={(e) => handleQuestionFormChange('category', e.target.value)}
                            placeholder="e.g., Indian Constitution, കേരള ചരിത്രം"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="question-difficulty">Difficulty</Label>
                          <Select
                            value={questionFormData.difficulty as string}
                            onValueChange={(value) => handleQuestionFormChange('difficulty', value)}
                          >
                            <SelectTrigger id="question-difficulty">
                              <SelectValue placeholder="Select difficulty" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="easy">Easy</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="hard">Hard</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Options (select the correct answer)</Label>
                        <div className="space-y-3">
                          {[0, 1, 2, 3].map((index) => (
                            <div key={index} className="flex items-center gap-3">
                              <div className="flex-shrink-0">
                                <input
                                  type="radio"
                                  id={`option-${index}`}
                                  name="correctOption"
                                  checked={questionFormData.correctOption === index}
                                  onChange={() => handleQuestionFormChange('correctOption', index)}
                                  className="w-4 h-4 text-primary"
                                />
                              </div>
                              <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-primary/10 text-primary">
                                {String.fromCharCode(65 + index)}
                              </div>
                              <Input
                                value={questionFormData.options?.[index] || ''}
                                onChange={(e) => handleOptionChange(index, e.target.value)}
                                placeholder={`Option ${String.fromCharCode(65 + index)}`}
                                className="flex-1"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="question-explanation">Explanation</Label>
                        <Textarea
                          id="question-explanation"
                          value={questionFormData.explanation || ''}
                          onChange={(e) => handleQuestionFormChange('explanation', e.target.value)}
                          placeholder="Explain why the correct answer is right"
                          className="min-h-20"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setQuestionDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleSaveQuestion}>
                        {isEditMode ? 'Update Question' : 'Add Question'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
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
