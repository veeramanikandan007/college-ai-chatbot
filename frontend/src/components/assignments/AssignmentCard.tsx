import React, { useState } from 'react';
import {
  BookOpen,
  Clock3,
  CircleCheck,
  CircleAlert,
  Download,
  Trash2,
  SquarePen,
  Sparkles,
  Paperclip,
  User,
  Tag,
  ChevronDown
} from 'lucide-react';
import { Assignment } from '../../api/assignments';

interface AssignmentCardProps {
  assignment: Assignment;
  onToggleStatus: (id: number, currentStatus: string) => void;
  onEdit: (assignment: Assignment) => void;
  onDelete: (id: number) => void;
  onAiAction: (assignment: Assignment, action: 'summarize' | 'explain' | 'solution_outline' | 'checklist' | 'estimate_time' | 'study_plan') => void;
}

export const AssignmentCard: React.FC<AssignmentCardProps> = ({
  assignment,
  onToggleStatus,
  onEdit,
  onDelete,
  onAiAction,
}) => {
  const [showAiMenu, setShowAiMenu] = useState(false);

  const formattedDueDate = new Date(assignment.due_date).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const isOverdue = assignment.status === 'Overdue';
  const isCompleted = assignment.status === 'Completed';

  // Priority Styles
  const priorityBadgeClass =
    assignment.priority === 'High'
      ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/50'
      : assignment.priority === 'Medium'
      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/50'
      : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900/50';

  // Status Styles
  const statusBadgeClass = isCompleted
    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50'
    : isOverdue
    ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/50'
    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/50';

  const aiOptions = [
    { label: 'Summarize Assignment', action: 'summarize' as const },
    { label: 'Explain Questions', action: 'explain' as const },
    { label: 'Generate Solution Outline', action: 'solution_outline' as const },
    { label: 'Generate Checklist', action: 'checklist' as const },
    { label: 'Estimate Completion Time', action: 'estimate_time' as const },
    { label: 'Suggest Study Plan', action: 'study_plan' as const },
  ];

  return (
    <div className="group relative flex flex-col bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs hover:shadow-md hover:border-[#0E2A6D]/40 dark:hover:border-[#D9A441]/40 transition-all duration-200">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        {/* Title & Metadata */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {/* Subject Pill */}
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-md bg-[#0E2A6D]/10 text-[#0E2A6D] dark:bg-[#D9A441]/10 dark:text-[#D9A441]">
              <BookOpen size={13} />
              {assignment.subject}
            </span>

            {/* Priority Pill */}
            <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-md border ${priorityBadgeClass}`}>
              <Tag size={12} />
              {assignment.priority} Priority
            </span>

            {/* Status Pill */}
            <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-md border ${statusBadgeClass}`}>
              {isCompleted ? <CircleCheck size={12} /> : <CircleAlert size={12} />}
              {assignment.status}
            </span>

            {assignment.assigned_class && (
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                {assignment.assigned_class}
              </span>
            )}
          </div>

          <h3 className="text-lg font-bold font-heading text-slate-900 dark:text-white group-hover:text-[#0E2A6D] dark:group-hover:text-[#60A5FA] transition-colors leading-snug">
            {assignment.title}
          </h3>

          <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-600 dark:text-slate-400">
            <span className="inline-flex items-center gap-1 font-medium">
              <User size={13} className="text-slate-400" />
              Faculty: <strong className="text-slate-700 dark:text-slate-300">{assignment.faculty}</strong>
            </span>
          </div>

          {assignment.description && (
            <p className="mt-2.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
              {assignment.description}
            </p>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 shrink-0 self-start sm:self-auto">
          {/* Status Toggle Button */}
          <button
            onClick={() => onToggleStatus(assignment.id, assignment.status)}
            title={isCompleted ? 'Mark as Pending' : 'Mark as Completed'}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-180 ${
              isCompleted
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'
                : 'bg-[#0E2A6D] text-white hover:bg-[#0E2A6D]/90 shadow-xs'
            }`}
          >
            <CircleCheck size={15} />
            <span>{isCompleted ? 'Completed' : 'Complete'}</span>
          </button>

          {/* AI Features Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowAiMenu(!showAiMenu)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 hover:bg-purple-500/20 border border-purple-200 dark:border-purple-900/50 transition-all"
            >
              <Sparkles size={14} />
              <span>AI Tools</span>
              <ChevronDown size={13} />
            </button>

            {showAiMenu && (
              <div
                className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#1E293B] rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1.5 z-30"
                onClick={() => setShowAiMenu(false)}
              >
                <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 border-b border-slate-100 dark:border-slate-800 mb-1">
                  AI Capabilities
                </div>
                {aiOptions.map((opt) => (
                  <button
                    key={opt.action}
                    onClick={() => onAiAction(assignment, opt.action)}
                    className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-purple-950/40 hover:text-purple-600 dark:hover:text-purple-300 transition-colors flex items-center gap-2"
                  >
                    <Sparkles size={13} className="text-purple-500" />
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Edit Button */}
          <button
            onClick={() => onEdit(assignment)}
            title="Edit Assignment"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <SquarePen size={16} />
          </button>

          {/* Delete Button */}
          <button
            onClick={() => onDelete(assignment.id)}
            title="Delete Assignment"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Footer info: Due Date, Attachments, Remarks */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 font-semibold text-slate-500 dark:text-slate-400">
          <Clock3 size={15} className={isOverdue ? 'text-rose-500' : 'text-slate-400'} />
          <span>Due:</span>
          <span className={isOverdue ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-slate-800 dark:text-slate-200'}>
            {formattedDueDate}
          </span>
        </div>

        {/* File Attachment */}
        {assignment.attachment_name && (
          <a
            href={assignment.attachment_url || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium text-xs border border-slate-200 dark:border-slate-700"
          >
            <Paperclip size={13} />
            <span className="truncate max-w-[160px]">{assignment.attachment_name}</span>
            {assignment.attachment_size && (
              <span className="text-[10px] text-slate-400">({assignment.attachment_size})</span>
            )}
            <Download size={13} className="ml-0.5" />
          </a>
        )}

        {assignment.remarks && (
          <div className="w-full text-xs italic text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/60 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
            <strong>Remarks:</strong> {assignment.remarks}
          </div>
        )}
      </div>
    </div>
  );
};
