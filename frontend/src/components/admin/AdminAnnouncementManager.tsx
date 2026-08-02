import React, { useState, useEffect } from 'react';
import { Bell, Plus, Trash2, X, ShieldCheck } from 'lucide-react';
import { adminDashboardApi, AdminAnnouncement } from '../../api/adminDashboard';
import { useToast } from '../../context/ToastContext';

export const AdminAnnouncementManager: React.FC = () => {
  const { showToast } = useToast();
  const [announcements, setAnnouncements] = useState<AdminAnnouncement[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [targetType, setTargetType] = useState('Entire College');
  const [targetFilter, setTargetFilter] = useState('All');
  const [priority, setPriority] = useState('Normal');

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const data = await adminDashboardApi.getAnnouncements();
      setAnnouncements(data);
    } catch (err) {
      console.error('Error fetching announcements:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    try {
      await adminDashboardApi.createAnnouncement({
        title,
        content,
        target_type: targetType,
        target_filter: targetFilter,
        priority,
      });
      showToast('Announcement broadcast successfully to target audience.', 'success');
      setShowModal(false);
      setTitle('');
      setContent('');
      fetchAnnouncements();
    } catch (err) {
      console.error('Error creating announcement:', err);
      showToast('Failed to broadcast announcement.', 'error');
    }
  };

  const handleDeleteAnnouncement = async (id: number) => {
    if (!window.confirm('Delete this announcement?')) return;
    try {
      await adminDashboardApi.deleteAnnouncement(id);
      showToast('Announcement deleted.', 'info');
      fetchAnnouncements();
    } catch (err) {
      console.error('Error deleting announcement:', err);
    }
  };

  return (
    <div className="space-y-6 font-body">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#1E293B] p-5 rounded-2xl border border-[#E2E8F0] dark:border-[#334155] shadow-xs">
        <div>
          <h3 className="font-heading font-bold text-card text-[#1F2937] dark:text-[#F8FAFC]">Campus Announcement & Broadcast Center</h3>
          <p className="text-small text-[#64748B] dark:text-[#94A3B8]">Broadcast targeted notifications to students, faculty, departments, or semesters.</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="h-10 px-4 rounded-xl bg-[#0E2A6D] hover:bg-[#153B8A] text-white text-caption font-bold flex items-center gap-2 transition shrink-0"
        >
          <Plus size={18} /> New Broadcast
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {announcements.map((a) => (
          <div
            key={a.id}
            className="bg-white dark:bg-[#1E293B] p-5 rounded-2xl border border-[#E2E8F0] dark:border-[#334155] shadow-xs space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-caption font-bold uppercase px-2.5 py-0.5 rounded bg-[#0E2A6D]/10 text-[#0E2A6D] dark:text-[#60A5FA]">
                  Target: {a.target_type} ({a.target_filter})
                </span>
                <button onClick={() => handleDeleteAnnouncement(a.id)} className="p-1 text-[#64748B] hover:text-rose-600 rounded">
                  <Trash2 size={16} />
                </button>
              </div>

              <h4 className="font-heading font-bold text-card text-[#1F2937] dark:text-[#F8FAFC]">{a.title}</h4>
              <p className="text-caption text-[#475569] dark:text-[#CBD5E1] line-clamp-3">{a.content}</p>
            </div>

            <div className="pt-3 border-t border-[#E2E8F0] dark:border-[#334155] flex items-center justify-between text-caption text-[#64748B]">
              <span>Priority: <strong className="text-[#1F2937] dark:text-[#F8FAFC]">{a.priority}</strong></span>
              <span>{new Date(a.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Create Announcement Modal ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-[#1E293B] rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-[#E2E8F0] dark:border-[#334155]">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#334155] pb-3">
              <h3 className="font-heading font-bold text-card text-[#1F2937] dark:text-[#F8FAFC]">New Announcement Broadcast</h3>
              <button onClick={() => setShowModal(false)} className="text-[#64748B]">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateAnnouncement} className="space-y-3">
              <div>
                <label className="text-caption font-bold text-[#64748B]">Announcement Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Model Exam Schedule & Guidelines"
                  required
                  className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F5F7FB] dark:bg-[#0F172A] text-body text-[#1F2937] dark:text-[#F8FAFC] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-caption font-bold text-[#64748B]">Target Group</label>
                  <select
                    value={targetType}
                    onChange={(e) => setTargetType(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F5F7FB] dark:bg-[#0F172A] text-body text-[#1F2937] dark:text-[#F8FAFC] outline-none"
                  >
                    <option value="Entire College">Entire College</option>
                    <option value="Department">Department</option>
                    <option value="Semester">Semester</option>
                    <option value="Faculty">Faculty Only</option>
                  </select>
                </div>

                <div>
                  <label className="text-caption font-bold text-[#64748B]">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F5F7FB] dark:bg-[#0F172A] text-body text-[#1F2937] dark:text-[#F8FAFC] outline-none"
                  >
                    <option value="High">High</option>
                    <option value="Normal">Normal</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-caption font-bold text-[#64748B]">Content</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={4}
                  placeholder="Enter full announcement details..."
                  required
                  className="w-full p-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F5F7FB] dark:bg-[#0F172A] text-body text-[#1F2937] dark:text-[#F8FAFC] outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="h-10 px-4 rounded-xl border border-[#E2E8F0] text-caption font-bold text-[#64748B]">
                  Cancel
                </button>
                <button type="submit" className="h-10 px-4 rounded-xl bg-[#0E2A6D] text-white text-caption font-bold">
                  Broadcast Announcement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
