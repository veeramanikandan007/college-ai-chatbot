import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Bot,
  ArrowRight,
  Search,
  Mic,
  Paperclip,
  Send,
  MessageSquare,
  FileText,
  Scan,
  BookOpen,
  Brain,
  Briefcase,
  Calendar,
  BarChart3,
  Folder,
  Layers,
  Users,
  Building2,
  Zap,
  CheckCircle2,
  ShieldCheck,
  Star,
  Quote,
  Globe,
  Share2,
  ArrowUpRight,
  HelpCircle,
  Clock,
  Award
} from 'lucide-react';
import { APP_NAME, COLLEGE_NAME } from '../lib/constants';

const FEATURE_TAGS = [
  'Attendance',
  'Fees',
  'Timetable',
  'Placement',
  'Hostel',
  'Scholarships',
  'Certificates',
  'Transport',
  'Library',
  'Exams',
  'Admissions',
  'Results',
];

const SEARCH_EXAMPLES = [
  "What is today's timetable?",
  "Download Semester 5 syllabus",
  "Generate my resume",
  "Check my current attendance percentage",
  "When is the next CIA exam?"
];

const FEATURES_GRID = [
  {
    icon: MessageSquare,
    title: 'AI Chat',
    description: 'Context-aware campus assistant for course queries, timetables, and campus FAQs.',
    link: '/dashboard',
  },
  {
    icon: FileText,
    title: 'Resume Builder',
    description: 'ATS-optimized technical resume generator with 1-click AI action verbs & scoring.',
    link: '/resume-builder',
  },
  {
    icon: Scan,
    title: 'OCR Scanner',
    description: 'Extract handwritten notes, textbook pages, and document scans into searchable text.',
    link: '/ocr-scanner',
  },
  {
    icon: BookOpen,
    title: 'Notes Generator',
    description: 'Auto-synthesize syllabus PDFs into revision summaries, key terms, and flashcards.',
    link: '/notes-generator',
  },
  {
    icon: Brain,
    title: 'Quiz Generator',
    description: 'Generate document-based mock quizzes with automated grading & AI explanations.',
    link: '/quiz-generator',
  },
  {
    icon: Briefcase,
    title: 'Placement Hub',
    description: 'Track campus placement drives, company requirements, coding problems & mock interviews.',
    link: '/placement-hub',
  },
  {
    icon: Calendar,
    title: 'Study Planner',
    description: 'Adaptive study roadmap planner with countdown timers and daily progress tracking.',
    link: '/study-planner',
  },
  {
    icon: BarChart3,
    title: 'Analytics',
    description: 'Cross-module telemetry performance insights, attendance prediction & risk alerts.',
    link: '/analytics',
  },
  {
    icon: Folder,
    title: 'Document Hub',
    description: 'Centralized vector RAG document storage with folder tagging and instant AI chat.',
    link: '/document-hub',
  },
  {
    icon: Layers,
    title: 'Knowledge Base',
    description: 'Comprehensive repository of course notes, formulas, definitions, and previous papers.',
    link: '/notes',
  },
];

const STATS_DATA = [
  { value: '10,000+', label: 'Students', desc: 'Active student users across departments', icon: Users },
  { value: '50+', label: 'Departments', desc: 'Engineering, Arts, Science & Management', icon: Building2 },
  { value: '1M+', label: 'AI Conversations', desc: 'Questions answered by CollegeMate AI', icon: MessageSquare },
  { value: '99.9%', label: 'Availability', desc: 'Enterprise-grade uptime & instant response', icon: Zap },
];

const STEPS_DATA = [
  {
    step: '01',
    title: 'Ask',
    desc: 'Type your academic question, check timetables, or upload a textbook PDF or assignment scan.',
    icon: MessageSquare,
  },
  {
    step: '02',
    title: 'AI Understands',
    desc: 'Our grounded RAG vector engine indexes your query against college data and course material.',
    icon: Brain,
  },
  {
    step: '03',
    title: 'Instant College Answer',
    desc: 'Receive verified answers, structured study notes, ATS resume feedback, or flashcard decks.',
    icon: CheckCircle2,
  },
];

