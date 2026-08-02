import React, { useState } from 'react';
import {
  CheckSquare,
  Square,
  Clock3,
  BookOpen,
  Brain,
  FileText,
  Search,
  Filter,
  Trash2,
  Calendar,
  Layers
} from 'lucide-react';
import { StudyTask, updateTaskStatus, deleteStudyTask } from '../../api/studyPlanner';
import { useToast } from '../../context/ToastContext';

interface StudyTasksListProps {
  tasks: StudyTask[];
  loading: boolean;
  onRefresh: () => void;
  onFilterChange: (filters: { date_filter?: any; task_status?: any; search?: string }) => void;
}

export const StudyTasksList: React.FC<StudyTasksListProps> = ({
  tasks,
  loading,
  onRefresh,
  onFilterChange,
}) => {
  const { showToast } = useToast();

  const [dateFilter, setDateFilter] = useState<'today' | 'tomorrow' | 'this_week' | 'this_month' | 'all'>('today');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Pending' | 'Completed'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const handleDateFilterChange = (df: 'today' | 'tomorrow' | 'this_week' | 'this_month' | 'all') => {
    setDateFilter(df);
    onFilterChange({
      date_filter: df === 'all' ? undefined : df,
      task_status: statusFilter === 'all' ? undefined : statusFilter,
      search: searchQuery,
    });
  };

  const handleStatusFilterChange = (sf: 'all' | 'Pending' | 'Completed') => {
    setStatusFilter(sf);
    onFilterChange({
      date_filter: dateFilter === 'all' ? undefined : dateFilter,
      task_status: sf === 'all' ? undefined : sf,
      search: searchQuery,
    });
  };

  const handleSearchChange = (q: string) => {
    setSearchQuery(q);
    onFilterChange({
      date_filter: dateFilter === 'all' ? undefined : dateFilter,
      task_status: statusFilter === 'all' ? undefined : statusFilter,
      search: q,
    });
  };

  const handleToggleStatus = async (task: StudyTask) => {
    const nextStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
    try {
      await updateTaskStatus(task.id, nextStatus);
      showToast(
        nextStatus === 'Completed' ? 'Task marked as completed!' : 'Task reopened',
        'success'
      );
      onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Status update failed', 'error');
    }
  };

  const handleDeleteTask = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this study task?')) return;
    try {
      await deleteStudyTask(id);
      showToast('Task deleted successfully', 'info');
      onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Delete failed', 'error');
    }
  };

  return (
    <div className="bg-white dark:bg-[#1E293B] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-[#0E2A6D]/10 text-[#0E2A6D] dark:bg-[#60A5FA]/10 dark:text-[#60A5FA]">
            <CheckSquare size={20} />
          </div>
          <div>
            <h3 className="text-base font-bold font-heading text-slate-900 dark:text-white">
              Scheduled Study Tasks
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Manage, track, and complete daily study roadmap tasks
            </p>
          </div>
        </div>

        {/* Date Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl">
          {[
            { id: 'today', label: 'Today' },
            { id: 'tomorrow', label: 'Tomorrow' },
            { id: 'this_week', label: 'This Week' },
            { id: 'this_month', label: 'This Month' },
            { id: 'all', label: 'All Tasks' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleDateFilterChange(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                dateFilter === tab.id
                  ? 'bg-white dark:bg-[#1E293B] text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sub-bar Search & Status Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search tasks, subjects, descriptions..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#0E2A6D] dark:focus:ring-[#60A5FA]"
          />
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className="text-slate-400">Status:</span>
          {(['all', 'Pending', 'Completed'] as const).map((st) => (
            <button
              key={st}
              onClick={() => handleStatusFilterChange(st)}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                statusFilter === st
                  ? 'bg-[#0E2A6D] text-white dark:bg-[#60A5FA] dark:text-slate-950 font-bold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {st === 'all' ? 'All Status' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Task List Items */}
      {loading ? (
        <div className="py-12 text-center text-slate-400 text-xs">
          Loading tasks roadmap...
        </div>
      ) : tasks.length > 0 ? (
        <div className="space-y-2.5">
          {tasks.map((task) => {
            const isDone = task.status === 'Completed';

            const typeBadge =
              task.task_type === 'Revision'
                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                : task.task_type === 'PYQP Analysis'
                ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
                : task.task_type === 'Quiz Practice'
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                : 'bg-blue-500/10 text-blue-600 dark:text-blue-400';

            return (
              <div
                key={task.id}
                className={`flex items-start justify-between gap-3 p-4 rounded-xl border transition-all ${
                  isDone
                    ? 'bg-slate-50/50 dark:bg-slate-900/30 border-slate-200/60 dark:border-slate-800/60 opacity-70'
                    : 'bg-white dark:bg-[#1E293B] border-slate-200 dark:border-slate-800 hover:border-[#0E2A6D]/40 dark:hover:border-[#60A5FA]/40 shadow-xs'
                }`}
              >
                {/* Left Checkbox & Task Details */}
                <div className="flex items-start gap-3 min-w-0">
                  <button
                    onClick={() => handleToggleStatus(task)}
                    className="mt-0.5 text-slate-400 hover:text-[#0E2A6D] dark:hover:text-[#60A5FA] transition-colors"
                  >
                    {isDone ? (
                      <CheckSquare size={20} className="text-emerald-500 fill-emerald-500/10" />
                    ) : (
                      <Square size={20} />
                    )}
                  </button>

                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-[#0E2A6D] text-white dark:bg-[#D9A441] dark:text-slate-950">
                        {task.subject_code}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${typeBadge}`}>
                        {task.task_type}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                          task.priority === 'High'
                            ? 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40'
                            : 'text-slate-500 bg-slate-100 dark:bg-slate-800'
                        }`}
                      >
                        {task.priority}
                      </span>
                    </div>

                    <h4
                      className={`text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-snug ${
                        isDone ? 'line-through text-slate-400 dark:text-slate-500' : ''
                      }`}
                    >
                      {task.title}
                    </h4>

                    {task.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">
                        {task.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-0.5">
                      <span className="inline-flex items-center gap-1 font-medium">
                        <Calendar size={13} />
                        {task.scheduled_date}
                      </span>
                      <span className="inline-flex items-center gap-1 font-medium">
                        <Clock3 size={13} />
                        {task.duration_minutes} mins
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Actions */}
                <button
                  onClick={() => handleDeleteTask(task.id)}
                  title="Delete Task"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-12 text-center text-slate-400 text-xs">
          No study tasks match the selected filters.
        </div>
      )}
    </div>
  );
};
