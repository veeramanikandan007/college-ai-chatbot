import { useState, useEffect, useRef, useCallback } from 'react';
import { voiceManager } from '../services/ttsService';
import type { TTSOptions } from '../services/ttsService';

export type AssistantVoiceState = 'IDLE' | 'WAKING' | 'LISTENING' | 'PROCESSING' | 'SPEAKING';

export interface VoiceSettings {
  voiceURI: string;
  language: 'en-US' | 'ta-IN';
  speed: number;
  volume: number;
  autoSpeak: boolean;
  handsFree: boolean;
}

export function useVoiceSystem() {
  const [assistantState, setAssistantState] = useState<AssistantVoiceState>('IDLE');
  
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  
  const [spokenText, setSpokenText] = useState('');
  const [isPlayingSpeech, setIsPlayingSpeech] = useState(false);
  const [isPausedSpeech, setIsPausedSpeech] = useState(false);

  const voiceButtonRef = useRef<any>(null);
  const wakeRecognitionRef = useRef<any>(null);

  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>(() => {
    const saved = localStorage.getItem('voice_settings');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    return {
      voiceURI: '',
      language: 'en-US',
      speed: 1.0,
      volume: 1.0,
      autoSpeak: true,
      handsFree: false,
    };
  });

  const handleVoiceSettingsChange = (newSettings: VoiceSettings) => {
    const requiresRestart = 
      newSettings.speed !== voiceSettings.speed ||
      newSettings.volume !== voiceSettings.volume ||
      newSettings.voiceURI !== voiceSettings.voiceURI ||
      newSettings.language !== voiceSettings.language;

    setVoiceSettings(newSettings);
    localStorage.setItem('voice_settings', JSON.stringify(newSettings));
    
    if (isPlayingSpeech && requiresRestart) {
      speakText(spokenText, newSettings);
    }
  };

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
        let wakeWordDetected = false;
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript.toLowerCase();
          if (
            transcript.includes('hey campusmate') || 
            transcript.includes('hello campusmate') ||
            transcript.includes('hey campus mate') ||
            transcript.includes('hello campus mate') ||
            transcript.includes('campusmate') ||
            transcript.includes('campus mate')
          ) {
            wakeWordDetected = true;
            break;
          }
        }
        if (wakeWordDetected) {
          playChime();
          setAssistantState('LISTENING');
        }
      };

      wakeRec.onerror = (event: any) => { };

      wakeRec.onend = () => {
        if (assistantState === 'WAKING') {
          try { wakeRec.start(); } catch (e) {}
        }
      };

      wakeRecognitionRef.current = wakeRec;
      wakeRec.start();
    } catch (e) { }

    return () => {
      if (wakeRecognitionRef.current) {
        try { wakeRecognitionRef.current.abort(); } catch (e) {}
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

  // Subscribe to VoiceManager events
  useEffect(() => {
    voiceManager.onStart = () => {
      setIsPlayingSpeech(true);
      setAssistantState('SPEAKING');
    };
    voiceManager.onEnd = () => {
      setIsPlayingSpeech(false);
      setIsPausedSpeech(false);
      setSpokenText('');
      setAssistantState(prev => prev === 'SPEAKING' ? (voiceSettings.handsFree ? 'WAKING' : 'IDLE') : prev);
    };
    voiceManager.onError = () => {
      setIsPlayingSpeech(false);
      setIsPausedSpeech(false);
      setSpokenText('');
      setAssistantState(prev => prev === 'SPEAKING' ? (voiceSettings.handsFree ? 'WAKING' : 'IDLE') : prev);
    };
    
    return () => {
      voiceManager.onStart = undefined;
      voiceManager.onEnd = undefined;
      voiceManager.onError = undefined;
    };
  }, [voiceSettings.handsFree]);

  const stopSpeech = useCallback(() => {
    voiceManager.cancelAllSpeech();
    setIsPlayingSpeech(false);
    setIsPausedSpeech(false);
    setSpokenText('');
    setAssistantState(voiceSettings.handsFree ? 'WAKING' : 'IDLE');
  }, [voiceSettings.handsFree]);

  const pauseSpeech = useCallback(() => {
    voiceManager.pauseAllSpeech();
    setIsPausedSpeech(true);
  }, []);

  const resumeSpeech = useCallback(() => {
    voiceManager.resumeAllSpeech();
    setIsPausedSpeech(false);
  }, []);

  const speakText = useCallback(async (text: string, settingsToUse = voiceSettings) => {
    if (!text?.trim()) return;

    setSpokenText(text);
    // State updates now handled by voiceManager events natively
    await voiceManager.speak(text, { speed: settingsToUse.speed, volume: settingsToUse.volume });
  }, [voiceSettings]);

  /**
   * speakTextStream — for streaming AI responses.
   * Returns a stream handle with push(chunk), flush(), cancel().
   * Call push() on each sentence as the LLM streams, then flush() at end.
   */
  const speakTextStream = useCallback((settingsToUse = voiceSettings) => {
    const opts: TTSOptions = { speed: settingsToUse.speed, volume: settingsToUse.volume };
    return voiceManager.speakStream(opts);
  }, [voiceSettings]);

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
    spokenText,
    isPlayingSpeech,
    isPausedSpeech,
    voiceSettings,
    handleVoiceSettingsChange,
    voiceButtonRef,
    stopSpeech,
    pauseSpeech,
    resumeSpeech,
    speakText,
    speakTextStream,
  };
}
