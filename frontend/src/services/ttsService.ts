/**
 * ttsService.ts — High-Performance TTS for CampusMate
 *
 * Key optimizations:
 * - ResponsiveVoice pre-loaded at module init (no lazy load delay)
 * - Browser voice list cached once on first use
 * - Sentence-by-sentence streaming via speakStream()
 * - Phrase cache for instant common responses
 * - 2-second cloud timeout → auto-fallback to browser native
 * - Performance timing on every stage
 * - Single voice queue (new response pre-empts old speech)
 */

export type TTSProvider = 'google' | 'azure' | 'responsivevoice' | 'browser';

export interface TTSStatus {
  english: { provider: string; ready: boolean };
  tamil: { provider: string; ready: boolean };
}

export interface TTSOptions {
  speed?: number;   // 0.5 – 2.0
  volume?: number;  // 0.0 – 1.0
  language?: string;
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
    console.log(`[TTS Performance] Total: ${total.toFixed(0)}ms\n${lines}`);
  }
}

// ─── Voice List Cache ─────────────────────────────────────────────────────────

let _cachedVoices: SpeechSynthesisVoice[] = [];

function getVoicesOnce(): SpeechSynthesisVoice[] {
  if (_cachedVoices.length > 0) return _cachedVoices;
  if (!('speechSynthesis' in window)) return [];
  _cachedVoices = window.speechSynthesis.getVoices();
  if (_cachedVoices.length === 0) {
    // Voices not loaded yet — attach listener for async load
    window.speechSynthesis.onvoiceschanged = () => {
      _cachedVoices = window.speechSynthesis.getVoices();
    };
  }
  return _cachedVoices;
}

// ─── Phrase Audio Cache ───────────────────────────────────────────────────────

const PHRASE_CACHE = new Map<string, string>(); // text → blob URL

const PRELOAD_PHRASES = [
  'Hello! How can I help you today?',
  'Hi there! I am CampusMate. How can I assist you?',
  'I am looking that up for you.',
  'Sure, let me check that.',
  'CampusMate AI is temporarily unavailable. Please try again later.',
];

// ─── ResponsiveVoice Pre-loader ───────────────────────────────────────────────

let _rvReady = false;
let _rvLoadPromise: Promise<boolean> | null = null;

function preloadResponsiveVoice(): Promise<boolean> {
  if (_rvReady) return Promise.resolve(true);
  if (_rvLoadPromise) return _rvLoadPromise;

  _rvLoadPromise = new Promise((resolve) => {
    if ((window as any).responsiveVoice) {
      _rvReady = true;
      return resolve(true);
    }
    const script = document.createElement('script');
    script.src = 'https://code.responsivevoice.org/responsivevoice.js';
    script.async = true;
    script.onload = () => { _rvReady = true; resolve(true); };
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });

  return _rvLoadPromise;
}

// Pre-warm immediately on module load — eliminates first-use delay
if (typeof window !== 'undefined') {
  preloadResponsiveVoice();
  // Also prime the voice list cache
  if ('speechSynthesis' in window) {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) _cachedVoices = voices;
    else window.speechSynthesis.onvoiceschanged = () => {
      _cachedVoices = window.speechSynthesis.getVoices();
    };
  }
}

// ─── Tanglish Normalizer (with 1.5s timeout) ─────────────────────────────────

const _normalizeCache = new Map<string, { text: string; language: string }>();

