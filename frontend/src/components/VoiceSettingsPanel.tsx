import React, { useEffect, useState } from 'react';
import { Volume2, Gauge, RefreshCw, Mic, Wifi, WifiOff, Sliders, X, Play, RotateCcw } from 'lucide-react';
import { voiceManager, type TTSStatus } from '../services/ttsService';

export interface VoiceSettings {
  voiceURI: string;
  language: 'en-US' | 'ta-IN';
  speed: number;
  pitch: number;
  volume: number;
  autoSpeak: boolean;
  handsFree: boolean;
}

interface VoiceSettingsPanelProps {
  settings: VoiceSettings;
  onChange: (newSettings: VoiceSettings) => void;
  onClose: () => void;
}

export default function VoiceSettingsPanel({ settings, onChange, onClose }: VoiceSettingsPanelProps) {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [ttsStatus, setTtsStatus] = useState<TTSStatus | null>(null);

  // Lock body scroll when panel is open
  useEffect(() => {
    const originalStyle = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  useEffect(() => {
    const fetchVoices = () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        setVoices(window.speechSynthesis.getVoices());
      }
    };

    fetchVoices();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = fetchVoices;
    }

    voiceManager.getStatus().then(setTtsStatus);
  }, []);

  const filteredVoices = voices.filter((voice) => {
    if (settings.language === 'ta-IN') {
      return voice.lang.startsWith('ta') || voice.lang.includes('Tamil');
    }
    return voice.lang.startsWith('en') || voice.lang.includes('English');
  });

  const handleLangChange = (lang: 'en-US' | 'ta-IN') => {
    onChange({ ...settings, language: lang, voiceURI: '' });
  };

  const handleVoiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...settings, voiceURI: e.target.value });
  };

  const handleRangeChange = (key: 'speed' | 'pitch' | 'volume', val: number) => {
    onChange({ ...settings, [key]: val });
  };

  const handleToggleAutoSpeak = () => {
    onChange({ ...settings, autoSpeak: !settings.autoSpeak });
  };

  const handleToggleHandsFree = () => {
    onChange({ ...settings, handsFree: !settings.handsFree });
  };

  const handleReset = () => {
    onChange({
      voiceURI: '',
      language: 'en-US',
      speed: 1.0,
      pitch: 1.0,
      volume: 1.0,
      autoSpeak: false,
      handsFree: false,
    });
  };

  const handlePreview = () => {
    const previewText = settings.language === 'ta-IN' ? 'வணக்கம், இது எனது குரல் முன்னோட்டம் ஆகும்.' : 'Hello, this is a preview of my synthesis voice.';
    voiceManager.speak(previewText, {
      speed: settings.speed,
      pitch: settings.pitch,
      volume: settings.volume,
      voiceURI: settings.voiceURI,
    });
  };

  return (
    <div className="fixed inset-y-0 right-0 z-[99999] w-[380px] max-w-full bg-white dark:bg-[#111827] border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col justify-between select-none">
      {/* Drawer Header */}
      <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-heading flex items-center gap-2">
            <span>Voice AI Control Drawer</span>
            <button
              onClick={() => {
                if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                  setVoices(window.speechSynthesis.getVoices());
                }
                voiceManager.getStatus().then(setTtsStatus);
              }}
              title="Reload System Voices"
              className="p-1 rounded-lg text-muted hover:text-heading hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <RefreshCw size={12} />
            </button>
          </h3>
          <p className="text-[10px] text-muted">Speech synthesis options & preferences</p>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-muted hover:text-danger hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          title="Close Settings Drawer"
        >
          <X size={16} />
        </button>
      </div>

      {/* Drawer Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
        {/* Status Indicators */}
        {ttsStatus && (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-2.5 bg-slate-50 dark:bg-slate-900/40">
            <p className="text-[10px] font-bold text-muted uppercase tracking-wider">TTS Engine Status</p>
            <div className="flex items-center justify-between text-xs">
              <span className="text-body font-semibold">🇬🇧 English Engine</span>
              <span className={`text-[10px] font-bold flex items-center gap-1 ${ttsStatus.english.ready ? 'text-success' : 'text-warning'}`}>
                {ttsStatus.english.ready ? <Wifi size={11} /> : <WifiOff size={11} />}
                {ttsStatus.english.provider}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-body font-semibold">🇮🇳 Tamil Engine</span>
              <span className={`text-[10px] font-bold flex items-center gap-1 ${ttsStatus.tamil.ready ? 'text-success' : 'text-warning'}`}>
                {ttsStatus.tamil.ready ? <Wifi size={11} /> : <WifiOff size={11} />}
                {ttsStatus.tamil.provider}
              </span>
            </div>
          </div>
        )}

        {/* Interface Language */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-heading">Language Mode</label>
          <div className="grid grid-cols-2 gap-2">
            {(['en-US', 'ta-IN'] as const).map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => handleLangChange(lang)}
                className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                  settings.language === lang
                    ? 'bg-primary border-primary text-white shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 text-muted hover:bg-slate-50 dark:hover:bg-slate-900'
                }`}
              >
                {lang === 'en-US' ? 'English (en-US)' : 'தமிழ் (ta-IN)'}
              </button>
            ))}
          </div>
        </div>

        {/* Voice Selection */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-heading">Synthesis Voice</label>
          <select
            value={settings.voiceURI}
            onChange={handleVoiceChange}
            className="w-full text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-heading p-2.5 outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">-- Default System Voice --</option>
            {filteredVoices.map((voice) => (
              <option key={voice.voiceURI} value={voice.voiceURI}>
                {voice.name} ({voice.lang}) {voice.localService ? '[Local]' : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Speaking Speed */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-heading">
            <span className="flex items-center gap-1.5"><Gauge size={14} />Speaking Speed</span>
            <span className="font-mono text-primary">{settings.speed}x</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={settings.speed}
            onChange={(e) => handleRangeChange('speed', parseFloat(e.target.value))}
            className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary"
          />
        </div>

        {/* Pitch */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-heading">
            <span className="flex items-center gap-1.5"><Sliders size={14} />Voice Pitch</span>
            <span className="font-mono text-primary">{settings.pitch}x</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={settings.pitch}
            onChange={(e) => handleRangeChange('pitch', parseFloat(e.target.value))}
            className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary"
          />
        </div>

        {/* Volume */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-heading">
            <span className="flex items-center gap-1.5"><Volume2 size={14} />Speaking Volume</span>
            <span className="font-mono text-primary">{Math.round(settings.volume * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={settings.volume}
            onChange={(e) => handleRangeChange('volume', parseFloat(e.target.value))}
            className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary"
          />
        </div>

        {/* Auto Read Toggle */}
        <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-4">
          <div>
            <span className="text-xs font-bold text-heading">Auto Read Responses</span>
            <span className="text-[10px] text-muted block mt-0.5">Speak automatically after text stream ends.</span>
          </div>
          <button
            type="button"
            onClick={handleToggleAutoSpeak}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              settings.autoSpeak ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-800'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                settings.autoSpeak ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Hands-Free Toggle */}
        <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-4">
          <div>
            <span className="text-xs font-bold text-heading flex items-center gap-1.5">
              <Mic size={14} className="text-primary" /> Hands-Free Mode
            </span>
            <span className="text-[10px] text-muted block mt-0.5">Continuous wake word detection ("Hey CollegeMate").</span>
          </div>
          <button
            type="button"
            onClick={handleToggleHandsFree}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              settings.handsFree ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-800'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                settings.handsFree ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Drawer Actions */}
      <div className="p-5 border-t border-slate-200 dark:border-slate-800 flex gap-2.5 bg-slate-50 dark:bg-slate-900/20">
        <button
          onClick={handlePreview}
          className="flex-1 h-12 flex items-center justify-center gap-1.5 rounded-[14px] bg-slate-100 dark:bg-slate-800 text-xs font-bold text-heading hover:bg-slate-200 dark:hover:bg-slate-700 transition"
        >
          <Play size={13} />
          Preview
        </button>
        
        <button
          onClick={handleReset}
          className="w-12 h-12 flex items-center justify-center rounded-[14px] border border-slate-200 dark:border-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-muted hover:text-danger transition"
          title="Reset settings to default"
        >
          <RotateCcw size={14} />
        </button>

        <button
          onClick={onClose}
          className="flex-1 h-12 rounded-[14px] bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-sm transition"
        >
          Apply Settings
        </button>
      </div>
    </div>
  );
}
