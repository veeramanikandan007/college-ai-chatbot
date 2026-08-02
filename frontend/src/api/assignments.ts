import { fetchApi } from '../lib/api';

export interface Assignment {
  id: number;
  title: string;
  subject: string;
  faculty: string;
  description?: string;
  priority: 'High' | 'Medium' | 'Low';
  due_date: string;
  created_at: string;
  status: 'Pending' | 'Completed' | 'Overdue';
  attachment_name?: string;
  attachment_url?: string;
  attachment_size?: string;
  submission_time?: string;
  remarks?: string;
  assigned_class?: string;
  user_id?: number;
  created_by?: number;
}

export interface AssignmentStatsData {
  total: number;
  pending: number;
  completed: number;
  overdue: number;
  upcoming: number;
}

export interface AssignmentReminderData {
  id: number;
  title: string;
  subject: string;
  due_date: string;
  reminder_type: string;
  days_left: number;
  priority: string;
}

export interface AssignmentAiResponseData {
  action: string;
  assignment_id: number;
  result: string;
  checklist?: string[];
  study_plan?: { day: string; task: string }[];
  estimated_minutes?: number;
}

export interface AssignmentInput {
  title: string;
  subject: string;
  faculty: string;
  description?: string;
  priority: string;
  due_date: string;
  status?: string;
  attachment_name?: string;
  attachment_url?: string;
  attachment_size?: string;
  remarks?: string;
  assigned_class?: string;
}

export const getAssignments = async (params?: {
  filter_by?: string;
  search?: string;
  sort_by?: string;
  sort_order?: string;
}): Promise<Assignment[]> => {
  const searchParams = new URLSearchParams();
  if (params?.filter_by) searchParams.append('filter_by', params.filter_by);
  if (params?.search) searchParams.append('search', params.search);
  if (params?.sort_by) searchParams.append('sort_by', params.sort_by);
  if (params?.sort_order) searchParams.append('sort_order', params.sort_order);

  const queryString = searchParams.toString();
  return fetchApi(`/assignments${queryString ? `?${queryString}` : ''}`);
};

export const getAssignmentStats = async (): Promise<AssignmentStatsData> => {
  return fetchApi('/assignments/stats');
};

export const getAssignmentReminders = async (): Promise<AssignmentReminderData[]> => {
  return fetchApi('/assignments/reminders');
};

export const getAssignmentById = async (id: number): Promise<Assignment> => {
  return fetchApi(`/assignments/${id}`);
};

export const createAssignment = async (data: AssignmentInput): Promise<Assignment> => {
  return fetchApi('/assignments', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const updateAssignment = async (id: number, data: Partial<AssignmentInput>): Promise<Assignment> => {
  return fetchApi(`/assignments/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const deleteAssignment = async (id: number): Promise<{ message: string; id: number }> => {
  return fetchApi(`/assignments/${id}`, {
    method: 'DELETE',
  });
};

export const toggleAssignmentStatus = async (id: number, status?: string): Promise<Assignment> => {
  const query = status ? `?status=${encodeURIComponent(status)}` : '';
  return fetchApi(`/assignments/${id}/status${query}`, {
    method: 'PATCH',
  });
};

export const uploadAssignmentFile = async (file: File): Promise<{
  attachment_name: string;
  attachment_url: string;
  attachment_size: string;
  filename: string;
}> => {
  const token = localStorage.getItem('token');
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/v1/assignments/upload', {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'File upload failed');
  }

  return response.json();
};

export const runAssignmentAiAction = async (
  id: number,
  action: 'summarize' | 'explain' | 'solution_outline' | 'checklist' | 'estimate_time' | 'study_plan'
): Promise<AssignmentAiResponseData> => {
  return fetchApi(`/assignments/${id}/ai-action`, {
    method: 'POST',
    body: JSON.stringify({ action }),
  });
};
