import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Mic,
  UploadCloud,
  Bot,
  CheckCircle2,
  FileText,
  Calendar,
  BookOpen,
  BarChart3,
  Briefcase,
  ArrowRight,
  Award,
  Search,
  UserCheck,
  FilePlus,
  Target,
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
  const [greeting, setGreeting] = useState('Good Evening');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('Good Morning');
    } else if (hour < 17) {
      setGreeting('Good Afternoon');
    } else {
      setGreeting('Good Evening');
    }
  }, []);

  const studentName = user?.name || 'Pandiyarajan';

  // Statistics Data
  const statsItems = [
    {
      id: 'attendance',
      label: 'Overall Attendance',
      value: '88.5%',
      icon: CheckCircle2,
    },
    {
      id: 'cgpa',
      label: 'Academic Performance',
      value: '8.75 CGPA',
      icon: Award,
    },
    {
      id: 'exams',
      label: 'Next Exam',
      value: '12 Days',
      icon: Calendar,
    },
    {
      id: 'documents',
      label: 'Uploaded Documents',
      value: '24 Files',
      icon: BookOpen,
    },
  ];

  // Feature Section Cards Data
  const featureServices = [
    {
      id: 'library',
      title: 'AI Library & Study Notes',
      description: 'Access verified course syllabus, lecture summaries, and vector-indexed study materials.',
      icon: BookOpen,
      action: () => navigate('/notes'),
    },
    {
      id: 'attendance',
      title: 'Attendance Tracker',
      description: 'Track subject-wise attendance, condonation limits, and leave eligibility.',
      icon: BarChart3,
      action: () => navigate('/attendance'),
    },
    {
      id: 'resume',
      title: 'Resume Builder',
      description: 'Generate ATS-optimized resumes with AI tailored for campus placements.',
      icon: FilePlus,
      action: () => navigate('/resume-builder'),
    },
    {
      id: 'placement',
      title: 'Placement Preparation',
      description: 'Explore active campus recruitment drives, company CTC packages, and interview tips.',
      icon: Briefcase,
      action: () => navigate('/placement-hub'),
    },
    {
      id: 'mock-interviews',
      title: 'AI Interview Practice',
      description: 'Practice mock technical and HR interviews with real-time AI feedback.',
      icon: UserCheck,
      action: () => navigate('/mock-interviews'),
    },
    {
      id: 'document-search',
      title: 'Document Search',
      description: 'Search across uploaded PDFs, lecture slides, and college regulations instantly.',
      icon: Search,
      action: () => navigate('/documents'),
    },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6 select-none font-body space-y-8">

      {/* ========================================================================= */}
      {/* 1. HERO SECTION (LARGE WELCOME CARD - FULLY COVERED IMAGE)                 */}
      {/* ========================================================================= */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="relative overflow-hidden rounded-[16px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#FFFFFF] dark:bg-[#0F172A] shadow-xs min-h-[140px] sm:min-h-[150px] flex items-center justify-between"
      >

        {/* Left Text Column Content */}
        <div className="relative z-10 px-5 py-4 sm:px-6 sm:py-5 flex flex-col justify-center space-y-1.5 min-w-0 max-w-[680px]">
          <div className="flex items-center gap-2 text-[10.5px] font-bold uppercase tracking-wider text-[#6B7280] dark:text-[#A3A3A3]">
            <span>{greeting}</span>
            <span>•</span>
            <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
          </div>

          <h1 className="text-[20px] sm:text-[24px] font-bold text-[#111827] dark:text-[#FAFAFA] leading-tight tracking-tight">
            Welcome back, {studentName}
          </h1>

          <p className="text-[12.5px] sm:text-[13.5px] font-normal text-[#6B7280] dark:text-[#A3A3A3] truncate">
            Mount Zion College of Engineering and Technology • Smart AI Student Portal
          </p>

          {/* AI Online Status Pill */}
          <div className="pt-1">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#DCFCE7] dark:bg-[#14532D]/60 border border-[#86EFAC]/60 dark:border-[#22C55E]/40 px-3 py-0.5 text-[#15803D] dark:text-[#4ADE80]">
              <span className="relative flex h-2 w-2 items-center justify-center">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#22C55E] opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#22C55E]" />
              </span>
              <span className="text-[11px] font-semibold">
                AI Online & Ready
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ========================================================================= */}
      {/* 2. STATISTICS CARDS (4 CARDS)                                             */}
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
              whileHover={{ y: -2 }}
              className="p-5 rounded-[16px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#FFFFFF] dark:bg-[#111111] shadow-xs transition-all flex flex-col justify-between"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[13px] font-medium text-[#6B7280] dark:text-[#A3A3A3]">
                    {st.label}
                  </p>
                  <h3 className="text-[24px] font-semibold text-[#111827] dark:text-[#FAFAFA] mt-1">
                    {st.value}
                  </h3>
                </div>
                <div className="p-2.5 rounded-[12px] bg-[#F8FAFC] dark:bg-[#181818] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA]">
                  <Icon size={18} strokeWidth={1.75} />
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* ========================================================================= */}
      {/* 3. QUICK ACTION BUTTONS (MODERN OUTLINED BUTTONS)                         */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Action 1: Start Voice Chat */}
        <motion.button
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            if (onStartVoice) onStartVoice();
            else onSelectQuestion('Start voice interaction');
          }}
          className="h-[44px] rounded-[12px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#FFFFFF] dark:bg-[#111111] text-[#111827] dark:text-[#FAFAFA] hover:bg-[#F8FAFC] dark:hover:bg-[#181818] text-[14px] font-medium flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
        >
          <Mic size={16} strokeWidth={1.75} className="text-[#111827] dark:text-[#FAFAFA]" />
          <span>Start Voice Chat</span>
        </motion.button>

        {/* Action 2: Upload Notes */}
        <motion.button
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/documents')}
          className="h-[44px] rounded-[12px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#FFFFFF] dark:bg-[#111111] text-[#111827] dark:text-[#FAFAFA] hover:bg-[#F8FAFC] dark:hover:bg-[#181818] text-[14px] font-medium flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
        >
          <UploadCloud size={16} strokeWidth={1.75} className="text-[#6B7280] dark:text-[#A3A3A3]" />
          <span>Upload Notes</span>
        </motion.button>

        {/* Action 3: Ask CollegeMate AI */}
        <motion.button
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelectQuestion('Help me with my studies and exams')}
          className="h-[44px] rounded-[12px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#FFFFFF] dark:bg-[#111111] text-[#111827] dark:text-[#FAFAFA] hover:bg-[#F8FAFC] dark:hover:bg-[#181818] text-[14px] font-medium flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
        >
          <Bot size={16} strokeWidth={1.75} className="text-[#6B7280] dark:text-[#A3A3A3]" />
          <span>Ask CollegeMate AI</span>
        </motion.button>
      </div>

      {/* ========================================================================= */}
      {/* 4. FEATURE SECTION ("EXPLORE CAMPUS AI SERVICES")                         */}
      {/* ========================================================================= */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-[20px] font-semibold text-[#111827] dark:text-[#FAFAFA]">
            Explore Campus AI Services
          </h2>
          <span className="text-[13px] font-medium text-[#6B7280] dark:text-[#A3A3A3]">
            Essential Student Modules
          </span>
        </div>

        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {featureServices.map((feat) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={feat.id}
                variants={staggerItem}
                whileHover={{ y: -2 }}
                onClick={feat.action}
                className="group cursor-pointer rounded-[16px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#FFFFFF] dark:bg-[#111111] p-6 shadow-xs hover:shadow-md hover:border-[#111827] dark:hover:border-[#FAFAFA] transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-[12px] bg-[#F8FAFC] dark:bg-[#181818] border border-[#E5E7EB] dark:border-[#2A2A2A] flex items-center justify-center text-[#111827] dark:text-[#FAFAFA]">
                    <Icon size={18} strokeWidth={1.75} />
                  </div>

                  <h3 className="text-[16px] font-semibold text-[#111827] dark:text-[#FAFAFA] transition-colors">
                    {feat.title}
                  </h3>

                  <p className="text-[14px] font-normal text-[#6B7280] dark:text-[#A3A3A3] leading-relaxed line-clamp-2">
                    {feat.description}
                  </p>
                </div>

                <div className="mt-5 flex items-center gap-1.5 text-[13px] font-medium text-[#111827] dark:text-[#FAFAFA] group-hover:translate-x-1 transition-all">
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