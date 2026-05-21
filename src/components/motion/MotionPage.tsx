import { motion, useReducedMotion } from 'motion/react';
import type { ReactNode } from 'react';
import { fadeLift, reducedMotionTransition, spring } from '../../lib/motion/presets';

interface MotionPageProps {
  children: ReactNode;
}

export function MotionPage({ children }: MotionPageProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      variants={prefersReducedMotion ? undefined : fadeLift}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={reducedMotionTransition(prefersReducedMotion, spring.gentle)}
      className="motion-page"
    >
      {children}
    </motion.div>
  );
}
