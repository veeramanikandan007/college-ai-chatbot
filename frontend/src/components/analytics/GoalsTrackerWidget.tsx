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

const CATEGORY_COLORS: Record<string, string> = {
  Academic: 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/30',
  Attendance: 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/30',
  Assignment: 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-900/30',
  Interview: 'text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-900/30',
  Placement: 'text-cyan-600 bg-cyan-50 dark:text-cyan-400 dark:bg-cyan-900/30',
};

const STATUS_BADGE: Record<string, string> = {
  'In Progress': 'text-blue-700 bg-blue-100 dark:text-blue-300 dark:bg-blue-900/40',
  'Completed': 'text-emerald-700 bg-emerald-100 dark:text-emerald-300 dark:bg-emerald-900/40',
  'Overdue': 'text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-900/40',
};

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#0E2A6D] text-white"><Target size={16} /></div>
            <h3 className="text-sm font-bold font-heading text-slate-900 dark:text-white">Create New Goal</h3>
          </div>
          <button onClick={onClose} className="btn-icon"><X size={18} /></button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Goal Title *</label>
            <input
              className="input-standard w-full"
              placeholder="e.g., Achieve 90% attendance in Computer Networks"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Category</label>
              <select
                className="input-standard w-full"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {['Academic', 'Attendance', 'Assignment', 'Interview', 'Placement'].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Unit</label>
              <select
                className="input-standard w-full"
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
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Target Metric *</label>
            <input
              className="input-standard w-full"
              placeholder="e.g., Attendance Rate"
              value={form.target_metric}
              onChange={(e) => setForm({ ...form, target_metric: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Current Value</label>
              <input
                type="number"
                className="input-standard w-full"
                value={form.current_value}
                onChange={(e) => setForm({ ...form, current_value: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Target Value</label>
              <input
                type="number"
                className="input-standard w-full"
                value={form.target_value}
                onChange={(e) => setForm({ ...form, target_value: parseFloat(e.target.value) || 100 })}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Deadline</label>
            <input
              type="date"
              className="input-standard w-full"
              value={form.deadline}
              onChange={(e) => setForm({ ...form, deadline: e.target.value })}
            />
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 dark:border-slate-800">
          <button onClick={onClose} className="btn-secondary">Cancel</button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="btn-primary disabled:opacity-60"
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
  const [localValue, setLocalValue] = useState(goal.current_value);
  const [editing, setEditing] = useState(false);

  const catColor = CATEGORY_COLORS[goal.category] || CATEGORY_COLORS.Academic;
  const statusBadge = STATUS_BADGE[goal.status] || STATUS_BADGE['In Progress'];

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

  const handleProgressUpdate = async () => {
    setUpdatingProgress(true);
    try {
      await updateGoal(goal.id, { current_value: localValue });
      showToast('Goal progress updated.', 'success');
      onUpdate();
      setEditing(false);
    } catch {
      showToast('Failed to update progress.', 'error');
    } finally {
      setUpdatingProgress(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this goal? This action cannot be undone.')) return;
    try {
      await deleteGoal(goal.id);
      showToast('Goal deleted.', 'success');
      onUpdate();
    } catch {
      showToast('Failed to delete goal.', 'error');
    }
  };

  const progressColor =
    goal.progress_percentage >= 100
      ? 'from-emerald-500 to-emerald-400'
      : goal.progress_percentage >= 60
      ? 'from-[#1E4DB7] to-[#60A5FA]'
      : 'from-amber-500 to-amber-400';

  const deadlineStr = goal.deadline
    ? new Date(goal.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : null;

  return (
    <div className="bg-white dark:bg-[#1E293B] rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${catColor}`}>{goal.category}</span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusBadge}`}>{goal.status}</span>
          </div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">{goal.title}</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{goal.target_metric}</p>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {goal.status !== 'Completed' && (
            <button
              onClick={handleMarkComplete}
              disabled={updatingProgress}
              className="btn-icon text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 disabled:opacity-50"
              title="Mark as Completed"
            >
              <CheckCircle2 size={16} />
            </button>
          )}
          <button onClick={handleDelete} className="btn-icon text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20" title="Delete Goal">
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
            {goal.current_value} / {goal.target_value} {goal.unit}
          </span>
          <span className="text-xs font-bold text-slate-900 dark:text-white">{goal.progress_percentage}%</span>
        </div>
        <div className="h-2.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${progressColor} transition-all duration-700`}
            style={{ width: `${goal.progress_percentage}%` }}
          />
        </div>
      </div>

      {/* Progress update input */}
      {editing ? (
        <div className="flex items-center gap-2 mt-2">
          <input
            type="number"
            className="input-standard flex-1 h-9 text-xs"
            value={localValue}
            min={0}
            max={goal.target_value}
            step={0.5}
            onChange={(e) => setLocalValue(parseFloat(e.target.value) || 0)}
          />
          <button
            onClick={handleProgressUpdate}
            disabled={updatingProgress}
            className="btn-primary h-9 text-xs px-3 disabled:opacity-60"
          >
            Save
          </button>
          <button onClick={() => setEditing(false)} className="btn-secondary h-9 text-xs px-3">
            Cancel
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between mt-2">
          {deadlineStr && (
            <span className="inline-flex items-center gap-1 text-xs text-slate-400">
              <CalendarDays size={11} />
              Due {deadlineStr}
            </span>
          )}
          {goal.status !== 'Completed' && (
            <button
              onClick={() => setEditing(true)}
              className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-[#1E4DB7] dark:text-[#60A5FA] hover:underline"
            >
              <Edit2 size={11} />
              Update Progress
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export const GoalsTrackerWidget: React.FC<Props> = ({ goals, loading, onRefresh }) => {
  const [showCreate, setShowCreate] = useState(false);

  const inProgress = goals.filter((g) => g.status === 'In Progress');
  const completed = goals.filter((g) => g.status === 'Completed');

  return (
    <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#0E2A6D] text-white">
            <Target size={18} />
          </div>
          <div>
            <h2 className="text-sm font-bold font-heading text-slate-900 dark:text-white">Personal Goals</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {inProgress.length} active, {completed.length} completed
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#0E2A6D] text-white text-xs font-bold hover:bg-[#153B8A] transition-all shadow-sm"
        >
          <Plus size={14} />
          New Goal
        </button>
      </div>

      <div className="p-5">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse h-28 rounded-xl bg-slate-100 dark:bg-slate-800" />
            ))}
          </div>
        ) : goals.length === 0 ? (
          <div className="text-center py-10 text-slate-400 dark:text-slate-500">
            <Target size={32} className="mx-auto mb-2 opacity-40" />
            <p className="text-sm font-medium">No goals yet.</p>
            <p className="text-xs mt-1">Create your first learning goal to track progress.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {goals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} onUpdate={onRefresh} />
            ))}
          </div>
        )}
      </div>

      {showCreate && (
        <CreateGoalModal
          onClose={() => setShowCreate(false)}
          onCreated={onRefresh}
        />
      )}
    </div>
  );
};
