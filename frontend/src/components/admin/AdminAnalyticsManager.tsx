import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, HardDrive, Award, Activity } from 'lucide-react';
import { adminDashboardApi, AdminAnalyticsMaster } from '../../api/adminDashboard';

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
    return <div className="p-8 text-center text-caption text-[#64748B] animate-pulse">Loading analytics engine...</div>;
  }

  return (
    <div className="space-y-6 font-sans">
      {/* ── Top Hero Header Card ── */}
      <div className="bg-[#FFFFFF] dark:bg-[#18181B] p-6 rounded-[16px] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs space-y-1">
        <h3 className="text-[18px] font-semibold text-[#111827] dark:text-[#FAFAFA]">System & Academic Analytics Intelligence</h3>
        <p className="text-[14px] font-normal text-[#6B7280] dark:text-[#A1A1AA]">Deep analytics on user activity, module adoption, storage breakdown, and student performance.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Used Modules */}
        <div className="bg-[#FFFFFF] dark:bg-[#18181B] p-6 rounded-[16px] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs space-y-4">
          <h3 className="text-[18px] font-semibold text-[#111827] dark:text-[#FAFAFA] flex items-center gap-2">
            <BarChart3 className="text-[#111827] dark:text-[#FAFAFA]" size={20} />
            Most Used Modules
          </h3>

          <div className="space-y-4">
            {data.most_used_modules.map((m, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between text-[13px] font-medium">
                  <span className="text-[#111827] dark:text-[#FAFAFA]">{m.module}</span>
                  <span className="text-[#6B7280] dark:text-[#A1A1AA] font-semibold">{m.usage_count} sessions</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] overflow-hidden">
                  <div
                    className="h-full bg-[#111827] dark:bg-[#FAFAFA] rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (m.usage_count / 1500) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Storage Distribution */}
        <div className="bg-[#FFFFFF] dark:bg-[#18181B] p-6 rounded-[16px] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs space-y-4">
          <h3 className="text-[18px] font-semibold text-[#111827] dark:text-[#FAFAFA] flex items-center gap-2">
            <HardDrive className="text-[#111827] dark:text-[#FAFAFA]" size={20} />
            Storage Category Breakdown
          </h3>

          <div className="space-y-3">
            {data.storage_distribution.map((s, idx) => (
              <div key={idx} className="p-3.5 rounded-[12px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] flex items-center justify-between text-[14px] font-medium">
                <span className="text-[#111827] dark:text-[#FAFAFA]">{s.category}</span>
                <span className="font-mono text-[13px] text-[#6B7280] dark:text-[#A1A1AA] font-semibold">{s.size_gb} GB</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Performing Students Roster */}
      <div className="bg-[#FFFFFF] dark:bg-[#18181B] rounded-[16px] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs p-6 space-y-4">
        <h3 className="text-[18px] font-semibold text-[#111827] dark:text-[#FAFAFA] flex items-center gap-2">
          <Award className="text-[#111827] dark:text-[#FAFAFA]" size={20} />
          Top Performing Academic Rankers
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[14px] font-sans">
            <thead>
              <tr className="border-b border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#F8FAFC] dark:bg-[#111111] text-[12px] font-medium uppercase tracking-wider text-[#6B7280] dark:text-[#A1A1AA]">
                <th className="py-3 px-4">Register Number</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4 text-center">CGPA</th>
                <th className="py-3 px-4 text-center">Attendance %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB] dark:divide-[#2A2A2A]">
              {data.top_performing_students.map((st, idx) => (
                <tr key={idx} className="hover:bg-[#F8FAFC]/50 dark:hover:bg-[#1A1A1A]/50 transition">
                  <td className="py-3 px-4 font-mono font-medium text-[13px] text-[#111827] dark:text-[#FAFAFA]">{st.reg_no}</td>
                  <td className="py-3 px-4 font-semibold text-[#111827] dark:text-[#FAFAFA]">{st.name}</td>
                  <td className="py-3 px-4 text-[13px] text-[#6B7280] dark:text-[#A1A1AA]">{st.dept}</td>
                  <td className="py-3 px-4 text-center font-semibold text-emerald-600 dark:text-emerald-400">{st.cgpa}</td>
                  <td className="py-3 px-4 text-center font-medium text-[#111827] dark:text-[#FAFAFA]">{st.attendance}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
