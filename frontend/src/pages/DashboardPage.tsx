import { useState, useRef, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff, Send, Square, Download, Info, Keyboard } from 'lucide-react';

import Sidebar, { ChatSession } from '../components/Sidebar';
import HeaderBar from '../components/HeaderBar';
import RightPanel from '../components/RightPanel';
import ChatMessage, { ChatMessageData } from '../components/ChatMessage';
import SuggestedQuestions from '../components/SuggestedQuestions';
import LoginModal from '../components/LoginModal';
import ProfileDrawer from '../components/ProfileDrawer';
import ExportModal from '../components/ExportModal';

import { sendChatMessage } from '../services/chatService';
import { useAutoScroll } from '../hooks/useAutoScroll';
import { useAuth } from '../contexts/AuthContext';

// ─── Initial demo sessions ──────────────────────────────────────────────────
const initialSessions: ChatSession[] = [
  {
    id: 'chat-today-1',
    title: 'Attendance Rules',
    lastUpdated: '10:45 AM',
    timestamp: Date.now() - 2 * 60 * 60 * 1000,
    unread: true,
  },
  {
    id: 'chat-today-2',
    title: 'Fee Details & Due Dates',
    lastUpdated: '09:12 AM',
    timestamp: Date.now() - 4 * 60 * 60 * 1000,
  },
  {
    id: 'chat-yesterday-1',
    title: 'Library Hours & Books',
    lastUpdated: 'Yesterday',
    timestamp: Date.now() - 26 * 60 * 60 * 1000,
    pinned: true,
  },
  {
    id: 'chat-week-1',
    title: 'Bus Route Timings',
    lastUpdated: '3 days ago',
    timestamp: Date.now() - 3 * 24 * 60 * 60 * 1000,
  },
  {
    id: 'chat-month-1',
    title: 'Bonafide Certificate',
    lastUpdated: '2 weeks ago',
    timestamp: Date.now() - 14 * 24 * 60 * 60 * 1000,
  },
];

const initialMessagesMap: Record<string, ChatMessageData[]> = {
  'chat-today-1': [
    {
      id: 'm-w',
      role: 'assistant',
      text: 'Hello! I am **CollegeMate AI** 🎓\n\nI can answer questions about:\n- **Attendance** rules and condonation\n- **Fee** payment and due dates\n- **Library** hours and book limits\n- **Bus** routes and timings\n- **Certificates** (Bonafide, Transfer, etc.)\n- **Timetable** and exam schedules\n- **Placement** statistics\n\nHow can I help you today?',
      timestamp: '10:40 AM',
    },
    {
      id: 'm-u1',
      role: 'user',
      text: 'What is the minimum attendance required for semester exams?',
      timestamp: '10:42 AM',
    },
    {
      id: 'm-a1',
      role: 'assistant',
      text: 'A minimum of **75% attendance** is mandatory in each subject to be eligible for semester examinations.\n\n### Condonation Policy\n- Medical leave with valid certificate: up to **10% condonation**\n- Certificate must be submitted to HOD within **3 working days** of returning\n- Students below 65% are **not eligible** even with medical condonation',
      timestamp: '10:43 AM',
    },
  ],
};

// ─── Helper: generate a concise title from the first user prompt ─────────────
function generateTitle(prompt: string): string {
  const cleaned = prompt.replace(/[^\w\s]/gi, '').trim();
  const words = cleaned.split(/\s+/).slice(0, 5);
  if (words.length === 0) return 'New Conversation';
  return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
}

