import React from 'react';
import { Mic, BrainCircuit, Volume2, MicOff, Sparkles } from 'lucide-react';

export type AssistantVoiceState = 'IDLE' | 'WAKING' | 'LISTENING' | 'PROCESSING' | 'SPEAKING';

interface WakeStatusBannerProps {
  state: AssistantVoiceState;
  onStopListening: () => void;
}

export default function WakeStatusBanner({ state, onStopListening }: WakeStatusBannerProps) {
  if (state === 'IDLE') return null;

  return (
    <div className="flex items-center justify-between px-6 py-3 border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/25 transition-all duration-300 animate-fade-in">
      <div className="flex items-center gap-3">
        {state === 'WAKING' && (
          <>
            <div className="w-2.5 h-2.5 rounded-full bg-secondary pulse-gold shrink-0" />
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              Hands-Free Assistant Active. Say <strong className="text-primary dark:text-secondary">"Hey CollegeMate"</strong> or <strong className="text-primary dark:text-secondary">"Hello CollegeMate"</strong>.
            </span>
          </>
        )}
        {state === 'LISTENING' && (
          <>
            <div className="relative w-2.5 h-2.5 shrink-0">
              <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-75" />
              <span className="relative inline-block w-2.5 h-2.5 rounded-full bg-red-500" />
            </div>
            <span className="text-xs font-bold text-red-500 dark:text-secondary">
              Hearing query... Speak now.
            </span>
          </>
        )}
        {state === 'PROCESSING' && (
          <>
            <BrainCircuit size={14} className="text-primary dark:text-secondary animate-spin shrink-0" />
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              Searching Mount Zion College documents...
            </span>
          </>
        )}
        {state === 'SPEAKING' && (
          <>
            <Volume2 size={14} className="text-primary dark:text-secondary animate-bounce shrink-0" />
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              Speaking response...
            </span>
          </>
        )}
      </div>

      <button
        onClick={onStopListening}
        title="Turn off hands-free voice control"
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-[10px] font-extrabold tracking-wider uppercase text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 transition"
      >
        <MicOff size={11} />
        Stop Listening
      </button>
    </div>
  );
}
