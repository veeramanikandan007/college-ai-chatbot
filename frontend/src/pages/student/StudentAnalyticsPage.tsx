import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart3,
  Search,
  Filter,
  Download,
  RefreshCw,
  Brain,
  Target,
  Activity,
  CalendarDays,
  TrendingUp,
  X,
} from 'lucide-react';
import {
  getAnalyticsOverview,
  getAiInsights,
  getAnalyticsCharts,
  getStreaks,
  getGoals,
  exportAnalytics,
  type AnalyticsOverview,
  type AiInsightItem,
  type AnalyticsChartsData,
  type StreakData,
  type GoalResponse,
} from '../../api/studentAnalytics';
import { AnalyticsOverviewCards } from '../../components/analytics/AnalyticsOverviewCards';
import { AiInsightsFeed } from '../../components/analytics/AiInsightsFeed';
import { AnalyticsChartsGrid } from '../../components/analytics/AnalyticsChartsGrid';
import { GoalsTrackerWidget } from '../../components/analytics/GoalsTrackerWidget';
import { StreaksTrackerWidget } from '../../components/analytics/StreaksTrackerWidget';
import { useToast } from '../../context/ToastContext';

type ActiveTab = 'overview' | 'charts' | 'goals' | 'streaks' | 'insights';

const TAB_ITEMS: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
  { id: 'overview', label: 'Overview', icon: <BarChart3 size={15} /> },
  { id: 'charts', label: 'Charts', icon: <TrendingUp size={15} /> },
  { id: 'insights', label: 'AI Insights', icon: <Brain size={15} /> },
  { id: 'goals', label: 'Goals', icon: <Target size={15} /> },
  { id: 'streaks', label: 'Streaks', icon: <Activity size={15} /> },
];

