import { UserProfile } from './authService';

// ─── Demo student profiles (used when backend is offline) ────────────────────
const DEMO_PROFILES: Record<string, UserProfile> = {
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
};

export async function getStudentProfile(studentId: string): Promise<UserProfile> {
  // ─── Try real backend first ───────────────────────────────────────────────
  try {
    const token = localStorage.getItem('collegemate_token');
    const response = await fetch(`http://127.0.0.1:8000/student/profile`, {
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

  return DEMO_PROFILES[studentId] || DEMO_PROFILES['24CSE001'];
}

export async function updateStudentProfile(profile: Partial<UserProfile>): Promise<boolean> {
  // ─── Try real backend first ───────────────────────────────────────────────
  try {
    const token = localStorage.getItem('collegemate_token');
    const response = await fetch(`http://127.0.0.1:8000/student/profile/update`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(profile),
      signal: AbortSignal.timeout(5000),
    });

    return response.ok;
  } catch {
    // Demo mode — assume success
    return true;
  }
}
