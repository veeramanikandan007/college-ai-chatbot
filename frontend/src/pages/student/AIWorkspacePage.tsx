import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  FolderKanban,
  Folder,
  Brain,
  BookOpen,
  Code2,
  Sparkles,
  Briefcase,
  Plus,
  Search,
  Star,
  Heart,
  Archive,
  Trash2,
  X,
  MessageSquare,
  FileText,
  HelpCircle,
  Clock,
  ChevronLeft,
  Settings,
  ArrowRight,
  RefreshCw,
  FolderPlus,
  Layers,
  CalendarDays,
  CircleAlert
} from 'lucide-react';
import {
  getWorkspaces,
  getWorkspaceDetail,
  createWorkspace,
  updateWorkspace,
  deleteWorkspace,
  WorkspaceListItem,
  WorkspaceDetailResponse
} from '../../api/workspace';
import { useToast } from '../../hooks/useToast';

const ICON_OPTIONS = [
  { name: 'Folder', icon: Folder, label: 'General Project' },
  { name: 'Brain', icon: Brain, label: 'AI Synthesis' },
  { name: 'Book', icon: BookOpen, label: 'Study & Course' },
  { name: 'Code', icon: Code2, label: 'Coding & Tech' },
  { name: 'AI Sparkles', icon: Sparkles, label: 'Research' },
  { name: 'Career Briefcase', icon: Briefcase, label: 'Career & Placement' },
];

