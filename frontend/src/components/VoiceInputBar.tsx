import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, SendHorizontal, Square, Settings2, X, Check } from 'lucide-react';

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
  const isIntendedStopRef = useRef(false);

  useEffect(() => {
    const SpeechRecognitionClass =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognitionClass);
  }, []);

  useEffect(() => {
    return () => { cleanupState(); };
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
      } catch (e) {}
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

    isIntendedStopRef.current = false;
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
        if (currentText) setInterimTranscript(currentText);
      };

      rec.onerror = (event: any) => {
        const err = event.error;
        if (err === 'not-allowed' || err === 'service-not-allowed') {
          onError('Microphone access denied. Please grant permission in browser settings.');
        } else if (err === 'no-speech') {
          // Keep listening
        } else if (err === 'network') {
          onError('Network error during speech recognition. Please check your connection.');
        } else if (err !== 'aborted') {
          onError(`Speech recognition error: ${err}`);
        }
        cleanupState();
      };

      rec.onend = () => {
        if (!isIntendedStopRef.current && isRecording) {
          try { rec.start(); } catch (e) {}
        }
      };

      recognitionRef.current = rec;
      rec.start();
    } catch (e: any) {
      onError(`Failed to start microphone: ${e.message || e}`);
      cleanupState();
    }
  };

  const handleCancelRecording = () => {
    isIntendedStopRef.current = true;
    cleanupState();
  };

  const handleStopRecording = () => {
    isIntendedStopRef.current = true;
    if (interimTranscript.trim()) {
      setPromptInput((prev) => (prev ? `${prev} ${interimTranscript.trim()}` : interimTranscript.trim()));
    }
    cleanupState();
  };

  const handleConfirmRecording = () => {
    isIntendedStopRef.current = true;
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

  /* ─── Monochrome waveform bars (static heights, animated) ─── */
  const waveHeights = [
    [8, 20, 12, 24, 10],
    [18, 10, 22, 14, 20],
    [12, 24, 8, 18, 14],
    [22, 14, 20, 10, 24],
    [10, 20, 16, 22, 12],
    [20, 12, 24, 14, 18],
  ];

  return (
    <div className="relative w-full select-none">
      <AnimatePresence mode="wait">
        {isRecording ? (
          /* ══════════════════════════════════════════════════════
             RECORDING STATE — Monochrome Premium Bar
          ══════════════════════════════════════════════════════ */
          <motion.div
            key="recording-bar"
            initial={{ opacity: 0, scale: 0.98, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -6 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="relative flex h-[56px] w-full items-center justify-between
                       rounded-xl
                       border border-[#D1D5DB] dark:border-[#3F3F46]
                       bg-[#FFFFFF] dark:bg-[#181818]
                       px-4 shadow-sm"
          >
            {/* Left: Mic badge + listening text */}
            <div className="flex items-center gap-3 overflow-hidden pr-2">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut' }}
                className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px]
                           border border-[#D1D5DB] dark:border-[#3F3F46]
                           bg-[#111827] dark:bg-[#FFFFFF]
                           text-[#FFFFFF] dark:text-[#111111]"
              >
                <Mic size={16} />
                {/* Pulse ring */}
                <span className="absolute inset-0 rounded-[8px] border-2 border-[#111827] dark:border-[#FFFFFF] animate-ping opacity-25" />
              </motion.div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-[11px] font-normal text-[#111827] dark:text-[#FAFAFA] uppercase tracking-wider">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#111827] dark:bg-[#FAFAFA] animate-pulse" />
                  <span>Listening</span>
                </div>
                <p className="truncate text-[12px] text-[#6B7280] dark:text-[#A3A3A3] mt-0.5">
                  {interimTranscript || 'Speak into your microphone…'}
                </p>
              </div>
            </div>

            {/* Center: Waveform + Timer */}
            <div className="hidden sm:flex items-center gap-3 shrink-0">
              <div className="flex items-center gap-[3px] h-6">
                {waveHeights.map((heights, idx) => (
                  <motion.div
                    key={idx}
                    animate={{ height: heights }}
                    transition={{ repeat: Infinity, duration: 1.1, delay: idx * 0.09, ease: 'easeInOut' }}
                    className="w-[3px] rounded-full bg-[#111827] dark:bg-[#FAFAFA] opacity-70"
                  />
                ))}
              </div>
              <span className="font-mono text-[12px] font-medium text-[#111827] dark:text-[#FAFAFA]
                               bg-[#F8FAFC] dark:bg-[#111111]
                               border border-[#E5E7EB] dark:border-[#2A2A2A]
                               px-2.5 py-1 rounded-[6px]">
                {formatTime(recordingDuration)}
              </span>
            </div>

            {/* Right: Cancel / Stop / Confirm */}
            <div className="flex items-center gap-1.5 shrink-0">
              {/* Cancel */}
              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                type="button" onClick={handleCancelRecording} title="Cancel (Esc)"
                className="flex h-8 items-center gap-1 rounded-[8px] px-2.5
                           border border-[#D1D5DB] dark:border-[#3F3F46]
                           bg-[#F8FAFC] dark:bg-[#111111]
                           text-[12px] font-medium text-[#6B7280] dark:text-[#A3A3A3]
                           hover:bg-[#F9FAFB] dark:hover:bg-[#232323]
                           hover:text-[#111827] dark:hover:text-[#FAFAFA]
                           transition"
              >
                <X size={13} />
                <span className="hidden md:inline">Cancel</span>
              </motion.button>

              {/* Stop */}
              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                type="button" onClick={handleStopRecording} title="Stop and keep transcript"
                className="flex h-8 items-center gap-1 rounded-[8px] px-2.5
                           border border-[#D1D5DB] dark:border-[#3F3F46]
                           bg-[#F8FAFC] dark:bg-[#111111]
                           text-[12px] font-medium text-[#111827] dark:text-[#FAFAFA]
                           hover:bg-[#F9FAFB] dark:hover:bg-[#232323]
                           transition"
              >
                <Square size={13} className="fill-current" />
                <span className="hidden md:inline">Stop</span>
              </motion.button>

              {/* Confirm */}
              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                type="button" onClick={handleConfirmRecording} title="Confirm speech"
                className="flex h-8 items-center gap-1.5 rounded-[8px] px-3
                           bg-[#111827] dark:bg-[#FFFFFF]
                           text-[12px] font-medium text-[#FFFFFF] dark:text-[#111111]
                           hover:bg-[#1F2937] dark:hover:bg-[#F0F0F0]
                           transition shadow-sm"
              >
                <Check size={13} />
                <span>Confirm</span>
              </motion.button>
            </div>
          </motion.div>
        ) : (
          /* ══════════════════════════════════════════════════════
             IDLE STATE — Modern ChatGPT-style 56px input bar
          ══════════════════════════════════════════════════════ */
          <motion.form
            key="idle-bar"
            initial={{ opacity: 0, scale: 0.98, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 6 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            onSubmit={(e) => {
              e.preventDefault();
              if (promptInput.trim() && !isGenerating) onSendMessage();
            }}
            className="relative flex h-[56px] w-full items-center
                       rounded-xl
                       border border-[#D1D5DB] dark:border-[#3F3F46]
                       bg-[#FFFFFF] dark:bg-[#181818]
                       px-3 shadow-sm
                       transition-all duration-150
                       focus-within:border-[#111827] dark:focus-within:border-[#FAFAFA]
                       focus-within:shadow-[0_0_0_3px_rgba(17,24,39,0.06)] dark:focus-within:shadow-[0_0_0_3px_rgba(250,250,250,0.05)]"
          >
            {/* Input */}
            <input
              type="text"
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              placeholder="Ask CollegeMate AI about rules, timetables, fees, library…"
              className="flex-1 bg-transparent px-3 text-[14px] text-[#111827] dark:text-[#FAFAFA]
                         outline-none border-none focus:ring-0
                         placeholder-[#9CA3AF] dark:placeholder-[#52525B]"
              disabled={isGenerating}
            />

            {/* Actions */}
            <div className="flex items-center gap-1.5 shrink-0">
              {/* Mic */}
              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                type="button" onClick={startRecording} disabled={isGenerating}
                title="Start Voice Input"
                className="flex h-9 w-9 items-center justify-center rounded-[8px]
                           border border-[#D1D5DB] dark:border-[#3F3F46]
                           bg-[#F8FAFC] dark:bg-[#111111]
                           text-[#6B7280] dark:text-[#A3A3A3]
                           hover:bg-[#F9FAFB] dark:hover:bg-[#232323]
                           hover:text-[#111827] dark:hover:text-[#FAFAFA]
                           transition disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              >
                <Mic size={15} strokeWidth={1.75} />
              </motion.button>

              {/* Stop / Send */}
              {isGenerating ? (
                <motion.button
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  type="button" onClick={onStopGeneration}
                  className="flex h-9 items-center gap-2 rounded-[8px]
                             border border-[#D1D5DB] dark:border-[#3F3F46]
                             bg-[#111827] dark:bg-[#FFFFFF]
                             px-3.5 text-[13px] font-semibold
                             text-[#FFFFFF] dark:text-[#111111]
                             hover:bg-[#1F2937] dark:hover:bg-[#F0F0F0]
                             transition shrink-0 shadow-sm"
                >
                  <Square size={13} strokeWidth={1.75} className="fill-current" />
                  <span className="hidden sm:inline">Stop</span>
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  type="submit" disabled={!promptInput.trim()}
                  className="flex h-9 items-center gap-2 rounded-[8px]
                             bg-[#111827] dark:bg-[#FFFFFF]
                             px-3.5 text-[13px] font-semibold
                             text-[#FFFFFF] dark:text-[#111111]
                             hover:bg-[#1F2937] dark:hover:bg-[#F0F0F0]
                             transition disabled:opacity-30 disabled:cursor-not-allowed
                             shrink-0 shadow-sm"
                >
                  <span className="hidden sm:inline">Send</span>
                  <SendHorizontal size={15} strokeWidth={1.75} />
                </motion.button>
              )}

              {/* Voice Settings */}
              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                type="button" onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                title="Voice Settings"
                className={`flex h-9 w-9 items-center justify-center rounded-[8px] transition shrink-0
                  border
                  ${isSettingsOpen
                    ? 'border-[#111827] dark:border-[#FAFAFA] bg-[#111827] dark:bg-[#FFFFFF] text-[#FFFFFF] dark:text-[#111111]'
                    : 'border-[#D1D5DB] dark:border-[#3F3F46] bg-[#F8FAFC] dark:bg-[#111111] text-[#6B7280] dark:text-[#A3A3A3] hover:bg-[#F9FAFB] dark:hover:bg-[#232323] hover:text-[#111827] dark:hover:text-[#FAFAFA]'
                  }`}
              >
                <Settings2 size={15} strokeWidth={1.75} />
              </motion.button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
