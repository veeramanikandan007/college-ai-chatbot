const API_BASE_URL = 'http://127.0.0.1:8000';

export interface UserProfile {
  studentId: string;
  name: string;
  initials: string;
  department: string;
  year: string;
  semester: string;
  email: string;
  phone: string;
  attendancePercent: number;
  cgpa: number;
  fees_paid: number;
  fees_total: number;
  bus_no: string;
  library_books: string;
  certificate: string;
  role: string;
}

// ─── Demo credentials for offline / demo mode ────────────────────────────────
const DEMO_CREDENTIALS: Record<string, { password: string; role: string }> = {
  '24CSE001': { password: 'password123', role: 'student' },
  '24CSE002': { password: 'password123', role: 'student' },
  '24CSE003': { password: 'password123', role: 'student' },
  '24ECE001': { password: 'password123', role: 'student' },
  '24ME001': { password: 'password123', role: 'student' },
  'admin': { password: 'admin123', role: 'admin' },
};

// ─── Mock user data for offline / demo mode ──────────────────────────────────
const MOCK_USERS: Record<string, UserProfile> = {
  '24CSE001': {
    studentId: '24CSE001',
    name: 'Pandiyarajan',
    initials: 'PA',
    department: 'Computer Science and Engineering',
    year: '3rd Year',
    semester: '5',
    email: 'pandiyarajan@campusmail.edu',
    phone: '+91 98765 43210',
    attendancePercent: 87,
    cgpa: 8.52,
    fees_paid: 45000,
    fees_total: 75000,
    bus_no: '3',
    library_books: 'Operating Systems, DBMS',
    certificate: 'Bonafide - Available',
    role: 'student',
  },
  '24CSE002': {
    studentId: '24CSE002',
    name: 'Priya Sharma',
    initials: 'PS',
    department: 'Computer Science and Engineering',
    year: '3rd Year',
    semester: '5',
    email: 'priya.sharma@campusmail.edu',
    phone: '+91 98765 43211',
    attendancePercent: 92,
    cgpa: 9.1,
    fees_paid: 75000,
    fees_total: 75000,
    bus_no: '1',
    library_books: 'Data Structures, Algorithms',
    certificate: 'Bonafide - Available',
    role: 'student',
  },
  '24CSE003': {
    studentId: '24CSE003',
    name: 'Arjun Kumar',
    initials: 'AK',
    department: 'Computer Science and Engineering',
    year: '3rd Year',
    semester: '5',
    email: 'arjun.kumar@campusmail.edu',
    phone: '+91 98765 43212',
    attendancePercent: 78,
    cgpa: 7.8,
    fees_paid: 50000,
    fees_total: 75000,
    bus_no: '2',
    library_books: 'Python Programming, OS',
    certificate: 'Bonafide - Pending',
    role: 'student',
  },
  '24ECE001': {
    studentId: '24ECE001',
    name: 'Meera Patel',
    initials: 'MP',
    department: 'Electronics and Communication Engineering',
    year: '3rd Year',
    semester: '5',
    email: 'meera.patel@campusmail.edu',
    phone: '+91 98765 43213',
    attendancePercent: 85,
    cgpa: 8.3,
    fees_paid: 75000,
    fees_total: 75000,
    bus_no: '4',
    library_books: 'Digital Logic, Signals & Systems',
    certificate: 'Bonafide - Available',
    role: 'student',
  },
  '24ME001': {
    studentId: '24ME001',
    name: 'Rohan Desai',
    initials: 'RD',
    department: 'Mechanical Engineering',
    year: '3rd Year',
    semester: '5',
    email: 'rohan.desai@campusmail.edu',
    phone: '+91 98765 43214',
    attendancePercent: 90,
    cgpa: 8.7,
    fees_paid: 75000,
    fees_total: 75000,
    bus_no: '5',
    library_books: 'Thermodynamics, Manufacturing',
    certificate: 'Bonafide - Available',
    role: 'student',
  },
  'admin': {
    studentId: 'admin',
    name: 'Admin User',
    initials: 'AU',
    department: 'Administration',
    year: 'N/A',
    semester: 'N/A',
    email: 'admin@campusmail.edu',
    phone: '+91 98765 00000',
    attendancePercent: 100,
    cgpa: 10.0,
    fees_paid: 0,
    fees_total: 0,
    bus_no: 'N/A',
    library_books: 'N/A',
    certificate: 'N/A',
    role: 'admin',
  },
};

export async function loginUser(
  studentId: string,
  password: string,
): Promise<{ success: boolean; token?: string; user?: UserProfile; error?: string }> {
  // ─── Try real backend first ───────────────────────────────────────────────
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student_id: studentId, password }),
      signal: AbortSignal.timeout(5000),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success && data.user) {
        const user: UserProfile = {
          studentId: data.user.student_id,
          name: data.user.name,
          initials: data.user.initials,
          department: data.user.department,
          year: data.user.year,
          semester: data.user.semester,
          email: data.user.email,
          phone: data.user.phone,
          attendancePercent: data.user.attendance_percent,
          cgpa: data.user.cgpa,
          fees_paid: data.user.fees_paid,
          fees_total: data.user.fees_total,
          bus_no: data.user.bus_no,
          library_books: data.user.library_books,
          certificate: data.user.certificate,
          role: data.user.role,
        };
        return { success: true, token: data.access_token, user };
      }
    }

    // If backend returns 401, fall through to demo mode
    if (response.status === 401) {
      throw new Error('Backend auth failed, using demo mode');
    }
  } catch {
    // ─── Backend not available — use demo mode ───────────────────────────────
  }

  // ─── Demo mode: validate against demo credentials ─────────────────────────
  const demoCred = DEMO_CREDENTIALS[studentId];
  if (demoCred && demoCred.password === password) {
    const user = MOCK_USERS[studentId];
    if (user) {
      return { success: true, token: 'demo-jwt-token', user };
    }
  }

  return { success: false, error: 'Invalid Student ID or password.' };
}

export async function logoutUser(): Promise<void> {
  try {
    const token = localStorage.getItem('collegemate_token');
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      signal: AbortSignal.timeout(3000),
    });
  } catch {
    // Silent fail on logout — local state already cleared
  }
}

export async function fetchStudentProfile(studentId: string): Promise<UserProfile | null> {
  // ─── Try real backend first ───────────────────────────────────────────────
  try {
    const token = localStorage.getItem('collegemate_token');
    const response = await fetch(`${API_BASE_URL}/student/profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      signal: AbortSignal.timeout(5000),
    });

    if (response.ok) {
      const data = await response.json();
      return {
        studentId: data.student_id,
        name: data.name,
        initials: data.initials,
        department: data.department,
        year: data.year,
        semester: data.semester,
        email: data.email,
        phone: data.phone,
        attendancePercent: data.attendance_percent,
        cgpa: data.cgpa,
        fees_paid: data.fees_paid,
        fees_total: data.fees_total,
        bus_no: data.bus_no,
        library_books: data.library_books,
        certificate: data.certificate,
        role: data.role,
      };
    }
  } catch {
    // ─── Backend not available — use demo data ───────────────────────────────
  }

  return MOCK_USERS[studentId] || null;
}
