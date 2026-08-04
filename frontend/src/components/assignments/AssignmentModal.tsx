import React, { useState, useEffect } from 'react';
import { X, Upload, Paperclip, CheckCircle2, CircleAlert, Clock3 } from 'lucide-react';
import { Assignment, AssignmentInput, uploadAssignmentFile } from '../../api/assignments';

interface AssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AssignmentInput, id?: number) => Promise<void>;
  initialData?: Assignment | null;
}

export const AssignmentModal: React.FC<AssignmentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const [formData, setFormData] = useState<AssignmentInput>({
    title: '',
    subject: '',
    faculty: '',
    description: '',
    priority: 'Medium',
    due_date: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 16),
    status: 'Pending',
    attachment_name: '',
    attachment_url: '',
    attachment_size: '',
    remarks: '',
    assigned_class: 'All Classes',
  });

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      // Format datetime string for input datetime-local
      const dt = new Date(initialData.due_date);
      const tzOffset = dt.getTimezoneOffset() * 60000;
      const localISOTime = new Date(dt.getTime() - tzOffset).toISOString().slice(0, 16);

      setFormData({
        title: initialData.title || '',
        subject: initialData.subject || '',
        faculty: initialData.faculty || '',
        description: initialData.description || '',
        priority: initialData.priority || 'Medium',
        due_date: localISOTime,
        status: initialData.status || 'Pending',
        attachment_name: initialData.attachment_name || '',
        attachment_url: initialData.attachment_url || '',
        attachment_size: initialData.attachment_size || '',
        remarks: initialData.remarks || '',
        assigned_class: initialData.assigned_class || 'All Classes',
      });
    } else {
      const defaultDate = new Date(Date.now() + 86400000 * 2);
      const tzOffset = defaultDate.getTimezoneOffset() * 60000;
      const localISOTime = new Date(defaultDate.getTime() - tzOffset).toISOString().slice(0, 16);

      setFormData({
        title: '',
        subject: '',
        faculty: '',
        description: '',
        priority: 'Medium',
        due_date: localISOTime,
        status: 'Pending',
        attachment_name: '',
        attachment_url: '',
        attachment_size: '',
        remarks: '',
        assigned_class: 'All Classes',
      });
    }
    setUploadError(null);
    setFormError(null);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);

    try {
      const result = await uploadAssignmentFile(file);
      setFormData((prev) => ({
        ...prev,
        attachment_name: result.attachment_name,
        attachment_url: result.attachment_url,
        attachment_size: result.attachment_size,
      }));
    } catch (err: any) {
      setUploadError(err.message || 'File upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.subject.trim() || !formData.faculty.trim()) {
      setFormError('Title, Subject, and Faculty are required fields.');
      return;
    }

    setSubmitting(true);
    setFormError(null);

    try {
      // Ensure ISO string for backend payload
      const isoDueDate = new Date(formData.due_date).toISOString();
      await onSubmit({ ...formData, due_date: isoDueDate }, initialData?.id);
      onClose();
    } catch (err: any) {
      setFormError(err.message || 'Failed to save assignment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#FFFFFF] dark:bg-[#181818] rounded-[16px] border border-[#D1D5DB] dark:border-[#3F3F46] my-8 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#F8FAFC] dark:bg-[#111111]">
          <h2 className="text-[18px] font-[600] text-[#111827] dark:text-[#FAFAFA]">
            {initialData ? 'Edit Assignment' : 'Create New Assignment'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#6B7280] dark:text-[#A3A3A3] hover:text-[#111827] dark:hover:text-[#FAFAFA] cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {formError && (
            <div className="p-3 rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA] text-[12px] font-medium flex items-center gap-2">
              <CircleAlert size={16} />
              {formError}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-[12px] font-medium uppercase tracking-wider text-[#6B7280] dark:text-[#A3A3A3] mb-1">
              Assignment Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. B-Tree & B+ Tree Implementation"
              className="w-full h-10 px-3.5 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#181818] text-[#111827] dark:text-[#FAFAFA] text-[14px] outline-none"
            />
          </div>

          {/* Subject & Faculty Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-medium uppercase tracking-wider text-[#6B7280] dark:text-[#A3A3A3] mb-1">
                Subject *
              </label>
              <input
                type="text"
                required
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="e.g. Data Structures & Algorithms"
                className="w-full h-10 px-3.5 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#181818] text-[#111827] dark:text-[#FAFAFA] text-[14px] outline-none"
              />
            </div>

            <div>
              <label className="block text-[12px] font-medium uppercase tracking-wider text-[#6B7280] dark:text-[#A3A3A3] mb-1">
                Faculty / Instructor *
              </label>
              <input
                type="text"
                required
                value={formData.faculty}
                onChange={(e) => setFormData({ ...formData, faculty: e.target.value })}
                placeholder="e.g. Dr. Aris Thorne"
                className="w-full h-10 px-3.5 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#181818] text-[#111827] dark:text-[#FAFAFA] text-[14px] outline-none"
              />
            </div>
          </div>

          {/* Priority, Status, Due Date */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[12px] font-medium uppercase tracking-wider text-[#6B7280] dark:text-[#A3A3A3] mb-1">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                className="w-full h-10 px-3.5 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#181818] text-[#111827] dark:text-[#FAFAFA] text-[14px] outline-none cursor-pointer"
              >
                <option value="Low">Low Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="High">High Priority</option>
              </select>
            </div>

            <div>
              <label className="block text-[12px] font-medium uppercase tracking-wider text-[#6B7280] dark:text-[#A3A3A3] mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full h-10 px-3.5 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#181818] text-[#111827] dark:text-[#FAFAFA] text-[14px] outline-none cursor-pointer"
              >
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
                <option value="Overdue">Overdue</option>
              </select>
            </div>

            <div>
              <label className="block text-[12px] font-medium uppercase tracking-wider text-[#6B7280] dark:text-[#A3A3A3] mb-1">
                Due Date & Time *
              </label>
              <input
                type="datetime-local"
                required
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                className="w-full h-10 px-3.5 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#181818] text-[#111827] dark:text-[#FAFAFA] text-[14px] outline-none"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[12px] font-medium uppercase tracking-wider text-[#6B7280] dark:text-[#A3A3A3] mb-1">
              Description & Requirements
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe assignment problem statement, submission guidelines..."
              className="w-full p-3 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#181818] text-[#111827] dark:text-[#FAFAFA] text-[14px] outline-none"
            />
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-[12px] font-medium uppercase tracking-wider text-[#6B7280] dark:text-[#A3A3A3] mb-1">
              Attachment (PDF / Doc / Image)
            </label>
            <div className="flex items-center gap-3">
              <label className="h-10 px-4 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#181818] text-[#111827] dark:text-[#FAFAFA] text-[14px] font-medium hover:bg-[#F9FAFB] dark:hover:bg-[#232323] cursor-pointer flex items-center gap-2">
                <Upload size={16} />
                <span>{uploading ? 'Uploading...' : 'Choose File'}</span>
                <input type="file" onChange={handleFileUpload} disabled={uploading} className="hidden" />
              </label>

              {formData.attachment_name && (
                <div className="flex items-center gap-1.5 text-[12px] text-[#111827] dark:text-[#FAFAFA] bg-[#F8FAFC] dark:bg-[#111111] px-3 py-1.5 rounded-[6px] border border-[#E5E7EB] dark:border-[#2A2A2A]">
                  <Paperclip size={13} />
                  <span>{formData.attachment_name}</span>
                </div>
              )}
            </div>
            {uploadError && <p className="text-[12px] text-rose-500 mt-1">{uploadError}</p>}
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-[12px] font-medium uppercase tracking-wider text-[#6B7280] dark:text-[#A3A3A3] mb-1">
              Additional Remarks
            </label>
            <input
              type="text"
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              placeholder="e.g. Needs physical submission at HOD office"
              className="w-full h-10 px-3.5 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#181818] text-[#111827] dark:text-[#FAFAFA] text-[14px] outline-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E5E7EB] dark:border-[#2A2A2A]">
            <button
              type="button"
              onClick={onClose}
              className="h-10 px-5 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] text-[#111827] dark:text-[#FAFAFA] text-[14px] font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="h-10 px-6 rounded-[10px] bg-[#111827] hover:bg-[#000000] dark:bg-[#FAFAFA] dark:hover:bg-[#E5E5E5] text-[#FFFFFF] dark:text-[#111111] text-[14px] font-medium shadow-xs cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Saving...' : initialData ? 'Update Assignment' : 'Save Assignment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
