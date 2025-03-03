
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import { GraduationCap } from 'lucide-react';

const examTypes = ['UPSC', 'SSC', 'PSC', 'KPSC', 'BPSC'];

const AnimatedLogo = () => {
  const [currentExamType, setCurrentExamType] = useState(0);
  const { user } = useAppStore();
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentExamType((prev) => (prev + 1) % examTypes.length);
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="flex flex-col items-center justify-center py-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center"
      >
        <div className="relative">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
            Easy
          </h1>
          <div className="absolute -bottom-1 left-0 h-0.5 w-full bg-gradient-to-r from-violet-600 to-purple-600 rounded-full"></div>
        </div>
        
        <motion.div
          key={examTypes[currentExamType]}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="text-4xl font-bold text-violet-800 dark:text-violet-300 ml-2"
        >
          {examTypes[currentExamType]}
        </motion.div>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="text-muted-foreground mt-2 text-center flex items-center justify-center gap-2"
      >
        <GraduationCap className="w-4 h-4 text-violet-500" />
        <span>Your AI-Powered Question Bank for Competitive Exams</span>
      </motion.div>
    </div>
  );
};

export default AnimatedLogo;
