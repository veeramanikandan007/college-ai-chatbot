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
    <div className="space-y-6 font-sans">
      {/* ── Top Hero Header Card ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FFFFFF] dark:bg-[#18181B] p-6 rounded-[16px] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs">
        <div className="space-y-1">
          <h3 className="text-[18px] font-semibold text-[#111827] dark:text-[#FAFAFA]">Announcements & Broadcast Control</h3>
          <p className="text-[14px] font-normal text-[#6B7280] dark:text-[#A1A1AA]">Broadcast institution-wide alerts, department circulars, and exam notifications.</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="h-[40px] px-5 rounded-[10px] bg-[#111827] hover:bg-[#1F2937] dark:bg-[#FAFAFA] dark:hover:bg-[#E5E5E5] text-[#FFFFFF] dark:text-[#111111] text-[14px] font-medium flex items-center gap-2 transition cursor-pointer shrink-0"
        >
          <Plus size={16} /> New Broadcast
        </button>
      </div>

      <div className="space-y-4">
        {announcements.map((a) => (
          <div
            key={a.id}
            className="bg-[#FFFFFF] dark:bg-[#18181B] p-6 rounded-[16px] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs space-y-3"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span
                  className={`text-[12px] font-medium px-2.5 py-0.5 rounded-[6px] ${
                    a.priority === 'High'
                      ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                      : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                  }`}
                >
                  {a.priority} Priority
                </span>
                <span className="text-[12px] font-medium px-2.5 py-0.5 rounded-[6px] bg-[#111827]/10 dark:bg-[#FAFAFA]/10 text-[#111827] dark:text-[#FAFAFA] border border-[#E5E7EB] dark:border-[#2A2A2A]">
                  Target: {a.target_type} ({a.target_filter})
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[12px] text-[#6B7280] dark:text-[#A1A1AA]">{new Date(a.created_at).toLocaleDateString()}</span>
                <button
                  onClick={() => handleDeleteAnnouncement(a.id)}
                  className="p-1.5 text-[#6B7280] hover:text-rose-600 dark:hover:text-rose-400 rounded-[6px] transition cursor-pointer"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <h4 className="text-[18px] font-semibold text-[#111827] dark:text-[#FAFAFA] leading-snug">{a.title}</h4>
            <p className="text-[14px] font-normal text-[#6B7280] dark:text-[#A1A1AA] leading-relaxed">{a.content}</p>
          </div>
        ))}
      </div>

      {/* ── Create Announcement Modal ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 font-sans">
          <div className="bg-[#FFFFFF] dark:bg-[#18181B] rounded-[16px] max-w-lg w-full p-6 space-y-5 shadow-2xl border border-[#E5E7EB] dark:border-[#2A2A2A]">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] dark:border-[#2A2A2A] pb-4">
              <h3 className="text-[18px] font-semibold text-[#111827] dark:text-[#FAFAFA]">New Announcement Broadcast</h3>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-[6px] text-[#6B7280] hover:text-[#111827] dark:text-[#A1A1AA] dark:hover:text-[#FAFAFA] transition cursor-pointer">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateAnnouncement} className="space-y-4">
              <div>
                <label className="text-[12px] font-medium text-[#6B7280] dark:text-[#A1A1AA] mb-1 block">Announcement Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Model Exam Schedule & Guidelines"
                  required
                  className="w-full h-[40px] px-3.5 rounded-[10px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#F8FAFC] dark:bg-[#111111] text-[14px] text-[#111827] dark:text-[#FAFAFA] outline-none focus:border-[#111827] dark:focus:border-[#FAFAFA] transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[12px] font-medium text-[#6B7280] dark:text-[#A1A1AA] mb-1 block">Target Group</label>
                  <select
                    value={targetType}
                    onChange={(e) => setTargetType(e.target.value)}
                    className="w-full h-[40px] px-3.5 rounded-[10px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#F8FAFC] dark:bg-[#111111] text-[14px] text-[#111827] dark:text-[#FAFAFA] outline-none focus:border-[#111827] dark:focus:border-[#FAFAFA] transition cursor-pointer"
                  >
                    <option value="Entire College">Entire College</option>
                    <option value="Department">Department</option>
                    <option value="Semester">Semester</option>
                    <option value="Faculty">Faculty Only</option>
                  </select>
                </div>

                <div>
                  <label className="text-[12px] font-medium text-[#6B7280] dark:text-[#A1A1AA] mb-1 block">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full h-[40px] px-3.5 rounded-[10px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#F8FAFC] dark:bg-[#111111] text-[14px] text-[#111827] dark:text-[#FAFAFA] outline-none focus:border-[#111827] dark:focus:border-[#FAFAFA] transition cursor-pointer"
                  >
                    <option value="High">High</option>
                    <option value="Normal">Normal</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[12px] font-medium text-[#6B7280] dark:text-[#A1A1AA] mb-1 block">Content</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={4}
                  placeholder="Enter full announcement details..."
                  required
                  className="w-full p-3.5 rounded-[10px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#F8FAFC] dark:bg-[#111111] text-[14px] text-[#111827] dark:text-[#FAFAFA] outline-none focus:border-[#111827] dark:focus:border-[#FAFAFA] transition"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E5E7EB] dark:border-[#2A2A2A]">
                <button type="button" onClick={() => setShowModal(false)} className="h-[40px] px-4 rounded-[10px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#FFFFFF] dark:bg-[#18181B] text-[#111827] dark:text-[#FAFAFA] text-[14px] font-medium transition cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="h-[40px] px-5 rounded-[10px] bg-[#111827] hover:bg-[#1F2937] dark:bg-[#FAFAFA] dark:hover:bg-[#E5E5E5] text-[#FFFFFF] dark:text-[#111111] text-[14px] font-medium transition cursor-pointer shadow-xs">
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
