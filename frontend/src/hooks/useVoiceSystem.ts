import { useState, useEffect, useRef, useCallback } from 'react';
import { useVoiceStore } from '../store/useVoiceStore';

export type AssistantVoiceState = 'IDLE' | 'WAKING' | 'LISTENING' | 'PROCESSING' | 'SPEAKING';

export function useVoiceSystem() {
  const [assistantState, setAssistantState] = useState<AssistantVoiceState>('IDLE');
  
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  
  const voiceButtonRef = useRef<any>(null);
  const wakeRecognitionRef = useRef<any>(null);

  const { settings: voiceSettings, voiceState, stop } = useVoiceStore();



  useEffect(() => {
    if (voiceSettings.handsFree) {
      if (assistantState === 'IDLE') setAssistantState('WAKING');
    } else {
      if (assistantState === 'WAKING') setAssistantState('IDLE');
    }
  }, [voiceSettings.handsFree]);

  const playChime = () => {
    if (typeof window === 'undefined') return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.15, ctx.currentTime + 0.12);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.start();
      osc.stop(ctx.currentTime + 0.40);
    } catch (e) { }
  };

  useEffect(() => {
    if (wakeRecognitionRef.current) {
      try { wakeRecognitionRef.current.abort(); } catch (e) {}
      wakeRecognitionRef.current = null;
    }

    if (assistantState !== 'WAKING') return;

    const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionClass) return;

    try {
      const wakeRec = new SpeechRecognitionClass();
      wakeRec.continuous = true;
      wakeRec.interimResults = true;
      wakeRec.lang = 'en-US';

      wakeRec.onresult = (event: any) => {
        let currentText = '';
        let wakeWordDetected = false;
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript.toLowerCase();
          currentText += transcript;
          if (
            transcript.includes('hey collegemate') || 
            transcript.includes('hello collegemate') ||
            transcript.includes('hey campus mate') ||
            transcript.includes('hello campus mate') ||
            transcript.includes('collegemate') ||
            transcript.includes('campus mate') ||
            transcript.includes('collegemate') ||
            transcript.includes('college mate')
          ) {
            wakeWordDetected = true;
            break;
          }
        }
        
        if (currentText.trim()) {
           console.log(`Recognition result: ${currentText}`);
        }

        if (wakeWordDetected) {
          playChime();
          setAssistantState('LISTENING');
        }
      };

      wakeRec.onerror = (event: any) => { console.warn("Wake mic error", event.error); };

      wakeRec.onend = () => {
        if (assistantState === 'WAKING') {
          try { wakeRec.start(); } catch (e) {}
        }
      };

      wakeRecognitionRef.current = wakeRec;
      console.log("Microphone started");
      wakeRec.start();
    } catch (e) { }

    return () => {
      if (wakeRecognitionRef.current) {
        try { 
          wakeRecognitionRef.current.abort(); 
          console.log("Microphone stopped");
        } catch (e) {}
      }
    };
  }, [assistantState]);

  useEffect(() => {
    if (assistantState === 'LISTENING') {
      if (voiceButtonRef.current && !voiceButtonRef.current.isRecording) {
        voiceButtonRef.current.startRecording();
      }
    } else {
      if (voiceButtonRef.current && voiceButtonRef.current.isRecording) {
        voiceButtonRef.current.stopRecording();
      }
    }
  }, [assistantState]);

  // Sync assistant state with global voice state
  useEffect(() => {
    if (voiceState === 'speaking') {
       setAssistantState('SPEAKING');
    } else if (voiceState === 'idle' || voiceState === 'cancelled' || voiceState === 'finished' || voiceState === 'error') {
       setAssistantState(prev => prev === 'SPEAKING' ? (voiceSettings.handsFree ? 'WAKING' : 'IDLE') : prev);
    }
  }, [voiceState, voiceSettings.handsFree]);

  const stopSpeech = useCallback(() => {
    stop();
    setAssistantState(voiceSettings.handsFree ? 'WAKING' : 'IDLE');
  }, [voiceSettings.handsFree, stop]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isTyping = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA');

      if (e.code === 'Space' && !isTyping) {
        e.preventDefault();
        if (voiceButtonRef.current) {
          if (voiceButtonRef.current.isRecording) {
            setAssistantState(voiceSettings.handsFree ? 'WAKING' : 'IDLE');
          } else {
            stopSpeech();
            setAssistantState('LISTENING');
          }
        }
      }

      if (e.code === 'Escape') {
        if (voiceButtonRef.current && voiceButtonRef.current.isRecording) {
          e.preventDefault();
          setAssistantState(voiceSettings.handsFree ? 'WAKING' : 'IDLE');
        }
      }

      if (e.ctrlKey && e.code === 'KeyM') {
        e.preventDefault();
        stopSpeech();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [voiceSettings, stopSpeech]);

  const showVoiceError = (err: string) => {
    setVoiceError(err);
    setTimeout(() => setVoiceError(null), 6000);
  };

  return {
    assistantState,
    setAssistantState,
    isRecording,
    setIsRecording,
    recordingDuration,
    setRecordingDuration,
    voiceError,
    showVoiceError,
    voiceButtonRef,
    stopSpeech,
  };
}
