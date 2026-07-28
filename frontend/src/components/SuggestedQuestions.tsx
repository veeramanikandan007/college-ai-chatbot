import { motion } from 'framer-motion';
import { THEME_COLORS } from '../constants/theme';
import {
  CheckCircle2,
  CreditCard,
  Bus,
  Briefcase,
  Calendar,
  BookOpen,
  FileText,
  Award,
  Bot,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface SuggestedQuestionsProps {
  onSelectQuestion: (question: string) => void;
}

const suggestions = [
  {
    Icon: CheckCircle2,
    category: 'Attendance',
    question: 'What is the attendance rule and condonation process?',
    prompt: 'What is the attendance rule and condonation process?',
    color: 'text-emerald-600 bg-emerald-50',
  },
  {
    Icon: CreditCard,
    category: 'Fees',
    question: 'Show my semester fee details and due dates',
    prompt: 'Show my semester fee details and due dates',
    color: 'text-blue-600 bg-blue-50',
  },
  {
    Icon: Bus,
    category: 'Bus Timing',
    question: 'What are the college bus routes and departure timings?',
    prompt: 'What are the college bus routes and departure timings?',
    color: 'text-amber-600 bg-amber-50',
  },
  {
    Icon: Briefcase,
    category: 'Placement',
    question: 'What are the recent campus placement statistics?',
    prompt: 'What are the recent campus placement statistics?',
    color: 'text-purple-600 bg-purple-50',
  },
  {
    Icon: Calendar,
    category: 'Timetable',
    question: 'Where can I see my class timetable and lab schedules?',
    prompt: 'Where can I see my class timetable and lab schedules?',
    color: 'text-indigo-600 bg-indigo-50',
  },
  {
    Icon: BookOpen,
    category: 'Library',
    question: 'What are the library working hours and book issue limits?',
    prompt: 'What are the library working hours and book issue limits?',
    color: 'text-teal-600 bg-teal-50',
  },
  {
    Icon: FileText,
    category: 'Exam Schedule',
    question: 'When do mid-term and semester exams start?',
    prompt: 'When do mid-term and semester exams start?',
    color: 'text-rose-600 bg-rose-50',
  },
  {
    Icon: Award,
    category: 'Certificates',
    question: 'How can I apply for a Bonafide or Transfer Certificate?',
    prompt: 'How can I apply for a Bonafide or Transfer Certificate?',
    color: 'text-amber-600 bg-amber-50',
  },
];

export default function SuggestedQuestions({ onSelectQuestion }: SuggestedQuestionsProps) {
  return (
    <div className="mx-auto my-auto max-w-4xl px-4 py-8 select-none">
      {/* Hero Welcome Header */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#0A2A6A] to-[#163D8C] text-white shadow-xl shadow-[#0A2A6A]/20">
          <Bot className="h-7 w-7" />
        </div>
        <div className="flex items-center justify-center gap-2 text-3xl font-bold text-[#0A2A6A]">
          <span>How can I help you today?</span>
          <Sparkles className="h-6 w-6 text-[#E8B24D]" />
        </div>
        <p className="mt-2 text-sm text-[#64748B]">
          Ask CollegeMate AI about attendance, fees, bus timings, exam rules, or certificates.
        </p>
      </div>

      {/* Suggested Cards Grid */}
      <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        {suggestions.map((item, index) => {
          const IconComponent = item.Icon;

          return (
            <motion.button
              key={item.category}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: index * 0.04 }}
              onClick={() => onSelectQuestion(item.prompt)}
              className="group flex flex-col justify-between rounded-2xl border border-[#E2E8F0] bg-white p-4 text-left shadow-xs transition hover:-translate-y-0.5 hover:border-[#163D8C] hover:bg-[#F8FAFC] hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${item.color}`}>
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <span className="rounded-full bg-[#F1F5F9] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#163D8C] group-hover:bg-[#163D8C]/10">
                    {item.category}
                  </span>
                </div>
                <p className="text-xs font-semibold text-[#0A2A6A] line-clamp-2">
                  {item.question}
                </p>
              </div>
              <div className="mt-3 flex items-center gap-1 text-[11px] font-bold text-[#163D8C] opacity-0 transition group-hover:opacity-100">
                <span>Ask AI</span>
                <ArrowRight className="h-3 w-3" />
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
