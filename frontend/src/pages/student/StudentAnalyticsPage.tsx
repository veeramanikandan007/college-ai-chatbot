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
  { id: 'overview', label: 'Overview', icon: <BarChart3 size={16} /> },
  { id: 'charts', label: 'Charts', icon: <TrendingUp size={16} /> },
  { id: 'insights', label: 'AI Insights', icon: <Brain size={16} /> },
  { id: 'goals', label: 'Goals', icon: <Target size={16} /> },
  { id: 'streaks', label: 'Streaks', icon: <Activity size={16} /> },
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
      // Fail silently
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

  // Export handlers
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
    <div className="w-full h-full overflow-y-auto bg-[#FFFFFF] dark:bg-[#0A0A0A] text-[#111827] dark:text-[#FAFAFA] p-4 md:p-8 transition-colors">
      <div className="w-full max-w-[1600px] mx-auto space-y-8">

        {/* ========================================================================= */}
        {/* 1. PAGE HEADER CARD                                                       */}
        {/* ========================================================================= */}
        <div className="bg-[#FFFFFF] dark:bg-[#181818] p-6 md:p-8 rounded-[12px] border border-[#D1D5DB] dark:border-[#3F3F46] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-[10px] bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] flex items-center justify-center shrink-0">
              <BarChart3 size={24} />
            </div>
            <div>
              <h1 className="text-[32px] font-bold text-[#111827] dark:text-[#FAFAFA] tracking-tight flex items-center gap-3">
                AI Analytics Dashboard
                <span className="text-[12px] font-medium px-2.5 py-0.5 rounded-[6px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA]">
                  Live Telemetry
                </span>
              </h1>
              <p className="text-[14px] text-[#6B7280] dark:text-[#A3A3A3] mt-1">
                Personal performance analytics across all modules. Real-time cross-module data.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 sm:w-64">
              <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7280] dark:text-[#A3A3A3]" />
              <input
                type="text"
                placeholder="Search insights, goals, subjects..."
                className="w-full h-10 pl-10 pr-8 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#181818] text-[14px] text-[#111827] dark:text-[#FAFAFA] outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6B7280] dark:text-[#A3A3A3] hover:text-[#111827] dark:hover:text-[#FAFAFA] cursor-pointer"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Export buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportCSV}
                disabled={exporting}
                className="h-10 px-4 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#181818] text-[#111827] dark:text-[#FAFAFA] text-[14px] font-medium hover:bg-[#F9FAFB] dark:hover:bg-[#232323] transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                title="Export as CSV"
              >
                <Download size={14} />
                <span>CSV</span>
              </button>
              <button
                onClick={handleExportJSON}
                disabled={exporting}
                className="h-10 px-5 rounded-[10px] bg-[#111827] hover:bg-[#000000] dark:bg-[#FAFAFA] dark:hover:bg-[#E5E5E5] text-[#FFFFFF] dark:text-[#111111] font-medium text-[14px] shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                title="Export as JSON"
              >
                <Download size={14} />
                <span>{exporting ? 'Exporting...' : 'Export'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. TAB NAVIGATION TOOLBAR                                                 */}
        {/* ========================================================================= */}
        <div className="bg-[#FFFFFF] dark:bg-[#181818] p-4 rounded-[12px] border border-[#D1D5DB] dark:border-[#3F3F46] shadow-xs flex items-center justify-between gap-4">
          <div className="flex items-center bg-[#F8FAFC] dark:bg-[#111111] p-1.5 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46]">
            {TAB_ITEMS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`h-9 px-4 text-[14px] font-medium rounded-[8px] transition-all cursor-pointer flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111]'
                    : 'text-[#4B5563] dark:text-[#A3A3A3] hover:bg-[#F9FAFB] dark:hover:bg-[#232323]'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              fetchOverview();
              fetchCharts();
              fetchStreaks();
              fetchGoals();
              fetchInsights(true);
            }}
            className="h-9 w-9 rounded-[8px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#181818] text-[#111827] dark:text-[#FAFAFA] hover:bg-[#F9FAFB] dark:hover:bg-[#232323] flex items-center justify-center cursor-pointer"
            title="Refresh all data"
          >
            <RefreshCw size={16} className={loadingOverview ? 'animate-spin' : ''} />
          </button>
        </div>

        {/* ========================================================================= */}
        {/* 3. TAB PANELS                                                             */}
        {/* ========================================================================= */}
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

        {/* Overview Tab Sub-Widgets */}
        {activeTab === 'overview' && !loadingOverview && overview && (
          <div className="space-y-8">
            <AiInsightsFeed
              insights={filteredInsights.slice(0, 4)}
              loading={loadingInsights}
              onRefresh={() => fetchInsights(true)}
            />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
    </div>
  );
};

export default StudentAnalyticsPage;