export const StudentAnalyticsPage: React.FC = () => {
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [searchQuery, setSearchQuery] = useState('');

  // Data states
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [insights, setInsights] = useState<AiInsightItem[]>([]);
  const [charts, setCharts] = useState<AnalyticsChartsData | null>(null);
  const [streaks, setStreaks] = useState<StreakData | null>(null);
  const [goals, setGoals] = useState<GoalResponse[]>([]);

  // Loading states
  const [loadingOverview, setLoadingOverview] = useState(true);
  const [loadingInsights, setLoadingInsights] = useState(true);
  const [loadingCharts, setLoadingCharts] = useState(true);
  const [loadingStreaks, setLoadingStreaks] = useState(true);
  const [loadingGoals, setLoadingGoals] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [refreshingInsights, setRefreshingInsights] = useState(false);

  const fetchOverview = useCallback(async () => {
    setLoadingOverview(true);
    try {
      const data = await getAnalyticsOverview();
      setOverview(data);
    } catch (err: any) {
      showToast('Failed to load analytics overview.', 'error');
    } finally {
      setLoadingOverview(false);
    }
  }, []);

  const fetchInsights = useCallback(async (silent = false) => {
    if (!silent) setLoadingInsights(true);
    else setRefreshingInsights(true);
    try {
      const data = await getAiInsights();
      setInsights(data.insights);
    } catch {
      // Fail silently — insights are best-effort
    } finally {
      setLoadingInsights(false);
      setRefreshingInsights(false);
    }
  }, []);

  const fetchCharts = useCallback(async () => {
    setLoadingCharts(true);
    try {
      const data = await getAnalyticsCharts();
      setCharts(data);
    } catch {
      showToast('Failed to load chart data.', 'error');
    } finally {
      setLoadingCharts(false);
    }
  }, []);

  const fetchStreaks = useCallback(async () => {
    setLoadingStreaks(true);
    try {
      const data = await getStreaks();
      setStreaks(data);
    } catch {
      // fail silently
    } finally {
      setLoadingStreaks(false);
    }
  }, []);

  const fetchGoals = useCallback(async () => {
    setLoadingGoals(true);
    try {
      const data = await getGoals();
      setGoals(data);
    } catch {
      showToast('Failed to load goals.', 'error');
    } finally {
      setLoadingGoals(false);
    }
  }, []);

  useEffect(() => {
    fetchOverview();
    fetchInsights();
    fetchCharts();
    fetchStreaks();
    fetchGoals();
  }, [fetchOverview, fetchInsights, fetchCharts, fetchStreaks, fetchGoals]);

  // ── Export handlers ────────────────────────────────────────────────────────

  const handleExportJSON = async () => {
    setExporting(true);
    try {
      const payload = await exportAnalytics();
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Analytics exported successfully.', 'success');
    } catch {
      showToast('Export failed. Please try again.', 'error');
    } finally {
      setExporting(false);
    }
  };

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const payload = await exportAnalytics();
      const ov = payload.overview;
      const rows = [
        ['Metric', 'Value'],
        ['Study Hours (Week)', ov.study_hours_week],
        ['Study Hours (Month)', ov.study_hours_month],
        ['Attendance %', ov.attendance_percentage],
        ['Quiz Average %', ov.quiz_average],
        ['Assignments Completed', ov.assignments_completed],
        ['Assignments Total', ov.assignments_total],
        ['Interview Score %', ov.interview_score],
        ['Documents Uploaded', ov.documents_uploaded],
        ['Papers Solved', ov.question_papers_solved],
        ['Placement Readiness %', ov.placement_readiness],
        ['Weekly Progress %', ov.weekly_progress],
        ['Monthly Progress %', ov.monthly_progress],
        [],
        ['Goal', 'Category', 'Progress %', 'Status', 'Deadline'],
        ...payload.goals.map((g) => [g.title, g.category, g.progress_percentage, g.status, g.deadline || '-']),
        [],
        ['Streak Type', 'Days'],
        ['Daily Study', payload.streaks.daily_study_streak],
        ['Quiz', payload.streaks.quiz_streak],
        ['Attendance', payload.streaks.attendance_streak],
        ['Assignment', payload.streaks.assignment_streak],
      ];

      const csv = rows.map((r) => r.join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Analytics exported to CSV.', 'success');
    } catch {
      showToast('Export failed. Please try again.', 'error');
    } finally {
      setExporting(false);
    }
  };

  // ── Search filter logic ────────────────────────────────────────────────────

  const filteredInsights = searchQuery
    ? insights.filter(
        (i) =>
          i.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          i.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (i.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
      )
    : insights;

  const filteredGoals = searchQuery
    ? goals.filter(
        (g) =>
          g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          g.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          g.target_metric.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : goals;

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50/50 dark:bg-slate-950 p-4 sm:p-6 md:p-8 space-y-6">
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white dark:bg-[#1E293B] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#0E2A6D] to-[#1E4DB7] text-white shadow-sm">
              <BarChart3 size={22} />
            </div>
            <h1 className="text-2xl font-bold font-heading text-slate-900 dark:text-white">
              AI Analytics Dashboard
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Personal performance analytics across all modules. Real-time cross-module data.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search insights, goals, subjects..."
              className="input-standard pl-9 h-9 w-full sm:w-64 text-xs"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Export buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              disabled={exporting}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all disabled:opacity-60"
              title="Export as CSV"
            >
              <Download size={14} />
              CSV
            </button>
            <button
              onClick={handleExportJSON}
              disabled={exporting}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#0E2A6D] dark:bg-[#1E4DB7] text-white text-xs font-bold hover:bg-[#153B8A] transition-all shadow-sm disabled:opacity-60"
              title="Export as PDF/JSON"
            >
              <Download size={14} />
              {exporting ? 'Exporting...' : 'Export'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Tab Navigation ────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
        {TAB_ITEMS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === tab.id
                ? 'bg-[#0E2A6D] text-white dark:bg-[#60A5FA] dark:text-slate-950 shadow-sm'
                : 'bg-white dark:bg-[#1E293B] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-slate-300'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}

        <div className="ml-auto flex-shrink-0">
          <button
            onClick={() => {
              fetchOverview();
              fetchCharts();
              fetchStreaks();
              fetchGoals();
              fetchInsights(true);
            }}
            className="btn-icon hover:bg-white dark:hover:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-xl"
            title="Refresh all data"
          >
            <RefreshCw size={15} className={loadingOverview ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* ── Tab Panels ────────────────────────────────────────────────────── */}

      {activeTab === 'overview' && (
        <AnalyticsOverviewCards overview={overview} loading={loadingOverview} />
      )}

      {activeTab === 'charts' && (
        <AnalyticsChartsGrid charts={charts} loading={loadingCharts} />
      )}

      {activeTab === 'insights' && (
        <AiInsightsFeed
          insights={filteredInsights}
          loading={loadingInsights}
          onRefresh={() => fetchInsights(true)}
        />
      )}

      {activeTab === 'goals' && (
        <GoalsTrackerWidget
          goals={filteredGoals}
          loading={loadingGoals}
          onRefresh={fetchGoals}
        />
      )}

      {activeTab === 'streaks' && (
        <StreaksTrackerWidget streaks={streaks} loading={loadingStreaks} />
      )}

      {/* ── When on overview tab: show quick-access widgets below ───────── */}
      {activeTab === 'overview' && !loadingOverview && overview && (
        <div className="space-y-6">
          <AiInsightsFeed
            insights={filteredInsights.slice(0, 4)}
            loading={loadingInsights}
            onRefresh={() => fetchInsights(true)}
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <StreaksTrackerWidget streaks={streaks} loading={loadingStreaks} />
            <GoalsTrackerWidget
              goals={filteredGoals.slice(0, 4)}
              loading={loadingGoals}
              onRefresh={fetchGoals}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentAnalyticsPage;
