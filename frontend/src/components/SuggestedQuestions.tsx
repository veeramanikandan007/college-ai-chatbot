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
  Award,
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
  const statsItems = [
    {
      id: 'attendance',
      label: 'Overall Attendance',
      value: '88.5%',
      trend: 'Eligible for Exams',
      icon: CheckCircle2,
      accent: 'text-[#111827] dark:text-[#FAFAFA]',
      bg: 'bg-[#F8FAFC] dark:bg-[#111111] border-[#D1D5DB] dark:border-[#3F3F46]',
      progress: 88.5,
    },
    {
      id: 'cgpa',
      label: 'Academic Performance',
      value: '8.75 CGPA',
      trend: 'Top 5% of Batch',
      icon: Award,
      accent: 'text-[#111827] dark:text-[#FAFAFA]',
      bg: 'bg-[#F8FAFC] dark:bg-[#111111] border-[#D1D5DB] dark:border-[#3F3F46]',
      progress: 87.5,
    },
    {
      id: 'exams',
      label: 'Next Exam',
      value: '12 Days',
      trend: 'CIA Test II • Oct 24',
      icon: Calendar,
      accent: 'text-[#111827] dark:text-[#FAFAFA]',
      bg: 'bg-[#F8FAFC] dark:bg-[#111111] border-[#D1D5DB] dark:border-[#3F3F46]',
      progress: 40,
    },
    {
      id: 'documents',
      label: 'Uploaded Documents',
      value: '24 Files',
      trend: 'Indexed in Vector DB',
      icon: BookOpen,
      accent: 'text-[#111827] dark:text-[#FAFAFA]',
      bg: 'bg-[#F8FAFC] dark:bg-[#111111] border-[#D1D5DB] dark:border-[#3F3F46]',
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
      gradient: 'from-[#111827] to-[#111827]',
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
      gradient: 'from-[#111827] to-[#111827]',
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
      gradient: 'from-[#111827] to-[#111827]',
      badge: 'Today: 4 Classes',
      action: () => navigate('/timetable'),
      prompt: 'Show my timetable and upcoming exam schedule',
    },
    {
      id: 'placements',
      title: 'Placement & Careers',
      description: 'Explore active campus recruitment drives, company CTC packages, and interview tips.',
      icon: Briefcase,
      span: 'md:col-span-2',
      gradient: 'from-[#111827] to-[#111827]',
      badge: '18 Active Drives',
      action: () => navigate('/placement-hub'),
      prompt: 'Show recent campus placement drives and company salary packages',
    },
    {
      id: 'transport',
      title: 'Campus Transport',
      description: 'Bus route numbers, pickup timings, and emergency driver contact info.',
      icon: Bus,
      span: 'md:col-span-1',
      gradient: 'from-[#111827] to-[#111827]',
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
      gradient: 'from-[#111827] to-[#111827]',
      badge: 'Hostel & Library',
      action: () => onSelectQuestion('What are the hostel room rules and mess timings?'),
      prompt: 'What are the hostel room rules and mess timings?',
    },
  ];

  return (
    <div className="mx-auto my-auto max-w-6xl px-4 py-6 select-none flex flex-col justify-center font-body space-y-6">

      {/* SECTION 1: STUDENT WELCOME CARD */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 p-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-heading text-[12px] font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                {greeting}
              </span>
              <span className="text-zinc-400 dark:text-zinc-600">•</span>
              <span className="font-body text-[12px] font-medium text-zinc-500 dark:text-zinc-400">
                {currentDateStr}
              </span>
            </div>

            <h1 className="font-heading font-bold text-[26px] leading-tight text-zinc-900 dark:text-zinc-100">
              Welcome back, <span className="text-zinc-900 dark:text-zinc-100">{studentName}</span>
            </h1>

            <p className="font-body text-[13.5px] text-zinc-500 dark:text-zinc-400">
              Mount Zion College of Engineering and Technology • Smart AI Student Portal
            </p>
          </div>

          {/* AI Status Indicator Pill */}
          <div className="flex items-center gap-2 self-start sm:self-auto rounded-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-3.5 py-1.5 shadow-xs">
            <div className="relative flex h-2 w-2 items-center justify-center">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#111827] dark:bg-[#FAFAFA] opacity-20" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#111827] dark:bg-[#FAFAFA]" />
            </div>
            <span className="font-body text-[12px] font-medium text-zinc-700 dark:text-zinc-300">
              AI Online & Ready
            </span>
          </div>
        </div>
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
        {statsItems.map((st) => {
          const Icon = st.icon;
          return (
            <motion.div
              key={st.id}
              variants={staggerItem}
              whileHover={{ y: -1 }}
              className="p-[18px] rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs transition-all flex flex-col justify-between"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-body text-[12px] font-medium text-zinc-500 dark:text-zinc-400">
                    {st.label}
                  </p>
                  <h3 className="font-heading font-bold text-[20px] text-zinc-900 dark:text-zinc-100 mt-0.5">
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
          className="w-full sm:flex-1 h-[42px] rounded-[12px] bg-[#111827] dark:bg-[#FFFFFF] hover:bg-[#1F2937] dark:hover:bg-[#F0F0F0] text-[#FFFFFF] dark:text-[#111111] font-body text-[14px] font-semibold flex items-center justify-center gap-2 shadow-sm border border-[#111827] dark:border-[#FFFFFF] transition"
        >
          <Mic size={16} strokeWidth={1.75} />
          <span>Start Voice Chat</span>
        </motion.button>

        {/* Action 2: Upload Notes */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/documents')}
          className="w-full sm:flex-1 h-[40px] rounded-[12px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#F8FAFC] dark:bg-[#181818] text-[#111827] dark:text-[#FAFAFA] hover:bg-[#F9FAFB] dark:hover:bg-[#232323] font-body text-[14px] font-semibold flex items-center justify-center gap-2 transition"
        >
          <UploadCloud size={16} strokeWidth={1.75} className="text-[#6B7280] dark:text-[#A3A3A3]" />
          <span>Upload Notes</span>
        </motion.button>

        {/* Action 3: Ask CollegeMate AI */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelectQuestion('Help me with my studies and exams')}
          className="w-full sm:flex-1 h-[40px] rounded-[12px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#F8FAFC] dark:bg-[#181818] text-[#111827] dark:text-[#FAFAFA] hover:bg-[#F9FAFB] dark:hover:bg-[#232323] font-body text-[14px] font-semibold flex items-center justify-center gap-2 transition"
        >
          <Bot size={16} strokeWidth={1.75} className="text-[#6B7280] dark:text-[#A3A3A3]" />
          <span>Ask CollegeMate AI</span>
        </motion.button>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 4: FEATURE GRID (BENTO STYLE LAYOUT)                             */}
      {/* ========================================================================= */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-heading font-bold text-[22px] text-[#111827] dark:text-[#FAFAFA] flex items-center gap-2">
            <span>Explore Campus AI Services</span>
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
                className={`group cursor-pointer rounded-[16px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#181818] p-[20px] shadow-xs hover:shadow-md hover:border-[#111827] dark:hover:border-[#FAFAFA] transition-all flex flex-col justify-between ${feat.span}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-3 rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA] shadow-xs">
                      <Icon size={16} strokeWidth={1.75} />
                    </div>

                    <span className="rounded-full bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] px-3 py-1 font-body text-[12px] font-semibold text-[#111827] dark:text-[#FAFAFA]">
                      {feat.badge}
                    </span>
                  </div>

                  <h3 className="font-heading font-bold text-[16px] text-[#111827] dark:text-[#FAFAFA] mb-1 group-hover:text-[#111827] dark:group-hover:text-[#FAFAFA] transition-colors">
                    {feat.title}
                  </h3>

                  <p className="font-body text-[14px] text-[#6B7280] dark:text-[#A3A3A3] leading-relaxed line-clamp-2">
                    {feat.description}
                  </p>
                </div>

                <div className="mt-4 flex items-center gap-1.5 font-body text-[12px] font-semibold text-[#6B7280] dark:text-[#A3A3A3] group-hover:text-[#111827] dark:group-hover:text-[#FAFAFA] group-hover:translate-x-1 transition-all">
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
