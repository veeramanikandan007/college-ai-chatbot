import { motion } from 'framer-motion';

interface SuggestedQuestionsProps {
  onSelectQuestion: (question: string) => void;
}

const suggestions = [
  {
    icon: '📊',
    category: 'Attendance',
    question: 'What is the attendance rule and condonation process?',
    prompt: 'What is the attendance rule and condonation process?',
  },
  {
    icon: '💳',
    category: 'Fees',
    question: 'Show my semester fee details and due dates',
    prompt: 'Show my semester fee details and due dates',
  },
  {
    icon: '🚌',
    category: 'Bus Timing',
    question: 'What are the college bus routes and departure timings?',
    prompt: 'What are the college bus routes and departure timings?',
  },
  {
    icon: '💼',
    category: 'Placement',
    question: 'What are the recent campus placement statistics?',
    prompt: 'What are the recent campus placement statistics?',
  },
  {
    icon: '📅',
    category: 'Timetable',
    question: 'Where can I see my class timetable and lab schedules?',
    prompt: 'Where can I see my class timetable and lab schedules?',
  },
  {
    icon: '📚',
    category: 'Library',
    question: 'What are the library working hours and book issue limits?',
    prompt: 'What are the library working hours and book issue limits?',
  },
  {
    icon: '📝',
    category: 'Exam Schedule',
    question: 'When do mid-term and semester exams start?',
    prompt: 'When do mid-term and semester exams start?',
  },
  {
    icon: '📜',
    category: 'Certificates',
    question: 'How can I apply for a Bonafide or Transfer Certificate?',
    prompt: 'How can I apply for a Bonafide or Transfer Certificate?',
  },
];

export default function SuggestedQuestions({ onSelectQuestion }: SuggestedQuestionsProps) {
  return (
    <div className="mx-auto my-auto max-w-4xl px-4 py-8 select-none">
      {/* Hero Welcome Header */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#0A2A6A] to-[#163D8C] text-2xl text-white shadow-xl shadow-[#0A2A6A]/20">
          🎓
        </div>
        <h2 className="text-3xl font-bold text-[#0A2A6A]">
          How can I help you today?
        </h2>
        <p className="mt-2 text-sm text-[#64748B]">
          Ask CollegeMate AI about attendance, fees, bus timings, exam rules, or certificates.
        </p>
      </div>

      {/* Suggested Cards Grid */}
      <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        {suggestions.map((item, index) => (
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
                <span className="text-xl">{item.icon}</span>
                <span className="rounded-full bg-[#F1F5F9] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#163D8C] group-hover:bg-[#163D8C]/10">
                  {item.category}
                </span>
              </div>
              <p className="text-xs font-semibold text-[#0A2A6A] line-clamp-2">
                {item.question}
              </p>
            </div>
            <span className="mt-3 text-[11px] font-bold text-[#163D8C] opacity-0 transition group-hover:opacity-100">
              Ask AI →
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
