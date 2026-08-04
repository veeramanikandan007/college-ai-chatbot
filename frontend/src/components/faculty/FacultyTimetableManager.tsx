import React, { useState, useEffect } from 'react';
import { CalendarDays, Clock, Plus, RefreshCw, X, CheckCircle2 } from 'lucide-react';
import { facultyApi, FacultyScheduleItem } from '../../api/faculty';
import { useToast } from '../../context/ToastContext';

export interface CellData {
  subjectFullName: string;
  subjectShortForm: string;
  time: string;
  teacherName: string;
}

export const FacultyTimetableManager: React.FC = () => {
  const { showToast } = useToast();
  const [schedules, setSchedules] = useState<FacultyScheduleItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);

  // Matrix state for custom edited cells: { "Monday-1": { ... } } persisted in localStorage
  const [customCells, setCustomCells] = useState<Record<string, CellData>>(() => {
    try {
      const saved = localStorage.getItem('faculty_custom_timetable_cells');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('faculty_custom_timetable_cells', JSON.stringify(customCells));
    } catch (err) {
      console.error('Failed to save timetable cells to localStorage:', err);
    }
  }, [customCells]);

  // Active cell being edited in modal
  const [activeCellKey, setActiveCellKey] = useState<string | null>(null);
  const [cellForm, setCellForm] = useState<CellData>({
    subjectFullName: '',
    subjectShortForm: '',
    time: '',
    teacherName: '',
  });

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

  const handleOpenCellModal = (day: string, period: number) => {
    const key = `${day}-${period}`;
    setActiveCellKey(key);
    if (customCells[key]) {
      setCellForm(customCells[key]);
    } else {
      setCellForm({
        subjectFullName: '',
        subjectShortForm: '',
        time: `Period ${period}`,
        teacherName: '',
      });
    }
  };

  const handleSaveCellModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCellKey) return;
    
    setCustomCells((prev) => ({
      ...prev,
      [activeCellKey]: { ...cellForm },
    }));

    showToast(`Slot updated: ${cellForm.subjectShortForm || 'Free Hour'}`, 'success');
    setActiveCellKey(null);
  };

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const periods = [1, 2, 3, 4, 5, 6];

  return (
    <div className="space-y-6 font-sans">
      {/* ── Top Controls ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FFFFFF] dark:bg-[#18181B] p-6 rounded-[16px] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs">
        <div>
          <h3 className="text-[18px] font-semibold text-[#111827] dark:text-[#FAFAFA]">Faculty Teaching Timetable</h3>
          <p className="text-[15px] font-medium text-[#6B7280] dark:text-[#A1A1AA] mt-0.5">Inspect period slots, edit schedule hours, and submit period substitution requests.</p>
        </div>

        <button
          onClick={() => setShowRequestModal(true)}
          className="h-[40px] px-4 rounded-[12px] bg-[#111827] hover:bg-[#1F2937] dark:bg-[#FAFAFA] dark:hover:bg-[#E5E5E5] text-white dark:text-[#111111] text-[15px] font-semibold flex items-center gap-2 transition cursor-pointer shrink-0"
        >
          <RefreshCw size={16} /> Request Timetable Change
        </button>
      </div>

      {/* ── Weekly Timetable Grid ── */}
      <div className="bg-[#FFFFFF] dark:bg-[#18181B] rounded-[16px] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-center border-collapse font-sans text-[14px]">
            <thead>
              <tr className="border-b border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#F9FAFB] dark:bg-[#111111] text-[12px] font-semibold uppercase tracking-wider text-[#6B7280] dark:text-[#A1A1AA]">
                <th className="py-4 px-6 text-left w-[160px]">DAY / PERIOD</th>
                {periods.map((p) => (
                  <th key={p} className="py-4 px-4 font-semibold text-[#6B7280] dark:text-[#A1A1AA]">PERIOD {p}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB] dark:divide-[#2A2A2A]">
              {days.map((day) => (
                <tr key={day} className="hover:bg-[#F9FAFB]/50 dark:hover:bg-[#141414] transition">
                  <td className="py-4 px-6 font-bold text-left text-[#111827] dark:text-[#FAFAFA] bg-[#F9FAFB]/30 dark:bg-[#111111]/30">
                    {day}
                  </td>
                  {periods.map((p) => {
                    const key = `${day}-${p}`;
                    const custom = customCells[key];
                    const match = !custom ? schedules.find((s) => s.day_of_week === day && s.period_number === p) : null;

                    const displayShortForm = custom?.subjectShortForm;
                    const isCustomSaved = !!displayShortForm;

                    return (
                      <td key={p} className="py-3 px-3">
                        {isCustomSaved ? (
                          <button
                            onClick={() => handleOpenCellModal(day, p)}
                            className="w-full py-2 px-3 rounded-[12px] bg-[#111827] dark:bg-[#FAFAFA] text-white dark:text-[#111111] font-bold text-[14px] shadow-xs hover:opacity-90 transition cursor-pointer text-center"
                            title={`${custom.subjectFullName} (${custom.teacherName}) - ${custom.time}`}
                          >
                            {displayShortForm}
                          </button>
                        ) : match ? (
                          <button
                            onClick={() => handleOpenCellModal(day, p)}
                            className="w-full p-2.5 rounded-[12px] bg-[#111827] dark:bg-[#FAFAFA] text-white dark:text-[#111111] text-center space-y-0.5 shadow-xs hover:opacity-90 transition cursor-pointer block"
                          >
                            <span className="font-bold text-[14px] block">{match.subject_code}</span>
                            <span className="text-[11px] opacity-80 block truncate">Sec {match.section} · {match.classroom}</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleOpenCellModal(day, p)}
                            className="px-4 py-1.5 rounded-[12px] bg-[#FFFFFF] dark:bg-[#18181B] text-[#4B5563] dark:text-[#D1D5DB] font-medium text-[13px] border border-[#E5E7EB] dark:border-[#3F3F46] hover:bg-[#F3F4F6] dark:hover:bg-[#27272A] hover:border-[#D1D5DB] dark:hover:border-[#52525B] transition shadow-2xs cursor-pointer inline-block"
                          >
                            Free Hour
                          </button>
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

      {/* ── Individual Cell Edit Modal ── */}
      {activeCellKey && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4" onClick={() => setActiveCellKey(null)}>
          <div className="w-full max-w-md bg-[#FFFFFF] dark:bg-[#18181B] p-6 rounded-[16px] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-2xl space-y-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB] dark:border-[#2A2A2A]">
              <div>
                <h3 className="text-[18px] font-semibold text-[#111827] dark:text-[#FAFAFA]">Edit Timetable Slot</h3>
                <p className="text-[13px] text-[#6B7280] dark:text-[#A1A1AA]">{activeCellKey.replace('-', ' · Period ')}</p>
              </div>
              <button onClick={() => setActiveCellKey(null)} className="h-8 w-8 rounded-[8px] border border-[#E5E7EB] dark:border-[#2A2A2A] flex items-center justify-center text-[#111827] dark:text-[#FAFAFA] hover:bg-[#F3F4F6] dark:hover:bg-[#27272A] transition cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveCellModal} className="space-y-4">
              <div>
                <label className="text-[13px] font-medium text-[#374151] dark:text-[#D1D5DB] block mb-1">Subject Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mathematics II"
                  value={cellForm.subjectFullName}
                  onChange={(e) => setCellForm({ ...cellForm, subjectFullName: e.target.value })}
                  className="w-full h-[40px] px-3.5 rounded-[10px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#FFFFFF] dark:bg-[#18181B] text-[14px] text-[#111827] dark:text-[#FAFAFA] outline-none focus:border-[#111827] dark:focus:border-[#FAFAFA]"
                />
              </div>

              <div>
                <label className="text-[13px] font-medium text-[#374151] dark:text-[#D1D5DB] block mb-1">Subject Short Form (Max 5 characters)</label>
                <input
                  type="text"
                  required
                  maxLength={5}
                  placeholder="e.g. MATH"
                  value={cellForm.subjectShortForm}
                  onChange={(e) => setCellForm({ ...cellForm, subjectShortForm: e.target.value.toUpperCase() })}
                  className="w-full h-[40px] px-3.5 rounded-[10px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#FFFFFF] dark:bg-[#18181B] text-[14px] font-bold tracking-wide text-[#111827] dark:text-[#FAFAFA] outline-none focus:border-[#111827] dark:focus:border-[#FAFAFA]"
                />
              </div>

              <div>
                <label className="text-[13px] font-medium text-[#374151] dark:text-[#D1D5DB] block mb-1">Time / Schedule</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 09:00 AM - 10:00 AM"
                  value={cellForm.time}
                  onChange={(e) => setCellForm({ ...cellForm, time: e.target.value })}
                  className="w-full h-[40px] px-3.5 rounded-[10px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#FFFFFF] dark:bg-[#18181B] text-[14px] text-[#111827] dark:text-[#FAFAFA] outline-none focus:border-[#111827] dark:focus:border-[#FAFAFA]"
                />
              </div>

              <div>
                <label className="text-[13px] font-medium text-[#374151] dark:text-[#D1D5DB] block mb-1">Subject Teacher Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Robert Vance"
                  value={cellForm.teacherName}
                  onChange={(e) => setCellForm({ ...cellForm, teacherName: e.target.value })}
                  className="w-full h-[40px] px-3.5 rounded-[10px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#FFFFFF] dark:bg-[#18181B] text-[14px] text-[#111827] dark:text-[#FAFAFA] outline-none focus:border-[#111827] dark:focus:border-[#FAFAFA]"
                />
              </div>

              <div className="pt-3 border-t border-[#E5E7EB] dark:border-[#2A2A2A] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveCellKey(null)}
                  className="h-[40px] px-4 rounded-[10px] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[14px] font-medium text-[#111827] dark:text-[#FAFAFA] hover:bg-[#F3F4F6] dark:hover:bg-[#27272A] transition cursor-pointer"
                >
                  Cancel
                </button>
                <button type="submit" className="h-[40px] px-5 rounded-[10px] bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] text-[14px] font-semibold hover:bg-[#1F2937] dark:hover:bg-[#E5E5E5] transition cursor-pointer">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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

