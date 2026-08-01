/**
 * DashboardPage — Chat UI only.
 *
 * This page no longer owns its own Sidebar, HeaderBar, sessions state,
 * or ProfileDrawer. All of that lives in AppLayout (mounted once globally).
 *
 * This page only renders:
 *   - The chat message list
 *   - The voice input bar
 *   - Voice overlays (settings, wake banner, error)
 *   - The export modal
 *
 * All session + message state is read from and written to useChatStore.
 */
import { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Info, AlertCircle, X } from 'lucide-react';

import { ChatSession } from '../components/Sidebar';
import ChatMessage, { ChatMessageData } from '../components/ChatMessage';
import SuggestedQuestions from '../components/SuggestedQuestions';
import ExportModal from '../components/ExportModal';

import VoiceInputBar from '../components/VoiceInputBar';
import VoiceSettingsPanel from '../components/VoiceSettingsPanel';
import WakeStatusBanner from '../components/WakeStatusBanner';

import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { useVoiceSystem } from '../hooks/useVoiceSystem';
import { useVoiceStore } from '../store/useVoiceStore';
import { useChatStore } from '../store/useChatStore';
import { fetchApi } from '../lib/api';

export default function DashboardPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // ── Global chat state from the store (survives navigation) ────────────────
  const {
    sessions,
    activeChatId,
    messagesMap,
    sessionsLoading,
    sessionsLoaded,
    loadSessions,
    setActiveChatId,
    addSession,
    updateSession,
    loadMessages,
    setMessagesMap,
  } = useChatStore();

  const [promptInput, setPromptInput] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
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

  // ── Voice system ──────────────────────────────────────────────────────────
  const {
    assistantState,
    setAssistantState,
    isRecording,
    setIsRecording,
    recordingDuration,
    setRecordingDuration,
    voiceError,
    showVoiceError,
    voiceButtonRef,
  } = useVoiceSystem();

  const {
    spokenText,
    setSpokenText,
    voiceState,
    settings: voiceSettings,
    updateSettings,
    speak: speakText,
    stop: stopSpeech,
  } = useVoiceStore();

  const isPlayingSpeech = voiceState === 'loading' || voiceState === 'speaking' || voiceState === 'paused';

  const handleVoiceSettingsChange = (newSettings: any) => {
    updateSettings(newSettings);
  };

  // ── Load sessions if not already loaded (guard is inside the store) ───────
  useEffect(() => {
    if (user) loadSessions();
  }, [user]);

  // ── Handle ?newChat=true URL param (from sidebar New Chat in collapsed mode) ─
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('newChat') === 'true') {
      handleNewChat();
      navigate('/dashboard', { replace: true });
    }
  }, [location.search]);

  // ── Auto-scroll on new messages ───────────────────────────────────────────
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [activeMessages, isGenerating]);

  // ─────────────────────────────────────────────────────────────────────────
  // Chat handlers
  // ─────────────────────────────────────────────────────────────────────────
  const getCurrentTimeString = () =>
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const handleNewChat = () => {
    stopSpeech();
    setActiveChatId(null);
    setPromptInput('');
  };

  const handleRenameChat = async (id: string, newTitle: string) => {
    updateSession(id, { title: newTitle });
    try {
      await fetchApi(`/chat/sessions/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ title: newTitle }),
      });
    } catch { }
  };

  const handleSendMessage = async (customPrompt?: string | any, source: 'text' | 'voice' = 'text') => {
    let textToSend = promptInput;
    if (typeof customPrompt === 'string') {
      textToSend = customPrompt;
      setPromptInput(customPrompt);
    }
    textToSend = textToSend.trim();
    if (!textToSend || isGenerating) return;

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
        addSession({ id: sessionId, title: data.title, lastUpdated: 'Just now', timestamp: Date.now() });
        setMessagesMap((prev) => ({ ...prev, [sessionId!]: [] }));
        setActiveChatId(sessionId);
      } catch (err) {
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

      if (!response.ok) throw new Error('Failed to fetch stream');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder('utf-8');
      let fullText = '';
      const assistantMsgId = `a-${Date.now()}`;

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
                  const streamedMsg: ChatMessageData = {
                    id: assistantMsgId,
                    role: 'assistant',
                    text: fullText,
                    timestamp,
                    isStreaming: true,
                  };
                  setMessagesMap((prev) => ({ ...prev, [sessionId!]: [...currentMsgs, userMsg, streamedMsg] }));
                }
              } catch {
                // Ignore incomplete SSE chunks
              }
            }
          }
        }
      }

      // Stream complete — mark message as final
      setMessagesMap((prev) => {
        const msgs = prev[sessionId!] || [];
        const lastMsg = msgs[msgs.length - 1];
        if (lastMsg && lastMsg.role === 'assistant') {
          return { ...prev, [sessionId!]: [...msgs.slice(0, -1), { ...lastMsg, isStreaming: false }] };
        }
        return prev;
      });
      setIsGenerating(false);

      if (voiceSettings.autoSpeak) {
        speakText(fullText, assistantMsgId);
      } else {
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
        if (voiceSettings.autoSpeak) {
          speakText(fullText, assistantMsgId);
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
    const msg = (messagesMap[activeChatId] || []).find((m) => m.id === id);
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

  const handleToggleSpeakBubble = (text: string, messageId: string) => {
    if (spokenText === text && isPlayingSpeech) {
      stopSpeech();
    } else {
      setSpokenText('');
      speakText(text, messageId);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Render — Chat content only (no Sidebar, no Header, no ProfileDrawer)
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <main className="flex flex-1 flex-col overflow-hidden bg-white dark:bg-[#0F172A] shadow-xs relative w-full">

      {/* Voice HUD Overlay */}
      <div className="absolute top-0 left-0 right-0 z-10 w-full max-w-5xl lg:max-w-6xl xl:max-w-7xl mx-auto px-4 pt-4 space-y-2 pointer-events-none">
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

      {/* Chat Message List */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-3 sm:px-6 py-4">
        {sessionsLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-10 h-10 rounded-full border-4 border-primary dark:border-secondary border-t-transparent animate-spin" />
          </div>
        ) : activeMessages.length === 0 ? (
          <SuggestedQuestions
            onSelectQuestion={(q) => handleSendMessage(q)}
            onStartVoice={() => voiceButtonRef.current?.click()}
          />
        ) : (
          <div className="w-full max-w-5xl lg:max-w-6xl xl:max-w-7xl mx-auto space-y-4 pt-2 transition-all duration-300 ease-in-out">
            {activeMessages.map((msg) => (
              <ChatMessage
                key={msg.id}
                message={msg}
                onRegenerate={handleRegenerate}
                onSpeak={msg.role === 'assistant' ? () => handleToggleSpeakBubble(msg.text, msg.id) : undefined}
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

      {/* Input Bar */}
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

      {/* Voice Settings Drawer */}
      {isSettingsOpen && (
        <>
          <div
            onClick={() => setIsSettingsOpen(false)}
            className="fixed inset-0 z-[99998] bg-slate-900/40 backdrop-blur-xs"
          />
          <VoiceSettingsPanel
            settings={voiceSettings}
            onChange={handleVoiceSettingsChange}
            onClose={() => setIsSettingsOpen(false)}
          />
        </>
      )}

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        chatTitle={currentSession?.title || 'Conversation'}
        messages={activeMessages}
      />
    </main>
  );
}
