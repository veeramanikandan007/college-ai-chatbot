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

  const filtered = mockAssignments.filter(a => filter === 'all' || a.status === filter);

  const pendingCount = mockAssignments.filter(a => a.status === 'pending').length;

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8 bg-slate-50 dark:bg-slate-900">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <ClipboardList className="text-[#0A2A6A]" />
              Assignments
            </h1>
            <p className="text-sm text-slate-500 mt-1">You have {pendingCount} pending assignments to complete.</p>
          </div>
          
          <div className="flex bg-white dark:bg-slate-800 rounded-xl p-1 shadow-sm border border-slate-200 dark:border-slate-700">
            {['all', 'pending', 'submitted', 'graded'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f as any)}
                className={`px-4 py-1.5 text-sm font-medium rounded-lg capitalize transition-colors ${
                  filter === f 
                    ? 'bg-[#0A2A6A] text-white shadow-sm' 
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4">
          {filtered.map(assignment => (
            <div 
              key={assignment.id} 
              className="group flex flex-col sm:flex-row sm:items-center gap-4 bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 transition hover:shadow-md hover:border-[#163D8C]/30 cursor-pointer"
            >
              <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-slate-50 dark:bg-slate-900 text-[#163D8C] shrink-0">
                <FileText size={24} />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#E8B24D] bg-[#E8B24D]/10 px-2 py-0.5 rounded-full">
                    {assignment.type}
                  </span>
                  <span className="text-xs font-semibold text-slate-400">{assignment.subject}</span>
                </div>
                <h3 className="text-base font-bold text-slate-800 dark:text-white truncate group-hover:text-[#0A2A6A] transition-colors">
                  {assignment.title}
                </h3>
              </div>
              
              <div className="flex items-center justify-between sm:w-64 shrink-0">
                <div className="flex flex-col items-start sm:items-end">
                  {assignment.status === 'pending' && (
                    <div className="flex items-center gap-1.5 text-rose-500 text-sm font-medium">
                      <Clock size={16} />
                      <span>{assignment.dueDate}</span>
                    </div>
                  )}
                  {assignment.status === 'submitted' && (
                    <div className="flex items-center gap-1.5 text-blue-500 text-sm font-medium">
                      <CheckCircle2 size={16} />
                      <span>Submitted</span>
                    </div>
                  )}
                  {assignment.status === 'graded' && (
                    <div className="flex items-center gap-1.5 text-emerald-500 text-sm font-medium">
                      <span className="text-xs text-slate-400">Score:</span>
                      <span className="font-bold">{assignment.score}</span>
                    </div>
                  )}
                </div>
                
                <ChevronRight className="text-slate-300 group-hover:text-[#163D8C] transition-colors" />
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="py-20 flex flex-col items-center justify-center text-center bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
              <CheckCircle2 size={48} className="text-slate-200 dark:text-slate-700 mb-4" />
              <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">All Caught Up!</h3>
              <p className="text-sm text-slate-500 max-w-sm mt-1">
                You have no assignments matching this filter.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
