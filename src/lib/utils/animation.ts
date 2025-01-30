import { Variants } from 'framer-motion';

export const fadeInVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 }
};

export const slideInVariants: Variants = {
  initial: { x: -20, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: 20, opacity: 0 }
};

export const buttonVariants: Variants = {
  initial: { scale: 0.95, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  hover: { scale: 1.05 },
  tap: { scale: 0.95 }
};

export const statusBadgeVariants: Variants = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  hover: { scale: 1.05 },
  tap: { scale: 0.95 },
  exit: { scale: 0.8, opacity: 0 }
};

export const springTransition = {
  type: "spring",
  stiffness: 500,
  damping: 30
};

export const easeTransition = {
  type: "ease",
  duration: 0.3
}; 