import React from 'react';
import { ClipboardList, Clock3, CircleCheck, CircleAlert, CalendarDays } from 'lucide-react';
import { AssignmentStatsData } from '../../api/assignments';

interface AssignmentStatsProps {
  stats: AssignmentStatsData;
  activeFilter: string;
  onFilterSelect: (filter: string) => void;
}

export const AssignmentStats: React.FC<AssignmentStatsProps> = ({
  stats,
  activeFilter,
  onFilterSelect,
}) => {
  const statCards = [
    {
      id: 'all',
      title: 'Total Assignments',
      value: stats.total,
      icon: ClipboardList,
      color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900/50',
      activeBorder: 'border-blue-600 dark:border-blue-400 ring-2 ring-blue-500/20',
    },
    {
      id: 'pending',
      title: 'Pending Tasks',
      value: stats.pending,
      icon: Clock3,
      color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/50',
      activeBorder: 'border-amber-600 dark:border-amber-400 ring-2 ring-amber-500/20',
    },
    {
      id: 'completed',
      title: 'Completed',
      value: stats.completed,
      icon: CircleCheck,
      color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50',
      activeBorder: 'border-emerald-600 dark:border-emerald-400 ring-2 ring-emerald-500/20',
    },
    {
      id: 'overdue',
      title: 'Overdue',
      value: stats.overdue,
      icon: CircleAlert,
      color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/50',
      activeBorder: 'border-rose-600 dark:border-rose-400 ring-2 ring-rose-500/20',
    },
    {
      id: 'this_week',
      title: 'Upcoming (7 Days)',
      value: stats.upcoming,
      icon: CalendarDays,
      color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900/50',
      activeBorder: 'border-indigo-600 dark:border-indigo-400 ring-2 ring-indigo-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
      {statCards.map((card) => {
        const Icon = card.icon;
        const isActive = activeFilter === card.id;

        return (
          <div
            key={card.id}
            onClick={() => onFilterSelect(card.id)}
            className={`p-4 rounded-xl bg-white dark:bg-[#1E293B] border transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md ${
              card.color.split(' ').slice(2).join(' ')
            } ${isActive ? card.activeBorder : 'border-slate-200 dark:border-slate-800'}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {card.title}
              </span>
              <div className={`p-2 rounded-lg ${card.color.split(' ').slice(0, 2).join(' ')}`}>
                <Icon size={18} />
              </div>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-bold font-heading text-slate-900 dark:text-white">
                {card.value}
              </span>
              {card.id === 'overdue' && card.value > 0 && (
                <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
                  Action Required
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
