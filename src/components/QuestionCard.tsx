
import { useState, useEffect } from 'react';
import { Check, X, ArrowRight, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Question } from '@/types';
import { useAppStore } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import { trackUserActivity } from '@/services/api';

interface QuestionCardProps {
  question: Question;
}

const QuestionCard = ({ question }: QuestionCardProps) => {
  const { 
    selectedOption, 
    selectOption, 
    submitAnswer, 
    nextQuestion, 
    showExplanation,
    user
  } = useAppStore();
  
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  
  useEffect(() => {
    // Reset state when question changes
    setIsSubmitted(false);
    setIsCorrect(null);
  }, [question.id]);
  
  const handleSubmit = () => {
    if (selectedOption === null) return;
    
    const correct = selectedOption === question.correctOption;
    setIsCorrect(correct);
    setIsSubmitted(true);
    submitAnswer();
    
    // Track user activity
    if (user) {
      trackUserActivity(user.id, 'answer_submitted', {
        questionId: question.id,
        selectedOption,
        isCorrect: correct
      });
    }
  };
  
  const handleNext = () => {
    nextQuestion();
    // Track user activity
    if (user) {
      trackUserActivity(user.id, 'next_question', {
        currentQuestionId: question.id
      });
    }
  };
  
  const getOptionClass = (index: number) => {
    if (!isSubmitted) {
      return selectedOption === index 
        ? 'bg-accent border-primary' 
        : 'hover:bg-accent/50 transition-colors';
    }
    
    if (index === question.correctOption) {
      return 'bg-green-100 border-green-500 dark:bg-green-900/30 dark:border-green-600';
    }
    
    if (selectedOption === index && index !== question.correctOption) {
      return 'bg-red-100 border-red-500 dark:bg-red-900/30 dark:border-red-600';
    }
    
    return 'opacity-60';
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-3xl mx-auto"
    >
      <Card className="overflow-hidden border border-border/40 shadow-md bg-card/95 backdrop-blur-sm neo-morphism">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center mb-2">
            <Badge variant="outline" className="font-normal text-xs capitalize">
              {question.category}
            </Badge>
            <Badge variant={
              question.difficulty === 'easy' ? 'outline' : 
              question.difficulty === 'medium' ? 'secondary' : 
              'destructive'
            } className="font-normal text-xs capitalize">
              {question.difficulty}
            </Badge>
          </div>
          <CardTitle className="text-xl md:text-2xl text-left leading-tight tracking-tight">
            {question.text}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-3">
            {question.options.map((option, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: index * 0.1 }}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${getOptionClass(index)}`}
                onClick={() => !isSubmitted && selectOption(index)}
              >
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-background border text-sm font-medium">
                    {String.fromCharCode(65 + index)}
                  </div>
                  <div className="text-left">{option}</div>
                  {isSubmitted && index === question.correctOption && (
                    <Check className="ml-auto text-green-500" />
                  )}
                  {isSubmitted && selectedOption === index && index !== question.correctOption && (
                    <X className="ml-auto text-red-500" />
                  )}
                </div>
              </motion.div>
            ))}
          </div>
          
          <AnimatePresence>
            {showExplanation && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-6 p-4 rounded-lg bg-accent/50 border"
              >
                <div className="flex items-start gap-2">
                  <HelpCircle className="flex-shrink-0 mt-0.5 w-5 h-5 text-muted-foreground" />
                  <div>
                    <h4 className="font-medium mb-1">Explanation</h4>
                    <p className="text-sm text-muted-foreground">{question.explanation}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
        
        <CardFooter className="flex justify-between gap-4 pt-2">
          {!isSubmitted ? (
            <Button 
              className="w-full transition-all" 
              onClick={handleSubmit}
              disabled={selectedOption === null}
            >
              Submit Answer
            </Button>
          ) : (
            <Button 
              className="w-full flex items-center gap-2 transition-all" 
              onClick={handleNext}
            >
              Next Question <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default QuestionCard;
