import React from 'react';
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

interface Props {
  stats: AdminMasterOverviewStats | null;
  loading: boolean;
  onNavigateTab: (tab: string) => void;
}

export const AdminOverviewManager: React.FC<Props> = ({ stats, loading, onNavigateTab }) => {
  if (loading || !stats) {
    return (
      <div className="space-y-6 animate-pulse font-body">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-slate-200 dark:bg-slate-800" />
          ))}
        </div>
      </div>
    );
  }

  const kpiCards = [
    { title: 'Total Students', value: stats.total_students, icon: Users, color: 'text-[#0E2A6D] dark:text-[#60A5FA]', bg: 'bg-[#0E2A6D]/10 dark:bg-[#0E2A6D]/30', tab: 'users' },
    { title: 'Total Faculty', value: stats.total_faculty, icon: GraduationCap, color: 'text-[#D9A441]', bg: 'bg-[#D9A441]/10', tab: 'users' },
    { title: 'Departments', value: stats.total_departments, icon: Building2, color: 'text-[#111827] dark:text-[#FAFAFA]', bg: 'bg-[#F8FAFC] dark:bg-[#111111]', tab: 'departments' },
    { title: 'Active Courses', value: stats.total_courses, icon: BookOpen, color: 'text-[#1E4DB7] dark:text-[#60A5FA]', bg: 'bg-[#1E4DB7]/10', tab: 'departments' },
    { title: 'Attendance Rate', value: `${stats.overall_attendance_rate}%`, icon: ClipboardCheck, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10', tab: 'academics' },
    { title: 'Assignments Created', value: stats.total_assignments, icon: FileText, color: 'text-[#0E2A6D] dark:text-[#60A5FA]', bg: 'bg-[#0E2A6D]/10', tab: 'academics' },
    { title: 'Question Papers', value: stats.total_question_papers, icon: FileText, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10', tab: 'academics' },
    { title: 'Placement Drives', value: stats.total_placements, icon: Briefcase, color: 'text-[#D9A441]', bg: 'bg-[#D9A441]/10', tab: 'placements' },
  ];

  return (
    <div className="space-y-6 font-body">
      {/* ── KPI Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((c, idx) => {
          const Icon = c.icon;
          return (
            <div
              key={idx}
              onClick={() => onNavigateTab(c.tab)}
              className="bg-white dark:bg-[#1E293B] p-5 rounded-2xl border border-[#E2E8F0] dark:border-[#334155] shadow-xs flex items-center justify-between cursor-pointer hover:border-[#1E4DB7]/40 transition group"
            >
              <div className="space-y-1">
                <p className="text-caption font-medium text-[#64748B] dark:text-[#94A3B8]">{c.title}</p>
                <p className="font-heading font-bold text-2xl text-[#1F2937] dark:text-[#F8FAFC]">{c.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl ${c.bg} ${c.color} flex items-center justify-center shrink-0 group-hover:scale-105 transition`}>
                <Icon size={22} strokeWidth={1.75} />
              </div>
            </div>
          );
        })}
      </div>

      {/* ── System Health & Usage Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System Health Status */}
        <div className="bg-white dark:bg-[#1E293B] p-6 rounded-2xl border border-[#E2E8F0] dark:border-[#334155] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-bold text-card text-[#1F2937] dark:text-[#F8FAFC] flex items-center gap-2">
              <Activity className="text-emerald-600 dark:text-emerald-400" size={20} />
              System Health & Status
            </h3>
            <span className="text-caption font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              Operational
            </span>
          </div>

          <div className="space-y-4 pt-2">
            <div>
              <div className="flex justify-between text-caption font-semibold mb-1">
                <span className="text-[#64748B] dark:text-[#94A3B8]">Overall System Uptime</span>
                <span className="text-emerald-600 dark:text-emerald-400">{stats.system_health_percentage}%</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${stats.system_health_percentage}%` }} />
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F5F7FB] dark:bg-[#0F172A] space-y-2 text-caption">
              <div className="flex justify-between">
                <span className="text-[#64748B]">FastAPI Engine:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">Healthy (2ms)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">ChromaDB Vector Store:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">Online</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">SQLite Database:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">Connected</span>
              </div>
            </div>
          </div>
        </div>

        {/* Cloud Storage Usage */}
        <div className="bg-white dark:bg-[#1E293B] p-6 rounded-2xl border border-[#E2E8F0] dark:border-[#334155] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-bold text-card text-[#1F2937] dark:text-[#F8FAFC] flex items-center gap-2">
              <HardDrive className="text-[#0E2A6D] dark:text-[#60A5FA]" size={20} />
              Storage Consumption
            </h3>
            <button onClick={() => onNavigateTab('documents')} className="text-nav text-[#1E4DB7] dark:text-[#60A5FA] font-bold">
              Manage Docs
            </button>
          </div>

          <div className="space-y-4 pt-2">
            <div>
              <div className="flex justify-between text-caption font-semibold mb-1">
                <span className="text-[#64748B] dark:text-[#94A3B8]">Used Storage</span>
                <span className="text-[#0E2A6D] dark:text-[#60A5FA] font-bold">
                  {stats.storage_usage_gb} GB / {stats.storage_limit_gb} GB
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-[#0E2A6D] dark:bg-[#60A5FA] rounded-full"
                  style={{ width: `${(stats.storage_usage_gb / stats.storage_limit_gb) * 100}%` }}
                />
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F5F7FB] dark:bg-[#0F172A] space-y-2 text-caption">
              <div className="flex justify-between">
                <span className="text-[#64748B]">Uploaded Documents:</span>
                <span className="font-bold text-[#1F2937] dark:text-[#F8FAFC]">{stats.uploaded_documents} files</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">RAG Vector Chunks:</span>
                <span className="font-bold text-[#1F2937] dark:text-[#F8FAFC]">1,420 Chunks</span>
              </div>
            </div>
          </div>
        </div>

        {/* Daily Active Users Quick Widget */}
        <div className="bg-white dark:bg-[#1E293B] p-6 rounded-2xl border border-[#E2E8F0] dark:border-[#334155] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-bold text-card text-[#1F2937] dark:text-[#F8FAFC] flex items-center gap-2">
              <BarChart3 className="text-[#D9A441]" size={20} />
              Active User Engagement
            </h3>
            <button onClick={() => onNavigateTab('analytics')} className="text-nav text-[#1E4DB7] dark:text-[#60A5FA] font-bold">
              Full Analytics
            </button>
          </div>

          <div className="space-y-4 pt-2">
            <div className="p-4 rounded-xl bg-[#F5F7FB] dark:bg-[#0F172A] text-center space-y-1">
              <p className="text-caption font-medium text-[#64748B]">Daily Active Campus Users</p>
              <p className="font-heading font-bold text-3xl text-[#0E2A6D] dark:text-[#D9A441]">{stats.daily_active_users}</p>
            </div>

            <div className="flex items-center justify-between text-caption text-[#64748B]">
              <span>Peak Hours: <strong>10:00 AM - 02:00 PM</strong></span>
              <span>Avg Session: <strong>24 mins</strong></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
