import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  MoreVertical,
  Edit2,
  Trash2,
  Pin,
  Star,
  Copy,
  Download,
  GraduationCap,
  Sparkles,
  MessageSquare,
  History,
  LayoutDashboard,
  User as UserIcon,
  LogOut,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
} from 'lucide-react';

import { useSidebar } from '../context/SidebarContext';
import { useAuth } from '../hooks/useAuth';

export interface ChatSession {
  id: string;
  title: string;
  lastUpdated: string;
  timestamp: number;
  pinned?: boolean;
  favorite?: boolean;
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
  onDuplicateChat?: (id: string) => void;
  onExportChat?: (id: string) => void;
  onFavoriteChat?: (id: string) => void;
}

export default function Sidebar({
  conversations = [],
  activeChatId = '',
  onSelectChat = () => {},
  onNewChat = () => {},
  onRenameChat = () => {},
  onDeleteChat = () => {},
  onPinChat = () => {},
  onDuplicateChat = () => {},
  onExportChat = () => {},
  onFavoriteChat = () => {},
}: SidebarProps) {
  const { isOpen, isPinned, setIsOpen, togglePin } = useSidebar();
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle closing on mobile or when unpinned, after selecting a chat
  const handleAction = () => {
    if (!isPinned) {
      setIsOpen(false);
    }
  };

  const filtered = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const now = Date.now();
  const ONE_DAY = 24 * 60 * 60 * 1000;

  const todayChats = filtered.filter((c) => now - c.timestamp < ONE_DAY && !c.pinned);
  const yesterdayChats = filtered.filter((c) => now - c.timestamp >= ONE_DAY && now - c.timestamp < 2 * ONE_DAY && !c.pinned);
  const prev7Days = filtered.filter((c) => now - c.timestamp >= 2 * ONE_DAY && now - c.timestamp < 7 * ONE_DAY && !c.pinned);
  const olderChats = filtered.filter((c) => now - c.timestamp >= 7 * ONE_DAY && !c.pinned);
  const pinnedChats = filtered.filter((c) => c.pinned);

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
        <div className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
          <span>{groupTitle}</span>
        </div>
        <div className="mt-1 space-y-0.5">
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
                  className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm transition cursor-pointer ${
                    isActive
                      ? 'bg-slate-200/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
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
                        className="w-full rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 px-2 py-0.5 text-xs text-slate-900 dark:text-white outline-none"
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <div className="truncate min-w-0 flex-1">
                        <p className="truncate">{chat.title}</p>
                      </div>
                    )}
                  </div>

                  {/* Options Button */}
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(isMenuOpen ? null : chat.id);
                      }}
                      className={`rounded-lg p-1 transition opacity-0 group-hover:opacity-100 ${
                        isMenuOpen ? 'opacity-100 bg-slate-200 dark:bg-slate-700' : 'hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>

                    {/* Dropdown Menu */}
                    {isMenuOpen && (
                      <div
                        ref={menuRef}
                        className="absolute right-0 top-7 z-50 w-44 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-1.5 shadow-xl"
                      >
                        <button onClick={(e) => { e.stopPropagation(); startRename(chat); }} className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700">
                          <Edit2 className="h-3.5 w-3.5" />
                          <span>Rename</span>
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); onPinChat(chat.id); setOpenMenuId(null); }} className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700">
                          <Pin className="h-3.5 w-3.5" />
                          <span>{chat.pinned ? 'Unpin' : 'Pin'}</span>
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); onFavoriteChat(chat.id); setOpenMenuId(null); }} className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700">
                          <Star className="h-3.5 w-3.5" />
                          <span>{chat.favorite ? 'Unfavorite' : 'Favorite'}</span>
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); onDeleteChat(chat.id); setOpenMenuId(null); }} className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10">
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

  return (
    <AnimatePresence>
      {isOpen && (
        <div className={`fixed inset-y-0 left-0 z-50 flex ${isPinned ? 'md:static md:z-0 md:h-screen' : ''}`}>
          
          {/* Backdrop (hidden if pinned on desktop) */}
          {(!isPinned) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className={`fixed inset-0 bg-black/40 backdrop-blur-sm ${isPinned ? 'md:hidden' : ''}`}
            />
          )}

          {/* Sidebar Panel */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative flex h-full w-[280px] max-w-[85vw] flex-col border-r border-slate-200 dark:border-slate-800 bg-[#F9F9F9] dark:bg-slate-950 shadow-xl md:shadow-none"
          >
            {/* Header: Logo, Name, Pin/Close */}
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0A2A6A] text-white">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <span className="font-semibold text-slate-800 dark:text-slate-100">CampusMate AI</span>
              </div>
              <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                <button
                  onClick={togglePin}
                  className="hidden md:flex h-8 w-8 items-center justify-center rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 transition"
                  title={isPinned ? 'Unpin sidebar' : 'Pin sidebar'}
                >
                  {isPinned ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="md:hidden h-8 w-8 flex items-center justify-center rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Top Navigation */}
            <div className="px-3 py-2 space-y-1">
              <button
                onClick={() => {
                  onNewChat();
                  handleAction();
                }}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition hover:bg-slate-200/50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 shadow-sm">
                    <Sparkles className="h-3.5 w-3.5 text-[#0A2A6A] dark:text-slate-300" />
                  </div>
                  <span>New chat</span>
                </div>
                <Edit2 className="h-4 w-4 text-slate-400" />
              </button>

              <Link
                to="/dashboard"
                onClick={handleAction}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  location.pathname === '/dashboard'
                    ? 'bg-slate-200/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800'
                }`}
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
            </div>

            {/* Chat History Section */}
            <div className="flex-1 overflow-y-auto px-3 py-2">
              {filtered.length > 0 && (
                <div className="mb-4">
                  <div className="relative">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search..."
                      className="w-full rounded-lg bg-slate-200/50 dark:bg-slate-900 py-1.5 pl-8 pr-3 text-xs text-slate-800 dark:text-slate-200 outline-none placeholder:text-slate-500"
                    />
                    <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-500" />
                  </div>
                </div>
              )}

              {filtered.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500">
                  No conversations.
                </div>
              ) : (
                <>
                  {renderGroup('Pinned', pinnedChats)}
                  {renderGroup('Today', todayChats)}
                  {renderGroup('Yesterday', yesterdayChats)}
                  {renderGroup('Previous 7 Days', prev7Days)}
                  {renderGroup('Older', olderChats)}
                </>
              )}
            </div>

            {/* Bottom Section: Profile & Logout */}
            <div className="p-3 border-t border-slate-200 dark:border-slate-800">
              <div className="flex flex-col gap-1">
                <Link
                  to="/settings"
                  onClick={handleAction}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition text-slate-700 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800"
                >
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </Link>

                <div className="mt-1 flex flex-col gap-1 rounded-xl bg-white dark:bg-slate-900 p-2 shadow-sm border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-3 px-2 py-1">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E8B24D] font-bold text-[#0A2A6A]">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{user?.name || 'User'}</span>
                      <span className="truncate text-xs text-slate-500 dark:text-slate-400">{user?.role === 'admin' ? 'Administrator' : 'Student'}</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 rounded-lg px-2 py-1.5 text-sm font-medium transition text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Log out</span>
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
