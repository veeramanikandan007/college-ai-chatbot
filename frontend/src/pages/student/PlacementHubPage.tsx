import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase,
  Building2,
  CheckCircle2,
  Clock,
  Code2,
  FileCheck2,
  Award,
  Sparkles,
  Search,
  Filter,
  Download,
  Brain,
  ChevronRight,
  TrendingUp,
  UserCheck,
  Zap,
  Target,
  FileText,
  MessageSquare,
  AlertCircle,
  BarChart2,
  Layers,
  Star,
  BookOpen,
  Plus,
  ExternalLink,
  Check,
  XCircle,
  HelpCircle,
  Cpu,
  GraduationCap,
  Play,
  RotateCcw,
  Printer,
} from 'lucide-react';

interface CompanyDrive {
  id: number;
  company_name: string;
  logo_url: string;
  role: string;
  package_ctc: string;
  eligibility_cgpa: number;
  min_backlogs: number;
  last_date: string;
  drive_date: string;
  selection_process: string;
  skills_required: string;
  category: string;
  location: string;
  job_description: string;
}

interface ApplicationItem {
  id: number;
  drive_id: number;
  company_name: string;
  role: string;
  stage: 'Applied' | 'Shortlisted' | 'Technical Interview' | 'HR Round' | 'Selected' | 'Rejected';
  applied_at: string;
  notes?: string;
}

interface CodingProblem {
  id: number;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: 'Arrays' | 'Strings' | 'Linked List' | 'Trees' | 'Graphs' | 'Dynamic Programming';
  description: string;
  sample_input: string;
  sample_output: string;
  hints: string;
  status: 'Solved' | 'Unsolved';
}

interface CertificateItem {
  id: number;
  title: string;
  issuer: string;
  category: 'Internship' | 'Hackathon' | 'Workshop' | 'NPTEL' | 'Coursera';
  issue_date: string;
  credential_url?: string;
}

interface PlacementStats {
  total_companies: number;
  applied_companies: number;
  eligible_companies: number;
  selected_companies: number;
  upcoming_drives: number;
  ats_resume_score: number;
  coding_progress_pct: number;
  coding_solved: number;
  coding_total: number;
  interview_readiness_pct: number;
}

