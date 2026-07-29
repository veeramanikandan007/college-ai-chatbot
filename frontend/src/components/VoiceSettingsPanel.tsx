import React, { useEffect, useState } from 'react';
import { Volume2, Gauge, RefreshCw, Mic, Wifi, WifiOff } from 'lucide-react';
import { getTTSStatus, type TTSStatus } from '../services/ttsService';

export interface VoiceSettings {
  voiceURI: string;
  language: 'en-US' | 'ta-IN';
  speed: number;
  volume: number;
  autoSpeak: boolean;
  handsFree: boolean; // Active Wake Word mode
}

interface VoiceSettingsPanelProps {
  settings: VoiceSettings;
  onChange: (newSettings: VoiceSettings) => void;
}

export default function VoiceSettingsPanel({ settings, onChange }: VoiceSettingsPanelProps) {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [ttsStatus, setTtsStatus] = useState<TTSStatus | null>(null);

  useEffect(() => {
    const fetchVoices = () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        const availableVoices = window.speechSynthesis.getVoices();
        setVoices(availableVoices);
      }
    };

    fetchVoices();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = fetchVoices;
    }

    // Load TTS provider status
    getTTSStatus().then(setTtsStatus);
  }, []);

  // Filter voices based on language setting
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

  const handleRangeChange = (key: 'speed' | 'volume', val: number) => {
    onChange({ ...settings, [key]: val });
  };

  const handleToggleAutoSpeak = () => {
    onChange({ ...settings, autoSpeak: !settings.autoSpeak });
  };

  const handleToggleHandsFree = () => {
    onChange({ ...settings, handsFree: !settings.handsFree });
  };

  return (
    <div className="rounded-[24px] glass-panel soft-ring border border-slate-200/80 dark:border-slate-800/80 p-5 bg-white/70 dark:bg-slate-900/60 space-y-4">
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center justify-between">
          <span>Voice AI Settings</span>
          <button
            onClick={() => {
              if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                setVoices(window.speechSynthesis.getVoices());
              }
              getTTSStatus().then(setTtsStatus);
            }}
            title="Reload System Voices"
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <RefreshCw size={12} />
          </button>
        </h3>
        <p className="text-[10px] text-slate-500 dark:text-slate-400">
          Customize Speech Synthesis & Speech Recognition.
        </p>
      </div>

      {/* TTS Provider Status */}
      {ttsStatus && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-3 space-y-2 bg-slate-50 dark:bg-slate-900/40">
          <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">TTS Providers</p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-600 dark:text-slate-300">🇬🇧 English</span>
            <span className={`text-[10px] font-semibold flex items-center gap-1 ${
              ttsStatus.english.ready ? 'text-emerald-500' : 'text-amber-500'
            }`}>
              {ttsStatus.english.ready ? <Wifi size={10} /> : <WifiOff size={10} />}
              {ttsStatus.english.provider}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-600 dark:text-slate-300">🇮🇳 Tamil</span>
            <span className={`text-[10px] font-semibold flex items-center gap-1 ${
              ttsStatus.tamil.ready ? 'text-emerald-500' : 'text-amber-500'
            }`}>
              {ttsStatus.tamil.ready ? <Wifi size={10} /> : <WifiOff size={10} />}
              {ttsStatus.tamil.provider}
            </span>
          </div>
        </div>
      )}

      <div className="space-y-3.5">
        {/* Language Selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
            Interface Language
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(['en-US', 'ta-IN'] as const).map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => handleLangChange(lang)}
                className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                  settings.language === lang
                    ? 'bg-primary border-primary text-white dark:bg-secondary dark:border-secondary dark:text-slate-950 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'
                }`}
              >
                {lang === 'en-US' ? 'English (en-US)' : 'தமிழ் (ta-IN)'}
              </button>
            ))}
          </div>
        </div>

        {/* Voice Selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
            Synthesis Voice
          </label>
          <select
            value={settings.voiceURI}
            onChange={handleVoiceChange}
            className="w-full text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 p-2.5 outline-none focus:ring-1 focus:ring-primary dark:focus:ring-secondary"
          >
            <option value="">-- Default System Voice --</option>
            {filteredVoices.map((voice) => (
              <option key={voice.voiceURI} value={voice.voiceURI}>
                {voice.name} ({voice.lang}) {voice.localService ? '[Local]' : ''}
              </option>
            ))}
          </select>
          {filteredVoices.length === 0 && (
            <p className="text-[9px] text-slate-400 mt-1">
              ℹ️ No local {settings.language === 'ta-IN' ? 'Tamil' : 'English'} voices. Using Cloud TTS automatically.
            </p>
          )}
        </div>

        {/* Speed Dials */}
        <div>
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
            <span className="flex items-center gap-1">
              <Gauge size={13} />
              Speaking Speed
            </span>
            <span className="font-mono text-slate-700 dark:text-slate-300">{settings.speed}x</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={settings.speed}
            onChange={(e) => handleRangeChange('speed', parseFloat(e.target.value))}
            className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary dark:accent-secondary"
          />
        </div>

        {/* Volume Dials */}
        <div>
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
            <span className="flex items-center gap-1">
              <Volume2 size={13} />
              Speaking Volume
            </span>
            <span className="font-mono text-slate-700 dark:text-slate-300">{Math.round(settings.volume * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={settings.volume}
            onChange={(e) => handleRangeChange('volume', parseFloat(e.target.value))}
            className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary dark:accent-secondary"
          />
        </div>

        {/* Auto Speak Toggle */}
        <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-3">
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            Read Responses Automatically
          </span>
          <button
            type="button"
            onClick={handleToggleAutoSpeak}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              settings.autoSpeak ? 'bg-primary dark:bg-secondary' : 'bg-slate-200 dark:bg-slate-800'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                settings.autoSpeak ? 'translate-x-5 bg-white dark:bg-slate-950' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Hands-Free Wake Word Toggle */}
        <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-3">
          <div>
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
              <Mic size={13} className="text-primary dark:text-secondary shrink-0" />
              Hands-Free Assistant
            </span>
            <span className="text-[9px] text-slate-400 block mt-0.5">
              Listen for "Hey CampusMate" continuously.
            </span>
          </div>
          <button
            type="button"
            onClick={handleToggleHandsFree}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              settings.handsFree ? 'bg-primary dark:bg-secondary' : 'bg-slate-200 dark:bg-slate-800'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                settings.handsFree ? 'translate-x-5 bg-white dark:bg-slate-950' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
