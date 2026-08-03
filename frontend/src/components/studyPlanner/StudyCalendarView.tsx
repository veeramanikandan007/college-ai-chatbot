import React, { useState } from 'react';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  CalendarRange
} from 'lucide-react';
import { StudyTask } from '../../api/studyPlanner';

interface StudyCalendarViewProps {
  tasks: StudyTask[];
  examDate?: string;
}

export const StudyCalendarView: React.FC<StudyCalendarViewProps> = ({
  tasks,
  examDate,
}) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Group tasks by YYYY-MM-DD
  const tasksByDate: Record<string, StudyTask[]> = {};
  tasks.forEach((t) => {
    const key = t.scheduled_date;
    if (!tasksByDate[key]) tasksByDate[key] = [];
    tasksByDate[key].push(t);
  });

  const renderCalendarCells = () => {
    const cells = [];

    // Empty lead cells
    for (let i = 0; i < firstDayIndex; i++) {
      cells.push(
        <div
          key={`empty-${i}`}
          className="h-28 bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] p-2"
        />
      );
    }

    // Days cells
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayTasks = tasksByDate[dateStr] || [];

      const isToday =
        d === new Date().getDate() &&
        month === new Date().getMonth() &&
        year === new Date().getFullYear();

      const isExamDay = examDate === dateStr;

      cells.push(
        <div
          key={d}
          className={`h-28 border p-2 flex flex-col justify-between transition-colors overflow-hidden ${
            isToday
              ? 'bg-[#FFFFFF] dark:bg-[#181818] border-[2px] border-[#111827] dark:border-[#FAFAFA]'
              : isExamDay
              ? 'bg-[#F8FAFC] dark:bg-[#111111] border border-[#111827] dark:border-[#FAFAFA]'
              : 'bg-[#FFFFFF] dark:bg-[#181818] border-[#D1D5DB] dark:border-[#3F3F46]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-[12px] font-bold ${
                isToday
                  ? 'h-6 w-6 rounded-full bg-[#111827] text-white dark:bg-[#FAFAFA] dark:text-[#111111] flex items-center justify-center'
                  : 'text-[#111827] dark:text-[#FAFAFA]'
              }`}
            >
              {d}
            </span>

            {isExamDay && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-[4px] bg-[#111827] text-white dark:bg-[#FAFAFA] dark:text-[#111111]">
                EXAM
              </span>
            )}
          </div>

          <div className="space-y-1 overflow-y-auto max-h-16 scrollbar-none">
            {dayTasks.map((t) => (
              <div
                key={t.id}
                className="px-2 py-1 rounded-[6px] text-[12px] font-medium bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA] truncate"
                title={`${t.subject_code}: ${t.title}`}
              >
                {t.title}
              </div>
            ))}
          </div>
        </div>
      );
    }

    return cells;
  };

  return (
    <div className="bg-[#FFFFFF] dark:bg-[#181818] p-6 rounded-[12px] border border-[#D1D5DB] dark:border-[#3F3F46] shadow-xs space-y-4">
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#F3F4F6] dark:border-[#2A2A2A]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[10px] bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] flex items-center justify-center shrink-0">
            <CalendarDays size={20} />
          </div>
          <div>
            <h3 className="text-[18px] font-bold text-[#111827] dark:text-[#FAFAFA]">
              {monthNames[month]} {year}
            </h3>
            <p className="text-[12px] text-[#6B7280] dark:text-[#A3A3A3]">
              Monthly study schedule and exam milestone roadmap
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevMonth}
            className="h-9 px-3 rounded-[8px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#181818] text-[#111827] dark:text-[#FAFAFA] hover:bg-[#F9FAFB] dark:hover:bg-[#232323] transition flex items-center gap-1 text-[14px] font-medium cursor-pointer"
          >
            <ChevronLeft size={16} />
            <span>Prev</span>
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="h-9 px-4 rounded-[8px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#181818] text-[#111827] dark:text-[#FAFAFA] hover:bg-[#F9FAFB] dark:hover:bg-[#232323] transition text-[14px] font-medium cursor-pointer"
          >
            Today
          </button>
          <button
            onClick={handleNextMonth}
            className="h-9 px-3 rounded-[8px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#181818] text-[#111827] dark:text-[#FAFAFA] hover:bg-[#F9FAFB] dark:hover:bg-[#232323] transition flex items-center gap-1 text-[14px] font-medium cursor-pointer"
          >
            <span>Next</span>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Days Grid Header */}
      <div className="grid grid-cols-7 gap-1 text-center font-bold text-[12px] text-[#6B7280] dark:text-[#A3A3A3] py-2 border-b border-[#F3F4F6] dark:border-[#2A2A2A]">
        <div>SUN</div>
        <div>MON</div>
        <div>TUE</div>
        <div>WED</div>
        <div>THU</div>
        <div>FRI</div>
        <div>SAT</div>
      </div>

      {/* Grid Cells */}
      <div className="grid grid-cols-7 gap-1.5">
        {renderCalendarCells()}
      </div>
    </div>
  );
};
