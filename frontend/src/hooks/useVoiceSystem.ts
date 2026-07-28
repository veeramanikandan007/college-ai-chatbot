import { useState, useEffect, useRef, useCallback } from 'react';

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

  const stopSpeech = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingSpeech(false);
    setIsPausedSpeech(false);
    setSpokenText('');
    setAssistantState((prev) => (voiceSettings.handsFree && prev !== 'LISTENING' && prev !== 'PROCESSING' ? 'WAKING' : 'IDLE'));
  }, [voiceSettings.handsFree]);

  const pauseSpeech = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.pause();
    }
    setIsPausedSpeech(true);
  }, []);

  const resumeSpeech = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.resume();
    }
    setIsPausedSpeech(false);
  }, []);

  const speakText = useCallback((text: string, settingsToUse = voiceSettings) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();

      if (!text || !text.trim()) return;

      const cleaned = text
        .replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, '')
        .replace(/•/g, 'point ')
        .trim();

      const utterance = new SpeechSynthesisUtterance(cleaned);
      const hasTamil = /[\u0B80-\u0BFF]/.test(text);
      const targetLanguage = hasTamil ? 'ta-IN' : 'en-US';

      const availableVoices = window.speechSynthesis.getVoices();
      let selectedVoice = availableVoices.find(v => v.voiceURI === settingsToUse.voiceURI);

      if (!selectedVoice) {
        selectedVoice = availableVoices.find(v => v.lang.startsWith(hasTamil ? 'ta' : 'en'));
      }
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
      utterance.lang = targetLanguage;
      utterance.rate = settingsToUse.speed;
      utterance.volume = settingsToUse.volume;

      utterance.onstart = () => {
        setSpokenText(text);
        setIsPlayingSpeech(true);
        setIsPausedSpeech(false);
        setAssistantState('SPEAKING');
      };

      utterance.onend = () => {
        setIsPlayingSpeech(false);
        setIsPausedSpeech(false);
        setSpokenText('');
        setAssistantState(settingsToUse.handsFree ? 'WAKING' : 'IDLE');
      };

      utterance.onerror = () => {
        setIsPlayingSpeech(false);
        setIsPausedSpeech(false);
        setSpokenText('');
        setAssistantState(settingsToUse.handsFree ? 'WAKING' : 'IDLE');
      };

      window.speechSynthesis.speak(utterance);
    }
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
    speakText
  };
}
