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

  const aiOptions = [
    { label: 'Summarize Assignment', action: 'summarize' as const },
    { label: 'Explain Questions', action: 'explain' as const },
    { label: 'Generate Solution Outline', action: 'solution_outline' as const },
    { label: 'Generate Checklist', action: 'checklist' as const },
    { label: 'Estimate Completion Time', action: 'estimate_time' as const },
    { label: 'Suggest Study Plan', action: 'study_plan' as const },
  ];

  return (
    <div className="p-6 rounded-[12px] bg-[#FFFFFF] dark:bg-[#181818] border border-[#D1D5DB] dark:border-[#3F3F46] shadow-xs flex flex-col justify-between space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        {/* Title & Metadata */}
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            {/* Subject Pill */}
            <span className="px-2.5 py-0.5 rounded-[6px] text-[12px] font-medium bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA] flex items-center gap-1">
              <BookOpen size={13} />
              {assignment.subject}
            </span>

            {/* Priority Pill */}
            <span className="px-2.5 py-0.5 rounded-[6px] text-[12px] font-medium bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA] flex items-center gap-1">
              <Tag size={12} />
              {assignment.priority} Priority
            </span>

            {/* Status Pill */}
            <span className="px-2.5 py-0.5 rounded-[6px] text-[12px] font-medium bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA] flex items-center gap-1">
              {isCompleted ? <CircleCheck size={12} /> : <CircleAlert size={12} />}
              {assignment.status}
            </span>

            {assignment.assigned_class && (
              <span className="px-2.5 py-0.5 rounded-[6px] text-[12px] font-medium bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#6B7280] dark:text-[#A3A3A3]">
                {assignment.assigned_class}
              </span>
            )}
          </div>

          <h3 className="text-[18px] font-bold text-[#111827] dark:text-[#FAFAFA] leading-snug">
            {assignment.title}
          </h3>

          <div className="flex items-center gap-2 text-[14px] text-[#6B7280] dark:text-[#A3A3A3]">
            <span className="inline-flex items-center gap-1">
              <User size={14} />
              Faculty: <strong className="text-[#111827] dark:text-[#FAFAFA]">{assignment.faculty}</strong>
            </span>
          </div>

          {assignment.description && (
            <p className="text-[14px] text-[#4B5563] dark:text-[#D4D4D4] line-clamp-2 leading-relaxed">
              {assignment.description}
            </p>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Status Toggle Button */}
          <button
            onClick={() => onToggleStatus(assignment.id, assignment.status)}
            className="h-9 px-3.5 rounded-[8px] bg-[#111827] hover:bg-[#000000] dark:bg-[#FAFAFA] dark:hover:bg-[#E5E5E5] text-[#FFFFFF] dark:text-[#111111] text-[12px] font-medium shadow-xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <CircleCheck size={14} />
            <span>{isCompleted ? 'Completed' : 'Complete'}</span>
          </button>

          {/* AI Features Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowAiMenu(!showAiMenu)}
              className="h-9 px-3.5 rounded-[8px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#181818] text-[#111827] dark:text-[#FAFAFA] text-[12px] font-medium hover:bg-[#F9FAFB] dark:hover:bg-[#232323] transition flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles size={14} />
              <span>AI Tools</span>
              <ChevronDown size={13} />
            </button>

            {showAiMenu && (
              <div
                className="absolute right-0 mt-2 w-56 bg-[#FFFFFF] dark:bg-[#181818] rounded-[10px] shadow-lg border border-[#D1D5DB] dark:border-[#3F3F46] py-1 z-30"
                onClick={() => setShowAiMenu(false)}
              >
                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#6B7280] dark:text-[#A3A3A3] border-b border-[#E5E7EB] dark:border-[#2A2A2A] mb-1">
                  AI Capabilities
                </div>
                {aiOptions.map((opt) => (
                  <button
                    key={opt.action}
                    onClick={() => onAiAction(assignment, opt.action)}
                    className="w-full text-left px-3 py-2 text-[12px] font-medium text-[#111827] dark:text-[#FAFAFA] hover:bg-[#F9FAFB] dark:hover:bg-[#232323] transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <Sparkles size={13} />
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
            className="h-9 w-9 rounded-[8px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#181818] text-[#111827] dark:text-[#FAFAFA] hover:bg-[#F9FAFB] dark:hover:bg-[#232323] flex items-center justify-center cursor-pointer"
          >
            <SquarePen size={16} />
          </button>

          {/* Delete Button */}
          <button
            onClick={() => onDelete(assignment.id)}
            title="Delete Assignment"
            className="h-9 w-9 rounded-[8px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#181818] text-[#111827] dark:text-[#FAFAFA] hover:bg-[#F9FAFB] dark:hover:bg-[#232323] flex items-center justify-center cursor-pointer"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Footer info: Due Date, Attachments, Remarks */}
      <div className="pt-3 border-t border-[#E5E7EB] dark:border-[#2A2A2A] flex flex-wrap items-center justify-between gap-3 text-[14px]">
        <div className="flex items-center gap-2 font-medium text-[#6B7280] dark:text-[#A3A3A3]">
          <Clock3 size={15} />
          <span>Due:</span>
          <span className="text-[#111827] dark:text-[#FAFAFA] font-bold">
            {formattedDueDate}
          </span>
        </div>

        {/* File Attachment */}
        {assignment.attachment_name && (
          <a
            href={assignment.attachment_url || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[6px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA] text-[12px] font-medium hover:bg-[#F9FAFB] dark:hover:bg-[#232323] transition-colors"
          >
            <Paperclip size={13} />
            <span className="truncate max-w-[160px]">{assignment.attachment_name}</span>
            {assignment.attachment_size && (
              <span className="text-[10px] text-[#6B7280] dark:text-[#A3A3A3]">({assignment.attachment_size})</span>
            )}
            <Download size={13} className="ml-0.5" />
          </a>
        )}

        {assignment.remarks && (
          <div className="w-full text-[12px] text-[#6B7280] dark:text-[#A3A3A3] bg-[#F8FAFC] dark:bg-[#111111] p-2.5 rounded-[6px] border border-[#E5E7EB] dark:border-[#2A2A2A]">
            <strong>Remarks:</strong> {assignment.remarks}
          </div>
        )}
      </div>
    </div>
  );
};
