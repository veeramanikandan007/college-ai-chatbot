import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import {
  SquarePen,
  Search,
  MoreVertical,
  Edit2,
  Trash2,
  Pin,
  Copy,
  GraduationCap,
  MessageSquare,
  BookOpen,
  FileText,
  Settings,
  LogOut,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  UserRound,
  Brain,
  Briefcase,
} from 'lucide-react';

import { useSidebar } from '../context/SidebarContext';
import { useAuth } from '../hooks/useAuth';
import UserAvatar from './UserAvatar';
import { getNavItemsForRole } from '../config/navigation';

export type ChatCategory =
  | 'Admissions'
  | 'Examinations'
  | 'Attendance'
  | 'Library'
  | 'Placements'
  | 'Fees'
  | 'Hostel'
  | 'Academics'
  | 'General';

export interface ChatSession {
  id: string;
  title: string;
  lastUpdated: string;
  timestamp: number;
  pinned?: boolean;
  archived?: boolean;
  category?: ChatCategory;
  color?: string;
  unread?: boolean;
}

interface SidebarProps {
  conversations?: ChatSession[];
  activeChatId?: string;
  onSelectChat?: (id: string) => void;
  onNewChat?: () => void;
  onRenameChat?: (id: string, newTitle: string) => void;
  onDeleteChat?: (id: string) => void;
  onPinChat?: (id: string) => void;
  onArchiveChat?: (id: string) => void;
  onDuplicateChat?: (id: string) => void;
  onExportChat?: (id: string) => void;
  onChangeCategory?: (id: string, category: ChatCategory) => void;
}

