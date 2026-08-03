import React, { useState, useEffect, useCallback } from 'react';
import {
  Brain,
  Sparkles,
  CheckSquare,
  CalendarDays,
  Clock3,
  TrendingUp
} from 'lucide-react';
import {
  StudyPlan,
  StudyTask,
  AiSuggestion,
  StudyAnalytics,
  getStudyPlans,
  getStudyTasks,
  getAiStudySuggestions,
  getStudyAnalytics
} from '../../api/studyPlanner';
import { StudyAnalyticsBanner } from '../../components/studyPlanner/StudyAnalyticsBanner';
import { AiSuggestionsWidget } from '../../components/studyPlanner/AiSuggestionsWidget';
import { StudyPlanGeneratorModal } from '../../components/studyPlanner/StudyPlanGeneratorModal';
import { StudyTasksList } from '../../components/studyPlanner/StudyTasksList';
import { StudyCalendarView } from '../../components/studyPlanner/StudyCalendarView';
import { useToast } from '../../context/ToastContext';

export const StudyPlannerPage: React.FC = () => {
  const { showToast } = useToast();

  const [activePlan, setActivePlan] = useState<StudyPlan | null>(null);
  const [tasks, setTasks] = useState<StudyTask[]>([]);
  const [suggestions, setSuggestions] = useState<AiSuggestion[]>([]);
  const [analytics, setAnalytics] = useState<StudyAnalytics | null>(null);

  const [loadingTasks, setLoadingTasks] = useState<boolean>(true);
  const [loadingAnalytics, setLoadingAnalytics] = useState<boolean>(true);
  const [loadingSuggestions, setLoadingSuggestions] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [viewMode, setViewMode] = useState<'tasks' | 'calendar'>('tasks');
  const [isGeneratorOpen, setIsGeneratorOpen] = useState<boolean>(false);

  // Filters state
  const [filters, setFilters] = useState<{ date_filter?: any; task_status?: any; search?: string }>({
    date_filter: 'today',
  });

  // Fetch active plans, analytics, and suggestions
  const fetchDashboardData = useCallback(async () => {
    setLoadingAnalytics(true);
    setLoadingSuggestions(true);
    try {
      const [plansRes, analyticsRes, suggestionsRes] = await Promise.all([
        getStudyPlans(),
        getStudyAnalytics(),
        getAiStudySuggestions(),
      ]);

      if (plansRes.length > 0) {
        setActivePlan(plansRes[0]);
      }
      setAnalytics(analyticsRes);
      setSuggestions(suggestionsRes);
    } catch (err: any) {
      setError(err.message || 'Failed to load study planner data');
    } finally {
      setLoadingAnalytics(false);
      setLoadingSuggestions(false);
    }
  }, []);

  // Fetch tasks with current filters
  const fetchTasksList = useCallback(async () => {
    setLoadingTasks(true);
    try {
      const res = await getStudyTasks(filters);
      setTasks(res);
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch tasks', 'error');
    } finally {
      setLoadingTasks(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  useEffect(() => {
    fetchTasksList();
  }, [fetchTasksList]);

  return (
    <div className="w-full h-full overflow-x-hidden overflow-y-auto bg-[#FFFFFF] dark:bg-[#0A0A0A] text-[#111827] dark:text-[#FAFAFA] p-4 sm:p-6 md:p-8 transition-colors select-none">
      {/* 1440px Centered Max Content Width Container */}
      <div className="w-full max-w-[1440px] mx-auto space-y-6">

        {/* Compact Hero Header */}
        <div className="bg-[#FFFFFF] dark:bg-[#18181B] p-5 rounded-[16px] border border-[#D1D5DB] dark:border-[#3F3F46] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-[44px] h-[44px] rounded-[10px] bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] flex items-center justify-center shrink-0">
              <Brain size={22} />
            </div>
            <div className="min-w-0">
              <h1 className="text-[20px] sm:text-[30px] font-[600] text-[#111827] dark:text-[#FAFAFA] tracking-tight leading-[1.2] truncate">
                AI Study Planner
              </h1>
              <p className="text-[14px] sm:text-[15px] font-[400] text-[#6B7280] dark:text-[#A1A1AA] mt-0.5 truncate">
                Adaptive study roadmap synthesis, exam countdown, task scheduling & AI recommendations.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {analytics && (
              <div className="hidden xl:flex items-center gap-2">
                <span className="h-[36px] inline-flex items-center gap-1.5 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#F8FAFC] dark:bg-[#111111] px-3 text-[14px] font-[500] text-[#111827] dark:text-[#FAFAFA]">
                  <Clock3 size={15} />
                  {analytics.days_to_exam}d Left
                </span>
                <span className="h-[36px] inline-flex items-center gap-1.5 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#F8FAFC] dark:bg-[#111111] px-3 text-[14px] font-[500] text-[#111827] dark:text-[#FAFAFA]">
                  <TrendingUp size={15} />
                  Streak: {analytics.daily_progress_percentage}%
                </span>
              </div>
            )}

            <button
              onClick={() => setIsGeneratorOpen(true)}
              className="h-[40px] max-sm:h-[38px] px-[18px] rounded-[12px] bg-[#111827] hover:bg-[#1F2937] active:bg-[#0F172A] dark:bg-[#FAFAFA] dark:hover:bg-[#F3F4F6] text-[#FFFFFF] dark:text-[#111111] text-[14px] font-[500] transition flex items-center justify-center gap-2 cursor-pointer shrink-0 active:scale-[0.98]"
            >
              <Sparkles size={16} />
              <span>Generate AI Study Plan</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Banner */}
        <StudyAnalyticsBanner analytics={analytics} loading={loadingAnalytics} />

        {/* AI Recommendations Widget */}
        <AiSuggestionsWidget suggestions={suggestions} loading={loadingSuggestions} />

        {/* View Switcher Controls Bar */}
        <div className="bg-[#FFFFFF] dark:bg-[#18181B] p-4 rounded-[16px] border border-[#D1D5DB] dark:border-[#3F3F46] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center bg-[#F8FAFC] dark:bg-[#111111] p-1 rounded-[12px] border border-[#D1D5DB] dark:border-[#3F3F46] min-h-[44px] max-w-full overflow-x-auto no-scrollbar">
            <button
              onClick={() => setViewMode('tasks')}
              className={`h-[36px] px-4 rounded-[8px] text-[14px] font-[500] transition flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                viewMode === 'tasks'
                  ? 'bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111]'
                  : 'text-[#6B7280] dark:text-[#A1A1AA] hover:bg-[#FFFFFF] dark:hover:bg-[#18181B]'
              }`}
            >
              <CheckSquare size={15} className="shrink-0" />
              <span>Roadmap View</span>
            </button>

            <button
              onClick={() => setViewMode('calendar')}
              className={`h-[36px] px-4 rounded-[8px] text-[14px] font-[500] transition flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                viewMode === 'calendar'
                  ? 'bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111]'
                  : 'text-[#6B7280] dark:text-[#A1A1AA] hover:bg-[#FFFFFF] dark:hover:bg-[#18181B]'
              }`}
            >
              <CalendarDays size={15} className="shrink-0" />
              <span>Calendar View</span>
            </button>
          </div>

          {activePlan && (
            <span className="text-[14px] font-[500] text-[#6B7280] dark:text-[#A1A1AA] truncate">
              Active Plan: <strong className="font-[700] text-[#111827] dark:text-[#FAFAFA]">{activePlan.title}</strong>
            </span>
          )}
        </div>

        {/* Main Tasks List or Calendar View */}
        {viewMode === 'tasks' ? (
          <StudyTasksList
            tasks={tasks}
            loading={loadingTasks}
            onRefresh={fetchTasksList}
            onFilterChange={(newFilters) => setFilters(newFilters)}
            onOpenGenerator={() => setIsGeneratorOpen(true)}
          />
        ) : (
          <StudyCalendarView tasks={tasks} examDate={activePlan?.exam_date} />
        )}

        {/* Generator Modal */}
        <StudyPlanGeneratorModal
          isOpen={isGeneratorOpen}
          onClose={() => setIsGeneratorOpen(false)}
          onSuccess={() => {
            fetchDashboardData();
            fetchTasksList();
          }}
        />
      </div>
    </div>
  );
};

export default StudyPlannerPage;
