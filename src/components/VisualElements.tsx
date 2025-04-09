
import { useMemo } from 'react';
import { motion } from 'framer-motion';

interface VisualElementsProps {
  type?: 'default' | 'minimal' | 'intense';
  color?: 'indigo' | 'purple' | 'pink' | 'gradient';
  density?: 'low' | 'medium' | 'high';
}

const VisualElements = ({ 
  type = 'default', 
  color = 'gradient', 
  density = 'medium' 
}: VisualElementsProps) => {
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
    const countMap: Record<string, number> = { 
      'minimal': 2, 
      'default': 4, 
      'intense': 6 
    };
    
    const densityMultiplier: Record<string, number> = { 'low': 0.7, 'medium': 1, 'high': 1.5 };
    const count = Math.floor(countMap[type] * densityMultiplier[density]);
    
    return Array.from({ length: count }).map((_, i) => ({
      id: `blob-${i}`,
      size: randomPosition(150, 350),
      top: randomPosition(-50, 100),
      left: randomPosition(-50, 100),
      delay: i * 0.2,
      duration: randomPosition(20, 40),
      rotate: randomPosition(0, 360),
    }));
  }, [type, density]);
  
  const particles = useMemo(() => {
    if (type === 'minimal') return [];
    
    const countMap: Record<string, number> = { 'default': 10, 'intense': 20 };
    // Fix the type comparison here - don't compare type values directly, use a conditional
    const count = Math.floor(countMap[type === 'minimal' ? 'default' : type] * densityMultiplier[density]);
    
    return Array.from({ length: count }).map((_, i) => ({
      id: `particle-${i}`,
      size: randomPosition(2, 6),
      top: randomPosition(10, 90),
      left: randomPosition(10, 90),
      delay: i * 0.1,
      duration: randomPosition(15, 25),
    }));
  }, [type, density]);
  
  // Generate decorative shapes
  const shapes = useMemo(() => {
    if (type === 'minimal') return [];
    
    const count = type === 'intense' ? 4 : 2;
    return Array.from({ length: count }).map((_, i) => ({
      id: `shape-${i}`,
      shape: i % 3 === 0 ? 'circle' : i % 3 === 1 ? 'triangle' : 'square',
      size: randomPosition(30, 60),
      top: randomPosition(10, 90),
      left: randomPosition(10, 95),
      rotation: randomPosition(0, 360),
      delay: i * 0.3,
      duration: randomPosition(25, 40),
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
          initial={{ 
            scale: 0.8, 
            opacity: 0.05,
            rotate: blob.rotate
          }}
          animate={{ 
            scale: [0.8, 1.2, 0.8],
            opacity: [0.05, 0.15, 0.05],
            x: [0, 30, 0],
            y: [0, -30, 0],
            rotate: [blob.rotate, blob.rotate + 45, blob.rotate]
          }}
          transition={{
            duration: blob.duration,
            repeat: Infinity,
            delay: blob.delay,
            ease: "easeInOut"
          }}
        />
      ))}
      
      {/* Floating particles */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            width: particle.size,
            height: particle.size,
            top: `${particle.top}%`,
            left: `${particle.left}%`,
            background: `linear-gradient(135deg, rgba(255,255,255,0.8), rgba(255,255,255,0.2))`,
            opacity: 0.3,
          }}
          animate={{ 
            y: [0, -20, 0],
            opacity: [0.1, 0.3, 0.1],
            scale: [0.8, 1.2, 0.8]
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: "easeInOut"
          }}
        />
      ))}
      
      {/* Decorative shapes */}
      {shapes.map((shape) => {
        // Create shape based on type
        const ShapeComponent = () => {
          switch (shape.shape) {
            case 'circle':
              return (
                <div 
                  className="rounded-full border-2 border-white/10 dark:border-white/5"
                  style={{ width: shape.size, height: shape.size }}
                />
              );
            case 'triangle':
              return (
                <div 
                  className="border-2 border-white/10 dark:border-white/5"
                  style={{ 
                    width: 0, 
                    height: 0, 
                    borderLeft: `${shape.size/2}px solid transparent`,
                    borderRight: `${shape.size/2}px solid transparent`,
                    borderBottom: `${shape.size}px solid rgba(255,255,255,0.05)`
                  }}
                />
              );
            case 'square':
            default:
              return (
                <div 
                  className="border-2 border-white/10 dark:border-white/5"
                  style={{ width: shape.size, height: shape.size }}
                />
              );
          }
        };
        
        return (
          <motion.div
            key={shape.id}
            className="absolute opacity-30"
            style={{
              top: `${shape.top}%`,
              left: `${shape.left}%`,
              transform: `rotate(${shape.rotation}deg)`,
            }}
            animate={{ 
              rotate: [shape.rotation, shape.rotation + 180, shape.rotation],
              scale: [1, 1.1, 1],
              opacity: [0.1, 0.2, 0.1]
            }}
            transition={{
              duration: shape.duration,
              repeat: Infinity,
              delay: shape.delay,
              ease: "easeInOut"
            }}
          >
            <ShapeComponent />
          </motion.div>
        );
      })}
      
      {/* Grid overlay for texture */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.15) 1px, transparent 0)`,
          backgroundSize: '30px 30px',
        }}
      />
      
      {/* Light beams for intense mode */}
      {type === 'intense' && (
        <>
          <div className="absolute top-0 left-1/4 w-[200px] h-[60vh] bg-gradient-to-b from-primary/5 to-transparent opacity-30 blur-3xl transform rotate-15"></div>
          <div className="absolute bottom-0 right-1/4 w-[200px] h-[60vh] bg-gradient-to-t from-secondary/5 to-transparent opacity-30 blur-3xl transform -rotate-15"></div>
        </>
      )}
    </div>
  );
};

export default VisualElements;
