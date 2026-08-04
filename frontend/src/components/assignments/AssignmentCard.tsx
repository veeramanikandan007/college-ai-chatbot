import React, { useState, useRef, useEffect } from 'react';
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
  const aiRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (aiRef.current && !aiRef.current.contains(e.target as Node)) {
        setShowAiMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formattedDueDate = new Date(assignment.due_date).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const isCompleted = assignment.status === 'Completed';

  const aiOptions = [
    { label: 'Summarize Assignment', action: 'summarize' as const },
    { label: 'Explain Questions', action: 'explain' as const },
    { label: 'Generate Solution Outline', action: 'solution_outline' as const },
    { label: 'Generate Checklist', action: 'checklist' as const },
    { label: 'Estimate Completion Time', action: 'estimate_time' as const },
    { label: 'Suggest Study Plan', action: 'study_plan' as const },
  ];

  return (
    <div className="w-full p-4 rounded-[16px] bg-[#FFFFFF] dark:bg-[#18181B] border border-[#D1D5DB] dark:border-[#3F3F46] flex flex-col justify-between space-y-3 transition-all duration-150 hover:-translate-y-[2px] hover:shadow-md select-none">
      {/* Top Header: Badges & Quick Edit/Delete Icons */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5 min-w-0">
            <span className="h-[24px] inline-flex items-center gap-1 rounded-full border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#F8FAFC] dark:bg-[#111111] px-2.5 text-[12px] font-[500] text-[#111827] dark:text-[#FAFAFA] truncate">
              <BookOpen size={12} className="shrink-0" />
              <span className="truncate">{assignment.subject}</span>
            </span>

            <span className="h-[24px] inline-flex items-center gap-1 rounded-full border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#F8FAFC] dark:bg-[#111111] px-2.5 text-[12px] font-[500] text-[#6B7280] dark:text-[#A1A1AA]">
              <Tag size={12} className="shrink-0" />
              <span>{assignment.priority}</span>
            </span>

            <span className={`h-[24px] inline-flex items-center gap-1 rounded-full border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#F8FAFC] dark:bg-[#111111] px-2.5 text-[12px] font-[500] ${
              isCompleted ? 'text-[#111827] dark:text-[#FAFAFA]' : 'text-[#6B7280] dark:text-[#A1A1AA]'
            }`}>
              {isCompleted ? <CircleCheck size={12} /> : <CircleAlert size={12} />}
              <span>{assignment.status}</span>
            </span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => onEdit(assignment)}
              title="Edit Assignment"
              className="h-8 w-8 rounded-[8px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#18181B] text-[#111827] dark:text-[#FAFAFA] hover:bg-[#F8FAFC] dark:hover:bg-[#232323] transition flex items-center justify-center cursor-pointer active:scale-[0.98]"
            >
              <SquarePen size={14} />
            </button>

            <button
              onClick={() => onDelete(assignment.id)}
              title="Delete Assignment"
              className="h-8 w-8 rounded-[8px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#18181B] text-[#111827] dark:text-[#FAFAFA] hover:bg-[#F8FAFC] dark:hover:bg-[#232323] transition flex items-center justify-center cursor-pointer active:scale-[0.98]"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* Title & Info */}
        <div>
          <h3 className="text-[18px] font-[600] text-[#111827] dark:text-[#FAFAFA] leading-snug line-clamp-2">
            {assignment.title}
          </h3>

          <div className="mt-2 space-y-1 text-[14px] text-[#6B7280] dark:text-[#A1A1AA]">
            <div className="flex items-center gap-1.5 truncate">
              <User size={14} className="shrink-0 text-[#111827] dark:text-[#FAFAFA]" />
              <span className="truncate">Faculty: <strong className="font-[500] text-[#111827] dark:text-[#FAFAFA]">{assignment.faculty}</strong></span>
            </div>
            {assignment.assigned_class && (
              <div className="flex items-center gap-1.5 truncate">
                <BookOpen size={14} className="shrink-0 text-[#111827] dark:text-[#FAFAFA]" />
                <span className="truncate">Class: <strong className="font-[500] text-[#111827] dark:text-[#FAFAFA]">{assignment.assigned_class}</strong></span>
              </div>
            )}
          </div>

          {assignment.description && (
            <p className="mt-2 text-[13px] font-[400] text-[#4B5563] dark:text-[#D4D4D4] line-clamp-2 leading-relaxed">
              {assignment.description}
            </p>
          )}
        </div>
      </div>

      {/* Due Date & Attachments Section */}
      <div className="space-y-2 pt-2 border-t border-[#D1D5DB] dark:border-[#3F3F46]">
        <div className="flex items-center justify-between text-[13px] text-[#6B7280] dark:text-[#A1A1AA]">
          <div className="flex items-center gap-1.5 truncate">
            <Clock3 size={14} className="shrink-0 text-[#111827] dark:text-[#FAFAFA]" />
            <span className="truncate font-[500] text-[#111827] dark:text-[#FAFAFA]">{formattedDueDate}</span>
          </div>
        </div>

        {assignment.attachment_name && (
          <a
            href={assignment.attachment_url || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-between px-3 py-1.5 rounded-[8px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#D1D5DB] dark:border-[#3F3F46] text-[#111827] dark:text-[#FAFAFA] text-[12px] font-[500] hover:bg-[#F9FAFB] dark:hover:bg-[#232323] transition-colors"
          >
            <span className="flex items-center gap-1.5 truncate">
              <Paperclip size={13} />
              <span className="truncate max-w-[180px]">{assignment.attachment_name}</span>
            </span>
            <Download size={13} className="shrink-0" />
          </a>
        )}

        {/* Action Bar: Complete & AI Tools */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={() => onToggleStatus(assignment.id, assignment.status)}
            className="flex-1 h-[38px] px-3 rounded-[10px] bg-[#111827] hover:bg-[#000000] dark:bg-[#FAFAFA] dark:hover:bg-[#E5E5E5] text-[#FFFFFF] dark:text-[#111111] text-[14px] font-[500] transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.98]"
          >
            <CircleCheck size={15} />
            <span>{isCompleted ? 'Completed' : 'Mark Complete'}</span>
          </button>

          <div className="relative shrink-0" ref={aiRef}>
            <button
              onClick={() => setShowAiMenu(!showAiMenu)}
              className="h-[38px] px-3 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#18181B] text-[#111827] dark:text-[#FAFAFA] text-[14px] font-[500] hover:bg-[#F8FAFC] dark:hover:bg-[#232323] transition flex items-center gap-1.5 cursor-pointer active:scale-[0.98]"
            >
              <Sparkles size={15} />
              <span>AI Tools</span>
              <ChevronDown size={13} />
            </button>

            {showAiMenu && (
              <div className="absolute right-0 bottom-full mb-1.5 sm:bottom-auto sm:top-full sm:mt-1.5 z-40 w-56 bg-[#FFFFFF] dark:bg-[#18181B] rounded-[12px] shadow-xl border border-[#D1D5DB] dark:border-[#3F3F46] py-1">
                <div className="px-3 py-1.5 text-[10px] font-[700] uppercase tracking-wider text-[#6B7280] dark:text-[#A1A1AA] border-b border-[#E5E7EB] dark:border-[#2A2A2A] mb-1">
                  AI Capabilities
                </div>
                {aiOptions.map((opt) => (
                  <button
                    key={opt.action}
                    onClick={() => {
                      onAiAction(assignment, opt.action);
                      setShowAiMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 text-[12px] font-[500] text-[#111827] dark:text-[#FAFAFA] hover:bg-[#F8FAFC] dark:hover:bg-[#232323] transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <Sparkles size={13} />
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
