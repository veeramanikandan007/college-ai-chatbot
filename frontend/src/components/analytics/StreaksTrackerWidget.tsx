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
  iconBg: string;
  iconColor: string;
  description: string;
}

const StreakCard: React.FC<StreakCardProps> = ({ icon, label, days, iconBg, iconColor, description }) => {
  const isHot = days >= 7;
  const isMid = days >= 3 && days < 7;

  const intensityClass =
    isHot
      ? 'from-orange-500/20 to-red-500/10 border-orange-300 dark:border-orange-700'
      : isMid
      ? 'from-amber-500/10 to-yellow-500/5 border-amber-300 dark:border-amber-700'
      : 'from-slate-50 to-slate-50/50 border-slate-200 dark:border-slate-700 dark:from-slate-800/50 dark:to-slate-800/30';

  return (
    <div
      className={`relative flex flex-col items-center text-center p-5 rounded-2xl border bg-gradient-to-b ${intensityClass} shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden`}
    >
      {/* Glow pulse for hot streaks */}
      {isHot && (
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-orange-400/10 to-transparent pointer-events-none animate-pulse" />
      )}
      <div className={`p-3 rounded-xl ${iconBg} ${iconColor} mb-3 relative z-10`}>
        {icon}
      </div>
      <div className="relative z-10">
        <div className="flex items-center justify-center gap-1.5 mb-0.5">
          <span className="text-3xl font-bold font-heading text-slate-900 dark:text-white">{days}</span>
          {days >= 3 && <Zap size={16} className={isHot ? 'text-orange-500' : 'text-amber-400'} />}
        </div>
        <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{label}</p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">day{days !== 1 ? 's' : ''} streak</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">{description}</p>
      </div>
    </div>
  );
};

const SkeletonCard: React.FC = () => (
  <div className="animate-pulse flex flex-col items-center p-5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
    <div className="h-12 w-12 rounded-xl bg-slate-200 dark:bg-slate-700 mb-3" />
    <div className="h-8 w-12 rounded bg-slate-200 dark:bg-slate-700 mb-1" />
    <div className="h-3 w-20 rounded bg-slate-200 dark:bg-slate-700" />
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
          icon: <Brain size={20} />,
          label: 'Daily Study',
          days: streaks.daily_study_streak,
          iconBg: 'bg-blue-100 dark:bg-blue-900/40',
          iconColor: 'text-blue-600 dark:text-blue-400',
          description: 'Consecutive study days',
        },
        {
          icon: <BookOpen size={20} />,
          label: 'Quiz Practice',
          days: streaks.quiz_streak,
          iconBg: 'bg-purple-100 dark:bg-purple-900/40',
          iconColor: 'text-purple-600 dark:text-purple-400',
          description: 'Consecutive quiz days',
        },
        {
          icon: <Activity size={20} />,
          label: 'Attendance',
          days: streaks.attendance_streak,
          iconBg: 'bg-emerald-100 dark:bg-emerald-900/40',
          iconColor: 'text-emerald-600 dark:text-emerald-400',
          description: 'Consecutive present days',
        },
        {
          icon: <ClipboardList size={20} />,
          label: 'Assignment',
          days: streaks.assignment_streak,
          iconBg: 'bg-amber-100 dark:bg-amber-900/40',
          iconColor: 'text-amber-600 dark:text-amber-400',
          description: 'Consecutive on-time submissions',
        },
      ]
    : [];

  return (
    <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400">
            <Zap size={18} />
          </div>
          <div>
            <h2 className="text-sm font-bold font-heading text-slate-900 dark:text-white">Activity Streaks</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {streaks ? `${totalDays} total streak days` : 'Loading...'}
              {lastActivity ? ` · Last active ${lastActivity}` : ''}
            </p>
          </div>
        </div>
      </div>
      <div className="p-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
            : streakItems.map((item) => <StreakCard key={item.label} {...item} />)}
        </div>

        {!loading && streaks && (
          <div className="mt-4 p-3 rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border border-orange-200 dark:border-orange-800">
            <p className="text-xs text-orange-700 dark:text-orange-300 font-semibold text-center">
              {Math.max(...[streaks.daily_study_streak, streaks.quiz_streak, streaks.attendance_streak, streaks.assignment_streak]) >= 7
                ? 'You are on a hot streak! Keep the momentum going every day.'
                : 'Build your streak by studying, attending, and solving quizzes every day.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
