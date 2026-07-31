/**
 * CollegeMate AI — Animated Typing Dots Indicator
 * Shows animated 3-dot typing animation for AI "thinking" states
 */
import { motion } from 'framer-motion';
import { typingDotVariants } from '../../lib/animations';

interface TypingDotsProps {
  className?: string;
}

export function TypingDots({ className = '' }: TypingDotsProps) {
  return (
    <div className={`flex items-center gap-1.5 py-1 ${className}`} aria-label="AI is typing">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          variants={typingDotVariants}
          animate="animate"
          initial="initial"
          transition={{
            duration: 0.55,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'easeInOut',
            delay: i * 0.18,
          }}
          className="h-2 w-2 rounded-full bg-[#163D8C] dark:bg-secondary opacity-80"
        />
      ))}
    </div>
  );
}
