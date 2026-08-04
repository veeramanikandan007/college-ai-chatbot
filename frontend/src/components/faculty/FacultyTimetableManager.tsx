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
      {/* ── Top Controls ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FFFFFF] dark:bg-[#111111] p-6 rounded-[16px] border border-[#E5E5E5] dark:border-[#2A2A2A] shadow-xs">
        <div>
          <h3 className="text-[18px] font-semibold text-[#111111] dark:text-[#FAFAFA]">Faculty Teaching Timetable</h3>
          <p className="text-[15px] font-medium text-[#525252] dark:text-[#A3A3A3] mt-0.5">Inspect period slots, free hours, and submit period substitution requests.</p>
        </div>

        <button
          onClick={() => setShowRequestModal(true)}
          className="h-[40px] px-4 rounded-[12px] bg-[#111111] hover:bg-[#262626] dark:bg-[#FAFAFA] dark:hover:bg-[#E5E5E5] text-white dark:text-[#111111] text-[15px] font-semibold flex items-center gap-2 transition cursor-pointer shrink-0"
        >
          <RefreshCw size={16} /> Request Timetable Change
        </button>
      </div>

      {/* ── Weekly Timetable Grid ── */}
      <div className="bg-[#FFFFFF] dark:bg-[#111111] rounded-[16px] border border-[#E5E5E5] dark:border-[#2A2A2A] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-center border-collapse font-sans text-[14px]">
            <thead>
              <tr className="border-b border-[#E5E5E5] dark:border-[#2A2A2A] bg-[#F8F8F8] dark:bg-[#18181B] font-semibold uppercase text-[#525252] dark:text-[#A3A3A3]">
                <th className="py-3 px-4 text-left">Day / Period</th>
                {periods.map((p) => (
                  <th key={p} className="py-3 px-4">Period {p}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E5] dark:divide-[#2A2A2A]">
              {days.map((day) => (
                <tr key={day} className="hover:bg-[#F3F3F3]/50 dark:hover:bg-[#18181B]/50 transition">
                  <td className="py-4 px-4 font-bold text-left text-[#111111] dark:text-[#FAFAFA] bg-[#F8F8F8]/50 dark:bg-[#18181B]/50">
                    {day}
                  </td>
                  {periods.map((p) => {
                    const match = schedules.find((s) => s.day_of_week === day && s.period_number === p);
                    return (
                      <td key={p} className="py-3 px-2">
                        {match ? (
                          <div className="p-2.5 rounded-[10px] bg-[#111111] dark:bg-[#FAFAFA] text-white dark:text-[#111111] text-center space-y-0.5 shadow-xs">
                            <span className="font-bold text-[14px] block">{match.subject_code}</span>
                            <span className="text-[12px] opacity-80 block">Sec {match.section} · {match.classroom}</span>
                          </div>
                        ) : (
                          <span className="inline-block px-2.5 py-1 rounded-[6px] bg-[#F3F3F3] dark:bg-[#232323] text-[#525252] dark:text-[#A3A3A3] font-medium text-[12px] border border-[#E5E5E5] dark:border-[#2A2A2A]">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-[#1E293B] rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-[#E2E8F0] dark:border-[#334155]">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#334155] pb-3">
              <h3 className="font-heading font-bold text-card text-[#1F2937] dark:text-[#F8FAFC]">Request Period Swap / Change</h3>
              <button onClick={() => setShowRequestModal(false)} className="text-[#64748B] hover:text-[#1F2937]">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleRequestChange} className="space-y-3">
              <div>
                <label className="text-caption font-bold text-[#64748B]">Date</label>
                <input
                  type="date"
                  value={requestDate}
                  onChange={(e) => setRequestDate(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F5F7FB] dark:bg-[#0F172A] text-body text-[#1F2937] dark:text-[#F8FAFC] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-caption font-bold text-[#64748B]">Current Period</label>
                  <input
                    type="number"
                    value={currentPeriod}
                    onChange={(e) => setCurrentPeriod(Number(e.target.value))}
                    className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F5F7FB] dark:bg-[#0F172A] text-body text-[#1F2937] dark:text-[#F8FAFC] outline-none"
                  />
                </div>
                <div>
                  <label className="text-caption font-bold text-[#64748B]">Requested Period</label>
                  <input
                    type="number"
                    value={requestedPeriod}
                    onChange={(e) => setRequestedPeriod(Number(e.target.value))}
                    className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F5F7FB] dark:bg-[#0F172A] text-body text-[#1F2937] dark:text-[#F8FAFC] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-caption font-bold text-[#64748B]">Reason for Change</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  className="w-full p-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F5F7FB] dark:bg-[#0F172A] text-body text-[#1F2937] dark:text-[#F8FAFC] outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="h-10 px-4 rounded-xl border border-[#E2E8F0] dark:border-[#334155] text-caption font-bold text-[#64748B]"
                >
                  Cancel
                </button>
                <button type="submit" className="h-10 px-4 rounded-xl bg-[#0E2A6D] text-white text-caption font-bold">
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
