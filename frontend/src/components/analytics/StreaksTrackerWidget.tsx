import React from 'react';
import { Activity, BookOpen, Brain, ClipboardList, CalendarDays, Zap } from 'lucide-react';
import type { StreakData } from '../../api/studentAnalytics';

interface Props {
  streaks: StreakData | null;
  loading: boolean;
}

interface StreakCardProps {
  icon: React.ReactNode;
  label: string;
  days: number;
  description: string;
}

const StreakCard: React.FC<StreakCardProps> = ({ icon, label, days, description }) => (
  <div className="p-6 rounded-[12px] bg-[#FFFFFF] dark:bg-[#181818] border border-[#D1D5DB] dark:border-[#3F3F46] shadow-xs flex flex-col items-center text-center space-y-3">
    <div className="w-12 h-12 rounded-[10px] bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] flex items-center justify-center">
      {icon}
    </div>
    <div>
      <p className="text-[32px] font-bold text-[#111827] dark:text-[#FAFAFA]">{days}</p>
      <p className="text-[14px] font-bold text-[#111827] dark:text-[#FAFAFA]">{label}</p>
      <p className="text-[12px] text-[#6B7280] dark:text-[#A3A3A3] mt-0.5">{description}</p>
    </div>
  </div>
);

const SkeletonCard: React.FC = () => (
  <div className="p-6 rounded-[12px] bg-[#FFFFFF] dark:bg-[#181818] border border-[#D1D5DB] dark:border-[#3F3F46] shadow-xs animate-pulse flex flex-col items-center space-y-3">
    <div className="w-12 h-12 rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111]" />
    <div className="h-8 w-12 bg-[#F8FAFC] dark:bg-[#111111] rounded-[6px]" />
    <div className="h-4 w-24 bg-[#F8FAFC] dark:bg-[#111111] rounded-[6px]" />
  </div>
);

export const StreaksTrackerWidget: React.FC<Props> = ({ streaks, loading }) => {
  const totalDays =
    streaks
      ? streaks.daily_study_streak +
        streaks.quiz_streak +
        streaks.attendance_streak +
        streaks.assignment_streak
      : 0;

  const lastActivity = streaks?.last_activity_date
    ? new Date(streaks.last_activity_date).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : null;

  const streakItems: StreakCardProps[] = streaks
    ? [
        {
          icon: <Brain size={22} />,
          label: 'Daily Study',
          days: streaks.daily_study_streak,
          description: 'Consecutive study days',
        },
        {
          icon: <BookOpen size={22} />,
          label: 'Quiz Practice',
          days: streaks.quiz_streak,
          description: 'Consecutive quiz days',
        },
        {
          icon: <Activity size={22} />,
          label: 'Attendance',
          days: streaks.attendance_streak,
          description: 'Consecutive present days',
        },
        {
          icon: <ClipboardList size={22} />,
          label: 'Assignment',
          days: streaks.assignment_streak,
          description: 'On-time submissions',
        },
      ]
    : [];

  return (
    <div className="bg-[#FFFFFF] dark:bg-[#18181B] p-6 rounded-[16px] border border-[#D1D5DB] dark:border-[#3F3F46] shadow-xs space-y-5 select-none">
      <div className="flex items-center justify-between pb-4 border-b border-[#D1D5DB] dark:border-[#3F3F46]">
        <div className="flex items-center gap-3">
          <div className="w-[40px] h-[40px] rounded-[10px] bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] flex items-center justify-center shrink-0">
            <Zap size={20} />
          </div>
          <div>
            <h2 className="text-[20px] font-[700] text-[#111827] dark:text-[#FAFAFA]">Activity Streaks</h2>
            <p className="text-[14px] font-[500] text-[#6B7280] dark:text-[#A1A1AA]">
              {streaks ? `${totalDays} total streak days` : 'Loading...'}
              {lastActivity ? ` · Last active ${lastActivity}` : ''}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          : streakItems.map((item) => <StreakCard key={item.label} {...item} />)}
      </div>

      {!loading && streaks && (
        <div className="p-3.5 rounded-[12px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#D1D5DB] dark:border-[#3F3F46] text-center text-[14px] font-[500] text-[#111827] dark:text-[#FAFAFA] flex items-center justify-center gap-2">
          <Zap size={16} className="text-[#111827] dark:text-[#FAFAFA] shrink-0" />
          <span>
            {Math.max(...[streaks.daily_study_streak, streaks.quiz_streak, streaks.attendance_streak, streaks.assignment_streak]) >= 7
              ? 'You are on a hot streak! Keep the momentum going every day.'
              : 'Build your streak by studying, attending, and solving quizzes every day.'}
          </span>
        </div>
      )}
    </div>
  );
};

