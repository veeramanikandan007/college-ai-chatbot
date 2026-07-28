export interface SubjectAttendance {
  subject: string;
  code: string;
  attended: number;
  total: number;
  percentage: number;
}

export async function getStudentAttendance(studentId: string): Promise<SubjectAttendance[]> {
  // TODO: Fetch real student attendance records from PostgreSQL via FastAPI /attendance endpoint
  return [
    { subject: 'Data Structures & Algorithms', code: 'CS301', attended: 42, total: 45, percentage: 93.3 },
    { subject: 'Operating Systems', code: 'CS302', attended: 38, total: 40, percentage: 95.0 },
    { subject: 'Database Management Systems', code: 'CS303', attended: 35, total: 38, percentage: 92.1 },
    { subject: 'Computer Networks', code: 'CS304', attended: 40, total: 42, percentage: 95.2 },
    { subject: 'Artificial Intelligence', code: 'CS305', attended: 36, total: 38, percentage: 94.7 },
  ];
}
