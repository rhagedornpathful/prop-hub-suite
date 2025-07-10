import { motion } from "framer-motion";

interface AnimatedListProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

const item = {
  hidden: { 
    opacity: 0, 
    y: 20,
    scale: 0.95
  },
  show: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      damping: 20,
      stiffness: 100
    }
  }
};

export function AnimatedList({ children, className, staggerDelay = 0.1 }: AnimatedListProps) {
  return (
    <motion.div
      variants={{
        ...container,
        show: {
          ...container.show,
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: 0.1
          }
        }
      }}
      initial="hidden"
      animate="show"
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function AnimatedListItem({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      variants={item}
      whileHover={{ 
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.98 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}