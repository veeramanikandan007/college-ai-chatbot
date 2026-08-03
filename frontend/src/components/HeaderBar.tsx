import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PanelLeft,
  Bot,
  Search,
  Sun,
  Moon,
  LogIn,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useSidebar } from '../context/SidebarContext';
import { useAuth } from '../hooks/useAuth';
import { useCommandPalette } from '../context/CommandPaletteContext';
import UserAvatar from './UserAvatar';
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
}: HeaderBarProps) {
  const { isDarkMode, toggleTheme } = useTheme();
  const { toggleSidebar } = useSidebar();
  const { user } = useAuth();
  const { openPalette } = useCommandPalette();

  return (
    <header className="sticky top-0 z-30 h-[64px] w-full border-b border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#FFFFFF] dark:bg-[#111111] backdrop-blur-md select-none transition-colors duration-150">
      <div className="flex h-full w-full items-center justify-between px-3 sm:px-6 gap-2">

        {/* 1. Left: Menu Button & Brand */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={toggleSidebar}
            className="flex h-10 w-10 items-center justify-center rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#181818] text-[#111827] dark:text-[#FAFAFA] hover:bg-[#F9FAFB] dark:hover:bg-[#232323] transition-colors lg:hidden shrink-0 cursor-pointer"
            title="Open Navigation Menu"
          >
            <PanelLeft size={18} />
          </button>

          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#111827] text-[#FFFFFF] dark:bg-[#FAFAFA] dark:text-[#111111] border border-[#111827] dark:border-[#FAFAFA] shrink-0">
              <Bot size={18} />
            </div>
            <span className="hidden sm:inline-block font-bold text-[15px] text-[#111827] dark:text-[#FAFAFA] tracking-tight">
              CollegeMate AI
            </span>
          </Link>
        </div>

        {/* 2. Center: Compact Search Bar (40px Height, 10px Radius, Centered Placeholder) */}
        <div className="flex flex-1 items-center justify-center max-w-xs sm:max-w-md px-1">
          <button
            type="button"
            onClick={openPalette}
            aria-label="Search CollegeMate AI"
            className="flex h-[40px] w-full items-center justify-between rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#F8FAFC] dark:bg-[#181818] px-3 text-[#6B7280] dark:text-[#A3A3A3] hover:border-[#111827] dark:hover:border-[#FAFAFA] transition-all cursor-pointer truncate"
          >
            <div className="flex items-center justify-center gap-2 w-full sm:w-auto truncate">
              <Search size={16} className="text-[#6B7280] dark:text-[#A3A3A3] shrink-0" />
              <span className="truncate text-[13px] sm:text-[14px] text-center sm:text-left">
                {currentChatTitle || 'Search CollegeMate AI'}
              </span>
            </div>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[11px] font-mono font-medium text-[#6B7280] dark:text-[#A3A3A3] bg-[#FFFFFF] dark:bg-[#111111] border border-[#D1D5DB] dark:border-[#3F3F46] rounded-[6px] shrink-0">
              Ctrl K
            </kbd>
          </button>
        </div>

        {/* 3. Right: Action Buttons (All 40x40px, 10px Radius) */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="flex h-10 w-10 items-center justify-center rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#181818] text-[#111827] dark:text-[#FAFAFA] hover:bg-[#F9FAFB] dark:hover:bg-[#232323] transition-colors cursor-pointer shrink-0"
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Notification Bell */}
          <div className="flex h-10 w-10 items-center justify-center rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#181818] text-[#111827] dark:text-[#FAFAFA] hover:bg-[#F9FAFB] dark:hover:bg-[#232323] transition-colors shrink-0">
            {isLoggedIn && <NotificationBell />}
          </div>

          {/* Profile Avatar Button (36px Mobile, 40px Desktop) */}
          {isLoggedIn ? (
            <UserAvatar
              user={user}
              size="header"
              onClick={onOpenProfile}
              className="cursor-pointer"
            />
          ) : (
            <button
              onClick={onOpenLogin}
              className="flex h-10 items-center gap-2 rounded-[10px] bg-[#111827] hover:bg-[#000000] dark:bg-[#FAFAFA] dark:hover:bg-[#E5E5E5] text-[#FFFFFF] dark:text-[#111111] px-3.5 text-[14px] font-medium transition cursor-pointer shrink-0"
            >
              <LogIn size={16} />
              <span className="hidden sm:inline">Login</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
