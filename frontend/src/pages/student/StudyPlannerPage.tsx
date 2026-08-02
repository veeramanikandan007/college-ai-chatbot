import React, { useState, useEffect, useCallback } from 'react';
import {
  CalendarDays,
  Clock3,
  BookOpen,
  Brain,
  Target,
  CheckCircle2,
  CalendarRange,
  Search,
  Filter,
  Bell,
  BarChart3,
  TrendingUp,
  Sparkles,
  Plus,
  Layers,
  CircleAlert,
  CheckSquare
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
    <div className="flex-1 overflow-y-auto bg-slate-50/50 dark:bg-slate-950 p-4 sm:p-6 md:p-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white dark:bg-[#1E293B] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-purple-600 text-white shadow-xs">
              <Brain size={22} />
            </div>
            <h1 className="text-2xl font-bold font-heading text-slate-900 dark:text-white">
              AI Study Planner
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Automated study schedule synthesis, exam countdown, task roadmaps, and cross-module AI recommendations.
          </p>
        </div>

        {/* Generator Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsGeneratorOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 transition-all shadow-xs"
          >
            <Sparkles size={16} />
            <span>Generate AI Study Plan</span>
          </button>
        </div>
      </div>

      {/* Analytics Banner Component */}
      <StudyAnalyticsBanner analytics={analytics} loading={loadingAnalytics} />

      {/* AI Cross-module Suggestions Widget */}
      <AiSuggestionsWidget suggestions={suggestions} loading={loadingSuggestions} />

      {/* View Switcher Controls */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('tasks')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'tasks'
                ? 'bg-[#0E2A6D] text-white dark:bg-[#60A5FA] dark:text-slate-950 shadow-xs'
                : 'bg-white dark:bg-[#1E293B] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
            }`}
          >
            <CheckSquare size={16} />
            <span>Tasks Roadmap View</span>
          </button>

          <button
            onClick={() => setViewMode('calendar')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'calendar'
                ? 'bg-[#0E2A6D] text-white dark:bg-[#60A5FA] dark:text-slate-950 shadow-xs'
                : 'bg-white dark:bg-[#1E293B] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
            }`}
          >
            <CalendarDays size={16} />
            <span>Study Calendar View</span>
          </button>
        </div>

        {activePlan && (
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 hidden sm:inline">
            Active Plan: <strong className="text-slate-800 dark:text-slate-200">{activePlan.title}</strong>
          </span>
        )}
      </div>

      {/* Main View: Tasks List or Calendar */}
      {viewMode === 'tasks' ? (
        <StudyTasksList
          tasks={tasks}
          loading={loadingTasks}
          onRefresh={fetchTasksList}
          onFilterChange={(newFilters) => setFilters(newFilters)}
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
  );
};

export default StudyPlannerPage;
