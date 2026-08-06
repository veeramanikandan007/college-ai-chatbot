import { fetchApi } from '../lib/api';

// Note: fetchApi automatically prepends API_URL (/api/v1) and handles JWT headers.

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
    return await fetchApi('/faculty/dashboard');
  },

  getAttendance: async (subject_code?: string, section?: string, attendance_date?: string): Promise<AttendanceRecord[]> => {
    const params = new URLSearchParams();
    if (subject_code) params.append('subject_code', subject_code);
    if (section) params.append('section', section);
    if (attendance_date) params.append('attendance_date', attendance_date);
    const query = params.toString() ? `?${params.toString()}` : '';
    return await fetchApi(`/faculty/attendance${query}`);
  },

  markAttendance: async (data: Partial<AttendanceRecord>): Promise<AttendanceRecord> => {
    return await fetchApi('/faculty/attendance', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  markBulkAttendance: async (subject_code: string, section: string, date: string, records: Partial<AttendanceRecord>[]): Promise<AttendanceRecord[]> => {
    return await fetchApi('/faculty/attendance/bulk', {
      method: 'POST',
      body: JSON.stringify({ subject_code, section, date, records }),
    });
  },

  editAttendance: async (id: number, statusVal: string, remarks?: string): Promise<AttendanceRecord> => {
    const params = new URLSearchParams();
    params.append('status_val', statusVal);
    if (remarks) params.append('remarks', remarks);
    return await fetchApi(`/faculty/attendance/${id}?${params.toString()}`, {
      method: 'PUT',
    });
  },

  getAssignments: async (): Promise<FacultyAssignment[]> => {
    return await fetchApi('/faculty/assignments');
  },

  createAssignment: async (data: Partial<FacultyAssignment>): Promise<FacultyAssignment> => {
    return await fetchApi('/faculty/assignments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  editAssignment: async (id: number, data: Partial<FacultyAssignment>): Promise<FacultyAssignment> => {
    return await fetchApi(`/faculty/assignments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteAssignment: async (id: number): Promise<void> => {
    await fetchApi(`/faculty/assignments/${id}`, { method: 'DELETE' });
  },

  getSubmissions: async (assignmentId: number): Promise<FacultySubmission[]> => {
    return await fetchApi(`/faculty/assignments/${assignmentId}/submissions`);
  },

  gradeSubmission: async (submissionId: number, grade: string, remarks?: string): Promise<FacultySubmission> => {
    return await fetchApi(`/faculty/submissions/${submissionId}/grade`, {
      method: 'POST',
      body: JSON.stringify({ grade, remarks }),
    });
  },

  getQuestionPapers: async (): Promise<FacultyQuestionPaper[]> => {
    return await fetchApi('/faculty/question-papers');
  },

  uploadQuestionPaper: async (data: Partial<FacultyQuestionPaper>): Promise<FacultyQuestionPaper> => {
    return await fetchApi('/faculty/question-papers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  deleteQuestionPaper: async (id: number): Promise<void> => {
    await fetchApi(`/faculty/question-papers/${id}`, { method: 'DELETE' });
  },

  getQuizzes: async (): Promise<FacultyQuiz[]> => {
    return await fetchApi('/faculty/quizzes');
  },

  createQuiz: async (data: Partial<FacultyQuiz>): Promise<FacultyQuiz> => {
    return await fetchApi('/faculty/quizzes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  togglePublishQuiz: async (id: number): Promise<FacultyQuiz> => {
    return await fetchApi(`/faculty/quizzes/${id}/publish`, { method: 'PUT' });
  },

  deleteQuiz: async (id: number): Promise<void> => {
    await fetchApi(`/faculty/quizzes/${id}`, { method: 'DELETE' });
  },

  getQuizScores: async (quizId: number): Promise<FacultyQuizResult[]> => {
    return await fetchApi(`/faculty/quizzes/${quizId}/scores`);
  },

  getTimetable: async (): Promise<FacultyScheduleItem[]> => {
    return await fetchApi('/faculty/timetable');
  },

  requestTimetableChange: async (data: { request_date: string; current_period: number; requested_period: number; reason: string }) => {
    return await fetchApi('/faculty/timetable/change-request', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getStudents: async (params?: { department?: string; semester?: number; section?: string; search?: string }): Promise<StudentRosterItem[]> => {
    const urlParams = new URLSearchParams();
    if (params?.department) urlParams.append('department', params.department);
    if (params?.semester) urlParams.append('semester', params.semester.toString());
    if (params?.section) urlParams.append('section', params.section);
    if (params?.search) urlParams.append('search', params.search);
    const query = urlParams.toString() ? `?${urlParams.toString()}` : '';
    return await fetchApi(`/faculty/students${query}`);
  },
};
