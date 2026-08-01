import React from 'react';
import { motion } from 'framer-motion';
import { Brain, FileText, Sparkles, Shield, Cpu, HelpCircle } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col justify-between transition-colors duration-300 bg-[#F5F7FB] dark:bg-[#0F172A] text-[#1F2937] dark:text-[#F8FAFC] font-body">
      <Header />

      <main className="flex-1 container mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-4xl mx-auto space-y-12"
        >
          {/* Hero Header */}
          <section className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#0E2A6D]/20 bg-[#0E2A6D]/5 text-small font-bold text-[#0E2A6D] dark:text-[#D9A441]">
              <Sparkles size={14} />
              About CollegeMate AI
            </div>
            <h1 className="font-heading font-extrabold text-hero tracking-[0.02em] text-[#0E2A6D] dark:text-[#F8FAFC]">
              Intelligent Assistant for Mount Zion
            </h1>
            <p className="mt-4 text-body text-[#475569] dark:text-[#CBD5E1] max-w-2xl mx-auto leading-relaxed">
              Learn about the AI technology supporting students, faculty, and administrative staff at Mount Zion College of Engineering and Technology, Pudukkottai.
            </p>
          </section>

          {/* Description Block */}
          <section className="glass-panel rounded-xl p-8 sm:p-10 space-y-4">
            <h2 className="font-heading font-bold text-section text-[#1F2937] dark:text-[#F8FAFC]">What is CollegeMate AI?</h2>
            <p className="text-body text-[#475569] dark:text-[#CBD5E1] leading-relaxed">
              CollegeMate AI is an AI-powered virtual assistant developed for Mount Zion College of Engineering and Technology, Pudukkottai. It provides students, faculty, and staff with instant access to academic information, administrative services, campus announcements, and institutional knowledge using advanced AI and Retrieval-Augmented Generation (RAG).
            </p>
            <p className="text-body text-[#475569] dark:text-[#CBD5E1] leading-relaxed">
              By combining semantic search with pre-indexed college documents, CollegeMate AI ensures that answer delivery is accurate, polite, and contextual to the college campus.
            </p>
          </section>

          {/* RAG Technology Features */}
          <section className="space-y-6">
            <h2 className="font-heading font-bold text-section text-center text-[#1F2937] dark:text-[#F8FAFC]">How It Works</h2>
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
                  description: 'Built with safety and data privacy in mind. Student queries are processed locally and securely to deliver a clean campus assistant interface.',
                  icon: Shield,
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="glass-panel card-hover rounded-xl p-6 space-y-3"
                  >
                    <div className="inline-flex p-3 rounded-xl bg-[#0E2A6D]/10 dark:bg-[#60A5FA]/10 text-[#0E2A6D] dark:text-[#60A5FA]">
                      <Icon size={20} />
                    </div>
                    <h3 className="font-heading font-bold text-card text-[#1F2937] dark:text-[#F8FAFC]">{item.title}</h3>
                    <p className="text-small text-[#64748B] dark:text-[#94A3B8] leading-relaxed">{item.description}</p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* RAG Knowledge Bases */}
          <section className="glass-panel rounded-xl p-8 sm:p-10 space-y-6">
            <h2 className="font-heading font-bold text-section text-[#1F2937] dark:text-[#F8FAFC] flex items-center gap-2">
              <HelpCircle size={24} className="text-[#0E2A6D] dark:text-[#60A5FA]" />
              Frequently Answered Categories
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-body text-[#475569] dark:text-[#CBD5E1]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#D9A441] shrink-0" />
                Admission Guidelines
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#D9A441] shrink-0" />
                Departments & Courses
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#D9A441] shrink-0" />
                Exam Timetables
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#D9A441] shrink-0" />
                Placements Cell Dues
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#D9A441] shrink-0" />
                Library Timings & Rules
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#D9A441] shrink-0" />
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
