import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  GraduationCap,
  BookOpen,
  Sparkles,
  ArrowRight,
  Bot,
  CheckCircle2,
  CreditCard,
  Calendar,
  Bus,
  Library,
  Briefcase,
  Home,
} from 'lucide-react';
import { APP_NAME, COLLEGE_NAME } from '../lib/constants';

const categoryPills = [
  'Attendance',
  'Fees',
  'Timetable',
  'Exams',
  'Placement',
  'Library',
  'Hostel',
  'Transport',
  'Scholarships',
  'Bonafide',
  'Certificates',
];

const quickActions = [
  {
    icon: BookOpen,
    category: 'Academics',
    title: 'Academics Portal',
    desc: 'Syllabus, courses, and department details',
    color: 'text-[#111827] dark:text-[#FAFAFA] bg-[#F8FAFC] dark:bg-[#111111] border-[#D1D5DB] dark:border-[#3F3F46]',
  },
  {
    icon: CheckCircle2,
    category: 'Attendance',
    title: 'Attendance Tracker',
    desc: 'Percentage tracking and condonation rules',
    color: 'text-[#111827] dark:text-[#FAFAFA] bg-[#F8FAFC] dark:bg-[#111111] border-[#D1D5DB] dark:border-[#3F3F46]',
  },
  {
    icon: CreditCard,
    category: 'Fees',
    title: 'Fee Payments',
    desc: 'Tuition fees, dues, and payment receipts',
    color: 'text-[#111827] dark:text-[#FAFAFA] bg-[#F8FAFC] dark:bg-[#111111] border-[#D1D5DB] dark:border-[#3F3F46]',
  },
  {
    icon: Calendar,
    category: 'Exams',
    title: 'Exam Schedules',
    desc: 'CIA test dates and semester schedules',
    color: 'text-[#111827] dark:text-[#FAFAFA] bg-[#F8FAFC] dark:bg-[#111111] border-[#D1D5DB] dark:border-[#3F3F46]',
  },
  {
    icon: Bus,
    category: 'Transport',
    title: 'Bus Transport',
    desc: 'College bus routes and departure timings',
    color: 'text-[#111827] dark:text-[#FAFAFA] bg-[#F8FAFC] dark:bg-[#111111] border-[#D1D5DB] dark:border-[#3F3F46]',
  },
  {
    icon: Library,
    category: 'Library',
    title: 'Digital Library',
    desc: 'Digital catalogue, hours, and book issue limits',
    color: 'text-[#111827] dark:text-[#FAFAFA] bg-[#F8FAFC] dark:bg-[#111111] border-[#D1D5DB] dark:border-[#3F3F46]',
  },
  {
    icon: Briefcase,
    category: 'Placements',
    title: 'Placements Cell',
    desc: 'Top recruiters, eligibility, and salary packages',
    color: 'text-[#111827] dark:text-[#FAFAFA] bg-[#F8FAFC] dark:bg-[#111111] border-[#D1D5DB] dark:border-[#3F3F46]',
  },
  {
    icon: Home,
    category: 'Hostel',
    title: 'Hostel & Mess',
    desc: 'Mess menu, hostel rules, and room allotment',
    color: 'text-[#111827] dark:text-[#FAFAFA] bg-[#F8FAFC] dark:bg-[#111111] border-[#D1D5DB] dark:border-[#3F3F46]',
  },
];

const typewriterPhrases = [
  'Ask anything about your college...',
  'Check attendance, fee dues & exam dates...',
  'Get placement records, library & transport info...',
];

