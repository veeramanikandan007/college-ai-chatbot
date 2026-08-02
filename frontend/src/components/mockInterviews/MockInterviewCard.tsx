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

  const typeBadge =
    interview.interview_type === 'HR'
      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
      : interview.interview_type === 'Coding'
      ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
      : interview.interview_type === 'Aptitude'
      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
      : 'bg-[#0E2A6D]/10 text-[#0E2A6D] dark:bg-[#60A5FA]/10 dark:text-[#60A5FA]';

  return (
    <div className="flex flex-col justify-between p-5 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 hover:border-[#0E2A6D]/40 dark:hover:border-[#60A5FA]/40 shadow-xs transition-all space-y-4">
      {/* Top Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md ${typeBadge}`}>
              {interview.interview_type}
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {interview.difficulty}
            </span>
          </div>

          {isCompleted ? (
            <span className="text-xs font-black font-heading px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
              {interview.overall_score}%
            </span>
          ) : (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400">
              In Progress
            </span>
          )}
        </div>

        <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug line-clamp-2">
          {interview.title}
        </h3>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          Target Role: <strong className="text-slate-700 dark:text-slate-200">{interview.target_role}</strong>
        </p>

        {interview.feedback_summary && (
          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed italic">
            "{interview.feedback_summary}"
          </p>
        )}
      </div>

      {/* Footer Info & Actions */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3 text-[11px] text-slate-400 font-medium">
          <span className="inline-flex items-center gap-1">
            <Clock3 size={13} />
            {interview.duration_minutes} mins
          </span>
          <span className="inline-flex items-center gap-1">
            <Calendar size={13} />
            {new Date(interview.created_at).toLocaleDateString()}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {isCompleted && (
            <button
              onClick={() => onViewFeedback(interview)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#0E2A6D] text-white text-xs font-bold hover:bg-[#0E2A6D]/90 transition-all shadow-xs"
            >
              <FileText size={14} />
              <span>Feedback</span>
            </button>
          )}

          <button
            onClick={() => onDelete(interview.id)}
            title="Delete Session"
            className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
