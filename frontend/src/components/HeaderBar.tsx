import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PanelLeft,
  Bot,
  MessageSquareMore,
  Bell,
  Sun,
  Moon,
  CircleUserRound,
  LogIn,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useSidebar } from '../context/SidebarContext';
import { NotificationBell } from './notifications/NotificationBell';
import { themeToggleVariants, buttonHover } from '../lib/animations';

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
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="sticky top-0 z-30 border-b border-[#E2E8F0] dark:border-slate-800 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md shadow-xs select-none transition-colors duration-300"
    >
      <div className="flex h-16 w-full items-center justify-between px-4 sm:px-6">
        {/* Left: Mobile Toggle & Branding */}
        <div className="flex items-center gap-3">
          <motion.button
            variants={buttonHover}
            initial="rest"
            whileHover="hover"
            whileTap="tap"
            onClick={toggleSidebar}
            className={`rounded-xl border border-[#E2E8F0] dark:border-slate-700 bg-[#F8FAFC] dark:bg-slate-900 p-2 text-[#0A2A6A] dark:text-slate-200 hover:bg-[#F1F5F9] dark:hover:bg-slate-800 transition-colors ${isPinned ? 'md:hidden' : ''}`}
            title="Toggle Sidebar"
          >
            <PanelLeft size={22} strokeWidth={1.75} />
          </motion.button>

          <Link to="/" className="flex items-center gap-2">
            <motion.div
              whileHover={{ scale: 1.08, rotate: -4 }}
              whileTap={{ scale: 0.94 }}
              transition={{ duration: 0.2 }}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-[#0A2A6A] to-[#163D8C] text-white shadow-xs"
            >
              <Bot size={22} strokeWidth={1.75} />
            </motion.div>
            <div className="hidden sm:block">
              <span className="font-heading text-base font-bold text-[#0A2A6A] dark:text-slate-100 tracking-tight transition-colors">CollegeMate AI</span>
            </div>
          </Link>
        </div>

        {/* Center: Current Chat Title */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.25 }}
          className="flex flex-1 items-center justify-center px-4 max-w-md"
        >
          <div className="flex items-center gap-2 truncate text-center text-xs sm:text-sm font-semibold text-[#0A2A6A] dark:text-slate-200 rounded-full bg-[#F8FAFC] dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 px-4 py-1.5 shadow-xs transition-colors">
            <MessageSquareMore size={18} strokeWidth={1.75} className="text-[#163D8C] dark:text-secondary shrink-0" />
            <span className="truncate">{currentChatTitle || 'New Conversation'}</span>
          </div>
        </motion.div>

        {/* Right Action Icons & Auth */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle with rotation animation */}
          <motion.button
            onClick={toggleTheme}
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#E2E8F0] dark:border-slate-700 bg-[#F8FAFC] dark:bg-slate-900 text-[#0A2A6A] dark:text-amber-400 hover:bg-[#F1F5F9] dark:hover:bg-slate-800 transition-colors overflow-hidden"
          >
            <AnimatePresence mode="wait" initial={false}>
              {isDarkMode ? (
                <motion.span
                  key="sun"
                  variants={themeToggleVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="flex items-center justify-center"
                >
                  <Sun size={20} strokeWidth={1.75} />
                </motion.span>
              ) : (
                <motion.span
                  key="moon"
                  variants={themeToggleVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="flex items-center justify-center"
                >
                  <Moon size={20} strokeWidth={1.75} />
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>

          {/* Notification Bell */}
          <div className="relative flex items-center justify-center rounded-xl border border-[#E2E8F0] dark:border-slate-700 bg-[#F8FAFC] dark:bg-slate-900 transition-colors hover:bg-[#F1F5F9] dark:hover:bg-slate-800">
            {isLoggedIn && <NotificationBell />}
          </div>

          {/* Profile Avatar or Login Button */}
          {isLoggedIn ? (
            <motion.button
              onClick={onOpenProfile}
              title="Open Student Profile Drawer"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-[#0A2A6A] to-[#163D8C] text-white shadow-md"
            >
              <CircleUserRound size={22} strokeWidth={1.75} />
            </motion.button>
          ) : (
            <motion.button
              onClick={onOpenLogin}
              whileHover={{ scale: 1.04, y: -1 }}
              whileTap={{ scale: 0.96 }}
              className="flex items-center gap-1.5 rounded-xl bg-[#0A2A6A] px-4 py-2 text-xs font-semibold text-white shadow-md shadow-[#0A2A6A]/20 hover:bg-[#163D8C] transition-colors"
            >
              <LogIn className="h-3.5 w-3.5" />
              <span>Login</span>
            </motion.button>
          )}
        </div>
      </div>
    </motion.header>
  );
}

