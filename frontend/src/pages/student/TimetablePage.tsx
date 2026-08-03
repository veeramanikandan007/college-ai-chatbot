import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarDays,
  Clock3,
  BookOpen,
  UserRound,
  School,
  Building2,
  GraduationCap,
  Timer,
  CircleCheck,
  CircleAlert,
  CircleX,
  NotebookTabs,
  Bell,
  Brain,
  Layers,
  Sparkles,
  Search,
  Filter,
  Plus,
  CalendarRange,
  RotateCcw,
  CheckCircle2,
  XCircle,
  FileText,
  Clock,
} from 'lucide-react';

interface TimetableItem {
  id: number;
  day_of_week: string;
  period_number: number;
  start_time: string;
  end_time: string;
  subject_name: string;
  subject_code: string;
  subject_type: 'Theory' | 'Lab' | 'Seminar';
  faculty_name: string;
  classroom: string;
  color_code: string;
  status?: 'Ongoing' | 'Upcoming' | 'Completed';
}

interface AcademicEvent {
  date: string;
  title: string;
  type: 'Class Day' | 'Exam Day' | 'Holiday' | 'Event';
}

export default function TimetablePage() {
  const [viewMode, setViewMode] = useState<'today' | 'week' | 'calendar' | 'ai'>('today');
  const [selectedDay, setSelectedDay] = useState<string>('Monday');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'All' | 'Theory' | 'Lab' | 'Upcoming' | 'Completed'>('All');

  // Timetable Backend State
  const [todayData, setTodayData] = useState<any>(null);
  const [weeklyData, setWeeklyData] = useState<Record<string, TimetableItem[]>>({});
  const [calendarEvents, setCalendarEvents] = useState<AcademicEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // AI Assistant State
  const [aiQuery, setAiQuery] = useState('');
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [askingAi, setAskingAi] = useState(false);

  // Reminder Toast State
  const [reminderToast, setReminderToast] = useState<string | null>(null);

  // Fetch Timetable Backend Data
  const fetchTimetable = async () => {
    setLoading(true);
    try {
      const [todayRes, weeklyRes, calRes] = await Promise.all([
        fetch('/api/v1/timetable/today'),
        fetch('/api/v1/timetable/weekly'),
        fetch('/api/v1/timetable/calendar'),
      ]);

      if (todayRes.ok) setTodayData(await todayRes.json());
      if (weeklyRes.ok) setWeeklyData(await weeklyRes.json());
      if (calRes.ok) setCalendarEvents(await calRes.json());
    } catch (err) {
      console.error('Failed to load timetable data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimetable();
  }, []);

  // Handle Setting 10-Minute Reminder
  const handleSetReminder = async (item: TimetableItem) => {
    try {
      const res = await fetch('/api/v1/timetable/reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entry_id: item.id, minutes_before: 10 }),
      });
      if (res.ok) {
        setReminderToast(`Reminder set for 10 minutes before ${item.subject_name}.`);
        setTimeout(() => setReminderToast(null), 4000);
      }
    } catch (err) {
      console.error('Set reminder error:', err);
    }
  };

  // Handle AI Timetable Query
  const handleAskAi = async (promptQuery?: string) => {
    const q = promptQuery || aiQuery;
    if (!q.trim()) return;
    setAskingAi(true);
    try {
      const res = await fetch('/api/v1/timetable/ai-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
      });
      if (res.ok) {
        const json = await res.json();
        setAiAnswer(json.answer);
      }
    } catch (err) {
      console.error('AI timetable query error:', err);
    } finally {
      setAskingAi(false);
    }
  };

  // Filtered Today Entries
  const filteredTodayEntries = useMemo(() => {
    if (!todayData?.today_entries) return [];
    let list: TimetableItem[] = todayData.today_entries;

    if (activeFilter === 'Theory') list = list.filter((e) => e.subject_type === 'Theory');
    if (activeFilter === 'Lab') list = list.filter((e) => e.subject_type === 'Lab');
    if (activeFilter === 'Upcoming') list = list.filter((e) => e.status === 'Upcoming');
    if (activeFilter === 'Completed') list = list.filter((e) => e.status === 'Completed');

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (e) =>
          e.subject_name.toLowerCase().includes(q) ||
          e.faculty_name.toLowerCase().includes(q) ||
          e.classroom.toLowerCase().includes(q)
      );
    }

    return list;
  }, [todayData, activeFilter, searchQuery]);

  if (loading || !todayData) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#FFFFFF] dark:bg-[#0A0A0A]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#111827] dark:border-[#FAFAFA] border-t-transparent" />
          <p className="text-[14px] font-medium text-[#6B7280] dark:text-[#A3A3A3]">
            Loading Smart Timetable...
          </p>
        </div>
      </div>
    );
  }

  const ongoingClass: TimetableItem | null = todayData.ongoing_class;
  const nextClass: TimetableItem | null = todayData.next_class;

  return (
    <div className="w-full h-full overflow-x-hidden overflow-y-auto bg-[#FFFFFF] dark:bg-[#0A0A0A] text-[#111827] dark:text-[#FAFAFA] p-4 sm:p-6 md:p-8 transition-colors select-none font-sans">
      {/* 1440px Centered Max Content Width Container */}
      <div className="w-full max-w-[1440px] mx-auto space-y-6">

        {/* Reminder Notification Banner */}
        <AnimatePresence>
          {reminderToast && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 rounded-[12px] bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] text-[14px] font-[500] shadow-xs flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <Bell size={18} />
                <span>{reminderToast}</span>
              </div>
              <button onClick={() => setReminderToast(null)} className="cursor-pointer">
                <CircleX size={18} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Compact Hero Header (Matching AI Study Planner layout) */}
        <div className="bg-[#FFFFFF] dark:bg-[#18181B] p-4 sm:p-5 rounded-[16px] border border-[#D1D5DB] dark:border-[#3F3F46] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3 sm:gap-3.5 min-w-0 flex-1">
            <div className="w-[40px] h-[40px] sm:w-[44px] sm:h-[44px] rounded-[10px] bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] flex items-center justify-center shrink-0">
              <CalendarDays size={22} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-[20px] sm:text-[30px] font-[600] text-[#111827] dark:text-[#FAFAFA] tracking-tight leading-[1.2]">
                  Smart Timetable
                </h1>
                <span className="text-[11px] sm:text-[14px] font-[500] px-2 py-0.5 rounded-[6px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#D1D5DB] dark:border-[#3F3F46] text-[#111827] dark:text-[#FAFAFA] shrink-0">
                  CSE • Sem 6 • Sec A
                </span>
              </div>
              <p className="text-[14px] sm:text-[15px] font-[400] text-[#6B7280] dark:text-[#A1A1AA] mt-0.5 sm:truncate flex items-center gap-2">
                <span>{todayData.current_date}</span>
                <span>•</span>
                <span>{todayData.current_day} ({todayData.current_time})</span>
              </p>
            </div>
          </div>

          {/* Single-Row Segmented Tab Control Bar */}
          <div className="flex items-center bg-[#F8FAFC] dark:bg-[#111111] p-1 rounded-[12px] border border-[#D1D5DB] dark:border-[#3F3F46] min-h-[44px] shrink-0 overflow-x-auto no-scrollbar w-full lg:w-auto">
            {[
              { id: 'today', label: "Today's Schedule", icon: Clock3 },
              { id: 'week', label: 'Weekly Matrix', icon: Layers },
              { id: 'calendar', label: 'Academic Calendar', icon: CalendarDays },
              { id: 'ai', label: 'AI Schedule Assistant', icon: Brain },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = viewMode === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setViewMode(tab.id as any)}
                  className={`h-[36px] flex-1 lg:flex-none px-3.5 sm:px-4 rounded-[8px] text-[14px] font-[500] transition flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 active:scale-[0.98] ${
                    isActive
                      ? 'bg-[#111827] text-[#FFFFFF] dark:bg-[#FAFAFA] dark:text-[#111111]'
                      : 'text-[#6B7280] dark:text-[#A1A1AA] hover:bg-[#FFFFFF] dark:hover:bg-[#18181B]'
                  }`}
                >
                  <Icon size={15} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Overview Cards Banner (88px Height matching Study Analytics Banner) */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 select-none">
          <div className="h-[88px] p-3.5 sm:p-[16px] rounded-[16px] bg-[#FFFFFF] dark:bg-[#18181B] border border-[#D1D5DB] dark:border-[#3F3F46] shadow-xs flex items-center justify-between transition-all duration-150 ease-in-out hover:-translate-y-[2px] hover:shadow-md">
            <div className="min-w-0 flex-1 space-y-0.5">
              <p className="text-[14px] sm:text-[15px] font-[400] text-[#6B7280] dark:text-[#A1A1AA] truncate">Ongoing Status</p>
              <p className="text-[26px] sm:text-[30px] font-[600] text-[#111827] dark:text-[#FAFAFA] leading-none truncate">
                {ongoingClass ? ongoingClass.subject_name : 'No Class Now'}
              </p>
              <p className="text-[12px] sm:text-[14px] font-[400] text-[#6B7280] dark:text-[#A1A1AA] truncate pt-0.5">
                {ongoingClass ? `${ongoingClass.classroom} • ${ongoingClass.end_time}` : 'Free Period'}
              </p>
            </div>
            <div className="w-[34px] h-[34px] sm:w-[40px] sm:h-[40px] rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#D1D5DB] dark:border-[#3F3F46] text-[#111827] dark:text-[#FAFAFA] flex items-center justify-center shrink-0 ml-2">
              <Timer size={18} />
            </div>
          </div>

          <div className="h-[88px] p-3.5 sm:p-[16px] rounded-[16px] bg-[#FFFFFF] dark:bg-[#18181B] border border-[#D1D5DB] dark:border-[#3F3F46] shadow-xs flex items-center justify-between transition-all duration-150 ease-in-out hover:-translate-y-[2px] hover:shadow-md">
            <div className="min-w-0 flex-1 space-y-0.5">
              <p className="text-[14px] sm:text-[15px] font-[400] text-[#6B7280] dark:text-[#A1A1AA] truncate">Up Next</p>
              <p className="text-[26px] sm:text-[30px] font-[600] text-[#111827] dark:text-[#FAFAFA] leading-none truncate">
                {nextClass ? nextClass.subject_name : 'Day Completed'}
              </p>
              <p className="text-[12px] sm:text-[14px] font-[400] text-[#6B7280] dark:text-[#A1A1AA] truncate pt-0.5">
                {nextClass ? `${nextClass.start_time} @ ${nextClass.classroom}` : 'All done today'}
              </p>
            </div>
            <div className="w-[34px] h-[34px] sm:w-[40px] sm:h-[40px] rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#D1D5DB] dark:border-[#3F3F46] text-[#111827] dark:text-[#FAFAFA] flex items-center justify-center shrink-0 ml-2">
              <Clock3 size={18} />
            </div>
          </div>

          <div className="h-[88px] p-3.5 sm:p-[16px] rounded-[16px] bg-[#FFFFFF] dark:bg-[#18181B] border border-[#D1D5DB] dark:border-[#3F3F46] shadow-xs flex items-center justify-between transition-all duration-150 ease-in-out hover:-translate-y-[2px] hover:shadow-md">
            <div className="min-w-0 flex-1 space-y-0.5">
              <p className="text-[14px] sm:text-[15px] font-[400] text-[#6B7280] dark:text-[#A1A1AA] truncate">Today's Lectures</p>
              <p className="text-[26px] sm:text-[30px] font-[600] text-[#111827] dark:text-[#FAFAFA] leading-none truncate">
                {todayData.today_entries?.length || 0} Periods
              </p>
              <p className="text-[12px] sm:text-[14px] font-[400] text-[#6B7280] dark:text-[#A1A1AA] truncate pt-0.5">Scheduled classes</p>
            </div>
            <div className="w-[34px] h-[34px] sm:w-[40px] sm:h-[40px] rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#D1D5DB] dark:border-[#3F3F46] text-[#111827] dark:text-[#FAFAFA] flex items-center justify-center shrink-0 ml-2">
              <NotebookTabs size={18} />
            </div>
          </div>

          <div className="h-[88px] p-3.5 sm:p-[16px] rounded-[16px] bg-[#FFFFFF] dark:bg-[#18181B] border border-[#D1D5DB] dark:border-[#3F3F46] shadow-xs flex items-center justify-between transition-all duration-150 ease-in-out hover:-translate-y-[2px] hover:shadow-md">
            <div className="min-w-0 flex-1 space-y-0.5">
              <p className="text-[14px] sm:text-[15px] font-[400] text-[#6B7280] dark:text-[#A1A1AA] truncate">Overall Attendance</p>
              <p className="text-[26px] sm:text-[30px] font-[600] text-[#111827] dark:text-[#FAFAFA] leading-none truncate">88.5%</p>
              <p className="text-[12px] sm:text-[14px] font-[400] text-[#6B7280] dark:text-[#A1A1AA] truncate pt-0.5">Above minimum cutoff</p>
            </div>
            <div className="w-[34px] h-[34px] sm:w-[40px] sm:h-[40px] rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#D1D5DB] dark:border-[#3F3F46] text-[#111827] dark:text-[#FAFAFA] flex items-center justify-center shrink-0 ml-2">
              <CircleCheck size={18} />
            </div>
          </div>
        </div>

        {/* Ongoing & Next Class Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 select-none">
          {/* Ongoing Class */}
          {ongoingClass && (
            <div className="p-4 sm:p-5 rounded-[16px] bg-[#FFFFFF] dark:bg-[#18181B] border-2 border-[#111827] dark:border-[#FAFAFA] flex items-center justify-between gap-3 shadow-xs">
              <div className="space-y-1 min-w-0 flex-1">
                <span className="text-[11px] font-[600] uppercase tracking-wider text-[#111827] dark:text-[#FAFAFA] flex items-center gap-1.5">
                  <CircleAlert size={14} className="shrink-0" /> Ongoing Class Right Now
                </span>
                <h3 className="font-[700] text-[16px] sm:text-[20px] text-[#111827] dark:text-[#FAFAFA] flex items-center gap-2 truncate">
                  <BookOpen size={16} className="shrink-0" /> <span className="truncate">{ongoingClass.subject_name}</span>
                </h3>
                <div className="flex items-center gap-2 text-[14px] sm:text-[15px] font-[400] text-[#6B7280] dark:text-[#A1A1AA] truncate">
                  <span className="truncate">{ongoingClass.faculty_name}</span>
                  <span>•</span>
                  <span className="shrink-0">{ongoingClass.classroom}</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[13px] sm:text-[15px] font-[400] text-[#111827] dark:text-[#FAFAFA] block">
                  {ongoingClass.start_time} - {ongoingClass.end_time}
                </span>
                <span className="text-[11px] font-[600] px-2.5 py-0.5 rounded-[6px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#D1D5DB] dark:border-[#3F3F46] inline-block mt-1">
                  {ongoingClass.subject_type}
                </span>
              </div>
            </div>
          )}

          {/* Next Class */}
          {nextClass && (
            <div className="p-4 sm:p-5 rounded-[16px] bg-[#FFFFFF] dark:bg-[#18181B] border border-[#D1D5DB] dark:border-[#3F3F46] flex items-center justify-between gap-3 shadow-xs">
              <div className="space-y-1 min-w-0 flex-1">
                <span className="text-[11px] font-[400] uppercase tracking-wider text-[#6B7280] dark:text-[#A1A1AA] flex items-center gap-1">
                  <Timer size={14} className="shrink-0" /> Next Up
                </span>
                <h3 className="font-[700] text-[16px] sm:text-[18px] text-[#111827] dark:text-[#FAFAFA] flex items-center gap-2 truncate">
                  <BookOpen size={16} className="shrink-0" /> <span className="truncate">{nextClass.subject_name}</span>
                </h3>
                <div className="flex items-center gap-2 text-[12px] sm:text-[13px] font-[500] text-[#6B7280] dark:text-[#A1A1AA] truncate">
                  <span className="truncate">{nextClass.faculty_name}</span>
                  <span>•</span>
                  <span className="shrink-0">{nextClass.classroom}</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[13px] sm:text-[14px] font-[500] text-[#111827] dark:text-[#FAFAFA] block">
                  Starts at {nextClass.start_time}
                </span>
                <button
                  onClick={() => handleSetReminder(nextClass)}
                  className="mt-1 h-[32px] px-3 rounded-[8px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#18181B] text-[#111827] dark:text-[#FAFAFA] text-[12px] font-[400] hover:bg-[#F8FAFC] dark:hover:bg-[#232323] transition flex items-center gap-1 justify-end cursor-pointer active:scale-[0.98]"
                >
                  <Bell size={12} /> Set Reminder
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* MODE 1: TODAY'S SCHEDULE & STATISTICS CARDS                               */}
        {/* ========================================================================= */}
        {viewMode === 'today' && (
          <div className="space-y-6">
            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#FFFFFF] dark:bg-[#18181B] p-3.5 sm:p-4 rounded-[16px] border border-[#D1D5DB] dark:border-[#3F3F46] shadow-xs select-none">
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full sm:w-auto pb-1 sm:pb-0">
                {(['All', 'Theory', 'Lab', 'Upcoming', 'Completed'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`h-[36px] px-3.5 rounded-[8px] text-[14px] font-[500] transition cursor-pointer whitespace-nowrap shrink-0 active:scale-[0.98] ${
                      activeFilter === filter
                        ? 'bg-[#111827] text-[#FFFFFF] dark:bg-[#FAFAFA] dark:text-[#111111]'
                        : 'bg-[#FFFFFF] dark:bg-[#18181B] border border-[#D1D5DB] dark:border-[#3F3F46] text-[#111827] dark:text-[#FAFAFA] hover:bg-[#F8FAFC] dark:hover:bg-[#232323]'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-64">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7280] dark:text-[#A1A1AA]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search subject, faculty, room..."
                  className="w-full h-[38px] sm:h-[40px] pl-10 pr-4 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#18181B] text-[13px] sm:text-[14px] font-sans text-[#111827] dark:text-[#FAFAFA] outline-none"
                />
              </div>
            </div>

            {/* Vertical Timeline View */}
            <div className="space-y-3 relative before:absolute before:left-3.5 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#D1D5DB] dark:before:bg-[#3F3F46]">
              {filteredTodayEntries.map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="relative pl-8 sm:pl-10"
                >
                  <div
                    className={`absolute left-2 sm:left-2.5 top-5 -translate-x-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full border-2 border-white dark:border-[#18181B] shadow-xs z-10 ${
                      item.status === 'Ongoing'
                        ? 'bg-[#111827] dark:bg-[#FAFAFA]'
                        : item.status === 'Completed'
                        ? 'bg-[#9CA3AF]'
                        : 'bg-[#111827] dark:bg-[#FAFAFA]'
                    }`}
                  />

                  <div
                    className={`p-4 sm:p-5 rounded-[16px] border transition-all duration-150 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      item.status === 'Ongoing'
                        ? 'bg-[#FFFFFF] dark:bg-[#18181B] border-2 border-[#111827] dark:border-[#FAFAFA]'
                        : 'bg-[#FFFFFF] dark:bg-[#18181B] border border-[#D1D5DB] dark:border-[#3F3F46]'
                    }`}
                  >
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-[700] text-[16px] sm:text-[18px] text-[#111827] dark:text-[#FAFAFA] leading-tight">
                          {item.subject_name}
                        </span>
                        <span className="text-[12px] sm:text-[13px] font-[500] text-[#6B7280] dark:text-[#A1A1AA]">({item.subject_code})</span>
                        <span className="px-2.5 py-0.5 rounded-[6px] text-[11px] sm:text-[12px] font-[400] bg-[#F8FAFC] dark:bg-[#111111] border border-[#D1D5DB] dark:border-[#3F3F46] text-[#111827] dark:text-[#FAFAFA]">
                          {item.subject_type}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[12px] sm:text-[13px] font-[500] text-[#6B7280] dark:text-[#A1A1AA]">
                        <span>Faculty: {item.faculty_name}</span>
                        <span>•</span>
                        <span>Room: {item.classroom}</span>
                        <span>•</span>
                        <span>Time: {item.start_time} - {item.end_time}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#D1D5DB] dark:border-[#3F3F46]">
                      {item.status === 'Upcoming' && (
                        <button
                          onClick={() => handleSetReminder(item)}
                          className="h-[36px] px-3.5 rounded-[10px] bg-[#FFFFFF] dark:bg-[#18181B] border border-[#D1D5DB] dark:border-[#3F3F46] text-[12px] sm:text-[14px] font-[500] text-[#111827] dark:text-[#FAFAFA] hover:bg-[#F8FAFC] dark:hover:bg-[#232323] transition flex items-center gap-1.5 cursor-pointer active:scale-[0.98] w-full sm:w-auto justify-center"
                        >
                          <Bell size={14} /> Set Reminder
                        </button>
                      )}

                      <span className="px-3 py-1 rounded-[6px] text-[12px] font-medium bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA] flex items-center gap-1">
                        {item.status === 'Ongoing' && <CircleAlert size={14} />}
                        {item.status === 'Completed' && <CircleCheck size={14} />}
                        {item.status === 'Upcoming' && <Clock3 size={14} />}
                        {item.status}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODE 2: WEEKLY TIMETABLE MATRIX                                          */}
        {/* ========================================================================= */}
        {viewMode === 'week' && (
          <div className="bg-[#FFFFFF] dark:bg-[#181818] p-6 rounded-[12px] border border-[#D1D5DB] dark:border-[#3F3F46] shadow-xs space-y-6">
            <div className="flex items-center gap-2 overflow-x-auto">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((d) => (
                <button
                  key={d}
                  onClick={() => setSelectedDay(d)}
                  className={`h-9 px-4 rounded-[8px] text-[14px] font-medium transition whitespace-nowrap cursor-pointer ${
                    selectedDay === d
                      ? 'bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111]'
                      : 'bg-[#FFFFFF] dark:bg-[#181818] border border-[#D1D5DB] dark:border-[#3F3F46] text-[#111827] dark:text-[#FAFAFA] hover:bg-[#F9FAFB] dark:hover:bg-[#232323]'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(weeklyData[selectedDay] || []).map((item) => (
                <div
                  key={item.id}
                  className="p-5 rounded-[12px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#FFFFFF] dark:bg-[#181818] space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-medium text-[#6B7280] dark:text-[#A3A3A3] flex items-center gap-1">
                      <Clock3 size={14} /> {item.start_time} - {item.end_time}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-[6px] text-[12px] font-medium bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA]">
                      Period {item.period_number}
                    </span>
                  </div>
                  <h4 className="font-bold text-[16px] text-[#111827] dark:text-[#FAFAFA] flex items-center gap-2">
                    <BookOpen size={16} /> {item.subject_name}
                  </h4>
                  <div className="text-[14px] text-[#6B7280] dark:text-[#A3A3A3] space-y-1">
                    <p>Faculty: {item.faculty_name}</p>
                    <p>Room: {item.classroom}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODE 3: ACADEMIC CALENDAR                                                 */}
        {/* ========================================================================= */}
        {viewMode === 'calendar' && (
          <div className="bg-[#FFFFFF] dark:bg-[#181818] p-6 rounded-[12px] border border-[#D1D5DB] dark:border-[#3F3F46] shadow-xs space-y-6">
            <h2 className="text-[22px] font-bold text-[#111827] dark:text-[#FAFAFA] flex items-center gap-2">
              <CalendarDays size={22} />
              <span>Academic Calendar Highlights</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {calendarEvents.map((ev, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-[12px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#FFFFFF] dark:bg-[#181818] space-y-2"
                >
                  <span className="px-2.5 py-0.5 rounded-[6px] text-[12px] font-medium bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA]">
                    {ev.type}
                  </span>
                  <h3 className="font-bold text-[16px] text-[#111827] dark:text-[#FAFAFA]">{ev.title}</h3>
                  <p className="text-[12px] text-[#6B7280] dark:text-[#A3A3A3] flex items-center gap-1"><CalendarDays size={14} /> {ev.date}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODE 4: AI TIMETABLE ASSISTANT & SUGGESTIONS                              */}
        {/* ========================================================================= */}
        {viewMode === 'ai' && (
          <div className="bg-[#FFFFFF] dark:bg-[#181818] p-6 rounded-[12px] border border-[#D1D5DB] dark:border-[#3F3F46] shadow-xs space-y-6">
            <h2 className="text-[22px] font-bold text-[#111827] dark:text-[#FAFAFA] flex items-center gap-2">
              <Brain size={22} />
              <span>AI Timetable Assistant</span>
            </h2>

            <div className="flex flex-wrap gap-2">
              {[
                'When is my next class?',
                "Show tomorrow's timetable.",
                'How many labs do I have this week?',
                'What is my first class on Monday?',
              ].map((qp, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setAiQuery(qp);
                    handleAskAi(qp);
                  }}
                  className="h-8 px-3 rounded-[6px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA] text-[12px] font-medium hover:bg-[#F9FAFB] dark:hover:bg-[#232323] transition cursor-pointer"
                >
                  {qp}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                placeholder="Ask any timetable question..."
                className="flex-1 h-10 px-4 rounded-[10px] bg-[#FFFFFF] dark:bg-[#181818] border border-[#D1D5DB] dark:border-[#3F3F46] text-[14px] text-[#111827] dark:text-[#FAFAFA] outline-none"
              />
              <button
                onClick={() => handleAskAi()}
                disabled={askingAi}
                className="h-10 px-6 rounded-[10px] bg-[#111827] hover:bg-[#000000] dark:bg-[#FAFAFA] dark:hover:bg-[#E5E5E5] text-[#FFFFFF] dark:text-[#111111] font-medium text-[14px] cursor-pointer"
              >
                {askingAi ? 'Thinking...' : 'Ask AI'}
              </button>
            </div>

            {aiAnswer && (
              <div className="p-6 rounded-[12px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[14px] leading-relaxed text-[#4B5563] dark:text-[#D4D4D4] space-y-2 whitespace-pre-wrap">
                {aiAnswer}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
