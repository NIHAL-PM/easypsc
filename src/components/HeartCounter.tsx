
import React, { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface HeartCounterProps {
  count: number;
  animate?: boolean;
}

const HeartCounter: React.FC<HeartCounterProps> = ({ count, animate = false }) => {
  const [showAnimation, setShowAnimation] = useState(false);
  
  useEffect(() => {
    if (animate) {
      setShowAnimation(true);
      const timer = setTimeout(() => {
        setShowAnimation(false);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [animate, count]);
  
  return (
    <div className="flex items-center gap-1 bg-rose-50 dark:bg-rose-950/20 px-3 py-1 rounded-full">
      <Heart className="h-4 w-4 text-rose-500 fill-rose-500" />
      <span className="text-rose-600 dark:text-rose-400 font-medium">
        {count}
      </span>
      
      <AnimatePresence>
        {showAnimation && (
          <motion.div 
            initial={{ scale: 0, y: 10, opacity: 0 }}
            animate={{ scale: 1, y: -20, opacity: 1 }}
            exit={{ scale: 0, y: -40, opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute -top-4 left-1/2 transform -translate-x-1/2"
          >
            <div className="flex items-center gap-1 bg-rose-100 dark:bg-rose-950/50 px-2 py-0.5 rounded-full text-xs text-rose-600 dark:text-rose-400 shadow-md">
              <Heart className="h-3 w-3 text-rose-500 fill-rose-500" />
              <span>+1</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HeartCounter;
