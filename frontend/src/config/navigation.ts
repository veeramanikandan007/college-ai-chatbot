import {
  SquarePen,
  FileText,
  Brain,
  Briefcase,
  Calendar,
  BookOpen,
  Settings,
  ClipboardList,
  Files,
  CalendarDays,
  UserRound,
  LucideIcon,
  BarChart3,
  GraduationCap,
  ShieldCheck,
  Users,
  ClipboardCheck,
} from 'lucide-react';

export interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: LucideIcon;
  colorClass: string;
  matchPaths?: string[];
  isAction?: boolean;
  allowedRoles: Array<'student' | 'faculty' | 'admin'>;
}

export const mainNavItems: NavItem[] = [
  // ── Student Only Items ──
  {
    id: 'new-chat',
    label: 'New Chat',
    path: '/dashboard?newChat=true',
    icon: SquarePen,
    colorClass: 'text-[#0E2A6D] dark:text-white',
    isAction: true,
    allowedRoles: ['student'],
  },
  {
    id: 'documents',
    label: 'AI Document Hub',
    path: '/documents',
    icon: FileText,
    colorClass: 'text-[#0E2A6D] dark:text-[#60A5FA]',
    allowedRoles: ['student'],
  },
  {
    id: 'quiz',
    label: 'AI Quiz Generator',
    path: '/quiz',
    icon: Brain,
    colorClass: 'text-[#1E4DB7] dark:text-[#60A5FA]',
    matchPaths: ['/quiz', '/quiz-generator'],
    allowedRoles: ['student'],
  },
  {
    id: 'placement',
    label: 'AI Placement Hub',
    path: '/placement',
    icon: Briefcase,
    colorClass: 'text-[#D9A441]',
    matchPaths: ['/placement', '/placement-hub'],
    allowedRoles: ['student'],
  },
  {
    id: 'timetable',
    label: 'Smart Timetable',
    path: '/timetable',
    icon: Calendar,
    colorClass: 'text-[#10B981] dark:text-[#34D399]',
    matchPaths: ['/timetable'],
    allowedRoles: ['student'],
  },
  {
    id: 'assignments',
    label: 'Smart Assignments',
    path: '/assignments',
    icon: ClipboardList,
    colorClass: 'text-[#0E2A6D] dark:text-[#60A5FA]',
    matchPaths: ['/assignments'],
    allowedRoles: ['student'],
  },
  {
    id: 'question-papers',
    label: 'Previous Year Papers',
    path: '/question-papers',
    icon: Files,
    colorClass: 'text-[#D9A441]',
    matchPaths: ['/question-papers'],
    allowedRoles: ['student'],
  },
  {
    id: 'study-planner',
    label: 'AI Study Planner',
    path: '/study-planner',
    icon: CalendarDays,
    colorClass: 'text-purple-600 dark:text-purple-400',
    matchPaths: ['/study-planner'],
    allowedRoles: ['student'],
  },
  {
    id: 'mock-interviews',
    label: 'AI Mock Interviews',
    path: '/mock-interviews',
    icon: UserRound,
    colorClass: 'text-[#0E2A6D] dark:text-[#60A5FA]',
    matchPaths: ['/mock-interviews'],
    allowedRoles: ['student'],
  },
  {
    id: 'analytics',
    label: 'AI Analytics',
    path: '/analytics',
    icon: BarChart3,
    colorClass: 'text-[#D9A441]',
    matchPaths: ['/analytics'],
    allowedRoles: ['student'],
  },

  // ── Faculty Dedicated Items ──
  {
    id: 'faculty-dashboard',
    label: 'Dashboard',
    path: '/faculty',
    icon: GraduationCap,
    colorClass: 'text-[#0E2A6D] dark:text-[#D9A441]',
    matchPaths: ['/faculty'],
    allowedRoles: ['faculty'],
  },
  {
    id: 'faculty-attendance',
    label: 'Attendance',
    path: '/faculty?tab=attendance',
    icon: ClipboardCheck,
    colorClass: 'text-[#10B981] dark:text-[#34D399]',
    allowedRoles: ['faculty'],
  },
  {
    id: 'faculty-assignments',
    label: 'Assignments',
    path: '/faculty?tab=assignments',
    icon: FileText,
    colorClass: 'text-[#1E4DB7] dark:text-[#60A5FA]',
    allowedRoles: ['faculty'],
  },
  {
    id: 'faculty-question-papers',
    label: 'Question Papers',
    path: '/faculty?tab=question-papers',
    icon: Files,
    colorClass: 'text-[#D9A441]',
    allowedRoles: ['faculty'],
  },
  {
    id: 'faculty-quizzes',
    label: 'Quiz Management',
    path: '/faculty?tab=quizzes',
    icon: Brain,
    colorClass: 'text-purple-600 dark:text-purple-400',
    allowedRoles: ['faculty'],
  },
  {
    id: 'faculty-timetable',
    label: 'Timetable',
    path: '/faculty?tab=timetable',
    icon: CalendarDays,
    colorClass: 'text-[#10B981] dark:text-[#34D399]',
    allowedRoles: ['faculty'],
  },
  {
    id: 'faculty-students',
    label: 'Student Roster',
    path: '/faculty?tab=students',
    icon: Users,
    colorClass: 'text-[#0E2A6D] dark:text-[#60A5FA]',
    allowedRoles: ['faculty'],
  },

  // ── Admin Dedicated Items ──
  {
    id: 'admin',
    label: 'Admin Dashboard',
    path: '/admin',
    icon: ShieldCheck,
    colorClass: 'text-rose-600 dark:text-rose-400',
    matchPaths: ['/admin'],
    allowedRoles: ['admin'],
  },

  // ── Shared Items ──
  {
    id: 'notes',
    label: 'Knowledge Base',
    path: '/notes',
    icon: BookOpen,
    colorClass: 'text-[#1E4DB7] dark:text-[#60A5FA]',
    allowedRoles: ['student', 'faculty'],
  },
  {
    id: 'settings',
    label: 'Settings',
    path: '/settings',
    icon: Settings,
    colorClass: 'text-[#64748B] dark:text-[#94A3B8]',
    allowedRoles: ['student', 'faculty', 'admin'],
  },
];

export function getNavItemsForRole(role?: string): NavItem[] {
  const normalizedRole = (role || 'student').toLowerCase() as 'student' | 'faculty' | 'admin';
  return mainNavItems.filter((item) => item.allowedRoles.includes(normalizedRole));
}

export function getDefaultHomeForRole(role?: string): string {
  const normalizedRole = (role || 'student').toLowerCase();
  if (normalizedRole === 'admin') return '/admin';
  if (normalizedRole === 'faculty') return '/faculty';
  return '/dashboard';
}
