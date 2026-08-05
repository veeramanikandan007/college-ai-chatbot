import React from 'react';
import {
  Clock3,
  CheckCircle2,
  BookOpen,
  Calendar
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
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-[88px] rounded-[16px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#F8FAFC] dark:bg-[#111111] animate-pulse" />
        ))}
      </div>
    );
  }

  if (!analytics) return null;

  const cards = [
    {
      id: 'tasks',
      title: "Today's Tasks",
      value: String(analytics.completed_topics_count),
      sub: `${analytics.remaining_topics_count} topics remaining`,
      icon: BookOpen,
    },
    {
      id: 'completed',
      title: 'Daily Progress',
      value: `${analytics.daily_progress_percentage}%`,
      sub: 'Target completion',
      icon: CheckCircle2,
      progress: analytics.daily_progress_percentage,
    },
    {
      id: 'hours',
      title: 'Study Hours',
      value: `${analytics.total_study_hours_completed}h`,
      sub: `Of ${analytics.total_study_hours_allocated}h allocated`,
      icon: Clock3,
    },
    {
      id: 'countdown',
      title: 'Exam Countdown',
      value: `${analytics.days_to_exam}d`,
      sub: `Weekly ${analytics.weekly_progress_percentage}% completed`,
      icon: Calendar,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 select-none">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            className="min-h-[88px] h-auto p-3.5 sm:p-4 rounded-[16px] bg-[#FFFFFF] dark:bg-[#18181B] border border-[#D1D5DB] dark:border-[#3F3F46] shadow-xs flex items-center justify-between min-w-0 transition-all duration-150 ease-in-out hover:-translate-y-[2px] hover:shadow-md"
          >
            <div className="min-w-0 flex-1 space-y-0.5">
              <p className="text-[12px] sm:text-[14px] font-[400] text-[#6B7280] dark:text-[#A1A1AA] truncate">{card.title}</p>
              <p className="text-[15px] sm:text-[22px] lg:text-[30px] font-[600] text-[#111827] dark:text-[#FAFAFA] leading-tight truncate">
                {card.value}
              </p>
              {card.progress !== undefined ? (
                <div className="w-full max-w-[120px] sm:max-w-[140px] h-[4px] bg-[#F8FAFC] dark:bg-[#111111] rounded-full overflow-hidden border border-[#D1D5DB] dark:border-[#3F3F46] mt-1.5">
                  <div
                    className="h-full bg-[#111827] dark:bg-[#FAFAFA] rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(card.progress, 100)}%` }}
                  />
                </div>
              ) : (
                <p className="text-[11px] sm:text-[12px] font-[400] text-[#6B7280] dark:text-[#A1A1AA] truncate pt-0.5">{card.sub}</p>
              )}
            </div>

            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-[8px] sm:rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#D1D5DB] dark:border-[#3F3F46] text-[#111827] dark:text-[#FAFAFA] flex items-center justify-center shrink-0 ml-1.5 sm:ml-3">
              <Icon size={16} className="sm:hidden" />
              <Icon size={18} className="hidden sm:block" />
            </div>
          </div>
        );
      })}
    </div>
  );
};
