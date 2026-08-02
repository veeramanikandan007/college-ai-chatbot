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
      className="absolute inset-0 z-20 flex items-center justify-between rounded-2xl border border-red-500/30 dark:border-red-500/20 bg-white/95 dark:bg-slate-900/95 px-5 py-3 shadow-xl backdrop-blur-xl transition-all select-none"
    >
      {/* Listening Status & Pulsing Icon */}
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center w-10 h-10">
          <motion.div
            animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
            className="absolute inset-0 rounded-full bg-red-500/30 dark:bg-red-400/30"
          />
          <div className="relative z-10 flex items-center justify-center w-8 h-8 rounded-full bg-red-500 text-white shadow-md">
            <Mic size={16} />
          </div>
        </div>

        <div>
          <p className="text-xs font-bold text-red-600 dark:text-red-400 flex items-center gap-1.5">
            Listening to your speech…
          </p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">
            Press Check to finish or Esc to cancel.
          </p>
        </div>
      </div>

      {/* Dynamic Animated Waveform */}
      <div className="flex items-center gap-1 h-7 px-2">
        {waveHeights.map((heights, idx) => (
          <motion.div
            key={idx}
            animate={{ height: heights }}
            transition={{ repeat: Infinity, duration: 1.2, delay: idx * 0.1, ease: 'easeInOut' }}
            className="w-1 rounded-full bg-gradient-to-t from-red-500 to-amber-500"
          />
        ))}
      </div>

      {/* Control Buttons & Monospace Timer */}
      <div className="flex items-center gap-3">
        <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
          {formatTime(duration)}
        </span>

        <div className="flex items-center gap-1.5">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={onCancel}
            title="Cancel recording (Esc)"
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          >
            <X size={15} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={onStop}
            title="Finish and send (Space)"
            className="p-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-md transition"
          >
            <Check size={15} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
