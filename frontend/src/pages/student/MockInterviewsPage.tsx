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
    <div className="w-full h-full overflow-x-hidden overflow-y-auto bg-[#FFFFFF] dark:bg-[#0A0A0A] text-[#111827] dark:text-[#FAFAFA] p-4 sm:p-6 md:p-8 transition-colors select-none">
      {/* 1440px Centered Max Content Width Container */}
      <div className="w-full max-w-[1440px] mx-auto space-y-6">

        {/* Compact Hero Header (Matching AI Study Planner layout) */}
        <div className="bg-[#FFFFFF] dark:bg-[#18181B] p-5 rounded-[16px] border border-[#D1D5DB] dark:border-[#3F3F46] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-[44px] h-[44px] rounded-[10px] bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] flex items-center justify-center shrink-0">
              <UserRound size={22} />
            </div>
            <div className="min-w-0">
              <h1 className="text-[30px] font-[700] text-[#111827] dark:text-[#FAFAFA] tracking-tight leading-tight truncate flex items-center gap-2">
                AI Mock Interviews
              </h1>
              <p className="text-[14px] font-[500] text-[#6B7280] dark:text-[#A1A1AA] mt-0.5 truncate">
                Realistic AI HR, Technical, Coding & Aptitude mock sessions with 7-metric voice evaluation.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {stats && (
              <div className="hidden xl:flex items-center gap-2">
                <span className="h-[36px] inline-flex items-center gap-1.5 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#F8FAFC] dark:bg-[#111111] px-3 text-[14px] font-[500] text-[#111827] dark:text-[#FAFAFA]">
                  <Award size={15} />
                  Avg Score: {stats.average_score}%
                </span>
                <span className="h-[36px] inline-flex items-center gap-1.5 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#F8FAFC] dark:bg-[#111111] px-3 text-[14px] font-[500] text-[#111827] dark:text-[#FAFAFA]">
                  <CheckCircle2 size={15} />
                  Completed: {stats.completed_count}
                </span>
              </div>
            )}

            <button
              onClick={() => setIsSetupOpen(true)}
              className="h-[40px] max-sm:h-[38px] px-[18px] rounded-[12px] bg-[#111827] hover:bg-[#1F2937] active:bg-[#0F172A] dark:bg-[#FAFAFA] dark:hover:bg-[#F3F4F6] text-[#FFFFFF] dark:text-[#111111] font-[700] text-[14px] transition flex items-center justify-center gap-2 cursor-pointer shrink-0 active:scale-[0.98]"
            >
              <Sparkles size={16} />
              <span>Start Mock Interview</span>
            </button>
          </div>
        </div>

        {/* Responsive Stat Cards Banner (Exact match to StudyAnalyticsBanner card structure) */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 select-none">
            <div className="h-[88px] p-3.5 sm:p-[16px] rounded-[16px] bg-[#FFFFFF] dark:bg-[#18181B] border border-[#D1D5DB] dark:border-[#3F3F46] shadow-xs flex items-center justify-between transition-all duration-150 ease-in-out hover:-translate-y-[2px] hover:shadow-md">
              <div className="min-w-0 flex-1 space-y-0.5">
                <p className="text-[12px] sm:text-[13px] font-[400] text-[#6B7280] dark:text-[#A1A1AA] truncate">Total Interviews</p>
                <p className="text-[26px] sm:text-[30px] font-[600] text-[#111827] dark:text-[#FAFAFA] leading-none truncate">
                  {stats.total_interviews}
                </p>
                <p className="text-[11px] sm:text-[13px] font-[400] text-[#6B7280] dark:text-[#A1A1AA] truncate pt-0.5">Practice sessions</p>
              </div>
              <div className="w-[34px] h-[34px] sm:w-[40px] sm:h-[40px] rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#D1D5DB] dark:border-[#3F3F46] text-[#111827] dark:text-[#FAFAFA] flex items-center justify-center shrink-0 ml-2 sm:ml-3">
                <Brain size={18} />
              </div>
            </div>

            <div className="h-[88px] p-3.5 sm:p-[16px] rounded-[16px] bg-[#FFFFFF] dark:bg-[#18181B] border border-[#D1D5DB] dark:border-[#3F3F46] shadow-xs flex items-center justify-between transition-all duration-150 ease-in-out hover:-translate-y-[2px] hover:shadow-md">
              <div className="min-w-0 flex-1 space-y-0.5">
                <p className="text-[12px] sm:text-[13px] font-[400] text-[#6B7280] dark:text-[#A1A1AA] truncate">Average Score</p>
                <p className="text-[26px] sm:text-[30px] font-[600] text-[#111827] dark:text-[#FAFAFA] leading-none truncate">
                  {stats.average_score}%
                </p>
                <div className="w-full max-w-[120px] sm:max-w-[140px] h-[4px] bg-[#F8FAFC] dark:bg-[#111111] rounded-full overflow-hidden border border-[#D1D5DB] dark:border-[#3F3F46] mt-1.5">
                  <div
                    className="h-full bg-[#111827] dark:bg-[#FAFAFA] rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(stats.average_score, 100)}%` }}
                  />
                </div>
              </div>
              <div className="w-[34px] h-[34px] sm:w-[40px] sm:h-[40px] rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#D1D5DB] dark:border-[#3F3F46] text-[#111827] dark:text-[#FAFAFA] flex items-center justify-center shrink-0 ml-2 sm:ml-3">
                <Award size={18} />
              </div>
            </div>

            <div className="h-[88px] p-3.5 sm:p-[16px] rounded-[16px] bg-[#FFFFFF] dark:bg-[#18181B] border border-[#D1D5DB] dark:border-[#3F3F46] shadow-xs flex items-center justify-between transition-all duration-150 ease-in-out hover:-translate-y-[2px] hover:shadow-md">
              <div className="min-w-0 flex-1 space-y-0.5">
                <p className="text-[12px] sm:text-[13px] font-[400] text-[#6B7280] dark:text-[#A1A1AA] truncate">Best Score</p>
                <p className="text-[26px] sm:text-[30px] font-[600] text-[#111827] dark:text-[#FAFAFA] leading-none truncate">
                  {stats.best_score}%
                </p>
                <p className="text-[11px] sm:text-[13px] font-[400] text-[#6B7280] dark:text-[#A1A1AA] truncate pt-0.5">Top performance</p>
              </div>
              <div className="w-[34px] h-[34px] sm:w-[40px] sm:h-[40px] rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#D1D5DB] dark:border-[#3F3F46] text-[#111827] dark:text-[#FAFAFA] flex items-center justify-center shrink-0 ml-2 sm:ml-3">
                <Sparkles size={18} />
              </div>
            </div>

            <div className="h-[88px] p-3.5 sm:p-[16px] rounded-[16px] bg-[#FFFFFF] dark:bg-[#18181B] border border-[#D1D5DB] dark:border-[#3F3F46] shadow-xs flex items-center justify-between transition-all duration-150 ease-in-out hover:-translate-y-[2px] hover:shadow-md">
              <div className="min-w-0 flex-1 space-y-0.5">
                <p className="text-[12px] sm:text-[13px] font-[400] text-[#6B7280] dark:text-[#A1A1AA] truncate">Completed</p>
                <p className="text-[26px] sm:text-[30px] font-[600] text-[#111827] dark:text-[#FAFAFA] leading-none truncate">
                  {stats.completed_count}
                </p>
                <p className="text-[11px] sm:text-[13px] font-[400] text-[#6B7280] dark:text-[#A1A1AA] truncate pt-0.5">Evaluated sessions</p>
              </div>
              <div className="w-[34px] h-[34px] sm:w-[40px] sm:h-[40px] rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#D1D5DB] dark:border-[#3F3F46] text-[#111827] dark:text-[#FAFAFA] flex items-center justify-center shrink-0 ml-2 sm:ml-3">
                <CheckCircle2 size={18} />
              </div>
            </div>
          </div>
        )}

        {/* Content Section Container (Matching StudyTasksList layout rhythm) */}
        <div className="bg-[#FFFFFF] dark:bg-[#18181B] p-6 rounded-[16px] border border-[#D1D5DB] dark:border-[#3F3F46] shadow-xs space-y-5 select-none">
          
          {/* Section Header */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 pb-4 border-b border-[#D1D5DB] dark:border-[#3F3F46]">
            <div className="flex items-center gap-3">
              <div className="w-[40px] h-[40px] rounded-[10px] bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] flex items-center justify-center shrink-0">
                <UserRound size={20} />
              </div>
              <div>
                <h3 className="text-[20px] font-[700] text-[#111827] dark:text-[#FAFAFA]">
                  Mock Interview Sessions
                </h3>
                <p className="text-[14px] font-[500] text-[#6B7280] dark:text-[#A1A1AA]">
                  Track history, launch AI interviews, and view comprehensive feedback evaluations
                </p>
              </div>
            </div>

            {/* Filter Pills Segmented Control */}
            <div className="flex items-center bg-[#F8FAFC] dark:bg-[#111111] p-1 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] h-[40px] overflow-x-auto snap-x no-scrollbar max-w-full">
              {['All', 'HR', 'Technical', 'Coding', 'Aptitude', 'Group Discussion'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setTypeFilter(cat)}
                  className={`h-[32px] px-3.5 rounded-[8px] text-[14px] font-[500] transition-all cursor-pointer snap-start shrink-0 whitespace-nowrap ${
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

          {/* Search Input Bar & Additional Filter Dropdowns */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7280] dark:text-[#A1A1AA]" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search interview title, target role, topics..."
                className="w-full h-[40px] pl-10 pr-4 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#18181B] text-[14px] font-[600] text-[#111827] dark:text-[#FAFAFA] outline-none"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              <span className="text-[13px] text-[#6B7280] dark:text-[#A1A1AA] font-[600] shrink-0">Difficulty:</span>
              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                className="h-[36px] px-3 rounded-[10px] text-[14px] font-[500] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#18181B] text-[#111827] dark:text-[#FAFAFA] outline-none cursor-pointer"
              >
                <option value="All">All Level</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>

              <span className="text-[13px] text-[#6B7280] dark:text-[#A1A1AA] font-[600] shrink-0 ml-2">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="h-[36px] px-3 rounded-[10px] text-[14px] font-[500] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#18181B] text-[#111827] dark:text-[#FAFAFA] outline-none cursor-pointer"
              >
                <option value="recent">Most Recent</option>
                <option value="score">Highest Score</option>
              </select>
            </div>
          </div>

          {/* Interview Cards Grid (2-column desktop/tablet grid as specified) */}
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center text-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#111827] dark:border-[#FAFAFA] border-t-transparent mb-3" />
              <p className="text-[14px] font-[600] text-[#6B7280] dark:text-[#A1A1AA]">
                Loading mock interview sessions...
              </p>
            </div>
          ) : interviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <div className="py-12 text-center bg-[#FFFFFF] dark:bg-[#18181B] rounded-[16px] border border-[#D1D5DB] dark:border-[#3F3F46] p-8 shadow-xs space-y-4 my-auto">
              <div className="w-[80px] h-[80px] rounded-[16px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#D1D5DB] dark:border-[#3F3F46] flex items-center justify-center mx-auto text-[#111827] dark:text-[#FAFAFA]">
                <UserRound size={36} />
              </div>
              <div>
                <h3 className="text-[20px] font-[700] text-[#111827] dark:text-[#FAFAFA]">
                  No Interviews Yet
                </h3>
                <p className="text-[14px] font-[500] text-[#6B7280] dark:text-[#A1A1AA] max-w-sm mx-auto mt-1">
                  Start your first AI Mock Interview and boost your placement readiness.
                </p>
              </div>
              <button
                onClick={() => setIsSetupOpen(true)}
                className="h-[40px] px-5 rounded-[12px] bg-[#111827] hover:bg-[#1F2937] dark:bg-[#FAFAFA] dark:hover:bg-[#F3F4F6] text-[#FFFFFF] dark:text-[#111827] text-[14px] font-[500] transition flex items-center justify-center gap-2 cursor-pointer mx-auto active:scale-[0.98]"
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
