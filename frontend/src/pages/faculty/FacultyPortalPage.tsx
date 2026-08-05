import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  GraduationCap,
  Users,
  ClipboardCheck,
  CalendarDays,
  FileText,
  Brain,
  Files,
  BarChart3,
  Bell,
} from 'lucide-react';
import { facultyApi, FacultyDashboardData } from '../../api/faculty';
import { FacultyDashboardOverview } from '../../components/faculty/FacultyDashboardOverview';
import { FacultyAttendanceManager } from '../../components/faculty/FacultyAttendanceManager';
import { FacultyAssignmentManager } from '../../components/faculty/FacultyAssignmentManager';
import { FacultyQuestionPaperManager } from '../../components/faculty/FacultyQuestionPaperManager';
import { FacultyQuizManager } from '../../components/faculty/FacultyQuizManager';
import { FacultyTimetableManager } from '../../components/faculty/FacultyTimetableManager';
import { FacultyStudentRoster } from '../../components/faculty/FacultyStudentRoster';
import { useAuth } from '../../hooks/useAuth';

export default function FacultyPortalPage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab') || 'dashboard';

  const [activeTab, setActiveTab] = useState<string>(tabFromUrl);
  const [dashboardData, setDashboardData] = useState<FacultyDashboardData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const currentTab = searchParams.get('tab') || 'dashboard';
    setActiveTab(currentTab);
  }, [searchParams]);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const data = await facultyApi.getDashboard();
      setDashboardData(data);
    } catch (err) {
      console.error('Error loading faculty dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    if (tabId === 'dashboard') {
      setSearchParams({});
    } else {
      setSearchParams({ tab: tabId });
    }
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: GraduationCap },
    { id: 'attendance', label: 'Attendance', icon: ClipboardCheck },
    { id: 'assignments', label: 'Assignments', icon: FileText },
    { id: 'question-papers', label: 'Question Papers', icon: Files },
    { id: 'quizzes', label: 'Quizzes', icon: Brain },
    { id: 'timetable', label: 'Timetable', icon: CalendarDays },
    { id: 'students', label: 'Student Roster', icon: Users },
  ];

  const facultyName = user?.name || dashboardData?.profile?.employee_id || 'Aris Thorne';
  const department = user?.department || 'Computer Science & Engineering';

  return (
    <div className="faculty-ui w-full h-full overflow-x-hidden overflow-y-auto bg-[#F8FAFC] dark:bg-[#0A0A0A] text-[#111827] dark:text-[#FAFAFA] p-4 sm:p-6 lg:p-8 transition-colors select-none font-sans">
      {/* 1440px Centered Container with 32px (space-y-8) Section Gap */}
      <div className="w-full max-w-[1440px] mx-auto space-y-8">
        {/* Page Hero Header */}
        <div className="bg-[#FFFFFF] dark:bg-[#18181B] p-6 rounded-[16px] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-12 h-12 rounded-[12px] bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] flex items-center justify-center shrink-0">
              <GraduationCap size={24} />
            </div>
            <div className="min-w-0 space-y-1">
              <h1 className="text-[30px] font-semibold text-[#111827] dark:text-[#FAFAFA] tracking-tight leading-tight truncate">
                Faculty Portal
              </h1>
              <p className="text-[14px] sm:text-[15px] font-normal text-[#6B7280] dark:text-[#A1A1AA] line-clamp-2 sm:line-clamp-none">
                Academic management system for class schedules, attendance, assignments, and student evaluation.
              </p>
            </div>
          </div>

          {/* Profile Badge */}
          <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 w-full sm:w-auto">
            <div className="flex items-center gap-3 px-4 py-2 rounded-[12px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] shrink-0">
              <div>
                <p className="text-[14px] font-semibold text-[#111827] dark:text-[#FAFAFA]">
                  Dr. {facultyName}
                </p>
                <p className="text-[12px] font-normal text-[#6B7280] dark:text-[#A1A1AA]">{department}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Navigation Tab Bar (Identical to AIWorkspace Filter Bar) ── */}
        <div className="flex items-center bg-[#F8FAFC] dark:bg-[#111111] p-1.5 rounded-[12px] border border-[#E5E7EB] dark:border-[#2A2A2A] overflow-x-auto no-scrollbar w-full">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
                onClick={() => handleTabChange(tab.id)}
                className={`h-[36px] px-4 rounded-[8px] text-[13.5px] font-medium transition whitespace-nowrap flex-1 lg:flex-initial cursor-pointer flex items-center justify-center gap-2 ${
                  isActive
                    ? 'bg-[#111827] text-[#FFFFFF] dark:bg-[#FAFAFA] dark:text-[#111111] font-semibold'
                    : 'text-[#6B7280] hover:text-[#111827] dark:text-[#A1A1AA] dark:hover:text-[#FAFAFA] hover:bg-[#F1F5F9] dark:hover:bg-[#1A1A1A]'
                }`}
              >
                <Icon size={16} /> {tab.label}
              </motion.button>
            );
          })}
        </div>



        {/* ── Tab Content Views ── */}
        {activeTab === 'dashboard' && (
          <FacultyDashboardOverview
            data={dashboardData}
            loading={loading}
            onNavigateTab={handleTabChange}
            facultyName={facultyName}
            department={department}
          />
        )}
        {activeTab === 'attendance' && (
          <FacultyAttendanceManager selectedSubject="CS8591" selectedSection="A" />
        )}
        {activeTab === 'assignments' && <FacultyAssignmentManager />}
        {activeTab === 'question-papers' && <FacultyQuestionPaperManager />}
        {activeTab === 'quizzes' && <FacultyQuizManager />}
        {activeTab === 'timetable' && <FacultyTimetableManager />}
        {activeTab === 'students' && (
          <FacultyStudentRoster
            selectedDept={department}
            selectedSem="All"
            selectedSection="All"
            searchQuery=""
          />
        )}
      </div>
    </div>
  );
}