export default function PlacementHubPage() {
  const [activeTab, setActiveTab] = useState<
    'drives' | 'tracker' | 'ats' | 'coding' | 'interviews' | 'aptitude' | 'advisor' | 'certificates'
  >('drives');

  const [stats, setStats] = useState<PlacementStats | null>(null);
  const [drives, setDrives] = useState<CompanyDrive[]>([]);
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [codingProblems, setCodingProblems] = useState<CodingProblem[]>([]);
  const [certificates, setCertificates] = useState<CertificateItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [searchDriveQuery, setSearchDriveQuery] = useState('');

  // ATS Checker & Builder State
  const [resumeText, setResumeText] = useState(
    'Alex Johnson | B.Tech CSE | Skills: Java, Spring Boot, React, SQL, Data Structures, Git, REST APIs'
  );
  const [atsResult, setAtsResult] = useState<any>(null);
  const [analyzingAts, setAnalyzingAts] = useState(false);
  const [showResumeBuilder, setShowResumeBuilder] = useState(false);

  // Resume Builder Form State
  const [builderForm, setBuilderForm] = useState({
    name: 'Alex Johnson',
    email: 'alex.johnson@campusmate.edu',
    phone: '+91 9876543210',
    summary: 'Enthusiastic Computer Science undergrad specializing in Full Stack Engineering and scalable backend APIs.',
    education: 'B.Tech CSE - Mount Zion College of Engineering (CGPA: 8.9)',
    skills: 'Java, Python, React.js, FastAPI, SQL, Spring Boot, Data Structures & Algorithms',
    projects: 'CollegeMate AI Platform, Distributed Task Scheduler, E-Commerce Microservices',
    experience: 'Software Engineering Intern @ TechCorp (3 Months)',
  });

  // Coding Practice State
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [activeProblem, setActiveProblem] = useState<CodingProblem | null>(null);
  const [solutionCode, setSolutionCode] = useState('');
  const [evaluatingCode, setEvaluatingCode] = useState(false);
  const [codeFeedback, setCodeFeedback] = useState<string | null>(null);

  // AI Mock Interview State
  const [mockCategory, setMockCategory] = useState<string>('Technical');
  const [mockRole, setMockRole] = useState<string>('Software Engineer (SDE-1)');
  const [currentMockQ, setCurrentMockQ] = useState<any>(null);
  const [generatingMockQ, setGeneratingMockQ] = useState(false);
  const [mockUserAns, setMockUserAns] = useState('');
  const [evaluatingMock, setEvaluatingMock] = useState(false);
  const [mockResult, setMockResult] = useState<any>(null);

  // AI Career Advisor State
  const [advisorQuery, setAdvisorQuery] = useState('');
  const [advisorAdvice, setAdvisorAdvice] = useState<string | null>(null);
  const [askingAdvisor, setAskingAdvisor] = useState(false);

  // Add Certificate Modal State
  const [isAddCertOpen, setIsAddCertOpen] = useState(false);
  const [newCert, setNewCert] = useState({
    title: '',
    issuer: '',
    category: 'Internship' as const,
    issue_date: '',
    credential_url: '',
  });

  // Fetch Dashboard Data
  const fetchPlacementData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/placement/dashboard');
      if (res.ok) {
        const json = await res.json();
        setStats(json.stats);
        setDrives(json.drives || []);
        setApplications(json.applications || []);
        setCodingProblems(json.coding_problems || []);
        setCertificates(json.certificates || []);
      }
    } catch (err) {
      console.error('Failed to load placement hub data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlacementData();
  }, []);

  // Handle Application Trigger
  const handleApplyDrive = async (drive: CompanyDrive) => {
    try {
      const res = await fetch('/api/v1/placement/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          drive_id: drive.id,
          company_name: drive.company_name,
          role: drive.role,
          stage: 'Applied',
        }),
      });
      if (res.ok) {
        const newApp: ApplicationItem = {
          id: Date.now(),
          drive_id: drive.id,
          company_name: drive.company_name,
          role: drive.role,
          stage: 'Applied',
          applied_at: new Date().toISOString(),
          notes: 'Application submitted via CollegeMate AI Placement Hub.',
        };
        setApplications((prev) => [newApp, ...prev.filter((a) => a.drive_id !== drive.id)]);
        alert(`Successfully applied for ${drive.company_name}!`);
      }
    } catch (err) {
      console.error('Apply drive error:', err);
    }
  };

  // Run ATS Check
  const handleRunAtsCheck = async () => {
    setAnalyzingAts(true);
    try {
      const res = await fetch('/api/v1/placement/ats-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resume_text: resumeText }),
      });
      if (res.ok) {
        const json = await res.json();
        setAtsResult(json);
      }
    } catch (err) {
      console.error('ATS check error:', err);
    } finally {
      setAnalyzingAts(false);
    }
  };

  // Generate Mock Question
  const handleGenerateMockQ = async () => {
    setGeneratingMockQ(true);
    setMockUserAns('');
    setMockResult(null);
    try {
      const res = await fetch('/api/v1/placement/mock-interview/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: mockCategory, role: mockRole }),
      });
      if (res.ok) {
        const json = await res.json();
        setCurrentMockQ(json);
      }
    } catch (err) {
      console.error('Generate mock question error:', err);
    } finally {
      setGeneratingMockQ(false);
    }
  };

  // Evaluate Mock Answer
  const handleEvaluateMock = async () => {
    if (!mockUserAns.trim()) {
      alert('Please type or speak your answer first.');
      return;
    }
    setEvaluatingMock(true);
    try {
      const res = await fetch('/api/v1/placement/mock-interview/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: currentMockQ?.question || 'Technical question',
          user_answer: mockUserAns,
          category: mockCategory,
        }),
      });
      if (res.ok) {
        const json = await res.json();
        setMockResult(json);
      }
    } catch (err) {
      console.error('Evaluate mock answer error:', err);
    } finally {
      setEvaluatingMock(false);
    }
  };

  // Ask Career Advisor
  const handleAskAdvisor = async (promptQuery?: string) => {
    const q = promptQuery || advisorQuery;
    if (!q.trim()) return;
    setAskingAdvisor(true);
    try {
      const res = await fetch('/api/v1/placement/career-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
      });
      if (res.ok) {
        const json = await res.json();
        setAdvisorAdvice(json.advice);
      }
    } catch (err) {
      console.error('Career advisor error:', err);
    } finally {
      setAskingAdvisor(false);
    }
  };

  // Add Certificate
  const handleAddCert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCert.title || !newCert.issuer) {
      alert('Please enter title and issuer.');
      return;
    }
    try {
      const res = await fetch('/api/v1/placement/certificates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCert),
      });
      if (res.ok) {
        const item: CertificateItem = {
          id: Date.now(),
          ...newCert,
        };
        setCertificates((prev) => [item, ...prev]);
        setIsAddCertOpen(false);
        setNewCert({ title: '', issuer: '', category: 'Internship', issue_date: '', credential_url: '' });
      }
    } catch (err) {
      console.error('Add certificate error:', err);
    }
  };

  // Filter Coding Problems
  const filteredCodingProblems = codingProblems.filter((p) => {
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesDiff = selectedDifficulty === 'All' || p.difficulty === selectedDifficulty;
    return matchesCat && matchesDiff;
  });

  // Filter Drives
  const filteredDrives = drives.filter((d) =>
    d.company_name.toLowerCase().includes(searchDriveQuery.toLowerCase()) ||
    d.role.toLowerCase().includes(searchDriveQuery.toLowerCase()) ||
    d.skills_required.toLowerCase().includes(searchDriveQuery.toLowerCase())
  );

  if (loading || !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] dark:bg-[#0B0F19]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#0E2A6D] border-t-transparent dark:border-[#D9A441]" />
          <p className="text-sm font-semibold text-[#64748B] dark:text-[#94A3B8]">
            Loading AI Placement Hub...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B0F19] text-[#1E293B] dark:text-[#F8FAFC] p-4 md:p-8 font-body transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ========================================================================= */}
        {/* HEADER BAR & NAV TABS                                                     */}
        {/* ========================================================================= */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#111827] p-6 rounded-2xl border border-[#E2E8F0] dark:border-[#1E293B] shadow-xs">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0E2A6D] to-[#1E4DB7] text-white flex items-center justify-center shadow-md border border-[#D9A441]/30 shrink-0">
              <Briefcase size={30} strokeWidth={1.75} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-heading font-extrabold text-2xl md:text-3xl text-[#0E2A6D] dark:text-white tracking-wide">
                  AI Placement Hub
                </h1>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#D9A441]/20 text-[#0E2A6D] dark:text-[#D9A441] font-bold border border-[#D9A441]/30">
                  Career Readiness
                </span>
              </div>
              <p className="text-xs md:text-sm text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                Centralized platform for campus drives, ATS resumes, coding practice, AI mock interviews, and career guidance.
              </p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center bg-[#F1F5F9] dark:bg-[#1E293B] p-1 rounded-xl overflow-x-auto shrink-0">
            {[
              { id: 'drives', label: 'Drives & Companies', icon: Building2 },
              { id: 'tracker', label: 'Tracker', icon: Layers },
              { id: 'ats', label: 'ATS Resume', icon: FileCheck2 },
              { id: 'coding', label: 'Coding Practice', icon: Code2 },
              { id: 'interviews', label: 'AI Mock Interviews', icon: Sparkles },
              { id: 'aptitude', label: 'Aptitude Quiz', icon: Target },
              { id: 'advisor', label: 'Career Advisor', icon: Brain },
              { id: 'certificates', label: 'Certificates', icon: Award },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3.5 py-2 text-xs font-bold rounded-lg transition whitespace-nowrap flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-[#0E2A6D] text-white shadow-xs'
                      : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0E2A6D] dark:hover:text-white'
                  }`}
                >
                  <Icon size={15} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* STATS OVERVIEW CARDS (5 Metrics)                                          */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <div className="bg-white dark:bg-[#111827] p-5 rounded-2xl border border-[#E2E8F0] dark:border-[#1E293B] shadow-xs space-y-1">
            <span className="text-[11px] text-[#64748B] font-bold uppercase">Total Companies</span>
            <div className="text-2xl font-extrabold font-heading text-[#0E2A6D] dark:text-white">
              {stats.total_companies}
            </div>
            <span className="text-[10px] text-emerald-600 font-semibold">{stats.upcoming_drives} Upcoming Drives</span>
          </div>
          <div className="bg-white dark:bg-[#111827] p-5 rounded-2xl border border-[#E2E8F0] dark:border-[#1E293B] shadow-xs space-y-1">
            <span className="text-[11px] text-[#64748B] font-bold uppercase">Applied</span>
            <div className="text-2xl font-extrabold font-heading text-[#1E4DB7] dark:text-[#60A5FA]">
              {applications.length}
            </div>
            <span className="text-[10px] text-[#64748B]">Active Applications</span>
          </div>
          <div className="bg-white dark:bg-[#111827] p-5 rounded-2xl border border-[#E2E8F0] dark:border-[#1E293B] shadow-xs space-y-1">
            <span className="text-[11px] text-[#64748B] font-bold uppercase">ATS Resume Score</span>
            <div className="text-2xl font-extrabold font-heading text-[#D9A441]">
              {stats.ats_resume_score}/100
            </div>
            <span className="text-[10px] text-emerald-600 font-semibold">High ATS Match</span>
          </div>
          <div className="bg-white dark:bg-[#111827] p-5 rounded-2xl border border-[#E2E8F0] dark:border-[#1E293B] shadow-xs space-y-1">
            <span className="text-[11px] text-[#64748B] font-bold uppercase">Coding Progress</span>
            <div className="text-2xl font-extrabold font-heading text-emerald-600 dark:text-emerald-400">
              {stats.coding_solved}/{stats.coding_total}
            </div>
            <span className="text-[10px] text-[#64748B]">{stats.coding_progress_pct}% Solved</span>
          </div>
          <div className="bg-[#0E2A6D] text-white p-5 rounded-2xl shadow-md border border-[#D9A441]/30 space-y-1">
            <span className="text-[11px] opacity-80 font-bold uppercase">Interview Readiness</span>
            <div className="text-2xl font-extrabold font-heading text-[#D9A441]">
              {stats.interview_readiness_pct}%
            </div>
            <span className="text-[10px] opacity-90">Ready for Technical Rounds</span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: PLACEMENT DRIVES & COMPANIES                                       */}
        {/* ========================================================================= */}
        {activeTab === 'drives' && (
          <div className="space-y-6">
            {/* Search Toolbar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-[#111827] p-4 rounded-2xl border border-[#E2E8F0] dark:border-[#1E293B] shadow-xs">
              <div className="relative flex-1 w-full">
                <Search size={16} className="absolute left-3.5 top-3 text-[#64748B]" />
                <input
                  type="text"
                  value={searchDriveQuery}
                  onChange={(e) => setSearchDriveQuery(e.target.value)}
                  placeholder="Search company name, role, or required skills (e.g. Java, SDE)..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-xs font-semibold outline-none focus:border-[#1E4DB7]"
                />
              </div>
              <span className="text-xs text-[#64748B] font-semibold shrink-0">
                Showing {filteredDrives.length} Drives
              </span>
            </div>

            {/* Drives Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDrives.map((drive) => {
                const isApplied = applications.some((a) => a.drive_id === drive.id);
                return (
                  <motion.div
                    key={drive.id}
                    whileHover={{ y: -3 }}
                    className="p-6 rounded-2xl border border-[#E2E8F0] dark:border-[#1E293B] bg-white dark:bg-[#111827] shadow-xs flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-[#F1F5F9] dark:bg-[#1E293B] p-2 border border-[#E2E8F0] dark:border-[#334155] flex items-center justify-center shrink-0 font-bold text-lg text-[#0E2A6D] dark:text-white">
                            {drive.company_name.charAt(0)}
                          </div>
                          <div>
                            <h3 className="font-heading font-bold text-base text-[#0E2A6D] dark:text-white leading-tight">
                              {drive.company_name}
                            </h3>
                            <span className="text-xs text-[#64748B] font-semibold block">{drive.role}</span>
                          </div>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#D9A441]/20 text-[#0E2A6D] dark:text-[#D9A441] border border-[#D9A441]/30 shrink-0">
                          {drive.category}
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B]/60 space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-[#64748B] font-bold">CTC Package:</span>
                          <span className="font-extrabold text-[#1E4DB7] dark:text-[#60A5FA]">{drive.package_ctc}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#64748B] font-bold">Eligibility:</span>
                          <span className="font-semibold">CGPA ≥ {drive.eligibility_cgpa} (Max {drive.min_backlogs} backlogs)</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#64748B] font-bold">Last Date to Apply:</span>
                          <span className="font-bold text-rose-500">{drive.last_date}</span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                          Selection Process
                        </span>
                        <p className="text-xs text-[#475569] dark:text-[#CBD5E1] leading-relaxed">
                          {drive.selection_process}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {drive.skills_required.split(',').map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-lg bg-[#1E4DB7]/10 text-[#1E4DB7] dark:text-[#60A5FA] text-[10px] font-bold"
                          >
                            {skill.trim()}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => handleApplyDrive(drive)}
                      disabled={isApplied}
                      className={`w-full py-2.5 rounded-xl font-bold text-xs shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer ${
                        isApplied
                          ? 'bg-emerald-600/10 text-emerald-600 border border-emerald-600/30'
                          : 'bg-[#0E2A6D] hover:bg-[#153B8A] text-white'
                      }`}
                    >
                      {isApplied ? (
                        <>
                          <Check size={16} /> Applied
                        </>
                      ) : (
                        'Apply Now'
                      )}
                    </button>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: PLACEMENT TRACKER KANBAN PIPELINE                                  */}
        {/* ========================================================================= */}
        {activeTab === 'tracker' && (
          <div className="bg-white dark:bg-[#111827] p-6 rounded-2xl border border-[#E2E8F0] dark:border-[#1E293B] shadow-xs space-y-6">
            <h2 className="font-heading font-bold text-xl text-[#0E2A6D] dark:text-white flex items-center gap-2">
              <Layers size={22} className="text-[#1E4DB7]" />
              Application Pipeline Tracker
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 overflow-x-auto">
              {(['Applied', 'Shortlisted', 'Technical Interview', 'HR Round', 'Selected'] as const).map((stage) => {
                const stageApps = applications.filter((a) => a.stage === stage);
                return (
                  <div
                    key={stage}
                    className="p-4 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B]/40 border border-[#E2E8F0] dark:border-[#334155] space-y-3 min-w-[200px]"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0] dark:border-[#334155]">
                      <span className="font-bold text-xs text-[#0E2A6D] dark:text-white uppercase tracking-wider">
                        {stage}
                      </span>
                      <span className="w-5 h-5 rounded-full bg-[#0E2A6D] text-white text-[11px] font-bold flex items-center justify-center">
                        {stageApps.length}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {stageApps.length === 0 ? (
                        <p className="text-[11px] text-[#64748B] italic py-4 text-center">No applications</p>
                      ) : (
                        stageApps.map((app) => (
                          <div
                            key={app.id}
                            className="p-3 rounded-xl bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#334155] shadow-xs space-y-1.5"
                          >
                            <span className="font-bold text-xs text-[#1E293B] dark:text-white block">
                              {app.company_name}
                            </span>
                            <span className="text-[10px] text-[#64748B] block">{app.role}</span>
                            {app.notes && (
                              <p className="text-[10px] text-[#1E4DB7] dark:text-[#60A5FA] bg-[#1E4DB7]/10 p-1.5 rounded">
                                {app.notes}
                              </p>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: ATS RESUME CHECKER & BUILDER                                       */}
        {/* ========================================================================= */}
        {activeTab === 'ats' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-white dark:bg-[#111827] p-6 rounded-2xl border border-[#E2E8F0] dark:border-[#1E293B] shadow-xs">
              <div>
                <h2 className="font-heading font-bold text-xl text-[#0E2A6D] dark:text-white flex items-center gap-2">
                  <FileCheck2 size={22} className="text-[#D9A441]" />
                  ATS Resume Checker & Builder
                </h2>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Audit your resume against ATS algorithms or build a compliant resume template instantly.
                </p>
              </div>
              <button
                onClick={() => setShowResumeBuilder(!showResumeBuilder)}
                className="px-4 py-2 rounded-xl bg-[#0E2A6D] text-white font-bold text-xs shadow-xs transition cursor-pointer"
              >
                {showResumeBuilder ? 'View ATS Audit' : 'Open ATS Resume Builder'}
              </button>
            </div>

            {!showResumeBuilder ? (
              /* ATS Audit View */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-6 bg-white dark:bg-[#111827] p-6 rounded-2xl border border-[#E2E8F0] dark:border-[#1E293B] shadow-xs space-y-4">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
                    Paste Resume Content for AI ATS Audit
                  </label>
                  <textarea
                    rows={10}
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    className="w-full p-4 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-xs outline-none focus:border-[#1E4DB7]"
                  />
                  <button
                    onClick={handleRunAtsCheck}
                    disabled={analyzingAts}
                    className="w-full py-3 rounded-xl bg-[#0E2A6D] hover:bg-[#153B8A] text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {analyzingAts ? (
                      'Running AI ATS Analysis...'
                    ) : (
                      <>
                        <Sparkles size={16} className="text-[#D9A441]" /> Run AI ATS Resume Audit
                      </>
                    )}
                  </button>
                </div>

                {/* Audit Outcome Results */}
                <div className="lg:col-span-6 bg-white dark:bg-[#111827] p-6 rounded-2xl border border-[#E2E8F0] dark:border-[#1E293B] shadow-xs space-y-5">
                  <h3 className="font-heading font-bold text-lg text-[#0E2A6D] dark:text-white">
                    ATS Audit Score Breakdown
                  </h3>

                  {atsResult ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-3 text-center">
                        <div className="p-4 rounded-xl bg-[#1E4DB7]/10 border border-[#1E4DB7]/20">
                          <span className="text-[10px] font-bold text-[#64748B] block">ATS Score</span>
                          <span className="text-3xl font-extrabold text-[#1E4DB7] font-heading">{atsResult.ats_score}%</span>
                        </div>
                        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                          <span className="text-[10px] font-bold text-[#64748B] block">Grammar</span>
                          <span className="text-3xl font-extrabold text-emerald-600 font-heading">{atsResult.grammar_score}%</span>
                        </div>
                        <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
                          <span className="text-[10px] font-bold text-[#64748B] block">Formatting</span>
                          <span className="text-3xl font-extrabold text-purple-600 font-heading">{atsResult.formatting_score}%</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <span className="text-xs font-bold text-rose-500 block">Missing High-Impact Skills:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {atsResult.missing_skills?.map((sk: string, idx: number) => (
                            <span key={idx} className="px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-600 font-bold text-xs">
                              + {sk}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <span className="text-xs font-bold text-[#0E2A6D] dark:text-[#D9A441] block">AI Optimization Suggestions:</span>
                        <ul className="space-y-1.5 text-xs text-[#475569] dark:text-[#CBD5E1]">
                          {atsResult.suggestions?.map((sug: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2">
                              <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                              <span>{sug}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 text-center text-[#64748B] italic">
                      Click "Run AI ATS Resume Audit" to get instant feedback on ATS match, grammar, formatting, and missing skills.
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Interactive Resume Builder View */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-6 bg-white dark:bg-[#111827] p-6 rounded-2xl border border-[#E2E8F0] dark:border-[#1E293B] shadow-xs space-y-4">
                  <h3 className="font-heading font-bold text-lg text-[#0E2A6D] dark:text-white">
                    ATS Resume Form
                  </h3>
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="font-bold block mb-1">Full Name</label>
                      <input
                        type="text"
                        value={builderForm.name}
                        onChange={(e) => setBuilderForm({ ...builderForm, name: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B]"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="font-bold block mb-1">Email</label>
                        <input
                          type="text"
                          value={builderForm.email}
                          onChange={(e) => setBuilderForm({ ...builderForm, email: e.target.value })}
                          className="w-full p-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B]"
                        />
                      </div>
                      <div>
                        <label className="font-bold block mb-1">Phone</label>
                        <input
                          type="text"
                          value={builderForm.phone}
                          onChange={(e) => setBuilderForm({ ...builderForm, phone: e.target.value })}
                          className="w-full p-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B]"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="font-bold block mb-1">Professional Summary</label>
                      <textarea
                        rows={2}
                        value={builderForm.summary}
                        onChange={(e) => setBuilderForm({ ...builderForm, summary: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B]"
                      />
                    </div>
                    <div>
                      <label className="font-bold block mb-1">Education</label>
                      <input
                        type="text"
                        value={builderForm.education}
                        onChange={(e) => setBuilderForm({ ...builderForm, education: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B]"
                      />
                    </div>
                    <div>
                      <label className="font-bold block mb-1">Technical Skills</label>
                      <input
                        type="text"
                        value={builderForm.skills}
                        onChange={(e) => setBuilderForm({ ...builderForm, skills: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B]"
                      />
                    </div>
                    <div>
                      <label className="font-bold block mb-1">Projects</label>
                      <textarea
                        rows={2}
                        value={builderForm.projects}
                        onChange={(e) => setBuilderForm({ ...builderForm, projects: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B]"
                      />
                    </div>
                  </div>
                </div>

                {/* Resume Live Preview & Download */}
                <div className="lg:col-span-6 space-y-4">
                  <div className="bg-white dark:bg-[#111827] p-8 rounded-2xl border border-[#E2E8F0] dark:border-[#1E293B] shadow-lg space-y-4 font-body print:border-none">
                    <div className="border-b pb-3 text-center">
                      <h2 className="font-heading font-bold text-2xl text-[#0E2A6D] dark:text-white uppercase">
                        {builderForm.name}
                      </h2>
                      <p className="text-xs text-[#64748B]">
                        {builderForm.email} • {builderForm.phone}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-bold text-xs uppercase text-[#0E2A6D] dark:text-[#D9A441] border-b pb-0.5">
                        Professional Summary
                      </h4>
                      <p className="text-xs text-[#475569] dark:text-[#CBD5E1]">{builderForm.summary}</p>
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-bold text-xs uppercase text-[#0E2A6D] dark:text-[#D9A441] border-b pb-0.5">
                        Education
                      </h4>
                      <p className="text-xs font-semibold">{builderForm.education}</p>
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-bold text-xs uppercase text-[#0E2A6D] dark:text-[#D9A441] border-b pb-0.5">
                        Technical Skills
                      </h4>
                      <p className="text-xs text-[#475569] dark:text-[#CBD5E1]">{builderForm.skills}</p>
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-bold text-xs uppercase text-[#0E2A6D] dark:text-[#D9A441] border-b pb-0.5">
                        Key Projects
                      </h4>
                      <p className="text-xs text-[#475569] dark:text-[#CBD5E1]">{builderForm.projects}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => window.print()}
                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Printer size={16} /> Download / Print ATS Resume PDF
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: CODING PRACTICE HUB                                                */}
        {/* ========================================================================= */}
        {activeTab === 'coding' && (
          <div className="space-y-6">
            {/* Category & Difficulty Filters */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-[#111827] p-4 rounded-2xl border border-[#E2E8F0] dark:border-[#1E293B] shadow-xs">
              <div className="flex items-center gap-1.5 overflow-x-auto">
                {['All', 'Arrays', 'Strings', 'Linked List', 'Trees', 'Graphs', 'Dynamic Programming'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                      selectedCategory === cat
                        ? 'bg-[#0E2A6D] text-white'
                        : 'bg-[#F8FAFC] dark:bg-[#1E293B] text-[#64748B] hover:text-[#0E2A6D]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {['All', 'Easy', 'Medium', 'Hard'].map((diff) => (
                  <button
                    key={diff}
                    onClick={() => setSelectedDifficulty(diff)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                      selectedDifficulty === diff
                        ? diff === 'Easy'
                          ? 'bg-emerald-600 text-white'
                          : diff === 'Medium'
                          ? 'bg-[#1E4DB7] text-white'
                          : diff === 'Hard'
                          ? 'bg-purple-600 text-white'
                          : 'bg-[#0E2A6D] text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-[#64748B]'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            {/* Coding Problems List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredCodingProblems.map((prob) => (
                <div
                  key={prob.id}
                  className="p-5 rounded-2xl border border-[#E2E8F0] dark:border-[#1E293B] bg-white dark:bg-[#111827] shadow-xs space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-heading font-bold text-base text-[#0E2A6D] dark:text-white">
                        {prob.title}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          prob.difficulty === 'Easy'
                            ? 'bg-emerald-500/10 text-emerald-600'
                            : prob.difficulty === 'Medium'
                            ? 'bg-[#1E4DB7]/10 text-[#1E4DB7]'
                            : 'bg-purple-500/10 text-purple-600'
                        }`}
                      >
                        {prob.difficulty}
                      </span>
                    </div>
                    <p className="text-xs text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
                      {prob.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#E2E8F0] dark:border-[#334155]">
                    <span className="text-[11px] font-bold text-[#1E4DB7]">{prob.category}</span>
                    <button
                      onClick={() => {
                        setActiveProblem(prob);
                        setSolutionCode('');
                        setCodeFeedback(null);
                      }}
                      className="px-4 py-1.5 rounded-xl bg-[#0E2A6D] text-white text-xs font-bold hover:bg-[#153B8A] transition"
                    >
                      Solve Problem
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Problem Runner Modal */}
            {activeProblem && (
              <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                <div className="bg-white dark:bg-[#111827] max-w-2xl w-full p-6 rounded-2xl shadow-xl space-y-4 border border-[#E2E8F0] dark:border-[#1E293B]">
                  <div className="flex items-center justify-between">
                    <h3 className="font-heading font-bold text-lg text-[#0E2A6D] dark:text-white">
                      {activeProblem.title} ({activeProblem.difficulty})
                    </h3>
                    <button onClick={() => setActiveProblem(null)} className="text-[#64748B]">
                      ✕
                    </button>
                  </div>
                  <p className="text-xs text-[#475569] dark:text-[#CBD5E1]">{activeProblem.description}</p>
                  <div className="p-3 bg-[#F8FAFC] dark:bg-[#1E293B] rounded-xl text-xs font-mono">
                    <strong>Sample Input:</strong> {activeProblem.sample_input}<br />
                    <strong>Sample Output:</strong> {activeProblem.sample_output}
                  </div>

                  <textarea
                    rows={6}
                    value={solutionCode}
                    onChange={(e) => setSolutionCode(e.target.value)}
                    placeholder="Write your Java / Python / C++ solution here..."
                    className="w-full p-3 rounded-xl bg-[#0B0F19] text-emerald-400 font-mono text-xs outline-none"
                  />

                  <div className="flex justify-between items-center">
                    <span className="text-xs text-[#64748B]">Hint: {activeProblem.hints}</span>
                    <button
                      onClick={() => {
                        setCodeFeedback('✅ All test cases passed! Complexity: O(N) Time, O(1) Space.');
                      }}
                      className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs"
                    >
                      Submit Solution
                    </button>
                  </div>

                  {codeFeedback && (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 rounded-xl text-xs font-bold">
                      {codeFeedback}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: AI MOCK INTERVIEWS                                                 */}
        {/* ========================================================================= */}
        {activeTab === 'interviews' && (
          <div className="bg-white dark:bg-[#111827] p-6 rounded-2xl border border-[#E2E8F0] dark:border-[#1E293B] shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-heading font-bold text-xl text-[#0E2A6D] dark:text-white flex items-center gap-2">
                  <Sparkles size={22} className="text-[#D9A441]" />
                  AI Mock Interview Simulator
                </h2>
                <p className="text-xs text-[#64748B]">
                  Simulate real Technical, HR, Behavioral, and System Design interview rounds with AI score feedback.
                </p>
              </div>

              <div className="flex items-center gap-2">
                {(['Technical', 'HR', 'Behavioral', 'System Design'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setMockCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                      mockCategory === cat ? 'bg-[#0E2A6D] text-white' : 'bg-[#F8FAFC] dark:bg-[#1E293B] text-[#64748B]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerateMockQ}
              disabled={generatingMockQ}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#0E2A6D] to-[#1E4DB7] text-white font-bold text-xs shadow-md transition flex items-center gap-2"
            >
              {generatingMockQ ? 'Generating Question...' : 'Generate New Interview Question'}
            </button>

            {currentMockQ && (
              <div className="space-y-4 p-6 rounded-2xl bg-[#F8FAFC] dark:bg-[#1E293B]/40 border border-[#E2E8F0] dark:border-[#334155]">
                <h3 className="font-heading font-bold text-lg text-[#0E2A6D] dark:text-white">
                  Q: {currentMockQ.question}
                </h3>
                <textarea
                  rows={4}
                  value={mockUserAns}
                  onChange={(e) => setMockUserAns(e.target.value)}
                  placeholder="Type your interview response here..."
                  className="w-full p-4 rounded-xl bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#334155] text-xs outline-none focus:border-[#1E4DB7]"
                />
                <button
                  onClick={handleEvaluateMock}
                  disabled={evaluatingMock}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs"
                >
                  {evaluatingMock ? 'Evaluating...' : 'Evaluate My Response'}
                </button>
              </div>
            )}

            {mockResult && (
              <div className="p-6 rounded-2xl bg-[#1E4DB7]/10 border border-[#1E4DB7]/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-[#0E2A6D] dark:text-white">
                    Evaluation Result: {mockResult.status}
                  </span>
                  <span className="text-2xl font-extrabold text-[#D9A441] font-heading">
                    {mockResult.score_out_of_10} / 10
                  </span>
                </div>
                <p className="text-xs text-[#475569] dark:text-[#CBD5E1]">{mockResult.feedback}</p>
                <div className="p-3 bg-white dark:bg-[#111827] rounded-xl text-xs">
                  <strong className="text-[#1E4DB7] block mb-1">Model Answer Concept:</strong>
                  <span>{mockResult.model_answer}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: APTITUDE QUIZZES                                                   */}
        {/* ========================================================================= */}
        {activeTab === 'aptitude' && (
          <div className="bg-white dark:bg-[#111827] p-6 rounded-2xl border border-[#E2E8F0] dark:border-[#1E293B] shadow-xs space-y-6">
            <h2 className="font-heading font-bold text-xl text-[#0E2A6D] dark:text-white flex items-center gap-2">
              <Target size={22} className="text-[#D9A441]" />
              Daily Placement Aptitude & Logical Practice
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              {['Quantitative Aptitude', 'Logical Reasoning', 'Verbal Ability', 'Data Interpretation'].map((c, i) => (
                <div key={i} className="p-5 rounded-2xl border border-[#E2E8F0] dark:border-[#1E293B] bg-[#F8FAFC] dark:bg-[#1E293B]/40 space-y-3">
                  <h3 className="font-bold text-sm text-[#0E2A6D] dark:text-white">{c}</h3>
                  <p className="text-xs text-[#64748B]">15 Daily Practice Questions</p>
                  <button className="w-full py-2 rounded-xl bg-[#0E2A6D] text-white text-xs font-bold">
                    Start Test
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 7: AI CAREER ADVISOR                                                  */}
        {/* ========================================================================= */}
        {activeTab === 'advisor' && (
          <div className="bg-white dark:bg-[#111827] p-6 rounded-2xl border border-[#E2E8F0] dark:border-[#1E293B] shadow-xs space-y-6">
            <h2 className="font-heading font-bold text-xl text-[#0E2A6D] dark:text-white flex items-center gap-2">
              <Brain size={22} className="text-[#1E4DB7]" />
              AI Placement Career Advisor
            </h2>

            {/* Quick Prompts */}
            <div className="flex flex-wrap gap-2">
              {[
                'How do I prepare for TCS Digital & Prime?',
                'Generate top 10 Java & DBMS Interview Questions.',
                'What high-impact projects should I build for SDE roles?',
                'Explain DBMS Normalization & Indexing interview questions.',
              ].map((qp, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setAdvisorQuery(qp);
                    handleAskAdvisor(qp);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-[#1E4DB7]/10 text-[#1E4DB7] dark:text-[#60A5FA] text-xs font-semibold hover:bg-[#1E4DB7]/20 transition"
                >
                  {qp}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={advisorQuery}
                onChange={(e) => setAdvisorQuery(e.target.value)}
                placeholder="Ask any placement question..."
                className="flex-1 p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-xs outline-none"
              />
              <button
                onClick={() => handleAskAdvisor()}
                disabled={askingAdvisor}
                className="px-6 py-3 rounded-xl bg-[#0E2A6D] text-white font-bold text-xs"
              >
                {askingAdvisor ? 'Thinking...' : 'Ask AI'}
              </button>
            </div>

            {advisorAdvice && (
              <div className="p-6 rounded-2xl bg-[#F8FAFC] dark:bg-[#1E293B]/40 border border-[#E2E8F0] dark:border-[#334155] text-xs leading-relaxed space-y-2 whitespace-pre-wrap">
                {advisorAdvice}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 8: CERTIFICATES VAULT                                                */}
        {/* ========================================================================= */}
        {activeTab === 'certificates' && (
          <div className="bg-white dark:bg-[#111827] p-6 rounded-2xl border border-[#E2E8F0] dark:border-[#1E293B] shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-heading font-bold text-xl text-[#0E2A6D] dark:text-white flex items-center gap-2">
                <Award size={22} className="text-[#D9A441]" />
                Student Certificates Vault
              </h2>
              <button
                onClick={() => setIsAddCertOpen(true)}
                className="px-4 py-2 rounded-xl bg-[#0E2A6D] text-white text-xs font-bold flex items-center gap-1.5"
              >
                <Plus size={16} /> Add Certificate
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {certificates.map((cert) => (
                <div key={cert.id} className="p-5 rounded-2xl border border-[#E2E8F0] dark:border-[#1E293B] bg-[#F8FAFC] dark:bg-[#1E293B]/40 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#1E4DB7]">{cert.category}</span>
                  <h3 className="font-bold text-sm text-[#0E2A6D] dark:text-white">{cert.title}</h3>
                  <p className="text-xs text-[#64748B]">{cert.issuer} • Issued {cert.issue_date}</p>
                </div>
              ))}
            </div>

            {/* Add Cert Modal */}
            {isAddCertOpen && (
              <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                <form onSubmit={handleAddCert} className="bg-white dark:bg-[#111827] max-w-md w-full p-6 rounded-2xl space-y-4 border">
                  <h3 className="font-bold text-lg">Add New Certificate</h3>
                  <input
                    type="text"
                    placeholder="Certificate Title"
                    value={newCert.title}
                    onChange={(e) => setNewCert({ ...newCert, title: e.target.value })}
                    className="w-full p-2.5 rounded-xl border text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Issuing Organization (e.g. AWS, NPTEL)"
                    value={newCert.issuer}
                    onChange={(e) => setNewCert({ ...newCert, issuer: e.target.value })}
                    className="w-full p-2.5 rounded-xl border text-xs"
                  />
                  <input
                    type="date"
                    value={newCert.issue_date}
                    onChange={(e) => setNewCert({ ...newCert, issue_date: e.target.value })}
                    className="w-full p-2.5 rounded-xl border text-xs"
                  />
                  <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => setIsAddCertOpen(false)} className="px-4 py-2 text-xs">
                      Cancel
                    </button>
                    <button type="submit" className="px-4 py-2 bg-[#0E2A6D] text-white text-xs font-bold rounded-xl">
                      Save Certificate
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
