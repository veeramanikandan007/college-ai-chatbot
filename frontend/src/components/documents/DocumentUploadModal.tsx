import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UploadCloud,
  File,
  FileText,
  Image as ImageIcon,
  Archive,
  X,
  CheckCircle2,
  AlertCircle,
  Folder,
  RotateCcw,
  Sparkles,
  Loader2,
} from 'lucide-react';

interface UploadItem {
  id: string;
  file: File;
  folderName: string;
  progress: number;
  status: 'queued' | 'uploading' | 'parsing' | 'vectorizing' | 'success' | 'error';
  errorMessage?: string;
}

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  folders: string[];
  onUploadSuccess: () => void;
}

const SUPPORTED_TYPES_LABEL = 'PDF, DOCX, PPT, PPTX, TXT, MD, CSV, XLSX, JPEG, PNG, WEBP, ZIP (Max 50MB)';
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

const getFileIcon = (filename: string) => {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext)) {
    return <ImageIcon size={22} className="text-emerald-500" />;
  }
  if (['zip', 'rar', '7z'].includes(ext)) {
    return <Archive size={22} className="text-amber-500" />;
  }
  if (['pdf'].includes(ext)) {
    return <FileText size={22} className="text-rose-500" />;
  }
  if (['docx', 'doc'].includes(ext)) {
    return <FileText size={22} className="text-blue-500" />;
  }
  if (['ppt', 'pptx'].includes(ext)) {
    return <FileText size={22} className="text-orange-500" />;
  }
  if (['csv', 'xlsx', 'xls'].includes(ext)) {
    return <FileText size={22} className="text-green-500" />;
  }
  return <File size={22} className="text-[#1E4DB7] dark:text-[#60A5FA]" />;
};

