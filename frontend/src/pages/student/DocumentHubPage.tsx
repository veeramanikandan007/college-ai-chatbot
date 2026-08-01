import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
      const res = await fetch('/api/v1/documents');
      if (res.ok) {
        const data = await res.json();
        setDocuments(data.documents || []);
      }
    } catch (err) {
      console.error('Failed to load documents', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFolders = async () => {
    try {
      const res = await fetch('/api/v1/documents/folders');
      if (res.ok) {
        const data = await res.json();
        setFolders(data.folders || []);
      }
    } catch (err) {
      console.error('Failed to load folders', err);
    }
  };

  useEffect(() => {
    fetchDocuments();
    fetchFolders();
  }, []);

  const handleCreateFolder = async (folderName: string) => {
    const res = await fetch('/api/v1/documents/folders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: folderName }),
    });
    if (res.ok) {
      await fetchFolders();
    } else {
      throw new Error('Failed to create folder');
    }
  };

  const handleTogglePin = async (docId: number) => {
    setDocuments((prev) =>
      prev.map((d) => (d.id === docId ? { ...d, is_pinned: !d.is_pinned } : d))
    );
    await fetch(`/api/v1/documents/${docId}/pin`, { method: 'PUT' }).catch(() => {});
  };

  const handleToggleFavorite = async (docId: number) => {
    setDocuments((prev) =>
      prev.map((d) => (d.id === docId ? { ...d, is_favorite: !d.is_favorite } : d))
    );
    await fetch(`/api/v1/documents/${docId}/favorite`, { method: 'PUT' }).catch(() => {});
  };

  const handleDeleteDoc = async (docId: number) => {
    setDocuments((prev) => prev.filter((d) => d.id !== docId));
    await fetch(`/api/v1/documents/${docId}`, { method: 'DELETE' }).catch(() => {});
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

  const getFileBadgeColor = (ext: string) => {
    const e = ext.toLowerCase();
    if (['pdf'].includes(e)) return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
    if (['docx', 'doc'].includes(e)) return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
    if (['ppt', 'pptx'].includes(e)) return 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20';
    if (['xlsx', 'csv'].includes(e)) return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
    if (['png', 'jpg', 'webp'].includes(e)) return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
    return 'bg-[#1E4DB7]/10 text-[#1E4DB7] dark:text-[#60A5FA] border-[#1E4DB7]/20';
  };

  const getFileIcon = (ext: string) => {
    const e = ext.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'webp'].includes(e)) return <ImageIcon size={20} className="text-purple-500" />;
    if (['zip', 'rar'].includes(e)) return <Archive size={20} className="text-amber-500" />;
    if (['pdf'].includes(e)) return <FileText size={20} className="text-rose-500" />;
    if (['docx', 'doc'].includes(e)) return <FileText size={20} className="text-blue-500" />;
    if (['ppt', 'pptx'].includes(e)) return <FileText size={20} className="text-orange-500" />;
    return <File size={20} className="text-[#1E4DB7] dark:text-[#60A5FA]" />;
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#F5F7FB] dark:bg-[#0F172A] text-[#1F2937] dark:text-[#F8FAFC] transition-colors duration-300 font-body min-h-screen">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header Title & Top Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="font-heading font-bold text-2xl md:text-3xl tracking-[0.02em] text-[#0E2A6D] dark:text-[#F8FAFC] flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-gradient-to-tr from-[#0E2A6D] to-[#1E4DB7] text-[#D9A441] shadow-lg shadow-[#0E2A6D]/20">
                <BookOpen size={28} />
              </div>
              AI Document Hub
            </h1>
            <p className="text-sm text-[#64748B] dark:text-[#94A3B8] mt-1">
              Upload, organize, search, and chat with your study materials using CollegeMate AI
            </p>
          </div>

          {/* Upload & New Folder Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsFolderOpen(true)}
              className="h-11 px-4 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#1E293B] text-[#0E2A6D] dark:text-[#F8FAFC] font-semibold text-xs md:text-sm flex items-center gap-2 shadow-xs hover:border-[#1E4DB7] transition"
            >
              <FolderPlus size={18} className="text-[#D9A441]" />
              <span>New Folder</span>
            </button>

            <button
              onClick={() => setIsUploadOpen(true)}
              className="h-11 px-5 rounded-xl bg-gradient-to-r from-[#0E2A6D] to-[#1E4DB7] hover:from-[#153B8A] hover:to-[#2563EB] text-white font-semibold text-xs md:text-sm flex items-center gap-2 shadow-md transition"
            >
              <UploadCloud size={20} />
              <span>Upload Document</span>
            </button>
          </div>
        </div>

        {/* Quick Statistics Overview Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 md:p-5 rounded-2xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] shadow-xs flex items-center gap-4">
            <div className="p-3 rounded-xl bg-[#0E2A6D]/10 dark:bg-[#60A5FA]/20 text-[#0E2A6D] dark:text-[#60A5FA]">
              <FileText size={22} />
            </div>
            <div>
              <p className="text-xs font-semibold text-[#64748B] dark:text-[#94A3B8]">Total Documents</p>
              <p className="text-lg font-heading font-bold text-[#1F2937] dark:text-[#F8FAFC]">
                {documents.length} Files
              </p>
            </div>
          </div>

          <div className="p-4 md:p-5 rounded-2xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] shadow-xs flex items-center gap-4">
            <div className="p-3 rounded-xl bg-amber-500/10 text-[#D9A441]">
              <Pin size={22} />
            </div>
            <div>
              <p className="text-xs font-semibold text-[#64748B] dark:text-[#94A3B8]">Pinned Files</p>
              <p className="text-lg font-heading font-bold text-[#1F2937] dark:text-[#F8FAFC]">
                {pinnedDocs.length} Pinned
              </p>
            </div>
          </div>

          <div className="p-4 md:p-5 rounded-2xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] shadow-xs flex items-center gap-4">
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-500">
              <Layers size={22} />
            </div>
            <div>
              <p className="text-xs font-semibold text-[#64748B] dark:text-[#94A3B8]">RAG Embeddings</p>
              <p className="text-lg font-heading font-bold text-[#1F2937] dark:text-[#F8FAFC]">
                {documents.reduce((acc, d) => acc + (d.chunk_count || 0), 0)} Vector Chunks
              </p>
            </div>
          </div>

          <div className="p-4 md:p-5 rounded-2xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] shadow-xs flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500">
              <Sparkles size={22} />
            </div>
            <div>
              <p className="text-xs font-semibold text-[#64748B] dark:text-[#94A3B8]">Storage Used</p>
              <p className="text-lg font-heading font-bold text-[#1F2937] dark:text-[#F8FAFC]">
                {(documents.reduce((acc, d) => acc + (d.file_size || 0), 0) / (1024 * 1024)).toFixed(1)} MB / 50MB
              </p>
            </div>
          </div>
        </div>

        {/* PINNED DOCUMENTS SECTION */}
        {pinnedDocs.length > 0 && activeCategory === 'all' && (
          <div className="space-y-3">
            <h3 className="font-heading text-base font-bold text-[#0E2A6D] dark:text-[#F8FAFC] flex items-center gap-2">
              <Pin size={18} className="text-[#D9A441]" />
              Pinned Documents
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {pinnedDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="p-4 rounded-2xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] shadow-sm hover:border-[#1E4DB7]/40 transition-all flex flex-col justify-between space-y-3 relative group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155]">
                        {getFileIcon(doc.file_type)}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-heading font-bold text-sm text-[#1F2937] dark:text-[#F8FAFC] truncate">
                          {doc.original_name}
                        </h4>
                        <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                          {doc.folder_name} • {(doc.file_size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleTogglePin(doc.id)}
                      className="p-1.5 rounded-lg text-[#D9A441] bg-amber-500/10 hover:bg-amber-500/20 transition"
                      title="Unpin document"
                    >
                      <Pin size={16} />
                    </button>
                  </div>

                  <p className="text-xs text-[#64748B] dark:text-[#94A3B8] line-clamp-2">
                    {doc.summary || 'AI Auto-generated document overview'}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-[#E2E8F0] dark:border-[#334155]">
                    <button
                      onClick={() => setChattingDoc(doc)}
                      className="px-3 py-1.5 rounded-xl bg-[#0E2A6D] hover:bg-[#153B8A] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition"
                    >
                      <MessageSquare size={14} /> Ask AI
                    </button>
                    <button
                      onClick={() => setViewingDoc(doc)}
                      className="px-3 py-1.5 rounded-xl border border-[#E2E8F0] dark:border-[#334155] text-xs font-bold text-[#475569] dark:text-[#CBD5E1] hover:bg-[#F8FAFC] transition"
                    >
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filter Navigation Bar & Search Toolbar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] shadow-xs">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1 lg:pb-0">
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
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition whitespace-nowrap ${
                    isActive
                      ? 'bg-[#0E2A6D] text-white shadow-sm'
                      : 'text-[#64748B] dark:text-[#94A3B8] hover:bg-[#F5F7FB] dark:hover:bg-[#0F172A] hover:text-[#1F2937] dark:hover:text-[#F8FAFC]'
                  }`}
                >
                  <Icon size={15} /> {cat.label}
                </button>
              );
            })}

            {/* Folder Dropdown Filter */}
            <div className="h-6 w-[1px] bg-[#E2E8F0] dark:bg-[#334155] mx-1" />
            <select
              value={['all', 'recent', 'pinned', 'favorites', 'shared'].includes(activeCategory) ? '' : activeCategory}
              onChange={(e) => setActiveCategory(e.target.value || 'all')}
              className="h-9 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#0F172A] text-xs font-bold text-[#0E2A6D] dark:text-[#F8FAFC] outline-none"
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
          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <input
                type="text"
                placeholder="Search title, content, tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 px-3 pl-9 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#0F172A] text-xs font-medium text-[#1F2937] dark:text-[#F8FAFC] outline-none focus:border-[#1E4DB7] transition"
              />
              <Search size={16} className="absolute left-3 top-3 text-[#64748B] pointer-events-none" />
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#0F172A] text-xs font-semibold text-[#475569] dark:text-[#CBD5E1] outline-none"
            >
              <option value="date">Sort: Date</option>
              <option value="name">Sort: Name</option>
              <option value="size">Sort: Size</option>
              <option value="subject">Sort: Subject</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center p-1 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#0F172A]">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-[#1E293B] text-[#0E2A6D] dark:text-[#60A5FA] shadow-xs'
                    : 'text-[#64748B]'
                }`}
              >
                <Grid size={16} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-[#1E293B] text-[#0E2A6D] dark:text-[#60A5FA] shadow-xs'
                    : 'text-[#64748B]'
                }`}
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* DOCUMENT GRID / LIST VIEW */}
        {filteredDocuments.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center bg-white dark:bg-[#1E293B] rounded-2xl border border-dashed border-[#E2E8F0] dark:border-[#334155]">
            <BookOpen size={48} className="text-[#64748B] opacity-30 mb-3" />
            <h3 className="font-heading font-bold text-lg text-[#1F2937] dark:text-[#F8FAFC]">
              No documents found
            </h3>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1 max-w-sm">
              Upload your lecture notes, PDFs, or assignments to start using AI features.
            </p>
            <button
              onClick={() => setIsUploadOpen(true)}
              className="mt-4 px-5 py-2.5 rounded-xl bg-[#0E2A6D] hover:bg-[#153B8A] text-white text-xs font-bold flex items-center gap-2 shadow-md transition"
            >
              <UploadCloud size={16} /> Upload First Document
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          /* GRID VIEW */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocuments.map((doc) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-[#1E293B] p-5 rounded-2xl border border-[#E2E8F0] dark:border-[#334155] shadow-xs hover:shadow-md hover:border-[#1E4DB7]/40 transition-all flex flex-col justify-between group"
              >
                {/* Header */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] shrink-0">
                        {getFileIcon(doc.file_type)}
                      </div>
                      <div className="min-w-0">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase ${getFileBadgeColor(doc.file_type)}`}>
                          {doc.folder_name || 'General'}
                        </span>
                        <h3 className="font-heading font-bold text-sm text-[#1F2937] dark:text-[#F8FAFC] mt-1 truncate">
                          {doc.original_name}
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleTogglePin(doc.id)}
                        className={`p-1.5 rounded-lg transition ${
                          doc.is_pinned
                            ? 'text-[#D9A441] bg-amber-500/10'
                            : 'text-[#64748B] hover:bg-[#F5F7FB] dark:hover:bg-[#0F172A]'
                        }`}
                      >
                        <Pin size={16} />
                      </button>
                      <button
                        onClick={() => handleToggleFavorite(doc.id)}
                        className={`p-1.5 rounded-lg transition ${
                          doc.is_favorite
                            ? 'text-amber-500 fill-amber-500 bg-amber-500/10'
                            : 'text-[#64748B] hover:bg-[#F5F7FB] dark:hover:bg-[#0F172A]'
                        }`}
                      >
                        <Star size={16} />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-[#64748B] dark:text-[#94A3B8] line-clamp-3 leading-relaxed">
                    {doc.summary || 'AI overview available for this document.'}
                  </p>
                </div>

                {/* AI Quick Actions Pill Bar */}
                <div className="py-3 border-t border-b border-[#E2E8F0] dark:border-[#334155] my-3">
                  <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1">
                    <button
                      onClick={() => {
                        setAiActionDoc(doc);
                        setInitialAIAction('summarize');
                      }}
                      className="px-2.5 py-1 rounded-lg bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] text-[11px] font-bold text-[#0E2A6D] dark:text-[#60A5FA] hover:border-[#1E4DB7] transition shrink-0"
                    >
                      Summarize
                    </button>
                    <button
                      onClick={() => {
                        setAiActionDoc(doc);
                        setInitialAIAction('explain');
                      }}
                      className="px-2.5 py-1 rounded-lg bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:border-blue-500 transition shrink-0"
                    >
                      Explain
                    </button>
                    <button
                      onClick={() => {
                        setAiActionDoc(doc);
                        setInitialAIAction('flashcards');
                      }}
                      className="px-2.5 py-1 rounded-lg bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:border-indigo-500 transition shrink-0"
                    >
                      Flashcards
                    </button>
                    <button
                      onClick={() => {
                        setAiActionDoc(doc);
                        setInitialAIAction('mcq');
                      }}
                      className="px-2.5 py-1 rounded-lg bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] text-[11px] font-bold text-purple-600 dark:text-purple-400 hover:border-purple-500 transition shrink-0"
                    >
                      MCQ
                    </button>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="flex items-center justify-between">
                  <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                    {(doc.file_size / (1024 * 1024)).toFixed(2)} MB
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleReadAloud(doc.summary || doc.original_name)}
                      className="p-1.5 rounded-lg text-[#0E2A6D] dark:text-[#60A5FA] bg-[#0E2A6D]/10 dark:bg-[#60A5FA]/10 hover:bg-[#0E2A6D]/20 transition"
                      title="Read Aloud"
                    >
                      <Volume2 size={16} />
                    </button>
                    <button
                      onClick={() => setViewingDoc(doc)}
                      className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0E2A6D] dark:hover:text-[#F8FAFC] hover:bg-[#F5F7FB] dark:hover:bg-[#0F172A] transition"
                      title="View Document"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => setChattingDoc(doc)}
                      className="px-3.5 py-1.5 rounded-xl bg-[#0E2A6D] hover:bg-[#153B8A] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition"
                    >
                      <MessageSquare size={14} /> Ask AI
                    </button>
                    <button
                      onClick={() => handleDeleteDoc(doc.id)}
                      className="p-1.5 rounded-lg text-[#64748B] hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 transition"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          /* LIST VIEW */
          <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-[#E2E8F0] dark:border-[#334155] shadow-xs overflow-hidden">
            <div className="divide-y divide-[#E2E8F0] dark:divide-[#334155]">
              {filteredDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#F8FAFC] dark:hover:bg-[#0F172A]/40 transition"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="p-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] shrink-0">
                      {getFileIcon(doc.file_type)}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-heading font-bold text-sm text-[#1F2937] dark:text-[#F8FAFC] truncate">
                        {doc.original_name}
                      </h4>
                      <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
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
                      className="px-3 py-1.5 rounded-xl border border-[#E2E8F0] dark:border-[#334155] text-xs font-bold text-[#0E2A6D] dark:text-[#60A5FA] hover:bg-white dark:hover:bg-[#1E293B] transition"
                    >
                      Summarize
                    </button>
                    <button
                      onClick={() => setViewingDoc(doc)}
                      className="px-3 py-1.5 rounded-xl border border-[#E2E8F0] dark:border-[#334155] text-xs font-bold text-[#475569] dark:text-[#CBD5E1] hover:bg-white dark:hover:bg-[#1E293B] transition"
                    >
                      View
                    </button>
                    <button
                      onClick={() => setChattingDoc(doc)}
                      className="px-4 py-1.5 rounded-xl bg-[#0E2A6D] hover:bg-[#153B8A] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition"
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
