/**
 * ttsService.ts — High-Performance VoiceManager Singleton for CollegeMate
 */

export type TTSProvider = 'google' | 'azure' | 'responsivevoice' | 'browser' | 'gemini';
export type VoiceState = 'idle' | 'loading' | 'speaking' | 'paused' | 'cancelled' | 'finished' | 'error';

export interface TTSStatus {
  english: { provider: string; ready: boolean };
  tamil: { provider: string; ready: boolean };
}

export interface TTSOptions {
  speed?: number;
  pitch?: number;
  volume?: number;
  language?: string;
  voiceURI?: string;
}

const TAMLISH_DICT: Record<string, string> = {
  'mapla': 'maapplai',
  'macha': 'machaa',
  'machaan': 'machaan',
  'machi': 'machi',
  'dei': 'daei',
  'da': 'daa',
  'di': 'dee',
  'pa': 'paa',
  'ma': 'maa',
  'semma': 'semma',
  'vera level': 'vaera level',
  'scene': 'seen',
  'mass': 'mass',
  'fire': 'fiyer',
  'goat': 'goat',
  'op': 'oh-pee',
  'cringe': 'krinje',
  'bro': 'bro',
  'epdi': 'yeppadi',
  'iruka': 'irukkaa',
  'enna': 'yenna',
  'panra': 'panra',
  'super': 'sooper',
  'eppo': 'yeppo',
  'epo': 'yepo',
  'evlo': 'yevvalavu',
  'venum': 'vaenum',
  'vendum': 'vaendum',
  'iruku': 'irukku',
  'theriyum': 'theriyum',
  'theriyala': 'theriyavillai',
  'nalla': 'nallaa',
  'vaanga': 'vaanga',
  'seri': 'seri',
  'sari': 'sari',
  'tambi': 'thambi',
  'kanna': 'kannaa',
  'yaru': 'yaaru',
  'yellam': 'yellam',
  'ellam': 'yellam',
  'unga': 'ungga',
  'inga': 'ingga',
  'anga': 'angga',
  'athu': 'adhu',
  'ithu': 'idhu',
  'ponga': 'ponga'
};

function normalizeTanglishLocal(text: string): string {
  let normalized = text;
  for (const [slang, phonetic] of Object.entries(TAMLISH_DICT)) {
    const regex = new RegExp(`\\b${slang}\\b`, 'gi');
    normalized = normalized.replace(regex, phonetic);
  }
  return normalized;
}

export function cleanForTTS(text: string): string {
  if (!text) return '';
  return text
    // Remove code blocks ```...```
    .replace(/```[\s\S]*?```/g, '')
    // Remove inline code `...`
    .replace(/`[^`]*`/g, '')
    // Remove HTML tags
    .replace(/<[^>]*>/g, '')
    // Remove JSON-like structures
    .replace(/\{[\s\S]*?\}/g, '')
    // Remove URLs
    .replace(/https?:\/\/\S+|www\.\S+/gi, '')
    // Remove Markdown links [text](url) -> text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Remove citation numbers [1], [2], [1, 2]
    .replace(/\[\d+(?:,\s*\d+)*\]/g, '')
    // Remove file extensions/names like image.png, document.pdf
    .replace(/\b[\w-]+\.(?:pdf|png|jpg|jpeg|docx?|xlsx?|txt|csv|zip)\b/gi, '')
    // Remove markdown symbols headers/bold/italic/strikethrough/lists
    .replace(/^#+\s+/gm, '')
    .replace(/[*_~`>#]/g, '')
    // Remove emojis and non-standard symbols
    .replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, '')
    // Remove bullets and dividers
    .replace(/•/g, ' ')
    .replace(/-{2,}/g, ' ')
    // Normalize newlines and duplicate spaces
    .replace(/\s+/g, ' ')
    .trim();
}

export function splitIntoSentences(text: string): string[] {
  const raw = text.split(/(?<=[.!?।])\s+|(?<=\n)\s*(?=[A-Z•\u0B80-\u0BFF])/);
  return raw
    .map(s => s.trim())
    .filter(s => s.length > 3);
}

export function detectTextLanguage(text: string): 'ta' | 'en' | 'tanglish' {
  if (/[\u0B80-\u0BFF]/.test(text)) return 'ta';
  const words = text.toLowerCase().split(/\s+/);
  const count = words.filter(w => Object.keys(TAMLISH_DICT).includes(w.replace(/[?!.,]/g, ''))).length;
  return count > 0 ? 'tanglish' : 'en';
}

interface QueueItem {
  text: string;
  opts: TTSOptions;
  isTamil: boolean;
  language: string;
  queueId: number;
}

