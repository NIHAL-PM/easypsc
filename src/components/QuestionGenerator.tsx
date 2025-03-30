
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useAppStore } from '@/lib/store';
import { useToast } from '@/components/ui/use-toast';
import { generateQuestions, trackUserActivity } from '@/services/api';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { motion } from 'framer-motion';
import { Loader2, BrainCircuit, Sparkles, ShieldCheck, ShieldAlert, Flame } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const QuestionGenerator = () => {
  const { 
    user, 
    setQuestions, 
    setCurrentQuestion, 
    setIsLoading, 
    isLoading, 
    askedQuestionIds 
  } = useAppStore();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [difficulty, setDifficulty] = useState('medium');
  
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
    
    setIsLoading(true);
    
    try {
      // Track user action
      trackUserActivity(user.id, 'generate_questions', {
        examType: user.examType,
        difficulty
      });
      
      // Generate 5 questions for premium, or limited questions for free users
      const count = user.isPremium ? 5 : Math.min(user.monthlyQuestionsRemaining, 5);
      
      const generatedQuestions = await generateQuestions({
        examType: user.examType,
        difficulty: difficulty as any,
        count,
        askedQuestionIds // Pass the IDs of questions that have already been asked
      });
      
      setQuestions(generatedQuestions);
      
      // Set the first question as current
      if (generatedQuestions.length > 0) {
        setCurrentQuestion(generatedQuestions[0]);
        
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
        description: 'Please try again later.',
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
