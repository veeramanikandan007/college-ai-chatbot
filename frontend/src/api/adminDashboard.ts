import { fetchApi } from '../lib/api';

// Note: fetchApi automatically prepends API_URL (/api/v1) and handles JWT headers.

export interface AdminMasterOverviewStats {
  total_students: number;
  total_faculty: number;
  total_departments: number;
  total_courses: number;
  overall_attendance_rate: number;
  total_assignments: number;
  total_question_papers: number;
  total_placements: number;
  uploaded_documents: number;
  daily_active_users: number;
  system_health_percentage: number;
  storage_usage_gb: number;
  storage_limit_gb: number;
}

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: string;
  department?: string;
  is_active: boolean;
  created_at: string;
}

export interface AdminDepartment {
  id: number;
  code: string;
  name: string;
  head_of_department: string;
  total_courses: number;
  total_sections: number;
  status: string;
  created_at: string;
}

export interface AdminCourse {
  id: number;
  department_code: string;
  course_code: string;
  course_name: string;
  credits: number;
  semester: number;
  created_at: string;
}

export interface AdminAnnouncement {
  id: number;
  title: string;
  content: string;
  target_type: string;
  target_filter: string;
  priority: string;
  is_active: boolean;
  created_at: string;
}

export interface AdminAnalyticsMaster {
  daily_users: Array<{ date: string; count: number }>;
  weekly_users: Array<{ week: string; count: number }>;
  monthly_users: Array<{ month: string; count: number }>;
  storage_distribution: Array<{ category: string; size_gb: number }>;
  most_used_modules: Array<{ module: string; usage_count: number }>;
  top_performing_students: Array<{ name: string; reg_no: string; dept: string; cgpa: number; attendance: number }>;
  faculty_activity_logs: Array<{ name: string; dept: string; classes_taken: number; quizzes_created: number; assignments_graded: number }>;
}

export interface AdminSettings {
  id: number;
  college_name: string;
  college_code: string;
  logo_url?: string;
  theme_color: string;
  smtp_host: string;
  smtp_port: number;
  ai_provider: string;
  api_key_masked: string;
  storage_limit_gb: number;
  security_mfa_enabled: boolean;
  updated_at: string;
}

export interface AdminAuditLog {
  id: number;
  user_id?: number;
  user_email?: string;
  action: string;
  target_type: string;
  target_id?: string;
  details?: string;
  ip_address: string;
  created_at: string;
}

export const adminDashboardApi = {
  getOverviewStats: async (): Promise<AdminMasterOverviewStats> => {
    return await fetchApi('/admin/dashboard/overview');
  },

  getUsers: async (params?: { role?: string; department?: string; search?: string }): Promise<AdminUser[]> => {
    const urlParams = new URLSearchParams();
    if (params?.role) urlParams.append('role', params.role);
    if (params?.department) urlParams.append('department', params.department);
    if (params?.search) urlParams.append('search', params.search);
    const query = urlParams.toString() ? `?${urlParams.toString()}` : '';
    return await fetchApi(`/admin/users${query}`);
  },

  createUser: async (data: Partial<AdminUser> & { password: string }): Promise<AdminUser> => {
    return await fetchApi('/admin/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  toggleUserStatus: async (userId: number): Promise<AdminUser> => {
    return await fetchApi(`/admin/users/${userId}/status`, { method: 'PATCH' });
  },

  resetUserPassword: async (userId: number, newPassword?: string) => {
    const params = new URLSearchParams();
    if (newPassword) params.append('new_password', newPassword);
    const query = params.toString() ? `?${params.toString()}` : '';
    return await fetchApi(`/admin/users/${userId}/reset-password${query}`, { method: 'POST' });
  },

  deleteUser: async (userId: number) => {
    return await fetchApi(`/admin/users/${userId}`, { method: 'DELETE' });
  },

  getDepartments: async (): Promise<AdminDepartment[]> => {
    return await fetchApi('/admin/departments');
  },

  createDepartment: async (data: Partial<AdminDepartment>): Promise<AdminDepartment> => {
    return await fetchApi('/admin/departments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  deleteDepartment: async (id: number) => {
    return await fetchApi(`/admin/departments/${id}`, { method: 'DELETE' });
  },

  getCourses: async (): Promise<AdminCourse[]> => {
    return await fetchApi('/admin/courses');
  },

  createCourse: async (data: Partial<AdminCourse>): Promise<AdminCourse> => {
    return await fetchApi('/admin/courses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getAnnouncements: async (): Promise<AdminAnnouncement[]> => {
    return await fetchApi('/admin/announcements');
  },

  createAnnouncement: async (data: Partial<AdminAnnouncement>): Promise<AdminAnnouncement> => {
    return await fetchApi('/admin/announcements', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  deleteAnnouncement: async (id: number) => {
    return await fetchApi(`/admin/announcements/${id}`, { method: 'DELETE' });
  },

  getAnalyticsMaster: async (): Promise<AdminAnalyticsMaster> => {
    return await fetchApi('/admin/analytics/master');
  },

  getSettings: async (): Promise<AdminSettings> => {
    return await fetchApi('/admin/settings');
  },

  updateSettings: async (data: Partial<AdminSettings>): Promise<AdminSettings> => {
    return await fetchApi('/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  getAuditLogs: async (): Promise<AdminAuditLog[]> => {
    return await fetchApi('/admin/audit-logs');
  },

  getDocuments: async (): Promise<{ documents: any[]; count: number }> => {
    return await fetchApi('/admin/documents');
  },

  deleteDocument: async (filename: string) => {
    return await fetchApi(`/admin/documents/${filename}`, { method: 'DELETE' });
  },

  rebuildRagIndex: async () => {
    return await fetchApi('/admin/rag/rebuild', { method: 'POST' });
  },
};