export class VoiceManager {
  private static instance: VoiceManager;
  private queue: QueueItem[] = [];
  private queueRunning = false;
  private queueId = 0;
  private streamClosed = true;
  private cachedVoices: SpeechSynthesisVoice[] = [];
  private rvReady = false;
  private rvLoadPromise: Promise<boolean> | null = null;
  private activeAudio: HTMLAudioElement | null = null;
  private activeUtterance: SpeechSynthesisUtterance | null = null;

  private _state: VoiceState = 'idle';
  public onStateChange?: (state: VoiceState) => void;

  private constructor() {
    this.initVoices();
    this.preloadResponsiveVoice();

    const unlockAudio = () => {
      if (this.activeAudio) {
        this.activeAudio.play().catch(() => { });
      }
      if ('speechSynthesis' in window) {
        const u = new SpeechSynthesisUtterance('');
        u.volume = 0;
        window.speechSynthesis.speak(u);
      }
      document.removeEventListener('click', unlockAudio);
      document.removeEventListener('keydown', unlockAudio);
    };
    if (typeof document !== 'undefined') {
      document.addEventListener('click', unlockAudio);
      document.addEventListener('keydown', unlockAudio);
    }
  }

  public static getInstance(): VoiceManager {
    if (!VoiceManager.instance) {
      VoiceManager.instance = new VoiceManager();
    }
    return VoiceManager.instance;
  }

  private setState(newState: VoiceState) {
    if (this._state !== newState) {
      this._state = newState;
      this.onStateChange?.(newState);

      // Auto transition away from terminal states to idle to allow re-triggering
      if (newState === 'finished' || newState === 'cancelled' || newState === 'error') {
        setTimeout(() => {
          if (this._state === newState) this.setState('idle');
        }, 100);
      }
    }
  }

  public getState(): VoiceState {
    return this._state;
  }

  private initVoices() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.cachedVoices = window.speechSynthesis.getVoices();
      if (this.cachedVoices.length > 0) {
        console.log(`Voice initialized`);
      }

