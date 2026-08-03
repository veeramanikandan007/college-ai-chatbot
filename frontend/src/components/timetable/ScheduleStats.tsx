import React from 'react';
import { BookOpen, Clock3, UserCheck, TrendingUp } from 'lucide-react';

interface StatsProps {
  stats: {
    total_classes: number;
    total_hours: number;
    theory_count: number;
    lab_count: number;
    free_periods: number;
  };
}

export default function ScheduleStats({ stats }: StatsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="p-6 rounded-[16px] bg-[#FFFFFF] dark:bg-[#181818] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-sm flex flex-col gap-2 hover:-translate-y-[2px] transition-transform duration-200">
        <div className="flex items-center gap-2 text-[#6B7280] dark:text-[#A3A3A3]">
          <BookOpen size={16} />
          <span className="text-[12px] font-bold uppercase tracking-wider">Today's Classes</span>
        </div>
        <div className="flex items-end gap-3">
          <span className="text-[32px] font-bold text-[#111827] dark:text-[#FAFAFA] leading-none">
            {stats.total_classes}
          </span>
          <span className="text-[12px] font-medium text-[#16A34A] flex items-center gap-0.5 pb-1">
            <TrendingUp size={12} /> +1 vs yesterday
          </span>
        </div>
      </div>

      <div className="p-6 rounded-[16px] bg-[#FFFFFF] dark:bg-[#181818] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-sm flex flex-col gap-2 hover:-translate-y-[2px] transition-transform duration-200">
        <div className="flex items-center gap-2 text-[#6B7280] dark:text-[#A3A3A3]">
          <Clock3 size={16} />
          <span className="text-[12px] font-bold uppercase tracking-wider">Learning Time</span>
        </div>
        <div className="flex items-end gap-3">
          <span className="text-[32px] font-bold text-[#111827] dark:text-[#FAFAFA] leading-none">
            {stats.total_hours}h
          </span>
          <span className="text-[12px] font-medium text-[#6B7280] dark:text-[#A3A3A3] pb-1">
            83% of day
          </span>
        </div>
      </div>

      <div className="p-6 rounded-[16px] bg-[#FFFFFF] dark:bg-[#181818] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-sm flex flex-col gap-2 hover:-translate-y-[2px] transition-transform duration-200">
        <div className="flex items-center gap-2 text-[#6B7280] dark:text-[#A3A3A3]">
          <UserCheck size={16} />
          <span className="text-[12px] font-bold uppercase tracking-wider">Attendance Today</span>
        </div>
        <div className="flex items-end gap-3">
          <span className="text-[32px] font-bold text-[#111827] dark:text-[#FAFAFA] leading-none">
            75%
          </span>
          <span className="text-[12px] font-medium text-[#16A34A] pb-1">
            Looking good
          </span>
        </div>
      </div>

      <div className="p-6 rounded-[16px] bg-[#FFFFFF] dark:bg-[#181818] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-sm flex flex-col gap-2 hover:-translate-y-[2px] transition-transform duration-200">
        <div className="flex items-center gap-2 text-[#6B7280] dark:text-[#A3A3A3]">
          <BookOpen size={16} />
          <span className="text-[12px] font-bold uppercase tracking-wider">Session Types</span>
        </div>
        <div className="flex flex-col justify-end h-full gap-1 pt-1">
          <div className="flex justify-between items-center text-[12px]">
            <span className="text-[#6B7280] dark:text-[#A3A3A3]">Theory</span>
            <span className="font-bold text-[#111827] dark:text-[#FAFAFA]">{stats.theory_count}</span>
          </div>
          <div className="flex justify-between items-center text-[12px]">
            <span className="text-[#6B7280] dark:text-[#A3A3A3]">Labs</span>
            <span className="font-bold text-[#111827] dark:text-[#FAFAFA]">{stats.lab_count}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
