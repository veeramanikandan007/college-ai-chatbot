import React from 'react';
import { motion } from 'framer-motion';
import { Check, Clock, ChevronRight } from 'lucide-react';
import { TimetableItem } from './types';

interface TimelineProps {
  entries: TimetableItem[];
}

export default function TimetableTimeline({ entries }: TimelineProps) {
  if (entries.length === 0) {
    return (
      <div className="py-12 text-center text-[#6B7280] dark:text-[#A3A3A3]">
        No classes found matching your criteria.
      </div>
    );
  }

  return (
    <div className="relative pl-6">
      <div className="absolute top-0 bottom-0 left-[27px] w-px bg-[#E5E7EB] dark:bg-[#2A2A2A]" />
      
      <div className="space-y-8">
        {entries.map((item, idx) => {
          const isOngoing = item.status === 'Ongoing';
          const isCompleted = item.status === 'Completed';
          const isUpcoming = item.status === 'Upcoming' || !item.status;

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="relative group"
            >
              <div className="absolute -left-6 top-5 flex items-center justify-center">
                {isOngoing ? (
                  <div className="w-5 h-5 rounded-full bg-[#111111] dark:bg-[#FAFAFA] text-white dark:text-black flex items-center justify-center z-10 shadow-[0_0_0_4px_#FFFFFF] dark:shadow-[0_0_0_4px_#0A0A0A]">
                    <div className="w-2 h-2 rounded-full bg-white dark:bg-black animate-pulse" />
                  </div>
                ) : isCompleted ? (
                  <div className="w-5 h-5 rounded-full bg-[#9CA3AF] dark:bg-[#4B5563] text-white flex items-center justify-center z-10 shadow-[0_0_0_4px_#FFFFFF] dark:shadow-[0_0_0_4px_#0A0A0A]">
                    <Check size={12} strokeWidth={3} />
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-full bg-[#FFFFFF] dark:bg-[#181818] border-2 border-[#D1D5DB] dark:border-[#3F3F46] flex items-center justify-center z-10 shadow-[0_0_0_4px_#FFFFFF] dark:shadow-[0_0_0_4px_#0A0A0A]" />
                )}
              </div>

              <div className={`ml-8 flex flex-col md:flex-row gap-6 p-5 rounded-[16px] transition-all duration-200 border ${
                isOngoing
                  ? 'bg-[#F8F9FA] dark:bg-[#111111] border-[#E5E7EB] dark:border-[#2A2A2A] shadow-sm'
                  : 'bg-[#FFFFFF] dark:bg-[#181818] border-transparent group-hover:border-[#E5E7EB] dark:group-hover:border-[#2A2A2A] hover:shadow-[0_2px_8px_rgba(0,0,0,0.05)]'
              }`}>
                
                {/* Time Anchor */}
                <div className="w-24 shrink-0 flex flex-col pt-0.5">
                  <span className={`text-[16px] font-bold ${
                    isCompleted ? 'text-[#9CA3AF]' : 'text-[#111827] dark:text-[#FAFAFA]'
                  }`}>
                    {item.start_time}
                  </span>
                  <span className="text-[12px] text-[#6B7280] dark:text-[#A3A3A3] font-medium">
                    {item.end_time}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 rounded-[6px] text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                      isOngoing ? 'bg-[#2D2D2D] text-white' :
                      isCompleted ? 'bg-[#F3F4F6] dark:bg-[#2A2A2A] text-[#6B7280]' :
                      'bg-[#F3F4F6] dark:bg-[#2D2D2D] text-[#111111] dark:text-[#FAFAFA]'
                    }`}>
                      {isOngoing && <><div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> LIVE</>}
                      {isCompleted && 'COMPLETED'}
                      {isUpcoming && 'UPCOMING'}
                    </span>
                    <span className="text-[12px] font-medium text-[#6B7280] dark:text-[#A3A3A3] bg-[#F9FAFB] dark:bg-[#111111] px-2 py-0.5 rounded-[6px]">
                      {item.subject_type}
                    </span>
                  </div>

                  <h4 className={`text-[18px] font-bold ${
                    isCompleted ? 'text-[#6B7280] dark:text-[#A3A3A3] line-through decoration-[#9CA3AF]/30' : 'text-[#111827] dark:text-[#FAFAFA]'
                  }`}>
                    {item.subject_name}
                  </h4>

                  <div className={`flex flex-wrap items-center gap-4 text-[14px] ${
                    isCompleted ? 'text-[#9CA3AF]' : 'text-[#6B7280] dark:text-[#A3A3A3]'
                  }`}>
                    <span className="flex items-center gap-1">Room: <strong className={isCompleted ? '' : 'text-[#111827] dark:text-[#FAFAFA]'}>{item.classroom}</strong></span>
                    <span className="flex items-center gap-1">Prof: <strong className={isCompleted ? '' : 'text-[#111827] dark:text-[#FAFAFA]'}>{item.faculty_name}</strong></span>
                  </div>
                </div>

                {/* Actions */}
                <div className="shrink-0 flex items-center justify-end">
                  {!isCompleted && (
                    <button className="h-10 px-4 rounded-[8px] bg-transparent hover:bg-[#F3F4F6] dark:hover:bg-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA] text-[14px] font-medium transition-colors flex items-center gap-1">
                      Details <ChevronRight size={16} />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
