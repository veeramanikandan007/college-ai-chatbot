import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Sparkles,
  Download,
  Printer,
  Trash2,
  Plus,
  Check,
  RefreshCw,
  User,
  GraduationCap,
  Wrench,
  FolderGit2,
  Award,
  Globe,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Layout,
  BarChart3,
  Mail,
  Phone,
  MapPin,
  Code2,
  Briefcase,
  Search,
  Eye,
  FileCheck,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import {
  getResume,
  saveResume,
  deleteResume,
  enhanceResumeContent,
  evaluateATS,
  ResumePayload,
  ATSResult,
  EducationItem,
  ExperienceItem,
  ProjectItem,
  SkillCategory,
  CertificationItem,
  AchievementItem
} from '../../api/resume';
import { useToast } from '../../hooks/useToast';

const DEFAULT_FORM: ResumePayload = {
  title: 'My Professional Tech Resume',
  template: 'modern',
  personalInfo: {
    fullName: 'Rahul Verma',
    email: 'rahul.verma@college.edu',
    phone: '+91 98765 43210',
    location: 'Chennai, TN',
    linkedin: 'https://linkedin.com/in/rahulverma',
    github: 'https://github.com/rahulverma',
    portfolio: 'https://rahulverma.dev',
    careerObjective: 'Motivated Computer Science undergraduate with expertise in Full-Stack Development and AI integration. Eager to solve real-world problems as a Software Engineer.'
  },
  education: [
    {
      institution: 'Campus Institute of Technology',
      degree: 'B.Tech',
      fieldOfStudy: 'Computer Science and Engineering',
      startDate: '2021',
      endDate: '2025',
      grade: '8.8 CGPA'
    }
  ],
  skills: [
    { category: 'Programming Languages', skills: ['Python', 'TypeScript', 'JavaScript', 'C++', 'SQL'] },
    { category: 'Frameworks & Libraries', skills: ['React', 'Node.js', 'FastAPI', 'TailwindCSS'] },
    { category: 'Tools & Databases', skills: ['Git', 'Docker', 'PostgreSQL', 'ChromaDB', 'AWS'] }
  ],
  experience: [
    {
      company: 'TechCorp Innovations',
      role: 'Full Stack Developer Intern',
      location: 'Remote',
      startDate: 'Jun 2024',
      endDate: 'Aug 2024',
      description: [
        'Built REST APIs using FastAPI and PostgreSQL handling 50k+ daily queries with 99.9% uptime.',
        'Engineered responsive React dashboards with TailwindCSS, improving page load speed by 30%.'
      ]
    }
  ],
  projects: [
    {
      title: 'CollegeMate AI Platform',
      technologies: ['React', 'FastAPI', 'ChromaDB', 'LangChain'],
      link: 'https://github.com/rahulverma/collegemate-ai',
      description: [
        'Architected an intelligent campus portal with RAG-based document search and real-time AI Chat.',
        'Processed PDF & OCR study materials into vector embeddings with sub-second retrieval latency.'
      ]
    }
  ],
  certifications: [
    { name: 'AWS Certified Developer', issuer: 'Amazon Web Services', issueDate: '2024' }
  ],
  achievements: [
    { title: '1st Prize - Smart Campus Hackathon', description: 'Awarded top innovation out of 120 participating teams.' }
  ],
  languages: ['English', 'Tamil'],
  hobbies: ['Open Source Contributing', 'Competitive Coding'],
  references: []
};

