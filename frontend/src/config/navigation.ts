import {
  SquarePen,
  FileText,
  Brain,
  Briefcase,
  BookOpen,
  Settings,
  LucideIcon,
} from 'lucide-react';

export interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: LucideIcon;
  colorClass: string;
  matchPaths?: string[];
  isAction?: boolean;
}

export const mainNavItems: NavItem[] = [
  {
    id: 'new-chat',
    label: 'New Chat',
    path: '/dashboard?newChat=true',
    icon: SquarePen,
    colorClass: 'text-[#0E2A6D] dark:text-white',
    isAction: true,
  },
  {
    id: 'documents',
    label: 'AI Document Hub',
    path: '/documents',
    icon: FileText,
    colorClass: 'text-[#0E2A6D] dark:text-[#60A5FA]',
  },
  {
    id: 'quiz',
    label: 'AI Quiz Generator',
    path: '/quiz',
    icon: Brain,
    colorClass: 'text-[#1E4DB7] dark:text-[#60A5FA]',
    matchPaths: ['/quiz', '/quiz-generator'],
  },
  {
    id: 'placement',
    label: 'AI Placement Hub',
    path: '/placement',
    icon: Briefcase,
    colorClass: 'text-[#D9A441]',
    matchPaths: ['/placement', '/placement-hub'],
  },
  {
    id: 'notes',
    label: 'Knowledge Base',
    path: '/notes',
    icon: BookOpen,
    colorClass: 'text-[#1E4DB7] dark:text-[#60A5FA]',
  },
  {
    id: 'settings',
    label: 'Settings',
    path: '/settings',
    icon: Settings,
    colorClass: 'text-[#64748B] dark:text-[#94A3B8]',
  },
];
