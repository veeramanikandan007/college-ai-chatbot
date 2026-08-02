import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Folder, Plus, X, FolderPlus, Check, Sparkles } from 'lucide-react';

interface FolderManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  folders: string[];
  activeFolder: string;
  onSelectFolder: (folder: string) => void;
  onCreateFolder: (folderName: string) => Promise<void>;
}

export const FolderManagerModal: React.FC<FolderManagerModalProps> = ({
  isOpen,
  onClose,
  folders,
  activeFolder,
  onSelectFolder,
  onCreateFolder,
}) => {
  const [newFolderName, setNewFolderName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) {
      setError('Please enter a folder name');
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      await onCreateFolder(newFolderName.trim());
      setNewFolderName('');
    } catch (err: any) {
      setError(err?.message || 'Failed to create folder');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-lg overflow-hidden rounded-2xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#0F172A]/50">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#0E2A6D]/10 dark:bg-[#60A5FA]/20 text-[#0E2A6D] dark:text-[#60A5FA]">
                <FolderPlus size={22} />
              </div>
              <div>
                <h2 className="font-heading text-lg font-bold text-[#0E2A6D] dark:text-[#F8FAFC]">
                  Document Folders
                </h2>
                <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                  Organize your study material into subject categories
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[#64748B] hover:text-[#1F2937] dark:hover:text-[#F8FAFC] hover:bg-[#F5F7FB] dark:hover:bg-[#334155] transition"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6">
            {/* Create New Folder Form */}
            <form onSubmit={handleCreate} className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">
                Create New Folder
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Operating Systems, Placement Prep..."
                  value={newFolderName}
                  onChange={(e) => {
                    setNewFolderName(e.target.value);
                    if (error) setError(null);
                  }}
                  className="flex-1 h-11 px-4 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-body text-[#1F2937] dark:text-[#F8FAFC] outline-none focus:border-[#1E4DB7] transition"
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-11 px-5 rounded-xl bg-[#0E2A6D] hover:bg-[#153B8A] text-white font-semibold text-sm flex items-center gap-2 shadow-md transition disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Plus size={18} />
                  )}
                  Create
                </button>
              </div>
              {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}
            </form>

            {/* Folder List */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">
                Available Folders ({folders.length})
              </label>
              <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                {folders.map((folder) => {
                  const isSelected = activeFolder === folder;
                  return (
                    <button
                      key={folder}
                      onClick={() => {
                        onSelectFolder(folder);
                        onClose();
                      }}
                      className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'border-[#1E4DB7] bg-[#1E4DB7]/10 text-[#1E4DB7] dark:text-[#60A5FA] font-bold shadow-xs'
                          : 'border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#0F172A]/40 text-[#475569] dark:text-[#CBD5E1] hover:border-[#1E4DB7]/40 hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Folder
                          size={18}
                          className={isSelected ? 'text-[#1E4DB7] dark:text-[#60A5FA]' : 'text-[#D9A441]'}
                        />
                        <span className="truncate text-sm font-medium">{folder}</span>
                      </div>
                      {isSelected && <Check size={16} className="text-[#1E4DB7] dark:text-[#60A5FA] shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#0F172A]/50">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#334155] text-sm font-semibold text-[#475569] dark:text-[#CBD5E1] hover:bg-[#E2E8F0]/50 transition"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
