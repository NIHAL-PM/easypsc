
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '@/lib/store';

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
    <div className="flex flex-col items-center justify-center py-10">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="flex items-center"
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
          Easy
        </h1>
        <motion.div
          key={examTypes[currentExamType]}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="text-4xl font-bold text-primary ml-1"
        >
          {examTypes[currentExamType]}
        </motion.div>
      </motion.div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="text-muted-foreground mt-2 text-center"
      >
        Your AI-Powered Question Bank for Competitive Exams
      </motion.p>
      {!user && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-6"
        >
          <div className="px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
            Get started with 10 free questions every month
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default AnimatedLogo;
