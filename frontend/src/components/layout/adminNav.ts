import {
  ShieldCheck,
  BarChart3,
  Users,
  Building2,
  BookOpen,
  Briefcase,
  Database,
  Bell,
  Settings2,
} from 'lucide-react';

export const ADMIN_TABS = [
  { id: 'overview',       label: 'Overview',          icon: BarChart3    },
  { id: 'users',          label: 'User Management',   icon: Users        },
  { id: 'departments',    label: 'Departments',        icon: Building2    },
  { id: 'academics',      label: 'Academic Control',  icon: BookOpen     },
  { id: 'placements',     label: 'Placements',        icon: Briefcase    },
  { id: 'documents',      label: 'RAG Documents',     icon: Database     },
  { id: 'announcements',  label: 'Announcements',     icon: Bell         },
  { id: 'analytics',      label: 'Analytics',         icon: BarChart3    },
  { id: 'settings',       label: 'System Settings',   icon: Settings2    },
] as const;

export type AdminTabId = typeof ADMIN_TABS[number]['id'];
