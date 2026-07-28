import { useState } from 'react';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

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
    <div className="flex-1 overflow-y-auto p-6 lg:p-8 bg-slate-50 dark:bg-slate-900">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">Attendance Overview</h1>

        {/* Top Stats */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <div className="rounded-2xl bg-white dark:bg-slate-800 p-6 shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center">
            <div className="relative w-32 h-32 flex items-center justify-center mb-2">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="64" cy="64" r="56" fill="none" stroke="currentColor" strokeWidth="12" className="text-slate-100 dark:text-slate-700" />
                <circle 
                  cx="64" cy="64" r="56" fill="none" stroke="currentColor" strokeWidth="12" 
                  strokeDasharray={351.8} 
                  strokeDashoffset={351.8 - (351.8 * (parseFloat(overallPercentage) / 100))}
                  className="text-emerald-500 transition-all duration-1000 ease-out" 
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-slate-800 dark:text-white">{overallPercentage}%</span>
              </div>
            </div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Overall Attendance</p>
          </div>
          
          <div className="rounded-2xl bg-gradient-to-br from-[#0A2A6A] to-[#163D8C] p-6 shadow-sm flex flex-col justify-center text-white">
            <h3 className="text-lg font-medium opacity-90 mb-1">Total Classes</h3>
            <p className="text-4xl font-bold">{totalClasses}</p>
            <p className="text-sm mt-4 opacity-75">Conducted this semester</p>
          </div>

          <div className="rounded-2xl bg-white dark:bg-slate-800 p-6 shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col justify-center">
            <h3 className="text-lg font-medium text-slate-500 dark:text-slate-400 mb-1">Classes Attended</h3>
            <p className="text-4xl font-bold text-slate-800 dark:text-white">{totalAttended}</p>
            <p className="text-sm mt-4 text-emerald-600 font-medium">Keep it up!</p>
          </div>
        </div>

        {/* Subject-wise Table */}
        <div className="rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
            <h2 className="font-semibold text-slate-800 dark:text-white">Subject-wise Details</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
              <thead className="text-xs uppercase bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-6 py-4 font-medium">Subject</th>
                  <th className="px-6 py-4 font-medium">Classes Attended</th>
                  <th className="px-6 py-4 font-medium">Total Classes</th>
                  <th className="px-6 py-4 font-medium">Percentage</th>
                  <th className="px-6 py-4 font-medium text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {attendanceData.map((row) => {
                  const percent = ((row.attended / row.total) * 100).toFixed(1);
                  let StatusIcon = CheckCircle;
                  let statusColor = 'text-emerald-500';
                  if (row.status === 'Warning') { StatusIcon = AlertCircle; statusColor = 'text-amber-500'; }
                  if (row.status === 'Critical') { StatusIcon = XCircle; statusColor = 'text-rose-500'; }

                  return (
                    <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{row.subject}</td>
                      <td className="px-6 py-4">{row.attended}</td>
                      <td className="px-6 py-4">{row.total}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="w-10 font-medium">{percent}%</span>
                          <div className="h-2 w-24 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div className={`h-full bg-current ${statusColor}`} style={{ width: `${percent}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className={`inline-flex items-center gap-1.5 font-medium ${statusColor}`}>
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
