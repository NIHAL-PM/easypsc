
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useAppStore } from '@/lib/store';
import { useToast } from '@/components/ui/use-toast';
import { generateQuestions, trackUserActivity, getApiKey } from '@/services/api';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { motion } from 'framer-motion';
import { 
  Loader2, 
  BrainCircuit, 
  Sparkles, 
  ShieldCheck, 
  ShieldAlert, 
  Flame,
  Globe
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ApiKeyInput from './ApiKeyInput';
import { useQuestionStore } from '@/services/questionStore';
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
    setPreferredLanguage 
  } = useAppStore();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { customQuestions } = useQuestionStore();
  
  const [difficulty, setDifficulty] = useState('medium');
  const [language, setLanguage] = useState('english');
  const [apiKeyConfigured, setApiKeyConfigured] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [isCheckingApiKey, setIsCheckingApiKey] = useState(true);
  
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
  
  useEffect(() => {
    const checkApiKey = async () => {
      setIsCheckingApiKey(true);
      try {
        const geminiKey = await getApiKey('GEMINI_API_KEY');
        setApiKeyConfigured(!!geminiKey);
      } catch (error) {
        console.error('Error checking API key:', error);
        setApiKeyConfigured(false);
      } finally {
        setIsCheckingApiKey(false);
      }
    };
    
    checkApiKey();
  }, []);
  
  useEffect(() => {
    if (user?.preferredLanguage) {
      setLanguage(user.preferredLanguage);
    }
  }, [user]);
  
  const handleApiKeySubmit = (apiKey: string) => {
    setApiKeyConfigured(true);
  };
  
  const handleLanguageChange = (value: string) => {
    setLanguage(value);
    if (user) {
      setPreferredLanguage(value);
    }
  };
  
  const canGenerateNewQuestions = () => {
    if (!user) return true;
    
    const lastQuestionTime = user.lastQuestionTime;
    if (!lastQuestionTime) return true;
    
    const now = new Date().getTime();
    const timeSinceLastQuestion = now - lastQuestionTime;
    const minWaitTime = 5 * 60 * 1000; // 5 minutes in milliseconds (reduced from 10)
    
    return timeSinceLastQuestion > minWaitTime;
  };
  
  const handleGenerateQuestions = async () => {
    if (!user) return;
    
    setGenerationError(null);
    
    if (!apiKeyConfigured) {
      toast({
        title: "API Key Required",
        description: "Please configure your Gemini API key first.",
        variant: "destructive"
      });
      return;
    }
    
    if (!user.isPremium && user.monthlyQuestionsRemaining <= 0) {
      toast({
        title: "Question limit reached",
        description: "You've reached your monthly question limit. Upgrade to premium for unlimited questions.",
        variant: "destructive"
      });
      
      const shouldUpgrade = window.confirm("Would you like to upgrade to premium for unlimited questions?");
      if (shouldUpgrade) {
        navigate("/premium");
      }
      return;
    }
    
    if (askedQuestionIds.length >= 10 && !canGenerateNewQuestions()) {
      const lastTime = new Date(user.lastQuestionTime || 0);
      const waitTimeMinutes = Math.ceil((5 * 60 * 1000 - (new Date().getTime() - lastTime.getTime())) / 60000);
      
      toast({
        title: "Cooldown period",
        description: `Please wait approximately ${waitTimeMinutes} more minutes before generating new questions.`,
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Track user activity (but don't wait for it)
      trackUserActivity(user.id, 'generate_questions', {
        examType: user.examType,
        difficulty,
        language
      }).catch(err => console.error('Error tracking activity:', err));
      
      const count = user.isPremium ? 5 : Math.min(user.monthlyQuestionsRemaining, 5);
      
      console.log('Generating questions with params:', {
        examType: user.examType,
        difficulty: difficulty,
        count,
        askedQuestionIds,
        language
      });
      
      const generatedQuestions = await generateQuestions({
        examType: user.examType,
        difficulty: difficulty as any,
        count,
        askedQuestionIds,
        language
      });
      
      console.log('Generated questions:', generatedQuestions);
      
      if (!generatedQuestions || generatedQuestions.length === 0) {
        setGenerationError('No questions were generated. Please try a different difficulty level or exam type.');
        toast({
          title: 'No questions generated',
          description: 'Try changing the difficulty, exam type, or language to get new questions.',
          variant: "destructive"
        });
        return;
      }
      
      // Add generated questions to the store
      generatedQuestions.forEach(question => {
        if (!customQuestions.some(q => q.id === question.id)) {
          useQuestionStore.getState().addQuestion(question);
        }
      });
      
      setQuestions(generatedQuestions);
      
      if (generatedQuestions.length > 0) {
        setCurrentQuestion(generatedQuestions[0]);
        setLastQuestionTime(new Date().getTime());
        
        toast({
          title: 'Questions generated',
          description: `${generatedQuestions.length} questions ready for practice in ${language}.`,
        });
      }
    } catch (error) {
      console.error('Error generating questions:', error);
      setGenerationError('Failed to generate questions. Please try again.');
      toast({
        title: 'Error generating questions',
        description: 'Please ensure your API key is configured correctly.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isCheckingApiKey) {
    return (
      <Card className="overflow-hidden border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-900/80 relative">
        <div className="p-6 flex flex-col items-center justify-center min-h-[300px]">
          <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
          <p className="text-center text-muted-foreground">Checking API configuration...</p>
        </div>
      </Card>
    );
  }
  
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
            {generationError && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3 text-sm text-red-800 dark:text-red-300">
                {generationError}
              </div>
            )}
            
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 font-medium">
                <Flame className="w-4 h-4 text-indigo-500" />
                <span>Difficulty Level</span>
              </Label>
              <RadioGroup 
                defaultValue={difficulty} 
                onValueChange={setDifficulty}
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
            
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 font-medium">
                <Globe className="w-4 h-4 text-indigo-500" />
                <span>Question Language</span>
              </Label>
              <Select 
                value={language}
                onValueChange={handleLanguageChange}
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
