import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
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
    <div className="flex-1 overflow-y-auto bg-[#F5F7FB] dark:bg-[#0F172A] p-4 sm:p-6 lg:p-8 font-body text-[#1F2937] dark:text-[#F8FAFC] transition-colors duration-200">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* ── Page Header & Profile Badge ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#1E293B] p-6 rounded-2xl border border-[#E2E8F0] dark:border-[#334155] shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0E2A6D] to-[#1E4DB7] text-white flex items-center justify-center shadow-md border border-[#D9A441]/30 shrink-0">
              <GraduationCap size={26} strokeWidth={1.75} />
            </div>
            <div>
              <h1 className="font-heading font-bold text-2xl md:text-3xl text-[#0E2A6D] dark:text-white tracking-wide flex items-center gap-2">
                Faculty Portal
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#D9A441]/20 text-[#0E2A6D] dark:text-[#D9A441] font-semibold border border-[#D9A441]/30">
                  Academic Management
                </span>
              </h1>
              <p className="text-small text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                Academic management system for class schedules, attendance, assignments, and student evaluation.
              </p>
            </div>
          </div>

          {/* Profile Badge */}
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-[#F5F7FB] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] shrink-0">
            <div>
              <p className="font-heading font-bold text-caption text-[#0E2A6D] dark:text-[#60A5FA]">
                Dr. {facultyName}
              </p>
              <p className="text-small text-[#64748B] dark:text-[#94A3B8]">{department}</p>
            </div>
          </div>
        </div>

        {/* ── Navigation Tab Bar ── */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`h-11 px-4 rounded-xl font-heading font-bold text-caption flex items-center gap-2 shrink-0 transition ${
                  isActive
                    ? 'bg-[#0E2A6D] text-white shadow-xs'
                    : 'bg-white dark:bg-[#1E293B] text-[#64748B] dark:text-[#94A3B8] border border-[#E2E8F0] dark:border-[#334155] hover:bg-[#F5F7FB] dark:hover:bg-[#0F172A]'
                }`}
              >
                <Icon size={16} /> {tab.label}
              </button>
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
