import { create } from 'zustand';
import { ChatSession } from '../components/Sidebar';
import { ChatMessageData } from '../components/ChatMessage';
import { fetchApi, ApiError } from '../lib/api';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface ChatStoreState {
  // Data
  sessions: ChatSession[];
  activeChatId: string | null;
  messagesMap: Record<string, ChatMessageData[]>;
  sessionsLoading: boolean;
  sessionsLoaded: boolean;

  // Actions — Sessions
  loadSessions: () => Promise<void>;
  setActiveChatId: (id: string | null) => void;
  setSessions: (sessions: ChatSession[] | ((prev: ChatSession[]) => ChatSession[])) => void;
  addSession: (session: ChatSession) => void;
  updateSession: (id: string, patch: Partial<ChatSession>) => void;
  removeSession: (id: string) => void;

  // Actions — Messages
  loadMessages: (sessionId: string) => Promise<void>;
  setMessages: (sessionId: string, messages: ChatMessageData[]) => void;
  appendMessage: (sessionId: string, message: ChatMessageData) => void;
  updateMessage: (sessionId: string, messageId: string, patch: Partial<ChatMessageData>) => void;
  removeMessage: (sessionId: string, messageId: string) => void;
  setMessagesMap: (updater: (prev: Record<string, ChatMessageData[]>) => Record<string, ChatMessageData[]>) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
function detectCategoryFromTitle(title: string) {
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
}

// ─────────────────────────────────────────────────────────────────────────────
// Store
// ─────────────────────────────────────────────────────────────────────────────
export const useChatStore = create<ChatStoreState>((set, get) => ({
  sessions: [],
  activeChatId: null,
  messagesMap: {},
  sessionsLoading: false,
  sessionsLoaded: false,

  // ── Sessions ──────────────────────────────────────────────────────────────
  loadSessions: async () => {
    // Guard: never re-fetch if already loaded (prevents reset on navigation)
    if (get().sessionsLoaded || get().sessionsLoading) return;
    set({ sessionsLoading: true });
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
      set({ sessions: mapped, sessionsLoaded: true });
      if (mapped.length > 0 && !get().activeChatId) {
        set({ activeChatId: mapped[0].id });
      }
    } catch (e) {
      if (!(e instanceof ApiError && e.status === 401)) {
        console.error('Failed to load chat sessions', e);
      }
    } finally {
      set({ sessionsLoading: false });
    }
  },

  setActiveChatId: (id) => set({ activeChatId: id }),

  setSessions: (sessions) =>
    set((state) => ({
      sessions: typeof sessions === 'function' ? sessions(state.sessions) : sessions,
    })),

  addSession: (session) =>
    set((state) => ({ sessions: [session, ...state.sessions] })),

  updateSession: (id, patch) =>
    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.id === id
          ? { ...s, ...patch, ...(patch.title ? { category: detectCategoryFromTitle(patch.title) } : {}) }
          : s
      ),
    })),

  removeSession: (id) =>
    set((state) => {
      const remaining = state.sessions.filter((s) => s.id !== id);
      const nextActive =
        state.activeChatId === id
          ? remaining.length > 0
            ? remaining[0].id
            : null
          : state.activeChatId;
      const nextMap = { ...state.messagesMap };
      delete nextMap[id];
      return { sessions: remaining, activeChatId: nextActive, messagesMap: nextMap };
    }),

  // ── Messages ──────────────────────────────────────────────────────────────
  loadMessages: async (sessionId) => {
    // Guard: never re-fetch if already cached
    if (get().messagesMap[sessionId]) return;
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
      set((state) => ({
        messagesMap: { ...state.messagesMap, [sessionId]: mapped },
      }));
    } catch (e) {
      console.error('Failed to load messages for session', sessionId, e);
    }
  },

  setMessages: (sessionId, messages) =>
    set((state) => ({
      messagesMap: { ...state.messagesMap, [sessionId]: messages },
    })),

  appendMessage: (sessionId, message) =>
    set((state) => ({
      messagesMap: {
        ...state.messagesMap,
        [sessionId]: [...(state.messagesMap[sessionId] || []), message],
      },
    })),

  updateMessage: (sessionId, messageId, patch) =>
    set((state) => ({
      messagesMap: {
        ...state.messagesMap,
        [sessionId]: (state.messagesMap[sessionId] || []).map((m) =>
          m.id === messageId ? { ...m, ...patch } : m
        ),
      },
    })),

  removeMessage: (sessionId, messageId) =>
    set((state) => ({
      messagesMap: {
        ...state.messagesMap,
        [sessionId]: (state.messagesMap[sessionId] || []).filter((m) => m.id !== messageId),
      },
    })),

  setMessagesMap: (updater) =>
    set((state) => ({ messagesMap: updater(state.messagesMap) })),
}));
