import React from 'react';
import {
  Clock3,
  Target,
  CheckCircle2,
  TrendingUp,
  BarChart3,
  BookOpen,
  CheckSquare,
  Sparkles
} from 'lucide-react';
import { StudyAnalytics } from '../../api/studyPlanner';

interface StudyAnalyticsBannerProps {
  analytics: StudyAnalytics | null;
  loading: boolean;
}

export const StudyAnalyticsBanner: React.FC<StudyAnalyticsBannerProps> = ({
  analytics,
  loading,
}) => {
  if (loading) {
    return (
      <div className="bg-[#FFFFFF] dark:bg-[#181818] p-6 rounded-[12px] border border-[#D1D5DB] dark:border-[#3F3F46] shadow-xs animate-pulse space-y-4">
        <div className="h-6 w-48 bg-[#F8FAFC] dark:bg-[#111111] rounded-[6px]" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="h-20 bg-[#F8FAFC] dark:bg-[#111111] rounded-[10px]" />
          <div className="h-20 bg-[#F8FAFC] dark:bg-[#111111] rounded-[10px]" />
          <div className="h-20 bg-[#F8FAFC] dark:bg-[#111111] rounded-[10px]" />
          <div className="h-20 bg-[#F8FAFC] dark:bg-[#111111] rounded-[10px]" />
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="bg-[#FFFFFF] dark:bg-[#181818] p-6 rounded-[12px] border border-[#D1D5DB] dark:border-[#3F3F46] shadow-xs space-y-5">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#F3F4F6] dark:border-[#2A2A2A]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[10px] bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] flex items-center justify-center shrink-0">
            <Target size={20} />
          </div>
          <div>
            <h2 className="text-[18px] font-bold text-[#111827] dark:text-[#FAFAFA]">
              AI Exam Preparation Analytics
            </h2>
            <p className="text-[12px] text-[#6B7280] dark:text-[#A3A3A3]">
              Live automated tracking across all study subjects & modules
            </p>
          </div>
        </div>

        {/* Exam Countdown Pill */}
        <div className="px-4 py-2 rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA] flex items-center gap-2">
          <Clock3 size={18} />
          <span className="text-[12px] font-medium">
            Exam Countdown: <strong className="text-[16px] font-bold">{analytics.days_to_exam} Days Left</strong>
          </span>
        </div>
      </div>

      {/* Grid Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Daily Progress */}
        <div className="p-4 rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-medium text-[#6B7280] dark:text-[#A3A3A3] flex items-center gap-1.5">
              <CheckCircle2 size={15} />
              Daily Progress
            </span>
            <span className="text-[14px] font-bold text-[#111827] dark:text-[#FAFAFA]">
              {analytics.daily_progress_percentage}%
            </span>
          </div>
          <div className="w-full h-2 bg-[#E5E7EB] dark:bg-[#2A2A2A] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#111827] dark:bg-[#FAFAFA] rounded-full transition-all duration-300"
              style={{ width: `${Math.min(analytics.daily_progress_percentage, 100)}%` }}
            />
          </div>
        </div>

        {/* Weekly Progress */}
        <div className="p-4 rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-medium text-[#6B7280] dark:text-[#A3A3A3] flex items-center gap-1.5">
              <TrendingUp size={15} />
              Weekly Progress
            </span>
            <span className="text-[14px] font-bold text-[#111827] dark:text-[#FAFAFA]">
              {analytics.weekly_progress_percentage}%
            </span>
          </div>
          <div className="w-full h-2 bg-[#E5E7EB] dark:bg-[#2A2A2A] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#111827] dark:bg-[#FAFAFA] rounded-full transition-all duration-300"
              style={{ width: `${Math.min(analytics.weekly_progress_percentage, 100)}%` }}
            />
          </div>
        </div>

        {/* Study Hours */}
        <div className="p-4 rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] space-y-1">
          <span className="text-[12px] font-medium text-[#6B7280] dark:text-[#A3A3A3] flex items-center gap-1.5">
            <Clock3 size={15} />
            Study Hours Completed
          </span>
          <p className="text-[20px] font-bold text-[#111827] dark:text-[#FAFAFA]">
            {analytics.total_study_hours_completed} / {analytics.total_study_hours_allocated} hrs
          </p>
        </div>

        {/* Topics Count */}
        <div className="p-4 rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] space-y-1">
          <span className="text-[12px] font-medium text-[#6B7280] dark:text-[#A3A3A3] flex items-center gap-1.5">
            <BookOpen size={15} />
            Topics Progress
          </span>
          <p className="text-[20px] font-bold text-[#111827] dark:text-[#FAFAFA]">
            {analytics.completed_topics_count} Completed <span className="text-[12px] font-normal text-[#6B7280] dark:text-[#A3A3A3]">({analytics.remaining_topics_count} left)</span>
          </p>
        </div>
      </div>
    </div>
  );
};
