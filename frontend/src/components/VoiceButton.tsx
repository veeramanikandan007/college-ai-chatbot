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
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = language;

      rec.onstart = () => {
        setIsRecording(true);
        onRecordingStateChange(true);
        setDuration(0);
        onDurationChange(0);
        
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = window.setInterval(() => {
          setDuration((d) => {
            const next = d + 1;
            onDurationChange(next);
            return next;
          });
        }, 1000);
      };

      rec.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript && transcript.trim()) {
          onTextRecognized(transcript);
        }
      };

      rec.onerror = (event: any) => {
        console.error('Speech Recognition Error event:', event);
        const err = event.error;
        if (err === 'not-allowed' || err === 'service-not-allowed') {
          onRecognitionError('Microphone access denied. Please grant microphone permission in browser settings.');
        } else if (err === 'no-speech') {
          onRecognitionError('No speech detected. Please speak closer to your microphone.');
        } else if (err === 'network') {
          onRecognitionError('Network error during speech recognition. Check internet connection.');
        } else if (err !== 'aborted') {
          onRecognitionError(`Speech recognition error: ${err}`);
        }
        setIsRecording(false);
        onRecordingStateChange(false);
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
      setIsRecording(false);
      onRecordingStateChange(false);
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
        className="p-3.5 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#F8FAFC] dark:bg-[#111111] text-[#9CA3AF] dark:text-[#52525B] cursor-not-allowed transition"
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
      className={`p-3.5 rounded-[10px] transition-all duration-200 active:scale-95 shrink-0 border ${
        isRecording
          ? 'bg-[#111827] dark:bg-[#FFFFFF] border-[#111827] dark:border-[#FFFFFF] text-[#FFFFFF] dark:text-[#111111] scale-[1.05]'
          : 'border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#181818] text-[#6B7280] dark:text-[#A3A3A3] hover:bg-[#F9FAFB] dark:hover:bg-[#232323] hover:text-[#111827] dark:hover:text-[#FAFAFA] shadow-sm disabled:opacity-40 disabled:cursor-not-allowed'
      }`}
    >
      <Mic size={16} className={isRecording ? 'animate-pulse' : ''} />
    </button>
  );
});

VoiceButton.displayName = 'VoiceButton';

export default VoiceButton;
