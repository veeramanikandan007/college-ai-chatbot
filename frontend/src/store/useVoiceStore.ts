import { create } from 'zustand';
import { voiceManager, VoiceState } from '../services/ttsService';

interface VoiceSettings {
  voiceURI: string;
  language: 'en-US' | 'ta-IN';
  speed: number;
  pitch: number;
  volume: number;
  autoSpeak: boolean;
  handsFree: boolean;
}

interface VoiceStoreState {
  voiceState: VoiceState;
  speechTimer: number;
  spokenText: string;
  settings: VoiceSettings;
  activeMessageId: string;
  finishedMessageIds: string[];
  
  // Actions
  setVoiceState: (state: VoiceState) => void;
  setSpeechTimer: (time: number) => void;
  setSpokenText: (text: string) => void;
  updateSettings: (newSettings: Partial<VoiceSettings>) => void;
  setActiveMessageId: (id: string) => void;
  addFinishedMessageId: (id: string) => void;
  clearFinishedMessageIds: () => void;
  
  // Playback Control
  speak: (text: string, messageId: string) => void;
  speakStream: () => { push: (chunk: string) => void; flush: () => void; cancel: () => void };
  pause: () => void;
  resume: () => void;
  stop: () => void;
  close: () => void;
}

const defaultSettings: VoiceSettings = {
  voiceURI: '',
  language: 'en-US',
  speed: 1.0,
  pitch: 1.0,
  volume: 1.0,
  autoSpeak: false,
  handsFree: false,
};

const savedSettings = localStorage.getItem('voice_settings');
const initialSettings = savedSettings ? JSON.parse(savedSettings) : defaultSettings;

let timerInterval: number | null = null;

export const useVoiceStore = create<VoiceStoreState>((set, get) => ({
  voiceState: 'idle',
  speechTimer: 0,
  spokenText: '',
  settings: initialSettings,
  activeMessageId: '',
  finishedMessageIds: [],

  setVoiceState: (state) => {
    const prevState = get().voiceState;
    const wasVisible = prevState === 'loading' || prevState === 'speaking' || prevState === 'paused';
    const isVisible = state === 'loading' || state === 'speaking' || state === 'paused';

    if (!wasVisible && isVisible) {
      console.log("Player Opened");
    } else if (wasVisible && !isVisible) {
      console.log("Player Closed");
    }

    set({ voiceState: state });

    if (state === 'finished') {
      const activeId = get().activeMessageId;
      if (activeId && !get().finishedMessageIds.includes(activeId)) {
        set((s) => ({ finishedMessageIds: [...s.finishedMessageIds, activeId] }));
      }
    }
    
    // Manage speech timer
    if (state === 'speaking') {
      if (!timerInterval) {
        timerInterval = window.setInterval(() => {
          set((s) => ({ speechTimer: s.speechTimer + 1 }));
        }, 1000);
      }
    } else if (state === 'paused') {
      if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
      }
    } else if (state === 'idle' || state === 'cancelled' || state === 'error' || state === 'finished' || state === 'loading') {
      if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
      }
      if (state !== 'finished') {
          set({ speechTimer: 0 }); // Reset timer except on finished
      }
      if (state === 'loading') {
          set({ speechTimer: 0 });
      }
    }
  },
  
  setSpeechTimer: (time) => set({ speechTimer: time }),
  
  setSpokenText: (text) => set({ spokenText: text }),
  
  updateSettings: (newSettings) => {
    set((state) => {
      const updated = { ...state.settings, ...newSettings };
      localStorage.setItem('voice_settings', JSON.stringify(updated));
      return { settings: updated };
    });
  },

  setActiveMessageId: (id) => set({ activeMessageId: id }),
  
  addFinishedMessageId: (id) => set((state) => ({ finishedMessageIds: [...state.finishedMessageIds, id] })),
  
  clearFinishedMessageIds: () => set({ finishedMessageIds: [] }),

  speak: (text, messageId) => {
    const { settings } = get();
    set({ spokenText: text, speechTimer: 0, activeMessageId: messageId });
    voiceManager.speak(text, {
      speed: settings.speed,
      pitch: settings.pitch,
      volume: settings.volume,
      voiceURI: settings.voiceURI,
    });
  },

  speakStream: () => {
    const { settings } = get();
    return voiceManager.speakStream({
      speed: settings.speed,
      pitch: settings.pitch,
      volume: settings.volume,
      voiceURI: settings.voiceURI,
    });
  },

  pause: () => voiceManager.pauseAllSpeech(),
  
  resume: () => voiceManager.resumeAllSpeech(),
  
  stop: () => {
    voiceManager.cancelAllSpeech();
  },
  
  close: () => {
    voiceManager.cancelAllSpeech();
    set({ spokenText: '', speechTimer: 0, activeMessageId: '' });
  }
}));

// Bind TTS Service to Zustand Store
voiceManager.onStateChange = (state: VoiceState) => {
  useVoiceStore.getState().setVoiceState(state);
};
