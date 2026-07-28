import React from 'react';
import { Play, Pause, Square, Volume2, VolumeX, Sparkles, Gauge } from 'lucide-react';

interface VoicePlayerProps {
  isPlaying: boolean;
  isPaused: boolean;
  text: string;
  volume: number;
  speed: number;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onVolumeChange: (vol: number) => void;
  onSpeedChange: (spd: number) => void;
}

export default function VoicePlayer({
  isPlaying,
  isPaused,
  text,
  volume,
  speed,
  onPlay,
  onPause,
  onStop,
  onVolumeChange,
  onSpeedChange,
}: VoicePlayerProps) {
  if (!isPlaying && !isPaused) return null;

  const displaySnippet = text.length > 60 ? `${text.slice(0, 60)}...` : text;

  return (
    <div className="glass-panel soft-ring rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/85 animate-fade-in flex flex-col md:flex-row items-center justify-between gap-4 transition-colors duration-300">
      
      {/* Speaking status and snippet */}
      <div className="flex items-center gap-3 w-full md:w-auto">
        <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 dark:bg-secondary/10 text-primary dark:text-secondary shrink-0">
          <Sparkles size={14} className={!isPaused ? 'animate-spin' : ''} style={{ animationDuration: '3s' }} />
        </div>
        <div className="text-left">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            {!isPaused ? 'Speaking response' : 'Speech paused'}
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-300 italic line-clamp-1">
            "{displaySnippet}"
          </p>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-1.5 border-r border-slate-200 dark:border-slate-800 pr-3">
          {isPaused ? (
            <button
              onClick={onPlay}
              title="Resume speech"
              className="p-2 rounded-xl bg-primary dark:bg-secondary text-white dark:text-slate-950 transition active:scale-95 hover:scale-105"
            >
              <Play size={14} fill="currentColor" />
            </button>
          ) : (
            <button
              onClick={onPause}
              title="Pause speech"
              className="p-2 rounded-xl bg-primary dark:bg-secondary text-white dark:text-slate-950 transition active:scale-95 hover:scale-105"
            >
              <Pause size={14} fill="currentColor" />
            </button>
          )}

          <button
            onClick={onStop}
            title="Stop playback (Ctrl+M)"
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition active:scale-95"
          >
            <Square size={14} fill="currentColor" />
          </button>
        </div>

        {/* Speed Slider */}
        <div className="flex items-center gap-2 text-xs">
          <Gauge size={14} className="text-slate-400" />
          <div className="flex flex-col">
            <span className="text-[8px] uppercase font-bold text-slate-400">Speed ({speed}x)</span>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={speed}
              onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
              className="w-16 h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary dark:accent-secondary"
            />
          </div>
        </div>

        {/* Volume Slider */}
        <div className="flex items-center gap-2 text-xs pl-1">
          <button 
            onClick={() => onVolumeChange(volume > 0 ? 0 : 0.8)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
          >
            {volume === 0 ? <VolumeX size={14} /> : <Volume2 size={14} />}
          </button>
          <div className="flex flex-col">
            <span className="text-[8px] uppercase font-bold text-slate-400">Vol ({Math.round(volume * 100)}%)</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              className="w-16 h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary dark:accent-secondary"
            />
          </div>
        </div>
      </div>

    </div>
  );
}
