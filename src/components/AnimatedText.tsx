
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const examTypes = ['UPSC', 'SSC', 'PSC', 'KPSC', 'BPSC'];

const AnimatedText = () => {
  const [currentExamType, setCurrentExamType] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentExamType((prev) => (prev + 1) % examTypes.length);
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="flex items-center justify-center">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
        Easy
      </h1>
      <motion.div
        key={examTypes[currentExamType]}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="text-3xl font-bold text-primary ml-1"
      >
        {examTypes[currentExamType]}
      </motion.div>
    </div>
  );
};

export default AnimatedText;
