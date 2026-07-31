import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  SquarePen,
  Search,
  MoreVertical,
  Edit2,
  Trash2,
  Pin,
  Archive,
  ArchiveRestore,
  Copy,
  Download,
  GraduationCap,
  Sparkles,
  MessageSquareMore,
  History,
  LayoutDashboard,
  LogOut,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  Tag,
  BarChart2,
} from 'lucide-react';

import { useSidebar } from '../context/SidebarContext';
import { useAuth } from '../hooks/useAuth';

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

// Category badge color helper
export function getCategoryBadgeStyle(cat?: ChatCategory) {
  switch (cat) {
    case 'Admissions':
      return 'bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-800';
    case 'Examinations':
      return 'bg-purple-50 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 border-purple-200 dark:border-purple-800';
    case 'Attendance':
      return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
    case 'Library':
      return 'bg-amber-50 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 dark:border-amber-800';
    case 'Placements':
      return 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
    case 'Fees':
      return 'bg-rose-50 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300 border-rose-200 dark:border-rose-800';
    case 'Hostel':
      return 'bg-teal-50 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300 border-teal-200 dark:border-teal-800';
    case 'Academics':
      return 'bg-cyan-50 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800';
    default:
      return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
  }
}

export default function Sidebar({
  conversations = [],
  activeChatId = '',
  onSelectChat = () => {},
  onNewChat = () => {},
  onRenameChat = () => {},
  onDeleteChat = () => {},
  onPinChat = () => {},
  onArchiveChat = () => {},
  onDuplicateChat = () => {},
  onExportChat = () => {},
  onChangeCategory = () => {},
}: SidebarProps) {
  const { isOpen, isPinned, setIsOpen, togglePin } = useSidebar();
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'archived'>('all');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [showStats, setShowStats] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcut: Ctrl + K (or Cmd + K) to focus search input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAction = () => {
    if (!isPinned) {
      setIsOpen(false);
    }
  };

  // Filter based on search term & tab (all vs archived)
  const tabFiltered = conversations.filter((c) =>
    activeTab === 'archived' ? !!c.archived : !c.archived
  );

  const searchFiltered = tabFiltered.filter((c) =>
    c.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pinnedChats = searchFiltered.filter((c) => c.pinned);
  const unpinnedChats = searchFiltered.filter((c) => !c.pinned);

  // Date Grouping logic for unpinned chats
  const now = new Date().getTime();
  const oneDayMs = 24 * 60 * 60 * 1000;

  const todayChats = unpinnedChats.filter((c) => now - c.timestamp < oneDayMs);
  const yesterdayChats = unpinnedChats.filter(
    (c) => now - c.timestamp >= oneDayMs && now - c.timestamp < 2 * oneDayMs
  );
  const prev7DaysChats = unpinnedChats.filter(
    (c) => now - c.timestamp >= 2 * oneDayMs && now - c.timestamp < 7 * oneDayMs
  );
  const olderChats = unpinnedChats.filter((c) => now - c.timestamp >= 7 * oneDayMs);

  const startRename = (chat: ChatSession) => {
    setEditingId(chat.id);
    setEditingTitle(chat.title);
    setOpenMenuId(null);
  };

  const saveRename = (id: string) => {
    if (editingTitle.trim()) {
      onRenameChat(id, editingTitle.trim());
    }
    setEditingId(null);
  };

  const renderGroup = (groupTitle: string, groupChats: ChatSession[]) => {
    if (groupChats.length === 0) return null;
    return (
      <div className="mb-4">
        <div className="flex items-center justify-between px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
          <span>{groupTitle}</span>
          <span className="font-code text-[9px] font-normal">({groupChats.length})</span>
        </div>
        <div className="mt-1 space-y-1">
          {groupChats.map((chat) => {
            const isActive = chat.id === activeChatId;
            const isMenuOpen = openMenuId === chat.id;

            return (
              <div key={chat.id} className="relative group">
                <div
                  onClick={() => {
                    onSelectChat(chat.id);
                    handleAction();
                  }}
                  className={`flex items-center justify-between rounded-xl px-3 py-2 transition cursor-pointer ${
                    isActive
                      ? 'ty-sidebar-active bg-[#0A2A6A]/10 dark:bg-slate-800 text-[#0A2A6A] dark:text-slate-100 border border-[#0A2A6A]/20'
                      : 'ty-sidebar text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex flex-col min-w-0 flex-1 pr-2">
                    {editingId === chat.id ? (
                      <input
                        autoFocus
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveRename(chat.id);
                          if (e.key === 'Escape') setEditingId(null);
                        }}
                        onBlur={() => saveRename(chat.id)}
                        className="w-full rounded bg-white dark:bg-slate-900 border border-[#0A2A6A] px-2 py-0.5 text-xs text-slate-900 dark:text-white outline-none"
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <>
                        <div className="flex items-center gap-1.5 min-w-0">
                          <MessageSquareMore size={16} strokeWidth={1.75} className="shrink-0 text-[#163D8C] dark:text-secondary opacity-70" />
                          <p className="truncate text-slate-900 dark:text-slate-100">
                            {chat.title}
                          </p>
                        </div>
                        {chat.category && (
                          <div className="mt-1 flex items-center gap-1">
                            <span
                              className={`inline-block px-1.5 py-0.5 text-[9px] font-bold rounded-md border ${getCategoryBadgeStyle(
                                chat.category
                              )}`}
                            >
                              {chat.category}
                            </span>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Options Button */}
                  <div className="relative shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(isMenuOpen ? null : chat.id);
                      }}
                      className={`rounded-lg p-1 transition opacity-0 group-hover:opacity-100 ${
                        isMenuOpen
                          ? 'opacity-100 bg-slate-200 dark:bg-slate-700'
                          : 'hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>

                    {/* Dropdown Menu */}
                    {isMenuOpen && (
                      <div
                        ref={menuRef}
                        className="absolute right-0 top-7 z-50 w-44 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-1.5 shadow-xl select-none"
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            startRename(chat);
                          }}
                          className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                          <span>Rename</span>
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onPinChat(chat.id);
                            setOpenMenuId(null);
                          }}
                          className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                        >
                          <Pin className="h-3.5 w-3.5" />
                          <span>{chat.pinned ? 'Unpin' : 'Pin'}</span>
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onArchiveChat(chat.id);
                            setOpenMenuId(null);
                          }}
                          className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                        >
                          {chat.archived ? (
                            <>
                              <ArchiveRestore className="h-3.5 w-3.5 text-emerald-600" />
                              <span>Unarchive</span>
                            </>
                          ) : (
                            <>
                              <Archive className="h-3.5 w-3.5 text-amber-600" />
                              <span>Archive</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onExportChat(chat.id);
                            setOpenMenuId(null);
                          }}
                          className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                        >
                          <Download className="h-3.5 w-3.5" />
                          <span>Export</span>
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteChat(chat.id);
                            setOpenMenuId(null);
                          }}
                          className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const activeCount = conversations.filter((c) => !c.archived).length;
  const archivedCount = conversations.filter((c) => !!c.archived).length;

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className={`fixed inset-y-0 left-0 z-50 flex ${
            isPinned ? 'md:static md:z-0 md:h-screen' : ''
          }`}
        >
          {/* Backdrop */}
          {!isPinned && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className={`fixed inset-0 bg-black/40 backdrop-blur-xs ${
                isPinned ? 'md:hidden' : ''
              }`}
            />
          )}

          {/* Sidebar Panel */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative flex h-full w-[280px] max-w-[85vw] flex-col border-r border-slate-200 dark:border-slate-800 bg-[#F9F9F9] dark:bg-slate-950 shadow-xl md:shadow-none select-none"
          >
            {/* Header: Logo & Branding */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200/80 dark:border-slate-800/80">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-[#0A2A6A] to-[#163D8C] text-white shadow-xs">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <span className="font-bold text-[#0A2A6A] dark:text-slate-100">CollegeMate AI</span>
              </div>
              <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                <button
                  onClick={togglePin}
                  className="hidden md:flex h-8 w-8 items-center justify-center rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition"
                  title={isPinned ? 'Unpin sidebar' : 'Pin sidebar'}
                >
                  {isPinned ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="md:hidden h-8 w-8 flex items-center justify-center rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Navigation Actions */}
            <div className="px-3 py-2 space-y-1">
              <button
                onClick={() => {
                  if (location.pathname !== '/dashboard') {
                    navigate('/dashboard?newChat=true');
                  } else {
                    onNewChat();
                  }
                  handleAction();
                }}
                className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-bold transition bg-[#0A2A6A] text-white shadow-xs hover:bg-[#163D8C]"
              >
                <div className="flex items-center gap-2">
                  <SquarePen size={18} strokeWidth={1.75} />
                  <span>New Chat</span>
                </div>
                <span className="text-[10px] font-normal opacity-80">Ctrl + N</span>
              </button>

              {/* Statistics Summary Toggle */}
              <button
                onClick={() => setShowStats(!showStats)}
                className="flex w-full items-center justify-between rounded-xl px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition"
              >
                <div className="flex items-center gap-2">
                  <BarChart2 className="h-3.5 w-3.5 text-[#163D8C] dark:text-secondary" />
                  <span>Chat Stats</span>
                </div>
                <span className="text-[10px] font-mono bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                  {conversations.length} total
                </span>
              </button>

              {showStats && (
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 text-[11px] space-y-1 text-slate-600 dark:text-slate-300">
                  <div className="flex justify-between">
                    <span>Active Conversations:</span>
                    <span className="font-bold text-[#0A2A6A] dark:text-white">{activeCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Archived Conversations:</span>
                    <span className="font-bold text-amber-600">{archivedCount}</span>
                  </div>
                </div>
              )}
            </div>

            {/* ALWAYS-VISIBLE SEARCH BAR */}
            <div className="px-3 py-1.5">
              <div className="relative">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search chats... (Ctrl + K)"
                  className="w-full rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 py-2 pl-8 pr-7 text-xs text-slate-800 dark:text-slate-200 outline-none focus:ring-1 focus:ring-[#0A2A6A] dark:focus:ring-secondary placeholder:text-slate-400"
                />
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2 top-2.5 p-0.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Active vs Archived Filter Tabs */}
            <div className="px-3 py-1 flex items-center gap-1 border-b border-slate-200/80 dark:border-slate-800/80">
              <button
                onClick={() => setActiveTab('all')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition text-center ${
                  activeTab === 'all'
                    ? 'bg-slate-200 dark:bg-slate-800 text-[#0A2A6A] dark:text-slate-100 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Chats ({activeCount})
              </button>
              <button
                onClick={() => setActiveTab('archived')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition text-center ${
                  activeTab === 'archived'
                    ? 'bg-slate-200 dark:bg-slate-800 text-[#0A2A6A] dark:text-slate-100 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Archived ({archivedCount})
              </button>
            </div>

            {/* Chat History Section */}
            <div className="flex-1 overflow-y-auto px-3 py-2 custom-scrollbar">
              {searchFiltered.length === 0 ? (
                <div className="py-10 text-center text-xs text-slate-500 dark:text-slate-400 flex flex-col items-center gap-2">
                  <Search className="h-6 w-6 text-slate-400 opacity-60" />
                  <p className="font-semibold text-slate-700 dark:text-slate-300">No conversations found</p>
                  <p className="text-[11px] text-slate-400">
                    {searchTerm
                      ? `No titles match "${searchTerm}"`
                      : activeTab === 'archived'
                      ? 'No archived conversations.'
                      : 'No active conversations.'}
                  </p>
                </div>
              ) : (
                <>
                  {renderGroup('📌 Pinned', pinnedChats)}
                  {renderGroup('Today', todayChats)}
                  {renderGroup('Yesterday', yesterdayChats)}
                  {renderGroup('Previous 7 Days', prev7DaysChats)}
                  {renderGroup('Older', olderChats)}
                </>
              )}
            </div>

            {/* Bottom Footer Section */}
            <div className="p-3 border-t border-slate-200 dark:border-slate-800">
              <div className="flex flex-col gap-1">
                <Link
                  to="/settings"
                  onClick={handleAction}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition"
                >
                  <Settings className="h-4 w-4 text-[#163D8C] dark:text-secondary" />
                  <span>Settings</span>
                </Link>

                <div className="mt-1 flex items-center justify-between rounded-xl bg-white dark:bg-slate-900 p-2.5 shadow-xs border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E8B24D] font-bold text-[#0A2A6A] shadow-xs">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="truncate text-xs font-bold text-slate-800 dark:text-slate-100">
                        {user?.name || 'User'}
                      </span>
                      <span className="truncate text-[10px] text-slate-500 dark:text-slate-400">
                        {user?.role === 'admin' ? 'Administrator' : 'Student'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleLogout}
                    title="Log out"
                    className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

