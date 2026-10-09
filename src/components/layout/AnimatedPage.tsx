import { type ReactNode } from 'react';
import { motion } from 'framer-motion';

interface AnimatedPageProps {
  children: ReactNode;
  className?: string;
}

const pageVariants = {
  initial: { opacity: 0, y: 16, filter: 'blur(3px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  exit: { opacity: 0, y: -16, filter: 'blur(3px)' },
};

export function AnimatedPage({ children, className = '' }: AnimatedPageProps) {
  return (
    <motion.div
      className={className}
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
    >
      {children}
    </motion.div>
  );
}
