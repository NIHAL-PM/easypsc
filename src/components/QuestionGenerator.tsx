
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useAppStore } from '@/lib/store';
import { useToast } from '@/components/ui/use-toast';
import { generateQuestions, trackUserActivity } from '@/services/api';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { motion } from 'framer-motion';
import { Loader2, Zap, Sparkles, Shield, ShieldAlert } from 'lucide-react';

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
  
  const [difficulty, setDifficulty] = useState('medium');
  
  const handleGenerateQuestions = async () => {
    if (!user) return;
    
    // Check if user has questions remaining in free tier
    if (!user.isPremium && user.monthlyQuestionsRemaining <= 0) {
      toast({
        title: 'Question limit reached',
        description: 'Upgrade to premium for unlimited questions.',
        variant: 'destructive'
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Track user action
      trackUserActivity(user.id, 'generate_questions', {
        examType: user.examType,
        difficulty
      });
      
      // Get 5 questions (or less if free tier)
      const count = user.isPremium ? 5 : Math.min(user.monthlyQuestionsRemaining, 5);
      
      const generatedQuestions = await generateQuestions({
        examType: user.examType,
        difficulty,
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
      <Card className="overflow-hidden border border-violet-100 shadow-md bg-card/95 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-purple-600"></div>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl flex items-center gap-2 text-violet-800">
            <Zap className="w-5 h-5 text-violet-500" />
            Generate Questions
          </CardTitle>
          <CardDescription>
            Customize your practice session
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-violet-800">
                <Sparkles className="w-4 h-4 text-violet-500" />
                <span>Difficulty Level</span>
              </Label>
              <RadioGroup 
                defaultValue={difficulty} 
                onValueChange={setDifficulty}
                className="grid grid-cols-3 gap-2"
              >
                <div className="flex items-center space-x-2 border border-violet-100 rounded-md p-3 transition-colors hover:bg-violet-50 hover:border-violet-200">
                  <RadioGroupItem value="easy" id="easy" className="text-green-600" />
                  <Label htmlFor="easy" className="cursor-pointer flex items-center gap-1">
                    <Shield className="w-3 h-3 text-green-500" />
                    <span>Easy</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 border border-violet-100 rounded-md p-3 transition-colors hover:bg-violet-50 hover:border-violet-200">
                  <RadioGroupItem value="medium" id="medium" className="text-amber-600" />
                  <Label htmlFor="medium" className="cursor-pointer flex items-center gap-1">
                    <Shield className="w-3 h-3 text-amber-500" />
                    <span>Medium</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 border border-violet-100 rounded-md p-3 transition-colors hover:bg-violet-50 hover:border-violet-200">
                  <RadioGroupItem value="hard" id="hard" className="text-red-600" />
                  <Label htmlFor="hard" className="cursor-pointer flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3 text-red-500" />
                    <span>Hard</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            variant="gradient"
            onClick={handleGenerateQuestions} 
            className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 transition-all duration-300 btn-modern"
            disabled={isLoading}
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
