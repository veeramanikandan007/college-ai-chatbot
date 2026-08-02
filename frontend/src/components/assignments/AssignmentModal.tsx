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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#1E293B] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 my-8 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
          <h2 className="text-xl font-bold font-heading text-slate-900 dark:text-white flex items-center gap-2">
            <span>{initialData ? 'Edit Assignment' : 'Create New Assignment'}</span>
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
              <CircleAlert size={16} />
              {formError}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
              Assignment Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. B-Tree & B+ Tree Implementation"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0E2A6D] dark:focus:ring-[#60A5FA]"
            />
          </div>

          {/* Subject & Faculty Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                Subject *
              </label>
              <input
                type="text"
                required
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="e.g. Data Structures & Algorithms"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0E2A6D] dark:focus:ring-[#60A5FA]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                Faculty / Instructor *
              </label>
              <input
                type="text"
                required
                value={formData.faculty}
                onChange={(e) => setFormData({ ...formData, faculty: e.target.value })}
                placeholder="e.g. Dr. Aris Thorne"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0E2A6D] dark:focus:ring-[#60A5FA]"
              />
            </div>
          </div>

          {/* Priority, Status, Due Date */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0E2A6D] dark:focus:ring-[#60A5FA]"
              >
                <option value="High">High Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="Low">Low Priority</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0E2A6D] dark:focus:ring-[#60A5FA]"
              >
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
                <option value="Overdue">Overdue</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                Due Date & Time *
              </label>
              <input
                type="datetime-local"
                required
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0E2A6D] dark:focus:ring-[#60A5FA]"
              />
            </div>
          </div>

          {/* Class Assignment & Remarks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                Assigned Class / Section
              </label>
              <input
                type="text"
                value={formData.assigned_class || ''}
                onChange={(e) => setFormData({ ...formData, assigned_class: e.target.value })}
                placeholder="e.g. CSE-3A or All Classes"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0E2A6D] dark:focus:ring-[#60A5FA]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                Remarks / Notes
              </label>
              <input
                type="text"
                value={formData.remarks || ''}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                placeholder="e.g. Include benchmark comparison graphs"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0E2A6D] dark:focus:ring-[#60A5FA]"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
              Description / Instructions
            </label>
            <textarea
              rows={3}
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter comprehensive instructions for students..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0E2A6D] dark:focus:ring-[#60A5FA]"
            />
          </div>

          {/* File Upload Section */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
              Attachment (PDF, DOCX, PPT, ZIP, Images - Max 10MB)
            </label>
            
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all border border-slate-200 dark:border-slate-700">
                <Upload size={16} />
                <span>{uploading ? 'Uploading File...' : 'Choose File'}</span>
                <input
                  type="file"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  accept=".pdf,.docx,.doc,.ppt,.pptx,.zip,.rar,.png,.jpg,.jpeg,.webp"
                  className="hidden"
                />
              </label>

              {formData.attachment_name && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-xs font-medium border border-blue-200 dark:border-blue-900/50">
                  <Paperclip size={14} />
                  <span className="truncate max-w-[200px]">{formData.attachment_name}</span>
                  {formData.attachment_size && <span className="text-[10px]">({formData.attachment_size})</span>}
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, attachment_name: '', attachment_url: '', attachment_size: '' })}
                    className="p-0.5 hover:text-rose-500"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>

            {uploadError && (
              <p className="mt-1 text-xs text-rose-500 font-semibold">{uploadError}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting || uploading}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-[#0E2A6D] text-white hover:bg-[#0E2A6D]/90 disabled:opacity-50 transition-all shadow-xs"
            >
              <CheckCircle2 size={16} />
              <span>{submitting ? 'Saving...' : initialData ? 'Update Assignment' : 'Create Assignment'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
