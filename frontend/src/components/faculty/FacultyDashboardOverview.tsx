import React from 'react';
import {
  CalendarDays,
  Users,
  ClipboardCheck,
  FileText,
  Clock,
  Brain,
  Files,
  ArrowRight,
  Bell,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { FacultyDashboardData } from '../../api/faculty';

interface Props {
  data: FacultyDashboardData | null;
  loading: boolean;
  onNavigateTab: (tab: string) => void;
  facultyName?: string;
  department?: string;
}

export const FacultyDashboardOverview: React.FC<Props> = ({
  data,
  loading,
  onNavigateTab,
  facultyName = 'Aris Thorne',
  department = 'Computer Science & Engineering',
}) => {
  if (loading || !data) {
    return (
      <div className="space-y-6 animate-pulse font-body">
        <div className="h-36 rounded-2xl bg-slate-200 dark:bg-slate-800" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-slate-200 dark:bg-slate-800" />
          ))}
        </div>
        <div className="h-64 rounded-2xl bg-slate-200 dark:bg-slate-800" />
      </div>
    );
  }

  const { stats, today_schedule, notifications } = data;

  // Determine Time of Day Greeting
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good Morning' : currentHour < 17 ? 'Good Afternoon' : 'Good Evening';
  const currentDateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const quickStats = [
    {
      title: "Today's Classes",
      value: stats.today_classes_count,
      icon: CalendarDays,
      color: 'text-[#0E2A6D] dark:text-[#60A5FA]',
      bg: 'bg-[#0E2A6D]/10 dark:bg-[#0E2A6D]/30',
      action: () => onNavigateTab('timetable'),
    },
    {
      title: 'Pending Attendance',
      value: stats.today_classes_count > 0 ? 1 : 0,
      icon: ClipboardCheck,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-500/10',
      action: () => onNavigateTab('attendance'),
    },
    {
      title: 'Assignments to Review',
      value: stats.pending_submissions_count,
      icon: FileText,
      color: 'text-[#1E4DB7] dark:text-[#60A5FA]',
      bg: 'bg-[#1E4DB7]/10',
      action: () => onNavigateTab('assignments'),
    },
    {
      title: 'Upcoming Quizzes',
      value: 2,
      icon: Brain,
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-500/10',
      action: () => onNavigateTab('quizzes'),
    },
    {
      title: 'Student Count',
      value: stats.total_assigned_students,
      icon: Users,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-500/10',
      action: () => onNavigateTab('students'),
    },
  ];

  const pendingTaskActions = [
    { title: 'Mark Attendance', desc: 'Submit period attendance for today', icon: ClipboardCheck, color: 'text-emerald-600', tab: 'attendance' },
    { title: 'Review Assignments', desc: 'Evaluate student submitted files', icon: FileText, color: 'text-[#1E4DB7]', tab: 'assignments' },
    { title: 'Prepare Quiz', desc: 'Create AI or custom MCQ tests', icon: Brain, color: 'text-purple-600', tab: 'quizzes' },
    { title: 'Upload Question Papers', desc: 'Add model exam question papers', icon: Files, color: 'text-[#D9A441]', tab: 'question-papers' },
    { title: 'Student Requests', desc: 'View assigned student roster & grades', icon: Users, color: 'text-[#0E2A6D]', tab: 'students' },
  ];

  return (
    <div className="space-y-6 font-body">
      {/* ── Welcome Hero Banner ── */}
      <div className="bg-gradient-to-r from-[#0E2A6D] via-[#153B8A] to-[#1E4DB7] p-6 sm:p-8 rounded-2xl text-white shadow-md space-y-2 border border-[#D9A441]/20 relative overflow-hidden">
        <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-10 pointer-events-none">
          <Sparkles size={180} />
        </div>

        <div className="relative z-10 space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-caption font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs text-[#D9A441]">
              Faculty Cockpit
            </span>
            <span className="text-caption text-white/80 font-medium">{currentDateStr}</span>
          </div>

          <h2 className="font-heading font-extrabold text-2xl sm:text-3xl tracking-wide pt-1">
            {greeting}, Dr. {facultyName}
          </h2>
          <p className="text-body text-white/90 max-w-2xl">
            Department of {department}. Here is your academic schedule, teaching tasks, and pending reviews for today.
          </p>
        </div>
      </div>

      {/* ── Quick Statistics (5 Cards) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {quickStats.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              onClick={item.action}
              className="bg-white dark:bg-[#1E293B] p-5 rounded-2xl border border-[#E2E8F0] dark:border-[#334155] shadow-xs flex items-center justify-between gap-3 hover:border-[#1E4DB7]/40 transition cursor-pointer group"
            >
              <div>
                <p className="text-caption font-medium text-[#64748B] dark:text-[#94A3B8]">{item.title}</p>
                <p className="font-heading font-bold text-2xl text-[#1F2937] dark:text-[#F8FAFC] mt-0.5">{item.value}</p>
              </div>

              <div className={`w-11 h-11 rounded-xl ${item.bg} ${item.color} flex items-center justify-center shrink-0 group-hover:scale-105 transition`}>
                <Icon size={22} strokeWidth={1.75} />
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Today's Schedule Grid & Pending Tasks ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Schedule (2 cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-[#1E293B] p-6 rounded-2xl border border-[#E2E8F0] dark:border-[#334155] shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#334155] pb-4">
            <h3 className="font-heading font-bold text-card text-[#1F2937] dark:text-[#F8FAFC] flex items-center gap-2">
              <Clock className="text-[#0E2A6D] dark:text-[#60A5FA]" size={20} />
              Today's Teaching Schedule
            </h3>
            <button
              onClick={() => onNavigateTab('timetable')}
              className="text-caption text-[#1E4DB7] dark:text-[#60A5FA] font-bold hover:underline flex items-center gap-1"
            >
              Full Timetable <ArrowRight size={14} />
            </button>
          </div>

          <div className="space-y-3">
            {today_schedule.length === 0 ? (
              <div className="py-8 text-center text-caption text-[#64748B] space-y-2">
                <CheckCircle2 size={24} className="mx-auto text-emerald-500 opacity-60" />
                <p>No more classes scheduled for today.</p>
              </div>
            ) : (
              today_schedule.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="p-4 rounded-xl bg-[#F5F7FB] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-xl bg-[#0E2A6D] text-white font-heading font-bold text-caption flex items-center justify-center shrink-0">
                      P{item.period_number}
                    </span>
                    <div>
                      <h4 className="font-heading font-bold text-body text-[#1F2937] dark:text-[#F8FAFC]">
                        {item.subject_name} ({item.subject_code})
                      </h4>
                      <p className="text-caption text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                        Section: <strong>{item.section}</strong> · Room: <strong>{item.classroom}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 sm:text-right">
                    <span className="font-mono text-caption font-bold text-[#0E2A6D] dark:text-[#60A5FA] bg-[#0E2A6D]/10 px-2.5 py-1 rounded-lg">
                      {item.start_time} - {item.end_time}
                    </span>
                    <button
                      onClick={() => onNavigateTab('attendance')}
                      className="h-8 px-3 rounded-lg bg-[#0E2A6D] hover:bg-[#153B8A] text-white text-caption font-bold shrink-0 transition"
                    >
                      Attendance
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ── Pending Tasks Action Cards (1 col) ── */}
        <div className="bg-white dark:bg-[#1E293B] p-6 rounded-2xl border border-[#E2E8F0] dark:border-[#334155] shadow-xs space-y-4">
          <h3 className="font-heading font-bold text-card text-[#1F2937] dark:text-[#F8FAFC] flex items-center gap-2 border-b border-[#E2E8F0] dark:border-[#334155] pb-4">
            <ClipboardCheck className="text-amber-500" size={20} />
            Quick Academic Actions
          </h3>

          <div className="space-y-3">
            {pendingTaskActions.map((act, idx) => {
              const Icon = act.icon;
              return (
                <div
                  key={idx}
                  onClick={() => onNavigateTab(act.tab)}
                  className="p-3.5 rounded-xl bg-[#F5F7FB] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] hover:border-[#1E4DB7]/40 flex items-center justify-between gap-3 transition cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-white dark:bg-[#1E293B] ${act.color} shadow-xs shrink-0`}>
                      <Icon size={18} />
                    </div>
                    <div>
                      <h4 className="font-heading font-bold text-caption text-[#1F2937] dark:text-[#F8FAFC] group-hover:text-[#1E4DB7] transition">
                        {act.title}
                      </h4>
                      <p className="text-small text-[#64748B] dark:text-[#94A3B8]">{act.desc}</p>
                    </div>
                  </div>
                  <ArrowRight size={16} className="text-[#64748B] group-hover:translate-x-1 transition shrink-0" />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Department & Campus Announcements ── */}
      <div className="bg-white dark:bg-[#1E293B] p-6 rounded-2xl border border-[#E2E8F0] dark:border-[#334155] shadow-xs space-y-4">
        <h3 className="font-heading font-bold text-card text-[#1F2937] dark:text-[#F8FAFC] flex items-center gap-2 border-b border-[#E2E8F0] dark:border-[#334155] pb-4">
          <Bell className="text-[#D9A441]" size={20} />
          Department Notices & Campus Notifications
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {notifications.map((n) => (
            <div
              key={n.id}
              className="p-4 rounded-xl bg-[#F5F7FB] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-caption font-bold px-2.5 py-0.5 rounded bg-[#0E2A6D]/10 text-[#0E2A6D] dark:text-[#60A5FA]">
                  {n.type || 'Notice'}
                </span>
                <span className="text-small text-[#64748B]">{n.time}</span>
              </div>
              <h4 className="font-heading font-bold text-body text-[#1F2937] dark:text-[#F8FAFC]">{n.title}</h4>
              <p className="text-caption text-[#475569] dark:text-[#CBD5E1]">{n.message}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
