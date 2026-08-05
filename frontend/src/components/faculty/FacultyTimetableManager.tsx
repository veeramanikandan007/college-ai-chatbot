import React, { useState, useEffect } from 'react';
import { CalendarDays, Clock, Plus, RefreshCw, X, CheckCircle2 } from 'lucide-react';
import { facultyApi, FacultyScheduleItem } from '../../api/faculty';
import { useToast } from '../../context/ToastContext';

export const FacultyTimetableManager: React.FC = () => {
  const { showToast } = useToast();
  const [schedules, setSchedules] = useState<FacultyScheduleItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);

  // Request form state
  const [requestDate, setRequestDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentPeriod, setCurrentPeriod] = useState(1);
  const [requestedPeriod, setRequestedPeriod] = useState(3);
  const [reason, setReason] = useState('Department committee meeting conflict.');

  useEffect(() => {
    fetchTimetable();
  }, []);

  const fetchTimetable = async () => {
    try {
      setLoading(true);
      const data = await facultyApi.getTimetable();
      setSchedules(data);
    } catch (err) {
      console.error('Error fetching timetable:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestChange = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await facultyApi.requestTimetableChange({
        request_date: requestDate,
        current_period: currentPeriod,
        requested_period: requestedPeriod,
        reason,
      });
      showToast('Timetable change request submitted to HOD.', 'success');
      setShowRequestModal(false);
    } catch (err) {
      console.error('Error submitting change request:', err);
      showToast('Failed to submit request.', 'error');
    }
  };

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const periods = [1, 2, 3, 4, 5, 6];

  return (
    <div className="space-y-6 font-sans">
      {/* ── Page Hero Header ── */}
      <div className="bg-[#FFFFFF] dark:bg-[#18181B] p-6 rounded-[16px] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-12 h-12 rounded-[12px] bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] flex items-center justify-center shrink-0">
            <CalendarDays size={24} />
          </div>
          <div className="min-w-0 space-y-1">
            <h1 className="text-[30px] font-semibold text-[#111827] dark:text-[#FAFAFA] tracking-tight leading-tight truncate">
              Faculty Teaching Timetable
            </h1>
            <p className="text-[15px] font-normal text-[#6B7280] dark:text-[#A1A1AA] truncate">
              Inspect period slots, free hours, and submit period substitution requests.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowRequestModal(true)}
          className="h-[40px] px-5 rounded-[10px] bg-[#111827] hover:bg-[#1F2937] dark:bg-[#FAFAFA] dark:hover:bg-[#E5E5E5] text-[#FFFFFF] dark:text-[#111111] font-medium text-[14px] transition flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <RefreshCw size={18} />
          <span>Request Change</span>
        </button>
      </div>

      {/* ── Weekly Timetable Grid ── */}
      <div className="bg-[#FFFFFF] dark:bg-[#18181B] rounded-[16px] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-center border-collapse font-sans text-[14px]">
            <thead>
              <tr className="border-b border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#F8FAFC] dark:bg-[#111111] text-[12px] font-semibold uppercase tracking-wider text-[#6B7280] dark:text-[#A1A1AA]">
                <th className="py-3.5 px-6 text-left">Day / Period</th>
                {periods.map((p) => (
                  <th key={p} className="py-3.5 px-6">Period {p}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB] dark:divide-[#2A2A2A]">
              {days.map((day) => (
                <tr key={day} className="hover:bg-[#F8FAFC] dark:hover:bg-[#141414] transition">
                  <td className="py-4 px-6 font-semibold text-left text-[#111827] dark:text-[#FAFAFA] bg-[#F8FAFC]/50 dark:bg-[#111111]/50">
                    {day}
                  </td>
                  {periods.map((p) => {
                    const match = schedules.find((s) => s.day_of_week === day && s.period_number === p);
                    return (
                      <td key={p} className="py-3 px-3">
                        {match ? (
                          <div className="p-2.5 rounded-[10px] bg-[#111827] dark:bg-[#FAFAFA] text-white dark:text-[#111111] text-center space-y-0.5 shadow-xs">
                            <span className="font-bold text-[14px] block">{match.subject_code}</span>
                            <span className="text-[12px] opacity-80 block">Sec {match.section} · {match.classroom}</span>
                          </div>
                        ) : (
                          <span className="inline-block px-2.5 py-1 rounded-[6px] bg-[#F8FAFC] dark:bg-[#111111] text-[#6B7280] dark:text-[#A1A1AA] font-medium text-[12px] border border-[#E5E7EB] dark:border-[#2A2A2A]">
                            Free Hour
                          </span>
                        )}
                      </td>
                    );
                  })}

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Request Timetable Change Modal ── */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4" onClick={() => setShowRequestModal(false)}>
          <div className="w-full max-w-md bg-[#FFFFFF] dark:bg-[#18181B] p-6 rounded-[16px] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-2xl space-y-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB] dark:border-[#2A2A2A]">
              <h3 className="text-[20px] font-semibold text-[#111827] dark:text-[#FAFAFA]">Request Period Swap / Change</h3>
              <button onClick={() => setShowRequestModal(false)} className="h-8 w-8 rounded-[8px] border border-[#E5E7EB] dark:border-[#2A2A2A] flex items-center justify-center text-[#111827] dark:text-[#FAFAFA]">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleRequestChange} className="space-y-4">
              <div>
                <label className="text-[14px] font-medium text-[#111827] dark:text-[#FAFAFA] block mb-1">Date</label>
                <input
                  type="date"
                  value={requestDate}
                  onChange={(e) => setRequestDate(e.target.value)}
                  className="w-full h-[40px] px-3.5 rounded-[10px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#FFFFFF] dark:bg-[#18181B] text-[14px] text-[#111827] dark:text-[#FAFAFA] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[14px] font-medium text-[#111827] dark:text-[#FAFAFA] block mb-1">Current Period</label>
                  <input
                    type="number"
                    value={currentPeriod}
                    onChange={(e) => setCurrentPeriod(Number(e.target.value))}
                    className="w-full h-[40px] px-3.5 rounded-[10px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#FFFFFF] dark:bg-[#18181B] text-[14px] text-[#111827] dark:text-[#FAFAFA] outline-none"
                  />
                </div>
                <div>
                  <label className="text-[14px] font-medium text-[#111827] dark:text-[#FAFAFA] block mb-1">Requested Period</label>
                  <input
                    type="number"
                    value={requestedPeriod}
                    onChange={(e) => setRequestedPeriod(Number(e.target.value))}
                    className="w-full h-[40px] px-3.5 rounded-[10px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#FFFFFF] dark:bg-[#18181B] text-[14px] text-[#111827] dark:text-[#FAFAFA] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[14px] font-medium text-[#111827] dark:text-[#FAFAFA] block mb-1">Reason for Change</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  className="w-full p-3 rounded-[10px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#FFFFFF] dark:bg-[#18181B] text-[14px] text-[#111827] dark:text-[#FAFAFA] outline-none resize-none"
                />
              </div>

              <div className="pt-3 border-t border-[#E5E7EB] dark:border-[#2A2A2A] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="h-[40px] px-4 rounded-[10px] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[14px] font-medium text-[#111827] dark:text-[#FAFAFA]"
                >
                  Cancel
                </button>
                <button type="submit" className="h-[40px] px-5 rounded-[10px] bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] text-[14px] font-medium cursor-pointer">
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
