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
      <div className="bg-[#FFFFFF] dark:bg-[#111111] p-5 rounded-[16px] border border-[#E5E5E5] dark:border-[#2A2A2A] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-[#525252]" />
            <label className="text-[14px] font-medium text-[#525252] dark:text-[#A3A3A3]">Subject:</label>
            <select
              value={subjectCode}
              onChange={(e) => setSubjectCode(e.target.value)}
              className="h-10 rounded-[10px] border border-[#E5E5E5] dark:border-[#2A2A2A] bg-[#F8F8F8] dark:bg-[#18181B] px-3.5 text-[14px] font-normal text-[#111111] dark:text-[#FAFAFA] outline-none cursor-pointer"
            >
              <option value="CS8591">CS8591 Computer Networks</option>
              <option value="CS8492">CS8492 Database Management</option>
              <option value="CS8080">CS8080 AI & Machine Learning</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-[14px] font-medium text-[#525252] dark:text-[#A3A3A3]">Section:</label>
            <select
              value={section}
              onChange={(e) => setSection(e.target.value)}
              className="h-10 rounded-[10px] border border-[#E5E5E5] dark:border-[#2A2A2A] bg-[#F8F8F8] dark:bg-[#18181B] px-3.5 text-[14px] font-normal text-[#111111] dark:text-[#FAFAFA] outline-none cursor-pointer"
            >
              <option value="A">Section A</option>
              <option value="B">Section B</option>
              <option value="C">Section C</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-[14px] font-medium text-[#525252] dark:text-[#A3A3A3]">Date:</label>
            <input
              type="date"
              value={attendanceDate}
              onChange={(e) => setAttendanceDate(e.target.value)}
              className="h-10 rounded-[10px] border border-[#E5E5E5] dark:border-[#2A2A2A] bg-[#F8F8F8] dark:bg-[#18181B] px-3.5 text-[14px] font-normal text-[#111111] dark:text-[#FAFAFA] outline-none cursor-pointer"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto shrink-0">
          <button
            type="button"
            onClick={handleMarkAllPresent}
            className="h-[40px] px-4 rounded-[10px] border border-[#D4D4D4] dark:border-[#2A2A2A] bg-[#FFFFFF] dark:bg-[#18181B] hover:bg-[#F3F3F3] dark:hover:bg-[#232323] text-[14px] sm:text-[15px] font-semibold text-[#111111] dark:text-[#FAFAFA] flex items-center justify-center gap-2 whitespace-nowrap shrink-0 transition cursor-pointer flex-1 sm:flex-none"
          >
            <Check size={16} /> Mark All Present
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="h-[40px] px-4 rounded-[10px] border border-[#D4D4D4] dark:border-[#2A2A2A] bg-[#FFFFFF] dark:bg-[#18181B] hover:bg-[#F3F3F3] dark:hover:bg-[#232323] text-[14px] sm:text-[15px] font-semibold text-[#525252] dark:text-[#A3A3A3] flex items-center justify-center gap-2 whitespace-nowrap shrink-0 transition cursor-pointer flex-1 sm:flex-none"
          >
            <Download size={16} /> Export CSV
          </button>

          <button
            type="button"
            onClick={handleSaveAttendance}
            disabled={saving}
            className="h-[40px] px-4 rounded-[10px] bg-[#111111] hover:bg-[#262626] dark:bg-[#FAFAFA] dark:hover:bg-[#E5E5E5] text-white dark:text-[#111111] text-[14px] sm:text-[15px] font-semibold flex items-center justify-center gap-2 whitespace-nowrap shrink-0 transition shadow-xs disabled:opacity-50 cursor-pointer w-full sm:w-auto"
          >
            <Save size={16} /> {saving ? 'Saving...' : 'Save Attendance'}
          </button>
        </div>

      </div>

      {/* ── Summary Counters ── */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-3 rounded-[12px] bg-[#FFFFFF] dark:bg-[#111111] border border-[#E5E5E5] dark:border-[#2A2A2A] text-center">
          <p className="text-[12px] font-medium uppercase text-[#525252] dark:text-[#A3A3A3]">Total</p>
          <p className="text-[34px] font-bold text-[#111111] dark:text-[#FAFAFA]">{totalCount}</p>
        </div>
        <div className="p-3 rounded-[12px] bg-[#F8F8F8] dark:bg-[#18181B] border border-[#E5E5E5] dark:border-[#2A2A2A] text-center">
          <p className="text-[12px] font-medium uppercase text-[#111111] dark:text-[#FAFAFA]">Present</p>
          <p className="text-[34px] font-bold text-[#111111] dark:text-[#FAFAFA]">{presentCount}</p>
        </div>
        <div className="p-3 rounded-[12px] bg-[#F8F8F8] dark:bg-[#18181B] border border-[#E5E5E5] dark:border-[#2A2A2A] text-center">
          <p className="text-[12px] font-medium uppercase text-[#525252] dark:text-[#A3A3A3]">Absent</p>
          <p className="text-[34px] font-bold text-[#525252] dark:text-[#A3A3A3]">{absentCount}</p>
        </div>
        <div className="p-3 rounded-[12px] bg-[#F8F8F8] dark:bg-[#18181B] border border-[#E5E5E5] dark:border-[#2A2A2A] text-center">
          <p className="text-[12px] font-medium uppercase text-[#525252] dark:text-[#A3A3A3]">Late</p>
          <p className="text-[34px] font-bold text-[#525252] dark:text-[#A3A3A3]">{lateCount}</p>
        </div>
        <div className="p-3 rounded-[12px] bg-[#F8F8F8] dark:bg-[#18181B] border border-[#E5E5E5] dark:border-[#2A2A2A] text-center">
          <p className="text-[12px] font-medium uppercase text-[#525252] dark:text-[#A3A3A3]">Percentage</p>
          <p className="text-[34px] font-bold text-[#111111] dark:text-[#FAFAFA]">{percentage}%</p>
        </div>
      </div>

      {/* ── Student Attendance Roster Table ── */}
      <div className="bg-[#FFFFFF] dark:bg-[#111111] rounded-[16px] border border-[#E5E5E5] dark:border-[#2A2A2A] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-sans text-[14px]">
            <thead>
              <tr className="border-b border-[#E5E5E5] dark:border-[#2A2A2A] bg-[#F8F8F8] dark:bg-[#18181B] text-[14px] font-semibold uppercase tracking-[0.05em] text-[#525252] dark:text-[#A3A3A3]">
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
