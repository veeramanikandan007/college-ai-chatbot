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
      <div className="bg-[#FFFFFF] dark:bg-[#111111] p-4 rounded-[16px] border border-[#E5E5E5] dark:border-[#2A2A2A] shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#525252]" />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search students by name, register number, or email..."
            className="w-full h-10 pl-10 pr-4 rounded-[10px] border border-[#E5E5E5] dark:border-[#2A2A2A] bg-[#F8F8F8] dark:bg-[#18181B] text-[14px] font-normal text-[#111111] dark:text-[#FAFAFA] outline-none"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Filter size={16} className="text-[#525252]" />
          <select
            value={localDept}
            onChange={(e) => setLocalDept(e.target.value)}
            className="h-10 rounded-[10px] border border-[#E5E5E5] dark:border-[#2A2A2A] bg-[#F8F8F8] dark:bg-[#18181B] px-3.5 text-[14px] font-normal text-[#111111] dark:text-[#FAFAFA] outline-none cursor-pointer"
          >
            <option value="All">All Departments</option>
            <option value="Computer Science & Engineering">CS & Engineering</option>
            <option value="Information Technology">Information Technology</option>
            <option value="Electronics & Communication">Electronics & Comm</option>
          </select>

          <select
            value={localSection}
            onChange={(e) => setLocalSection(e.target.value)}
            className="h-10 rounded-[10px] border border-[#E5E5E5] dark:border-[#2A2A2A] bg-[#F8F8F8] dark:bg-[#18181B] px-3.5 text-[14px] font-normal text-[#111111] dark:text-[#FAFAFA] outline-none cursor-pointer"
          >
            <option value="All">All Sections</option>
            <option value="A">Section A</option>
            <option value="B">Section B</option>
            <option value="C">Section C</option>
          </select>
        </div>
      </div>

      {/* ── Student Roster Table ── */}
      <div className="bg-[#FFFFFF] dark:bg-[#111111] rounded-[16px] border border-[#E5E5E5] dark:border-[#2A2A2A] shadow-xs overflow-hidden">
        <div className="p-5 border-b border-[#E5E5E5] dark:border-[#2A2A2A] flex items-center justify-between gap-3">
          <div>
            <h3 className="text-[18px] font-semibold text-[#111111] dark:text-[#FAFAFA]">Enrolled Student Roster</h3>
            <p className="text-[15px] font-medium text-[#525252] dark:text-[#A3A3A3]">Inspect student register numbers, attendance percentages, and assignment statuses.</p>
          </div>
          <span className="text-[12px] font-medium px-3 py-1 rounded-[6px] bg-[#F3F3F3] dark:bg-[#232323] text-[#111111] dark:text-[#FAFAFA] border border-[#E5E5E5] dark:border-[#2A2A2A] shrink-0">
            Total Students: {students.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-sans text-[14px]">
            <thead>
              <tr className="border-b border-[#E5E5E5] dark:border-[#2A2A2A] bg-[#F8F8F8] dark:bg-[#18181B] text-[14px] font-semibold uppercase text-[#525252] dark:text-[#A3A3A3]">
                <th className="py-3 px-4">Register No</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Section</th>


                <th className="py-3 px-4 text-center">Attendance %</th>
                <th className="py-3 px-4 text-center">Pending Assignments</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#334155]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-caption text-[#64748B] animate-pulse">Loading student roster...</td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-caption text-[#64748B]">No students matching criteria.</td>
                </tr>
              ) : (
                students.map((st) => (
                  <tr key={st.id} className="hover:bg-[#F5F7FB]/50 dark:hover:bg-[#0F172A]/50">
                    <td className="py-3.5 px-4 font-mono font-bold text-caption text-[#0E2A6D] dark:text-[#60A5FA]">{st.register_number}</td>
                    <td className="py-3.5 px-4 font-heading font-bold text-[#1F2937] dark:text-[#F8FAFC]">{st.student_name}</td>
                    <td className="py-3.5 px-4 text-caption text-[#64748B]">{st.section}</td>
                    <td className="py-3.5 px-4 text-center font-bold text-emerald-600 dark:text-emerald-400">{st.attendance_percentage}%</td>
                    <td className="py-3.5 px-4 text-center font-semibold text-[#1F2937] dark:text-[#F8FAFC]">{st.assignment_status}</td>
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
