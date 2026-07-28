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
} from 'lucide-react';
import { APP_NAME, COLLEGE_NAME } from '../lib/constants';

const features = [
  {
    icon: MessageSquareText,
    title: 'AI-Powered Chat',
    description: 'Ask anything about attendance, fees, schedules, and certificates. Get instant, verified answers.',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    icon: BarChart3,
    title: 'Student Portal',
    description: 'View your attendance, grades, assignments, timetable, and fee status — all in one place.',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
  },
  {
    icon: BookOpen,
    title: 'Library & Resources',
    description: 'Explore the digital library, check book availability, and access study materials.',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
  },
  {
    icon: ShieldCheck,
    title: 'Admin Dashboard',
    description: 'Manage documents, students, and the RAG knowledge base — all with role-based access control.',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
  },
];

const fadeUp = { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 } };

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <header className="glass-panel sticky top-0 z-30">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0A2A6A] flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-[#E8B24D]" />
            </div>
            <span className="font-bold text-[#0A2A6A] text-lg">{APP_NAME}</span>
          </div>
          <nav className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-[#0A2A6A] transition rounded-lg hover:bg-slate-100"
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 text-sm font-semibold text-white bg-[#0A2A6A] rounded-xl hover:bg-[#163D8C] transition shadow-sm shadow-[#0A2A6A]/20"
            >
              Get started
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20 sm:py-28">
        <motion.div {...fadeUp} transition={{ duration: 0.5 }}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-semibold mb-6 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            Powered by Gemini AI + RAG
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-[#0A2A6A] leading-tight max-w-3xl mx-auto">
            Your AI Campus<br />
            <span className="text-gradient">Assistant</span>
          </h1>
          <p className="mt-6 text-lg text-slate-500 max-w-xl mx-auto leading-relaxed">
            {APP_NAME} combines AI-powered chat with a full student portal for {COLLEGE_NAME}.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#0A2A6A] text-white font-semibold rounded-xl shadow-lg shadow-[#0A2A6A]/20 hover:bg-[#163D8C] hover:-translate-y-0.5 transition-all"
            >
              <Bot className="w-4 h-4" />
              Open Dashboard
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-6 py-3 border border-slate-200 text-slate-700 font-medium rounded-xl hover:border-[#0A2A6A]/30 hover:bg-white transition-all"
            >
              Create free account
            </Link>
          </div>
        </motion.div>

        {/* Hero visual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-16 w-full max-w-3xl glass-panel rounded-2xl overflow-hidden soft-ring"
        >
          <div className="bg-gradient-to-r from-[#0A2A6A] to-[#163D8C] px-6 py-4 flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400/70" />
              <div className="w-3 h-3 rounded-full bg-yellow-400/70" />
              <div className="w-3 h-3 rounded-full bg-green-400/70" />
            </div>
            <span className="text-white/80 text-xs font-medium ml-2">CampusMate AI Dashboard</span>
          </div>
          <div className="p-6 space-y-4 bg-white/80">
            {[
              { q: "What is the minimum attendance to appear for final exams?", a: "A minimum of **75%** attendance is required in each subject. Medical leave with a valid certificate may provide up to 10% condonation." },
              { q: "When is the library open?", a: "The library is open **Monday to Saturday from 8:00 AM to 8:00 PM**. Special extended hours are available during exam periods." },
            ].map((item, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-end">
                  <div className="bg-[#0A2A6A] text-white text-sm px-4 py-2.5 rounded-2xl rounded-br-sm max-w-xs shadow-sm">
                    {item.q}
                  </div>
                </div>
                <div className="flex">
                  <div className="bg-slate-100 text-slate-700 text-sm px-4 py-2.5 rounded-2xl rounded-bl-sm max-w-xs shadow-sm">
                    {item.a}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-white/60">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#0A2A6A]">Everything you need</h2>
            <p className="mt-3 text-slate-500 max-w-lg mx-auto">One unified platform for students, faculty, and administrators.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                {...fadeUp}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="glass-panel rounded-2xl p-6 card-hover soft-ring"
              >
                <div className={`w-10 h-10 rounded-xl ${f.bg} flex items-center justify-center mb-4`}>
                  <f.icon className={`w-5 h-5 ${f.color}`} />
                </div>
                <h3 className="font-semibold text-slate-800 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 text-center">
        <div className="glass-panel rounded-3xl py-12 px-8 max-w-2xl mx-auto soft-ring">
          <div className="w-14 h-14 rounded-2xl bg-[#0A2A6A] flex items-center justify-center mx-auto mb-6 shadow-lg">
            <GraduationCap className="w-8 h-8 text-[#E8B24D]" />
          </div>
          <h2 className="text-3xl font-bold text-[#0A2A6A] mb-4">Ready to get started?</h2>
          <p className="text-slate-500 mb-8">
            Join {COLLEGE_NAME}'s digital campus — powered by AI.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/register"
              className="px-6 py-3 bg-[#0A2A6A] text-white font-semibold rounded-xl shadow-md shadow-[#0A2A6A]/20 hover:bg-[#163D8C] transition hover:-translate-y-0.5"
            >
              Create free account
            </Link>
            <Link
              to="/login"
              className="px-6 py-3 border border-slate-200 text-slate-700 font-medium rounded-xl hover:border-[#0A2A6A]/30 transition"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-slate-400 border-t border-slate-100">
        © {new Date().getFullYear()} {COLLEGE_NAME} · {APP_NAME}
      </footer>
    </div>
  );
}
