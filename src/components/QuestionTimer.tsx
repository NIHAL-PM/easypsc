
import { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import { Clock } from 'lucide-react';
import { motion } from 'framer-motion';

interface QuestionTimerProps {
  timeLimit: number; // in seconds
  onTimeUp: () => void;
  isPaused: boolean;
}

const QuestionTimer = ({ timeLimit, onTimeUp, isPaused }: QuestionTimerProps) => {
  const [timeRemaining, setTimeRemaining] = useState(timeLimit);
  const [isWarning, setIsWarning] = useState(false);
  
  useEffect(() => {
    // Reset timer when a new question comes in
    setTimeRemaining(timeLimit);
    setIsWarning(false);
  }, [timeLimit]);
  
  useEffect(() => {
    if (isPaused) return;
    
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        const newTime = prev - 1;
        
        // Set warning state when less than 10 seconds remain
        if (newTime <= 10 && !isWarning) {
          setIsWarning(true);
        }
        
        // Time's up
        if (newTime <= 0) {
          clearInterval(timer);
          onTimeUp();
          return 0;
        }
        
        return newTime;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [timeLimit, onTimeUp, isPaused, isWarning]);
  
  const progressPercent = (timeRemaining / timeLimit) * 100;
  
  // Format time as MM:SS
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium flex items-center">
          <Clock className="w-4 h-4 mr-1 text-indigo-500" />
          Time Remaining
        </span>
        <motion.span 
          className={`text-sm font-bold ${isWarning ? 'text-rose-500' : 'text-indigo-600 dark:text-indigo-400'}`}
          animate={isWarning ? { scale: [1, 1.1, 1], opacity: [1, 0.8, 1] } : {}}
          transition={{ duration: 0.5, repeat: isWarning ? Infinity : 0, repeatType: "reverse" }}
        >
          {formattedTime}
        </motion.span>
      </div>
      <Progress 
        value={progressPercent} 
        className={`h-2 ${
          isWarning 
            ? 'bg-rose-100 dark:bg-rose-950/30' 
            : 'bg-slate-100 dark:bg-slate-800'
        }`}
      />
    </div>
  );
};

export default QuestionTimer;
