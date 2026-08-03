import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  LayoutDashboard,
  MessageSquare,
  FileText,
  Scan,
  FilePlus,
  Briefcase,
  CalendarCheck,
  ClipboardList,
  FileCode,
  BarChart2,
  Settings,
  User,
  Moon,
  Sun,
  LogOut,
  Sparkles,
  BookOpen,
  History,
  X,
  CornerDownLeft,
  ArrowUp,
  ArrowDown,
  Brain,
  Clock,
  Command,
  NotebookPen,
} from 'lucide-react';
import { useCommandPalette } from '../../context/CommandPaletteContext';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';

export interface CommandItem {
  id: string;
  title: string;
  description?: string;
  category: 'Recent' | 'Pages' | 'AI Tools' | 'Actions' | 'Settings';
  icon: React.ElementType;
  keywords?: string[];
  shortcut?: string;
  perform: () => void;
}

/* ─────────────────────────────────────────────
   Monochrome icon wrapper — enforces correct
   color per state without inline overrides.
───────────────────────────────────────────── */
function CmdIcon({ icon: Icon, selected }: { icon: React.ElementType; selected: boolean }) {
  return (
    <span
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] border transition-colors duration-100 ${
        selected
          ? 'bg-[#111827] border-[#111827] text-[#FFFFFF] dark:bg-[#FFFFFF] dark:border-[#FFFFFF] dark:text-[#111111]'
          : 'bg-[#F8FAFC] border-[#E5E7EB] text-[#111827] dark:bg-[#181818] dark:border-[#2A2A2A] dark:text-[#FAFAFA]'
      }`}
    >
      <Icon size={18} />
    </span>
  );
}

/* ─────────────────────────────────────────────
   Category section header
───────────────────────────────────────────── */
function CategoryLabel({ label, icon: Icon }: { label: string; icon?: React.ElementType }) {
  return (
    <div className="flex items-center gap-1.5 px-4 pt-4 pb-1.5 select-none">
      {Icon && <Icon size={12} className="text-[#9CA3AF] dark:text-[#52525B] shrink-0" />}
      <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#9CA3AF] dark:text-[#52525B]">
        {label}
      </span>
    </div>
  );
}

export const CommandPalette: React.FC = () => {
  const { isOpen, closePalette } = useCommandPalette();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentItemIds, setRecentItemIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('collegemate_recent_commands');
      return stored ? JSON.parse(stored) : ['page-dashboard', 'page-chat', 'action-new-chat'];
    } catch {
      return ['page-dashboard', 'page-chat', 'action-new-chat'];
    }
  });

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // ── All commands ─────────────────────────────────────────────────────────────
  const allCommands = useMemo<CommandItem[]>(() => {
    const items: CommandItem[] = [
      // Pages
      {
        id: 'page-dashboard',
        title: user?.role === 'faculty' ? 'Faculty Dashboard' : user?.role === 'admin' ? 'Admin Dashboard' : 'Student Dashboard',
        description: 'Overview, stats, and quick actions',
        category: 'Pages',
        icon: LayoutDashboard,
        keywords: ['home', 'dashboard', 'stats', 'analytics'],
        perform: () => navigate('/dashboard'),
      },
      {
        id: 'page-chat',
        title: 'AI Chat Assistant',
        description: 'Ask anything about your college',
        category: 'Pages',
        icon: MessageSquare,
        keywords: ['chat', 'ai', 'ask', 'copilot', 'assistant'],
        perform: () => navigate('/chat'),
      },
      {
        id: 'page-documents',
        title: 'AI Document Hub',
        description: 'Upload and query PDF documents',
        category: 'Pages',
        icon: FileText,
        keywords: ['pdf', 'documents', 'upload', 'files', 'rag'],
        perform: () => navigate('/documents'),
      },
      {
        id: 'page-notes',
        title: 'Knowledge Base & Notes',
        description: 'Study notes, summaries, and flashcards',
        category: 'Pages',
        icon: BookOpen,
        keywords: ['notes', 'summary', 'study', 'knowledge'],
        perform: () => navigate('/notes'),
      },
      {
        id: 'page-ocr',
        title: 'AI OCR Scanner',
        description: 'Convert handwritten notes to text',
        category: 'Pages',
        icon: Scan,
        keywords: ['ocr', 'image to text', 'scan', 'handwriting'],
        perform: () => navigate('/ocr-scanner'),
      },
      {
        id: 'page-attendance',
        title: 'Attendance Tracker',
        description: 'Track subject-wise attendance',
        category: 'Pages',
        icon: CalendarCheck,
        keywords: ['attendance', 'bunk', 'percentage', 'classes'],
        perform: () => navigate('/attendance'),
      },
      {
        id: 'page-assignments',
        title: 'Assignments & Deadlines',
        description: 'Tasks, homework, and project deadlines',
        category: 'Pages',
        icon: ClipboardList,
        keywords: ['assignments', 'homework', 'projects', 'due date'],
        perform: () => navigate('/assignments'),
      },
      {
        id: 'page-question-papers',
        title: 'Question Papers Repository',
        description: 'Previous year exam papers and models',
        category: 'Pages',
        icon: FileCode,
        keywords: ['exams', 'pyq', 'past papers', 'questions'],
        perform: () => navigate('/question-papers'),
      },
      {
        id: 'page-analytics',
        title: 'Student Analytics',
        description: 'Performance metrics and insights',
        category: 'Pages',
        icon: BarChart2,
        keywords: ['gpa', 'marks', 'analytics', 'performance'],
        perform: () => navigate('/analytics'),
      },
      {
        id: 'page-profile',
        title: 'User Profile',
        description: 'Edit name, avatar, and personal info',
        category: 'Pages',
        icon: User,
        keywords: ['profile', 'avatar', 'name', 'details'],
        perform: () => navigate('/profile'),
      },
      // AI Tools
      {
        id: 'page-resume',
        title: 'AI Resume Builder',
        description: 'Generate professional resumes with AI',
        category: 'AI Tools',
        icon: FilePlus,
        keywords: ['resume', 'cv', 'career', 'template'],
        perform: () => navigate('/resume-builder'),
      },
      {
        id: 'page-placement',
        title: 'Placement Hub',
        description: 'Job drives, internships, and interview prep',
        category: 'AI Tools',
        icon: Briefcase,
        keywords: ['placement', 'jobs', 'internships', 'interviews'],
        perform: () => navigate('/placement-hub'),
      },
      {
        id: 'page-study-planner',
        title: 'AI Study Planner',
        description: 'Smart personalized study schedule',
        category: 'AI Tools',
        icon: Brain,
        keywords: ['study', 'planner', 'schedule', 'revision'],
        perform: () => navigate('/study-planner'),
      },
      {
        id: 'page-mock-interviews',
        title: 'AI Mock Interviews',
        description: 'Practice with AI-powered interviews',
        category: 'AI Tools',
        icon: NotebookPen,
        keywords: ['interview', 'mock', 'practice', 'verbal'],
        perform: () => navigate('/mock-interviews'),
      },
      // Actions
      {
        id: 'action-new-chat',
        title: 'Start New AI Conversation',
        description: 'Open a fresh chat session',
        category: 'Actions',
        icon: Sparkles,
        keywords: ['new chat', 'clear conversation', 'ask ai'],
        perform: () => navigate('/chat?new=true'),
      },
      {
        id: 'action-upload-doc',
        title: 'Upload Document',
        description: 'Add PDF to your knowledge base',
        category: 'Actions',
        icon: FileText,
        keywords: ['upload', 'pdf', 'add document'],
        perform: () => navigate('/documents?action=upload'),
      },
      {
        id: 'action-toggle-theme',
        title: isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode',
        description: 'Toggle the application theme',
        category: 'Actions',
        icon: isDarkMode ? Sun : Moon,
        keywords: ['theme', 'dark', 'light', 'mode'],
        perform: () => toggleTheme(),
      },
      // Settings
      {
        id: 'page-settings',
        title: 'Settings & Preferences',
        description: 'Account, appearance, and notifications',
        category: 'Settings',
        icon: Settings,
        keywords: ['settings', 'config', 'account', 'security'],
        perform: () => navigate('/settings'),
      },
      {
        id: 'action-logout',
        title: 'Log out',
        description: 'Sign out of CollegeMate AI',
        category: 'Settings',
        icon: LogOut,
        keywords: ['logout', 'sign out', 'exit'],
        perform: () => logout(),
      },
    ];
    return items;
  }, [user, isDarkMode, navigate, toggleTheme, logout]);

  // ── Filter / group ────────────────────────────────────────────────────────────
  const filteredItems = useMemo(() => {
    if (!query.trim()) {
      const recents = recentItemIds
        .map((id) => allCommands.find((c) => c.id === id))
        .filter((c): c is CommandItem => Boolean(c))
        .map((c) => ({ ...c, category: 'Recent' as const }));
      const others = allCommands.filter((c) => !recentItemIds.includes(c.id));
      return [...recents, ...others];
    }
    const q = query.toLowerCase().trim();
    return allCommands.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q) ||
        item.keywords?.some((k) => k.toLowerCase().includes(q))
    );
  }, [allCommands, query, recentItemIds]);

  // ── Grouped by category ───────────────────────────────────────────────────────
  const grouped = useMemo(() => {
    const order: CommandItem['category'][] = ['Recent', 'Pages', 'AI Tools', 'Actions', 'Settings'];
    const map = new Map<string, CommandItem[]>();
    order.forEach((cat) => map.set(cat, []));
    filteredItems.forEach((item) => {
      const bucket = map.get(item.category) ?? [];
      bucket.push(item);
      map.set(item.category, bucket);
    });
    return order
      .map((cat) => ({ category: cat, items: map.get(cat) ?? [] }))
      .filter((g) => g.items.length > 0);
  }, [filteredItems]);

  // ── Flat list for keyboard nav ────────────────────────────────────────────────
  const flatItems = useMemo(() => grouped.flatMap((g) => g.items), [grouped]);

  // ── Category label icons ──────────────────────────────────────────────────────
  const categoryIcon: Record<string, React.ElementType> = {
    Recent: Clock,
    Pages: LayoutDashboard,
    'AI Tools': Sparkles,
    Actions: Command,
    Settings: Settings,
  };

  // ── Effects ───────────────────────────────────────────────────────────────────
  useEffect(() => { setSelectedIndex(0); }, [query, isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 60);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Auto-scroll selected item into view
  useEffect(() => {
    const el = itemRefs.current[selectedIndex];
    el?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  // ── Handlers ──────────────────────────────────────────────────────────────────
  const executeCommand = (item: CommandItem) => {
    setRecentItemIds((prev) => {
      const updated = [item.id, ...prev.filter((id) => id !== item.id)].slice(0, 5);
      try { localStorage.setItem('collegemate_recent_commands', JSON.stringify(updated)); } catch {}
      return updated;
    });
    closePalette();
    item.perform();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < flatItems.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : flatItems.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (flatItems[selectedIndex]) executeCommand(flatItems[selectedIndex]);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      closePalette();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:px-4">
          {/* ── Backdrop ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-[2px]"
            onClick={closePalette}
          />

          {/* ── Palette container ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
            className="relative w-full sm:max-w-[640px] lg:max-w-[720px] flex flex-col z-10 overflow-hidden
                       bg-[#FFFFFF] dark:bg-[#111111]
                       border border-[#D1D5DB] dark:border-[#3F3F46]
                       shadow-[0_24px_80px_-8px_rgba(0,0,0,0.18)] dark:shadow-[0_24px_80px_-8px_rgba(0,0,0,0.6)]
                       rounded-t-[20px] sm:rounded-[16px]
                       max-h-[82dvh] sm:max-h-[580px]"
            onKeyDown={handleKeyDown}
          >
            {/* ── Mobile drag handle ── */}
            <div
              className="sm:hidden mx-auto mt-3 mb-1 h-1 w-10 rounded-full bg-[#D1D5DB] dark:bg-[#3F3F46] shrink-0 cursor-pointer"
              onClick={closePalette}
            />

            {/* ══════════════════════════════════════
                SEARCH BAR  — 56px, monochrome
            ══════════════════════════════════════ */}
            <div className="relative flex items-center gap-3 px-4 border-b border-[#E5E7EB] dark:border-[#2A2A2A] shrink-0 h-[56px]">
              <Search size={18} className="text-[#6B7280] dark:text-[#A3A3A3] shrink-0" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search pages, AI tools, settings..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 bg-transparent text-[15px] font-medium text-[#111827] dark:text-[#FAFAFA]
                           placeholder-[#9CA3AF] dark:placeholder-[#52525B]
                           outline-none border-none focus:ring-0 min-w-0"
              />
              <div className="flex items-center gap-2 shrink-0">
                {query && (
                  <button
                    onClick={() => setQuery('')}
                    className="flex h-6 w-6 items-center justify-center rounded-[6px] text-[#6B7280] dark:text-[#A3A3A3] hover:bg-[#F9FAFB] dark:hover:bg-[#232323] transition cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                )}
                <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-1 text-[11px] font-medium
                                 text-[#6B7280] dark:text-[#A3A3A3]
                                 bg-[#F8FAFC] dark:bg-[#181818]
                                 border border-[#D1D5DB] dark:border-[#3F3F46]
                                 rounded-[6px]">
                  Ctrl K
                </kbd>
              </div>
            </div>

            {/* ══════════════════════════════════════
                RESULTS LIST
            ══════════════════════════════════════ */}
            <div
              ref={listRef}
              className="flex-1 overflow-y-auto py-2
                         [&::-webkit-scrollbar]:w-[6px]
                         [&::-webkit-scrollbar-track]:bg-transparent
                         [&::-webkit-scrollbar-thumb]:rounded-full
                         [&::-webkit-scrollbar-thumb]:bg-[#D1D5DB]
                         dark:[&::-webkit-scrollbar-thumb]:bg-[#52525B]"
            >
              {flatItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                  <Search size={28} className="text-[#D1D5DB] dark:text-[#3F3F46]" />
                  <div>
                    <p className="text-[15px] font-semibold text-[#111827] dark:text-[#FAFAFA]">No results found</p>
                    <p className="text-[13px] text-[#9CA3AF] dark:text-[#52525B] mt-0.5">
                      Try searching for &ldquo;<span className="font-medium">{query}</span>&rdquo; differently
                    </p>
                  </div>
                </div>
              ) : (
                grouped.map((group) => {
                  const CatIcon = categoryIcon[group.category];
                  return (
                    <div key={group.category}>
                      {/* Section label */}
                      <CategoryLabel label={group.category} icon={CatIcon} />

                      {/* Items */}
                      {group.items.map((item) => {
                        const flatIdx = flatItems.indexOf(item);
                        const isSelected = flatIdx === selectedIndex;
                        const IconComp = item.icon as React.ElementType;

                        return (
                          <button
                            key={item.id}
                            ref={(el) => { itemRefs.current[flatIdx] = el; }}
                            type="button"
                            onClick={() => executeCommand(item)}
                            onMouseEnter={() => setSelectedIndex(flatIdx)}
                            className={`w-full flex items-center justify-between gap-3 px-4 py-0 h-[52px] mx-0 transition-colors duration-100 cursor-pointer select-none ${
                              isSelected
                                ? 'bg-[#111827] dark:bg-[#FFFFFF]'
                                : 'hover:bg-[#F9FAFB] dark:hover:bg-[#1A1A1A]'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <CmdIcon icon={IconComp} selected={isSelected} />
                              <div className="flex flex-col items-start min-w-0">
                                <span className={`text-[15px] font-semibold leading-tight truncate max-w-[360px] ${
                                  isSelected
                                    ? 'text-[#FFFFFF] dark:text-[#111111]'
                                    : 'text-[#111827] dark:text-[#FAFAFA]'
                                }`}>
                                  {item.title}
                                </span>
                                {item.description && (
                                  <span className={`text-[12px] leading-tight truncate max-w-[360px] ${
                                    isSelected
                                      ? 'text-[#D4D4D4] dark:text-[#555555]'
                                      : 'text-[#9CA3AF] dark:text-[#52525B]'
                                  }`}>
                                    {item.description}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Enter hint on hover */}
                            {isSelected && (
                              <motion.span
                                initial={{ opacity: 0, x: 4 }}
                                animate={{ opacity: 1, x: 0 }}
                                className={`flex items-center gap-1 text-[12px] font-medium shrink-0 ${
                                  isSelected
                                    ? 'text-[#D4D4D4] dark:text-[#555555]'
                                    : 'text-[#9CA3AF] dark:text-[#52525B]'
                                }`}
                              >
                                Open
                                <kbd className={`inline-flex items-center justify-center w-5 h-5 rounded-[4px] border text-[10px] ${
                                  isSelected
                                    ? 'bg-white/10 border-white/20 dark:bg-black/10 dark:border-black/20 text-[#FFFFFF] dark:text-[#111111]'
                                    : 'bg-[#F8FAFC] dark:bg-[#181818] border-[#E5E7EB] dark:border-[#2A2A2A] text-[#6B7280] dark:text-[#A3A3A3]'
                                }`}>
                                  <CornerDownLeft size={10} />
                                </kbd>
                              </motion.span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  );
                })
              )}
            </div>

            {/* ══════════════════════════════════════
                FOOTER — keyboard legend
            ══════════════════════════════════════ */}
            <div className="hidden sm:flex items-center justify-between px-4 py-2.5
                            border-t border-[#E5E7EB] dark:border-[#2A2A2A]
                            bg-[#F8FAFC] dark:bg-[#0A0A0A]
                            shrink-0">
              <div className="flex items-center gap-4 text-[12px] text-[#6B7280] dark:text-[#52525B]">
                <span className="flex items-center gap-1.5">
                  <kbd className="inline-flex items-center justify-center w-6 h-5 rounded-[5px]
                                   bg-[#FFFFFF] dark:bg-[#181818]
                                   border border-[#D1D5DB] dark:border-[#3F3F46]
                                   text-[10px] text-[#111827] dark:text-[#FAFAFA]">
                    <ArrowUp size={10} />
                  </kbd>
                  <kbd className="inline-flex items-center justify-center w-6 h-5 rounded-[5px]
                                   bg-[#FFFFFF] dark:bg-[#181818]
                                   border border-[#D1D5DB] dark:border-[#3F3F46]
                                   text-[10px] text-[#111827] dark:text-[#FAFAFA]">
                    <ArrowDown size={10} />
                  </kbd>
                  Navigate
                </span>
                <span className="flex items-center gap-1.5">
                  <kbd className="inline-flex items-center justify-center w-6 h-5 rounded-[5px]
                                   bg-[#FFFFFF] dark:bg-[#181818]
                                   border border-[#D1D5DB] dark:border-[#3F3F46]
                                   text-[10px] text-[#111827] dark:text-[#FAFAFA]">
                    ↵
                  </kbd>
                  Open
                </span>
                <span className="flex items-center gap-1.5">
                  <kbd className="inline-flex items-center px-1.5 h-5 rounded-[5px]
                                   bg-[#FFFFFF] dark:bg-[#181818]
                                   border border-[#D1D5DB] dark:border-[#3F3F46]
                                   text-[10px] text-[#111827] dark:text-[#FAFAFA]">
                    Esc
                  </kbd>
                  Close
                </span>
              </div>

              <span className="text-[12px] font-bold text-[#111827] dark:text-[#FAFAFA] tracking-tight">
                CollegeMate AI
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
