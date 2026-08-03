import React from 'react';
import {
  Clock3,
  BookOpen,
  Brain,
  ClipboardList,
  UserRound,
  FileText,
  Files,
  Briefcase,
  TrendingUp,
  Activity,
  Award,
  CheckCircle2,
} from 'lucide-react';
import type { AnalyticsOverview } from '../../api/studentAnalytics';

interface Props {
  overview: AnalyticsOverview | null;
  loading: boolean;
}

export const AnalyticsOverviewCards: React.FC<Props> = ({ overview, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 select-none">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="h-[88px] rounded-[16px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#F8FAFC] dark:bg-[#111111] animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (!overview) return null;

  const assignPct = overview.assignments_total > 0
    ? Math.round((overview.assignments_completed / overview.assignments_total) * 100)
    : 0;

  const cards = [
    {
      id: 'hours',
      title: 'Study Hours (Week)',
      value: `${overview.study_hours_week}h`,
      sub: `${overview.study_hours_month}h this month`,
      icon: Clock3,
    },
    {
      id: 'attendance',
      title: 'Attendance Rate',
      value: `${overview.attendance_percentage}%`,
      sub: overview.attendance_percentage >= 80 ? 'Above 80% threshold' : 'Below threshold',
      icon: Activity,
      progress: overview.attendance_percentage,
    },
    {
      id: 'quiz',
      title: 'Quiz Average',
      value: `${overview.quiz_average}%`,
      sub: overview.quiz_average >= 80 ? 'Optimal score' : 'Needs practice',
      icon: Brain,
      progress: overview.quiz_average,
    },
    {
      id: 'assignment',
      title: 'Assignments',
      value: `${overview.assignments_completed}/${overview.assignments_total}`,
      sub: `${assignPct}% completed`,
      icon: ClipboardList,
      progress: assignPct,
    },
    {
      id: 'interview',
      title: 'Interview Score',
      value: overview.interview_score > 0 ? `${overview.interview_score}%` : 'N/A',
      sub: overview.interview_score > 0 ? 'Mock interview avg' : 'No sessions yet',
      icon: UserRound,
      progress: overview.interview_score > 0 ? overview.interview_score : undefined,
    },
    {
      id: 'placement',
      title: 'Placement Readiness',
      value: `${overview.placement_readiness}%`,
      sub: overview.placement_readiness >= 70 ? 'Placement Ready' : 'Needs work',
      icon: Briefcase,
      progress: overview.placement_readiness,
    },
    {
      id: 'weekly',
      title: 'Weekly Progress',
      value: `${overview.weekly_progress}%`,
      sub: 'Composite this week',
      icon: TrendingUp,
      progress: overview.weekly_progress,
    },
    {
      id: 'monthly',
      title: 'Monthly Progress',
      value: `${overview.monthly_progress}%`,
      sub: 'Composite this month',
      icon: Award,
      progress: overview.monthly_progress,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 select-none">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            className="h-[88px] p-3.5 sm:p-[16px] rounded-[16px] bg-[#FFFFFF] dark:bg-[#18181B] border border-[#D1D5DB] dark:border-[#3F3F46] shadow-xs flex items-center justify-between transition-all duration-150 ease-in-out hover:-translate-y-[2px] hover:shadow-md"
          >
            <div className="min-w-0 flex-1 space-y-0.5">
              <p className="text-[14px] sm:text-[15px] font-[400] text-[#6B7280] dark:text-[#A1A1AA] truncate">
                {card.title}
              </p>
              <p className="text-[26px] sm:text-[30px] font-[600] text-[#111827] dark:text-[#FAFAFA] leading-none truncate">
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
                <p className="text-[12px] sm:text-[14px] font-[400] text-[#6B7280] dark:text-[#A1A1AA] truncate pt-0.5">
                  {card.sub}
                </p>
              )}
            </div>

            <div className="w-[34px] h-[34px] sm:w-[40px] sm:h-[40px] rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#D1D5DB] dark:border-[#3F3F46] text-[#111827] dark:text-[#FAFAFA] flex items-center justify-center shrink-0 ml-2 sm:ml-3">
              <Icon size={16} className="sm:hidden" />
              <Icon size={18} className="hidden sm:block" />
            </div>
          </div>
        );
      })}
    </div>
  );
};

