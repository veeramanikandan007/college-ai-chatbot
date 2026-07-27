import { motion } from 'framer-motion';

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
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0A2A6A] text-white font-bold text-sm shadow-xs">
              ✦
            </div>
            <span className="hidden text-base font-bold text-[#0A2A6A] sm:inline">
              CollegeMate AI
            </span>
          </div>
        </div>

        {/* Center: Current Chat Title */}
        <div className="flex flex-1 items-center justify-center px-4 max-w-md">
          <div className="truncate text-center text-sm font-semibold text-[#0A2A6A] rounded-full bg-[#F8FAFC] border border-[#E2E8F0] px-4 py-1.5 shadow-xs">
            💬 {currentChatTitle || 'New Conversation'}
          </div>
        </div>

        {/* Right Action Icons & Auth */}
        <div className="flex items-center gap-2">
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
            🎙️
          </button>

          {/* Notification Bell */}
          <div className="relative">
            <button
              title="Notifications"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-[#0A2A6A] hover:bg-[#F1F5F9]"
            >
              🔔
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
              className="rounded-xl bg-[#0A2A6A] px-4 py-2 text-xs font-semibold text-white shadow-md shadow-[#0A2A6A]/20 hover:bg-[#163D8C] transition"
            >
              Login
            </button>
          )}
        </div>
      </div>
    </motion.header>
  );
}
