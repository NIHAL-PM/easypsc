
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
      title: 'Welcome to Learnify!',
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
      className="min-h-screen flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="w-full max-w-md">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={item}>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold tracking-tight mb-2">Welcome to Learnify</h1>
              <p className="text-muted-foreground">
                AI-powered question bank for competitive exams
              </p>
            </div>
          </motion.div>
          
          <motion.div variants={item}>
            <Card className="overflow-hidden border border-border/40 shadow-lg bg-card/95 backdrop-blur-sm neo-morphism">
              <CardHeader>
                <CardTitle>Let's get started</CardTitle>
                <CardDescription>Set up your profile to continue</CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-6">
                  <motion.div variants={item} className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      placeholder="Enter your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </motion.div>
                  
                  <motion.div variants={item} className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </motion.div>
                  
                  <motion.div variants={item} className="space-y-2">
                    <Label>I'm preparing for</Label>
                    <RadioGroup 
                      defaultValue={examType} 
                      onValueChange={(value) => setExamType(value as ExamType)}
                      className="grid grid-cols-2 gap-2"
                    >
                      <div className="flex items-center space-x-2 border rounded-md p-3 transition-colors hover:bg-accent">
                        <RadioGroupItem value="UPSC" id="upsc" />
                        <Label htmlFor="upsc" className="cursor-pointer">UPSC</Label>
                      </div>
                      <div className="flex items-center space-x-2 border rounded-md p-3 transition-colors hover:bg-accent">
                        <RadioGroupItem value="PSC" id="psc" />
                        <Label htmlFor="psc" className="cursor-pointer">PSC</Label>
                      </div>
                      <div className="flex items-center space-x-2 border rounded-md p-3 transition-colors hover:bg-accent">
                        <RadioGroupItem value="SSC" id="ssc" />
                        <Label htmlFor="ssc" className="cursor-pointer">SSC</Label>
                      </div>
                      <div className="flex items-center space-x-2 border rounded-md p-3 transition-colors hover:bg-accent">
                        <RadioGroupItem value="Banking" id="banking" />
                        <Label htmlFor="banking" className="cursor-pointer">Banking</Label>
                      </div>
                    </RadioGroup>
                  </motion.div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full">Continue</Button>
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
