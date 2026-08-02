import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Users,
  GraduationCap,
  Building2,
  BookOpen,
  ClipboardCheck,
  FileText,
  Upload,
  Download,
  Bell,
  Settings2,
  Database,
  BarChart3,
  Search,
  Filter,
  Briefcase,
  Files,
  Brain,
  CalendarDays,
  LogOut,
  RefreshCw,
} from 'lucide-react';
import { adminDashboardApi, AdminMasterOverviewStats } from '../api/adminDashboard';
import { AdminOverviewManager } from '../components/admin/AdminOverviewManager';
import { AdminUserManagement } from '../components/admin/AdminUserManagement';
import { AdminDepartmentManagement } from '../components/admin/AdminDepartmentManagement';
import { AdminAcademicManager } from '../components/admin/AdminAcademicManager';
import { AdminPlacementManager } from '../components/admin/AdminPlacementManager';
import { AdminDocumentManager } from '../components/admin/AdminDocumentManager';
import { AdminAnnouncementManager } from '../components/admin/AdminAnnouncementManager';
import { AdminAnalyticsManager } from '../components/admin/AdminAnalyticsManager';
import { AdminSettingsManager } from '../components/admin/AdminSettingsManager';
import { useAuth } from '../hooks/useAuth';

export default function AdminDashboardPage() {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [overviewStats, setOverviewStats] = useState<AdminMasterOverviewStats | null>(null);
  const [loading, setLoading] = useState(false);

  // Global Filters & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('All');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  useEffect(() => {
    fetchOverview();
  }, []);

  const fetchOverview = async () => {
    try {
      setLoading(true);
      const stats = await adminDashboardApi.getOverviewStats();
      setOverviewStats(stats);
    } catch (err) {
      console.error('Error fetching admin overview:', err);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'departments', label: 'Departments & Courses', icon: Building2 },
    { id: 'academics', label: 'Academic Control', icon: BookOpen },
    { id: 'placements', label: 'Placements', icon: Briefcase },
    { id: 'documents', label: 'RAG Documents', icon: Database },
    { id: 'announcements', label: 'Announcements', icon: Bell },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'System Settings', icon: Settings2 },
  ];

  const handleExportCSV = () => {
    const csvContent = "Category,Metric,Value\nTotal Students,Count,320\nTotal Faculty,Count,24\nUptime,Percentage,99.8%\nStorage Used,GB,42.5 GB\n";
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Admin_Master_Report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F5F7FB] dark:bg-[#0F172A] text-[#1F2937] dark:text-[#F8FAFC] font-body">
      {/* ── Admin Master Sidebar ── */}
      <aside className="hidden md:flex w-64 shrink-0 flex-col bg-white dark:bg-[#1E293B] border-r border-[#E2E8F0] dark:border-[#334155] p-4 select-none">
        <div className="flex items-center gap-3 mb-6 px-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#0E2A6D] to-[#1E4DB7] text-white shadow-xs border border-[#D9A441]/30">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h2 className="font-heading font-extrabold text-nav tracking-[0.02em] text-[#0E2A6D] dark:text-[#F8FAFC]">
              CollegeMate AI
            </h2>
            <p className="font-heading text-caption font-bold uppercase tracking-[0.05em] text-[#D9A441]">
              Master Admin Cockpit
            </p>
          </div>
        </div>

        {/* Sidebar Nav */}
        <nav className="space-y-1 flex-1 overflow-y-auto pr-1 no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-heading text-nav font-bold tracking-[0.02em] transition-colors ${
                  active
                    ? 'bg-[#0E2A6D] text-white shadow-xs'
                    : 'text-[#64748B] dark:text-[#94A3B8] hover:bg-[#F5F7FB] dark:hover:bg-[#0F172A] hover:text-[#0E2A6D] dark:hover:text-[#F8FAFC]'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="pt-4 border-t border-[#E2E8F0] dark:border-[#334155]">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-heading text-nav font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ── Main Admin Content Body ── */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-16 shrink-0 bg-white dark:bg-[#1E293B] border-b border-[#E2E8F0] dark:border-[#334155] px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="font-heading font-bold text-xl text-[#0E2A6D] dark:text-white capitalize">
              {tabs.find((t) => t.id === activeTab)?.label}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportCSV}
              className="h-9 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F5F7FB] dark:bg-[#0F172A] hover:bg-[#0E2A6D] hover:text-white text-caption font-bold text-[#0E2A6D] dark:text-[#60A5FA] flex items-center gap-2 transition"
            >
              <Download size={15} /> Export Report
            </button>
          </div>
        </header>

        {/* Content Area with Global Filters */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Global Filter Bar */}
          <div className="bg-white dark:bg-[#1E293B] p-4 rounded-2xl border border-[#E2E8F0] dark:border-[#334155] shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Global search across users, courses, departments, documents..."
                className="w-full h-10 pl-10 pr-4 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F5F7FB] dark:bg-[#0F172A] text-body text-[#1F2937] dark:text-[#F8FAFC] outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <div className="flex items-center gap-1.5">
                <Filter size={15} className="text-[#64748B]" />
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="h-10 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F5F7FB] dark:bg-[#0F172A] px-3 text-caption font-bold text-[#1F2937] dark:text-[#F8FAFC] outline-none"
                >
                  <option value="All">All Roles</option>
                  <option value="student">Student</option>
                  <option value="faculty">Faculty</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="h-10 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F5F7FB] dark:bg-[#0F172A] px-3 text-caption font-bold text-[#1F2937] dark:text-[#F8FAFC] outline-none"
              >
                <option value="All">All Departments</option>
                <option value="Computer Science & Engineering">CS & Engineering</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Electronics & Communication">Electronics & Comm</option>
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="h-10 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F5F7FB] dark:bg-[#0F172A] px-3 text-caption font-bold text-[#1F2937] dark:text-[#F8FAFC] outline-none"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>
          </div>

          {/* Active Tab View */}
          {activeTab === 'overview' && (
            <AdminOverviewManager stats={overviewStats} loading={loading} onNavigateTab={(t) => setActiveTab(t)} />
          )}
          {activeTab === 'users' && (
            <AdminUserManagement
              selectedRole={selectedRole}
              selectedDept={selectedDept}
              selectedStatus={selectedStatus}
              searchQuery={searchQuery}
            />
          )}
          {activeTab === 'departments' && <AdminDepartmentManagement />}
          {activeTab === 'academics' && <AdminAcademicManager />}
          {activeTab === 'placements' && <AdminPlacementManager />}
          {activeTab === 'documents' && <AdminDocumentManager />}
          {activeTab === 'announcements' && <AdminAnnouncementManager />}
          {activeTab === 'analytics' && <AdminAnalyticsManager />}
          {activeTab === 'settings' && <AdminSettingsManager />}
        </div>
      </main>
    </div>
  );
}
