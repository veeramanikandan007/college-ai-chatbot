import React from 'react';
import { Mic, BrainCircuit, Volume2, MicOff } from 'lucide-react';

export type AssistantVoiceState = 'IDLE' | 'WAKING' | 'LISTENING' | 'PROCESSING' | 'SPEAKING';

interface WakeStatusBannerProps {
  state: AssistantVoiceState;
  onStopListening: () => void;
}

export default function WakeStatusBanner({ state, onStopListening }: WakeStatusBannerProps) {
  if (state === 'IDLE') return null;

  return (
    <div className="flex items-center justify-between px-6 py-3
                    border-b border-[#E5E7EB] dark:border-[#2A2A2A]
                    bg-[#F8FAFC] dark:bg-[#111111]
                    transition-all duration-300 animate-fade-in">
      <div className="flex items-center gap-3">
        {state === 'WAKING' && (
          <>
            <div className="relative w-2 h-2 shrink-0">
              <span className="absolute inset-0 rounded-full bg-[#111827] dark:bg-[#FAFAFA] animate-ping opacity-30" />
              <span className="relative inline-block w-2 h-2 rounded-full bg-[#111827] dark:bg-[#FAFAFA]" />
            </div>
            <span className="text-xs font-semibold text-[#6B7280] dark:text-[#A3A3A3]">
              Hands-Free Assistant Active. Say{' '}
              <strong className="text-[#111827] dark:text-[#FAFAFA]">&ldquo;Hey CollegeMate&rdquo;</strong>{' '}
              or{' '}
              <strong className="text-[#111827] dark:text-[#FAFAFA]">&ldquo;Hello CollegeMate&rdquo;</strong>.
            </span>
          </>
        )}
        {state === 'LISTENING' && (
          <>
            <div className="relative w-2 h-2 shrink-0">
              <span className="absolute inset-0 rounded-full bg-[#111827] dark:bg-[#FAFAFA] animate-ping opacity-40" />
              <span className="relative inline-block w-2 h-2 rounded-full bg-[#111827] dark:bg-[#FAFAFA]" />
            </div>
            <span className="text-xs font-bold text-[#111827] dark:text-[#FAFAFA] uppercase tracking-wider">
              Hearing query… Speak now.
            </span>
          </>
        )}
        {state === 'PROCESSING' && (
          <>
            <BrainCircuit size={14} className="text-[#6B7280] dark:text-[#A3A3A3] animate-spin shrink-0" />
            <span className="text-xs font-semibold text-[#6B7280] dark:text-[#A3A3A3]">
              Searching Mount Zion College documents…
            </span>
          </>
        )}
        {state === 'SPEAKING' && (
          <>
            <Volume2 size={14} className="text-[#6B7280] dark:text-[#A3A3A3] animate-bounce shrink-0" />
            <span className="text-xs font-semibold text-[#6B7280] dark:text-[#A3A3A3]">
              Speaking response…
            </span>
          </>
        )}
      </div>

      <button
        onClick={onStopListening}
        title="Turn off hands-free voice control"
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[8px]
                   border border-[#D1D5DB] dark:border-[#3F3F46]
                   bg-[#FFFFFF] dark:bg-[#181818]
                   text-[10px] font-bold tracking-wider uppercase
                   text-[#6B7280] dark:text-[#A3A3A3]
                   hover:bg-[#111827] dark:hover:bg-[#FFFFFF]
                   hover:text-[#FFFFFF] dark:hover:text-[#111111]
                   hover:border-[#111827] dark:hover:border-[#FFFFFF]
                   transition"
      >
        <MicOff size={11} />
        Stop
      </button>
    </div>
  );
}
