<<<<<<< HEAD
import { useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Sidebar from '../components/Sidebar';
import ChatBubble from '../components/ChatBubble';
=======
import React, { useMemo, useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, Sparkles, BrainCircuit, User, AlertCircle, X,
  GraduationCap, BookOpen, Library, Home as HostelIcon, 
  Briefcase, Calendar, Phone, Landmark, ShieldCheck, Compass, HelpCircle
} from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ChatBubble from '../components/ChatBubble';
import VoiceRecorder from '../components/VoiceRecorder';
import VoicePlayer from '../components/VoicePlayer';
import VoiceButton, { VoiceButtonRef } from '../components/VoiceButton';
import VoiceSettingsPanel, { VoiceSettings } from '../components/VoiceSettingsPanel';
import WakeStatusBanner, { AssistantVoiceState } from '../components/WakeStatusBanner';
>>>>>>> 5f8c52a2a79f075aeeb064756d298fcea307a590
import { useAutoScroll } from '../hooks/useAutoScroll';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
}

<<<<<<< HEAD
=======
const welcomeMsgText = `👋 Welcome to CampusMate AI

Your intelligent assistant for Mount Zion College of Engineering and Technology, Pudukkottai.

I can answer questions about admissions, departments, courses, examinations, campus facilities, placements, library, hostel, and other college information.

Ask me anything about the college.`;

>>>>>>> 5f8c52a2a79f075aeeb064756d298fcea307a590
const initialMessages: Message[] = [
  {
    id: 'welcome',
    role: 'assistant',
<<<<<<< HEAD
    text: 'Hello! I am CollegeMate AI. Ask me about attendance, fees, timetable, certificates, or campus life and I will help you politely.',
  },
];

=======
    text: welcomeMsgText,
  },
];

const quickActions = [
  { label: 'Admissions', icon: GraduationCap, query: 'What is the admission procedure and eligibility criteria for engineering courses?' },
  { label: 'Departments', icon: Landmark, query: 'What departments are available at Mount Zion College of Engineering and Technology?' },
  { label: 'Courses', icon: BookOpen, query: 'Show me the list of UG and PG courses offered.' },
  { label: 'Examinations', icon: ShieldCheck, query: 'What are the rules and guidelines for internal and semester examinations?' },
  { label: 'Library', icon: Library, query: 'What are the library hours and book borrowing policies?' },
  { label: 'Hostel', icon: HostelIcon, query: 'Provide information about hostel accommodation, facilities, and mess fees?' },
  { label: 'Placements', icon: Briefcase, query: 'Tell me about the placement cell, training programs, and top recruiters?' },
  { label: 'Campus Facilities', icon: Compass, query: 'What facilities are available on campus (transport, labs, canteen, etc.)?' },
  { label: 'Events', icon: Calendar, query: 'What are the key annual events, symposia, and cultural activities?' },
  { label: 'Contact Information', icon: Phone, query: 'What are the contact details, email, and address of the college?' },
];

>>>>>>> 5f8c52a2a79f075aeeb064756d298fcea307a590
export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

