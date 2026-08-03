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
    <div className="p-6 rounded-[16px] bg-[#111111] border border-[#2D2D2D] flex flex-col gap-4 shadow-[0_2px_8px_rgba(0,0,0,0.05)] hover:-translate-y-[2px] transition-transform duration-200">
      <div className="flex items-center justify-between">
        <span className="px-2.5 py-1 rounded-[6px] text-[10px] font-bold uppercase tracking-wider bg-[#2D2D2D] text-[#FFFFFF] flex items-center gap-1.5 w-fit">
          <div className="w-1.5 h-1.5 rounded-full bg-[#FFFFFF] animate-pulse" />
          LIVE
        </span>
        <span className="text-[14px] font-bold text-[#FFFFFF]">
          {item.start_time} - {item.end_time}
        </span>
      </div>

      <div className="space-y-1">
        <h3 className="font-bold text-[24px] text-[#FFFFFF] flex items-center gap-2">
          <BookOpen size={24} className="text-[#FFFFFF]" /> {item.subject_name}
        </h3>
        <div className="flex items-center gap-4 text-[14px] font-medium text-[#A3A3A3]">
          <span>Room: <strong className="text-[#FFFFFF]">{item.classroom}</strong></span>
          <span>Faculty: <strong className="text-[#FFFFFF]">{item.faculty_name}</strong></span>
        </div>
      </div>

      <div className="pt-2 space-y-2">
        <div className="flex justify-between items-end text-[14px] font-bold text-[#FFFFFF]">
          <span>Remaining Time:</span>
          <span>{remainingTimeText}</span>
        </div>
        <div className="w-full h-2 rounded-full bg-[#2D2D2D] overflow-hidden">
          <div 
            className="h-full bg-[#FFFFFF] rounded-full transition-all duration-1000 ease-in-out" 
            style={{ width: `${progress}%` }} 
          />
        </div>
      </div>
    </div>
  );
}
