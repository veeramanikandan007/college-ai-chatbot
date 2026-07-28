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
    </div>
  );
}
