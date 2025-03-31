
import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ExamType, Subject } from '@/types';
import { useAppStore } from '@/lib/store';

const UserSetup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [examType, setExamType] = useState<ExamType>('UPSC');
  
  const login = useAppStore((state) => state.login);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email) return;
    
    // Initialize subjectPerformance object with all subjects
    const subjectPerformance: Record<Subject, { correct: number; total: number; avgTime: number }> = {
      'Polity': { correct: 0, total: 0, avgTime: 0 },
      'Economics': { correct: 0, total: 0, avgTime: 0 },
      'Art & Culture': { correct: 0, total: 0, avgTime: 0 },
      'History': { correct: 0, total: 0, avgTime: 0 },
      'Geography': { correct: 0, total: 0, avgTime: 0 },
      'Science': { correct: 0, total: 0, avgTime: 0 },
      'Environment': { correct: 0, total: 0, avgTime: 0 },
      'Current Affairs': { correct: 0, total: 0, avgTime: 0 },
      'English Language': { correct: 0, total: 0, avgTime: 0 },
      'General Knowledge': { correct: 0, total: 0, avgTime: 0 }
    };

    login(name, email, examType);
  };
  
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Welcome!</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Your Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="examType">Preparing for</Label>
              <Select
                value={examType}
                onValueChange={(value: ExamType) => setExamType(value)}
              >
                <SelectTrigger id="examType">
                  <SelectValue placeholder="Select exam type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UPSC">UPSC (Civil Services)</SelectItem>
                  <SelectItem value="PSC">State PSC</SelectItem>
                  <SelectItem value="SSC">SSC</SelectItem>
                  <SelectItem value="Banking">Banking</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full mt-4" type="submit">
              Get Started
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-xs text-center text-muted-foreground">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </CardFooter>
      </Card>
    </div>
  );
};

export default UserSetup;
