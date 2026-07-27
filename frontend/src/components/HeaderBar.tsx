import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Menu,
  Bot,
  MessageSquare,
  Mic,
  MicOff,
  Bell,
  Sun,
  Moon,
  User,
  LogIn,
  LogOut,
  Sparkles,
} from 'lucide-react';

interface HeaderBarProps {
  currentChatTitle: string;
  onToggleSidebarMobile: () => void;
  onOpenProfile: () => void;
  onOpenLogin: () => void;
  isLoggedIn: boolean;
  isListeningVoice: boolean;
  onToggleVoiceInput: () => void;
  unreadNotificationsCount?: number;
}

export default function HeaderBar({
  currentChatTitle,
  onToggleSidebarMobile,
  onOpenProfile,
  onOpenLogin,
  isLoggedIn,
  isListeningVoice,
  onToggleVoiceInput,
  unreadNotificationsCount = 2,
}: HeaderBarProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  return (
    <motion.header
      initial={{ y: -12, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="sticky top-0 z-30 border-b border-[#E2E8F0] bg-white/90 backdrop-blur-md shadow-xs select-none"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Left: Mobile Toggle & Branding */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebarMobile}
            className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-2 text-[#0A2A6A] hover:bg-[#F1F5F9] md:hidden"
            title="Toggle Sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-[#0A2A6A] to-[#163D8C] text-white shadow-xs">
              <Bot className="h-5 w-5" />
            </div>
            <div className="hidden sm:block">
              <span className="text-base font-bold text-[#0A2A6A]">CollegeMate AI</span>
            </div>
          </div>
        </div>

        {/* Center: Current Chat Title */}
        <div className="flex flex-1 items-center justify-center px-4 max-w-md">
          <div className="flex items-center gap-2 truncate text-center text-xs sm:text-sm font-semibold text-[#0A2A6A] rounded-full bg-[#F8FAFC] border border-[#E2E8F0] px-4 py-1.5 shadow-xs">
            <MessageSquare className="h-4 w-4 text-[#163D8C] shrink-0" />
            <span className="truncate">{currentChatTitle || 'New Conversation'}</span>
          </div>
        </div>

        {/* Right Action Icons & Auth */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-[#0A2A6A] hover:bg-[#F1F5F9] transition"
          >
            {isDarkMode ? <Sun className="h-4 w-4 text-amber-500" /> : <Moon className="h-4 w-4 text-[#0A2A6A]" />}
          </button>

          {/* Microphone Voice Button */}
          <button
            onClick={onToggleVoiceInput}
            title={isListeningVoice ? 'Stop listening' : 'Start voice dictation'}
            className={`flex h-9 w-9 items-center justify-center rounded-xl border transition ${
              isListeningVoice
                ? 'border-rose-500 bg-rose-50 text-rose-600 animate-pulse'
                : 'border-[#E2E8F0] bg-[#F8FAFC] text-[#0A2A6A] hover:bg-[#F1F5F9]'
            }`}
          >
            {isListeningVoice ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </button>

          {/* Notification Bell */}
          <div className="relative">
            <button
              title="Notifications"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-[#0A2A6A] hover:bg-[#F1F5F9]"
            >
              <Bell className="h-4 w-4" />
            </button>
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#E8B24D] text-[9px] font-bold text-[#0A2A6A]">
                {unreadNotificationsCount}
              </span>
            )}
          </div>

          {/* Profile Avatar or Login Button */}
          {isLoggedIn ? (
            <button
              onClick={onOpenProfile}
              className="flex items-center gap-2 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-1.5 pl-2 text-xs font-semibold text-[#0A2A6A] hover:bg-[#F1F5F9] transition"
            >
              <span className="hidden sm:inline">Ariana</span>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#E8B24D] text-xs font-bold text-[#0A2A6A] shadow-xs">
                AP
              </div>
            </button>
          ) : (
            <button
              onClick={onOpenLogin}
              className="flex items-center gap-1.5 rounded-xl bg-[#0A2A6A] px-4 py-2 text-xs font-semibold text-white shadow-md shadow-[#0A2A6A]/20 hover:bg-[#163D8C] transition"
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
