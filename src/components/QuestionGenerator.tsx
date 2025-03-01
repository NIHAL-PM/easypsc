import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useAppStore } from '@/lib/store';
import { useToast } from '@/components/ui/use-toast';
import { generateQuestions, trackUserActivity } from '@/services/api';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { motion } from 'framer-motion';
import { Loader2Icon } from 'lucide-react';

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
      <Card className="overflow-hidden border border-border/40 shadow-md bg-card/95 backdrop-blur-sm neo-morphism">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Generate Questions</CardTitle>
          <CardDescription>
            Customize your practice session
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Difficulty Level</Label>
              <RadioGroup 
                defaultValue={difficulty} 
                onValueChange={setDifficulty}
                className="grid grid-cols-3 gap-2"
              >
                <div className="flex items-center space-x-2 border rounded-md p-3 transition-colors hover:bg-accent">
                  <RadioGroupItem value="easy" id="easy" />
                  <Label htmlFor="easy" className="cursor-pointer">Easy</Label>
                </div>
                <div className="flex items-center space-x-2 border rounded-md p-3 transition-colors hover:bg-accent">
                  <RadioGroupItem value="medium" id="medium" />
                  <Label htmlFor="medium" className="cursor-pointer">Medium</Label>
                </div>
                <div className="flex items-center space-x-2 border rounded-md p-3 transition-colors hover:bg-accent">
                  <RadioGroupItem value="hard" id="hard" />
                  <Label htmlFor="hard" className="cursor-pointer">Hard</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleGenerateQuestions} 
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>Generate Questions</>
            )}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default QuestionGenerator;