async function normalizeTanglish(text: string): Promise<{ text: string; language: string }> {
  if (_normalizeCache.has(text)) return _normalizeCache.get(text)!;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 1500);

  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
    const res = await fetch(`${apiUrl}/api/v1/voice/normalize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (res.ok) {
      const data = await res.json();
      const result = { text: data.text, language: data.language };
      _normalizeCache.set(text, result);
      return result;
    }
  } catch {
    clearTimeout(timeout);
  }
  return { text, language: 'en-IN' };
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

/**
 * Split text into speakable sentences.
 * Each sentence is spoken independently for streaming TTS.
 */
export function splitIntoSentences(text: string): string[] {
  // Split on sentence-ending punctuation followed by space or end
  const raw = text.split(/(?<=[.!?।])\s+|(?<=\n)\s*(?=[A-Z•\u0B80-\u0BFF])/);
  return raw
    .map(s => s.trim())
    .filter(s => s.length > 3); // ignore tiny fragments
}

export function detectTextLanguage(text: string): 'ta' | 'en' | 'tanglish' {
  if (/[\u0B80-\u0BFF]/.test(text)) return 'ta';
  const tanglishWords = [
    'mapla','bro','da','di','pa','anna','akka','eppo','epo','enna','evlo',
    'sollu','venum','vendum','iruka','iruku','theriyum','theriyala','nalla',
    'machaan','machi','vaanga','seri','sari','tambi','kanna','yaru','yellam',
    'ellam','unga','inga','anga','athu','ithu','ponga',
  ];
  const words = text.toLowerCase().split(/\s+/);
  const count = words.filter(w => tanglishWords.includes(w.replace(/[?!.,]/g, ''))).length;
  return count > 0 ? 'tanglish' : 'en';
}

// ─── Speech Queue ─────────────────────────────────────────────────────────────

let _queueId = 0; // increments on every new speakText/speakStream call

interface QueueItem {
  text: string;
  opts: TTSOptions;
  isTamil: boolean;
  language: string;
  queueId: number;
}

const _queue: QueueItem[] = [];
let _queueRunning = false;

function _clearQueue(newId: number) {
  _queue.length = 0;
  cancelAllSpeech();
}

async function _processQueue(callbacks: { onEnd?: () => void; onError?: () => void }) {
  if (_queueRunning) return;
  _queueRunning = true;

  while (_queue.length > 0) {
    const item = _queue.shift()!;
    if (item.queueId !== _queueId) continue; // pre-empted by newer request
    await _speakOne(item, callbacks);
  }

  _queueRunning = false;
  callbacks.onEnd?.();
}

async function _speakOne(item: QueueItem, callbacks: { onEnd?: () => void; onError?: () => void }): Promise<void> {
  return new Promise<void>((resolve) => {
    const { text, opts, isTamil, language, queueId } = item;
    if (queueId !== _queueId) return resolve(); // stale

    const onDone = () => resolve();
    const onFail = () => resolve();

    const provider = (import.meta.env.VITE_TTS_PROVIDER || 'responsivevoice') as TTSProvider;

    // Cloud providers (Google/Azure) with 2s timeout wrapper
    const tryCloud = async (): Promise<boolean> => {
      if (provider === 'google' && import.meta.env.VITE_GOOGLE_TTS_KEY) {
        return speakWithGoogle(text, language, opts, onDone, onFail);
      }
      if (provider === 'azure' && import.meta.env.VITE_AZURE_TTS_KEY) {
        return speakWithAzure(text, language, opts, onDone, onFail);
      }
      return false;
    };

    // Try cloud with 2s timeout, then fallback
    const race = async () => {
      const cloudPromise = tryCloud();
      const timeout = new Promise<false>((r) => setTimeout(() => r(false), 2000));
      const cloudOk = await Promise.race([cloudPromise, timeout]);
      if (cloudOk) return;

      // ResponsiveVoice for Tamil or as primary
      if (isTamil || provider === 'responsivevoice') {
        if (_rvReady && (window as any).responsiveVoice) {
          const voice = isTamil ? 'Tamil Female' : 'Indian English Female';
          (window as any).responsiveVoice.speak(text, voice, {
            rate: opts.speed ?? 1.0,
            volume: opts.volume ?? 1.0,
            onend: onDone,
            onerror: () => {
              // Final fallback to browser native
              speakWithBrowser(text, language, isTamil, opts, () => {}, onDone, onFail);
            },
          });
          return;
        }
      }

      // Browser native
      speakWithBrowser(text, language, isTamil, opts, () => {}, onDone, onFail);
    };

    race().catch(onFail);
  });
}

// ─── Provider: Google Cloud TTS ───────────────────────────────────────────────

async function speakWithGoogle(
  text: string, language: string, opts: TTSOptions, onEnd: () => void, onError: () => void
): Promise<boolean> {
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
    audio.volume = opts.volume ?? 1.0;
    audio.playbackRate = opts.speed ?? 1.0;
    audio.onended = onEnd;
    audio.onerror = onError as any;
    await audio.play();
    return true;
  } catch { return false; }
}

// ─── Provider: Azure Speech ───────────────────────────────────────────────────

async function speakWithAzure(
  text: string, language: string, opts: TTSOptions, onEnd: () => void, onError: () => void
): Promise<boolean> {
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
    audio.volume = opts.volume ?? 1.0;
    audio.onended = () => { URL.revokeObjectURL(url); onEnd(); };
    audio.onerror = () => { URL.revokeObjectURL(url); onError(); };
    await audio.play();
    return true;
  } catch { return false; }
}

// ─── Provider: Browser Native ─────────────────────────────────────────────────

function speakWithBrowser(
  text: string, language: string, isTamil: boolean, opts: TTSOptions,
  onStart: () => void, onEnd: () => void, onError: () => void
): void {
  if (!('speechSynthesis' in window)) { onError(); return; }
  const voices = getVoicesOnce();
  let voice = voices.find(v => v.lang === language);
  if (!voice) voice = voices.find(v => v.lang.startsWith(isTamil ? 'ta' : 'en'));
  const utterance = new SpeechSynthesisUtterance(text);
  if (voice) utterance.voice = voice;
  utterance.lang = language;
  utterance.rate = opts.speed ?? 1.0;
  utterance.volume = opts.volume ?? 1.0;
  utterance.onstart = onStart;
  utterance.onend = onEnd;
  utterance.onerror = onError as any;
  window.speechSynthesis.speak(utterance);
}

// ─── Public: Cancel / Pause / Resume ─────────────────────────────────────────

export function cancelAllSpeech(): void {
  _queueId++; // invalidates all queued items
  _queue.length = 0;
  _queueRunning = false;
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  if ((window as any).responsiveVoice?.isPlaying?.()) (window as any).responsiveVoice.cancel();
}

export function pauseAllSpeech(): void {
  if ('speechSynthesis' in window) window.speechSynthesis.pause();
  if ((window as any).responsiveVoice?.isPlaying?.()) (window as any).responsiveVoice.pause();
}

export function resumeAllSpeech(): void {
  if ('speechSynthesis' in window) window.speechSynthesis.resume();
  if ((window as any).responsiveVoice) (window as any).responsiveVoice.resume();
}

// ─── Public: getTTSStatus ─────────────────────────────────────────────────────

export async function getTTSStatus(): Promise<TTSStatus> {
  const provider = (import.meta.env.VITE_TTS_PROVIDER || 'responsivevoice') as TTSProvider;
  const hasGoogle = !!import.meta.env.VITE_GOOGLE_TTS_KEY;
  const hasAzure = !!import.meta.env.VITE_AZURE_TTS_KEY;
  const voices = getVoicesOnce();
  const hasEnglishNative = voices.some(v => v.lang.startsWith('en'));

  let englishProvider = hasEnglishNative ? 'Browser Native' : 'ResponsiveVoice (Cloud)';
  let tamilProvider = _rvReady ? 'ResponsiveVoice (Cloud)' : 'Loading…';

  if (provider === 'google' && hasGoogle) { englishProvider = 'Google Neural (en-IN)'; tamilProvider = 'Google Neural (ta-IN)'; }
  else if (provider === 'azure' && hasAzure) { englishProvider = 'Azure NeerjaNeural'; tamilProvider = 'Azure PallaviNeural (ta-IN)'; }

  return {
    english: { provider: englishProvider, ready: true },
    tamil: { provider: tamilProvider, ready: _rvReady },
  };
}

// ─── Public: speak (single text, full string) ─────────────────────────────────

export async function speak(
  rawText: string,
  opts: TTSOptions = {},
  callbacks: { onStart?: () => void; onEnd?: () => void; onError?: () => void } = {}
): Promise<void> {
  if (!rawText?.trim()) return;
  const perf = new PerfTimer();

  // Assign a new queue generation — kills any in-progress speech
  const myId = ++_queueId;
  _queue.length = 0;
  _queueRunning = false;

  perf.mark('queue_cleared');

  // Detect language
  const detectedLang = detectTextLanguage(rawText);
  perf.mark('lang_detected');

  let textToSpeak = rawText;
  let language = opts.language ?? (detectedLang === 'en' ? 'en-IN' : 'ta-IN');
  let isTamil = detectedLang !== 'en';

  if (detectedLang === 'tanglish') {
    const normalized = await normalizeTanglish(rawText);
    textToSpeak = normalized.text;
    language = normalized.language;
    isTamil = language.startsWith('ta');
    perf.mark('tanglish_normalized');
  }

  const cleaned = cleanForTTS(textToSpeak);
  if (!cleaned) return;

  callbacks.onStart?.();
  perf.mark('speech_started');

  // Enqueue
  _queue.push({ text: cleaned, opts, isTamil, language, queueId: myId });

  await _processQueue({
    onEnd: () => {
      perf.mark('speech_ended');
      perf.report();
      callbacks.onEnd?.();
    },
    onError: callbacks.onError,
  });
}

// ─── Public: speakStream (for streaming AI responses) ────────────────────────

/**
 * speakStream — call this as LLM tokens arrive.
 *
 * Usage:
 *   const stream = speakStream(opts, callbacks);
 *   stream.push("Hello! "); // on first sentence boundary
 *   stream.push("I am CampusMate.");
 *   stream.flush(); // call when stream ends
 */
export function speakStream(
  opts: TTSOptions = {},
  callbacks: { onStart?: () => void; onEnd?: () => void } = {}
): { push: (sentence: string) => void; flush: () => void; cancel: () => void } {
  const myId = ++_queueId;
  _queue.length = 0;
  _queueRunning = false;

  let started = false;
  let pendingBuffer = '';

  const enqueue = async (text: string) => {
    if (!text.trim()) return;
    const detectedLang = detectTextLanguage(text);
    let textToSpeak = text;
    let language = opts.language ?? (detectedLang === 'en' ? 'en-IN' : 'ta-IN');
    let isTamil = detectedLang !== 'en';

    if (detectedLang === 'tanglish') {
      const norm = await normalizeTanglish(text);
      textToSpeak = norm.text;
      language = norm.language;
      isTamil = language.startsWith('ta');
    }

    const cleaned = cleanForTTS(textToSpeak);
    if (!cleaned || myId !== _queueId) return;

    if (!started) { started = true; callbacks.onStart?.(); }

    _queue.push({ text: cleaned, opts, isTamil, language, queueId: myId });

    if (!_queueRunning) {
      _processQueue({ onEnd: callbacks.onEnd, onError: () => {} });
    }
  };

  let _sentenceBuffer = '';

  return {
    push(chunk: string) {
      if (myId !== _queueId) return;
      _sentenceBuffer += chunk;
      // Check for sentence boundaries
      const sentences = splitIntoSentences(_sentenceBuffer);
      if (sentences.length > 1) {
        // Speak all but the last (possibly incomplete) sentence
        const complete = sentences.slice(0, -1);
        _sentenceBuffer = sentences[sentences.length - 1];
        complete.forEach(s => enqueue(s));
      }
    },
    flush() {
      // Speak any remaining buffer
      if (_sentenceBuffer.trim()) {
        enqueue(_sentenceBuffer.trim());
        _sentenceBuffer = '';
      }
    },
    cancel() {
      cancelAllSpeech();
    },
  };
}
