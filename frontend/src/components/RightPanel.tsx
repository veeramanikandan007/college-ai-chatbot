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
import { useAuth } from '../contexts/AuthContext';

interface RightPanelProps {
  onSelectPrompt: (promptText: string) => void;
}

export default function RightPanel({ onSelectPrompt }: RightPanelProps) {
  const { user } = useAuth();

  const attendancePercent = user?.attendancePercent ?? 87;
  const cgpa = user?.cgpa ?? 8.52;
  const feesPaid = user?.fees_paid ?? 45000;
  const feesTotal = user?.fees_total ?? 75000;
  const feesBalance = feesTotal - feesPaid;
  const feesStatus = feesBalance === 0 ? 'Clear' : `Pending: ₹${feesBalance.toLocaleString()}`;

  const attendanceColor =
    attendancePercent >= 85
      ? 'text-emerald-600'
      : attendancePercent >= 75
      ? 'text-amber-600'
      : 'text-rose-600';

  const attendanceLabel =
    attendancePercent >= 85 ? 'Excellent' :
    attendancePercent >= 75 ? 'Above Min' : 'Below Min';

  return (
    <aside className="hidden w-80 shrink-0 border-l border-[#E2E8F0] bg-white p-5 lg:block overflow-y-auto select-none">
      {/* Student Overview Widget */}
      <div className="rounded-2xl border border-[#E2E8F0] bg-gradient-to-b from-[#F8FAFC] to-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.24em] text-[#163D8C]">
            <BarChart3 className="h-4 w-4" />
            <span>Student Stats</span>
          </div>
          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600 border border-emerald-200">
            Active
          </span>
        </div>

        {/* Progress Gauge */}
        <div className="mt-4 flex items-center gap-4">
          <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-[#0A2A6A]/5 border-4 border-[#0A2A6A]">
            <span className="text-sm font-bold text-[#0A2A6A]">{attendancePercent}%</span>
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#0A2A6A]">Attendance</h4>
            <p className="text-xs text-[#64748B]">{user?.semester ? `Semester ${user.semester}` : 'Semester 5'} • {user?.department?.split(' ')[0] ?? 'CS'} Dept</p>
            <div className={`mt-1 flex items-center gap-1 text-[11px] font-semibold ${attendanceColor}`}>
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>{attendanceLabel}</span>
            </div>
          </div>
        </div>

        {/* CGPA & Fees Cards */}
        <div className="mt-4 grid grid-cols-2 gap-2 text-center">
          <div className="rounded-xl border border-[#E2E8F0] bg-white p-2.5 shadow-2xs">
            <div className="flex items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#64748B] mb-1">
              <Award className="h-3 w-3 text-amber-500" />
              <span>CGPA</span>
            </div>
            <p className="text-lg font-bold text-[#0A2A6A]">{cgpa}</p>
          </div>
          <div className="rounded-xl border border-[#E2E8F0] bg-white p-2.5 shadow-2xs">
            <div className="flex items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#64748B] mb-1">
              <CreditCard className="h-3 w-3 text-emerald-500" />
              <span>Fees</span>
            </div>
            <p className={`text-lg font-bold ${feesBalance === 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{feesStatus}</p>
          </div>
        </div>
      </div>

      {/* Notice Board */}
      <div className="mt-5 space-y-3">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.2em] text-[#163D8C]">
          <Megaphone className="h-4 w-4" />
          <span>Campus Notices</span>
        </div>

        <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3 text-xs text-[#1F2937]">
          <span className="inline-block rounded-md bg-[#E8B24D]/20 px-1.5 py-0.5 text-[10px] font-bold text-[#0A2A6A] mb-1">
            Exam Date
          </span>
          <p className="font-semibold text-[#0A2A6A]">Mid-Semester Exams</p>
          <p className="text-[11px] text-[#64748B]">Schedule starts August 15th.</p>
        </div>

        <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3 text-xs text-[#1F2937]">
          <span className="inline-block rounded-md bg-[#163D8C]/10 px-1.5 py-0.5 text-[10px] font-bold text-[#163D8C] mb-1">
            Library
          </span>
          <p className="font-semibold text-[#0A2A6A]">Extended Hours</p>
          <p className="text-[11px] text-[#64748B]">Open till 10:00 PM starting next week.</p>
        </div>
      </div>

      {/* Quick AI Prompts */}
      <div className="mt-5">
        <div className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.2em] text-[#163D8C]">
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
              className="flex w-full items-center justify-between rounded-xl border border-[#E2E8F0] bg-white px-3 py-2 text-left text-xs font-medium text-[#0A2A6A] hover:bg-[#F8FAFC] hover:border-[#163D8C] transition shadow-2xs group"
            >
              <span>{prompt}</span>
              <ArrowRight className="h-3.5 w-3.5 text-[#163D8C] opacity-0 group-hover:opacity-100 transition" />
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
