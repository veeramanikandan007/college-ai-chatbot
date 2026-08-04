import React, { useState, useEffect } from 'react';
import { adminDashboardApi, AdminMasterOverviewStats } from '../api/adminDashboard';
import AdminLayout, { AdminTabId } from '../components/layout/AdminLayout';
import { AdminOverviewManager } from '../components/admin/AdminOverviewManager';
import { AdminUserManagement } from '../components/admin/AdminUserManagement';
import { AdminDepartmentManagement } from '../components/admin/AdminDepartmentManagement';
import { AdminAcademicManager } from '../components/admin/AdminAcademicManager';
import { AdminPlacementManager } from '../components/admin/AdminPlacementManager';
import { AdminDocumentManager } from '../components/admin/AdminDocumentManager';
import { AdminAnnouncementManager } from '../components/admin/AdminAnnouncementManager';
import { AdminAnalyticsManager } from '../components/admin/AdminAnalyticsManager';
import { AdminSettingsManager } from '../components/admin/AdminSettingsManager';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<AdminTabId>('overview');
  const [overviewStats, setOverviewStats] = useState<AdminMasterOverviewStats | null>(null);
  const [loading, setLoading] = useState(false);

  // Global filter state — passed down to relevant sub-managers
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole,   setSelectedRole]   = useState('All');
  const [selectedDept,   setSelectedDept]   = useState('All');
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

  const handleExportCSV = () => {
    const csvContent =
      'Category,Metric,Value\nTotal Students,Count,320\nTotal Faculty,Count,24\nUptime,Percentage,99.8%\nStorage Used,GB,42.5 GB\n';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `Admin_Master_Report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AdminLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onExport={handleExportCSV}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
    >
      {activeTab === 'overview' && (
        <AdminOverviewManager
          stats={overviewStats}
          loading={loading}
          onNavigateTab={(t) => setActiveTab(t as AdminTabId)}
        />
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
      {activeTab === 'academics'   && <AdminAcademicManager />}
      {activeTab === 'placements'  && <AdminPlacementManager />}
      {activeTab === 'documents'   && <AdminDocumentManager />}
      {activeTab === 'announcements' && <AdminAnnouncementManager />}
      {activeTab === 'analytics'   && <AdminAnalyticsManager />}
      {activeTab === 'settings'    && <AdminSettingsManager />}
    </AdminLayout>
  );
}
