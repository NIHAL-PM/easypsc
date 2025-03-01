
import { motion } from 'framer-motion';

type LoadingSpinnerProps = {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  text?: string;
};

const LoadingSpinner = ({ 
  size = 'md', 
  color = 'primary',
  text = 'Loading...'
}: LoadingSpinnerProps) => {
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
      {text && (
        <motion.p 
          className="mt-3 text-muted-foreground text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {text}
        </motion.p>
      )}
    </div>
  );
};

export default LoadingSpinner;
