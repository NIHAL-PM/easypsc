
import { Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface HeartCounterProps {
  count: number;
  animate?: boolean;
}

const HeartCounter = ({ count, animate = false }: HeartCounterProps) => {
  return (
    <div className="flex items-center">
      <AnimatePresence mode="wait">
        {animate && (
          <motion.div
            key="heart-animation"
            initial={{ scale: 1.5, y: 0, opacity: 1 }}
            animate={{ scale: 1, y: -20, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute"
          >
            <Heart className="w-6 h-6 text-rose-500 fill-rose-500" />
          </motion.div>
        )}
      </AnimatePresence>
      <div className="flex items-center gap-1 px-2 py-1 bg-rose-50 dark:bg-rose-950/20 rounded-full border border-rose-200 dark:border-rose-800/50">
        <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
        <span className="text-sm font-medium text-rose-600 dark:text-rose-400">
          {count}
        </span>
      </div>
    </div>
  );
};

export default HeartCounter;