export default function AIResumeBuilderPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const printRef = useRef<HTMLDivElement>(null);

  const [activeTab, setActiveTab] = useState<'editor' | 'preview' | 'ats' | 'templates'>('editor');
  const [editorStep, setEditorStep] = useState<number>(0);
  const [resumeData, setResumeData] = useState<ResumePayload>(DEFAULT_FORM);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [atsResult, setAtsResult] = useState<ATSResult | null>(null);
  const [evaluatingATS, setEvaluatingATS] = useState<boolean>(false);
  const [enhancingField, setEnhancingField] = useState<string | null>(null);

  useEffect(() => {
    loadResume();
  }, []);

  const loadResume = async () => {
    try {
      const res = await getResume();
      if (res && res.resume_data && res.resume_data.personalInfo) {
        setResumeData(res.resume_data);
      }
      if (res.ats_score) {
        setAtsResult({
          overall_score: res.ats_score,
          grammar_score: res.grammar_score,
          formatting_score: res.formatting_score,
          missing_skills: res.missing_skills || [],
          weak_sections: [],
          suggestions: res.suggestions || []
        });
      }
    } catch (err) {
      console.error('Loaded default template', err);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveResume(resumeData);
      showToast('Resume saved successfully!', 'success');
    } catch (err) {
      showToast('Failed to save resume.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRunATS = async () => {
    setEvaluatingATS(true);
    try {
      const res = await evaluateATS(resumeData);
      setAtsResult(res);
      showToast(`ATS Analysis Complete! Score: ${res.overall_score}/100`, 'success');
      setActiveTab('ats');
    } catch (err) {
      showToast('Failed to analyze ATS score', 'error');
    } finally {
      setEvaluatingATS(false);
    }
  };

  const handleAIEnhanceObj = async () => {
    if (!resumeData.personalInfo.careerObjective) return;
    setEnhancingField('objective');
    try {
      const enhanced = await enhanceResumeContent('careerObjective', resumeData.personalInfo.careerObjective);
      setResumeData((prev) => ({
        ...prev,
        personalInfo: { ...prev.personalInfo, careerObjective: enhanced }
      }));
      showToast('Career Objective polished by AI!', 'success');
    } catch (err) {
      showToast('Failed to enhance content', 'error');
    } finally {
      setEnhancingField(null);
    }
  };

  const handlePrintPDF = () => {
    window.print();
  };

  const updatePersonalInfo = (field: string, value: string) => {
    setResumeData((prev) => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [field]: value }
    }));
  };

  const steps = [
    { label: 'Personal Information', icon: User },
    { label: 'Education', icon: GraduationCap },
    { label: 'Skills', icon: Wrench },
    { label: 'Experience', icon: Briefcase },
    { label: 'Projects', icon: FolderGit2 },
    { label: 'Certifications', icon: Award },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#FFFFFF] dark:bg-[#0A0A0A] text-[#111827] dark:text-[#FAFAFA] font-sans transition-colors duration-300 space-y-6">
      {/* ── Print-only CSS style override ── */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #resume-print-view, #resume-print-view * {
            visibility: visible;
          }
          #resume-print-view {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 0;
            box-shadow: none !important;
            background: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="mx-auto max-w-6xl space-y-6">
        
        {/* ==================================================
            PAGE HEADER (Monochrome Header Card)
            ================================================== */}
        <div className="no-print bg-[#FFFFFF] dark:bg-[#181818] p-6 rounded-[12px] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-150">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-[10px] bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] flex items-center justify-center shrink-0 shadow-xs">
              <FileText size={24} className="stroke-[2.2]" />
            </div>
            <div>
              <h1 className="text-[32px] font-bold tracking-tight text-[#111827] dark:text-[#FAFAFA] leading-tight">
                AI Resume Builder
              </h1>
              <p className="text-[14px] text-[#4B5563] dark:text-[#A3A3A3] mt-1">
                Create ATS-optimized, high-impact technical resumes with 1-click AI enhancements.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="h-10 px-4 rounded-[10px] border border-[#D1D5DB] dark:border-[#2A2A2A] bg-[#FFFFFF] dark:bg-[#181818] text-[#111827] dark:text-[#FAFAFA] hover:bg-[#F9FAFB] dark:hover:bg-[#232323] transition-all duration-150 text-[14px] font-medium flex items-center space-x-2 cursor-pointer"
            >
              {isSaving ? <RefreshCw size={16} className="animate-spin" /> : <Check size={16} className="text-[#111827] dark:text-[#FAFAFA]" />}
              <span>Save Draft</span>
            </button>

            <button
              onClick={handleRunATS}
              disabled={evaluatingATS}
              className="h-10 px-4 rounded-[10px] border border-[#D1D5DB] dark:border-[#2A2A2A] bg-[#FFFFFF] dark:bg-[#181818] text-[#111827] dark:text-[#FAFAFA] hover:bg-[#F9FAFB] dark:hover:bg-[#232323] transition-all duration-150 text-[14px] font-medium flex items-center space-x-2 cursor-pointer"
            >
              {evaluatingATS ? <RefreshCw size={16} className="animate-spin" /> : <BarChart3 size={16} />}
              <span>Check ATS Score</span>
            </button>

            <button
              onClick={handlePrintPDF}
              className="h-10 px-5 rounded-[10px] bg-[#111827] hover:bg-[#000000] dark:bg-[#FAFAFA] dark:hover:bg-[#E5E7EB] text-[#FFFFFF] dark:text-[#111111] font-medium text-[14px] shadow-xs transition-all duration-150 flex items-center space-x-2 cursor-pointer"
            >
              <Printer size={16} />
              <span>Download PDF</span>
            </button>
          </div>
        </div>

        {/* ==================================================
            DASHBOARD OVERVIEW CARDS
            ================================================== */}
        <div className="no-print grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#FFFFFF] dark:bg-[#181818] p-5 rounded-[12px] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[14px] font-medium text-[#6B7280] dark:text-[#A3A3A3]">Total Resumes</p>
              <h3 className="text-[32px] font-bold text-[#111827] dark:text-[#FAFAFA] mt-1">1</h3>
            </div>
            <div className="w-10 h-10 rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] flex items-center justify-center">
              <FileText size={20} className="text-[#111827] dark:text-[#FAFAFA]" />
            </div>
          </div>

          <div className="bg-[#FFFFFF] dark:bg-[#181818] p-5 rounded-[12px] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[14px] font-medium text-[#6B7280] dark:text-[#A3A3A3]">ATS Compatibility</p>
              <h3 className="text-[32px] font-bold text-[#111827] dark:text-[#FAFAFA] mt-1">
                {atsResult ? `${atsResult.overall_score}%` : '88%'}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] flex items-center justify-center">
              <BarChart3 size={20} className="text-[#111827] dark:text-[#FAFAFA]" />
            </div>
          </div>

          <div className="bg-[#FFFFFF] dark:bg-[#181818] p-5 rounded-[12px] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[14px] font-medium text-[#6B7280] dark:text-[#A3A3A3]">Active Template</p>
              <h3 className="text-[18px] font-bold text-[#111827] dark:text-[#FAFAFA] mt-2 capitalize">
                {resumeData.template}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] flex items-center justify-center">
              <Layers size={20} className="text-[#111827] dark:text-[#FAFAFA]" />
            </div>
          </div>

          <div className="bg-[#FFFFFF] dark:bg-[#181818] p-5 rounded-[12px] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[14px] font-medium text-[#6B7280] dark:text-[#A3A3A3]">Downloads</p>
              <h3 className="text-[32px] font-bold text-[#111827] dark:text-[#FAFAFA] mt-1">12</h3>
            </div>
            <div className="w-10 h-10 rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] flex items-center justify-center">
              <Download size={20} className="text-[#111827] dark:text-[#FAFAFA]" />
            </div>
          </div>
        </div>

        {/* ==================================================
            MAIN NAVIGATION TABS BAR
            ================================================== */}
        <div className="no-print bg-[#FFFFFF] dark:bg-[#181818] p-2 rounded-[12px] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs flex flex-wrap gap-2">
          {[
            { id: 'editor', label: '1. Resume Editor', icon: User },
            { id: 'preview', label: '2. Live Preview', icon: Eye },
            { id: 'templates', label: '3. Templates', icon: Layout },
            { id: 'ats', label: '4. ATS Strength Report', icon: FileCheck },
          ].map((tb) => {
            const Icon = tb.icon;
            const isActive = activeTab === tb.id;
            return (
              <button
                key={tb.id}
                onClick={() => setActiveTab(tb.id as any)}
                className={`h-10 px-4 rounded-[10px] text-[14px] font-medium transition-all duration-150 flex items-center space-x-2 cursor-pointer ${
                  isActive
                    ? 'bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111]'
                    : 'bg-[#FFFFFF] dark:bg-[#181818] text-[#4B5563] dark:text-[#A3A3A3] hover:bg-[#F9FAFB] dark:hover:bg-[#232323]'
                }`}
              >
                <Icon size={16} className={isActive ? 'text-[#FFFFFF] dark:text-[#111111]' : 'text-[#111827] dark:text-[#FAFAFA]'} />
                <span>{tb.label}</span>
              </button>
            );
          })}
        </div>

        {/* ==================================================
            TAB 1: RESUME FORM EDITOR
            ================================================== */}
        {activeTab === 'editor' && (
          <div className="no-print grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Step Navigation Sidebar (4 cols) */}
            <div className="lg:col-span-4 bg-[#FFFFFF] dark:bg-[#181818] rounded-[12px] border border-[#E5E7EB] dark:border-[#2A2A2A] p-4 space-y-2 h-fit shadow-xs">
              <div className="text-[14px] font-semibold text-[#111827] dark:text-[#FAFAFA] px-3 py-2 border-b border-[#F3F4F6] dark:border-[#2A2A2A] mb-2">
                Resume Sections
              </div>
              {steps.map((st, idx) => {
                const Icon = st.icon;
                const isActive = editorStep === idx;
                return (
                  <button
                    key={st.label}
                    onClick={() => setEditorStep(idx)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-[10px] text-[14px] font-medium transition-all duration-150 cursor-pointer ${
                      isActive
                        ? 'bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111]'
                        : 'text-[#4B5563] dark:text-[#A3A3A3] hover:bg-[#F9FAFB] dark:hover:bg-[#232323]'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon size={18} className={isActive ? 'text-[#FFFFFF] dark:text-[#111111]' : 'text-[#111827] dark:text-[#FAFAFA]'} />
                      <span>{st.label}</span>
                    </div>
                    <ChevronRight size={16} className={isActive ? 'text-[#FFFFFF] dark:text-[#111111]' : 'text-[#6B7280]'} />
                  </button>
                );
              })}
            </div>

            {/* Form Fields Area (8 cols) */}
            <div className="lg:col-span-8 bg-[#FFFFFF] dark:bg-[#181818] rounded-[12px] border border-[#E5E7EB] dark:border-[#2A2A2A] p-6 space-y-6 shadow-xs">
              {/* Step 0: Personal Info */}
              {editorStep === 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-[#F3F4F6] dark:border-[#2A2A2A] pb-3">
                    <h2 className="text-[22px] font-bold text-[#111827] dark:text-[#FAFAFA]">Personal Information</h2>
                    <span className="text-[14px] text-[#6B7280] dark:text-[#A3A3A3]">Step 1 of 6</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="text-[14px] font-medium text-[#111827] dark:text-[#FAFAFA] block mb-1">Full Name</label>
                      <input
                        type="text"
                        value={resumeData.personalInfo.fullName}
                        onChange={(e) => updatePersonalInfo('fullName', e.target.value)}
                        className="w-full px-4 py-2 bg-[#FFFFFF] dark:bg-[#181818] border border-[#D1D5DB] dark:border-[#2A2A2A] rounded-[10px] text-[14px] text-[#111827] dark:text-[#FAFAFA] focus:outline-none focus:border-[#111827] dark:focus:border-[#FAFAFA]"
                      />
                    </div>
                    <div>
                      <label className="text-[14px] font-medium text-[#111827] dark:text-[#FAFAFA] block mb-1">Email Address</label>
                      <input
                        type="email"
                        value={resumeData.personalInfo.email}
                        onChange={(e) => updatePersonalInfo('email', e.target.value)}
                        className="w-full px-4 py-2 bg-[#FFFFFF] dark:bg-[#181818] border border-[#D1D5DB] dark:border-[#2A2A2A] rounded-[10px] text-[14px] text-[#111827] dark:text-[#FAFAFA] focus:outline-none focus:border-[#111827] dark:focus:border-[#FAFAFA]"
                      />
                    </div>
                    <div>
                      <label className="text-[14px] font-medium text-[#111827] dark:text-[#FAFAFA] block mb-1">Phone Number</label>
                      <input
                        type="text"
                        value={resumeData.personalInfo.phone}
                        onChange={(e) => updatePersonalInfo('phone', e.target.value)}
                        className="w-full px-4 py-2 bg-[#FFFFFF] dark:bg-[#181818] border border-[#D1D5DB] dark:border-[#2A2A2A] rounded-[10px] text-[14px] text-[#111827] dark:text-[#FAFAFA] focus:outline-none focus:border-[#111827] dark:focus:border-[#FAFAFA]"
                      />
                    </div>
                    <div>
                      <label className="text-[14px] font-medium text-[#111827] dark:text-[#FAFAFA] block mb-1">Location</label>
                      <input
                        type="text"
                        value={resumeData.personalInfo.location || ''}
                        onChange={(e) => updatePersonalInfo('location', e.target.value)}
                        className="w-full px-4 py-2 bg-[#FFFFFF] dark:bg-[#181818] border border-[#D1D5DB] dark:border-[#2A2A2A] rounded-[10px] text-[14px] text-[#111827] dark:text-[#FAFAFA] focus:outline-none focus:border-[#111827] dark:focus:border-[#FAFAFA]"
                      />
                    </div>
                    <div>
                      <label className="text-[14px] font-medium text-[#111827] dark:text-[#FAFAFA] block mb-1">LinkedIn Profile</label>
                      <input
                        type="url"
                        value={resumeData.personalInfo.linkedin || ''}
                        onChange={(e) => updatePersonalInfo('linkedin', e.target.value)}
                        className="w-full px-4 py-2 bg-[#FFFFFF] dark:bg-[#181818] border border-[#D1D5DB] dark:border-[#2A2A2A] rounded-[10px] text-[14px] text-[#111827] dark:text-[#FAFAFA] focus:outline-none focus:border-[#111827] dark:focus:border-[#FAFAFA]"
                      />
                    </div>
                    <div>
                      <label className="text-[14px] font-medium text-[#111827] dark:text-[#FAFAFA] block mb-1">GitHub Profile</label>
                      <input
                        type="url"
                        value={resumeData.personalInfo.github || ''}
                        onChange={(e) => updatePersonalInfo('github', e.target.value)}
                        className="w-full px-4 py-2 bg-[#FFFFFF] dark:bg-[#181818] border border-[#D1D5DB] dark:border-[#2A2A2A] rounded-[10px] text-[14px] text-[#111827] dark:text-[#FAFAFA] focus:outline-none focus:border-[#111827] dark:focus:border-[#FAFAFA]"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[14px] font-medium text-[#111827] dark:text-[#FAFAFA]">Career Objective</label>
                      <button
                        onClick={handleAIEnhanceObj}
                        disabled={enhancingField === 'objective'}
                        className="h-8 px-3 rounded-[8px] bg-[#111827] hover:bg-[#000000] dark:bg-[#FAFAFA] dark:hover:bg-[#E5E7EB] text-[#FFFFFF] dark:text-[#111111] font-medium text-[12px] flex items-center space-x-1.5 transition-all duration-150 cursor-pointer"
                      >
                        <Sparkles size={14} />
                        <span>{enhancingField === 'objective' ? 'Polishing...' : 'AI Rewrite'}</span>
                      </button>
                    </div>
                    <textarea
                      rows={3}
                      value={resumeData.personalInfo.careerObjective || ''}
                      onChange={(e) => updatePersonalInfo('careerObjective', e.target.value)}
                      className="w-full p-3 bg-[#FFFFFF] dark:bg-[#181818] border border-[#D1D5DB] dark:border-[#2A2A2A] rounded-[10px] text-[14px] text-[#111827] dark:text-[#FAFAFA] focus:outline-none focus:border-[#111827] dark:focus:border-[#FAFAFA]"
                    />
                  </div>
                </div>
              )}

              {/* Step 1: Education */}
              {editorStep === 1 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-[#F3F4F6] dark:border-[#2A2A2A] pb-3">
                    <h2 className="text-[22px] font-bold text-[#111827] dark:text-[#FAFAFA]">Education</h2>
                    <button
                      onClick={() =>
                        setResumeData((prev) => ({
                          ...prev,
                          education: [
                            ...prev.education,
                            { institution: '', degree: 'B.Tech', fieldOfStudy: '', startDate: '', endDate: '', grade: '' }
                          ]
                        }))
                      }
                      className="h-8 px-3 rounded-[8px] bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] text-[12px] font-medium flex items-center space-x-1 cursor-pointer"
                    >
                      <Plus size={14} />
                      <span>Add Education</span>
                    </button>
                  </div>

                  {resumeData.education.map((edu, i) => (
                    <div key={i} className="p-4 rounded-[12px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#F8FAFC] dark:bg-[#111111] space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input
                          placeholder="Institution Name"
                          value={edu.institution}
                          onChange={(e) => {
                            const updated = [...resumeData.education];
                            updated[i].institution = e.target.value;
                            setResumeData((p) => ({ ...p, education: updated }));
                          }}
                          className="p-2.5 bg-[#FFFFFF] dark:bg-[#181818] border border-[#D1D5DB] dark:border-[#2A2A2A] rounded-[10px] text-[14px] text-[#111827] dark:text-[#FAFAFA]"
                        />
                        <input
                          placeholder="Degree (e.g. B.Tech)"
                          value={edu.degree}
                          onChange={(e) => {
                            const updated = [...resumeData.education];
                            updated[i].degree = e.target.value;
                            setResumeData((p) => ({ ...p, education: updated }));
                          }}
                          className="p-2.5 bg-[#FFFFFF] dark:bg-[#181818] border border-[#D1D5DB] dark:border-[#2A2A2A] rounded-[10px] text-[14px] text-[#111827] dark:text-[#FAFAFA]"
                        />
                        <input
                          placeholder="Field of Study"
                          value={edu.fieldOfStudy}
                          onChange={(e) => {
                            const updated = [...resumeData.education];
                            updated[i].fieldOfStudy = e.target.value;
                            setResumeData((p) => ({ ...p, education: updated }));
                          }}
                          className="p-2.5 bg-[#FFFFFF] dark:bg-[#181818] border border-[#D1D5DB] dark:border-[#2A2A2A] rounded-[10px] text-[14px] text-[#111827] dark:text-[#FAFAFA]"
                        />
                        <input
                          placeholder="CGPA / Grade"
                          value={edu.grade || ''}
                          onChange={(e) => {
                            const updated = [...resumeData.education];
                            updated[i].grade = e.target.value;
                            setResumeData((p) => ({ ...p, education: updated }));
                          }}
                          className="p-2.5 bg-[#FFFFFF] dark:bg-[#181818] border border-[#D1D5DB] dark:border-[#2A2A2A] rounded-[10px] text-[14px] text-[#111827] dark:text-[#FAFAFA]"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Step 2: Skills */}
              {editorStep === 2 && (
                <div className="space-y-4">
                  <div className="border-b border-[#F3F4F6] dark:border-[#2A2A2A] pb-3">
                    <h2 className="text-[22px] font-bold text-[#111827] dark:text-[#FAFAFA]">Skills & Expertise</h2>
                  </div>
                  {resumeData.skills.map((sc, catIdx) => (
                    <div key={catIdx} className="p-4 rounded-[12px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#F8FAFC] dark:bg-[#111111] space-y-2">
                      <input
                        value={sc.category}
                        onChange={(e) => {
                          const updated = [...resumeData.skills];
                          updated[catIdx].category = e.target.value;
                          setResumeData((p) => ({ ...p, skills: updated }));
                        }}
                        className="font-bold text-[14px] bg-transparent border-b border-[#D1D5DB] dark:border-[#2A2A2A] pb-1 text-[#111827] dark:text-[#FAFAFA] w-full focus:outline-none"
                      />
                      <input
                        placeholder="Comma separated skills: React, Python, Docker"
                        value={sc.skills.join(', ')}
                        onChange={(e) => {
                          const updated = [...resumeData.skills];
                          updated[catIdx].skills = e.target.value.split(',').map((s) => s.trim());
                          setResumeData((p) => ({ ...p, skills: updated }));
                        }}
                        className="w-full p-2.5 text-[14px] bg-[#FFFFFF] dark:bg-[#181818] border border-[#D1D5DB] dark:border-[#2A2A2A] rounded-[10px] text-[#111827] dark:text-[#FAFAFA]"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Step 3: Experience */}
              {editorStep === 3 && (
                <div className="space-y-4">
                  <div className="border-b border-[#F3F4F6] dark:border-[#2A2A2A] pb-3">
                    <h2 className="text-[22px] font-bold text-[#111827] dark:text-[#FAFAFA]">Work & Internships</h2>
                  </div>
                  {resumeData.experience.map((exp, expIdx) => (
                    <div key={expIdx} className="p-4 rounded-[12px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#F8FAFC] dark:bg-[#111111] space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          placeholder="Company Name"
                          value={exp.company}
                          onChange={(e) => {
                            const updated = [...resumeData.experience];
                            updated[expIdx].company = e.target.value;
                            setResumeData((p) => ({ ...p, experience: updated }));
                          }}
                          className="p-2.5 bg-[#FFFFFF] dark:bg-[#181818] border border-[#D1D5DB] dark:border-[#2A2A2A] rounded-[10px] text-[14px] text-[#111827] dark:text-[#FAFAFA]"
                        />
                        <input
                          placeholder="Role Title"
                          value={exp.role}
                          onChange={(e) => {
                            const updated = [...resumeData.experience];
                            updated[expIdx].role = e.target.value;
                            setResumeData((p) => ({ ...p, experience: updated }));
                          }}
                          className="p-2.5 bg-[#FFFFFF] dark:bg-[#181818] border border-[#D1D5DB] dark:border-[#2A2A2A] rounded-[10px] text-[14px] text-[#111827] dark:text-[#FAFAFA]"
                        />
                      </div>
                      <textarea
                        rows={3}
                        placeholder="Bullet points (one per line)"
                        value={exp.description.join('\n')}
                        onChange={(e) => {
                          const updated = [...resumeData.experience];
                          updated[expIdx].description = e.target.value.split('\n');
                          setResumeData((p) => ({ ...p, experience: updated }));
                        }}
                        className="w-full p-2.5 bg-[#FFFFFF] dark:bg-[#181818] border border-[#D1D5DB] dark:border-[#2A2A2A] rounded-[10px] text-[14px] text-[#111827] dark:text-[#FAFAFA]"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Step 4: Projects */}
              {editorStep === 4 && (
                <div className="space-y-4">
                  <div className="border-b border-[#F3F4F6] dark:border-[#2A2A2A] pb-3">
                    <h2 className="text-[22px] font-bold text-[#111827] dark:text-[#FAFAFA]">Technical Projects</h2>
                  </div>
                  {resumeData.projects.map((proj, projIdx) => (
                    <div key={projIdx} className="p-4 rounded-[12px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#F8FAFC] dark:bg-[#111111] space-y-3">
                      <input
                        placeholder="Project Title"
                        value={proj.title}
                        onChange={(e) => {
                          const updated = [...resumeData.projects];
                          updated[projIdx].title = e.target.value;
                          setResumeData((p) => ({ ...p, projects: updated }));
                        }}
                        className="w-full p-2.5 bg-[#FFFFFF] dark:bg-[#181818] border border-[#D1D5DB] dark:border-[#2A2A2A] rounded-[10px] text-[14px] font-semibold text-[#111827] dark:text-[#FAFAFA]"
                      />
                      <textarea
                        rows={3}
                        placeholder="Project Description Bullets (one per line)"
                        value={proj.description.join('\n')}
                        onChange={(e) => {
                          const updated = [...resumeData.projects];
                          updated[projIdx].description = e.target.value.split('\n');
                          setResumeData((p) => ({ ...p, projects: updated }));
                        }}
                        className="w-full p-2.5 bg-[#FFFFFF] dark:bg-[#181818] border border-[#D1D5DB] dark:border-[#2A2A2A] rounded-[10px] text-[14px] text-[#111827] dark:text-[#FAFAFA]"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Step 5: Certifications */}
              {editorStep === 5 && (
                <div className="space-y-4">
                  <div className="border-b border-[#F3F4F6] dark:border-[#2A2A2A] pb-3">
                    <h2 className="text-[22px] font-bold text-[#111827] dark:text-[#FAFAFA]">Certifications & Achievements</h2>
                  </div>
                  <div className="space-y-3">
                    {resumeData.certifications.map((cert, cIdx) => (
                      <div key={cIdx} className="flex gap-3">
                        <input
                          placeholder="Certification Name"
                          value={cert.name}
                          onChange={(e) => {
                            const updated = [...resumeData.certifications];
                            updated[cIdx].name = e.target.value;
                            setResumeData((p) => ({ ...p, certifications: updated }));
                          }}
                          className="flex-1 p-2.5 bg-[#FFFFFF] dark:bg-[#181818] border border-[#D1D5DB] dark:border-[#2A2A2A] rounded-[10px] text-[14px] text-[#111827] dark:text-[#FAFAFA]"
                        />
                        <input
                          placeholder="Issuer"
                          value={cert.issuer}
                          onChange={(e) => {
                            const updated = [...resumeData.certifications];
                            updated[cIdx].issuer = e.target.value;
                            setResumeData((p) => ({ ...p, certifications: updated }));
                          }}
                          className="w-1/3 p-2.5 bg-[#FFFFFF] dark:bg-[#181818] border border-[#D1D5DB] dark:border-[#2A2A2A] rounded-[10px] text-[14px] text-[#111827] dark:text-[#FAFAFA]"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Form Navigation Controls */}
              <div className="flex justify-between pt-4 border-t border-[#F3F4F6] dark:border-[#2A2A2A]">
                <button
                  disabled={editorStep === 0}
                  onClick={() => setEditorStep((s) => s - 1)}
                  className="h-10 px-4 rounded-[10px] border border-[#D1D5DB] dark:border-[#2A2A2A] bg-[#FFFFFF] dark:bg-[#181818] text-[#111827] dark:text-[#FAFAFA] font-medium text-[14px] disabled:opacity-40 flex items-center space-x-1 cursor-pointer"
                >
                  <ChevronLeft size={16} />
                  <span>Previous Step</span>
                </button>

                <button
                  disabled={editorStep === steps.length - 1}
                  onClick={() => setEditorStep((s) => s + 1)}
                  className="h-10 px-5 rounded-[10px] bg-[#111827] hover:bg-[#000000] dark:bg-[#FAFAFA] dark:hover:bg-[#E5E7EB] text-[#FFFFFF] dark:text-[#111111] font-medium text-[14px] disabled:opacity-40 flex items-center space-x-1 cursor-pointer"
                >
                  <span>Next Step</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================
            TAB 2: LIVE RESUME PREVIEW
            ================================================== */}
        {(activeTab === 'preview' || activeTab === 'editor') && (
          <div className={`${activeTab === 'editor' ? 'no-print border-t pt-8 border-[#E5E7EB] dark:border-[#2A2A2A]' : ''} space-y-4`}>
            {/* Action Bar for Preview */}
            <div className="no-print bg-[#FFFFFF] dark:bg-[#181818] p-4 rounded-[12px] border border-[#E5E7EB] dark:border-[#2A2A2A] flex items-center justify-between shadow-xs">
              <div>
                <h3 className="text-[18px] font-bold text-[#111827] dark:text-[#FAFAFA]">Resume Paper View</h3>
                <p className="text-[14px] text-[#6B7280] dark:text-[#A3A3A3]">High-resolution print & PDF preview</p>
              </div>
              <button
                onClick={handlePrintPDF}
                className="h-9 px-4 rounded-[10px] bg-[#111827] hover:bg-[#000000] dark:bg-[#FAFAFA] dark:hover:bg-[#E5E7EB] text-[#FFFFFF] dark:text-[#111111] text-[14px] font-medium flex items-center space-x-2 cursor-pointer"
              >
                <Printer size={16} />
                <span>Export PDF</span>
              </button>
            </div>

            {/* Paper Document Preview */}
            <div className="w-full overflow-x-auto flex justify-center py-4">
              <div
                id="resume-print-view"
                ref={printRef}
                className="w-full max-w-[850px] bg-[#FFFFFF] text-[#111827] p-8 md:p-10 rounded-[12px] shadow-lg border border-[#E5E7EB] font-sans space-y-6"
              >
                {/* Document Header */}
                <div className="border-b border-[#E5E7EB] pb-4">
                  <h1 className="text-[28px] font-bold tracking-tight text-[#111827] uppercase">
                    {resumeData.personalInfo.fullName}
                  </h1>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-[14px] text-[#4B5563] mt-2">
                    {resumeData.personalInfo.email && <span className="inline-flex items-center gap-1"><Mail size={14} className="text-[#6B7280]" /> {resumeData.personalInfo.email}</span>}
                    {resumeData.personalInfo.phone && <span className="inline-flex items-center gap-1"><Phone size={14} className="text-[#6B7280]" /> {resumeData.personalInfo.phone}</span>}
                    {resumeData.personalInfo.location && <span className="inline-flex items-center gap-1"><MapPin size={14} className="text-[#6B7280]" /> {resumeData.personalInfo.location}</span>}
                    {resumeData.personalInfo.linkedin && <span className="inline-flex items-center gap-1"><Globe size={14} className="text-[#6B7280]" /> {resumeData.personalInfo.linkedin}</span>}
                    {resumeData.personalInfo.github && <span className="inline-flex items-center gap-1"><Code2 size={14} className="text-[#6B7280]" /> {resumeData.personalInfo.github}</span>}
                  </div>
                  {resumeData.personalInfo.careerObjective && (
                    <p className="text-[14px] text-[#4B5563] italic mt-3 leading-relaxed">
                      "{resumeData.personalInfo.careerObjective}"
                    </p>
                  )}
                </div>

                {/* Technical Skills */}
                {resumeData.skills.length > 0 && (
                  <div>
                    <h3 className="text-[14px] font-bold uppercase tracking-wider text-[#111827] border-b border-[#E5E7EB] pb-1 mb-2">
                      Technical Skills
                    </h3>
                    <div className="space-y-1 text-[14px] text-[#111827]">
                      {resumeData.skills.map((sc, i) => (
                        <div key={i} className="flex">
                          <span className="font-semibold w-44 text-[#4B5563]">{sc.category}:</span>
                          <span className="flex-1">{sc.skills.join(', ')}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Experience */}
                {resumeData.experience.length > 0 && (
                  <div>
                    <h3 className="text-[14px] font-bold uppercase tracking-wider text-[#111827] border-b border-[#E5E7EB] pb-1 mb-2">
                      Experience & Internships
                    </h3>
                    <div className="space-y-3">
                      {resumeData.experience.map((exp, i) => (
                        <div key={i} className="text-[14px]">
                          <div className="flex justify-between font-bold text-[#111827]">
                            <span>{exp.role} - {exp.company}</span>
                            <span className="text-[#6B7280] font-normal">{exp.startDate} – {exp.endDate}</span>
                          </div>
                          <ul className="list-disc list-inside text-[#4B5563] mt-1 space-y-0.5">
                            {exp.description.map((b, bi) => b.trim() && <li key={bi}>{b}</li>)}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Projects */}
                {resumeData.projects.length > 0 && (
                  <div>
                    <h3 className="text-[14px] font-bold uppercase tracking-wider text-[#111827] border-b border-[#E5E7EB] pb-1 mb-2">
                      Projects
                    </h3>
                    <div className="space-y-3">
                      {resumeData.projects.map((proj, i) => (
                        <div key={i} className="text-[14px]">
                          <div className="flex justify-between font-bold text-[#111827]">
                            <span>{proj.title} <span className="font-normal text-[#6B7280]">({proj.technologies.join(', ')})</span></span>
                          </div>
                          <ul className="list-disc list-inside text-[#4B5563] mt-1 space-y-0.5">
                            {proj.description.map((b, bi) => b.trim() && <li key={bi}>{b}</li>)}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Education */}
                {resumeData.education.length > 0 && (
                  <div>
                    <h3 className="text-[14px] font-bold uppercase tracking-wider text-[#111827] border-b border-[#E5E7EB] pb-1 mb-2">
                      Education
                    </h3>
                    <div className="space-y-1.5">
                      {resumeData.education.map((edu, i) => (
                        <div key={i} className="flex justify-between text-[14px] text-[#111827]">
                          <div>
                            <span className="font-bold">{edu.degree} in {edu.fieldOfStudy}</span> — {edu.institution}
                          </div>
                          <div className="text-[#6B7280]">
                            {edu.grade && <span className="font-medium mr-2">{edu.grade}</span>}
                            <span>{edu.startDate} – {edu.endDate}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Certifications & Achievements */}
                {resumeData.certifications.length > 0 && (
                  <div>
                    <h3 className="text-[14px] font-bold uppercase tracking-wider text-[#111827] border-b border-[#E5E7EB] pb-1 mb-2">
                      Certifications & Key Achievements
                    </h3>
                    <ul className="list-disc list-inside text-[14px] text-[#4B5563] space-y-1">
                      {resumeData.certifications.map((c, i) => (
                        <li key={i}>
                          <span className="font-medium text-[#111827]">{c.name}</span> — {c.issuer} ({c.issueDate})
                        </li>
                      ))}
                      {resumeData.achievements.map((a, i) => (
                        <li key={`ach-${i}`}>
                          <span className="font-medium text-[#111827]">{a.title}</span>: {a.description}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ==================================================
            TAB 3: TEMPLATES SELECTION
            ================================================== */}
        {activeTab === 'templates' && (
          <div className="no-print space-y-6">
            <div className="bg-[#FFFFFF] dark:bg-[#181818] p-6 rounded-[12px] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs">
              <h2 className="text-[22px] font-bold text-[#111827] dark:text-[#FAFAFA]">Choose a Template</h2>
              <p className="text-[14px] text-[#4B5563] dark:text-[#A3A3A3] mt-1">Select from professionally designed, ATS-tested layouts.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { id: 'modern', name: 'Modern Tech', desc: 'Sleek, minimalist design tailored for software engineers and developers.' },
                { id: 'professional', name: 'Classic Professional', desc: 'Traditional corporate layout ideal for enterprise roles.' },
                { id: 'minimal', name: 'Minimalist Clean', desc: 'Clean white typography focused purely on content density.' },
                { id: 'corporate', name: 'Executive Corporate', desc: 'Structured format featuring clear section dividers.' },
                { id: 'student', name: 'Graduate & Student', desc: 'Optimized for campus placement candidates and freshers.' },
              ].map((tmpl) => {
                const isSelected = resumeData.template === tmpl.id;
                return (
                  <div
                    key={tmpl.id}
                    className={`bg-[#FFFFFF] dark:bg-[#181818] p-6 rounded-[12px] border transition-all duration-150 flex flex-col justify-between space-y-4 shadow-xs ${
                      isSelected
                        ? 'border-[#111827] dark:border-[#FAFAFA] ring-1 ring-[#111827] dark:ring-[#FAFAFA]'
                        : 'border-[#E5E7EB] dark:border-[#2A2A2A] hover:border-[#111827] dark:hover:border-[#FAFAFA]'
                    }`}
                  >
                    <div>
                      <div className="w-10 h-10 rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] flex items-center justify-center mb-3">
                        <Layout size={20} className="text-[#111827] dark:text-[#FAFAFA]" />
                      </div>
                      <h3 className="text-[18px] font-bold text-[#111827] dark:text-[#FAFAFA]">{tmpl.name}</h3>
                      <p className="text-[14px] text-[#4B5563] dark:text-[#A3A3A3] mt-1">{tmpl.desc}</p>
                    </div>

                    <button
                      onClick={() => {
                        setResumeData((prev) => ({ ...prev, template: tmpl.id as any }));
                        showToast(`Selected template: ${tmpl.name}`, 'info');
                      }}
                      className={`w-full py-2.5 rounded-[10px] text-[14px] font-medium transition-all duration-150 cursor-pointer ${
                        isSelected
                          ? 'bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111]'
                          : 'bg-[#FFFFFF] dark:bg-[#181818] border border-[#D1D5DB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA] hover:bg-[#F9FAFB] dark:hover:bg-[#232323]'
                      }`}
                    >
                      {isSelected ? 'Active Template' : 'Use Template'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ==================================================
            TAB 4: ATS STRENGTH REPORT
            ================================================== */}
        {activeTab === 'ats' && (
          <div className="no-print space-y-6">
            {/* Overview Score Header */}
            <div className="bg-[#FFFFFF] dark:bg-[#181818] p-6 rounded-[12px] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h2 className="text-[22px] font-bold text-[#111827] dark:text-[#FAFAFA]">
                    ATS Resume Compatibility Report
                  </h2>
                  <p className="text-[14px] text-[#4B5563] dark:text-[#A3A3A3] mt-1">
                    Evaluated against Industry Applicant Tracking Systems (ATS).
                  </p>
                </div>

                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <div className="text-[32px] font-extrabold text-[#111827] dark:text-[#FAFAFA]">
                      {atsResult ? atsResult.overall_score : 88}%
                    </div>
                    <div className="text-[12px] font-semibold text-[#6B7280] dark:text-[#A3A3A3]">Overall Score</div>
                  </div>
                  <div className="text-center border-l pl-6 border-[#E5E7EB] dark:border-[#2A2A2A]">
                    <div className="text-[24px] font-bold text-[#111827] dark:text-[#FAFAFA]">
                      {atsResult ? atsResult.grammar_score : 90}%
                    </div>
                    <div className="text-[12px] font-semibold text-[#6B7280] dark:text-[#A3A3A3]">Grammar</div>
                  </div>
                  <div className="text-center border-l pl-6 border-[#E5E7EB] dark:border-[#2A2A2A]">
                    <div className="text-[24px] font-bold text-[#111827] dark:text-[#FAFAFA]">
                      {atsResult ? atsResult.formatting_score : 92}%
                    </div>
                    <div className="text-[12px] font-semibold text-[#6B7280] dark:text-[#A3A3A3]">Formatting</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Suggestions & Keywords Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#FFFFFF] dark:bg-[#181818] p-6 rounded-[12px] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs space-y-4">
                <h3 className="font-bold text-[16px] text-[#111827] dark:text-[#FAFAFA] flex items-center space-x-2">
                  <Sparkles size={18} className="text-[#111827] dark:text-[#FAFAFA]" />
                  <span>Missing High-Impact Keywords</span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(atsResult?.missing_skills || ['Docker', 'CI/CD', 'GraphQL', 'System Design']).map((sk, i) => (
                    <span key={i} className="px-3 py-1 bg-[#F8FAFC] dark:bg-[#111111] text-[#111827] dark:text-[#FAFAFA] text-[14px] font-medium rounded-[8px] border border-[#E5E7EB] dark:border-[#2A2A2A]">
                      + {sk}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-[#FFFFFF] dark:bg-[#181818] p-6 rounded-[12px] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs space-y-4">
                <h3 className="font-bold text-[16px] text-[#111827] dark:text-[#FAFAFA] flex items-center space-x-2">
                  <CheckCircle2 size={18} className="text-[#111827] dark:text-[#FAFAFA]" />
                  <span>Actionable Improvements</span>
                </h3>
                <ul className="space-y-2 text-[14px] text-[#4B5563] dark:text-[#D4D4D4]">
                  {(atsResult?.suggestions || [
                    'Quantify achievements in project bullet points with metrics (e.g. 30% performance boost).',
                    'Highlight key programming languages at the top of skills.',
                    'Ensure GitHub links are valid and active.'
                  ]).map((sug, i) => (
                    <li key={i} className="flex items-start space-x-2">
                      <span className="text-[#111827] dark:text-[#FAFAFA] font-bold">•</span>
                      <span>{sug}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