function getTimeNow(): string {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function DashboardPage() {
  const { isLoggedIn } = useAuth();

  // ─── Sessions & Messages ─────────────────────────────────────────────────
  const [sessions, setSessions] = useState<ChatSession[]>(initialSessions);
  const [activeChatId, setActiveChatId] = useState<string>('chat-today-1');
  const [messagesMap, setMessagesMap] = useState<Record<string, ChatMessageData[]>>(
    initialMessagesMap,
  );

  // ─── UI State ────────────────────────────────────────────────────────────
  const [promptInput, setPromptInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isSidebarMobileOpen, setIsSidebarMobileOpen] = useState(false);
  const [isListeningVoice, setIsListeningVoice] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const recognitionRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ─── Auto-scroll on message updates ────────────────────────────────────
  const activeMessages: ChatMessageData[] = useMemo(
    () => messagesMap[activeChatId] ?? [],
    [messagesMap, activeChatId],
  );

  useAutoScroll(scrollContainerRef, [activeMessages.length, isGenerating]);

  const currentSession = useMemo(
    () => sessions.find((s) => s.id === activeChatId),
    [sessions, activeChatId],
  );

  // ─── Session Handlers ────────────────────────────────────────────────────
  const handleNewChat = useCallback(() => {
    const newId = `chat-${Date.now()}`;
    setSessions((prev) => [
      { id: newId, title: 'New Conversation', lastUpdated: 'Just now', timestamp: Date.now() },
      ...prev,
    ]);
    setMessagesMap((prev) => ({ ...prev, [newId]: [] }));
    setActiveChatId(newId);
    setPromptInput('');
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const handleSelectChat = useCallback((id: string) => {
    setActiveChatId(id);
    setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, unread: false } : s)));
  }, []);

  const handleRenameChat = useCallback((id: string, newTitle: string) => {
    setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, title: newTitle } : s)));
  }, []);

  const handleDeleteChat = useCallback(
    (id: string) => {
      setSessions((prev) => {
        const remaining = prev.filter((s) => s.id !== id);
        if (id === activeChatId) {
          const next = remaining[0];
          if (next) {
            setActiveChatId(next.id);
          } else {
            // Create a new session if no sessions remain
            const newId = `chat-${Date.now()}`;
            setMessagesMap((m) => ({ ...m, [newId]: [] }));
            setActiveChatId(newId);
            return [
              { id: newId, title: 'New Conversation', lastUpdated: 'Just now', timestamp: Date.now() },
            ];
          }
        }
        return remaining;
      });
      // Remove messages via setState (never mutate directly)
      setMessagesMap((prev) => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });
    },
    [activeChatId],
  );

  const handlePinChat = useCallback((id: string) => {
    setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, pinned: !s.pinned } : s)));
  }, []);

  const handleFavoriteChat = useCallback((id: string) => {
    setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, favorite: !s.favorite } : s)));
  }, []);

  const handleDuplicateChat = useCallback(
    (id: string) => {
      const target = sessions.find((s) => s.id === id);
      if (!target) return;
      const dupId = `chat-dup-${Date.now()}`;
      setSessions((prev) => [
        { id: dupId, title: `${target.title} (Copy)`, lastUpdated: 'Just now', timestamp: Date.now() },
        ...prev,
      ]);
      setMessagesMap((prev) => ({ ...prev, [dupId]: [...(prev[id] ?? [])] }));
    },
    [sessions],
  );

  // ─── Voice Input ────────────────────────────────────────────────────────
  const handleToggleVoiceInput = useCallback(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        'Speech recognition is not supported in this browser.\n' +
        'Please use Google Chrome or Microsoft Edge.',
      );
      return;
    }

    if (isListeningVoice && recognitionRef.current) {
      (recognitionRef.current as any).stop?.();
      setIsListeningVoice(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListeningVoice(true);
    recognition.onend = () => setIsListeningVoice(false);
    recognition.onerror = () => setIsListeningVoice(false);
    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results as any[])
        .map((r: any) => r[0].transcript)
        .join('');
      setPromptInput(transcript);
    };

    recognitionRef.current = recognition as any;
    recognition.start();
  }, [isListeningVoice]);

  // ─── Voice Output ────────────────────────────────────────────────────────
  const handleSpeakText = useCallback((text: string) => {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported in this browser.');
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text.replace(/\*\*/g, '').replace(/##/g, ''));
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find((v) => v.lang === 'en-US' && v.name.includes('Google'));
    if (preferred) utterance.voice = preferred;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }, []);

  const handleStopSpeech = useCallback(() => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  }, []);

  // ─── Streaming simulation ─────────────────────────────────────────────
  // Uses a ref to the activeChatId to avoid stale closure issues
  const activeChatIdRef = useRef(activeChatId);
  activeChatIdRef.current = activeChatId;

  const simulateStream = useCallback((fullText: string, baseMessages: ChatMessageData[]) => {
    const msgId = `a-${Date.now()}`;
    const timestamp = getTimeNow();
    let pos = 0;

    const tick = () => {
      pos += Math.floor(Math.random() * 5) + 3;
      const partial = fullText.slice(0, pos);
      const streaming = pos < fullText.length;

      setMessagesMap((prev) => ({
        ...prev,
        [activeChatIdRef.current]: [
          ...baseMessages,
          { id: msgId, role: 'assistant', text: partial, timestamp, isStreaming: streaming },
        ],
      }));

      if (streaming) {
        setTimeout(tick, 28);
      } else {
        setIsGenerating(false);
      }
    };

    tick();
  }, []);

  // ─── Send Message ─────────────────────────────────────────────────────
  const handleSendMessage = useCallback(
    async (customPrompt?: string) => {
      const textToSend = (customPrompt ?? promptInput).trim();
      if (!textToSend || isGenerating) return;

      const timestamp = getTimeNow();
      const userMsg: ChatMessageData = {
        id: `u-${Date.now()}`,
        role: 'user',
        text: textToSend,
        timestamp,
      };

      // Capture current messages synchronously before any async
      const currentMessages = messagesMap[activeChatIdRef.current] ?? [];
      const withUserMsg = [...currentMessages, userMsg];

      setMessagesMap((prev) => ({ ...prev, [activeChatIdRef.current]: withUserMsg }));
      setPromptInput('');

      // Auto-title on first message
      if (currentMessages.length === 0) {
        const title = generateTitle(textToSend);
        setSessions((prev) =>
          prev.map((s) => (s.id === activeChatIdRef.current ? { ...s, title } : s)),
        );
      }

      // Show thinking indicator
      setIsGenerating(true);
      const thinkingMsg: ChatMessageData = {
        id: `think-${Date.now()}`,
        role: 'assistant',
        text: '',
        timestamp,
        isThinking: true,
      };
      setMessagesMap((prev) => ({
        ...prev,
        [activeChatIdRef.current]: [...withUserMsg, thinkingMsg],
      }));

      try {
        abortControllerRef.current = new AbortController();
        const result = await sendChatMessage({ message: textToSend });
        simulateStream(result.reply, withUserMsg);
      } catch (err: any) {
        if (err?.name === 'AbortError') {
          setIsGenerating(false);
          return;
        }
        simulateStream(
          `I encountered an error while searching the knowledge base. Please try again.\n\n` +
          `If the issue persists, the backend server may be offline.`,
          withUserMsg,
        );
      }
    },
    [promptInput, isGenerating, messagesMap, simulateStream],
  );

  // ─── Stop Generation ─────────────────────────────────────────────────
  const handleStopGeneration = useCallback(() => {
    abortControllerRef.current?.abort();
    setIsGenerating(false);
  }, []);

  // ─── Regenerate ──────────────────────────────────────────────────────
  const handleRegenerate = useCallback(() => {
    const msgs = messagesMap[activeChatId] ?? [];
    const lastUser = [...msgs].reverse().find((m) => m.role === 'user');
    if (lastUser) {
      // Remove the last assistant message then re-send
      setMessagesMap((prev) => ({
        ...prev,
        [activeChatId]: (prev[activeChatId] ?? []).filter((m) => m.role === 'user' || m.id !== msgs[msgs.length - 1]?.id),
      }));
      handleSendMessage(lastUser.text);
    }
  }, [messagesMap, activeChatId, handleSendMessage]);

  // ─── Message Reaction ─────────────────────────────────────────────────
  const handleMessageReaction = useCallback((id: string, reaction: 'like' | 'dislike') => {
    setMessagesMap((prev) => ({
      ...prev,
      [activeChatIdRef.current]: (prev[activeChatIdRef.current] ?? []).map((m) =>
        m.id === id ? { ...m, reaction: m.reaction === reaction ? null : reaction } : m,
      ),
    }));
  }, []);

  // ─── Keyboard shortcut: Enter to send ────────────────────────────────
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F5F7FA] text-[#1F2937]">

      {/* ── 1. LEFT SIDEBAR ───────────────────────────────────── */}
      <Sidebar
        conversations={sessions}
        activeChatId={activeChatId}
        onSelectChat={(id) => { handleSelectChat(id); setIsSidebarMobileOpen(false); }}
        onNewChat={handleNewChat}
        onRenameChat={handleRenameChat}
        onDeleteChat={handleDeleteChat}
        onPinChat={handlePinChat}
        onDuplicateChat={handleDuplicateChat}
        onExportChat={() => setIsExportOpen(true)}
        onFavoriteChat={handleFavoriteChat}
        isOpenMobile={isSidebarMobileOpen}
        onCloseMobile={() => setIsSidebarMobileOpen(false)}
      />

      {/* ── CENTER + RIGHT ────────────────────────────────────── */}
      <div className="flex flex-1 flex-col overflow-hidden">

        {/* HEADER */}
        <HeaderBar
          currentChatTitle={currentSession?.title ?? 'CollegeMate AI'}
          onToggleSidebarMobile={() => setIsSidebarMobileOpen((v) => !v)}
          onOpenProfile={() => {
            if (!isLoggedIn) { setIsLoginOpen(true); return; }
            setIsProfileOpen(true);
          }}
          onOpenLogin={() => setIsLoginOpen(true)}
          isListeningVoice={isListeningVoice}
          onToggleVoiceInput={handleToggleVoiceInput}
        />

        {/* WORKSPACE */}
        <div className="flex flex-1 overflow-hidden">

          {/* ── 2. CENTER CHATBOT ──────────────────────────────── */}
          <main className="flex flex-1 flex-col overflow-hidden bg-white border-r border-[#E2E8F0]">

            {/* Message Area */}
            <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-4 sm:p-6">
              {activeMessages.length === 0 ? (
                <SuggestedQuestions onSelectQuestion={handleSendMessage} />
              ) : (
                <div className="mx-auto max-w-3xl space-y-1">
                  {activeMessages.map((msg) => (
                    <ChatMessage
                      key={msg.id}
                      message={msg}
                      onRegenerate={msg.role === 'assistant' && !msg.isThinking && !msg.isStreaming ? handleRegenerate : undefined}
                      onSpeak={msg.role === 'assistant' && !msg.isThinking ? handleSpeakText : undefined}
                      onStopSpeech={handleStopSpeech}
                      onReact={msg.role === 'assistant' && !msg.isThinking ? handleMessageReaction : undefined}
                      isSpeaking={isSpeaking}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* ── PROMPT INPUT BAR ──────────────────────────────── */}
            <div className="border-t border-[#E2E8F0] bg-white p-4">
              <div className="mx-auto max-w-3xl">
                <motion.div
                  className="flex items-center rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-2 shadow-sm transition-shadow focus-within:border-[#163D8C] focus-within:bg-white focus-within:shadow-md"
                >
                  <input
                    ref={inputRef}
                    id="chat-input"
                    type="text"
                    value={promptInput}
                    onChange={(e) => setPromptInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isGenerating}
                    placeholder={
                      isListeningVoice
                        ? '🎤 Listening…'
                        : isGenerating
                        ? 'CollegeMate AI is thinking…'
                        : 'Ask about attendance, fees, library, bus routes, certificates…'
                    }
                    className="flex-1 bg-transparent px-3 py-2 text-sm text-[#1F2937] outline-none placeholder:text-[#94A3B8] disabled:cursor-not-allowed"
                    autoComplete="off"
                  />

                  <div className="flex items-center gap-1.5">
                    {/* Voice Mic */}
                    <button
                      id="voice-input-btn"
                      type="button"
                      onClick={handleToggleVoiceInput}
                      title={isListeningVoice ? 'Stop voice input' : 'Voice input'}
                      className={`rounded-xl p-2.5 transition ${
                        isListeningVoice
                          ? 'bg-rose-500 text-white animate-pulse'
                          : 'text-[#64748B] hover:bg-[#E2E8F0] hover:text-[#0A2A6A]'
                      }`}
                    >
                      {isListeningVoice ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                    </button>

                    {/* Send / Stop */}
                    {isGenerating ? (
                      <button
                        id="stop-btn"
                        type="button"
                        onClick={handleStopGeneration}
                        className="flex items-center gap-1.5 rounded-xl bg-rose-600 px-3.5 py-2 text-xs font-bold text-white shadow-md transition hover:bg-rose-700"
                      >
                        <Square className="h-3.5 w-3.5 fill-current" />
                        <span>Stop</span>
                      </button>
                    ) : (
                      <button
                        id="send-btn"
                        type="button"
                        onClick={() => handleSendMessage()}
                        disabled={!promptInput.trim() || isGenerating}
                        className="flex items-center gap-1.5 rounded-xl bg-[#0A2A6A] px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-[#0A2A6A]/20 transition hover:bg-[#163D8C] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <span>Send</span>
                        <Send className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </motion.div>

                {/* Footer Row */}
                <div className="mt-2 flex items-center justify-between text-[11px] text-[#94A3B8]">
                  <div className="flex items-center gap-1">
                    <Info className="h-3 w-3 text-[#163D8C]" />
                    <span>CollegeMate AI displays verified college information.</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="hidden sm:flex items-center gap-1">
                      <Keyboard className="h-3 w-3" />
                      <span>Enter to send</span>
                    </span>
                    {activeMessages.length > 0 && (
                      <button
                        onClick={() => setIsExportOpen(true)}
                        className="flex items-center gap-1 text-[#163D8C] hover:underline"
                      >
                        <Download className="h-3 w-3" />
                        <span>Export</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </main>

          {/* ── 3. RIGHT PANEL (Desktop only) ─────────────────── */}
          <RightPanel
            attendancePercent={94}
            cgpa={8.9}
            onSelectPrompt={handleSendMessage}
          />
        </div>
      </div>

      {/* ── MODALS & DRAWERS ──────────────────────────────────── */}
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />

      <ProfileDrawer isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        chatTitle={currentSession?.title ?? 'Conversation'}
        messages={activeMessages}
      />
    </div>
  );
}