const TESTIMONIALS_DATA = [
  {
    quote: "CollegeMate AI transformed my exam preparation. I generated revision notes and flashcards from my lecture slides in seconds!",
    name: "Ananya Sharma",
    role: "Final Year B.Tech CSE",
    tag: "Student Review"
  },
  {
    quote: "As a professor, recommending CollegeMate AI to students cut down repetitive syllabus questions significantly. Outstanding platform!",
    name: "Dr. K. R. Ramanathan",
    role: "Professor & HOD, IT Dept",
    tag: "Faculty Review"
  },
  {
    quote: "The ATS Resume Builder and Placement Hub helped over 90% of our campus candidates pass automated recruiter screeners.",
    name: "S. Meenakshi",
    role: "Head of Training & Placement",
    tag: "Placement Review"
  }
];

export default function HomePage() {
  const navigate = useNavigate();

  // Search Box State
  const [searchQuery, setSearchQuery] = useState('');
  const [exampleIndex, setExampleIndex] = useState(0);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  // Typewriter placeholder animation
  useEffect(() => {
    const interval = setInterval(() => {
      setExampleIndex((prev) => (prev + 1) % SEARCH_EXAMPLES.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  // Testimonial carousel auto-slide
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % TESTIMONIALS_DATA.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/dashboard?query=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate('/dashboard');
    }
  };

  const handleExampleClick = (example: string) => {
    setSearchQuery(example);
    navigate(`/dashboard?query=${encodeURIComponent(example)}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] dark:bg-[#0A0A0A] text-[#111827] dark:text-[#FAFAFA] transition-colors duration-300 font-sans select-none overflow-x-hidden">
      
      {/* Navigation Header */}
      <header className="sticky top-0 z-40 border-b border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#FFFFFF]/90 dark:bg-[#0A0A0A]/90 backdrop-blur-md">
        <div className="max-w-[1440px] mx-auto flex h-[72px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-[12px] bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] flex items-center justify-center transition-transform group-hover:scale-105">
              <Bot size={22} />
            </div>
            <div>
              <span className="text-[20px] font-semibold tracking-tight text-[#111827] dark:text-[#FAFAFA]">
                {APP_NAME}
              </span>
              <span className="hidden sm:inline-block text-[12px] font-normal text-[#6B7280] dark:text-[#A1A1AA] ml-2">
                {COLLEGE_NAME}
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-[15px] font-medium text-[#6B7280] dark:text-[#A1A1AA]">
            <a href="#features" className="hover:text-[#111827] dark:hover:text-[#FAFAFA] transition">Features</a>
            <a href="#why-us" className="hover:text-[#111827] dark:hover:text-[#FAFAFA] transition">Why Us</a>
            <a href="#how-it-works" className="hover:text-[#111827] dark:hover:text-[#FAFAFA] transition">How It Works</a>
            <a href="#testimonials" className="hover:text-[#111827] dark:hover:text-[#FAFAFA] transition">Reviews</a>
          </nav>

          {/* Header Action CTAs */}
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="h-[40px] px-4 rounded-[10px] text-[15px] font-medium text-[#111827] dark:text-[#FAFAFA] hover:bg-[#F1F5F9] dark:hover:bg-[#18181B] transition flex items-center justify-center"
            >
              Sign In
            </Link>
            <Link
              to="/dashboard"
              className="h-[40px] px-5 rounded-[10px] bg-[#111827] hover:bg-[#1F2937] dark:bg-[#FAFAFA] dark:hover:bg-[#E5E5E5] text-[#FFFFFF] dark:text-[#111111] text-[15px] font-medium transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <span>Launch Platform</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 space-y-16 sm:space-y-24 py-8 sm:py-16">
        
        {/* HERO SECTION (Split Layout) */}
        <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* HERO LEFT COLUMN */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-6 space-y-6 text-left"
            >
              {/* Small Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#FFFFFF] dark:bg-[#18181B] shadow-xs">
                <Sparkles size={16} className="text-[#4F46E5]" />
                <span className="text-[13px] font-medium text-[#111827] dark:text-[#FAFAFA]">
                  AI Powered Student Platform
                </span>
              </div>

              {/* Main Hero Headings */}
              <div className="space-y-3">
                <h1 className="text-[36px] sm:text-[48px] lg:text-[56px] font-semibold text-[#111827] dark:text-[#FAFAFA] tracking-tight leading-[1.1]">
                  CollegeMate AI
                </h1>
                <p className="text-[20px] sm:text-[24px] font-medium text-[#4F46E5] dark:text-[#818CF8] leading-snug">
                  Smart Campus Assistant for Students, Faculty and Administration.
                </p>
              </div>

              {/* Hero Subheading */}
              <p className="text-[16px] sm:text-[18px] lg:text-[20px] font-normal text-[#6B7280] dark:text-[#A1A1AA] leading-relaxed max-w-xl">
                One AI platform to manage academics, attendance, notes, placements, exams, assignments, and campus services.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                <Link
                  to="/dashboard"
                  className="h-[48px] px-7 rounded-[12px] bg-[#111827] hover:bg-[#1F2937] dark:bg-[#FAFAFA] dark:hover:bg-[#E5E5E5] text-[#FFFFFF] dark:text-[#111111] text-[15px] font-medium transition flex items-center justify-center gap-2 shadow-md cursor-pointer"
                >
                  <Bot size={20} />
                  <span>Launch CollegeMate AI</span>
                  <ArrowRight size={18} />
                </Link>
                <a
                  href="#features"
                  className="h-[48px] px-6 rounded-[12px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#FFFFFF] dark:bg-[#18181B] text-[#111827] dark:text-[#FAFAFA] text-[15px] font-medium hover:bg-[#F8FAFC] dark:hover:bg-[#232323] transition flex items-center justify-center cursor-pointer shadow-xs"
                >
                  Explore Features
                </a>
              </div>
            </motion.div>

            {/* HERO RIGHT COLUMN (Hero Illustration & Floating SaaS Dashboard Cards) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-6 relative"
            >
              <div className="relative rounded-[24px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#FFFFFF] dark:bg-[#18181B] p-4 sm:p-6 shadow-2xl overflow-hidden">
                {/* Visual Banner Graphics */}
                <div className="w-full h-[280px] sm:h-[360px] rounded-[16px] overflow-hidden bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] relative flex items-center justify-center">
                  <img
                    src="/hero_illustration.png"
                    alt="CollegeMate AI SaaS Illustration"
                    className="w-full h-full object-cover rounded-[16px]"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>

                {/* Floating Interactive Widget 1: Attendance */}
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute top-8 left-8 p-3.5 rounded-[14px] bg-[#FFFFFF]/95 dark:bg-[#18181B]/95 border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-lg flex items-center gap-3 backdrop-blur-md hidden sm:flex"
                >
                  <div className="w-9 h-9 rounded-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <CheckCircle2 size={20} />
                  </div>
                  <div>
                    <p className="text-[12px] font-normal text-[#6B7280] dark:text-[#A1A1AA]">Attendance</p>
                    <p className="text-[14px] font-semibold text-[#111827] dark:text-[#FAFAFA]">88.5% • Condonation Safe</p>
                  </div>
                </motion.div>

                {/* Floating Interactive Widget 2: Placement */}
                <motion.div
                  animate={{ y: [0, 6, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                  className="absolute bottom-8 right-8 p-3.5 rounded-[14px] bg-[#FFFFFF]/95 dark:bg-[#18181B]/95 border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-lg flex items-center gap-3 backdrop-blur-md hidden sm:flex"
                >
                  <div className="w-9 h-9 rounded-[10px] bg-[#4F46E5]/10 text-[#4F46E5] flex items-center justify-center">
                    <Briefcase size={20} />
                  </div>
                  <div>
                    <p className="text-[12px] font-normal text-[#6B7280] dark:text-[#A1A1AA]">ATS Placement Score</p>
                    <p className="text-[14px] font-semibold text-[#111827] dark:text-[#FAFAFA]">92/100 • Resume Verified</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>

          </div>
        </section>

        {/* SEARCH SECTION (Interactive AI Query Box) */}
        <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#FFFFFF] dark:bg-[#18181B] p-6 sm:p-8 rounded-[20px] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-[24px] sm:text-[32px] font-semibold text-[#111827] dark:text-[#FAFAFA]">
                Ask Anything About Your College
              </h2>
              <p className="text-[15px] font-normal text-[#6B7280] dark:text-[#A1A1AA]">
                Type your question or click an example below to experience CollegeMate AI instantly.
              </p>
            </div>

            {/* AI Search Bar Input Box */}
            <form onSubmit={handleSearchSubmit} className="max-w-3xl mx-auto relative">
              <div className="relative flex items-center rounded-[16px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#F8FAFC] dark:bg-[#111111] shadow-inner p-2 focus-within:border-[#111827] dark:focus-within:border-[#FAFAFA] transition">
                <Search className="ml-3 text-[#6B7280] dark:text-[#A1A1AA]" size={20} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={SEARCH_EXAMPLES[exampleIndex]}
                  className="w-full h-[48px] px-3 bg-transparent text-[15px] text-[#111827] dark:text-[#FAFAFA] placeholder:text-[#9CA3AF] dark:placeholder:text-[#52525B] outline-none"
                />
                <div className="flex items-center gap-1.5 shrink-0 pr-1">
                  <button
                    type="button"
                    onClick={() => alert('Microphone voice search enabled in AI Chat!')}
                    className="h-10 w-10 rounded-[10px] flex items-center justify-center text-[#6B7280] dark:text-[#A1A1AA] hover:bg-[#FFFFFF] dark:hover:bg-[#18181B] transition cursor-pointer"
                    title="Voice Search"
                  >
                    <Mic size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => alert('Attachment upload ready in AI Document Hub!')}
                    className="h-10 w-10 rounded-[10px] flex items-center justify-center text-[#6B7280] dark:text-[#A1A1AA] hover:bg-[#FFFFFF] dark:hover:bg-[#18181B] transition cursor-pointer"
                    title="Attach Syllabus or Image"
                  >
                    <Paperclip size={18} />
                  </button>
                  <button
                    type="submit"
                    className="h-10 px-4 rounded-[10px] bg-[#111827] hover:bg-[#1F2937] dark:bg-[#FAFAFA] dark:hover:bg-[#E5E5E5] text-[#FFFFFF] dark:text-[#111111] font-medium text-[14px] transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Ask AI</span>
                    <Send size={14} />
                  </button>
                </div>
              </div>
            </form>

            {/* Interactive Example Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 max-w-4xl mx-auto pt-2">
              <span className="text-[13px] font-medium text-[#6B7280] dark:text-[#A1A1AA] mr-1">Examples:</span>
              {SEARCH_EXAMPLES.map((example, idx) => (
                <button
                  key={idx}
                  onClick={() => handleExampleClick(example)}
                  className="px-3.5 py-1.5 rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[13px] font-normal text-[#111827] dark:text-[#FAFAFA] hover:bg-[#111827] hover:text-[#FFFFFF] dark:hover:bg-[#FAFAFA] dark:hover:text-[#111111] transition cursor-pointer"
                >
                  "{example}"
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURE TAGS (Animated Pills Bar) */}
        <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            {FEATURE_TAGS.map((tag) => (
              <span
                key={tag}
                className="px-4 py-2 rounded-full border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#FFFFFF] dark:bg-[#18181B] text-[14px] font-medium text-[#111827] dark:text-[#FAFAFA] shadow-xs hover:border-[#111827] dark:hover:border-[#FAFAFA] transition cursor-pointer"
              >
                {tag}
              </span>
            ))}
          </div>
        </section>

        {/* FEATURES SECTION (Responsive Grid) */}
        <section id="features" className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-[32px] font-semibold text-[#111827] dark:text-[#FAFAFA]">
              Complete Academic & Campus AI Suite
            </h2>
            <p className="text-[15px] font-normal text-[#6B7280] dark:text-[#A1A1AA] max-w-2xl mx-auto">
              Designed specifically for college students, faculty, and campus administration.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES_GRID.map((feat, idx) => {
              const IconComponent = feat.icon;
              return (
                <div
                  key={idx}
                  onClick={() => navigate(feat.link)}
                  className="p-6 rounded-[16px] bg-[#FFFFFF] dark:bg-[#18181B] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs hover:shadow-md transition-all duration-150 ease-in-out hover:-translate-y-[2px] cursor-pointer flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-[12px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA] flex items-center justify-center shrink-0 group-hover:bg-[#111827] group-hover:text-[#FFFFFF] dark:group-hover:bg-[#FAFAFA] dark:group-hover:text-[#111111] transition">
                      <IconComponent size={24} />
                    </div>
                    <div>
                      <h3 className="text-[18px] font-semibold text-[#111827] dark:text-[#FAFAFA] group-hover:text-[#4F46E5] transition">
                        {feat.title}
                      </h3>
                      <p className="text-[15px] font-normal text-[#6B7280] dark:text-[#A1A1AA] mt-1 leading-relaxed">
                        {feat.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-[14px] font-medium text-[#111827] dark:text-[#FAFAFA]">
                    <span>Explore Module</span>
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* WHY COLLEGEMATE AI (Statistics Grid) */}
        <section id="why-us" className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-[32px] font-semibold text-[#111827] dark:text-[#FAFAFA]">
              Why CollegeMate AI?
            </h2>
            <p className="text-[15px] font-normal text-[#6B7280] dark:text-[#A1A1AA]">
              Trusted across institutions for campus assistance, study management & placement readiness.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {STATS_DATA.map((stat, idx) => {
              const IconComp = stat.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-[16px] bg-[#FFFFFF] dark:bg-[#18181B] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs space-y-3 text-left"
                >
                  <div className="w-10 h-10 rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA] flex items-center justify-center">
                    <IconComp size={20} />
                  </div>
                  <div>
                    <p className="text-[32px] font-semibold text-[#111827] dark:text-[#FAFAFA] leading-tight">
                      {stat.value}
                    </p>
                    <p className="text-[16px] font-medium text-[#111827] dark:text-[#FAFAFA] mt-0.5">
                      {stat.label}
                    </p>
                    <p className="text-[13px] font-normal text-[#6B7280] dark:text-[#A1A1AA] mt-1">
                      {stat.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* HOW IT WORKS (3-Step Animated Workflow) */}
        <section id="how-it-works" className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-[32px] font-semibold text-[#111827] dark:text-[#FAFAFA]">
              How It Works
            </h2>
            <p className="text-[15px] font-normal text-[#6B7280] dark:text-[#A1A1AA]">
              Three simple steps to unlock your academic potential with CollegeMate AI.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {STEPS_DATA.map((stepItem, idx) => {
              const IconComp = stepItem.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-[16px] bg-[#FFFFFF] dark:bg-[#18181B] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs space-y-4 relative flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[20px] font-semibold text-[#4F46E5] dark:text-[#818CF8]">
                        Step {stepItem.step}
                      </span>
                      <div className="w-10 h-10 rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA] flex items-center justify-center">
                        <IconComp size={20} />
                      </div>
                    </div>
                    <h3 className="text-[20px] font-semibold text-[#111827] dark:text-[#FAFAFA]">
                      {stepItem.title}
                    </h3>
                    <p className="text-[15px] font-normal text-[#6B7280] dark:text-[#A1A1AA] leading-relaxed">
                      {stepItem.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* TESTIMONIALS (Auto-sliding Reviews Carousel) */}
        <section id="testimonials" className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-[32px] font-semibold text-[#111827] dark:text-[#FAFAFA]">
              What Campus Users Say
            </h2>
            <p className="text-[15px] font-normal text-[#6B7280] dark:text-[#A1A1AA]">
              Real feedback from students, faculty members, and placement officers.
            </p>
          </div>

          <div className="max-w-3xl mx-auto bg-[#FFFFFF] dark:bg-[#18181B] p-8 rounded-[20px] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs space-y-6 text-center relative">
            <Quote size={36} className="mx-auto text-[#4F46E5] opacity-40" />

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTestimonial}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
                className="space-y-4"
              >
                <p className="text-[18px] sm:text-[20px] font-normal text-[#111827] dark:text-[#FAFAFA] italic leading-relaxed">
                  "{TESTIMONIALS_DATA[activeTestimonial].quote}"
                </p>
                <div>
                  <p className="text-[16px] font-semibold text-[#111827] dark:text-[#FAFAFA]">
                    {TESTIMONIALS_DATA[activeTestimonial].name}
                  </p>
                  <p className="text-[14px] font-normal text-[#6B7280] dark:text-[#A1A1AA]">
                    {TESTIMONIALS_DATA[activeTestimonial].role} • <span className="text-[#4F46E5] font-medium">{TESTIMONIALS_DATA[activeTestimonial].tag}</span>
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="flex items-center justify-center gap-2 pt-2">
              {TESTIMONIALS_DATA.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTestimonial(i)}
                  className={`h-2.5 rounded-full transition-all cursor-pointer ${
                    activeTestimonial === i ? 'w-8 bg-[#111827] dark:bg-[#FAFAFA]' : 'w-2.5 bg-[#E5E7EB] dark:bg-[#2A2A2A]'
                  }`}
                />
              ))}
            </div>
          </div>
        </section>

      </main>

      {/* Footer Section */}
      <footer className="border-t border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#FFFFFF] dark:bg-[#18181B] py-12">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            <div className="col-span-2 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-[8px] bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] flex items-center justify-center">
                  <Bot size={18} />
                </div>
                <span className="text-[18px] font-semibold text-[#111827] dark:text-[#FAFAFA]">{APP_NAME}</span>
              </div>
              <p className="text-[14px] font-normal text-[#6B7280] dark:text-[#A1A1AA] max-w-sm leading-relaxed">
                Enterprise AI platform for students, faculty and campus administration.
              </p>
            </div>

            <div>
              <h4 className="text-[14px] font-semibold text-[#111827] dark:text-[#FAFAFA] mb-3">Product</h4>
              <ul className="space-y-2 text-[14px] font-normal text-[#6B7280] dark:text-[#A1A1AA]">
                <li><a href="#features" className="hover:text-[#111827] dark:hover:text-[#FAFAFA] transition">Features</a></li>
                <li><Link to="/dashboard" className="hover:text-[#111827] dark:hover:text-[#FAFAFA] transition">AI Assistant</Link></li>
                <li><Link to="/placement-hub" className="hover:text-[#111827] dark:hover:text-[#FAFAFA] transition">Placement Hub</Link></li>
                <li><Link to="/notes-generator" className="hover:text-[#111827] dark:hover:text-[#FAFAFA] transition">Notes Generator</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-[14px] font-semibold text-[#111827] dark:text-[#FAFAFA] mb-3">Resources</h4>
              <ul className="space-y-2 text-[14px] font-normal text-[#6B7280] dark:text-[#A1A1AA]">
                <li><Link to="/question-papers" className="hover:text-[#111827] dark:hover:text-[#FAFAFA] transition">PYQ Papers</Link></li>
                <li><Link to="/quiz-generator" className="hover:text-[#111827] dark:hover:text-[#FAFAFA] transition">Quiz Generator</Link></li>
                <li><Link to="/resume-builder" className="hover:text-[#111827] dark:hover:text-[#FAFAFA] transition">Resume Builder</Link></li>
                <li><Link to="/ocr-scanner" className="hover:text-[#111827] dark:hover:text-[#FAFAFA] transition">OCR Scanner</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-[14px] font-semibold text-[#111827] dark:text-[#FAFAFA] mb-3">Company</h4>
              <ul className="space-y-2 text-[14px] font-normal text-[#6B7280] dark:text-[#A1A1AA]">
                <li><Link to="/settings" className="hover:text-[#111827] dark:hover:text-[#FAFAFA] transition">Settings</Link></li>
                <li><a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-[#111827] dark:hover:text-[#FAFAFA] transition flex items-center gap-1"><Globe size={14} /> GitHub</a></li>
                <li><a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-[#111827] dark:hover:text-[#FAFAFA] transition flex items-center gap-1"><Share2 size={14} /> LinkedIn</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-[#E5E7EB] dark:border-[#2A2A2A] flex flex-col sm:flex-row items-center justify-between gap-4 text-[13px] font-normal text-[#6B7280] dark:text-[#A1A1AA]">
            <p>© {new Date().getFullYear()} {COLLEGE_NAME} • {APP_NAME}. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <span className="hover:text-[#111827] dark:hover:text-[#FAFAFA] cursor-pointer">Privacy Policy</span>
              <span className="hover:text-[#111827] dark:hover:text-[#FAFAFA] cursor-pointer">Terms of Service</span>
              <span className="hover:text-[#111827] dark:hover:text-[#FAFAFA] cursor-pointer">Support</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
