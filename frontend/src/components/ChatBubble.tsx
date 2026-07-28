<<<<<<< HEAD
import { motion } from 'framer-motion';
=======
import React from 'react';
import { motion } from 'framer-motion';
import { Volume2, VolumeX } from 'lucide-react';
>>>>>>> 5f8c52a2a79f075aeeb064756d298fcea307a590

interface ChatBubbleProps {
  role: 'user' | 'assistant';
  message: string;
<<<<<<< HEAD
}

const bubbleStyles = {
  user: 'ml-auto rounded-bl-3xl rounded-tl-3xl rounded-tr-3xl bg-sky-500/15 text-sky-100 border border-sky-500/30',
  assistant: 'mr-auto rounded-br-3xl rounded-tl-3xl rounded-tr-3xl bg-slate-800/90 text-slate-100 border border-slate-700/80',
};

export default function ChatBubble({ role, message }: ChatBubbleProps) {
=======
  onSpeak?: () => void;
  isSpeaking?: boolean;
}

export default function ChatBubble({ role, message, onSpeak, isSpeaking = false }: ChatBubbleProps) {
  const isUser = role === 'user';

>>>>>>> 5f8c52a2a79f075aeeb064756d298fcea307a590
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
<<<<<<< HEAD
      transition={{ duration: 0.25 }}
      className={`max-w-[90%] whitespace-pre-line px-5 py-4 shadow-lg ${bubbleStyles[role]}`}
    >
      {message}
=======
      transition={{ duration: 0.28, ease: 'easeOut' }}
      className={`relative max-w-[85%] px-5 py-3.5 text-sm leading-7 shadow-sm ${
        isUser
          ? 'ml-auto rounded-[24px] rounded-br-md bg-gradient-to-br from-primary to-accent dark:from-accent dark:to-primary-light text-white shadow-md shadow-primary/10'
          : 'mr-auto rounded-[24px] rounded-bl-md border border-slate-200/80 bg-white/95 text-slate-800 dark:border-slate-800/80 dark:bg-slate-900/90 dark:text-slate-100 pb-9'
      }`}
    >
      <div className="whitespace-pre-line">{message}</div>
      
      {!isUser && onSpeak && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSpeak();
          }}
          type="button"
          title={isSpeaking ? 'Mute response' : 'Read response aloud'}
          className={`absolute bottom-2 right-3 p-1.5 rounded-lg border transition-all duration-150 flex items-center gap-1.5 text-[9px] font-bold tracking-wider uppercase ${
            isSpeaking 
              ? 'text-primary dark:text-secondary border-primary/20 dark:border-secondary/20 bg-primary/5 dark:bg-secondary/5' 
              : 'text-slate-400 hover:text-slate-700 dark:hover:text-white border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40'
          }`}
        >
          {isSpeaking ? (
            <>
              <VolumeX size={11} className="shrink-0" />
              <span>Mute</span>
            </>
          ) : (
            <>
              <Volume2 size={11} className="shrink-0" />
              <span>Speak</span>
            </>
          )}
        </button>
      )}
>>>>>>> 5f8c52a2a79f075aeeb064756d298fcea307a590
    </motion.div>
  );
}
