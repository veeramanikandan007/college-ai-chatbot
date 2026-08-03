import React, { useState } from 'react';
import {
  Target,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Circle,
  CalendarDays,
  X,
} from 'lucide-react';
import type { GoalResponse, GoalCreatePayload, GoalUpdatePayload } from '../../api/studentAnalytics';
import { createGoal, updateGoal, deleteGoal } from '../../api/studentAnalytics';
import { useToast } from '../../context/ToastContext';

interface Props {
  goals: GoalResponse[];
  loading: boolean;
  onRefresh: () => void;
}

interface CreateModalProps {
  onClose: () => void;
  onCreated: () => void;
}

const CreateGoalModal: React.FC<CreateModalProps> = ({ onClose, onCreated }) => {
  const { showToast } = useToast();
  const [form, setForm] = useState<GoalCreatePayload>({
    title: '',
    category: 'Academic',
    target_metric: '',
    target_value: 100,
    current_value: 0,
    unit: '%',
    deadline: '',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!form.title || !form.target_metric) {
      showToast('Please fill in all required fields.', 'error');
      return;
    }
    setSaving(true);
    try {
      const payload: GoalCreatePayload = {
        ...form,
        deadline: form.deadline || undefined,
      };
      await createGoal(payload);
      showToast('Goal created successfully.', 'success');
      onCreated();
      onClose();
    } catch {
      showToast('Failed to create goal. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-md bg-[#FFFFFF] dark:bg-[#181818] rounded-[16px] shadow-lg border border-[#D1D5DB] dark:border-[#3F3F46] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#F8FAFC] dark:bg-[#111111]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[10px] bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] flex items-center justify-center shrink-0">
              <Target size={20} />
            </div>
            <h3 className="text-[18px] font-bold text-[#111827] dark:text-[#FAFAFA]">Create New Goal</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded text-[#6B7280] dark:text-[#A3A3A3] hover:text-[#111827] dark:hover:text-[#FAFAFA] cursor-pointer">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          <div>
            <label className="block text-[12px] font-medium uppercase tracking-wider text-[#6B7280] dark:text-[#A3A3A3] mb-1">
              Goal Title *
            </label>
            <input
              type="text"
              className="w-full h-10 px-3.5 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#181818] text-[#111827] dark:text-[#FAFAFA] text-[14px] outline-none"
              placeholder="e.g. Achieve 90% attendance"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-medium uppercase tracking-wider text-[#6B7280] dark:text-[#A3A3A3] mb-1">
                Category
              </label>
              <select
                className="w-full h-10 px-3.5 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#181818] text-[#111827] dark:text-[#FAFAFA] text-[14px] outline-none cursor-pointer"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {['Academic', 'Attendance', 'Assignment', 'Interview', 'Placement'].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[12px] font-medium uppercase tracking-wider text-[#6B7280] dark:text-[#A3A3A3] mb-1">
                Unit
              </label>
              <select
                className="w-full h-10 px-3.5 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#181818] text-[#111827] dark:text-[#FAFAFA] text-[14px] outline-none cursor-pointer"
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
              >
                {['%', 'hours', 'tasks', 'papers', 'score'].map((u) => (
                  <option key={u}>{u}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-medium uppercase tracking-wider text-[#6B7280] dark:text-[#A3A3A3] mb-1">
              Target Metric *
            </label>
            <input
              type="text"
              className="w-full h-10 px-3.5 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#181818] text-[#111827] dark:text-[#FAFAFA] text-[14px] outline-none"
              placeholder="e.g. Attendance Rate"
              value={form.target_metric}
              onChange={(e) => setForm({ ...form, target_metric: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-medium uppercase tracking-wider text-[#6B7280] dark:text-[#A3A3A3] mb-1">
                Current Value
              </label>
              <input
                type="number"
                className="w-full h-10 px-3.5 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#181818] text-[#111827] dark:text-[#FAFAFA] text-[14px] outline-none"
                value={form.current_value}
                onChange={(e) => setForm({ ...form, current_value: parseFloat(e.target.value) || 0 })}
              />
            </div>

            <div>
              <label className="block text-[12px] font-medium uppercase tracking-wider text-[#6B7280] dark:text-[#A3A3A3] mb-1">
                Target Value
              </label>
              <input
                type="number"
                className="w-full h-10 px-3.5 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#181818] text-[#111827] dark:text-[#FAFAFA] text-[14px] outline-none"
                value={form.target_value}
                onChange={(e) => setForm({ ...form, target_value: parseFloat(e.target.value) || 100 })}
              />
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-medium uppercase tracking-wider text-[#6B7280] dark:text-[#A3A3A3] mb-1">
              Deadline
            </label>
            <input
              type="date"
              className="w-full h-10 px-3.5 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#181818] text-[#111827] dark:text-[#FAFAFA] text-[14px] outline-none cursor-pointer"
              value={form.deadline}
              onChange={(e) => setForm({ ...form, deadline: e.target.value })}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#F8FAFC] dark:bg-[#111111]">
          <button onClick={onClose} className="h-10 px-5 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] text-[#111827] dark:text-[#FAFAFA] text-[14px] font-medium cursor-pointer">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="h-10 px-6 rounded-[10px] bg-[#111827] hover:bg-[#000000] dark:bg-[#FAFAFA] dark:hover:bg-[#E5E5E5] text-[#FFFFFF] dark:text-[#111111] font-medium text-[14px] shadow-xs cursor-pointer disabled:opacity-50"
          >
            {saving ? 'Creating...' : 'Create Goal'}
          </button>
        </div>
      </div>
    </div>
  );
};

const GoalCard: React.FC<{
  goal: GoalResponse;
  onUpdate: () => void;
}> = ({ goal, onUpdate }) => {
  const { showToast } = useToast();
  const [updatingProgress, setUpdatingProgress] = useState(false);

  const handleMarkComplete = async () => {
    setUpdatingProgress(true);
    try {
      await updateGoal(goal.id, { status: 'Completed', current_value: goal.target_value });
      showToast('Goal marked as completed.', 'success');
      onUpdate();
    } catch {
      showToast('Failed to update goal.', 'error');
    } finally {
      setUpdatingProgress(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this goal?')) return;
    try {
      await deleteGoal(goal.id);
      showToast('Goal deleted.', 'info');
      onUpdate();
    } catch {
      showToast('Failed to delete goal.', 'error');
    }
  };

  return (
    <div className="p-5 rounded-[12px] bg-[#FFFFFF] dark:bg-[#181818] border border-[#D1D5DB] dark:border-[#3F3F46] shadow-xs flex flex-col justify-between space-y-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <span className="px-2.5 py-0.5 rounded-[6px] text-[12px] font-medium bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111]">
            {goal.category}
          </span>
          <span className="px-2.5 py-0.5 rounded-[6px] text-[12px] font-medium bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA]">
            {goal.status}
          </span>
        </div>

        <h4 className="text-[16px] font-bold text-[#111827] dark:text-[#FAFAFA]">{goal.title}</h4>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[12px] text-[#6B7280] dark:text-[#A3A3A3]">
            <span>{goal.current_value} / {goal.target_value} {goal.unit}</span>
            <span className="font-bold text-[#111827] dark:text-[#FAFAFA]">{goal.progress_percentage}%</span>
          </div>
          <div className="w-full h-2 bg-[#E5E7EB] dark:bg-[#2A2A2A] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#111827] dark:bg-[#FAFAFA] rounded-full transition-all duration-300"
              style={{ width: `${Math.min(goal.progress_percentage, 100)}%` }}
            />
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-[#E5E7EB] dark:border-[#2A2A2A] flex items-center justify-between gap-3">
        {goal.deadline ? (
          <span className="text-[12px] text-[#6B7280] dark:text-[#A3A3A3]">Due: {goal.deadline}</span>
        ) : <span />}

        <div className="flex items-center gap-1.5">
          {goal.status !== 'Completed' && (
            <button
              onClick={handleMarkComplete}
              disabled={updatingProgress}
              className="h-8 px-3 rounded-[6px] bg-[#111827] hover:bg-[#000000] dark:bg-[#FAFAFA] dark:hover:bg-[#E5E5E5] text-[#FFFFFF] dark:text-[#111111] text-[12px] font-medium shadow-xs transition cursor-pointer"
            >
              Complete
            </button>
          )}

          <button
            onClick={handleDelete}
            title="Delete Goal"
            className="h-8 w-8 rounded-[6px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#181818] text-[#111827] dark:text-[#FAFAFA] hover:bg-[#F9FAFB] dark:hover:bg-[#232323] flex items-center justify-center cursor-pointer"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};

export const GoalsTrackerWidget: React.FC<Props> = ({ goals, loading, onRefresh }) => {
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <div className="bg-[#FFFFFF] dark:bg-[#18181B] p-6 rounded-[16px] border border-[#D1D5DB] dark:border-[#3F3F46] shadow-xs space-y-5 select-none">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#D1D5DB] dark:border-[#3F3F46]">
        <div className="flex items-center gap-3">
          <div className="w-[40px] h-[40px] rounded-[10px] bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] flex items-center justify-center shrink-0">
            <Target size={20} />
          </div>
          <div>
            <h2 className="text-[20px] font-[700] text-[#111827] dark:text-[#FAFAFA]">Goals Tracker</h2>
            <p className="text-[14px] font-[500] text-[#6B7280] dark:text-[#A1A1AA]">
              {goals.filter((g) => g.status === 'Completed').length} of {goals.length} targets completed
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="h-[40px] px-4 rounded-[12px] bg-[#111827] hover:bg-[#1F2937] active:bg-[#0F172A] dark:bg-[#FAFAFA] dark:hover:bg-[#F3F4F6] text-[#FFFFFF] dark:text-[#111111] font-[700] text-[14px] transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-[0.98]"
        >
          <Plus size={16} />
          <span>New Goal</span>
        </button>
      </div>

      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#111827] dark:border-[#FAFAFA] border-t-transparent mb-3" />
          <p className="text-[14px] font-[600] text-[#6B7280] dark:text-[#A1A1AA]">Loading goals...</p>
        </div>
      ) : goals.length === 0 ? (
        <div className="py-12 text-center text-[#6B7280] dark:text-[#A1A1AA] text-[14px] font-[500]">
          No active goals found. Click "New Goal" to set a learning target.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map((g) => (
            <GoalCard key={g.id} goal={g} onUpdate={onRefresh} />
          ))}
        </div>
      )}

      {showCreateModal && (
        <CreateGoalModal onClose={() => setShowCreateModal(false)} onCreated={onRefresh} />
      )}
    </div>
  );
};

