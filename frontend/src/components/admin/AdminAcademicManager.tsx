import React from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, ClipboardCheck, FileText, Files, Brain, BookOpen, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../ui/PageHeader';
import { PageContainer } from '../ui/PageContainer';
import { DashboardCard } from '../ui/DashboardCard';

export const AdminAcademicManager: React.FC = () => {
  const navigate = useNavigate();

  const academicModules = [
    { title: 'Smart Timetables', path: '/timetable', icon: CalendarDays, color: 'text-emerald-500', bg: 'bg-emerald-500/10', desc: 'Manage master timetable schedules, period slots, and classroom allocations.' },
    { title: 'Attendance System', path: '/attendance', icon: ClipboardCheck, color: 'text-blue-500', bg: 'bg-blue-500/10', desc: 'Inspect college-wide student attendance percentages and shortage reports.' },
    { title: 'Smart Assignments', path: '/assignments', icon: FileText, color: 'text-indigo-500', bg: 'bg-indigo-500/10', desc: 'Audit assignment submissions, deadlines, and faculty evaluation metrics.' },
    { title: 'Question Papers Vault', path: '/question-papers', icon: Files, color: 'text-amber-500', bg: 'bg-amber-500/10', desc: 'Manage Previous Year question papers and Model examination archives.' },
    { title: 'AI Quiz Generator', path: '/quiz', icon: Brain, color: 'text-purple-500', bg: 'bg-purple-500/10', desc: 'Inspect AI generated quizzes, MCQ banks, and student score distributions.' },
    { title: 'Knowledge Base Notes', path: '/notes', icon: BookOpen, color: 'text-rose-500', bg: 'bg-rose-500/10', desc: 'Review syllabus notes, department study materials, and subject reference links.' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Academic Module Master Control"
        description="Direct access to inspect and manage all student and faculty academic modules."
        icon={BookOpen}
      />

      <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {academicModules.map((m, idx) => {
          const Icon = m.icon;
          return (
            <motion.div
              key={idx}
              variants={itemVariants}
              onClick={() => navigate(m.path)}
              className="group cursor-pointer h-full"
            >
              <DashboardCard className="h-full flex flex-col justify-between hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors p-6">
              <div className="space-y-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${m.bg}`}>
                  <Icon size={24} className={m.color} />
                </div>
                <h4 className="font-heading font-bold text-lg text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{m.title}</h4>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">{m.desc}</p>
              </div>

              <div className="pt-2 flex items-center text-sm font-semibold text-blue-600 dark:text-blue-400 gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                Inspect Module <ExternalLink size={14} />
              </div>
              </DashboardCard>
            </motion.div>
          );
        })}
      </motion.div>
    </PageContainer>
  );
};
