/**
 * ttsService.ts — High-Performance VoiceManager Singleton for CampusMate
 */

export type TTSProvider = 'google' | 'azure' | 'responsivevoice' | 'browser';

export interface TTSStatus {
  english: { provider: string; ready: boolean };
  tamil: { provider: string; ready: boolean };
}

export interface TTSOptions {
<<<<<<< HEAD
  speed?: number;  // 0.5 – 2.0
  pitch?: number;  // 0.5 – 2.0
  volume?: number; // 0.0 – 1.0
  language?: string; // e.g. 'en-IN', 'ta-IN'
  voiceURI?: string;
=======
  speed?: number;
  volume?: number;
  language?: string;
>>>>>>> d97d820d3971d9c550c190a6427c639a119b7de9
}

// ─── Performance Logger ───────────────────────────────────────────────────────
class PerfTimer {
  private marks: Record<string, number> = {};
  private start = performance.now();

  mark(label: string) {
    this.marks[label] = performance.now() - this.start;
  }

  report() {
    const total = performance.now() - this.start;
    const lines = Object.entries(this.marks)
      .map(([k, v]) => `  ${k}: ${v.toFixed(0)}ms`)
      .join('\n');
    console.log(`[VoiceManager Perf] Total: ${total.toFixed(0)}ms\n${lines}`);
  }
}

// ─── Gen-Z Tanglish Phonetic Dictionary ────────────────────────────────────────
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

