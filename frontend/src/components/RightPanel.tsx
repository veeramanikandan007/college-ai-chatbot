import { motion } from 'framer-motion';
import {
  BarChart3,
  CheckCircle2,
  Award,
  CreditCard,
  Megaphone,
  Zap,
  ArrowRight,
} from 'lucide-react';

interface RightPanelProps {
  attendancePercent?: number;
  cgpa?: number;
  onSelectPrompt: (promptText: string) => void;
}

export default function RightPanel({
  attendancePercent = 94,
  cgpa = 8.9,
  onSelectPrompt,
}: RightPanelProps) {
  return (
    <aside className="hidden w-80 shrink-0 border-l border-[#E2E8F0] dark:border-slate-800 bg-white dark:bg-slate-950 p-5 lg:block overflow-y-auto select-none">
      {/* Student Overview Widget */}
      <div className="rounded-2xl border border-[#E2E8F0] dark:border-slate-800 bg-gradient-to-b from-[#F8FAFC] to-white dark:from-slate-900 dark:to-slate-950 p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.24em] text-[#163D8C] dark:text-secondary">
            <BarChart3 className="h-4 w-4" />
            <span>Student Stats</span>
          </div>
          <span className="rounded-full bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
            Active
          </span>
        </div>

        {/* Progress Gauge */}
        <div className="mt-4 flex items-center gap-4">
          <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-[#0A2A6A]/5 dark:bg-secondary/10 border-4 border-[#0A2A6A] dark:border-secondary">
            <span className="text-sm font-bold text-[#0A2A6A] dark:text-slate-100">{attendancePercent}%</span>
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#0A2A6A] dark:text-slate-100">Attendance</h4>
            <p className="text-xs text-[#64748B] dark:text-slate-400">Semester 6 • CS Dept</p>
            <div className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Above 75% threshold</span>
            </div>
          </div>
        </div>

        {/* CGPA Card */}
        <div className="mt-4 grid grid-cols-2 gap-2 text-center">
          <div className="rounded-xl border border-[#E2E8F0] dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 shadow-2xs">
            <div className="flex items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#64748B] dark:text-slate-400">
              <Award className="h-3 w-3 text-amber-500" />
              <span>CGPA</span>
            </div>
            <p className="text-lg font-bold text-[#0A2A6A] dark:text-slate-100">{cgpa}</p>
          </div>
          <div className="rounded-xl border border-[#E2E8F0] dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 shadow-2xs">
            <div className="flex items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#64748B] dark:text-slate-400">
              <CreditCard className="h-3 w-3 text-emerald-500" />
              <span>Fees</span>
            </div>
            <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">Clear</p>
          </div>
        </div>
      </div>

      {/* Notice Board */}
      <div className="mt-5 space-y-3">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.2em] text-[#163D8C] dark:text-secondary">
          <Megaphone className="h-4 w-4" />
          <span>Campus Notices</span>
        </div>

        <div className="rounded-xl border border-[#E2E8F0] dark:border-slate-800 bg-[#F8FAFC] dark:bg-slate-900 p-3 text-xs text-[#1F2937] dark:text-slate-200">
          <span className="inline-block rounded-md bg-[#E8B24D]/20 px-1.5 py-0.5 text-[10px] font-bold text-[#0A2A6A] dark:text-secondary mb-1">
            Exam Date
          </span>
          <p className="font-semibold text-[#0A2A6A] dark:text-slate-100">Mid-Semester Exams</p>
          <p className="text-[11px] text-[#64748B] dark:text-slate-400">Schedule starts August 15th.</p>
        </div>

        <div className="rounded-xl border border-[#E2E8F0] dark:border-slate-800 bg-[#F8FAFC] dark:bg-slate-900 p-3 text-xs text-[#1F2937] dark:text-slate-200">
          <span className="inline-block rounded-md bg-[#163D8C]/10 dark:bg-slate-800 px-1.5 py-0.5 text-[10px] font-bold text-[#163D8C] dark:text-slate-300 mb-1">
            Library
          </span>
          <p className="font-semibold text-[#0A2A6A] dark:text-slate-100">Extended Hours</p>
          <p className="text-[11px] text-[#64748B] dark:text-slate-400">Open till 10:00 PM starting next week.</p>
        </div>
      </div>

      {/* Quick AI Prompts */}
      <div className="mt-5">
        <div className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.2em] text-[#163D8C] dark:text-secondary">
          <Zap className="h-4 w-4 text-[#E8B24D]" />
          <span>Quick Assist</span>
        </div>
        <div className="space-y-2">
          {[
            'Show my attendance report',
            'What is the library fine rule?',
            'When are the bus timings?',
            'How to request Bonafide?',
          ].map((prompt) => (
            <button
              key={prompt}
              onClick={() => onSelectPrompt(prompt)}
              className="flex w-full items-center justify-between rounded-xl border border-[#E2E8F0] dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-left text-xs font-medium text-[#0A2A6A] dark:text-slate-200 hover:bg-[#F8FAFC] dark:hover:bg-slate-800 hover:border-[#163D8C] dark:hover:border-secondary transition shadow-2xs group"
            >
              <span>{prompt}</span>
              <ArrowRight className="h-3.5 w-3.5 text-[#163D8C] dark:text-secondary opacity-0 group-hover:opacity-100 transition" />
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
