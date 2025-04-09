
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import { GraduationCap, BookOpen, Star } from 'lucide-react';

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
        className="relative flex items-center"
      >
        {/* Logo decorative elements */}
        <motion.div
          className="absolute -left-6 -top-6"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
        </motion.div>
        
        <motion.div
          className="absolute -right-6 -bottom-4"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          <Star className="h-4 w-4 text-indigo-400 fill-indigo-400" />
        </motion.div>
        
        <div className="relative">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Easy
          </h1>
          <div className="absolute -bottom-1 left-0 h-0.5 w-full bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full"></div>
        </div>
        
        <motion.div
          key={examTypes[currentExamType]}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="text-4xl font-bold text-indigo-800 dark:text-indigo-300 ml-2"
        >
          {examTypes[currentExamType]}
        </motion.div>
        
        <motion.div 
          className="absolute -right-10 top-0"
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 backdrop-blur-sm flex items-center justify-center">
            <BookOpen className="h-4 w-4 text-indigo-500" />
          </div>
        </motion.div>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="text-muted-foreground mt-2 text-center flex items-center justify-center gap-2 relative"
      >
        <GraduationCap className="w-4 h-4 text-indigo-500" />
        <span>Your AI-Powered Question Bank for Competitive Exams</span>
        
        {/* Decorative shine effect */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          initial={{ x: -200, opacity: 0 }}
          animate={{ x: 200, opacity: 0.5 }}
          transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 5 }}
        />
      </motion.div>
    </div>
  );
};

export default AnimatedLogo;
