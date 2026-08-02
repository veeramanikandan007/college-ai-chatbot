import { useState } from 'react';
import { Book, Plus, Search, Edit2, Trash2 } from 'lucide-react';

const mockNotes = [
  { id: 1, title: 'OS Deadlock Handling', subject: 'Operating Systems', date: 'Oct 12, 2026', snippet: 'Deadlock avoidance uses Banker algorithm...' },
  { id: 2, title: 'TCP vs UDP', subject: 'Computer Networks', date: 'Oct 10, 2026', snippet: 'TCP is connection-oriented, UDP is connectionless...' },
  { id: 3, title: 'Neural Networks Basics', subject: 'Machine Learning', date: 'Oct 05, 2026', snippet: 'Perceptron, activation functions, backprop...' },
  { id: 4, title: 'Red-Black Trees', subject: 'Data Structures', date: 'Oct 01, 2026', snippet: 'Self-balancing BST, properties and rotations...' },
];

export default function NotesPage() {
  const [search, setSearch] = useState('');

  const filtered = mockNotes.filter(
    (n) => n.title.toLowerCase().includes(search.toLowerCase()) || n.subject.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8 bg-[#F5F7FB] dark:bg-[#0F172A] text-[#1F2937] dark:text-[#F8FAFC] transition-colors duration-300 font-body">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-heading font-bold text-page tracking-[0.02em] text-[#0E2A6D] dark:text-[#F8FAFC] flex items-center gap-3">
              <Book className="text-[#0E2A6D] dark:text-[#60A5FA]" size={32} />
              My Notes
            </h1>
            <p className="text-small text-[#64748B] dark:text-[#94A3B8] mt-1">Access and manage your personal class notes.</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="Search notes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full sm:w-64 h-11 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#1E293B] py-2 pl-9 pr-3 text-body text-[#1F2937] dark:text-[#F8FAFC] outline-none focus:border-[#1E4DB7] transition-colors shadow-xs"
              />
              <Search size={16} className="absolute left-3 text-[#64748B] pointer-events-none" />
            </div>

            <button className="flex h-11 items-center gap-2 bg-[#0E2A6D] hover:bg-[#153B8A] text-white px-4 rounded-xl text-small font-btn shadow-sm transition-colors shrink-0">
              <Plus size={18} strokeWidth={2} />
              <span className="hidden sm:inline">New Note</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((note) => (
            <div
              key={note.id}
              className="bg-white dark:bg-[#1E293B] p-5 rounded-xl shadow-xs border border-[#E2E8F0] dark:border-[#334155] flex flex-col hover:shadow-md hover:border-[#1E4DB7]/30 transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-3">
                <span className="font-heading text-caption font-bold uppercase tracking-[0.02em] text-[#0E2A6D] dark:text-[#D9A441] bg-[#0E2A6D]/10 dark:bg-[#D9A441]/10 px-2 py-0.5 rounded-md">
                  {note.subject}
                </span>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-1.5 text-[#64748B] hover:text-[#0E2A6D] rounded-lg hover:bg-[#F5F7FB] dark:hover:bg-[#0F172A]">
                    <Edit2 size={14} />
                  </button>
                  <button className="p-1.5 text-[#64748B] hover:text-[#EF4444] rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <h3 className="font-heading font-bold text-card text-[#1F2937] dark:text-[#F8FAFC] mb-2">{note.title}</h3>
              <p className="text-small text-[#64748B] dark:text-[#94A3B8] line-clamp-3 mb-4 flex-1">{note.snippet}</p>
              <div className="text-caption font-medium text-[#64748B] dark:text-[#94A3B8] mt-auto pt-4 border-t border-[#E2E8F0] dark:border-[#334155]">
                Last updated {note.date}
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="col-span-full py-20 flex flex-col items-center justify-center text-center bg-white dark:bg-[#1E293B] rounded-xl border border-dashed border-[#E2E8F0] dark:border-[#334155]">
              <Book size={44} className="text-[#64748B] opacity-40 mb-3" />
              <h3 className="font-heading font-bold text-card text-[#1F2937] dark:text-[#F8FAFC]">No notes found</h3>
              <p className="text-small text-[#64748B] dark:text-[#94A3B8] mt-1">Try a different search term or create a new note.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
