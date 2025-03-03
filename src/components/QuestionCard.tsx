
import { useState, useEffect } from 'react';
import { Check, X, ArrowRight, HelpCircle, Lightbulb, Award, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Question } from '@/types';
import { useAppStore } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import { trackUserActivity } from '@/services/api';

interface QuestionCardProps {
  question?: Question;
}

const QuestionCard = ({ question: propQuestion }: QuestionCardProps) => {
  const { 
    selectedOption, 
    selectOption, 
    submitAnswer, 
    nextQuestion, 
    showExplanation,
    user,
    currentQuestion: storeQuestion
  } = useAppStore();
  
  // Use the question from props if provided, otherwise use from store
  const question = propQuestion || storeQuestion;
  
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  
  // Guard against attempting to render when no question is available
  if (!question) {
    return (
      <div className="w-full max-w-3xl mx-auto p-8 text-center">
        <p className="text-muted-foreground">No question available. Please generate questions first.</p>
      </div>
    );
  }
  
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
        ? 'bg-violet-50 border-violet-300 dark:bg-violet-900/30 dark:border-violet-600' 
        : 'hover:bg-violet-50/50 hover:border-violet-200 transition-colors';
    }
    
    if (index === question.correctOption) {
      return 'bg-green-50 border-green-300 dark:bg-green-900/30 dark:border-green-600';
    }
    
    if (selectedOption === index && index !== question.correctOption) {
      return 'bg-red-50 border-red-300 dark:bg-red-900/30 dark:border-red-600';
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
      <Card className="overflow-hidden border border-violet-100 shadow-md bg-card/95 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-purple-600"></div>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center mb-2">
            <Badge variant="outline" className="font-normal text-xs capitalize bg-violet-50 text-violet-700 border-violet-200">
              {question.category}
            </Badge>
            <Badge variant={
              question.difficulty === 'easy' ? 'outline' : 
              question.difficulty === 'medium' ? 'secondary' : 
              'destructive'
            } className={`font-normal text-xs capitalize ${
              question.difficulty === 'easy' ? 'bg-green-50 text-green-700 border-green-200' :
              question.difficulty === 'medium' ? 'bg-amber-50 text-amber-700 border-amber-200' :
              'bg-red-50 text-red-700 border-red-200'
            }`}>
              {question.difficulty === 'easy' && (
                <Check className="w-3 h-3 mr-1" />
              )}
              {question.difficulty === 'medium' && (
                <Award className="w-3 h-3 mr-1" />
              )}
              {question.difficulty === 'hard' && (
                <AlertTriangle className="w-3 h-3 mr-1" />
              )}
              {question.difficulty}
            </Badge>
          </div>
          <CardTitle className="text-xl md:text-2xl text-left leading-tight tracking-tight text-violet-900 dark:text-violet-100">
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
                className={`p-4 border rounded-lg cursor-pointer transition-all ${getOptionClass(index)} hover:shadow-sm`}
                onClick={() => !isSubmitted && selectOption(index)}
              >
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-violet-100 border border-violet-200 text-sm font-medium text-violet-800">
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
                className="mt-6 p-4 rounded-lg bg-violet-50 border border-violet-200"
              >
                <div className="flex items-start gap-2">
                  <Lightbulb className="flex-shrink-0 mt-0.5 w-5 h-5 text-violet-500" />
                  <div>
                    <h4 className="font-medium mb-1 text-violet-800">Explanation</h4>
                    <p className="text-sm text-violet-700">{question.explanation}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
        
        <CardFooter className="flex justify-between gap-4 pt-2">
          {!isSubmitted ? (
            <Button 
              variant="gradient"
              className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 transition-all btn-modern" 
              onClick={handleSubmit}
              disabled={selectedOption === null}
            >
              Submit Answer
            </Button>
          ) : (
            <Button 
              variant="gradient"
              className="w-full flex items-center gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 transition-all btn-modern" 
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
