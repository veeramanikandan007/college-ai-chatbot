import React from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  GraduationCap,
  Building2,
  BookOpen,
  ClipboardCheck,
  FileText,
  Briefcase,
  Database,
  Activity,
  HardDrive,
  ShieldCheck,
  BarChart3,
} from 'lucide-react';
import { AdminMasterOverviewStats } from '../../api/adminDashboard';
import { StatsCard } from '../ui/StatsCard';
import { LoadingSkeleton } from '../ui/LoadingSkeleton';
import { DashboardCard } from '../ui/DashboardCard';
import { SectionHeader } from '../ui/SectionHeader';

interface Props {
  stats: AdminMasterOverviewStats | null;
  loading: boolean;
  onNavigateTab: (tab: string) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

export const AdminOverviewManager: React.FC<Props> = ({ stats, loading, onNavigateTab }) => {
  if (loading || !stats) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <LoadingSkeleton key={i} count={1} height="h-28" />
        ))}
      </div>
    );
  }

  const kpiCards = [
    { title: 'Total Students', value: stats.total_students, icon: Users, tab: 'users', subtitle: 'Active accounts' },
    { title: 'Total Faculty', value: stats.total_faculty, icon: GraduationCap, tab: 'users', subtitle: 'Registered professors' },
    { title: 'Departments', value: stats.total_departments, icon: Building2, tab: 'departments', subtitle: 'Academic units' },
    { title: 'Active Courses', value: stats.total_courses, icon: BookOpen, tab: 'departments', subtitle: 'Running this semester' },
    { title: 'Attendance Rate', value: `${stats.overall_attendance_rate}%`, icon: ClipboardCheck, tab: 'academics', trend: { value: 'Overall Avg', isPositive: stats.overall_attendance_rate >= 75 } },
    { title: 'Assignments Created', value: stats.total_assignments, icon: FileText, tab: 'academics' },
    { title: 'Question Papers', value: stats.total_question_papers, icon: FileText, tab: 'academics' },
    { title: 'Placement Drives', value: stats.total_placements, icon: Briefcase, tab: 'placements' },
  ];

  return (
    <div className="space-y-6">
      {/* ── KPI Stat Cards ── */}
      <motion.div 
        variants={containerVariants} 
        initial="hidden" 
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {kpiCards.map((c, idx) => (
          <motion.div key={idx} variants={itemVariants} onClick={() => onNavigateTab(c.tab)} className="cursor-pointer group h-full">
            <StatsCard
              title={c.title}
              value={c.value}
              subtitle={c.subtitle}
              icon={c.icon}
              trend={c.trend}
              className="group-hover:border-zinc-300 dark:group-hover:border-zinc-700 transition-colors h-full"
            />
          </motion.div>
        ))}
      </motion.div>

      {/* ── System Health & Usage Grid ── */}
      <motion.div 
        variants={containerVariants} 
        initial="hidden" 
        animate="show" 
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* System Health Status */}
        <motion.div variants={itemVariants} className="h-full">
          <DashboardCard className="space-y-4 h-full">
            <SectionHeader
              title="System Health & Status"
              icon={Activity}
              iconColor="text-emerald-600 dark:text-emerald-400"
              action={
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                  Operational
                </span>
              }
              className="mb-4"
            />

            <div className="space-y-4 pt-2">
              <div>
                <div className="flex justify-between text-xs font-medium mb-2">
                  <span className="text-zinc-500 dark:text-zinc-400">Overall System Uptime</span>
                  <span className="text-emerald-600 dark:text-emerald-400">{stats.system_health_percentage}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${stats.system_health_percentage}%` }} />
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-zinc-500 dark:text-zinc-400">FastAPI Engine:</span>
                  <span className="font-medium text-emerald-600 dark:text-emerald-400">Healthy (2ms)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500 dark:text-zinc-400">ChromaDB Vector Store:</span>
                  <span className="font-medium text-emerald-600 dark:text-emerald-400">Online</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500 dark:text-zinc-400">SQLite Database:</span>
                  <span className="font-medium text-emerald-600 dark:text-emerald-400">Connected</span>
                </div>
              </div>
            </div>
          </DashboardCard>
        </motion.div>

        {/* Cloud Storage Usage */}
        <motion.div variants={itemVariants} className="h-full">
          <DashboardCard className="space-y-4 h-full">
            <SectionHeader
              title="Storage Consumption"
              icon={HardDrive}
              iconColor="text-blue-600 dark:text-blue-400"
              action={
                <button onClick={() => onNavigateTab('documents')} className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium transition-colors">
                  Manage Docs
                </button>
              }
              className="mb-4"
            />

            <div className="space-y-4 pt-2">
              <div>
                <div className="flex justify-between text-xs font-medium mb-2">
                  <span className="text-zinc-500 dark:text-zinc-400">Used Storage</span>
                  <span className="text-blue-600 dark:text-blue-400 font-medium">
                    {stats.storage_usage_gb} GB / {stats.storage_limit_gb} GB
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${(stats.storage_usage_gb / stats.storage_limit_gb) * 100}%` }}
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-zinc-500 dark:text-zinc-400">Uploaded Documents:</span>
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">{stats.uploaded_documents} files</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500 dark:text-zinc-400">RAG Vector Chunks:</span>
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">1,420 Chunks</span>
                </div>
              </div>
            </div>
          </DashboardCard>
        </motion.div>

        {/* Daily Active Users Quick Widget */}
        <motion.div variants={itemVariants} className="h-full">
          <DashboardCard className="space-y-4 h-full">
            <SectionHeader
              title="Active User Engagement"
              icon={BarChart3}
              iconColor="text-amber-500 dark:text-amber-400"
              action={
                <button onClick={() => onNavigateTab('analytics')} className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium transition-colors">
                  Full Analytics
                </button>
              }
              className="mb-4"
            />

            <div className="space-y-4 pt-2">
              <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 text-center space-y-2">
                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Daily Active Campus Users</p>
                <p className="font-heading font-bold text-4xl text-zinc-900 dark:text-zinc-100">{stats.daily_active_users}</p>
              </div>

              <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                <span>Peak: <strong className="text-zinc-700 dark:text-zinc-300 font-medium">10:00 AM - 02:00 PM</strong></span>
                <span>Avg Session: <strong className="text-zinc-700 dark:text-zinc-300 font-medium">24 mins</strong></span>
              </div>
            </div>
          </DashboardCard>
        </motion.div>
      </motion.div>
    </div>
  );
};
