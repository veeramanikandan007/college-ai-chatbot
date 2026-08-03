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
  TrendingDown,
  BarChart3,
  Activity,
} from 'lucide-react';
import type { AnalyticsOverview } from '../../api/studentAnalytics';

interface Props {
  overview: AnalyticsOverview | null;
  loading: boolean;
}

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  trend?: number;
}

const MetricCard: React.FC<MetricCardProps> = ({ icon, label, value, sub, trend }) => (
  <div className="p-6 rounded-[12px] bg-[#FFFFFF] dark:bg-[#181818] border border-[#D1D5DB] dark:border-[#3F3F46] shadow-xs flex flex-col justify-between space-y-3">
    <div className="flex items-center justify-between">
      <div className="w-10 h-10 rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA] flex items-center justify-center">
        {icon}
      </div>
      {trend !== undefined && (
        <span className="px-2 py-0.5 rounded-[6px] text-[12px] font-medium bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA] flex items-center gap-1">
          {trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {Math.abs(trend)}%
        </span>
      )}
    </div>
    <div>
      <p className="text-[32px] font-bold text-[#111827] dark:text-[#FAFAFA] tracking-tight">{value}</p>
      <p className="text-[14px] font-medium text-[#6B7280] dark:text-[#A3A3A3] mt-0.5">{label}</p>
      {sub && <p className="text-[12px] text-[#6B7280] dark:text-[#A3A3A3] mt-0.5">{sub}</p>}
    </div>
  </div>
);

const SkeletonCard: React.FC = () => (
  <div className="p-6 rounded-[12px] bg-[#FFFFFF] dark:bg-[#181818] border border-[#D1D5DB] dark:border-[#3F3F46] shadow-xs animate-pulse space-y-3">
    <div className="flex items-center justify-between">
      <div className="w-10 h-10 rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111]" />
      <div className="w-12 h-5 rounded-[6px] bg-[#F8FAFC] dark:bg-[#111111]" />
    </div>
    <div className="h-8 w-20 bg-[#F8FAFC] dark:bg-[#111111] rounded-[6px]" />
    <div className="h-4 w-28 bg-[#F8FAFC] dark:bg-[#111111] rounded-[6px]" />
  </div>
);

export const AnalyticsOverviewCards: React.FC<Props> = ({ overview, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  if (!overview) return null;

  const assignPct = overview.assignments_total > 0
    ? Math.round((overview.assignments_completed / overview.assignments_total) * 100)
    : 0;

  const cards: MetricCardProps[] = [
    {
      icon: <Clock3 size={20} />,
      label: 'Study Hours This Week',
      value: `${overview.study_hours_week}h`,
      sub: `${overview.study_hours_month}h this month`,
      trend: overview.study_hours_week >= 15 ? 8 : -5,
    },
    {
      icon: <Activity size={20} />,
      label: 'Attendance Rate',
      value: `${overview.attendance_percentage}%`,
      sub: overview.attendance_percentage >= 80 ? 'Above minimum threshold' : 'Below 80% threshold',
      trend: overview.attendance_percentage >= 80 ? 3 : -4,
    },
    {
      icon: <Brain size={20} />,
      label: 'Quiz Average Score',
      value: `${overview.quiz_average}%`,
      sub: overview.quiz_average >= 80 ? 'Performing well' : 'Needs improvement',
      trend: overview.quiz_average >= 75 ? 5 : -3,
    },
    {
      icon: <ClipboardList size={20} />,
      label: 'Assignments Completed',
      value: `${overview.assignments_completed}/${overview.assignments_total}`,
      sub: `${assignPct}% completion rate`,
      trend: assignPct >= 70 ? 10 : -8,
    },
    {
      icon: <UserRound size={20} />,
      label: 'Interview Score',
      value: overview.interview_score > 0 ? `${overview.interview_score}%` : 'Not Started',
      sub: overview.interview_score > 0 ? 'Mock interview average' : 'No interviews completed',
      trend: overview.interview_score > 0 ? 6 : undefined,
    },
    {
      icon: <FileText size={20} />,
      label: 'Documents Uploaded',
      value: `${overview.documents_uploaded}`,
      sub: 'AI document hub',
    },
    {
      icon: <Files size={20} />,
      label: 'Papers Solved',
      value: `${overview.question_papers_solved}`,
      sub: 'Previous year question papers',
    },
    {
      icon: <Briefcase size={20} />,
      label: 'Placement Readiness',
      value: `${overview.placement_readiness}%`,
      sub: overview.placement_readiness >= 70 ? 'Placement-ready' : 'Needs improvement',
      trend: overview.placement_readiness >= 60 ? 4 : -6,
    },
    {
      icon: <TrendingUp size={20} />,
      label: 'Weekly Progress',
      value: `${overview.weekly_progress}%`,
      sub: 'Composite this week',
      trend: overview.weekly_progress >= 70 ? 7 : -2,
    },
    {
      icon: <BarChart3 size={20} />,
      label: 'Monthly Progress',
      value: `${overview.monthly_progress}%`,
      sub: 'Composite this month',
      trend: overview.monthly_progress >= 70 ? 5 : -3,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {cards.map((card) => (
        <MetricCard key={card.label} {...card} />
      ))}
    </div>
  );
};