      window.speechSynthesis.onvoiceschanged = () => {
        this.cachedVoices = window.speechSynthesis.getVoices();
        console.log(`Voice initialized`);
      };
    }
  }

  private preloadResponsiveVoice(): Promise<boolean> {
    if (this.rvReady) return Promise.resolve(true);
    if (this.rvLoadPromise) return this.rvLoadPromise;

    this.rvLoadPromise = new Promise((resolve) => {
      if ((window as any).responsiveVoice) {
        this.rvReady = true;
        return resolve(true);
      }
      const script = document.createElement('script');
      script.src = 'https://code.responsivevoice.org/responsivevoice.js';
      script.async = true;
      script.onload = () => { this.rvReady = true; resolve(true); };
      script.onerror = () => resolve(false);
      document.head.appendChild(script);
    });
    return this.rvLoadPromise;
  }

  private getVoicesOnce(): SpeechSynthesisVoice[] {
    if (this.cachedVoices.length > 0) return this.cachedVoices;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.cachedVoices = window.speechSynthesis.getVoices();
    }
    return this.cachedVoices;
  }

  public cancelAllSpeech(): void {
    this.queueId++;
    this.queue.length = 0;
    this.queueRunning = false;
    this.streamClosed = true;

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if ((window as any).responsiveVoice?.isPlaying?.()) {
      (window as any).responsiveVoice.cancel();
    }
    if (this.activeAudio) {
      this.activeAudio.pause();
      this.activeAudio.currentTime = 0;
      this.activeAudio = null;
    }
    this.activeUtterance = null;

    console.log("Voice Cancelled");
    console.log("Queue Cleared");
    this.setState('cancelled');
  }

  public pauseAllSpeech(): void {
    if ('speechSynthesis' in window) window.speechSynthesis.pause();
    if ((window as any).responsiveVoice?.isPlaying?.()) (window as any).responsiveVoice.pause();
    if (this.activeAudio) this.activeAudio.pause();
    this.setState('paused');
  }

  public resumeAllSpeech(): void {
    if ('speechSynthesis' in window) window.speechSynthesis.resume();
    if ((window as any).responsiveVoice) (window as any).responsiveVoice.resume();
    if (this.activeAudio) this.activeAudio.play();
    this.setState('speaking');
  }

  public async getStatus(): Promise<TTSStatus> {
    const voices = this.getVoicesOnce();
    const hasEnglishNative = voices.some(v => v.lang.startsWith('en'));

    let englishProvider = hasEnglishNative ? 'Browser Native' : 'ResponsiveVoice (Cloud)';
    let tamilProvider = this.rvReady ? 'ResponsiveVoice (Cloud)' : 'Loading…';

    return {
      english: { provider: englishProvider, ready: true },
      tamil: { provider: tamilProvider, ready: this.rvReady },
    };
  }

  public async speak(rawText: string, opts: TTSOptions = {}): Promise<void> {
    if (!rawText?.trim()) return;

    this.cancelAllSpeech();
    const myId = this.queueId;
    this.streamClosed = true;
    this.setState('loading');

    const detectedLang = detectTextLanguage(rawText);

    let textToSpeak = rawText;
    let language = opts.language ?? (detectedLang === 'en' ? 'en-IN' : 'ta-IN');
    let isTamil = detectedLang !== 'en';

    if (detectedLang === 'tanglish') {
      textToSpeak = normalizeTanglishLocal(rawText);
      isTamil = true;
      language = 'ta-IN';
    }

    const cleaned = cleanForTTS(textToSpeak);
    if (!cleaned) {
      this.setState('finished');
      return;
    }

    this.queue.push({ text: cleaned, opts, isTamil, language, queueId: myId });
    await this.processQueue();
  }

  public speakStream(opts: TTSOptions = {}): { push: (chunk: string) => void; flush: () => void; cancel: () => void } {
    this.cancelAllSpeech();
    const myId = this.queueId;
    this.streamClosed = false;
    this.setState('loading');

    let pendingBuffer = '';

    const enqueue = (text: string) => {
      if (!text.trim()) return;
      const detectedLang = detectTextLanguage(text);
      let textToSpeak = text;
      let language = opts.language ?? (detectedLang === 'en' ? 'en-IN' : 'ta-IN');
      let isTamil = detectedLang !== 'en';

      if (detectedLang === 'tanglish') {
        textToSpeak = normalizeTanglishLocal(text);
        isTamil = true;
        language = 'ta-IN';
      }

      const cleaned = cleanForTTS(textToSpeak);
      if (!cleaned || myId !== this.queueId) return;

      this.queue.push({ text: cleaned, opts, isTamil, language, queueId: myId });

      if (!this.queueRunning) {
        this.processQueue();
      }
    };

    return {
      push: (chunk: string) => {
        if (myId !== this.queueId) return;
        pendingBuffer += chunk;
        const sentences = splitIntoSentences(pendingBuffer);
        if (sentences.length > 1) {
          const complete = sentences.slice(0, -1);
          pendingBuffer = sentences[sentences.length - 1];
          complete.forEach(s => enqueue(s));
        }
      },
      flush: () => {
        if (myId !== this.queueId) return;
        if (pendingBuffer.trim()) {
          enqueue(pendingBuffer.trim());
          pendingBuffer = '';
        }
        this.streamClosed = true;
        if (!this.queueRunning && this.queue.length === 0) {
          this.setState('finished');
        }
      },
      cancel: () => {
        this.cancelAllSpeech();
      },
    };
  }

  private async processQueue() {
    if (this.queueRunning) return;
    this.queueRunning = true;

    while (this.queue.length > 0) {
      if (this._state === 'cancelled' || this._state === 'error') break;
      const item = this.queue.shift()!;
      if (item.queueId !== this.queueId) continue;
      await this.speakOne(item, 0);
    }

    this.queueRunning = false;
    if (this.streamClosed && this.queue.length === 0 && this._state !== 'cancelled' && this._state !== 'error') {
      this.setState('finished');
    }
  }

  private speakOne(item: QueueItem, retryCount: number = 0): Promise<void> {
    return new Promise<void>((resolve) => {
      if (item.queueId !== this.queueId || this._state === 'cancelled') return resolve();

      let isDone = false;
      let safetyTimeout: ReturnType<typeof setTimeout>;

      const onDone = () => {
        if (isDone) return;
        isDone = true;
        clearTimeout(safetyTimeout);
        resolve();
      };

      const onFail = () => {
        if (isDone) return;
        isDone = true;
        clearTimeout(safetyTimeout);
        console.warn("Speech error");

        if (retryCount < 2 && item.queueId === this.queueId && this._state !== 'cancelled') {
          this.speakOne(item, retryCount + 1).then(resolve);
          return;
        }

        this.setState('error');
        resolve();
      };

      // Safety timeout is strictly for preventing stuck states. It does not hide the bar directly.
      safetyTimeout = setTimeout(() => {
        if (!isDone && this._state !== 'cancelled') {
          this.activeUtterance = null;
          if (this.activeAudio) {
            this.activeAudio.pause();
            this.activeAudio = null;
          }
          onFail();
        }
      }, 30000);

      const tryFallbackChain = async () => {
        const voices = this.getVoicesOnce();

        // 1. Browser Speech Synthesis
        if ('speechSynthesis' in window && voices.length > 0) {
          const nativeSuccess = await new Promise<boolean>((resolveNative) => {
            this.speakWithBrowser(item.text, item.language, item.isTamil, item.opts,
              () => resolveNative(true),
              () => resolveNative(false)
            );
          });
          if (nativeSuccess) return;
        }

        // 2. ResponsiveVoice
        if (this.rvReady && (window as any).responsiveVoice) {
          const rvSuccess = await new Promise<boolean>((resolveRV) => {
            const voice = item.isTamil ? 'Tamil Female' : 'UK English Female';
            (window as any).responsiveVoice.speak(item.text, voice, {
              rate: item.opts.speed ?? 1.0,
              volume: item.opts.volume ?? 1.0,
              pitch: item.opts.pitch ?? 1.0,
              onstart: () => {
                this.setState('speaking');
                console.log("Voice started");
              },
              onend: () => {
                console.log("Voice finished");
                resolveRV(true);
              },
              onerror: () => resolveRV(false),
            });
            // Manual fallback if responsive voice doesn't have onstart/onend natively correctly working
            if (!(window as any).responsiveVoice.isPlaying()) {
              this.setState('speaking');
              console.log("Voice started");
            }
            const checkEnd = setInterval(() => {
              if (!(window as any).responsiveVoice.isPlaying()) {
                clearInterval(checkEnd);
                resolveRV(true);
              }
            }, 500);
          });
          if (rvSuccess) return;
        }

        // 3. Gemini TTS API (Fallback if configured)
        if (import.meta.env.VITE_GEMINI_TTS_KEY) {
          const geminiSuccess = await this.speakWithGemini(item.text, item.language, item.opts, onDone, onFail);
          if (geminiSuccess) return;
        }

        throw new Error("All TTS providers failed");
      };

      tryFallbackChain().catch(onFail);
    });
  }

  private async speakWithGemini(text: string, language: string, opts: TTSOptions, onEnd: () => void, onError: () => void): Promise<boolean> {
    const key = import.meta.env.VITE_GEMINI_TTS_KEY;
    if (!key) return false;
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/tts-model:synthesize?key=${key}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text,
          language: language
        }),
      });
      if (!res.ok) return false;
      const data = await res.json();
      if (!data.audioContent) return false;

      const audio = new Audio(`data:audio/mp3;base64,${data.audioContent}`);
      this.activeAudio = audio;
      audio.volume = opts.volume ?? 1.0;
      audio.playbackRate = opts.speed ?? 1.0;

      audio.onplay = () => { this.setState('speaking'); console.log("Voice started"); };
      audio.onended = () => { console.log("Voice finished"); this.activeAudio = null; onEnd(); };
      audio.onerror = () => { console.warn("Speech error"); this.activeAudio = null; onError(); };

      await audio.play();
      return true;
    } catch { return false; }
  }

  private speakWithBrowser(text: string, language: string, isTamil: boolean, opts: TTSOptions, onEnd: () => void, onError: () => void): void {
    if (!('speechSynthesis' in window)) { onError(); return; }

    window.speechSynthesis.cancel();
    const voices = this.getVoicesOnce();

    if (voices.length === 0) {
      onError();
      return;
    }

    let voice: SpeechSynthesisVoice | undefined = undefined;

    if (opts.voiceURI) {
      voice = voices.find(v => v.voiceURI === opts.voiceURI);
    }

    if (!voice) {
      const prefs = isTamil ? ['Google Tamil', 'Tamil', 'ta-IN'] : ['Microsoft David', 'Microsoft Zira', 'Google US English', 'Google UK English'];
      for (const pref of prefs) {
        voice = voices.find(v => v.name.includes(pref));
        if (voice) break;
      }
      if (!voice) voice = voices.find(v => v.lang === language);
      if (!voice) voice = voices.find(v => v.lang.startsWith(isTamil ? 'ta' : 'en'));
    }

    const utterance = new SpeechSynthesisUtterance(text);
    this.activeUtterance = utterance;

    if (voice) {
      utterance.voice = voice;
      console.log(`Voice selected: ${voice.name}`);
    } else {
      console.log(`Voice selected: Browser Default`);
    }

    utterance.lang = language;
    utterance.rate = opts.speed ?? 1.0;
    utterance.volume = opts.volume ?? 1.0;
    utterance.pitch = opts.pitch ?? 1.0;

    utterance.onstart = () => {
      this.setState('speaking');
      console.log("Voice started");
    };

    utterance.onend = () => {
      console.log("Voice finished");
      this.activeUtterance = null;
      onEnd();
    };

    utterance.onerror = (e) => {
      console.warn("Speech error");
      this.activeUtterance = null;
      onError();
    };

    window.speechSynthesis.speak(utterance);
  }
}

export const voiceManager = VoiceManager.getInstance();
