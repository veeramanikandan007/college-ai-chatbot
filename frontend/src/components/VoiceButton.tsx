import React, { forwardRef, useImperativeHandle, useRef, useState, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';

interface VoiceButtonProps {
  language: 'en-US' | 'ta-IN';
  disabled: boolean;
  onRecordingStateChange: (isRecording: boolean) => void;
  onDurationChange: (duration: number) => void;
  onTextRecognized: (text: string) => void;
  onRecognitionError: (error: string) => void;
}

export interface VoiceButtonRef {
  startRecording: () => void;
  stopRecording: () => void;
  isRecording: boolean;
}

const VoiceButton = forwardRef<VoiceButtonRef, VoiceButtonProps>(({
  language,
  disabled,
  onRecordingStateChange,
  onDurationChange,
  onTextRecognized,
  onRecognitionError,
}, ref) => {
  const [isSupported, setIsSupported] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<number | null>(null);

  // Check browser support
  useEffect(() => {
    const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognitionClass);
  }, []);

  // Cleanup timer and recognition on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // ignore abort errors on unmount
        }
      }
    };
  }, []);

  const startRecording = () => {
    if (!isSupported || disabled || isRecording) return;

    const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    try {
      const rec = new SpeechRecognitionClass();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = language;

      rec.onstart = () => {
        setIsRecording(true);
        onRecordingStateChange(true);
        setDuration(0);
        onDurationChange(0);
        
        timerRef.current = window.setInterval(() => {
          setDuration((d) => {
            const next = d + 1;
            onDurationChange(next);
            return next;
          });
        }, 1000);
      };

      rec.onresult = (event: any) => {
        if (event.results && event.results[0] && event.results[0][0]) {
          const resultText = event.results[0][0].transcript;
          if (resultText && resultText.trim()) {
            onTextRecognized(resultText);
          } else {
            onRecognitionError('No speech detected');
          }
        }
      };

      rec.onerror = (event: any) => {
        console.error('Speech Recognition Error event:', event);
        const err = event.error;
        if (err === 'not-allowed') {
          onRecognitionError('Microphone permission denied. Please allow microphone access.');
        } else if (err === 'no-speech') {
          onRecognitionError('No speech detected. Please speak closer to your microphone.');
        } else if (err === 'network') {
          onRecognitionError('Network error occurred during speech recognition.');
        } else {
          onRecognitionError(`Speech recognition failed: ${err}`);
        }
      };

      rec.onend = () => {
        setIsRecording(false);
        onRecordingStateChange(false);
        setDuration(0);
        onDurationChange(0);
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      };

      recognitionRef.current = rec;
      rec.start();
    } catch (e: any) {
      console.error('Failed to initialize speech recognition', e);
      onRecognitionError(`Failed to initialize recorder: ${e.message || e}`);
    }
  };

  const stopRecording = () => {
    if (!isRecording || !recognitionRef.current) return;
    try {
      recognitionRef.current.stop();
    } catch (e) {
      console.error('Error stopping recognition', e);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // Expose methods to parent components via ref
  useImperativeHandle(ref, () => ({
    startRecording,
    stopRecording,
    isRecording,
  }));

  if (!isSupported) {
    return (
      <button
        type="button"
        disabled
        title="Speech recognition is not supported in this browser."
        className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-400 dark:text-slate-600 cursor-not-allowed transition"
      >
        <MicOff size={16} />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleRecording}
      disabled={disabled}
      title={isRecording ? 'Stop recording (Esc)' : 'Speak message (Space)'}
      className={`p-3.5 rounded-xl transition-all duration-200 active:scale-95 shrink-0 ${
        isRecording
          ? 'bg-red-500 text-white shadow-lg shadow-red-500/20 scale-[1.05]'
          : 'border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-primary dark:hover:text-secondary shadow-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:bg-white'
      }`}
    >
      <Mic size={16} className={isRecording ? 'animate-pulse' : ''} />
    </button>
  );
});

VoiceButton.displayName = 'VoiceButton';

export default VoiceButton;
