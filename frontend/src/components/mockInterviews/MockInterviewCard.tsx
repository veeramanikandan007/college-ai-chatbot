import React from 'react';
import {
  Brain,
  Award,
  Clock3,
  Calendar,
  FileText,
  Trash2,
  ChevronRight,
  Sparkles,
  UserRound
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
    <div className="p-[18px] sm:p-5 rounded-[16px] bg-[#FFFFFF] dark:bg-[#18181B] border border-[#D1D5DB] dark:border-[#3F3F46] shadow-xs hover:shadow-md transition-all duration-150 ease-in-out hover:-translate-y-[2px] flex flex-col justify-between space-y-4 select-none h-full">
      {/* Top Header & Meta Badges */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="h-[24px] inline-flex items-center rounded-full border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#111827] dark:bg-[#FAFAFA] px-3 text-[12px] font-[400] text-[#FFFFFF] dark:text-[#111111]">
              {interview.interview_type}
            </span>
            <span className="h-[24px] inline-flex items-center rounded-full border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#F8FAFC] dark:bg-[#111111] px-3 text-[12px] font-[600] text-[#6B7280] dark:text-[#A1A1AA]">
              {interview.difficulty}
            </span>
          </div>

          {isCompleted ? (
            <span className="h-[26px] inline-flex items-center rounded-full border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#F8FAFC] dark:bg-[#111111] px-3 text-[14px] font-[500] text-[#111827] dark:text-[#FAFAFA]">
              Score: {interview.overall_score}%
            </span>
          ) : (
            <span className="h-[24px] inline-flex items-center rounded-full border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#F8FAFC] dark:bg-[#111111] px-3 text-[12px] font-[600] text-[#6B7280] dark:text-[#A1A1AA]">
              In Progress
            </span>
          )}
        </div>

        <div>
          <h4 className="text-[18px] font-[700] text-[#111827] dark:text-[#FAFAFA] leading-snug line-clamp-2">
            {interview.title}
          </h4>

          <p className="text-[14px] font-[500] text-[#6B7280] dark:text-[#A1A1AA] mt-1">
            Target Role: <strong className="font-[700] text-[#111827] dark:text-[#FAFAFA]">{interview.target_role}</strong>
          </p>
        </div>

        {interview.feedback_summary && (
          <p className="text-[14px] font-[500] text-[#6B7280] dark:text-[#A1A1AA] line-clamp-2 leading-relaxed bg-[#F8FAFC] dark:bg-[#111111] p-3 rounded-[12px] border border-[#D1D5DB] dark:border-[#3F3F46]">
            "{interview.feedback_summary}"
          </p>
        )}
      </div>

      {/* Footer Meta & Actions */}
      <div className="pt-3 border-t border-[#D1D5DB] dark:border-[#3F3F46] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-[14px] font-[500] text-[#6B7280] dark:text-[#A1A1AA]">
          <span className="inline-flex items-center gap-1.5">
            <Clock3 size={14} className="text-[#111827] dark:text-[#FAFAFA]" />
            {interview.duration_minutes} mins
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Calendar size={14} className="text-[#111827] dark:text-[#FAFAFA]" />
            {new Date(interview.created_at).toLocaleDateString()}
          </span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {isCompleted && (
            <button
              onClick={() => onViewFeedback(interview)}
              className="h-[38px] px-3.5 rounded-[12px] bg-[#111827] hover:bg-[#1F2937] active:bg-[#0F172A] dark:bg-[#FAFAFA] dark:hover:bg-[#F3F4F6] text-[#FFFFFF] dark:text-[#111111] text-[14px] font-[500] transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-[0.98]"
            >
              <FileText size={15} />
              <span>Feedback</span>
            </button>
          )}

          <button
            onClick={() => onDelete(interview.id)}
            title="Delete Session"
            className="h-[38px] w-[38px] rounded-[12px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#18181B] text-[#111827] dark:text-[#FAFAFA] hover:bg-[#F8FAFC] dark:hover:bg-[#232323] transition flex items-center justify-center cursor-pointer shrink-0 active:scale-[0.98]"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

