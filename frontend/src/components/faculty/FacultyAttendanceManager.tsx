import React, { useState, useEffect } from 'react';
import { ClipboardCheck, Download, Check, X, Clock, AlertCircle, Save, Filter } from 'lucide-react';
import { facultyApi, AttendanceRecord } from '../../api/faculty';
import { useToast } from '../../context/ToastContext';

interface Props {
  selectedSubject: string;
  selectedSection: string;
}

export const FacultyAttendanceManager: React.FC<Props> = ({ selectedSubject, selectedSection }) => {
  const { showToast } = useToast();
  const [attendanceDate, setAttendanceDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [subjectCode, setSubjectCode] = useState<string>(selectedSubject || 'CS8591');
  const [section, setSection] = useState<string>(selectedSection || 'A');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Student Attendance Roster State
  const [students, setStudents] = useState<
    Array<{
      id: number;
      name: string;
      regNo: string;
      status: 'Present' | 'Absent' | 'Late' | 'Leave';
      remarks: string;
      recordId?: number;
    }>
  >([
    { id: 101, name: 'Arun Kumar', regNo: '913221104001', status: 'Present', remarks: '' },
    { id: 102, name: 'Bhavya Sri', regNo: '913221104002', status: 'Present', remarks: '' },
    { id: 103, name: 'Deepak Raj', regNo: '913221104003', status: 'Present', remarks: '' },
    { id: 104, name: 'Divya Dharshini', regNo: '913221104004', status: 'Present', remarks: '' },
    { id: 105, name: 'Elango Pillai', regNo: '913221104005', status: 'Absent', remarks: 'Medical Intimation' },
    { id: 106, name: 'Gokul Nath', regNo: '913221104006', status: 'Present', remarks: '' },
    { id: 107, name: 'Harini Devi', regNo: '913221104007', status: 'Late', remarks: 'Late entry 15 mins' },
    { id: 108, name: 'Indrajith S', regNo: '913221104008', status: 'Present', remarks: '' },
  ]);

  useEffect(() => {
    fetchExistingAttendance();
  }, [subjectCode, section, attendanceDate]);

  const fetchExistingAttendance = async () => {
    try {
      setLoading(true);
      const records = await facultyApi.getAttendance(subjectCode, section, attendanceDate);
      if (records.length > 0) {
        setStudents((prev) =>
          prev.map((st) => {
            const found = records.find((r) => r.register_number === st.regNo || r.student_name === st.name);
            if (found) {
              return {
                ...st,
                status: found.status as any,
                remarks: found.remarks || '',
                recordId: found.id,
              };
            }
            return st;
          })
        );
      }
    } catch (err) {
      console.error('Error fetching attendance:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (index: number, newStatus: 'Present' | 'Absent' | 'Late' | 'Leave') => {
    setStudents((prev) => {
      const copy = [...prev];
      copy[index].status = newStatus;
      return copy;
    });
  };

  const handleRemarksChange = (index: number, val: string) => {
    setStudents((prev) => {
      const copy = [...prev];
      copy[index].remarks = val;
      return copy;
    });
  };

  const handleMarkAllPresent = () => {
    setStudents((prev) => prev.map((s) => ({ ...s, status: 'Present' })));
    showToast('Marked all students as Present.', 'info');
  };

  const handleSaveAttendance = async () => {
    try {
      setSaving(true);
      const recordsToSave = students.map((s) => ({
        student_id: s.id,
        student_name: s.name,
        register_number: s.regNo,
        subject_code: subjectCode,
        section: section,
        date: attendanceDate,
        status: s.status,
        remarks: s.remarks,
      }));

      await facultyApi.markBulkAttendance(subjectCode, section, attendanceDate, recordsToSave);
      showToast(`Attendance saved successfully for ${subjectCode} (Sec ${section}).`, 'success');
    } catch (err) {
      console.error('Error saving attendance:', err);
      showToast('Failed to save attendance records.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleExportCSV = () => {
    const csvHeader = 'Register Number,Student Name,Subject,Section,Date,Status,Remarks\n';
    const csvRows = students
      .map((s) => `"${s.regNo}","${s.name}","${subjectCode}","${section}","${attendanceDate}","${s.status}","${s.remarks}"`)
      .join('\n');

    const blob = new Blob([csvHeader + csvRows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Attendance_${subjectCode}_Sec${section}_${attendanceDate}.csv`;
    a.click();
    showToast('Attendance report exported to CSV.', 'success');
  };

  const presentCount = students.filter((s) => s.status === 'Present').length;
  const absentCount = students.filter((s) => s.status === 'Absent').length;
  const lateCount = students.filter((s) => s.status === 'Late').length;
  const leaveCount = students.filter((s) => s.status === 'Leave').length;
  const totalCount = students.length;
  const percentage = Math.round((presentCount / totalCount) * 100);

  return (
    <div className="space-y-6 font-body">
      {/* ── Top Controls Bar ── */}
      <div className="bg-white dark:bg-[#1E293B] p-5 rounded-2xl border border-[#E2E8F0] dark:border-[#334155] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-[#64748B]" />
            <label className="text-caption font-bold uppercase text-[#64748B] dark:text-[#94A3B8]">Subject:</label>
            <select
              value={subjectCode}
              onChange={(e) => setSubjectCode(e.target.value)}
              className="h-10 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F5F7FB] dark:bg-[#0F172A] px-3 text-body font-semibold text-[#1F2937] dark:text-[#F8FAFC] outline-none"
            >
              <option value="CS8591">CS8591 Computer Networks</option>
              <option value="CS8492">CS8492 Database Management</option>
              <option value="CS8080">CS8080 AI & Machine Learning</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-caption font-bold uppercase text-[#64748B] dark:text-[#94A3B8]">Section:</label>
            <select
              value={section}
              onChange={(e) => setSection(e.target.value)}
              className="h-10 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F5F7FB] dark:bg-[#0F172A] px-3 text-body font-semibold text-[#1F2937] dark:text-[#F8FAFC] outline-none"
            >
              <option value="A">Section A</option>
              <option value="B">Section B</option>
              <option value="C">Section C</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-caption font-bold uppercase text-[#64748B] dark:text-[#94A3B8]">Date:</label>
            <input
              type="date"
              value={attendanceDate}
              onChange={(e) => setAttendanceDate(e.target.value)}
              className="h-10 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F5F7FB] dark:bg-[#0F172A] px-3 text-body font-semibold text-[#1F2937] dark:text-[#F8FAFC] outline-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleMarkAllPresent}
            className="h-10 px-3.5 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#1E293B] hover:bg-[#F5F7FB] dark:hover:bg-[#0F172A] text-caption font-bold text-[#0E2A6D] dark:text-[#60A5FA] flex items-center gap-2 transition"
          >
            <Check size={16} /> Mark All Present
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="h-10 px-3.5 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#1E293B] hover:bg-[#F5F7FB] dark:hover:bg-[#0F172A] text-caption font-bold text-[#475569] dark:text-[#CBD5E1] flex items-center gap-2 transition"
          >
            <Download size={16} /> Export CSV
          </button>

          <button
            type="button"
            onClick={handleSaveAttendance}
            disabled={saving}
            className="h-10 px-4 rounded-xl bg-[#0E2A6D] hover:bg-[#153B8A] text-white text-caption font-bold flex items-center gap-2 transition shadow-xs disabled:opacity-50"
          >
            <Save size={16} /> {saving ? 'Saving...' : 'Save Attendance'}
          </button>
        </div>
      </div>

      {/* ── Summary Counters ── */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-3 rounded-xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-center">
          <p className="text-caption font-bold uppercase text-[#64748B]">Total</p>
          <p className="font-heading font-bold text-xl text-[#1F2937] dark:text-[#F8FAFC]">{totalCount}</p>
        </div>
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
          <p className="text-caption font-bold uppercase text-emerald-600 dark:text-emerald-400">Present</p>
          <p className="font-heading font-bold text-xl text-emerald-600 dark:text-emerald-400">{presentCount}</p>
        </div>
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-center">
          <p className="text-caption font-bold uppercase text-rose-600 dark:text-rose-400">Absent</p>
          <p className="font-heading font-bold text-xl text-rose-600 dark:text-rose-400">{absentCount}</p>
        </div>
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
          <p className="text-caption font-bold uppercase text-amber-600 dark:text-amber-400">Late</p>
          <p className="font-heading font-bold text-xl text-amber-600 dark:text-amber-400">{lateCount}</p>
        </div>
        <div className="p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#111111] border border-[#D1D5DB] dark:border-[#3F3F46] text-center">
          <p className="text-[11px] font-normal uppercase text-[#6B7280] dark:text-[#A3A3A3]">Percentage</p>
          <p className="font-bold text-xl text-[#111827] dark:text-[#FAFAFA]">{percentage}%</p>
        </div>
      </div>

      {/* ── Student Attendance Roster Table ── */}
      <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-[#E2E8F0] dark:border-[#334155] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-body text-body">
            <thead>
              <tr className="border-b border-[#E2E8F0] dark:border-[#334155] bg-[#F5F7FB] dark:bg-[#0F172A] text-caption font-bold uppercase tracking-[0.05em] text-[#64748B] dark:text-[#94A3B8]">
                <th className="py-3 px-4">#</th>
                <th className="py-3 px-4">Register No</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4 text-center">Attendance Status</th>
                <th className="py-3 px-4">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#334155]">
              {students.map((st, idx) => (
                <tr key={st.id} className="hover:bg-[#F5F7FB]/50 dark:hover:bg-[#0F172A]/50 transition">
                  <td className="py-3 px-4 text-caption font-medium text-[#64748B]">{idx + 1}</td>
                  <td className="py-3 px-4 font-mono text-caption font-semibold text-[#0E2A6D] dark:text-[#60A5FA]">{st.regNo}</td>
                  <td className="py-3 px-4 font-heading font-bold text-[#1F2937] dark:text-[#F8FAFC]">{st.name}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleStatusChange(idx, 'Present')}
                        className={`h-8 px-3 rounded-lg font-caption font-bold text-caption transition ${
                          st.status === 'Present'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-[#64748B] hover:bg-emerald-100'
                        }`}
                      >
                        Present
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStatusChange(idx, 'Absent')}
                        className={`h-8 px-3 rounded-lg font-caption font-bold text-caption transition ${
                          st.status === 'Absent'
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-[#64748B] hover:bg-rose-100'
                        }`}
                      >
                        Absent
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStatusChange(idx, 'Late')}
                        className={`h-8 px-3 rounded-lg font-caption font-bold text-caption transition ${
                          st.status === 'Late'
                            ? 'bg-amber-500 text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-[#64748B] hover:bg-amber-100'
                        }`}
                      >
                        Late
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStatusChange(idx, 'Leave')}
                        className={`h-8 px-3 rounded-lg font-caption font-bold text-caption transition ${
                          st.status === 'Leave'
                            ? 'bg-purple-600 text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-[#64748B] hover:bg-purple-100'
                        }`}
                      >
                        Leave
                      </button>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <input
                      type="text"
                      value={st.remarks}
                      onChange={(e) => handleRemarksChange(idx, e.target.value)}
                      placeholder="Add optional remark..."
                      className="w-full h-8 px-2.5 rounded-lg border border-[#E2E8F0] dark:border-[#334155] bg-[#F5F7FB] dark:bg-[#0F172A] text-caption text-[#1F2937] dark:text-[#F8FAFC] outline-none"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
