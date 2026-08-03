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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-lg overflow-hidden rounded-[12px] bg-[#FFFFFF] dark:bg-[#181818] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-lg"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#F3F4F6] dark:border-[#2A2A2A] bg-[#FFFFFF] dark:bg-[#181818]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[10px] bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] flex items-center justify-center">
                <FolderPlus size={20} />
              </div>
              <div>
                <h2 className="text-[18px] font-bold text-[#111827] dark:text-[#FAFAFA]">
                  Document Folders
                </h2>
                <p className="text-[12px] text-[#6B7280] dark:text-[#A3A3A3]">
                  Organize your study material into subject categories
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-[8px] text-[#6B7280] hover:text-[#111827] dark:hover:text-[#FAFAFA] transition cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6">
            {/* Create New Folder Form */}
            <form onSubmit={handleCreate} className="space-y-2">
              <label className="text-[12px] font-medium uppercase tracking-wider text-[#6B7280] dark:text-[#A3A3A3]">
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
                  className="flex-1 h-10 px-4 rounded-[10px] border border-[#D1D5DB] dark:border-[#2A2A2A] bg-[#FFFFFF] dark:bg-[#181818] text-[14px] text-[#111827] dark:text-[#FAFAFA] outline-none"
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-10 px-5 rounded-[10px] bg-[#111827] hover:bg-[#000000] dark:bg-[#FAFAFA] dark:hover:bg-[#E5E7EB] text-[#FFFFFF] dark:text-[#111111] font-medium text-[14px] flex items-center gap-2 shadow-xs transition cursor-pointer disabled:opacity-40"
                >
                  <Plus size={16} />
                  <span>Create</span>
                </button>
              </div>
              {error && <p className="text-[12px] text-[#DC2626] font-medium">{error}</p>}
            </form>

            {/* Folder List */}
            <div className="space-y-2">
              <label className="text-[12px] font-medium uppercase tracking-wider text-[#6B7280] dark:text-[#A3A3A3]">
                Existing Folders ({folders.length})
              </label>
              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                {folders.map((f) => {
                  const isSelected = activeFolder === f;
                  return (
                    <button
                      key={f}
                      onClick={() => {
                        onSelectFolder(f);
                        onClose();
                      }}
                      className={`w-full flex items-center justify-between p-3 rounded-[10px] text-[14px] font-medium transition-all duration-150 cursor-pointer ${
                        isSelected
                          ? 'bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111]'
                          : 'bg-[#FFFFFF] dark:bg-[#181818] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA] hover:bg-[#F9FAFB] dark:hover:bg-[#232323]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Folder size={18} className={isSelected ? 'text-[#FFFFFF] dark:text-[#111111]' : 'text-[#111827] dark:text-[#FAFAFA]'} />
                        <span>{f}</span>
                      </div>
                      {isSelected && <Check size={16} className="text-[#FFFFFF] dark:text-[#111111]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end px-6 py-4 border-t border-[#F3F4F6] dark:border-[#2A2A2A] bg-[#FFFFFF] dark:bg-[#181818]">
            <button
              onClick={onClose}
              className="h-10 px-5 rounded-[10px] border border-[#D1D5DB] dark:border-[#2A2A2A] text-[14px] font-medium text-[#111827] dark:text-[#FAFAFA] hover:bg-[#F9FAFB] dark:hover:bg-[#232323] transition cursor-pointer"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
