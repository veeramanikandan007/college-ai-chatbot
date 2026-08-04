import React, { useState, useEffect, useCallback } from 'react';
import {
  Brain,
  Award,
  Sparkles,
  Search,
  CheckCircle2,
  UserRound,
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
  const [difficultyFilter, setDifficultyFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'recent' | 'score'>('recent');
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

      // Apply client-side difficulty filtering & sorting
      let filtered = [...listRes];
      if (difficultyFilter !== 'All') {
        filtered = filtered.filter(
          (item) => item.difficulty.toLowerCase() === difficultyFilter.toLowerCase()
        );
      }

      if (sortBy === 'score') {
        filtered.sort((a, b) => (b.overall_score || 0) - (a.overall_score || 0));
      } else {
        filtered.sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      }

      setInterviews(filtered);
    } catch (err: any) {
      setError(err.message || 'Failed to load mock interviews');
    } finally {
      setLoading(false);
    }
  }, [typeFilter, searchQuery, difficultyFilter, sortBy]);

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
    <div className="w-full h-full overflow-x-hidden overflow-y-auto bg-[#F8FAFC] dark:bg-[#0A0A0A] text-[#111827] dark:text-[#FAFAFA] p-4 sm:p-6 lg:p-8 transition-colors select-none font-sans">
      {/* 1440px Centered Container with 32px (space-y-8) Section Gap */}
      <div className="w-full max-w-[1440px] mx-auto space-y-8">

        {/* Page Hero Header */}
        <div className="bg-[#FFFFFF] dark:bg-[#18181B] p-6 rounded-[16px] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-12 h-12 rounded-[12px] bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] flex items-center justify-center shrink-0">
              <UserRound size={24} />
            </div>
            <div className="min-w-0 space-y-1">
              <h1 className="text-[30px] font-semibold text-[#111827] dark:text-[#FAFAFA] tracking-tight leading-tight truncate">
                AI Mock Interviews
              </h1>
              <p className="text-[14px] font-normal text-[#6B7280] dark:text-[#A1A1AA] truncate">
                Realistic AI HR, Technical, Coding & Aptitude mock sessions with 7-metric voice evaluation.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {stats && (
              <div className="hidden xl:flex items-center gap-2">
                <span className="h-[40px] inline-flex items-center gap-2 rounded-[10px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#F8FAFC] dark:bg-[#111111] px-3.5 text-[14px] font-medium text-[#111827] dark:text-[#FAFAFA]">
                  <Award size={16} />
                  Avg Score: {stats.average_score}%
                </span>
                <span className="h-[40px] inline-flex items-center gap-2 rounded-[10px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#F8FAFC] dark:bg-[#111111] px-3.5 text-[14px] font-medium text-[#111827] dark:text-[#FAFAFA]">
                  <CheckCircle2 size={16} />
                  Completed: {stats.completed_count}
                </span>
              </div>
            )}

            <button
              onClick={() => setIsSetupOpen(true)}
              className="h-[40px] px-5 rounded-[10px] bg-[#111827] hover:bg-[#1F2937] dark:bg-[#FAFAFA] dark:hover:bg-[#E5E5E5] text-[#FFFFFF] dark:text-[#111111] font-medium text-[14px] transition flex items-center justify-center gap-2 cursor-pointer shrink-0 w-full sm:w-auto"
            >
              <Sparkles size={16} />
              <span>Start Mock Interview</span>
            </button>
          </div>
        </div>

        {/* 4 Statistics Cards Grid (2x2 Mobile, 4-Col Desktop, 24px Gap) */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-[16px] bg-[#FFFFFF] dark:bg-[#18181B] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs flex items-center justify-between">
              <div className="min-w-0 flex-1 space-y-1">
                <p className="text-[14px] font-normal text-[#6B7280] dark:text-[#A1A1AA] truncate">Total Interviews</p>
                <p className="text-[28px] font-semibold text-[#111827] dark:text-[#FAFAFA] leading-tight truncate">
                  {stats.total_interviews}
                </p>
                <p className="text-[12px] font-normal text-[#6B7280] dark:text-[#A1A1AA] truncate">Practice sessions</p>
              </div>
              <div className="w-10 h-10 rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA] flex items-center justify-center shrink-0 ml-3">
                <Brain size={20} />
              </div>
            </div>

            <div className="p-6 rounded-[16px] bg-[#FFFFFF] dark:bg-[#18181B] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs flex items-center justify-between">
              <div className="min-w-0 flex-1 space-y-1">
                <p className="text-[14px] font-normal text-[#6B7280] dark:text-[#A1A1AA] truncate">Average Score</p>
                <p className="text-[28px] font-semibold text-[#111827] dark:text-[#FAFAFA] leading-tight truncate">
                  {stats.average_score}%
                </p>
                <div className="w-full max-w-[120px] h-1 bg-[#F8FAFC] dark:bg-[#111111] rounded-full overflow-hidden border border-[#E5E7EB] dark:border-[#2A2A2A] mt-1.5">
                  <div
                    className="h-full bg-[#111827] dark:bg-[#FAFAFA] rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(stats.average_score, 100)}%` }}
                  />
                </div>
              </div>
              <div className="w-10 h-10 rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA] flex items-center justify-center shrink-0 ml-3">
                <Award size={20} />
              </div>
            </div>

            <div className="p-6 rounded-[16px] bg-[#FFFFFF] dark:bg-[#18181B] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs flex items-center justify-between">
              <div className="min-w-0 flex-1 space-y-1">
                <p className="text-[14px] font-normal text-[#6B7280] dark:text-[#A1A1AA] truncate">Best Score</p>
                <p className="text-[28px] font-semibold text-[#111827] dark:text-[#FAFAFA] leading-tight truncate">
                  {stats.best_score}%
                </p>
                <p className="text-[12px] font-normal text-[#6B7280] dark:text-[#A1A1AA] truncate">Top performance</p>
              </div>
              <div className="w-10 h-10 rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA] flex items-center justify-center shrink-0 ml-3">
                <Sparkles size={20} />
              </div>
            </div>

            <div className="p-6 rounded-[16px] bg-[#FFFFFF] dark:bg-[#18181B] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs flex items-center justify-between">
              <div className="min-w-0 flex-1 space-y-1">
                <p className="text-[14px] font-normal text-[#6B7280] dark:text-[#A1A1AA] truncate">Completed</p>
                <p className="text-[28px] font-semibold text-[#111827] dark:text-[#FAFAFA] leading-tight truncate">
                  {stats.completed_count}
                </p>
                <p className="text-[12px] font-normal text-[#6B7280] dark:text-[#A1A1AA] truncate">Evaluated sessions</p>
              </div>
              <div className="w-10 h-10 rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA] flex items-center justify-center shrink-0 ml-3">
                <CheckCircle2 size={20} />
              </div>
            </div>
          </div>
        )}

        {/* Main Content Card Container */}
        <div className="bg-[#FFFFFF] dark:bg-[#18181B] p-6 rounded-[16px] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs space-y-6 select-none">
          
          {/* Section Title & Filter Tabs */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6 pb-6 border-b border-[#E5E7EB] dark:border-[#2A2A2A]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[10px] bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] flex items-center justify-center shrink-0">
                <UserRound size={20} />
              </div>
              <div>
                <h2 className="text-[20px] font-semibold text-[#111827] dark:text-[#FAFAFA]">
                  Mock Interview Sessions
                </h2>
                <p className="text-[14px] font-normal text-[#6B7280] dark:text-[#A1A1AA]">
                  Track history, launch AI interviews, and view comprehensive feedback evaluations
                </p>
              </div>
            </div>

            {/* Filter Pills Segmented Control (Scrollable on Mobile) */}
            <div className="flex items-center bg-[#F8FAFC] dark:bg-[#111111] p-1.5 rounded-[12px] border border-[#E5E7EB] dark:border-[#2A2A2A] h-[44px] overflow-x-auto no-scrollbar w-full lg:w-auto">
              {['All', 'HR', 'Technical', 'Coding', 'Aptitude', 'Group Discussion'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setTypeFilter(cat)}
                  className={`h-[36px] px-4 rounded-[8px] text-[14px] font-medium transition cursor-pointer shrink-0 whitespace-nowrap ${
                    typeFilter === cat
                      ? 'bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111]'
                      : 'text-[#6B7280] dark:text-[#A1A1AA] hover:bg-[#FFFFFF] dark:hover:bg-[#18181B]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Search Input Bar & Additional Filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7280] dark:text-[#A1A1AA]" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search interview title, target role, topics..."
                className="w-full h-[40px] pl-10 pr-4 rounded-[10px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#FFFFFF] dark:bg-[#18181B] text-[14px] font-normal text-[#111827] dark:text-[#FAFAFA] outline-none"
              />
            </div>

            <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">
              <span className="text-[13px] text-[#6B7280] dark:text-[#A1A1AA] font-medium shrink-0">Difficulty:</span>
              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                className="h-[40px] px-3.5 rounded-[10px] text-[14px] font-medium border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#FFFFFF] dark:bg-[#18181B] text-[#111827] dark:text-[#FAFAFA] outline-none cursor-pointer"
              >
                <option value="All">All Levels</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>

              <span className="text-[13px] text-[#6B7280] dark:text-[#A1A1AA] font-medium shrink-0 ml-2">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="h-[40px] px-3.5 rounded-[10px] text-[14px] font-medium border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#FFFFFF] dark:bg-[#18181B] text-[#111827] dark:text-[#FAFAFA] outline-none cursor-pointer"
              >
                <option value="recent">Most Recent</option>
                <option value="score">Highest Score</option>
              </select>
            </div>
          </div>

          {/* Interview Cards Grid (2 Columns Tablet/Desktop, 1 Column Mobile, 24px Gap) */}
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center text-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#111827] dark:border-[#FAFAFA] border-t-transparent mb-3" />
              <p className="text-[14px] font-normal text-[#6B7280] dark:text-[#A1A1AA]">
                Loading mock interview sessions...
              </p>
            </div>
          ) : interviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            <div className="py-12 text-center bg-[#FFFFFF] dark:bg-[#18181B] rounded-[16px] border border-[#E5E7EB] dark:border-[#2A2A2A] p-8 shadow-xs space-y-4 my-auto">
              <div className="w-16 h-16 rounded-[16px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] flex items-center justify-center mx-auto text-[#111827] dark:text-[#FAFAFA]">
                <UserRound size={32} />
              </div>
              <div>
                <h3 className="text-[20px] font-semibold text-[#111827] dark:text-[#FAFAFA]">
                  No Interviews Yet
                </h3>
                <p className="text-[14px] font-normal text-[#6B7280] dark:text-[#A1A1AA] max-w-sm mx-auto mt-1">
                  Start your first AI Mock Interview and boost your placement readiness.
                </p>
              </div>
              <button
                onClick={() => setIsSetupOpen(true)}
                className="h-[40px] px-5 rounded-[10px] bg-[#111827] hover:bg-[#1F2937] dark:bg-[#FAFAFA] dark:hover:bg-[#E5E5E5] text-[#FFFFFF] dark:text-[#111111] text-[14px] font-medium transition flex items-center justify-center gap-2 cursor-pointer mx-auto"
              >
                <Sparkles size={16} />
                <span>Start Mock Interview</span>
              </button>
            </div>
          )}
        </div>

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
