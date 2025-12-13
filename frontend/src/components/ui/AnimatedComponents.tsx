import React from 'react';
import { motion, MotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';

interface AnimatedButtonProps extends MotionProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  delay?: number;
  asChild?: boolean;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}

const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  onClick,
  delay = 0,
  asChild = false,
  type = 'button',
  disabled = false,
  ...motionProps
}) => {
  const { config } = useTheme();
  const shouldAnimate = config.animations;

  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';

  const variantClasses = {
    primary: 'bg-sawatsya-earth hover:bg-sawatsya-wood text-white',
    secondary: 'bg-sawatsya-sand hover:bg-sawatsya-amber text-sawatsya-wood',
    ghost: 'hover:bg-sawatsya-cream text-sawatsya-wood',
  };

  const sizeClasses = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4 py-2',
    lg: 'h-12 px-6 text-lg',
  };

  const combinedClasses = cn(
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    disabled && 'opacity-50 cursor-not-allowed',
    className
  );

  if (!shouldAnimate) {
    return (
      <button
        type={type}
        disabled={disabled}
        className={combinedClasses}
        onClick={onClick}
      >
        {children}
      </button>
    );
  }

  return (
    <motion.button
      type={type}
      disabled={disabled}
      className={combinedClasses}
      onClick={onClick}
      whileHover={{
        scale: 1.05,
        boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
      }}
      whileTap={{
        scale: 0.95,
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 20,
        delay,
      }}
      {...motionProps}
    >
      {children}
    </motion.button>
  );
};

interface AnimatedCardProps extends MotionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  className = '',
  delay = 0,
  ...motionProps
}) => {
  const { config } = useTheme();
  const shouldAnimate = config.animations;

  const combinedClasses = cn(
    'rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden',
    className
  );

  if (!shouldAnimate) {
    return (
      <div className={combinedClasses}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      className={combinedClasses}
      initial={{
        opacity: 0,
        y: 50,
        scale: 0.9,
      }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
      }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 30,
        delay,
      }}
      whileHover={{
        y: -5,
        scale: 1.02,
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      }}
      {...motionProps}
    >
      {children}
    </motion.div>
  );
};

interface AnimatedTextProps extends MotionProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'h1' | 'h2' | 'h3' | 'p';
  delay?: number;
}

const AnimatedText: React.FC<AnimatedTextProps> = ({
  children,
  className = '',
  variant = 'p',
  delay = 0,
  ...motionProps
}) => {
  const { config } = useTheme();
  const shouldAnimate = config.animations;
  const Component = variant;

  if (!shouldAnimate) {
    return (
      <Component className={className}>
        {children}
      </Component>
    );
  }

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 30,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 30,
        delay,
      }}
      {...motionProps}
    >
      <Component className={className}>
        {children}
      </Component>
    </motion.div>
  );
};

interface FloatingElementProps {
  children: React.ReactNode;
  className?: string;
  duration?: number;
  yOffset?: number;
}

const FloatingElement: React.FC<FloatingElementProps> = ({
  children,
  className = '',
  duration = 3,
  yOffset = 10,
}) => {
  const { config } = useTheme();
  const shouldAnimate = config.animations;

  if (!shouldAnimate) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      animate={{
        y: [0, -yOffset, 0],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      {children}
    </motion.div>
  );
};

export { AnimatedButton, AnimatedCard, AnimatedText, FloatingElement };
