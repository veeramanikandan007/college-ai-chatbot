import React, { useState, useEffect, useMemo } from 'react';
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
    <div className="w-full h-full overflow-y-auto p-4 md:p-8 bg-[#FFFFFF] dark:bg-[#0A0A0A] text-[#111827] dark:text-[#FAFAFA] transition-colors duration-300 font-sans">
      <div className="mx-auto max-w-6xl space-y-6">
        
        {/* ==================================================
            PAGE HEADER (White Header Card)
            ================================================== */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#FFFFFF] dark:bg-[#181818] p-6 rounded-[12px] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-[10px] bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] flex items-center justify-center shrink-0 shadow-xs">
              <Folder size={24} className="stroke-[2.2]" />
            </div>
            <div>
              <h1 className="text-[32px] font-bold tracking-tight text-[#111827] dark:text-[#FAFAFA] leading-tight">
                AI Document Hub
              </h1>
              <p className="text-[14px] text-[#4B5563] dark:text-[#A3A3A3] mt-1">
                Upload, organize, search, and chat with your study materials using CollegeMate AI
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsFolderOpen(true)}
              className="h-10 px-4 rounded-[10px] border border-[#D1D5DB] dark:border-[#2A2A2A] bg-[#FFFFFF] dark:bg-[#181818] text-[#111827] dark:text-[#FAFAFA] hover:bg-[#F9FAFB] dark:hover:bg-[#232323] transition-all duration-150 text-[14px] font-medium flex items-center gap-2 cursor-pointer"
            >
              <FolderPlus size={16} />
              <span>New Folder</span>
            </button>

            <button
              onClick={() => setIsUploadOpen(true)}
              className="h-10 px-5 rounded-[10px] bg-[#111827] hover:bg-[#000000] dark:bg-[#FAFAFA] dark:hover:bg-[#E5E7EB] text-[#FFFFFF] dark:text-[#111111] font-medium text-[14px] shadow-xs transition-all duration-150 flex items-center gap-2 cursor-pointer"
            >
              <UploadCloud size={18} />
              <span>Upload Document</span>
            </button>
          </div>
        </div>

        {/* ==================================================
            DOCUMENT DASHBOARD OVERVIEW CARDS
            ================================================== */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-[12px] bg-[#FFFFFF] dark:bg-[#181818] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[14px] font-medium text-[#6B7280] dark:text-[#A3A3A3]">Total Documents</p>
              <p className="text-[32px] font-bold text-[#111827] dark:text-[#FAFAFA] mt-1">
                {documents.length}
              </p>
            </div>
            <div className="w-10 h-10 rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] flex items-center justify-center shrink-0">
              <FileText size={20} className="text-[#111827] dark:text-[#FAFAFA]" />
            </div>
          </div>

          <div className="p-5 rounded-[12px] bg-[#FFFFFF] dark:bg-[#181818] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[14px] font-medium text-[#6B7280] dark:text-[#A3A3A3]">Pinned Files</p>
              <p className="text-[32px] font-bold text-[#111827] dark:text-[#FAFAFA] mt-1">
                {pinnedDocs.length}
              </p>
            </div>
            <div className="w-10 h-10 rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] flex items-center justify-center shrink-0">
              <Pin size={20} className="text-[#111827] dark:text-[#FAFAFA]" />
            </div>
          </div>

          <div className="p-5 rounded-[12px] bg-[#FFFFFF] dark:bg-[#181818] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[14px] font-medium text-[#6B7280] dark:text-[#A3A3A3]">AI Indexed Files</p>
              <p className="text-[32px] font-bold text-[#111827] dark:text-[#FAFAFA] mt-1">
                {documents.reduce((acc, d) => acc + (d.chunk_count ? 1 : 0), 0)}
              </p>
            </div>
            <div className="w-10 h-10 rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] flex items-center justify-center shrink-0">
              <Layers size={20} className="text-[#111827] dark:text-[#FAFAFA]" />
            </div>
          </div>

          <div className="p-5 rounded-[12px] bg-[#FFFFFF] dark:bg-[#181818] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[14px] font-medium text-[#6B7280] dark:text-[#A3A3A3]">Storage Used</p>
              <p className="text-[20px] font-bold text-[#111827] dark:text-[#FAFAFA] mt-2">
                {(documents.reduce((acc, d) => acc + (d.file_size || 0), 0) / (1024 * 1024)).toFixed(1)} MB / 50MB
              </p>
            </div>
            <div className="w-10 h-10 rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] flex items-center justify-center shrink-0">
              <Sparkles size={20} className="text-[#111827] dark:text-[#FAFAFA]" />
            </div>
          </div>
        </div>

        {/* ==================================================
            PINNED DOCUMENTS SECTION
            ================================================== */}
        {pinnedDocs.length > 0 && activeCategory === 'all' && (
          <div className="space-y-3">
            <h3 className="text-[18px] font-bold text-[#111827] dark:text-[#FAFAFA] flex items-center gap-2">
              <Pin size={18} className="text-[#111827] dark:text-[#FAFAFA]" />
              <span>Pinned Documents</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {pinnedDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="p-5 rounded-[12px] bg-[#FFFFFF] dark:bg-[#181818] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs hover:border-[#111827] dark:hover:border-[#FAFAFA] transition-all duration-150 flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] flex items-center justify-center shrink-0">
                        {getFileIcon(doc.file_type)}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-[14px] text-[#111827] dark:text-[#FAFAFA] truncate">
                          {doc.original_name}
                        </h4>
                        <p className="text-[12px] text-[#6B7280] dark:text-[#A3A3A3]">
                          {doc.folder_name} • {(doc.file_size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleTogglePin(doc.id)}
                      className="p-1.5 rounded-[8px] text-[#111827] dark:text-[#FAFAFA] hover:bg-[#F9FAFB] dark:hover:bg-[#232323] transition cursor-pointer"
                      title="Unpin document"
                    >
                      <Pin size={16} />
                    </button>
                  </div>

                  <p className="text-[14px] text-[#4B5563] dark:text-[#A3A3A3] line-clamp-2 leading-relaxed">
                    {doc.summary || 'AI Auto-generated document overview'}
                  </p>

                  <div className="flex items-center justify-between pt-3 border-t border-[#F3F4F6] dark:border-[#2A2A2A]">
                    <button
                      onClick={() => setChattingDoc(doc)}
                      className="h-8 px-3 rounded-[8px] bg-[#111827] hover:bg-[#000000] dark:bg-[#FAFAFA] dark:hover:bg-[#E5E7EB] text-[#FFFFFF] dark:text-[#111111] text-[12px] font-medium flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                    >
                      <MessageSquare size={14} /> Ask AI
                    </button>
                    <button
                      onClick={() => setViewingDoc(doc)}
                      className="h-8 px-3 rounded-[8px] border border-[#D1D5DB] dark:border-[#2A2A2A] text-[12px] font-medium text-[#111827] dark:text-[#FAFAFA] hover:bg-[#F9FAFB] dark:hover:bg-[#232323] transition cursor-pointer"
                    >
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================================================
            FILTER NAVIGATION BAR & SEARCH TOOLBAR
            ================================================== */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-[12px] bg-[#FFFFFF] dark:bg-[#181818] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs">
          {/* Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0">
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
                  className={`h-9 px-3.5 rounded-[10px] text-[14px] font-medium flex items-center gap-2 transition-all duration-150 whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111]'
                      : 'bg-[#FFFFFF] dark:bg-[#181818] text-[#4B5563] dark:text-[#A3A3A3] hover:bg-[#F9FAFB] dark:hover:bg-[#232323]'
                  }`}
                >
                  <Icon size={15} className={isActive ? 'text-[#FFFFFF] dark:text-[#111111]' : 'text-[#111827] dark:text-[#FAFAFA]'} />
                  <span>{cat.label}</span>
                </button>
              );
            })}

            {/* Folder Dropdown Filter */}
            <div className="h-6 w-[1px] bg-[#E5E7EB] dark:bg-[#2A2A2A] mx-1" />
            <select
              value={['all', 'recent', 'pinned', 'favorites', 'shared'].includes(activeCategory) ? '' : activeCategory}
              onChange={(e) => setActiveCategory(e.target.value || 'all')}
              className="h-9 px-3 rounded-[10px] border border-[#D1D5DB] dark:border-[#2A2A2A] bg-[#FFFFFF] dark:bg-[#181818] text-[14px] font-medium text-[#111827] dark:text-[#FAFAFA] outline-none"
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
            {/* Search Bar */}
            <div className="relative flex-1 sm:w-64">
              <input
                type="text"
                placeholder="Search title, content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 px-3 pl-9 rounded-[10px] border border-[#D1D5DB] dark:border-[#2A2A2A] bg-[#FFFFFF] dark:bg-[#181818] text-[14px] text-[#111827] dark:text-[#FAFAFA] outline-none focus:border-[#111827] dark:focus:border-[#FAFAFA]"
              />
              <Search size={16} className="absolute left-3 top-3 text-[#6B7280] pointer-events-none" />
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="h-10 px-3 rounded-[10px] border border-[#D1D5DB] dark:border-[#2A2A2A] bg-[#FFFFFF] dark:bg-[#181818] text-[14px] font-medium text-[#111827] dark:text-[#FAFAFA] outline-none"
            >
              <option value="date">Sort: Date</option>
              <option value="name">Sort: Name</option>
              <option value="size">Sort: Size</option>
              <option value="subject">Sort: Folder</option>
            </select>

            {/* View Toggle */}
            <div className="flex items-center p-1 rounded-[10px] border border-[#D1D5DB] dark:border-[#2A2A2A] bg-[#F8FAFC] dark:bg-[#111111]">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-[8px] transition cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111]'
                    : 'text-[#6B7280] hover:text-[#111827]'
                }`}
              >
                <Grid size={16} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-[8px] transition cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111]'
                    : 'text-[#6B7280] hover:text-[#111827]'
                }`}
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* ==================================================
            DOCUMENT CARDS GRID / LIST VIEW & EMPTY STATE
            ================================================== */}
        {filteredDocuments.length === 0 ? (
          /* EMPTY STATE */
          <div className="py-20 flex flex-col items-center justify-center text-center bg-[#FFFFFF] dark:bg-[#181818] rounded-[12px] border border-dashed border-[#E5E7EB] dark:border-[#2A2A2A] p-8 shadow-xs">
            <div className="w-16 h-16 rounded-[12px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] flex items-center justify-center mb-4 text-[#6B7280]">
              <BookOpen size={32} />
            </div>
            <h3 className="text-[22px] font-bold text-[#111827] dark:text-[#FAFAFA]">
              No Documents Available
            </h3>
            <p className="text-[14px] text-[#4B5563] dark:text-[#A3A3A3] mt-1 max-w-sm">
              Upload your first document to organize and interact with it using AI.
            </p>
            <button
              onClick={() => setIsUploadOpen(true)}
              className="mt-5 h-10 px-6 rounded-[10px] bg-[#111827] hover:bg-[#000000] dark:bg-[#FAFAFA] dark:hover:bg-[#E5E7EB] text-[#FFFFFF] dark:text-[#111111] text-[14px] font-medium flex items-center gap-2 shadow-xs transition cursor-pointer"
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
                className="bg-[#FFFFFF] dark:bg-[#181818] p-6 rounded-[12px] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs hover:border-[#111827] dark:hover:border-[#FAFAFA] transition-all duration-150 flex flex-col justify-between space-y-4"
              >
                {/* Header */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] flex items-center justify-center shrink-0">
                        {getFileIcon(doc.file_type)}
                      </div>
                      <div className="min-w-0">
                        <span className="text-[12px] font-semibold px-2 py-0.5 rounded-[6px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA] uppercase">
                          {doc.folder_name || 'General'}
                        </span>
                        <h3 className="font-bold text-[16px] text-[#111827] dark:text-[#FAFAFA] mt-1 truncate">
                          {doc.original_name}
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleTogglePin(doc.id)}
                        className="p-1.5 rounded-[8px] text-[#6B7280] hover:text-[#111827] dark:hover:text-[#FAFAFA] transition cursor-pointer"
                      >
                        <Pin size={16} className={doc.is_pinned ? 'fill-current text-[#111827] dark:text-[#FAFAFA]' : ''} />
                      </button>
                      <button
                        onClick={() => handleToggleFavorite(doc.id)}
                        className="p-1.5 rounded-[8px] text-[#6B7280] hover:text-[#111827] dark:hover:text-[#FAFAFA] transition cursor-pointer"
                      >
                        <Star size={16} className={doc.is_favorite ? 'fill-current text-[#111827] dark:text-[#FAFAFA]' : ''} />
                      </button>
                    </div>
                  </div>

                  <p className="text-[14px] text-[#4B5563] dark:text-[#A3A3A3] line-clamp-3 leading-relaxed">
                    {doc.summary || 'AI overview available for this document.'}
                  </p>
                </div>

                {/* AI Quick Actions Pill Bar */}
                <div className="py-3 border-t border-b border-[#F3F4F6] dark:border-[#2A2A2A]">
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    <button
                      onClick={() => {
                        navigate(`/quiz?docId=${doc.id}&docName=${encodeURIComponent(doc.original_name)}`);
                      }}
                      className="h-7 px-3 rounded-[8px] bg-[#111827] hover:bg-[#000000] dark:bg-[#FAFAFA] dark:hover:bg-[#E5E7EB] text-[#FFFFFF] dark:text-[#111111] font-medium text-[12px] flex items-center gap-1 transition cursor-pointer shrink-0"
                    >
                      <Sparkles size={12} /> Quiz
                    </button>
                    <button
                      onClick={() => {
                        setAiActionDoc(doc);
                        setInitialAIAction('summarize');
                      }}
                      className="h-7 px-3 rounded-[8px] border border-[#D1D5DB] dark:border-[#2A2A2A] bg-[#FFFFFF] dark:bg-[#181818] text-[12px] font-medium text-[#111827] dark:text-[#FAFAFA] hover:bg-[#F9FAFB] dark:hover:bg-[#232323] transition cursor-pointer shrink-0"
                    >
                      Summarize
                    </button>
                    <button
                      onClick={() => {
                        setAiActionDoc(doc);
                        setInitialAIAction('explain');
                      }}
                      className="h-7 px-3 rounded-[8px] border border-[#D1D5DB] dark:border-[#2A2A2A] bg-[#FFFFFF] dark:bg-[#181818] text-[12px] font-medium text-[#111827] dark:text-[#FAFAFA] hover:bg-[#F9FAFB] dark:hover:bg-[#232323] transition cursor-pointer shrink-0"
                    >
                      Explain
                    </button>
                    <button
                      onClick={() => {
                        setAiActionDoc(doc);
                        setInitialAIAction('flashcards');
                      }}
                      className="h-7 px-3 rounded-[8px] border border-[#D1D5DB] dark:border-[#2A2A2A] bg-[#FFFFFF] dark:bg-[#181818] text-[12px] font-medium text-[#111827] dark:text-[#FAFAFA] hover:bg-[#F9FAFB] dark:hover:bg-[#232323] transition cursor-pointer shrink-0"
                    >
                      Flashcards
                    </button>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="flex items-center justify-between">
                  <div className="text-[12px] text-[#6B7280] dark:text-[#A3A3A3]">
                    {(doc.file_size / (1024 * 1024)).toFixed(2)} MB
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleReadAloud(doc.summary || doc.original_name)}
                      className="p-2 rounded-[8px] text-[#111827] dark:text-[#FAFAFA] border border-[#D1D5DB] dark:border-[#2A2A2A] hover:bg-[#F9FAFB] dark:hover:bg-[#232323] transition cursor-pointer"
                      title="Read Aloud"
                    >
                      <Volume2 size={14} />
                    </button>
                    <button
                      onClick={() => setViewingDoc(doc)}
                      className="p-2 rounded-[8px] text-[#111827] dark:text-[#FAFAFA] border border-[#D1D5DB] dark:border-[#2A2A2A] hover:bg-[#F9FAFB] dark:hover:bg-[#232323] transition cursor-pointer"
                      title="View Document"
                    >
                      <Eye size={14} />
                    </button>
                    <button
                      onClick={() => setChattingDoc(doc)}
                      className="h-8 px-3 rounded-[8px] bg-[#111827] hover:bg-[#000000] dark:bg-[#FAFAFA] dark:hover:bg-[#E5E7EB] text-[#FFFFFF] dark:text-[#111111] text-[12px] font-medium flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                    >
                      <MessageSquare size={14} /> Ask AI
                    </button>
                    <button
                      onClick={() => handleDeleteDoc(doc.id)}
                      className="p-2 rounded-[8px] text-[#DC2626] border border-[#D1D5DB] dark:border-[#2A2A2A] hover:bg-[#F9FAFB] dark:hover:bg-[#232323] transition cursor-pointer"
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
          <div className="bg-[#FFFFFF] dark:bg-[#181818] rounded-[12px] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs overflow-hidden">
            <div className="divide-y divide-[#F3F4F6] dark:divide-[#2A2A2A]">
              {filteredDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#F9FAFB] dark:hover:bg-[#232323] transition-all duration-150"
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
