
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useAppStore } from '@/lib/store';
import { useToast } from '@/components/ui/use-toast';
import { generateQuestions, trackUserActivity } from '@/services/api';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { motion } from 'framer-motion';
import { Loader2, BrainCircuit, Sparkles, ShieldCheck, ShieldAlert, Flame, Languages } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuestionStore } from '@/services/questionStore';
import { QuestionDifficulty, Language } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const QuestionGenerator = () => {
  const { 
    user, 
    setQuestions, 
    setCurrentQuestion, 
    setIsLoading, 
    isLoading, 
    askedQuestionIds,
    setLastQuestionTime,
    selectedLanguage,
    setSelectedLanguage
  } = useAppStore();
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const { customQuestions } = useQuestionStore();
  
  const [difficulty, setDifficulty] = useState<QuestionDifficulty>('medium');
  const [localLanguage, setLocalLanguage] = useState<Language>(selectedLanguage);
  
  // Sync local language with global state
  useEffect(() => {
    setLocalLanguage(selectedLanguage);
  }, [selectedLanguage]);
  
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
        difficulty,
        language: localLanguage
      });
      
      // Generate 5 questions for premium, or limited questions for free users
      const count = user.isPremium ? 5 : Math.min(user.monthlyQuestionsRemaining, 5);
      
      console.log('Generating questions with language:', localLanguage);
      
      // Apply global language selection
      setSelectedLanguage(localLanguage);
      
      const generatedQuestions = await generateQuestions({
        examType: user.examType,
        difficulty: difficulty,
        count,
        askedQuestionIds, // Pass the IDs of questions that have already been asked
        language: localLanguage
      });
      
      if (generatedQuestions.length === 0) {
        toast({
          title: 'No new questions available',
          description: 'Try changing the difficulty or exam type to get new questions.',
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
        description: 'An error occurred while generating questions. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative"
    >
      {/* Decorative gradient blobs */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full blur-3xl -z-10"></div>
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl -z-10"></div>
      
      <Card className="overflow-hidden border-0 shadow-xl bg-white/90 backdrop-blur-md dark:bg-slate-900/90 relative z-10">
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
          <div className="space-y-6">
            <div className="space-y-3">
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
                    className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-indigo-500 peer-data-[state=checked]:bg-indigo-50 dark:peer-data-[state=checked]:bg-indigo-950/40 [&:has([data-state=checked])]:border-primary cursor-pointer transition-all duration-200"
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
                    className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-indigo-500 peer-data-[state=checked]:bg-indigo-50 dark:peer-data-[state=checked]:bg-indigo-950/40 [&:has([data-state=checked])]:border-primary cursor-pointer transition-all duration-200"
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
                    className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-indigo-500 peer-data-[state=checked]:bg-indigo-50 dark:peer-data-[state=checked]:bg-indigo-950/40 [&:has([data-state=checked])]:border-primary cursor-pointer transition-all duration-200"
                  >
                    <ShieldAlert className="mb-1 h-5 w-5 text-rose-500" />
                    <span className="text-sm font-medium">Hard</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 font-medium">
                <Languages className="w-4 h-4 text-indigo-500" />
                <span>Question Language</span>
              </Label>
              <Select 
                value={localLanguage} 
                onValueChange={(value) => setLocalLanguage(value as Language)}
              >
                <SelectTrigger className="w-full bg-white dark:bg-slate-800 border-2 transition-all duration-200 hover:border-indigo-300 dark:hover:border-indigo-700">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-indigo-100 dark:border-indigo-900/40">
                  <SelectItem value="English" className="cursor-pointer">English</SelectItem>
                  <SelectItem value="Hindi" className="cursor-pointer">हिंदी</SelectItem>
                  <SelectItem value="Tamil" className="cursor-pointer">தமிழ்</SelectItem>
                  <SelectItem value="Telugu" className="cursor-pointer">తెలుగు</SelectItem>
                  <SelectItem value="Malayalam" className="cursor-pointer">മലയാളം</SelectItem>
                  <SelectItem value="Kannada" className="cursor-pointer">ಕನ್ನಡ</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
