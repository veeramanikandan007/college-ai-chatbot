export interface CampusNotification {
  id: string;
  title: string;
  category: 'Exam' | 'Library' | 'Fee' | 'General';
  message: string;
  date: string;
  read: boolean;
}

export async function getNotifications(): Promise<CampusNotification[]> {
  // TODO: Connect to FastAPI /notifications endpoint
  return [
    {
      id: 'n1',
      title: 'Mid-Semester Exam Schedule',
      category: 'Exam',
      message: 'Mid-term examinations start August 15th. Check portal for seating.',
      date: 'Today, 09:00 AM',
      read: false,
    },
    {
      id: 'n2',
      title: 'Library Hours Extended',
      category: 'Library',
      message: 'Reading rooms will remain open until 10:00 PM starting next week.',
      date: 'Yesterday',
      read: false,
    },
    {
      id: 'n3',
      title: 'Semester Fee Receipt',
      category: 'Fee',
      message: 'Your 6th Semester fee payment of $1,200 has been verified.',
      date: '3 days ago',
      read: true,
    },
  ];
}
