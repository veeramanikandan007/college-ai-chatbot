import React, { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, CalendarDays, BookOpen, Clock3, CircleCheck, CircleAlert } from 'lucide-react';
import { Assignment } from '../../api/assignments';

interface AssignmentCalendarProps {
  assignments: Assignment[];
  onSelectAssignment: (assignment: Assignment) => void;
}

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const dateKeyFromDate = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

const isSameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

const getStartOfWeek = (date: Date) => {
  const result = new Date(date);
  const day = result.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  result.setDate(result.getDate() + diff);
  result.setHours(0, 0, 0, 0);
  return result;
};

export const AssignmentCalendar: React.FC<AssignmentCalendarProps> = ({
  assignments,
  onSelectAssignment,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(max-width: 767px)');
    const updateIsMobile = () => setIsMobile(mediaQuery.matches);

    updateIsMobile();

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', updateIsMobile);
      return () => mediaQuery.removeEventListener('change', updateIsMobile);
    }

    mediaQuery.addListener(updateIsMobile);
    return () => mediaQuery.removeListener(updateIsMobile);
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const handlePrevMonth = () => {
    const updatedDate = new Date(year, month - 1, 1);
    setCurrentDate(updatedDate);
    setSelectedDate(dateKeyFromDate(updatedDate));
  };

  const handleNextMonth = () => {
    const updatedDate = new Date(year, month + 1, 1);
    setCurrentDate(updatedDate);
    setSelectedDate(dateKeyFromDate(updatedDate));
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(dateKeyFromDate(today));
  };

  const assignmentsByDate: Record<string, Assignment[]> = {};
  assignments.forEach((item) => {
    const d = new Date(item.due_date);
    const key = dateKeyFromDate(d);
    if (!assignmentsByDate[key]) assignmentsByDate[key] = [];
    assignmentsByDate[key].push(item);
  });

  const today = new Date();
  const todayStr = dateKeyFromDate(today);

  useEffect(() => {
    if (!selectedDate) {
      setSelectedDate(todayStr);
    }
  }, [selectedDate, todayStr]);

  const weekStart = useMemo(() => getStartOfWeek(selectedDate ? new Date(`${selectedDate}T12:00:00`) : today), [selectedDate, today]);

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, idx) => {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + idx);
      return {
        date,
        key: dateKeyFromDate(date),
      };
    });
  }, [weekStart]);

  const selectedAssignments = selectedDate ? assignmentsByDate[selectedDate] || [] : [];

  const upcomingAssignments = useMemo(() => {
    const now = new Date();
    const end = new Date(now);
    end.setDate(now.getDate() + 7);

    return assignments
      .filter((assignment) => {
        const dueDate = new Date(assignment.due_date);
        return dueDate >= now && dueDate <= end;
      })
      .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
      .slice(0, 8);
  }, [assignments]);

  const renderDesktopCells = () => {
    const totalSlots = Math.ceil((firstDayOfMonth + daysInMonth) / 7) * 7;
    const slots: React.ReactNode[] = [];

    for (let i = 0; i < totalSlots; i++) {
      const dayNum = i - firstDayOfMonth + 1;
      const isCurrentMonthDay = dayNum > 0 && dayNum <= daysInMonth;

      if (!isCurrentMonthDay) {
        slots.push(
          <div
            key={`empty-${i}`}
            className="aspect-square rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A]"
          />
        );
        continue;
      }

      const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      const dayAssignments = assignmentsByDate[dateKey] || [];
      const isToday = dateKey === todayStr;
      const isSelected = selectedDate === dateKey;

      slots.push(
        <button
          key={`day-${dayNum}`}
          onClick={() => setSelectedDate(dateKey)}
          className={`aspect-square p-2 rounded-[10px] border transition-all duration-150 flex flex-col justify-between text-left overflow-hidden ${
            isSelected
              ? 'bg-[#111827] text-[#FFFFFF] dark:bg-[#FFFFFF] dark:text-[#111111] border-[#111827] dark:border-[#FFFFFF]'
              : isToday
              ? 'border-2 border-[#111827] dark:border-[#FFFFFF]'
              : 'border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#181818] hover:bg-[#F9FAFB] dark:hover:bg-[#232323]'
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <span
              className={`text-[14px] font-[500] h-[28px] w-[28px] rounded-[8px] flex items-center justify-center ${
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
                className={`text-[11px] font-[500] ${
                  isSelected ? 'text-[#FFFFFF]/80 dark:text-[#111111]/80' : 'text-[#6B7280] dark:text-[#A3A3A3]'
                }`}
              >
                {dayAssignments.length}
              </span>
            )}
          </div>

          <div className="space-y-1 min-h-0">
            {dayAssignments.slice(0, 2).map((assg) => (
              <div
                key={assg.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectAssignment(assg);
                }}
                className={`px-2 py-1 rounded-[6px] border text-[12px] font-[500] truncate cursor-pointer ${
                  isSelected
                    ? 'bg-[#181818] dark:bg-[#F8FAFC] text-[#FFFFFF] dark:text-[#111111] border-transparent'
                    : 'bg-[#FFFFFF] dark:bg-[#181818] text-[#111827] dark:text-[#FAFAFA] border-[#D1D5DB] dark:border-[#3F3F46] hover:bg-[#F9FAFB] dark:hover:bg-[#232323]'
                }`}
                title={`${assg.title} (${assg.subject})`}
              >
                {assg.title}
              </div>
            ))}
          </div>
        </button>
      );
    }

    return slots;
  };

  const handleWeekSwipe = (direction: 'left' | 'right') => {
    const nextDate = new Date(selectedDate ? `${selectedDate}T12:00:00` : todayStr);
    nextDate.setDate(nextDate.getDate() + (direction === 'left' ? 7 : -7));
    setCurrentDate(nextDate);
    setSelectedDate(dateKeyFromDate(nextDate));
  };

  const renderMobileLayout = () => {
    const selectedDayAssignments = selectedAssignments;
    const selectedWeekDate = selectedDate ? new Date(`${selectedDate}T12:00:00`) : today;

    return (
      <div className="space-y-4 md:hidden">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="text-[26px] font-[700] text-[#111827] dark:text-[#FAFAFA]">
              {monthNames[selectedWeekDate.getMonth()]} {selectedWeekDate.getFullYear()}
            </h2>
            <p className="text-[13px] font-[500] text-[#6B7280] dark:text-[#A3A3A3]">
              Today’s focus and the next week ahead
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleToday}
            className="h-[44px] px-4 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#181818] text-[14px] font-[500] text-[#111827] dark:text-[#FAFAFA] min-w-[80px]"
          >
            Today
          </button>
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => handleWeekSwipe('right')}
              className="h-[44px] w-[44px] rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#181818] text-[#111827] dark:text-[#FAFAFA] flex items-center justify-center"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => handleWeekSwipe('left')}
              className="h-[44px] w-[44px] rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#181818] text-[#111827] dark:text-[#FAFAFA] flex items-center justify-center"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div
          className="flex gap-2 overflow-hidden"
          onTouchStart={(e) => setTouchStartX(e.touches[0].clientX)}
          onTouchEnd={(e) => {
            if (touchStartX === null) return;
            const deltaX = e.changedTouches[0].clientX - touchStartX;
            if (Math.abs(deltaX) > 40) {
              handleWeekSwipe(deltaX < 0 ? 'left' : 'right');
            }
            setTouchStartX(null);
          }}
        >
          {weekDays.map((item) => {
            const dayAssignments = assignmentsByDate[item.key] || [];
            const isSelected = item.key === selectedDate;
            const isToday = item.key === todayStr;

            return (
              <button
                key={item.key}
                onClick={() => setSelectedDate(item.key)}
                className={`flex-1 min-w-0 rounded-[14px] border p-2 text-center ${
                  isSelected
                    ? 'bg-[#111827] dark:bg-[#FAFAFA] border-[#111827] dark:border-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111]'
                    : isToday
                    ? 'border-2 border-[#111827] dark:border-[#FAFAFA] bg-[#F8FAFC] dark:bg-[#111111] text-[#111827] dark:text-[#FAFAFA]'
                    : 'border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#181818] text-[#111827] dark:text-[#FAFAFA]'
                }`}
              >
                <div className="text-[12px] font-[500] uppercase tracking-wide opacity-80">{dayLabels[item.date.getDay() === 0 ? 6 : item.date.getDay() - 1]}</div>
                <div className="mt-1 text-[14px] font-[500]">{item.date.getDate()}</div>
                <div className="mt-2 flex items-center justify-center">
                  {dayAssignments.length > 0 ? (
                    <span className="min-w-[22px] h-[22px] rounded-full bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] text-[11px] font-[400] flex items-center justify-center">
                      {dayAssignments.length}
                    </span>
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-[#D1D5DB] dark:bg-[#3F3F46]" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <CalendarDays size={16} className="text-[#6B7280] dark:text-[#A3A3A3]" />
            <span className="text-[13px] font-[500] text-[#6B7280] dark:text-[#A3A3A3] uppercase tracking-wide">Today’s Assignments</span>
          </div>

          {selectedDayAssignments.length === 0 ? (
            <div className="rounded-[12px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#181818] p-4 text-[13px] text-[#6B7280] dark:text-[#A3A3A3]">
              No assignments for this day.
            </div>
          ) : (
            <div className="space-y-2">
              {selectedDayAssignments.map((assignment) => (
                <div key={assignment.id} className="rounded-[12px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#181818] p-3 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-[14px] font-[400] text-[#111827] dark:text-[#FAFAFA]">{assignment.title}</div>
                      <div className="text-[13px] font-[500] text-[#6B7280] dark:text-[#A3A3A3]">{assignment.subject}</div>
                    </div>
                    <span className="text-[12px] font-[500] text-[#6B7280] dark:text-[#A3A3A3]">{assignment.status}</span>
                  </div>

                  <div className="flex items-center gap-2 text-[12px] text-[#6B7280] dark:text-[#A3A3A3]">
                    <Clock3 size={14} />
                    <span>{new Date(assignment.due_date).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>

                  <button
                    onClick={() => onSelectAssignment(assignment)}
                    className="h-[44px] w-full rounded-[10px] bg-[#111827] hover:bg-[#000000] dark:bg-[#FAFAFA] dark:hover:bg-[#E5E5E5] text-[#FFFFFF] dark:text-[#111111] text-[14px] font-[500]"
                  >
                    Submit
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <CalendarDays size={16} className="text-[#6B7280] dark:text-[#A3A3A3]" />
            <span className="text-[13px] font-[500] text-[#6B7280] dark:text-[#A3A3A3] uppercase tracking-wide">Upcoming Next 7 Days</span>
          </div>

          <div className="space-y-2 max-h-[230px] overflow-y-auto pr-1">
            {upcomingAssignments.map((assignment) => (
              <div key={assignment.id} className="rounded-[12px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#181818] p-3 space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[14px] font-[400] text-[#111827] dark:text-[#FAFAFA]">{assignment.title}</span>
                  <span className="text-[12px] font-[500] text-[#6B7280] dark:text-[#A3A3A3]">{assignment.subject}</span>
                </div>
                <div className="flex items-center justify-between gap-2 text-[12px] text-[#6B7280] dark:text-[#A3A3A3]">
                  <span>{new Date(assignment.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  <span>{assignment.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-[#FFFFFF] dark:bg-[#181818] rounded-[12px] border border-[#D1D5DB] dark:border-[#3F3F46] p-4 sm:p-6 shadow-xs space-y-6">
      <div className="hidden md:flex md:flex-col md:gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[10px] bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] flex items-center justify-center shrink-0">
              <CalendarDays size={20} />
            </div>
            <h2 className="text-[22px] font-[700] text-[#111827] dark:text-[#FAFAFA]">
              {monthNames[month]} {year}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleToday}
              className="h-[44px] px-4 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#181818] text-[14px] font-[500] text-[#111827] dark:text-[#FAFAFA]"
            >
              Today
            </button>
            <div className="flex items-center gap-1">
              <button
                onClick={handlePrevMonth}
                className="h-[44px] w-[44px] rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#181818] text-[#111827] dark:text-[#FAFAFA] flex items-center justify-center"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={handleNextMonth}
                className="h-[44px] w-[44px] rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#181818] text-[#111827] dark:text-[#FAFAFA] flex items-center justify-center"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 text-center">
          {dayLabels.map((day) => (
            <div key={day} className="py-2 text-[12px] font-[400] uppercase tracking-[0.08em] text-[#6B7280] dark:text-[#A3A3A3]">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">{renderDesktopCells()}</div>
      </div>

      {isMobile && renderMobileLayout()}
    </div>
  );
};
