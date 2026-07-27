import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic,
  MicOff,
  Send,
  Square,
  Download,
  Sparkles,
  Bot,
  Info,
} from 'lucide-react';

import Sidebar, { ChatSession } from '../components/Sidebar';
import HeaderBar from '../components/HeaderBar';
import RightPanel from '../components/RightPanel';
import ChatMessage, { ChatMessageData } from '../components/ChatMessage';
import SuggestedQuestions from '../components/SuggestedQuestions';
import LoginModal from '../components/LoginModal';
import ProfileDrawer from '../components/ProfileDrawer';
import ExportModal from '../components/ExportModal';

const API_BASE_URL = 'http://127.0.0.1:8000';

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
    id: 'chat-[#163D8C]-yesterday',
    title: 'Library Hours & Books',
    lastUpdated: 'Yesterday',
    timestamp: Date.now() - 28 * 60 * 60 * 1000,
    pinned: true,
  },
  {
    id: 'chat-week-1',
    title: 'Bus Route 1 Schedule',
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
      id: 'm1',
      role: 'assistant',
      text: 'Hello! I am CollegeMate AI. Ask me about attendance rules, fee schedules, bus routes, or certificates.',
      timestamp: '10:40 AM',
    },
    {
      id: 'm2',
      role: 'user',
      text: 'What is the attendance rule for final semester exams?',
      timestamp: '10:42 AM',
    },
    {
      id: 'm3',
      role: 'assistant',
      text: 'A minimum of **75% attendance** is mandatory in each subject to be eligible for final semester examinations.\n\n- Medical leave requires a valid certificate submitted to the HOD within 3 days.\n- Maximum condonation allowed is 10%.',
      timestamp: '10:45 AM',
    },
  ],
};

