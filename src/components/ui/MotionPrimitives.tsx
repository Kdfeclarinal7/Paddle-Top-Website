import React from 'react';
import { motion, useReducedMotion } from 'motion/react';

interface BlurFadeProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  yOffset?: number;
  inView?: boolean;
  blur?: string;
  once?: boolean;
}

/**
 * BlurFade: Clean entrance transition with subtle vertical movement, opacity, and light blur resolution.
 * Adapted from Magic UI Blur Fade using Motion for React.
 */
export const BlurFade: React.FC<BlurFadeProps> = ({
  children,
  className = '',
  delay = 0,
  duration = 0.45,
  yOffset = 16,
  inView = true,
  blur = '6px',
  once = true,
}) => {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  const initial = {
    opacity: 0,
    y: yOffset,
    filter: `blur(${blur})`,
  };

  const animate = {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
  };

  const transition = {
    duration,
    delay,
    ease: [0.21, 0.47, 0.32, 0.98] as const,
  };

  if (inView) {
    return (
      <motion.div
        initial={initial}
        whileInView={animate}
        viewport={{ once, margin: '-40px' }}
        transition={transition}
        className={className}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={initial}
      animate={animate}
      transition={transition}
      className={className}
    >
      {children}
    </motion.div>
  );
};

interface TextEffectProps {
  children: string;
  className?: string;
  delay?: number;
  wordDelay?: number;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
}

/**
 * TextEffect: Words reveal with subtle vertical slide and light blur resolving to crisp.
 * Staggers by word (50–70ms), avoiding character-by-character distraction.
 * Adapted from Motion Primitives TextEffect / Magic UI Text Animate using Motion for React.
 */
export const TextEffect: React.FC<TextEffectProps> = ({
  children,
  className = '',
  delay = 0,
  wordDelay = 0.06,
  as: Component = 'h1',
}) => {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    const Tag = Component;
    return <Tag className={className}>{children}</Tag>;
  }

  const words = children.split(' ');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: delay,
        staggerChildren: wordDelay,
      },
    },
  };

  const wordVariants = {
    hidden: {
      opacity: 0,
      y: 14,
      filter: 'blur(5px)',
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        duration: 0.4,
        ease: [0.2, 0.65, 0.3, 0.9] as const,
      },
    },
  };

  const MotionComponent = motion[Component] as any;

  return (
    <MotionComponent
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {words.map((word, idx) => (
        <motion.span
          key={`${word}-${idx}`}
          variants={wordVariants}
          className="inline-block whitespace-nowrap mr-[0.25em]"
        >
          {word}
        </motion.span>
      ))}
    </MotionComponent>
  );
};

interface AnimatedGroupProps {
  children: React.ReactNode;
  className?: string;
  stagger?: number;
  delay?: number;
  once?: boolean;
}

/**
 * AnimatedGroup: Coordinated stagger container for card grids and sequential elements.
 * Adapted from Motion Primitives AnimatedGroup using Motion for React.
 */
export const AnimatedGroup: React.FC<AnimatedGroupProps> = ({
  children,
  className = '',
  stagger = 0.08,
  delay = 0.1,
  once = true,
}) => {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: delay,
        staggerChildren: stagger,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: '-50px' }}
      className={className}
    >
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;

        const itemVariants = {
          hidden: { opacity: 0, y: 18 },
          visible: {
            opacity: 1,
            y: 0,
            transition: {
              duration: 0.4,
              ease: [0.21, 0.47, 0.32, 0.98] as const,
            },
          },
        };

        return <motion.div variants={itemVariants}>{child}</motion.div>;
      })}
    </motion.div>
  );
};
