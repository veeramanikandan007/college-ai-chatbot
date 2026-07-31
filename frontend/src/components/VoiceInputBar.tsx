import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, SendHorizontal, Square, Settings2, X, Check, Sparkles } from 'lucide-react';

interface VoiceInputBarProps {
  promptInput: string;
  setPromptInput: (text: string | ((prev: string) => string)) => void;
  onSendMessage: () => void;
  isGenerating: boolean;
  onStopGeneration: () => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;
  language: 'en-US' | 'ta-IN';
  onError: (err: string) => void;
}

export default function VoiceInputBar({
  promptInput,
  setPromptInput,
  onSendMessage,
  isGenerating,
  onStopGeneration,
  isSettingsOpen,
  setIsSettingsOpen,
  language,
  onError,
}: VoiceInputBarProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);

  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<number | null>(null);

  // Check browser support for SpeechRecognition
  useEffect(() => {
    const SpeechRecognitionClass =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognitionClass);
  }, []);

  // Cleanup timer and recognition on unmount
  useEffect(() => {
    return () => {
      cleanupState();
    };
  }, []);

  const cleanupState = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onstart = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.abort();
      } catch (e) {
        // ignore abort errors
      }
      recognitionRef.current = null;
    }
    setIsRecording(false);
    setRecordingDuration(0);
    setInterimTranscript('');
  };

  const startRecording = () => {
    if (!isSupported) {
      onError('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }
    if (isGenerating || isRecording) return;

    cleanupState();

    const SpeechRecognitionClass =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    try {
      const rec = new SpeechRecognitionClass();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = language;

      rec.onstart = () => {
        setIsRecording(true);
        setRecordingDuration(0);
        setInterimTranscript('');

        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = window.setInterval(() => {
          setRecordingDuration((prev) => prev + 1);
        }, 1000);
      };

      rec.onresult = (event: any) => {
        let currentText = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          currentText += event.results[i][0].transcript;
        }
        if (currentText) {
          setInterimTranscript(currentText);
        }
      };

      rec.onerror = (event: any) => {
        const err = event.error;
        if (err === 'not-allowed' || err === 'service-not-allowed') {
          onError('Microphone access denied. Please grant permission in browser settings.');
        } else if (err === 'no-speech') {
          // Keep listening softly
        } else if (err === 'network') {
          onError('Network error during speech recognition. Please check your connection.');
        } else if (err !== 'aborted') {
          onError(`Speech recognition error: ${err}`);
        }
        cleanupState();
      };

      rec.onend = () => {
        // Auto-end handling if ended externally
      };

      recognitionRef.current = rec;
      rec.start();
    } catch (e: any) {
      onError(`Failed to start microphone: ${e.message || e}`);
      cleanupState();
    }
  };

  // Action 1: Cancel Recording (Clears everything, aborts mic, resets state)
  const handleCancelRecording = () => {
    cleanupState();
  };

  // Action 2: Stop Recording (Stops mic, keeps current transcript in prompt)
  const handleStopRecording = () => {
    if (interimTranscript.trim()) {
      setPromptInput((prev) => (prev ? `${prev} ${interimTranscript.trim()}` : interimTranscript.trim()));
    }
    cleanupState();
  };

  // Action 3: Confirm Recording (Appends transcript, exits recording mode)
  const handleConfirmRecording = () => {
    if (interimTranscript.trim()) {
      setPromptInput((prev) => (prev ? `${prev} ${interimTranscript.trim()}` : interimTranscript.trim()));
    }
    cleanupState();
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const waveHeights = [
    [10, 26, 14, 30, 12],
    [22, 12, 28, 16, 24],
    [14, 30, 10, 22, 18],
    [28, 16, 24, 12, 30],
    [12, 24, 18, 28, 14],
    [26, 14, 30, 16, 22],
  ];

  return (
    <div className="relative w-full select-none">
      <AnimatePresence mode="wait">
        {isRecording ? (
          /* ==========================================
             RECORDING STATE (ChatGPT-Quality Bar)
             ========================================== */
          <motion.div
            key="recording-bar"
            initial={{ opacity: 0, scale: 0.98, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -6 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="relative flex h-[56px] w-full items-center justify-between rounded-2xl border border-red-500/40 bg-slate-950/90 dark:bg-slate-900/95 px-4 shadow-[0_0_25px_rgba(239,68,68,0.25)] backdrop-blur-2xl text-white"
          >
            {/* Left: Red Glowing Mic Badge & Listening Text */}
            <div className="flex items-center gap-3 overflow-hidden pr-2">
              <motion.div
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
                className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.6)]"
              >
                <Mic size={18} />
              </motion.div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-xs font-bold text-red-400">
                  <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
                  <span>Listening...</span>
                </div>
                <p className="truncate text-[11px] text-slate-300">
                  {interimTranscript || 'Speak into your microphone now...'}
                </p>
              </div>
            </div>

            {/* Center: Dynamic Waveform & Timer */}
            <div className="hidden sm:flex items-center gap-3 shrink-0">
              <div className="flex items-center gap-1 h-6 px-2">
                {waveHeights.map((heights, idx) => (
                  <motion.div
                    key={idx}
                    animate={{ height: heights }}
                    transition={{ repeat: Infinity, duration: 1.1, delay: idx * 0.08, ease: 'easeInOut' }}
                    className="w-1 rounded-full bg-gradient-to-t from-red-500 via-amber-400 to-emerald-400"
                  />
                ))}
              </div>

              <span className="font-mono text-xs font-bold bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700 text-slate-200">
                {formatTime(recordingDuration)}
              </span>
            </div>

            {/* Right: The 3 Action Buttons (Cancel, Stop, Confirm) */}
            <div className="flex items-center gap-1.5 shrink-0">
              {/* Cancel Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={handleCancelRecording}
                title="Cancel recording (Esc)"
                className="flex h-9 items-center gap-1 rounded-xl border border-slate-800 bg-slate-900/90 px-3 text-xs font-semibold text-slate-400 hover:bg-slate-800 hover:text-white transition"
              >
                <X size={14} />
                <span className="hidden md:inline">Cancel</span>
              </motion.button>

              {/* Stop Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={handleStopRecording}
                title="Stop and keep transcript"
                className="flex h-9 items-center gap-1 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 text-xs font-semibold text-amber-400 hover:bg-amber-500/20 transition"
              >
                <Square size={14} className="fill-current" />
                <span className="hidden md:inline">Stop</span>
              </motion.button>

              {/* Confirm Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={handleConfirmRecording}
                title="Confirm and insert speech"
                className="flex h-9 items-center gap-1 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 px-3.5 text-xs font-bold text-white shadow-md hover:brightness-110 transition"
              >
                <Check size={15} />
                <span>Confirm</span>
              </motion.button>
            </div>
          </motion.div>
        ) : (
          /* ==========================================
             IDLE STATE (56px Glassmorphic Input Bar)
             ========================================== */
          <motion.form
            key="idle-bar"
            initial={{ opacity: 0, scale: 0.98, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 6 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            onSubmit={(e) => {
              e.preventDefault();
              if (promptInput.trim() && !isGenerating) {
                onSendMessage();
              }
            }}
            className="relative flex h-[56px] w-full items-center rounded-2xl border border-slate-200/90 dark:border-slate-700/90 bg-white/90 dark:bg-slate-900/90 p-2 shadow-md backdrop-blur-xl transition-all duration-300 focus-within:border-[#0A2A6A] dark:focus-within:border-secondary focus-within:ring-2 focus-within:ring-[#0A2A6A]/10"
          >
            {/* Input Text Box */}
            <input
              type="text"
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              placeholder="Ask CollegeMate AI about rules, timetables, fees, library..."
              className="flex-1 bg-transparent px-3 text-sm text-[#1F2937] dark:text-white outline-none placeholder:text-[#94A3B8] dark:placeholder:text-slate-500"
              disabled={isGenerating}
            />

            {/* Action Icon Group */}
            <div className="flex items-center gap-1.5 shrink-0">
              {/* Mic Recording Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={startRecording}
                disabled={isGenerating}
                title="Start Voice Input"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-[#0A2A6A] dark:hover:text-secondary transition disabled:opacity-40"
              >
                <Mic size={17} />
              </motion.button>

              {/* Stop Generation or Send Button */}
              {isGenerating ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={onStopGeneration}
                  className="flex h-9 items-center gap-1.5 rounded-xl bg-rose-600 px-4 text-xs font-bold text-white shadow-md hover:bg-rose-700 transition"
                >
                  <Square size={13} className="fill-current" />
                  <span className="hidden sm:inline">Stop</span>
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  type="submit"
                  disabled={!promptInput.trim()}
                  className="flex h-9 items-center gap-1.5 rounded-xl bg-[#0A2A6A] dark:bg-secondary px-4 text-xs font-bold text-white dark:text-slate-900 shadow-md transition hover:bg-[#163D8C] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  <span className="hidden sm:inline">Send</span>
                  <SendHorizontal size={18} strokeWidth={1.75} />
                </motion.button>
              )}

              {/* Voice Settings Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                className={`flex h-9 w-9 items-center justify-center rounded-xl transition ${
                  isSettingsOpen
                    ? 'bg-slate-200 dark:bg-slate-700 text-[#0A2A6A] dark:text-secondary'
                    : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
                title="Voice Settings"
              >
                <Settings2 size={17} />
              </motion.button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
