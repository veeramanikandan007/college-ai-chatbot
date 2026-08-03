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
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

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
  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    setSelectedDate(todayKey);
  };

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
          <div
            key={`empty-${i}`}
            className="min-h-[110px] p-3 bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] rounded-[10px]"
          />
        );
        continue;
      }

      const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      const dayAssignments = assignmentsByDate[dateKey] || [];
      const isToday = dateKey === todayStr;
      const isSelected = selectedDate === dateKey;

      slots.push(
        <div
          key={`day-${dayNum}`}
          onClick={() => setSelectedDate(dateKey)}
          className={`min-h-[110px] p-3 bg-[#FFFFFF] dark:bg-[#181818] border rounded-[10px] hover:bg-[#F9FAFB] dark:hover:bg-[#232323] transition-all duration-150 flex flex-col justify-between cursor-pointer ${
            isSelected
              ? 'bg-[#111827] text-[#FFFFFF] dark:bg-[#FFFFFF] dark:text-[#111111] border-[#111827] dark:border-[#FFFFFF]'
              : isToday
              ? 'border-2 border-[#111827] dark:border-[#FFFFFF]'
              : 'border-[#D1D5DB] dark:border-[#3F3F46]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-[14px] font-bold h-7 w-7 rounded-[10px] flex items-center justify-center ${
                isSelected
                  ? 'bg-[#FFFFFF] text-[#111827] dark:bg-[#111111] dark:text-[#FFFFFF]'
                  : isToday
                  ? 'bg-[#111827] text-[#FFFFFF] dark:bg-[#FFFFFF] dark:text-[#111111]'
                  : 'text-[#111827] dark:text-[#FAFAFA]'
              }`}
            >
              {dayNum}
            </span>
            {dayAssignments.length > 0 && (
              <span
                className={`text-[12px] font-medium ${
                  isSelected ? 'text-[#FFFFFF]/80 dark:text-[#111111]/80' : 'text-[#6B7280] dark:text-[#A3A3A3]'
                }`}
              >
                {dayAssignments.length} due
              </span>
            )}
          </div>

          <div className="mt-2 space-y-1.5 overflow-y-auto max-h-[75px] no-scrollbar">
            {dayAssignments.map((assg) => (
              <div
                key={assg.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectAssignment(assg);
                }}
                className={`px-2.5 py-1 rounded-[10px] border text-[14px] font-medium truncate cursor-pointer transition-all flex items-center gap-2 ${
                  isSelected
                    ? 'bg-[#181818] dark:bg-[#F8FAFC] text-[#FFFFFF] dark:text-[#111111] border-transparent'
                    : 'bg-[#FFFFFF] dark:bg-[#181818] text-[#111827] dark:text-[#FAFAFA] border-[#D1D5DB] dark:border-[#3F3F46] hover:bg-[#F9FAFB] dark:hover:bg-[#232323]'
                }`}
                title={`${assg.title} (${assg.subject}) - Due ${assg.status}`}
              >
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    isSelected
                      ? 'bg-[#FFFFFF] dark:bg-[#111111]'
                      : 'bg-[#111827] dark:bg-[#FAFAFA]'
                  }`}
                />
                <span className="truncate text-[14px] font-medium">{assg.title}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return slots;
  };

  return (
    <div className="bg-[#FFFFFF] dark:bg-[#181818] rounded-[12px] border border-[#D1D5DB] dark:border-[#3F3F46] p-6 shadow-xs space-y-6">
      {/* Calendar Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[10px] bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] flex items-center justify-center shrink-0">
            <CalendarDays size={20} />
          </div>
          <h2 className="text-[22px] font-bold text-[#111827] dark:text-[#FAFAFA]">
            {monthNames[month]} {year}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleToday}
            className="h-10 px-4 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#181818] text-[#111827] dark:text-[#FAFAFA] text-[14px] font-medium hover:bg-[#F9FAFB] dark:hover:bg-[#232323] transition cursor-pointer"
          >
            Today
          </button>
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrevMonth}
              className="h-10 w-10 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#181818] text-[#111827] dark:text-[#FAFAFA] hover:bg-[#F9FAFB] dark:hover:bg-[#232323] flex items-center justify-center transition cursor-pointer"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={handleNextMonth}
              className="h-10 w-10 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#181818] text-[#111827] dark:text-[#FAFAFA] hover:bg-[#F9FAFB] dark:hover:bg-[#232323] flex items-center justify-center transition cursor-pointer"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-2 text-center">
        {daysOfWeek.map((day) => (
          <div key={day} className="py-2 text-[12px] font-bold uppercase tracking-wider text-[#6B7280] dark:text-[#A3A3A3]">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {renderCells()}
      </div>
    </div>
  );
};
