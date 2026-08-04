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
      <div className="bg-[#FFFFFF] dark:bg-[#18181B] p-5 rounded-[16px] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-[#6B7280] dark:text-[#A1A1AA]" />
            <label className="text-[14px] font-medium text-[#6B7280] dark:text-[#A1A1AA]">Subject:</label>
            <select
              value={subjectCode}
              onChange={(e) => setSubjectCode(e.target.value)}
              className="h-10 rounded-[10px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#F8FAFC] dark:bg-[#111111] px-3.5 text-[14px] font-normal text-[#111827] dark:text-[#FAFAFA] outline-none cursor-pointer"
            >
              <option value="CS8591">CS8591 Computer Networks</option>
              <option value="CS8492">CS8492 Database Management</option>
              <option value="CS8080">CS8080 AI & Machine Learning</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-[14px] font-medium text-[#6B7280] dark:text-[#A1A1AA]">Section:</label>
            <select
              value={section}
              onChange={(e) => setSection(e.target.value)}
              className="h-10 rounded-[10px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#F8FAFC] dark:bg-[#111111] px-3.5 text-[14px] font-normal text-[#111827] dark:text-[#FAFAFA] outline-none cursor-pointer"
            >
              <option value="A">Section A</option>
              <option value="B">Section B</option>
              <option value="C">Section C</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-[14px] font-medium text-[#6B7280] dark:text-[#A1A1AA]">Date:</label>
            <input
              type="date"
              value={attendanceDate}
              onChange={(e) => setAttendanceDate(e.target.value)}
              className="h-10 rounded-[10px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#F8FAFC] dark:bg-[#111111] px-3.5 text-[14px] font-normal text-[#111827] dark:text-[#FAFAFA] outline-none cursor-pointer"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto shrink-0">
          <button
            type="button"
            onClick={handleMarkAllPresent}
            className="h-[40px] px-4 rounded-[10px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#FFFFFF] dark:bg-[#18181B] hover:bg-[#F8FAFC] dark:hover:bg-[#111111] text-[14px] font-medium text-[#111827] dark:text-[#FAFAFA] flex items-center justify-center gap-2 whitespace-nowrap shrink-0 transition cursor-pointer flex-1 sm:flex-none"
          >
            <Check size={16} /> Mark All Present
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="h-[40px] px-4 rounded-[10px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#FFFFFF] dark:bg-[#18181B] hover:bg-[#F8FAFC] dark:hover:bg-[#111111] text-[14px] font-medium text-[#6B7280] dark:text-[#A1A1AA] flex items-center justify-center gap-2 whitespace-nowrap shrink-0 transition cursor-pointer flex-1 sm:flex-none"
          >
            <Download size={16} /> Export CSV
          </button>

          <button
            type="button"
            onClick={handleSaveAttendance}
            disabled={saving}
            className="h-[40px] px-5 rounded-[10px] bg-[#111827] hover:bg-[#1F2937] dark:bg-[#FAFAFA] dark:hover:bg-[#E5E5E5] text-[#FFFFFF] dark:text-[#111111] text-[14px] font-medium flex items-center justify-center gap-2 whitespace-nowrap shrink-0 transition shadow-xs disabled:opacity-50 cursor-pointer w-full sm:w-auto"
          >
            <Save size={16} /> {saving ? 'Saving...' : 'Save Attendance'}
          </button>
        </div>

      </div>

      {/* ── Summary Counters ── */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-4 rounded-[16px] bg-[#FFFFFF] dark:bg-[#18181B] border border-[#E5E7EB] dark:border-[#2A2A2A] text-center shadow-xs">
          <p className="text-[12px] font-normal uppercase text-[#6B7280] dark:text-[#A1A1AA]">Total</p>
          <p className="text-[28px] font-semibold text-[#111827] dark:text-[#FAFAFA] leading-tight mt-1">{totalCount}</p>
        </div>
        <div className="p-4 rounded-[16px] bg-[#FFFFFF] dark:bg-[#18181B] border border-[#E5E7EB] dark:border-[#2A2A2A] text-center shadow-xs">
          <p className="text-[12px] font-normal uppercase text-[#6B7280] dark:text-[#A1A1AA]">Present</p>
          <p className="text-[28px] font-semibold text-[#111827] dark:text-[#FAFAFA] leading-tight mt-1">{presentCount}</p>
        </div>
        <div className="p-4 rounded-[16px] bg-[#FFFFFF] dark:bg-[#18181B] border border-[#E5E7EB] dark:border-[#2A2A2A] text-center shadow-xs">
          <p className="text-[12px] font-normal uppercase text-[#6B7280] dark:text-[#A1A1AA]">Absent</p>
          <p className="text-[28px] font-semibold text-[#111827] dark:text-[#FAFAFA] leading-tight mt-1">{absentCount}</p>
        </div>
        <div className="p-4 rounded-[16px] bg-[#FFFFFF] dark:bg-[#18181B] border border-[#E5E7EB] dark:border-[#2A2A2A] text-center shadow-xs">
          <p className="text-[12px] font-normal uppercase text-[#6B7280] dark:text-[#A1A1AA]">Late</p>
          <p className="text-[28px] font-semibold text-[#111827] dark:text-[#FAFAFA] leading-tight mt-1">{lateCount}</p>
        </div>
        <div className="p-4 rounded-[16px] bg-[#FFFFFF] dark:bg-[#18181B] border border-[#E5E7EB] dark:border-[#2A2A2A] text-center shadow-xs">
          <p className="text-[12px] font-normal uppercase text-[#6B7280] dark:text-[#A1A1AA]">Percentage</p>
          <p className="text-[28px] font-semibold text-[#111827] dark:text-[#FAFAFA] leading-tight mt-1">{percentage}%</p>
        </div>
      </div>

      {/* ── Student Attendance Roster Table ── */}
      <div className="bg-[#FFFFFF] dark:bg-[#18181B] rounded-[16px] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-sans text-[14px]">
            <thead>
              <tr className="border-b border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#F8FAFC] dark:bg-[#111111] text-[12px] font-semibold uppercase tracking-wider text-[#6B7280] dark:text-[#A1A1AA]">
                <th className="py-3.5 px-6">#</th>
                <th className="py-3.5 px-6">Register No</th>
                <th className="py-3.5 px-6">Student Name</th>
                <th className="py-3.5 px-6 text-center">Attendance Status</th>
                <th className="py-3.5 px-6">Remarks</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#E5E7EB] dark:divide-[#2A2A2A]">
              {students.map((st, idx) => (
                <tr key={st.id} className="hover:bg-[#F8FAFC] dark:hover:bg-[#141414] transition">
                  <td className="py-4 px-6 text-[14px] text-[#6B7280] dark:text-[#A1A1AA]">{idx + 1}</td>
                  <td className="py-4 px-6 font-mono text-[14px] font-medium text-[#111827] dark:text-[#FAFAFA]">{st.regNo}</td>
                  <td className="py-4 px-6 font-medium text-[#111827] dark:text-[#FAFAFA]">{st.name}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleStatusChange(idx, 'Present')}
                        className={`h-8 px-3 rounded-[8px] text-[13px] font-medium transition cursor-pointer ${
                          st.status === 'Present'
                            ? 'bg-[#111827] text-[#FFFFFF] dark:bg-[#FAFAFA] dark:text-[#111111]'
                            : 'bg-[#F8FAFC] dark:bg-[#111111] text-[#6B7280] dark:text-[#A1A1AA] hover:text-[#111827] dark:hover:text-[#FAFAFA]'
                        }`}
                      >
                        Present
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStatusChange(idx, 'Absent')}
                        className={`h-8 px-3 rounded-[8px] text-[13px] font-medium transition cursor-pointer ${
                          st.status === 'Absent'
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'bg-[#F8FAFC] dark:bg-[#111111] text-[#6B7280] dark:text-[#A1A1AA] hover:text-[#111827] dark:hover:text-[#FAFAFA]'
                        }`}
                      >
                        Absent
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStatusChange(idx, 'Late')}
                        className={`h-8 px-3 rounded-[8px] text-[13px] font-medium transition cursor-pointer ${
                          st.status === 'Late'
                            ? 'bg-amber-500 text-white shadow-xs'
                            : 'bg-[#F8FAFC] dark:bg-[#111111] text-[#6B7280] dark:text-[#A1A1AA] hover:text-[#111827] dark:hover:text-[#FAFAFA]'
                        }`}
                      >
                        Late
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStatusChange(idx, 'Leave')}
                        className={`h-8 px-3 rounded-[8px] text-[13px] font-medium transition cursor-pointer ${
                          st.status === 'Leave'
                            ? 'bg-purple-600 text-white shadow-xs'
                            : 'bg-[#F8FAFC] dark:bg-[#111111] text-[#6B7280] dark:text-[#A1A1AA] hover:text-[#111827] dark:hover:text-[#FAFAFA]'
                        }`}
                      >
                        Leave
                      </button>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <input
                      type="text"
                      value={st.remarks}
                      onChange={(e) => handleRemarksChange(idx, e.target.value)}
                      placeholder="Add optional remark..."
                      className="w-full h-[36px] px-3 rounded-[8px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#FFFFFF] dark:bg-[#18181B] text-[14px] text-[#111827] dark:text-[#FAFAFA] outline-none"
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
