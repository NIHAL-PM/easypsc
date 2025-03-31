
import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { generateQuestions } from '@/services/api';
import { Button } from './ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { useToast } from './ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import DifficultySelector from './DifficultySelector';
import LoadingSpinner from './LoadingSpinner';
import { Slider } from './ui/slider';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Label } from './ui/label';
import { Input } from './ui/input';
import {
  BookOpen,
  Clock,
  ListChecks,
  RefreshCw,
  Shuffle,
  ThumbsUp,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { trackUserActivity } from '@/services/api';
import { Question, QuestionDifficulty, Subject } from '@/types';
import { isGeminiApiKeyConfigured } from '@/lib/env';
import ApiKeyInput from './ApiKeyInput';

const QuestionGenerator = () => {
  const {
    user,
    setQuestions,
    setCurrentQuestion,
    setIsLoading,
    isLoading,
    askedQuestionIds,
    setLastQuestionTime,
    questionsWithTimer,
    toggleQuestionsWithTimer,
    mixedDifficultySettings,
    setMixedDifficultySettings,
    selectedSubject,
    setSelectedSubject,
  } = useAppStore();

  const [difficulty, setDifficulty] = useState<QuestionDifficulty>('medium');
  const [count, setCount] = useState(5);
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(!isGeminiApiKeyConfigured());
  const [apiKey, setApiKey] = useState('');
  const [generationMode, setGenerationMode] = useState<'standard' | 'mixed'>('standard');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [cooldownRemaining, setCooldownRemaining] = useState<number | null>(null);
  const [showMixedSettings, setShowMixedSettings] = useState(false);

  const { toast } = useToast();

  const subjectOptions: Subject[] = [
    'Polity',
    'Economics',
    'Art & Culture',
    'History',
    'Geography',
    'Science',
    'Environment',
    'Current Affairs',
    'English Language',
    'General Knowledge',
  ];

  useEffect(() => {
    // Check for cooldown period
    if (user?.lastQuestionTime) {
      const now = Date.now();
      const cooldownPeriod = 5 * 60 * 1000; // 5 minutes in ms
      const elapsed = now - user.lastQuestionTime;
      
      if (elapsed < cooldownPeriod) {
        const remaining = Math.ceil((cooldownPeriod - elapsed) / 1000);
        setCooldownRemaining(remaining);
        
        // Set interval to update countdown
        const interval = setInterval(() => {
          setCooldownRemaining(prev => {
            if (prev === null || prev <= 1) {
              clearInterval(interval);
              return null;
            }
            return prev - 1;
          });
        }, 1000);
        
        return () => clearInterval(interval);
      } else {
        setCooldownRemaining(null);
      }
    }
  }, [user?.lastQuestionTime]);

  const formatCooldownTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const handleGenerateQuestions = async () => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'Please login to generate questions',
        variant: 'destructive',
      });
      return;
    }

    if (user.monthlyQuestionsRemaining <= 0 && !user.isPremium) {
      toast({
        title: 'Monthly limit reached',
        description: 'You have reached your monthly question limit. Upgrade to premium for unlimited questions!',
        variant: 'destructive',
      });
      return;
    }

    // Check for cooldown period
    if (cooldownRemaining !== null) {
      toast({
        title: 'Generating too quickly',
        description: `Please wait ${formatCooldownTime(cooldownRemaining)} before generating more questions.`,
        variant: 'destructive',
      });
      return;
    }

    // Save API key to localStorage if provided
    if (apiKey) {
      localStorage.setItem('GEMINI_API_KEY', apiKey);
      setShowApiKeyDialog(false);
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      let questions: Question[] = [];

      if (generationMode === 'standard') {
        // Standard mode - all questions have the same difficulty
        questions = await generateQuestions({
          examType: user.examType,
          difficulty,
          count,
          askedQuestionIds,
          subject: selectedSubject,
        });
      } else {
        // Mixed mode - generate questions with different difficulties
        const { easy, medium, hard } = mixedDifficultySettings;
        const totalQuestions = easy + medium + hard;

        if (totalQuestions === 0) {
          throw new Error('Please select at least one question for each difficulty level');
        }

        // Generate easy questions
        const easyQuestions = easy > 0
          ? await generateQuestions({
              examType: user.examType,
              difficulty: 'easy',
              count: easy,
              askedQuestionIds,
              subject: selectedSubject,
            })
          : [];

        // Generate medium questions
        const mediumQuestions = medium > 0
          ? await generateQuestions({
              examType: user.examType,
              difficulty: 'medium',
              count: medium,
              askedQuestionIds: [...askedQuestionIds, ...easyQuestions.map(q => q.id)],
              subject: selectedSubject,
            })
          : [];

        // Generate hard questions
        const hardQuestions = hard > 0
          ? await generateQuestions({
              examType: user.examType,
              difficulty: 'hard',
              count: hard,
              askedQuestionIds: [
                ...askedQuestionIds,
                ...easyQuestions.map(q => q.id),
                ...mediumQuestions.map(q => q.id),
              ],
              subject: selectedSubject,
            })
          : [];

        questions = [...easyQuestions, ...mediumQuestions, ...hardQuestions];
      }

      if (questions.length === 0) {
        throw new Error('No questions were generated. Please try again.');
      }

      // Update question store
      setQuestions(questions);
      
      // Set the current question
      setCurrentQuestion(questions[0]);
      
      // Set last question time for cooldown
      setLastQuestionTime(Date.now());
      
      // Track activity
      trackUserActivity(user.id, 'generate_questions', {
        count: questions.length,
        difficulty: generationMode === 'standard' ? difficulty : 'mixed',
        examType: user.examType,
        subject: selectedSubject
      });
      
      toast({
        title: 'Questions Generated!',
        description: `${questions.length} ${selectedSubject || ''} questions are ready for you.`,
      });
      
    } catch (error) {
      console.error('Error generating questions:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to generate questions');
      
      toast({
        title: 'Error Generating Questions',
        description: error instanceof Error ? error.message : 'Failed to generate questions',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Card className="shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-0">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl text-gradient-primary flex items-center gap-2">
            <Zap className="h-5 w-5 text-indigo-500" />
            Generate Questions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="standard" value={generationMode} onValueChange={(value) => setGenerationMode(value as 'standard' | 'mixed')}>
            <TabsList className="w-full mb-4">
              <TabsTrigger value="standard" className="flex items-center gap-2">
                <ListChecks className="h-4 w-4" />
                Standard Mode
              </TabsTrigger>
              <TabsTrigger value="mixed" className="flex items-center gap-2">
                <Shuffle className="h-4 w-4" />
                Mixed Difficulty
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="standard" className="space-y-4">
              <DifficultySelector 
                selected={difficulty} 
                onSelect={setDifficulty} 
              />
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Number of Questions</span>
                  <span className="text-sm bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded">
                    {count}
                  </span>
                </div>
                <Slider 
                  min={1} 
                  max={10} 
                  step={1} 
                  value={[count]} 
                  onValueChange={(values) => setCount(values[0])}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="mixed" className="space-y-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Difficulty Mix</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 text-xs" 
                  onClick={() => setShowMixedSettings(true)}
                >
                  Configure
                </Button>
              </div>
              
              <div className="grid grid-cols-3 gap-3">
                <div className={cn(
                  "flex flex-col items-center justify-center p-3 rounded-lg border",
                  "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800"
                )}>
                  <span className="text-sm font-semibold text-green-600 dark:text-green-400">Easy</span>
                  <span className="text-2xl font-bold text-green-700 dark:text-green-300">
                    {mixedDifficultySettings.easy}
                  </span>
                </div>
                
                <div className={cn(
                  "flex flex-col items-center justify-center p-3 rounded-lg border",
                  "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800"
                )}>
                  <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">Medium</span>
                  <span className="text-2xl font-bold text-amber-700 dark:text-amber-300">
                    {mixedDifficultySettings.medium}
                  </span>
                </div>
                
                <div className={cn(
                  "flex flex-col items-center justify-center p-3 rounded-lg border",
                  "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800"
                )}>
                  <span className="text-sm font-semibold text-red-600 dark:text-red-400">Hard</span>
                  <span className="text-2xl font-bold text-red-700 dark:text-red-300">
                    {mixedDifficultySettings.hard}
                  </span>
                </div>
              </div>
              
              <div className="text-sm text-muted-foreground">
                Total: {mixedDifficultySettings.easy + mixedDifficultySettings.medium + mixedDifficultySettings.hard} questions
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <div className="text-sm font-medium">Subject Area (Optional)</div>
              <Select 
                value={selectedSubject || ''} 
                onValueChange={(value) => setSelectedSubject(value ? value as Subject : null)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Subjects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Subjects</SelectItem>
                  {subjectOptions.map((subject) => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <input
                  id="timer-toggle"
                  type="checkbox"
                  checked={questionsWithTimer}
                  onChange={toggleQuestionsWithTimer}
                  className="form-checkbox h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
                />
                <label htmlFor="timer-toggle" className="flex items-center cursor-pointer">
                  <Clock className="h-4 w-4 mr-1" />
                  <span className="text-sm">Use Timer</span>
                </label>
              </div>
              
              <div className="text-sm text-muted-foreground">
                {user && user.isPremium ? (
                  <span className="flex items-center text-indigo-500">
                    <ThumbsUp className="h-4 w-4 mr-1" />
                    Premium User
                  </span>
                ) : (
                  <span>
                    {user?.monthlyQuestionsRemaining} questions remaining
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {errorMessage && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-md text-sm">
              {errorMessage}
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowApiKeyDialog(true)}
            className="text-xs"
          >
            API Key
          </Button>
          
          <Button
            onClick={handleGenerateQuestions}
            disabled={isLoading || cooldownRemaining !== null}
            className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:opacity-90 transition-all rounded-lg shadow-md hover:shadow-xl flex gap-2"
          >
            {isLoading ? (
              <>
                <LoadingSpinner className="h-4 w-4" />
                <span>Generating...</span>
              </>
            ) : cooldownRemaining !== null ? (
              <>
                <RefreshCw className="h-4 w-4" />
                <span>Wait {formatCooldownTime(cooldownRemaining)}</span>
              </>
            ) : (
              <>
                <BookOpen className="h-4 w-4" />
                <span>Generate Questions</span>
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
      
      {/* API Key Dialog */}
      <Dialog open={showApiKeyDialog} onOpenChange={setShowApiKeyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter Gemini API Key</DialogTitle>
            <DialogDescription>
              An API key is required to generate questions. Get your key from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-indigo-500 hover:underline">Google AI Studio</a>.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key</Label>
              <Input 
                id="apiKey" 
                type="password" 
                value={apiKey} 
                onChange={(e) => setApiKey(e.target.value)} 
                placeholder="AIzaSyA1234567890abcdefghijklmnopqrstuvwxyz"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={() => {
              if (apiKey) {
                localStorage.setItem('GEMINI_API_KEY', apiKey);
                setShowApiKeyDialog(false);
                toast({
                  title: "API Key Saved",
                  description: "Your API key has been saved for this session."
                });
              }
            }}>
              Save API Key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Mixed Difficulty Settings Dialog */}
      <Dialog open={showMixedSettings} onOpenChange={setShowMixedSettings}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configure Mixed Difficulty</DialogTitle>
            <DialogDescription>
              Adjust the number of questions for each difficulty level.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-green-600">Easy Questions</Label>
              <div className="flex items-center gap-4">
                <Slider 
                  min={0} 
                  max={10} 
                  step={1} 
                  value={[mixedDifficultySettings.easy]} 
                  onValueChange={(values) => setMixedDifficultySettings({
                    ...mixedDifficultySettings,
                    easy: values[0]
                  })}
                  className="flex-1"
                />
                <span className="text-sm font-medium w-8 text-center">
                  {mixedDifficultySettings.easy}
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-amber-600">Medium Questions</Label>
              <div className="flex items-center gap-4">
                <Slider 
                  min={0} 
                  max={10} 
                  step={1} 
                  value={[mixedDifficultySettings.medium]} 
                  onValueChange={(values) => setMixedDifficultySettings({
                    ...mixedDifficultySettings,
                    medium: values[0]
                  })}
                  className="flex-1"
                />
                <span className="text-sm font-medium w-8 text-center">
                  {mixedDifficultySettings.medium}
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-red-600">Hard Questions</Label>
              <div className="flex items-center gap-4">
                <Slider 
                  min={0} 
                  max={10} 
                  step={1} 
                  value={[mixedDifficultySettings.hard]} 
                  onValueChange={(values) => setMixedDifficultySettings({
                    ...mixedDifficultySettings,
                    hard: values[0]
                  })}
                  className="flex-1"
                />
                <span className="text-sm font-medium w-8 text-center">
                  {mixedDifficultySettings.hard}
                </span>
              </div>
            </div>
            
            <div className="pt-2 border-t">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total questions:</span>
                <span className="font-bold">
                  {mixedDifficultySettings.easy + mixedDifficultySettings.medium + mixedDifficultySettings.hard}
                </span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowMixedSettings(false)}>
              Save Settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default QuestionGenerator;
