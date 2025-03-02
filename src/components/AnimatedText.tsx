
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface AnimatedTextProps {
  prefix?: string;
  examTypes?: string[];
  className?: string;
  prefixClassName?: string;
  textClassName?: string;
  direction?: 'vertical' | 'horizontal';
  interval?: number;
}

const defaultExamTypes = ['UPSC', 'SSC', 'PSC', 'KPSC', 'BPSC'];

const AnimatedText = ({
  prefix = "Easy",
  examTypes = defaultExamTypes,
  className = "flex items-center justify-center",
  prefixClassName = "text-3xl font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent",
  textClassName = "text-3xl font-bold text-primary ml-1",
  direction = 'vertical',
  interval = 3000
}: AnimatedTextProps) => {
  const [currentExamType, setCurrentExamType] = useState(0);
  
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentExamType((prev) => (prev + 1) % examTypes.length);
    }, interval);
    
    return () => clearInterval(intervalId);
  }, [examTypes.length, interval]);
  
  return (
    <div className={className}>
      <h1 className={prefixClassName}>
        {prefix}
      </h1>
      <motion.div
        key={examTypes[currentExamType]}
        initial={{ opacity: 0, y: direction === 'vertical' ? 20 : 0, x: direction === 'horizontal' ? 20 : 0 }}
        animate={{ 
          opacity: 1, 
          y: 0, 
          x: 0,
          transition: {
            type: "spring",
            stiffness: 260,
            damping: 20
          }
        }}
        exit={{ opacity: 0, y: direction === 'vertical' ? -20 : 0, x: direction === 'horizontal' ? -20 : 0 }}
        transition={{ duration: 0.3 }}
        className={textClassName}
      >
        {examTypes[currentExamType]}
      </motion.div>
    </div>
  );
};

export default AnimatedText;
