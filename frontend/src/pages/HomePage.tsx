<<<<<<< HEAD
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
=======
import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageSquare, ArrowRight, BookOpen, Clock, Calendar, ShieldCheck, Map, Sparkles } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Logo from '../components/Logo';

export default function HomePage() {
  const featuresRef = useRef<HTMLDivElement>(null);

  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col justify-between transition-colors duration-300">
      <Header />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-16 sm:py-24 grid gap-12 lg:grid-cols-2 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/10 bg-primary/5 dark:border-secondary/15 dark:bg-secondary/5 text-sm font-semibold text-primary dark:text-secondary">
              <Sparkles size={14} className="animate-pulse" />
              Mount Zion College of Engineering and Technology
            </div>
            
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.1] text-slate-900 dark:text-white">
              Welcome to <span className="text-gradient">CampusMate AI</span>
            </h1>
            
            <p className="text-lg text-slate-600 dark:text-slate-300 leading-8 max-w-xl">
              Your Intelligent Campus Assistant for Mount Zion College of Engineering and Technology. 
              Get instant answers about academics, attendance, examinations, fees, placements, library, hostel, and campus life.
            </p>
            
            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                to="/chat"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-primary to-accent dark:from-accent dark:to-primary text-white text-base font-semibold shadow-lg shadow-primary/10 hover:shadow-primary/20 hover:scale-[1.01] transition-all active:scale-95"
              >
                Start Chat
                <ArrowRight size={18} />
              </Link>
              <button
                onClick={scrollToFeatures}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 text-slate-700 dark:text-slate-300 text-base font-semibold shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition active:scale-95"
              >
                Explore Services
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative glass-panel soft-ring rounded-[32px] p-8 border border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/60 shadow-glass"
          >
            {/* Visual preview of chat bubble mockups */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-200/60 dark:border-slate-800/60 pb-4">
                <Logo size={42} showText={false} />
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-white text-sm">CampusMate AI</h3>
                  <span className="text-[10px] text-green-500 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping" />
                    Active RAG Engine
                  </span>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="max-w-[80%] rounded-[20px] rounded-bl-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 px-4 py-3 text-xs text-slate-600 dark:text-slate-300 leading-5">
                  👋 Hello! I'm your Mount Zion College AI assistant. Ask me anything about admissions, departments, library timings, hostel rules, or placement coordinates!
                </div>
                <div className="max-w-[75%] ml-auto rounded-[20px] rounded-br-md bg-primary dark:bg-accent px-4 py-3 text-xs text-white leading-5">
                  What are the eligibility criteria for placements?
                </div>
                <div className="max-w-[85%] rounded-[20px] rounded-bl-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 px-4 py-3 text-xs text-slate-600 dark:text-slate-300 leading-5">
                  Students must maintain a minimum CGPA of 6.0 and have no active backlogs. Training starts in the 3rd year.
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Intro Section */}
        <section className="bg-slate-100/50 dark:bg-slate-950/40 py-16 transition-colors duration-300">
          <div className="container mx-auto px-4 max-w-4xl text-center space-y-6">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
              About the Platform
            </h2>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-8">
              CampusMate AI is an AI-powered virtual assistant developed for Mount Zion College of Engineering and Technology, Pudukkottai. 
              It provides students, faculty, and staff with instant access to academic information, administrative services, 
              campus announcements, and institutional knowledge using advanced AI and Retrieval-Augmented Generation (RAG).
            </p>
          </div>
        </section>

        {/* Features / Services Section */}
        <section ref={featuresRef} className="container mx-auto px-4 py-16 sm:py-24 space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">
              Explore Campus Services
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
              Get direct guidance on different aspects of Mount Zion College operations instantly.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: 'Academic & Courses',
                description: 'Inquire about curriculum structures, syllabus materials, and department regulations.',
                icon: BookOpen,
              },
              {
                title: 'Placements Updates',
                description: 'Review placement cell eligibility standards, training schedules, and active partners.',
                icon: ShieldCheck,
              },
              {
                title: 'Library Services',
                description: 'Access information on book searches, reservation limits, digital library catalogs, and study hours.',
                icon: Clock,
              },
              {
                title: 'Hostel & Hostel Life',
                description: 'Get instructions on hostel room admissions, mess menus, curfew rules, and warden details.',
                icon: Map,
              },
              {
                title: 'Examination Schedules',
                description: 'Ask for internal assessments, semester exams, review rules, and fee structures.',
                icon: Calendar,
              },
              {
                title: 'RAG Answers',
                description: 'Our system reads real college documents, guaranteeing trusted campus-specific responses.',
                icon: MessageSquare,
              },
            ].map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="glass-panel soft-ring card-hover rounded-[24px] p-6 space-y-4"
                >
                  <div className="inline-flex p-3 rounded-xl bg-primary/5 dark:bg-secondary/5 text-primary dark:text-secondary">
                    <Icon size={20} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{feature.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-6">{feature.description}</p>
                </div>
              );
            })}
          </div>

          {/* Final CTA */}
          <div className="text-center pt-8">
            <Link
              to="/chat"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-primary to-accent dark:from-accent dark:to-primary text-white text-base font-semibold shadow-lg hover:scale-[1.01] transition active:scale-95"
            >
              <MessageSquare size={18} />
              Launch Chatbot Now
            </Link>
          </div>
        </section>
      </main>

      <Footer />
>>>>>>> 5f8c52a2a79f075aeeb064756d298fcea307a590
    </div>
  );
}
