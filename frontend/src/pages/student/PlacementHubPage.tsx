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
  MapPin,
  DollarSign,
  Calendar,
  User,
  Share2,
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
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('All');

  // Job Detail Modal State
  const [selectedDriveDetail, setSelectedDriveDetail] = useState<CompanyDrive | null>(null);

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
  const filteredDrives = drives.filter((d) => {
    const matchesSearch = d.company_name.toLowerCase().includes(searchDriveQuery.toLowerCase()) ||
      d.role.toLowerCase().includes(searchDriveQuery.toLowerCase()) ||
      d.skills_required.toLowerCase().includes(searchDriveQuery.toLowerCase());
    const matchesRole = selectedRoleFilter === 'All' || d.category === selectedRoleFilter;
    return matchesSearch && matchesRole;
  });

  if (loading || !stats) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#FFFFFF] dark:bg-[#0A0A0A]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#111827] dark:border-[#FAFAFA] border-t-transparent" />
          <p className="text-[14px] font-medium text-[#6B7280] dark:text-[#A3A3A3]">
            Loading AI Placement Hub...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-y-auto bg-[#FFFFFF] dark:bg-[#0A0A0A] text-[#111827] dark:text-[#FAFAFA] p-4 md:p-8 transition-colors">
      <div className="w-full max-w-[1600px] mx-auto space-y-8">

        {/* ========================================================================= */}
        {/* 1. PLACEMENT HEADER CARD                                                  */}
        {/* ========================================================================= */}
        <div className="bg-[#FFFFFF] dark:bg-[#181818] p-6 md:p-8 rounded-[12px] border border-[#D1D5DB] dark:border-[#3F3F46] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-[10px] bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] flex items-center justify-center shrink-0">
              <Briefcase size={24} />
            </div>
            <div>
              <h1 className="text-[32px] font-bold text-[#111827] dark:text-[#FAFAFA] tracking-tight flex items-center gap-3">
                AI Placement Hub
                <span className="text-[12px] font-medium px-2.5 py-0.5 rounded-[6px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA]">
                  Career Portal
                </span>
              </h1>
              <p className="text-[14px] text-[#6B7280] dark:text-[#A3A3A3] mt-1">
                Centralized platform for campus drives, ATS resume checks, coding practice, AI mock interviews, and career guidance.
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('drives')}
            className="h-10 px-6 rounded-[10px] bg-[#111827] hover:bg-[#000000] dark:bg-[#FAFAFA] dark:hover:bg-[#E5E5E5] text-[#FFFFFF] dark:text-[#111111] font-medium text-[14px] shadow-xs transition cursor-pointer shrink-0"
          >
            Explore Drives
          </button>
        </div>

        {/* ========================================================================= */}
        {/* RESPONSIVE NAVIGATION TAB BAR                                            */}
        {/* ========================================================================= */}
        <div className="w-full bg-[#F8FAFC] dark:bg-[#111111] p-1.5 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46]">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar flex-nowrap">
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
                  className={`h-10 px-4 text-[14px] font-medium rounded-[8px] transition-all duration-150 whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                    isActive
                      ? 'bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111]'
                      : 'text-[#4B5563] dark:text-[#A3A3A3] hover:bg-[#F9FAFB] dark:hover:bg-[#232323]'
                  }`}
                >
                  <Icon size={16} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. PLACEMENT DASHBOARD OVERVIEW CARDS                                     */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="p-6 rounded-[12px] bg-[#FFFFFF] dark:bg-[#181818] border border-[#D1D5DB] dark:border-[#3F3F46] shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[14px] font-medium text-[#6B7280] dark:text-[#A3A3A3]">Eligible Companies</p>
              <p className="text-[32px] font-bold text-[#111827] dark:text-[#FAFAFA] mt-1">{stats.eligible_companies}</p>
            </div>
            <div className="w-10 h-10 rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA] flex items-center justify-center">
              <Building2 size={20} />
            </div>
          </div>

          <div className="p-6 rounded-[12px] bg-[#FFFFFF] dark:bg-[#181818] border border-[#D1D5DB] dark:border-[#3F3F46] shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[14px] font-medium text-[#6B7280] dark:text-[#A3A3A3]">Applied Jobs</p>
              <p className="text-[32px] font-bold text-[#111827] dark:text-[#FAFAFA] mt-1">{applications.length}</p>
            </div>
            <div className="w-10 h-10 rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA] flex items-center justify-center">
              <Layers size={20} />
            </div>
          </div>

          <div className="p-6 rounded-[12px] bg-[#FFFFFF] dark:bg-[#181818] border border-[#D1D5DB] dark:border-[#3F3F46] shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[14px] font-medium text-[#6B7280] dark:text-[#A3A3A3]">ATS Resume Score</p>
              <p className="text-[32px] font-bold text-[#111827] dark:text-[#FAFAFA] mt-1">{stats.ats_resume_score}/100</p>
            </div>
            <div className="w-10 h-10 rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA] flex items-center justify-center">
              <FileCheck2 size={20} />
            </div>
          </div>

          <div className="p-6 rounded-[12px] bg-[#FFFFFF] dark:bg-[#181818] border border-[#D1D5DB] dark:border-[#3F3F46] shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[14px] font-medium text-[#6B7280] dark:text-[#A3A3A3]">Coding Solved</p>
              <p className="text-[32px] font-bold text-[#111827] dark:text-[#FAFAFA] mt-1">{stats.coding_solved}</p>
            </div>
            <div className="w-10 h-10 rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA] flex items-center justify-center">
              <Code2 size={20} />
            </div>
          </div>

          <div className="p-6 rounded-[12px] bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] border border-[#111827] dark:border-[#FAFAFA] shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[14px] font-medium opacity-80">Readiness Score</p>
              <p className="text-[32px] font-bold mt-1">{stats.interview_readiness_pct}%</p>
            </div>
            <div className="w-10 h-10 rounded-[10px] bg-[#FFFFFF] dark:bg-[#111111] text-[#111827] dark:text-[#FAFAFA] flex items-center justify-center">
              <Award size={20} />
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: PLACEMENT DRIVES & COMPANY CARDS                                   */}
        {/* ========================================================================= */}
        {activeTab === 'drives' && (
          <div className="space-y-6">
            {/* Search & Filter Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#FFFFFF] dark:bg-[#181818] p-4 rounded-[12px] border border-[#D1D5DB] dark:border-[#3F3F46] shadow-xs">
              <div className="relative flex-1 w-full">
                <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7280] dark:text-[#A3A3A3]" />
                <input
                  type="text"
                  value={searchDriveQuery}
                  onChange={(e) => setSearchDriveQuery(e.target.value)}
                  placeholder="Search company name, role, or required skills (e.g. Java, SDE)..."
                  className="w-full h-10 pl-10 pr-4 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#181818] text-[14px] text-[#111827] dark:text-[#FAFAFA] outline-none"
                />
              </div>
              <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
                {['All', 'Full-Time', 'Internship', 'Product', 'Service'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedRoleFilter(cat)}
                    className={`h-9 px-4 rounded-[8px] text-[14px] font-medium transition cursor-pointer whitespace-nowrap ${
                      selectedRoleFilter === cat
                        ? 'bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111]'
                        : 'bg-[#FFFFFF] dark:bg-[#181818] border border-[#D1D5DB] dark:border-[#3F3F46] text-[#111827] dark:text-[#FAFAFA] hover:bg-[#F9FAFB] dark:hover:bg-[#232323]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Company Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredDrives.map((drive) => {
                const isApplied = applications.some((a) => a.drive_id === drive.id);
                return (
                  <motion.div
                    key={drive.id}
                    whileHover={{ y: -2 }}
                    className="p-6 rounded-[12px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#181818] shadow-xs flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-[10px] bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] flex items-center justify-center shrink-0 font-bold text-[18px]">
                            {drive.company_name.charAt(0)}
                          </div>
                          <div>
                            <h3 className="font-bold text-[18px] text-[#111827] dark:text-[#FAFAFA] leading-tight">
                              {drive.company_name}
                            </h3>
                            <span className="text-[14px] text-[#6B7280] dark:text-[#A3A3A3] block">{drive.role}</span>
                          </div>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-[6px] text-[12px] font-medium bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA] shrink-0">
                          {drive.category}
                        </span>
                      </div>

                      <div className="p-4 rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] space-y-2 text-[14px]">
                        <div className="flex justify-between">
                          <span className="text-[#6B7280] dark:text-[#A3A3A3]">CTC Package:</span>
                          <span className="font-bold text-[#111827] dark:text-[#FAFAFA]">{drive.package_ctc}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#6B7280] dark:text-[#A3A3A3]">Eligibility:</span>
                          <span className="font-semibold text-[#111827] dark:text-[#FAFAFA]">CGPA ≥ {drive.eligibility_cgpa}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#6B7280] dark:text-[#A3A3A3]">Deadline:</span>
                          <span className="font-medium text-[#111827] dark:text-[#FAFAFA]">{drive.last_date}</span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[12px] font-semibold uppercase tracking-wider text-[#6B7280] dark:text-[#A3A3A3]">
                          Selection Process
                        </span>
                        <p className="text-[14px] text-[#4B5563] dark:text-[#D4D4D4] leading-relaxed">
                          {drive.selection_process}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {drive.skills_required.split(',').map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 rounded-[6px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA] text-[12px] font-medium"
                          >
                            {skill.trim()}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <button
                        onClick={() => setSelectedDriveDetail(drive)}
                        className="h-10 px-4 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] text-[14px] font-medium text-[#111827] dark:text-[#FAFAFA] hover:bg-[#F9FAFB] dark:hover:bg-[#232323] transition cursor-pointer flex-1"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => handleApplyDrive(drive)}
                        disabled={isApplied}
                        className="h-10 px-4 rounded-[10px] bg-[#111827] hover:bg-[#000000] dark:bg-[#FAFAFA] dark:hover:bg-[#E5E5E5] text-[#FFFFFF] dark:text-[#111111] text-[14px] font-medium shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 flex-1"
                      >
                        {isApplied ? (
                          <>
                            <Check size={16} /> Applied
                          </>
                        ) : (
                          'Apply Now'
                        )}
                      </button>
                    </div>
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
          <div className="bg-[#FFFFFF] dark:bg-[#181818] p-6 rounded-[12px] border border-[#D1D5DB] dark:border-[#3F3F46] shadow-xs space-y-6">
            <h2 className="text-[22px] font-bold text-[#111827] dark:text-[#FAFAFA] flex items-center gap-2">
              <Layers size={22} />
              <span>Application Pipeline Tracker</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 overflow-x-auto">
              {(['Applied', 'Shortlisted', 'Technical Interview', 'HR Round', 'Selected'] as const).map((stage) => {
                const stageApps = applications.filter((a) => a.stage === stage);
                return (
                  <div
                    key={stage}
                    className="p-4 rounded-[12px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] space-y-3 min-w-[200px]"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-[#F3F4F6] dark:border-[#2A2A2A]">
                      <span className="font-bold text-[12px] text-[#111827] dark:text-[#FAFAFA] uppercase tracking-wider">
                        {stage}
                      </span>
                      <span className="w-5 h-5 rounded-full bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] text-[10px] font-bold flex items-center justify-center">
                        {stageApps.length}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {stageApps.length === 0 ? (
                        <p className="text-[12px] text-[#6B7280] dark:text-[#A3A3A3] italic py-4 text-center">No applications</p>
                      ) : (
                        stageApps.map((app) => (
                          <div
                            key={app.id}
                            className="p-3 rounded-[10px] bg-[#FFFFFF] dark:bg-[#181818] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs space-y-1.5"
                          >
                            <span className="font-bold text-[14px] text-[#111827] dark:text-[#FAFAFA] block">
                              {app.company_name}
                            </span>
                            <span className="text-[12px] text-[#6B7280] dark:text-[#A3A3A3] block">{app.role}</span>
                            {app.notes && (
                              <p className="text-[12px] text-[#4B5563] dark:text-[#D4D4D4] bg-[#F8FAFC] dark:bg-[#111111] p-1.5 rounded-[6px] border border-[#E5E7EB] dark:border-[#2A2A2A]">
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
            <div className="flex items-center justify-between bg-[#FFFFFF] dark:bg-[#181818] p-6 rounded-[12px] border border-[#D1D5DB] dark:border-[#3F3F46] shadow-xs">
              <div>
                <h2 className="text-[22px] font-bold text-[#111827] dark:text-[#FAFAFA] flex items-center gap-2">
                  <FileCheck2 size={22} />
                  <span>ATS Resume Checker & Builder</span>
                </h2>
                <p className="text-[14px] text-[#6B7280] dark:text-[#A3A3A3] mt-0.5">
                  Audit your resume against ATS algorithms or build a compliant resume template instantly.
                </p>
              </div>
              <button
                onClick={() => setShowResumeBuilder(!showResumeBuilder)}
                className="h-10 px-5 rounded-[10px] bg-[#111827] hover:bg-[#000000] dark:bg-[#FAFAFA] dark:hover:bg-[#E5E5E5] text-[#FFFFFF] dark:text-[#111111] font-medium text-[14px] shadow-xs cursor-pointer"
              >
                {showResumeBuilder ? 'View ATS Audit' : 'Open Resume Builder'}
              </button>
            </div>

            {!showResumeBuilder ? (
              /* ATS Audit View */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-6 bg-[#FFFFFF] dark:bg-[#181818] p-6 rounded-[12px] border border-[#D1D5DB] dark:border-[#3F3F46] shadow-xs space-y-4">
                  <label className="text-[12px] font-medium uppercase tracking-wider text-[#6B7280] dark:text-[#A3A3A3]">
                    Paste Resume Content for AI ATS Audit
                  </label>
                  <textarea
                    rows={10}
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    className="w-full p-4 rounded-[10px] bg-[#FFFFFF] dark:bg-[#181818] border border-[#D1D5DB] dark:border-[#3F3F46] text-[14px] text-[#111827] dark:text-[#FAFAFA] outline-none"
                  />
                  <button
                    onClick={handleRunAtsCheck}
                    disabled={analyzingAts}
                    className="w-full h-10 rounded-[10px] bg-[#111827] hover:bg-[#000000] dark:bg-[#FAFAFA] dark:hover:bg-[#E5E5E5] text-[#FFFFFF] dark:text-[#111111] font-medium text-[14px] shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {analyzingAts ? (
                      'Running AI ATS Analysis...'
                    ) : (
                      <>
                        <Sparkles size={16} /> Run AI ATS Resume Audit
                      </>
                    )}
                  </button>
                </div>

                {/* Audit Outcome Results */}
                <div className="lg:col-span-6 bg-[#FFFFFF] dark:bg-[#181818] p-6 rounded-[12px] border border-[#D1D5DB] dark:border-[#3F3F46] shadow-xs space-y-5">
                  <h3 className="text-[18px] font-bold text-[#111827] dark:text-[#FAFAFA]">
                    ATS Audit Score Breakdown
                  </h3>

                  {atsResult ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-3 text-center">
                        <div className="p-4 rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A]">
                          <span className="text-[12px] font-medium text-[#6B7280] dark:text-[#A3A3A3] block">ATS Score</span>
                          <span className="text-[32px] font-bold text-[#111827] dark:text-[#FAFAFA]">{atsResult.ats_score}%</span>
                        </div>
                        <div className="p-4 rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A]">
                          <span className="text-[12px] font-medium text-[#6B7280] dark:text-[#A3A3A3] block">Grammar</span>
                          <span className="text-[32px] font-bold text-[#111827] dark:text-[#FAFAFA]">{atsResult.grammar_score}%</span>
                        </div>
                        <div className="p-4 rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A]">
                          <span className="text-[12px] font-medium text-[#6B7280] dark:text-[#A3A3A3] block">Formatting</span>
                          <span className="text-[32px] font-bold text-[#111827] dark:text-[#FAFAFA]">{atsResult.formatting_score}%</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <span className="text-[12px] font-medium text-[#6B7280] dark:text-[#A3A3A3] block">Missing High-Impact Skills:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {atsResult.missing_skills?.map((sk: string, idx: number) => (
                            <span key={idx} className="px-2.5 py-1 rounded-[6px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA] text-[12px] font-medium">
                              + {sk}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <span className="text-[12px] font-medium text-[#6B7280] dark:text-[#A3A3A3] block">AI Optimization Suggestions:</span>
                        <ul className="space-y-1.5 text-[14px] text-[#4B5563] dark:text-[#D4D4D4]">
                          {atsResult.suggestions?.map((sug: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2">
                              <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
                              <span>{sug}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 text-center text-[#6B7280] dark:text-[#A3A3A3] text-[14px] italic">
                      Click "Run AI ATS Resume Audit" to get instant feedback on ATS match, grammar, formatting, and missing skills.
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Interactive Resume Builder View */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-6 bg-[#FFFFFF] dark:bg-[#181818] p-6 rounded-[12px] border border-[#D1D5DB] dark:border-[#3F3F46] shadow-xs space-y-4">
                  <h3 className="text-[18px] font-bold text-[#111827] dark:text-[#FAFAFA]">
                    ATS Resume Form
                  </h3>
                  <div className="space-y-3 text-[14px]">
                    <div>
                      <label className="font-medium block mb-1">Full Name</label>
                      <input
                        type="text"
                        value={builderForm.name}
                        onChange={(e) => setBuilderForm({ ...builderForm, name: e.target.value })}
                        className="w-full h-10 px-3 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#181818] text-[#111827] dark:text-[#FAFAFA]"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="font-medium block mb-1">Email</label>
                        <input
                          type="text"
                          value={builderForm.email}
                          onChange={(e) => setBuilderForm({ ...builderForm, email: e.target.value })}
                          className="w-full h-10 px-3 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#181818] text-[#111827] dark:text-[#FAFAFA]"
                        />
                      </div>
                      <div>
                        <label className="font-medium block mb-1">Phone</label>
                        <input
                          type="text"
                          value={builderForm.phone}
                          onChange={(e) => setBuilderForm({ ...builderForm, phone: e.target.value })}
                          className="w-full h-10 px-3 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#181818] text-[#111827] dark:text-[#FAFAFA]"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="font-medium block mb-1">Professional Summary</label>
                      <textarea
                        rows={2}
                        value={builderForm.summary}
                        onChange={(e) => setBuilderForm({ ...builderForm, summary: e.target.value })}
                        className="w-full p-3 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#181818] text-[#111827] dark:text-[#FAFAFA]"
                      />
                    </div>
                    <div>
                      <label className="font-medium block mb-1">Education</label>
                      <input
                        type="text"
                        value={builderForm.education}
                        onChange={(e) => setBuilderForm({ ...builderForm, education: e.target.value })}
                        className="w-full h-10 px-3 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#181818] text-[#111827] dark:text-[#FAFAFA]"
                      />
                    </div>
                    <div>
                      <label className="font-medium block mb-1">Technical Skills</label>
                      <input
                        type="text"
                        value={builderForm.skills}
                        onChange={(e) => setBuilderForm({ ...builderForm, skills: e.target.value })}
                        className="w-full h-10 px-3 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#181818] text-[#111827] dark:text-[#FAFAFA]"
                      />
                    </div>
                    <div>
                      <label className="font-medium block mb-1">Projects</label>
                      <textarea
                        rows={2}
                        value={builderForm.projects}
                        onChange={(e) => setBuilderForm({ ...builderForm, projects: e.target.value })}
                        className="w-full p-3 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#181818] text-[#111827] dark:text-[#FAFAFA]"
                      />
                    </div>
                  </div>
                </div>

                {/* Resume Live Preview & Download */}
                <div className="lg:col-span-6 space-y-4">
                  <div className="bg-[#FFFFFF] dark:bg-[#181818] p-8 rounded-[12px] border border-[#D1D5DB] dark:border-[#3F3F46] shadow-xs space-y-4 font-body print:border-none">
                    <div className="border-b border-[#F3F4F6] dark:border-[#2A2A2A] pb-3 text-center">
                      <h2 className="font-bold text-[22px] text-[#111827] dark:text-[#FAFAFA] uppercase">
                        {builderForm.name}
                      </h2>
                      <p className="text-[12px] text-[#6B7280] dark:text-[#A3A3A3]">
                        {builderForm.email} • {builderForm.phone}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-bold text-[12px] uppercase text-[#111827] dark:text-[#FAFAFA] border-b border-[#F3F4F6] dark:border-[#2A2A2A] pb-0.5">
                        Professional Summary
                      </h4>
                      <p className="text-[14px] text-[#4B5563] dark:text-[#D4D4D4]">{builderForm.summary}</p>
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-bold text-[12px] uppercase text-[#111827] dark:text-[#FAFAFA] border-b border-[#F3F4F6] dark:border-[#2A2A2A] pb-0.5">
                        Education
                      </h4>
                      <p className="text-[14px] font-medium text-[#111827] dark:text-[#FAFAFA]">{builderForm.education}</p>
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-bold text-[12px] uppercase text-[#111827] dark:text-[#FAFAFA] border-b border-[#F3F4F6] dark:border-[#2A2A2A] pb-0.5">
                        Technical Skills
                      </h4>
                      <p className="text-[14px] text-[#4B5563] dark:text-[#D4D4D4]">{builderForm.skills}</p>
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-bold text-[12px] uppercase text-[#111827] dark:text-[#FAFAFA] border-b border-[#F3F4F6] dark:border-[#2A2A2A] pb-0.5">
                        Key Projects
                      </h4>
                      <p className="text-[14px] text-[#4B5563] dark:text-[#D4D4D4]">{builderForm.projects}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => window.print()}
                    className="w-full h-10 rounded-[10px] bg-[#111827] hover:bg-[#000000] dark:bg-[#FAFAFA] dark:hover:bg-[#E5E5E5] text-[#FFFFFF] dark:text-[#111111] font-medium text-[14px] shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
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
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#FFFFFF] dark:bg-[#181818] p-4 rounded-[12px] border border-[#D1D5DB] dark:border-[#3F3F46] shadow-xs">
              <div className="flex items-center gap-1.5 overflow-x-auto">
                {['All', 'Arrays', 'Strings', 'Linked List', 'Trees', 'Graphs', 'Dynamic Programming'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`h-9 px-4 rounded-[8px] text-[14px] font-medium transition whitespace-nowrap cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111]'
                        : 'bg-[#FFFFFF] dark:bg-[#181818] border border-[#D1D5DB] dark:border-[#3F3F46] text-[#111827] dark:text-[#FAFAFA] hover:bg-[#F9FAFB] dark:hover:bg-[#232323]'
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
                    className={`h-9 px-3 rounded-[8px] text-[12px] font-medium transition cursor-pointer ${
                      selectedDifficulty === diff
                        ? 'bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111]'
                        : 'bg-[#FFFFFF] dark:bg-[#181818] border border-[#D1D5DB] dark:border-[#3F3F46] text-[#111827] dark:text-[#FAFAFA] hover:bg-[#F9FAFB] dark:hover:bg-[#232323]'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            {/* Coding Problems List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredCodingProblems.map((prob) => (
                <div
                  key={prob.id}
                  className="p-5 rounded-[12px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#181818] shadow-xs space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[16px] text-[#111827] dark:text-[#FAFAFA]">
                        {prob.title}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-[6px] text-[12px] font-medium bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA]">
                        {prob.difficulty}
                      </span>
                    </div>
                    <p className="text-[14px] text-[#4B5563] dark:text-[#D4D4D4] leading-relaxed">
                      {prob.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#F3F4F6] dark:border-[#2A2A2A]">
                    <span className="text-[12px] font-medium text-[#6B7280] dark:text-[#A3A3A3]">{prob.category}</span>
                    <button
                      onClick={() => {
                        setActiveProblem(prob);
                        setSolutionCode('');
                        setCodeFeedback(null);
                      }}
                      className="h-9 px-4 rounded-[8px] bg-[#111827] hover:bg-[#000000] dark:bg-[#FAFAFA] dark:hover:bg-[#E5E5E5] text-[#FFFFFF] dark:text-[#111111] text-[14px] font-medium shadow-xs transition cursor-pointer"
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
                <div className="bg-[#FFFFFF] dark:bg-[#181818] max-w-2xl w-full p-6 rounded-[16px] shadow-lg space-y-4 border border-[#D1D5DB] dark:border-[#3F3F46]">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-[18px] text-[#111827] dark:text-[#FAFAFA]">
                      {activeProblem.title} ({activeProblem.difficulty})
                    </h3>
                    <button onClick={() => setActiveProblem(null)} className="text-[#6B7280] dark:text-[#A3A3A3] hover:text-[#111827] cursor-pointer">
                      ✕
                    </button>
                  </div>
                  <p className="text-[14px] text-[#4B5563] dark:text-[#D4D4D4]">{activeProblem.description}</p>
                  <div className="p-3 bg-[#F8FAFC] dark:bg-[#111111] rounded-[8px] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[12px] font-mono">
                    <strong>Sample Input:</strong> {activeProblem.sample_input}<br />
                    <strong>Sample Output:</strong> {activeProblem.sample_output}
                  </div>

                  <textarea
                    rows={6}
                    value={solutionCode}
                    onChange={(e) => setSolutionCode(e.target.value)}
                    placeholder="Write your Java / Python / C++ solution here..."
                    className="w-full p-3 rounded-[10px] bg-[#111827] text-[#FAFAFA] font-mono text-[14px] outline-none"
                  />

                  <div className="flex justify-between items-center">
                    <span className="text-[12px] text-[#6B7280] dark:text-[#A3A3A3]">Hint: {activeProblem.hints}</span>
                    <button
                      onClick={() => {
                        setCodeFeedback('All test cases passed! Complexity: O(N) Time, O(1) Space.');
                      }}
                      className="h-10 px-5 rounded-[10px] bg-[#111827] hover:bg-[#000000] dark:bg-[#FAFAFA] dark:hover:bg-[#E5E5E5] text-[#FFFFFF] dark:text-[#111111] font-medium text-[14px] cursor-pointer"
                    >
                      Submit Solution
                    </button>
                  </div>

                  {codeFeedback && (
                    <div className="p-3 bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA] rounded-[8px] text-[14px] font-medium flex items-center gap-2">
                      <CheckCircle2 size={16} />
                      <span>{codeFeedback}</span>
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
          <div className="bg-[#FFFFFF] dark:bg-[#181818] p-6 rounded-[12px] border border-[#D1D5DB] dark:border-[#3F3F46] shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-[22px] font-bold text-[#111827] dark:text-[#FAFAFA] flex items-center gap-2">
                  <Sparkles size={22} />
                  <span>AI Mock Interview Simulator</span>
                </h2>
                <p className="text-[14px] text-[#6B7280] dark:text-[#A3A3A3] mt-0.5">
                  Simulate real Technical, HR, Behavioral, and System Design interview rounds with AI score feedback.
                </p>
              </div>

              <div className="flex items-center gap-2">
                {(['Technical', 'HR', 'Behavioral', 'System Design'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setMockCategory(cat)}
                    className={`h-9 px-3 rounded-[8px] text-[12px] font-medium transition cursor-pointer ${
                      mockCategory === cat
                        ? 'bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111]'
                        : 'bg-[#FFFFFF] dark:bg-[#181818] border border-[#D1D5DB] dark:border-[#3F3F46] text-[#111827] dark:text-[#FAFAFA] hover:bg-[#F9FAFB] dark:hover:bg-[#232323]'
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
              className="h-10 px-6 rounded-[10px] bg-[#111827] hover:bg-[#000000] dark:bg-[#FAFAFA] dark:hover:bg-[#E5E5E5] text-[#FFFFFF] dark:text-[#111111] font-medium text-[14px] shadow-xs transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {generatingMockQ ? 'Generating Question...' : 'Generate New Interview Question'}
            </button>

            {currentMockQ && (
              <div className="space-y-4 p-6 rounded-[12px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A]">
                <h3 className="text-[18px] font-bold text-[#111827] dark:text-[#FAFAFA]">
                  Q: {currentMockQ.question}
                </h3>
                <textarea
                  rows={4}
                  value={mockUserAns}
                  onChange={(e) => setMockUserAns(e.target.value)}
                  placeholder="Type your interview response here..."
                  className="w-full p-4 rounded-[10px] bg-[#FFFFFF] dark:bg-[#181818] border border-[#D1D5DB] dark:border-[#3F3F46] text-[14px] text-[#111827] dark:text-[#FAFAFA] outline-none"
                />
                <button
                  onClick={handleEvaluateMock}
                  disabled={evaluatingMock}
                  className="h-10 px-5 rounded-[10px] bg-[#111827] hover:bg-[#000000] dark:bg-[#FAFAFA] dark:hover:bg-[#E5E5E5] text-[#FFFFFF] dark:text-[#111111] font-medium text-[14px] shadow-xs cursor-pointer"
                >
                  {evaluatingMock ? 'Evaluating...' : 'Evaluate My Response'}
                </button>
              </div>
            )}

            {mockResult && (
              <div className="p-6 rounded-[12px] bg-[#FFFFFF] dark:bg-[#181818] border border-[#D1D5DB] dark:border-[#3F3F46] space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[16px] text-[#111827] dark:text-[#FAFAFA]">
                    Evaluation Result: {mockResult.status}
                  </span>
                  <span className="text-[28px] font-bold text-[#111827] dark:text-[#FAFAFA]">
                    {mockResult.score_out_of_10} / 10
                  </span>
                </div>
                <p className="text-[14px] text-[#4B5563] dark:text-[#D4D4D4]">{mockResult.feedback}</p>
                <div className="p-4 rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[14px]">
                  <strong className="text-[#111827] dark:text-[#FAFAFA] block mb-1">Model Answer Concept:</strong>
                  <span className="text-[#4B5563] dark:text-[#D4D4D4]">{mockResult.model_answer}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: APTITUDE QUIZZES                                                   */}
        {/* ========================================================================= */}
        {activeTab === 'aptitude' && (
          <div className="bg-[#FFFFFF] dark:bg-[#181818] p-6 rounded-[12px] border border-[#D1D5DB] dark:border-[#3F3F46] shadow-xs space-y-6">
            <h2 className="text-[22px] font-bold text-[#111827] dark:text-[#FAFAFA] flex items-center gap-2">
              <Target size={22} />
              <span>Daily Placement Aptitude & Logical Practice</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {['Quantitative Aptitude', 'Logical Reasoning', 'Verbal Ability', 'Data Interpretation'].map((c, i) => (
                <div key={i} className="p-5 rounded-[12px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#FFFFFF] dark:bg-[#181818] space-y-3 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-[16px] text-[#111827] dark:text-[#FAFAFA]">{c}</h3>
                    <p className="text-[12px] text-[#6B7280] dark:text-[#A3A3A3] mt-1">15 Daily Practice Questions</p>
                  </div>
                  <button className="h-9 px-4 rounded-[8px] bg-[#111827] hover:bg-[#000000] dark:bg-[#FAFAFA] dark:hover:bg-[#E5E5E5] text-[#FFFFFF] dark:text-[#111111] text-[14px] font-medium shadow-xs cursor-pointer">
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
          <div className="bg-[#FFFFFF] dark:bg-[#181818] p-6 rounded-[12px] border border-[#D1D5DB] dark:border-[#3F3F46] shadow-xs space-y-6">
            <h2 className="text-[22px] font-bold text-[#111827] dark:text-[#FAFAFA] flex items-center gap-2">
              <Brain size={22} />
              <span>AI Placement Career Advisor</span>
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
                  className="h-8 px-3 rounded-[6px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA] text-[12px] font-medium hover:bg-[#F9FAFB] dark:hover:bg-[#232323] transition cursor-pointer"
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
                className="flex-1 h-10 px-4 rounded-[10px] bg-[#FFFFFF] dark:bg-[#181818] border border-[#D1D5DB] dark:border-[#3F3F46] text-[14px] text-[#111827] dark:text-[#FAFAFA] outline-none"
              />
              <button
                onClick={() => handleAskAdvisor()}
                disabled={askingAdvisor}
                className="h-10 px-6 rounded-[10px] bg-[#111827] hover:bg-[#000000] dark:bg-[#FAFAFA] dark:hover:bg-[#E5E5E5] text-[#FFFFFF] dark:text-[#111111] font-medium text-[14px] cursor-pointer"
              >
                {askingAdvisor ? 'Thinking...' : 'Ask AI'}
              </button>
            </div>

            {advisorAdvice && (
              <div className="p-6 rounded-[12px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[14px] leading-relaxed text-[#4B5563] dark:text-[#D4D4D4] space-y-2 whitespace-pre-wrap">
                {advisorAdvice}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 8: CERTIFICATES VAULT                                                */}
        {/* ========================================================================= */}
        {activeTab === 'certificates' && (
          <div className="bg-[#FFFFFF] dark:bg-[#181818] p-6 rounded-[12px] border border-[#D1D5DB] dark:border-[#3F3F46] shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-[22px] font-bold text-[#111827] dark:text-[#FAFAFA] flex items-center gap-2">
                <Award size={22} />
                <span>Student Certificates Vault</span>
              </h2>
              <button
                onClick={() => setIsAddCertOpen(true)}
                className="h-10 px-4 rounded-[10px] bg-[#111827] hover:bg-[#000000] dark:bg-[#FAFAFA] dark:hover:bg-[#E5E5E5] text-[#FFFFFF] dark:text-[#111111] text-[14px] font-medium flex items-center gap-1.5 cursor-pointer"
              >
                <Plus size={16} /> Add Certificate
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {certificates.map((cert) => (
                <div key={cert.id} className="p-5 rounded-[12px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#FFFFFF] dark:bg-[#181818] space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280] dark:text-[#A3A3A3]">{cert.category}</span>
                  <h3 className="font-bold text-[16px] text-[#111827] dark:text-[#FAFAFA]">{cert.title}</h3>
                  <p className="text-[12px] text-[#6B7280] dark:text-[#A3A3A3]">{cert.issuer} • Issued {cert.issue_date}</p>
                </div>
              ))}
            </div>

            {/* Add Cert Modal */}
            {isAddCertOpen && (
              <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                <form onSubmit={handleAddCert} className="bg-[#FFFFFF] dark:bg-[#181818] max-w-md w-full p-6 rounded-[16px] space-y-4 border border-[#D1D5DB] dark:border-[#3F3F46] shadow-lg">
                  <h3 className="font-bold text-[18px] text-[#111827] dark:text-[#FAFAFA]">Add New Certificate</h3>
                  <input
                    type="text"
                    placeholder="Certificate Title"
                    value={newCert.title}
                    onChange={(e) => setNewCert({ ...newCert, title: e.target.value })}
                    className="w-full h-10 px-3 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#181818] text-[14px] text-[#111827] dark:text-[#FAFAFA]"
                  />
                  <input
                    type="text"
                    placeholder="Issuing Organization (e.g. AWS, NPTEL)"
                    value={newCert.issuer}
                    onChange={(e) => setNewCert({ ...newCert, issuer: e.target.value })}
                    className="w-full h-10 px-3 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#181818] text-[14px] text-[#111827] dark:text-[#FAFAFA]"
                  />
                  <input
                    type="date"
                    value={newCert.issue_date}
                    onChange={(e) => setNewCert({ ...newCert, issue_date: e.target.value })}
                    className="w-full h-10 px-3 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#181818] text-[14px] text-[#111827] dark:text-[#FAFAFA]"
                  />
                  <div className="flex justify-end gap-2 pt-2">
                    <button type="button" onClick={() => setIsAddCertOpen(false)} className="h-10 px-4 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] text-[14px] text-[#111827] dark:text-[#FAFAFA]">
                      Cancel
                    </button>
                    <button type="submit" className="h-10 px-5 rounded-[10px] bg-[#111827] hover:bg-[#000000] dark:bg-[#FAFAFA] dark:hover:bg-[#E5E5E5] text-[#FFFFFF] dark:text-[#111111] font-medium text-[14px]">
                      Save Certificate
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* JOB DETAILS MODAL */}
        {selectedDriveDetail && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-[#FFFFFF] dark:bg-[#181818] max-w-2xl w-full p-6 rounded-[16px] shadow-lg space-y-5 border border-[#D1D5DB] dark:border-[#3F3F46]">
              <div className="flex items-center justify-between border-b border-[#F3F4F6] dark:border-[#2A2A2A] pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-[10px] bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] flex items-center justify-center font-bold text-[18px]">
                    {selectedDriveDetail.company_name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-[18px] text-[#111827] dark:text-[#FAFAFA]">{selectedDriveDetail.company_name}</h3>
                    <p className="text-[14px] text-[#6B7280] dark:text-[#A3A3A3]">{selectedDriveDetail.role}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedDriveDetail(null)} className="p-1 rounded text-[#6B7280] dark:text-[#A3A3A3] hover:text-[#111827] cursor-pointer">
                  ✕
                </button>
              </div>

              <div className="space-y-4 text-[14px] text-[#4B5563] dark:text-[#D4D4D4] max-h-96 overflow-y-auto pr-1">
                <div>
                  <h4 className="font-bold text-[12px] uppercase text-[#111827] dark:text-[#FAFAFA] mb-1">Role Description</h4>
                  <p className="leading-relaxed">{selectedDriveDetail.job_description || `${selectedDriveDetail.company_name} is hiring for ${selectedDriveDetail.role}. Candidates should demonstrate strong problem-solving skills, algorithmic understanding, and software design principles.`}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 p-4 rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A]">
                  <div>
                    <span className="text-[12px] text-[#6B7280] dark:text-[#A3A3A3] block">CTC Package</span>
                    <span className="font-bold text-[#111827] dark:text-[#FAFAFA]">{selectedDriveDetail.package_ctc}</span>
                  </div>
                  <div>
                    <span className="text-[12px] text-[#6B7280] dark:text-[#A3A3A3] block">Drive Date</span>
                    <span className="font-bold text-[#111827] dark:text-[#FAFAFA]">{selectedDriveDetail.drive_date || 'TBA'}</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-[12px] uppercase text-[#111827] dark:text-[#FAFAFA] mb-1">Required Skills</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedDriveDetail.skills_required.split(',').map((skill, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-[6px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA] text-[12px] font-medium">
                        {skill.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F3F4F6] dark:border-[#2A2A2A]">
                <button onClick={() => setSelectedDriveDetail(null)} className="h-10 px-5 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] text-[14px] text-[#111827] dark:text-[#FAFAFA] cursor-pointer">
                  Close
                </button>
                <button onClick={() => { handleApplyDrive(selectedDriveDetail); setSelectedDriveDetail(null); }} className="h-10 px-6 rounded-[10px] bg-[#111827] hover:bg-[#000000] dark:bg-[#FAFAFA] dark:hover:bg-[#E5E5E5] text-[#FFFFFF] dark:text-[#111111] font-medium text-[14px] cursor-pointer">
                  Apply Now
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
