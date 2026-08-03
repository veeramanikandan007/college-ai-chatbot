import React, { useState, useEffect } from 'react';
import { BookOpen } from 'lucide-react';
import { TimetableItem } from './types';

interface Props {
  item: TimetableItem;
}

export default function CurrentClassCard({ item }: Props) {
  const [progress, setProgress] = useState(0);
  const [remainingTimeText, setRemainingTimeText] = useState('');

  useEffect(() => {
    const calculateProgress = () => {
      const now = new Date();
      const start = parseTimeString(item.start_time);
      const end = parseTimeString(item.end_time);

      if (!start || !end) return;

      const totalMs = end.getTime() - start.getTime();
      const elapsedMs = now.getTime() - start.getTime();
      const remainingMs = end.getTime() - now.getTime();

      if (elapsedMs < 0) {
        setProgress(0);
        setRemainingTimeText(`Starting in ${Math.ceil(Math.abs(elapsedMs) / 60000)} mins`);
      } else if (remainingMs < 0) {
        setProgress(100);
        setRemainingTimeText('Completed');
      } else {
        const p = (elapsedMs / totalMs) * 100;
        setProgress(Math.min(100, Math.max(0, p)));
        setRemainingTimeText(`${Math.ceil(remainingMs / 60000)} minutes`);
      }
    };

    calculateProgress();
    const interval = setInterval(calculateProgress, 60000); // update every minute
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
    <div className="p-6 rounded-[16px] bg-[#16A34A]/10 border-2 border-[#16A34A] flex flex-col gap-4 shadow-sm hover:-translate-y-[2px] transition-transform duration-200">
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-bold uppercase tracking-wider text-[#16A34A] flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
          CURRENT CLASS
        </span>
        <span className="text-[14px] font-bold text-[#111827] dark:text-[#FAFAFA]">
          {item.start_time} - {item.end_time}
        </span>
      </div>

      <div className="space-y-1">
        <h3 className="font-bold text-[24px] text-[#111827] dark:text-[#FAFAFA] flex items-center gap-2">
          <BookOpen size={24} className="text-[#16A34A]" /> {item.subject_name}
        </h3>
        <div className="flex items-center gap-4 text-[14px] font-medium text-[#6B7280] dark:text-[#A3A3A3]">
          <span>Room: <strong className="text-[#111827] dark:text-[#FAFAFA]">{item.classroom}</strong></span>
          <span>Faculty: <strong className="text-[#111827] dark:text-[#FAFAFA]">{item.faculty_name}</strong></span>
        </div>
      </div>

      <div className="pt-2 space-y-2">
        <div className="flex justify-between items-end text-[14px] font-bold text-[#111827] dark:text-[#FAFAFA]">
          <span>Remaining Time:</span>
          <span>{remainingTimeText}</span>
        </div>
        <div className="w-full h-2 rounded-full bg-[#16A34A]/20 overflow-hidden">
          <div 
            className="h-full bg-[#16A34A] rounded-full transition-all duration-1000 ease-in-out" 
            style={{ width: `${progress}%` }} 
          />
        </div>
      </div>
    </div>
  );
}
