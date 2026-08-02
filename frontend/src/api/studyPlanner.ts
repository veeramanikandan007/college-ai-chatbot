import { fetchApi } from '../lib/api';

export interface StudyPlan {
  id: number;
  user_id: number;
  title: string;
  exam_name: string;
  exam_date: string;
  available_hours_per_day: number;
  preferred_study_time: string;
  target_score_percentage: number;
  weak_subjects: string[];
  strong_subjects: string[];
  status: 'Active' | 'Completed' | 'Archived';
  created_at: string;
}

export interface StudyPlanInput {
  title: string;
  exam_name: string;
  exam_date: string;
  available_hours_per_day: number;
  preferred_study_time: string;
  target_score_percentage: number;
  weak_subjects: string[];
  strong_subjects: string[];
}

export interface StudyTask {
  id: number;
  plan_id: number;
  user_id: number;
  subject_code: string;
  subject_name: string;
  title: string;
  description?: string;
  task_type: 'Study' | 'Revision' | 'Assignment' | 'Quiz Practice' | 'PYQP Analysis';
  scheduled_date: string;
  duration_minutes: number;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Pending' | 'In Progress' | 'Completed';
  completed_at?: string;
  linked_module_type?: string;
  linked_module_id?: number;
  created_at: string;
}

export interface AiSuggestion {
  id: string;
  title: string;
  description: string;
  subject_name: string;
  suggestion_type: 'assignment' | 'attendance' | 'quiz' | 'pyqp' | 'document';
  action_label: string;
  priority: 'High' | 'Medium' | 'Low';
  module_link?: string;
}

export interface StudyAnalytics {
  days_to_exam: number;
  daily_progress_percentage: number;
  weekly_progress_percentage: number;
  monthly_progress_percentage: number;
  total_study_hours_allocated: number;
  total_study_hours_completed: number;
  completed_topics_count: number;
  remaining_topics_count: number;
  weak_subjects_status: {
    subject_name: string;
    mastery_percentage: number;
    tasks_remaining: number;
  }[];
}

export interface StudyReminder {
  id: number;
  title: string;
  reminder_type: 'Study Time' | 'Assignment Due' | 'Quiz Reminder' | 'Exam Reminder';
  scheduled_time: string;
  is_read: boolean;
}

export const getStudyPlans = async (): Promise<StudyPlan[]> => {
  return fetchApi('/study-planner/plans');
};

export const generateStudyPlan = async (input: StudyPlanInput): Promise<StudyPlan> => {
  return fetchApi('/study-planner/generate', {
    method: 'POST',
    body: JSON.stringify(input),
  });
};

export const deleteStudyPlan = async (id: number): Promise<{ message: string; id: number }> => {
  return fetchApi(`/study-planner/plans/${id}`, {
    method: 'DELETE',
  });
};

export const getStudyTasks = async (params?: {
  date_filter?: 'today' | 'tomorrow' | 'this_week' | 'this_month';
  task_status?: 'Pending' | 'In Progress' | 'Completed';
  subject?: string;
  search?: string;
}): Promise<StudyTask[]> => {
  const searchParams = new URLSearchParams();
  if (params?.date_filter) searchParams.append('date_filter', params.date_filter);
  if (params?.task_status) searchParams.append('task_status', params.task_status);
  if (params?.subject) searchParams.append('subject', params.subject);
  if (params?.search) searchParams.append('search', params.search);

  const queryString = searchParams.toString();
  return fetchApi(`/study-planner/tasks${queryString ? `?${queryString}` : ''}`);
};

export const updateTaskStatus = async (
  id: number,
  status: 'Pending' | 'In Progress' | 'Completed'
): Promise<StudyTask> => {
  return fetchApi(`/study-planner/tasks/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
};

export const createCustomTask = async (task: {
  plan_id: number;
  subject_code: string;
  subject_name: string;
  title: string;
  description?: string;
  task_type: string;
  scheduled_date: string;
  duration_minutes: number;
  priority: string;
}): Promise<StudyTask> => {
  return fetchApi('/study-planner/tasks', {
    method: 'POST',
    body: JSON.stringify(task),
  });
};

export const deleteStudyTask = async (id: number): Promise<{ message: string; id: number }> => {
  return fetchApi(`/study-planner/tasks/${id}`, {
    method: 'DELETE',
  });
};

export const getAiStudySuggestions = async (): Promise<AiSuggestion[]> => {
  return fetchApi('/study-planner/suggestions');
};

export const getStudyAnalytics = async (): Promise<StudyAnalytics> => {
  return fetchApi('/study-planner/analytics');
};

export const getStudyReminders = async (): Promise<StudyReminder[]> => {
  return fetchApi('/study-planner/reminders');
};
