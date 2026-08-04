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
  Sparkles,
  Scan,
  FolderKanban,
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
    colorClass: 'text-zinc-900 dark:text-zinc-100',
    isAction: true,
    allowedRoles: ['student'],
  },
  {
    id: 'ai-workspaces',
    label: 'AI Workspaces',
    path: '/workspaces',
    icon: FolderKanban,
    colorClass: 'text-zinc-700 dark:text-zinc-300',
    matchPaths: ['/workspaces'],
    allowedRoles: ['student', 'admin'],
  },
  {
    id: 'ai-ocr',
    label: 'AI OCR Scanner',
    path: '/ai-ocr',
    icon: Scan,
    colorClass: 'text-zinc-700 dark:text-zinc-300',
    matchPaths: ['/ai-ocr', '/ocr-scanner'],
    allowedRoles: ['student', 'admin'],
  },
  {
    id: 'ai-notes',
    label: 'AI Notes Generator',
    path: '/ai-notes',
    icon: Sparkles,
    colorClass: 'text-zinc-700 dark:text-zinc-300',
    matchPaths: ['/ai-notes', '/notes-generator'],
    allowedRoles: ['student', 'admin'],
  },
  {
    id: 'ai-resume',
    label: 'AI Resume Builder',
    path: '/resume-builder',
    icon: Briefcase,
    colorClass: 'text-zinc-700 dark:text-zinc-300',
    matchPaths: ['/resume-builder', '/placement/resume'],
    allowedRoles: ['student', 'admin'],
  },
  {
    id: 'documents',
    label: 'AI Document Hub',
    path: '/documents',
    icon: FileText,
    colorClass: 'text-zinc-700 dark:text-zinc-300',
    allowedRoles: ['student'],
  },
  {
    id: 'quiz',
    label: 'AI Quiz Generator',
    path: '/quiz',
    icon: Brain,
    colorClass: 'text-zinc-700 dark:text-zinc-300',
    matchPaths: ['/quiz', '/quiz-generator'],
    allowedRoles: ['student'],
  },
  {
    id: 'placement',
    label: 'AI Placement Hub',
    path: '/placement',
    icon: Briefcase,
    colorClass: 'text-zinc-700 dark:text-zinc-300',
    matchPaths: ['/placement', '/placement-hub'],
    allowedRoles: ['student'],
  },
  {
    id: 'timetable',
    label: 'Smart Timetable',
    path: '/timetable',
    icon: Calendar,
    colorClass: 'text-zinc-700 dark:text-zinc-300',
    matchPaths: ['/timetable'],
    allowedRoles: ['student'],
  },
  {
    id: 'assignments',
    label: 'Smart Assignments',
    path: '/assignments',
    icon: ClipboardList,
    colorClass: 'text-zinc-700 dark:text-zinc-300',
    matchPaths: ['/assignments'],
    allowedRoles: ['student'],
  },
  {
    id: 'question-papers',
    label: 'Previous Year Papers',
    path: '/question-papers',
    icon: Files,
    colorClass: 'text-zinc-700 dark:text-zinc-300',
    matchPaths: ['/question-papers'],
    allowedRoles: ['student'],
  },
  {
    id: 'study-planner',
    label: 'AI Study Planner',
    path: '/study-planner',
    icon: CalendarDays,
    colorClass: 'text-zinc-700 dark:text-zinc-300',
    matchPaths: ['/study-planner'],
    allowedRoles: ['student'],
  },
  {
    id: 'mock-interviews',
    label: 'AI Mock Interviews',
    path: '/mock-interviews',
    icon: UserRound,
    colorClass: 'text-zinc-700 dark:text-zinc-300',
    matchPaths: ['/mock-interviews'],
    allowedRoles: ['student'],
  },
  {
    id: 'analytics',
    label: 'AI Analytics',
    path: '/analytics',
    icon: BarChart3,
    colorClass: 'text-zinc-700 dark:text-zinc-300',
    matchPaths: ['/analytics'],
    allowedRoles: ['student'],
  },

  // ── Faculty Dedicated Items ──
  {
    id: 'faculty-dashboard',
    label: 'Dashboard',
    path: '/faculty',
    icon: GraduationCap,
    colorClass: 'text-zinc-700 dark:text-zinc-300',
    matchPaths: ['/faculty'],
    allowedRoles: ['faculty'],
  },
  {
    id: 'faculty-attendance',
    label: 'Attendance',
    path: '/faculty?tab=attendance',
    icon: ClipboardCheck,
    colorClass: 'text-zinc-700 dark:text-zinc-300',
    allowedRoles: ['faculty'],
  },
  {
    id: 'faculty-assignments',
    label: 'Assignments',
    path: '/faculty?tab=assignments',
    icon: FileText,
    colorClass: 'text-zinc-700 dark:text-zinc-300',
    allowedRoles: ['faculty'],
  },
  {
    id: 'faculty-question-papers',
    label: 'Question Papers',
    path: '/faculty?tab=question-papers',
    icon: Files,
    colorClass: 'text-zinc-700 dark:text-zinc-300',
    allowedRoles: ['faculty'],
  },
  {
    id: 'faculty-quizzes',
    label: 'Quizzes',
    path: '/faculty?tab=quizzes',
    icon: Brain,
    colorClass: 'text-zinc-700 dark:text-zinc-300',
    allowedRoles: ['faculty'],
  },
  {
    id: 'faculty-timetable',
    label: 'Time Tables',
    path: '/faculty?tab=timetable',
    icon: CalendarDays,
    colorClass: 'text-zinc-700 dark:text-zinc-300',
    allowedRoles: ['faculty'],
  },
  {
    id: 'faculty-students',
    label: 'Student Roster',
    path: '/faculty?tab=students',
    icon: Users,
    colorClass: 'text-zinc-700 dark:text-zinc-300',
    allowedRoles: ['faculty'],
  },

  // ── Admin Dedicated Items ──
  {
    id: 'admin',
    label: 'Admin Dashboard',
    path: '/admin',
    icon: ShieldCheck,
    colorClass: 'text-zinc-700 dark:text-zinc-300',
    matchPaths: ['/admin'],
    allowedRoles: ['admin'],
  },

  // ── Shared Items ──
  {
    id: 'notes',
    label: 'Knowledge Base',
    path: '/notes',
    icon: BookOpen,
    colorClass: 'text-zinc-700 dark:text-zinc-300',
    allowedRoles: ['student'],
  },
  {
    id: 'settings',
    label: 'Settings',
    path: '/settings',
    icon: Settings,
    colorClass: 'text-zinc-700 dark:text-zinc-300',
    allowedRoles: ['student', 'admin'],
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
