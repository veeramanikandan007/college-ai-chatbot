import { motion } from 'framer-motion';

interface ChatBubbleProps {
  role: 'user' | 'assistant';
  message: string;
}

const bubbleStyles = {
  user: 'ml-auto rounded-bl-3xl rounded-tl-3xl rounded-tr-3xl bg-sky-500/15 text-sky-100 border border-sky-500/30',
  assistant: 'mr-auto rounded-br-3xl rounded-tl-3xl rounded-tr-3xl bg-slate-800/90 text-slate-100 border border-slate-700/80',
};

export default function ChatBubble({ role, message }: ChatBubbleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`max-w-[90%] whitespace-pre-line px-5 py-4 shadow-lg ${bubbleStyles[role]}`}
    >
      {message}
    </motion.div>
  );
}
