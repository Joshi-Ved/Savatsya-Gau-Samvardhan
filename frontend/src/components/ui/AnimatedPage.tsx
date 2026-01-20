import { motion } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';

interface AnimatedPageProps {
  children: React.ReactNode;
  className?: string;
}

const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.98,
  },
  in: {
    opacity: 1,
    y: 0,
    scale: 1,
  },
  out: {
    opacity: 0,
    y: -20,
    scale: 1.02,
  },
};

const pageTransition = {
  type: 'tween' as const,
  ease: 'anticipate' as const,
  duration: 0.4,
};

const AnimatedPage: React.FC<AnimatedPageProps> = ({ children, className = '' }) => {
  const { config } = useTheme();
  const shouldAnimate = config.animations;

  if (!shouldAnimate) {
    return <div className={`w-full ${className}`}>{children}</div>;
  }

  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      className={`w-full ${className}`}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedPage;
