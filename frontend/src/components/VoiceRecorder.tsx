import React from 'react';
import { X, Check, Mic } from 'lucide-react';

interface VoiceRecorderProps {
  duration: number;
  onCancel: () => void;
  onStop: () => void;
}

export default function VoiceRecorder({ duration, onCancel, onStop }: VoiceRecorderProps) {
  // Format duration (in seconds) to MM:SS
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-between rounded-2xl border border-primary/20 dark:border-secondary/20 bg-white/95 dark:bg-slate-950/95 px-6 py-4 shadow-lg backdrop-blur-xl animate-fade-in transition-all duration-300">
      
      {/* Listening status & pulsing icon */}
      <div className="flex items-center gap-4">
        <div className="relative flex items-center justify-center w-12 h-12">
          {/* Animated pulsing ripple rings */}
          <div className="absolute inset-0 rounded-full bg-red-500/20 dark:bg-secondary/20 ripple-ring-1" />
          <div className="absolute inset-0 rounded-full bg-red-500/10 dark:bg-secondary/10 ripple-ring-2" />
          <div className="absolute inset-0 rounded-full bg-red-500/5 dark:bg-secondary/5 ripple-ring-3" />
          
          {/* Microphone core */}
          <div className="relative z-10 flex items-center justify-center w-8 h-8 rounded-full bg-red-500 dark:bg-secondary text-white dark:text-slate-950">
            <Mic size={16} className="animate-pulse" />
          </div>
        </div>
        
        <div>
          <p className="text-sm font-bold text-red-500 dark:text-secondary animate-pulse flex items-center gap-1.5">
            Listening...
          </p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">
            Speak clearly. Press Space/Esc to control.
          </p>
        </div>
      </div>

      {/* Waveform Visualization */}
      <div className="flex items-end gap-1 h-6">
        <div className="w-1 bg-primary dark:bg-secondary rounded-full wave-bar wave-bar-1 h-4" />
        <div className="w-1 bg-primary dark:bg-secondary rounded-full wave-bar wave-bar-2 h-6" />
        <div className="w-1 bg-accent dark:bg-secondary rounded-full wave-bar wave-bar-3 h-3" />
        <div className="w-1 bg-accent dark:bg-secondary rounded-full wave-bar wave-bar-4 h-5" />
        <div className="w-1 bg-primary dark:bg-secondary rounded-full wave-bar wave-bar-5 h-2" />
        <div className="w-1 bg-primary dark:bg-secondary rounded-full wave-bar wave-bar-6 h-6" />
        <div className="w-1 bg-accent dark:bg-secondary rounded-full wave-bar wave-bar-7 h-4" />
        <div className="w-1 bg-accent dark:bg-secondary rounded-full wave-bar wave-bar-8 h-3" />
      </div>

      {/* Control Buttons & Timer */}
      <div className="flex items-center gap-4">
        {/* Timer */}
        <span className="font-mono text-sm font-bold text-slate-800 dark:text-slate-200">
          {formatTime(duration)}
        </span>

        {/* Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            title="Cancel recording (Esc)"
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-95"
          >
            <X size={16} />
          </button>
          
          <button
            type="button"
            onClick={onStop}
            title="Finish and send (Space)"
            className="p-2.5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md hover:scale-105 transition active:scale-95"
          >
            <Check size={16} />
          </button>
        </div>
      </div>

    </div>
  );
}
