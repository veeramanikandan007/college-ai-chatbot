import React, { useState } from 'react';
import {
  Book,
  Plus,
  Edit2,
  Trash2,
  Search,
  BookOpen,
  FolderPlus,
  Share2,
  Sparkles,
  Tag,
  Clock,
  Layers,
  FileText,
  Bookmark,
  CheckCircle2,
  X
} from 'lucide-react';

interface NoteItem {
  id: number;
  title: string;
  subject: string;
  date: string;
  snippet: string;
  tags: string[];
  isPinned?: boolean;
}

const initialNotes: NoteItem[] = [
  {
    id: 1,
    title: 'OS Deadlock Handling & Banker Algorithm',
    subject: 'Operating Systems',
    date: 'Oct 12, 2026',
    snippet: 'Deadlock avoidance uses the Banker algorithm to allocate resource units dynamically. Key conditions include mutual exclusion, hold and wait, no preemption, and circular wait.',
    tags: ['Exam Prep', 'Deadlocks', 'Algorithms'],
    isPinned: true
  },
  {
    id: 2,
    title: 'TCP vs UDP Deep Dive & Socket API',
    subject: 'Computer Networks',
    date: 'Oct 10, 2026',
    snippet: 'TCP is connection-oriented providing reliable, ordered bytes via 3-way handshake. UDP is connectionless providing minimal overhead for streaming and real-time audio/video.',
    tags: ['Protocols', 'Networking'],
    isPinned: true
  },
  {
    id: 3,
    title: 'Neural Networks Basics & Backpropagation',
    subject: 'Machine Learning',
    date: 'Oct 05, 2026',
    snippet: 'Perceptrons compute weighted sums with activation functions (ReLU, Sigmoid). Backpropagation computes gradients of loss function w.r.t weights using chain rule.',
    tags: ['AI/ML', 'Neural Nets'],
    isPinned: false
  },
  {
    id: 4,
    title: 'Red-Black Trees & Balancing Rotations',
    subject: 'Data Structures',
    date: 'Oct 01, 2026',
    snippet: 'Self-balancing BST guarantees O(log n) time for operations. Node properties ensure root and leaves are black, and no two consecutive red nodes exist.',
    tags: ['Trees', 'Algorithms'],
    isPinned: false
  },
  {
    id: 5,
    title: 'SQL Normalization (1NF to BCNF)',
    subject: 'Database Management Systems',
    date: 'Sep 28, 2026',
    snippet: 'Database normalization reduces redundancy and prevents insertion, update, and deletion anomalies. BCNF ensures every non-trivial functional dependency X -> Y has X as a super key.',
    tags: ['DBMS', 'SQL'],
    isPinned: false
  },
  {
    id: 6,
    title: 'Regular Expressions & Finite Automata',
    subject: 'Theory of Computation',
    date: 'Sep 25, 2026',
    snippet: 'DFA and NFA represent finite state acceptors for regular languages. Kleenes Theorem proves equivalence between regular expressions and finite automata.',
    tags: ['TOC', 'Automata'],
    isPinned: false
  }
];

