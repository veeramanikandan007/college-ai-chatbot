import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Download,
  Volume2,
  MessageSquare,
  FileText,
  Sparkles,
  Eye,
  Maximize2,
  Copy,
  Check,
  Tag,
  Clock,
  Layers,
  BookOpen,
} from 'lucide-react';

export interface DocumentItem {
  id: number;
  filename: string;
  original_name: string;
  file_type: string;
  file_size: number;
  uploaded_by?: number;
  folder_name?: string;
  category?: string;
  is_pinned?: boolean;
  is_favorite?: boolean;
  is_indexed?: boolean;
  chunk_count?: number;
  summary?: string;
  keywords?: string[];
  topics?: string[];
  estimated_reading_time?: number;
  difficulty?: string;
  extracted_text?: string;
  created_at?: string;
}

interface DocumentViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: DocumentItem | null;
  onOpenChat: (doc: DocumentItem) => void;
  onReadAloud: (text: string) => void;
}

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({
  isOpen,
  onClose,
  document,
  onOpenChat,
  onReadAloud,
}) => {
  const [activeTab, setActiveTab] = useState<'view' | 'summary' | 'extracted'>('view');
  const [copied, setCopied] = useState(false);

  if (!isOpen || !document) return null;

  const handleCopyText = () => {
    const textToCopy = document.extracted_text || document.summary || '';
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isImage = ['jpeg', 'jpg', 'png', 'webp', 'gif'].includes(document.file_type.toLowerCase());
  const isPdf = document.file_type.toLowerCase() === 'pdf';
  const isMarkdown = ['md', 'markdown'].includes(document.file_type.toLowerCase());

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-5xl h-[92vh] sm:h-[88vh] overflow-hidden rounded-[16px] bg-[#FFFFFF] dark:bg-[#18181B] border border-[#D1D5DB] dark:border-[#3F3F46] shadow-lg flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-3.5 sm:px-6 sm:py-4 border-b border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#18181B] shrink-0 gap-2">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
              <div className="w-[36px] h-[36px] sm:w-[40px] sm:h-[40px] rounded-[10px] bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] flex items-center justify-center shrink-0">
                <FileText size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-[15px] sm:text-[18px] font-[700] text-[#111827] dark:text-[#FAFAFA] truncate">
                  {document.original_name}
                </h2>
                <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-[12px] font-[500] text-[#6B7280] dark:text-[#A1A1AA] truncate">
                  <span>{(document.file_size / (1024 * 1024)).toFixed(2)} MB</span>
                  <span>•</span>
                  <span className="truncate">Folder: {document.folder_name || 'General'}</span>
                  <span className="hidden sm:inline">•</span>
                  <span className="hidden sm:inline-block uppercase text-[10px] font-[700] px-2 py-0.5 rounded-[6px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#D1D5DB] dark:border-[#3F3F46] text-[#111827] dark:text-[#FAFAFA]">
                    {document.file_type}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions in Header */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <button
                onClick={() => onOpenChat(document)}
                className="h-[34px] sm:h-[38px] px-2.5 sm:px-4 rounded-[10px] bg-[#111827] hover:bg-[#1F2937] active:bg-[#0F172A] dark:bg-[#FAFAFA] dark:hover:bg-[#F3F4F6] text-[#FFFFFF] dark:text-[#111111] text-[12px] sm:text-[14px] font-[500] flex items-center gap-1.5 transition cursor-pointer active:scale-[0.98]"
              >
                <MessageSquare size={15} />
                <span className="hidden sm:inline">Ask AI</span>
              </button>
              <button
                onClick={() => onReadAloud(document.summary || document.extracted_text || document.original_name)}
                className="p-2 rounded-[8px] border border-[#D1D5DB] dark:border-[#3F3F46] text-[#111827] dark:text-[#FAFAFA] hover:bg-[#F8FAFC] dark:hover:bg-[#232323] transition cursor-pointer"
                title="Read Aloud"
              >
                <Volume2 size={16} />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-[8px] text-[#6B7280] dark:text-[#A1A1AA] hover:text-[#111827] dark:hover:text-[#FAFAFA] transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Navigation Tabs (Single-Row Horizontal Scroll) */}
          <div className="p-2 border-b border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#18181B] shrink-0">
            <div className="flex items-center gap-2 bg-[#F8FAFC] dark:bg-[#111111] p-1 rounded-[12px] border border-[#D1D5DB] dark:border-[#3F3F46] min-h-[44px] max-w-full overflow-x-auto no-scrollbar">
              <button
                onClick={() => setActiveTab('view')}
                className={`h-[36px] px-3.5 rounded-[8px] text-[14px] font-[500] flex items-center justify-center gap-1.5 transition cursor-pointer whitespace-nowrap shrink-0 active:scale-[0.98] ${
                  activeTab === 'view'
                    ? 'bg-[#111827] text-[#FFFFFF] dark:bg-[#FAFAFA] dark:text-[#111111]'
                    : 'text-[#6B7280] dark:text-[#A1A1AA] hover:bg-[#FFFFFF] dark:hover:bg-[#18181B]'
                }`}
              >
                <Eye size={15} /> <span>Document Viewer</span>
              </button>
              <button
                onClick={() => setActiveTab('summary')}
                className={`h-[36px] px-3.5 rounded-[8px] text-[14px] font-[500] flex items-center justify-center gap-1.5 transition cursor-pointer whitespace-nowrap shrink-0 active:scale-[0.98] ${
                  activeTab === 'summary'
                    ? 'bg-[#111827] text-[#FFFFFF] dark:bg-[#FAFAFA] dark:text-[#111111]'
                    : 'text-[#6B7280] dark:text-[#A1A1AA] hover:bg-[#FFFFFF] dark:hover:bg-[#18181B]'
                }`}
              >
                <Sparkles size={15} /> <span>AI Summary & Insights</span>
              </button>
              <button
                onClick={() => setActiveTab('extracted')}
                className={`h-[36px] px-3.5 rounded-[8px] text-[14px] font-[500] flex items-center justify-center gap-1.5 transition cursor-pointer whitespace-nowrap shrink-0 active:scale-[0.98] ${
                  activeTab === 'extracted'
                    ? 'bg-[#111827] text-[#FFFFFF] dark:bg-[#FAFAFA] dark:text-[#111111]'
                    : 'text-[#6B7280] dark:text-[#A1A1AA] hover:bg-[#FFFFFF] dark:hover:bg-[#18181B]'
                }`}
              >
                <FileText size={15} /> <span>Extracted Text</span>
              </button>
            </div>
          </div>

          {/* Main Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#FFFFFF] dark:bg-[#18181B]">
            {activeTab === 'view' && (
              <div className="h-full flex flex-col justify-center items-center">
                {isImage ? (
                  <div className="max-h-full flex items-center justify-center p-2">
                    <img
                      src={`/uploads/${document.filename}`}
                      alt={document.original_name}
                      className="max-h-[60vh] max-w-full rounded-[12px] shadow-md border border-[#D1D5DB] dark:border-[#3F3F46] object-contain"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>
                ) : isPdf ? (
                  <div className="w-full h-full rounded-[12px] overflow-hidden border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#18181B]">
                    <iframe
                      src={`/uploads/${document.filename}`}
                      title={document.original_name}
                      className="w-full h-full min-h-[400px]"
                    />
                  </div>
                ) : (
                  <div className="w-full h-full p-4 sm:p-6 bg-[#F8FAFC] dark:bg-[#111111] rounded-[12px] border border-[#D1D5DB] dark:border-[#3F3F46] text-[13px] sm:text-[14px] font-sans text-[#111827] dark:text-[#FAFAFA] whitespace-pre-wrap overflow-y-auto">
                    {document.extracted_text ||
                      `Content of ${document.original_name}:\n\nUnit 1: Overview & Core Principles\nThis study guide contains foundational definitions, diagrams, solved examples, and practice questions for semester examination preparation.`}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'summary' && (
              <div className="space-y-4 sm:space-y-6 max-w-3xl mx-auto">
                {/* Meta Bar */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-[12px] bg-[#FFFFFF] dark:bg-[#18181B] border border-[#D1D5DB] dark:border-[#3F3F46] flex items-center gap-3">
                    <Clock size={18} className="text-[#111827] dark:text-[#FAFAFA]" />
                    <div>
                      <p className="text-[11px] font-[500] text-[#6B7280] dark:text-[#A1A1AA]">Est. Reading</p>
                      <p className="text-[14px] font-[500] text-[#111827] dark:text-[#FAFAFA]">
                        {document.estimated_reading_time || 5} min
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-[12px] bg-[#FFFFFF] dark:bg-[#18181B] border border-[#D1D5DB] dark:border-[#3F3F46] flex items-center gap-3">
                    <Layers size={18} className="text-[#111827] dark:text-[#FAFAFA]" />
                    <div>
                      <p className="text-[11px] font-[500] text-[#6B7280] dark:text-[#A1A1AA]">Vector Chunks</p>
                      <p className="text-[14px] font-[500] text-[#111827] dark:text-[#FAFAFA]">
                        {document.chunk_count || 12} Chunks
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-[12px] bg-[#FFFFFF] dark:bg-[#18181B] border border-[#D1D5DB] dark:border-[#3F3F46] flex items-center gap-3">
                    <BookOpen size={18} className="text-[#111827] dark:text-[#FAFAFA]" />
                    <div>
                      <p className="text-[11px] font-[500] text-[#6B7280] dark:text-[#A1A1AA]">Difficulty</p>
                      <p className="text-[14px] font-[500] text-[#111827] dark:text-[#FAFAFA]">
                        {document.difficulty || 'Intermediate'}
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-[12px] bg-[#FFFFFF] dark:bg-[#18181B] border border-[#D1D5DB] dark:border-[#3F3F46] flex items-center gap-3">
                    <Sparkles size={18} className="text-[#111827] dark:text-[#FAFAFA]" />
                    <div>
                      <p className="text-[11px] font-[500] text-[#6B7280] dark:text-[#A1A1AA]">RAG Status</p>
                      <p className="text-[14px] font-[500] text-[#111827] dark:text-[#FAFAFA]">Indexed</p>
                    </div>
                  </div>
                </div>

                {/* Summary Card */}
                <div className="p-5 rounded-[16px] bg-[#FFFFFF] dark:bg-[#18181B] border border-[#D1D5DB] dark:border-[#3F3F46] space-y-3 shadow-xs">
                  <h3 className="text-[16px] sm:text-[17px] font-[600] text-[#111827] dark:text-[#FAFAFA] flex items-center gap-2">
                    <Sparkles size={18} />
                    <span>AI Executive Overview</span>
                  </h3>
                  <p className="text-[13px] sm:text-[14px] leading-relaxed font-[500] text-[#6B7280] dark:text-[#A1A1AA]">
                    {document.summary ||
                      `Auto-generated overview for ${document.original_name}. Covers core theoretical frameworks, essential equations, real-world engineering trade-offs, and critical exam questions.`}
                  </p>

                  {/* Keywords */}
                  {document.keywords && document.keywords.length > 0 && (
                    <div className="pt-3 border-t border-[#D1D5DB] dark:border-[#3F3F46] space-y-2">
                      <p className="text-[12px] font-[600] text-[#6B7280] dark:text-[#A1A1AA] flex items-center gap-1.5">
                        <Tag size={14} /> Key Concepts & Tags
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {document.keywords.map((kw, i) => (
                          <span
                            key={i}
                            className="text-[12px] font-[400] px-2.5 py-0.5 rounded-[6px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#D1D5DB] dark:border-[#3F3F46] text-[#111827] dark:text-[#FAFAFA]"
                          >
                            #{kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'extracted' && (
              <div className="max-w-4xl mx-auto space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-[12px] font-[400] uppercase text-[#6B7280] dark:text-[#A1A1AA]">
                    Raw Extracted Text Snippets
                  </p>
                  <button
                    onClick={handleCopyText}
                    className="h-[34px] px-3 rounded-[8px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#18181B] text-[12px] font-[400] text-[#111827] dark:text-[#FAFAFA] flex items-center gap-1.5 transition cursor-pointer active:scale-[0.98]"
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    {copied ? 'Copied!' : 'Copy Text'}
                  </button>
                </div>
                <div className="p-4 sm:p-6 rounded-[16px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#D1D5DB] dark:border-[#3F3F46] text-[13px] sm:text-[14px] font-sans text-[#111827] dark:text-[#FAFAFA] leading-relaxed whitespace-pre-wrap">
                  {document.extracted_text ||
                    `Sample Extracted Text from ${document.original_name}:\n\nSection 1.1 - Overview\nComputer science fundamentals dictate modular software design and state synchronization...\n\nSection 2.4 - Algorithm Breakdown\n1. Initialize semaphore s = 1\n2. Wait(s) locks resource\n3. Signal(s) releases critical region.`}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between p-3.5 sm:px-6 sm:py-4 border-t border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#18181B] shrink-0 gap-2">
            <button
              onClick={() => onOpenChat(document)}
              className="h-[38px] sm:h-[40px] px-5 rounded-[12px] bg-[#111827] hover:bg-[#1F2937] active:bg-[#0F172A] dark:bg-[#FAFAFA] dark:hover:bg-[#F3F4F6] text-[#FFFFFF] dark:text-[#111111] text-[14px] font-[500] flex items-center justify-center gap-2 transition cursor-pointer shrink-0 active:scale-[0.98] w-full sm:w-auto"
            >
              <MessageSquare size={16} /> Chat with this Document
            </button>
            <button
              onClick={onClose}
              className="h-[38px] sm:h-[40px] px-5 rounded-[12px] border border-[#D1D5DB] dark:border-[#3F3F46] text-[13px] sm:text-[14px] font-[500] text-[#111827] dark:text-[#FAFAFA] hover:bg-[#F8FAFC] dark:hover:bg-[#232323] transition cursor-pointer w-full sm:w-auto"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
