import React, { useState } from 'react';
import {
  CheckSquare,
  Square,
  Clock3,
  BookOpen,
  Search,
  Trash2,
  Calendar,
  Play,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { StudyTask, updateTaskStatus, deleteStudyTask } from '../../api/studyPlanner';
import { useToast } from '../../context/ToastContext';

interface StudyTasksListProps {
  tasks: StudyTask[];
  loading: boolean;
  onRefresh: () => void;
  onFilterChange: (filters: { date_filter?: any; task_status?: any; search?: string }) => void;
  onOpenGenerator?: () => void;
}

export const StudyTasksList: React.FC<StudyTasksListProps> = ({
  tasks,
  loading,
  onRefresh,
  onFilterChange,
  onOpenGenerator,
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
    <div className="bg-[#FFFFFF] dark:bg-[#18181B] p-6 rounded-[16px] border border-[#D1D5DB] dark:border-[#3F3F46] shadow-xs space-y-5 select-none">
      {/* Header & Date Tabs */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 pb-4 border-b border-[#D1D5DB] dark:border-[#3F3F46]">
        <div className="flex items-center gap-3">
          <div className="w-[40px] h-[40px] rounded-[10px] bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] flex items-center justify-center shrink-0">
            <CheckSquare size={20} />
          </div>
          <div>
            <h3 className="text-[20px] font-[700] text-[#111827] dark:text-[#FAFAFA]">
              Scheduled Study Tasks
            </h3>
            <p className="text-[14px] font-[500] text-[#6B7280] dark:text-[#A1A1AA]">
              Manage, track, and complete daily study roadmap tasks
            </p>
          </div>
        </div>

        {/* Date Filter Segmented Control */}
        <div className="flex items-center bg-[#F8FAFC] dark:bg-[#111111] p-1 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] h-[40px] overflow-x-auto snap-x no-scrollbar max-w-full">
          {[
            { id: 'today', label: 'Today' },
            { id: 'tomorrow', label: 'Tomorrow' },
            { id: 'this_week', label: 'Week' },
            { id: 'this_month', label: 'Month' },
            { id: 'all', label: 'All' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleDateFilterChange(tab.id as any)}
              className={`h-[32px] px-3.5 rounded-[8px] text-[14px] font-[500] transition-all cursor-pointer snap-start shrink-0 whitespace-nowrap ${
                dateFilter === tab.id
                  ? 'bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111]'
                  : 'text-[#6B7280] dark:text-[#A1A1AA] hover:bg-[#FFFFFF] dark:hover:bg-[#18181B]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search Input & Status Pills */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7280] dark:text-[#A1A1AA]" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search tasks, subjects, descriptions..."
            className="w-full h-[40px] pl-10 pr-4 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#18181B] text-[14px] font-[600] text-[#111827] dark:text-[#FAFAFA] outline-none"
          />
        </div>

        {/* Status Chips */}
        <div className="flex items-center gap-2 text-[14px] overflow-x-auto no-scrollbar">
          <span className="text-[#6B7280] dark:text-[#A1A1AA] font-[600] shrink-0">Status:</span>
          {(['all', 'Pending', 'Completed'] as const).map((st) => (
            <button
              key={st}
              onClick={() => handleStatusFilterChange(st)}
              className={`h-[36px] px-3.5 rounded-[10px] text-[14px] font-[500] transition-all cursor-pointer shrink-0 ${
                statusFilter === st
                  ? 'bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111]'
                  : 'border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#18181B] text-[#111827] dark:text-[#FAFAFA] hover:bg-[#F8FAFC] dark:hover:bg-[#232323]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Tasks List */}
      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#111827] dark:border-[#FAFAFA] border-t-transparent mb-3" />
          <p className="text-[14px] font-[600] text-[#6B7280] dark:text-[#A1A1AA]">
            Loading scheduled study tasks...
          </p>
        </div>
      ) : tasks.length > 0 ? (
        <div className="space-y-3">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="p-[18px] rounded-[16px] bg-[#FFFFFF] dark:bg-[#18181B] border border-[#D1D5DB] dark:border-[#3F3F46] shadow-xs hover:shadow-md transition-all duration-150 ease-in-out hover:-translate-y-0.5 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3.5 min-w-0 flex-1">
                <button
                  onClick={() => handleToggleStatus(task)}
                  className="mt-1 text-[#111827] dark:text-[#FAFAFA] hover:opacity-70 transition cursor-pointer shrink-0"
                >
                  {task.status === 'Completed' ? (
                    <CheckSquare size={22} />
                  ) : (
                    <Square size={22} />
                  )}
                </button>

                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="h-[24px] inline-flex items-center rounded-full border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#F8FAFC] dark:bg-[#111111] px-3 text-[12px] font-[400] text-[#111827] dark:text-[#FAFAFA]">
                      {task.subject_code}
                    </span>
                    <span className="h-[24px] inline-flex items-center rounded-full border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#F8FAFC] dark:bg-[#111111] px-3 text-[12px] font-[600] text-[#6B7280] dark:text-[#A1A1AA]">
                      {task.task_type}
                    </span>
                    <span className="h-[24px] inline-flex items-center rounded-full border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#F8FAFC] dark:bg-[#111111] px-3 text-[12px] font-[600] text-[#6B7280] dark:text-[#A1A1AA]">
                      {task.priority} Priority
                    </span>
                  </div>

                  <h4
                    className={`text-[18px] font-[700] leading-snug ${
                      task.status === 'Completed'
                        ? 'line-through text-[#6B7280] dark:text-[#A1A1AA]'
                        : 'text-[#111827] dark:text-[#FAFAFA]'
                    }`}
                  >
                    {task.title}
                  </h4>

                  {task.description && (
                    <p className="text-[14px] font-[500] text-[#6B7280] dark:text-[#A1A1AA] line-clamp-2">
                      {task.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Task Metadata & Action Bar */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0 justify-between md:justify-end border-t md:border-t-0 border-[#D1D5DB] dark:border-[#3F3F46] pt-3 md:pt-0">
                <div className="text-[14px] font-[500] text-[#6B7280] dark:text-[#A1A1AA] space-y-0.5 min-w-[130px]">
                  <div className="flex items-center gap-1.5">
                    <Calendar size={14} className="text-[#111827] dark:text-[#FAFAFA]" />
                    <span>{task.scheduled_date}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[12px] font-[600]">
                    <Clock3 size={13} />
                    <span>{task.duration_minutes} mins</span>
                  </div>
                </div>

                {/* 40px Height Action Buttons */}
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => handleToggleStatus(task)}
                    className="h-[40px] px-4 rounded-[12px] bg-[#111827] hover:bg-[#1F2937] active:bg-[#0F172A] dark:bg-[#FAFAFA] dark:hover:bg-[#F3F4F6] text-[#FFFFFF] dark:text-[#111827] text-[14px] font-[500] transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-[0.98] flex-1 sm:flex-initial"
                  >
                    {task.status === 'Completed' ? <RotateCcw size={15} /> : <Play size={15} />}
                    <span>{task.status === 'Completed' ? 'Reopen' : 'Start'}</span>
                  </button>

                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    title="Delete Task"
                    className="h-[40px] w-[40px] rounded-[12px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#18181B] text-[#111827] dark:text-[#FAFAFA] hover:bg-[#F8FAFC] dark:hover:bg-[#232323] transition flex items-center justify-center cursor-pointer shrink-0 active:scale-[0.98]"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="py-12 text-center bg-[#FFFFFF] dark:bg-[#18181B] rounded-[16px] border border-[#D1D5DB] dark:border-[#3F3F46] p-8 shadow-xs space-y-4 my-auto">
          <div className="w-[80px] h-[80px] rounded-[16px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#D1D5DB] dark:border-[#3F3F46] flex items-center justify-center mx-auto text-[#111827] dark:text-[#FAFAFA]">
            <BookOpen size={36} />
          </div>
          <div>
            <h3 className="text-[20px] font-[700] text-[#111827] dark:text-[#FAFAFA]">
              No Study Tasks Available
            </h3>
            <p className="text-[14px] font-[500] text-[#6B7280] dark:text-[#A1A1AA] max-w-sm mx-auto mt-1">
              Generate your personalized AI study plan to organize your learning roadmap.
            </p>
          </div>
          {onOpenGenerator && (
            <button
              onClick={onOpenGenerator}
              className="h-[40px] px-5 rounded-[12px] bg-[#111827] hover:bg-[#1F2937] dark:bg-[#FAFAFA] dark:hover:bg-[#F3F4F6] text-[#FFFFFF] dark:text-[#111827] text-[14px] font-[500] transition flex items-center justify-center gap-2 cursor-pointer mx-auto active:scale-[0.98]"
            >
              <Sparkles size={16} />
              <span>Generate Plan</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
