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
  MapPinned,
  Timer,
  CircleCheck,
  CircleAlert,
  CircleX,
  CalendarRange,
  NotebookTabs,
  History,
  RefreshCw,
  Download,
  Upload,
  Settings2,
  Search,
  Filter,
  Bell,
  Brain,
  ChevronLeft,
  ChevronRight,
  Layers,
  Sparkles,
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
      <div className="w-full h-full flex items-center justify-center bg-[#F8FAFC] dark:bg-[#0B0F19]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#0E2A6D] border-t-transparent dark:border-[#D9A441]" />
          <p className="text-sm font-semibold text-[#64748B] dark:text-[#94A3B8]">
            Loading Smart Timetable...
          </p>
        </div>
      </div>
    );
  }

  const ongoingClass: TimetableItem | null = todayData.ongoing_class;
  const nextClass: TimetableItem | null = todayData.next_class;

  return (
    <div className="w-full h-full overflow-y-auto bg-[#F8FAFC] dark:bg-[#0B0F19] text-[#1E293B] dark:text-[#F8FAFC] p-3 sm:p-6 md:p-8 font-body transition-colors duration-300">
      <div className="w-full max-w-[1600px] mx-auto space-y-6">

        {/* Reminder Notification Banner */}
        <AnimatePresence>
          {reminderToast && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 rounded-2xl bg-emerald-600 text-white font-bold text-xs shadow-lg flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <Bell size={18} />
                <span>{reminderToast}</span>
              </div>
              <button onClick={() => setReminderToast(null)}>
                <CircleX size={18} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ========================================================================= */}
        {/* HEADER BAR & STATUS OVERVIEW (LUCIDE ICONS ONLY, NO EMOJIS)               */}
        {/* ========================================================================= */}
        <div className="bg-white dark:bg-[#111827] p-5 sm:p-6 rounded-2xl border border-[#E2E8F0] dark:border-[#1E293B] shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0E2A6D] to-[#1E4DB7] text-white flex items-center justify-center shadow-md border border-[#D9A441]/30 shrink-0">
                <CalendarDays size={30} strokeWidth={1.75} />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="font-heading font-extrabold text-2xl md:text-3xl text-[#0E2A6D] dark:text-white tracking-wide">
                    Smart Timetable
                  </h1>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#D9A441]/20 text-[#0E2A6D] dark:text-[#D9A441] font-bold border border-[#D9A441]/30 flex items-center gap-1">
                    <School size={13} /> CSE • <GraduationCap size={13} /> Sem 6 • Sec A
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#94A3B8] mt-0.5 flex items-center gap-2">
                  <span className="flex items-center gap-1"><CalendarDays size={14} /> {todayData.current_date}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1"><Clock3 size={14} /> {todayData.current_day} ({todayData.current_time})</span>
                </p>
              </div>
            </div>

            {/* View Selector Tabs */}
            <div className="flex items-center bg-[#F1F5F9] dark:bg-[#1E293B] p-1 rounded-xl shrink-0 overflow-x-auto">
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
                    className={`px-3.5 py-2 text-xs font-bold rounded-lg transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                      isActive
                        ? 'bg-[#0E2A6D] text-white shadow-xs'
                        : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0E2A6D] dark:hover:text-white'
                    }`}
                  >
                    <Icon size={15} />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Ongoing & Next Class Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Ongoing Class */}
            {ongoingClass && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-[#1E4DB7]/10 to-[#0E2A6D]/10 border-2 border-[#1E4DB7] dark:border-[#60A5FA] flex items-center justify-between shadow-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600"></span>
                    </span>
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#1E4DB7] dark:text-[#60A5FA] flex items-center gap-1">
                      <CircleAlert size={14} /> Ongoing Class Right Now
                    </span>
                  </div>
                  <h3 className="font-heading font-bold text-base text-[#0E2A6D] dark:text-white flex items-center gap-1.5">
                    <BookOpen size={16} className="text-[#1E4DB7]" /> {ongoingClass.subject_name}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-[#64748B] font-semibold">
                    <span className="flex items-center gap-1"><UserRound size={14} /> {ongoingClass.faculty_name}</span>
                    <span className="flex items-center gap-1"><Building2 size={14} /> {ongoingClass.classroom}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-bold text-[#1E4DB7] dark:text-[#60A5FA] flex items-center gap-1 justify-end">
                    <Clock3 size={14} /> {ongoingClass.start_time} - {ongoingClass.end_time}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1E4DB7] text-white font-bold inline-block mt-1">
                    {ongoingClass.subject_type}
                  </span>
                </div>
              </div>
            )}

            {/* Next Class */}
            {nextClass && (
              <div className="p-4 rounded-2xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] flex items-center justify-between shadow-xs">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] flex items-center gap-1">
                    <Timer size={14} className="text-[#D9A441]" /> Next Up
                  </span>
                  <h3 className="font-heading font-bold text-base text-[#0E2A6D] dark:text-white flex items-center gap-1.5">
                    <BookOpen size={16} className="text-[#D9A441]" /> {nextClass.subject_name}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-[#64748B] font-semibold">
                    <span className="flex items-center gap-1"><UserRound size={14} /> {nextClass.faculty_name}</span>
                    <span className="flex items-center gap-1"><Building2 size={14} /> {nextClass.classroom}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-bold text-[#0E2A6D] dark:text-white block">
                    Starts at {nextClass.start_time}
                  </span>
                  <button
                    onClick={() => handleSetReminder(nextClass)}
                    className="mt-1 px-2.5 py-1 rounded-lg bg-[#D9A441]/20 text-[#0E2A6D] dark:text-[#D9A441] text-[10px] font-bold border border-[#D9A441]/30 hover:bg-[#D9A441]/30 transition flex items-center gap-1 justify-end cursor-pointer"
                  >
                    <Bell size={12} /> Set Reminder
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* MODE 1: TODAY'S SCHEDULE & VERTICAL TIMELINE                              */}
        {/* ========================================================================= */}
        {viewMode === 'today' && (
          <div className="space-y-6">
            {/* Statistics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              <div className="bg-white dark:bg-[#111827] p-4 rounded-2xl border border-[#E2E8F0] dark:border-[#1E293B] shadow-xs space-y-1">
                <span className="text-[11px] text-[#64748B] font-bold uppercase flex items-center gap-1">
                  <BookOpen size={13} /> Total Classes
                </span>
                <div className="text-2xl font-extrabold font-heading text-[#0E2A6D] dark:text-white">
                  {todayData.stats.total_classes}
                </div>
              </div>
              <div className="bg-white dark:bg-[#111827] p-4 rounded-2xl border border-[#E2E8F0] dark:border-[#1E293B] shadow-xs space-y-1">
                <span className="text-[11px] text-[#64748B] font-bold uppercase flex items-center gap-1">
                  <NotebookTabs size={13} /> Theory
                </span>
                <div className="text-2xl font-extrabold font-heading text-[#1E4DB7]">
                  {todayData.stats.theory_count}
                </div>
              </div>
              <div className="bg-white dark:bg-[#111827] p-4 rounded-2xl border border-[#E2E8F0] dark:border-[#1E293B] shadow-xs space-y-1">
                <span className="text-[11px] text-[#64748B] font-bold uppercase flex items-center gap-1">
                  <Building2 size={13} /> Labs
                </span>
                <div className="text-2xl font-extrabold font-heading text-purple-600">
                  {todayData.stats.lab_count}
                </div>
              </div>
              <div className="bg-white dark:bg-[#111827] p-4 rounded-2xl border border-[#E2E8F0] dark:border-[#1E293B] shadow-xs space-y-1">
                <span className="text-[11px] text-[#64748B] font-bold uppercase flex items-center gap-1">
                  <Clock3 size={13} /> Total Hours
                </span>
                <div className="text-2xl font-extrabold font-heading text-emerald-600">
                  {todayData.stats.total_hours} hrs
                </div>
              </div>
              <div className="bg-white dark:bg-[#111827] p-4 rounded-2xl border border-[#E2E8F0] dark:border-[#1E293B] shadow-xs space-y-1">
                <span className="text-[11px] text-[#64748B] font-bold uppercase flex items-center gap-1">
                  <Timer size={13} /> Free Periods
                </span>
                <div className="text-2xl font-extrabold font-heading text-[#D9A441]">
                  {todayData.stats.free_periods}
                </div>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-[#111827] p-4 rounded-2xl border border-[#E2E8F0] dark:border-[#1E293B] shadow-xs">
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                {(['All', 'Theory', 'Lab', 'Upcoming', 'Completed'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                      activeFilter === filter
                        ? 'bg-[#0E2A6D] text-white'
                        : 'bg-[#F8FAFC] dark:bg-[#1E293B] text-[#64748B]'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-64">
                <Search size={16} className="absolute left-3 top-2.5 text-[#64748B]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search subject, faculty, room..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-xs font-semibold outline-none focus:border-[#1E4DB7]"
                />
              </div>
            </div>

            {/* Vertical Timeline View */}
            <div className="space-y-4 relative before:absolute before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#E2E8F0] dark:before:bg-[#334155]">
              {filteredTodayEntries.map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="relative pl-10"
                >
                  <div
                    className={`absolute left-2.5 top-5 -translate-x-1/2 w-4 h-4 rounded-full border-2 border-white dark:border-[#111827] shadow-xs z-10 ${
                      item.status === 'Ongoing'
                        ? 'bg-blue-600 ring-4 ring-blue-500/20'
                        : item.status === 'Completed'
                        ? 'bg-slate-400'
                        : 'bg-emerald-500'
                    }`}
                  />

                  <div
                    className={`p-5 rounded-2xl border transition shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      item.status === 'Ongoing'
                        ? 'bg-white dark:bg-[#111827] border-2 border-[#1E4DB7] dark:border-[#60A5FA] shadow-md'
                        : item.status === 'Completed'
                        ? 'bg-[#F8FAFC] dark:bg-[#111827]/40 border-[#E2E8F0] dark:border-[#1E293B] opacity-75'
                        : 'bg-white dark:bg-[#111827] border-[#E2E8F0] dark:border-[#1E293B]'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: item.color_code }}
                        />
                        <span className="font-heading font-extrabold text-lg text-[#0E2A6D] dark:text-white">
                          {item.subject_name}
                        </span>
                        <span className="text-xs font-bold text-[#64748B]">({item.subject_code})</span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            item.subject_type === 'Lab'
                              ? 'bg-purple-500/10 text-purple-600'
                              : 'bg-blue-500/10 text-blue-600'
                          }`}
                        >
                          {item.subject_type}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-[#64748B] font-semibold">
                        <span className="flex items-center gap-1"><UserRound size={14} /> {item.faculty_name}</span>
                        <span className="flex items-center gap-1"><Building2 size={14} /> {item.classroom}</span>
                        <span className="flex items-center gap-1"><Clock3 size={14} /> {item.start_time} - {item.end_time}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {item.status === 'Upcoming' && (
                        <button
                          onClick={() => handleSetReminder(item)}
                          className="px-3.5 py-2 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-xs font-bold text-[#0E2A6D] dark:text-[#D9A441] hover:border-[#D9A441] transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <Bell size={14} /> Set Reminder
                        </button>
                      )}

                      <span
                        className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1 ${
                          item.status === 'Ongoing'
                            ? 'bg-blue-600 text-white shadow-xs'
                            : item.status === 'Completed'
                            ? 'bg-slate-200 dark:bg-slate-800 text-[#64748B]'
                            : 'bg-emerald-500/10 text-emerald-600'
                        }`}
                      >
                        {item.status === 'Ongoing' && <CircleAlert size={13} />}
                        {item.status === 'Completed' && <CircleCheck size={13} />}
                        {item.status === 'Upcoming' && <Clock3 size={13} />}
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
          <div className="bg-white dark:bg-[#111827] p-6 rounded-2xl border border-[#E2E8F0] dark:border-[#1E293B] shadow-xs space-y-6">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((d) => (
                <button
                  key={d}
                  onClick={() => setSelectedDay(d)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                    selectedDay === d
                      ? 'bg-[#0E2A6D] text-white shadow-xs'
                      : 'bg-[#F8FAFC] dark:bg-[#1E293B] text-[#64748B]'
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
                  className="p-5 rounded-2xl border border-[#E2E8F0] dark:border-[#1E293B] bg-[#F8FAFC] dark:bg-[#1E293B]/40 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#1E4DB7] flex items-center gap-1">
                      <Clock3 size={13} /> {item.start_time} - {item.end_time}
                    </span>
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-bold text-white"
                      style={{ backgroundColor: item.color_code }}
                    >
                      Period {item.period_number}
                    </span>
                  </div>
                  <h4 className="font-heading font-bold text-base text-[#0E2A6D] dark:text-white flex items-center gap-1.5">
                    <BookOpen size={16} style={{ color: item.color_code }} /> {item.subject_name}
                  </h4>
                  <div className="text-xs text-[#64748B] space-y-1">
                    <p className="flex items-center gap-1"><UserRound size={13} /> {item.faculty_name}</p>
                    <p className="flex items-center gap-1"><Building2 size={13} /> {item.classroom}</p>
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
          <div className="bg-white dark:bg-[#111827] p-6 rounded-2xl border border-[#E2E8F0] dark:border-[#1E293B] shadow-xs space-y-6">
            <h2 className="font-heading font-bold text-xl text-[#0E2A6D] dark:text-white flex items-center gap-2">
              <CalendarDays size={22} className="text-[#D9A441]" />
              Academic Calendar Highlights
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {calendarEvents.map((ev, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl border border-[#E2E8F0] dark:border-[#1E293B] bg-[#F8FAFC] dark:bg-[#1E293B]/40 space-y-2"
                >
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      ev.type === 'Class Day'
                        ? 'bg-blue-500/10 text-blue-600'
                        : ev.type === 'Exam Day'
                        ? 'bg-rose-500/10 text-rose-600'
                        : ev.type === 'Holiday'
                        ? 'bg-amber-500/10 text-amber-600'
                        : 'bg-purple-500/10 text-purple-600'
                    }`}
                  >
                    {ev.type}
                  </span>
                  <h3 className="font-bold text-sm text-[#0E2A6D] dark:text-white">{ev.title}</h3>
                  <p className="text-xs text-[#64748B] flex items-center gap-1"><CalendarDays size={13} /> {ev.date}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODE 4: AI TIMETABLE ASSISTANT                                            */}
        {/* ========================================================================= */}
        {viewMode === 'ai' && (
          <div className="bg-white dark:bg-[#111827] p-6 rounded-2xl border border-[#E2E8F0] dark:border-[#1E293B] shadow-xs space-y-6">
            <h2 className="font-heading font-bold text-xl text-[#0E2A6D] dark:text-white flex items-center gap-2">
              <Brain size={22} className="text-[#1E4DB7]" />
              AI Timetable Assistant
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
                  className="px-3 py-1.5 rounded-xl bg-[#1E4DB7]/10 text-[#1E4DB7] dark:text-[#60A5FA] text-xs font-semibold hover:bg-[#1E4DB7]/20 transition cursor-pointer"
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
                className="flex-1 p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-xs outline-none focus:border-[#1E4DB7]"
              />
              <button
                onClick={() => handleAskAi()}
                disabled={askingAi}
                className="px-6 py-3 rounded-xl bg-[#0E2A6D] text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Brain size={15} />
                {askingAi ? 'Thinking...' : 'Ask AI'}
              </button>
            </div>

            {aiAnswer && (
              <div className="p-6 rounded-2xl bg-[#F8FAFC] dark:bg-[#1E293B]/40 border border-[#E2E8F0] dark:border-[#334155] text-xs leading-relaxed space-y-2 whitespace-pre-wrap">
                {aiAnswer}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
