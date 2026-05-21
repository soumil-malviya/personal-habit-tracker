import type { Transition, Variants } from 'motion/react';

export const spring = {
  soft: {
    type: 'spring',
    stiffness: 360,
    damping: 34,
    mass: 0.9,
  } satisfies Transition,
  gentle: {
    type: 'spring',
    stiffness: 260,
    damping: 30,
    mass: 1,
  } satisfies Transition,
  snappy: {
    type: 'spring',
    stiffness: 520,
    damping: 36,
    mass: 0.72,
  } satisfies Transition,
};

export const fadeLift: Variants = {
  initial: { opacity: 0, y: 10, filter: 'blur(8px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  exit: { opacity: 0, y: 8, filter: 'blur(6px)' },
};

export const liquidPanel: Variants = {
  initial: { opacity: 0, y: 12, scale: 0.97, filter: 'blur(10px)' },
  animate: { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' },
  exit: { opacity: 0, y: 8, scale: 0.98, filter: 'blur(8px)' },
};

export const listItem = {
  initial: { opacity: 0, x: 8 },
  animate: (index = 0) => ({
    opacity: 1,
    x: 0,
    transition: { ...spring.soft, delay: index * 0.025 },
  }),
} satisfies Variants;

export function reducedMotionTransition(enabled: boolean, fallback: Transition): Transition {
  return enabled ? { duration: 0.01 } : fallback;
}
