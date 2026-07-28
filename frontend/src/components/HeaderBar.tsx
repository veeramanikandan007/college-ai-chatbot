import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  Bot,
  MessageSquare,
  Mic,
  MicOff,
  Bell,
  Sun,
  Moon,
  LogIn,
  ChevronDown,
  BellOff,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { CampusNotification, getNotifications } from '../services/notificationService';

interface HeaderBarProps {
  currentChatTitle: string;
  onToggleSidebarMobile: () => void;
  onOpenProfile: () => void;
  onOpenLogin: () => void;
  isListeningVoice: boolean;
  onToggleVoiceInput: () => void;
}

export default function HeaderBar({
  currentChatTitle,
  onToggleSidebarMobile,
  onOpenProfile,
  onOpenLogin,
  isListeningVoice,
  onToggleVoiceInput,
}: HeaderBarProps) {
  const { isLoggedIn, user } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<CampusNotification[]>([]);
  const notifRef = useRef<HTMLDivElement>(null);

  // Load notifications on mount
  useEffect(() => {
    getNotifications().then(setNotifications);
  }, []);

  // Close notification dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Dark mode toggle — applies class to <html> element
  const handleThemeToggle = () => {
    const html = document.documentElement;
    if (isDarkMode) {
      html.classList.remove('dark');
    } else {
      html.classList.add('dark');
    }
    setIsDarkMode(!isDarkMode);
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const notifCategoryColor = (cat: CampusNotification['category']) => {
    switch (cat) {
      case 'Exam':    return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Library': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Fee':     return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:        return 'bg-[#E8B24D]/10 text-[#0A2A6A] border-[#E8B24D]/30';
    }
  };

  return (
    <motion.header
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="sticky top-0 z-30 border-b border-[#E2E8F0] bg-white/95 backdrop-blur-md shadow-sm select-none"
    >
      <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-5">
        {/* ── LEFT: mobile toggle + logo ───────────────────── */}
        <div className="flex items-center gap-3">
          <button
            id="sidebar-toggle"
            onClick={onToggleSidebarMobile}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-[#0A2A6A] hover:bg-[#F1F5F9] transition md:hidden"
            aria-label="Toggle sidebar"
          >
            <Menu className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-[#0A2A6A] to-[#163D8C] text-white shadow-sm shadow-[#0A2A6A]/20">
              <Bot className="h-5 w-5" />
            </div>
            <span className="hidden text-base font-bold text-[#0A2A6A] sm:block">CollegeMate AI</span>
          </div>
        </div>

        {/* ── CENTER: active chat title ────────────────────── */}
        <div className="flex min-w-0 flex-1 items-center justify-center px-2">
          <div className="flex items-center gap-2 truncate rounded-full border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-1.5 text-xs font-semibold text-[#0A2A6A] shadow-xs max-w-xs">
            <MessageSquare className="h-3.5 w-3.5 shrink-0 text-[#163D8C]" />
            <span className="truncate">{currentChatTitle || 'New Conversation'}</span>
          </div>
        </div>

        {/* ── RIGHT: actions ───────────────────────────────── */}
        <div className="flex items-center gap-1.5">
          {/* Theme Toggle */}
          <button
            id="theme-toggle"
            onClick={handleThemeToggle}
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-[#0A2A6A] hover:bg-[#F1F5F9] transition"
          >
            {isDarkMode
              ? <Sun className="h-4 w-4 text-[#E8B24D]" />
              : <Moon className="h-4 w-4" />
            }
          </button>

          {/* Voice Input Toggle */}
          <button
            id="voice-toggle"
            onClick={onToggleVoiceInput}
            title={isListeningVoice ? 'Stop Voice Input' : 'Start Voice Input'}
            className={`flex h-9 w-9 items-center justify-center rounded-xl border transition ${
              isListeningVoice
                ? 'border-rose-400 bg-rose-50 text-rose-600 animate-pulse'
                : 'border-[#E2E8F0] bg-[#F8FAFC] text-[#0A2A6A] hover:bg-[#F1F5F9]'
            }`}
          >
            {isListeningVoice ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </button>

          {/* Notification Bell */}
          <div className="relative" ref={notifRef}>
            <button
              id="notification-bell"
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              title="Notifications"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-[#0A2A6A] hover:bg-[#F1F5F9] transition"
            >
              <Bell className="h-4 w-4" />
            </button>
            {/* Unread badge */}
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#E8B24D] text-[9px] font-bold text-[#0A2A6A] shadow-sm">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}

            {/* Notification Dropdown */}
            <AnimatePresence>
              {isNotifOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.97 }}
                  transition={{ duration: 0.16 }}
                  className="absolute right-0 top-11 z-50 w-80 rounded-2xl border border-[#E2E8F0] bg-white shadow-xl overflow-hidden"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between border-b border-[#E2E8F0] px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4 text-[#163D8C]" />
                      <span className="text-sm font-bold text-[#0A2A6A]">Notifications</span>
                      {unreadCount > 0 && (
                        <span className="rounded-full bg-[#E8B24D] px-1.5 py-0.5 text-[10px] font-bold text-[#0A2A6A]">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllRead}
                        className="flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-semibold text-[#163D8C] hover:bg-[#F1F5F9]"
                      >
                        <BellOff className="h-3 w-3" />
                        <span>Mark all read</span>
                      </button>
                    )}
                  </div>

                  {/* Notification List */}
                  <div className="max-h-72 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="py-8 text-center text-xs text-[#64748B]">
                        No notifications yet.
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() =>
                            setNotifications((prev) =>
                              prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
                            )
                          }
                          className={`flex cursor-pointer items-start gap-3 border-b border-[#F1F5F9] px-4 py-3 hover:bg-[#F8FAFC] transition last:border-b-0 ${
                            !notif.read ? 'bg-[#EEF2FF]/30' : ''
                          }`}
                        >
                          <span
                            className={`mt-0.5 shrink-0 rounded-md border px-1.5 py-0.5 text-[10px] font-bold ${notifCategoryColor(notif.category)}`}
                          >
                            {notif.category}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-[#0A2A6A] leading-snug">{notif.title}</p>
                            <p className="text-[11px] text-[#64748B] mt-0.5 leading-snug">{notif.message}</p>
                            <p className="text-[10px] text-[#94A3B8] mt-1">{notif.date}</p>
                          </div>
                          {!notif.read && (
                            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#E8B24D]" />
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Auth: Avatar or Login ───────────────────── */}
          {isLoggedIn && user ? (
            <button
              id="user-avatar"
              onClick={onOpenProfile}
              className="flex items-center gap-2 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-1 pl-2.5 text-xs font-semibold text-[#0A2A6A] hover:bg-[#F1F5F9] transition"
              aria-label="Open profile"
            >
              <span className="hidden sm:inline">{user.name.split(' ')[0]}</span>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#E8B24D] text-xs font-bold text-[#0A2A6A]">
                {user.initials}
              </div>
              <ChevronDown className="h-3 w-3 text-[#64748B]" />
            </button>
          ) : (
            <button
              id="login-btn"
              onClick={onOpenLogin}
              className="flex items-center gap-1.5 rounded-xl bg-[#0A2A6A] px-4 py-2 text-xs font-bold text-white shadow-md shadow-[#0A2A6A]/20 hover:bg-[#163D8C] transition"
            >
              <LogIn className="h-3.5 w-3.5" />
              <span>Login</span>
            </button>
          )}
        </div>
      </div>
    </motion.header>
  );
}
