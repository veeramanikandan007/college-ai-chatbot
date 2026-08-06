import React from 'react';
import { CalendarDays, ClipboardCheck, FileText, Files, Brain, BookOpen, ExternalLink, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AdminAcademicManager: React.FC = () => {
  const navigate = useNavigate();

  const academicModules = [
    { title: 'Smart Timetables', path: '/timetable', icon: CalendarDays, desc: 'Manage master timetable schedules, period slots, and classroom allocations.' },
    { title: 'Attendance System', path: '/attendance', icon: ClipboardCheck, desc: 'Inspect college-wide student attendance percentages and shortage reports.' },
    { title: 'Smart Assignments', path: '/assignments', icon: FileText, desc: 'Audit assignment submissions, deadlines, and faculty evaluation metrics.' },
    { title: 'Question Papers Vault', path: '/question-papers', icon: Files, desc: 'Manage Previous Year question papers and Model examination archives.' },
    { title: 'AI Quiz Generator', path: '/quiz', icon: Brain, desc: 'Inspect AI generated quizzes, MCQ banks, and student score distributions.' },
    { title: 'Knowledge Base Notes', path: '/notes', icon: BookOpen, desc: 'Review syllabus notes, department study materials, and subject reference links.' },
  ];

  return (
    <div className="space-y-6 font-sans">
      {/* ── Top Hero Header Card ── */}
      <div className="bg-[#FFFFFF] dark:bg-[#18181B] p-6 rounded-[16px] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs space-y-1">
        <h3 className="text-[18px] font-semibold text-[#111827] dark:text-[#FAFAFA]">Academic Module Master Control</h3>
        <p className="text-[14px] font-normal text-[#6B7280] dark:text-[#A1A1AA]">Direct access to inspect and manage all student and faculty academic modules.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {academicModules.map((m, idx) => {
          const Icon = m.icon;
          return (
            <div
              key={idx}
              className="bg-[#FFFFFF] dark:bg-[#18181B] p-6 rounded-[16px] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs space-y-4 hover:border-[#111827]/30 dark:hover:border-[#FAFAFA]/30 transition flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-[12px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA] flex items-center justify-center">
                  <Icon size={24} />
                </div>
                <h4 className="text-[16px] font-semibold text-[#111827] dark:text-[#FAFAFA]">{m.title}</h4>
                <p className="text-[14px] font-normal text-[#6B7280] dark:text-[#A1A1AA] line-clamp-2">{m.desc}</p>
              </div>

              <button
                onClick={() => navigate(m.path)}
                className="w-full h-[40px] rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] hover:bg-[#111827] hover:text-[#FFFFFF] dark:hover:bg-[#FAFAFA] dark:hover:text-[#111111] text-[14px] font-medium text-[#111827] dark:text-[#FAFAFA] flex items-center justify-center gap-2 transition cursor-pointer"
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
