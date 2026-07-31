import React from 'react';
import { motion } from 'framer-motion';
import { Brain, FileText, Sparkles, Shield, Cpu, HelpCircle } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col justify-between transition-colors duration-300">
      <Header />

      <main className="flex-1 container py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-4xl mx-auto space-y-12"
        >
          {/* Hero Header */}
          <section className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/10 bg-primary/5 dark:border-secondary/15 dark:bg-secondary/5 text-sm font-semibold text-primary dark:text-secondary">
              <Sparkles size={14} />
              About CollegeMate AI
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
              <span className="text-gradient">Intelligent Assistant for Mount Zion</span>
            </h1>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-8">
              Learn about the AI technology supporting students, faculty, and administrative staff at Mount Zion College of Engineering and Technology, Pudukkottai.
            </p>
          </section>

          {/* Description Block */}
          <section className="glass-panel soft-ring rounded-[32px] p-8 sm:p-10 space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">What is CollegeMate AI?</h2>
            <p className="text-slate-600 dark:text-slate-300 leading-8">
              CollegeMate AI is an AI-powered virtual assistant developed for Mount Zion College of Engineering and Technology, Pudukkottai. It provides students, faculty, and staff with instant access to academic information, administrative services, campus announcements, and institutional knowledge using advanced AI and Retrieval-Augmented Generation (RAG).
            </p>
            <p className="text-slate-600 dark:text-slate-300 leading-8">
              By combining semantic search with pre-indexed college documents, CollegeMate AI ensures that answer delivery is accurate, polite, and contextual to the college campus.
            </p>
          </section>

          {/* RAG Technology Features */}
          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-center text-slate-900 dark:text-white">How It Works</h2>
            <div className="grid gap-6 sm:grid-cols-2">
              {[
                {
                  title: 'Retrieval-Augmented Generation (RAG)',
                  description: 'Our assistant doesn\'t hallucinate. It reads actual, uploaded college manuals, schedules, course documents, and rules, extracting text segments dynamically to draft precise answers.',
                  icon: Brain,
                },
                {
                  title: 'Document Indexing',
                  description: 'The FastAPI backend tokenizes and embeds documents into a vector space. When you search, the chatbot matches your question with the most relevant passages of text.',
                  icon: FileText,
                },
                {
                  title: 'Instant Institutional Knowledge',
                  description: 'Get instant answers on department curricula, exam instructions, placements criteria, bus routes, fee structures, library hours, and hostel regulations.',
                  icon: Cpu,
                },
                {
                  title: 'Secure Operations',
                  description: 'Built with safety and data privacy in mind. Student and queries are processed locally and securely to deliver a clean campus assistant interface.',
                  icon: Shield,
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="glass-panel soft-ring card-hover rounded-[24px] p-6 space-y-3"
                  >
                    <div className="inline-flex p-3 rounded-xl bg-primary/5 dark:bg-secondary/5 text-primary dark:text-secondary">
                      <Icon size={20} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{item.title}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-6">{item.description}</p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* RAG Knowledge Bases */}
          <section className="glass-panel soft-ring rounded-[32px] p-8 sm:p-10 space-y-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <HelpCircle size={20} className="text-primary dark:text-secondary" />
              Frequently Answered Categories
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary shrink-0" />
                Admission Guidelines
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary shrink-0" />
                Departments & Courses
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary shrink-0" />
                Exam Timetables
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary shrink-0" />
                Placements Cell Dues
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary shrink-0" />
                Library Timings & Rules
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary shrink-0" />
                Hostel and Mess Details
              </div>
            </div>
          </section>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
