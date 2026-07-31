/**
 * ttsService.ts
 * 
 * Production-quality Text-to-Speech service for CampusMate.
 * Supports multilingual output (English, Tamil, Tanglish) via a provider
 * priority chain: Cloud (Google/Azure) → ResponsiveVoice → Browser Native.
 *
 * Environment variables (in frontend/.env):
 *   VITE_TTS_PROVIDER=responsivevoice | google | azure | browser
 *   VITE_GOOGLE_TTS_KEY=your_google_key
 *   VITE_AZURE_TTS_KEY=your_azure_key
 *   VITE_AZURE_TTS_REGION=eastus
 *   VITE_API_URL=http://127.0.0.1:8000
 */

export type TTSProvider = 'google' | 'azure' | 'responsivevoice' | 'browser';

export interface TTSStatus {
  english: { provider: string; ready: boolean };
  tamil: { provider: string; ready: boolean };
}

export interface TTSOptions {
  speed?: number;  // 0.5 – 2.0
  pitch?: number;  // 0.5 – 2.0
  volume?: number; // 0.0 – 1.0
  language?: string; // e.g. 'en-IN', 'ta-IN'
  voiceURI?: string;
}

// ─── Utility: Clean text for TTS ──────────────────────────────────────────────

export function cleanForTTS(text: string): string {
  return text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')    // markdown links → text
    .replace(/[*_~`>#]/g, '')                     // markdown symbols
    .replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, '') // emojis
    .replace(/•/g, ' ')
    .replace(/---+/g, '')
    .replace(/-{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// ─── Language Detection ────────────────────────────────────────────────────────

export function detectTextLanguage(text: string): 'ta' | 'en' | 'tanglish' {
  const hasTamilScript = /[\u0B80-\u0BFF]/.test(text);
  if (hasTamilScript) return 'ta';

  const tanglishWords = [
    'mapla', 'bro', 'da', 'di', 'pa', 'ma', 'anna', 'akka', 'thala',
    'eppo', 'epo', 'enna', 'endha', 'evlo', 'ethu', 'enga', 'enna',
    'sollu', 'sollunga', 'sollu', 'venum', 'vendum', 'iruka', 'iruku',
    'pannunga', 'paru', 'paaru', 'kodunga', 'kudukka', 'theriyum',
    'theriyala', 'puriyala', 'puricha', 'nalla', 'naala', 'super',
    'yaru', 'yaaru', 'yenna', 'yellam', 'ellam', 'unga', 'unga',
    'inga', 'anga', 'athu', 'ithu', 'etho', 'seri', 'sari', 'tambi',
    'kanna', 'machaan', 'machi', 'vaanga', 'ponga', 'vaa', 'paa',
  ];
  const words = text.toLowerCase().split(/\s+/);
  const tanglishCount = words.filter(w =>
    tanglishWords.includes(w.replace(/[?!.,]/g, ''))
  ).length;

  return tanglishCount > 0 ? 'tanglish' : 'en';
}

// ─── Provider: Normalize Tanglish via Backend ──────────────────────────────────

async function normalizeTanglish(text: string): Promise<{ text: string; language: string }> {
  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
    const res = await fetch(`${apiUrl}/api/v1/voice/normalize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    if (res.ok) {
      const data = await res.json();
      return { text: data.text, language: data.language };
    }
  } catch {
    // Network error — fall through
  }
  return { text, language: 'en-IN' };
}

// ─── Provider: Google Cloud TTS ───────────────────────────────────────────────

async function speakWithGoogle(
  text: string,
  language: string,
  opts: TTSOptions,
  onEnd: () => void,
  onError: () => void
): Promise<boolean> {
  const key = import.meta.env.VITE_GOOGLE_TTS_KEY;
  if (!key) return false;

  try {
    const voiceName = language.startsWith('ta')
      ? 'ta-IN-Neural2-A'
      : 'en-IN-Neural2-A';

    const body = {
      input: { text },
      voice: { languageCode: language.startsWith('ta') ? 'ta-IN' : 'en-IN', name: voiceName },
      audioConfig: {
        audioEncoding: 'MP3',
        speakingRate: opts.speed ?? 1.0,
        pitch: (opts.pitch ?? 1.0) * 4 - 4,
        volumeGainDb: opts.volume !== undefined ? (opts.volume - 1) * 6 : 0,
      },
    };

    const res = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${key}`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
    );

    if (!res.ok) return false;
    const data = await res.json();
    const audioContent = data.audioContent;
    const audioSrc = `data:audio/mp3;base64,${audioContent}`;
    const audio = new Audio(audioSrc);
    audio.volume = opts.volume ?? 1.0;
    audio.playbackRate = opts.speed ?? 1.0;
    audio.onended = onEnd;
    audio.onerror = onError;
    await audio.play();
    return true;
  } catch {
    return false;
  }
}

// ─── Provider: Azure Cognitive Speech TTS ─────────────────────────────────────

async function speakWithAzure(
  text: string,
  language: string,
  opts: TTSOptions,
  onEnd: () => void,
  onError: () => void
): Promise<boolean> {
  const key = import.meta.env.VITE_AZURE_TTS_KEY;
  const region = import.meta.env.VITE_AZURE_TTS_REGION || 'eastus';
  if (!key) return false;

  try {
    const voiceName = language.startsWith('ta')
      ? 'ta-IN-PallaviNeural'
      : 'en-IN-NeerjaNeural';

    const ssml = `<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='${language.startsWith('ta') ? 'ta-IN' : 'en-IN'}'>
      <voice name='${voiceName}'>
        <prosody rate='${(opts.speed ?? 1.0) * 100}%' pitch='${Math.round(((opts.pitch ?? 1.0) - 1.0) * 50)}%' volume='${Math.round((opts.volume ?? 1.0) * 100)}'>
          ${text.replace(/</g, '&lt;').replace(/>/g, '&gt;')}
        </prosody>
      </voice>
    </speak>`;

    const res = await fetch(
      `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`,
      {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': key,
          'Content-Type': 'application/ssml+xml',
          'X-Microsoft-OutputFormat': 'audio-24khz-48kbitrate-mono-mp3',
        },
        body: ssml,
      }
    );

    if (!res.ok) return false;
    const blob = await res.blob();
    const audioUrl = URL.createObjectURL(blob);
    const audio = new Audio(audioUrl);
    audio.volume = opts.volume ?? 1.0;
    audio.playbackRate = opts.speed ?? 1.0;
    audio.onended = () => { URL.revokeObjectURL(audioUrl); onEnd(); };
    audio.onerror = () => { URL.revokeObjectURL(audioUrl); onError(); };
    await audio.play();
    return true;
  } catch {
    return false;
  }
}

// ─── Provider: ResponsiveVoice (Free cloud TTS, no key needed) ────────────────

let rvLoaded = false;

async function loadRV(): Promise<boolean> {
  if (rvLoaded || (window as any).responsiveVoice) {
    rvLoaded = true;
    return true;
  }
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://code.responsivevoice.org/responsivevoice.js';
    script.async = true;
    script.onload = () => { rvLoaded = true; resolve(true); };
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });
}

async function speakWithResponsiveVoice(
  text: string,
  isTamil: boolean,
  opts: TTSOptions,
  onEnd: () => void,
  onError: () => void
): Promise<boolean> {
  const ok = await loadRV();
  if (!ok || !(window as any).responsiveVoice) return false;

  const voice = isTamil ? 'Tamil Female' : 'Indian English Female';
  (window as any).responsiveVoice.speak(text, voice, {
    rate: opts.speed ?? 1.0,
    pitch: opts.pitch ?? 1.0,
    volume: opts.volume ?? 1.0,
    onend: onEnd,
    onerror: onError,
  });
  return true;
}

// ─── Provider: Browser Native SpeechSynthesis ─────────────────────────────────

// ─── Provider: Browser Native SpeechSynthesis ─────────────────────────────────

let speechKeepAliveInterval: any = null;

function clearKeepAlive() {
  if (speechKeepAliveInterval) {
    clearInterval(speechKeepAliveInterval);
    speechKeepAliveInterval = null;
  }
}

function speakWithBrowser(
  text: string,
  language: string,
  isTamil: boolean,
  opts: TTSOptions,
  onStart: () => void,
  onEnd: () => void,
  onError: () => void
): void {
  if (!('speechSynthesis' in window)) {
    onError();
    return;
  }

  const doSpeak = () => {
    try {
      window.speechSynthesis.cancel();
      clearKeepAlive();

      const available = window.speechSynthesis.getVoices();
      let voice = opts.voiceURI ? available.find(v => v.voiceURI === opts.voiceURI) : undefined;
      if (!voice) voice = available.find(v => v.lang === language);
      if (!voice) voice = available.find(v => v.lang.startsWith(isTamil ? 'ta' : 'en'));
      if (!voice && available.length > 0) voice = available[0];

      const utterance = new SpeechSynthesisUtterance(text);
      if (voice) utterance.voice = voice;
      utterance.lang = language || (isTamil ? 'ta-IN' : 'en-US');
      utterance.rate = opts.speed ?? 1.0;
      utterance.pitch = opts.pitch ?? 1.0;
      utterance.volume = opts.volume ?? 1.0;

      utterance.onstart = () => {
        onStart();
        // Chrome keepalive timer to prevent pause on long text (>15s)
        clearKeepAlive();
        speechKeepAliveInterval = setInterval(() => {
          if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
            window.speechSynthesis.pause();
            window.speechSynthesis.resume();
          } else {
            clearKeepAlive();
          }
        }, 12000);
      };

      utterance.onend = () => {
        clearKeepAlive();
        onEnd();
      };

      utterance.onerror = (e) => {
        console.error('SpeechSynthesis error:', e);
        clearKeepAlive();
        onError();
      };

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.error('Failed in speakWithBrowser:', err);
      clearKeepAlive();
      onError();
    }
  };

  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) {
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.onvoiceschanged = null;
      doSpeak();
    };
    // Fallback trigger if onvoiceschanged doesn't fire
    setTimeout(doSpeak, 250);
  } else {
    doSpeak();
  }
}


// ─── Public API: cancelSpeech ─────────────────────────────────────────────────

export function cancelAllSpeech(): void {
  clearKeepAlive();
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  if ((window as any).responsiveVoice?.isPlaying?.()) {
    (window as any).responsiveVoice.cancel();
  }
}

export function pauseAllSpeech(): void {
  if ('speechSynthesis' in window) window.speechSynthesis.pause();
  if ((window as any).responsiveVoice?.isPlaying?.()) {
    (window as any).responsiveVoice.pause();
  }
}

export function resumeAllSpeech(): void {
  if ('speechSynthesis' in window) window.speechSynthesis.resume();
  if ((window as any).responsiveVoice) {
    (window as any).responsiveVoice.resume();
  }
}

// ─── Public API: getTTSStatus ─────────────────────────────────────────────────

export async function getTTSStatus(): Promise<TTSStatus> {
  const provider = (import.meta.env.VITE_TTS_PROVIDER || 'browser') as TTSProvider;
  const hasGoogle = !!import.meta.env.VITE_GOOGLE_TTS_KEY;
  const hasAzure = !!import.meta.env.VITE_AZURE_TTS_KEY;
  const nativeVoices = 'speechSynthesis' in window ? window.speechSynthesis.getVoices() : [];
  const hasTamilNative = nativeVoices.some(v => v.lang.startsWith('ta'));
  const hasEnglishNative = nativeVoices.some(v => v.lang.startsWith('en'));

  let englishProvider = 'Browser Native';
  let tamilProvider = hasTamilNative ? 'Browser Native (Tamil)' : 'ResponsiveVoice / Native Fallback';

  if (provider === 'google' && hasGoogle) { englishProvider = 'Google Neural (en-IN)'; tamilProvider = 'Google Neural (ta-IN)'; }
  else if (provider === 'azure' && hasAzure) { englishProvider = 'Azure Pallavi Neural'; tamilProvider = 'Azure Pallavi Neural (ta-IN)'; }

  return {
    english: { provider: englishProvider, ready: true },
    tamil: { provider: tamilProvider, ready: true },
  };
}

// ─── Public API: speak ────────────────────────────────────────────────────────

export async function speak(
  rawText: string,
  opts: TTSOptions = {},
  callbacks: {
    onStart?: () => void;
    onEnd?: () => void;
    onError?: () => void;
  } = {}
): Promise<void> {
  if (!rawText?.trim()) return;

  const onStart = callbacks.onStart ?? (() => {});
  const onEnd = callbacks.onEnd ?? (() => {});
  const onError = callbacks.onError ?? (() => {});

  // 1. Cancel any ongoing speech
  cancelAllSpeech();

  // 2. Detect language
  const detectedLang = detectTextLanguage(rawText);

  // 3. Normalize Tanglish via backend or use rawText directly
  let textToSpeak = rawText;
  let language = opts.language ?? (detectedLang === 'en' ? 'en-IN' : 'ta-IN');
  let isTamil = detectedLang !== 'en';

  if (detectedLang === 'tanglish') {
    const normalized = await normalizeTanglish(rawText);
    textToSpeak = normalized.text;
    language = normalized.language;
    isTamil = language.startsWith('ta');
  } else if (detectedLang === 'ta') {
    isTamil = true;
  }

  // 4. Clean text
  const cleaned = cleanForTTS(textToSpeak);
  if (!cleaned) return;

  onStart();

  // 5. Try providers in priority order
  const provider = (import.meta.env.VITE_TTS_PROVIDER || 'browser') as TTSProvider;

  if (provider === 'google') {
    const ok = await speakWithGoogle(cleaned, language, opts, onEnd, onError);
    if (ok) return;
  }

  if (provider === 'azure') {
    const ok = await speakWithAzure(cleaned, language, opts, onEnd, onError);
    if (ok) return;
  }

  if (provider === 'responsivevoice') {
    const ok = await speakWithResponsiveVoice(cleaned, isTamil, opts, onEnd, onError);
    if (ok) return;
  }

  // Primary default / robust fallback: browser native speech synthesis
  speakWithBrowser(cleaned, language, isTamil, opts, onStart, onEnd, onError);
}
