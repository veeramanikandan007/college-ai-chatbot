export interface TimetableItem {
  id: number;
  day_of_week: string;
  period_number: number;
  start_time: string;
  end_time: string;
  subject_name: string;
  subject_code: string;
  subject_type: 'Theory' | 'Lab' | 'Seminar';
  faculty_name: string;
  classroom: string;
  color_code: string;
  status?: 'Ongoing' | 'Upcoming' | 'Completed';
}

export interface AcademicEvent {
  date: string;
  title: string;
  type: 'Class Day' | 'Exam Day' | 'Holiday' | 'Event';
}