// Text match highlighter for live search
function HighlightedText({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;
  const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark
            key={i}
            className="bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-[#FAFAFA] rounded px-0.5 font-medium"
          >
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
}

// Memoized Chat History Item Component — Height 56px, Padding 14px (px-[14px]), Icon 18px
interface ChatItemProps {
  chat: ChatSession;
  isActive: boolean;
  searchTerm: string;
  editingId: string | null;
  editingTitle: string;
  openMenuId: string | null;
  contextMenuId: string | null;
  onSelect: (id: string) => void;
  onRenameStart: (chat: ChatSession) => void;
  onRenameSave: (id: string) => void;
  onRenameCancel: () => void;
  setEditingTitle: (val: string) => void;
  onToggleMenu: (id: string, e: React.MouseEvent) => void;
  onContextMenu: (id: string, e: React.MouseEvent) => void;
  onPin: (id: string) => void;
  onDuplicate: (id: string) => void;
  onExport: (id: string) => void;
  onDelete: (id: string) => void;
}

const ChatItem = React.memo(function ChatItem({
  chat,
  isActive,
  searchTerm,
  editingId,
  editingTitle,
  openMenuId,
  contextMenuId,
  onSelect,
  onRenameStart,
  onRenameSave,
  onRenameCancel,
  setEditingTitle,
  onToggleMenu,
  onContextMenu,
  onPin,
  onDuplicate,
  onExport,
  onDelete,
}: ChatItemProps) {
  const isMenuOpen = openMenuId === chat.id || contextMenuId === chat.id;
  const isEditing = editingId === chat.id;

  return (
    <div
      onContextMenu={(e) => onContextMenu(chat.id, e)}
      className="relative group my-[8px]"
    >
      <div
        onClick={() => onSelect(chat.id)}
        className={`flex h-[44px] items-center justify-between rounded-lg px-3 transition-all duration-150 cursor-pointer select-none border font-body ${isActive
            ? 'bg-zinc-100 dark:bg-[#1A1A1A]/80 text-zinc-900 dark:text-[#FAFAFA] border-zinc-200 dark:border-[#2A2A2A] font-semibold'
            : 'text-zinc-600 dark:text-[#A3A3A3] border-transparent hover:bg-zinc-100/70 dark:hover:bg-[#1A1A1A]/50 hover:text-zinc-900 dark:hover:text-zinc-100'
          }`}
      >
        <div className="flex items-center gap-[12px] min-w-0 flex-1 pr-1">
          <MessageSquare
            size={16}
            strokeWidth={1.75}
            className={`shrink-0 ${isActive ? 'text-zinc-900 dark:text-[#FAFAFA]' : 'text-zinc-400 dark:text-[#737373]'
              }`}
          />

          {isEditing ? (
            <input
              type="text"
              autoFocus
              value={editingTitle}
              onChange={(e) => setEditingTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onRenameSave(chat.id);
                if (e.key === 'Escape') onRenameCancel();
              }}
              onBlur={() => onRenameSave(chat.id)}
              onClick={(e) => e.stopPropagation()}
              className="w-full bg-white dark:bg-[#0A0A0A] border border-[#1E4DB7] text-[15px] font-medium text-[#1F2937] dark:text-[#F8FAFC] rounded-lg px-2 py-1 outline-none"
            />
          ) : (
            <div className="flex flex-col min-w-0">
              <span className="truncate text-[15px] font-medium leading-snug">
                <HighlightedText text={chat.title} query={searchTerm} />
              </span>
              <span className="text-[12px] text-[#9CA3AF] dark:text-[#737373] truncate leading-tight">
                {chat.lastUpdated}
              </span>
            </div>
          )}
        </div>

        {/* Action Menu Toggle Button */}
        {!isEditing && (
          <button
            onClick={(e) => onToggleMenu(chat.id, e)}
            className={`p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-[#E2E8F0] dark:hover:bg-[#252525] text-[#64748B] dark:text-[#A3A3A3] transition-opacity shrink-0 ${isMenuOpen ? 'opacity-100 bg-[#E2E8F0] dark:bg-[#252525]' : ''
              }`}
            title="Options"
          >
            <MoreVertical size={18} strokeWidth={1.75} />
          </button>
        )}
      </div>

      {/* Dropdown Options Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.12 }}
            className="absolute right-2 top-[52px] z-50 w-44 rounded-xl border border-[#E2E8F0] dark:border-[#2A2A2A] bg-white dark:bg-[#111111] p-1.5 shadow-lg select-none font-body text-[13px]"
          >
            <button
              onClick={() => onPin(chat.id)}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[#475569] dark:text-[#D4D4D4] hover:bg-[#F5F7FB] dark:hover:bg-[#111111] transition"
            >
              <Pin size={16} strokeWidth={1.75} />
              <span>{chat.pinned ? 'Unpin Chat' : 'Pin Chat'}</span>
            </button>
            <button
              onClick={() => onRenameStart(chat)}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[#475569] dark:text-[#D4D4D4] hover:bg-[#F5F7FB] dark:hover:bg-[#111111] transition"
            >
              <Edit2 size={16} strokeWidth={1.75} />
              <span>Rename</span>
            </button>
            <button
              onClick={() => onDuplicate(chat.id)}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[#475569] dark:text-[#D4D4D4] hover:bg-[#F5F7FB] dark:hover:bg-[#111111] transition"
            >
              <Copy size={16} strokeWidth={1.75} />
              <span>Duplicate</span>
            </button>
            <button
              onClick={() => onDelete(chat.id)}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[#EF4444] hover:bg-rose-50 dark:hover:bg-rose-900/20 transition"
            >
              <Trash2 size={16} strokeWidth={1.75} />
              <span>Delete</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

interface SidebarTooltipProps {
  label: string;
  isCollapsed: boolean;
  children: React.ReactNode;
}

const SidebarTooltip: React.FC<SidebarTooltipProps> = ({ label, isCollapsed, children }) => {
  const [isVisible, setIsVisible] = useState(false);

  if (!isCollapsed) {
    return <>{children}</>;
  }

  return (
    <div
      className="relative flex items-center justify-center"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}

      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, x: -6, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -4, scale: 0.95 }}
            transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
            role="tooltip"
            aria-label={label}
            className="absolute left-full ml-3 z-[100] hidden md:flex items-center pointer-events-none"
          >
            {/* Tooltip Arrow pointing left */}
            <div className="w-0 h-0 border-y-[5px] border-y-transparent border-r-[6px] border-r-[#111827] drop-shadow-xs" />

            {/* Custom Tooltip Content Box */}
            <div className="bg-[#111827] text-white text-[13px] font-medium font-body px-3 py-1.5 rounded-[8px] shadow-lg shadow-black/30 whitespace-nowrap border border-slate-700/50 flex items-center gap-1.5">
              <span>{label}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function Sidebar({
  conversations = [],
  activeChatId,
  onSelectChat = () => { },
  onNewChat = () => { },
  onRenameChat = () => { },
  onDeleteChat = () => { },
  onPinChat = () => { },
  onArchiveChat = () => { },
  onDuplicateChat = () => { },
  onExportChat = () => { },
}: SidebarProps) {
  const { isCollapsed, setIsCollapsed, toggleCollapse, isOpen, setIsOpen } = useSidebar();
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const checkIsActive = useCallback(
    (item: { path: string; matchPaths?: string[] }) => {
      const currentPath = location.pathname;
      const currentTab = searchParams.get('tab');

      if (item.path.includes('?tab=')) {
        const [basePath, queryPart] = item.path.split('?tab=');
        return currentPath === basePath && currentTab === queryPart;
      }

      if (item.path === '/faculty') {
        return currentPath === '/faculty' && (!currentTab || currentTab === 'dashboard');
      }

      if (item.path === '/dashboard') {
        return currentPath === '/dashboard';
      }

      return currentPath === item.path || Boolean(item.matchPaths && item.matchPaths.includes(currentPath));
    },
    [location.pathname, searchParams]
  );

  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [contextMenuId, setContextMenuId] = useState<string | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const desktopRef = useRef<HTMLDivElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcut Ctrl+\ or Ctrl+B to toggle collapse
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === '\\' || e.key.toLowerCase() === 'b')) {
        e.preventDefault();
        toggleCollapse();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isCollapsed) setIsCollapsed(false);
        setTimeout(() => searchInputRef.current?.focus(), 150);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCollapsed, setIsCollapsed, toggleCollapse]);

  // Click outside menu dismiss
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        desktopRef.current && !desktopRef.current.contains(target) &&
        drawerRef.current && !drawerRef.current.contains(target)
      ) {
        setOpenMenuId(null);
        setContextMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ESC key to close mobile sidebar
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, setIsOpen]);

  // Mobile Swipe Gesture
  const touchStartX = useRef<number | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const currentX = e.touches[0].clientX;
    const diffX = touchStartX.current - currentX;
    if (diffX > 50) { // Swiped left
      setIsOpen(false);
      touchStartX.current = null;
    }
  };

  // Live search filtering
  const filteredChats = useMemo(() => {
    if (!searchTerm.trim()) return conversations;
    return conversations.filter((c) =>
      c.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [conversations, searchTerm]);

  // Categorize Conversations into Date Groups
  const groupedChats = useMemo(() => {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;

    const pinned: ChatSession[] = [];
    const today: ChatSession[] = [];
    const yesterday: ChatSession[] = [];
    const prev7Days: ChatSession[] = [];
    const prev30Days: ChatSession[] = [];
    const older: ChatSession[] = [];

    filteredChats.forEach((c) => {
      if (c.pinned) {
        pinned.push(c);
        return;
      }
      const diff = now - c.timestamp;
      if (diff < oneDay) {
        today.push(c);
      } else if (diff < 2 * oneDay) {
        yesterday.push(c);
      } else if (diff < 7 * oneDay) {
        prev7Days.push(c);
      } else if (diff < 30 * oneDay) {
        prev30Days.push(c);
      } else {
        older.push(c);
      }
    });

    return { pinned, today, yesterday, prev7Days, prev30Days, older };
  }, [filteredChats]);

  const handleStartRename = useCallback((chat: ChatSession) => {
    setEditingId(chat.id);
    setEditingTitle(chat.title);
    setOpenMenuId(null);
    setContextMenuId(null);
  }, []);

  const handleSaveRename = useCallback((id: string) => {
    if (editingTitle.trim()) {
      onRenameChat(id, editingTitle.trim());
    }
    setEditingId(null);
  }, [editingTitle, onRenameChat]);

  const handleCancelRename = useCallback(() => {
    setEditingId(null);
  }, []);

  const handleToggleMenu = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setContextMenuId(null);
    setOpenMenuId((prev) => (prev === id ? null : id));
  }, []);

  const handleContextMenu = useCallback((id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setOpenMenuId(null);
    setContextMenuId((prev) => (prev === id ? null : id));
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const renderGroupSection = (
    groupTitle: string,
    chats: ChatSession[],
    onSelectCb?: (id: string) => void,
    isPinnedSection?: boolean
  ) => {
    if (chats.length === 0) return null;
    return (
      <div className="mb-3">
        <div className="sticky top-0 bg-white dark:bg-[#0A0A0A] z-10 flex items-center gap-2 px-[14px] py-1 font-body text-[12px] font-medium uppercase tracking-[0.08em] text-[#64748B] dark:text-[#A3A3A3]">
          {isPinnedSection ? (
            <>
              <Pin size={16} strokeWidth={1.75} className="text-[#EF4444] shrink-0" />
              <span className="text-[#EF4444]">PINNED</span>
            </>
          ) : (
            <span>{groupTitle}</span>
          )}
        </div>
        <div className="mt-1">
          {chats.map((chat) => (
            <ChatItem
              key={chat.id}
              chat={chat}
              isActive={chat.id === activeChatId}
              searchTerm={searchTerm}
              editingId={editingId}
              editingTitle={editingTitle}
              openMenuId={openMenuId}
              contextMenuId={contextMenuId}
              onSelect={(id) => {
                onSelectChat(id);
                if (onSelectCb) onSelectCb(id);
              }}
              onRenameStart={handleStartRename}
              onRenameSave={handleSaveRename}
              onRenameCancel={handleCancelRename}
              setEditingTitle={setEditingTitle}
              onToggleMenu={handleToggleMenu}
              onContextMenu={handleContextMenu}
              onPin={(id) => { onPinChat(id); setOpenMenuId(null); setContextMenuId(null); }}
              onDuplicate={(id) => { onDuplicateChat(id); setOpenMenuId(null); setContextMenuId(null); }}
              onExport={(id) => { onExportChat(id); setOpenMenuId(null); setContextMenuId(null); }}
              onDelete={(id) => { onDeleteChat(id); setOpenMenuId(null); setContextMenuId(null); }}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* ========================================================================= */}
      {/* 1. DESKTOP PERSISTENT SIDEBAR (>= 1024px)                                  */}
      {/* Width: 260px expanded, 72px collapsed                                    */}
      {/* ========================================================================= */}
      <motion.aside
        ref={desktopRef}
        initial={false}
        animate={{ width: isCollapsed ? 72 : 320 }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        className="hidden lg:flex flex-col h-[100dvh] shrink-0 border-r border-[#E2E8F0] dark:border-[#2A2A2A] bg-white dark:bg-[#0A0A0A] relative z-40 overflow-hidden select-none py-[16px] px-[12px] box-border"
      >
        {/* Logo Section — Height 72px */}
        <div className="flex items-center shrink-0 mb-3 h-[60px] px-1 select-none">
          {!isCollapsed ? (
            <div className="flex w-full items-center justify-between">
              <Link to="/" className="flex items-center gap-[12px] min-w-0">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                  className="w-[36px] h-[36px] rounded-lg flex items-center justify-center shrink-0 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border border-zinc-200 dark:border-zinc-800"
                >
                  <GraduationCap size={18} strokeWidth={1.75} />
                </motion.div>
                <span className="font-heading font-bold text-[16px] tracking-tight text-zinc-900 dark:text-[#FAFAFA] truncate">
                  CollegeMate AI
                </span>
              </Link>

              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleCollapse();
                }}
                className="w-[40px] h-[40px] rounded-xl flex items-center justify-center shrink-0 text-[#64748B] dark:text-[#A3A3A3] hover:bg-[#F5F7FB] dark:hover:bg-[#181818] transition-all duration-250 cursor-pointer pointer-events-auto z-50"
                title="Collapse sidebar (Ctrl + \)"
              >
                <PanelLeftClose size={18} strokeWidth={1.75} />
              </motion.button>
            </div>
          ) : (
            <div className="flex w-full items-center justify-center">
              <SidebarTooltip label="Expand sidebar (Ctrl + \)" isCollapsed={isCollapsed}>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleCollapse();
                  }}
                  className="w-[40px] h-[40px] rounded-xl flex items-center justify-center shrink-0 bg-[#F5F7FB] dark:bg-[#181818] text-[#111827] dark:text-[#A3A3A3] hover:bg-[#E2E8F0] dark:hover:bg-[#252525] transition-all duration-250 cursor-pointer pointer-events-auto z-50 border border-[#E2E8F0] dark:border-[#2A2A2A]"
                >
                  <PanelLeftOpen size={18} strokeWidth={1.75} />
                </motion.button>
              </SidebarTooltip>
            </div>
          )}
        </div>

        {/* Navigation Buttons & Chat History */}
        <div className="flex-1 flex flex-col min-h-0 gap-1.5">
          {/* Main Action Links — Rendered dynamically from central navigation config */}
          <div className="flex flex-col gap-1 shrink-0 max-h-[45vh] overflow-y-auto no-scrollbar">
            {getNavItemsForRole(user?.role).map((item) => {
              const Icon = item.icon;
              if (item.isAction) {
                return (
                  <SidebarTooltip key={item.id} label="New Chat (Ctrl + N)" isCollapsed={isCollapsed}>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      onClick={() => {
                        if (location.pathname !== '/dashboard') {
                          navigate('/dashboard?newChat=true');
                        } else {
                          onNewChat();
                        }
                      }}
                      className={`rounded-lg font-body font-medium transition-all duration-150 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 flex items-center shrink-0 ${
                        isCollapsed ? 'w-[40px] h-[40px] justify-center mx-auto' : 'w-full h-[38px] justify-between px-3 text-[14px]'
                      }`}
                    >
                      <div className="flex items-center gap-[10px]">
                        <Icon size={18} strokeWidth={1.75} className="shrink-0" />
                        {!isCollapsed && <span>{item.label}</span>}
                      </div>
                      {!isCollapsed && <span className="font-body text-[11px] opacity-70">Ctrl+N</span>}
                    </motion.button>
                  </SidebarTooltip>
                );
              }

              const isActive = checkIsActive(item);

              return (
                <SidebarTooltip key={item.id} label={item.label} isCollapsed={isCollapsed}>
                  <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
                    <Link
                      to={item.path}
                      className={`rounded-lg transition-all duration-150 flex items-center shrink-0 ${
                        isActive
                          ? 'bg-zinc-100 dark:bg-[#1A1A1A] text-zinc-900 dark:text-[#FAFAFA] font-semibold'
                          : 'text-zinc-600 dark:text-[#A3A3A3] font-medium bg-transparent hover:bg-zinc-100/70 dark:hover:bg-[#1A1A1A]/50 hover:text-zinc-900 dark:hover:text-zinc-100'
                      } ${
                        isCollapsed
                          ? 'w-[40px] h-[40px] justify-center mx-auto'
                          : 'w-full h-[36px] gap-[10px] px-3 font-body text-[13.5px]'
                      }`}
                    >
                      <Icon
                        size={18}
                        strokeWidth={1.75}
                        className={`${isActive ? 'text-zinc-900 dark:text-[#FAFAFA]' : 'text-zinc-500 dark:text-[#A3A3A3]'} shrink-0`}
                      />
                      {!isCollapsed && <span>{item.label}</span>}
                    </Link>
                  </motion.div>
                </SidebarTooltip>
              );
            })}

            {/* Search Button (Collapsed mode) — Student Only */}
            {isCollapsed && user?.role === 'student' && (
              <SidebarTooltip label="Search Conversations (Ctrl + K)" isCollapsed={isCollapsed}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => {
                    setIsCollapsed(false);
                    setTimeout(() => searchInputRef.current?.focus(), 150);
                  }}
                  className="w-[42px] h-[42px] rounded-[12px] flex items-center justify-center shrink-0 mx-auto text-[#64748B] dark:text-[#A3A3A3] hover:bg-[#F5F7FB] dark:hover:bg-[#181818] transition-all duration-200 mt-1"
                >
                  <Search size={20} strokeWidth={1.75} />
                </motion.button>
              </SidebarTooltip>
            )}
          </div>

          {/* Search Input & Scrollable History — Student Only */}
          {!isCollapsed && user?.role === 'student' && (
            <div className="flex-1 flex flex-col min-h-0 gap-[8px] mt-1">
              <div className="relative flex items-center shrink-0">
                <Search size={16} strokeWidth={1.75} className="absolute left-3 text-[#9CA3AF] dark:text-[#737373] pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search chats... (Ctrl + K)"
                  className="w-full h-[38px] rounded-[12px] bg-[#F5F7FB] dark:bg-[#181818] border border-transparent py-2 pl-9 pr-8 text-[14px] font-body text-[#1F2937] dark:text-[#F8FAFC] outline-none focus:border-[#9CA3AF] dark:focus:border-[#52525B] placeholder:text-[#64748B] dark:placeholder:text-[#737373] transition"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2.5 p-1 rounded-full text-[#64748B] hover:text-[#1F2937] dark:hover:text-[#F8FAFC]"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Chat History List */}
              <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain pr-1 custom-scrollbar">
                {filteredChats.length === 0 ? (
                  <div className="py-10 text-center text-caption text-[#64748B] flex flex-col items-center gap-2">
                    <Search size={18} strokeWidth={1.75} className="opacity-40" />
                    <p className="font-semibold text-[#475569] dark:text-[#D4D4D4]">No chats found</p>
                  </div>
                ) : (
                  <>
                    {renderGroupSection('Pinned', groupedChats.pinned, undefined, true)}
                    {renderGroupSection('Today', groupedChats.today)}
                    {renderGroupSection('Yesterday', groupedChats.yesterday)}
                    {renderGroupSection('Previous 7 Days', groupedChats.prev7Days)}
                    {renderGroupSection('Previous 30 Days', groupedChats.prev30Days)}
                    {renderGroupSection('Older', groupedChats.older)}
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Footer Section — Avatar 36px, Name 15px, Role 13px, Logout Icon 18px */}
        <div className="flex shrink-0 flex-col gap-4 pt-3 border-t border-[#E2E8F0] dark:border-[#2A2A2A]">
          <div
            className={`flex items-center rounded-[14px] p-1.5 bg-transparent ${isCollapsed ? 'justify-center flex-col gap-3' : 'justify-between gap-2'
              }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <SidebarTooltip label={user?.name || (user?.role === 'admin' ? 'Administrator' : user?.role === 'faculty' ? 'Faculty' : 'Student Account')} isCollapsed={isCollapsed}>
                <UserAvatar user={user} size="sm" />
              </SidebarTooltip>
              {!isCollapsed && (
                <div className="flex flex-col min-w-0">
                  <span className="truncate text-[15px] font-normal text-[#1F2937] dark:text-[#F8FAFC]">
                    {user?.name || 'Student Account'}
                  </span>
                  <span className="truncate text-[13px] text-[#64748B] dark:text-[#A3A3A3]">
                    {user?.role === 'admin' ? 'Administrator' : user?.role === 'faculty' ? 'Faculty' : 'Student'}
                  </span>
                </div>
              )}
            </div>

            <SidebarTooltip label="Log out" isCollapsed={isCollapsed}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.25 }}
                onClick={handleLogout}
                className="w-[36px] h-[36px] rounded-xl flex items-center justify-center shrink-0 text-[#64748B] dark:text-[#A3A3A3] hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:text-[#EF4444] transition-all duration-250"
              >
                <LogOut size={18} strokeWidth={1.75} />
              </motion.button>
            </SidebarTooltip>
          </div>
        </div>
      </motion.aside>

      {/* ========================================================================= */}
      {/* 2. TABLET & MOBILE DRAWER (< 1024px)                                     */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden select-none">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            />

            {/* Mobile Drawer (Width: 300px, Height: 100dvh, Monochrome System) */}
            <motion.div
              ref={drawerRef}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              className="relative flex h-[100dvh] w-[300px] flex-col border-r border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#111111] shadow-2xl z-10 overflow-hidden py-4 px-3 box-border pb-[env(safe-area-inset-bottom,16px)]"
            >
              {/* Header — Height 64px fixed */}
              <div className="flex items-center justify-between shrink-0 mb-3 h-[64px] border-b border-[#E5E7EB] dark:border-[#2A2A2A] pb-2">
                <div className="flex items-center gap-3">
                  <div className="w-[36px] h-[36px] rounded-[10px] flex items-center justify-center shrink-0 bg-[#111827] text-[#FFFFFF] dark:bg-[#FAFAFA] dark:text-[#111111] border border-[#111827] dark:border-[#FAFAFA]">
                    <GraduationCap size={20} />
                  </div>
                  <span className="font-bold text-[18px] text-[#111827] dark:text-[#FAFAFA] tracking-tight">
                    CollegeMate AI
                  </span>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-[40px] h-[40px] rounded-xl flex items-center justify-center shrink-0 text-[#64748B] dark:text-[#A3A3A3] hover:bg-[#F5F7FB] dark:hover:bg-[#181818] transition-all duration-200 cursor-pointer"
                  title="Close sidebar"
                >
                  <PanelLeftClose size={20} strokeWidth={1.75} />
                </button>
              </div>

              {/* Navigation Actions — Height 44px, Font 15px, Icon 20px */}
              <div className="flex flex-col gap-1 shrink-0 mb-3 max-h-[40vh] overflow-y-auto no-scrollbar">
                {getNavItemsForRole(user?.role).map((item) => {
                  const Icon = item.icon;
                  if (item.isAction) {
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          if (location.pathname !== '/dashboard') {
                            navigate('/dashboard?newChat=true');
                          } else {
                            onNewChat();
                          }
                          setIsOpen(false);
                        }}
                        className="h-[40px] w-full rounded-[10px] font-bold text-[13px] transition-all bg-[#111827] hover:bg-[#000000] dark:bg-[#FAFAFA] dark:hover:bg-[#E5E5E5] text-[#FFFFFF] dark:text-[#111111] shadow-xs flex items-center justify-between px-3.5 cursor-pointer shrink-0"
                      >
                        <div className="flex items-center gap-3">
                          <Icon size={20} />
                          <span>{item.label}</span>
                        </div>
                      </button>
                    );
                  }

                  const isActive = checkIsActive(item);

                  return (
                    <Link
                      key={item.id}
                      to={item.path}
                      onClick={() => setIsOpen(false)}
                      className={`h-[40px] rounded-[10px] text-[13px] font-medium transition-all flex items-center gap-3 px-3.5 shrink-0 ${
                        isActive
                          ? 'bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] font-bold'
                          : 'text-[#4B5563] dark:text-[#A3A3A3] hover:bg-[#F8FAFC] dark:hover:bg-[#232323] hover:text-[#111827] dark:hover:text-[#FAFAFA]'
                      }`}
                    >
                      <Icon size={20} className="shrink-0" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>

              {/* Search Bar & Chat History — Student Only */}
              {user?.role === 'student' && (
                <>
                  <div className="relative flex items-center shrink-0 mb-2">
                    <Search size={16} className="absolute left-3 text-[#9CA3AF] dark:text-[#737373] pointer-events-none" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search conversations..."
                      className="w-full h-[40px] rounded-[10px] bg-[#F8FAFC] dark:bg-[#181818] border border-[#D1D5DB] dark:border-[#2A2A2A] py-2 pl-9 pr-7 text-[14px] text-[#111827] dark:text-[#FAFAFA] outline-none placeholder-[#9CA3AF] dark:placeholder-[#737373]"
                    />
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm('')}
                        className="absolute right-2.5 p-1 rounded-full text-[#6B7280] dark:text-[#A3A3A3] hover:text-[#111827] dark:hover:text-[#FAFAFA]"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain pr-1 custom-scrollbar">
                    {filteredChats.length === 0 ? (
                      <div className="py-10 text-center text-[13px] text-[#6B7280] dark:text-[#A3A3A3] flex flex-col items-center gap-2">
                        <Search size={18} className="opacity-40" />
                        <p className="font-semibold text-[#111827] dark:text-[#FAFAFA]">No chats found</p>
                      </div>
                    ) : (
                      <>
                        {renderGroupSection('Pinned', groupedChats.pinned, () => setIsOpen(false), true)}
                        {renderGroupSection('Today', groupedChats.today, () => setIsOpen(false))}
                        {renderGroupSection('Yesterday', groupedChats.yesterday, () => setIsOpen(false))}
                        {renderGroupSection('Previous 7 Days', groupedChats.prev7Days, () => setIsOpen(false))}
                        {renderGroupSection('Previous 30 Days', groupedChats.prev30Days, () => setIsOpen(false))}
                        {renderGroupSection('Older', groupedChats.older, () => setIsOpen(false))}
                      </>
                    )}
                  </div>
                </>
              )}

              {/* Safe Area Profile Bottom Bar — Fixed at bottom */}
              <div className="flex shrink-0 flex-col pt-3 border-t border-[#E5E7EB] dark:border-[#2A2A2A] mt-auto">
                <div className="flex items-center justify-between gap-2 rounded-[12px] p-2 bg-[#F8FAFC] dark:bg-[#181818] border border-[#D1D5DB] dark:border-[#3F3F46]">
                  <div className="flex items-center gap-3 min-w-0">
                    <UserAvatar user={user} size="sm" />
                    <div className="flex flex-col min-w-0">
                      <span className="truncate text-[14px] font-bold text-[#111827] dark:text-[#FAFAFA]">
                        {user?.name || (user?.role === 'admin' ? 'Administrator' : user?.role === 'faculty' ? 'Faculty Member' : 'Student Account')}
                      </span>
                      <span className="truncate text-[12px] text-[#6B7280] dark:text-[#A3A3A3]">
                        {user?.role === 'admin' ? 'Administrator' : user?.role === 'faculty' ? 'Faculty' : 'Student'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setIsOpen(false);
                      handleLogout();
                    }}
                    title="Log out"
                    className="w-[36px] h-[36px] rounded-[8px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#111111] flex items-center justify-center shrink-0 text-[#111827] dark:text-[#FAFAFA] hover:bg-[#F9FAFB] dark:hover:bg-[#232323] transition"
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
