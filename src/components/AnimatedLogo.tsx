
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
    <div className="relative flex flex-col items-center justify-center py-10 overflow-hidden">
      {/* Background blobs */}
      <div className="absolute w-64 h-64 bg-gradient-primary gradient-blob -top-20 -left-20 opacity-20"></div>
      <div className="absolute w-72 h-72 bg-gradient-secondary gradient-blob -bottom-32 -right-32 opacity-20"></div>
      
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="flex items-center relative z-10"
      >
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
          Easy
        </h1>
        <motion.div
          key={examTypes[currentExamType]}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="text-4xl md:text-5xl font-bold text-primary ml-1 relative"
        >
          {examTypes[currentExamType]}
          <div className="absolute -bottom-1 left-0 h-1 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full"></div>
        </motion.div>
      </motion.div>
      
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="text-muted-foreground mt-2 text-center max-w-md px-4"
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
          <motion.div 
            className="px-4 py-2 rounded-full bg-gradient-to-r from-indigo-500/10 to-purple-500/10 text-primary text-sm font-medium"
            animate={{ 
              boxShadow: ["0 0 0 rgba(124, 58, 237, 0)", "0 0 8px rgba(124, 58, 237, 0.5)", "0 0 0 rgba(124, 58, 237, 0)"] 
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Get started with 10 free questions every month
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default AnimatedLogo;
