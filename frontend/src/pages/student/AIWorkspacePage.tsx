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
  CalendarDays
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
import { PageHeader } from '../../components/ui';

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
    <div className="w-full h-full overflow-x-hidden overflow-y-auto bg-[#FFFFFF] dark:bg-[#0A0A0A] text-[#111827] dark:text-[#FAFAFA] p-4 sm:p-6 md:p-8 transition-colors select-none">
      {/* 1440px Centered Max Content Width Container */}
      <div className="w-full max-w-[1440px] mx-auto space-y-6">

        {/* Compact Hero Header (Matching AI Study Planner layout) */}
        <div className="bg-[#FFFFFF] dark:bg-[#18181B] p-4 sm:p-5 rounded-[16px] border border-[#D1D5DB] dark:border-[#3F3F46] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
            <div className="w-[40px] h-[40px] sm:w-[44px] sm:h-[44px] rounded-[10px] bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] flex items-center justify-center shrink-0">
              <FolderKanban size={22} />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-[20px] sm:text-[30px] font-[600] text-[#111827] dark:text-[#FAFAFA] tracking-tight leading-[1.2] truncate">
                AI Workspaces
              </h1>
              <p className="text-[13px] sm:text-[14px] font-[500] text-[#6B7280] dark:text-[#A1A1AA] mt-0.5 truncate">
                Organize AI chats, notes, documents, resumes, quizzes, and OCR files into collaborative workspaces.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3 shrink-0 w-full lg:w-auto pt-2 lg:pt-0 border-t lg:border-t-0 border-[#E5E7EB] dark:border-[#27272A]">
            <div className="hidden xl:flex items-center gap-2">
              <span className="h-[36px] inline-flex items-center gap-1.5 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#F8FAFC] dark:bg-[#111111] px-3 text-[14px] font-[500] text-[#111827] dark:text-[#FAFAFA]">
                <Layers size={15} />
                Workspaces: {workspaces.length}
              </span>
              <span className="h-[36px] inline-flex items-center gap-1.5 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#F8FAFC] dark:bg-[#111111] px-3 text-[14px] font-[500] text-[#111827] dark:text-[#FAFAFA]">
                <Star size={15} />
                Pinned: {workspaces.filter((w) => w.is_pinned).length}
              </span>
            </div>

            <button
              onClick={handleOpenCreateModal}
              className="h-[38px] sm:h-[40px] px-[16px] sm:px-[18px] rounded-[12px] bg-[#111827] hover:bg-[#1F2937] active:bg-[#0F172A] dark:bg-[#FAFAFA] dark:hover:bg-[#F3F4F6] text-[#FFFFFF] dark:text-[#111111] text-[14px] font-[500] transition flex items-center justify-center gap-2 cursor-pointer shrink-0 active:scale-[0.98] w-full sm:w-auto"
            >
              <Plus size={16} />
              <span>Create Workspace</span>
            </button>
          </div>
        </div>

        {/* Workspace Overview Cards Banner (88px height matching Study Analytics Banner) */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 select-none">
          <div className="h-[88px] p-3.5 sm:p-[16px] rounded-[16px] bg-[#FFFFFF] dark:bg-[#18181B] border border-[#D1D5DB] dark:border-[#3F3F46] shadow-xs flex items-center justify-between transition-all duration-150 ease-in-out hover:-translate-y-[2px] hover:shadow-md">
            <div className="min-w-0 flex-1 space-y-0.5">
              <p className="text-[12px] sm:text-[13px] font-[400] text-[#6B7280] dark:text-[#A1A1AA] truncate">Total Workspaces</p>
              <p className="text-[26px] sm:text-[30px] font-[600] text-[#111827] dark:text-[#FAFAFA] leading-none truncate">{workspaces.length}</p>
              <p className="text-[11px] sm:text-[13px] font-[400] text-[#6B7280] dark:text-[#A1A1AA] truncate pt-0.5">Active environments</p>
            </div>
            <div className="w-[34px] h-[34px] sm:w-[40px] sm:h-[40px] rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#D1D5DB] dark:border-[#3F3F46] text-[#111827] dark:text-[#FAFAFA] flex items-center justify-center shrink-0 ml-2 sm:ml-3">
              <FolderKanban size={18} />
            </div>
          </div>

          <div className="h-[88px] p-3.5 sm:p-[16px] rounded-[16px] bg-[#FFFFFF] dark:bg-[#18181B] border border-[#D1D5DB] dark:border-[#3F3F46] shadow-xs flex items-center justify-between transition-all duration-150 ease-in-out hover:-translate-y-[2px] hover:shadow-md">
            <div className="min-w-0 flex-1 space-y-0.5">
              <p className="text-[12px] sm:text-[13px] font-[400] text-[#6B7280] dark:text-[#A1A1AA] truncate">Pinned Workspaces</p>
              <p className="text-[26px] sm:text-[30px] font-[600] text-[#111827] dark:text-[#FAFAFA] leading-none truncate">{workspaces.filter((w) => w.is_pinned).length}</p>
              <p className="text-[11px] sm:text-[13px] font-[400] text-[#6B7280] dark:text-[#A1A1AA] truncate pt-0.5">Quick access</p>
            </div>
            <div className="w-[34px] h-[34px] sm:w-[40px] sm:h-[40px] rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#D1D5DB] dark:border-[#3F3F46] text-[#111827] dark:text-[#FAFAFA] flex items-center justify-center shrink-0 ml-2 sm:ml-3">
              <Star size={18} />
            </div>
          </div>

          <div className="h-[88px] p-3.5 sm:p-[16px] rounded-[16px] bg-[#FFFFFF] dark:bg-[#18181B] border border-[#D1D5DB] dark:border-[#3F3F46] shadow-xs flex items-center justify-between transition-all duration-150 ease-in-out hover:-translate-y-[2px] hover:shadow-md">
            <div className="min-w-0 flex-1 space-y-0.5">
              <p className="text-[12px] sm:text-[13px] font-[400] text-[#6B7280] dark:text-[#A1A1AA] truncate">Favorites</p>
              <p className="text-[26px] sm:text-[30px] font-[600] text-[#111827] dark:text-[#FAFAFA] leading-none truncate">{workspaces.filter((w) => w.is_favorite).length}</p>
              <p className="text-[11px] sm:text-[13px] font-[400] text-[#6B7280] dark:text-[#A1A1AA] truncate pt-0.5">Starred projects</p>
            </div>
            <div className="w-[34px] h-[34px] sm:w-[40px] sm:h-[40px] rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#D1D5DB] dark:border-[#3F3F46] text-[#111827] dark:text-[#FAFAFA] flex items-center justify-center shrink-0 ml-2 sm:ml-3">
              <Heart size={18} />
            </div>
          </div>

          <div className="h-[88px] p-3.5 sm:p-[16px] rounded-[16px] bg-[#FFFFFF] dark:bg-[#18181B] border border-[#D1D5DB] dark:border-[#3F3F46] shadow-xs flex items-center justify-between transition-all duration-150 ease-in-out hover:-translate-y-[2px] hover:shadow-md">
            <div className="min-w-0 flex-1 space-y-0.5">
              <p className="text-[12px] sm:text-[13px] font-[400] text-[#6B7280] dark:text-[#A1A1AA] truncate">Linked Items</p>
              <p className="text-[26px] sm:text-[30px] font-[600] text-[#111827] dark:text-[#FAFAFA] leading-none truncate">
                {workspaces.reduce((acc, curr) => acc + curr.chat_count + curr.document_count + curr.note_count, 0)}
              </p>
              <p className="text-[11px] sm:text-[13px] font-[400] text-[#6B7280] dark:text-[#A1A1AA] truncate pt-0.5">Chats, docs & notes</p>
            </div>
            <div className="w-[34px] h-[34px] sm:w-[40px] sm:h-[40px] rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#D1D5DB] dark:border-[#3F3F46] text-[#111827] dark:text-[#FAFAFA] flex items-center justify-center shrink-0 ml-2 sm:ml-3">
              <Sparkles size={18} />
            </div>
          </div>
        </div>

        {/* ── DETAIL VIEW (IF SELECTED) ── */}
        {selectedWorkspace ? (
          <div className="space-y-6">
            {/* Detail Top Bar */}
            <div className="bg-[#FFFFFF] dark:bg-[#18181B] p-5 sm:p-6 rounded-[16px] border border-[#D1D5DB] dark:border-[#3F3F46] shadow-xs space-y-5 select-none">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => {
                    setSelectedWorkspace(null);
                    navigate('/workspaces');
                  }}
                  className="flex items-center gap-1.5 text-[14px] font-[500] text-[#111827] dark:text-[#FAFAFA] hover:underline cursor-pointer"
                >
                  <ChevronLeft size={16} />
                  <span>Back to All Workspaces</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleTogglePin(selectedWorkspace)}
                    className={`h-[36px] w-[36px] rounded-[10px] border flex items-center justify-center text-[14px] font-[500] transition cursor-pointer active:scale-[0.98] ${
                      selectedWorkspace.is_pinned
                        ? 'bg-[#111827] text-[#FFFFFF] dark:bg-[#FAFAFA] dark:text-[#111111] border-[#111827]'
                        : 'bg-[#FFFFFF] dark:bg-[#18181B] text-[#111827] dark:text-[#FAFAFA] border-[#D1D5DB] dark:border-[#3F3F46] hover:bg-[#F8FAFC] dark:hover:bg-[#232323]'
                    }`}
                    title={selectedWorkspace.is_pinned ? 'Unpin Workspace' : 'Pin Workspace'}
                  >
                    <Star size={16} className={selectedWorkspace.is_pinned ? 'fill-current' : ''} />
                  </button>

                  <button
                    onClick={() => handleOpenEditModal(selectedWorkspace)}
                    className="h-[36px] w-[36px] rounded-[10px] border bg-[#FFFFFF] dark:bg-[#18181B] border-[#D1D5DB] dark:border-[#3F3F46] text-[#111827] dark:text-[#FAFAFA] hover:bg-[#F8FAFC] dark:hover:bg-[#232323] transition flex items-center justify-center cursor-pointer active:scale-[0.98]"
                    title="Workspace Settings"
                  >
                    <Settings size={16} />
                  </button>

                  <button
                    onClick={() => navigate('/dashboard')}
                    className="h-[36px] px-4 rounded-[10px] bg-[#111827] hover:bg-[#1F2937] dark:bg-[#FAFAFA] dark:hover:bg-[#F3F4F6] text-[#FFFFFF] dark:text-[#111111] text-[14px] font-[500] transition flex items-center gap-2 cursor-pointer active:scale-[0.98]"
                  >
                    <MessageSquare size={14} />
                    <span>Launch AI Chat Here</span>
                  </button>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-[44px] h-[44px] rounded-[10px] bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] flex items-center justify-center shrink-0">
                  {renderIcon(selectedWorkspace.icon, 22)}
                </div>
                <div>
                  <h2 className="text-[22px] font-[700] text-[#111827] dark:text-[#FAFAFA]">
                    {selectedWorkspace.title}
                  </h2>
                  <p className="text-[14px] font-[500] text-[#6B7280] dark:text-[#A1A1AA] mt-0.5">
                    {selectedWorkspace.description || 'No description provided for this workspace.'}
                  </p>
                </div>
              </div>

              {/* Sub-Tabs Switcher */}
              <div className="flex items-center bg-[#F8FAFC] dark:bg-[#111111] p-1 rounded-[12px] border border-[#D1D5DB] dark:border-[#3F3F46] min-h-[44px] max-w-full overflow-x-auto no-scrollbar">
                {[
                  { id: 'chats', label: `AI Chats (${selectedWorkspace.chats.length})`, icon: MessageSquare },
                  { id: 'docs', label: `Documents (${selectedWorkspace.documents.length})`, icon: FileText },
                  { id: 'notes', label: `AI Notes (${selectedWorkspace.notes.length})`, icon: Sparkles },
                  { id: 'quizzes', label: `Quizzes (${selectedWorkspace.quizzes.length})`, icon: HelpCircle },
                  { id: 'timeline', label: 'Activity Timeline', icon: Clock },
                ].map((tb) => {
                  const Icon = tb.icon;
                  const isActive = activeDetailTab === tb.id;
                  return (
                    <button
                      key={tb.id}
                      onClick={() => setActiveDetailTab(tb.id as any)}
                      className={`h-[36px] px-3.5 rounded-[8px] text-[14px] font-[500] transition flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                        isActive
                          ? 'bg-[#111827] text-[#FFFFFF] dark:bg-[#FAFAFA] dark:text-[#111111]'
                          : 'text-[#6B7280] dark:text-[#A1A1AA] hover:bg-[#FFFFFF] dark:hover:bg-[#18181B]'
                      }`}
                    >
                      <Icon size={14} />
                      <span>{tb.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tab Content Panel */}
            <div className="bg-[#FFFFFF] dark:bg-[#18181B] p-5 sm:p-6 rounded-[16px] border border-[#D1D5DB] dark:border-[#3F3F46] shadow-xs min-h-[300px] select-none">
              {activeDetailTab === 'chats' && (
                <div className="space-y-3">
                  {selectedWorkspace.chats.length === 0 ? (
                    <div className="text-center py-12 text-[#6B7280] dark:text-[#A1A1AA] text-[14px] font-[500]">
                      No AI Chats linked to this workspace yet. Start a new chat from the top button!
                    </div>
                  ) : (
                    selectedWorkspace.chats.map((c: any, i: number) => (
                      <div key={i} className="p-4 rounded-[12px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#18181B] flex items-center justify-between hover:bg-[#F8FAFC] dark:hover:bg-[#232323] transition">
                        <div className="flex items-center gap-3">
                          <div className="w-[36px] h-[36px] rounded-[10px] bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] flex items-center justify-center shrink-0">
                            <MessageSquare size={16} />
                          </div>
                          <div>
                            <h4 className="text-[14px] font-[500] text-[#111827] dark:text-[#FAFAFA]">{c.title || 'Untitled Chat'}</h4>
                            <p className="text-[12px] font-[500] text-[#6B7280] dark:text-[#A1A1AA]">Session ID: {c.id}</p>
                          </div>
                        </div>
                        <button onClick={() => navigate('/dashboard')} className="text-[13px] text-[#111827] dark:text-[#FAFAFA] font-[700] flex items-center gap-1 hover:underline cursor-pointer">
                          <span>Open</span>
                          <ArrowRight size={14} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeDetailTab === 'docs' && (
                <div className="space-y-3">
                  {selectedWorkspace.documents.length === 0 ? (
                    <div className="text-center py-12 text-[#6B7280] dark:text-[#A1A1AA] text-[14px] font-[500]">
                      No uploaded documents in this workspace.
                    </div>
                  ) : (
                    selectedWorkspace.documents.map((d: any, i: number) => (
                      <div key={i} className="p-4 rounded-[12px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#18181B] flex items-center justify-between hover:bg-[#F8FAFC] dark:hover:bg-[#232323] transition">
                        <div className="flex items-center gap-3">
                          <div className="w-[36px] h-[36px] rounded-[10px] bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] flex items-center justify-center shrink-0">
                            <FileText size={16} />
                          </div>
                          <div>
                            <h4 className="text-[14px] font-[500] text-[#111827] dark:text-[#FAFAFA]">{d.filename}</h4>
                            <p className="text-[12px] font-[500] text-[#6B7280] dark:text-[#A1A1AA]">Type: {d.file_type || 'PDF/Doc'}</p>
                          </div>
                        </div>
                        <button onClick={() => navigate('/documents')} className="text-[13px] text-[#111827] dark:text-[#FAFAFA] font-[700] flex items-center gap-1 hover:underline cursor-pointer">
                          <span>View in Hub</span>
                          <ArrowRight size={14} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeDetailTab === 'notes' && (
                <div className="space-y-3">
                  {selectedWorkspace.notes.length === 0 ? (
                    <div className="text-center py-12 text-[#6B7280] dark:text-[#A1A1AA] text-[14px] font-[500]">
                      No AI Notes generated in this workspace yet.
                    </div>
                  ) : (
                    selectedWorkspace.notes.map((n: any, i: number) => (
                      <div key={i} className="p-4 rounded-[12px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#18181B] flex items-center justify-between hover:bg-[#F8FAFC] dark:hover:bg-[#232323] transition">
                        <div className="flex items-center gap-3">
                          <div className="w-[36px] h-[36px] rounded-[10px] bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] flex items-center justify-center shrink-0">
                            <Sparkles size={16} />
                          </div>
                          <div>
                            <h4 className="text-[14px] font-[500] text-[#111827] dark:text-[#FAFAFA]">{n.title}</h4>
                            <p className="text-[12px] font-[500] text-[#6B7280] dark:text-[#A1A1AA]">Source: {n.document_name}</p>
                          </div>
                        </div>
                        <button onClick={() => navigate('/ai-notes')} className="text-[13px] text-[#111827] dark:text-[#FAFAFA] font-[700] flex items-center gap-1 hover:underline cursor-pointer">
                          <span>Open Notes</span>
                          <ArrowRight size={14} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeDetailTab === 'quizzes' && (
                <div className="space-y-3">
                  {selectedWorkspace.quizzes.length === 0 ? (
                    <div className="text-center py-12 text-[#6B7280] dark:text-[#A1A1AA] text-[14px] font-[500]">
                      No Quizzes linked to this workspace.
                    </div>
                  ) : (
                    selectedWorkspace.quizzes.map((q: any, i: number) => (
                      <div key={i} className="p-4 rounded-[12px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#18181B] flex items-center justify-between hover:bg-[#F8FAFC] dark:hover:bg-[#232323] transition">
                        <div className="flex items-center gap-3">
                          <div className="w-[36px] h-[36px] rounded-[10px] bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] flex items-center justify-center shrink-0">
                            <HelpCircle size={16} />
                          </div>
                          <div>
                            <h4 className="text-[14px] font-[500] text-[#111827] dark:text-[#FAFAFA]">{q.title}</h4>
                            <p className="text-[12px] font-[500] text-[#6B7280] dark:text-[#A1A1AA]">Subject: {q.subject}</p>
                          </div>
                        </div>
                        <button onClick={() => navigate('/quiz')} className="text-[13px] text-[#111827] dark:text-[#FAFAFA] font-[700] flex items-center gap-1 hover:underline cursor-pointer">
                          <span>Take Quiz</span>
                          <ArrowRight size={14} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeDetailTab === 'timeline' && (
                <div className="space-y-4">
                  <h4 className="text-[12px] font-[400] text-[#6B7280] dark:text-[#A1A1AA] uppercase tracking-wider">Workspace Event Log</h4>
                  <div className="border-l-2 border-[#D1D5DB] dark:border-[#3F3F46] pl-4 space-y-4 text-[13px]">
                    <div>
                      <span className="text-[#6B7280] dark:text-[#A1A1AA] font-mono text-[11px]">Today</span>
                      <p className="font-[600] text-[#111827] dark:text-[#FAFAFA]">Workspace created and configured.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* ── DASHBOARD GRID VIEW ── */
          <div className="space-y-6 select-none">
            
            {/* ── Search & Filter Controls Toolbar ── */}
            <div className="bg-[#FFFFFF] dark:bg-[#18181B] p-3 sm:p-4 rounded-[16px] border border-[#D1D5DB] dark:border-[#3F3F46] flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4">
              {/* Filter Pills Segmented Control */}
              <div className="flex items-center bg-[#F8FAFC] dark:bg-[#111111] p-1 rounded-[12px] border border-[#D1D5DB] dark:border-[#3F3F46] min-h-[44px] max-w-full overflow-x-auto no-scrollbar">
                {[
                  { id: 'all', label: 'All Workspaces' },
                  { id: 'pinned', label: 'Pinned' },
                  { id: 'favorites', label: 'Favorites' },
                  { id: 'archived', label: 'Archived' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveFilter(tab.id as any)}
                    className={`h-[36px] px-3.5 sm:px-4 rounded-[8px] text-[14px] font-[500] transition cursor-pointer whitespace-nowrap shrink-0 ${
                      activeFilter === tab.id
                        ? 'bg-[#111827] text-[#FFFFFF] dark:bg-[#FAFAFA] dark:text-[#111111]'
                        : 'text-[#6B7280] dark:text-[#A1A1AA] hover:bg-[#FFFFFF] dark:hover:bg-[#18181B]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Search Bar Input */}
              <div className="relative flex-1 lg:w-64">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7280] dark:text-[#A1A1AA]" />
                <input
                  type="text"
                  placeholder="Search workspaces..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-[38px] sm:h-[40px] pl-9 pr-4 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#18181B] text-[13px] sm:text-[14px] font-[600] text-[#111827] dark:text-[#FAFAFA] outline-none"
                />
              </div>
            </div>

            {/* ── Grid of Workspaces ── */}
            {loading ? (
              <div className="text-center py-20 text-[#6B7280] dark:text-[#A1A1AA] text-[14px]">
                <RefreshCw size={24} className="animate-spin mx-auto text-[#111827] dark:text-[#FAFAFA] mb-3" />
                <span>Loading AI Workspaces...</span>
              </div>
            ) : filteredWorkspaces.length === 0 ? (
              /* ── Empty State Card ── */
              <div className="bg-[#FFFFFF] dark:bg-[#18181B] p-12 text-center rounded-[16px] border border-[#D1D5DB] dark:border-[#3F3F46] shadow-xs space-y-4">
                <div className="w-[80px] h-[80px] rounded-[16px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#D1D5DB] dark:border-[#3F3F46] flex items-center justify-center mx-auto text-[#111827] dark:text-[#FAFAFA]">
                  <FolderKanban size={36} />
                </div>
                <div>
                  <h3 className="text-[20px] font-[700] text-[#111827] dark:text-[#FAFAFA]">No Workspaces Found</h3>
                  <p className="text-[14px] font-[500] text-[#6B7280] dark:text-[#A1A1AA] max-w-md mx-auto mt-1">
                    Create your first workspace to organize AI projects, study materials, documents, and chats.
                  </p>
                </div>
                <button
                  onClick={handleOpenCreateModal}
                  className="h-[40px] px-5 rounded-[12px] bg-[#111827] hover:bg-[#1F2937] dark:bg-[#FAFAFA] dark:hover:bg-[#F3F4F6] text-[#FFFFFF] dark:text-[#111111] font-[700] text-[14px] transition flex items-center justify-center gap-2 cursor-pointer mx-auto active:scale-[0.98]"
                >
                  <Plus size={16} />
                  <span>Create Workspace</span>
                </button>
              </div>
            ) : (
              /* ── Workspace Cards Grid ── */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredWorkspaces.map((ws) => (
                  <div
                    key={ws.id}
                    onClick={() => {
                      setSelectedWorkspace(null);
                      navigate(`/workspaces/${ws.id}`);
                    }}
                    className="group bg-[#FFFFFF] dark:bg-[#18181B] p-[18px] sm:p-5 rounded-[16px] border border-[#D1D5DB] dark:border-[#3F3F46] shadow-xs hover:shadow-md transition-all duration-150 ease-in-out hover:-translate-y-[2px] cursor-pointer flex flex-col justify-between space-y-4 h-full"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-[40px] h-[40px] rounded-[10px] bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] flex items-center justify-center shrink-0">
                          {renderIcon(ws.icon, 20)}
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={(e) => handleTogglePin(ws, e)}
                            className={`h-[34px] w-[34px] rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] flex items-center justify-center transition cursor-pointer shrink-0 active:scale-[0.98] ${
                              ws.is_pinned 
                                ? 'bg-[#111827] text-[#FFFFFF] dark:bg-[#FAFAFA] dark:text-[#111111]' 
                                : 'bg-[#FFFFFF] dark:bg-[#18181B] text-[#6B7280] dark:text-[#A1A1AA] hover:bg-[#F8FAFC] dark:hover:bg-[#232323]'
                            }`}
                            title={ws.is_pinned ? 'Unpin' : 'Pin'}
                          >
                            <Star size={15} className={ws.is_pinned ? 'fill-current' : ''} />
                          </button>

                          <button
                            onClick={(e) => handleToggleFavorite(ws, e)}
                            className={`h-[34px] w-[34px] rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] flex items-center justify-center transition cursor-pointer shrink-0 active:scale-[0.98] ${
                              ws.is_favorite 
                                ? 'bg-[#111827] text-[#FFFFFF] dark:bg-[#FAFAFA] dark:text-[#111111]' 
                                : 'bg-[#FFFFFF] dark:bg-[#18181B] text-[#6B7280] dark:text-[#A1A1AA] hover:bg-[#F8FAFC] dark:hover:bg-[#232323]'
                            }`}
                            title={ws.is_favorite ? 'Remove Favorite' : 'Favorite'}
                          >
                            <Heart size={15} className={ws.is_favorite ? 'fill-current' : ''} />
                          </button>

                          <button
                            onClick={(e) => handleDelete(ws.id, e)}
                            className="h-[34px] w-[34px] rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#18181B] text-[#6B7280] dark:text-[#A1A1AA] hover:text-[#DC2626] hover:bg-[#F8FAFC] dark:hover:bg-[#232323] transition flex items-center justify-center cursor-pointer shrink-0 active:scale-[0.98]"
                            title="Delete Workspace"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>

                      <h3 className="text-[18px] font-[700] text-[#111827] dark:text-[#FAFAFA] group-hover:text-[#000000] dark:group-hover:text-white transition-colors leading-snug">
                        {ws.title}
                      </h3>
                      <p className="text-[14px] font-[500] text-[#6B7280] dark:text-[#A1A1AA] line-clamp-2 mt-1 leading-relaxed">
                        {ws.description || 'No description added for this workspace.'}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[#D1D5DB] dark:border-[#3F3F46] flex items-center justify-between text-[14px] font-[500] text-[#6B7280] dark:text-[#A1A1AA]">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1.5"><MessageSquare size={14} className="text-[#111827] dark:text-[#FAFAFA]" /> {ws.chat_count} Chats</span>
                        <span className="flex items-center gap-1.5"><FileText size={14} className="text-[#111827] dark:text-[#FAFAFA]" /> {ws.document_count} Docs</span>
                        <span className="flex items-center gap-1.5"><Sparkles size={14} className="text-[#111827] dark:text-[#FAFAFA]" /> {ws.note_count} Notes</span>
                      </div>
                      <ArrowRight size={16} className="text-[#6B7280] dark:text-[#A1A1AA] group-hover:text-[#111827] dark:group-hover:text-[#FAFAFA] transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── CREATE / EDIT WORKSPACE MODAL ── */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="relative w-full max-w-md bg-[#FFFFFF] dark:bg-[#18181B] rounded-[16px] shadow-lg border border-[#D1D5DB] dark:border-[#3F3F46] overflow-hidden select-none">
              <div className="flex items-center justify-between p-5 border-b border-[#D1D5DB] dark:border-[#3F3F46] bg-[#F8FAFC] dark:bg-[#111111]">
                <div className="flex items-center gap-3">
                  <div className="w-[40px] h-[40px] rounded-[10px] bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] flex items-center justify-center shrink-0">
                    <FolderKanban size={20} />
                  </div>
                  <h3 className="text-[18px] font-[700] text-[#111827] dark:text-[#FAFAFA]">
                    {editingId ? 'Edit Workspace' : 'Create New AI Workspace'}
                  </h3>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  className="h-8 w-8 rounded-[8px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#18181B] text-[#111827] dark:text-[#FAFAFA] flex items-center justify-center shrink-0 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveWorkspace} className="p-6 space-y-4">
                <div>
                  <label className="block text-[12px] font-[400] uppercase tracking-wider text-[#6B7280] dark:text-[#A1A1AA] mb-1">
                    Workspace Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Operating Systems & Architecture"
                    value={titleInput}
                    onChange={(e) => setTitleInput(e.target.value)}
                    className="w-full h-[40px] px-3.5 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#18181B] text-[#111827] dark:text-[#FAFAFA] text-[14px] font-[600] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-[400] uppercase tracking-wider text-[#6B7280] dark:text-[#A1A1AA] mb-1">
                    Description (Optional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Brief objective or course outline for this workspace..."
                    value={descInput}
                    onChange={(e) => setDescInput(e.target.value)}
                    className="w-full p-3.5 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#18181B] text-[#111827] dark:text-[#FAFAFA] text-[14px] font-[500] outline-none leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-[400] uppercase tracking-wider text-[#6B7280] dark:text-[#A1A1AA] mb-1.5">
                    Workspace Icon & Category
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {ICON_OPTIONS.map((ico) => {
                      const IconComponent = ico.icon;
                      const isSelected = selectedIcon === ico.name;
                      return (
                        <button
                          key={ico.name}
                          type="button"
                          onClick={() => setSelectedIcon(ico.name)}
                          className={`p-2.5 rounded-[10px] border text-[12px] font-[400] flex items-center gap-2 transition cursor-pointer active:scale-[0.98] ${
                            isSelected
                              ? 'bg-[#111827] text-[#FFFFFF] dark:bg-[#FAFAFA] dark:text-[#111111] border-[#111827]'
                              : 'bg-[#FFFFFF] dark:bg-[#18181B] border-[#D1D5DB] dark:border-[#3F3F46] text-[#6B7280] dark:text-[#A1A1AA] hover:bg-[#F8FAFC] dark:hover:bg-[#232323]'
                          }`}
                        >
                          <IconComponent size={16} />
                          <span className="truncate">{ico.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#D1D5DB] dark:border-[#3F3F46]">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="h-[40px] px-5 rounded-[12px] border border-[#D1D5DB] dark:border-[#3F3F46] text-[#111827] dark:text-[#FAFAFA] text-[14px] font-[500] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="h-[40px] px-6 rounded-[12px] bg-[#111827] hover:bg-[#1F2937] active:bg-[#0F172A] dark:bg-[#FAFAFA] dark:hover:bg-[#F3F4F6] text-[#FFFFFF] dark:text-[#111111] font-[700] text-[14px] shadow-xs cursor-pointer inline-flex items-center gap-2 active:scale-[0.98]"
                  >
                    <span>{isSubmitting ? 'Saving...' : editingId ? 'Save Changes' : 'Create Workspace'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