export default function HomePage() {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [text, setText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentPhrase = typewriterPhrases[phraseIndex];
    const typingSpeed = isDeleting ? 30 : 60;

    const timer = setTimeout(() => {
      if (!isDeleting && text === currentPhrase) {
        setTimeout(() => setIsDeleting(true), 2200);
      } else if (isDeleting && text === '') {
        setIsDeleting(false);
        setPhraseIndex((prev) => (prev + 1) % typewriterPhrases.length);
      } else {
        setText(
          isDeleting
            ? currentPhrase.substring(0, text.length - 1)
            : currentPhrase.substring(0, text.length + 1)
        );
      }
    }, typingSpeed);

    return () => clearTimeout(timer);
  }, [text, isDeleting, phraseIndex]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F7FB] dark:bg-[#0F172A] text-[#1F2937] dark:text-[#F8FAFC] select-none transition-colors duration-300 font-body">
      {/* Header Bar — Height 68px */}
      <header className="sticky top-0 z-30 border-b border-[#E2E8F0] dark:border-[#334155] bg-white/90 dark:bg-[#111827]/90 backdrop-blur-md">
        <div className="flex h-[68px] w-full items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-[40px] w-[40px] items-center justify-center rounded-[14px] bg-gradient-to-br from-[#0E2A6D] to-[#1E4DB7] text-white shadow-xs border border-[#D9A441]/30">
              <GraduationCap size={20} strokeWidth={1.75} />
            </div>
            <span className="font-heading font-extrabold text-[18px] tracking-[0.02em] text-[#0E2A6D] dark:text-[#F8FAFC]">{APP_NAME}</span>
          </div>
          <nav className="flex items-center gap-3">
            <Link
              to="/login"
              className="h-[44px] px-4 inline-flex items-center justify-center text-[15px] font-semibold text-[#475569] dark:text-[#CBD5E1] hover:text-[#0E2A6D] dark:hover:text-white transition rounded-[14px] hover:bg-[#E2E8F0] dark:hover:bg-[#1E293B]"
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className="h-[44px] px-5 inline-flex items-center justify-center text-[15px] font-semibold text-white bg-[#0E2A6D] hover:bg-[#153B8A] rounded-[14px] transition shadow-xs"
            >
              Get started
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section — Positioned lower with pt-16 / pt-20 and increased vertical gaps (32px / 48px) */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 pt-16 pb-12 sm:pt-20 sm:pb-16 relative overflow-hidden">
        {/* Soft Background Radial Gradient */}
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-gradient-to-tr from-[#0E2A6D]/15 to-[#1E4DB7]/20 blur-3xl pointer-events-none rounded-full" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 max-w-4xl mx-auto flex flex-col items-center gap-4"
        >
          {/* Bot Logo — 48px Container */}
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="mb-2 flex h-[48px] w-[48px] items-center justify-center rounded-[14px] bg-gradient-to-tr from-[#0E2A6D] via-[#1E4DB7] to-[#0E2A6D] text-white shadow-md border border-[#D9A441]/40 relative"
          >
            <Bot size={24} strokeWidth={1.75} />
            <div className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-[#22C55E] border-2 border-white dark:border-[#0F172A] animate-pulse" />
          </motion.div>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1E4DB7]/10 dark:bg-[#1E4DB7]/20 border border-[#1E4DB7]/30 text-[#0E2A6D] dark:text-[#60A5FA] text-[13px] font-semibold shadow-xs">
            <Sparkles size={14} className="text-[#D9A441]" />
            <span>Next-Gen Enterprise Campus AI Platform</span>
          </div>

          {/* Heading — League Spartan 48px 800 */}
          <h1 className="font-heading text-[48px] font-extrabold tracking-[0.02em] text-[#0E2A6D] dark:text-[#F8FAFC] leading-tight mt-2">
            {APP_NAME}
          </h1>

          {/* Subheading — League Spartan 18px 700 */}
          <p className="font-heading font-bold text-[18px] tracking-[0.02em] text-[#1E4DB7] dark:text-[#D9A441] max-w-2xl mx-auto">
            Your AI Assistant for {COLLEGE_NAME}
          </p>

          {/* Category Tag Pills */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 max-w-3xl font-body">
            {categoryPills.map((pill) => (
              <span
                key={pill}
                className="px-3 py-1 text-[13px] font-medium rounded-xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[#475569] dark:text-[#CBD5E1] shadow-xs hover:border-[#1E4DB7] transition"
              >
                • {pill}
              </span>
            ))}
          </div>

          {/* Typewriter Prompt Display — 16px Inter */}
          <div className="mt-4 h-8 flex items-center justify-center font-body text-[16px] font-medium text-[#64748B] dark:text-[#94A3B8]">
            <span>{text}</span>
            <span className="w-0.5 h-5 ml-1 bg-[#0E2A6D] dark:bg-[#D9A441] animate-pulse" />
          </div>

          {/* CTA Buttons — Height 44px, Radius 14px, Gap 16px */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/dashboard"
              className="h-[44px] inline-flex items-center gap-2 px-6 bg-[#0E2A6D] hover:bg-[#153B8A] text-white font-heading font-bold text-[15px] tracking-[0.02em] rounded-[14px] shadow-md hover:-translate-y-0.5 transition-all"
            >
              <Bot size={18} strokeWidth={1.75} />
              <span>Launch CollegeMate AI</span>
              <ArrowRight size={18} strokeWidth={1.75} />
            </Link>
            <Link
              to="/register"
              className="h-[44px] inline-flex items-center gap-2 px-6 bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[#1F2937] dark:text-[#F8FAFC] font-heading font-bold text-[15px] tracking-[0.02em] rounded-[14px] hover:border-[#1E4DB7] hover:bg-[#F5F7FB] dark:hover:bg-[#111827] transition-all shadow-xs"
            >
              <span>Create Free Account</span>
            </Link>
          </div>
        </motion.div>

        {/* Quick Action Cards Grid (Height 150px, Padding 24px, Border Radius 18px, Gap 16px) */}
        <div className="mt-16 w-full max-w-5xl mx-auto relative z-10 px-2">
          <div className="text-center mb-8">
            <h3 className="font-heading text-[24px] font-bold tracking-[0.02em] text-[#0E2A6D] dark:text-[#D9A441]">
              Instant Campus Assistance Categories
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((card, i) => {
              const IconComp = card.icon;
              return (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.04 }}
                  whileHover={{ y: -4, scale: 1.02 }}
                  className="h-[150px] rounded-[18px] border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#1E293B] p-[24px] text-left shadow-xs transition-all hover:border-[#1E4DB7] dark:hover:border-[#D9A441] hover:shadow-md flex flex-col justify-between group cursor-pointer"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className={`w-8 h-8 rounded-xl ${card.color} flex items-center justify-center border`}>
                        <IconComp size={20} strokeWidth={1.75} />
                      </div>
                      {/* Badge: 13px Inter */}
                      <span className="rounded-full bg-[#F5F7FB] dark:bg-[#111827] px-2.5 py-0.5 font-body text-[13px] font-semibold text-[#0E2A6D] dark:text-[#D9A441]">
                        {card.category}
                      </span>
                    </div>
                    {/* Title: 16px League Spartan */}
                    <h4 className="font-heading font-bold text-[16px] text-[#1F2937] dark:text-[#F8FAFC] truncate mb-0.5 group-hover:text-[#0E2A6D] dark:group-hover:text-[#60A5FA]">
                      {card.title}
                    </h4>
                    {/* Body: 14px Inter */}
                    <p className="font-body text-[14px] text-[#64748B] dark:text-[#94A3B8] leading-snug line-clamp-1">
                      {card.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 text-center font-body text-[13px] text-[#64748B] dark:text-[#94A3B8] border-t border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#111827]">
        © {new Date().getFullYear()} <span className="font-heading font-bold text-[#0E2A6D] dark:text-[#D9A441]">{COLLEGE_NAME}</span> · {APP_NAME}
      </footer>
    </div>
  );
}