export default function AIWorkspacePage() {
  const navigate = useNavigate();
  const { id: routeWorkspaceId } = useParams<{ id?: string }>();
  const { showToast } = useToast();

  // List & Filter States
  const [workspaces, setWorkspaces] = useState<WorkspaceListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'pinned' | 'favorites' | 'archived'>('all');

  // Detail View State
  const [selectedWorkspace, setSelectedWorkspace] = useState<WorkspaceDetailResponse | null>(null);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);
  const [activeDetailTab, setActiveDetailTab] = useState<'chats' | 'docs' | 'notes' | 'quizzes' | 'timeline'>('chats');

  // Modal States
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [titleInput, setTitleInput] = useState<string>('');
  const [descInput, setDescInput] = useState<string>('');
  const [selectedIcon, setSelectedIcon] = useState<string>('Folder');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  useEffect(() => {
    if (routeWorkspaceId) {
      loadWorkspaceDetail(parseInt(routeWorkspaceId, 10));
    } else {
      setSelectedWorkspace(null);
    }
  }, [routeWorkspaceId]);

  const fetchWorkspaces = async () => {
    setLoading(true);
    try {
      const data = await getWorkspaces();
      setWorkspaces(data);
    } catch (err) {
      console.error(err);
      showToast('Failed to load workspaces', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadWorkspaceDetail = async (id: number) => {
    setLoadingDetail(true);
    try {
      const detail = await getWorkspaceDetail(id);
      setSelectedWorkspace(detail);
    } catch (err) {
      console.error(err);
      showToast('Failed to load workspace details', 'error');
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingId(null);
    setTitleInput('');
    setDescInput('');
    setSelectedIcon('Folder');
    setModalOpen(true);
  };

  const handleOpenEditModal = (ws: WorkspaceListItem) => {
    setEditingId(ws.id);
    setTitleInput(ws.title);
    setDescInput(ws.description || '');
    setSelectedIcon(ws.icon || 'Folder');
    setModalOpen(true);
  };

  const handleSaveWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleInput.trim()) {
      showToast('Please enter a workspace title', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingId) {
        await updateWorkspace(editingId, {
          title: titleInput,
          description: descInput,
          icon: selectedIcon,
        });
        showToast('Workspace updated successfully!', 'success');
      } else {
        await createWorkspace({
          title: titleInput,
          description: descInput,
          icon: selectedIcon,
        });
        showToast('New workspace created!', 'success');
      }
      setModalOpen(false);
      fetchWorkspaces();
      if (selectedWorkspace && editingId !== null && selectedWorkspace.id === editingId) {
        loadWorkspaceDetail(editingId);
      }
    } catch (err) {
      showToast('Failed to save workspace', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTogglePin = async (ws: WorkspaceListItem | WorkspaceDetailResponse, e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      await updateWorkspace(ws.id, { is_pinned: !ws.is_pinned });
      fetchWorkspaces();
      if (selectedWorkspace && selectedWorkspace.id === ws.id) {
        loadWorkspaceDetail(ws.id);
      }
      showToast(ws.is_pinned ? 'Unpinned workspace' : 'Pinned workspace to top', 'info');
    } catch (err) {
      showToast('Failed to update workspace', 'error');
    }
  };

  const handleToggleFavorite = async (ws: WorkspaceListItem, e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      await updateWorkspace(ws.id, { is_favorite: !ws.is_favorite });
      fetchWorkspaces();
      showToast(ws.is_favorite ? 'Removed from favorites' : 'Added to favorites', 'info');
    } catch (err) {
      showToast('Failed to update workspace', 'error');
    }
  };

  const handleDelete = async (id: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this workspace?')) return;

    try {
      await deleteWorkspace(id);
      showToast('Workspace deleted', 'success');
      if (selectedWorkspace?.id === id) {
        setSelectedWorkspace(null);
        navigate('/workspaces');
      }
      fetchWorkspaces();
    } catch (err) {
      showToast('Failed to delete workspace', 'error');
    }
  };

  // Helper to render icon by name
  const renderIcon = (name: string, size: number = 20) => {
    const found = ICON_OPTIONS.find((i) => i.name === name);
    const IconComp = found ? found.icon : Folder;
    return <IconComp size={size} />;
  };

  // Filtered Workspaces
  const filteredWorkspaces = workspaces.filter((ws) => {
    const matchesSearch = ws.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ws.description && ws.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (!matchesSearch) return false;

    if (activeFilter === 'pinned') return ws.is_pinned && !ws.is_archived;
    if (activeFilter === 'favorites') return ws.is_favorite && !ws.is_archived;
    if (activeFilter === 'archived') return ws.is_archived;
    return !ws.is_archived;
  });

  return (
    <div className="w-full h-full overflow-x-hidden overflow-y-auto bg-[#F8FAFC] dark:bg-[#0A0A0A] text-[#111827] dark:text-[#FAFAFA] p-4 sm:p-6 lg:p-8 transition-colors select-none font-sans">
      {/* 1440px Centered Container with 32px (space-y-8) Section Gap */}
      <div className="w-full max-w-[1440px] mx-auto space-y-8">

        {/* Page Hero Header */}
        <div className="bg-[#FFFFFF] dark:bg-[#18181B] p-6 rounded-[16px] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-12 h-12 rounded-[12px] bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] flex items-center justify-center shrink-0">
              <FolderKanban size={24} />
            </div>
            <div className="min-w-0 space-y-1">
              <h1 className="text-[30px] font-semibold text-[#111827] dark:text-[#FAFAFA] tracking-tight leading-tight truncate">
                AI Workspaces
              </h1>
              <p className="text-[15px] font-normal text-[#6B7280] dark:text-[#A1A1AA] truncate">
                Organize AI chats, notes, documents, resumes, quizzes, and OCR files into collaborative workspaces.
              </p>
            </div>
          </div>

          <button
            onClick={handleOpenCreateModal}
            className="h-[40px] px-5 rounded-[10px] bg-[#111827] hover:bg-[#1F2937] dark:bg-[#FAFAFA] dark:hover:bg-[#E5E5E5] text-[#FFFFFF] dark:text-[#111111] font-medium text-[14px] transition flex items-center justify-center gap-2 cursor-pointer shrink-0 w-full sm:w-auto"
          >
            <Plus size={18} />
            <span>New Workspace</span>
          </button>
        </div>

        {/* 4 Statistics Cards Grid (2x2 Mobile, 4-Col Desktop, 24px Gap) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-[16px] bg-[#FFFFFF] dark:bg-[#18181B] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs flex items-center justify-between">
            <div className="min-w-0 flex-1 space-y-1">
              <p className="text-[14px] font-normal text-[#6B7280] dark:text-[#A1A1AA] truncate">Total Workspaces</p>
              <p className="text-[28px] font-semibold text-[#111827] dark:text-[#FAFAFA] leading-tight truncate">{workspaces.length}</p>
              <p className="text-[12px] font-normal text-[#6B7280] dark:text-[#A1A1AA] truncate">Active projects</p>
            </div>
            <div className="w-10 h-10 rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA] flex items-center justify-center shrink-0 ml-3">
              <Layers size={20} />
            </div>
          </div>

          <div className="p-6 rounded-[16px] bg-[#FFFFFF] dark:bg-[#18181B] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs flex items-center justify-between">
            <div className="min-w-0 flex-1 space-y-1">
              <p className="text-[14px] font-normal text-[#6B7280] dark:text-[#A1A1AA] truncate">Pinned</p>
              <p className="text-[28px] font-semibold text-[#111827] dark:text-[#FAFAFA] leading-tight truncate">{workspaces.filter((w) => w.is_pinned).length}</p>
              <p className="text-[12px] font-normal text-[#6B7280] dark:text-[#A1A1AA] truncate">Quick access</p>
            </div>
            <div className="w-10 h-10 rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA] flex items-center justify-center shrink-0 ml-3">
              <Star size={20} />
            </div>
          </div>

          <div className="p-6 rounded-[16px] bg-[#FFFFFF] dark:bg-[#18181B] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs flex items-center justify-between">
            <div className="min-w-0 flex-1 space-y-1">
              <p className="text-[14px] font-normal text-[#6B7280] dark:text-[#A1A1AA] truncate">Favorites</p>
              <p className="text-[28px] font-semibold text-[#111827] dark:text-[#FAFAFA] leading-tight truncate">{workspaces.filter((w) => w.is_favorite).length}</p>
              <p className="text-[12px] font-normal text-[#6B7280] dark:text-[#A1A1AA] truncate">Starred items</p>
            </div>
            <div className="w-10 h-10 rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA] flex items-center justify-center shrink-0 ml-3">
              <Heart size={20} />
            </div>
          </div>

          <div className="p-6 rounded-[16px] bg-[#FFFFFF] dark:bg-[#18181B] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs flex items-center justify-between">
            <div className="min-w-0 flex-1 space-y-1">
              <p className="text-[14px] font-normal text-[#6B7280] dark:text-[#A1A1AA] truncate">Archived</p>
              <p className="text-[28px] font-semibold text-[#111827] dark:text-[#FAFAFA] leading-tight truncate">{workspaces.filter((w) => w.is_archived).length}</p>
              <p className="text-[12px] font-normal text-[#6B7280] dark:text-[#A1A1AA] truncate">Stored projects</p>
            </div>
            <div className="w-10 h-10 rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA] flex items-center justify-center shrink-0 ml-3">
              <Archive size={20} />
            </div>
          </div>
        </div>

        {/* Controls Bar: Search, View Switcher & Filters */}
        <div className="bg-[#FFFFFF] dark:bg-[#18181B] p-6 rounded-[16px] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs space-y-6">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6">
            {/* Filter Tabs Navigation */}
            <div className="flex items-center bg-[#F8FAFC] dark:bg-[#111111] p-1.5 rounded-[12px] border border-[#E5E7EB] dark:border-[#2A2A2A] overflow-x-auto no-scrollbar w-full lg:w-auto">
              {[
                { id: 'all', label: 'All Workspaces' },
                { id: 'pinned', label: 'Pinned' },
                { id: 'favorites', label: 'Favorites' },
                { id: 'archived', label: 'Archived' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id as any)}
                  className={`h-[36px] px-4 rounded-[8px] text-[14px] font-medium transition whitespace-nowrap flex-1 lg:flex-initial cursor-pointer ${
                    activeFilter === tab.id
                      ? 'bg-[#111827] text-[#FFFFFF] dark:bg-[#FAFAFA] dark:text-[#111111]'
                      : 'text-[#6B7280] dark:text-[#A1A1AA] hover:bg-[#FFFFFF] dark:hover:bg-[#18181B]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* 100% Width Mobile Search Bar */}
            <div className="relative w-full sm:w-[320px] lg:w-[380px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7280] dark:text-[#A1A1AA]" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search workspaces..."
                className="w-full h-[40px] pl-10 pr-4 rounded-[10px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#FFFFFF] dark:bg-[#18181B] text-[14px] font-normal text-[#111827] dark:text-[#FAFAFA] outline-none"
              />
            </div>
          </div>
        </div>

        {/* Content View Grid (3 Columns Desktop, 2 Columns Tablet, 1 Column Mobile, 24px Gap) */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-[220px] rounded-[16px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#F8FAFC] dark:bg-[#111111] animate-pulse" />
            ))}
          </div>
        ) : filteredWorkspaces.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWorkspaces.map((ws) => (
              <div
                key={ws.id}
                onClick={() => navigate(`/workspaces/${ws.id}`)}
                className="p-6 rounded-[16px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#FFFFFF] dark:bg-[#18181B] shadow-xs hover:shadow-md transition-all duration-150 ease-in-out hover:-translate-y-[2px] cursor-pointer flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA] flex items-center justify-center shrink-0">
                      {renderIcon(ws.icon || 'Folder', 20)}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => handleTogglePin(ws, e)}
                        className={`h-8 w-8 rounded-[8px] flex items-center justify-center transition ${
                          ws.is_pinned ? 'text-[#111827] dark:text-[#FAFAFA]' : 'text-[#6B7280] dark:text-[#A1A1AA] hover:bg-[#F8FAFC] dark:hover:bg-[#232323]'
                        }`}
                      >
                        <Star size={16} fill={ws.is_pinned ? 'currentColor' : 'none'} />
                      </button>
                      <button
                        onClick={(e) => handleToggleFavorite(ws, e)}
                        className={`h-8 w-8 rounded-[8px] flex items-center justify-center transition ${
                          ws.is_favorite ? 'text-rose-500' : 'text-[#6B7280] dark:text-[#A1A1AA] hover:bg-[#F8FAFC] dark:hover:bg-[#232323]'
                        }`}
                      >
                        <Heart size={16} fill={ws.is_favorite ? 'currentColor' : 'none'} />
                      </button>
                      <button
                        onClick={(e) => handleDelete(ws.id, e)}
                        className="h-8 w-8 rounded-[8px] flex items-center justify-center text-[#6B7280] dark:text-[#A1A1AA] hover:text-rose-500 hover:bg-[#F8FAFC] dark:hover:bg-[#232323] transition"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-[17px] font-semibold text-[#111827] dark:text-[#FAFAFA] leading-tight truncate">
                      {ws.title}
                    </h3>
                    <p className="text-[14px] font-normal text-[#6B7280] dark:text-[#A1A1AA] line-clamp-2 mt-1">
                      {ws.description || 'No description added yet.'}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#E5E7EB] dark:border-[#2A2A2A] flex items-center justify-between text-[13px] font-normal text-[#6B7280] dark:text-[#A1A1AA]">
                  <span className="flex items-center gap-1.5"><Clock size={14} /> Updated {new Date(ws.updated_at).toLocaleDateString()}</span>
                  <span className="flex items-center gap-1 font-medium text-[#111827] dark:text-[#FAFAFA]">Open <ArrowRight size={14} /></span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 rounded-[16px] bg-[#FFFFFF] dark:bg-[#18181B] border border-[#E5E7EB] dark:border-[#2A2A2A] text-center space-y-3">
            <FolderKanban className="mx-auto text-[#6B7280] dark:text-[#A1A1AA]" size={40} />
            <h3 className="text-[20px] font-semibold text-[#111827] dark:text-[#FAFAFA]">No workspaces found</h3>
            <p className="text-[14px] font-normal text-[#6B7280] dark:text-[#A1A1AA]">Create a new workspace to organize your course chats, notes, and documents.</p>
            <button
              onClick={handleOpenCreateModal}
              className="mt-2 h-[40px] px-5 rounded-[10px] bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] text-[14px] font-medium inline-flex items-center gap-2 cursor-pointer"
            >
              <Plus size={16} /> New Workspace
            </button>
          </div>
        )}

      </div>

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4" onClick={() => setModalOpen(false)}>
          <div className="w-full max-w-md bg-[#FFFFFF] dark:bg-[#18181B] p-6 rounded-[16px] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-2xl space-y-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB] dark:border-[#2A2A2A]">
              <h3 className="text-[20px] font-semibold text-[#111827] dark:text-[#FAFAFA]">
                {editingId ? 'Edit Workspace' : 'Create New Workspace'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="h-8 w-8 rounded-[8px] border border-[#E5E7EB] dark:border-[#2A2A2A] flex items-center justify-center text-[#111827] dark:text-[#FAFAFA]">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveWorkspace} className="space-y-4">
              <div>
                <label className="text-[14px] font-medium text-[#111827] dark:text-[#FAFAFA] block mb-1">Title</label>
                <input
                  type="text"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  placeholder="e.g. Data Structures & Algorithms"
                  className="w-full h-[40px] px-3.5 rounded-[10px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#FFFFFF] dark:bg-[#18181B] text-[14px] text-[#111827] dark:text-[#FAFAFA] outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-[14px] font-medium text-[#111827] dark:text-[#FAFAFA] block mb-1">Description</label>
                <textarea
                  value={descInput}
                  onChange={(e) => setDescInput(e.target.value)}
                  placeholder="Optional workspace notes..."
                  className="w-full h-20 p-3 rounded-[10px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#FFFFFF] dark:bg-[#18181B] text-[14px] text-[#111827] dark:text-[#FAFAFA] outline-none resize-none"
                />
              </div>

              <div>
                <label className="text-[14px] font-medium text-[#111827] dark:text-[#FAFAFA] block mb-2">Choose Icon</label>
                <div className="grid grid-cols-3 gap-2">
                  {ICON_OPTIONS.map((opt) => {
                    const IconComponent = opt.icon;
                    const isSelected = selectedIcon === opt.name;
                    return (
                      <button
                        key={opt.name}
                        type="button"
                        onClick={() => setSelectedIcon(opt.name)}
                        className={`p-2.5 rounded-[10px] border flex flex-col items-center gap-1.5 text-xs font-medium cursor-pointer transition ${
                          isSelected
                            ? 'border-[#111827] dark:border-[#FAFAFA] bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111]'
                            : 'border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#FFFFFF] dark:bg-[#18181B] text-[#6B7280] dark:text-[#A1A1AA]'
                        }`}
                      >
                        <IconComponent size={18} />
                        <span className="truncate max-w-[80px]">{opt.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 border-t border-[#E5E7EB] dark:border-[#2A2A2A] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="h-[40px] px-4 rounded-[10px] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[14px] font-medium text-[#111827] dark:text-[#FAFAFA]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-[40px] px-5 rounded-[10px] bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] text-[14px] font-medium cursor-pointer"
                >
                  {isSubmitting ? 'Saving...' : editingId ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
