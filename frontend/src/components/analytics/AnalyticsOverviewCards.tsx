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
  color: string;
  bg: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ icon, label, value, sub, trend, color, bg }) => (
  <div className="group relative bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
    <div className="flex items-start justify-between mb-3">
      <div className={`p-2.5 rounded-xl ${bg}`}>
        <div className={color}>{icon}</div>
      </div>
      {trend !== undefined && (
        <span
          className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
            trend >= 0
              ? 'text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/30'
              : 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/30'
          }`}
        >
          {trend >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
          {Math.abs(trend)}%
        </span>
      )}
    </div>
    <p className="text-2xl font-bold font-heading text-slate-900 dark:text-white tracking-tight">{value}</p>
    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">{label}</p>
    {sub && <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{sub}</p>}
  </div>
);

const SkeletonCard: React.FC = () => (
  <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 animate-pulse">
    <div className="flex items-start justify-between mb-3">
      <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-700" />
      <div className="h-6 w-12 rounded-full bg-slate-100 dark:bg-slate-700" />
    </div>
    <div className="h-7 w-20 rounded bg-slate-100 dark:bg-slate-700 mb-1" />
    <div className="h-3 w-28 rounded bg-slate-100 dark:bg-slate-700" />
  </div>
);

export const AnalyticsOverviewCards: React.FC<Props> = ({ overview, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
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
      icon: <Clock3 size={18} />,
      label: 'Study Hours This Week',
      value: `${overview.study_hours_week}h`,
      sub: `${overview.study_hours_month}h this month`,
      trend: overview.study_hours_week >= 15 ? 8 : -5,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-900/30',
    },
    {
      icon: <Activity size={18} />,
      label: 'Attendance Rate',
      value: `${overview.attendance_percentage}%`,
      sub: overview.attendance_percentage >= 80 ? 'Above minimum threshold' : 'Below 80% threshold',
      trend: overview.attendance_percentage >= 80 ? 3 : -4,
      color: overview.attendance_percentage >= 80 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500',
      bg: overview.attendance_percentage >= 80 ? 'bg-emerald-50 dark:bg-emerald-900/30' : 'bg-red-50 dark:bg-red-900/30',
    },
    {
      icon: <Brain size={18} />,
      label: 'Quiz Average Score',
      value: `${overview.quiz_average}%`,
      sub: overview.quiz_average >= 80 ? 'Performing well' : 'Needs improvement',
      trend: overview.quiz_average >= 75 ? 5 : -3,
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-50 dark:bg-purple-900/30',
    },
    {
      icon: <ClipboardList size={18} />,
      label: 'Assignments Completed',
      value: `${overview.assignments_completed}/${overview.assignments_total}`,
      sub: `${assignPct}% completion rate`,
      trend: assignPct >= 70 ? 10 : -8,
      color: 'text-indigo-600 dark:text-indigo-400',
      bg: 'bg-indigo-50 dark:bg-indigo-900/30',
    },
    {
      icon: <UserRound size={18} />,
      label: 'Interview Score',
      value: overview.interview_score > 0 ? `${overview.interview_score}%` : 'Not Started',
      sub: overview.interview_score > 0 ? 'Mock interview average' : 'No interviews completed',
      trend: overview.interview_score > 0 ? 6 : undefined,
      color: 'text-cyan-600 dark:text-cyan-400',
      bg: 'bg-cyan-50 dark:bg-cyan-900/30',
    },
    {
      icon: <FileText size={18} />,
      label: 'Documents Uploaded',
      value: `${overview.documents_uploaded}`,
      sub: 'AI document hub',
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-900/30',
    },
    {
      icon: <Files size={18} />,
      label: 'Papers Solved',
      value: `${overview.question_papers_solved}`,
      sub: 'Previous year question papers',
      color: 'text-orange-600 dark:text-orange-400',
      bg: 'bg-orange-50 dark:bg-orange-900/30',
    },
    {
      icon: <Briefcase size={18} />,
      label: 'Placement Readiness',
      value: `${overview.placement_readiness}%`,
      sub: overview.placement_readiness >= 70 ? 'Placement-ready' : 'Needs improvement',
      trend: overview.placement_readiness >= 60 ? 4 : -6,
      color: 'text-[#D9A441]',
      bg: 'bg-amber-50 dark:bg-amber-900/30',
    },
    {
      icon: <TrendingUp size={18} />,
      label: 'Weekly Progress',
      value: `${overview.weekly_progress}%`,
      sub: 'Composite this week',
      trend: overview.weekly_progress >= 70 ? 7 : -2,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-900/30',
    },
    {
      icon: <BarChart3 size={18} />,
      label: 'Monthly Progress',
      value: `${overview.monthly_progress}%`,
      sub: 'Composite this month',
      trend: overview.monthly_progress >= 70 ? 5 : -3,
      color: 'text-[#0E2A6D] dark:text-[#60A5FA]',
      bg: 'bg-blue-50 dark:bg-blue-900/30',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {cards.map((card) => (
        <MetricCard key={card.label} {...card} />
      ))}
    </div>
  );
};
