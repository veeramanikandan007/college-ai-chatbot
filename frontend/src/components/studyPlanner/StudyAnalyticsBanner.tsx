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
      <div className="bg-white dark:bg-[#1E293B] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs animate-pulse space-y-4">
        <div className="h-6 w-48 bg-slate-200 dark:bg-slate-700 rounded-md" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="h-20 bg-slate-100 dark:bg-slate-800 rounded-xl" />
          <div className="h-20 bg-slate-100 dark:bg-slate-800 rounded-xl" />
          <div className="h-20 bg-slate-100 dark:bg-slate-800 rounded-xl" />
          <div className="h-20 bg-slate-100 dark:bg-slate-800 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="bg-white dark:bg-[#1E293B] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#0E2A6D]/10 text-[#0E2A6D] dark:bg-[#60A5FA]/10 dark:text-[#60A5FA]">
            <Target size={22} />
          </div>
          <div>
            <h2 className="text-base font-bold font-heading text-slate-900 dark:text-white">
              AI Exam Preparation Analytics
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Live automated tracking across all study subjects & modules
            </p>
          </div>
        </div>

        {/* Exam Countdown Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50">
          <Clock3 size={18} />
          <span className="text-xs font-bold">
            Exam Countdown: <strong className="text-base font-extrabold">{analytics.days_to_exam} Days Left</strong>
          </span>
        </div>
      </div>

      {/* Grid Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Daily Progress */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <CheckCircle2 size={15} className="text-emerald-500" />
              Daily Progress
            </span>
            <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
              {analytics.daily_progress_percentage}%
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(analytics.daily_progress_percentage, 100)}%` }}
            />
          </div>
        </div>

        {/* Weekly Progress */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <TrendingUp size={15} className="text-[#0E2A6D] dark:text-[#60A5FA]" />
              Weekly Progress
            </span>
            <span className="text-xs font-extrabold text-[#0E2A6D] dark:text-[#60A5FA]">
              {analytics.weekly_progress_percentage}%
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#0E2A6D] dark:bg-[#60A5FA] rounded-full transition-all duration-300"
              style={{ width: `${Math.min(analytics.weekly_progress_percentage, 100)}%` }}
            />
          </div>
        </div>

        {/* Study Hours */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Clock3 size={15} className="text-purple-500" />
            Study Hours Completed
          </span>
          <p className="text-lg font-bold font-heading text-slate-900 dark:text-white">
            {analytics.total_study_hours_completed} / {analytics.total_study_hours_allocated} hrs
          </p>
        </div>

        {/* Topics Count */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <BookOpen size={15} className="text-[#D9A441]" />
            Topics Progress
          </span>
          <p className="text-lg font-bold font-heading text-slate-900 dark:text-white">
            {analytics.completed_topics_count} Completed <span className="text-xs font-normal text-slate-400">({analytics.remaining_topics_count} left)</span>
          </p>
        </div>
      </div>
    </div>
  );
};
