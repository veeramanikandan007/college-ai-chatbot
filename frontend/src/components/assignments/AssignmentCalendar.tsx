import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, CalendarDays, BookOpen, Clock3, CircleCheck, CircleAlert } from 'lucide-react';
import { Assignment } from '../../api/assignments';

interface AssignmentCalendarProps {
  assignments: Assignment[];
  onSelectAssignment: (assignment: Assignment) => void;
}

export const AssignmentCalendar: React.FC<AssignmentCalendarProps> = ({
  assignments,
  onSelectAssignment,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Calculate calendar days matrix
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const handleToday = () => setCurrentDate(new Date());

  // Group assignments by YYYY-MM-DD
  const assignmentsByDate: Record<string, Assignment[]> = {};
  assignments.forEach((item) => {
    const d = new Date(item.due_date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    if (!assignmentsByDate[key]) assignmentsByDate[key] = [];
    assignmentsByDate[key].push(item);
  });

  const todayStr = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`;

  const renderCells = () => {
    const totalSlots = Math.ceil((firstDayOfMonth + daysInMonth) / 7) * 7;
    const slots = [];

    for (let i = 0; i < totalSlots; i++) {
      const dayNum = i - firstDayOfMonth + 1;
      const isCurrentMonthDay = dayNum > 0 && dayNum <= daysInMonth;

      if (!isCurrentMonthDay) {
        slots.push(
          <div key={`empty-${i}`} className="min-h-[90px] p-2 bg-slate-50/50 dark:bg-slate-900/20 border border-slate-100 dark:border-slate-800/50 text-slate-300 dark:text-slate-700" />
        );
        continue;
      }

      const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      const dayAssignments = assignmentsByDate[dateKey] || [];
      const isToday = dateKey === todayStr;

      slots.push(
        <div
          key={`day-${dayNum}`}
          className={`min-h-[90px] p-2 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 transition-colors flex flex-col justify-between ${
            isToday ? 'ring-2 ring-[#0E2A6D] dark:ring-[#60A5FA] bg-blue-50/20 dark:bg-blue-950/20' : ''
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                isToday
                  ? 'bg-[#0E2A6D] text-white dark:bg-[#60A5FA] dark:text-slate-950'
                  : 'text-slate-700 dark:text-slate-300'
              }`}
            >
              {dayNum}
            </span>
            {dayAssignments.length > 0 && (
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                {dayAssignments.length} due
              </span>
            )}
          </div>

          <div className="mt-1 space-y-1 overflow-y-auto max-h-[60px]">
            {dayAssignments.map((assg) => {
              const isCompleted = assg.status === 'Completed';
              const isOverdue = assg.status === 'Overdue';

              const badgeColor = isCompleted
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800'
                : isOverdue
                ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-300 dark:border-rose-800'
                : 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800';

              return (
                <div
                  key={assg.id}
                  onClick={() => onSelectAssignment(assg)}
                  className={`px-1.5 py-0.5 rounded-md border text-[11px] font-semibold truncate cursor-pointer transition-all hover:scale-102 flex items-center gap-1 ${badgeColor}`}
                  title={`${assg.title} (${assg.subject}) - Due ${assg.status}`}
                >
                  {isCompleted ? (
                    <CircleCheck size={11} className="shrink-0" />
                  ) : isOverdue ? (
                    <CircleAlert size={11} className="shrink-0" />
                  ) : (
                    <Clock3 size={11} className="shrink-0" />
                  )}
                  <span className="truncate">{assg.title}</span>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    return slots;
  };

  return (
    <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
      {/* Calendar Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <CalendarDays className="text-[#0E2A6D] dark:text-[#60A5FA]" size={24} />
          <h2 className="text-lg font-bold font-heading text-slate-900 dark:text-white">
            {monthNames[month]} {year}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleToday}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Today
          </button>
          <div className="flex items-center gap-1 border border-slate-200 dark:border-slate-700 rounded-xl p-0.5">
            <button
              onClick={handlePrevMonth}
              className="p-1 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-px text-center mb-1">
        {daysOfWeek.map((day) => (
          <div key={day} className="py-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-800 p-1">
        {renderCells()}
      </div>
    </div>
  );
};
