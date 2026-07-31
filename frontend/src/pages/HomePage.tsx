import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  GraduationCap,
  MessageSquareText,
  BarChart3,
  BookOpen,
  Sparkles,
  ShieldCheck,
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
    title: 'Academics',
    desc: 'Syllabus, courses, and department details',
    color: 'text-blue-600 bg-blue-50 border-blue-200',
  },
  {
    icon: CheckCircle2,
    title: 'Attendance',
    desc: 'Percentage tracking and condonation rules',
    color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  },
  {
    icon: CreditCard,
    title: 'Fees',
    desc: 'Tuition fees, dues, and payment receipts',
    color: 'text-rose-600 bg-rose-50 border-rose-200',
  },
  {
    icon: Calendar,
    title: 'Exams',
    desc: 'CIA test dates and semester schedules',
    color: 'text-purple-600 bg-purple-50 border-purple-200',
  },
  {
    icon: Bus,
    title: 'Transport',
    desc: 'College bus routes and departure timings',
    color: 'text-amber-600 bg-amber-50 border-amber-200',
  },
  {
    icon: Library,
    title: 'Library',
    desc: 'Digital catalogue, hours, and book issue limits',
    color: 'text-teal-600 bg-teal-50 border-teal-200',
  },
  {
    icon: Briefcase,
    title: 'Placements',
    desc: 'Campus recruitment drives and CTC stats',
    color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
  },
  {
    icon: Home,
    title: 'Hostel',
    desc: 'Room allocation, mess menu, and warden info',
    color: 'text-cyan-600 bg-cyan-50 border-cyan-200',
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
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#F8FAFC] via-white to-[#F8FAFC] text-[#1F2937] select-none">
      {/* Header Bar */}
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
        <div className="flex h-16 w-full items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0A2A6A] text-white shadow-xs">
              <GraduationCap size={22} strokeWidth={1.75} />
            </div>
            <span className="font-heading text-lg font-bold tracking-tight text-[#0A2A6A]">{APP_NAME}</span>
          </div>
          <nav className="flex items-center gap-3">
            <Link
              to="/login"
              className="ty-btn px-4 py-2 text-slate-700 hover:text-[#0A2A6A] transition rounded-xl hover:bg-slate-100"
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className="ty-btn px-4 py-2 text-white bg-[#0A2A6A] rounded-xl hover:bg-[#163D8C] transition shadow-md shadow-[#0A2A6A]/20"
            >
              Get started
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-12 sm:py-16 relative overflow-hidden">
        {/* Soft Radial Background Blur Circles */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-gradient-to-tr from-[#0A2A6A]/10 to-[#163D8C]/15 blur-3xl pointer-events-none rounded-full" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 max-w-4xl mx-auto flex flex-col items-center"
        >
          {/* Floating Pulse AI Logo */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-tr from-[#0A2A6A] via-[#163D8C] to-[#0A2A6A] text-white shadow-2xl shadow-[#0A2A6A]/30 border border-white/30 relative"
          >
            <Bot size={40} strokeWidth={1.75} />
            <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-emerald-400 border-2 border-white animate-pulse" />
          </motion.div>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-[#0A2A6A] text-xs font-bold mb-4 shadow-xs">
            <Sparkles size={14} className="text-[#E8B24D]" />
            <span>Next-Gen RAG AI Assistant</span>
          </div>

          <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-bold text-[#0A2A6A] leading-tight tracking-tight">
            {APP_NAME}
          </h1>

          <p className="mt-3 text-base sm:text-lg font-semibold text-[#163D8C] max-w-2xl mx-auto">
            Your AI Assistant for {COLLEGE_NAME}
          </p>

          {/* Category Tag Pills */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-1.5 max-w-3xl">
            {categoryPills.map((pill) => (
              <span
                key={pill}
                className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-white border border-slate-200 text-slate-700 shadow-xs hover:border-[#163D8C] transition"
              >
                • {pill}
              </span>
            ))}
          </div>

          {/* Typewriter Prompt Display */}
          <div className="mt-6 h-8 flex items-center justify-center text-sm sm:text-base font-mono font-medium text-slate-600">
            <span>{text}</span>
            <span className="w-0.5 h-5 ml-1 bg-[#0A2A6A] animate-pulse" />
          </div>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#0A2A6A] text-white font-bold text-sm rounded-2xl shadow-xl shadow-[#0A2A6A]/20 hover:bg-[#163D8C] hover:-translate-y-0.5 transition-all"
            >
              <Bot size={18} />
              <span>Launch CollegeMate AI</span>
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-white border border-slate-300 text-slate-800 font-bold text-sm rounded-2xl hover:border-[#0A2A6A] hover:bg-slate-50 transition-all shadow-xs"
            >
              <span>Create Free Account</span>
            </Link>
          </div>
        </motion.div>

        {/* Quick Action Cards Grid */}
        <div className="mt-14 w-full max-w-5xl mx-auto relative z-10 px-2">
          <div className="text-center mb-6">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#0A2A6A]">
              Instant Campus Assistance Categories
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {quickActions.map((card, i) => {
              const IconComp = card.icon;
              return (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.04 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-xs transition-all hover:border-[#163D8C] hover:shadow-xl hover:shadow-[#0A2A6A]/5 group"
                >
                  <div className={`w-10 h-10 rounded-xl ${card.color} flex items-center justify-center mb-3 border`}>
                    <IconComp size={22} strokeWidth={1.75} />
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm mb-1 group-hover:text-[#0A2A6A]">
                    {card.title}
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {card.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 text-center text-xs font-semibold text-slate-500 border-t border-slate-200 bg-white">
        © {new Date().getFullYear()} {COLLEGE_NAME} · {APP_NAME}
      </footer>
    </div>
  );
}

