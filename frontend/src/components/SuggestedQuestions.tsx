import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Mic,
  UploadCloud,
  Bot,
  Sparkles,
  CheckCircle2,
  FileText,
  Calendar,
  BookOpen,
  BarChart3,
  Briefcase,
  Bus,
  Home,
  ArrowRight,
  TrendingUp,
  Clock,
  Layers,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { staggerContainer, staggerItem } from '../lib/animations';

interface SuggestedQuestionsProps {
  onSelectQuestion: (question: string) => void;
  onStartVoice?: () => void;
}

export default function SuggestedQuestions({
  onSelectQuestion,
  onStartVoice,
}: SuggestedQuestionsProps) {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Dynamic Time Greeting
  const [greeting, setGreeting] = useState('');
  const [currentDateStr, setCurrentDateStr] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('Good Morning');
    } else if (hour < 17) {
      setGreeting('Good Afternoon');
    } else {
      setGreeting('Good Evening');
    }

    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    setCurrentDateStr(new Date().toLocaleDateString('en-US', options));
  }, []);

  const studentName = user?.name || 'Student';

  // Statistics Data
  const stats = [
    {
      id: 'attendance',
      label: 'Attendance Rate',
      value: '88.5%',
      trend: '+2.5% this month',
      icon: CheckCircle2,
      accent: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
      progress: 88.5,
    },
    {
      id: 'assignments',
      label: 'Pending Assignments',
      value: '3 Pending',
      trend: '2 due this week',
      icon: FileText,
      accent: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20',
      progress: 60,
    },
    {
      id: 'exams',
      label: 'Next Exam',
      value: '12 Days',
      trend: 'CIA Test II • Oct 24',
      icon: Calendar,
      accent: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-500/10 border-purple-500/20',
      progress: 40,
    },
    {
      id: 'documents',
      label: 'Uploaded Documents',
      value: '24 Files',
      trend: 'Indexed in Vector DB',
      icon: BookOpen,
      accent: 'text-[#1E4DB7] dark:text-[#60A5FA]',
      bg: 'bg-[#1E4DB7]/10 border-[#1E4DB7]/20',
      progress: 100,
    },
  ];

  // Bento Grid Feature Cards Data
  const bentoFeatures = [
    {
      id: 'library',
      title: 'AI Library & Study Notes',
      description: 'Access verified course syllabus, lecture summaries, and vector-indexed study materials.',
      icon: BookOpen,
      span: 'md:col-span-2',
      gradient: 'from-[#0E2A6D] to-[#1E4DB7]',
      badge: 'Verified Notes',
      action: () => navigate('/notes'),
      prompt: 'Show my course syllabus and study material for this semester',
    },
    {
      id: 'attendance',
      title: 'Attendance Tracker',
      description: 'Track subject-wise attendance, condonation limits, and leave eligibility.',
      icon: BarChart3,
      span: 'md:col-span-1',
      gradient: 'from-emerald-600 to-teal-700',
      badge: '88.5% Present',
      action: () => navigate('/attendance'),
      prompt: 'What is my current attendance percentage and condonation rule?',
    },
    {
      id: 'timetable',
      title: 'Timetable & Exam Schedule',
      description: 'View daily class hours, CIA exam dates, and lab schedules.',
      icon: Calendar,
      span: 'md:col-span-1',
      gradient: 'from-purple-600 to-indigo-700',
      badge: 'Today: 4 Classes',
      action: () => navigate('/timetable'),
      prompt: 'Show my timetable and upcoming exam schedule',
    },
    {
      id: 'placements',
      title: 'Placement & Careers',
      description: 'Explore active campus recruitment drives, company CTC packages, and interview tips.',
      icon: Briefcase,
      span: 'md:col-span-1',
      gradient: 'from-indigo-600 to-[#0E2A6D]',
      badge: '18 Drives Active',
      action: () => onSelectQuestion('Show recent campus placement drives and salary packages'),
      prompt: 'Show recent campus placement drives and company salary packages',
    },
    {
      id: 'transport',
      title: 'Campus Transport',
      description: 'Bus route numbers, pickup timings, and emergency driver contact info.',
      icon: Bus,
      span: 'md:col-span-1',
      gradient: 'from-amber-500 to-orange-600',
      badge: '14 Routes',
      action: () => onSelectQuestion('What are the college bus routes and timing schedules?'),
      prompt: 'What are the college bus routes and timing schedules?',
    },
    {
      id: 'hostel',
      title: 'Hostel & Campus Amenities',
      description: 'Hostel room guidelines, daily mess menu timing, warden contacts, and digital library hours.',
      icon: Home,
      span: 'md:col-span-2',
      gradient: 'from-cyan-600 to-blue-700',
      badge: 'Hostel & Library',
      action: () => onSelectQuestion('What are the hostel room rules and mess timings?'),
      prompt: 'What are the hostel room rules and mess timings?',
    },
  ];

  return (
    <div className="mx-auto my-auto max-w-6xl px-4 py-6 select-none flex flex-col justify-center font-body space-y-6">

      {/* ========================================================================= */}
      {/* SECTION 1: STUDENT WELCOME CARD                                          */}
      {/* ========================================================================= */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-[16px] border border-[#E2E8F0] dark:border-[#334155] bg-gradient-to-r from-white via-[#F8FAFC] to-[#F5F7FB] dark:from-[#1E293B] dark:via-[#111827] dark:to-[#0F172A] p-6 shadow-sm"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-heading text-[12px] font-bold uppercase tracking-wider text-[#1E4DB7] dark:text-[#60A5FA]">
                {greeting}
              </span>
              <span className="text-[#64748B] dark:text-[#94A3B8]">•</span>
              <span className="font-body text-[12px] font-medium text-[#64748B] dark:text-[#94A3B8]">
                {currentDateStr}
              </span>
            </div>

            <h1 className="font-heading font-bold text-[30px] leading-tight text-[#0E2A6D] dark:text-[#F8FAFC]">
              Welcome back, <span className="text-[#1E4DB7] dark:text-[#60A5FA]">{studentName}</span>
            </h1>

            <p className="font-body text-[14px] text-[#475569] dark:text-[#CBD5E1]">
              Mount Zion College of Engineering and Technology • Smart AI Student Portal
            </p>
          </div>

          {/* AI Status Indicator Pill */}
          <div className="flex items-center gap-2 self-start sm:self-auto rounded-full bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] px-3.5 py-1.5 shadow-xs">
            <div className="relative flex h-2.5 w-2.5 items-center justify-center">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#22C55E] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#22C55E]" />
            </div>
            <span className="font-body text-[12px] font-semibold text-[#1F2937] dark:text-[#F8FAFC]">
              AI Online & Ready
            </span>
            <Sparkles size={14} strokeWidth={1.75} className="text-[#D9A441]" />
          </div>
        </div>

        {/* Soft Background Accent Glow */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#1E4DB7]/10 blur-3xl dark:bg-[#60A5FA]/10" />
      </motion.div>

      {/* ========================================================================= */}
      {/* SECTION 2: QUICK STATISTICS CARDS                                       */}
      {/* ========================================================================= */}
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {stats.map((st) => {
          const Icon = st.icon;
          return (
            <motion.div
              key={st.id}
              variants={staggerItem}
              whileHover={{ y: -2, scale: 1.01 }}
              className="p-[20px] rounded-[16px] border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#1E293B] shadow-xs transition-all hover:shadow-md flex flex-col justify-between"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-body text-[12px] font-semibold text-[#64748B] dark:text-[#94A3B8]">
                    {st.label}
                  </p>
                  <h3 className="font-heading font-bold text-[22px] text-[#1F2937] dark:text-[#F8FAFC] mt-0.5">
                    {st.value}
                  </h3>
                </div>
                <div className={`p-2.5 rounded-xl border ${st.bg} ${st.accent}`}>
                  <Icon size={16} strokeWidth={1.75} />
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between pt-2 border-t border-[#E2E8F0]/60 dark:border-[#334155]/60">
                <span className="font-body text-[11px] font-medium text-[#64748B] dark:text-[#94A3B8] truncate">
                  {st.trend}
                </span>
                <TrendingUp size={12} strokeWidth={1.75} className={st.accent} />
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* ========================================================================= */}
      {/* SECTION 3: QUICK ACTIONS BAR (3 PRIMARY BUTTONS)                         */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        {/* Action 1: Start Voice Chat */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            if (onStartVoice) {
              onStartVoice();
            } else {
              onSelectQuestion('Start voice interaction');
            }
          }}
          className="w-full sm:flex-1 h-[42px] rounded-[12px] bg-gradient-to-r from-[#0E2A6D] to-[#1E4DB7] hover:from-[#153B8A] hover:to-[#2563EB] text-white font-body text-[14px] font-semibold flex items-center justify-center gap-2 shadow-xs transition"
        >
          <Mic size={16} strokeWidth={1.75} />
          <span>Start Voice Chat</span>
        </motion.button>

        {/* Action 2: Upload Notes */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/documents')}
          className="w-full sm:flex-1 h-[40px] rounded-[12px] border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#1E293B] text-[#0E2A6D] dark:text-[#F8FAFC] hover:bg-[#F5F7FB] dark:hover:bg-[#0F172A] font-body text-[14px] font-semibold flex items-center justify-center gap-2 shadow-xs transition"
        >
          <UploadCloud size={16} strokeWidth={1.75} className="text-[#D9A441]" />
          <span>Upload Notes</span>
        </motion.button>

        {/* Action 3: Ask CollegeMate AI */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelectQuestion('Help me with my studies and exams')}
          className="w-full sm:flex-1 h-[40px] rounded-[12px] border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#1E293B] text-[#0E2A6D] dark:text-[#F8FAFC] hover:bg-[#F5F7FB] dark:hover:bg-[#0F172A] font-body text-[14px] font-semibold flex items-center justify-center gap-2 shadow-xs transition"
        >
          <Bot size={16} strokeWidth={1.75} className="text-[#1E4DB7] dark:text-[#60A5FA]" />
          <span>Ask CollegeMate AI</span>
        </motion.button>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 4: FEATURE GRID (BENTO STYLE LAYOUT)                             */}
      {/* ========================================================================= */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-heading font-bold text-[22px] text-[#0E2A6D] dark:text-[#F8FAFC] flex items-center gap-2">
            <span>Explore Campus AI Services</span>
            <Sparkles size={16} strokeWidth={1.75} className="text-[#D9A441]" />
          </h2>
          <span className="font-body text-[12px] font-semibold text-[#64748B] dark:text-[#94A3B8]">
            Interactive Student Modules
          </span>
        </div>

        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {bentoFeatures.map((feat) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={feat.id}
                variants={staggerItem}
                whileHover={{ y: -3, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={feat.action}
                className={`group cursor-pointer rounded-[16px] border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#1E293B] p-[20px] shadow-xs hover:shadow-md hover:border-[#1E4DB7] dark:hover:border-[#D9A441] transition-all flex flex-col justify-between ${feat.span}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-3 rounded-xl bg-gradient-to-tr ${feat.gradient} text-white shadow-xs`}>
                      <Icon size={16} strokeWidth={1.75} />
                    </div>

                    <span className="rounded-full bg-[#F5F7FB] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] px-3 py-1 font-body text-[12px] font-semibold text-[#0E2A6D] dark:text-[#D9A441]">
                      {feat.badge}
                    </span>
                  </div>

                  <h3 className="font-heading font-bold text-[16px] text-[#1F2937] dark:text-[#F8FAFC] mb-1 group-hover:text-[#1E4DB7] dark:group-hover:text-[#60A5FA] transition-colors">
                    {feat.title}
                  </h3>

                  <p className="font-body text-[14px] text-[#475569] dark:text-[#CBD5E1] leading-relaxed line-clamp-2">
                    {feat.description}
                  </p>
                </div>

                <div className="mt-4 flex items-center gap-1.5 font-body text-[12px] font-semibold text-[#0E2A6D] dark:text-[#60A5FA] group-hover:translate-x-1 transition-transform">
                  <span>Open Module</span>
                  <ArrowRight size={14} strokeWidth={1.75} />
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

    </div>
  );
}
