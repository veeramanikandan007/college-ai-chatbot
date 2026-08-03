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
    <div className="w-full h-full overflow-y-auto bg-[#FFFFFF] dark:bg-[#0A0A0A] text-[#111827] dark:text-[#FAFAFA] p-4 md:p-8 transition-colors">
      <div className="w-full max-w-[1600px] mx-auto space-y-8">

        {/* ========================================================================= */}
        {/* 1. PAGE HEADER CARD                                                       */}
        {/* ========================================================================= */}
        <div className="bg-[#FFFFFF] dark:bg-[#181818] p-6 md:p-8 rounded-[12px] border border-[#D1D5DB] dark:border-[#3F3F46] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-[10px] bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] flex items-center justify-center shrink-0">
              <Book size={24} />
            </div>
            <div>
              <h1 className="text-[32px] font-bold text-[#111827] dark:text-[#FAFAFA] tracking-tight flex items-center gap-3">
                Knowledge Base & Notes
                <span className="text-[12px] font-medium px-2.5 py-0.5 rounded-[6px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA]">
                  Academic Repository
                </span>
              </h1>
              <p className="text-[14px] text-[#6B7280] dark:text-[#A3A3A3] mt-1">
                Access, organize, and manage your personal class notes, study summaries, and course references.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="h-10 px-5 rounded-[10px] bg-[#111827] hover:bg-[#000000] dark:bg-[#FAFAFA] dark:hover:bg-[#E5E5E5] text-[#FFFFFF] dark:text-[#111111] font-medium text-[14px] shadow-xs transition flex items-center gap-2 cursor-pointer shrink-0"
          >
            <Plus size={16} />
            <span>Create New Note</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* 2. OVERVIEW METRIC CARDS                                                  */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-6 rounded-[12px] bg-[#FFFFFF] dark:bg-[#181818] border border-[#D1D5DB] dark:border-[#3F3F46] shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[14px] font-medium text-[#6B7280] dark:text-[#A3A3A3]">Total Notes</p>
              <p className="text-[32px] font-bold text-[#111827] dark:text-[#FAFAFA] mt-1">{notes.length}</p>
            </div>
            <div className="w-10 h-10 rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA] flex items-center justify-center">
              <FileText size={20} />
            </div>
          </div>

          <div className="p-6 rounded-[12px] bg-[#FFFFFF] dark:bg-[#181818] border border-[#D1D5DB] dark:border-[#3F3F46] shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[14px] font-medium text-[#6B7280] dark:text-[#A3A3A3]">Subjects</p>
              <p className="text-[32px] font-bold text-[#111827] dark:text-[#FAFAFA] mt-1">{subjectsList.length - 1}</p>
            </div>
            <div className="w-10 h-10 rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA] flex items-center justify-center">
              <BookOpen size={20} />
            </div>
          </div>

          <div className="p-6 rounded-[12px] bg-[#FFFFFF] dark:bg-[#181818] border border-[#D1D5DB] dark:border-[#3F3F46] shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[14px] font-medium text-[#6B7280] dark:text-[#A3A3A3]">Pinned Notes</p>
              <p className="text-[32px] font-bold text-[#111827] dark:text-[#FAFAFA] mt-1">{notes.filter(n => n.isPinned).length}</p>
            </div>
            <div className="w-10 h-10 rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA] flex items-center justify-center">
              <Bookmark size={20} />
            </div>
          </div>

          <div className="p-6 rounded-[12px] bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] border border-[#111827] dark:border-[#FAFAFA] shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[14px] font-medium opacity-80">AI Synthesis</p>
              <p className="text-[32px] font-bold mt-1">Active</p>
            </div>
            <div className="w-10 h-10 rounded-[10px] bg-[#FFFFFF] dark:bg-[#111111] text-[#111827] dark:text-[#FAFAFA] flex items-center justify-center">
              <Sparkles size={20} />
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. SEARCH & SUBJECT FILTER TOOLBAR                                        */}
        {/* ========================================================================= */}
        <div className="space-y-4">
          {/* Full Width Search Input */}
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7280] dark:text-[#A3A3A3]" size={18} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search notes by title, topic, content, or subject..."
              className="w-full h-11 pl-10 pr-4 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#181818] text-[14px] text-[#111827] dark:text-[#FAFAFA] outline-none placeholder-[#9CA3AF] dark:placeholder-[#6B7280] shadow-xs"
            />
          </div>

          {/* Subject Pills Row */}
          <div className="bg-[#FFFFFF] dark:bg-[#181818] p-2 rounded-[12px] border border-[#D1D5DB] dark:border-[#3F3F46] shadow-xs overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-1.5 min-w-max">
              {subjectsList.map((subj) => (
                <button
                  key={subj}
                  onClick={() => setSelectedSubject(subj)}
                  className={`h-9 px-4 text-[13px] font-medium rounded-[8px] transition-all cursor-pointer whitespace-nowrap ${
                    selectedSubject === subj
                      ? 'bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111]'
                      : 'text-[#4B5563] dark:text-[#A3A3A3] hover:bg-[#F8FAFC] dark:hover:bg-[#232323]'
                  }`}
                >
                  {subj}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 4. PINNED NOTES SECTION                                                   */}
        {/* ========================================================================= */}
        {pinnedNotes.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-[18px] font-bold text-[#111827] dark:text-[#FAFAFA] flex items-center gap-2">
              <Bookmark size={18} />
              Pinned Notes
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pinnedNotes.map((note) => (
                <div
                  key={note.id}
                  className="p-6 rounded-[12px] bg-[#FFFFFF] dark:bg-[#181818] border border-[#D1D5DB] dark:border-[#3F3F46] shadow-xs flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-0.5 rounded-[6px] text-[12px] font-medium bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111]">
                        {note.subject}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleTogglePin(note.id)}
                          title="Unpin Note"
                          className="h-8 w-8 rounded-[6px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#181818] text-[#111827] dark:text-[#FAFAFA] hover:bg-[#F9FAFB] dark:hover:bg-[#232323] flex items-center justify-center cursor-pointer"
                        >
                          <Bookmark size={15} className="fill-current" />
                        </button>
                        <button
                          onClick={() => handleDeleteNote(note.id)}
                          title="Delete Note"
                          className="h-8 w-8 rounded-[6px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#181818] text-[#111827] dark:text-[#FAFAFA] hover:bg-[#F9FAFB] dark:hover:bg-[#232323] flex items-center justify-center cursor-pointer"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>

                    <h4 className="text-[18px] font-bold text-[#111827] dark:text-[#FAFAFA] leading-snug">
                      {note.title}
                    </h4>

                    <p className="text-[14px] text-[#4B5563] dark:text-[#D4D4D4] leading-relaxed line-clamp-3">
                      {note.snippet}
                    </p>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {note.tags.map((t, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded-[4px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#6B7280] dark:text-[#A3A3A3] text-[12px]">
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#E5E7EB] dark:border-[#2A2A2A] flex items-center justify-between text-[12px] text-[#6B7280] dark:text-[#A3A3A3]">
                    <span className="flex items-center gap-1 font-medium">
                      <Clock size={13} />
                      {note.date}
                    </span>
                    <span className="font-bold text-[#111827] dark:text-[#FAFAFA]">Pinned</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 5. ALL / OTHER NOTES GRID                                                 */}
        {/* ========================================================================= */}
        <div className="space-y-4">
          <h3 className="text-[18px] font-bold text-[#111827] dark:text-[#FAFAFA] flex items-center gap-2">
            <FileText size={18} />
            {pinnedNotes.length > 0 ? 'All Notes' : 'Notes Collection'}
          </h3>

          {filteredNotes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {otherNotes.map((note) => (
                <div
                  key={note.id}
                  className="p-6 rounded-[12px] bg-[#FFFFFF] dark:bg-[#181818] border border-[#D1D5DB] dark:border-[#3F3F46] shadow-xs flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-0.5 rounded-[6px] text-[12px] font-medium bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA]">
                        {note.subject}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleTogglePin(note.id)}
                          title="Pin Note"
                          className="h-8 w-8 rounded-[6px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#181818] text-[#111827] dark:text-[#FAFAFA] hover:bg-[#F9FAFB] dark:hover:bg-[#232323] flex items-center justify-center cursor-pointer"
                        >
                          <Bookmark size={15} />
                        </button>
                        <button
                          onClick={() => handleDeleteNote(note.id)}
                          title="Delete Note"
                          className="h-8 w-8 rounded-[6px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#181818] text-[#111827] dark:text-[#FAFAFA] hover:bg-[#F9FAFB] dark:hover:bg-[#232323] flex items-center justify-center cursor-pointer"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>

                    <h4 className="text-[18px] font-bold text-[#111827] dark:text-[#FAFAFA] leading-snug">
                      {note.title}
                    </h4>

                    <p className="text-[14px] text-[#4B5563] dark:text-[#D4D4D4] leading-relaxed line-clamp-3">
                      {note.snippet}
                    </p>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {note.tags.map((t, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded-[4px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#6B7280] dark:text-[#A3A3A3] text-[12px]">
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#E5E7EB] dark:border-[#2A2A2A] flex items-center justify-between text-[12px] text-[#6B7280] dark:text-[#A3A3A3]">
                    <span className="flex items-center gap-1 font-medium">
                      <Clock size={13} />
                      {note.date}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center bg-[#FFFFFF] dark:bg-[#181818] rounded-[12px] border border-[#D1D5DB] dark:border-[#3F3F46] p-8 shadow-xs space-y-3">
              <Book className="mx-auto text-[#6B7280] dark:text-[#A3A3A3] opacity-40" size={48} />
              <h3 className="text-[18px] font-bold text-[#111827] dark:text-[#FAFAFA]">
                No Notes Found
              </h3>
              <p className="text-[14px] text-[#6B7280] dark:text-[#A3A3A3] max-w-sm mx-auto">
                Try a different search query, switch subject filters, or create a new note.
              </p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="mt-2 h-10 px-5 rounded-[10px] bg-[#111827] hover:bg-[#000000] dark:bg-[#FAFAFA] dark:hover:bg-[#E5E5E5] text-[#FFFFFF] dark:text-[#111111] font-medium text-[14px] shadow-xs cursor-pointer inline-flex items-center gap-2"
              >
                <Plus size={16} />
                <span>Create New Note</span>
              </button>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* 6. CREATE NOTE MODAL                                                      */}
        {/* ========================================================================= */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
            <div className="relative w-full max-w-xl bg-[#FFFFFF] dark:bg-[#181818] rounded-[16px] shadow-lg border border-[#D1D5DB] dark:border-[#3F3F46] my-8 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#F8FAFC] dark:bg-[#111111]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-[10px] bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] flex items-center justify-center shrink-0">
                    <Book size={20} />
                  </div>
                  <h3 className="text-[18px] font-bold text-[#111827] dark:text-[#FAFAFA]">Create New Note</h3>
                </div>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="p-1 rounded text-[#6B7280] dark:text-[#A3A3A3] hover:text-[#111827] dark:hover:text-[#FAFAFA] cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateNote} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                <div>
                  <label className="block text-[12px] font-medium uppercase tracking-wider text-[#6B7280] dark:text-[#A3A3A3] mb-1">
                    Note Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Memory Management & Paging Algorithms"
                    className="w-full h-10 px-3.5 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#181818] text-[#111827] dark:text-[#FAFAFA] text-[14px] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-medium uppercase tracking-wider text-[#6B7280] dark:text-[#A3A3A3] mb-1">
                    Subject / Course *
                  </label>
                  <select
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    className="w-full h-10 px-3.5 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#181818] text-[#111827] dark:text-[#FAFAFA] text-[14px] outline-none cursor-pointer"
                  >
                    {subjectsList.filter((s) => s !== 'All').map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[12px] font-medium uppercase tracking-wider text-[#6B7280] dark:text-[#A3A3A3] mb-1">
                    Note Content / Summary *
                  </label>
                  <textarea
                    rows={5}
                    required
                    value={newSnippet}
                    onChange={(e) => setNewSnippet(e.target.value)}
                    placeholder="Write your study notes, formulas, or key concepts here..."
                    className="w-full p-3.5 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#181818] text-[#111827] dark:text-[#FAFAFA] text-[14px] outline-none leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-medium uppercase tracking-wider text-[#6B7280] dark:text-[#A3A3A3] mb-1">
                    Tags (Comma Separated)
                  </label>
                  <input
                    type="text"
                    value={newTags}
                    onChange={(e) => setNewTags(e.target.value)}
                    placeholder="e.g. Memory, Virtual Memory, Paging"
                    className="w-full h-10 px-3.5 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#181818] text-[#111827] dark:text-[#FAFAFA] text-[14px] outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E5E7EB] dark:border-[#2A2A2A]">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="h-10 px-5 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] text-[#111827] dark:text-[#FAFAFA] text-[14px] font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="h-10 px-6 rounded-[10px] bg-[#111827] hover:bg-[#000000] dark:bg-[#FAFAFA] dark:hover:bg-[#E5E5E5] text-[#FFFFFF] dark:text-[#111111] font-medium text-[14px] shadow-xs cursor-pointer inline-flex items-center gap-2"
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
