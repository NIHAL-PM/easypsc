import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAppStore } from '@/lib/store';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import QuestionCard from '@/components/QuestionCard';
import QuestionGenerator from '@/components/QuestionGenerator';
import AnimatedLogo from '@/components/AnimatedLogo';
import ProfileCard from '@/components/ProfileCard';
import ChatMode from '@/components/ChatMode';
import ChatRoom from '@/components/ChatRoom';
import CurrentAffairs from '@/components/CurrentAffairs';
import { ArrowRight, GitBranch, User, Mail, CheckCircle, Crown, HelpCircle, MessageSquare, BookOpen, Users, Newspaper } from 'lucide-react';
import { ExamType } from '@/types';

const Index = () => {
  const { user, login, currentQuestion } = useAppStore();
  const { toast } = useToast();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [examType, setExamType] = useState<ExamType>('UPSC');
  const [activeTab, setActiveTab] = useState<'questions' | 'chat' | 'room' | 'news'>('questions');
  
  // Validation for form
  const [isNameValid, setIsNameValid] = useState(true);
  const [isEmailValid, setIsEmailValid] = useState(true);
  
  const validateName = (value: string) => {
    setIsNameValid(value.trim().length >= 3);
    return value.trim().length >= 3;
  };
  
  const validateEmail = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setIsEmailValid(emailRegex.test(value));
    return emailRegex.test(value);
  };
  
  const handleLogin = () => {
    const nameValid = validateName(name);
    const emailValid = validateEmail(email);
    
    if (!nameValid || !emailValid) {
      toast({
        title: "Validation error",
        description: "Please check your name and email",
        variant: "destructive"
      });
      return;
    }
    
    login(name, email, examType);
    
    toast({
      title: "Welcome!",
      description: `You've joined as a ${examType} aspirant.`,
    });
  };
  
  // Generate a random name for the user
  const generateRandomUser = () => {
    const randomNames = [
      "Arjun Sharma", "Priya Patel", "Rahul Singh", "Neha Gupta", 
      "Vikram Mehta", "Ananya Desai", "Raj Kapoor", "Divya Reddy"
    ];
    
    const randomDomains = ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com"];
    
    const randomName = randomNames[Math.floor(Math.random() * randomNames.length)];
    const emailPrefix = randomName.toLowerCase().replace(/\s/g, ".");
    const domain = randomDomains[Math.floor(Math.random() * randomDomains.length)];
    
    setName(randomName);
    setEmail(`${emailPrefix}@${domain}`);
    validateName(randomName);
    validateEmail(`${emailPrefix}@${domain}`);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/40">
      {!user ? (
        <div className="container mx-auto py-8 px-4 flex flex-col items-center">
          <AnimatedLogo />
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="max-w-md w-full mx-auto mt-8"
          >
            <Card className="overflow-hidden border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm relative">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
              <CardHeader className="pb-3">
                <CardTitle className="text-xl text-indigo-700 dark:text-indigo-300">Join the Platform</CardTitle>
                <CardDescription>
                  Get started with your competitive exam preparation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className={!isNameValid ? "text-red-500" : ""}>
                    Full Name
                  </Label>
                  <div className="relative">
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        validateName(e.target.value);
                      }}
                      placeholder="Enter your name"
                      className={`pl-10 ${!isNameValid ? "border-red-500 focus:ring-red-500" : ""}`}
                    />
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  </div>
                  {!isNameValid && (
                    <p className="text-xs text-red-500">Name must be at least 3 characters</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email" className={!isEmailValid ? "text-red-500" : ""}>
                    Email Address
                  </Label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        validateEmail(e.target.value);
                      }}
                      placeholder="name@example.com"
                      className={`pl-10 ${!isEmailValid ? "border-red-500 focus:ring-red-500" : ""}`}
                    />
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  </div>
                  {!isEmailValid && (
                    <p className="text-xs text-red-500">Please enter a valid email address</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="exam-type">
                    Exam Type
                  </Label>
                  <Select
                    value={examType}
                    onValueChange={(value) => setExamType(value as ExamType)}
                  >
                    <SelectTrigger id="exam-type" className="pl-10 relative">
                      <GitBranch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <SelectValue placeholder="Select exam type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UPSC">UPSC</SelectItem>
                      <SelectItem value="PSC">PSC</SelectItem>
                      <SelectItem value="SSC">SSC</SelectItem>
                      <SelectItem value="Banking">Banking</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-3">
                <Button 
                  onClick={handleLogin} 
                  className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:opacity-90 transition-all rounded-lg shadow-md hover:shadow-xl flex gap-2 btn-modern"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
                
                <Button 
                  onClick={generateRandomUser}
                  variant="outline"
                  className="w-full border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/30"
                >
                  Fill with Sample Data
                </Button>
              </CardFooter>
            </Card>
            
            <div className="mt-8 text-center">
              <p className="text-sm text-muted-foreground">
                By joining, you're getting:
              </p>
              <div className="flex justify-center gap-4 mt-2">
                <div className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400">
                  <CheckCircle className="w-3 h-3" />
                  <span>AI-Generated Questions</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400">
                  <Crown className="w-3 h-3" />
                  <span>10 Free Questions Monthly</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400">
                  <HelpCircle className="w-3 h-3" />
                  <span>Detailed Explanations</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      ) : (
        <div className="container mx-auto py-6 px-4">
          <AnimatedLogo />
          
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <ProfileCard />
            </div>
            
            <div className="md:col-span-2 space-y-6">
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'questions' | 'chat' | 'room' | 'news')} className="w-full">
                <TabsList className="grid grid-cols-4 mb-4">
                  <TabsTrigger value="questions" className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Practice Questions
                  </TabsTrigger>
                  <TabsTrigger value="chat" className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    AI Assistant
                  </TabsTrigger>
                  <TabsTrigger value="room" className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Exam Chat
                  </TabsTrigger>
                  <TabsTrigger value="news" className="flex items-center gap-2">
                    <Newspaper className="h-4 w-4" />
                    Current Affairs
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="questions" className="space-y-4">
                  {!currentQuestion ? (
                    <QuestionGenerator />
                  ) : (
                    <QuestionCard />
                  )}
                </TabsContent>
                
                <TabsContent value="chat">
                  <ChatMode />
                </TabsContent>

                <TabsContent value="room">
                  <ChatRoom />
                </TabsContent>
                
                <TabsContent value="news">
                  <CurrentAffairs />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
