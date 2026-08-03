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
  CheckSquare,
  Award
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
    <div className="w-full h-full overflow-y-auto bg-[#FFFFFF] dark:bg-[#0A0A0A] text-[#111827] dark:text-[#FAFAFA] p-4 md:p-8 transition-colors">
      <div className="w-full max-w-[1600px] mx-auto space-y-8">

        {/* ========================================================================= */}
        {/* 1. PAGE HEADER CARD                                                       */}
        {/* ========================================================================= */}
        <div className="bg-[#FFFFFF] dark:bg-[#181818] p-6 md:p-8 rounded-[12px] border border-[#D1D5DB] dark:border-[#3F3F46] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-[10px] bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] flex items-center justify-center shrink-0">
              <Brain size={24} />
            </div>
            <div>
              <h1 className="text-[32px] font-bold text-[#111827] dark:text-[#FAFAFA] tracking-tight flex items-center gap-3">
                AI Study Planner
                <span className="text-[12px] font-medium px-2.5 py-0.5 rounded-[6px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA]">
                  Adaptive Roadmap
                </span>
              </h1>
              <p className="text-[14px] text-[#6B7280] dark:text-[#A3A3A3] mt-1">
                Automated study schedule synthesis, exam countdown, task roadmaps, and cross-module AI recommendations.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsGeneratorOpen(true)}
            className="h-10 px-5 rounded-[10px] bg-[#111827] hover:bg-[#000000] dark:bg-[#FAFAFA] dark:hover:bg-[#E5E5E5] text-[#FFFFFF] dark:text-[#111111] font-medium text-[14px] shadow-xs transition flex items-center gap-2 cursor-pointer shrink-0"
          >
            <Sparkles size={16} />
            <span>Generate AI Study Plan</span>
          </button>
        </div>

        {/* Analytics Banner Component */}
        <StudyAnalyticsBanner analytics={analytics} loading={loadingAnalytics} />

        {/* AI Cross-module Suggestions Widget */}
        <AiSuggestionsWidget suggestions={suggestions} loading={loadingSuggestions} />

        {/* View Switcher Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F3F4F6] dark:border-[#2A2A2A] pb-4">
          <div className="flex items-center bg-[#F8FAFC] dark:bg-[#111111] p-1.5 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46]">
            <button
              onClick={() => setViewMode('tasks')}
              className={`h-9 px-4 text-[14px] font-medium rounded-[8px] transition-all cursor-pointer flex items-center gap-2 ${
                viewMode === 'tasks'
                  ? 'bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111]'
                  : 'text-[#4B5563] dark:text-[#A3A3A3] hover:bg-[#F9FAFB] dark:hover:bg-[#232323]'
              }`}
            >
              <CheckSquare size={16} />
              <span>Tasks Roadmap View</span>
            </button>

            <button
              onClick={() => setViewMode('calendar')}
              className={`h-9 px-4 text-[14px] font-medium rounded-[8px] transition-all cursor-pointer flex items-center gap-2 ${
                viewMode === 'calendar'
                  ? 'bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111]'
                  : 'text-[#4B5563] dark:text-[#A3A3A3] hover:bg-[#F9FAFB] dark:hover:bg-[#232323]'
              }`}
            >
              <CalendarDays size={16} />
              <span>Study Calendar View</span>
            </button>
          </div>

          {activePlan && (
            <span className="text-[14px] font-medium text-[#6B7280] dark:text-[#A3A3A3]">
              Active Plan: <strong className="text-[#111827] dark:text-[#FAFAFA]">{activePlan.title}</strong>
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
    </div>
  );
};

export default StudyPlannerPage;
