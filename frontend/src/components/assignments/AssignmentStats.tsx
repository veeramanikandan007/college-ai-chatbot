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
      subtext: 'All tracked tasks',
      icon: ClipboardList,
    },
    {
      id: 'pending',
      title: 'Pending Tasks',
      value: stats.pending,
      subtext: 'Requires submission',
      icon: Clock3,
    },
    {
      id: 'completed',
      title: 'Completed',
      value: stats.completed,
      subtext: 'Submitted & graded',
      icon: CircleCheck,
    },
    {
      id: 'overdue',
      title: 'Overdue',
      value: stats.overdue,
      subtext: 'Passed deadline',
      icon: CircleAlert,
    },
    {
      id: 'this_week',
      title: 'Upcoming (7 Days)',
      value: stats.upcoming,
      subtext: 'Due this week',
      icon: CalendarDays,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-6 select-none">
      {statCards.map((card) => {
        const Icon = card.icon;
        const isActive = activeFilter === card.id;

        return (
          <div
            key={card.id}
            onClick={() => onFilterSelect(card.id)}
            className={`p-6 rounded-[16px] bg-[#FFFFFF] dark:bg-[#18181B] border shadow-xs flex items-center justify-between transition-all duration-150 ease-in-out hover:-translate-y-[2px] hover:shadow-md cursor-pointer ${
              isActive
                ? 'border-[#111827] dark:border-[#FAFAFA] ring-1 ring-[#111827] dark:ring-[#FAFAFA]'
                : 'border-[#E5E7EB] dark:border-[#2A2A2A]'
            }`}
          >
            <div className="min-w-0 flex-1 space-y-1">
              <p className="text-[14px] font-normal text-[#6B7280] dark:text-[#A1A1AA] truncate">{card.title}</p>
              <p className="text-[28px] font-semibold text-[#111827] dark:text-[#FAFAFA] leading-tight truncate">{card.value}</p>
              <p className="text-[12px] font-normal text-[#6B7280] dark:text-[#A1A1AA] truncate">{card.subtext}</p>
            </div>
            <div className="w-10 h-10 rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA] flex items-center justify-center shrink-0 ml-3">
              <Icon size={20} />
            </div>
          </div>
        );
      })}
    </div>
  );
};
