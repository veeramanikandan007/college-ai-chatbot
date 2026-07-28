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

  const filtered = mockNotes.filter(n => n.title.toLowerCase().includes(search.toLowerCase()) || n.subject.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8 bg-slate-50 dark:bg-slate-900">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Book className="text-[#0A2A6A]" />
              My Notes
            </h1>
            <p className="text-sm text-slate-500 mt-1">Access your personal class notes.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search notes..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full sm:w-64 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-2 pl-9 pr-3 text-sm outline-none focus:border-[#163D8C] transition-colors"
              />
              <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
            </div>
            <button className="flex items-center gap-1.5 bg-[#0A2A6A] hover:bg-[#163D8C] text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-sm transition-colors">
              <Plus size={16} />
              <span className="hidden sm:inline">New Note</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(note => (
            <div key={note.id} className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col hover:shadow-md hover:border-[#163D8C]/30 transition-all cursor-pointer group">
              <div className="flex items-start justify-between mb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#163D8C] bg-[#163D8C]/10 px-2 py-0.5 rounded-full">
                  {note.subject}
                </span>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-1.5 text-slate-400 hover:text-[#0A2A6A] rounded-lg hover:bg-slate-100"><Edit2 size={14} /></button>
                  <button className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50"><Trash2 size={14} /></button>
                </div>
              </div>
              <h3 className="font-bold text-slate-800 dark:text-white mb-2">{note.title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3 mb-4 flex-1">
                {note.snippet}
              </p>
              <div className="text-xs font-medium text-slate-400 mt-auto pt-4 border-t border-slate-100 dark:border-slate-700">
                Last updated {note.date}
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="col-span-full py-20 flex flex-col items-center justify-center text-center bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
              <Book size={48} className="text-slate-200 dark:text-slate-700 mb-4" />
              <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No notes found</h3>
              <p className="text-sm text-slate-500 mt-1">Try a different search term or create a new note.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
