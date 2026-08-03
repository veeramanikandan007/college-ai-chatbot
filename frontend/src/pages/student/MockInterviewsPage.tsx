import React, { useState, useEffect, useCallback } from 'react';
import {
  Brain,
  Award,
  Sparkles,
  Plus,
  Search,
  Filter,
  BarChart3,
  CheckCircle2,
  Clock3,
  UserRound,
  FileText
} from 'lucide-react';
import {
  MockInterview,
  MockInterviewDashboardStats,
  InterviewEvaluation,
  getMockInterviews,
  getInterviewDashboardStats,
  deleteMockInterview,
  getMockInterviewDetails
} from '../../api/mockInterviews';
import { MockInterviewSetupModal } from '../../components/mockInterviews/MockInterviewSetupModal';
import { MockInterviewSessionView } from '../../components/mockInterviews/MockInterviewSessionView';
import { MockInterviewFeedbackModal } from '../../components/mockInterviews/MockInterviewFeedbackModal';
import { MockInterviewCard } from '../../components/mockInterviews/MockInterviewCard';
import { useToast } from '../../context/ToastContext';

export const MockInterviewsPage: React.FC = () => {
  const { showToast } = useToast();

  const [interviews, setInterviews] = useState<MockInterview[]>([]);
  const [stats, setStats] = useState<MockInterviewDashboardStats | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters state
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Active Session state
  const [activeSession, setActiveSession] = useState<MockInterview | null>(null);

  // Modals state
  const [isSetupOpen, setIsSetupOpen] = useState<boolean>(false);
  const [selectedEvaluation, setSelectedEvaluation] = useState<InterviewEvaluation | null>(null);

  const fetchDashboardAndHistory = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, listRes] = await Promise.all([
        getInterviewDashboardStats(),
        getMockInterviews({
          interview_type: typeFilter === 'All' ? undefined : typeFilter,
          search: searchQuery,
        }),
      ]);

      setStats(statsRes);
      setInterviews(listRes);
    } catch (err: any) {
      setError(err.message || 'Failed to load mock interviews');
    } finally {
      setLoading(false);
    }
  }, [typeFilter, searchQuery]);

  useEffect(() => {
    fetchDashboardAndHistory();
  }, [fetchDashboardAndHistory]);

  const handleStartSession = (session: MockInterview) => {
    setActiveSession(session);
  };

  const handleViewFeedback = async (interview: MockInterview) => {
    try {
      const details = await getMockInterviewDetails(interview.id);
      const evalObj: InterviewEvaluation = {
        interview_id: interview.id,
        overall_score: interview.overall_score,
        communication_score: interview.communication_score,
        confidence_score: interview.confidence_score,
        grammar_score: interview.grammar_score,
        technical_accuracy_score: interview.technical_accuracy_score,
        fluency_score: interview.fluency_score,
        professionalism_score: interview.professionalism_score,
        completeness_score: interview.completeness_score,
        feedback_summary: interview.feedback_summary || 'Interview session completed.',
        strengths: interview.strengths,
        weaknesses: interview.weaknesses,
        improvements: interview.improvements,
        qa_logs: details.qa_logs,
      };
      setSelectedEvaluation(evalObj);
    } catch (err: any) {
      showToast(err.message || 'Failed to load evaluation details', 'error');
    }
  };

  const handleDeleteInterview = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this interview history log?')) return;
    try {
      await deleteMockInterview(id);
      showToast('Interview log deleted successfully', 'info');
      fetchDashboardAndHistory();
    } catch (err: any) {
      showToast(err.message || 'Delete failed', 'error');
    }
  };

  // If in active session mode, show full-screen interview cockpit
  if (activeSession) {
    return (
      <div className="w-full h-full overflow-y-auto bg-[#FFFFFF] dark:bg-[#0A0A0A] p-4 md:p-8">
        <MockInterviewSessionView
          session={activeSession}
          onSessionComplete={(evalRes) => {
            setActiveSession(null);
            setSelectedEvaluation(evalRes);
            fetchDashboardAndHistory();
          }}
          onCancelSession={() => {
            setActiveSession(null);
            fetchDashboardAndHistory();
          }}
        />
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-y-auto bg-[#FFFFFF] dark:bg-[#0A0A0A] text-[#111827] dark:text-[#FAFAFA] p-4 md:p-8 transition-colors">
      <div className="w-full max-w-[1600px] mx-auto space-y-8">

        {/* ========================================================================= */}
        {/* 1. PAGE HEADER CARD                                                       */}
        {/* ========================================================================= */}
        <div className="bg-[#FFFFFF] dark:bg-[#181818] p-6 md:p-8 rounded-[12px] border border-[#D1D5DB] dark:border-[#3F3F46] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-[10px] bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] flex items-center justify-center shrink-0">
              <UserRound size={24} />
            </div>
            <div>
              <h1 className="text-[32px] font-bold text-[#111827] dark:text-[#FAFAFA] tracking-tight flex items-center gap-3">
                AI Mock Interviews
                <span className="text-[12px] font-medium px-2.5 py-0.5 rounded-[6px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA]">
                  Placement Preparation
                </span>
              </h1>
              <p className="text-[14px] text-[#6B7280] dark:text-[#A3A3A3] mt-1">
                Attend realistic AI HR, Technical, Coding, Aptitude & Group Discussion interviews with instant 7-metric evaluation and voice support.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsSetupOpen(true)}
            className="h-10 px-5 rounded-[10px] bg-[#111827] hover:bg-[#000000] dark:bg-[#FAFAFA] dark:hover:bg-[#E5E5E5] text-[#FFFFFF] dark:text-[#111111] font-medium text-[14px] shadow-xs transition flex items-center gap-2 cursor-pointer shrink-0"
          >
            <Sparkles size={16} />
            <span>Start Mock Interview</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* 2. DASHBOARD OVERVIEW CARDS                                               */}
        {/* ========================================================================= */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-6 rounded-[12px] bg-[#FFFFFF] dark:bg-[#181818] border border-[#D1D5DB] dark:border-[#3F3F46] shadow-xs flex items-center justify-between">
              <div>
                <p className="text-[14px] font-medium text-[#6B7280] dark:text-[#A3A3A3]">Total Interviews</p>
                <p className="text-[32px] font-bold text-[#111827] dark:text-[#FAFAFA] mt-1">{stats.total_interviews}</p>
              </div>
              <div className="w-10 h-10 rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA] flex items-center justify-center">
                <Brain size={20} />
              </div>
            </div>

            <div className="p-6 rounded-[12px] bg-[#FFFFFF] dark:bg-[#181818] border border-[#D1D5DB] dark:border-[#3F3F46] shadow-xs flex items-center justify-between">
              <div>
                <p className="text-[14px] font-medium text-[#6B7280] dark:text-[#A3A3A3]">Average Score</p>
                <p className="text-[32px] font-bold text-[#111827] dark:text-[#FAFAFA] mt-1">{stats.average_score}%</p>
              </div>
              <div className="w-10 h-10 rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA] flex items-center justify-center">
                <Award size={20} />
              </div>
            </div>

            <div className="p-6 rounded-[12px] bg-[#FFFFFF] dark:bg-[#181818] border border-[#D1D5DB] dark:border-[#3F3F46] shadow-xs flex items-center justify-between">
              <div>
                <p className="text-[14px] font-medium text-[#6B7280] dark:text-[#A3A3A3]">Best Score</p>
                <p className="text-[32px] font-bold text-[#111827] dark:text-[#FAFAFA] mt-1">{stats.best_score}%</p>
              </div>
              <div className="w-10 h-10 rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA] flex items-center justify-center">
                <Sparkles size={20} />
              </div>
            </div>

            <div className="p-6 rounded-[12px] bg-[#FFFFFF] dark:bg-[#181818] border border-[#D1D5DB] dark:border-[#3F3F46] shadow-xs flex items-center justify-between">
              <div>
                <p className="text-[14px] font-medium text-[#6B7280] dark:text-[#A3A3A3]">Completed Sessions</p>
                <p className="text-[32px] font-bold text-[#111827] dark:text-[#FAFAFA] mt-1">{stats.completed_count}</p>
              </div>
              <div className="w-10 h-10 rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA] flex items-center justify-center">
                <CheckCircle2 size={20} />
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 3. SEARCH & CATEGORY FILTER TOOLBAR                                       */}
        {/* ========================================================================= */}
        <div className="bg-[#FFFFFF] dark:bg-[#181818] p-4 rounded-[12px] border border-[#D1D5DB] dark:border-[#3F3F46] shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7280] dark:text-[#A3A3A3]" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search interview title, role, topics..."
              className="w-full h-10 pl-10 pr-4 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#181818] text-[14px] text-[#111827] dark:text-[#FAFAFA] outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center bg-[#F8FAFC] dark:bg-[#111111] p-1.5 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46]">
            {['All', 'HR', 'Technical', 'Coding', 'Aptitude', 'Group Discussion'].map((cat) => (
              <button
                key={cat}
                onClick={() => setTypeFilter(cat)}
                className={`h-9 px-3.5 text-[14px] font-medium rounded-[8px] transition-all cursor-pointer ${
                  typeFilter === cat
                    ? 'bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111]'
                    : 'text-[#4B5563] dark:text-[#A3A3A3] hover:bg-[#F9FAFB] dark:hover:bg-[#232323]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 4. INTERVIEW CARDS GRID                                                   */}
        {/* ========================================================================= */}
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center text-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#111827] dark:border-[#FAFAFA] border-t-transparent mb-4" />
            <p className="text-[14px] font-medium text-[#6B7280] dark:text-[#A3A3A3]">
              Loading mock interview sessions...
            </p>
          </div>
        ) : interviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {interviews.map((item) => (
              <MockInterviewCard
                key={item.id}
                interview={item}
                onViewFeedback={handleViewFeedback}
                onDelete={handleDeleteInterview}
              />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center bg-[#FFFFFF] dark:bg-[#181818] rounded-[12px] border border-[#D1D5DB] dark:border-[#3F3F46] p-8 shadow-xs space-y-3">
            <UserRound className="mx-auto text-[#6B7280] dark:text-[#A3A3A3] opacity-40" size={48} />
            <h3 className="text-[18px] font-bold text-[#111827] dark:text-[#FAFAFA]">
              No Interviews Yet
            </h3>
            <p className="text-[14px] text-[#6B7280] dark:text-[#A3A3A3] max-w-sm mx-auto">
              Start your first AI Mock Interview and improve your placement skills.
            </p>
            <button
              onClick={() => setIsSetupOpen(true)}
              className="mt-2 h-10 px-5 rounded-[10px] bg-[#111827] hover:bg-[#000000] dark:bg-[#FAFAFA] dark:hover:bg-[#E5E5E5] text-[#FFFFFF] dark:text-[#111111] font-medium text-[14px] shadow-xs cursor-pointer inline-flex items-center gap-2"
            >
              <Sparkles size={16} />
              <span>Start Mock Interview</span>
            </button>
          </div>
        )}

        {/* Modals */}
        <MockInterviewSetupModal
          isOpen={isSetupOpen}
          onClose={() => setIsSetupOpen(false)}
          onStartSession={handleStartSession}
        />

        <MockInterviewFeedbackModal
          isOpen={!!selectedEvaluation}
          onClose={() => setSelectedEvaluation(null)}
          evaluation={selectedEvaluation}
        />
      </div>
    </div>
  );
};

export default MockInterviewsPage;
