import React from 'react';
import { motion } from 'framer-motion';
import { Volume2, VolumeX } from 'lucide-react';

interface ChatBubbleProps {
  role: 'user' | 'assistant';
  message: string;
  onSpeak?: () => void;
  isSpeaking?: boolean;
}

export default function ChatBubble({ role, message, onSpeak, isSpeaking = false }: ChatBubbleProps) {
  const isUser = role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
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
    </motion.div>
  );
}
