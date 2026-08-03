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
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 select-none">
      {statCards.map((card) => {
        const Icon = card.icon;
        const isActive = activeFilter === card.id;

        return (
          <div
            key={card.id}
            onClick={() => onFilterSelect(card.id)}
            className={`h-[88px] p-3.5 sm:p-[16px] rounded-[16px] bg-[#FFFFFF] dark:bg-[#18181B] border shadow-xs flex items-center justify-between transition-all duration-150 ease-in-out hover:-translate-y-[2px] hover:shadow-md cursor-pointer ${
              isActive
                ? 'border-[#111827] dark:border-[#FAFAFA] ring-1 ring-[#111827] dark:ring-[#FAFAFA]'
                : 'border-[#D1D5DB] dark:border-[#3F3F46]'
            }`}
          >
            <div className="min-w-0 flex-1 space-y-0.5">
              <p className="text-[14px] sm:text-[15px] font-[400] text-[#6B7280] dark:text-[#A1A1AA] truncate">{card.title}</p>
              <p className="text-[26px] sm:text-[30px] font-[600] text-[#111827] dark:text-[#FAFAFA] leading-none truncate">{card.value}</p>
              <p className="text-[12px] sm:text-[14px] font-[400] text-[#6B7280] dark:text-[#A1A1AA] truncate pt-0.5">{card.subtext}</p>
            </div>
            <div className="w-[34px] h-[34px] sm:w-[40px] sm:h-[40px] rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#D1D5DB] dark:border-[#3F3F46] text-[#111827] dark:text-[#FAFAFA] flex items-center justify-center shrink-0 ml-2">
              <Icon size={18} />
            </div>
          </div>
        );
      })}
    </div>
  );
};
