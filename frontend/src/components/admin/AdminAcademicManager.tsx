import React from 'react';
import { CalendarDays, ClipboardCheck, FileText, Files, Brain, BookOpen, ExternalLink, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AdminAcademicManager: React.FC = () => {
  const navigate = useNavigate();

  const academicModules = [
    { title: 'Smart Timetables', path: '/timetable', icon: CalendarDays, color: 'text-[#10B981]', desc: 'Manage master timetable schedules, period slots, and classroom allocations.' },
    { title: 'Attendance System', path: '/attendance', icon: ClipboardCheck, color: 'text-[#0E2A6D] dark:text-[#60A5FA]', desc: 'Inspect college-wide student attendance percentages and shortage reports.' },
    { title: 'Smart Assignments', path: '/assignments', icon: FileText, color: 'text-[#1E4DB7] dark:text-[#60A5FA]', desc: 'Audit assignment submissions, deadlines, and faculty evaluation metrics.' },
    { title: 'Question Papers Vault', path: '/question-papers', icon: Files, color: 'text-[#D9A441]', desc: 'Manage Previous Year question papers and Model examination archives.' },
    { title: 'AI Quiz Generator', path: '/quiz', icon: Brain, color: 'text-[#111827] dark:text-[#FAFAFA]', desc: 'Inspect AI generated quizzes, MCQ banks, and student score distributions.' },
    { title: 'Knowledge Base Notes', path: '/notes', icon: BookOpen, color: 'text-[#0E2A6D] dark:text-[#60A5FA]', desc: 'Review syllabus notes, department study materials, and subject reference links.' },
  ];

  return (
    <div className="space-y-6 font-body">
      <div className="bg-white dark:bg-[#1E293B] p-5 rounded-2xl border border-[#E2E8F0] dark:border-[#334155] shadow-xs">
        <h3 className="font-heading font-bold text-card text-[#1F2937] dark:text-[#F8FAFC]">Academic Module Master Control</h3>
        <p className="text-small text-[#64748B] dark:text-[#94A3B8]">Direct access to inspect and manage all student and faculty academic modules.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {academicModules.map((m, idx) => {
          const Icon = m.icon;
          return (
            <div
              key={idx}
              className="bg-white dark:bg-[#1E293B] p-6 rounded-2xl border border-[#E2E8F0] dark:border-[#334155] shadow-xs space-y-4 hover:border-[#0E2A6D]/40 transition flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-xl bg-[#F5F7FB] dark:bg-[#0F172A] flex items-center justify-center">
                  <Icon size={24} className={m.color} />
                </div>
                <h4 className="font-heading font-bold text-card text-[#1F2937] dark:text-[#F8FAFC]">{m.title}</h4>
                <p className="text-caption text-[#64748B] dark:text-[#94A3B8]">{m.desc}</p>
              </div>

              <button
                onClick={() => navigate(m.path)}
                className="w-full h-10 rounded-xl bg-[#F5F7FB] dark:bg-[#0F172A] hover:bg-[#0E2A6D] hover:text-white text-caption font-bold text-[#0E2A6D] dark:text-[#60A5FA] flex items-center justify-center gap-2 transition"
              >
                Inspect Module <ExternalLink size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
