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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-5xl h-[88vh] overflow-hidden rounded-[12px] bg-[#FFFFFF] dark:bg-[#181818] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-lg flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#F3F4F6] dark:border-[#2A2A2A] bg-[#FFFFFF] dark:bg-[#181818] shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-[10px] bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] flex items-center justify-center shrink-0">
                <FileText size={20} />
              </div>
              <div className="min-w-0">
                <h2 className="text-[18px] font-bold text-[#111827] dark:text-[#FAFAFA] truncate">
                  {document.original_name}
                </h2>
                <div className="flex items-center gap-3 text-[12px] text-[#6B7280] dark:text-[#A3A3A3]">
                  <span>{(document.file_size / (1024 * 1024)).toFixed(2)} MB</span>
                  <span>•</span>
                  <span>Folder: {document.folder_name || 'General'}</span>
                  <span>•</span>
                  <span className="uppercase text-[10px] font-semibold px-2 py-0.5 rounded-[6px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA]">
                    {document.file_type}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions in Header */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => onOpenChat(document)}
                className="h-9 px-4 rounded-[10px] bg-[#111827] hover:bg-[#000000] dark:bg-[#FAFAFA] dark:hover:bg-[#E5E7EB] text-[#FFFFFF] dark:text-[#111111] text-[14px] font-medium flex items-center gap-1.5 shadow-xs transition cursor-pointer"
              >
                <MessageSquare size={16} />
                <span className="hidden sm:inline">Ask AI</span>
              </button>
              <button
                onClick={() => onReadAloud(document.summary || document.extracted_text || document.original_name)}
                className="p-2 rounded-[8px] border border-[#D1D5DB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA] hover:bg-[#F9FAFB] dark:hover:bg-[#232323] transition cursor-pointer"
                title="Read Aloud"
              >
                <Volume2 size={18} />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-[8px] text-[#6B7280] hover:text-[#111827] dark:hover:text-[#FAFAFA] transition cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 px-6 py-2 border-b border-[#F3F4F6] dark:border-[#2A2A2A] bg-[#F8FAFC] dark:bg-[#111111] shrink-0">
            <button
              onClick={() => setActiveTab('view')}
              className={`h-9 px-4 rounded-[10px] text-[14px] font-medium flex items-center gap-2 transition-all duration-150 cursor-pointer ${
                activeTab === 'view'
                  ? 'bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111]'
                  : 'bg-[#FFFFFF] dark:bg-[#181818] text-[#4B5563] dark:text-[#A3A3A3] hover:bg-[#F9FAFB] dark:hover:bg-[#232323]'
              }`}
            >
              <Eye size={15} /> Document Viewer
            </button>
            <button
              onClick={() => setActiveTab('summary')}
              className={`h-9 px-4 rounded-[10px] text-[14px] font-medium flex items-center gap-2 transition-all duration-150 cursor-pointer ${
                activeTab === 'summary'
                  ? 'bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111]'
                  : 'bg-[#FFFFFF] dark:bg-[#181818] text-[#4B5563] dark:text-[#A3A3A3] hover:bg-[#F9FAFB] dark:hover:bg-[#232323]'
              }`}
            >
              <Sparkles size={15} /> AI Summary & Insights
            </button>
            <button
              onClick={() => setActiveTab('extracted')}
              className={`h-9 px-4 rounded-[10px] text-[14px] font-medium flex items-center gap-2 transition-all duration-150 cursor-pointer ${
                activeTab === 'extracted'
                  ? 'bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111]'
                  : 'bg-[#FFFFFF] dark:bg-[#181818] text-[#4B5563] dark:text-[#A3A3A3] hover:bg-[#F9FAFB] dark:hover:bg-[#232323]'
              }`}
            >
              <FileText size={15} /> Extracted Text
            </button>
          </div>

          {/* Main Body */}
          <div className="flex-1 overflow-y-auto p-6 bg-[#FFFFFF] dark:bg-[#181818]">
            {activeTab === 'view' && (
              <div className="h-full flex flex-col justify-center items-center">
                {isImage ? (
                  <div className="max-h-full flex items-center justify-center p-4">
                    <img
                      src={`/uploads/${document.filename}`}
                      alt={document.original_name}
                      className="max-h-[65vh] max-w-full rounded-[12px] shadow-md border border-[#E5E7EB] dark:border-[#2A2A2A] object-contain"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>
                ) : isPdf ? (
                  <div className="w-full h-full rounded-[12px] overflow-hidden border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#FFFFFF] dark:bg-[#181818]">
                    <iframe
                      src={`/uploads/${document.filename}`}
                      title={document.original_name}
                      className="w-full h-full min-h-[500px]"
                    />
                  </div>
                ) : (
                  <div className="w-full h-full p-6 bg-[#FFFFFF] dark:bg-[#181818] rounded-[12px] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[14px] text-[#111827] dark:text-[#FAFAFA] whitespace-pre-wrap overflow-y-auto">
                    {document.extracted_text ||
                      `Content of ${document.original_name}:\n\nUnit 1: Overview & Core Principles\nThis study guide contains foundational definitions, diagrams, solved examples, and practice questions for semester examination preparation.`}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'summary' && (
              <div className="space-y-6 max-w-3xl mx-auto">
                {/* Meta Bar */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-[12px] bg-[#FFFFFF] dark:bg-[#181818] border border-[#E5E7EB] dark:border-[#2A2A2A] flex items-center gap-3">
                    <Clock size={20} className="text-[#111827] dark:text-[#FAFAFA]" />
                    <div>
                      <p className="text-[12px] font-medium text-[#6B7280] dark:text-[#A3A3A3]">Est. Reading</p>
                      <p className="text-[16px] font-bold text-[#111827] dark:text-[#FAFAFA]">
                        {document.estimated_reading_time || 5} min
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-[12px] bg-[#FFFFFF] dark:bg-[#181818] border border-[#E5E7EB] dark:border-[#2A2A2A] flex items-center gap-3">
                    <Layers size={20} className="text-[#111827] dark:text-[#FAFAFA]" />
                    <div>
                      <p className="text-[12px] font-medium text-[#6B7280] dark:text-[#A3A3A3]">Vector Chunks</p>
                      <p className="text-[16px] font-bold text-[#111827] dark:text-[#FAFAFA]">
                        {document.chunk_count || 12} Chunks
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-[12px] bg-[#FFFFFF] dark:bg-[#181818] border border-[#E5E7EB] dark:border-[#2A2A2A] flex items-center gap-3">
                    <BookOpen size={20} className="text-[#111827] dark:text-[#FAFAFA]" />
                    <div>
                      <p className="text-[12px] font-medium text-[#6B7280] dark:text-[#A3A3A3]">Difficulty</p>
                      <p className="text-[16px] font-bold text-[#111827] dark:text-[#FAFAFA]">
                        {document.difficulty || 'Intermediate'}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-[12px] bg-[#FFFFFF] dark:bg-[#181818] border border-[#E5E7EB] dark:border-[#2A2A2A] flex items-center gap-3">
                    <Sparkles size={20} className="text-[#111827] dark:text-[#FAFAFA]" />
                    <div>
                      <p className="text-[12px] font-medium text-[#6B7280] dark:text-[#A3A3A3]">RAG Status</p>
                      <p className="text-[16px] font-bold text-[#111827] dark:text-[#FAFAFA]">Indexed</p>
                    </div>
                  </div>
                </div>

                {/* Summary Card */}
                <div className="p-6 rounded-[12px] bg-[#FFFFFF] dark:bg-[#181818] border border-[#E5E7EB] dark:border-[#2A2A2A] space-y-4 shadow-xs">
                  <h3 className="text-[18px] font-bold text-[#111827] dark:text-[#FAFAFA] flex items-center gap-2">
                    <Sparkles size={20} />
                    <span>AI Executive Overview</span>
                  </h3>
                  <p className="text-[14px] leading-relaxed text-[#4B5563] dark:text-[#D4D4D4]">
                    {document.summary ||
                      `Auto-generated overview for ${document.original_name}. Covers core theoretical frameworks, essential equations, real-world engineering trade-offs, and critical exam questions.`}
                  </p>

                  {/* Keywords */}
                  {document.keywords && document.keywords.length > 0 && (
                    <div className="pt-4 border-t border-[#F3F4F6] dark:border-[#2A2A2A] space-y-2">
                      <p className="text-[12px] font-medium text-[#6B7280] dark:text-[#A3A3A3] flex items-center gap-1.5">
                        <Tag size={14} /> Key Concepts & Tags
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {document.keywords.map((kw, i) => (
                          <span
                            key={i}
                            className="text-[12px] font-medium px-3 py-1 rounded-[6px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA]"
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
              <div className="max-w-4xl mx-auto space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-[12px] font-semibold uppercase text-[#6B7280] dark:text-[#A3A3A3]">
                    Raw Extracted Text Snippets
                  </p>
                  <button
                    onClick={handleCopyText}
                    className="h-8 px-3 rounded-[8px] border border-[#D1D5DB] dark:border-[#2A2A2A] bg-[#FFFFFF] dark:bg-[#181818] text-[12px] font-medium text-[#111827] dark:text-[#FAFAFA] flex items-center gap-1.5 transition cursor-pointer"
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    {copied ? 'Copied!' : 'Copy Text'}
                  </button>
                </div>
                <div className="p-6 rounded-[12px] bg-[#FFFFFF] dark:bg-[#181818] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[14px] text-[#4B5563] dark:text-[#D4D4D4] leading-relaxed whitespace-pre-wrap">
                  {document.extracted_text ||
                    `Sample Extracted Text from ${document.original_name}:\n\nSection 1.1 - Overview\nComputer science fundamentals dictate modular software design and state synchronization...\n\nSection 2.4 - Algorithm Breakdown\n1. Initialize semaphore s = 1\n2. Wait(s) locks resource\n3. Signal(s) releases critical region.`}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-[#F3F4F6] dark:border-[#2A2A2A] bg-[#FFFFFF] dark:bg-[#181818] shrink-0">
            <button
              onClick={() => onOpenChat(document)}
              className="h-10 px-5 rounded-[10px] bg-[#111827] hover:bg-[#000000] dark:bg-[#FAFAFA] dark:hover:bg-[#E5E7EB] text-[#FFFFFF] dark:text-[#111111] font-medium text-[14px] flex items-center gap-2 shadow-xs transition cursor-pointer"
            >
              <MessageSquare size={18} /> Chat with this Document
            </button>
            <button
              onClick={onClose}
              className="h-10 px-5 rounded-[10px] border border-[#D1D5DB] dark:border-[#2A2A2A] text-[14px] font-medium text-[#111827] dark:text-[#FAFAFA] hover:bg-[#F9FAFB] dark:hover:bg-[#232323] transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
