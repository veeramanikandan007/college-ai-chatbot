import React, { useState, useEffect, useMemo } from 'react';
import { fetchApi } from '../../lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  UploadCloud,
  FolderPlus,
  Search,
  Grid,
  List,
  Pin,
  Star,
  Clock,
  Folder,
  FileText,
  Sparkles,
  Volume2,
  MoreVertical,
  Trash2,
  Eye,
  MessageSquare,
  Share2,
  Layers,
  HelpCircle,
  Brain,
  File,
  Image as ImageIcon,
  Archive,
  Download,
  Tag,
  SlidersHorizontal,
} from 'lucide-react';

import { DocumentUploadModal } from '../../components/documents/DocumentUploadModal';
import { FolderManagerModal } from '../../components/documents/FolderManagerModal';
import { DocumentViewerModal, DocumentItem } from '../../components/documents/DocumentViewerModal';
import { DocumentChatModal } from '../../components/documents/DocumentChatModal';
import { DocumentAIActionModal, AIActionType } from '../../components/documents/DocumentAIActionModal';

type CategoryFilter = 'all' | 'recent' | 'pinned' | 'favorites' | 'shared' | string;

export default function DocumentHubPage() {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [folders, setFolders] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'size' | 'subject'>('date');
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isFolderOpen, setIsFolderOpen] = useState(false);
  const [viewingDoc, setViewingDoc] = useState<DocumentItem | null>(null);
  const [chattingDoc, setChattingDoc] = useState<DocumentItem | null>(null);
  const [aiActionDoc, setAiActionDoc] = useState<DocumentItem | null>(null);
  const [initialAIAction, setInitialAIAction] = useState<AIActionType>('summarize');

  // Load documents and folders from backend
  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const data = await fetchApi('/documents');
      setDocuments(data.documents || []);
    } catch (err) {
      console.error('Failed to load documents', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFolders = async () => {
    try {
      const data = await fetchApi('/documents/folders');
      setFolders(data.folders || []);
    } catch (err) {
      console.error('Failed to load folders', err);
    }
  };

  useEffect(() => {
    fetchDocuments();
    fetchFolders();
  }, []);

  const handleCreateFolder = async (folderName: string) => {
    try {
      await fetchApi('/documents/folders', {
        method: 'POST',
        body: JSON.stringify({ name: folderName }),
      });
      await fetchFolders();
    } catch (err) {
      throw new Error('Failed to create folder');
    }
  };

  const handleTogglePin = async (docId: number) => {
    setDocuments((prev) =>
      prev.map((d) => (d.id === docId ? { ...d, is_pinned: !d.is_pinned } : d))
    );
    await fetchApi(`/documents/${docId}/pin`, { method: 'PUT' }).catch(() => {});
  };

  const handleToggleFavorite = async (docId: number) => {
    setDocuments((prev) =>
      prev.map((d) => (d.id === docId ? { ...d, is_favorite: !d.is_favorite } : d))
    );
    await fetchApi(`/documents/${docId}/favorite`, { method: 'PUT' }).catch(() => {});
  };

  const handleDeleteDoc = async (docId: number) => {
    setDocuments((prev) => prev.filter((d) => d.id !== docId));
    await fetchApi(`/documents/${docId}`, { method: 'DELETE' }).catch(() => {});
  };

  const handleReadAloud = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Filtering & Sorting logic
  const filteredDocuments = useMemo(() => {
    let list = [...documents];

    // Category filter
    if (activeCategory === 'recent') {
      list = list.slice(0, 5);
    } else if (activeCategory === 'pinned') {
      list = list.filter((d) => d.is_pinned);
    } else if (activeCategory === 'favorites') {
      list = list.filter((d) => d.is_favorite);
    } else if (activeCategory === 'shared') {
      list = list.filter((d) => d.folder_name === 'Projects' || d.folder_name === 'General');
    } else if (activeCategory !== 'all') {
      list = list.filter(
        (d) => (d.folder_name || '').toLowerCase() === activeCategory.toLowerCase()
      );
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (d) =>
          d.original_name.toLowerCase().includes(q) ||
          (d.folder_name || '').toLowerCase().includes(q) ||
          (d.summary || '').toLowerCase().includes(q) ||
          (d.keywords || []).some((kw) => kw.toLowerCase().includes(q))
      );
    }

    // Sort
    list.sort((a, b) => {
      if (sortBy === 'name') return a.original_name.localeCompare(b.original_name);
      if (sortBy === 'size') return b.file_size - a.file_size;
      if (sortBy === 'subject') return (a.folder_name || '').localeCompare(b.folder_name || '');
      return (b.id || 0) - (a.id || 0); // Date descending
    });

    return list;
  }, [documents, activeCategory, searchQuery, sortBy]);

  const pinnedDocs = useMemo(() => documents.filter((d) => d.is_pinned), [documents]);

  const getFileBadgeColor = (_ext: string) => {
    return 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700';
  };

  const getFileIcon = (ext: string) => {
    const e = ext.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'webp'].includes(e)) return <ImageIcon size={20} className="text-zinc-700 dark:text-zinc-300" />;
    if (['zip', 'rar'].includes(e)) return <Archive size={20} className="text-zinc-700 dark:text-zinc-300" />;
    if (['docx', 'doc', 'pdf', 'ppt', 'pptx'].includes(e)) return <FileText size={20} className="text-zinc-700 dark:text-zinc-300" />;
    return <File size={20} className="text-zinc-700 dark:text-zinc-300" />;
  };

  return (
    <div className="w-full h-full overflow-x-hidden overflow-y-auto bg-[#F8FAFC] dark:bg-[#0A0A0A] text-[#111827] dark:text-[#FAFAFA] p-4 sm:p-6 lg:p-8 transition-colors select-none font-sans">
      {/* 1440px Centered Max Content Width Container */}
      <div className="w-full max-w-[1440px] mx-auto space-y-8">
        
        {/* Page Hero Header */}
        <div className="bg-[#FFFFFF] dark:bg-[#18181B] p-6 rounded-[16px] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-12 h-12 rounded-[12px] bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] flex items-center justify-center shrink-0">
              <Folder size={24} />
            </div>
            <div className="min-w-0 space-y-1">
              <h1 className="text-[30px] font-semibold text-[#111827] dark:text-[#FAFAFA] tracking-tight leading-tight truncate">
                AI Document Hub
              </h1>
              <p className="text-[15px] font-normal text-[#6B7280] dark:text-[#A1A1AA] truncate">
                Upload, organize, search, and chat with your study materials using CollegeMate AI.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-between sm:justify-end gap-3 shrink-0 w-full lg:w-auto">
            <button
              onClick={() => setIsFolderOpen(true)}
              className="h-[40px] px-4 rounded-[10px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#FFFFFF] dark:bg-[#18181B] text-[#111827] dark:text-[#FAFAFA] text-[14px] font-medium hover:bg-[#F8FAFC] dark:hover:bg-[#232323] transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
            >
              <FolderPlus size={16} />
              <span>New Folder</span>
            </button>

            <button
              onClick={() => setIsUploadOpen(true)}
              className="h-[40px] px-5 rounded-[10px] bg-[#111827] hover:bg-[#1F2937] dark:bg-[#FAFAFA] dark:hover:bg-[#E5E5E5] text-[#FFFFFF] dark:text-[#111111] text-[14px] font-medium transition flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              <UploadCloud size={16} />
              <span>Upload Document</span>
            </button>
          </div>
        </div>

        {/* Pinned Documents Section */}
        {pinnedDocs.length > 0 && activeCategory === 'all' && (
          <div className="space-y-3 select-none">
            <h3 className="text-[18px] font-[700] text-[#111827] dark:text-[#FAFAFA] flex items-center gap-2">
              <Pin size={18} />
              <span>Pinned Documents</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {pinnedDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="p-5 rounded-[16px] bg-[#FFFFFF] dark:bg-[#18181B] border border-[#D1D5DB] dark:border-[#3F3F46] shadow-xs hover:border-[#111827] dark:hover:border-[#FAFAFA] transition-all duration-150 flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-[38px] h-[38px] rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#D1D5DB] dark:border-[#3F3F46] flex items-center justify-center shrink-0">
                        {getFileIcon(doc.file_type)}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-[700] text-[14px] text-[#111827] dark:text-[#FAFAFA] truncate">
                          {doc.original_name}
                        </h4>
                        <p className="text-[12px] font-[500] text-[#6B7280] dark:text-[#A1A1AA]">
                          {doc.folder_name} • {(doc.file_size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleTogglePin(doc.id)}
                      className="p-1.5 rounded-[8px] text-[#111827] dark:text-[#FAFAFA] hover:bg-[#F8FAFC] dark:hover:bg-[#232323] transition cursor-pointer shrink-0"
                      title="Unpin document"
                    >
                      <Pin size={16} />
                    </button>
                  </div>

                  <p className="text-[13px] font-[500] text-[#6B7280] dark:text-[#A1A1AA] line-clamp-2 leading-relaxed">
                    {doc.summary || 'AI Auto-generated document overview'}
                  </p>

                  <div className="flex items-center justify-between pt-3 border-t border-[#D1D5DB] dark:border-[#3F3F46]">
                    <button
                      onClick={() => setChattingDoc(doc)}
                      className="h-[34px] px-3 rounded-[10px] bg-[#111827] hover:bg-[#1F2937] active:bg-[#0F172A] dark:bg-[#FAFAFA] dark:hover:bg-[#F3F4F6] text-[#FFFFFF] dark:text-[#111111] text-[12px] font-[400] flex items-center gap-1.5 transition cursor-pointer active:scale-[0.98]"
                    >
                      <MessageSquare size={14} /> Ask AI
                    </button>
                    <button
                      onClick={() => setViewingDoc(doc)}
                      className="h-[34px] px-3 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] text-[12px] font-[400] text-[#111827] dark:text-[#FAFAFA] hover:bg-[#F8FAFC] dark:hover:bg-[#232323] transition cursor-pointer"
                    >
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search & Filter Controls Toolbar */}
        <div className="bg-[#FFFFFF] dark:bg-[#18181B] p-3 sm:p-4 rounded-[16px] border border-[#D1D5DB] dark:border-[#3F3F46] flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4 select-none">
          {/* Segmented Category Filter Pills Toolbar */}
          <div className="flex items-center bg-[#F8FAFC] dark:bg-[#111111] p-1 rounded-[12px] border border-[#D1D5DB] dark:border-[#3F3F46] min-h-[44px] max-w-full overflow-x-auto no-scrollbar">
            {[
              { id: 'all', label: 'All Files', icon: BookOpen },
              { id: 'recent', label: 'Recent', icon: Clock },
              { id: 'pinned', label: 'Pinned', icon: Pin },
              { id: 'favorites', label: 'Favorites', icon: Star },
              { id: 'shared', label: 'Shared', icon: Share2 },
            ].map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`h-[36px] px-3.5 sm:px-4 rounded-[8px] text-[14px] font-[500] transition flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 active:scale-[0.98] ${
                    isActive
                      ? 'bg-[#111827] text-[#FFFFFF] dark:bg-[#FAFAFA] dark:text-[#111111]'
                      : 'text-[#6B7280] dark:text-[#A1A1AA] hover:bg-[#FFFFFF] dark:hover:bg-[#18181B]'
                  }`}
                >
                  <Icon size={15} />
                  <span>{cat.label}</span>
                </button>
              );
            })}

            {/* Folder Dropdown Filter */}
            <div className="h-5 w-[1px] bg-[#D1D5DB] dark:bg-[#3F3F46] mx-1 shrink-0" />
            <select
              value={['all', 'recent', 'pinned', 'favorites', 'shared'].includes(activeCategory) ? '' : activeCategory}
              onChange={(e) => setActiveCategory(e.target.value || 'all')}
              className="h-[36px] px-3 rounded-[8px] bg-[#FFFFFF] dark:bg-[#18181B] border border-[#D1D5DB] dark:border-[#3F3F46] text-[14px] font-[500] text-[#111827] dark:text-[#FAFAFA] outline-none shrink-0"
            >
              <option value="">Folders ({folders.length})</option>
              {folders.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>

          {/* Search, Sort & View Controls */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Search Bar */}
            <div className="relative flex-1 lg:w-64">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7280] dark:text-[#A1A1AA]" />
              <input
                type="text"
                placeholder="Search title, content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-[38px] sm:h-[40px] pl-9 pr-3 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#18181B] text-[13px] sm:text-[14px] font-[600] text-[#111827] dark:text-[#FAFAFA] outline-none"
              />
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="h-[38px] sm:h-[40px] px-3 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#18181B] text-[13px] sm:text-[14px] font-[500] text-[#111827] dark:text-[#FAFAFA] outline-none shrink-0"
            >
              <option value="date">Sort: Date</option>
              <option value="name">Sort: Name</option>
              <option value="size">Sort: Size</option>
              <option value="subject">Sort: Folder</option>
            </select>

            {/* View Toggle */}
            <div className="flex items-center p-1 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#F8FAFC] dark:bg-[#111111] shrink-0">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-[8px] transition cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-[#111827] text-[#FFFFFF] dark:bg-[#FAFAFA] dark:text-[#111111]'
                    : 'text-[#6B7280] dark:text-[#A1A1AA] hover:text-[#111827] dark:hover:text-[#FAFAFA]'
                }`}
              >
                <Grid size={16} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-[8px] transition cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-[#111827] text-[#FFFFFF] dark:bg-[#FAFAFA] dark:text-[#111111]'
                    : 'text-[#6B7280] dark:text-[#A1A1AA] hover:text-[#111827] dark:hover:text-[#FAFAFA]'
                }`}
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* DOCUMENT CARDS GRID / LIST VIEW & EMPTY STATE */}
        {filteredDocuments.length === 0 ? (
          /* EMPTY STATE */
          <div className="py-20 flex flex-col items-center justify-center text-center bg-[#FFFFFF] dark:bg-[#18181B] rounded-[16px] border border-dashed border-[#D1D5DB] dark:border-[#3F3F46] p-8 shadow-xs select-none">
            <div className="w-[52px] h-[52px] rounded-[12px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#D1D5DB] dark:border-[#3F3F46] flex items-center justify-center mb-4 text-[#6B7280] dark:text-[#A1A1AA]">
              <BookOpen size={28} />
            </div>
            <h3 className="text-[22px] font-[700] text-[#111827] dark:text-[#FAFAFA]">
              No Documents Available
            </h3>
            <p className="text-[14px] font-[500] text-[#6B7280] dark:text-[#A1A1AA] mt-1 max-w-sm">
              Upload your first document to organize and interact with it using AI.
            </p>
            <button
              onClick={() => setIsUploadOpen(true)}
              className="mt-5 h-[40px] px-6 rounded-[12px] bg-[#111827] hover:bg-[#1F2937] active:bg-[#0F172A] dark:bg-[#FAFAFA] dark:hover:bg-[#F3F4F6] text-[#FFFFFF] dark:text-[#111111] text-[14px] font-[500] flex items-center gap-2 shadow-xs transition cursor-pointer active:scale-[0.98]"
            >
              <UploadCloud size={16} /> Upload First Document
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          /* GRID VIEW */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 select-none">
            {filteredDocuments.map((doc) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#FFFFFF] dark:bg-[#18181B] p-5 rounded-[16px] border border-[#D1D5DB] dark:border-[#3F3F46] shadow-xs hover:border-[#111827] dark:hover:border-[#FAFAFA] hover:-translate-y-[2px] hover:shadow-md transition-all duration-150 flex flex-col justify-between space-y-4"
              >
                {/* Header */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-[40px] h-[40px] rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#D1D5DB] dark:border-[#3F3F46] flex items-center justify-center shrink-0">
                        {getFileIcon(doc.file_type)}
                      </div>
                      <div className="min-w-0">
                        <span className="text-[11px] font-[400] px-2 py-0.5 rounded-[6px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#D1D5DB] dark:border-[#3F3F46] text-[#111827] dark:text-[#FAFAFA] uppercase">
                          {doc.folder_name || 'General'}
                        </span>
                        <h3 className="font-[700] text-[15px] text-[#111827] dark:text-[#FAFAFA] mt-1 truncate">
                          {doc.original_name}
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleTogglePin(doc.id)}
                        className="p-1.5 rounded-[8px] text-[#6B7280] dark:text-[#A1A1AA] hover:text-[#111827] dark:hover:text-[#FAFAFA] transition cursor-pointer"
                      >
                        <Pin size={16} className={doc.is_pinned ? 'fill-current text-[#111827] dark:text-[#FAFAFA]' : ''} />
                      </button>
                      <button
                        onClick={() => handleToggleFavorite(doc.id)}
                        className="p-1.5 rounded-[8px] text-[#6B7280] dark:text-[#A1A1AA] hover:text-[#111827] dark:hover:text-[#FAFAFA] transition cursor-pointer"
                      >
                        <Star size={16} className={doc.is_favorite ? 'fill-current text-[#111827] dark:text-[#FAFAFA]' : ''} />
                      </button>
                    </div>
                  </div>

                  <p className="text-[13px] font-[500] text-[#6B7280] dark:text-[#A1A1AA] line-clamp-3 leading-relaxed">
                    {doc.summary || 'AI overview available for this document.'}
                  </p>
                </div>

                {/* AI Quick Actions Pill Bar */}
                <div className="py-2.5 border-t border-b border-[#D1D5DB] dark:border-[#3F3F46]">
                  <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-0.5">
                    <button
                      onClick={() => {
                        navigate(`/quiz?docId=${doc.id}&docName=${encodeURIComponent(doc.original_name)}`);
                      }}
                      className="h-[30px] px-3 rounded-[8px] bg-[#111827] hover:bg-[#1F2937] dark:bg-[#FAFAFA] dark:hover:bg-[#F3F4F6] text-[#FFFFFF] dark:text-[#111111] font-[700] text-[12px] flex items-center gap-1 transition cursor-pointer shrink-0 active:scale-[0.98]"
                    >
                      <Sparkles size={12} /> Quiz
                    </button>
                    <button
                      onClick={() => {
                        setAiActionDoc(doc);
                        setInitialAIAction('summarize');
                      }}
                      className="h-[30px] px-3 rounded-[8px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#18181B] text-[12px] font-[400] text-[#111827] dark:text-[#FAFAFA] hover:bg-[#F8FAFC] dark:hover:bg-[#232323] transition cursor-pointer shrink-0 active:scale-[0.98]"
                    >
                      Summarize
                    </button>
                    <button
                      onClick={() => {
                        setAiActionDoc(doc);
                        setInitialAIAction('explain');
                      }}
                      className="h-[30px] px-3 rounded-[8px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#18181B] text-[12px] font-[400] text-[#111827] dark:text-[#FAFAFA] hover:bg-[#F8FAFC] dark:hover:bg-[#232323] transition cursor-pointer shrink-0 active:scale-[0.98]"
                    >
                      Explain
                    </button>
                    <button
                      onClick={() => {
                        setAiActionDoc(doc);
                        setInitialAIAction('flashcards');
                      }}
                      className="h-[30px] px-3 rounded-[8px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#18181B] text-[12px] font-[400] text-[#111827] dark:text-[#FAFAFA] hover:bg-[#F8FAFC] dark:hover:bg-[#232323] transition cursor-pointer shrink-0 active:scale-[0.98]"
                    >
                      Flashcards
                    </button>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="flex items-center justify-between">
                  <div className="text-[12px] font-[600] text-[#6B7280] dark:text-[#A1A1AA]">
                    {(doc.file_size / (1024 * 1024)).toFixed(2)} MB
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleReadAloud(doc.summary || doc.original_name)}
                      className="p-2 rounded-[8px] text-[#111827] dark:text-[#FAFAFA] border border-[#D1D5DB] dark:border-[#3F3F46] hover:bg-[#F8FAFC] dark:hover:bg-[#232323] transition cursor-pointer"
                      title="Read Aloud"
                    >
                      <Volume2 size={14} />
                    </button>
                    <button
                      onClick={() => setViewingDoc(doc)}
                      className="p-2 rounded-[8px] text-[#111827] dark:text-[#FAFAFA] border border-[#D1D5DB] dark:border-[#3F3F46] hover:bg-[#F8FAFC] dark:hover:bg-[#232323] transition cursor-pointer"
                      title="View Document"
                    >
                      <Eye size={14} />
                    </button>
                    <button
                      onClick={() => setChattingDoc(doc)}
                      className="h-[34px] px-3 rounded-[10px] bg-[#111827] hover:bg-[#1F2937] active:bg-[#0F172A] dark:bg-[#FAFAFA] dark:hover:bg-[#F3F4F6] text-[#FFFFFF] dark:text-[#111111] text-[12px] font-[400] flex items-center gap-1.5 transition cursor-pointer active:scale-[0.98]"
                    >
                      <MessageSquare size={14} /> Ask AI
                    </button>
                    <button
                      onClick={() => handleDeleteDoc(doc.id)}
                      className="p-2 rounded-[8px] text-[#DC2626] border border-[#D1D5DB] dark:border-[#3F3F46] hover:bg-[#F8FAFC] dark:hover:bg-[#232323] transition cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          /* LIST VIEW */
          <div className="bg-[#FFFFFF] dark:bg-[#18181B] rounded-[16px] border border-[#D1D5DB] dark:border-[#3F3F46] shadow-xs overflow-hidden select-none">
            <div className="divide-y divide-[#D1D5DB] dark:divide-[#3F3F46]">
              {filteredDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#F8FAFC] dark:hover:bg-[#232323] transition-all duration-150"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] flex items-center justify-center shrink-0">
                      {getFileIcon(doc.file_type)}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-[14px] text-[#111827] dark:text-[#FAFAFA] truncate">
                        {doc.original_name}
                      </h4>
                      <p className="text-[12px] text-[#6B7280] dark:text-[#A3A3A3]">
                        {doc.folder_name} • {(doc.file_size / (1024 * 1024)).toFixed(2)} MB • {doc.chunk_count || 5} Vector Chunks
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        setAiActionDoc(doc);
                        setInitialAIAction('summarize');
                      }}
                      className="h-8 px-3 rounded-[8px] border border-[#D1D5DB] dark:border-[#2A2A2A] text-[12px] font-medium text-[#111827] dark:text-[#FAFAFA] hover:bg-[#F9FAFB] dark:hover:bg-[#232323] transition cursor-pointer"
                    >
                      Summarize
                    </button>
                    <button
                      onClick={() => setViewingDoc(doc)}
                      className="h-8 px-3 rounded-[8px] border border-[#D1D5DB] dark:border-[#2A2A2A] text-[12px] font-medium text-[#111827] dark:text-[#FAFAFA] hover:bg-[#F9FAFB] dark:hover:bg-[#232323] transition cursor-pointer"
                    >
                      View
                    </button>
                    <button
                      onClick={() => setChattingDoc(doc)}
                      className="h-8 px-4 rounded-[8px] bg-[#111827] hover:bg-[#000000] dark:bg-[#FAFAFA] dark:hover:bg-[#E5E7EB] text-[#FFFFFF] dark:text-[#111111] text-[12px] font-medium flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                    >
                      <MessageSquare size={14} /> Ask AI
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Interactive Modals */}
      <DocumentUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        folders={folders}
        onUploadSuccess={() => {
          fetchDocuments();
        }}
      />

      <FolderManagerModal
        isOpen={isFolderOpen}
        onClose={() => setIsFolderOpen(false)}
        folders={folders}
        activeFolder={typeof activeCategory === 'string' ? activeCategory : 'General'}
        onSelectFolder={(f) => setActiveCategory(f)}
        onCreateFolder={handleCreateFolder}
      />

      <DocumentViewerModal
        isOpen={!!viewingDoc}
        onClose={() => setViewingDoc(null)}
        document={viewingDoc}
        onOpenChat={(doc) => {
          setViewingDoc(null);
          setChattingDoc(doc);
        }}
        onReadAloud={handleReadAloud}
      />

      <DocumentChatModal
        isOpen={!!chattingDoc}
        onClose={() => setChattingDoc(null)}
        document={chattingDoc}
        onReadAloud={handleReadAloud}
      />

      <DocumentAIActionModal
        isOpen={!!aiActionDoc}
        onClose={() => setAiActionDoc(null)}
        document={aiActionDoc}
        initialAction={initialAIAction}
        onReadAloud={handleReadAloud}
      />
    </div>
  );
}