export default function NotesPage() {
  const [notes, setNotes] = useState<NoteItem[]>(initialNotes);
  const [search, setSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New Note Form State
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState('Operating Systems');
  const [newSnippet, setNewSnippet] = useState('');
  const [newTags, setNewTags] = useState('');

  const subjectsList = ['All', 'Operating Systems', 'Computer Networks', 'Machine Learning', 'Data Structures', 'Database Management Systems', 'Theory of Computation'];

  const filteredNotes = notes.filter((n) => {
    const matchesSearch =
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.snippet.toLowerCase().includes(search.toLowerCase()) ||
      n.subject.toLowerCase().includes(search.toLowerCase());

    const matchesSubject = selectedSubject === 'All' || n.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  const pinnedNotes = filteredNotes.filter((n) => n.isPinned);
  const otherNotes = filteredNotes.filter((n) => !n.isPinned);

  const handleTogglePin = (id: number) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isPinned: !n.isPinned } : n))
    );
  };

  const handleDeleteNote = (id: number) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      setNotes((prev) => prev.filter((n) => n.id !== id));
    }
  };

  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newSnippet.trim()) return;

    const created: NoteItem = {
      id: Date.now(),
      title: newTitle,
      subject: newSubject,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      snippet: newSnippet,
      tags: newTags ? newTags.split(',').map((t) => t.trim()) : ['Notes'],
      isPinned: false
    };

    setNotes([created, ...notes]);
    setNewTitle('');
    setNewSnippet('');
    setNewTags('');
    setIsCreateModalOpen(false);
  };

  return (
    <div className="w-full h-full overflow-x-hidden overflow-y-auto bg-[#F8FAFC] dark:bg-[#0A0A0A] text-[#111827] dark:text-[#FAFAFA] p-4 sm:p-6 lg:p-8 transition-colors select-none font-sans">
      {/* 1440px Centered Max Content Width Container */}
      <div className="w-full max-w-[1440px] mx-auto space-y-8">

        {/* Page Hero Header */}
        <div className="bg-[#FFFFFF] dark:bg-[#18181B] p-6 rounded-[16px] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-12 h-12 rounded-[12px] bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] flex items-center justify-center shrink-0">
              <Book size={24} />
            </div>
            <div className="min-w-0 space-y-1">
              <h1 className="text-[30px] font-semibold text-[#111827] dark:text-[#FAFAFA] tracking-tight leading-tight truncate">
                Knowledge Base & Notes
              </h1>
              <p className="text-[15px] font-normal text-[#6B7280] dark:text-[#A1A1AA] truncate">
                Organize, synthesize, and manage personal course notes and AI study summaries.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 w-full sm:w-auto">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="h-[40px] px-5 rounded-[10px] bg-[#111827] hover:bg-[#1F2937] dark:bg-[#FAFAFA] dark:hover:bg-[#E5E5E5] text-[#FFFFFF] dark:text-[#111111] font-medium text-[14px] transition flex items-center justify-center gap-2 cursor-pointer shrink-0 w-full sm:w-auto"
            >
              <Plus size={18} />
              <span>Create New Note</span>
            </button>
          </div>
        </div>

        {/* 4 Statistics Cards Grid (2x2 Mobile, 4-Col Desktop, Responsive Padding & Font Sizes) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 select-none">
          <div className="p-3.5 sm:p-5 lg:p-6 rounded-[16px] bg-[#FFFFFF] dark:bg-[#18181B] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs flex items-center justify-between min-w-0">
            <div className="min-w-0 flex-1 space-y-0.5 sm:space-y-1">
              <p className="text-[12px] sm:text-[14px] font-normal text-[#6B7280] dark:text-[#A1A1AA] truncate">Total Notes</p>
              <p className="text-[15px] sm:text-[22px] lg:text-[28px] font-semibold text-[#111827] dark:text-[#FAFAFA] leading-tight truncate">{notes.length}</p>
              <p className="text-[11px] sm:text-[12px] font-normal text-[#6B7280] dark:text-[#A1A1AA] truncate">Academic repository</p>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-[8px] sm:rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA] flex items-center justify-center shrink-0 ml-1.5 sm:ml-3">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>

          <div className="p-3.5 sm:p-5 lg:p-6 rounded-[16px] bg-[#FFFFFF] dark:bg-[#18181B] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs flex items-center justify-between min-w-0">
            <div className="min-w-0 flex-1 space-y-0.5 sm:space-y-1">
              <p className="text-[12px] sm:text-[14px] font-normal text-[#6B7280] dark:text-[#A1A1AA] truncate">Course Subjects</p>
              <p className="text-[15px] sm:text-[22px] lg:text-[28px] font-semibold text-[#111827] dark:text-[#FAFAFA] leading-tight truncate">{subjectsList.length - 1}</p>
              <p className="text-[11px] sm:text-[12px] font-normal text-[#6B7280] dark:text-[#A1A1AA] truncate">Active modules</p>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-[8px] sm:rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA] flex items-center justify-center shrink-0 ml-1.5 sm:ml-3">
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>

          <div className="p-3.5 sm:p-5 lg:p-6 rounded-[16px] bg-[#FFFFFF] dark:bg-[#18181B] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs flex items-center justify-between min-w-0">
            <div className="min-w-0 flex-1 space-y-0.5 sm:space-y-1">
              <p className="text-[12px] sm:text-[14px] font-normal text-[#6B7280] dark:text-[#A1A1AA] truncate">Pinned Notes</p>
              <p className="text-[15px] sm:text-[22px] lg:text-[28px] font-semibold text-[#111827] dark:text-[#FAFAFA] leading-tight truncate">{pinnedNotes.length}</p>
              <p className="text-[11px] sm:text-[12px] font-normal text-[#6B7280] dark:text-[#A1A1AA] truncate">Quick access</p>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-[8px] sm:rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA] flex items-center justify-center shrink-0 ml-1.5 sm:ml-3">
              <Bookmark className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>

          <div className="p-3.5 sm:p-5 lg:p-6 rounded-[16px] bg-[#FFFFFF] dark:bg-[#18181B] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs flex items-center justify-between min-w-0">
            <div className="min-w-0 flex-1 space-y-0.5 sm:space-y-1">
              <p className="text-[12px] sm:text-[14px] font-normal text-[#6B7280] dark:text-[#A1A1AA] truncate">AI Synthesis</p>
              <p className="text-[15px] sm:text-[22px] lg:text-[28px] font-semibold text-[#111827] dark:text-[#FAFAFA] leading-tight truncate">Active</p>
              <p className="text-[11px] sm:text-[12px] font-normal text-[#6B7280] dark:text-[#A1A1AA] truncate">Auto-summaries</p>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-[8px] sm:rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA] flex items-center justify-center shrink-0 ml-1.5 sm:ml-3">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
        </div>

        {/* Content Section Container */}
        <div className="bg-[#FFFFFF] dark:bg-[#18181B] p-6 rounded-[16px] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs space-y-6 select-none">
          
          {/* Section Header */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 pb-4 border-b border-[#D1D5DB] dark:border-[#3F3F46]">
            <div className="flex items-center gap-3">
              <div className="w-[36px] h-[36px] sm:w-[40px] sm:h-[40px] rounded-[10px] bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] flex items-center justify-center shrink-0">
                <BookOpen size={20} />
              </div>
              <div>
                <h3 className="text-[16px] sm:text-[17px] font-[600] text-[#111827] dark:text-[#FAFAFA]">
                  Academic Notes & Study Summaries
                </h3>
                <p className="text-[14px] sm:text-[15px] font-[400] text-[#6B7280] dark:text-[#A1A1AA]">
                  Manage notes, filter by course modules, and pin key exam preparation references
                </p>
              </div>
            </div>

            {/* Subject Pills Segmented Control */}
            <div className="flex items-center bg-[#F8FAFC] dark:bg-[#111111] p-1 rounded-[12px] border border-[#D1D5DB] dark:border-[#3F3F46] min-h-[44px] max-w-full overflow-x-auto no-scrollbar">
              {subjectsList.map((subj) => (
                <button
                  key={subj}
                  onClick={() => setSelectedSubject(subj)}
                  className={`h-[36px] px-3.5 sm:px-4 rounded-[8px] text-[14px] font-[500] transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    selectedSubject === subj
                      ? 'bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111]'
                      : 'text-[#6B7280] dark:text-[#A1A1AA] hover:bg-[#FFFFFF] dark:hover:bg-[#18181B]'
                  }`}
                >
                  {subj}
                </button>
              ))}
            </div>
          </div>

          {/* Search Input Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7280] dark:text-[#A1A1AA]" size={18} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search notes by title, topic, content..."
                className="w-full h-[40px] pl-10 pr-4 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#18181B] text-[14px] font-[600] text-[#111827] dark:text-[#FAFAFA] outline-none"
              />
            </div>
          </div>

          {/* Pinned Notes Grid */}
          {pinnedNotes.length > 0 && (
            <div className="space-y-3 pt-2">
              <h4 className="text-[16px] font-[700] text-[#111827] dark:text-[#FAFAFA] flex items-center gap-2">
                <Bookmark size={16} />
                <span>Pinned Notes ({pinnedNotes.length})</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pinnedNotes.map((note) => (
                  <div
                    key={note.id}
                    className="p-[18px] sm:p-5 rounded-[16px] bg-[#FFFFFF] dark:bg-[#18181B] border border-[#D1D5DB] dark:border-[#3F3F46] shadow-xs hover:shadow-md transition-all duration-150 ease-in-out hover:-translate-y-[2px] flex flex-col justify-between space-y-4 h-full"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="h-[24px] inline-flex items-center rounded-full border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#111827] dark:bg-[#FAFAFA] px-3 text-[12px] font-[400] text-[#FFFFFF] dark:text-[#111111]">
                          {note.subject}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleTogglePin(note.id)}
                            title="Unpin Note"
                            className="h-[34px] w-[34px] rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#18181B] text-[#111827] dark:text-[#FAFAFA] hover:bg-[#F8FAFC] dark:hover:bg-[#232323] transition flex items-center justify-center cursor-pointer shrink-0 active:scale-[0.98]"
                          >
                            <Bookmark size={15} className="fill-current" />
                          </button>
                          <button
                            onClick={() => handleDeleteNote(note.id)}
                            title="Delete Note"
                            className="h-[34px] w-[34px] rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#18181B] text-[#111827] dark:text-[#FAFAFA] hover:bg-[#F8FAFC] dark:hover:bg-[#232323] transition flex items-center justify-center cursor-pointer shrink-0 active:scale-[0.98]"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>

                      <h4 className="text-[18px] font-[700] text-[#111827] dark:text-[#FAFAFA] leading-snug">
                        {note.title}
                      </h4>

                      <p className="text-[14px] font-[500] text-[#6B7280] dark:text-[#A1A1AA] line-clamp-3 leading-relaxed">
                        {note.snippet}
                      </p>

                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {note.tags.map((t, idx) => (
                          <span key={idx} className="h-[22px] inline-flex items-center rounded-full border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#F8FAFC] dark:bg-[#111111] px-2.5 text-[11px] font-[600] text-[#6B7280] dark:text-[#A1A1AA]">
                            #{t}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#D1D5DB] dark:border-[#3F3F46] flex items-center justify-between text-[14px] font-[500] text-[#6B7280] dark:text-[#A1A1AA]">
                      <span className="flex items-center gap-1.5">
                        <Clock size={14} className="text-[#111827] dark:text-[#FAFAFA]" />
                        {note.date}
                      </span>
                      <span className="text-[#111827] dark:text-[#FAFAFA]">Pinned</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All / Other Notes Grid */}
          <div className="space-y-3 pt-2">
            <h4 className="text-[16px] font-[700] text-[#111827] dark:text-[#FAFAFA] flex items-center gap-2">
              <FileText size={16} />
              <span>{pinnedNotes.length > 0 ? 'Other Notes' : 'All Notes'} ({otherNotes.length})</span>
            </h4>

            {filteredNotes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {otherNotes.map((note) => (
                  <div
                    key={note.id}
                    className="p-[18px] sm:p-5 rounded-[16px] bg-[#FFFFFF] dark:bg-[#18181B] border border-[#D1D5DB] dark:border-[#3F3F46] shadow-xs hover:shadow-md transition-all duration-150 ease-in-out hover:-translate-y-[2px] flex flex-col justify-between space-y-4 h-full"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="h-[24px] inline-flex items-center rounded-full border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#F8FAFC] dark:bg-[#111111] px-3 text-[12px] font-[600] text-[#6B7280] dark:text-[#A1A1AA]">
                          {note.subject}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleTogglePin(note.id)}
                            title="Pin Note"
                            className="h-[34px] w-[34px] rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#18181B] text-[#111827] dark:text-[#FAFAFA] hover:bg-[#F8FAFC] dark:hover:bg-[#232323] transition flex items-center justify-center cursor-pointer shrink-0 active:scale-[0.98]"
                          >
                            <Bookmark size={15} />
                          </button>
                          <button
                            onClick={() => handleDeleteNote(note.id)}
                            title="Delete Note"
                            className="h-[34px] w-[34px] rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#18181B] text-[#111827] dark:text-[#FAFAFA] hover:bg-[#F8FAFC] dark:hover:bg-[#232323] transition flex items-center justify-center cursor-pointer shrink-0 active:scale-[0.98]"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>

                      <h4 className="text-[18px] font-[700] text-[#111827] dark:text-[#FAFAFA] leading-snug">
                        {note.title}
                      </h4>

                      <p className="text-[14px] font-[500] text-[#6B7280] dark:text-[#A1A1AA] line-clamp-3 leading-relaxed">
                        {note.snippet}
                      </p>

                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {note.tags.map((t, idx) => (
                          <span key={idx} className="h-[22px] inline-flex items-center rounded-full border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#F8FAFC] dark:bg-[#111111] px-2.5 text-[11px] font-[600] text-[#6B7280] dark:text-[#A1A1AA]">
                            #{t}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#D1D5DB] dark:border-[#3F3F46] flex items-center justify-between text-[14px] font-[500] text-[#6B7280] dark:text-[#A1A1AA]">
                      <span className="flex items-center gap-1.5">
                        <Clock size={14} className="text-[#111827] dark:text-[#FAFAFA]" />
                        {note.date}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center bg-[#FFFFFF] dark:bg-[#18181B] rounded-[16px] border border-[#D1D5DB] dark:border-[#3F3F46] p-8 shadow-xs space-y-4 my-auto">
                <div className="w-[80px] h-[80px] rounded-[16px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#D1D5DB] dark:border-[#3F3F46] flex items-center justify-center mx-auto text-[#111827] dark:text-[#FAFAFA]">
                  <Book size={36} />
                </div>
                <div>
                  <h3 className="text-[20px] font-[700] text-[#111827] dark:text-[#FAFAFA]">
                    No Notes Found
                  </h3>
                  <p className="text-[14px] font-[500] text-[#6B7280] dark:text-[#A1A1AA] max-w-sm mx-auto mt-1">
                    Try a different search query or create a new note.
                  </p>
                </div>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="h-[40px] px-5 rounded-[12px] bg-[#111827] hover:bg-[#1F2937] dark:bg-[#FAFAFA] dark:hover:bg-[#F3F4F6] text-[#FFFFFF] dark:text-[#111111] text-[14px] font-[500] transition flex items-center justify-center gap-2 cursor-pointer mx-auto active:scale-[0.98]"
                >
                  <Plus size={16} />
                  <span>Create New Note</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Create Note Modal */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
            <div className="relative w-full max-w-xl bg-[#FFFFFF] dark:bg-[#18181B] rounded-[16px] shadow-lg border border-[#D1D5DB] dark:border-[#3F3F46] my-8 overflow-hidden">
              <div className="flex items-center justify-between p-5 border-b border-[#D1D5DB] dark:border-[#3F3F46] bg-[#F8FAFC] dark:bg-[#111111]">
                <div className="flex items-center gap-3">
                  <div className="w-[40px] h-[40px] rounded-[10px] bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] flex items-center justify-center shrink-0">
                    <Book size={20} />
                  </div>
                  <h3 className="text-[18px] font-[700] text-[#111827] dark:text-[#FAFAFA]">Create New Note</h3>
                </div>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="h-8 w-8 rounded-[8px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#18181B] text-[#111827] dark:text-[#FAFAFA] flex items-center justify-center shrink-0 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateNote} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                <div>
                  <label className="block text-[12px] font-[400] uppercase tracking-wider text-[#6B7280] dark:text-[#A1A1AA] mb-1">
                    Note Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Memory Management & Paging Algorithms"
                    className="w-full h-[40px] px-3.5 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#18181B] text-[#111827] dark:text-[#FAFAFA] text-[14px] font-[600] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-[400] uppercase tracking-wider text-[#6B7280] dark:text-[#A1A1AA] mb-1">
                    Subject / Course *
                  </label>
                  <select
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    className="w-full h-[40px] px-3.5 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#18181B] text-[#111827] dark:text-[#FAFAFA] text-[14px] font-[600] outline-none cursor-pointer"
                  >
                    {subjectsList.filter((s) => s !== 'All').map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[12px] font-[400] uppercase tracking-wider text-[#6B7280] dark:text-[#A1A1AA] mb-1">
                    Note Content / Summary *
                  </label>
                  <textarea
                    rows={5}
                    required
                    value={newSnippet}
                    onChange={(e) => setNewSnippet(e.target.value)}
                    placeholder="Write your study notes, formulas, or key concepts here..."
                    className="w-full p-3.5 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#18181B] text-[#111827] dark:text-[#FAFAFA] text-[14px] font-[500] outline-none leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-[400] uppercase tracking-wider text-[#6B7280] dark:text-[#A1A1AA] mb-1">
                    Tags (Comma Separated)
                  </label>
                  <input
                    type="text"
                    value={newTags}
                    onChange={(e) => setNewTags(e.target.value)}
                    placeholder="e.g. Memory, Virtual Memory, Paging"
                    className="w-full h-[40px] px-3.5 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#18181B] text-[#111827] dark:text-[#FAFAFA] text-[14px] font-[600] outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#D1D5DB] dark:border-[#3F3F46]">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="h-[40px] px-5 rounded-[12px] border border-[#D1D5DB] dark:border-[#3F3F46] text-[#111827] dark:text-[#FAFAFA] text-[14px] font-[500] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="h-[40px] px-6 rounded-[12px] bg-[#111827] hover:bg-[#1F2937] active:bg-[#0F172A] dark:bg-[#FAFAFA] dark:hover:bg-[#F3F4F6] text-[#FFFFFF] dark:text-[#111111] font-[700] text-[14px] shadow-xs cursor-pointer inline-flex items-center gap-2 active:scale-[0.98]"
                  >
                    <CheckCircle2 size={16} />
                    <span>Save Note</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

