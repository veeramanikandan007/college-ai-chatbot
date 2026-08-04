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
    <div className="w-full h-full overflow-x-hidden overflow-y-auto bg-[#F8FAFC] dark:bg-[#0A0A0A] text-[#111827] dark:text-[#FAFAFA] p-4 sm:p-6 lg:p-8 transition-colors select-none font-sans">
      {/* 1440px Centered Max Content Width Container */}
      <div className="w-full max-w-[1440px] mx-auto space-y-8">

        {/* Page Hero Header */}
        <div className="bg-[#FFFFFF] dark:bg-[#18181B] p-6 rounded-[16px] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-12 h-12 rounded-[12px] bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] flex items-center justify-center shrink-0">
              <BarChart3 size={24} />
            </div>
            <div className="min-w-0 space-y-1">
              <h1 className="text-[30px] font-semibold text-[#111827] dark:text-[#FAFAFA] tracking-tight leading-tight truncate">
                AI Analytics Dashboard
              </h1>
              <p className="text-[15px] font-normal text-[#6B7280] dark:text-[#A1A1AA] truncate">
                Cross-module performance telemetry, placement readiness & AI risk predictions.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 w-full sm:w-auto">
            {overview && (
              <div className="hidden xl:flex items-center gap-2">
                <span className="h-[36px] inline-flex items-center gap-1.5 rounded-[10px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#F8FAFC] dark:bg-[#111111] px-3 text-[14px] font-medium text-[#111827] dark:text-[#FAFAFA]">
                  <TrendingUp size={15} />
                  Attendance: {overview.attendance_percentage}%
                </span>
                <span className="h-[36px] inline-flex items-center gap-1.5 rounded-[10px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#F8FAFC] dark:bg-[#111111] px-3 text-[14px] font-medium text-[#111827] dark:text-[#FAFAFA]">
                  <Brain size={15} />
                  Quiz Avg: {overview.quiz_average}%
                </span>
              </div>
            )}

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                onClick={handleExportCSV}
                disabled={exporting}
                className="h-[40px] px-4 rounded-[10px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#FFFFFF] dark:bg-[#18181B] text-[#111827] dark:text-[#FAFAFA] text-[14px] font-medium hover:bg-[#F8FAFC] dark:hover:bg-[#232323] transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                title="Export as CSV"
              >
                <Download size={16} />
                <span>CSV</span>
              </button>
              <button
                onClick={handleExportJSON}
                disabled={exporting}
                className="h-[40px] px-5 rounded-[10px] bg-[#111827] hover:bg-[#1F2937] dark:bg-[#FAFAFA] dark:hover:bg-[#E5E5E5] text-[#FFFFFF] dark:text-[#111111] font-medium text-[14px] transition flex items-center justify-center gap-2 cursor-pointer shrink-0 disabled:opacity-50"
                title="Export as JSON"
              >
                <Download size={16} />
                <span>{exporting ? 'Exporting...' : 'Export JSON'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* View Switcher & Filters Toolbar */}
        <div className="bg-[#FFFFFF] dark:bg-[#18181B] p-6 rounded-[16px] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4 select-none">
          <div className="flex items-center bg-[#F8FAFC] dark:bg-[#111111] p-1.5 rounded-[12px] border border-[#E5E7EB] dark:border-[#2A2A2A] overflow-x-auto no-scrollbar">
            {TAB_ITEMS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`h-[36px] px-4 rounded-[8px] text-[14px] font-medium transition flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111]'
                    : 'text-[#6B7280] dark:text-[#A1A1AA] hover:bg-[#FFFFFF] dark:hover:bg-[#18181B]'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 sm:gap-3 w-full lg:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 lg:w-64">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7280] dark:text-[#A1A1AA]" />
              <input
                type="text"
                placeholder="Search insights, goals..."
                className="w-full h-[38px] sm:h-[40px] pl-9 pr-8 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#18181B] text-[13px] sm:text-[14px] font-[600] text-[#111827] dark:text-[#FAFAFA] outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6B7280] dark:text-[#A1A1AA] hover:text-[#111827] dark:hover:text-[#FAFAFA] cursor-pointer"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <button
              onClick={() => {
                fetchOverview();
                fetchCharts();
                fetchStreaks();
                fetchGoals();
                fetchInsights(true);
              }}
              className="h-[38px] sm:h-[40px] w-[38px] sm:w-[40px] rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#18181B] text-[#111827] dark:text-[#FAFAFA] hover:bg-[#F8FAFC] dark:hover:bg-[#232323] transition flex items-center justify-center cursor-pointer shrink-0 active:scale-[0.98]"
              title="Refresh all data"
            >
              <RefreshCw size={15} className={loadingOverview ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Tab Panels */}
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

        {/* Telemetry Data Table Section (New Reusable Data Table) */}
        {activeTab === 'overview' && !loadingOverview && overview && (
          <div className="bg-[#FFFFFF] dark:bg-[#18181B] p-4 sm:p-6 rounded-[16px] border border-[#D1D5DB] dark:border-[#3F3F46] shadow-xs space-y-4 sm:space-y-5 select-none">
            <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-[#D1D5DB] dark:border-[#3F3F46]">
              <div className="flex items-center gap-3">
                <div className="w-[36px] h-[36px] sm:w-[40px] sm:h-[40px] rounded-[10px] bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] flex items-center justify-center shrink-0">
                  <BarChart3 size={20} />
                </div>
                <div>
                  <h3 className="text-[16px] sm:text-[17px] font-[600] text-[#111827] dark:text-[#FAFAFA]">
                    Student Telemetry Data Table
                  </h3>
                  <p className="text-[14px] sm:text-[15px] font-[400] text-[#6B7280] dark:text-[#A1A1AA]">
                    Live academic performance telemetry & AI risk level classification
                  </p>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto no-scrollbar rounded-[12px] border border-[#D1D5DB] dark:border-[#3F3F46] max-w-full">
              <table className="w-full text-left text-[13px] sm:text-[14px]">
                <thead className="bg-[#F8FAFC] dark:bg-[#111111] text-[12px] sm:text-[14px] font-[500] text-[#111827] dark:text-[#FAFAFA] border-b border-[#D1D5DB] dark:border-[#3F3F46] sticky top-0 whitespace-nowrap">
                  <tr>
                    <th className="p-3 sm:p-3.5">Metric Module</th>
                    <th className="p-3 sm:p-3.5">Current Value</th>
                    <th className="p-3 sm:p-3.5">Target Benchmark</th>
                    <th className="p-3 sm:p-3.5">Risk Level</th>
                    <th className="p-3 sm:p-3.5">AI Recommendation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D1D5DB] dark:divide-[#3F3F46] font-[500]">
                  <tr>
                    <td className="p-3 sm:p-3.5 font-[700] text-[#111827] dark:text-[#FAFAFA] whitespace-nowrap">Attendance Rate</td>
                    <td className="p-3 sm:p-3.5 whitespace-nowrap">{overview.attendance_percentage}%</td>
                    <td className="p-3 sm:p-3.5 whitespace-nowrap">80.0%</td>
                    <td className="p-3 sm:p-3.5 whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] sm:text-[12px] font-[400] ${overview.attendance_percentage >= 80 ? 'bg-[#F8FAFC] dark:bg-[#111111] border border-[#D1D5DB] dark:border-[#3F3F46] text-[#111827] dark:text-[#FAFAFA]' : 'bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111]'}`}>
                        {overview.attendance_percentage >= 80 ? 'Low Risk' : 'High Risk'}
                      </span>
                    </td>
                    <td className="p-3 sm:p-3.5 text-[#6B7280] dark:text-[#A1A1AA] min-w-[220px]">Maintain minimum 80% mandatory attendance</td>
                  </tr>
                  <tr>
                    <td className="p-3 sm:p-3.5 font-[700] text-[#111827] dark:text-[#FAFAFA] whitespace-nowrap">Quiz Performance</td>
                    <td className="p-3 sm:p-3.5 whitespace-nowrap">{overview.quiz_average}%</td>
                    <td className="p-3 sm:p-3.5 whitespace-nowrap">75.0%</td>
                    <td className="p-3 sm:p-3.5 whitespace-nowrap">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] sm:text-[12px] font-[400] bg-[#F8FAFC] dark:bg-[#111111] border border-[#D1D5DB] dark:border-[#3F3F46] text-[#111827] dark:text-[#FAFAFA]">
                        Low Risk
                      </span>
                    </td>
                    <td className="p-3 sm:p-3.5 text-[#6B7280] dark:text-[#A1A1AA] min-w-[220px]">Continue daily adaptive quizzes in weak subjects</td>
                  </tr>
                  <tr>
                    <td className="p-3 sm:p-3.5 font-[700] text-[#111827] dark:text-[#FAFAFA] whitespace-nowrap">Assignment Submissions</td>
                    <td className="p-3 sm:p-3.5 whitespace-nowrap">{overview.assignments_completed}/{overview.assignments_total}</td>
                    <td className="p-3 sm:p-3.5 whitespace-nowrap">100%</td>
                    <td className="p-3 sm:p-3.5 whitespace-nowrap">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] sm:text-[12px] font-[400] bg-[#F8FAFC] dark:bg-[#111111] border border-[#D1D5DB] dark:border-[#3F3F46] text-[#111827] dark:text-[#FAFAFA]">
                        Low Risk
                      </span>
                    </td>
                    <td className="p-3 sm:p-3.5 text-[#6B7280] dark:text-[#A1A1AA] min-w-[220px]">Submit pending lab assignments before deadline</td>
                  </tr>
                  <tr>
                    <td className="p-3 sm:p-3.5 font-[700] text-[#111827] dark:text-[#FAFAFA] whitespace-nowrap">Placement Readiness</td>
                    <td className="p-3 sm:p-3.5 whitespace-nowrap">{overview.placement_readiness}%</td>
                    <td className="p-3 sm:p-3.5 whitespace-nowrap">70.0%</td>
                    <td className="p-3 sm:p-3.5 whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] sm:text-[12px] font-[400] ${overview.placement_readiness >= 70 ? 'bg-[#F8FAFC] dark:bg-[#111111] border border-[#D1D5DB] dark:border-[#3F3F46] text-[#111827] dark:text-[#FAFAFA]' : 'bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111]'}`}>
                        {overview.placement_readiness >= 70 ? 'Optimal' : 'Moderate'}
                      </span>
                    </td>
                    <td className="p-3 sm:p-3.5 text-[#6B7280] dark:text-[#A1A1AA] min-w-[220px]">Attend mock AI HR & Technical interview sessions</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Overview Tab Sub-Widgets */}
        {activeTab === 'overview' && !loadingOverview && overview && (
          <div className="space-y-6">
            <AiInsightsFeed
              insights={filteredInsights.slice(0, 4)}
              loading={loadingInsights}
              onRefresh={() => fetchInsights(true)}
            />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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