// ─── Text Utilities ───────────────────────────────────────────────────────────
export function cleanForTTS(text: string): string {
  return text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_~`>#]/g, '')
    .replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, '')
    .replace(/•/g, ' ')
    .replace(/---+/g, '')
    .replace(/-{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
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

// ─── VoiceManager Singleton ───────────────────────────────────────────────────

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
  private cachedVoices: SpeechSynthesisVoice[] = [];
  private rvReady = false;
  private rvLoadPromise: Promise<boolean> | null = null;
  private activeAudio: HTMLAudioElement | null = null;
  private activeUtterance: SpeechSynthesisUtterance | null = null;

  // React event subscribers
  public onStart?: () => void;
  public onEnd?: () => void;
  public onError?: () => void;
  public onPause?: () => void;
  public onResume?: () => void;
  private isSpeakingSession = false;

  private constructor() {
    this.initVoices();
    this.preloadResponsiveVoice();
    
    // Auto-resume AudioContext on first user interaction if locked
    const unlockAudio = () => {
      if (this.activeAudio) {
        this.activeAudio.play().catch(() => {});
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

  private initVoices() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      console.log("[Voice] Initializing");
      this.cachedVoices = window.speechSynthesis.getVoices();
      if (this.cachedVoices.length > 0) {
        console.log(`[Voice] Voices Loaded (${this.cachedVoices.length})`);
      }
      
      if (this.cachedVoices.length === 0) {
        window.speechSynthesis.onvoiceschanged = () => {
          this.cachedVoices = window.speechSynthesis.getVoices();
          console.log(`[Voice] Voices Loaded on voiceschanged (${this.cachedVoices.length})`);
        };
      }
    }
  }

  private preloadResponsiveVoice(): Promise<boolean> {
    if (this.rvReady) return Promise.resolve(true);
    if (this.rvLoadPromise) return this.rvLoadPromise;

<<<<<<< HEAD
    const body = {
      input: { text },
      voice: { languageCode: language.startsWith('ta') ? 'ta-IN' : 'en-IN', name: voiceName },
      audioConfig: {
        audioEncoding: 'MP3',
        speakingRate: opts.speed ?? 1.0,
        pitch: (opts.pitch ?? 1.0) * 4 - 4,
        volumeGainDb: opts.volume !== undefined ? (opts.volume - 1) * 6 : 0,
      },
=======
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
    this.cachedVoices = window.speechSynthesis.getVoices();
    return this.cachedVoices;
  }

  // ─── Public API ───

  public cancelAllSpeech(): void {
    console.log("[VoiceManager] Canceling all speech");
    this.queueId++;
    this.queue.length = 0;
    this.queueRunning = false;
    this.isSpeakingSession = false;
    
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
    this.onEnd?.();
  }

  public pauseAllSpeech(): void {
    if ('speechSynthesis' in window) window.speechSynthesis.pause();
    if ((window as any).responsiveVoice?.isPlaying?.()) (window as any).responsiveVoice.pause();
    if (this.activeAudio) this.activeAudio.pause();
  }

  public resumeAllSpeech(): void {
    if ('speechSynthesis' in window) window.speechSynthesis.resume();
    if ((window as any).responsiveVoice) (window as any).responsiveVoice.resume();
    if (this.activeAudio) this.activeAudio.play();
  }

  public async getStatus(): Promise<TTSStatus> {
    const provider = (import.meta.env.VITE_TTS_PROVIDER || 'responsivevoice') as TTSProvider;
    const hasGoogle = !!import.meta.env.VITE_GOOGLE_TTS_KEY;
    const hasAzure = !!import.meta.env.VITE_AZURE_TTS_KEY;
    const voices = this.getVoicesOnce();
    const hasEnglishNative = voices.some(v => v.lang.startsWith('en'));

    let englishProvider = hasEnglishNative ? 'Browser Native' : 'ResponsiveVoice (Cloud)';
    let tamilProvider = this.rvReady ? 'ResponsiveVoice (Cloud)' : 'Loading…';

    if (provider === 'google' && hasGoogle) { englishProvider = 'Google Neural (en-IN)'; tamilProvider = 'Google Neural (ta-IN)'; }
    else if (provider === 'azure' && hasAzure) { englishProvider = 'Azure NeerjaNeural'; tamilProvider = 'Azure PallaviNeural (ta-IN)'; }

    return {
      english: { provider: englishProvider, ready: true },
      tamil: { provider: tamilProvider, ready: this.rvReady },
    };
  }

  public async speak(rawText: string, opts: TTSOptions = {}): Promise<void> {
    if (!rawText?.trim()) return;
    const perf = new PerfTimer();
    
    this.cancelAllSpeech();
    const myId = this.queueId;
    perf.mark('queue_cleared');

    const detectedLang = detectTextLanguage(rawText);
    perf.mark('lang_detected');

    let textToSpeak = rawText;
    let language = opts.language ?? (detectedLang === 'en' ? 'en-IN' : 'ta-IN');
    let isTamil = detectedLang !== 'en';

    if (detectedLang === 'tanglish') {
      textToSpeak = normalizeTanglishLocal(rawText);
      isTamil = true;
      language = 'ta-IN';
      perf.mark('tanglish_normalized');
    }

    const cleaned = cleanForTTS(textToSpeak);
    if (!cleaned) return;

    this.startSession();
    perf.mark('speech_started');

    this.queue.push({ text: cleaned, opts, isTamil, language, queueId: myId });
    await this.processQueue(perf);
  }

  public speakStream(opts: TTSOptions = {}): { push: (chunk: string) => void; flush: () => void; cancel: () => void } {
    this.cancelAllSpeech();
    const myId = this.queueId;

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

      this.startSession();
      this.queue.push({ text: cleaned, opts, isTamil, language, queueId: myId });

      if (!this.queueRunning) {
        this.processQueue(new PerfTimer());
      }
>>>>>>> d97d820d3971d9c550c190a6427c639a119b7de9
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
        if (pendingBuffer.trim()) {
          enqueue(pendingBuffer.trim());
          pendingBuffer = '';
        }
      },
      cancel: () => {
        this.cancelAllSpeech();
      },
    };
  }

  // ─── Internal Processing ───

  private startSession() {
    if (!this.isSpeakingSession) {
      this.isSpeakingSession = true;
      this.onStart?.();
    }
  }

  private endSession() {
    if (this.isSpeakingSession) {
      this.isSpeakingSession = false;
      this.onEnd?.();
    }
  }

<<<<<<< HEAD
    const ssml = `<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='${language.startsWith('ta') ? 'ta-IN' : 'en-IN'}'>
      <voice name='${voiceName}'>
        <prosody rate='${(opts.speed ?? 1.0) * 100}%' pitch='${Math.round(((opts.pitch ?? 1.0) - 1.0) * 50)}%' volume='${Math.round((opts.volume ?? 1.0) * 100)}'>
          ${text.replace(/</g, '&lt;').replace(/>/g, '&gt;')}
        </prosody>
      </voice>
    </speak>`;
=======
  private async processQueue(perf: PerfTimer) {
    if (this.queueRunning) return;
    this.queueRunning = true;
>>>>>>> d97d820d3971d9c550c190a6427c639a119b7de9

    while (this.queue.length > 0) {
      const item = this.queue.shift()!;
      if (item.queueId !== this.queueId) continue;
      await this.speakOne(item, 0);
    }

    this.queueRunning = false;
    perf.mark('queue_exhausted');
    perf.report();
    this.endSession();
  }

  private speakOne(item: QueueItem, retryCount: number = 0): Promise<void> {
    return new Promise<void>((resolve) => {
      if (item.queueId !== this.queueId) return resolve();

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
        console.error("[Voice] Speech Error for:", item.text);
        
        // Auto-Retry Logic (max 3 times)
        if (retryCount < 3 && item.queueId === this.queueId) {
          console.log(`[Voice] Retry (${retryCount + 1}/3)`);
          this.speakOne(item, retryCount + 1).then(resolve);
          return;
        }
        
        console.error("[Voice] Failed entirely after retries:", item.text);
        this.onError?.();
        resolve();
      };

      // 30-second absolute safety timeout to prevent permanent hanging
      safetyTimeout = setTimeout(() => {
        console.warn("[VoiceManager] Absolute safety timeout triggered for:", item.text);
        this.activeUtterance = null;
        if (this.activeAudio) {
          this.activeAudio.pause();
          this.activeAudio = null;
        }
        onFail();
      }, 30000);

      const provider = (import.meta.env.VITE_TTS_PROVIDER || 'responsivevoice') as TTSProvider;

      const tryCloud = async (): Promise<boolean> => {
        if (provider === 'google' && import.meta.env.VITE_GOOGLE_TTS_KEY) {
          return this.speakWithGoogle(item.text, item.language, item.opts, onDone, onFail);
        }
        if (provider === 'azure' && import.meta.env.VITE_AZURE_TTS_KEY) {
          return this.speakWithAzure(item.text, item.language, item.opts, onDone, onFail);
        }
        return false;
      };

      const race = async () => {
        const cloudPromise = tryCloud();
        const timeout = new Promise<false>((r) => setTimeout(() => r(false), 2000));
        const cloudOk = await Promise.race([cloudPromise, timeout]);
        if (cloudOk) return;

        // Browser Native for English (Priority 1)
        if (!item.isTamil && provider !== 'responsivevoice') {
          const nativeSuccess = this.speakWithBrowser(item.text, item.language, item.isTamil, item.opts, onDone, onFail);
          if (nativeSuccess) return;
        }

        // ResponsiveVoice fallback (Primary for Tamil)
        if (this.rvReady && (window as any).responsiveVoice) {
          const voice = item.isTamil ? 'Tamil Female' : 'Indian English Female';
          (window as any).responsiveVoice.speak(item.text, voice, {
            rate: item.opts.speed ?? 1.0,
            volume: item.opts.volume ?? 1.0,
            onend: onDone,
            onerror: () => {
              // Final fallback to browser native
              this.speakWithBrowser(item.text, item.language, item.isTamil, item.opts, onDone, onFail);
            },
          });
          return;
        }

        // Last resort Browser Native
        this.speakWithBrowser(item.text, item.language, item.isTamil, item.opts, onDone, onFail);
      };

      race().catch(onFail);
    });
  }

  private async speakWithGoogle(text: string, language: string, opts: TTSOptions, onEnd: () => void, onError: () => void): Promise<boolean> {
    const key = import.meta.env.VITE_GOOGLE_TTS_KEY;
    if (!key) return false;
    try {
      const res = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${key}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: { text },
          voice: {
            languageCode: language.startsWith('ta') ? 'ta-IN' : 'en-IN',
            name: language.startsWith('ta') ? 'ta-IN-Neural2-A' : 'en-IN-Neural2-A',
          },
          audioConfig: {
            audioEncoding: 'MP3',
            speakingRate: opts.speed ?? 1.0,
            volumeGainDb: opts.volume !== undefined ? (opts.volume - 1) * 6 : 0,
          },
        }),
      });
      if (!res.ok) return false;
      const data = await res.json();
      const audio = new Audio(`data:audio/mp3;base64,${data.audioContent}`);
      this.activeAudio = audio;
      audio.volume = opts.volume ?? 1.0;
      audio.playbackRate = opts.speed ?? 1.0;
      audio.onended = () => { this.activeAudio = null; onEnd(); };
      audio.onerror = () => { this.activeAudio = null; onError(); };
      await audio.play();
      return true;
    } catch { return false; }
  }

  private async speakWithAzure(text: string, language: string, opts: TTSOptions, onEnd: () => void, onError: () => void): Promise<boolean> {
    const key = import.meta.env.VITE_AZURE_TTS_KEY;
    const region = import.meta.env.VITE_AZURE_TTS_REGION || 'eastus';
    if (!key) return false;
    try {
      const voice = language.startsWith('ta') ? 'ta-IN-PallaviNeural' : 'en-IN-NeerjaNeural';
      const ssml = `<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='${language.startsWith('ta') ? 'ta-IN' : 'en-IN'}'><voice name='${voice}'><prosody rate='${(opts.speed ?? 1.0) * 100}%'>${text.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</prosody></voice></speak>`;
      const res = await fetch(`https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`, {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': key,
          'Content-Type': 'application/ssml+xml',
          'X-Microsoft-OutputFormat': 'audio-24khz-48kbitrate-mono-mp3',
        },
        body: ssml,
      });
      if (!res.ok) return false;
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      this.activeAudio = audio;
      audio.volume = opts.volume ?? 1.0;
      audio.onended = () => { this.activeAudio = null; URL.revokeObjectURL(url); onEnd(); };
      audio.onerror = () => { this.activeAudio = null; URL.revokeObjectURL(url); onError(); };
      await audio.play();
      return true;
    } catch { return false; }
  }

  private speakWithBrowser(text: string, language: string, isTamil: boolean, opts: TTSOptions, onEnd: () => void, onError: () => void): boolean {
    if (!('speechSynthesis' in window)) { onError(); return false; }
    
    // Clear any stuck state safely before speaking
    window.speechSynthesis.cancel();
    
    const voices = this.getVoicesOnce();
    // Priority: local tamil -> fallback -> default
    let voice = voices.find(v => v.lang === language);
    if (!voice) voice = voices.find(v => v.lang.startsWith(isTamil ? 'ta' : 'en'));
    
    const utterance = new SpeechSynthesisUtterance(text);
    this.activeUtterance = utterance; // Prevent garbage collection mid-speech
    
    if (voice) {
      utterance.voice = voice;
      console.log(`[Voice] Selected Voice: ${voice.name} (${voice.lang})`);
    } else {
      console.log(`[Voice] Selected Voice: Browser Default`);
    }
    
    utterance.lang = language;
    utterance.rate = opts.speed ?? 1.0;
    utterance.volume = opts.volume ?? 1.0;
    
    let startTimeout: ReturnType<typeof setTimeout>;

    utterance.onstart = () => {
      clearTimeout(startTimeout);
      console.log("[Voice] Speech Started");
    };

    utterance.onend = () => {
      clearTimeout(startTimeout);
      console.log("[Voice] Speech Finished");
      this.activeUtterance = null;
      onEnd();
    };

    utterance.onerror = (e) => {
      clearTimeout(startTimeout);
      console.warn("[Voice] Speech Error:", e);
      this.activeUtterance = null;
      onError();
    };

    utterance.onpause = () => {
      this.onPause?.();
    };

    utterance.onresume = () => {
      this.onResume?.();
    };
    
    // Safety timeout: If speech doesn't start in 5 seconds, cancel and trigger error (which triggers retry)
    startTimeout = setTimeout(() => {
      console.warn("[Voice] Speech failed to start within 5s. Canceling and retrying...");
      window.speechSynthesis.cancel();
      this.activeUtterance = null;
      onError();
    }, 5000);

    window.speechSynthesis.speak(utterance);
    return true;
  }
}

<<<<<<< HEAD
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
=======
export const voiceManager = VoiceManager.getInstance();
>>>>>>> d97d820d3971d9c550c190a6427c639a119b7de9
