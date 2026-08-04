import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, HardDrive, Award } from 'lucide-react';
import { adminDashboardApi, AdminAnalyticsMaster } from '../../api/adminDashboard';
import { PageHeader } from '../ui/PageHeader';
import { Table, Column } from '../ui/Table';
import { DashboardCard } from '../ui/DashboardCard';
import { SectionHeader } from '../ui/SectionHeader';
import { PageContainer } from '../ui/PageContainer';

export const AdminAnalyticsManager: React.FC = () => {
  const [data, setData] = useState<AdminAnalyticsMaster | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await adminDashboardApi.getAnalyticsMaster();
      setData(res);
    } catch (err) {
      console.error('Error fetching admin master analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return <div className="p-8 text-center text-sm text-zinc-500 animate-pulse">Loading analytics engine...</div>;
  }

  const columns: Column<any>[] = [
    { key: 'reg_no', header: 'Register Number', render: (s) => <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{s.reg_no}</span> },
    { key: 'name', header: 'Student Name', render: (s) => <span className="font-semibold text-zinc-900 dark:text-zinc-100">{s.name}</span> },
    { key: 'dept', header: 'Department', render: (s) => <span className="text-sm text-zinc-500">{s.dept}</span> },
    { key: 'cgpa', header: 'CGPA', render: (s) => <span className="font-bold text-emerald-600 dark:text-emerald-400">{s.cgpa}</span> },
    { key: 'attendance', header: 'Attendance %', render: (s) => <span className="font-semibold text-zinc-900 dark:text-zinc-100">{s.attendance}%</span> },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="System & Academic Analytics Intelligence"
        description="Deep analytics on user activity, module adoption, storage breakdown, and student performance."
        icon={BarChart3}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Used Modules */}
        <DashboardCard className="space-y-4">
          <SectionHeader title="Most Used Modules" icon={BarChart3} />

          <div className="space-y-4 pt-2">
            {data.most_used_modules.map((m, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-zinc-900 dark:text-zinc-100">{m.module}</span>
                  <span className="text-blue-600 dark:text-blue-400 font-bold">{m.usage_count} sessions</span>
                </div>
                <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${Math.min(100, (m.usage_count / 1500) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </DashboardCard>

        {/* Storage Distribution */}
        <DashboardCard className="space-y-4">
          <SectionHeader title="Storage Category Breakdown" icon={HardDrive} iconColor="text-amber-500" />

          <div className="space-y-3 pt-2">
            {data.storage_distribution.map((s, idx) => (
              <div key={idx} className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 flex items-center justify-between text-sm font-medium border border-zinc-100 dark:border-zinc-800">
                <span className="text-zinc-900 dark:text-zinc-100">{s.category}</span>
                <span className="font-mono text-amber-600 dark:text-amber-400 font-bold">{s.size_gb} GB</span>
              </div>
            ))}
          </div>
        </DashboardCard>
      </div>

      {/* Top Performing Students Roster */}
      <DashboardCard className="p-0 md:p-0 overflow-hidden">
        <SectionHeader title="Top Performing Academic Rankers" icon={Award} iconColor="text-emerald-500" className="p-5 pb-0" />
        <div className="p-5">
          <Table
            columns={columns}
            data={data.top_performing_students}
            searchable={false}
          />
        </div>
      </DashboardCard>
    </PageContainer>
  );
};
