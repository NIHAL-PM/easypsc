
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

type LoadingSpinnerProps = {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  text?: string;
  useAnimatedText?: boolean;
};

const examTypes = ['UPSC', 'SSC', 'PSC', 'KPSC', 'BPSC'];

const LoadingSpinner = ({ 
  size = 'md', 
  color = 'primary',
  text = 'Loading...',
  useAnimatedText = false
}: LoadingSpinnerProps) => {
  const [currentExamType, setCurrentExamType] = useState(0);
  
  useEffect(() => {
    if (useAnimatedText) {
      const interval = setInterval(() => {
        setCurrentExamType((prev) => (prev + 1) % examTypes.length);
      }, 2000);
      
      return () => clearInterval(interval);
    }
  }, [useAnimatedText]);
  
  const sizeMap = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  };
  
  const colorMap = {
    primary: 'border-primary/30 border-t-primary',
    secondary: 'border-secondary/30 border-t-secondary',
    accent: 'border-accent/30 border-t-accent'
  };
  
  return (
    <div className="flex flex-col items-center justify-center">
      <motion.div
        className={`${sizeMap[size]} rounded-full border-4 ${colorMap[color as keyof typeof colorMap]}`}
        animate={{ rotate: 360 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
      />
      
      {text && !useAnimatedText && (
        <motion.p 
          className="mt-3 text-muted-foreground text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {text}
        </motion.p>
      )}
      
      {useAnimatedText && (
        <div className="mt-3 flex items-center">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-muted-foreground text-sm"
          >
            Loading
          </motion.span>
          <motion.span
            key={examTypes[currentExamType]}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="ml-1 text-sm font-medium text-primary"
          >
            {examTypes[currentExamType]}
          </motion.span>
        </div>
      )}
    </div>
  );
};

export default LoadingSpinner;
