import { Library, Search, BookOpen, Clock, AlertCircle } from 'lucide-react';
import { useState } from 'react';

const mockIssuedBooks = [
  { id: 1, title: 'Introduction to Algorithms', author: 'Thomas H. Cormen', issuedOn: 'Oct 01, 2026', dueDate: 'Oct 15, 2026', fine: 0, status: 'due-soon' },
  { id: 2, title: 'Operating System Concepts', author: 'Silberschatz', issuedOn: 'Sep 15, 2026', dueDate: 'Sep 30, 2026', fine: 15, status: 'overdue' },
];

export default function LibraryPage() {
  const [search, setSearch] = useState('');

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8 bg-slate-50 dark:bg-slate-900">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Library className="text-[#0A2A6A]" />
              Digital Library
            </h1>
            <p className="text-sm text-slate-500 mt-1">Manage your issued books and search the catalog.</p>
          </div>
          
          <div className="relative">
            <input
              type="text"
              placeholder="Search book catalog..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full sm:w-72 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-[#163D8C] transition-colors shadow-sm"
            />
            <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
          </div>
        </div>

        <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Currently Issued Books</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mockIssuedBooks.map(book => (
            <div key={book.id} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-5 flex gap-5 relative overflow-hidden">
              {book.status === 'overdue' && (
                <div className="absolute top-0 right-0 w-16 h-16 bg-rose-500/10 rounded-bl-full flex items-start justify-end p-2">
                  <AlertCircle size={16} className="text-rose-500" />
                </div>
              )}
              <div className="w-16 h-20 bg-[#0A2A6A] rounded-lg shadow-inner flex flex-col items-center justify-center shrink-0">
                <div className="w-10 h-1 bg-white/20 rounded-full mb-2"></div>
                <BookOpen size={20} className="text-white/50" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-800 dark:text-white leading-tight mb-1">{book.title}</h3>
                <p className="text-xs text-slate-500 font-medium mb-3">{book.author}</p>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Issued On:</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">{book.issuedOn}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Due Date:</span>
                    <span className={`font-medium ${book.status === 'overdue' ? 'text-rose-500' : 'text-slate-700 dark:text-slate-300'}`}>
                      {book.dueDate}
                    </span>
                  </div>
                  {book.fine > 0 && (
                    <div className="flex justify-between text-xs mt-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                      <span className="text-rose-500 font-bold flex items-center gap-1"><AlertCircle size={12}/> Fine Pending:</span>
                      <span className="font-bold text-rose-500">₹{book.fine}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
