
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ExamType, Language, User } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { v4 as uuidv4 } from 'uuid';

interface UserSetupProps {
  onUserCreate: (user: User) => void;
}

const UserSetup = ({ onUserCreate }: UserSetupProps) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [examType, setExamType] = useState<ExamType>('UPSC');
  const [language, setLanguage] = useState<Language>('English');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!name || !email) return;
    
    const newUser: User = {
      id: uuidv4(),
      name,
      email,
      examType,
      questionsAnswered: 0,
      questionsCorrect: 0,
      isPremium: false,
      monthlyQuestionsRemaining: 10,
      currentStreak: 0,
      lastActive: null,
      lastQuestionTime: null,
      preferredLanguage: language // Save preferred language to user
    };
    
    onUserCreate(newUser);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input 
          id="name" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          placeholder="Enter your name" 
          required 
        />
      </div>
      
      <div>
        <Label htmlFor="email">Email</Label>
        <Input 
          id="email" 
          type="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          placeholder="Enter your email" 
          required 
        />
      </div>
      
      <div>
        <Label htmlFor="examType">Exam Type</Label>
        <Select value={examType} onValueChange={(value) => setExamType(value as ExamType)}>
          <SelectTrigger id="examType">
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
      
      <div>
        <Label htmlFor="language">Preferred Language</Label>
        <Select value={language} onValueChange={(value) => setLanguage(value as Language)}>
          <SelectTrigger id="language">
            <SelectValue placeholder="Select language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="English">English</SelectItem>
            <SelectItem value="Hindi">Hindi</SelectItem>
            <SelectItem value="Tamil">Tamil</SelectItem>
            <SelectItem value="Telugu">Telugu</SelectItem>
            <SelectItem value="Malayalam">Malayalam</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <Button type="submit">Create Account</Button>
    </form>
  );
};

export default UserSetup;
