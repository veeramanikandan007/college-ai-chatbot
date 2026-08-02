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
          className="h-24 bg-slate-50/40 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800/60 p-1"
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
          className={`h-24 border p-1.5 flex flex-col justify-between transition-colors overflow-hidden ${
            isToday
              ? 'bg-blue-50/50 dark:bg-blue-950/20 border-[#0E2A6D] dark:border-[#60A5FA]'
              : isExamDay
              ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-400 dark:border-rose-800'
              : 'bg-white dark:bg-[#1E293B] border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-xs font-bold ${
                isToday
                  ? 'h-5 w-5 rounded-full bg-[#0E2A6D] text-white flex items-center justify-center'
                  : isExamDay
                  ? 'text-rose-600 dark:text-rose-400 font-extrabold'
                  : 'text-slate-700 dark:text-slate-300'
              }`}
            >
              {d}
            </span>

            {isExamDay && (
              <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-rose-500 text-white">
                EXAM
              </span>
            )}
          </div>

          <div className="space-y-1 overflow-y-auto max-h-14 scrollbar-none">
            {dayTasks.map((t) => (
              <div
                key={t.id}
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold truncate ${
                  t.status === 'Completed'
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 line-through'
                    : t.task_type === 'Revision'
                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                    : t.task_type === 'Assignment'
                    ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                    : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                }`}
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
    <div className="bg-white dark:bg-[#1E293B] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-[#0E2A6D]/10 text-[#0E2A6D] dark:bg-[#60A5FA]/10 dark:text-[#60A5FA]">
            <CalendarDays size={20} />
          </div>
          <div>
            <h3 className="text-base font-bold font-heading text-slate-900 dark:text-white">
              Interactive Study & Exam Calendar
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Visualizing study days, revision sessions, assignment deadlines, and exam dates
            </p>
          </div>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevMonth}
            className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 min-w-[120px] text-center">
            {monthNames[month]} {year}
          </span>
          <button
            onClick={handleNextMonth}
            className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Days of Week Header */}
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-slate-500 dark:text-slate-400 py-1 bg-slate-50 dark:bg-slate-900/60 rounded-xl">
        <span>Sun</span>
        <span>Mon</span>
        <span>Tue</span>
        <span>Wed</span>
        <span>Thu</span>
        <span>Fri</span>
        <span>Sat</span>
      </div>

      {/* Grid Cells */}
      <div className="grid grid-cols-7 gap-1 rounded-xl overflow-hidden">
        {renderCalendarCells()}
      </div>

      {/* Legend Footer */}
      <div className="pt-2 flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-slate-500">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-blue-500" />
          Study Session
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-amber-500" />
          Revision Day
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-rose-500" />
          Exam / Deadline
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-emerald-500" />
          Completed Task
        </span>
      </div>
    </div>
  );
};
