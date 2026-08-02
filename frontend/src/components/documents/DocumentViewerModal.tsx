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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-5xl h-[88vh] overflow-hidden rounded-2xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] shadow-2xl flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#0F172A]/50 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2.5 rounded-xl bg-[#0E2A6D] text-[#D9A441] shrink-0">
                <FileText size={22} />
              </div>
              <div className="min-w-0">
                <h2 className="font-heading text-base md:text-lg font-bold text-[#0E2A6D] dark:text-[#F8FAFC] truncate">
                  {document.original_name}
                </h2>
                <div className="flex items-center gap-3 text-xs text-[#64748B] dark:text-[#94A3B8]">
                  <span>{(document.file_size / (1024 * 1024)).toFixed(2)} MB</span>
                  <span>•</span>
                  <span>Folder: {document.folder_name || 'General'}</span>
                  <span>•</span>
                  <span className="uppercase text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#1E4DB7]/10 text-[#1E4DB7] dark:text-[#60A5FA]">
                    {document.file_type}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions in Header */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => onOpenChat(document)}
                className="px-3.5 py-2 rounded-xl bg-[#0E2A6D] hover:bg-[#153B8A] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
              >
                <MessageSquare size={16} />
                <span className="hidden sm:inline">Ask AI</span>
              </button>
              <button
                onClick={() => onReadAloud(document.summary || document.extracted_text || document.original_name)}
                className="p-2 rounded-xl text-[#0E2A6D] dark:text-[#60A5FA] bg-[#0E2A6D]/10 dark:bg-[#60A5FA]/10 hover:bg-[#0E2A6D]/20 transition"
                title="Read Aloud"
              >
                <Volume2 size={18} />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-[#64748B] hover:text-[#1F2937] dark:hover:text-[#F8FAFC] hover:bg-[#F5F7FB] dark:hover:bg-[#334155] transition"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 px-6 py-2 border-b border-[#E2E8F0] dark:border-[#334155] bg-[#F1F5F9]/50 dark:bg-[#0F172A]/30 shrink-0">
            <button
              onClick={() => setActiveTab('view')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
                activeTab === 'view'
                  ? 'bg-white dark:bg-[#1E293B] text-[#1E4DB7] dark:text-[#60A5FA] shadow-xs border border-[#E2E8F0] dark:border-[#334155]'
                  : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#1F2937] dark:hover:text-[#F8FAFC]'
              }`}
            >
              <Eye size={15} /> Document Viewer
            </button>
            <button
              onClick={() => setActiveTab('summary')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
                activeTab === 'summary'
                  ? 'bg-white dark:bg-[#1E293B] text-[#1E4DB7] dark:text-[#60A5FA] shadow-xs border border-[#E2E8F0] dark:border-[#334155]'
                  : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#1F2937] dark:hover:text-[#F8FAFC]'
              }`}
            >
              <Sparkles size={15} className="text-[#D9A441]" /> AI Summary & Insights
            </button>
            <button
              onClick={() => setActiveTab('extracted')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
                activeTab === 'extracted'
                  ? 'bg-white dark:bg-[#1E293B] text-[#1E4DB7] dark:text-[#60A5FA] shadow-xs border border-[#E2E8F0] dark:border-[#334155]'
                  : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#1F2937] dark:hover:text-[#F8FAFC]'
              }`}
            >
              <FileText size={15} /> Extracted Text
            </button>
          </div>

          {/* Main Body */}
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-[#F8FAFC] dark:bg-[#0F172A]/40">
            {activeTab === 'view' && (
              <div className="h-full flex flex-col justify-center items-center">
                {isImage ? (
                  <div className="max-h-full flex items-center justify-center p-4">
                    <img
                      src={`/uploads/${document.filename}`}
                      alt={document.original_name}
                      className="max-h-[65vh] max-w-full rounded-xl shadow-lg border border-[#E2E8F0] dark:border-[#334155] object-contain"
                      onError={(e) => {
                        // Fallback image display if mock
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>
                ) : isPdf ? (
                  <div className="w-full h-full rounded-xl overflow-hidden border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#1E293B]">
                    <iframe
                      src={`/uploads/${document.filename}`}
                      title={document.original_name}
                      className="w-full h-full min-h-[500px]"
                    />
                  </div>
                ) : (
                  <div className="w-full h-full p-6 bg-white dark:bg-[#1E293B] rounded-xl border border-[#E2E8F0] dark:border-[#334155] font-mono text-xs md:text-sm text-[#1F2937] dark:text-[#F8FAFC] whitespace-pre-wrap overflow-y-auto">
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
                  <div className="p-4 rounded-xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] flex items-center gap-3">
                    <Clock size={20} className="text-[#1E4DB7] dark:text-[#60A5FA]" />
                    <div>
                      <p className="text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8]">Est. Reading</p>
                      <p className="text-sm font-bold text-[#1F2937] dark:text-[#F8FAFC]">
                        {document.estimated_reading_time || 5} min
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] flex items-center gap-3">
                    <Layers size={20} className="text-[#D9A441]" />
                    <div>
                      <p className="text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8]">Vector Chunks</p>
                      <p className="text-sm font-bold text-[#1F2937] dark:text-[#F8FAFC]">
                        {document.chunk_count || 12} Chunks
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] flex items-center gap-3">
                    <BookOpen size={20} className="text-emerald-500" />
                    <div>
                      <p className="text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8]">Difficulty</p>
                      <p className="text-sm font-bold text-[#1F2937] dark:text-[#F8FAFC]">
                        {document.difficulty || 'Intermediate'}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] flex items-center gap-3">
                    <Sparkles size={20} className="text-purple-500" />
                    <div>
                      <p className="text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8]">RAG Status</p>
                      <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">Indexed</p>
                    </div>
                  </div>
                </div>

                {/* Summary Card */}
                <div className="p-6 rounded-2xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] space-y-4 shadow-sm">
                  <h3 className="font-heading text-lg font-bold text-[#0E2A6D] dark:text-[#F8FAFC] flex items-center gap-2">
                    <Sparkles size={20} className="text-[#D9A441]" />
                    AI Executive Overview
                  </h3>
                  <p className="text-sm leading-relaxed text-[#334155] dark:text-[#CBD5E1]">
                    {document.summary ||
                      `Auto-generated overview for ${document.original_name}. Covers core theoretical frameworks, essential equations, real-world engineering trade-offs, and critical exam questions.`}
                  </p>

                  {/* Keywords */}
                  {document.keywords && document.keywords.length > 0 && (
                    <div className="pt-4 border-t border-[#E2E8F0] dark:border-[#334155] space-y-2">
                      <p className="text-xs font-semibold text-[#64748B] dark:text-[#94A3B8] flex items-center gap-1.5">
                        <Tag size={14} /> Key Concepts & Tags
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {document.keywords.map((kw, i) => (
                          <span
                            key={i}
                            className="text-xs font-medium px-3 py-1 rounded-full bg-[#1E4DB7]/10 text-[#1E4DB7] dark:text-[#60A5FA]"
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
                  <p className="text-xs font-semibold uppercase text-[#64748B] dark:text-[#94A3B8]">
                    Raw Extracted Text Snippets
                  </p>
                  <button
                    onClick={handleCopyText}
                    className="px-3 py-1.5 rounded-lg border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#1E293B] text-xs font-bold text-[#0E2A6D] dark:text-[#60A5FA] flex items-center gap-1.5 shadow-xs transition"
                  >
                    {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                    {copied ? 'Copied!' : 'Copy Text'}
                  </button>
                </div>
                <div className="p-6 rounded-2xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-xs md:text-sm font-mono text-[#334155] dark:text-[#CBD5E1] leading-relaxed whitespace-pre-wrap">
                  {document.extracted_text ||
                    `Sample Extracted Text from ${document.original_name}:\n\nSection 1.1 - Overview\nComputer science fundamentals dictate modular software design and state synchronization...\n\nSection 2.4 - Algorithm Breakdown\n1. Initialize semaphore s = 1\n2. Wait(s) locks resource\n3. Signal(s) releases critical region.`}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#0F172A]/50 shrink-0">
            <button
              onClick={() => onOpenChat(document)}
              className="px-5 py-2.5 rounded-xl bg-[#0E2A6D] hover:bg-[#153B8A] text-white font-semibold text-sm flex items-center gap-2 shadow-md transition"
            >
              <MessageSquare size={18} /> Chat with this Document
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#334155] text-sm font-semibold text-[#475569] dark:text-[#CBD5E1] hover:bg-[#E2E8F0]/50 transition"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
