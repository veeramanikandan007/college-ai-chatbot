import React, { useState, useEffect } from 'react';
import { Building2, BookOpen, Plus, Trash2, Edit2, X, CheckCircle2 } from 'lucide-react';
import { adminDashboardApi, AdminDepartment, AdminCourse } from '../../api/adminDashboard';
import { useToast } from '../../context/ToastContext';

export const AdminDepartmentManagement: React.FC = () => {
  const { showToast } = useToast();
  const [departments, setDepartments] = useState<AdminDepartment[]>([]);
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [showCourseModal, setShowCourseModal] = useState(false);

  // Dept Form State
  const [deptCode, setDeptCode] = useState('');
  const [deptName, setDeptName] = useState('');
  const [hod, setHod] = useState('Dr. S. Ramanathan');
  const [sections, setSections] = useState(4);

  // Course Form State
  const [selectedDeptCode, setSelectedDeptCode] = useState('CSE');
  const [courseCode, setCourseCode] = useState('');
  const [courseName, setCourseName] = useState('');
  const [credits, setCredits] = useState(3);
  const [semester, setSemester] = useState(6);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [dList, cList] = await Promise.all([adminDashboardApi.getDepartments(), adminDashboardApi.getCourses()]);
      setDepartments(dList);
      setCourses(cList);
    } catch (err) {
      console.error('Error loading departments & courses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptCode.trim() || !deptName.trim()) return;

    try {
      await adminDashboardApi.createDepartment({
        code: deptCode,
        name: deptName,
        head_of_department: hod,
        total_sections: sections,
      });
      showToast(`Department ${deptName} created.`, 'success');
      setShowDeptModal(false);
      setDeptCode('');
      setDeptName('');
      fetchData();
    } catch (err) {
      console.error('Error creating department:', err);
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseCode.trim() || !courseName.trim()) return;

    try {
      await adminDashboardApi.createCourse({
        department_code: selectedDeptCode,
        course_code: courseCode,
        course_name: courseName,
        credits: credits,
        semester: semester,
      });
      showToast(`Course ${courseName} created.`, 'success');
      setShowCourseModal(false);
      setCourseCode('');
      setCourseName('');
      fetchData();
    } catch (err) {
      console.error('Error creating course:', err);
    }
  };

  const handleDeleteDept = async (id: number, name: string) => {
    if (!window.confirm(`Delete department ${name}?`)) return;
    try {
      await adminDashboardApi.deleteDepartment(id);
      showToast(`Department ${name} deleted.`, 'info');
      fetchData();
    } catch (err) {
      console.error('Error deleting department:', err);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* ── Top Bar Controls Card ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FFFFFF] dark:bg-[#18181B] p-6 rounded-[16px] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs">
        <div className="space-y-1">
          <h3 className="text-[18px] font-semibold text-[#111827] dark:text-[#FAFAFA]">Departments & Course Catalog</h3>
          <p className="text-[14px] font-normal text-[#6B7280] dark:text-[#A1A1AA]">Manage academic departments, syllabus courses, HOD assignments, and credits.</p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setShowDeptModal(true)}
            className="h-[40px] px-4 rounded-[10px] bg-[#111827] hover:bg-[#1F2937] dark:bg-[#FAFAFA] dark:hover:bg-[#E5E5E5] text-[#FFFFFF] dark:text-[#111111] text-[14px] font-medium flex items-center gap-2 transition cursor-pointer"
          >
            <Plus size={16} /> Add Department
          </button>
          <button
            onClick={() => setShowCourseModal(true)}
            className="h-[40px] px-4 rounded-[10px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#FFFFFF] dark:bg-[#18181B] hover:bg-[#F8FAFC] dark:hover:bg-[#27272A] text-[#111827] dark:text-[#FAFAFA] text-[14px] font-medium flex items-center gap-2 transition cursor-pointer"
          >
            <Plus size={16} /> Add Course
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Departments Card ── */}
        <div className="bg-[#FFFFFF] dark:bg-[#18181B] p-6 rounded-[16px] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs space-y-4">
          <h3 className="text-[18px] font-semibold text-[#111827] dark:text-[#FAFAFA] flex items-center gap-2">
            <Building2 className="text-[#111827] dark:text-[#FAFAFA]" size={20} />
            Academic Departments ({departments.length})
          </h3>

          <div className="space-y-3">
            {departments.map((d) => (
              <div
                key={d.id}
                className="p-4 rounded-[12px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] flex items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] font-medium text-[#111827] dark:text-[#FAFAFA] px-2 py-0.5 rounded-[6px] bg-[#111827]/10 dark:bg-[#FAFAFA]/10 border border-[#E5E7EB] dark:border-[#2A2A2A]">
                      {d.code}
                    </span>
                    <h4 className="text-[14px] font-semibold text-[#111827] dark:text-[#FAFAFA]">{d.name}</h4>
                  </div>
                  <p className="text-[12px] text-[#6B7280] dark:text-[#A1A1AA] mt-1">
                    HOD: {d.head_of_department} · Sections: {d.total_sections}
                  </p>
                </div>

                <button onClick={() => handleDeleteDept(d.id, d.name)} className="p-1.5 text-[#6B7280] hover:text-rose-600 dark:hover:text-rose-400 rounded-[6px] transition cursor-pointer">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ── Courses Catalog Card ── */}
        <div className="bg-[#FFFFFF] dark:bg-[#18181B] p-6 rounded-[16px] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs space-y-4">
          <h3 className="text-[18px] font-semibold text-[#111827] dark:text-[#FAFAFA] flex items-center gap-2">
            <BookOpen className="text-[#111827] dark:text-[#FAFAFA]" size={20} />
            Course Catalog ({courses.length})
          </h3>

          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {courses.map((c) => (
              <div
                key={c.id}
                className="p-4 rounded-[12px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] flex items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] font-medium text-[#111827] dark:text-[#FAFAFA] px-2 py-0.5 rounded-[6px] bg-[#111827]/10 dark:bg-[#FAFAFA]/10 border border-[#E5E7EB] dark:border-[#2A2A2A] font-mono">{c.course_code}</span>
                    <h4 className="text-[14px] font-semibold text-[#111827] dark:text-[#FAFAFA]">{c.course_name}</h4>
                  </div>
                  <p className="text-[12px] text-[#6B7280] dark:text-[#A1A1AA] mt-1">
                    Dept: {c.department_code} · Semester {c.semester} · Credits: {c.credits}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Add Department Modal ── */}
      {showDeptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 font-sans">
          <div className="bg-[#FFFFFF] dark:bg-[#18181B] rounded-[16px] max-w-lg w-full p-6 space-y-5 shadow-2xl border border-[#E5E7EB] dark:border-[#2A2A2A]">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] dark:border-[#2A2A2A] pb-4">
              <h3 className="text-[18px] font-semibold text-[#111827] dark:text-[#FAFAFA]">Add Department</h3>
              <button onClick={() => setShowDeptModal(false)} className="p-1 rounded-[6px] text-[#6B7280] hover:text-[#111827] dark:text-[#A1A1AA] dark:hover:text-[#FAFAFA] transition cursor-pointer">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateDept} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[12px] font-medium text-[#6B7280] dark:text-[#A1A1AA] mb-1 block">Code</label>
                  <input
                    type="text"
                    value={deptCode}
                    onChange={(e) => setDeptCode(e.target.value)}
                    placeholder="e.g. AI_DS"
                    required
                    className="w-full h-[40px] px-3.5 rounded-[10px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#F8FAFC] dark:bg-[#111111] text-[14px] text-[#111827] dark:text-[#FAFAFA] outline-none focus:border-[#111827] dark:focus:border-[#FAFAFA] transition"
                  />
                </div>
                <div>
                  <label className="text-[12px] font-medium text-[#6B7280] dark:text-[#A1A1AA] mb-1 block">Total Sections</label>
                  <input
                    type="number"
                    value={sections}
                    onChange={(e) => setSections(Number(e.target.value))}
                    className="w-full h-[40px] px-3.5 rounded-[10px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#F8FAFC] dark:bg-[#111111] text-[14px] text-[#111827] dark:text-[#FAFAFA] outline-none focus:border-[#111827] dark:focus:border-[#FAFAFA] transition"
                  />
                </div>
              </div>

              <div>
                <label className="text-[12px] font-medium text-[#6B7280] dark:text-[#A1A1AA] mb-1 block">Department Full Name</label>
                <input
                  type="text"
                  value={deptName}
                  onChange={(e) => setDeptName(e.target.value)}
                  placeholder="e.g. Artificial Intelligence & Data Science"
                  required
                  className="w-full h-[40px] px-3.5 rounded-[10px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#F8FAFC] dark:bg-[#111111] text-[14px] text-[#111827] dark:text-[#FAFAFA] outline-none focus:border-[#111827] dark:focus:border-[#FAFAFA] transition"
                />
              </div>

              <div>
                <label className="text-[12px] font-medium text-[#6B7280] dark:text-[#A1A1AA] mb-1 block">Head of Department (HOD)</label>
                <input
                  type="text"
                  value={hod}
                  onChange={(e) => setHod(e.target.value)}
                  className="w-full h-[40px] px-3.5 rounded-[10px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#F8FAFC] dark:bg-[#111111] text-[14px] text-[#111827] dark:text-[#FAFAFA] outline-none focus:border-[#111827] dark:focus:border-[#FAFAFA] transition"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E5E7EB] dark:border-[#2A2A2A]">
                <button type="button" onClick={() => setShowDeptModal(false)} className="h-[40px] px-4 rounded-[10px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#FFFFFF] dark:bg-[#18181B] text-[#111827] dark:text-[#FAFAFA] text-[14px] font-medium transition cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="h-[40px] px-5 rounded-[10px] bg-[#111827] hover:bg-[#1F2937] dark:bg-[#FAFAFA] dark:hover:bg-[#E5E5E5] text-[#FFFFFF] dark:text-[#111111] text-[14px] font-medium transition cursor-pointer shadow-xs">
                  Save Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Add Course Modal ── */}
      {showCourseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 font-sans">
          <div className="bg-[#FFFFFF] dark:bg-[#18181B] rounded-[16px] max-w-lg w-full p-6 space-y-5 shadow-2xl border border-[#E5E7EB] dark:border-[#2A2A2A]">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] dark:border-[#2A2A2A] pb-4">
              <h3 className="text-[18px] font-semibold text-[#111827] dark:text-[#FAFAFA]">Add New Course</h3>
              <button onClick={() => setShowCourseModal(false)} className="p-1 rounded-[6px] text-[#6B7280] hover:text-[#111827] dark:text-[#A1A1AA] dark:hover:text-[#FAFAFA] transition cursor-pointer">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateCourse} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[12px] font-medium text-[#6B7280] dark:text-[#A1A1AA] mb-1 block">Dept Code</label>
                  <input
                    type="text"
                    value={selectedDeptCode}
                    onChange={(e) => setSelectedDeptCode(e.target.value)}
                    className="w-full h-[40px] px-3.5 rounded-[10px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#F8FAFC] dark:bg-[#111111] text-[14px] text-[#111827] dark:text-[#FAFAFA] outline-none focus:border-[#111827] dark:focus:border-[#FAFAFA] transition"
                  />
                </div>
                <div>
                  <label className="text-[12px] font-medium text-[#6B7280] dark:text-[#A1A1AA] mb-1 block">Course Code</label>
                  <input
                    type="text"
                    value={courseCode}
                    onChange={(e) => setCourseCode(e.target.value)}
                    placeholder="e.g. CS8601"
                    required
                    className="w-full h-[40px] px-3.5 rounded-[10px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#F8FAFC] dark:bg-[#111111] text-[14px] text-[#111827] dark:text-[#FAFAFA] outline-none focus:border-[#111827] dark:focus:border-[#FAFAFA] transition font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[12px] font-medium text-[#6B7280] dark:text-[#A1A1AA] mb-1 block">Course Name</label>
                <input
                  type="text"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  placeholder="e.g. Deep Learning & Neural Networks"
                  required
                  className="w-full h-[40px] px-3.5 rounded-[10px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#F8FAFC] dark:bg-[#111111] text-[14px] text-[#111827] dark:text-[#FAFAFA] outline-none focus:border-[#111827] dark:focus:border-[#FAFAFA] transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[12px] font-medium text-[#6B7280] dark:text-[#A1A1AA] mb-1 block">Credits</label>
                  <input
                    type="number"
                    value={credits}
                    onChange={(e) => setCredits(Number(e.target.value))}
                    className="w-full h-[40px] px-3.5 rounded-[10px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#F8FAFC] dark:bg-[#111111] text-[14px] text-[#111827] dark:text-[#FAFAFA] outline-none focus:border-[#111827] dark:focus:border-[#FAFAFA] transition"
                  />
                </div>
                <div>
                  <label className="text-[12px] font-medium text-[#6B7280] dark:text-[#A1A1AA] mb-1 block">Semester</label>
                  <input
                    type="number"
                    value={semester}
                    onChange={(e) => setSemester(Number(e.target.value))}
                    className="w-full h-[40px] px-3.5 rounded-[10px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#F8FAFC] dark:bg-[#111111] text-[14px] text-[#111827] dark:text-[#FAFAFA] outline-none focus:border-[#111827] dark:focus:border-[#FAFAFA] transition"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E5E7EB] dark:border-[#2A2A2A]">
                <button type="button" onClick={() => setShowCourseModal(false)} className="h-[40px] px-4 rounded-[10px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#FFFFFF] dark:bg-[#18181B] text-[#111827] dark:text-[#FAFAFA] text-[14px] font-medium transition cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="h-[40px] px-5 rounded-[10px] bg-[#111827] hover:bg-[#1F2937] dark:bg-[#FAFAFA] dark:hover:bg-[#E5E5E5] text-[#FFFFFF] dark:text-[#111111] text-[14px] font-medium transition cursor-pointer shadow-xs">
                  Save Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
