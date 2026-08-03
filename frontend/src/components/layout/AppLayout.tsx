/**
 * AppLayout — Single shared layout for all protected routes.
 *
 * This component is mounted ONCE and never remounted on navigation.
 * The Sidebar, HeaderBar, and ProfileDrawer live here permanently.
 * Only the <Outlet /> (main content area) swaps on route changes.
 *
 * Root cause fix: Previously, DashboardPage had its own <Sidebar> + local
 * sessions state, and StudentLayout had a separate empty <Sidebar>.
 * Navigating between them destroyed and recreated both the Sidebar instance
 * and the sessions array, causing "No chats found" on Settings/Notes pages.
 *
 * Fix: All chat session state is lifted into useChatStore (Zustand).
 * The Sidebar is mounted once here and reads from the global store.
 */
import { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { useChatStore } from '../../store/useChatStore';
import { useVoiceStore } from '../../store/useVoiceStore';
import Sidebar from '../Sidebar';
import HeaderBar from '../HeaderBar';
import ProfileDrawer from '../ProfileDrawer';
import { fetchApi } from '../../lib/api';

const contentVariants = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.18, ease: [0.4, 0, 0.2, 1] } },
  exit: { opacity: 0, y: -6, transition: { duration: 0.12 } },
};

export default function AppLayout() {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const {
    sessions,
    activeChatId,
    sessionsLoaded,
    loadSessions,
    setActiveChatId,
    loadMessages,
    addSession,
    updateSession,
    removeSession,
    setMessagesMap,
  } = useChatStore();

  const { stop: stopSpeech } = useVoiceStore();

  // Load sessions ONCE when layout mounts (or after login).
  // The guard inside loadSessions() prevents double-fetching.
  useEffect(() => {
    if (user) loadSessions();
  }, [user]);

  // ── Chat handlers passed down to Sidebar ───────────────────────────────────
  const handleSelectChat = async (id: string) => {
    stopSpeech();
    setActiveChatId(id);
    await loadMessages(id);
    // Navigate to dashboard if not already there
    if (location.pathname !== '/dashboard') {
      navigate('/dashboard');
    }
  };

  const handleNewChat = () => {
    stopSpeech();
    setActiveChatId(null);
    if (location.pathname !== '/dashboard') {
      navigate('/dashboard');
    }
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

  const handleDeleteChat = async (id: string) => {
    removeSession(id);
    try {
      await fetchApi(`/chat/sessions/${id}`, { method: 'DELETE' });
    } catch {
      showToast('Could not delete chat.', 'error');
    }
  };

  const handlePinChat = async (id: string) => {
    const chat = sessions.find((s) => s.id === id);
    if (!chat) return;
    const newPinned = !chat.pinned;
    updateSession(id, { pinned: newPinned });
    try {
      await fetchApi(`/chat/sessions/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ is_pinned: newPinned }),
      });
    } catch { }
  };

  const handleArchiveChat = (id: string) => {
    const chat = sessions.find((s) => s.id === id);
    updateSession(id, { archived: !chat?.archived });
    showToast(chat?.archived ? 'Chat restored.' : 'Chat archived.', 'success');
  };

  const handleDuplicateChat = async (id: string) => {
    const chatToDuplicate = sessions.find((s) => s.id === id);
    if (!chatToDuplicate) return;
    try {
      const data = await fetchApi('/chat/sessions', {
        method: 'POST',
        body: JSON.stringify({ title: `${chatToDuplicate.title} (Copy)` }),
      });
      addSession({
        id: String(data.id),
        title: data.title,
        lastUpdated: 'Just now',
        timestamp: Date.now(),
      });
      setMessagesMap((prev) => ({ ...prev, [String(data.id)]: [] }));
      setActiveChatId(String(data.id));
      showToast('Chat duplicated successfully.', 'success');
    } catch {
      showToast('Could not duplicate chat.', 'error');
    }
  };

  // Current session title for the header
  const currentSession = sessions.find((s) => s.id === activeChatId);
  const headerTitle =
    location.pathname === '/dashboard'
      ? currentSession?.title || 'CollegeMate AI'
      : 'CollegeMate AI';

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#FFFFFF] dark:bg-[#09090B] text-[#111827] dark:text-[#FAFAFA] transition-colors duration-200">
      {/* ── Sidebar — mounted ONCE, never remounted ── */}
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
        onExportChat={() => {}}
      />

      {/* ── Right Side: Header + Page Content ── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <HeaderBar
          currentChatTitle={headerTitle}
          onOpenProfile={() => setIsProfileOpen(true)}
          onOpenLogin={() => {}}
          isLoggedIn={!!user}
        />

        {/* ── Animated page content area — only this swaps on navigation ── */}
        <div className="flex flex-1 overflow-hidden relative">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={location.pathname}
              variants={contentVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="absolute inset-0 flex flex-col overflow-hidden"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ── Global Overlays ── */}
      <ProfileDrawer
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        onLogout={logout}
      />
    </div>
  );
}
