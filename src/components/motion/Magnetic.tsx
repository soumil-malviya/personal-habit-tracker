import { motion, useMotionValue, useReducedMotion, useSpring } from 'motion/react';
import type { ReactNode } from 'react';
import { spring } from '../../lib/motion/presets';

interface MagneticProps {
  children: ReactNode;
  className?: string;
  strength?: number;
}

export function Magnetic({ children, className, strength = 0.18 }: MagneticProps) {
  const prefersReducedMotion = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, spring.snappy);
  const springY = useSpring(y, spring.snappy);

  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      className={className}
      style={prefersReducedMotion ? undefined : { x: springX, y: springY }}
      onPointerMove={(event) => {
        if (prefersReducedMotion) return;
        const bounds = event.currentTarget.getBoundingClientRect();
        x.set((event.clientX - bounds.left - bounds.width / 2) * strength);
        y.set((event.clientY - bounds.top - bounds.height / 2) * strength);
      }}
      onPointerLeave={reset}
      onPointerCancel={reset}
    >
      {children}
    </motion.div>
  );
}
