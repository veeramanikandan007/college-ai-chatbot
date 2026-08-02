import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PanelLeft,
  Bot,
  MessageSquareMore,
  Sun,
  Moon,
  LogIn,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useSidebar } from '../context/SidebarContext';
import { useAuth } from '../hooks/useAuth';
import UserAvatar from './UserAvatar';
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
}: HeaderBarProps) {
  const { isDarkMode, toggleTheme } = useTheme();
  const { toggleSidebar } = useSidebar();
  const { user } = useAuth();

  return (
    <motion.header
      initial={{ y: -12, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      className="sticky top-0 z-30 border-b border-[#E2E8F0] dark:border-[#334155] bg-white/95 dark:bg-[#111827]/95 backdrop-blur-md shadow-xs select-none transition-colors duration-200"
    >
      {/* Header Height: 64px, Vertical Center Alignment */}
      <div className="flex h-[64px] w-full items-center justify-between px-4 sm:px-6">
        {/* Left: Mobile Toggle & Branding */}
        <div className="flex items-center gap-3">
          <motion.button
            variants={buttonHover}
            initial="rest"
            whileHover="hover"
            whileTap="tap"
            onClick={toggleSidebar}
            className="flex h-10 w-10 items-center justify-center rounded-[12px] border border-[#E2E8F0] dark:border-[#334155] bg-[#F5F7FB] dark:bg-[#1E293B] text-[#0E2A6D] dark:text-[#60A5FA] hover:bg-[#E2E8F0] dark:hover:bg-[#334155] transition-colors lg:hidden shrink-0"
            title="Toggle Sidebar Menu"
          >
            <PanelLeft size={16} strokeWidth={1.75} />
          </motion.button>

          {/* Logo + Brand — 34x34 container, 16px Bot icon, League Spartan 18px 700 */}
          <Link to="/" className="flex items-center gap-2.5">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.18 }}
              className="flex h-[34px] w-[34px] items-center justify-center rounded-[10px] bg-gradient-to-br from-[#0E2A6D] to-[#1E4DB7] text-white shadow-xs border border-[#D9A441]/30 shrink-0"
            >
              <Bot size={16} strokeWidth={1.75} />
            </motion.div>
            <div className="hidden sm:block">
              <span className="font-heading font-bold text-[16px] tracking-tight text-[#0E2A6D] dark:text-[#F8FAFC] transition-colors">
                CollegeMate AI
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Current Chat Title Search Pill — Chat Title in Inter 14px 600 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.05, duration: 0.2 }}
          className="flex flex-1 items-center justify-center px-4 max-w-md"
        >
          <div className="flex h-[36px] items-center gap-2 truncate text-center font-body font-semibold text-[14px] text-[#1F2937] dark:text-[#F8FAFC] rounded-full bg-[#F5F7FB] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] px-3.5 shadow-xs transition-colors">
            <MessageSquareMore size={16} strokeWidth={1.75} className="text-[#0E2A6D] dark:text-[#60A5FA] shrink-0" />
            <span className="truncate">{currentChatTitle || 'New Conversation'}</span>
          </div>
        </motion.div>

        {/* Right: Action Buttons — All Buttons 40x40px, Icons 16px */}
        <div className="flex items-center gap-2.5">
          {/* Theme Toggle */}
          <motion.button
            onClick={toggleTheme}
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex h-10 w-10 items-center justify-center rounded-[12px] border border-[#E2E8F0] dark:border-[#334155] bg-[#F5F7FB] dark:bg-[#1E293B] text-[#0E2A6D] dark:text-[#D9A441] hover:bg-[#E2E8F0] dark:hover:bg-[#334155] transition-colors overflow-hidden shrink-0"
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
                  <Sun size={16} strokeWidth={1.75} />
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
                  <Moon size={16} strokeWidth={1.75} />
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>

          {/* Notification Bell */}
          <div className="flex h-10 w-10 items-center justify-center rounded-[12px] border border-[#E2E8F0] dark:border-[#334155] bg-[#F5F7FB] dark:bg-[#1E293B] transition-colors hover:bg-[#E2E8F0] dark:hover:bg-[#334155] shrink-0">
            {isLoggedIn && <NotificationBell />}
          </div>

          {/* Profile Avatar Button or Login */}
          {isLoggedIn ? (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <UserAvatar
                user={user}
                size="header"
                onClick={onOpenProfile}
                className="shadow-xs cursor-pointer"
              />
            </motion.div>
          ) : (
            <motion.button
              onClick={onOpenLogin}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="flex h-10 items-center gap-2 rounded-[12px] bg-[#0E2A6D] hover:bg-[#153B8A] px-3.5 font-body text-[14px] font-semibold text-white shadow-xs transition-colors shrink-0"
            >
              <LogIn size={16} strokeWidth={1.75} />
              <span>Login</span>
            </motion.button>
          )}
        </div>
      </div>
    </motion.header>
  );
}
