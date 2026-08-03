import React from 'react';
import { motion } from 'framer-motion';
import { X, Check, Mic } from 'lucide-react';

interface VoiceRecorderProps {
  duration: number;
  onCancel: () => void;
  onStop: () => void;
}

export default function VoiceRecorder({ duration, onCancel, onStop }: VoiceRecorderProps) {
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const waveHeights = [
    [8, 24, 12, 28, 10],
    [20, 10, 26, 14, 22],
    [12, 28, 8, 20, 16],
    [26, 14, 22, 10, 28],
    [10, 22, 16, 26, 12],
    [24, 12, 28, 14, 20],
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.97 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="absolute inset-0 z-20 flex items-center justify-between
                 rounded-xl
                 border border-[#D1D5DB] dark:border-[#3F3F46]
                 bg-[#FFFFFF] dark:bg-[#181818]
                 px-5 py-3 shadow-lg select-none"
    >
      {/* Listening Status & Pulsing Icon */}
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center w-10 h-10">
          <motion.div
            animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0, 0.3] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
            className="absolute inset-0 rounded-full bg-[#111827] dark:bg-[#FFFFFF] opacity-20"
          />
          <div className="relative z-10 flex items-center justify-center w-8 h-8 rounded-[8px]
                          bg-[#111827] dark:bg-[#FFFFFF]
                          text-[#FFFFFF] dark:text-[#111111]">
            <Mic size={16} />
          </div>
        </div>

        <div>
          <p className="text-xs font-bold text-[#111827] dark:text-[#FAFAFA] uppercase tracking-wider">
            Listening…
          </p>
          <p className="text-[10px] text-[#6B7280] dark:text-[#A3A3A3]">
            Press Check to finish or Esc to cancel.
          </p>
        </div>
      </div>

      {/* Monochrome Waveform */}
      <div className="flex items-center gap-[3px] h-7 px-2">
        {waveHeights.map((heights, idx) => (
          <motion.div
            key={idx}
            animate={{ height: heights }}
            transition={{ repeat: Infinity, duration: 1.2, delay: idx * 0.1, ease: 'easeInOut' }}
            className="w-[3px] rounded-full bg-[#111827] dark:bg-[#FAFAFA] opacity-60"
          />
        ))}
      </div>

      {/* Controls & Timer */}
      <div className="flex items-center gap-3">
        <span className="font-mono text-xs font-bold
                         text-[#111827] dark:text-[#FAFAFA]
                         bg-[#F8FAFC] dark:bg-[#111111]
                         border border-[#E5E7EB] dark:border-[#2A2A2A]
                         px-2.5 py-1 rounded-[6px]">
          {formatTime(duration)}
        </span>

        <div className="flex items-center gap-1.5">
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            type="button" onClick={onCancel} title="Cancel (Esc)"
            className="p-2 rounded-[8px]
                       border border-[#D1D5DB] dark:border-[#3F3F46]
                       bg-[#F8FAFC] dark:bg-[#111111]
                       text-[#6B7280] dark:text-[#A3A3A3]
                       hover:bg-[#F9FAFB] dark:hover:bg-[#232323]
                       hover:text-[#111827] dark:hover:text-[#FAFAFA]
                       transition"
          >
            <X size={15} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            type="button" onClick={onStop} title="Finish (Space)"
            className="p-2 rounded-[8px]
                       bg-[#111827] dark:bg-[#FFFFFF]
                       text-[#FFFFFF] dark:text-[#111111]
                       hover:bg-[#1F2937] dark:hover:bg-[#F0F0F0]
                       transition shadow-sm"
          >
            <Check size={15} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
