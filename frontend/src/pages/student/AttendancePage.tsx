import { useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, Award } from 'lucide-react';

export default function AttendancePage() {
  const [attendanceData] = useState([
    { id: 1, subject: 'Data Structures', total: 40, attended: 36, status: 'Good' },
    { id: 2, subject: 'Operating Systems', total: 38, attended: 35, status: 'Good' },
    { id: 3, subject: 'Computer Networks', total: 42, attended: 30, status: 'Warning' },
    { id: 4, subject: 'Database Systems', total: 40, attended: 28, status: 'Critical' },
    { id: 5, subject: 'Machine Learning', total: 35, attended: 33, status: 'Good' },
  ]);

  const totalClasses = attendanceData.reduce((acc, curr) => acc + curr.total, 0);
  const totalAttended = attendanceData.reduce((acc, curr) => acc + curr.attended, 0);
  const overallPercentage = ((totalAttended / totalClasses) * 100).toFixed(1);

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8 bg-[#F5F7FB] dark:bg-[#0F172A] text-[#1F2937] dark:text-[#F8FAFC] transition-colors duration-300 font-body">
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <h1 className="font-heading font-bold text-page tracking-[0.02em] text-[#0E2A6D] dark:text-[#F8FAFC] flex items-center gap-3">
            <Award className="text-[#0E2A6D] dark:text-[#60A5FA]" size={32} />
            Attendance Overview
          </h1>
          <p className="text-small text-[#64748B] dark:text-[#94A3B8] mt-1">Monitor your class attendance and status metrics.</p>
        </div>

        {/* Top Stats */}
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-xl bg-white dark:bg-[#1E293B] p-6 shadow-xs border border-[#E2E8F0] dark:border-[#334155] flex flex-col items-center justify-center">
            <div className="relative w-32 h-32 flex items-center justify-center mb-2">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="64" cy="64" r="56" fill="none" stroke="currentColor" strokeWidth="10" className="text-[#E2E8F0] dark:text-[#334155]" />
                <circle 
                  cx="64" cy="64" r="56" fill="none" stroke="currentColor" strokeWidth="10" 
                  strokeDasharray={351.8} 
                  strokeDashoffset={351.8 - (351.8 * (parseFloat(overallPercentage) / 100))}
                  className="text-[#22C55E] transition-all duration-1000 ease-out" 
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-heading font-bold text-section text-[#1F2937] dark:text-[#F8FAFC]">{overallPercentage}%</span>
              </div>
            </div>
            <p className="text-small font-semibold text-[#64748B] dark:text-[#94A3B8]">Overall Attendance</p>
          </div>
          
          <div className="rounded-xl bg-gradient-to-br from-[#0E2A6D] to-[#1E4DB7] p-6 shadow-md flex flex-col justify-center text-white border border-[#D9A441]/30">
            <h3 className="font-heading text-card font-bold opacity-90 mb-1">Total Classes</h3>
            <p className="font-heading text-hero font-extrabold">{totalClasses}</p>
            <p className="text-small mt-4 opacity-80">Conducted this semester</p>
          </div>

          <div className="rounded-xl bg-white dark:bg-[#1E293B] p-6 shadow-xs border border-[#E2E8F0] dark:border-[#334155] flex flex-col justify-center">
            <h3 className="font-heading text-card font-bold text-[#64748B] dark:text-[#94A3B8] mb-1">Classes Attended</h3>
            <p className="font-heading text-hero font-extrabold text-[#1F2937] dark:text-[#F8FAFC]">{totalAttended}</p>
            <p className="text-small mt-4 text-[#22C55E] font-semibold">Keep it up!</p>
          </div>
        </div>

        {/* Subject-wise Table */}
        <div className="rounded-xl bg-white dark:bg-[#1E293B] shadow-xs border border-[#E2E8F0] dark:border-[#334155] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#1E293B]">
            <h2 className="font-heading font-bold text-card text-[#1F2937] dark:text-[#F8FAFC]">Subject-wise Details</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-body text-[#475569] dark:text-[#CBD5E1]">
              <thead className="text-caption font-heading font-bold uppercase bg-[#F5F7FB] dark:bg-[#111827] text-[#64748B] dark:text-[#94A3B8] border-b border-[#E2E8F0] dark:border-[#334155]">
                <tr>
                  <th className="px-6 py-4 font-semibold">Subject</th>
                  <th className="px-6 py-4 font-semibold">Classes Attended</th>
                  <th className="px-6 py-4 font-semibold">Total Classes</th>
                  <th className="px-6 py-4 font-semibold">Percentage</th>
                  <th className="px-6 py-4 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#334155]">
                {attendanceData.map((row) => {
                  const percent = ((row.attended / row.total) * 100).toFixed(1);
                  let StatusIcon = CheckCircle;
                  let statusColor = 'text-[#22C55E]';
                  if (row.status === 'Warning') { StatusIcon = AlertCircle; statusColor = 'text-[#F59E0B]'; }
                  if (row.status === 'Critical') { StatusIcon = XCircle; statusColor = 'text-[#EF4444]'; }

                  return (
                    <tr key={row.id} className="hover:bg-[#F5F7FB] dark:hover:bg-[#111827] transition-colors duration-180">
                      <td className="px-6 py-4 font-heading font-bold text-[#1F2937] dark:text-[#F8FAFC]">{row.subject}</td>
                      <td className="px-6 py-4">{row.attended}</td>
                      <td className="px-6 py-4">{row.total}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="w-10 font-bold">{percent}%</span>
                          <div className="h-2 w-24 bg-[#E2E8F0] dark:bg-[#334155] rounded-full overflow-hidden">
                            <div className={`h-full bg-current ${statusColor}`} style={{ width: `${percent}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className={`inline-flex items-center gap-1.5 font-bold ${statusColor}`}>
                          <StatusIcon size={16} />
                          <span>{row.status}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
