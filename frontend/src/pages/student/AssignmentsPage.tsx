import React, { useState, useEffect } from 'react';
import {
  ClipboardList,
  CalendarDays,
  Clock3,
  Search,
  CircleCheck,
  CircleAlert,
  Plus,
  ArrowUpDown,
  ListFilter,
  LayoutGrid,
  AlertCircle
} from 'lucide-react';
import {
  Assignment,
  AssignmentStatsData,
  AssignmentReminderData,
  AssignmentAiResponseData,
  AssignmentInput,
  getAssignments,
  getAssignmentStats,
  getAssignmentReminders,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  toggleAssignmentStatus,
  runAssignmentAiAction
} from '../../api/assignments';
import { AssignmentStats } from '../../components/assignments/AssignmentStats';
import { AssignmentCard } from '../../components/assignments/AssignmentCard';
import { AssignmentModal } from '../../components/assignments/AssignmentModal';
import { AssignmentCalendar } from '../../components/assignments/AssignmentCalendar';
import { AssignmentAiModal } from '../../components/assignments/AssignmentAiModal';
import { useToast } from '../../context/ToastContext';

export default function AssignmentsPage() {
  const { showToast } = useToast();

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [stats, setStats] = useState<AssignmentStatsData>({
    total: 0,
    pending: 0,
    completed: 0,
    overdue: 0,
    upcoming: 0,
  });
  const [reminders, setReminders] = useState<AssignmentReminderData[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters, Search, Sort & View Mode (Default Grid view)
  const [filterBy, setFilterBy] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('due_date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'calendar'>('grid');

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);

  // AI Modal state
  const [isAiModalOpen, setIsAiModalOpen] = useState<boolean>(false);
  const [aiSelectedAssignment, setAiSelectedAssignment] = useState<Assignment | null>(null);
  const [aiData, setAiData] = useState<AssignmentAiResponseData | null>(null);
  const [aiLoading, setAiLoading] = useState<boolean>(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [assgList, statsData, remindersData] = await Promise.all([
        getAssignments({
          filter_by: filterBy,
          search: searchTerm,
          sort_by: sortBy,
          sort_order: sortOrder,
        }),
        getAssignmentStats(),
        getAssignmentReminders(),
      ]);

      setAssignments(assgList);
      setStats(statsData);
      setReminders(remindersData);
    } catch (err: any) {
      setError(err.message || 'Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterBy, searchTerm, sortBy, sortOrder]);

  // Handlers
  const handleCreateOrUpdate = async (data: AssignmentInput, id?: number) => {
    try {
      if (id) {
        await updateAssignment(id, data);
        showToast('Assignment updated successfully', 'success');
      } else {
        await createAssignment(data);
        showToast('New assignment created successfully', 'success');
      }
      fetchData();
    } catch (err: any) {
      showToast(err.message || 'Operation failed', 'error');
      throw err;
    }
  };

  const handleToggleStatus = async (id: number) => {
    try {
      const updated = await toggleAssignmentStatus(id);
      showToast(
        `Assignment marked as ${updated.status === 'Completed' ? 'Completed' : 'Pending'}`,
        'success'
      );
      fetchData();
    } catch (err: any) {
      showToast(err.message || 'Failed to update status', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this assignment?')) return;

    try {
      await deleteAssignment(id);
      showToast('Assignment deleted successfully', 'success');
      fetchData();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete assignment', 'error');
    }
  };

  const handleAiAction = async (
    assignment: Assignment,
    action: 'summarize' | 'explain' | 'solution_outline' | 'checklist' | 'estimate_time' | 'study_plan'
  ) => {
    setAiSelectedAssignment(assignment);
    setIsAiModalOpen(true);
    setAiLoading(true);
    setAiData(null);

    try {
      const res = await runAssignmentAiAction(assignment.id, action);
      setAiData(res);
    } catch (err: any) {
      showToast(err.message || 'AI processing failed', 'error');
    } finally {
      setAiLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingAssignment(null);
    setIsFormModalOpen(true);
  };

  const openEditModal = (assignment: Assignment) => {
    setEditingAssignment(assignment);
    setIsFormModalOpen(true);
  };

  const filterTabs = [
    { id: 'all', label: 'All' },
    { id: 'pending', label: 'Pending' },
    { id: 'completed', label: 'Completed' },
    { id: 'today', label: 'Today' },
    { id: 'this_week', label: 'This Week' },
    { id: 'high_priority', label: 'High Priority' },
  ];

  return (
    <div className="w-full h-full overflow-x-hidden overflow-y-auto bg-[#FFFFFF] dark:bg-[#0A0A0A] text-[#111827] dark:text-[#FAFAFA] p-4 sm:p-6 md:p-8 transition-colors select-none font-sans">
      {/* 1440px Centered Max Content Width Container */}
      <div className="w-full max-w-[1440px] mx-auto space-y-6">

        {/* Compact Hero Header (Matching AI Study Planner layout) */}
        <div className="bg-[#FFFFFF] dark:bg-[#18181B] p-4 sm:p-5 rounded-[16px] border border-[#D1D5DB] dark:border-[#3F3F46] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3 sm:gap-3.5 min-w-0 flex-1">
            <div className="w-[40px] h-[40px] sm:w-[44px] sm:h-[44px] rounded-[10px] bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] flex items-center justify-center shrink-0">
              <ClipboardList size={22} />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-[20px] sm:text-[30px] font-[600] text-[#111827] dark:text-[#FAFAFA] tracking-tight leading-[1.2]">
                Smart Assignments
              </h1>
              <p className="text-[14px] sm:text-[15px] font-[400] text-[#6B7280] dark:text-[#A1A1AA] mt-0.5 truncate">
                Organize, track, and complete college assignments with AI assistance.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
            {/* View Switcher: Grid, List, Calendar */}
            <div className="flex items-center bg-[#F8FAFC] dark:bg-[#111111] p-1 rounded-[12px] border border-[#D1D5DB] dark:border-[#3F3F46] min-h-[44px]">
              <button
                onClick={() => setViewMode('grid')}
                title="Grid View"
                className={`h-[36px] flex-1 sm:flex-none px-3.5 text-[14px] font-[500] rounded-[8px] transition flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap active:scale-[0.98] ${
                  viewMode === 'grid'
                    ? 'bg-[#111827] text-[#FFFFFF] dark:bg-[#FAFAFA] dark:text-[#111111]'
                    : 'text-[#6B7280] dark:text-[#A1A1AA] hover:bg-[#FFFFFF] dark:hover:bg-[#18181B]'
                }`}
              >
                <LayoutGrid size={14} />
                <span>Grid</span>
              </button>

              <button
                onClick={() => setViewMode('list')}
                title="List View"
                className={`h-[36px] flex-1 sm:flex-none px-3.5 text-[14px] font-[500] rounded-[8px] transition flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap active:scale-[0.98] ${
                  viewMode === 'list'
                    ? 'bg-[#111827] text-[#FFFFFF] dark:bg-[#FAFAFA] dark:text-[#111111]'
                    : 'text-[#6B7280] dark:text-[#A1A1AA] hover:bg-[#FFFFFF] dark:hover:bg-[#18181B]'
                }`}
              >
                <ListFilter size={14} />
                <span>List</span>
              </button>

              <button
                onClick={() => setViewMode('calendar')}
                title="Calendar View"
                className={`h-[36px] flex-1 sm:flex-none px-3.5 text-[14px] font-[500] rounded-[8px] transition flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap active:scale-[0.98] ${
                  viewMode === 'calendar'
                    ? 'bg-[#111827] text-[#FFFFFF] dark:bg-[#FAFAFA] dark:text-[#111111]'
                    : 'text-[#6B7280] dark:text-[#A1A1AA] hover:bg-[#FFFFFF] dark:hover:bg-[#18181B]'
                }`}
              >
                <CalendarDays size={14} />
                <span>Calendar</span>
              </button>
            </div>

            <button
              onClick={openCreateModal}
              className="h-[38px] sm:h-[40px] px-4 rounded-[10px] bg-[#111827] hover:bg-[#1F2937] active:bg-[#0F172A] dark:bg-[#FAFAFA] dark:hover:bg-[#F3F4F6] text-[#FFFFFF] dark:text-[#111111] text-[14px] font-[500] shadow-xs cursor-pointer active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <Plus size={16} />
              <span>Create Assignment</span>
            </button>
          </div>
        </div>

        {/* Dashboard Stats Overview - Responsive Grid Format */}
        <AssignmentStats
          stats={stats}
          activeFilter={filterBy}
          onFilterSelect={(f) => setFilterBy(f)}
        />

        {/* Automated Reminders Alert Banner */}
        {reminders.length > 0 && (
          <div className="p-3.5 sm:p-4 rounded-[16px] bg-[#FFFFFF] dark:bg-[#18181B] border border-[#D1D5DB] dark:border-[#3F3F46] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-[36px] h-[36px] rounded-[10px] bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] flex items-center justify-center shrink-0">
                <Clock3 size={18} />
              </div>
              <div>
                <h4 className="text-[11px] font-[400] uppercase tracking-wider text-[#111827] dark:text-[#FAFAFA]">
                  Due Date Reminders ({reminders.length})
                </h4>
                <p className="text-[12px] sm:text-[13px] font-[500] text-[#6B7280] dark:text-[#A1A1AA] mt-0.5">
                  You have upcoming assignments due soon. Review them to submit on time.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {reminders.slice(0, 3).map((r) => (
                <span
                  key={r.id}
                  className="inline-flex items-center gap-1.5 text-[11px] sm:text-[12px] font-[400] px-3 py-1 rounded-[6px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#D1D5DB] dark:border-[#3F3F46] text-[#111827] dark:text-[#FAFAFA]"
                >
                  <CircleAlert size={13} />
                  {r.title} ({r.reminder_type})
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Search, Filter & Sort Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-[#FFFFFF] dark:bg-[#18181B] p-3.5 sm:p-4 rounded-[16px] border border-[#D1D5DB] dark:border-[#3F3F46] shadow-xs select-none">
          <div className="relative w-full md:w-64">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7280] dark:text-[#A1A1AA]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title, subject..."
              className="w-full h-[38px] sm:h-[40px] pl-10 pr-4 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#18181B] text-[13px] sm:text-[14px] font-sans text-[#111827] dark:text-[#FAFAFA] outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full md:w-auto pb-1 md:pb-0">
            {filterTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterBy(tab.id)}
                className={`h-[36px] px-3.5 rounded-[8px] text-[14px] font-[500] transition cursor-pointer whitespace-nowrap shrink-0 active:scale-[0.98] ${
                  filterBy === tab.id
                    ? 'bg-[#111827] text-[#FFFFFF] dark:bg-[#FAFAFA] dark:text-[#111111]'
                    : 'bg-[#FFFFFF] dark:bg-[#18181B] border border-[#D1D5DB] dark:border-[#3F3F46] text-[#111827] dark:text-[#FAFAFA] hover:bg-[#F8FAFC] dark:hover:bg-[#232323]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0 border-[#D1D5DB] dark:border-[#3F3F46]">
            <ArrowUpDown size={15} className="text-[#6B7280] dark:text-[#A1A1AA] shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-[36px] flex-1 md:flex-none px-3 rounded-[8px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#18181B] text-[12px] sm:text-[14px] font-[500] text-[#111827] dark:text-[#FAFAFA] outline-none cursor-pointer"
            >
              <option value="due_date">Due Date</option>
              <option value="priority">Priority</option>
              <option value="title">Title</option>
              <option value="created_at">Created Date</option>
            </select>

            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="h-[36px] px-3 rounded-[8px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#18181B] text-[12px] font-[400] text-[#111827] dark:text-[#FAFAFA] hover:bg-[#F8FAFC] dark:hover:bg-[#232323] cursor-pointer active:scale-[0.98]"
              title={`Sort Order: ${sortOrder.toUpperCase()}`}
            >
              {sortOrder.toUpperCase()}
            </button>
          </div>
        </div>

        {/* View Mode Content */}
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center text-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#111827] dark:border-[#FAFAFA] border-t-transparent" />
            <p className="mt-3 text-[14px] font-[500] text-[#6B7280] dark:text-[#A3A3A3]">
              Loading assignments database...
            </p>
          </div>
        ) : error ? (
          <div className="py-12 flex flex-col items-center justify-center text-center bg-[#FFFFFF] dark:bg-[#181818] rounded-[12px] border border-[#D1D5DB] dark:border-[#3F3F46] p-6">
            <AlertCircle size={36} className="text-[#6B7280] dark:text-[#A3A3A3] mb-2" />
            <h3 className="text-[18px] font-[600] text-[#111827] dark:text-[#FAFAFA]">Failed to load assignments</h3>
            <p className="text-[14px] text-[#6B7280] dark:text-[#A3A3A3] mt-1 max-w-sm">{error}</p>
            <button
              onClick={fetchData}
              className="mt-4 h-[38px] px-4 rounded-[10px] bg-[#111827] hover:bg-[#000000] dark:bg-[#FAFAFA] dark:hover:bg-[#E5E5E5] text-[#FFFFFF] dark:text-[#111111] text-[14px] font-[500] cursor-pointer"
            >
              Retry
            </button>
          </div>
        ) : viewMode === 'calendar' ? (
          <AssignmentCalendar
            assignments={assignments}
            onSelectAssignment={(assignment) => openEditModal(assignment)}
          />
        ) : viewMode === 'grid' ? (
          /* GRID VIEW (Default) */
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {assignments.map((assignment) => (
              <AssignmentCard
                key={assignment.id}
                assignment={assignment}
                onToggleStatus={handleToggleStatus}
                onEdit={openEditModal}
                onDelete={handleDelete}
                onAiAction={handleAiAction}
              />
            ))}

            {assignments.length === 0 && (
              <div className="col-span-full py-16 flex flex-col items-center justify-center text-center bg-[#FFFFFF] dark:bg-[#181818] rounded-[12px] border border-[#D1D5DB] dark:border-[#3F3F46] p-8">
                <CircleCheck size={40} className="text-[#6B7280] dark:text-[#A3A3A3] mb-3 opacity-40" />
                <h3 className="font-[600] text-[18px] text-[#111827] dark:text-[#FAFAFA]">
                  No Assignments Available
                </h3>
                <p className="text-[14px] text-[#6B7280] dark:text-[#A3A3A3] max-w-sm mt-1">
                  Create or import your first assignment to get started.
                </p>
                <button
                  onClick={openCreateModal}
                  className="mt-4 h-[38px] px-4 rounded-[10px] bg-[#111827] hover:bg-[#000000] dark:bg-[#FAFAFA] dark:hover:bg-[#E5E5E5] text-[#FFFFFF] dark:text-[#111111] font-[500] text-[14px] cursor-pointer flex items-center gap-2"
                >
                  <Plus size={16} />
                  <span>Create Assignment</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          /* LIST VIEW */
          <div className="space-y-3">
            {assignments.map((assignment) => (
              <AssignmentCard
                key={assignment.id}
                assignment={assignment}
                onToggleStatus={handleToggleStatus}
                onEdit={openEditModal}
                onDelete={handleDelete}
                onAiAction={handleAiAction}
              />
            ))}

            {assignments.length === 0 && (
              <div className="py-16 flex flex-col items-center justify-center text-center bg-[#FFFFFF] dark:bg-[#181818] rounded-[12px] border border-[#D1D5DB] dark:border-[#3F3F46] p-8">
                <CircleCheck size={40} className="text-[#6B7280] dark:text-[#A3A3A3] mb-3 opacity-40" />
                <h3 className="font-[600] text-[18px] text-[#111827] dark:text-[#FAFAFA]">
                  No Assignments Available
                </h3>
                <p className="text-[14px] text-[#6B7280] dark:text-[#A3A3A3] max-w-sm mt-1">
                  Create or import your first assignment to get started.
                </p>
                <button
                  onClick={openCreateModal}
                  className="mt-4 h-[38px] px-4 rounded-[10px] bg-[#111827] hover:bg-[#000000] dark:bg-[#FAFAFA] dark:hover:bg-[#E5E5E5] text-[#FFFFFF] dark:text-[#111111] font-[500] text-[14px] cursor-pointer flex items-center gap-2"
                >
                  <Plus size={16} />
                  <span>Create Assignment</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <AssignmentModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleCreateOrUpdate}
        initialData={editingAssignment}
      />

      <AssignmentAiModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        assignment={aiSelectedAssignment}
        aiData={aiData}
        loading={aiLoading}
      />
    </div>
  );
}
