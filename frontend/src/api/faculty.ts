import axios from 'axios';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8000') + '/api/v1/faculty';

axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};


export interface FacultyProfile {
  id: number;
  user_id: number;
  employee_id: string;
  department: string;
  designation: string;
  office_room: string;
  assigned_subjects: string;
  assigned_sections: string;
  created_at: string;
}

export interface FacultyScheduleItem {
  id: number;
  day_of_week: string;
  period_number: number;
  start_time: string;
  end_time: string;
  subject_name: string;
  subject_code: string;
  section: string;
  classroom: string;
}

export interface FacultyDashboardStats {
  today_classes_count: number;
  total_assigned_students: number;
  pending_submissions_count: number;
  average_class_attendance: number;
  total_quizzes_created: number;
  question_papers_uploaded: number;
}

export interface FacultyDashboardData {
  profile: FacultyProfile;
  stats: FacultyDashboardStats;
  today_schedule: FacultyScheduleItem[];
  upcoming_classes: FacultyScheduleItem[];
  assigned_subjects: string[];
  assigned_sections: string[];
  notifications: Array<{
    id: number;
    title: string;
    message: string;
    time: string;
    type: string;
  }>;
}

export interface AttendanceRecord {
  id: number;
  student_id?: number;
  student_name: string;
  register_number: string;
  subject_code: string;
  section: string;
  date: string;
  status: string;
  remarks?: string;
}

export interface FacultyAssignment {
  id: number;
  faculty_id: number;
  title: string;
  subject_code: string;
  section: string;
  description?: string;
  due_date: string;
  max_marks: number;
  attachment_url?: string;
  submissions_count: number;
  graded_count: number;
  created_at: string;
}

export interface FacultySubmission {
  id: number;
  assignment_id: number;
  student_id?: number;
  student_name: string;
  register_number: string;
  submission_text?: string;
  file_url?: string;
  submitted_at: string;
  grade?: string;
  remarks?: string;
  status: string;
}

export interface FacultyQuestionPaper {
  id: number;
  faculty_id: number;
  title: string;
  subject_name: string;
  subject_code: string;
  department: string;
  semester: number;
  academic_year: string;
  exam_type: string;
  pdf_url?: string;
  created_at: string;
}

export interface FacultyQuiz {
  id: number;
  faculty_id: number;
  title: string;
  subject_code: string;
  section: string;
  num_questions: number;
  duration_minutes: number;
  total_marks: number;
  is_published: boolean;
  questions_json?: any;
  created_at: string;
}

export interface FacultyQuizResult {
  id: number;
  quiz_id: number;
  student_id?: number;
  student_name: string;
  score: number;
  total_marks: number;
  submitted_at: string;
}

export interface StudentRosterItem {
  id: number;
  student_name: string;
  register_number: string;
  department: string;
  semester: number;
  section: string;
  attendance_percentage: number;
  assignment_status: string;
}

export const facultyApi = {
  getDashboard: async (): Promise<FacultyDashboardData> => {
    const res = await axios.get(`${API_BASE}/dashboard`);
    return res.data;
  },

  getAttendance: async (subject_code?: string, section?: string, attendance_date?: string): Promise<AttendanceRecord[]> => {
    const res = await axios.get(`${API_BASE}/attendance`, { params: { subject_code, section, attendance_date } });
    return res.data;
  },

  markAttendance: async (data: Partial<AttendanceRecord>): Promise<AttendanceRecord> => {
    const res = await axios.post(`${API_BASE}/attendance`, data);
    return res.data;
  },

  markBulkAttendance: async (subject_code: string, section: string, date: string, records: Partial<AttendanceRecord>[]): Promise<AttendanceRecord[]> => {
    const res = await axios.post(`${API_BASE}/attendance/bulk`, { subject_code, section, date, records });
    return res.data;
  },

  editAttendance: async (id: number, statusVal: string, remarks?: string): Promise<AttendanceRecord> => {
    const res = await axios.put(`${API_BASE}/attendance/${id}`, null, { params: { status_val: statusVal, remarks } });
    return res.data;
  },

  getAssignments: async (): Promise<FacultyAssignment[]> => {
    const res = await axios.get(`${API_BASE}/assignments`);
    return res.data;
  },

  createAssignment: async (data: Partial<FacultyAssignment>): Promise<FacultyAssignment> => {
    const res = await axios.post(`${API_BASE}/assignments`, data);
    return res.data;
  },

  editAssignment: async (id: number, data: Partial<FacultyAssignment>): Promise<FacultyAssignment> => {
    const res = await axios.put(`${API_BASE}/assignments/${id}`, data);
    return res.data;
  },

  deleteAssignment: async (id: number): Promise<void> => {
    await axios.delete(`${API_BASE}/assignments/${id}`);
  },

  getSubmissions: async (assignmentId: number): Promise<FacultySubmission[]> => {
    const res = await axios.get(`${API_BASE}/assignments/${assignmentId}/submissions`);
    return res.data;
  },

  gradeSubmission: async (submissionId: number, grade: string, remarks?: string): Promise<FacultySubmission> => {
    const res = await axios.post(`${API_BASE}/submissions/${submissionId}/grade`, { grade, remarks });
    return res.data;
  },

  getQuestionPapers: async (): Promise<FacultyQuestionPaper[]> => {
    const res = await axios.get(`${API_BASE}/question-papers`);
    return res.data;
  },

  uploadQuestionPaper: async (data: Partial<FacultyQuestionPaper>): Promise<FacultyQuestionPaper> => {
    const res = await axios.post(`${API_BASE}/question-papers`, data);
    return res.data;
  },

  deleteQuestionPaper: async (id: number): Promise<void> => {
    await axios.delete(`${API_BASE}/question-papers/${id}`);
  },

  getQuizzes: async (): Promise<FacultyQuiz[]> => {
    const res = await axios.get(`${API_BASE}/quizzes`);
    return res.data;
  },

  createQuiz: async (data: Partial<FacultyQuiz>): Promise<FacultyQuiz> => {
    const res = await axios.post(`${API_BASE}/quizzes`, data);
    return res.data;
  },

  togglePublishQuiz: async (id: number): Promise<FacultyQuiz> => {
    const res = await axios.put(`${API_BASE}/quizzes/${id}/publish`);
    return res.data;
  },

  deleteQuiz: async (id: number): Promise<void> => {
    await axios.delete(`${API_BASE}/quizzes/${id}`);
  },

  getQuizScores: async (quizId: number): Promise<FacultyQuizResult[]> => {
    const res = await axios.get(`${API_BASE}/quizzes/${quizId}/scores`);
    return res.data;
  },

  getTimetable: async (): Promise<FacultyScheduleItem[]> => {
    const res = await axios.get(`${API_BASE}/timetable`);
    return res.data;
  },

  requestTimetableChange: async (data: { request_date: string; current_period: number; requested_period: number; reason: string }) => {
    const res = await axios.post(`${API_BASE}/timetable/change-request`, data);
    return res.data;
  },

  getStudents: async (params?: { department?: string; semester?: number; section?: string; search?: string }): Promise<StudentRosterItem[]> => {
    const res = await axios.get(`${API_BASE}/students`, { params });
    return res.data;
  },
};
