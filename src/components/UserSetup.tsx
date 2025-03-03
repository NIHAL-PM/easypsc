
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAppStore } from '@/lib/store';
import { ExamType, User } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { CheckCircle, User as UserIcon, Mail, BookOpen } from 'lucide-react';

const UserSetup = () => {
  const { setUser } = useAppStore();
  const { toast } = useToast();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [examType, setExamType] = useState<ExamType>('UPSC');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email) {
      toast({
        title: 'Please fill in all fields',
        variant: 'destructive'
      });
      return;
    }
    
    // Generate a random user ID
    const userId = Math.random().toString(36).substring(2, 15);
    
    const newUser: User = {
      id: userId,
      name,
      email,
      examType,
      questionsAnswered: 0,
      questionsCorrect: 0,
      isPremium: false,
      monthlyQuestionsRemaining: 10, // Free tier gets 10 questions
    };
    
    setUser(newUser);
    
    toast({
      title: 'Welcome to Easy PSC!',
      description: 'Your profile has been set up successfully.',
    });
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
        <div className="absolute top-0 right-0 w-[40vw] h-[40vw] bg-gradient-to-br from-violet-400/10 to-fuchsia-400/10 rounded-full blur-3xl hero-blob" style={{ animationDelay: '-2s' }}></div>
        <div className="absolute bottom-0 left-0 w-[30vw] h-[30vw] bg-gradient-to-br from-fuchsia-400/10 to-purple-400/10 rounded-full blur-3xl hero-blob"></div>
        <div className="absolute top-1/4 left-1/4 w-[20vw] h-[20vw] bg-gradient-to-br from-purple-400/5 to-violet-400/5 rounded-full blur-3xl hero-blob" style={{ animationDelay: '-5s' }}></div>
      </div>
      
      <div className="w-full max-w-md">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={item}>
            <div className="text-center mb-8 relative">
              <h1 className="text-4xl font-bold tracking-tight mb-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">Welcome to Easy PSC</h1>
              <p className="text-muted-foreground">
                AI-powered question bank for competitive exams
              </p>
              
              {/* Decorative elements */}
              <div className="absolute -z-10 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[120%] h-8 bg-gradient-to-r from-violet-500/10 via-fuchsia-500/5 to-purple-500/10 blur-2xl"></div>
            </div>
          </motion.div>
          
          <motion.div variants={item}>
            <Card className="overflow-hidden border border-violet-100 shadow-lg bg-card/95 backdrop-blur-sm">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-purple-600"></div>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-violet-800">
                  <span className="bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">Let's get started</span>
                </CardTitle>
                <CardDescription>Set up your profile to continue</CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-6">
                  <motion.div variants={item} className="space-y-2">
                    <Label htmlFor="name" className="flex items-center gap-2">
                      <UserIcon className="w-4 h-4 text-violet-500" />
                      <span>Full Name</span>
                    </Label>
                    <Input
                      id="name"
                      placeholder="Enter your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="border-violet-100 focus:border-violet-300 focus:ring-violet-200 transition-all"
                    />
                  </motion.div>
                  
                  <motion.div variants={item} className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-violet-500" />
                      <span>Email Address</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="border-violet-100 focus:border-violet-300 focus:ring-violet-200 transition-all"
                    />
                  </motion.div>
                  
                  <motion.div variants={item} className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-violet-500" />
                      <span>I'm preparing for</span>
                    </Label>
                    <RadioGroup 
                      defaultValue={examType} 
                      onValueChange={(value) => setExamType(value as ExamType)}
                      className="grid grid-cols-2 gap-2"
                    >
                      <div className="flex items-center space-x-2 border border-violet-100 rounded-md p-3 transition-colors hover:bg-violet-50/50 hover:border-violet-200">
                        <RadioGroupItem value="UPSC" id="upsc" className="text-violet-600" />
                        <Label htmlFor="upsc" className="cursor-pointer">UPSC</Label>
                      </div>
                      <div className="flex items-center space-x-2 border border-violet-100 rounded-md p-3 transition-colors hover:bg-violet-50/50 hover:border-violet-200">
                        <RadioGroupItem value="PSC" id="psc" className="text-violet-600" />
                        <Label htmlFor="psc" className="cursor-pointer">PSC</Label>
                      </div>
                      <div className="flex items-center space-x-2 border border-violet-100 rounded-md p-3 transition-colors hover:bg-violet-50/50 hover:border-violet-200">
                        <RadioGroupItem value="SSC" id="ssc" className="text-violet-600" />
                        <Label htmlFor="ssc" className="cursor-pointer">SSC</Label>
                      </div>
                      <div className="flex items-center space-x-2 border border-violet-100 rounded-md p-3 transition-colors hover:bg-violet-50/50 hover:border-violet-200">
                        <RadioGroupItem value="Banking" id="banking" className="text-violet-600" />
                        <Label htmlFor="banking" className="cursor-pointer">Banking</Label>
                      </div>
                    </RadioGroup>
                  </motion.div>
                </CardContent>
                <CardFooter>
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 transition-all duration-300 btn-modern"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Continue
                  </Button>
                </CardFooter>
              </form>
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
