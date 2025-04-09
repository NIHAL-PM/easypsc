
import { useMemo } from 'react';
import { motion } from 'framer-motion';

interface VisualElementsProps {
  type?: 'default' | 'minimal' | 'intense';
  color?: 'indigo' | 'purple' | 'pink' | 'gradient';
}

const VisualElements = ({ type = 'default', color = 'gradient' }: VisualElementsProps) => {
  const getColor = (colorName: string, opacity: number = 0.3) => {
    switch (colorName) {
      case 'indigo':
        return `rgba(99, 102, 241, ${opacity})`;
      case 'purple':
        return `rgba(168, 85, 247, ${opacity})`;
      case 'pink':
        return `rgba(236, 72, 153, ${opacity})`;
      case 'gradient':
      default:
        return 'linear-gradient(135deg, rgba(99, 102, 241, 0.5), rgba(168, 85, 247, 0.5), rgba(236, 72, 153, 0.5))';
    }
  };
  
  // Generate random position within constraints
  const randomPosition = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1) + min);
  };
  
  // Compute blob positions and animations only once
  const blobs = useMemo(() => {
    const count = type === 'minimal' ? 2 : type === 'intense' ? 6 : 4;
    return Array.from({ length: count }).map((_, i) => ({
      id: `blob-${i}`,
      size: randomPosition(150, 350),
      top: randomPosition(-50, 100),
      left: randomPosition(-50, 100),
      delay: i * 0.2,
      duration: randomPosition(20, 40),
    }));
  }, [type]);
  
  const particles = useMemo(() => {
    if (type !== 'intense') return [];
    return Array.from({ length: 20 }).map((_, i) => ({
      id: `particle-${i}`,
      size: randomPosition(2, 6),
      top: randomPosition(10, 90),
      left: randomPosition(10, 90),
      delay: i * 0.1,
      duration: randomPosition(15, 25),
    }));
  }, [type]);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-background opacity-80"></div>
      
      {/* Animated blobs */}
      {blobs.map((blob) => (
        <motion.div
          key={blob.id}
          className="absolute rounded-full opacity-10 filter blur-3xl"
          style={{
            background: typeof color === 'string' ? getColor(color) : getColor('gradient'),
            width: blob.size,
            height: blob.size,
            top: `${blob.top}%`,
            left: `${blob.left}%`,
          }}
          initial={{ scale: 0.8, opacity: 0.05 }}
          animate={{ 
            scale: [0.8, 1.2, 0.8],
            opacity: [0.05, 0.15, 0.05],
            x: [0, 30, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: blob.duration,
            repeat: Infinity,
            delay: blob.delay,
            ease: "easeInOut"
          }}
        />
      ))}
      
      {/* Floating particles for intense mode */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-white dark:bg-indigo-400"
          style={{
            width: particle.size,
            height: particle.size,
            top: `${particle.top}%`,
            left: `${particle.left}%`,
            opacity: 0.3,
          }}
          animate={{ 
            y: [0, -20, 0],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: "easeInOut"
          }}
        />
      ))}
      
      {/* Grid overlay for texture */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.15) 1px, transparent 0)`,
          backgroundSize: '30px 30px',
        }}
      />
    </div>
  );
};

export default VisualElements;
