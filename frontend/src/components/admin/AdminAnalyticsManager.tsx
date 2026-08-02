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
    <div className="space-y-6 font-body">
      <div className="bg-white dark:bg-[#1E293B] p-5 rounded-2xl border border-[#E2E8F0] dark:border-[#334155] shadow-xs">
        <h3 className="font-heading font-bold text-card text-[#1F2937] dark:text-[#F8FAFC]">System & Academic Analytics Intelligence</h3>
        <p className="text-small text-[#64748B] dark:text-[#94A3B8]">Deep analytics on user activity, module adoption, storage breakdown, and student performance.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Used Modules */}
        <div className="bg-white dark:bg-[#1E293B] p-6 rounded-2xl border border-[#E2E8F0] dark:border-[#334155] shadow-xs space-y-4">
          <h3 className="font-heading font-bold text-card text-[#1F2937] dark:text-[#F8FAFC] flex items-center gap-2">
            <BarChart3 className="text-[#0E2A6D] dark:text-[#60A5FA]" size={20} />
            Most Used Modules
          </h3>

          <div className="space-y-3">
            {data.most_used_modules.map((m, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-caption font-semibold">
                  <span className="text-[#1F2937] dark:text-[#F8FAFC]">{m.module}</span>
                  <span className="text-[#0E2A6D] dark:text-[#60A5FA] font-bold">{m.usage_count} sessions</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#0E2A6D] to-[#1E4DB7] dark:from-[#60A5FA] dark:to-[#3B82F6] rounded-full"
                    style={{ width: `${Math.min(100, (m.usage_count / 1500) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Storage Distribution */}
        <div className="bg-white dark:bg-[#1E293B] p-6 rounded-2xl border border-[#E2E8F0] dark:border-[#334155] shadow-xs space-y-4">
          <h3 className="font-heading font-bold text-card text-[#1F2937] dark:text-[#F8FAFC] flex items-center gap-2">
            <HardDrive className="text-[#D9A441]" size={20} />
            Storage Category Breakdown
          </h3>

          <div className="space-y-3">
            {data.storage_distribution.map((s, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-[#F5F7FB] dark:bg-[#0F172A] flex items-center justify-between text-body font-semibold">
                <span className="text-[#1F2937] dark:text-[#F8FAFC]">{s.category}</span>
                <span className="font-mono text-caption text-[#D9A441] font-bold">{s.size_gb} GB</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Performing Students Roster */}
      <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-[#E2E8F0] dark:border-[#334155] shadow-xs p-6 space-y-4">
        <h3 className="font-heading font-bold text-card text-[#1F2937] dark:text-[#F8FAFC] flex items-center gap-2">
          <Award className="text-emerald-600 dark:text-emerald-400" size={20} />
          Top Performing Academic Rankers
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-body font-body">
            <thead>
              <tr className="border-b border-[#E2E8F0] dark:border-[#334155] text-caption font-bold uppercase text-[#64748B]">
                <th className="py-2.5 px-4">Register Number</th>
                <th className="py-2.5 px-4">Student Name</th>
                <th className="py-2.5 px-4">Department</th>
                <th className="py-2.5 px-4 text-center">CGPA</th>
                <th className="py-2.5 px-4 text-center">Attendance %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#334155]">
              {data.top_performing_students.map((st, idx) => (
                <tr key={idx} className="hover:bg-[#F5F7FB]/50 dark:hover:bg-[#0F172A]/50">
                  <td className="py-3 px-4 font-mono font-bold text-caption text-[#0E2A6D] dark:text-[#60A5FA]">{st.reg_no}</td>
                  <td className="py-3 px-4 font-heading font-bold text-[#1F2937] dark:text-[#F8FAFC]">{st.name}</td>
                  <td className="py-3 px-4 text-caption text-[#64748B]">{st.dept}</td>
                  <td className="py-3 px-4 text-center font-bold text-emerald-600 dark:text-emerald-400">{st.cgpa}</td>
                  <td className="py-3 px-4 text-center font-semibold text-[#1F2937] dark:text-[#F8FAFC]">{st.attendance}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
