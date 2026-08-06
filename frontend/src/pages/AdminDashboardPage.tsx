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

import { useSearchParams } from 'react-router-dom';

export default function AdminDashboardPage() {
  const { logout } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const tabFromUrl = searchParams.get('tab') || 'overview';
  const roleFromUrl = searchParams.get('role');

  const [activeTab, setActiveTab] = useState<string>(tabFromUrl);
  const [overviewStats, setOverviewStats] = useState<AdminMasterOverviewStats | null>(null);
  const [loading, setLoading] = useState(false);

  // Global Filters & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState(roleFromUrl ? roleFromUrl : 'All');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  useEffect(() => {
    const currentTab = searchParams.get('tab') || 'overview';
    const currentRole = searchParams.get('role');
    setActiveTab(currentTab);
    if (currentRole) {
      setSelectedRole(currentRole);
    }
  }, [searchParams]);

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
    <div className="w-full h-full overflow-x-hidden overflow-y-auto bg-[#F8FAFC] dark:bg-[#0A0A0A] text-[#111827] dark:text-[#FAFAFA] p-4 sm:p-6 lg:p-8 transition-colors select-none font-sans">
      {/* 1440px Centered Container with 32px (space-y-8) Section Gap */}
      <div className="w-full max-w-[1440px] mx-auto space-y-8">

        {/* ── Page Hero Header ── */}
        <div className="bg-[#FFFFFF] dark:bg-[#18181B] p-4 sm:p-6 rounded-[16px] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
          <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-[12px] bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] flex items-center justify-center shrink-0">
              <ShieldCheck size={22} className="sm:hidden" />
              <ShieldCheck size={24} className="hidden sm:block" />
            </div>
            <div className="min-w-0 space-y-0.5 sm:space-y-1">
              <h1 className="text-[22px] sm:text-[30px] font-semibold text-[#111827] dark:text-[#FAFAFA] tracking-tight leading-tight truncate">
                Admin Control Portal
              </h1>
              <p className="text-[13px] sm:text-[15px] font-normal text-[#6B7280] dark:text-[#A1A1AA] line-clamp-2 sm:line-clamp-none">
                Enterprise management suite for system users, academic control, department operations, placements, and AI RAG knowledge.
              </p>
            </div>
          </div>

          {/* Action Badge & Controls */}
          <div className="flex items-center gap-3 shrink-0 self-start sm:self-auto">
            <button
              onClick={handleExportCSV}
              className="h-[38px] sm:h-[40px] px-3.5 sm:px-4 rounded-[10px] bg-[#111827] hover:bg-[#1F2937] dark:bg-[#FAFAFA] dark:hover:bg-[#E5E5E5] text-[#FFFFFF] dark:text-[#111111] font-medium text-[13px] sm:text-[14px] transition flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              <Download size={15} /> Export Report
            </button>
          </div>
        </div>

        {/* ── Navigation Tab Bar (Identical to Faculty/Student Pill Bar) ── */}
        <div className="flex items-center bg-[#F8FAFC] dark:bg-[#111111] p-1.5 rounded-[12px] border border-[#E5E7EB] dark:border-[#2A2A2A] overflow-x-auto no-scrollbar w-full gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSearchParams({ tab: tab.id });
                }}
                className={`h-[36px] px-4 rounded-[8px] text-[13.5px] font-medium transition whitespace-nowrap shrink-0 flex-none cursor-pointer flex items-center justify-center gap-2 ${
                  isActive
                    ? 'bg-[#111827] text-[#FFFFFF] dark:bg-[#FAFAFA] dark:text-[#111111] font-semibold shadow-xs'
                    : 'text-[#6B7280] hover:text-[#111827] dark:text-[#A1A1AA] dark:hover:text-[#FAFAFA] hover:bg-[#F1F5F9] dark:hover:bg-[#1A1A1A]'
                }`}
              >
                <Icon size={16} /> {tab.label}
              </button>
            );
          })}
        </div>

        {/* ── Global Filter & Search Bar ── */}
        <div className="bg-[#FFFFFF] dark:bg-[#18181B] p-4 rounded-[16px] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7280] dark:text-[#A1A1AA]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users, courses, departments, or RAG documents..."
              className="w-full h-[40px] pl-10 pr-4 rounded-[10px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#F8FAFC] dark:bg-[#111111] text-[14px] text-[#111827] dark:text-[#FAFAFA] placeholder:text-[#9CA3AF] dark:placeholder:text-[#71717A] outline-none focus:border-[#111827] dark:focus:border-[#FAFAFA] transition"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-[#6B7280] dark:text-[#A1A1AA]" />
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="h-[40px] rounded-[10px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#F8FAFC] dark:bg-[#111111] px-3 text-[14px] font-medium text-[#111827] dark:text-[#FAFAFA] outline-none cursor-pointer"
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
              className="h-[40px] rounded-[10px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#F8FAFC] dark:bg-[#111111] px-3 text-[14px] font-medium text-[#111827] dark:text-[#FAFAFA] outline-none cursor-pointer"
            >
              <option value="All">All Departments</option>
              <option value="Computer Science & Engineering">CS & Engineering</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Electronics & Communication">Electronics & Comm</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="h-[40px] rounded-[10px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#F8FAFC] dark:bg-[#111111] px-3 text-[14px] font-medium text-[#111827] dark:text-[#FAFAFA] outline-none cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>
        </div>

        {/* ── Active Tab Component Body ── */}
        {(activeTab === 'overview' || activeTab === 'admin-overview') && (
          <AdminOverviewManager stats={overviewStats} loading={loading} onNavigateTab={(t) => setActiveTab(t)} />
        )}
        {(activeTab === 'users' || activeTab === 'admin-users' || activeTab === 'admin-faculty' || activeTab === 'admin-students') && (
          <AdminUserManagement
            selectedRole={selectedRole}
            selectedDept={selectedDept}
            selectedStatus={selectedStatus}
            searchQuery={searchQuery}
          />
        )}
        {(activeTab === 'departments' || activeTab === 'admin-departments' || activeTab === 'admin-courses') && <AdminDepartmentManagement />}
        {(activeTab === 'academics' || activeTab === 'admin-academics' || activeTab === 'admin-attendance') && <AdminAcademicManager />}
        {(activeTab === 'placements' || activeTab === 'admin-placements') && <AdminPlacementManager />}
        {(activeTab === 'documents' || activeTab === 'admin-documents') && <AdminDocumentManager />}
        {(activeTab === 'announcements' || activeTab === 'admin-announcements') && <AdminAnnouncementManager />}
        {(activeTab === 'analytics' || activeTab === 'admin-analytics' || activeTab === 'admin-reports') && <AdminAnalyticsManager />}
        {(activeTab === 'settings' || activeTab === 'admin-settings' || activeTab === 'admin-audit' || activeTab === 'admin-backup') && <AdminSettingsManager />}

      </div>
    </div>
  );
}
