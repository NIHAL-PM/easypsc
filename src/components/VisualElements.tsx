import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface VisualElementsProps {
  variant?: 'default' | 'minimal';
}

const VisualElements = ({ variant = 'default' }: VisualElementsProps) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const mouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", mouseMove);

    return () => {
      window.removeEventListener("mousemove", mouseMove);
    };
  }, []);

  const isMinimal = variant === 'default'; // Fixed comparison logic
  const shouldShow = isVisible && !isMinimal;

  return (
    <>
      {shouldShow && (
        <motion.div
          className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 rounded-full blur-3xl pointer-events-none"
          style={{
            x: mousePosition.x - window.innerWidth / 2,
            y: mousePosition.y - window.innerHeight / 2,
          }}
          animate={{ opacity: isVisible ? 1 : 0 }}
          transition={{ duration: 0.5 }}
        />
      )}
    </>
  );
};

export default VisualElements;
