import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, Plus, Trash2, X, ShieldCheck } from 'lucide-react';
import { adminDashboardApi, AdminAnnouncement } from '../../api/adminDashboard';
import { useToast } from '../../context/ToastContext';
import { PageHeader } from '../ui/PageHeader';
import { Button } from '../ui/Button';
import { Dialog } from '../ui/Dialog';
import { Table, Column } from '../ui/Table';
import { Badge } from '../ui/Badge';
import { DashboardCard } from '../ui/DashboardCard';
import { FormSection } from '../ui/FormSection';
import { PageContainer } from '../ui/PageContainer';
import { Input } from '../ui/Input';

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
      showToast('Announcement broadcast successfully.', 'success');
      setShowModal(false);
      setTitle('');
      setContent('');
      fetchAnnouncements();
    } catch (err) {
      showToast('Failed to broadcast announcement.', 'error');
    }
  };

  const handleDeleteAnnouncement = async (id: number) => {
    if (!window.confirm('Delete this announcement?')) return;
    try {
      await adminDashboardApi.deleteAnnouncement(id);
      showToast('Announcement deleted.', 'info');
      fetchAnnouncements();
    } catch (err) {}
  };

  const columns: Column<AdminAnnouncement>[] = [
    {
      key: 'title',
      header: 'Announcement',
      sortable: true,
      render: (a) => (
        <div className="max-w-md">
          <div className="font-semibold text-zinc-900 dark:text-zinc-100">{a.title}</div>
          <div className="text-xs text-zinc-500 mt-1 line-clamp-2">{a.content}</div>
        </div>
      )
    },
    {
      key: 'target',
      header: 'Target Audience',
      render: (a) => (
        <Badge variant="info">
          {a.target_type} ({a.target_filter})
        </Badge>
      )
    },
    {
      key: 'priority',
      header: 'Priority',
      sortable: true,
      render: (a) => {
        const v = a.priority === 'High' ? 'error' : a.priority === 'Normal' ? 'info' : 'neutral';
        return <Badge variant={v}>{a.priority}</Badge>;
      }
    },
    {
      key: 'date',
      header: 'Date',
      sortable: true,
      render: (a) => <span className="text-sm text-zinc-500">{new Date(a.created_at).toLocaleDateString()}</span>
    },
    {
      key: 'actions',
      header: '',
      render: (a) => (
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" onClick={() => handleDeleteAnnouncement(a.id)}>
            <Trash2 size={16} className="text-red-500" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Campus Announcement & Broadcast Center"
        description="Broadcast targeted notifications to students, faculty, departments, or semesters."
        icon={Bell}
        actionText="New Broadcast"
        actionIcon={Plus}
        onActionClick={() => setShowModal(true)}
      />

      <DashboardCard className="p-0 md:p-0 overflow-hidden">
        <Table
          columns={columns}
          data={announcements}
          isLoading={loading}
          searchable={true}
          searchPlaceholder="Search announcements..."
          emptyMessage="No announcements found."
        />
      </DashboardCard>

      <Dialog isOpen={showModal} onClose={() => setShowModal(false)} title="New Announcement Broadcast">
        <form id="announcement-form" onSubmit={handleCreateAnnouncement}>
          <FormSection>
            <Input label="Announcement Title" type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Model Exam Schedule & Guidelines" required />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#475569] dark:text-[#CBD5E1] mb-1.5">Target Group</label>
                <select value={targetType} onChange={e => setTargetType(e.target.value)} className="w-full h-10 px-3 bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded-[10px] text-sm text-[#1F2937] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#1E4DB7]/30 focus:border-[#1E4DB7] transition-all duration-200">
                  <option value="Entire College">Entire College</option>
                  <option value="Department">Department</option>
                  <option value="Semester">Semester</option>
                  <option value="Faculty">Faculty Only</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#475569] dark:text-[#CBD5E1] mb-1.5">Priority</label>
                <select value={priority} onChange={e => setPriority(e.target.value)} className="w-full h-10 px-3 bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded-[10px] text-sm text-[#1F2937] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#1E4DB7]/30 focus:border-[#1E4DB7] transition-all duration-200">
                  <option value="High">High</option>
                  <option value="Normal">Normal</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>

            <Input label="Content" type="text" value={content} onChange={e => setContent(e.target.value)} placeholder="Enter full announcement details..." required />
          </FormSection>
        </form>
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="primary" type="submit" form="announcement-form">Broadcast Announcement</Button>
        </div>
      </Dialog>
    </PageContainer>
  );
};
