import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem } from '../lib/animations';
import {
  BookOpen,
  CheckCircle2,
  CreditCard,
  Calendar,
  Bus,
  Library,
  Briefcase,
  Home,
  Bot,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface SuggestedQuestionsProps {
  onSelectQuestion: (question: string) => void;
}

const actionCards = [
  {
    icon: BookOpen,
    category: 'Academics',
    question: 'Show my course syllabus and subject details',
    prompt: 'Show my course syllabus and subject details',
    color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800',
  },
  {
    icon: CheckCircle2,
    category: 'Attendance',
    question: 'What is my current attendance percentage and condonation rule?',
    prompt: 'What is my current attendance percentage and condonation rule?',
    color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800',
  },
  {
    icon: CreditCard,
    category: 'Fees',
    question: 'Show my tuition fee status and upcoming due dates',
    prompt: 'Show my tuition fee status and upcoming due dates',
    color: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/30 border-rose-200 dark:border-rose-800',
  },
  {
    icon: Calendar,
    category: 'Exams',
    question: 'When do semester examinations and CIA tests start?',
    prompt: 'When do semester examinations and CIA tests start?',
    color: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 border-purple-200 dark:border-purple-800',
  },
  {
    icon: Bus,
    category: 'Transport',
    question: 'What are the college bus routes and timing schedules?',
    prompt: 'What are the college bus routes and timing schedules?',
    color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800',
  },
  {
    icon: Library,
    category: 'Library',
    question: 'What are the digital library working hours and book rules?',
    prompt: 'What are the digital library working hours and book rules?',
    color: 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/30 border-teal-200 dark:border-teal-800',
  },
  {
    icon: Briefcase,
    category: 'Placements',
    question: 'Show recent campus placement drives and company salary packages',
    prompt: 'Show recent campus placement drives and company salary packages',
    color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-800',
  },
  {
    icon: Home,
    category: 'Hostel',
    question: 'What are the hostel room rules and mess timings?',
    prompt: 'What are the hostel room rules and mess timings?',
    color: 'text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-900/30 border-cyan-200 dark:border-cyan-800',
  },
];

const typewriterPhrases = [
  'Ask anything about your college...',
  'Check attendance, fees, timetable & exams...',
  'Get placement stats, hostel & transport info...',
];

export default function SuggestedQuestions({ onSelectQuestion }: SuggestedQuestionsProps) {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [text, setText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentPhrase = typewriterPhrases[phraseIndex];
    const typingSpeed = isDeleting ? 30 : 60;

    const timer = setTimeout(() => {
      if (!isDeleting && text === currentPhrase) {
        setTimeout(() => setIsDeleting(true), 2000);
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
    <div className="mx-auto my-auto max-w-4xl px-4 py-6 select-none flex flex-col justify-center min-h-[60vh]">
      {/* Floating AI Logo & Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 text-center"
      >
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#0A2A6A] via-[#163D8C] to-[#0A2A6A] text-white shadow-xl shadow-[#0A2A6A]/25 border border-white/20 relative"
        >
          <Bot size={32} strokeWidth={1.75} />
          <div className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-emerald-400 border-2 border-white dark:border-slate-900 animate-pulse" />
        </motion.div>

        <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-[#0A2A6A] dark:text-slate-100 flex items-center justify-center gap-2">
          <span>How can I help you today?</span>
          <Sparkles className="h-6 w-6 text-[#E8B24D]" />
        </h1>

        <p className="ty-desc mt-2 font-semibold text-[#163D8C] dark:text-secondary max-w-xl mx-auto">
          Mount Zion College of Engineering and Technology
        </p>

        {/* Typewriter text string */}
        <div className="mt-2 h-6 flex items-center justify-center font-code text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          <span>{text}</span>
          <span className="w-0.5 h-4 ml-0.5 bg-[#0A2A6A] dark:bg-secondary animate-pulse" />
        </div>
      </motion.div>

      {/* Suggested Quick Action Cards */}
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
      >
        {actionCards.map((item) => {
          const IconComponent = item.icon;

          return (
            <motion.button
              key={item.category}
              variants={staggerItem}
              whileHover={{ y: -5, scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onSelectQuestion(item.prompt)}
              className="group flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-4 text-left shadow-xs transition-all hover:border-[#163D8C] dark:hover:border-secondary hover:shadow-lg hover:shadow-[#0A2A6A]/5"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-xl border ${item.color}`}>
                    <IconComponent size={20} strokeWidth={1.75} />
                  </div>
                  <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#163D8C] dark:text-secondary group-hover:bg-[#163D8C]/10">
                    {item.category}
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-2 leading-snug">
                  {item.question}
                </p>
              </div>
              <div className="mt-3 flex items-center gap-1 text-[11px] font-bold text-[#163D8C] dark:text-secondary opacity-0 transition group-hover:opacity-100">
                <span>Ask AI</span>
                <ArrowRight size={12} strokeWidth={2} />
              </div>
            </motion.button>
          );
        })}
      </motion.div>
    </div>
  );
}

