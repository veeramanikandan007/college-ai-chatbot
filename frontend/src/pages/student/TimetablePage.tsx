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

import CurrentClassCard from '../../components/timetable/CurrentClassCard';
import NextClassCard from '../../components/timetable/NextClassCard';
import ScheduleStats from '../../components/timetable/ScheduleStats';
import ScheduleFilters from '../../components/timetable/ScheduleFilters';
import TimetableTimeline from '../../components/timetable/TimetableTimeline';
import AISuggestionCard from '../../components/timetable/AISuggestionCard';
import { TimetableItem, AcademicEvent } from '../../components/timetable/types';
import { useCurrentTimetable } from '../../hooks/useCurrentTimetable';

export default function TimetablePage() {
  const [viewMode, setViewMode] = useState<'today' | 'week' | 'calendar' | 'ai'>('today');
  const [selectedDay, setSelectedDay] = useState<string>(
    new Date().toLocaleDateString('en-US', { weekday: 'long' })
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'All' | 'Theory' | 'Lab' | 'Upcoming' | 'Completed'>('All');

  // Timetable Backend State
  const { todayData, loading: todayLoading } = useCurrentTimetable();
  const [weeklyData, setWeeklyData] = useState<Record<string, TimetableItem[]>>({});
  const [calendarEvents, setCalendarEvents] = useState<AcademicEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // AI Assistant State
  const [aiQuery, setAiQuery] = useState('');
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [askingAi, setAskingAi] = useState(false);

  // Reminder Toast State
  const [reminderToast, setReminderToast] = useState<string | null>(null);

  // Fetch Timetable Backend Data (Weekly and Calendar)
  const fetchTimetable = async () => {
    try {
      const [weeklyRes, calRes] = await Promise.all([
        fetch('/api/v1/timetable/weekly'),
        fetch('/api/v1/timetable/calendar'),
      ]);

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

  if (loading || todayLoading || !todayData) {
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
    <div className="w-full h-full overflow-y-auto bg-[#FFFFFF] dark:bg-[#0A0A0A] text-[#111827] dark:text-[#FAFAFA] p-4 md:p-8 transition-colors">
      <div className="w-full max-w-[1600px] mx-auto space-y-8">

        {/* Reminder Notification Banner */}
        <AnimatePresence>
          {reminderToast && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 rounded-[10px] bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] font-medium text-[14px] shadow-xs flex items-center justify-between"
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

        {/* ========================================================================= */}
        {/* 1. SMART TIMETABLE HEADER                                                 */}
        {/* ========================================================================= */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2 border-b border-[#E5E7EB] dark:border-[#2A2A2A] mb-8">
          <div className="space-y-1">
            <h1 className="text-[28px] font-bold text-[#111827] dark:text-[#FAFAFA] tracking-tight">
              Smart Timetable
            </h1>
            <p className="text-[14px] text-[#6B7280] dark:text-[#A3A3A3] font-medium flex items-center gap-2">
              <span>{todayData.current_date}</span>
              <span>•</span>
              <span>{todayData.current_day}</span>
              <span>•</span>
              <span>Semester 6</span>
              <span>•</span>
              <span>CSE</span>
            </p>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
            {[
              { id: 'today', label: "Today's Schedule" },
              { id: 'week', label: 'Weekly View' },
              { id: 'calendar', label: 'Calendar' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setViewMode(tab.id as any)}
                className={`h-9 px-4 rounded-[8px] text-[13px] font-medium transition cursor-pointer whitespace-nowrap ${
                  viewMode === tab.id
                    ? 'bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] shadow-sm'
                    : 'bg-transparent text-[#6B7280] dark:text-[#A3A3A3] hover:bg-[#F3F4F6] dark:hover:bg-[#2A2A2A] hover:text-[#111827] dark:hover:text-[#FAFAFA]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* MODE 1: TODAY'S SMART DASHBOARD                                           */}
        {/* ========================================================================= */}
        {viewMode === 'today' && (
          todayData.today_entries?.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center bg-[#FFFFFF] dark:bg-[#181818] border border-[#E5E7EB] dark:border-[#2A2A2A] rounded-[16px] shadow-[0_2px_8px_rgba(0,0,0,0.05)] mt-4 min-h-[400px]">
              <CalendarRange className="text-[#111827] dark:text-[#FAFAFA] mb-4" size={48} />
              <h2 className="text-[24px] font-bold text-[#111827] dark:text-[#FAFAFA] mb-2">
                No classes scheduled today.
              </h2>
              <p className="text-[16px] text-[#6B7280] dark:text-[#A3A3A3]">
                Enjoy your weekend!
              </p>
            </div>
          ) : (
          <div className="flex flex-col gap-8 md:grid md:grid-cols-2 md:grid-flow-row-dense">
            
            {/* Current Class */}
            <div className="col-span-1 order-1 md:order-none">
              {ongoingClass ? (
                <CurrentClassCard item={ongoingClass} />
              ) : (
                <div className="p-6 rounded-[16px] bg-[#FFFFFF] dark:bg-[#181818] border border-[#E5E7EB] dark:border-[#2A2A2A] flex flex-col justify-center items-center text-center gap-2 h-full min-h-[160px] shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
                  <Sparkles className="text-[#111827] dark:text-[#FAFAFA]" size={24} />
                  <p className="text-[#111827] dark:text-[#FAFAFA] font-bold text-[18px]">No ongoing classes</p>
                  <p className="text-[#6B7280] dark:text-[#A3A3A3] text-[14px]">Enjoy your free time!</p>
                </div>
              )}
            </div>

            {/* Next Class */}
            <div className="col-span-1 order-3 md:order-none">
              {nextClass ? (
                <NextClassCard item={nextClass} />
              ) : (
                <div className="p-6 rounded-[16px] bg-[#FFFFFF] dark:bg-[#181818] border border-[#E5E7EB] dark:border-[#2A2A2A] flex flex-col justify-center items-center text-center gap-2 h-full min-h-[160px] shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
                  <CheckCircle2 className="text-[#111827] dark:text-[#FAFAFA]" size={24} />
                  <p className="text-[#111827] dark:text-[#FAFAFA] font-bold text-[18px]">Classes completed for today.</p>
                  <p className="text-[#6B7280] dark:text-[#A3A3A3] text-[14px]">See you tomorrow!</p>
                </div>
              )}
            </div>

            {/* Statistics */}
            <div className="col-span-1 md:col-span-2 order-4 md:order-none">
              <ScheduleStats stats={todayData.stats} />
            </div>

            {/* Timeline */}
            <div className="col-span-1 md:col-span-2 order-2 md:order-none bg-[#FFFFFF] dark:bg-[#181818] border border-[#E5E7EB] dark:border-[#2A2A2A] rounded-[16px] shadow-sm flex flex-col">
              <div className="px-6 border-b border-[#E5E7EB] dark:border-[#2A2A2A]">
                <ScheduleFilters 
                  entries={todayData.today_entries || []} 
                  activeFilter={activeFilter} 
                  setActiveFilter={setActiveFilter} 
                  searchQuery={searchQuery} 
                  setSearchQuery={setSearchQuery} 
                />
              </div>
              <div className="p-6">
                <TimetableTimeline entries={filteredTodayEntries} />
              </div>
            </div>

            {/* AI Insights */}
            <div className="col-span-1 md:col-span-2 order-5 md:order-none">
              <AISuggestionCard ongoingClass={ongoingClass} nextClass={nextClass} />
            </div>

          </div>
          )
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
              {(!weeklyData[selectedDay] || weeklyData[selectedDay].length === 0) ? (
                <div className="col-span-full p-8 rounded-[12px] border border-dashed border-[#D1D5DB] dark:border-[#3F3F46] flex flex-col items-center justify-center text-center gap-2">
                  <BookOpen className="text-[#9CA3AF] dark:text-[#52525B]" size={32} />
                  <p className="text-[16px] font-medium text-[#111827] dark:text-[#FAFAFA]">No classes scheduled today.</p>
                  <p className="text-[14px] text-[#6B7280] dark:text-[#A3A3A3]">Enjoy your free day!</p>
                </div>
              ) : (
                weeklyData[selectedDay].map((item) => (
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
                ))
              )}
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
