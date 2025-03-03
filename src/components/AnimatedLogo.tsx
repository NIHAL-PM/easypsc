
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import { GraduationCap, Award, CheckCircle } from 'lucide-react';

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
      {/* Background elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-56 h-56 bg-gradient-to-br from-violet-400/10 to-fuchsia-500/10 rounded-full blur-3xl animate-float-slow"></div>
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-gradient-to-br from-fuchsia-500/10 to-purple-400/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "-3s" }}></div>
      </div>
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
        className="flex items-center relative z-10"
      >
        <div className="relative group">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-violet-600 via-fuchsia-500 to-purple-600 bg-clip-text text-transparent transition-all duration-300 group-hover:from-violet-500 group-hover:via-fuchsia-400 group-hover:to-purple-500">
            Easy
          </h1>
          <div className="absolute -bottom-1 left-0 h-0.5 w-full bg-gradient-to-r from-violet-600 via-fuchsia-500 to-purple-600 rounded-full transform origin-left transition-all duration-300 group-hover:scale-x-110"></div>
        </div>
        
        <motion.div
          key={examTypes[currentExamType]}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4, type: "spring", stiffness: 200 }}
          className="text-4xl md:text-5xl font-bold text-violet-800 dark:text-violet-300 ml-2 relative"
        >
          {examTypes[currentExamType]}
          <motion.div 
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="absolute -bottom-1 left-0 h-0.5 w-full bg-gradient-to-r from-violet-600 via-fuchsia-500 to-purple-600 rounded-full transform origin-left"
          ></motion.div>
        </motion.div>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="text-muted-foreground mt-3 text-center max-w-md px-4 flex items-center justify-center gap-2"
      >
        <GraduationCap className="w-4 h-4 text-violet-500" />
        <span>Your AI-Powered Question Bank for Competitive Exams</span>
      </motion.div>
      
      {!user && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-6"
        >
          <motion.div 
            className="px-4 py-2 rounded-full bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 text-violet-700 dark:text-violet-300 text-sm font-medium flex items-center gap-2"
            animate={{ 
              boxShadow: ["0 0 0 rgba(139, 92, 246, 0)", "0 0 12px rgba(139, 92, 246, 0.3)", "0 0 0 rgba(139, 92, 246, 0)"] 
            }}
            transition={{ duration: 2.5, repeat: Infinity }}
          >
            <CheckCircle className="w-4 h-4" />
            <span>Get started with 10 free questions every month</span>
          </motion.div>
        </motion.div>
      )}
      
      {/* Decorative badge - only shown if the user exists */}
      {user && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, duration: 0.5, type: "spring" }}
          className="mt-6 flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-violet-100 to-fuchsia-100 border border-violet-200"
        >
          <Award className="w-4 h-4 text-violet-600" />
          <span className="text-xs font-medium text-violet-800">
            {user.examType} Aspirant
          </span>
        </motion.div>
      )}
    </div>
  );
};

export default AnimatedLogo;
