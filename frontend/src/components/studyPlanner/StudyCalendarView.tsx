import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock3, BookOpen } from 'lucide-react';
import { StudyTask } from '../../api/studyPlanner';

interface StudyCalendarViewProps {
  tasks: StudyTask[];
  examDate?: string;
}

export const StudyCalendarView: React.FC<StudyCalendarViewProps> = ({ tasks, examDate }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Group tasks by date format YYYY-MM-DD
  const tasksByDate: { [key: string]: StudyTask[] } = {};
  tasks.forEach((t) => {
    if (t.scheduled_date) {
      if (!tasksByDate[t.scheduled_date]) {
        tasksByDate[t.scheduled_date] = [];
      }
      tasksByDate[t.scheduled_date].push(t);
    }
  });

  return (
    <div className="rounded-[16px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#18181B] p-6 shadow-xs space-y-6 select-none">
      {/* Calendar Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#D1D5DB] dark:border-[#3F3F46]">
        <div className="flex items-center gap-3">
          <div className="w-[40px] h-[40px] rounded-[12px] bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] flex items-center justify-center shrink-0">
            <CalendarIcon size={20} />
          </div>
          <div>
            <h3 className="text-[20px] font-[600] text-[#111827] dark:text-[#FAFAFA]">
              {monthNames[month]} {year}
            </h3>
            <p className="text-[14px] font-[400] text-[#6B7280] dark:text-[#A1A1AA]">
              {tasks.length} study sessions scheduled
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevMonth}
            className="h-[36px] px-3 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#18181B] text-[#111827] dark:text-[#FAFAFA] hover:bg-[#F8FAFC] dark:hover:bg-[#232323] transition flex items-center gap-1 cursor-pointer"
          >
            <ChevronLeft size={16} />
            <span>Prev</span>
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="h-[36px] px-3.5 rounded-[10px] bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] text-[14px] font-[500] cursor-pointer"
          >
            Today
          </button>
          <button
            onClick={handleNextMonth}
            className="h-[36px] px-3 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#18181B] text-[#111827] dark:text-[#FAFAFA] hover:bg-[#F8FAFC] dark:hover:bg-[#232323] transition flex items-center gap-1 cursor-pointer"
          >
            <span>Next</span>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Desktop Monthly Data Grid */}
      <div className="hidden md:block">
        <div className="grid grid-cols-7 gap-px bg-[#D1D5DB] dark:bg-[#3F3F46] rounded-[12px] overflow-hidden border border-[#D1D5DB] dark:border-[#3F3F46]">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div key={d} className="bg-[#F8FAFC] dark:bg-[#111111] p-3 text-center text-[14px] font-[500] text-[#6B7280] dark:text-[#A1A1AA] uppercase tracking-wider">
              {d}
            </div>
          ))}

          {/* Empty Pre-padding cells */}
          {Array.from({ length: firstDayIndex }).map((_, i) => (
            <div key={`empty-${i}`} className="bg-[#FFFFFF] dark:bg-[#18181B] min-h-[100px] p-2 opacity-30" />
          ))}

          {/* Days cells */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const dayTasks = tasksByDate[dateStr] || [];
            const isToday = new Date().toISOString().split('T')[0] === dateStr;

            return (
              <div
                key={dayNum}
                className={`min-h-[110px] p-2 flex flex-col justify-between transition-colors ${
                  isToday
                    ? 'bg-[#F8FAFC] dark:bg-[#111111] font-[600]'
                    : 'bg-[#FFFFFF] dark:bg-[#18181B] hover:bg-[#F8FAFC]/50 dark:hover:bg-[#232323]/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[14px] font-[500] ${isToday ? 'h-6 w-6 rounded-full bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] flex items-center justify-center' : 'text-[#111827] dark:text-[#FAFAFA]'}`}>
                    {dayNum}
                  </span>
                  {dayTasks.length > 0 && (
                    <span className="text-[11px] font-[500] text-[#6B7280] dark:text-[#A1A1AA]">
                      {dayTasks.length} tasks
                    </span>
                  )}
                </div>

                <div className="space-y-1 mt-1 overflow-y-auto max-h-[70px] no-scrollbar">
                  {dayTasks.slice(0, 2).map((t) => (
                    <div
                      key={t.id}
                      className="p-1 px-1.5 rounded-[6px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#18181B] text-[11px] font-[500] text-[#111827] dark:text-[#FAFAFA] truncate"
                    >
                      {t.title}
                    </div>
                  ))}
                  {dayTasks.length > 2 && (
                    <div className="text-[10px] text-[#6B7280] dark:text-[#A1A1AA] text-center font-[500]">
                      +{dayTasks.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile Compact Timeline View */}
      <div className="md:hidden space-y-3">
        <h4 className="text-[16px] font-[600] text-[#111827] dark:text-[#FAFAFA]">Upcoming Timeline</h4>
        {tasks.length > 0 ? (
          tasks.slice(0, 5).map((t) => (
            <div key={t.id} className="p-4 rounded-[12px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#18181B] flex items-center justify-between gap-3">
              <div className="space-y-1 min-w-0">
                <span className="h-[20px] inline-flex items-center rounded-full border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#F8FAFC] dark:bg-[#111111] px-2 text-[11px] font-[500] text-[#111827] dark:text-[#FAFAFA]">
                  {t.subject_code}
                </span>
                <h5 className="text-[14px] font-[500] text-[#111827] dark:text-[#FAFAFA] truncate">{t.title}</h5>
                <p className="text-[12px] text-[#6B7280] dark:text-[#A1A1AA]">{t.scheduled_date} • {t.duration_minutes} mins</p>
              </div>
            </div>
          ))
        ) : (
          <div className="p-4 text-center text-[14px] text-[#6B7280] dark:text-[#A1A1AA]">No tasks scheduled for this month.</div>
        )}
      </div>
    </div>
  );
};
