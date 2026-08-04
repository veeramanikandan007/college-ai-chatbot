import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building2, BookOpen, Plus, Trash2 } from 'lucide-react';
import { adminDashboardApi, AdminDepartment, AdminCourse } from '../../api/adminDashboard';
import { useToast } from '../../context/ToastContext';
import { PageHeader } from '../ui/PageHeader';
import { Button } from '../ui/Button';
import { Dialog } from '../ui/Dialog';
import { Table, Column } from '../ui/Table';
import { Badge } from '../ui/Badge';
import { DashboardCard } from '../ui/DashboardCard';
import { SectionHeader } from '../ui/SectionHeader';
import { PageContainer } from '../ui/PageContainer';
import { FormSection } from '../ui/FormSection';
import { Input } from '../ui/Input';

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
      await adminDashboardApi.createDepartment({ code: deptCode, name: deptName, head_of_department: hod, total_sections: sections });
      showToast(`Department ${deptName} created.`, 'success');
      setShowDeptModal(false);
      setDeptCode(''); setDeptName('');
      fetchData();
    } catch (err) {}
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseCode.trim() || !courseName.trim()) return;
    try {
      await adminDashboardApi.createCourse({ department_code: selectedDeptCode, course_code: courseCode, course_name: courseName, credits, semester });
      showToast(`Course ${courseName} created.`, 'success');
      setShowCourseModal(false);
      setCourseCode(''); setCourseName('');
      fetchData();
    } catch (err) {}
  };

  const handleDeleteDept = async (id: number, name: string) => {
    if (!window.confirm(`Delete department ${name}?`)) return;
    try {
      await adminDashboardApi.deleteDepartment(id);
      showToast(`Department ${name} deleted.`, 'info');
      fetchData();
    } catch (err) {}
  };

  const deptColumns: Column<AdminDepartment>[] = [
    {
      key: 'code',
      header: 'Department',
      sortable: true,
      render: (d) => (
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="info">{d.code}</Badge>
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">{d.name}</span>
          </div>
          <div className="text-xs text-zinc-500 mt-1">HOD: {d.head_of_department} · Sections: {d.total_sections}</div>
        </div>
      )
    },
    {
      key: 'actions',
      header: '',
      render: (d) => (
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" onClick={() => handleDeleteDept(d.id, d.name)}>
            <Trash2 size={16} className="text-red-500" />
          </Button>
        </div>
      )
    }
  ];

  const courseColumns: Column<AdminCourse>[] = [
    {
      key: 'course_code',
      header: 'Course',
      sortable: true,
      render: (c) => (
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="neutral">{c.course_code}</Badge>
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">{c.course_name}</span>
          </div>
          <div className="text-xs text-zinc-500 mt-1">Dept: {c.department_code} · Sem: {c.semester} · Credits: {c.credits}</div>
        </div>
      )
    }
  ];

  return (
    <PageContainer>
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex-1">
          <PageHeader
            title="Department & Course Hierarchy"
            description="Configure academic departments, degree programs, semesters, and course credits."
            icon={Building2}
          />
        </div>
        <div className="flex items-center gap-2 mt-2 sm:mt-0">
          <Button variant="primary" onClick={() => setShowDeptModal(true)} leftIcon={<Plus size={16} />}>
            Add Department
          </Button>
          <Button variant="outline" onClick={() => setShowCourseModal(true)} leftIcon={<Plus size={16} />}>
            Add Course
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardCard className="p-0 md:p-0 overflow-hidden flex flex-col">
          <SectionHeader
            title={`Academic Departments (${departments.length})`}
            icon={Building2}
            className="p-5 pb-0 mb-4"
          />
          <div className="px-5 pb-5">
            <Table
              columns={deptColumns}
              data={departments}
              isLoading={loading}
              searchable={true}
              searchPlaceholder="Search departments..."
              pageSize={5}
              emptyMessage="No departments found."
            />
          </div>
        </DashboardCard>

        <DashboardCard className="p-0 md:p-0 overflow-hidden flex flex-col">
          <SectionHeader
            title={`Course Catalog (${courses.length})`}
            icon={BookOpen}
            iconColor="text-amber-500"
            className="p-5 pb-0 mb-4"
          />
          <div className="px-5 pb-5">
            <Table
              columns={courseColumns}
              data={courses}
              isLoading={loading}
              searchable={true}
              searchPlaceholder="Search courses..."
              pageSize={5}
              emptyMessage="No courses found."
            />
          </div>
        </DashboardCard>
      </div>

      <Dialog isOpen={showDeptModal} onClose={() => setShowDeptModal(false)} title="Add Department">
        <form id="dept-form" onSubmit={handleCreateDept}>
          <FormSection>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Code" type="text" value={deptCode} onChange={e => setDeptCode(e.target.value)} placeholder="e.g. AI_DS" required />
              <Input label="Total Sections" type="number" value={sections} onChange={e => setSections(Number(e.target.value))} />
            </div>
            <Input label="Department Full Name" type="text" value={deptName} onChange={e => setDeptName(e.target.value)} placeholder="e.g. Artificial Intelligence & Data Science" required />
            <Input label="Head of Department (HOD)" type="text" value={hod} onChange={e => setHod(e.target.value)} />
          </FormSection>
        </form>
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="ghost" onClick={() => setShowDeptModal(false)}>Cancel</Button>
          <Button variant="primary" type="submit" form="dept-form">Save Department</Button>
        </div>
      </Dialog>

      <Dialog isOpen={showCourseModal} onClose={() => setShowCourseModal(false)} title="Add New Course">
        <form id="course-form" onSubmit={handleCreateCourse}>
          <FormSection>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Dept Code" type="text" value={selectedDeptCode} onChange={e => setSelectedDeptCode(e.target.value)} />
              <Input label="Course Code" type="text" value={courseCode} onChange={e => setCourseCode(e.target.value)} placeholder="e.g. CS8601" required />
            </div>
            <Input label="Course Name" type="text" value={courseName} onChange={e => setCourseName(e.target.value)} placeholder="e.g. Deep Learning & Neural Networks" required />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Credits" type="number" value={credits} onChange={e => setCredits(Number(e.target.value))} />
              <Input label="Semester" type="number" value={semester} onChange={e => setSemester(Number(e.target.value))} />
            </div>
          </FormSection>
        </form>
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="ghost" onClick={() => setShowCourseModal(false)}>Cancel</Button>
          <Button variant="primary" type="submit" form="course-form">Save Course</Button>
        </div>
      </Dialog>
    </PageContainer>
  );
};
