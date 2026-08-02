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
    <div className="space-y-6 font-body">
      {/* ── Top Bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#1E293B] p-5 rounded-2xl border border-[#E2E8F0] dark:border-[#334155] shadow-xs">
        <div>
          <h3 className="font-heading font-bold text-card text-[#1F2937] dark:text-[#F8FAFC]">Department & Course Hierarchy</h3>
          <p className="text-small text-[#64748B] dark:text-[#94A3B8]">Configure academic departments, degree programs, semesters, and course credits.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowDeptModal(true)}
            className="h-10 px-3.5 rounded-xl bg-[#0E2A6D] hover:bg-[#153B8A] text-white text-caption font-bold flex items-center gap-2 transition"
          >
            <Plus size={16} /> Add Department
          </button>
          <button
            onClick={() => setShowCourseModal(true)}
            className="h-10 px-3.5 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#1E293B] hover:bg-[#F5F7FB] text-caption font-bold text-[#0E2A6D] dark:text-[#60A5FA] flex items-center gap-2 transition"
          >
            <Plus size={16} /> Add Course
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Departments Card ── */}
        <div className="bg-white dark:bg-[#1E293B] p-6 rounded-2xl border border-[#E2E8F0] dark:border-[#334155] shadow-xs space-y-4">
          <h3 className="font-heading font-bold text-card text-[#1F2937] dark:text-[#F8FAFC] flex items-center gap-2">
            <Building2 className="text-[#0E2A6D] dark:text-[#60A5FA]" size={20} />
            Academic Departments ({departments.length})
          </h3>

          <div className="space-y-3">
            {departments.map((d) => (
              <div
                key={d.id}
                className="p-4 rounded-xl bg-[#F5F7FB] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] flex items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-heading font-bold text-caption text-[#0E2A6D] dark:text-[#60A5FA] px-2 py-0.5 rounded bg-[#0E2A6D]/10">
                      {d.code}
                    </span>
                    <h4 className="font-heading font-bold text-body text-[#1F2937] dark:text-[#F8FAFC]">{d.name}</h4>
                  </div>
                  <p className="text-caption text-[#64748B] dark:text-[#94A3B8] mt-1">
                    HOD: {d.head_of_department} · Sections: {d.total_sections}
                  </p>
                </div>

                <button onClick={() => handleDeleteDept(d.id, d.name)} className="p-1.5 text-[#64748B] hover:text-rose-600 rounded">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ── Courses Catalog Card ── */}
        <div className="bg-white dark:bg-[#1E293B] p-6 rounded-2xl border border-[#E2E8F0] dark:border-[#334155] shadow-xs space-y-4">
          <h3 className="font-heading font-bold text-card text-[#1F2937] dark:text-[#F8FAFC] flex items-center gap-2">
            <BookOpen className="text-[#D9A441]" size={20} />
            Course Catalog ({courses.length})
          </h3>

          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {courses.map((c) => (
              <div
                key={c.id}
                className="p-4 rounded-xl bg-[#F5F7FB] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] flex items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-caption text-[#1E4DB7] dark:text-[#60A5FA]">{c.course_code}</span>
                    <h4 className="font-heading font-bold text-body text-[#1F2937] dark:text-[#F8FAFC]">{c.course_name}</h4>
                  </div>
                  <p className="text-caption text-[#64748B] dark:text-[#94A3B8] mt-1">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-[#1E293B] rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-[#E2E8F0] dark:border-[#334155]">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#334155] pb-3">
              <h3 className="font-heading font-bold text-card text-[#1F2937] dark:text-[#F8FAFC]">Add Department</h3>
              <button onClick={() => setShowDeptModal(false)} className="text-[#64748B]">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateDept} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-caption font-bold text-[#64748B]">Code</label>
                  <input
                    type="text"
                    value={deptCode}
                    onChange={(e) => setDeptCode(e.target.value)}
                    placeholder="e.g. AI_DS"
                    required
                    className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F5F7FB] dark:bg-[#0F172A] text-body text-[#1F2937] dark:text-[#F8FAFC] outline-none"
                  />
                </div>
                <div>
                  <label className="text-caption font-bold text-[#64748B]">Total Sections</label>
                  <input
                    type="number"
                    value={sections}
                    onChange={(e) => setSections(Number(e.target.value))}
                    className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F5F7FB] dark:bg-[#0F172A] text-body text-[#1F2937] dark:text-[#F8FAFC] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-caption font-bold text-[#64748B]">Department Full Name</label>
                <input
                  type="text"
                  value={deptName}
                  onChange={(e) => setDeptName(e.target.value)}
                  placeholder="e.g. Artificial Intelligence & Data Science"
                  required
                  className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F5F7FB] dark:bg-[#0F172A] text-body text-[#1F2937] dark:text-[#F8FAFC] outline-none"
                />
              </div>

              <div>
                <label className="text-caption font-bold text-[#64748B]">Head of Department (HOD)</label>
                <input
                  type="text"
                  value={hod}
                  onChange={(e) => setHod(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F5F7FB] dark:bg-[#0F172A] text-body text-[#1F2937] dark:text-[#F8FAFC] outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowDeptModal(false)} className="h-10 px-4 rounded-xl border border-[#E2E8F0] text-caption font-bold text-[#64748B]">
                  Cancel
                </button>
                <button type="submit" className="h-10 px-4 rounded-xl bg-[#0E2A6D] text-white text-caption font-bold">
                  Save Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Add Course Modal ── */}
      {showCourseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-[#1E293B] rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-[#E2E8F0] dark:border-[#334155]">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#334155] pb-3">
              <h3 className="font-heading font-bold text-card text-[#1F2937] dark:text-[#F8FAFC]">Add New Course</h3>
              <button onClick={() => setShowCourseModal(false)} className="text-[#64748B]">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateCourse} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-caption font-bold text-[#64748B]">Dept Code</label>
                  <input
                    type="text"
                    value={selectedDeptCode}
                    onChange={(e) => setSelectedDeptCode(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F5F7FB] dark:bg-[#0F172A] text-body text-[#1F2937] dark:text-[#F8FAFC] outline-none"
                  />
                </div>
                <div>
                  <label className="text-caption font-bold text-[#64748B]">Course Code</label>
                  <input
                    type="text"
                    value={courseCode}
                    onChange={(e) => setCourseCode(e.target.value)}
                    placeholder="e.g. CS8601"
                    required
                    className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F5F7FB] dark:bg-[#0F172A] text-body text-[#1F2937] dark:text-[#F8FAFC] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-caption font-bold text-[#64748B]">Course Name</label>
                <input
                  type="text"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  placeholder="e.g. Deep Learning & Neural Networks"
                  required
                  className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F5F7FB] dark:bg-[#0F172A] text-body text-[#1F2937] dark:text-[#F8FAFC] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-caption font-bold text-[#64748B]">Credits</label>
                  <input
                    type="number"
                    value={credits}
                    onChange={(e) => setCredits(Number(e.target.value))}
                    className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F5F7FB] dark:bg-[#0F172A] text-body text-[#1F2937] dark:text-[#F8FAFC] outline-none"
                  />
                </div>
                <div>
                  <label className="text-caption font-bold text-[#64748B]">Semester</label>
                  <input
                    type="number"
                    value={semester}
                    onChange={(e) => setSemester(Number(e.target.value))}
                    className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F5F7FB] dark:bg-[#0F172A] text-body text-[#1F2937] dark:text-[#F8FAFC] outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowCourseModal(false)} className="h-10 px-4 rounded-xl border border-[#E2E8F0] text-caption font-bold text-[#64748B]">
                  Cancel
                </button>
                <button type="submit" className="h-10 px-4 rounded-xl bg-[#0E2A6D] text-white text-caption font-bold">
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
