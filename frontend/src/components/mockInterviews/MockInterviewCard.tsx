import React from 'react';
import {
  Clock3,
  Calendar,
  FileText,
  Trash2,
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
    <div className="p-6 rounded-[16px] bg-[#FFFFFF] dark:bg-[#18181B] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs hover:shadow-md transition-all duration-150 ease-in-out hover:-translate-y-[2px] flex flex-col justify-between space-y-4 select-none h-full">
      {/* Top Header & Meta Badges */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="h-6 inline-flex items-center rounded-full border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#111827] dark:bg-[#FAFAFA] px-3 text-[12px] font-medium text-[#FFFFFF] dark:text-[#111111]">
              {interview.interview_type}
            </span>
            <span className="h-6 inline-flex items-center rounded-full border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#F8FAFC] dark:bg-[#111111] px-3 text-[12px] font-medium text-[#6B7280] dark:text-[#A1A1AA]">
              {interview.difficulty}
            </span>
          </div>

          {isCompleted ? (
            <span className="h-6 inline-flex items-center rounded-full border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#F8FAFC] dark:bg-[#111111] px-3 text-[13px] font-semibold text-[#111827] dark:text-[#FAFAFA]">
              Score: {interview.overall_score}%
            </span>
          ) : (
            <span className="h-6 inline-flex items-center rounded-full border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#F8FAFC] dark:bg-[#111111] px-3 text-[12px] font-medium text-[#6B7280] dark:text-[#A1A1AA]">
              In Progress
            </span>
          )}
        </div>

        <div>
          <h3 className="text-[17px] font-semibold text-[#111827] dark:text-[#FAFAFA] leading-snug line-clamp-2">
            {interview.title}
          </h3>

          <p className="text-[14px] font-normal text-[#6B7280] dark:text-[#A1A1AA] mt-1">
            Target Role: <span className="font-semibold text-[#111827] dark:text-[#FAFAFA]">{interview.target_role}</span>
          </p>
        </div>

        {interview.feedback_summary && (
          <p className="text-[14px] font-normal text-[#6B7280] dark:text-[#A1A1AA] line-clamp-2 leading-relaxed bg-[#F8FAFC] dark:bg-[#111111] p-3.5 rounded-[12px] border border-[#E5E7EB] dark:border-[#2A2A2A]">
            "{interview.feedback_summary}"
          </p>
        )}
      </div>

      {/* Footer Meta & Actions */}
      <div className="pt-4 border-t border-[#E5E7EB] dark:border-[#2A2A2A] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-[13px] font-normal text-[#6B7280] dark:text-[#A1A1AA]">
          <span className="inline-flex items-center gap-1.5">
            <Clock3 size={14} className="text-[#6B7280] dark:text-[#A1A1AA]" />
            {interview.duration_minutes} mins
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Calendar size={14} className="text-[#6B7280] dark:text-[#A1A1AA]" />
            {new Date(interview.created_at).toLocaleDateString()}
          </span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {isCompleted && (
            <button
              onClick={() => onViewFeedback(interview)}
              className="h-[36px] px-4 rounded-[10px] bg-[#111827] hover:bg-[#1F2937] dark:bg-[#FAFAFA] dark:hover:bg-[#E5E5E5] text-[#FFFFFF] dark:text-[#111111] text-[14px] font-medium transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-[0.98]"
            >
              <FileText size={15} />
              <span>Feedback</span>
            </button>
          )}

          <button
            onClick={() => onDelete(interview.id)}
            title="Delete Session"
            className="h-[36px] w-[36px] rounded-[10px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#FFFFFF] dark:bg-[#18181B] text-[#111827] dark:text-[#FAFAFA] hover:bg-[#F8FAFC] dark:hover:bg-[#232323] transition flex items-center justify-center cursor-pointer shrink-0"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
