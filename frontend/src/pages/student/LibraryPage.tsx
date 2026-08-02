import { Library, Search, BookOpen, AlertCircle } from 'lucide-react';
import { useState } from 'react';

const mockIssuedBooks = [
  { id: 1, title: 'Introduction to Algorithms', author: 'Thomas H. Cormen', issuedOn: 'Oct 01, 2026', dueDate: 'Oct 15, 2026', fine: 0, status: 'due-soon' },
  { id: 2, title: 'Operating System Concepts', author: 'Silberschatz', issuedOn: 'Sep 15, 2026', dueDate: 'Sep 30, 2026', fine: 15, status: 'overdue' },
];

export default function LibraryPage() {
  const [search, setSearch] = useState('');

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8 bg-[#F5F7FB] dark:bg-[#0F172A] text-[#1F2937] dark:text-[#F8FAFC] transition-colors duration-300 font-body">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-heading font-bold text-page tracking-[0.02em] text-[#0E2A6D] dark:text-[#F8FAFC] flex items-center gap-3">
              <Library className="text-[#0E2A6D] dark:text-[#60A5FA]" size={32} />
              Digital Library
            </h1>
            <p className="text-small text-[#64748B] dark:text-[#94A3B8] mt-1">Manage your issued books and search the catalog.</p>
          </div>
          
          <div className="relative flex items-center">
            <input
              type="text"
              placeholder="Search book catalog..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-72 h-11 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#1E293B] py-2.5 pl-10 pr-3 text-body text-[#1F2937] dark:text-[#F8FAFC] outline-none focus:border-[#1E4DB7] transition-colors shadow-xs"
            />
            <Search size={16} className="absolute left-3.5 text-[#64748B] dark:text-[#94A3B8] pointer-events-none" />
          </div>
        </div>

        <div>
          <h2 className="font-heading font-bold text-section text-[#1F2937] dark:text-[#F8FAFC] mb-4">Currently Issued Books</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mockIssuedBooks.map((book) => (
              <div 
                key={book.id} 
                className="bg-white dark:bg-[#1E293B] rounded-xl shadow-xs border border-[#E2E8F0] dark:border-[#334155] p-5 flex gap-5 relative overflow-hidden hover:shadow-md transition-all duration-180"
              >
                {book.status === 'overdue' && (
                  <div className="absolute top-0 right-0 w-12 h-12 bg-[#EF4444]/10 rounded-bl-full flex items-start justify-end p-2.5">
                    <AlertCircle size={14} className="text-[#EF4444]" />
                  </div>
                )}
                
                <div className="w-14 h-20 bg-[#0E2A6D] rounded-xl shadow-inner flex flex-col items-center justify-center shrink-0 border border-[#D9A441]/30">
                  <div className="w-8 h-1 bg-white/20 rounded-full mb-2"></div>
                  <BookOpen size={20} className="text-white/80" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-heading font-bold text-card text-[#1F2937] dark:text-[#F8FAFC] leading-snug mb-1 truncate">{book.title}</h3>
                  <p className="text-small text-[#64748B] dark:text-[#94A3B8] font-semibold mb-3 truncate">{book.author}</p>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-small">
                      <span className="text-[#64748B] dark:text-[#94A3B8]">Issued On:</span>
                      <span className="font-semibold text-[#1F2937] dark:text-[#F8FAFC]">{book.issuedOn}</span>
                    </div>
                    <div className="flex justify-between text-small">
                      <span className="text-[#64748B] dark:text-[#94A3B8]">Due Date:</span>
                      <span className={`font-semibold ${book.status === 'overdue' ? 'text-[#EF4444]' : 'text-[#1F2937] dark:text-[#F8FAFC]'}`}>
                        {book.dueDate}
                      </span>
                    </div>
                    {book.fine > 0 && (
                      <div className="flex justify-between text-small mt-2 pt-2 border-t border-[#E2E8F0] dark:border-[#334155]">
                        <span className="text-[#EF4444] font-bold flex items-center gap-1">
                          <AlertCircle size={14} /> Fine Pending:
                        </span>
                        <span className="font-bold text-[#EF4444]">₹{book.fine}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
