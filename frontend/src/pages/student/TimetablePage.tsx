import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarDays,
  Clock3,
  BookOpen,
  UserRound,
  Building2,
  Timer,
  CircleCheck,
  CircleAlert,
  CircleX,
  NotebookTabs,
  Bell,
  Brain,
  Layers,
  Search,
  CheckCircle2,
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
      <div className="w-full h-full min-h-[400px] flex items-center justify-center bg-[#FFFFFF] dark:bg-[#0A0A0A]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#111827] dark:border-[#FAFAFA] border-t-transparent" />
          <p className="text-[14px] font-normal text-[#6B7280] dark:text-[#A1A1AA]">
            Loading Smart Timetable...
          </p>
        </div>
      </div>
    );
  }

  const ongoingClass: TimetableItem | null = todayData.ongoing_class;
  const nextClass: TimetableItem | null = todayData.next_class;

  return (
    <div className="w-full h-full overflow-x-hidden overflow-y-auto bg-[#F8FAFC] dark:bg-[#0A0A0A] text-[#111827] dark:text-[#FAFAFA] p-4 sm:p-6 lg:p-8 transition-colors select-none font-sans">
      {/* 1440px Centered Container with 32px (space-y-8) Section Gap */}
      <div className="w-full max-w-[1440px] mx-auto space-y-8">

        {/* Reminder Notification Banner */}
        <AnimatePresence>
          {reminderToast && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 rounded-[16px] bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] text-[14px] font-medium shadow-xs flex items-center justify-between"
            >
              <div className="flex items-center gap-2.5">
                <Bell size={18} />
                <span>{reminderToast}</span>
              </div>
              <button onClick={() => setReminderToast(null)} className="cursor-pointer">
                <CircleX size={18} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hero Header Card (Matching Placement Hub style: 30px title, 24px padding, 16px radius) */}
        <div className="bg-[#FFFFFF] dark:bg-[#18181B] p-6 rounded-[16px] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4 min-w-0 flex-1">
            <div className="w-12 h-12 rounded-[12px] bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] flex items-center justify-center shrink-0">
              <CalendarDays size={24} />
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-[30px] font-semibold text-[#111827] dark:text-[#FAFAFA] tracking-tight leading-tight">
                  Smart Timetable
                </h1>
                <span className="text-[12px] font-medium px-3 py-1 rounded-[8px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA] shrink-0">
                  CSE • Sem 6 • Sec A
                </span>
              </div>
              <p className="text-[14px] font-normal text-[#6B7280] dark:text-[#A1A1AA] flex flex-wrap items-center gap-2">
                <span>{todayData.current_date}</span>
                <span>•</span>
                <span>{todayData.current_day} ({todayData.current_time})</span>
              </p>
            </div>
          </div>

          {/* Horizontally Scrollable Tab Navigation Bar */}
          <div className="flex items-center bg-[#F8FAFC] dark:bg-[#111111] p-1.5 rounded-[12px] border border-[#E5E7EB] dark:border-[#2A2A2A] min-h-[44px] shrink-0 overflow-x-auto no-scrollbar w-full lg:w-auto">
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
                  className={`h-[36px] flex-1 lg:flex-none px-4 rounded-[8px] text-[14px] font-medium transition flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-[#111827] text-[#FFFFFF] dark:bg-[#FAFAFA] dark:text-[#111111]'
                      : 'text-[#6B7280] dark:text-[#A1A1AA] hover:bg-[#FFFFFF] dark:hover:bg-[#18181B]'
                  }`}
                >
                  <Icon size={16} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4 Statistics Cards Grid (2x2 on Mobile, 4 Columns on Desktop, 24px Gap) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-[16px] bg-[#FFFFFF] dark:bg-[#18181B] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs flex items-center justify-between">
            <div className="min-w-0 flex-1 space-y-1">
              <p className="text-[14px] font-normal text-[#6B7280] dark:text-[#A1A1AA] truncate">Ongoing Status</p>
              <p className="text-[28px] font-semibold text-[#111827] dark:text-[#FAFAFA] leading-tight truncate">
                {ongoingClass ? ongoingClass.subject_name : 'No Class'}
              </p>
              <p className="text-[12px] font-normal text-[#6B7280] dark:text-[#A1A1AA] truncate">
                {ongoingClass ? `${ongoingClass.classroom} • ${ongoingClass.end_time}` : 'Free Period'}
              </p>
            </div>
            <div className="w-10 h-10 rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA] flex items-center justify-center shrink-0 ml-3">
              <Timer size={20} />
            </div>
          </div>

          <div className="p-6 rounded-[16px] bg-[#FFFFFF] dark:bg-[#18181B] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs flex items-center justify-between">
            <div className="min-w-0 flex-1 space-y-1">
              <p className="text-[14px] font-normal text-[#6B7280] dark:text-[#A1A1AA] truncate">Up Next</p>
              <p className="text-[28px] font-semibold text-[#111827] dark:text-[#FAFAFA] leading-tight truncate">
                {nextClass ? nextClass.subject_name : 'Completed'}
              </p>
              <p className="text-[12px] font-normal text-[#6B7280] dark:text-[#A1A1AA] truncate">
                {nextClass ? `${nextClass.start_time} @ ${nextClass.classroom}` : 'All done today'}
              </p>
            </div>
            <div className="w-10 h-10 rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA] flex items-center justify-center shrink-0 ml-3">
              <Clock3 size={20} />
            </div>
          </div>

          <div className="p-6 rounded-[16px] bg-[#FFFFFF] dark:bg-[#18181B] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs flex items-center justify-between">
            <div className="min-w-0 flex-1 space-y-1">
              <p className="text-[14px] font-normal text-[#6B7280] dark:text-[#A1A1AA] truncate">Today's Lectures</p>
              <p className="text-[28px] font-semibold text-[#111827] dark:text-[#FAFAFA] leading-tight truncate">
                {todayData.today_entries?.length || 0} Periods
              </p>
              <p className="text-[12px] font-normal text-[#6B7280] dark:text-[#A1A1AA] truncate">Scheduled classes</p>
            </div>
            <div className="w-10 h-10 rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA] flex items-center justify-center shrink-0 ml-3">
              <NotebookTabs size={20} />
            </div>
          </div>

          <div className="p-6 rounded-[16px] bg-[#FFFFFF] dark:bg-[#18181B] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs flex items-center justify-between">
            <div className="min-w-0 flex-1 space-y-1">
              <p className="text-[14px] font-normal text-[#6B7280] dark:text-[#A1A1AA] truncate">Overall Attendance</p>
              <p className="text-[28px] font-semibold text-[#111827] dark:text-[#FAFAFA] leading-tight truncate">88.5%</p>
              <p className="text-[12px] font-normal text-[#6B7280] dark:text-[#A1A1AA] truncate">Above cutoff</p>
            </div>
            <div className="w-10 h-10 rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA] flex items-center justify-center shrink-0 ml-3">
              <CircleCheck size={20} />
            </div>
          </div>
        </div>

        {/* Ongoing & Next Class Highlight Cards (2 Column Desktop, 1 Column Mobile, 24px Gap) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Ongoing Class Card */}
          {ongoingClass && (
            <div className="p-6 rounded-[16px] bg-[#FFFFFF] dark:bg-[#18181B] border-2 border-[#111827] dark:border-[#FAFAFA] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
              <div className="space-y-1.5 min-w-0 flex-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#111827] dark:text-[#FAFAFA] flex items-center gap-1.5">
                  <CircleAlert size={14} className="shrink-0" /> Ongoing Class Right Now
                </span>
                <h3 className="text-[17px] font-semibold text-[#111827] dark:text-[#FAFAFA] flex items-center gap-2 truncate">
                  <BookOpen size={18} className="shrink-0" /> <span className="truncate">{ongoingClass.subject_name}</span>
                </h3>
                <p className="text-[14px] font-normal text-[#6B7280] dark:text-[#A1A1AA] truncate">
                  {ongoingClass.faculty_name} • {ongoingClass.classroom}
                </p>
              </div>
              <div className="sm:text-right shrink-0">
                <span className="text-[14px] font-medium text-[#111827] dark:text-[#FAFAFA] block">
                  {ongoingClass.start_time} - {ongoingClass.end_time}
                </span>
                <span className="text-[11px] font-medium px-3 py-1 rounded-[6px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] inline-block mt-1">
                  {ongoingClass.subject_type}
                </span>
              </div>
            </div>
          )}

          {/* Next Class Card */}
          {nextClass && (
            <div className="p-6 rounded-[16px] bg-[#FFFFFF] dark:bg-[#18181B] border border-[#E5E7EB] dark:border-[#2A2A2A] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
              <div className="space-y-1.5 min-w-0 flex-1">
                <span className="text-[11px] font-normal uppercase tracking-wider text-[#6B7280] dark:text-[#A1A1AA] flex items-center gap-1.5">
                  <Timer size={14} className="shrink-0" /> Next Up
                </span>
                <h3 className="text-[17px] font-semibold text-[#111827] dark:text-[#FAFAFA] flex items-center gap-2 truncate">
                  <BookOpen size={18} className="shrink-0" /> <span className="truncate">{nextClass.subject_name}</span>
                </h3>
                <p className="text-[14px] font-normal text-[#6B7280] dark:text-[#A1A1AA] truncate">
                  {nextClass.faculty_name} • {nextClass.classroom}
                </p>
              </div>
              <div className="sm:text-right shrink-0">
                <span className="text-[14px] font-medium text-[#111827] dark:text-[#FAFAFA] block">
                  Starts at {nextClass.start_time}
                </span>
                <button
                  onClick={() => handleSetReminder(nextClass)}
                  className="mt-1.5 h-[36px] w-full sm:w-auto px-4 rounded-[10px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#FFFFFF] dark:bg-[#18181B] text-[#111827] dark:text-[#FAFAFA] text-[14px] font-medium hover:bg-[#F8FAFC] dark:hover:bg-[#232323] transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Bell size={14} /> Set Reminder
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* MODE 1: TODAY'S SCHEDULE                                                  */}
        {/* ========================================================================= */}
        {viewMode === 'today' && (
          <div className="space-y-6">
            {/* Filter & Search Bar Container */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#FFFFFF] dark:bg-[#18181B] p-4 rounded-[16px] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs">
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full sm:w-auto pb-1 sm:pb-0">
                {(['All', 'Theory', 'Lab', 'Upcoming', 'Completed'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`h-[36px] px-4 rounded-[8px] text-[14px] font-medium transition cursor-pointer whitespace-nowrap shrink-0 ${
                      activeFilter === filter
                        ? 'bg-[#111827] text-[#FFFFFF] dark:bg-[#FAFAFA] dark:text-[#111111]'
                        : 'bg-[#FFFFFF] dark:bg-[#18181B] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA] hover:bg-[#F8FAFC] dark:hover:bg-[#232323]'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-72">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7280] dark:text-[#A1A1AA]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search subject, faculty, room..."
                  className="w-full h-[40px] pl-10 pr-4 rounded-[10px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#FFFFFF] dark:bg-[#18181B] text-[14px] font-normal text-[#111827] dark:text-[#FAFAFA] outline-none"
                />
              </div>
            </div>

            {/* Vertical Timeline View */}
            <div className="space-y-4 relative before:absolute before:left-3.5 sm:before:left-4 before:top-4 before:bottom-4 before:w-0.5 before:bg-[#E5E7EB] dark:before:bg-[#2A2A2A]">
              {filteredTodayEntries.map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className="relative pl-8 sm:pl-10"
                >
                  <div
                    className={`absolute left-2 sm:left-2.5 top-6 -translate-x-1/2 w-4 h-4 rounded-full border-2 border-white dark:border-[#18181B] shadow-xs z-10 ${
                      item.status === 'Ongoing'
                        ? 'bg-[#111827] dark:bg-[#FAFAFA]'
                        : item.status === 'Completed'
                        ? 'bg-[#9CA3AF]'
                        : 'bg-[#111827] dark:bg-[#FAFAFA]'
                    }`}
                  />

                  <div
                    className={`p-6 rounded-[16px] border transition-all duration-150 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      item.status === 'Ongoing'
                        ? 'bg-[#FFFFFF] dark:bg-[#18181B] border-2 border-[#111827] dark:border-[#FAFAFA]'
                        : 'bg-[#FFFFFF] dark:bg-[#18181B] border border-[#E5E7EB] dark:border-[#2A2A2A]'
                    }`}
                  >
                    <div className="space-y-2 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <h3 className="text-[17px] font-semibold text-[#111827] dark:text-[#FAFAFA] leading-tight">
                          {item.subject_name}
                        </h3>
                        <span className="text-[13px] font-normal text-[#6B7280] dark:text-[#A1A1AA]">({item.subject_code})</span>
                        <span className="px-2.5 py-0.5 rounded-[6px] text-[12px] font-medium bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA]">
                          {item.subject_type}
                        </span>
                      </div>

                      <p className="text-[14px] font-normal text-[#6B7280] dark:text-[#A1A1AA] flex flex-wrap items-center gap-2">
                        <span>Faculty: {item.faculty_name}</span>
                        <span>•</span>
                        <span>Room: {item.classroom}</span>
                        <span>•</span>
                        <span>Time: {item.start_time} - {item.end_time}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-[#E5E7EB] dark:border-[#2A2A2A]">
                      {item.status === 'Upcoming' && (
                        <button
                          onClick={() => handleSetReminder(item)}
                          className="h-[36px] w-full sm:w-auto px-4 rounded-[10px] bg-[#FFFFFF] dark:bg-[#18181B] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[14px] font-medium text-[#111827] dark:text-[#FAFAFA] hover:bg-[#F8FAFC] dark:hover:bg-[#232323] transition flex items-center gap-2 justify-center cursor-pointer"
                        >
                          <Bell size={14} /> Set Reminder
                        </button>
                      )}

                      <span className="px-3 py-1 rounded-[6px] text-[12px] font-medium bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA] flex items-center gap-1.5">
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
          <div className="bg-[#FFFFFF] dark:bg-[#18181B] p-6 rounded-[16px] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs space-y-6">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((d) => (
                <button
                  key={d}
                  onClick={() => setSelectedDay(d)}
                  className={`h-[36px] px-4 rounded-[8px] text-[14px] font-medium transition whitespace-nowrap cursor-pointer ${
                    selectedDay === d
                      ? 'bg-[#111827] text-[#FFFFFF] dark:bg-[#FAFAFA] dark:text-[#111111]'
                      : 'bg-[#FFFFFF] dark:bg-[#18181B] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA] hover:bg-[#F8FAFC] dark:hover:bg-[#232323]'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>

            {/* 3-Col Desktop, 2-Col Tablet, 1-Col Mobile Cards Grid (24px Gap, 24px Padding) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(weeklyData[selectedDay] || []).map((item) => (
                <div
                  key={item.id}
                  className="p-6 rounded-[16px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#FFFFFF] dark:bg-[#18181B] space-y-3 shadow-xs hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-medium text-[#6B7280] dark:text-[#A1A1AA] flex items-center gap-1.5">
                      <Clock3 size={14} /> {item.start_time} - {item.end_time}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-[6px] text-[12px] font-medium bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA]">
                      Period {item.period_number}
                    </span>
                  </div>
                  <h3 className="text-[17px] font-semibold text-[#111827] dark:text-[#FAFAFA] flex items-center gap-2 truncate">
                    <BookOpen size={18} className="shrink-0" /> <span className="truncate">{item.subject_name}</span>
                  </h3>
                  <div className="text-[14px] font-normal text-[#6B7280] dark:text-[#A1A1AA] space-y-1">
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
          <div className="bg-[#FFFFFF] dark:bg-[#18181B] p-6 rounded-[16px] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs space-y-6">
            <h2 className="text-[20px] font-semibold text-[#111827] dark:text-[#FAFAFA] flex items-center gap-2">
              <CalendarDays size={20} />
              <span>Academic Calendar Highlights</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {calendarEvents.map((ev, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-[16px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#FFFFFF] dark:bg-[#18181B] space-y-3 shadow-xs hover:shadow-md transition-all"
                >
                  <span className="px-3 py-1 rounded-[6px] text-[12px] font-medium bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA] inline-block">
                    {ev.type}
                  </span>
                  <h3 className="text-[17px] font-semibold text-[#111827] dark:text-[#FAFAFA]">{ev.title}</h3>
                  <p className="text-[14px] font-normal text-[#6B7280] dark:text-[#A1A1AA] flex items-center gap-1.5">
                    <CalendarDays size={16} /> {ev.date}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODE 4: AI TIMETABLE ASSISTANT & SUGGESTIONS                              */}
        {/* ========================================================================= */}
        {viewMode === 'ai' && (
          <div className="bg-[#FFFFFF] dark:bg-[#18181B] p-6 rounded-[16px] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs space-y-6">
            <h2 className="text-[20px] font-semibold text-[#111827] dark:text-[#FAFAFA] flex items-center gap-2">
              <Brain size={20} />
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
                  className="h-[36px] px-3.5 rounded-[8px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA] text-[13px] font-medium hover:bg-[#FFFFFF] dark:hover:bg-[#232323] transition cursor-pointer"
                >
                  {qp}
                </button>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <input
                type="text"
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                placeholder="Ask any timetable question..."
                className="w-full sm:flex-1 h-[40px] px-4 rounded-[10px] bg-[#FFFFFF] dark:bg-[#18181B] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[14px] font-normal text-[#111827] dark:text-[#FAFAFA] outline-none"
              />
              <button
                onClick={() => handleAskAi()}
                disabled={askingAi}
                className="w-full sm:w-auto h-[40px] px-6 rounded-[10px] bg-[#111827] hover:bg-[#1F2937] dark:bg-[#FAFAFA] dark:hover:bg-[#E5E5E5] text-[#FFFFFF] dark:text-[#111111] font-medium text-[14px] transition cursor-pointer"
              >
                {askingAi ? 'Thinking...' : 'Ask AI'}
              </button>
            </div>

            {aiAnswer && (
              <div className="p-6 rounded-[16px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[14px] font-normal leading-relaxed text-[#374151] dark:text-[#D4D4D4] whitespace-pre-wrap">
                {aiAnswer}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}