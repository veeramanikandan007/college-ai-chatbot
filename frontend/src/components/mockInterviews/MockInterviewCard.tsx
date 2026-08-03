import React from 'react';
import {
  Brain,
  Award,
  Clock3,
  Calendar,
  FileText,
  Trash2,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { MockInterview } from '../../api/mockInterviews';

interface MockInterviewCardProps {
  interview: MockInterview;
  onViewFeedback: (interview: MockInterview) => void;
  onDelete: (id: number) => void;
}

export const MockInterviewCard: React.FC<MockInterviewCardProps> = ({
  interview,
  onViewFeedback,
  onDelete,
}) => {
  const isCompleted = interview.status === 'Completed';

  return (
    <div className="p-6 rounded-[12px] bg-[#FFFFFF] dark:bg-[#181818] border border-[#D1D5DB] dark:border-[#3F3F46] shadow-xs flex flex-col justify-between space-y-4">
      {/* Top Header */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-[6px] text-[12px] font-medium bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111]">
              {interview.interview_type}
            </span>
            <span className="px-2.5 py-0.5 rounded-[6px] text-[12px] font-medium bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA]">
              {interview.difficulty}
            </span>
          </div>

          {isCompleted ? (
            <span className="px-2.5 py-0.5 rounded-[6px] text-[14px] font-bold bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA]">
              {interview.overall_score}%
            </span>
          ) : (
            <span className="px-2.5 py-0.5 rounded-[6px] text-[12px] font-medium bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA]">
              In Progress
            </span>
          )}
        </div>

        <h3 className="text-[18px] font-bold text-[#111827] dark:text-[#FAFAFA] leading-snug line-clamp-2">
          {interview.title}
        </h3>

        <p className="text-[14px] text-[#6B7280] dark:text-[#A3A3A3]">
          Target Role: <strong className="text-[#111827] dark:text-[#FAFAFA]">{interview.target_role}</strong>
        </p>

        {interview.feedback_summary && (
          <p className="text-[14px] text-[#4B5563] dark:text-[#D4D4D4] line-clamp-2 leading-relaxed italic">
            "{interview.feedback_summary}"
          </p>
        )}
      </div>

      {/* Footer Info & Actions */}
      <div className="pt-3 border-t border-[#E5E7EB] dark:border-[#2A2A2A] flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-[12px] font-medium text-[#6B7280] dark:text-[#A3A3A3]">
          <span className="inline-flex items-center gap-1">
            <Clock3 size={14} />
            {interview.duration_minutes} mins
          </span>
          <span className="inline-flex items-center gap-1">
            <Calendar size={14} />
            {new Date(interview.created_at).toLocaleDateString()}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {isCompleted && (
            <button
              onClick={() => onViewFeedback(interview)}
              className="h-9 px-3.5 rounded-[8px] bg-[#111827] hover:bg-[#000000] dark:bg-[#FAFAFA] dark:hover:bg-[#E5E5E5] text-[#FFFFFF] dark:text-[#111111] text-[12px] font-medium shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <FileText size={14} />
              <span>Feedback</span>
            </button>
          )}

          <button
            onClick={() => onDelete(interview.id)}
            title="Delete Session"
            className="h-9 w-9 rounded-[8px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#181818] text-[#111827] dark:text-[#FAFAFA] hover:bg-[#F9FAFB] dark:hover:bg-[#232323] flex items-center justify-center cursor-pointer"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
