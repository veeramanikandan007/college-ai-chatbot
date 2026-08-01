import React, { memo, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Play, Pause, Square, RotateCcw, X, Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVoiceStore } from '../store/useVoiceStore';

const FloatingVoicePlayer = memo(function FloatingVoicePlayer() {
  const {
    voiceState,
    speechTimer,
    spokenText,
    activeMessageId,
    resume,
    pause,
    stop,
    close,
    speak,
  } = useVoiceStore();

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isVisible = voiceState !== 'idle' && voiceState !== 'finished' && voiceState !== 'cancelled' && voiceState !== 'error';
      if (!isVisible) return;

      if (e.code === 'Space') {
        e.preventDefault();
        if (voiceState === 'paused') resume();
        else if (voiceState === 'speaking') pause();
      } else if (e.code === 'Escape') {
        e.preventDefault();
        close();
      } else if (e.ctrlKey && e.shiftKey && e.code === 'KeyV') {
        e.preventDefault();
        handleReplay();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [voiceState]);

  if (!mounted) return null;

  const isVisible = voiceState !== 'idle' && voiceState !== 'finished' && voiceState !== 'cancelled' && voiceState !== 'error';
  const isPaused = voiceState === 'paused';
  const isLoading = voiceState === 'loading';

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Estimate total seconds based on char length
  const getEstimatedDuration = (text: string) => {
    if (!text) return 10;
    return Math.max(5, Math.ceil(text.length / 15));
  };

  const totalDuration = getEstimatedDuration(spokenText);
  const currentProgress = Math.min(speechTimer, totalDuration);
  const progressPercent = (currentProgress / totalDuration) * 100;

  const handleReplay = () => {
    if (spokenText) {
      stop();
      speak(spokenText, activeMessageId);
    }
  };

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Jump time based on click location
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickRatio = clickX / rect.width;
    const targetSeconds = Math.round(clickRatio * totalDuration);
    useVoiceStore.setState({ speechTimer: targetSeconds });
  };

  return createPortal(
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
          className="fixed bottom-6 right-6 z-[99999] pointer-events-auto w-[320px] h-[100px] rounded-[18px] border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/85 backdrop-blur-[18px] shadow-[0_12px_40px_rgba(0,0,0,0.15)] flex flex-col justify-between p-3 select-none overflow-hidden max-md:bottom-0 max-md:left-0 max-md:right-0 max-md:w-full max-md:max-w-none max-md:rounded-t-[18px] max-md:rounded-b-none"
        >
          {/* Header row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot size={16} strokeWidth={1.75} className="text-[#0E2A6D] dark:text-[#60A5FA]" />
              <span className="text-xs font-bold text-heading">CollegeMate AI</span>
              {/* Minimal Wave Animation */}
              {!isPaused && !isLoading && (
                <div className="flex items-center gap-[1.5px] h-3">
                  {[1, 2, 3, 4, 5].map((bar) => (
                    <motion.div
                      key={bar}
                      animate={{ scaleY: [0.3, 1, 0.3] }}
                      transition={{
                        duration: 0.8,
                        repeat: Infinity,
                        delay: bar * 0.12,
                        ease: 'easeInOut',
                      }}
                      className="w-[1.5px] h-full bg-primary rounded-full origin-center"
                    />
                  ))}
                </div>
              )}
            </div>
            
            <span className="text-[10px] font-semibold text-muted">
              {isLoading ? 'Loading...' : isPaused ? 'Paused' : 'Speaking...'}
            </span>
          </div>

          {/* Spotify-style progress bar */}
          <div className="space-y-1">
            <div 
              onClick={handleProgressBarClick}
              className="h-1 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden relative cursor-pointer group"
            >
              <div 
                className="h-full bg-primary rounded-full transition-all duration-300 relative" 
                style={{ width: `${progressPercent}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>

            <div className="flex justify-between text-[9px] font-mono font-bold text-muted tabular-nums">
              <span>{formatTime(currentProgress)}</span>
              <span>{formatTime(totalDuration)}</span>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              {/* Pause / Resume Button */}
              {isPaused ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={resume}
                  className="w-10 h-10 rounded-full flex items-center justify-center bg-primary text-white shadow-xs"
                  title="Resume Speech"
                >
                  <Play size={18} strokeWidth={1.75} className="fill-current ml-0.5" />
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={pause}
                  className="w-10 h-10 rounded-full flex items-center justify-center bg-primary text-white shadow-xs disabled:opacity-40"
                  disabled={isLoading}
                  title="Pause Speech"
                >
                  <Pause size={18} strokeWidth={1.75} className="fill-current" />
                </motion.button>
              )}

              {/* Stop Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={stop}
                className="w-10 h-10 rounded-full flex items-center justify-center border border-slate-200 dark:border-slate-800 text-muted hover:text-danger hover:bg-slate-50 dark:hover:bg-slate-900"
                title="Stop Speech"
              >
                <Square size={18} strokeWidth={1.75} className="fill-current" />
              </motion.button>

              {/* Replay Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleReplay}
                className="w-10 h-10 rounded-full flex items-center justify-center border border-slate-200 dark:border-slate-800 text-muted hover:text-heading hover:bg-slate-50 dark:hover:bg-slate-900"
                title="Replay Speech"
              >
                <RotateCcw size={18} strokeWidth={1.75} />
              </motion.button>
            </div>

            {/* Close Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={close}
              className="w-10 h-10 rounded-full flex items-center justify-center border border-slate-200 dark:border-slate-800 text-muted hover:text-danger hover:bg-slate-50 dark:hover:bg-slate-900"
              title="Close Player"
            >
              <X size={18} strokeWidth={1.75} />
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
});

export default FloatingVoicePlayer;