<<<<<<< HEAD
  useAutoScroll(scrollRef, [messages]);

  const conversation = useMemo(
    () => messages.map((message) => `${message.role === 'user' ? 'You' : 'CollegeMate'}: ${message.text}`).join('\n'),
    [messages],
  );

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!prompt.trim()) return;
=======
  // Assistant State Machine
  const [assistantState, setAssistantState] = useState<AssistantVoiceState>('IDLE');
  
  // Voice Recording States
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  
  // TTS Playback States
  const [spokenText, setSpokenText] = useState('');
  const [isPlayingSpeech, setIsPlayingSpeech] = useState(false);
  const [isPausedSpeech, setIsPausedSpeech] = useState(false);

  const voiceButtonRef = useRef<VoiceButtonRef>(null);
  const wakeRecognitionRef = useRef<any>(null);

  // Load and Sync Voice Settings
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>(() => {
    const saved = localStorage.getItem('voice_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse voice settings from localStorage', e);
      }
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
    setVoiceSettings(newSettings);
    localStorage.setItem('voice_settings', JSON.stringify(newSettings));
    
    // Sync active voice parameters if currently speaking
    if (isPlayingSpeech) {
      speakText(spokenText, newSettings);
    }
  };

  useAutoScroll(scrollRef, [messages, isLoading, isRecording]);

  // Synchronize Assistant State with Hands-Free mode toggles
  useEffect(() => {
    if (voiceSettings.handsFree) {
      if (assistantState === 'IDLE') {
        setAssistantState('WAKING');
      }
    } else {
      if (assistantState === 'WAKING') {
        setAssistantState('IDLE');
      }
    }
  }, [voiceSettings.handsFree]);

  // Synthesized chime audio context
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
      
      // Dual-tone chime: C5 to E5
      osc.frequency.setValueAtTime(523.25, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.15, ctx.currentTime + 0.12);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.40);
    } catch (e) {
      console.error('Audio chime play failed', e);
    }
  };

  // Background Wake Word Detection loop
  useEffect(() => {
    if (wakeRecognitionRef.current) {
      try {
        wakeRecognitionRef.current.abort();
      } catch (e) {}
      wakeRecognitionRef.current = null;
    }

    if (assistantState !== 'WAKING') return;

    const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionClass) return;

    try {
      const wakeRec = new SpeechRecognitionClass();
      wakeRec.continuous = true;
      wakeRec.interimResults = true;
      wakeRec.lang = 'en-US'; // English wake words

      wakeRec.onstart = () => {
        console.log('Continuous wake word engine listening...');
      };

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
          console.log('Wake word recognized successfully.');
          playChime();
          // Shift state to LISTENING, which will trigger the query recording
          setAssistantState('LISTENING');
        }
      };

      wakeRec.onerror = (event: any) => {
        if (event.error !== 'no-speech' && event.error !== 'aborted') {
          console.error('Background speech recognition error:', event.error);
        }
      };

      wakeRec.onend = () => {
        // Auto-restart wake-word listener if still in waking state
        if (assistantState === 'WAKING') {
          try {
            wakeRec.start();
          } catch (e) {
            // ignore multiple starts
          }
        }
      };

      wakeRecognitionRef.current = wakeRec;
      wakeRec.start();
    } catch (e) {
      console.error('Wake Word listener failed to start', e);
    }

    return () => {
      if (wakeRecognitionRef.current) {
        try {
          wakeRecognitionRef.current.abort();
        } catch (e) {}
      }
    };
  }, [assistantState]);

  // Synchronize query recorder triggers with assistantState
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

  // TTS Speech Synthesis Controls
  const stopSpeech = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingSpeech(false);
    setIsPausedSpeech(false);
    setSpokenText('');
    setAssistantState(voiceSettings.handsFree ? 'WAKING' : 'IDLE');
  };

  const pauseSpeech = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.pause();
    }
    setIsPausedSpeech(true);
  };

  const resumeSpeech = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.resume();
    }
    setIsPausedSpeech(false);
  };

  const speakText = (text: string, settingsToUse = voiceSettings) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();

      if (!text || !text.trim()) return;

      // Filter out emojis and bullets
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
        setAssistantState(voiceSettings.handsFree ? 'WAKING' : 'IDLE');
      };

      utterance.onerror = (e) => {
        console.error('Speech synthesis utterance error:', e);
        setIsPlayingSpeech(false);
        setIsPausedSpeech(false);
        setSpokenText('');
        setAssistantState(voiceSettings.handsFree ? 'WAKING' : 'IDLE');
      };

      window.speechSynthesis.speak(utterance);
    }
  };

  // Keyboard accessibility listeners
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
  }, [voiceSettings, isPlayingSpeech, isPausedSpeech]);

  // Submit messages to RAG FastAPI backend
  async function handleSendMessage(textToSend: string) {
    if (!textToSend.trim() || isLoading) return;

    // Shut up any active speech synthesis
    stopSpeech();
    setAssistantState('PROCESSING');
>>>>>>> 5f8c52a2a79f075aeeb064756d298fcea307a590

    const userMessage: Message = {
      id: String(Date.now()),
      role: 'user',
<<<<<<< HEAD
      text: prompt.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setPrompt('');
    setIsLoading(true);

    window.setTimeout(() => {
=======
      text: textToSend.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setPrompt('');

    try {
      const response = await fetch('http://localhost:8000/api/v1/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: textToSend.trim() }),
      });

      if (!response.ok) {
        throw new Error('API server returned an error');
      }

      const data = await response.json();
      const answer = data.answer || 'I received an empty response.';
      
>>>>>>> 5f8c52a2a79f075aeeb064756d298fcea307a590
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
<<<<<<< HEAD
          text: `I’m reviewing your question about campus services. I’ll reply with facts from the college knowledge base and keep my answer polite.`,
        },
      ]);
      setIsLoading(false);
    }, 1000);
  }

  return (
    <div className="container grid gap-10 py-10 lg:grid-cols-[280px_1fr]">
      <Sidebar />

      <main className="flex min-h-[calc(100vh-4rem)] flex-col gap-6 rounded-[32px] border border-slate-800/80 bg-slate-950/75 p-6 shadow-glass backdrop-blur-xl">
        <div className="flex flex-col gap-3 rounded-3xl border border-slate-800/80 bg-slate-900/80 p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-sky-400/80">Chat assistant</p>
              <h2 className="text-2xl font-semibold text-white">CollegeMate AI</h2>
            </div>
            <div className="rounded-3xl bg-slate-800/80 px-4 py-2 text-sm text-slate-300">RAG-powered answers</div>
          </div>
          <p className="text-slate-400">Ask anything about the college, from attendance to bus timings. Your chat history will be stored here for convenience.</p>
        </div>

        <section className="flex-1 overflow-hidden rounded-3xl border border-slate-800/80 bg-slate-900/80">
          <div ref={scrollRef} className="flex h-[560px] flex-col gap-4 overflow-y-auto p-6 md:h-[620px]">
            {messages.map((message) => (
              <ChatBubble key={message.id} role={message.role} message={message.text} />
            ))}
            {isLoading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="inline-flex items-center gap-3 rounded-3xl bg-slate-800/90 px-4 py-3 text-slate-300">
                <span className="h-3 w-3 animate-pulse rounded-full bg-sky-400" />
                CollegeMate AI is typing...
=======
          text: answer,
        },
      ]);

      if (voiceSettings.autoSpeak) {
        speakText(answer);
      } else {
        setAssistantState(voiceSettings.handsFree ? 'WAKING' : 'IDLE');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      const fallbackText = `[Offline Mode] I received your question: "${textToSend.trim()}". 

Currently, the Mount Zion RAG service is unreachable. For official assistance, please contact the Mount Zion College administration or visit the main office in Pudukkottai.`;
      
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: `assistant-fallback-${Date.now()}`,
            role: 'assistant',
            text: fallbackText,
          },
        ]);
        
        if (voiceSettings.autoSpeak) {
          speakText(fallbackText);
        } else {
          setAssistantState(voiceSettings.handsFree ? 'WAKING' : 'IDLE');
        }
      }, 800);
    } finally {
      setIsLoading(false);
    }
  }

  const handleQuickActionClick = (queryText: string) => {
    handleSendMessage(queryText);
  };

  const handleToggleSpeakBubble = (text: string) => {
    if (spokenText === text && isPlayingSpeech) {
      stopSpeech();
    } else {
      speakText(text);
    }
  };

  const showVoiceError = (err: string) => {
    setVoiceError(err);
    setTimeout(() => {
      setVoiceError(null);
    }, 6000);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleSendMessage(prompt);
  };

  const isChatEmpty = messages.length <= 1;

  return (
    <div className="min-h-screen flex flex-col justify-between transition-colors duration-300">
      <Header />

      <main className="flex-1 container max-w-6xl py-6 flex flex-col lg:flex-row gap-6">
        
        {/* Chat Window */}
        <section className="flex-1 flex flex-col rounded-[28px] glass-panel soft-ring border border-slate-200/80 dark:border-slate-800/80 min-h-[650px] overflow-hidden">
          {/* Header of Chat Window */}
          <div className="px-6 py-4 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between bg-white/40 dark:bg-slate-900/40">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/5 dark:bg-secondary/5 text-primary dark:text-secondary">
                <BrainCircuit size={20} className="animate-pulse" />
              </div>
              <div>
                <h2 className="font-bold text-slate-800 dark:text-white text-base">CampusMate AI Chat</h2>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">RAG-Powered Smart Assistant</span>
              </div>
            </div>
            {messages.length > 1 && (
              <button 
                onClick={() => {
                  stopSpeech();
                  setMessages(initialMessages);
                }}
                className="text-xs text-slate-500 hover:text-red-500 transition duration-150"
              >
                Clear Conversation
              </button>
            )}
          </div>

          {/* Voice Player HUD Floating Bar */}
          <AnimatePresence>
            {isPlayingSpeech && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="px-6 py-2 border-b border-slate-200/60 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-950/20"
              >
                <VoicePlayer
                  isPlaying={isPlayingSpeech}
                  isPaused={isPausedSpeech}
                  text={spokenText}
                  volume={voiceSettings.volume}
                  speed={voiceSettings.speed}
                  onPlay={resumeSpeech}
                  onPause={pauseSpeech}
                  onStop={stopSpeech}
                  onVolumeChange={(v) => handleVoiceSettingsChange({ ...voiceSettings, volume: v })}
                  onSpeedChange={(s) => handleVoiceSettingsChange({ ...voiceSettings, speed: s })}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Wake Word Status Banner HUD */}
          <WakeStatusBanner 
            state={assistantState}
            onStopListening={() => {
              handleVoiceSettingsChange({ ...voiceSettings, handsFree: false });
            }}
          />

          {/* Error Banner */}
          {voiceError && (
            <div className="mx-6 mt-4 flex items-center justify-between p-3.5 rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/25 text-red-700 dark:text-red-300 text-xs font-semibold">
              <div className="flex items-center gap-2">
                <AlertCircle size={14} className="shrink-0" />
                <span>{voiceError}</span>
              </div>
              <button onClick={() => setVoiceError(null)} className="text-red-400 hover:text-red-700 dark:hover:text-white">
                <X size={14} />
              </button>
            </div>
          )}

          {/* Messages Area */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 max-h-[500px]">
            {messages.map((message) => (
              <div key={message.id} className="space-y-1">
                {message.role === 'user' ? (
                  <div className="flex justify-end pr-1">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <User size={10} /> You
                    </span>
                  </div>
                ) : (
                  <div className="flex justify-start pl-1">
                    <span className="text-[10px] font-semibold text-primary dark:text-secondary uppercase tracking-wider flex items-center gap-1">
                      <Sparkles size={10} /> CampusMate AI
                    </span>
                  </div>
                )}
                <ChatBubble 
                  role={message.role} 
                  message={message.text}
                  onSpeak={message.role === 'assistant' ? () => handleToggleSpeakBubble(message.text) : undefined}
                  isSpeaking={spokenText === message.text && isPlayingSpeech}
                />
              </div>
            ))}

            {isLoading && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="inline-flex items-center gap-3 rounded-[20px] border border-slate-200/85 dark:border-slate-800/85 bg-white/90 dark:bg-slate-900/90 px-4 py-3 text-xs text-slate-600 dark:text-slate-300 shadow-sm"
              >
                <BrainCircuit size={14} className="text-primary dark:text-secondary animate-spin" />
                Searching college documents...
>>>>>>> 5f8c52a2a79f075aeeb064756d298fcea307a590
              </motion.div>
            )}
          </div>

<<<<<<< HEAD
          <form onSubmit={handleSubmit} className="border-t border-slate-800/80 bg-slate-950/90 p-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <label className="sr-only" htmlFor="prompt">
                Ask a question
              </label>
              <input
                id="prompt"
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                placeholder="Ask about exam schedules, library timings, fees, or college rules..."
                className="flex-1 rounded-3xl border border-slate-800/90 bg-slate-950/90 px-4 py-4 text-slate-100 outline-none transition focus:border-sky-400"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center justify-center rounded-3xl bg-gradient-to-r from-sky-500 to-violet-500 px-6 py-4 text-sm font-semibold text-slate-950 transition disabled:cursor-not-allowed disabled:opacity-60 hover:scale-[1.01]"
              >
                Send
=======
          {/* suggested question blocks - only displayed when chat is empty */}
          {isChatEmpty && (
            <div className="px-6 pb-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 flex items-center gap-1">
                <HelpCircle size={12} /> Suggested Campus Inquiries
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {quickActions.slice(0, 4).map((action) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.label}
                      type="button"
                      onClick={() => handleQuickActionClick(action.query)}
                      className="flex items-center gap-3 p-3.5 text-left text-xs font-semibold rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white/40 dark:bg-slate-900/40 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition"
                    >
                      <Icon size={14} className="text-primary dark:text-secondary shrink-0" />
                      <span className="truncate text-slate-700 dark:text-slate-200">{action.query}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Form Input */}
          <form onSubmit={handleSubmit} className="relative p-4 sm:p-6 border-t border-slate-200/85 dark:border-slate-800/85 bg-white/30 dark:bg-slate-950/20">
            
            {/* Audio Recording overlay overlaying the input panel */}
            {isRecording && (
              <VoiceRecorder
                duration={recordingDuration}
                onCancel={() => {
                  setAssistantState(voiceSettings.handsFree ? 'WAKING' : 'IDLE');
                }}
                onStop={() => {
                  if (voiceButtonRef.current) voiceButtonRef.current.stopRecording();
                }}
              />
            )}

            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 px-4 py-2 shadow-inner">
              <input
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                placeholder="Ask about exam schedules, hostels, fees, placements..."
                className="w-full bg-transparent px-1 py-3 text-sm text-slate-800 dark:text-white outline-none placeholder-slate-400 dark:placeholder-slate-500"
                disabled={isLoading || isRecording}
              />
              
              {/* Voice recording button */}
              <VoiceButton
                ref={voiceButtonRef}
                language={voiceSettings.language}
                disabled={isLoading}
                onRecordingStateChange={setIsRecording}
                onDurationChange={setRecordingDuration}
                onTextRecognized={(text) => {
                  setPrompt(text);
                  handleSendMessage(text);
                }}
                onRecognitionError={(err) => {
                  showVoiceError(err);
                  setAssistantState(voiceSettings.handsFree ? 'WAKING' : 'IDLE');
                }}
              />

              <button
                type="submit"
                disabled={!prompt.trim() || isLoading || isRecording}
                className="inline-flex shrink-0 items-center justify-center p-3 rounded-xl bg-primary dark:bg-secondary text-white dark:text-slate-900 shadow-md hover:scale-[1.03] transition disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
              >
                <Send size={16} />
>>>>>>> 5f8c52a2a79f075aeeb064756d298fcea307a590
              </button>
            </div>
          </form>
        </section>
<<<<<<< HEAD
      </main>
=======

        {/* Sidebar panels */}
        <aside className="w-full lg:w-80 space-y-4 shrink-0">
          {/* Settings Panel */}
          <VoiceSettingsPanel
            settings={voiceSettings}
            onChange={handleVoiceSettingsChange}
          />

          {/* Quick Actions Panel */}
          <div className="rounded-[24px] glass-panel soft-ring border border-slate-200/80 dark:border-slate-800/80 p-5 bg-white/70 dark:bg-slate-900/60">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <Sparkles size={16} className="text-primary dark:text-secondary" />
              Quick Actions
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-5 mb-4">
              Select any of the core topics below to immediately consult the Campus RAG knowledge base.
            </p>
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.label}
                    onClick={() => handleQuickActionClick(action.query)}
                    disabled={isLoading || isRecording}
                    className="flex items-center gap-3 px-3 py-2.5 text-left text-xs font-semibold rounded-xl border border-slate-200/60 dark:border-slate-800/60 bg-white/40 dark:bg-slate-900/40 hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-200 transition disabled:opacity-50"
                  >
                    <Icon size={14} className="text-primary dark:text-secondary shrink-0" />
                    <span>{action.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

      </main>

      <Footer />
>>>>>>> 5f8c52a2a79f075aeeb064756d298fcea307a590
    </div>
  );
}
