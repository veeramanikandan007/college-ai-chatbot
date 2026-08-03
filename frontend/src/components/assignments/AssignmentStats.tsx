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
    },
    {
      id: 'pending',
      title: 'Pending Tasks',
      value: stats.pending,
      icon: Clock3,
    },
    {
      id: 'completed',
      title: 'Completed',
      value: stats.completed,
      icon: CircleCheck,
    },
    {
      id: 'overdue',
      title: 'Overdue',
      value: stats.overdue,
      icon: CircleAlert,
    },
    {
      id: 'this_week',
      title: 'Upcoming (7 Days)',
      value: stats.upcoming,
      icon: CalendarDays,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {statCards.map((card) => {
        const Icon = card.icon;
        const isActive = activeFilter === card.id;

        return (
          <div
            key={card.id}
            onClick={() => onFilterSelect(card.id)}
            className={`p-6 rounded-[12px] bg-[#FFFFFF] dark:bg-[#181818] border transition-all duration-150 cursor-pointer shadow-xs flex items-center justify-between ${
              isActive
                ? 'border-[#111827] dark:border-[#FAFAFA]'
                : 'border-[#D1D5DB] dark:border-[#3F3F46]'
            }`}
          >
            <div>
              <p className="text-[14px] font-medium text-[#6B7280] dark:text-[#A3A3A3]">{card.title}</p>
              <p className="text-[32px] font-bold text-[#111827] dark:text-[#FAFAFA] mt-1">{card.value}</p>
            </div>
            <div className="w-10 h-10 rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA] flex items-center justify-center">
              <Icon size={20} />
            </div>
          </div>
        );
      })}
    </div>
  );
};
