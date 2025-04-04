
import { useState, useEffect } from 'react';
import { Check, X, ArrowRight, Lightbulb, Award, AlertTriangle, CheckCircle2 } from 'lucide-react';
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
        ? 'bg-indigo-50 border-indigo-300 dark:bg-indigo-900/30 dark:border-indigo-700' 
        : 'hover:bg-slate-50 hover:border-slate-300 dark:hover:bg-slate-800/50 dark:hover:border-slate-700 transition-colors';
    }
    
    if (index === question.correctOption) {
      return 'bg-emerald-50 border-emerald-300 dark:bg-emerald-900/20 dark:border-emerald-700';
    }
    
    if (selectedOption === index && index !== question.correctOption) {
      return 'bg-rose-50 border-rose-300 dark:bg-rose-900/20 dark:border-rose-700';
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
      <Card className="overflow-hidden border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm relative">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center mb-2">
            <Badge className="font-normal text-xs capitalize bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-0">
              {question.category}
            </Badge>
            <Badge variant={
              question.difficulty === 'easy' ? 'outline' : 
              question.difficulty === 'medium' ? 'secondary' : 
              'destructive'
            } className={`font-normal text-xs capitalize border-0 ${
              question.difficulty === 'easy' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400' :
              question.difficulty === 'medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400' :
              'bg-rose-100 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400'
            }`}>
              {question.difficulty === 'easy' && (
                <CheckCircle2 className="w-3 h-3 mr-1" />
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
          <CardTitle className="text-xl md:text-2xl text-left leading-tight tracking-tight text-slate-900 dark:text-slate-100">
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
                className={`p-4 border rounded-xl cursor-pointer transition-all ${getOptionClass(index)} hover:shadow-sm`}
                onClick={() => !isSubmitted && selectOption(index)}
              >
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-700 text-sm font-medium text-indigo-800 dark:text-indigo-300">
                    {String.fromCharCode(65 + index)}
                  </div>
                  <div className="text-left">{option}</div>
                  {isSubmitted && index === question.correctOption && (
                    <Check className="ml-auto text-emerald-500" />
                  )}
                  {isSubmitted && selectedOption === index && index !== question.correctOption && (
                    <X className="ml-auto text-rose-500" />
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
                className="mt-6 p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-800/50"
              >
                <div className="flex items-start gap-2">
                  <Lightbulb className="flex-shrink-0 mt-0.5 w-5 h-5 text-indigo-500" />
                  <div>
                    <h4 className="font-medium mb-1 text-indigo-800 dark:text-indigo-300">Explanation</h4>
                    <p className="text-sm text-indigo-700 dark:text-indigo-400">{question.explanation}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
        
        <CardFooter className="flex justify-between gap-4 pt-2">
          {!isSubmitted ? (
            <Button 
              variant="default"
              className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:opacity-90 transition-all rounded-lg shadow-md hover:shadow-xl" 
              onClick={handleSubmit}
              disabled={selectedOption === null}
            >
              Submit Answer
            </Button>
          ) : (
            <Button 
              variant="default"
              className="w-full flex items-center gap-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:opacity-90 transition-all rounded-lg shadow-md hover:shadow-xl" 
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
