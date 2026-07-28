import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Menu,
  Bot,
  MessageSquare,
  Bell,
  Sun,
  Moon,
  User,
  LogIn,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useSidebar } from '../context/SidebarContext';
import { NotificationBell } from './notifications/NotificationBell';

interface HeaderBarProps {
  currentChatTitle: string;
  onOpenProfile: () => void;
  onOpenLogin: () => void;
  isLoggedIn: boolean;
  unreadNotificationsCount?: number;
}

export default function HeaderBar({
  currentChatTitle,
  onOpenProfile,
  onOpenLogin,
  isLoggedIn,
  unreadNotificationsCount = 2,
}: HeaderBarProps) {
  const { isDarkMode, toggleTheme } = useTheme();
  const { toggleSidebar, isPinned } = useSidebar();

  return (
    <motion.header
      initial={{ y: -12, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="sticky top-0 z-30 border-b border-[#E2E8F0] dark:border-slate-800 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md shadow-xs select-none transition-colors duration-300"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Left: Mobile Toggle & Branding */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSidebar}
            className={`rounded-xl border border-[#E2E8F0] dark:border-slate-700 bg-[#F8FAFC] dark:bg-slate-900 p-2 text-[#0A2A6A] dark:text-slate-200 hover:bg-[#F1F5F9] dark:hover:bg-slate-800 transition-colors ${isPinned ? 'md:hidden' : ''}`}
            title="Toggle Sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>

          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-[#0A2A6A] to-[#163D8C] text-white shadow-xs">
              <Bot className="h-5 w-5" />
            </div>
            <div className="hidden sm:block">
              <span className="text-base font-bold text-[#0A2A6A] dark:text-slate-100 transition-colors">CollegeMate AI</span>
            </div>
          </Link>
        </div>

        {/* Center: Current Chat Title */}
        <div className="flex flex-1 items-center justify-center px-4 max-w-md">
          <div className="flex items-center gap-2 truncate text-center text-xs sm:text-sm font-semibold text-[#0A2A6A] dark:text-slate-200 rounded-full bg-[#F8FAFC] dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 px-4 py-1.5 shadow-xs transition-colors">
            <MessageSquare className="h-4 w-4 text-[#163D8C] dark:text-secondary shrink-0" />
            <span className="truncate">{currentChatTitle || 'New Conversation'}</span>
          </div>
        </div>

        {/* Right Action Icons & Auth */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#E2E8F0] dark:border-slate-700 bg-[#F8FAFC] dark:bg-slate-900 text-[#0A2A6A] dark:text-amber-400 hover:bg-[#F1F5F9] dark:hover:bg-slate-800 transition"
          >
            {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {/* Notification Bell */}
          <div className="relative flex items-center justify-center rounded-xl border border-[#E2E8F0] dark:border-slate-700 bg-[#F8FAFC] dark:bg-slate-900 transition-colors">
            {isLoggedIn && <NotificationBell />}
          </div>

          {/* Profile Avatar or Login Button */}
          {!isLoggedIn && (
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
