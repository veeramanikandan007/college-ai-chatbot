import { fetchApi } from '../lib/api';

export interface AnalyticsOverview {
  study_hours_week: number;
  study_hours_month: number;
  attendance_percentage: number;
  quiz_average: number;
  assignments_completed: number;
  assignments_total: number;
  interview_score: number;
  documents_uploaded: number;
  question_papers_solved: number;
  placement_readiness: number;
  weekly_progress: number;
  monthly_progress: number;
}

export interface AiInsightItem {
  type: 'warning' | 'tip' | 'success' | 'info';
  title: string;
  message: string;
  subject?: string;
  action_label?: string;
  action_url?: string;
}

export interface AiInsightsResponse {
  insights: AiInsightItem[];
  generated_at: string;
}

export interface ChartDataPoint {
  label: string;
  value: number;
  secondary_value?: number;
}

export interface SubjectPerformancePoint {
  subject: string;
  quiz_score: number;
  attendance: number;
  assignments: number;
}

export interface AnalyticsChartsData {
  weekly_study_hours: ChartDataPoint[];
  monthly_study_hours: ChartDataPoint[];
  quiz_performance: ChartDataPoint[];
  attendance_trend: ChartDataPoint[];
  assignment_completion: ChartDataPoint[];
  interview_scores: ChartDataPoint[];
  subject_progress: SubjectPerformancePoint[];
}

export interface StreakData {
  daily_study_streak: number;
  quiz_streak: number;
  attendance_streak: number;
  assignment_streak: number;
  last_activity_date?: string;
}

export interface GoalResponse {
  id: number;
  user_id: number;
  title: string;
  category: string;
  target_metric: string;
  target_value: number;
  current_value: number;
  unit: string;
  deadline?: string;
  status: string;
  progress_percentage: number;
  created_at: string;
}

export interface GoalCreatePayload {
  title: string;
  category: string;
  target_metric: string;
  target_value: number;
  current_value: number;
  unit: string;
  deadline?: string;
}

export interface GoalUpdatePayload {
  title?: string;
  current_value?: number;
  target_value?: number;
  status?: string;
  deadline?: string;
}

export interface AnalyticsExportPayload {
  student_name: string;
  export_date: string;
  overview: AnalyticsOverview;
  charts: AnalyticsChartsData;
  goals: GoalResponse[];
  streaks: StreakData;
  insights: AiInsightItem[];
}

export const getAnalyticsOverview = async (): Promise<AnalyticsOverview> => {
  return fetchApi('/analytics/overview');
};

export const getAiInsights = async (): Promise<AiInsightsResponse> => {
  return fetchApi('/analytics/ai-insights');
};

export const getAnalyticsCharts = async (): Promise<AnalyticsChartsData> => {
  return fetchApi('/analytics/charts');
};

export const getStreaks = async (): Promise<StreakData> => {
  return fetchApi('/analytics/streaks');
};

export const getGoals = async (): Promise<GoalResponse[]> => {
  return fetchApi('/analytics/goals');
};

export const createGoal = async (payload: GoalCreatePayload): Promise<GoalResponse> => {
  return fetchApi('/analytics/goals', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const updateGoal = async (id: number, payload: GoalUpdatePayload): Promise<GoalResponse> => {
  return fetchApi(`/analytics/goals/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
};

export const deleteGoal = async (id: number): Promise<void> => {
  return fetchApi(`/analytics/goals/${id}`, {
    method: 'DELETE',
  });
};

export const exportAnalytics = async (): Promise<AnalyticsExportPayload> => {
  return fetchApi('/analytics/export');
};
