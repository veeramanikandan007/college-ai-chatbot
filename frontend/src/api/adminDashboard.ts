import axios from 'axios';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8000') + '/api/v1/admin';

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
    const res = await axios.get(`${API_BASE}/dashboard/overview`);
    return res.data;
  },

  getUsers: async (params?: { role?: string; department?: string; search?: string }): Promise<AdminUser[]> => {
    const res = await axios.get(`${API_BASE}/users`, { params });
    return res.data;
  },

  createUser: async (data: Partial<AdminUser> & { password: string }): Promise<AdminUser> => {
    const res = await axios.post(`${API_BASE}/users`, data);
    return res.data;
  },

  toggleUserStatus: async (userId: number): Promise<AdminUser> => {
    const res = await axios.patch(`${API_BASE}/users/${userId}/status`);
    return res.data;
  },

  resetUserPassword: async (userId: number, newPassword?: string) => {
    const res = await axios.post(`${API_BASE}/users/${userId}/reset-password`, null, { params: { new_password: newPassword } });
    return res.data;
  },

  deleteUser: async (userId: number) => {
    const res = await axios.delete(`${API_BASE}/users/${userId}`);
    return res.data;
  },

  getDepartments: async (): Promise<AdminDepartment[]> => {
    const res = await axios.get(`${API_BASE}/departments`);
    return res.data;
  },

  createDepartment: async (data: Partial<AdminDepartment>): Promise<AdminDepartment> => {
    const res = await axios.post(`${API_BASE}/departments`, data);
    return res.data;
  },

  deleteDepartment: async (id: number) => {
    const res = await axios.delete(`${API_BASE}/departments/${id}`);
    return res.data;
  },

  getCourses: async (): Promise<AdminCourse[]> => {
    const res = await axios.get(`${API_BASE}/courses`);
    return res.data;
  },

  createCourse: async (data: Partial<AdminCourse>): Promise<AdminCourse> => {
    const res = await axios.post(`${API_BASE}/courses`, data);
    return res.data;
  },

  getAnnouncements: async (): Promise<AdminAnnouncement[]> => {
    const res = await axios.get(`${API_BASE}/announcements`);
    return res.data;
  },

  createAnnouncement: async (data: Partial<AdminAnnouncement>): Promise<AdminAnnouncement> => {
    const res = await axios.post(`${API_BASE}/announcements`, data);
    return res.data;
  },

  deleteAnnouncement: async (id: number) => {
    const res = await axios.delete(`${API_BASE}/announcements/${id}`);
    return res.data;
  },

  getAnalyticsMaster: async (): Promise<AdminAnalyticsMaster> => {
    const res = await axios.get(`${API_BASE}/analytics/master`);
    return res.data;
  },

  getSettings: async (): Promise<AdminSettings> => {
    const res = await axios.get(`${API_BASE}/settings`);
    return res.data;
  },

  updateSettings: async (data: Partial<AdminSettings>): Promise<AdminSettings> => {
    const res = await axios.put(`${API_BASE}/settings`, data);
    return res.data;
  },

  getAuditLogs: async (): Promise<AdminAuditLog[]> => {
    const res = await axios.get(`${API_BASE}/audit-logs`);
    return res.data;
  },

  getDocuments: async (): Promise<{ documents: any[]; count: number }> => {
    const res = await axios.get(`${API_BASE}/documents`);
    return res.data;
  },

  deleteDocument: async (filename: string) => {
    const res = await axios.delete(`${API_BASE}/documents/${filename}`);
    return res.data;
  },

  rebuildRagIndex: async () => {
    const res = await axios.post(`${API_BASE}/rag/rebuild`);
    return res.data;
  },
};
