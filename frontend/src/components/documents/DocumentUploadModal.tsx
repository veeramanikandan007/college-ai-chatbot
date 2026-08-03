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

const getFileIcon = (_filename: string) => {
  return <FileText size={22} className="text-[#111827] dark:text-[#FAFAFA]" />;
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
    newItems.filter((i) => i.status === 'queued').forEach((item) => uploadSingleFile(item));
  };

  const uploadSingleFile = async (item: UploadItem) => {
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, status: 'uploading', progress: 20 } : i))
    );

    const formData = new FormData();
    formData.append('file', item.file);
    formData.append('folder_name', item.folderName);

    try {
      await new Promise((r) => setTimeout(r, 600));
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, status: 'parsing', progress: 55 } : i))
      );

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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-2xl overflow-hidden rounded-[12px] bg-[#FFFFFF] dark:bg-[#181818] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-lg flex flex-col max-h-[90vh]"
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#F3F4F6] dark:border-[#2A2A2A] bg-[#FFFFFF] dark:bg-[#181818] shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[10px] bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] flex items-center justify-center">
                <UploadCloud size={20} />
              </div>
              <div>
                <h2 className="text-[18px] font-bold text-[#111827] dark:text-[#FAFAFA] flex items-center gap-2">
                  Upload Study Materials
                  <span className="text-[12px] px-2 py-0.5 rounded-[6px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA] font-medium">
                    AI Auto-Indexed
                  </span>
                </h2>
                <p className="text-[12px] text-[#6B7280] dark:text-[#A3A3A3]">
                  Drag files or select from your computer for instant summary & AI chat
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

          {/* Modal Content */}
          <div className="p-6 overflow-y-auto space-y-5 flex-1">
            {/* Target Folder Selector */}
            <div className="flex items-center justify-between gap-4 p-3 rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A]">
              <div className="flex items-center gap-2 text-[14px] font-medium text-[#111827] dark:text-[#FAFAFA]">
                <Folder size={18} />
                <span>Upload to Folder:</span>
              </div>
              <select
                value={selectedFolder}
                onChange={(e) => setSelectedFolder(e.target.value)}
                className="h-9 px-3 rounded-[8px] border border-[#D1D5DB] dark:border-[#2A2A2A] bg-[#FFFFFF] dark:bg-[#181818] text-[14px] font-medium text-[#111827] dark:text-[#FAFAFA] outline-none"
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
              className={`relative flex flex-col items-center justify-center p-8 rounded-[12px] border-2 border-dashed cursor-pointer transition-all duration-150 ${
                isDragging
                  ? 'border-[#111827] dark:border-[#FAFAFA] bg-[#F9FAFB] dark:bg-[#232323]'
                  : 'border-[#D1D5DB] dark:border-[#2A2A2A] hover:border-[#111827] dark:hover:border-[#FAFAFA] bg-[#FFFFFF] dark:bg-[#181818]'
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
              <div className="w-14 h-14 mb-3 rounded-[12px] bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] flex items-center justify-center shadow-xs">
                <UploadCloud size={28} />
              </div>
              <p className="font-bold text-[16px] text-[#111827] dark:text-[#FAFAFA]">
                Drag & Drop files here or <span className="underline cursor-pointer">Browse</span>
              </p>
              <p className="text-[12px] text-[#6B7280] dark:text-[#A3A3A3] mt-1 text-center">
                {SUPPORTED_TYPES_LABEL}
              </p>
            </div>

            {/* Upload Queue */}
            {items.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-[12px] font-semibold uppercase tracking-wider text-[#6B7280] dark:text-[#A3A3A3]">
                  Uploading Files ({items.length})
                </h4>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-[10px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#FFFFFF] dark:bg-[#181818] flex flex-col gap-2"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          {getFileIcon(item.file.name)}
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[14px] font-medium text-[#111827] dark:text-[#FAFAFA]">
                              {item.file.name}
                            </p>
                            <p className="text-[12px] text-[#6B7280] dark:text-[#A3A3A3]">
                              {(item.file.size / (1024 * 1024)).toFixed(2)} MB • {item.folderName}
                            </p>
                          </div>
                        </div>

                        {/* Status badge & action button */}
                        <div className="flex items-center gap-2">
                          {item.status === 'success' && (
                            <span className="flex items-center gap-1 text-[12px] font-medium text-[#111827] dark:text-[#FAFAFA] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] px-2.5 py-1 rounded-[6px]">
                              <CheckCircle2 size={14} /> Ready
                            </span>
                          )}
                          {item.status === 'error' && (
                            <button
                              onClick={() => retryItem(item)}
                              className="flex items-center gap-1 text-[12px] font-medium text-[#DC2626] border border-[#DC2626] px-2.5 py-1 rounded-[6px] hover:bg-[#F9FAFB] dark:hover:bg-[#232323] transition cursor-pointer"
                            >
                              <RotateCcw size={14} /> Retry
                            </button>
                          )}
                          {(item.status === 'uploading' ||
                            item.status === 'parsing' ||
                            item.status === 'vectorizing') && (
                            <span className="flex items-center gap-1.5 text-[12px] font-medium text-[#111827] dark:text-[#FAFAFA] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] px-2.5 py-1 rounded-[6px]">
                              <Loader2 size={14} className="animate-spin" />
                              {item.status === 'uploading' && 'Uploading...'}
                              {item.status === 'parsing' && 'Extracting text...'}
                              {item.status === 'vectorizing' && 'Generating AI index...'}
                            </span>
                          )}
                          <button
                            onClick={() => removeItem(item.id)}
                            className="p-1 rounded-[6px] text-[#6B7280] hover:text-[#DC2626] transition cursor-pointer"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Progress bar */}
                      {item.status !== 'error' && (
                        <div className="w-full bg-[#E5E7EB] dark:bg-[#2A2A2A] h-1.5 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${item.progress}%` }}
                            className="h-full bg-[#111827] dark:bg-[#FAFAFA]"
                          />
                        </div>
                      )}
                      {item.errorMessage && (
                        <p className="text-[12px] text-[#DC2626] font-medium flex items-center gap-1">
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
          <div className="flex items-center justify-between px-6 py-4 border-t border-[#F3F4F6] dark:border-[#2A2A2A] bg-[#FFFFFF] dark:bg-[#181818] shrink-0">
            <span className="text-[12px] text-[#6B7280] dark:text-[#A3A3A3] flex items-center gap-1">
              <Sparkles size={14} /> Vector search enabled automatically
            </span>
            <button
              onClick={onClose}
              className="h-10 px-6 rounded-[10px] bg-[#111827] hover:bg-[#000000] dark:bg-[#FAFAFA] dark:hover:bg-[#E5E7EB] text-[#FFFFFF] dark:text-[#111111] font-medium text-[14px] shadow-xs transition cursor-pointer"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
