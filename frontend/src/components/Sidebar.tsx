import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  active?: string;
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
  isOpenMobile = false,
  onCloseMobile = () => {},
}: SidebarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown menu on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter conversations by search term
  const filtered = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Date Grouping logic
  const now = Date.now();
  const ONE_DAY = 24 * 60 * 60 * 1000;

  const todayChats = filtered.filter(
    (c) => now - c.timestamp < ONE_DAY && !c.pinned
  );
  const yesterdayChats = filtered.filter(
    (c) => now - c.timestamp >= ONE_DAY && now - c.timestamp < 2 * ONE_DAY && !c.pinned
  );
  const prev7Days = filtered.filter(
    (c) => now - c.timestamp >= 2 * ONE_DAY && now - c.timestamp < 7 * ONE_DAY && !c.pinned
  );
  const olderChats = filtered.filter(
    (c) => now - c.timestamp >= 7 * ONE_DAY && !c.pinned
  );
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
        <p className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.24em] text-[#163D8C]">
          {groupTitle}
        </p>
        <div className="mt-1 space-y-1">
          {groupChats.map((chat) => {
            const isActive = chat.id === activeChatId;
            const isMenuOpen = openMenuId === chat.id;

            return (
              <div key={chat.id} className="relative group">
                <div
                  onClick={() => {
                    onSelectChat(chat.id);
                    onCloseMobile();
                  }}
                  className={`group flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition cursor-pointer border ${
                    isActive
                      ? 'bg-[#0A2A6A] text-white border-[#0A2A6A] shadow-md shadow-[#0A2A6A]/15'
                      : 'border-transparent text-[#1F2937] hover:bg-[#F1F5F9] hover:border-[#E2E8F0]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    {chat.unread && (
                      <span className="h-2 w-2 rounded-full bg-[#E8B24D] shrink-0" />
                    )}
                    {chat.favorite && (
                      <span className="text-amber-400 text-xs shrink-0">★</span>
                    )}

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
                        className="w-full rounded border border-[#163D8C] bg-white px-2 py-0.5 text-xs text-[#0A2A6A] outline-none"
                      />
                    ) : (
                      <div className="truncate min-w-0">
                        <p className={`truncate font-medium ${isActive ? 'text-white' : 'text-[#0A2A6A]'}`}>
                          {chat.title}
                        </p>
                        <p className={`text-[10px] ${isActive ? 'text-slate-300' : 'text-[#64748B]'}`}>
                          {chat.lastUpdated}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Three-dot menu button */}
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(isMenuOpen ? null : chat.id);
                      }}
                      className={`rounded-lg p-1 transition opacity-0 group-hover:opacity-100 ${
                        isActive
                          ? 'text-white hover:bg-white/20'
                          : 'text-[#64748B] hover:bg-[#E2E8F0]'
                      } ${isMenuOpen ? 'opacity-100' : ''}`}
                    >
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <circle cx="12" cy="5" r="2" />
                        <circle cx="12" cy="12" r="2" />
                        <circle cx="12" cy="19" r="2" />
                      </svg>
                    </button>

                    {/* Options Dropdown Menu */}
                    {isMenuOpen && (
                      <div
                        ref={menuRef}
                        className="absolute right-0 top-7 z-50 w-44 rounded-xl border border-[#E2E8F0] bg-white p-1.5 shadow-xl backdrop-blur-xl"
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            startRename(chat);
                          }}
                          className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-[#1F2937] hover:bg-[#F1F5F9]"
                        >
                          ✏️ Rename Chat
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onPinChat(chat.id);
                            setOpenMenuId(null);
                          }}
                          className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-[#1F2937] hover:bg-[#F1F5F9]"
                        >
                          📌 {chat.pinned ? 'Unpin Chat' : 'Pin Chat'}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onFavoriteChat(chat.id);
                            setOpenMenuId(null);
                          }}
                          className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-[#1F2937] hover:bg-[#F1F5F9]"
                        >
                          ⭐ {chat.favorite ? 'Unfavorite' : 'Favorite Chat'}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDuplicateChat(chat.id);
                            setOpenMenuId(null);
                          }}
                          className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-[#1F2937] hover:bg-[#F1F5F9]"
                        >
                          📄 Duplicate Chat
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onExportChat(chat.id);
                            setOpenMenuId(null);
                          }}
                          className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-[#1F2937] hover:bg-[#F1F5F9]"
                        >
                          📥 Export Chat
                        </button>
                        <div className="my-1 border-t border-[#E2E8F0]" />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteChat(chat.id);
                            setOpenMenuId(null);
                          }}
                          className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                        >
                          🗑️ Delete Chat
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

  const sidebarContent = (
    <div className="flex h-full flex-col bg-white border-r border-[#E2E8F0] p-4 shadow-sm select-none">
      {/* Brand Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-[#0A2A6A] to-[#163D8C] text-lg text-white shadow-md shadow-[#0A2A6A]/20">
            🎓
          </div>
          <div>
            <h2 className="text-base font-bold tracking-tight text-[#0A2A6A]">CollegeMate AI</h2>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#E8B24D]">
              SaaS Assistant
            </p>
          </div>
        </div>
      </div>

      {/* New Chat Button */}
      <button
        onClick={() => {
          onNewChat();
          onCloseMobile();
        }}
        className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0A2A6A] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-[#0A2A6A]/20 transition hover:bg-[#163D8C] active:scale-[0.98]"
      >
        <span className="text-lg leading-none">+</span>
        <span>New Chat</span>
      </button>

      {/* Search Input */}
      <div className="relative mb-4">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search conversations..."
          className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] py-2 pl-9 pr-3 text-xs text-[#1F2937] outline-none transition focus:border-[#163D8C] focus:bg-white"
        />
        <svg
          className="absolute left-3 top-2.5 h-4 w-4 text-[#64748B]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto pr-1">
        {filtered.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#64748B]">
            No conversations found.
          </div>
        ) : (
          <>
            {renderGroup('Pinned Chats', pinnedChats)}
            {renderGroup('Today', todayChats)}
            {renderGroup('Yesterday', yesterdayChats)}
            {renderGroup('Previous 7 Days', prev7Days)}
            {renderGroup('Previous Month', olderChats)}
          </>
        )}
      </div>

      {/* Footer Info */}
      <div className="mt-auto border-t border-[#E2E8F0] pt-3 text-center text-[11px] font-medium text-[#64748B]">
        CollegeMate AI v2.0 • Powered by RAG
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Permanent Sidebar */}
      <aside className="hidden w-72 shrink-0 md:block">{sidebarContent}</aside>

      {/* Mobile Sliding Drawer */}
      <AnimatePresence>
        {isOpenMobile && (
          <div className="fixed inset-0 z-50 md:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onCloseMobile}
              className="absolute inset-0 bg-[#0A2A6A]/30 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative h-full w-72 max-w-[80vw]"
            >
              {sidebarContent}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
