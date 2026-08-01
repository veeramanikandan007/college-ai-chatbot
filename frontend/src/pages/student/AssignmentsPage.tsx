import { useState } from 'react';
import { ClipboardList, Clock, CheckCircle2, FileText, ChevronRight } from 'lucide-react';

const mockAssignments = [
  { id: 1, title: 'B-Tree Implementation', subject: 'Data Structures', dueDate: 'Tomorrow, 11:59 PM', status: 'pending', type: 'Lab' },
  { id: 2, title: 'Memory Management Report', subject: 'Operating Systems', dueDate: 'In 3 days', status: 'pending', type: 'Theory' },
  { id: 3, title: 'SQL Joins Practice', subject: 'Database Systems', dueDate: 'Next week', status: 'submitted', type: 'Lab' },
  { id: 4, title: 'Gradient Descent Analysis', subject: 'Machine Learning', dueDate: 'Last week', status: 'graded', score: '18/20', type: 'Assignment' },
];

export default function AssignmentsPage() {
  const [filter, setFilter] = useState<'all' | 'pending' | 'submitted' | 'graded'>('all');

  const filtered = mockAssignments.filter((a) => filter === 'all' || a.status === filter);
  const pendingCount = mockAssignments.filter((a) => a.status === 'pending').length;

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8 bg-[#F5F7FB] dark:bg-[#0F172A] text-[#1F2937] dark:text-[#F8FAFC] transition-colors duration-300 font-body">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-heading font-bold text-page tracking-[0.02em] text-[#0E2A6D] dark:text-[#F8FAFC] flex items-center gap-3">
              <ClipboardList className="text-[#0E2A6D] dark:text-[#60A5FA]" size={32} />
              Assignments
            </h1>
            <p className="text-small text-[#64748B] dark:text-[#94A3B8] mt-1">You have {pendingCount} pending assignments to complete.</p>
          </div>
          
          <div className="flex bg-white dark:bg-[#1E293B] rounded-xl p-1.5 shadow-xs border border-[#E2E8F0] dark:border-[#334155]">
            {['all', 'pending', 'submitted', 'graded'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f as any)}
                className={`px-4 py-2 text-small font-semibold rounded-xl capitalize transition-all duration-180 ${
                  filter === f
                    ? 'bg-[#0E2A6D] text-white shadow-xs'
                    : 'text-[#64748B] dark:text-[#94A3B8] hover:bg-[#F5F7FB] dark:hover:bg-[#0F172A]'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 pt-2">
          {filtered.map((assignment) => (
            <div 
              key={assignment.id} 
              className="group flex flex-col sm:flex-row sm:items-center gap-4 bg-white dark:bg-[#1E293B] p-5 rounded-xl shadow-xs border border-[#E2E8F0] dark:border-[#334155] hover:border-[#1E4DB7] dark:hover:border-[#D9A441] transition-all duration-180 hover:shadow-md cursor-pointer"
            >
              <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-[#F5F7FB] dark:bg-[#0F172A] text-[#0E2A6D] dark:text-[#60A5FA] shrink-0">
                <FileText size={22} />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="font-heading text-caption font-bold uppercase tracking-[0.02em] text-[#D9A441] bg-[#D9A441]/10 px-2 py-0.5 rounded-md">
                    {assignment.type}
                  </span>
                  <span className="text-small font-semibold text-[#64748B] dark:text-[#94A3B8]">{assignment.subject}</span>
                </div>
                <h3 className="font-heading font-bold text-card text-[#1F2937] dark:text-[#F8FAFC] truncate group-hover:text-[#0E2A6D] dark:group-hover:text-[#60A5FA] transition-colors">
                  {assignment.title}
                </h3>
              </div>
              
              <div className="flex items-center justify-between sm:w-64 shrink-0">
                <div className="flex flex-col items-start sm:items-end">
                  {assignment.status === 'pending' && (
                    <div className="flex items-center gap-1.5 text-[#EF4444] text-small font-bold">
                      <Clock size={16} />
                      <span>{assignment.dueDate}</span>
                    </div>
                  )}
                  {assignment.status === 'submitted' && (
                    <div className="flex items-center gap-1.5 text-[#1E4DB7] dark:text-[#60A5FA] text-small font-bold">
                      <CheckCircle2 size={16} />
                      <span>Submitted</span>
                    </div>
                  )}
                  {assignment.status === 'graded' && (
                    <div className="flex items-center gap-1.5 text-[#22C55E] text-small font-bold">
                      <span className="text-small font-semibold text-[#64748B] dark:text-[#94A3B8]">Score:</span>
                      <span>{assignment.score}</span>
                    </div>
                  )}
                </div>
                
                <ChevronRight className="text-[#64748B] group-hover:text-[#0E2A6D] dark:group-hover:text-[#D9A441] transition-colors" />
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="py-20 flex flex-col items-center justify-center text-center bg-white dark:bg-[#1E293B] rounded-xl border border-dashed border-[#E2E8F0] dark:border-[#334155]">
              <CheckCircle2 size={44} className="text-[#64748B] opacity-40 mb-3" />
              <h3 className="font-heading font-bold text-card text-[#1F2937] dark:text-[#F8FAFC]">All Caught Up!</h3>
              <p className="text-small text-[#64748B] dark:text-[#94A3B8] max-w-sm mt-1">No assignments found for this category.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