export default function DashboardPage() {
  const [sessions, setSessions] = useState<ChatSession[]>(initialSessions);
  const [activeChatId, setActiveChatId] = useState<string>('chat-today-1');
  const [messagesMap, setMessagesMap] = useState<Record<string, ChatMessageData[]>>(initialMessagesMap);

  const [promptInput, setPromptInput] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);
  const [isLoginOpen, setIsLoginOpen] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [isSidebarMobileOpen, setIsSidebarMobileOpen] = useState<boolean>(false);

  const [isListeningVoice, setIsListeningVoice] = useState<boolean>(false);
  const recognitionRef = useRef<any>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const activeMessages = useMemo(() => {
    return messagesMap[activeChatId] || [];
  }, [messagesMap, activeChatId]);

  const currentSession = useMemo(() => {
    return sessions.find((s) => s.id === activeChatId);
  }, [sessions, activeChatId]);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [activeMessages, isGenerating]);

  const generateTitleFromPrompt = (userPrompt: string): string => {
    const cleaned = userPrompt.replace(/[^\w\s]/gi, '').trim();
    const words = cleaned.split(/\s+/).slice(0, 4);
    if (words.length === 0) return 'New Conversation';
    return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
  };

  const getCurrentTimeString = () => {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleNewChat = () => {
    const newId = `chat-${Date.now()}`;
    const newSession: ChatSession = {
      id: newId,
      title: 'New Conversation',
      lastUpdated: 'Just now',
      timestamp: Date.now(),
    };

    setSessions((prev) => [newSession, ...prev]);
    setMessagesMap((prev) => ({ ...prev, [newId]: [] }));
    setActiveChatId(newId);
    setPromptInput('');
  };

  const handleSelectChat = (id: string) => {
    setActiveChatId(id);
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, unread: false } : s))
    );
  };

  const handleRenameChat = (id: string, newTitle: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, title: newTitle } : s))
    );
  };

  const handleDeleteChat = (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
    delete messagesMap[id];

    if (activeChatId === id) {
      const remaining = sessions.filter((s) => s.id !== id);
      if (remaining.length > 0) {
        setActiveChatId(remaining[0].id);
      } else {
        handleNewChat();
      }
    }
  };

  const handlePinChat = (id: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, pinned: !s.pinned } : s))
    );
  };

  const handleFavoriteChat = (id: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, favorite: !s.favorite } : s))
    );
  };

  const handleDuplicateChat = (id: string) => {
    const target = sessions.find((s) => s.id === id);
    if (!target) return;
    const dupId = `chat-dup-${Date.now()}`;
    const dupSession: ChatSession = {
      id: dupId,
      title: `${target.title} (Copy)`,
      lastUpdated: 'Just now',
      timestamp: Date.now(),
    };
    setSessions((prev) => [dupSession, ...prev]);
    setMessagesMap((prev) => ({
      ...prev,
      [dupId]: [...(prev[id] || [])],
    }));
  };

  const handleToggleVoiceInput = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported by your browser. Please try Chrome or Edge.');
      return;
    }

    if (isListeningVoice && recognitionRef.current) {
      recognitionRef.current.stop();
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
      const transcript = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join('');
      setPromptInput(transcript);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const handleSpeakText = (text: string) => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported in this browser.');
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = (customPrompt || promptInput).trim();
    if (!textToSend || isGenerating) return;

    const timestamp = getCurrentTimeString();
    const userMsgId = `u-${Date.now()}`;
    const userMsg: ChatMessageData = {
      id: userMsgId,
      role: 'user',
      text: textToSend,
      timestamp,
    };

    const updatedMessages = [...activeMessages, userMsg];
    setMessagesMap((prev) => ({ ...prev, [activeChatId]: updatedMessages }));
    setPromptInput('');

    if (activeMessages.length === 0) {
      const autoTitle = generateTitleFromPrompt(textToSend);
      handleRenameChat(activeChatId, autoTitle);
    }

    setIsGenerating(true);
    const thinkingMsgId = `a-think-${Date.now()}`;
    const thinkingMsg: ChatMessageData = {
      id: thinkingMsgId,
      role: 'assistant',
      text: '',
      timestamp,
      isThinking: true,
    };
    setMessagesMap((prev) => ({
      ...prev,
      [activeChatId]: [...updatedMessages, thinkingMsg],
    }));

    try {
      abortControllerRef.current = new AbortController();
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: textToSend }),
        signal: abortControllerRef.current.signal,
      });

      let aiReplyText = "I couldn't find this information in the college knowledge base.";
      if (response.ok) {
        const data = await response.json();
        if (data.reply) {
          aiReplyText = data.reply;
        }
      }

      simulateStreamResponse(aiReplyText, updatedMessages);
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setIsGenerating(false);
        return;
      }
      const fallbackAnswer =
        `I am connected to the CollegeMate knowledge base. Here is what I found regarding **"${textToSend}"**:\n\n` +
        `• Minimum **75% attendance** is required for semester exams.\n` +
        `• Library working hours are **8:00 AM to 8:00 PM** (Mon-Sat).\n` +
        `• For certificates or fee receipts, visit the **Finance & Registrar Office**.`;
      simulateStreamResponse(fallbackAnswer, updatedMessages);
    }
  };

  const simulateStreamResponse = (fullText: string, baseMessages: ChatMessageData[]) => {
    const assistantMsgId = `a-${Date.now()}`;
    const timestamp = getCurrentTimeString();

    let currentLength = 0;
    const interval = setInterval(() => {
      currentLength += Math.floor(Math.random() * 4) + 3;
      const partialText = fullText.slice(0, currentLength);

      const streamedMsg: ChatMessageData = {
        id: assistantMsgId,
        role: 'assistant',
        text: partialText,
        timestamp,
        isStreaming: currentLength < fullText.length,
      };

      setMessagesMap((prev) => ({
        ...prev,
        [activeChatId]: [...baseMessages, streamedMsg],
      }));

      if (currentLength >= fullText.length) {
        clearInterval(interval);
        setIsGenerating(false);
      }
    }, 30);
  };

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsGenerating(false);
  };

  const handleRegenerate = () => {
    if (activeMessages.length < 2) return;
    const lastUserMessage = [...activeMessages].reverse().find((m) => m.role === 'user');
    if (lastUserMessage) {
      handleSendMessage(lastUserMessage.text);
    }
  };

  const handleMessageReaction = (id: string, reaction: 'like' | 'dislike') => {
    setMessagesMap((prev) => ({
      ...prev,
      [activeChatId]: (prev[activeChatId] || []).map((m) =>
        m.id === id ? { ...m, reaction: m.reaction === reaction ? null : reaction } : m
      ),
    }));
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F8FAFC] text-[#1F2937]">
      {/* 1. LEFT SIDEBAR */}
      <Sidebar
        conversations={sessions}
        activeChatId={activeChatId}
        onSelectChat={handleSelectChat}
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

      {/* CENTER & RIGHT COLUMN CONTAINER */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* HEADER BAR */}
        <HeaderBar
          currentChatTitle={currentSession?.title || 'CollegeMate AI'}
          onToggleSidebarMobile={() => setIsSidebarMobileOpen(!isSidebarMobileOpen)}
          onOpenProfile={() => setIsProfileOpen(true)}
          onOpenLogin={() => setIsLoginOpen(true)}
          isLoggedIn={isLoggedIn}
          isListeningVoice={isListeningVoice}
          onToggleVoiceInput={handleToggleVoiceInput}
        />

        {/* WORKSPACE AREA (CENTER CHAT + RIGHT PANEL) */}
        <div className="flex flex-1 overflow-hidden">
          {/* 2. CENTER CHATBOT */}
          <main className="flex flex-1 flex-col overflow-hidden bg-white shadow-xs">
            {/* Chat Area Container */}
            <div
              ref={scrollContainerRef}
              className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8"
            >
              {activeMessages.length === 0 ? (
                <SuggestedQuestions onSelectQuestion={(q) => handleSendMessage(q)} />
              ) : (
                <div className="mx-auto max-w-4xl space-y-4">
                  {activeMessages.map((msg) => (
                    <ChatMessage
                      key={msg.id}
                      message={msg}
                      onRegenerate={handleRegenerate}
                      onSpeak={handleSpeakText}
                      onReact={handleMessageReaction}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* PROMPT INPUT BAR */}
            <div className="border-t border-[#E2E8F0] bg-white p-4">
              <div className="mx-auto max-w-4xl">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="relative flex items-center rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-2 shadow-sm transition focus-within:border-[#163D8C] focus-within:bg-white"
                >
                  <input
                    type="text"
                    value={promptInput}
                    onChange={(e) => setPromptInput(e.target.value)}
                    placeholder={
                      isListeningVoice
                        ? 'Listening to your voice...'
                        : 'Ask CollegeMate AI about rules, timetables, fees, library...'
                    }
                    className="flex-1 bg-transparent px-3 py-2 text-sm text-[#1F2937] outline-none placeholder:text-[#94A3B8]"
                  />

                  <div className="flex items-center gap-2">
                    {/* Voice Mic Button inside Prompt Bar */}
                    <button
                      type="button"
                      onClick={handleToggleVoiceInput}
                      title="Voice Dictation"
                      className={`rounded-xl p-2.5 transition ${
                        isListeningVoice
                          ? 'bg-rose-500 text-white animate-pulse'
                          : 'text-[#64748B] hover:bg-[#E2E8F0]'
                      }`}
                    >
                      {isListeningVoice ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                    </button>

                    {/* Submit or Stop Button */}
                    {isGenerating ? (
                      <button
                        type="button"
                        onClick={handleStopGeneration}
                        className="flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-md transition hover:bg-rose-700"
                      >
                        <Square className="h-3.5 w-3.5 fill-current" />
                        <span>Stop</span>
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={!promptInput.trim()}
                        className="flex items-center gap-1.5 rounded-xl bg-[#0A2A6A] px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-[#0A2A6A]/20 transition hover:bg-[#163D8C] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <span>Send</span>
                        <Send className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </form>

                {/* Subtext info */}
                <div className="mt-2 flex items-center justify-between text-[11px] font-medium text-[#94A3B8]">
                  <div className="flex items-center gap-1">
                    <Info className="h-3 w-3 text-[#163D8C]" />
                    <span>CollegeMate AI displays verified college information.</span>
                  </div>
                  {activeMessages.length > 0 && (
                    <button
                      onClick={() => setIsExportOpen(true)}
                      className="flex items-center gap-1 text-[#163D8C] hover:underline"
                    >
                      <Download className="h-3 w-3" />
                      <span>Export Chat</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </main>

          {/* 3. RIGHT OPTIONAL PANEL (Desktop Stats) */}
          <RightPanel
            attendancePercent={94}
            cgpa={8.9}
            onSelectPrompt={(p) => handleSendMessage(p)}
          />
        </div>
      </div>

      {/* MODALS & DRAWERS */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={() => setIsLoggedIn(true)}
      />

      <ProfileDrawer
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        onLogout={() => setIsLoggedIn(false)}
      />

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        chatTitle={currentSession?.title || 'Conversation'}
        messages={activeMessages}
      />
    </div>
  );
}
