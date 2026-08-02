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
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#F5F7FB] dark:bg-[#0F172A] text-[#1F2937] dark:text-[#F8FAFC] transition-colors duration-300 font-body">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Top Bar: Title & Primary Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-heading font-bold text-2xl sm:text-3xl tracking-tight text-[#0E2A6D] dark:text-[#F8FAFC] flex items-center gap-3">
              <ClipboardList className="text-[#0E2A6D] dark:text-[#60A5FA]" size={32} />
              Smart Assignment Manager
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Organize, track, and complete college assignments with AI assistance.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* View Switcher: List vs Calendar */}
            <div className="flex bg-white dark:bg-[#1E293B] rounded-xl p-1 shadow-xs border border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setViewMode('list')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  viewMode === 'list'
                    ? 'bg-[#0E2A6D] text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <ListFilter size={15} />
                <span>List View</span>
              </button>

              <button
                onClick={() => setViewMode('calendar')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  viewMode === 'calendar'
                    ? 'bg-[#0E2A6D] text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <CalendarDays size={15} />
                <span>Calendar View</span>
              </button>
            </div>

            {/* Create Assignment Button */}
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#0E2A6D] text-white hover:bg-[#0E2A6D]/90 shadow-md transition-all duration-180"
            >
              <Plus size={16} />
              <span>Create Assignment</span>
            </button>
          </div>
        </div>

        {/* Dashboard Stats */}
        <AssignmentStats
          stats={stats}
          activeFilter={filterBy}
          onFilterSelect={(f) => setFilterBy(f)}
        />

        {/* Automated Reminders Alert Banner */}
        {reminders.length > 0 && (
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
                <Clock3 size={20} />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                  Due Date Reminders ({reminders.length})
                </h4>
                <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                  You have upcoming assignments due soon! Review them to submit on time.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {reminders.slice(0, 3).map((r) => (
                <span
                  key={r.id}
                  className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-amber-200/60 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200"
                >
                  <CircleAlert size={12} />
                  {r.title} ({r.reminder_type})
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Search, Filter & Sort Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white dark:bg-[#1E293B] p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[240px]">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Title, Subject, Faculty, or Status..."
              className="w-full pl-9 pr-4 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0E2A6D] dark:focus:ring-[#60A5FA]"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {filterTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterBy(tab.id)}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
                  filterBy === tab.id
                    ? 'bg-[#0E2A6D] text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 pt-2 md:pt-0 md:pl-3">
            <ArrowUpDown size={15} className="text-slate-400 shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs font-bold bg-transparent text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="due_date">Due Date</option>
              <option value="priority">Priority</option>
              <option value="title">Title</option>
              <option value="created_at">Created Date</option>
            </select>

            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-1 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              title={`Sort Order: ${sortOrder.toUpperCase()}`}
            >
              {sortOrder.toUpperCase()}
            </button>
          </div>
        </div>

        {/* View Mode Content */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#0E2A6D] border-t-transparent dark:border-[#60A5FA]" />
            <p className="mt-3 text-xs font-bold text-slate-500 dark:text-slate-400">
              Loading assignments database...
            </p>
          </div>
        ) : error ? (
          <div className="py-16 flex flex-col items-center justify-center text-center bg-white dark:bg-[#1E293B] rounded-2xl border border-rose-200 dark:border-rose-900/50 p-6">
            <AlertCircle size={40} className="text-rose-500 mb-2" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Failed to load assignments</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">{error}</p>
            <button
              onClick={fetchData}
              className="mt-4 px-4 py-2 rounded-xl text-xs font-bold bg-[#0E2A6D] text-white hover:bg-[#0E2A6D]/90"
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
              <div className="py-20 flex flex-col items-center justify-center text-center bg-white dark:bg-[#1E293B] rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-8">
                <CircleCheck size={48} className="text-slate-400 opacity-40 mb-3" />
                <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white">
                  No Assignments Found
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mt-1">
                  There are no assignments matching your current search or filter criteria.
                </p>
                <button
                  onClick={openCreateModal}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#0E2A6D] text-white hover:bg-[#0E2A6D]/90 shadow-xs"
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
