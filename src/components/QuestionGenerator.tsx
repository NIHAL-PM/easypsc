
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useAppStore } from '@/lib/store';
import { useToast } from '@/components/ui/use-toast';
import { generateQuestions, trackUserActivity } from '@/services/api';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { motion } from 'framer-motion';
import { Loader2, BrainCircuit, Sparkles, ShieldCheck, ShieldAlert, Flame, BookOpen, ToggleLeft, ToggleRight, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ApiKeyInput from './ApiKeyInput';
import { isGeminiApiKeyConfigured } from '@/lib/env';
import { useQuestionStore } from '@/services/questionStore';
import { Subject, QuestionDifficulty } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import DifficultySelector from './DifficultySelector';

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
    setSelectedSubject
  } = useAppStore();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { customQuestions } = useQuestionStore();
  
  const [difficulty, setDifficulty] = useState<QuestionDifficulty>('medium');
  const [useMixedDifficulty, setUseMixedDifficulty] = useState(false);
  const [apiKeyConfigured, setApiKeyConfigured] = useState(() => {
    return localStorage.getItem('GEMINI_API_KEY') || isGeminiApiKeyConfigured();
  });
  const [maxQuestions, setMaxQuestions] = useState(10);
  
  const handleApiKeySubmit = (apiKey: string) => {
    setApiKeyConfigured(true);
  };
  
  // Function to check if enough time has passed since last question generation
  const canGenerateNewQuestions = () => {
    if (!user) return true;
    
    const lastQuestionTime = user.lastQuestionTime;
    if (!lastQuestionTime) return true;
    
    const now = new Date().getTime();
    const timeSinceLastQuestion = now - lastQuestionTime;
    const minWaitTime = 10 * 60 * 1000; // 10 minutes in milliseconds
    
    return timeSinceLastQuestion > minWaitTime;
  };
  
  const handleGenerateQuestions = async () => {
    if (!user) return;
    
    // Check if API key is configured
    if (!apiKeyConfigured) {
      toast({
        title: "API Key Required",
        description: "Please configure your Gemini API key first.",
        variant: "destructive"
      });
      return;
    }
    
    // Check if non-premium user has questions remaining
    if (!user.isPremium && user.monthlyQuestionsRemaining <= 0) {
      toast({
        title: "Question limit reached",
        description: "You've reached your monthly question limit. Upgrade to premium for unlimited questions.",
        variant: "destructive"
      });
      
      // Prompt to upgrade
      const shouldUpgrade = window.confirm("Would you like to upgrade to premium for unlimited questions?");
      if (shouldUpgrade) {
        navigate("/premium");
      }
      return;
    }
    
    // Check if we need to enforce a cooldown period
    if (askedQuestionIds.length >= 10 && !canGenerateNewQuestions()) {
      const lastTime = new Date(user.lastQuestionTime || 0);
      const waitTimeMinutes = Math.ceil((10 * 60 * 1000 - (new Date().getTime() - lastTime.getTime())) / 60000);
      
      toast({
        title: "Cooldown period",
        description: `Please wait approximately ${waitTimeMinutes} more minutes before generating new questions.`,
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Track user action
      trackUserActivity(user.id, 'generate_questions', {
        examType: user.examType,
        difficulty: useMixedDifficulty ? 'mixed' : difficulty,
        subject: selectedSubject
      });
      
      // Calculate number of questions to generate
      let count = 5; // Default count
      
      if (user.isPremium) {
        count = useMixedDifficulty 
          ? mixedDifficultySettings.easy + mixedDifficultySettings.medium + mixedDifficultySettings.hard
          : 5;
      } else {
        // For free users, limit to remaining questions
        count = Math.min(user.monthlyQuestionsRemaining, 5);
        
        if (useMixedDifficulty) {
          // Ensure we don't request more than the user has available
          const totalMixed = mixedDifficultySettings.easy + mixedDifficultySettings.medium + mixedDifficultySettings.hard;
          count = Math.min(user.monthlyQuestionsRemaining, totalMixed);
        }
      }
      
      // Generate questions based on settings
      let generatedQuestions = [];
      
      if (useMixedDifficulty) {
        // Generate questions for each difficulty
        const easyCount = Math.min(mixedDifficultySettings.easy, count);
        const mediumCount = Math.min(mixedDifficultySettings.medium, count - easyCount);
        const hardCount = Math.min(mixedDifficultySettings.hard, count - easyCount - mediumCount);
        
        // Generate easy questions
        if (easyCount > 0) {
          const easyQuestions = await generateQuestions({
            examType: user.examType,
            difficulty: 'easy',
            count: easyCount,
            askedQuestionIds,
            subject: selectedSubject || undefined
          });
          generatedQuestions = [...generatedQuestions, ...easyQuestions];
        }
        
        // Generate medium questions
        if (mediumCount > 0) {
          const mediumQuestions = await generateQuestions({
            examType: user.examType,
            difficulty: 'medium',
            count: mediumCount,
            askedQuestionIds: [...askedQuestionIds, ...generatedQuestions.map(q => q.id)],
            subject: selectedSubject || undefined
          });
          generatedQuestions = [...generatedQuestions, ...mediumQuestions];
        }
        
        // Generate hard questions
        if (hardCount > 0) {
          const hardQuestions = await generateQuestions({
            examType: user.examType,
            difficulty: 'hard',
            count: hardCount,
            askedQuestionIds: [...askedQuestionIds, ...generatedQuestions.map(q => q.id)],
            subject: selectedSubject || undefined
          });
          generatedQuestions = [...generatedQuestions, ...hardQuestions];
        }
      } else {
        // Standard single difficulty generation
        generatedQuestions = await generateQuestions({
          examType: user.examType,
          difficulty: difficulty as any,
          count,
          askedQuestionIds,
          subject: selectedSubject || undefined
        });
      }
      
      if (generatedQuestions.length === 0) {
        toast({
          title: 'No new questions available',
          description: 'Try changing the difficulty, subject, or exam type to get new questions.',
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }
      
      // Store the new questions in the question store for admin access
      generatedQuestions.forEach(question => {
        // Only add if it doesn't already exist in customQuestions
        if (!customQuestions.some(q => q.id === question.id)) {
          useQuestionStore.getState().addQuestion(question);
        }
      });
      
      setQuestions(generatedQuestions);
      
      // Set the first question as current
      if (generatedQuestions.length > 0) {
        setCurrentQuestion(generatedQuestions[0]);
        
        // Update the last question time
        setLastQuestionTime(new Date().getTime());
        
        toast({
          title: 'Questions generated',
          description: `${generatedQuestions.length} questions ready for practice.`,
        });
      } else {
        toast({
          title: 'No questions generated',
          description: 'Please try again with different parameters.',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error generating questions:', error);
      toast({
        title: 'Error generating questions',
        description: 'Please ensure your API key is configured correctly.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!apiKeyConfigured) {
    return <ApiKeyInput onApiKeySubmit={handleApiKeySubmit} />;
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-900/80 relative">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
        <CardHeader className="pb-3">
          <CardTitle className="text-xl flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
            <BrainCircuit className="w-5 h-5 text-indigo-500" />
            Generate Questions
          </CardTitle>
          <CardDescription>
            Customize your practice session
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Subject Selector */}
            <div className="space-y-2">
              <Label htmlFor="subject" className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 font-medium">
                <BookOpen className="w-4 h-4 text-indigo-500" />
                Subject
              </Label>
              <Select 
                value={selectedSubject || ''} 
                onValueChange={(value) => setSelectedSubject(value as Subject || null)}
              >
                <SelectTrigger id="subject" className="bg-white/80 dark:bg-slate-800/80">
                  <SelectValue placeholder="All Subjects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Subjects</SelectItem>
                  <SelectItem value="Polity">Polity</SelectItem>
                  <SelectItem value="Economics">Economics</SelectItem>
                  <SelectItem value="Art & Culture">Art & Culture</SelectItem>
                  <SelectItem value="History">History</SelectItem>
                  <SelectItem value="Geography">Geography</SelectItem>
                  <SelectItem value="Science">Science</SelectItem>
                  <SelectItem value="Environment">Environment</SelectItem>
                  <SelectItem value="Current Affairs">Current Affairs</SelectItem>
                  <SelectItem value="English Language">English Language</SelectItem>
                  <SelectItem value="General Knowledge">General Knowledge</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Timer Switch */}
            <div className="flex items-center justify-between border p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2">
                <Label htmlFor="timer-switch" className="flex items-center gap-2 cursor-pointer">
                  {questionsWithTimer ? (
                    <ToggleRight className="w-5 h-5 text-indigo-500" />
                  ) : (
                    <ToggleLeft className="w-5 h-5 text-slate-400" />
                  )}
                  <span>Enable question timer</span>
                </Label>
              </div>
              <Switch 
                id="timer-switch" 
                checked={questionsWithTimer} 
                onCheckedChange={toggleQuestionsWithTimer}
              />
            </div>
            
            {/* Mixed Difficulty Switch */}
            <div className="flex items-center justify-between border p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2">
                <Label htmlFor="mixed-difficulty-switch" className="flex items-center gap-2 cursor-pointer">
                  {useMixedDifficulty ? (
                    <ToggleRight className="w-5 h-5 text-indigo-500" />
                  ) : (
                    <ToggleLeft className="w-5 h-5 text-slate-400" />
                  )}
                  <span>Use mixed difficulty levels</span>
                </Label>
              </div>
              <Switch 
                id="mixed-difficulty-switch" 
                checked={useMixedDifficulty} 
                onCheckedChange={setUseMixedDifficulty}
              />
            </div>
            
            {/* Difficulty Selection */}
            {useMixedDifficulty ? (
              <DifficultySelector 
                maxQuestions={maxQuestions} 
                onChange={setMixedDifficultySettings} 
              />
            ) : (
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 font-medium">
                  <Flame className="w-4 h-4 text-indigo-500" />
                  <span>Difficulty Level</span>
                </Label>
                <RadioGroup 
                  defaultValue={difficulty} 
                  onValueChange={(value) => setDifficulty(value as QuestionDifficulty)}
                  className="grid grid-cols-3 gap-3"
                >
                  <div className="relative">
                    <RadioGroupItem 
                      value="easy" 
                      id="easy" 
                      className="peer sr-only" 
                    />
                    <Label 
                      htmlFor="easy" 
                      className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-indigo-500 peer-data-[state=checked]:bg-indigo-50 dark:peer-data-[state=checked]:bg-indigo-950/40 [&:has([data-state=checked])]:border-primary cursor-pointer"
                    >
                      <ShieldCheck className="mb-1 h-5 w-5 text-emerald-500" />
                      <span className="text-sm font-medium">Easy</span>
                    </Label>
                  </div>
                  
                  <div className="relative">
                    <RadioGroupItem 
                      value="medium" 
                      id="medium" 
                      className="peer sr-only" 
                    />
                    <Label 
                      htmlFor="medium" 
                      className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-indigo-500 peer-data-[state=checked]:bg-indigo-50 dark:peer-data-[state=checked]:bg-indigo-950/40 [&:has([data-state=checked])]:border-primary cursor-pointer"
                    >
                      <Flame className="mb-1 h-5 w-5 text-amber-500" />
                      <span className="text-sm font-medium">Medium</span>
                    </Label>
                  </div>
                  
                  <div className="relative">
                    <RadioGroupItem 
                      value="hard" 
                      id="hard" 
                      className="peer sr-only" 
                    />
                    <Label 
                      htmlFor="hard" 
                      className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-indigo-500 peer-data-[state=checked]:bg-indigo-50 dark:peer-data-[state=checked]:bg-indigo-950/40 [&:has([data-state=checked])]:border-primary cursor-pointer"
                    >
                      <ShieldAlert className="mb-1 h-5 w-5 text-rose-500" />
                      <span className="text-sm font-medium">Hard</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            variant="default"
            onClick={handleGenerateQuestions}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:opacity-90 transition-all rounded-lg shadow-md hover:shadow-xl"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Questions
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default QuestionGenerator;
