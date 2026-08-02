import axios from 'axios';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8000') + '/api/v1/analytics';

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
  const { data } = await axios.get<AnalyticsOverview>(`${API_BASE}/overview`);
  return data;
};

export const getAiInsights = async (): Promise<AiInsightsResponse> => {
  const { data } = await axios.get<AiInsightsResponse>(`${API_BASE}/ai-insights`);
  return data;
};

export const getAnalyticsCharts = async (): Promise<AnalyticsChartsData> => {
  const { data } = await axios.get<AnalyticsChartsData>(`${API_BASE}/charts`);
  return data;
};

export const getStreaks = async (): Promise<StreakData> => {
  const { data } = await axios.get<StreakData>(`${API_BASE}/streaks`);
  return data;
};

export const getGoals = async (): Promise<GoalResponse[]> => {
  const { data } = await axios.get<GoalResponse[]>(`${API_BASE}/goals`);
  return data;
};

export const createGoal = async (payload: GoalCreatePayload): Promise<GoalResponse> => {
  const { data } = await axios.post<GoalResponse>(`${API_BASE}/goals`, payload);
  return data;
};

export const updateGoal = async (id: number, payload: GoalUpdatePayload): Promise<GoalResponse> => {
  const { data } = await axios.patch<GoalResponse>(`${API_BASE}/goals/${id}`, payload);
  return data;
};

export const deleteGoal = async (id: number): Promise<void> => {
  await axios.delete(`${API_BASE}/goals/${id}`);
};

export const exportAnalytics = async (): Promise<AnalyticsExportPayload> => {
  const { data } = await axios.get<AnalyticsExportPayload>(`${API_BASE}/export`);
  return data;
};
