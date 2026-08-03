import React, { useState, useEffect } from 'react';
import { Timer } from 'lucide-react';
import { TimetableItem } from './types';

interface Props {
  item: TimetableItem;
}

export default function NextClassCard({ item }: Props) {
  const [startsInText, setStartsInText] = useState('');

  useEffect(() => {
    const calculateCountdown = () => {
      const now = new Date();
      const start = parseTimeString(item.start_time);

      if (!start) return;

      const remainingMs = start.getTime() - now.getTime();
      
      if (remainingMs <= 0) {
        setStartsInText('Starting now');
      } else {
        const mins = Math.ceil(remainingMs / 60000);
        if (mins > 60) {
          const hrs = Math.floor(mins / 60);
          const remMins = mins % 60;
          setStartsInText(`${hrs}h ${remMins}m`);
        } else {
          setStartsInText(`${mins} minutes`);
        }
      }
    };

    calculateCountdown();
    const interval = setInterval(calculateCountdown, 60000);
    return () => clearInterval(interval);
  }, [item]);

  const parseTimeString = (timeStr: string) => {
    const [time, modifier] = timeStr.split(' ');
    if (!time || !modifier) return null;
    let [hours, minutes] = time.split(':').map(Number);
    if (modifier.toLowerCase() === 'pm' && hours < 12) hours += 12;
    if (modifier.toLowerCase() === 'am' && hours === 12) hours = 0;
    
    const d = new Date();
    d.setHours(hours, minutes, 0, 0);
    return d;
  };

  return (
    <div className="p-6 rounded-[16px] bg-[#FFFFFF] dark:bg-[#181818] border border-[#D1D5DB] dark:border-[#3F3F46] flex flex-col justify-between gap-4 shadow-sm hover:-translate-y-[2px] transition-transform duration-200">
      <div className="space-y-3">
        <span className="text-[12px] font-bold uppercase tracking-wider text-[#6B7280] dark:text-[#A3A3A3] flex items-center gap-1">
          <Timer size={14} /> NEXT CLASS
        </span>
        <h3 className="font-bold text-[20px] text-[#111827] dark:text-[#FAFAFA] leading-tight">
          {item.subject_name}
        </h3>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between text-[14px]">
          <span className="text-[#6B7280] dark:text-[#A3A3A3]">Starts in:</span>
          <span className="font-bold text-[#111827] dark:text-[#FAFAFA]">{startsInText}</span>
        </div>
        
        <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-[12px] pt-3 border-t border-[#E5E7EB] dark:border-[#2A2A2A]">
          <div className="flex flex-col gap-0.5">
            <span className="text-[#6B7280] dark:text-[#A3A3A3]">Time</span>
            <span className="font-bold text-[#111827] dark:text-[#FAFAFA]">{item.start_time} - {item.end_time}</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[#6B7280] dark:text-[#A3A3A3]">Room</span>
            <span className="font-bold text-[#111827] dark:text-[#FAFAFA]">{item.classroom}</span>
          </div>
          <div className="flex flex-col gap-0.5 col-span-2">
            <span className="text-[#6B7280] dark:text-[#A3A3A3]">Faculty</span>
            <span className="font-bold text-[#111827] dark:text-[#FAFAFA]">{item.faculty_name}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
