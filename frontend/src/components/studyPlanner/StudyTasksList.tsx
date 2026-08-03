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
    <div className="bg-[#FFFFFF] dark:bg-[#181818] p-6 rounded-[12px] border border-[#D1D5DB] dark:border-[#3F3F46] shadow-xs space-y-5">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 pb-4 border-b border-[#F3F4F6] dark:border-[#2A2A2A]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[10px] bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] flex items-center justify-center shrink-0">
            <CheckSquare size={20} />
          </div>
          <div>
            <h3 className="text-[18px] font-bold text-[#111827] dark:text-[#FAFAFA]">
              Scheduled Study Tasks
            </h3>
            <p className="text-[12px] text-[#6B7280] dark:text-[#A3A3A3]">
              Manage, track, and complete daily study roadmap tasks
            </p>
          </div>
        </div>

        {/* Date Filter Tabs */}
        <div className="flex flex-wrap items-center bg-[#F8FAFC] dark:bg-[#111111] p-1.5 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46]">
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
              className={`h-9 px-3.5 text-[14px] font-medium rounded-[8px] transition-all cursor-pointer ${
                dateFilter === tab.id
                  ? 'bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111]'
                  : 'text-[#4B5563] dark:text-[#A3A3A3] hover:bg-[#F9FAFB] dark:hover:bg-[#232323]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sub-bar Search & Status Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7280] dark:text-[#A3A3A3]" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search tasks, subjects, descriptions..."
            className="w-full h-10 pl-10 pr-4 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#181818] text-[14px] text-[#111827] dark:text-[#FAFAFA] outline-none"
          />
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-2 text-[14px]">
          <span className="text-[#6B7280] dark:text-[#A3A3A3] font-medium">Status:</span>
          {(['all', 'Pending', 'Completed'] as const).map((st) => (
            <button
              key={st}
              onClick={() => handleStatusFilterChange(st)}
              className={`h-8 px-3 rounded-[6px] text-[12px] font-medium transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111]'
                  : 'border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#181818] text-[#111827] dark:text-[#FAFAFA] hover:bg-[#F9FAFB] dark:hover:bg-[#232323]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Tasks Grid / List */}
      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#111827] dark:border-[#FAFAFA] border-t-transparent mb-3" />
          <p className="text-[14px] font-medium text-[#6B7280] dark:text-[#A3A3A3]">
            Loading scheduled study tasks...
          </p>
        </div>
      ) : tasks.length > 0 ? (
        <div className="space-y-3">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="p-5 rounded-[12px] bg-[#FFFFFF] dark:bg-[#181818] border border-[#D1D5DB] dark:border-[#3F3F46] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={() => handleToggleStatus(task)}
                  className="mt-0.5 text-[#111827] dark:text-[#FAFAFA] hover:opacity-70 transition cursor-pointer"
                >
                  {task.status === 'Completed' ? (
                    <CheckSquare size={22} />
                  ) : (
                    <Square size={22} />
                  )}
                </button>
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-[6px] text-[12px] font-medium bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111]">
                      {task.subject_code}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-[6px] text-[12px] font-medium bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA]">
                      {task.task_type}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-[6px] text-[12px] font-medium bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA]">
                      {task.priority} Priority
                    </span>
                  </div>
                  <h4
                    className={`text-[16px] font-bold ${
                      task.status === 'Completed'
                        ? 'line-through text-[#6B7280] dark:text-[#A3A3A3]'
                        : 'text-[#111827] dark:text-[#FAFAFA]'
                    }`}
                  >
                    {task.title}
                  </h4>
                  {task.description && (
                    <p className="text-[14px] text-[#4B5563] dark:text-[#D4D4D4]">
                      {task.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#E5E7EB] dark:border-[#2A2A2A]">
                <div className="text-[12px] text-[#6B7280] dark:text-[#A3A3A3] text-right space-y-0.5">
                  <div className="flex items-center gap-1 font-medium">
                    <Calendar size={14} />
                    <span>{task.scheduled_date}</span>
                  </div>
                  <div className="flex items-center gap-1 font-medium">
                    <Clock3 size={14} />
                    <span>{task.duration_minutes} mins</span>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteTask(task.id)}
                  title="Delete Task"
                  className="h-9 w-9 rounded-[8px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#181818] text-[#111827] dark:text-[#FAFAFA] hover:bg-[#F9FAFB] dark:hover:bg-[#232323] flex items-center justify-center cursor-pointer"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center bg-[#FFFFFF] dark:bg-[#181818] rounded-[12px] border border-[#D1D5DB] dark:border-[#3F3F46] p-8 shadow-xs space-y-3">
          <BookOpen className="mx-auto text-[#6B7280] dark:text-[#A3A3A3] opacity-40" size={48} />
          <h3 className="text-[18px] font-bold text-[#111827] dark:text-[#FAFAFA]">
            No Study Plan Available
          </h3>
          <p className="text-[14px] text-[#6B7280] dark:text-[#A3A3A3] max-w-sm mx-auto">
            Generate your personalized AI study plan to organize your learning efficiently.
          </p>
        </div>
      )}
    </div>
  );
};
