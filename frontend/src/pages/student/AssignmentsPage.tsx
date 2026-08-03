import React, { useState, useEffect, useMemo } from 'react';
import {
  ClipboardList,
  CalendarDays,
  Clock3,
  BookOpen,
  Upload,
  Download,
  Search,
  Filter,
  CircleCheck,
  CircleAlert,
  Trash2,
  SquarePen,
  Plus,
  Sparkles,
  ArrowUpDown,
  ListFilter,
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

  // Filters, Search, Sort & View Mode
  const [filterBy, setFilterBy] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('due_date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

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

  const handleToggleStatus = async (id: number, currentStatus: string) => {
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
    <div className="w-full h-full overflow-y-auto bg-[#FFFFFF] dark:bg-[#0A0A0A] text-[#111827] dark:text-[#FAFAFA] p-4 md:p-8 transition-colors">
      <div className="w-full max-w-[1600px] mx-auto space-y-8">

        {/* ========================================================================= */}
        {/* 1. PAGE HEADER CARD                                                       */}
        {/* ========================================================================= */}
        <div className="bg-[#FFFFFF] dark:bg-[#181818] p-6 md:p-8 rounded-[12px] border border-[#D1D5DB] dark:border-[#3F3F46] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-[10px] bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] flex items-center justify-center shrink-0">
              <ClipboardList size={24} />
            </div>
            <div>
              <h1 className="text-[32px] font-bold text-[#111827] dark:text-[#FAFAFA] tracking-tight">
                Smart Assignments
              </h1>
              <p className="text-[14px] text-[#6B7280] dark:text-[#A3A3A3] mt-1">
                Organize, track, and complete college assignments with AI assistance.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* View Switcher: List vs Calendar */}
            <div className="flex bg-[#F8FAFC] dark:bg-[#111111] p-1.5 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46]">
              <button
                onClick={() => setViewMode('list')}
                className={`h-9 px-3.5 text-[14px] font-medium rounded-[8px] transition-all cursor-pointer flex items-center gap-2 ${
                  viewMode === 'list'
                    ? 'bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111]'
                    : 'text-[#4B5563] dark:text-[#A3A3A3] hover:bg-[#F9FAFB] dark:hover:bg-[#232323]'
                }`}
              >
                <ListFilter size={16} />
                <span>List View</span>
              </button>

              <button
                onClick={() => setViewMode('calendar')}
                className={`h-9 px-3.5 text-[14px] font-medium rounded-[8px] transition-all cursor-pointer flex items-center gap-2 ${
                  viewMode === 'calendar'
                    ? 'bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111]'
                    : 'text-[#4B5563] dark:text-[#A3A3A3] hover:bg-[#F9FAFB] dark:hover:bg-[#232323]'
                }`}
              >
                <CalendarDays size={16} />
                <span>Calendar View</span>
              </button>
            </div>

            {/* Create Assignment Button */}
            <button
              onClick={openCreateModal}
              className="h-10 px-5 rounded-[10px] bg-[#111827] hover:bg-[#000000] dark:bg-[#FAFAFA] dark:hover:bg-[#E5E5E5] text-[#FFFFFF] dark:text-[#111111] font-medium text-[14px] shadow-xs transition flex items-center gap-2 cursor-pointer"
            >
              <Plus size={16} />
              <span>Create Assignment</span>
            </button>
          </div>
        </div>

        {/* Dashboard Stats Overview */}
        <AssignmentStats
          stats={stats}
          activeFilter={filterBy}
          onFilterSelect={(f) => setFilterBy(f)}
        />

        {/* Automated Reminders Alert Banner */}
        {reminders.length > 0 && (
          <div className="p-4 rounded-[12px] bg-[#F8FAFC] dark:bg-[#181818] border border-[#D1D5DB] dark:border-[#3F3F46] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[10px] bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] flex items-center justify-center shrink-0">
                <Clock3 size={20} />
              </div>
              <div>
                <h4 className="text-[12px] font-bold uppercase tracking-wider text-[#111827] dark:text-[#FAFAFA]">
                  Due Date Reminders ({reminders.length})
                </h4>
                <p className="text-[14px] text-[#6B7280] dark:text-[#A3A3A3] mt-0.5">
                  You have upcoming assignments due soon! Review them to submit on time.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {reminders.slice(0, 3).map((r) => (
                <span
                  key={r.id}
                  className="inline-flex items-center gap-1.5 text-[12px] font-medium px-3 py-1 rounded-[6px] bg-[#FFFFFF] dark:bg-[#111111] border border-[#D1D5DB] dark:border-[#3F3F46] text-[#111827] dark:text-[#FAFAFA]"
                >
                  <CircleAlert size={14} />
                  {r.title} ({r.reminder_type})
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Search, Filter & Sort Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#FFFFFF] dark:bg-[#181818] p-4 rounded-[12px] border border-[#D1D5DB] dark:border-[#3F3F46] shadow-xs">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[240px]">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7280] dark:text-[#A3A3A3]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Title, Subject, Faculty, or Status..."
              className="w-full h-10 pl-10 pr-4 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#181818] text-[14px] text-[#111827] dark:text-[#FAFAFA] outline-none"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto">
            {filterTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterBy(tab.id)}
                className={`h-9 px-4 rounded-[8px] text-[14px] font-medium transition cursor-pointer whitespace-nowrap ${
                  filterBy === tab.id
                    ? 'bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111]'
                    : 'bg-[#FFFFFF] dark:bg-[#181818] border border-[#D1D5DB] dark:border-[#3F3F46] text-[#111827] dark:text-[#FAFAFA] hover:bg-[#F9FAFB] dark:hover:bg-[#232323]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 border-t md:border-t-0 md:border-l border-[#E5E7EB] dark:border-[#2A2A2A] pt-2 md:pt-0 md:pl-3">
            <ArrowUpDown size={16} className="text-[#6B7280] dark:text-[#A3A3A3] shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-9 px-3 rounded-[8px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#181818] text-[14px] text-[#111827] dark:text-[#FAFAFA] outline-none cursor-pointer"
            >
              <option value="due_date">Due Date</option>
              <option value="priority">Priority</option>
              <option value="title">Title</option>
              <option value="created_at">Created Date</option>
            </select>

            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="h-9 px-3 rounded-[8px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#181818] text-[12px] font-bold text-[#111827] dark:text-[#FAFAFA] hover:bg-[#F9FAFB] dark:hover:bg-[#232323] cursor-pointer"
              title={`Sort Order: ${sortOrder.toUpperCase()}`}
            >
              {sortOrder.toUpperCase()}
            </button>
          </div>
        </div>

        {/* View Mode Content */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#111827] dark:border-[#FAFAFA] border-t-transparent" />
            <p className="mt-3 text-[14px] font-medium text-[#6B7280] dark:text-[#A3A3A3]">
              Loading assignments database...
            </p>
          </div>
        ) : error ? (
          <div className="py-16 flex flex-col items-center justify-center text-center bg-[#FFFFFF] dark:bg-[#181818] rounded-[12px] border border-[#D1D5DB] dark:border-[#3F3F46] p-6 shadow-xs">
            <AlertCircle size={40} className="text-[#6B7280] dark:text-[#A3A3A3] mb-2" />
            <h3 className="text-[18px] font-bold text-[#111827] dark:text-[#FAFAFA]">Failed to load assignments</h3>
            <p className="text-[14px] text-[#6B7280] dark:text-[#A3A3A3] mt-1 max-w-sm">{error}</p>
            <button
              onClick={fetchData}
              className="mt-4 h-10 px-5 rounded-[10px] bg-[#111827] hover:bg-[#000000] dark:bg-[#FAFAFA] dark:hover:bg-[#E5E5E5] text-[#FFFFFF] dark:text-[#111111] text-[14px] font-medium cursor-pointer"
            >
              Retry
            </button>
          </div>
        ) : viewMode === 'calendar' ? (
          <AssignmentCalendar
            assignments={assignments}
            onSelectAssignment={(assignment) => openEditModal(assignment)}
          />
        ) : (
          <div className="space-y-4">
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
              <div className="py-20 flex flex-col items-center justify-center text-center bg-[#FFFFFF] dark:bg-[#181818] rounded-[12px] border border-[#D1D5DB] dark:border-[#3F3F46] p-8 shadow-xs">
                <CircleCheck size={48} className="text-[#6B7280] dark:text-[#A3A3A3] mb-3 opacity-40" />
                <h3 className="font-bold text-[18px] text-[#111827] dark:text-[#FAFAFA]">
                  No Assignments Available
                </h3>
                <p className="text-[14px] text-[#6B7280] dark:text-[#A3A3A3] max-w-sm mt-1">
                  Create or import your first assignment to get started.
                </p>
                <button
                  onClick={openCreateModal}
                  className="mt-4 h-10 px-5 rounded-[10px] bg-[#111827] hover:bg-[#000000] dark:bg-[#FAFAFA] dark:hover:bg-[#E5E5E5] text-[#FFFFFF] dark:text-[#111111] font-medium text-[14px] shadow-xs cursor-pointer flex items-center gap-2"
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
