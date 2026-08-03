import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
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
    <div className="fixed inset-y-0 right-0 z-[99999] w-[380px] max-w-full bg-white dark:bg-[#0A0A0A] border-l border-slate-200 dark:border-[#2A2A2A] shadow-2xl flex flex-col justify-between select-none">
      {/* Drawer Header */}
      <div className="p-5 border-b border-slate-200 dark:border-[#2A2A2A] flex items-center justify-between">
        <div>
          <h3 className="text-[14px] font-normal text-heading flex items-center gap-2">
            <span>Voice AI Control Drawer</span>
            <button
              onClick={() => {
                if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                  setVoices(window.speechSynthesis.getVoices());
                }
                voiceManager.getStatus().then(setTtsStatus);
              }}
              title="Reload System Voices"
              className="p-1 rounded-lg text-muted hover:text-heading hover:bg-[#F8FAFC] dark:hover:bg-[#111111] transition"
            >
              <RefreshCw size={12} />
            </button>
          </h3>
          <p className="text-[11px] font-normal text-muted mt-0.5">Speech synthesis options & preferences</p>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-xl border border-slate-200 dark:border-[#2A2A2A] text-muted hover:text-danger hover:bg-slate-50 dark:hover:bg-[#111111] transition"
          title="Close Settings Drawer"
        >
          <X size={16} />
        </button>
      </div>

      {/* Drawer Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
        {/* Status Indicators */}
        {ttsStatus && (
          <div className="rounded-2xl border border-slate-200 dark:border-[#2A2A2A] p-4 space-y-2.5 bg-[#FAFAFA] dark:bg-[#0A0A0A]/40">
            <p className="text-[10px] font-medium text-muted uppercase tracking-wider">TTS Engine Status</p>
            <div className="flex items-center justify-between text-xs">
              <span className="text-[12px] font-normal text-body">🇬🇧 English Engine</span>
              <span className={`text-[11px] font-medium flex items-center gap-1 ${ttsStatus.english.ready ? 'text-success' : 'text-warning'}`}>
                {ttsStatus.english.ready ? <Wifi size={11} /> : <WifiOff size={11} />}
                {ttsStatus.english.provider}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-[12px] font-normal text-body">🇮🇳 Tamil Engine</span>
              <span className={`text-[11px] font-medium flex items-center gap-1 ${ttsStatus.tamil.ready ? 'text-success' : 'text-warning'}`}>
                {ttsStatus.tamil.ready ? <Wifi size={11} /> : <WifiOff size={11} />}
                {ttsStatus.tamil.provider}
              </span>
            </div>
          </div>
        )}

        {/* Interface Language */}
        <div className="space-y-2">
          <label className="block text-[12px] font-medium text-heading">Language Mode</label>
          {/* Pill toggle container */}
          <div className="relative flex gap-1 p-1 rounded-[14px] bg-[#F3F4F6] dark:bg-[#1A1A1A] border border-[#E5E7EB] dark:border-[#2A2A2A]">
            {(['en-US', 'ta-IN'] as const).map((lang) => {
              const isActive = settings.language === lang;
              return (
                <motion.button
                  key={lang}
                  type="button"
                  onClick={() => handleLangChange(lang)}
                  whileTap={{ scale: 0.97 }}
                  className="relative flex-1 py-2.5 rounded-[10px] text-[11px] font-medium transition-colors duration-150 z-10 flex items-center justify-center gap-1.5"
                >
                  {/* Sliding active pill */}
                  {isActive && (
                    <motion.span
                      layoutId="lang-pill"
                      className="absolute inset-0 rounded-[10px] bg-[#111827] dark:bg-[#FAFAFA] shadow-md"
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                  <span className={`relative z-10 transition-colors duration-150 ${isActive ? 'text-[#FFFFFF] dark:text-[#111111]' : 'text-[#6B7280] dark:text-[#A3A3A3] hover:text-[#111827] dark:hover:text-[#FAFAFA]'}`}>
                    {lang === 'en-US' ? (
                      <span className="flex items-center gap-1.5">
                        <span className="text-[11px]">🇬🇧</span>
                        English (en-US)
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5">
                        <span className="text-[11px]">🇮🇳</span>
                        தமிழ் (ta-IN)
                      </span>
                    )}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Voice Selection */}
        <div className="space-y-2">
          <label className="block text-[12px] font-medium text-heading">Synthesis Voice</label>
          <select
            value={settings.voiceURI}
            onChange={handleVoiceChange}
            className="w-full text-[12px] font-normal rounded-xl border border-slate-200 dark:border-[#2A2A2A] bg-white dark:bg-[#0A0A0A] text-heading p-2.5 outline-none focus:ring-1 focus:ring-primary"
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
          <div className="flex items-center justify-between text-[12px] font-medium text-heading">
            <span className="flex items-center gap-1.5"><Gauge size={13} />Speaking Speed</span>
            <span className="font-normal text-[11px] text-muted">{settings.speed}x</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={settings.speed}
            onChange={(e) => handleRangeChange('speed', parseFloat(e.target.value))}
            className="w-full h-1 bg-slate-200 dark:bg-[#2A2A2A] rounded-lg appearance-none cursor-pointer accent-[#111827] dark:accent-[#FAFAFA]"
          />
        </div>

        {/* Pitch */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[12px] font-medium text-heading">
            <span className="flex items-center gap-1.5"><Sliders size={13} />Voice Pitch</span>
            <span className="font-normal text-[11px] text-muted">{settings.pitch}x</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={settings.pitch}
            onChange={(e) => handleRangeChange('pitch', parseFloat(e.target.value))}
            className="w-full h-1 bg-slate-200 dark:bg-[#2A2A2A] rounded-lg appearance-none cursor-pointer accent-[#111827] dark:accent-[#FAFAFA]"
          />
        </div>

        {/* Volume */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[12px] font-medium text-heading">
            <span className="flex items-center gap-1.5"><Volume2 size={13} />Speaking Volume</span>
            <span className="font-normal text-[11px] text-muted">{Math.round(settings.volume * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={settings.volume}
            onChange={(e) => handleRangeChange('volume', parseFloat(e.target.value))}
            className="w-full h-1 bg-slate-200 dark:bg-[#2A2A2A] rounded-lg appearance-none cursor-pointer accent-[#111827] dark:accent-[#FAFAFA]"
          />
        </div>

        {/* Auto Read Toggle */}
        <div className="flex items-center justify-between border-t border-slate-200 dark:border-[#2A2A2A] pt-4">
          <div>
            <span className="text-[12px] font-medium text-heading">Auto Read Responses</span>
            <span className="text-[11px] font-normal text-muted block mt-0.5">Speak automatically after text stream ends.</span>
          </div>
          <button
            type="button"
            onClick={handleToggleAutoSpeak}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              settings.autoSpeak ? 'bg-primary' : 'bg-slate-200 dark:bg-[#111111]'
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
        <div className="flex items-center justify-between border-t border-slate-200 dark:border-[#2A2A2A] pt-4">
          <div>
            <span className="text-[12px] font-medium text-heading flex items-center gap-1.5">
              <Mic size={13} className="text-primary" /> Hands-Free Mode
            </span>
            <span className="text-[11px] font-normal text-muted block mt-0.5">Continuous wake word detection ("Hey CollegeMate").</span>
          </div>
          <button
            type="button"
            onClick={handleToggleHandsFree}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              settings.handsFree ? 'bg-primary' : 'bg-slate-200 dark:bg-[#111111]'
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
      <div className="p-5 border-t border-slate-200 dark:border-[#2A2A2A] flex gap-2.5 bg-[#FAFAFA] dark:bg-[#0A0A0A]">
        {/* Preview button */}
        <motion.button
          onClick={handlePreview}
          whileHover={{ scale: 1.03, y: -1 }}
          whileTap={{ scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          className="flex-1 h-12 flex items-center justify-center gap-2 rounded-[14px]
                     bg-[#F3F4F6] dark:bg-[#1A1A1A]
                     border border-[#E5E7EB] dark:border-[#2A2A2A]
                     text-[13px] font-semibold text-[#111827] dark:text-[#FAFAFA]
                     hover:bg-[#E5E7EB] dark:hover:bg-[#252525]
                     shadow-sm transition-colors duration-150 group"
        >
          <motion.span
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
          >
            <Play size={14} className="fill-current" />
          </motion.span>
          Preview
        </motion.button>

        {/* Reset button */}
        <motion.button
          onClick={handleReset}
          whileHover={{ scale: 1.08, rotate: -20 }}
          whileTap={{ scale: 0.92, rotate: -40 }}
          transition={{ type: 'spring', stiffness: 400, damping: 18 }}
          className="w-12 h-12 flex items-center justify-center rounded-[14px]
                     border border-[#E5E7EB] dark:border-[#2A2A2A]
                     bg-[#F3F4F6] dark:bg-[#1A1A1A]
                     text-[#6B7280] dark:text-[#A3A3A3]
                     hover:bg-rose-50 dark:hover:bg-rose-950/20
                     hover:text-rose-500 dark:hover:text-rose-400
                     hover:border-rose-200 dark:hover:border-rose-900
                     shadow-sm transition-colors duration-150"
          title="Reset settings to default"
        >
          <RotateCcw size={14} />
        </motion.button>

        {/* Apply Settings button */}
        <motion.button
          onClick={onClose}
          whileHover={{ scale: 1.03, y: -1 }}
          whileTap={{ scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          className="relative flex-1 h-12 overflow-hidden rounded-[14px]
                     bg-[#111827] dark:bg-[#FAFAFA]
                     text-[13px] font-semibold
                     text-[#FFFFFF] dark:text-[#111111]
                     shadow-lg shadow-black/20 dark:shadow-black/40
                     transition-colors duration-150 group"
        >
          {/* Shimmer sweep */}
          <motion.span
            className="pointer-events-none absolute inset-0 -translate-x-full skew-x-[-20deg] bg-white/10 dark:bg-white/5"
            animate={{ translateX: ['−100%', '200%'] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: 'linear', repeatDelay: 1 }}
          />
          <span className="relative z-10 flex items-center justify-center gap-2">
            Apply Settings
          </span>
        </motion.button>
      </div>
    </div>
  );
}
