
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppStore } from '@/lib/store';
import { ExamType } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { CheckCircle, User as UserIcon, Mail, BookOpen, GraduationCap, Brain, SquarePen, Sparkles, Globe, KeyIcon, Loader2 } from 'lucide-react';
import { registerUser, getErrorMessage } from '@/lib/auth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const UserSetup = () => {
  const { setUser } = useAppStore();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState<'signup' | 'login'>('signup');
  
  // Signup state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [examType, setExamType] = useState<ExamType>('UPSC');
  const [preferredLanguage, setPreferredLanguage] = useState('english');
  
  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  
  const languages = [
    { id: 'english', name: 'English' },
    { id: 'hindi', name: 'Hindi' },
    { id: 'tamil', name: 'Tamil' },
    { id: 'telugu', name: 'Telugu' },
    { id: 'marathi', name: 'Marathi' },
    { id: 'bengali', name: 'Bengali' },
    { id: 'gujarati', name: 'Gujarati' },
    { id: 'kannada', name: 'Kannada' },
    { id: 'malayalam', name: 'Malayalam' },
    { id: 'punjabi', name: 'Punjabi' },
    { id: 'urdu', name: 'Urdu' }
  ];
  
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !password) {
      toast({
        title: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Register with Firebase
      const user = await registerUser(email, password, name, examType, preferredLanguage);
      
      // Set user in our app state
      setUser(user);
      
      toast({
        title: 'Welcome to Easy PSC!',
        description: 'Your account has been created successfully.',
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        title: 'Registration failed',
        description: getErrorMessage(error),
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginEmail || !loginPassword) {
      toast({
        title: 'Please enter your email and password',
        variant: 'destructive'
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Login with Firebase
      const { signIn } = await import('@/lib/auth');
      const user = await signIn(loginEmail, loginPassword);
      
      // Set user in our app state
      setUser(user);
      
      toast({
        title: 'Welcome back!',
        description: 'You have successfully logged in.',
      });
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: 'Login failed',
        description: getErrorMessage(error),
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };
  
  return (
    <motion.div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 right-0 w-[40vw] h-[40vw] bg-gradient-to-br from-indigo-400/10 to-purple-400/10 rounded-full blur-3xl hero-blob" style={{ animationDelay: '-2s' }}></div>
        <div className="absolute bottom-0 left-0 w-[30vw] h-[30vw] bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-3xl hero-blob"></div>
        <div className="absolute top-1/4 left-1/4 w-[20vw] h-[20vw] bg-gradient-to-br from-pink-400/5 to-indigo-400/5 rounded-full blur-3xl hero-blob" style={{ animationDelay: '-5s' }}></div>
      </div>
      
      <div className="w-full max-w-md">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={item}>
            <div className="text-center mb-8 relative">
              <h1 className="text-4xl font-bold tracking-tight mb-2 bg-gradient-to-r from-indigo-600 to-pink-600 bg-clip-text text-transparent">Welcome to Easy PSC</h1>
              <p className="text-muted-foreground">
                AI-powered question bank for competitive exams
              </p>
              
              {/* Decorative elements */}
              <div className="absolute -z-10 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[120%] h-8 bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-pink-500/10 blur-2xl"></div>
            </div>
          </motion.div>
          
          <motion.div variants={item}>
            <Card className="overflow-hidden border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm relative">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
                  <span className="bg-gradient-to-r from-indigo-600 to-pink-600 bg-clip-text text-transparent">
                    {activeTab === 'signup' ? 'Create Account' : 'Welcome Back'}
                  </span>
                </CardTitle>
                <CardDescription>
                  {activeTab === 'signup' ? 'Set up your profile to continue' : 'Sign in to your account'}
                </CardDescription>
              </CardHeader>
              
              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'signup' | 'login')}>
                <div className="px-6 mb-4">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="signup" disabled={isLoading}>Sign Up</TabsTrigger>
                    <TabsTrigger value="login" disabled={isLoading}>Log In</TabsTrigger>
                  </TabsList>
                </div>
                
                <TabsContent value="signup">
                  <form onSubmit={handleSignUp}>
                    <CardContent className="space-y-6">
                      <motion.div variants={item} className="space-y-2">
                        <Label htmlFor="name" className="flex items-center gap-2">
                          <UserIcon className="w-4 h-4 text-indigo-500" />
                          <span>Full Name</span>
                        </Label>
                        <Input
                          id="name"
                          placeholder="Enter your name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="border-slate-200 dark:border-slate-700 focus:border-indigo-300 dark:focus:border-indigo-600 focus:ring-indigo-200 dark:focus:ring-indigo-800 transition-all input-modern"
                          required
                          disabled={isLoading}
                        />
                      </motion.div>
                      
                      <motion.div variants={item} className="space-y-2">
                        <Label htmlFor="email" className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-indigo-500" />
                          <span>Email Address</span>
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter your email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="border-slate-200 dark:border-slate-700 focus:border-indigo-300 dark:focus:border-indigo-600 focus:ring-indigo-200 dark:focus:ring-indigo-800 transition-all input-modern"
                          required
                          disabled={isLoading}
                        />
                      </motion.div>
                      
                      <motion.div variants={item} className="space-y-2">
                        <Label htmlFor="password" className="flex items-center gap-2">
                          <KeyIcon className="w-4 h-4 text-indigo-500" />
                          <span>Password</span>
                        </Label>
                        <Input
                          id="password"
                          type="password"
                          placeholder="Create a password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="border-slate-200 dark:border-slate-700 focus:border-indigo-300 dark:focus:border-indigo-600 focus:ring-indigo-200 dark:focus:ring-indigo-800 transition-all input-modern"
                          required
                          disabled={isLoading}
                        />
                      </motion.div>

                      <motion.div variants={item} className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-indigo-500" />
                          <span>Preferred Language</span>
                        </Label>
                        <Select 
                          value={preferredLanguage}
                          onValueChange={setPreferredLanguage}
                          disabled={isLoading}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select language" />
                          </SelectTrigger>
                          <SelectContent>
                            {languages.map(lang => (
                              <SelectItem key={lang.id} value={lang.id}>
                                {lang.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </motion.div>
                      
                      <motion.div variants={item} className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <GraduationCap className="w-4 h-4 text-indigo-500" />
                          <span>I'm preparing for</span>
                        </Label>
                        <RadioGroup 
                          defaultValue={examType} 
                          onValueChange={(value) => setExamType(value as ExamType)}
                          className="grid grid-cols-2 gap-3"
                          disabled={isLoading}
                        >
                          <div className="relative">
                            <RadioGroupItem 
                              value="UPSC" 
                              id="upsc" 
                              className="peer sr-only" 
                            />
                            <Label 
                              htmlFor="upsc" 
                              className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-indigo-500 peer-data-[state=checked]:bg-indigo-50 dark:peer-data-[state=checked]:bg-indigo-950/40 [&:has([data-state=checked])]:border-primary cursor-pointer"
                            >
                              <SquarePen className="mb-1 h-5 w-5 text-indigo-500" />
                              <span className="text-sm font-medium">UPSC</span>
                            </Label>
                          </div>
                          
                          <div className="relative">
                            <RadioGroupItem 
                              value="PSC" 
                              id="psc" 
                              className="peer sr-only" 
                            />
                            <Label 
                              htmlFor="psc" 
                              className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-indigo-500 peer-data-[state=checked]:bg-indigo-50 dark:peer-data-[state=checked]:bg-indigo-950/40 [&:has([data-state=checked])]:border-primary cursor-pointer"
                            >
                              <BookOpen className="mb-1 h-5 w-5 text-indigo-500" />
                              <span className="text-sm font-medium">PSC</span>
                            </Label>
                          </div>
                          
                          <div className="relative">
                            <RadioGroupItem 
                              value="SSC" 
                              id="ssc" 
                              className="peer sr-only" 
                            />
                            <Label 
                              htmlFor="ssc" 
                              className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-indigo-500 peer-data-[state=checked]:bg-indigo-50 dark:peer-data-[state=checked]:bg-indigo-950/40 [&:has([data-state=checked])]:border-primary cursor-pointer"
                            >
                              <Brain className="mb-1 h-5 w-5 text-indigo-500" />
                              <span className="text-sm font-medium">SSC</span>
                            </Label>
                          </div>
                          
                          <div className="relative">
                            <RadioGroupItem 
                              value="Banking" 
                              id="banking" 
                              className="peer sr-only" 
                            />
                            <Label 
                              htmlFor="banking" 
                              className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-indigo-500 peer-data-[state=checked]:bg-indigo-50 dark:peer-data-[state=checked]:bg-indigo-950/40 [&:has([data-state=checked])]:border-primary cursor-pointer"
                            >
                              <Sparkles className="mb-1 h-5 w-5 text-indigo-500" />
                              <span className="text-sm font-medium">Banking</span>
                            </Label>
                          </div>
                        </RadioGroup>
                      </motion.div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        type="submit" 
                        className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:opacity-90 transition-all rounded-lg shadow-md hover:shadow-xl text-white"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating account...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Create Account
                          </>
                        )}
                      </Button>
                    </CardFooter>
                  </form>
                </TabsContent>
                
                <TabsContent value="login">
                  <form onSubmit={handleLogin}>
                    <CardContent className="space-y-6">
                      <motion.div variants={item} className="space-y-2">
                        <Label htmlFor="loginEmail" className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-indigo-500" />
                          <span>Email Address</span>
                        </Label>
                        <Input
                          id="loginEmail"
                          type="email"
                          placeholder="Enter your email"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          className="border-slate-200 dark:border-slate-700 focus:border-indigo-300 dark:focus:border-indigo-600 focus:ring-indigo-200 dark:focus:ring-indigo-800 transition-all input-modern"
                          required
                          disabled={isLoading}
                        />
                      </motion.div>
                      
                      <motion.div variants={item} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="loginPassword" className="flex items-center gap-2">
                            <KeyIcon className="w-4 h-4 text-indigo-500" />
                            <span>Password</span>
                          </Label>
                          <Button 
                            variant="link" 
                            size="sm" 
                            className="px-0 text-indigo-500"
                            type="button"
                            disabled={isLoading}
                            onClick={async () => {
                              if (!loginEmail) {
                                toast({
                                  title: "Email Required",
                                  description: "Please enter your email address to reset your password",
                                  variant: "destructive"
                                });
                                return;
                              }
                              
                              try {
                                const { resetPassword } = await import('@/lib/auth');
                                await resetPassword(loginEmail);
                                toast({
                                  title: "Password Reset Email Sent",
                                  description: "Check your email for password reset instructions",
                                });
                              } catch (error: any) {
                                toast({
                                  title: "Password Reset Failed",
                                  description: getErrorMessage(error),
                                  variant: "destructive"
                                });
                              }
                            }}
                          >
                            Forgot Password?
                          </Button>
                        </div>
                        <Input
                          id="loginPassword"
                          type="password"
                          placeholder="Enter your password"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          className="border-slate-200 dark:border-slate-700 focus:border-indigo-300 dark:focus:border-indigo-600 focus:ring-indigo-200 dark:focus:ring-indigo-800 transition-all input-modern"
                          required
                          disabled={isLoading}
                        />
                      </motion.div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        type="submit" 
                        className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:opacity-90 transition-all rounded-lg shadow-md hover:shadow-xl text-white"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Signing in...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Sign In
                          </>
                        )}
                      </Button>
                    </CardFooter>
                  </form>
                </TabsContent>
              </Tabs>
            </Card>
          </motion.div>
          
          <motion.div variants={item}>
            <p className="text-center text-xs text-muted-foreground mt-4">
              By continuing, you agree to our Terms of Service and Privacy Policy.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default UserSetup;
