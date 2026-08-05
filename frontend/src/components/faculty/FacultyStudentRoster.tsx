import React, { useState, useEffect } from 'react';
import { Users, Search, Filter } from 'lucide-react';
import { facultyApi, StudentRosterItem } from '../../api/faculty';

interface Props {
  selectedDept?: string;
  selectedSem?: string;
  selectedSection?: string;
  searchQuery?: string;
}

export const FacultyStudentRoster: React.FC<Props> = () => {
  const [students, setStudents] = useState<StudentRosterItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [localSearch, setLocalSearch] = useState('');
  const [localDept, setLocalDept] = useState('All');
  const [localSection, setLocalSection] = useState('All');

  useEffect(() => {
    fetchStudents();
  }, [localDept, localSection, localSearch]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const deptVal = localDept !== 'All' ? localDept : undefined;
      const secVal = localSection !== 'All' ? localSection : undefined;
      const data = await facultyApi.getStudents({
        department: deptVal,
        section: secVal,
        search: localSearch,
      });
      setStudents(data);
    } catch (err) {
      console.error('Error fetching student roster:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* ── Contextual Filter & Search Bar ── */}
      <div className="bg-[#FFFFFF] dark:bg-[#18181B] p-3.5 sm:p-4 rounded-[16px] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs flex flex-col md:flex-row items-center justify-between gap-3 select-none">
        <div className="relative w-full md:w-80 flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7280] dark:text-[#A1A1AA]" />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search students by name, reg no..."
            className="w-full h-[38px] sm:h-[40px] pl-10 pr-4 rounded-[10px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#FFFFFF] dark:bg-[#18181B] text-[13px] sm:text-[14px] font-normal text-[#111827] dark:text-[#FAFAFA] outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter size={16} className="text-[#6B7280] dark:text-[#A1A1AA]" />
          <select
            value={localDept}
            onChange={(e) => setLocalDept(e.target.value)}
            className="h-[38px] sm:h-[40px] rounded-[10px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#FFFFFF] dark:bg-[#18181B] px-3.5 text-[13px] sm:text-[14px] font-normal text-[#111827] dark:text-[#FAFAFA] outline-none cursor-pointer w-full md:w-auto"
          >
            <option value="All">All Departments</option>
            <option value="Computer Science & Engineering">CS & Engineering</option>
            <option value="Information Technology">Information Technology</option>
            <option value="Electronics & Communication">Electronics & Comm</option>
          </select>

          <select
            value={localSection}
            onChange={(e) => setLocalSection(e.target.value)}
            className="h-[38px] sm:h-[40px] rounded-[10px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#FFFFFF] dark:bg-[#18181B] px-3.5 text-[13px] sm:text-[14px] font-normal text-[#111827] dark:text-[#FAFAFA] outline-none cursor-pointer w-full md:w-auto"
          >
            <option value="All">All Sections</option>
            <option value="A">Section A</option>
            <option value="B">Section B</option>
            <option value="C">Section C</option>
          </select>
        </div>
      </div>

      {/* ── Student Roster Table ── */}
      <div className="bg-[#FFFFFF] dark:bg-[#18181B] rounded-[16px] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs overflow-hidden">
        <div className="p-6 border-b border-[#E5E7EB] dark:border-[#2A2A2A] flex items-center justify-between gap-3">
          <div>
            <h3 className="text-[18px] font-semibold text-[#111827] dark:text-[#FAFAFA]">Enrolled Student Roster</h3>
            <p className="text-[15px] font-normal text-[#6B7280] dark:text-[#A1A1AA]">Inspect student register numbers, attendance percentages, and assignment statuses.</p>
          </div>
          <span className="text-[12px] font-medium px-3 py-1 rounded-[6px] bg-[#F8FAFC] dark:bg-[#111111] text-[#111827] dark:text-[#FAFAFA] border border-[#E5E7EB] dark:border-[#2A2A2A] shrink-0">
            Total Students: {students.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-sans text-[14px]">
            <thead>
              <tr className="border-b border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#F8FAFC] dark:bg-[#111111] text-[12px] sm:text-[14px] font-semibold uppercase tracking-wider text-[#6B7280] dark:text-[#A1A1AA]">
                <th className="py-3.5 px-6">Register No</th>
                <th className="py-3.5 px-6">Student Name</th>
                <th className="py-3.5 px-6">Section</th>
                <th className="py-3.5 px-6 text-center">Attendance %</th>
                <th className="py-3.5 px-6 text-center">Pending Assignments</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB] dark:divide-[#2A2A2A]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-[14px] font-normal text-[#6B7280] dark:text-[#A1A1AA] animate-pulse">Loading student roster...</td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-[14px] font-normal text-[#6B7280] dark:text-[#A1A1AA]">No students matching criteria.</td>
                </tr>
              ) : (
                students.map((st) => (
                  <tr key={st.id} className="hover:bg-[#F8FAFC] dark:hover:bg-[#141414] transition">
                    <td className="py-4 px-6 font-mono font-medium text-[13px] sm:text-[14px] text-[#111827] dark:text-[#FAFAFA]">{st.register_number}</td>
                    <td className="py-4 px-6 font-medium text-[13px] sm:text-[14px] text-[#111827] dark:text-[#FAFAFA]">{st.student_name}</td>
                    <td className="py-4 px-6 text-[13px] sm:text-[14px] text-[#6B7280] dark:text-[#A1A1AA]">{st.section}</td>
                    <td className="py-4 px-6 text-center text-[13px] sm:text-[14px] font-bold text-emerald-600 dark:text-emerald-400">{st.attendance_percentage}%</td>
                    <td className="py-4 px-6 text-center text-[13px] sm:text-[14px] font-medium text-[#111827] dark:text-[#FAFAFA]">{st.assignment_status}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
