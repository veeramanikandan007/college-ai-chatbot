import { motion } from 'framer-motion';

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
    <aside className="hidden w-80 shrink-0 border-l border-[#E2E8F0] bg-white p-5 lg:block overflow-y-auto select-none">
      {/* Student Overview Widget */}
      <div className="rounded-2xl border border-[#E2E8F0] bg-gradient-to-b from-[#F8FAFC] to-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#163D8C]">
            Student Stats
          </p>
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
            <p className="text-xs text-[#64748B]">Semester 6 • CS Dept</p>
            <p className="mt-1 text-[11px] font-semibold text-emerald-600">✓ Above 75% threshold</p>
          </div>
        </div>

        {/* CGPA Card */}
        <div className="mt-4 grid grid-cols-2 gap-2 text-center">
          <div className="rounded-xl border border-[#E2E8F0] bg-white p-2.5 shadow-2xs">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">CGPA</p>
            <p className="text-lg font-bold text-[#0A2A6A]">{cgpa}</p>
          </div>
          <div className="rounded-xl border border-[#E2E8F0] bg-white p-2.5 shadow-2xs">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">Fees Paid</p>
            <p className="text-lg font-bold text-emerald-600">Clear</p>
          </div>
        </div>
      </div>

      {/* Notice Board */}
      <div className="mt-5 space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#163D8C]">
          📌 Campus Notices
        </h4>

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
        <h4 className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#163D8C]">
          ⚡ Quick Assist
        </h4>
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
              className="w-full rounded-xl border border-[#E2E8F0] bg-white px-3 py-2 text-left text-xs font-medium text-[#0A2A6A] hover:bg-[#F8FAFC] hover:border-[#163D8C] transition shadow-2xs"
            >
              ➔ {prompt}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
