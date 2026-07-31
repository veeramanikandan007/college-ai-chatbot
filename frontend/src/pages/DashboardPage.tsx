import { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Square, Download, Info, Settings2, AlertCircle, X } from 'lucide-react';

import Sidebar, { ChatSession } from '../components/Sidebar';
import HeaderBar from '../components/HeaderBar';
import RightPanel from '../components/RightPanel';
import ChatMessage, { ChatMessageData } from '../components/ChatMessage';
import SuggestedQuestions from '../components/SuggestedQuestions';
import ProfileDrawer from '../components/ProfileDrawer';
import ExportModal from '../components/ExportModal';

import VoiceInputBar from '../components/VoiceInputBar';
import VoicePlayer from '../components/VoicePlayer';
import VoiceSettingsPanel from '../components/VoiceSettingsPanel';
import WakeStatusBanner from '../components/WakeStatusBanner';

import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { useVoiceSystem } from '../hooks/useVoiceSystem';
import { fetchApi, ApiError } from '../lib/api';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messagesMap, setMessagesMap] = useState<Record<string, ChatMessageData[]>>({});

  const [promptInput, setPromptInput] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [sessionsLoading, setSessionsLoading] = useState<boolean>(true);

  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const activeMessages = useMemo(() => {
    return activeChatId ? (messagesMap[activeChatId] || []) : [];
  }, [messagesMap, activeChatId]);

  const currentSession = useMemo(() => {
    return activeChatId ? sessions.find((s) => s.id === activeChatId) : null;
  }, [sessions, activeChatId]);

  // --- Advanced Voice System Hook ---
  const {
    assistantState,
    setAssistantState,
    isRecording,
    setIsRecording,
    recordingDuration,
    setRecordingDuration,
    voiceError,
    showVoiceError,
    spokenText,
    isPlayingSpeech,
    isPausedSpeech,
    voiceSettings,
    handleVoiceSettingsChange,
    voiceButtonRef,
    stopSpeech,
    pauseSpeech,
    resumeSpeech,
    speakText,
    speakTextStream,
  } = useVoiceSystem();

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('newChat') === 'true') {
      handleNewChat();
      navigate('/dashboard', { replace: true });
    }
  }, [location.search, navigate]);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [activeMessages, isGenerating]);

  const loadSessions = async () => {
    setSessionsLoading(true);
    try {
      const data: any[] = await fetchApi('/chat/sessions');
      const mapped: ChatSession[] = data.map((s) => ({
        id: String(s.id),
        title: s.title,
        lastUpdated: new Date(s.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        timestamp: new Date(s.updated_at).getTime(),
        pinned: s.is_pinned,
        archived: false,
        category: detectCategoryFromTitle(s.title),
      }));
      setSessions(mapped);
      if (mapped.length > 0) setActiveChatId(mapped[0].id);
    } catch (e) {
      if (!(e instanceof ApiError && e.status === 401)) {
        showToast('Failed to load chat sessions.', 'error');
      }
    } finally {
      setSessionsLoading(false);
    }
  };

  const detectCategoryFromTitle = (title: string) => {
    const lower = title.toLowerCase();
    if (lower.includes('admission') || lower.includes('apply') || lower.includes('seat')) return 'Admissions';
    if (lower.includes('exam') || lower.includes('timetable') || lower.includes('result') || lower.includes('mark') || lower.includes('grade') || lower.includes('gpa')) return 'Examinations';
    if (lower.includes('attendance') || lower.includes('absent') || lower.includes('leave')) return 'Attendance';
    if (lower.includes('book') || lower.includes('library') || lower.includes('journal')) return 'Library';
    if (lower.includes('placement') || lower.includes('job') || lower.includes('company') || lower.includes('salary')) return 'Placements';
    if (lower.includes('fee') || lower.includes('payment') || lower.includes('tuition')) return 'Fees';
    if (lower.includes('hostel') || lower.includes('room') || lower.includes('mess')) return 'Hostel';
    if (lower.includes('course') || lower.includes('subject') || lower.includes('syllabus') || lower.includes('faculty')) return 'Academics';
    return 'General';
  };

  const loadMessages = async (sessionId: string) => {
    if (messagesMap[sessionId]) return;
    try {
      const data: any[] = await fetchApi(`/chat/sessions/${sessionId}/messages`);
      const mapped: ChatMessageData[] = data.map((m) => ({
        id: String(m.id),
        role: m.role,
        text: m.content,
        timestamp: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        reaction: m.reaction,
        isBookmarked: m.is_bookmarked,
      }));
      setMessagesMap((prev) => ({ ...prev, [sessionId]: mapped }));
    } catch {
      showToast('Failed to load messages.', 'error');
    }
  };

  const getCurrentTimeString = () =>
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const handleNewChat = () => {
    stopSpeech();
    setActiveChatId(null);
    setPromptInput('');
  };

  const handleSelectChat = async (id: string) => {
    stopSpeech();
    setActiveChatId(id);
    await loadMessages(id);
  };

  const handleRenameChat = async (id: string, newTitle: string) => {
    setSessions((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, title: newTitle, category: detectCategoryFromTitle(newTitle) }
          : s
      )
    );
    try {
      await fetchApi(`/chat/sessions/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ title: newTitle }),
      });
    } catch { }
  };

  const handleDeleteChat = async (id: string) => {
    const remaining = sessions.filter((s) => s.id !== id);
    setSessions(remaining);
    setMessagesMap((prev) => { const next = { ...prev }; delete next[id]; return next; });
    if (activeChatId === id) {
      if (remaining.length > 0) setActiveChatId(remaining[0].id);
      else setActiveChatId(null);
    }
    try {
      await fetchApi(`/chat/sessions/${id}`, { method: 'DELETE' });
    } catch {
      showToast('Could not delete chat.', 'error');
    }
  };

  const handlePinChat = async (id: string) => {
    const chat = sessions.find(s => s.id === id);
    if (!chat) return;
    const newPinned = !chat.pinned;
    setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, pinned: newPinned } : s)));
    try {
      await fetchApi(`/chat/sessions/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ is_pinned: newPinned }),
      });
    } catch { }
  };

  const handleArchiveChat = (id: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, archived: !s.archived } : s))
    );
    const chat = sessions.find((s) => s.id === id);
    showToast(chat?.archived ? 'Chat restored.' : 'Chat archived.', 'success');
  };

  const handleDuplicateChat = async (id: string) => {
    const chatToDuplicate = sessions.find(s => s.id === id);
    if (!chatToDuplicate) return;
    
    try {
      const data = await fetchApi('/chat/sessions', {
        method: 'POST',
        body: JSON.stringify({ title: `${chatToDuplicate.title} (Copy)` }),
      });
      const newSession: ChatSession = {
        id: String(data.id),
        title: data.title,
        lastUpdated: 'Just now',
        timestamp: Date.now(),
      };
      setSessions((prev) => [newSession, ...prev]);
      setMessagesMap((prev) => ({ ...prev, [String(data.id)]: [] }));
      setActiveChatId(String(data.id));
      showToast('Chat duplicated successfully.', 'success');
    } catch {
      showToast('Could not duplicate chat.', 'error');
    }
  };

  const handleSendMessage = async (customPrompt?: string | any, source: 'text' | 'voice' = 'text') => {
    let textToSend = promptInput;
    if (typeof customPrompt === 'string') {
      textToSend = customPrompt;
      setPromptInput(customPrompt); // Populate input temporarily
    }
    textToSend = textToSend.trim();
    if (!textToSend || isGenerating) return;

    // Shut up any active speech synthesis and change state
    stopSpeech();
    setAssistantState('PROCESSING');

    let sessionId = activeChatId;
    if (!sessionId) {
      try {
        const title = textToSend.slice(0, 30) + (textToSend.length > 30 ? '…' : '');
        const data = await fetchApi('/chat/sessions', {
          method: 'POST',
          body: JSON.stringify({ title }),
        });
        sessionId = String(data.id);
        const newSession: ChatSession = { id: sessionId, title: data.title, lastUpdated: 'Just now', timestamp: Date.now() };
        setSessions((prev) => [newSession, ...prev]);
        setMessagesMap((prev) => ({ ...prev, [sessionId!]: [] }));
        setActiveChatId(sessionId);
      } catch (err) {
        console.error("Failed to start new session. Error:", err);
        showToast('Could not start a new session.', 'error');
        setAssistantState(voiceSettings.handsFree ? 'WAKING' : 'IDLE');
        return;
      }
    }

    const timestamp = getCurrentTimeString();
    const tempUserId = `u-${Date.now()}`;
    const userMsg: ChatMessageData = { id: tempUserId, role: 'user', text: textToSend, timestamp };
    const currentMsgs = messagesMap[sessionId!] || [];
    
    setMessagesMap((prev) => {
      const msgs = prev[sessionId!] || [];
      if (msgs.length === 0) {
        const autoTitle = textToSend.split(' ').slice(0, 4).join(' ');
        handleRenameChat(sessionId!, autoTitle);
      }
      return { ...prev, [sessionId!]: [...msgs, userMsg] };
    });
    setPromptInput('');

    setMessagesMap((prev) => {
      const msgs = prev[sessionId!] || [];
      const thinkingId = `think-${Date.now()}`;
      const thinkingMsg: ChatMessageData = { id: thinkingId, role: 'assistant', text: '', timestamp, isThinking: true };
      return { ...prev, [sessionId!]: [...msgs, thinkingMsg] };
    });
    setIsGenerating(true);

    try {
      abortControllerRef.current = new AbortController();
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch('/api/v1/chat/stream', {
        method: 'POST',
        headers,
        body: JSON.stringify({ message: textToSend, session_id: parseInt(sessionId!) }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error('Failed to fetch stream');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder('utf-8');
      
      let fullText = '';
      const assistantMsgId = `a-${Date.now()}`;
      const timestamp = getCurrentTimeString();

      // Create a TTS stream handle — speech starts on first complete sentence
      const ttsStream = source === 'voice' ? speakTextStream(voiceSettings) : null;

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunkStr = decoder.decode(value, { stream: true });
          const lines = chunkStr.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const dataStr = line.slice(6);
              try {
                const data = JSON.parse(dataStr);
                if (data.text) {
                  fullText += data.text;
                  // Push chunk to TTS stream — speech starts after first sentence boundary
                  ttsStream?.push(data.text);
                  const streamedMsg: ChatMessageData = {
                    id: assistantMsgId,
                    role: 'assistant',
                    text: fullText,
                    timestamp,
                    isStreaming: true,
                  };
                  setMessagesMap((prev) => ({ ...prev, [sessionId!]: [...currentMsgs, userMsg, streamedMsg] }));
                }
              } catch (e) {
                // Ignore parse errors on incomplete chunks
              }
            }
          }
        }
        // Flush any remaining sentence buffer
        ttsStream?.flush();
      }

      // Stream complete — finalize message
      setMessagesMap((prev) => {
        const msgs = prev[sessionId!] || [];
        const lastMsg = msgs[msgs.length - 1];
        if (lastMsg && lastMsg.role === 'assistant') {
          return { ...prev, [sessionId!]: [...msgs.slice(0, -1), { ...lastMsg, isStreaming: false }] };
        }
        return prev;
      });
      setIsGenerating(false);
      
      // For text source (non-voice), just update state
      // For voice, the ttsStream already handled speaking sentence-by-sentence
      if (source !== 'voice') {
        setAssistantState(voiceSettings.handsFree ? 'WAKING' : 'IDLE');
      }

    } catch (err: any) {
      if (err?.name === 'AbortError') {
        setIsGenerating(false);
        setAssistantState(voiceSettings.handsFree ? 'WAKING' : 'IDLE');
        return;
      }
      const fallback = `I'm having trouble reaching the knowledge base right now. Please try again in a moment.`;
      simulateStream(fallback, sessionId!, [...currentMsgs, userMsg], undefined, source);
    }
  };

  const simulateStream = (fullText: string, sessionId: string, baseMessages: ChatMessageData[], backendMsgId?: string, source: 'text' | 'voice' = 'text') => {
    const assistantMsgId = backendMsgId || `a-${Date.now()}`;
    const timestamp = getCurrentTimeString();
    let currentLength = 0;
    const interval = setInterval(() => {
      currentLength += Math.floor(Math.random() * 6) + 4;
      const partialText = fullText.slice(0, currentLength);
      const streamedMsg: ChatMessageData = {
        id: assistantMsgId,
        role: 'assistant',
        text: partialText,
        timestamp,
        isStreaming: currentLength < fullText.length,
      };
      setMessagesMap((prev) => ({ ...prev, [sessionId]: [...baseMessages, streamedMsg] }));
      
      if (currentLength >= fullText.length) {
        clearInterval(interval);
        setIsGenerating(false);
        
        // Auto-speak the AI response if enabled and it's a voice message
        if (source === 'voice') {
          speakText(fullText);
        } else {
          setAssistantState(voiceSettings.handsFree ? 'WAKING' : 'IDLE');
        }
      }
    }, 25);
  };

  const handleStopGeneration = () => {
    abortControllerRef.current?.abort();
    setIsGenerating(false);
    setAssistantState(voiceSettings.handsFree ? 'WAKING' : 'IDLE');
  };

  const handleRegenerate = () => {
    const lastUserMessage = [...activeMessages].reverse().find((m) => m.role === 'user');
    if (lastUserMessage) handleSendMessage(lastUserMessage.text);
  };

  const handleMessageReaction = async (id: string, reaction: 'like' | 'dislike') => {
    if (!activeChatId) return;
    
    // Find message to see if we are toggling off
    const msg = messagesMap[activeChatId]?.find(m => m.id === id);
    const newReaction = msg?.reaction === reaction ? null : reaction;
    
    setMessagesMap((prev) => ({
      ...prev,
      [activeChatId]: (prev[activeChatId] || []).map((m) =>
        m.id === id ? { ...m, reaction: newReaction } : m
      ),
    }));

    try {
      if (!id.startsWith('a-') && !id.startsWith('u-')) {
        await fetchApi(`/chat/sessions/${activeChatId}/messages/${id}/reaction`, {
          method: 'PUT',
          body: JSON.stringify({ reaction: newReaction }),
        });
      }
    } catch { }
  };

  const handleEditMessage = (id: string, newText: string) => {
    if (!activeChatId) return;
    setMessagesMap((prev) => ({
      ...prev,
      [activeChatId]: (prev[activeChatId] || []).map((m) =>
        m.id === id ? { ...m, text: newText } : m
      ),
    }));
    handleSendMessage(newText);
  };

  const handleDeleteMessage = (id: string) => {
    if (!activeChatId) return;
    setMessagesMap((prev) => ({
      ...prev,
      [activeChatId]: (prev[activeChatId] || []).filter((m) => m.id !== id),
    }));
    showToast('Message deleted.', 'info');
  };

  const handleToggleSpeakBubble = (text: string) => {
    if (spokenText === text && isPlayingSpeech) {
      stopSpeech();
    } else {
      speakText(text);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F8FAFC] dark:bg-slate-950 text-[#1F2937] dark:text-slate-100 transition-colors duration-300">
      <Sidebar
        conversations={sessions}
        activeChatId={activeChatId || ''}
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
        onRenameChat={handleRenameChat}
        onDeleteChat={handleDeleteChat}
        onPinChat={handlePinChat}
        onArchiveChat={handleArchiveChat}
        onDuplicateChat={handleDuplicateChat}
        onExportChat={() => setIsExportOpen(true)}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <HeaderBar
          currentChatTitle={currentSession?.title || 'CollegeMate AI'}
          onOpenProfile={() => setIsProfileOpen(true)}
          onOpenLogin={() => {}}
          isLoggedIn={!!user}
        />

        <div className="flex flex-1 overflow-hidden">
          <main className="flex flex-1 flex-col overflow-hidden bg-white dark:bg-slate-900 shadow-xs relative">
            
            {/* Voice HUD Overlay */}
            <div className="absolute top-0 left-0 right-0 z-10 w-full max-w-5xl lg:max-w-6xl xl:max-w-7xl mx-auto px-4 pt-4 space-y-2 pointer-events-none">
              <div className="pointer-events-auto">
                <AnimatePresence>
                  {isPlayingSpeech && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
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
              </div>

              <div className="pointer-events-auto">
                <WakeStatusBanner 
                  state={assistantState}
                  onStopListening={() => {
                    stopSpeech();
                    handleVoiceSettingsChange({ ...voiceSettings, handsFree: false });
                  }}
                />
              </div>

              {voiceError && (
                <div className="pointer-events-auto flex items-center justify-between p-3.5 rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/25 text-red-700 dark:text-red-300 text-xs font-semibold shadow-sm">
                  <div className="flex items-center gap-2">
                    <AlertCircle size={14} className="shrink-0" />
                    <span>{voiceError}</span>
                  </div>
                  <button onClick={() => showVoiceError(null as any)} className="text-red-400 hover:text-red-700 dark:hover:text-white">
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>

            <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-3 sm:px-6 py-4">
              {sessionsLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="w-10 h-10 rounded-full border-4 border-primary dark:border-secondary border-t-transparent animate-spin"></div>
                </div>
              ) : activeMessages.length === 0 ? (
                <SuggestedQuestions onSelectQuestion={(q) => handleSendMessage(q)} />
              ) : (
                <div className="w-full max-w-5xl lg:max-w-6xl xl:max-w-7xl mx-auto space-y-4 pt-2 transition-all duration-300 ease-in-out">
                  {activeMessages.map((msg) => (
                    <ChatMessage
                      key={msg.id}
                      message={msg}
                      onRegenerate={handleRegenerate}
                      onSpeak={msg.role === 'assistant' ? () => handleToggleSpeakBubble(msg.text) : undefined}
                      onStopSpeak={stopSpeech}
                      isSpeakingThis={isPlayingSpeech && spokenText === msg.text}
                      onReact={handleMessageReaction}
                      onEdit={handleEditMessage}
                      onDelete={handleDeleteMessage}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-[#E2E8F0] dark:border-slate-800 bg-white dark:bg-slate-900 p-3 sm:p-4 relative">
              <div className="w-full max-w-5xl lg:max-w-6xl xl:max-w-7xl mx-auto relative transition-all duration-300 ease-in-out">
                
                <VoiceInputBar
                  promptInput={promptInput}
                  setPromptInput={setPromptInput}
                  onSendMessage={handleSendMessage}
                  isGenerating={isGenerating}
                  onStopGeneration={handleStopGeneration}
                  isSettingsOpen={isSettingsOpen}
                  setIsSettingsOpen={setIsSettingsOpen}
                  language={voiceSettings.language}
                  onError={(err) => {
                    showVoiceError(err);
                    setAssistantState(voiceSettings.handsFree ? 'WAKING' : 'IDLE');
                  }}
                />

                <div className="mt-2 flex items-center justify-between text-[11px] font-medium text-[#94A3B8] dark:text-slate-500">
                  <div className="flex items-center gap-1">
                    <Info className="h-3 w-3 text-accent dark:text-secondary" />
                    <span>CollegeMate AI displays verified college information.</span>
                  </div>
                  {activeMessages.length > 0 && (
                    <button
                      onClick={() => setIsExportOpen(true)}
                      className="flex items-center gap-1 text-accent dark:text-secondary hover:underline"
                    >
                      <Download className="h-3 w-3" />
                      <span>Export Chat</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </main>

          {isSettingsOpen && (
            <div className="fixed inset-0 z-50 overflow-hidden md:relative md:z-auto md:w-80 md:shrink-0 flex justify-end">
              {/* Backdrop for Mobile */}
              <div
                onClick={() => setIsSettingsOpen(false)}
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs md:hidden"
              />

              {/* Drawer Container */}
              <aside className="relative z-10 h-full w-full max-w-sm border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4 shadow-2xl md:w-80 md:max-w-none md:shadow-none flex flex-col">
                <VoiceSettingsPanel
                  settings={voiceSettings}
                  onChange={handleVoiceSettingsChange}
                  onClose={() => setIsSettingsOpen(false)}
                />
              </aside>
            </div>
          )}
        </div>
      </div>

      <ProfileDrawer
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        onLogout={logout}
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