export const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({
  isOpen,
  onClose,
  folders,
  onUploadSuccess,
}) => {
  const [selectedFolder, setSelectedFolder] = useState<string>('General');
  const [items, setItems] = useState<UploadItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFilesAdded = (filesList: FileList | File[]) => {
    const newItems: UploadItem[] = [];
    Array.from(filesList).forEach((file) => {
      if (file.size > MAX_FILE_SIZE) {
        newItems.push({
          id: Math.random().toString(36).substring(2, 9),
          file,
          folderName: selectedFolder,
          progress: 0,
          status: 'error',
          errorMessage: 'File exceeds maximum 50MB limit.',
        });
      } else {
        newItems.push({
          id: Math.random().toString(36).substring(2, 9),
          file,
          folderName: selectedFolder,
          progress: 0,
          status: 'queued',
        });
      }
    });

    setItems((prev) => [...prev, ...newItems]);
    // Automatically trigger upload sequence for queued items
    newItems.filter((i) => i.status === 'queued').forEach((item) => uploadSingleFile(item));
  };

  const uploadSingleFile = async (item: UploadItem) => {
    // Update status to uploading
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, status: 'uploading', progress: 20 } : i))
    );

    const formData = new FormData();
    formData.append('file', item.file);
    formData.append('folder_name', item.folderName);

    try {
      // Stage 1: Uploading
      await new Promise((r) => setTimeout(r, 600));
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, status: 'parsing', progress: 55 } : i))
      );

      // Stage 2: Parsing & Vectorizing simulation / API call
      const res = await fetch('/api/v1/documents/upload', {
        method: 'POST',
        body: formData,
      });

      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, status: 'vectorizing', progress: 85 } : i))
      );
      await new Promise((r) => setTimeout(r, 600));

      if (res.ok) {
        setItems((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, status: 'success', progress: 100 } : i))
        );
        onUploadSuccess();
      } else {
        const errData = await res.json().catch(() => ({}));
        setItems((prev) =>
          prev.map((i) =>
            i.id === item.id
              ? {
                  ...i,
                  status: 'error',
                  progress: 0,
                  errorMessage: errData.detail || 'Upload failed.',
                }
              : i
          )
        );
      }
    } catch (err: any) {
      setItems((prev) =>
        prev.map((i) =>
          i.id === item.id
            ? {
                ...i,
                status: 'error',
                progress: 0,
                errorMessage: 'Network error or server unreachable.',
              }
            : i
        )
      );
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesAdded(e.dataTransfer.files);
    }
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const retryItem = (item: UploadItem) => {
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, status: 'queued', progress: 0, errorMessage: undefined } : i))
    );
    uploadSingleFile(item);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] shadow-2xl flex flex-col max-h-[90vh]"
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#0F172A]/50 shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#0E2A6D] text-[#D9A441] shadow-sm">
                <UploadCloud size={22} />
              </div>
              <div>
                <h2 className="font-heading text-lg font-bold text-[#0E2A6D] dark:text-[#F8FAFC] flex items-center gap-2">
                  Upload Study Materials
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[#1E4DB7]/10 text-[#1E4DB7] dark:text-[#60A5FA] font-bold">
                    AI Auto-Indexed
                  </span>
                </h2>
                <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                  Drag files or select from your computer for instant summary & AI chat
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

          {/* Modal Content */}
          <div className="p-6 overflow-y-auto space-y-5 flex-1 custom-scrollbar">
            {/* Target Folder Selector */}
            <div className="flex items-center justify-between gap-4 p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#0F172A]/50 border border-[#E2E8F0] dark:border-[#334155]">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#0E2A6D] dark:text-[#F8FAFC]">
                <Folder size={18} className="text-[#D9A441]" />
                <span>Upload to Folder:</span>
              </div>
              <select
                value={selectedFolder}
                onChange={(e) => setSelectedFolder(e.target.value)}
                className="h-9 px-3 rounded-lg border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#1E293B] text-sm font-medium text-[#1F2937] dark:text-[#F8FAFC] outline-none focus:border-[#1E4DB7]"
              >
                {folders.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>

            {/* Drag & Drop Area */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed cursor-pointer transition-all ${
                isDragging
                  ? 'border-[#1E4DB7] bg-[#1E4DB7]/10 scale-[1.01]'
                  : 'border-[#CBD5E1] dark:border-[#334155] hover:border-[#1E4DB7] bg-[#F8FAFC]/50 dark:bg-[#0F172A]/30 hover:bg-[#F5F7FB] dark:hover:bg-[#1E293B]'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.docx,.doc,.ppt,.pptx,.txt,.md,.csv,.xlsx,.jpeg,.jpg,.png,.webp,.zip"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    handleFilesAdded(e.target.files);
                  }
                }}
              />
              <div className="w-16 h-16 mb-3 rounded-2xl bg-gradient-to-tr from-[#0E2A6D] to-[#1E4DB7] text-white flex items-center justify-center shadow-lg shadow-[#0E2A6D]/20">
                <UploadCloud size={32} />
              </div>
              <p className="font-heading font-bold text-base text-[#0E2A6D] dark:text-[#F8FAFC]">
                Drag & Drop files here or <span className="text-[#1E4DB7] dark:text-[#60A5FA] underline">Browse</span>
              </p>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1 text-center">
                {SUPPORTED_TYPES_LABEL}
              </p>
            </div>

            {/* Upload Queue */}
            {items.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">
                  Uploading Files ({items.length})
                </h4>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#0F172A]/40 flex flex-col gap-2"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          {getFileIcon(item.file.name)}
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-[#1F2937] dark:text-[#F8FAFC]">
                              {item.file.name}
                            </p>
                            <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                              {(item.file.size / (1024 * 1024)).toFixed(2)} MB • {item.folderName}
                            </p>
                          </div>
                        </div>

                        {/* Status badge & action button */}
                        <div className="flex items-center gap-2">
                          {item.status === 'success' && (
                            <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full">
                              <CheckCircle2 size={14} /> Ready
                            </span>
                          )}
                          {item.status === 'error' && (
                            <button
                              onClick={() => retryItem(item)}
                              className="flex items-center gap-1 text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-full hover:bg-rose-500/20 transition"
                            >
                              <RotateCcw size={14} /> Retry
                            </button>
                          )}
                          {(item.status === 'uploading' ||
                            item.status === 'parsing' ||
                            item.status === 'vectorizing') && (
                            <span className="flex items-center gap-1.5 text-xs font-bold text-[#1E4DB7] dark:text-[#60A5FA] bg-[#1E4DB7]/10 px-2.5 py-1 rounded-full">
                              <Loader2 size={14} className="animate-spin" />
                              {item.status === 'uploading' && 'Uploading...'}
                              {item.status === 'parsing' && 'Extracting text...'}
                              {item.status === 'vectorizing' && 'Generating AI index...'}
                            </span>
                          )}
                          <button
                            onClick={() => removeItem(item.id)}
                            className="p-1 rounded-lg text-[#64748B] hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 transition"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Progress bar */}
                      {item.status !== 'error' && (
                        <div className="w-full bg-[#E2E8F0] dark:bg-[#334155] h-1.5 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${item.progress}%` }}
                            className="h-full bg-gradient-to-r from-[#0E2A6D] to-[#1E4DB7]"
                          />
                        </div>
                      )}
                      {item.errorMessage && (
                        <p className="text-xs text-rose-500 font-medium flex items-center gap-1">
                          <AlertCircle size={14} /> {item.errorMessage}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#0F172A]/50 shrink-0">
            <span className="text-xs text-[#64748B] dark:text-[#94A3B8] flex items-center gap-1">
              <Sparkles size={14} className="text-[#D9A441]" /> Vector search enabled automatically
            </span>
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-[#0E2A6D] hover:bg-[#153B8A] text-white font-semibold text-sm shadow-md transition"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
