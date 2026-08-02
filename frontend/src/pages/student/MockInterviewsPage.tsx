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
      <div className="flex-1 overflow-y-auto bg-slate-50/50 dark:bg-slate-950 p-4 sm:p-6 md:p-8">
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
    <div className="flex-1 overflow-y-auto bg-slate-50/50 dark:bg-slate-950 p-4 sm:p-6 md:p-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white dark:bg-[#1E293B] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-[#0E2A6D] text-white dark:bg-[#60A5FA] dark:text-slate-950 shadow-xs">
              <Brain size={22} />
            </div>
            <h1 className="text-2xl font-bold font-heading text-slate-900 dark:text-white">
              AI Mock Interviews
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Attend realistic AI HR, Technical, Coding, Aptitude & Group Discussion interviews with instant 7-metric evaluation and voice support.
          </p>
        </div>

        {/* Start Interview Button */}
        <button
          onClick={() => setIsSetupOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0E2A6D] text-white text-xs font-bold hover:bg-[#0E2A6D]/90 transition-all shadow-xs"
        >
          <Sparkles size={16} />
          <span>Start New Interview</span>
        </button>
      </div>

      {/* Dashboard Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Interviews */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Total Interviews</span>
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <Brain size={18} />
              </div>
            </div>
            <p className="text-2xl font-bold font-heading text-slate-900 dark:text-white">
              {stats.total_interviews}
            </p>
          </div>

          {/* Average Score */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Average Score</span>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Award size={18} />
              </div>
            </div>
            <p className="text-2xl font-bold font-heading text-slate-900 dark:text-white">
              {stats.average_score}%
            </p>
          </div>

          {/* Best Score */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Best Score</span>
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                <Sparkles size={18} />
              </div>
            </div>
            <p className="text-2xl font-bold font-heading text-slate-900 dark:text-white">
              {stats.best_score}%
            </p>
          </div>

          {/* Completed Sessions */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Completed Sessions</span>
              <div className="p-2 rounded-xl bg-[#D9A441]/10 text-[#D9A441]">
                <CheckCircle2 size={18} />
              </div>
            </div>
            <p className="text-2xl font-bold font-heading text-slate-900 dark:text-white">
              {stats.completed_count}
            </p>
          </div>
        </div>
      )}

      {/* Search & Category Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-[#1E293B] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search interview title, role, topics..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#0E2A6D] dark:focus:ring-[#60A5FA]"
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl">
          {['All', 'HR', 'Technical', 'Coding', 'Aptitude', 'Group Discussion'].map((cat) => (
            <button
              key={cat}
              onClick={() => setTypeFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                typeFilter === cat
                  ? 'bg-white dark:bg-[#1E293B] text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Interview Cards Grid */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 text-xs">
          Loading interview history...
        </div>
      ) : interviews.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
        <div className="py-16 text-center text-slate-400 text-xs">
          No mock interview sessions match the current search or category filter.
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
  );
};

export default MockInterviewsPage;
