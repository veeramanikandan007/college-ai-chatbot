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
      color: 'text-[#111827] dark:text-[#FAFAFA]',
      bg: 'bg-[#F8FAFC] dark:bg-[#111111]',
      action: () => onNavigateTab('timetable'),
    },
    {
      title: 'Pending Attendance',
      value: stats.today_classes_count > 0 ? 1 : 0,
      icon: ClipboardCheck,
      color: 'text-[#111827] dark:text-[#FAFAFA]',
      bg: 'bg-[#F8FAFC] dark:bg-[#111111]',
      action: () => onNavigateTab('attendance'),
    },
    {
      title: 'Assignments to Review',
      value: stats.pending_submissions_count,
      icon: FileText,
      color: 'text-[#111827] dark:text-[#FAFAFA]',
      bg: 'bg-[#F8FAFC] dark:bg-[#111111]',
      action: () => onNavigateTab('assignments'),
    },
    {
      title: 'Upcoming Quizzes',
      value: 2,
      icon: Brain,
      color: 'text-[#111827] dark:text-[#FAFAFA]',
      bg: 'bg-[#F8FAFC] dark:bg-[#111111]',
      action: () => onNavigateTab('quizzes'),
    },
    {
      title: 'Student Count',
      value: stats.total_assigned_students,
      icon: Users,
      color: 'text-[#111827] dark:text-[#FAFAFA]',
      bg: 'bg-[#F8FAFC] dark:bg-[#111111]',
      action: () => onNavigateTab('students'),
    },
  ];

  const pendingTaskActions = [
    { title: 'Mark Attendance', desc: 'Submit period attendance for today', icon: ClipboardCheck, color: 'text-[#111827] dark:text-[#FAFAFA]', tab: 'attendance' },
    { title: 'Review Assignments', desc: 'Evaluate student submitted files', icon: FileText, color: 'text-[#111827] dark:text-[#FAFAFA]', tab: 'assignments' },
    { title: 'Prepare Quiz', desc: 'Create AI or custom MCQ tests', icon: Brain, color: 'text-[#111827] dark:text-[#FAFAFA]', tab: 'quizzes' },
    { title: 'Upload Question Papers', desc: 'Add model exam question papers', icon: Files, color: 'text-[#111827] dark:text-[#FAFAFA]', tab: 'question-papers' },
    { title: 'Student Requests', desc: 'View assigned student roster & grades', icon: Users, color: 'text-[#111827] dark:text-[#FAFAFA]', tab: 'students' },
  ];

  return (
    <div className="space-y-8 font-sans">
      {/* ── Welcome Hero Banner ── */}
      <div className="bg-[#FFFFFF] dark:bg-[#18181B] p-6 rounded-[16px] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden">
        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-medium px-2.5 py-0.5 rounded-[6px] bg-[#F8FAFC] dark:bg-[#111111] text-[#111827] dark:text-[#FAFAFA] border border-[#E5E7EB] dark:border-[#2A2A2A]">
              Faculty Cockpit
            </span>
            <span className="text-[12px] text-[#6B7280] dark:text-[#A1A1AA] font-normal">{currentDateStr}</span>
          </div>

          <h2 className="text-[26px] sm:text-[30px] font-semibold text-[#111827] dark:text-[#FAFAFA] tracking-tight leading-tight pt-1">
            {greeting}, Dr. {facultyName}
          </h2>
          <p className="text-[15px] font-normal text-[#6B7280] dark:text-[#A1A1AA] max-w-2xl">
            Department of {department}. Here is your academic schedule, teaching tasks, and pending reviews for today.
          </p>
        </div>
      </div>

      {/* ── Quick Statistics (5 Cards) — Identical to AIWorkspace Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
        {quickStats.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              onClick={item.action}
              className="p-6 rounded-[16px] bg-[#FFFFFF] dark:bg-[#18181B] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs flex items-center justify-between hover:border-[#111827]/30 dark:hover:border-[#FAFAFA]/30 transition cursor-pointer group"
            >
              <div className="min-w-0 flex-1 space-y-1">
                <p className="text-[14px] font-normal text-[#6B7280] dark:text-[#A1A1AA] truncate">{item.title}</p>
                <p className="text-[28px] font-semibold text-[#111827] dark:text-[#FAFAFA] leading-tight truncate">{item.value}</p>
                <p className="text-[12px] font-normal text-[#6B7280] dark:text-[#A1A1AA] truncate">Click to inspect</p>
              </div>

              <div className="w-10 h-10 rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA] flex items-center justify-center shrink-0 ml-3 group-hover:scale-105 transition">
                <Icon size={20} />
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Today's Schedule Grid & Pending Tasks ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Schedule (2 cols) */}
        <div className="lg:col-span-2 bg-[#FFFFFF] dark:bg-[#18181B] p-6 rounded-[16px] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5E7EB] dark:border-[#2A2A2A] pb-4">
            <h3 className="text-[18px] font-semibold text-[#111827] dark:text-[#FAFAFA] flex items-center gap-2">
              <Clock className="text-[#111827] dark:text-[#FAFAFA]" size={20} />
              Today's Teaching Schedule
            </h3>
            <button
              onClick={() => onNavigateTab('timetable')}
              className="text-[14px] font-medium text-[#111827] dark:text-[#FAFAFA] hover:underline flex items-center gap-1 cursor-pointer"
            >

              Full Timetable <ArrowRight size={14} />
            </button>
          </div>

          <div className="space-y-3">
            {today_schedule.length === 0 ? (
              <div className="py-8 text-center text-[14px] font-normal text-[#525252] space-y-2">
                <CheckCircle2 size={24} className="mx-auto text-[#525252] opacity-60" />
                <p>No more classes scheduled for today.</p>
              </div>
            ) : (
              today_schedule.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="p-4 rounded-[12px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-[10px] bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] font-bold text-[14px] flex items-center justify-center shrink-0">
                      P{item.period_number}
                    </span>
                    <div>
                      <h4 className="text-[16px] font-bold text-[#111827] dark:text-[#FAFAFA]">
                        {item.subject_name} ({item.subject_code})
                      </h4>
                      <p className="text-[14px] font-normal text-[#6B7280] dark:text-[#A1A1AA] mt-0.5">
                        Section: <strong className="text-[#111827] dark:text-[#FAFAFA]">{item.section}</strong> · Room: <strong className="text-[#111827] dark:text-[#FAFAFA]">{item.classroom}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 sm:text-right">
                    <span className="font-mono text-[13px] font-semibold text-[#111827] dark:text-[#FAFAFA] bg-[#FFFFFF] dark:bg-[#18181B] px-2.5 py-1 rounded-[8px] border border-[#E5E7EB] dark:border-[#2A2A2A]">
                      {item.start_time} - {item.end_time}
                    </span>
                    <button
                      onClick={() => onNavigateTab('attendance')}
                      className="h-8 px-3.5 rounded-[8px] bg-[#111827] hover:bg-[#1F2937] dark:bg-[#FAFAFA] dark:hover:bg-[#E5E5E5] text-[#FFFFFF] dark:text-[#111111] text-[14px] font-medium shrink-0 transition cursor-pointer"
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
        <div className="bg-[#FFFFFF] dark:bg-[#18181B] p-6 rounded-[16px] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs space-y-4">
          <h3 className="text-[18px] font-semibold text-[#111827] dark:text-[#FAFAFA] flex items-center gap-2 border-b border-[#E5E7EB] dark:border-[#2A2A2A] pb-4">
            <ClipboardCheck className="text-[#6B7280] dark:text-[#A1A1AA]" size={20} />
            Quick Academic Actions
          </h3>

          <div className="space-y-3">
            {pendingTaskActions.map((act, idx) => {
              const Icon = act.icon;
              return (
                <div
                  key={idx}
                  onClick={() => onNavigateTab(act.tab)}
                  className="p-3.5 rounded-[12px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] hover:border-[#111827]/30 dark:hover:border-[#FAFAFA]/30 flex items-center justify-between gap-3 transition cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-[8px] bg-[#FFFFFF] dark:bg-[#18181B] text-[#111827] dark:text-[#FAFAFA] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs shrink-0">
                      <Icon size={18} />
                    </div>
                    <div>
                      <h4 className="text-[15px] font-semibold text-[#111827] dark:text-[#FAFAFA] transition">
                        {act.title}
                      </h4>
                      <p className="text-[13px] font-normal text-[#6B7280] dark:text-[#A1A1AA]">{act.desc}</p>
                    </div>
                  </div>
                  <ArrowRight size={16} className="text-[#6B7280] dark:text-[#A1A1AA] group-hover:translate-x-1 transition shrink-0" />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Department & Campus Announcements ── */}
      <div className="bg-[#FFFFFF] dark:bg-[#18181B] p-6 rounded-[16px] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs space-y-4">
        <h3 className="text-[18px] font-semibold text-[#111827] dark:text-[#FAFAFA] flex items-center gap-2 border-b border-[#E5E7EB] dark:border-[#2A2A2A] pb-4">
          <Bell className="text-[#6B7280] dark:text-[#A1A1AA]" size={20} />
          Department Notices & Campus Notifications
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {notifications.map((n) => (
            <div
              key={n.id}
              className="p-4 rounded-[12px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-medium px-2 py-0.5 rounded-[6px] bg-[#FFFFFF] dark:bg-[#18181B] text-[#111827] dark:text-[#FAFAFA] border border-[#E5E7EB] dark:border-[#2A2A2A]">
                  {n.type || 'Notice'}
                </span>
                <span className="text-[12px] text-[#6B7280] dark:text-[#A1A1AA] font-normal">{n.time}</span>
              </div>
              <h4 className="font-semibold text-[15px] text-[#111827] dark:text-[#FAFAFA]">{n.title}</h4>
              <p className="text-[13px] font-normal text-[#6B7280] dark:text-[#A1A1AA]">{n.message}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
