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
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-white dark:bg-[#0A0A0A] text-[#111827] dark:text-[#FAFAFA] font-body transition-colors duration-200">
      <div className="mx-auto max-w-7xl space-y-6">
        
        {/* ── 1. Page Header Component ── */}
        <PageHeader
          title="AI Workspaces"
          description="Organize chats, study materials, notes, quizzes, and resumes into isolated AI project spaces."
          icon={FolderKanban}
          actionText="New Workspace"
          actionIcon={Plus}
          onActionClick={handleOpenCreateModal}
        />

        {/* ── 2. DETAIL VIEW (IF SELECTED) ── */}
        {selectedWorkspace ? (
          <div className="space-y-6">
            {/* Detail Top Bar */}
            <div className="bg-white dark:bg-[#181818] p-6 rounded-xl border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-[0_1px_3px_rgba(0,0,0,0.08)] space-y-5">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => {
                    setSelectedWorkspace(null);
                    navigate('/workspaces');
                  }}
                  className="flex items-center gap-1.5 text-xs text-[#111827] dark:text-[#FAFAFA] font-medium hover:underline cursor-pointer"
                >
                  <ChevronLeft size={16} />
                  <span>Back to All Workspaces</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleTogglePin(selectedWorkspace)}
                    className={`p-2 rounded-lg border text-xs font-medium transition cursor-pointer ${
                      selectedWorkspace.is_pinned
                        ? 'bg-[#111827] text-white dark:bg-[#FAFAFA] dark:text-[#111111] border-[#111827]'
                        : 'bg-[#F9FAFB] dark:bg-[#232323] text-[#6B7280] dark:text-[#A3A3A3] border-[#E5E7EB] dark:border-[#2A2A2A] hover:text-[#111827] dark:hover:text-[#FAFAFA]'
                    }`}
                    title={selectedWorkspace.is_pinned ? 'Unpin Workspace' : 'Pin Workspace'}
                  >
                    <Star size={16} className={selectedWorkspace.is_pinned ? 'fill-current' : ''} />
                  </button>

                  <button
                    onClick={() => handleOpenEditModal(selectedWorkspace)}
                    className="p-2 rounded-lg border bg-[#F9FAFB] dark:bg-[#232323] border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA] hover:bg-[#F3F4F6] transition cursor-pointer"
                    title="Workspace Settings"
                  >
                    <Settings size={16} />
                  </button>

                  <button
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center gap-2 px-4 py-2 rounded-[10px] bg-[#111827] hover:bg-[#000000] dark:bg-[#FAFAFA] dark:hover:bg-white text-white dark:text-[#111111] text-xs font-medium transition shadow-[0_1px_3px_rgba(0,0,0,0.08)] cursor-pointer"
                  >
                    <MessageSquare size={14} />
                    <span>Launch AI Chat Here</span>
                  </button>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-[12px] bg-[#F3F4F6] dark:bg-[#232323] text-[#111827] dark:text-[#FAFAFA] flex items-center justify-center border border-[#E5E7EB] dark:border-[#2A2A2A] shrink-0">
                  {renderIcon(selectedWorkspace.icon, 22)}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#111827] dark:text-[#FAFAFA]">
                    {selectedWorkspace.title}
                  </h2>
                  <p className="text-sm text-[#6B7280] dark:text-[#A3A3A3] mt-0.5">
                    {selectedWorkspace.description || 'No description provided for this workspace.'}
                  </p>
                </div>
              </div>

              {/* Sub-Tabs */}
              <div className="flex items-center gap-1.5 p-1 bg-[#F3F4F6] dark:bg-[#232323] rounded-lg overflow-x-auto no-scrollbar">
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
                      className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                        isActive
                          ? 'bg-[#111827] text-white dark:bg-[#FAFAFA] dark:text-[#111111] shadow-[0_1px_3px_rgba(0,0,0,0.08)]'
                          : 'text-[#6B7280] dark:text-[#A3A3A3] hover:text-[#111827] dark:hover:text-[#FAFAFA]'
                      }`}
                    >
                      <Icon size={14} />
                      <span>{tb.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tab Contents */}
            <div className="bg-white dark:bg-[#181818] p-6 rounded-xl border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-[0_1px_3px_rgba(0,0,0,0.08)] min-h-[300px]">
              {activeDetailTab === 'chats' && (
                <div className="space-y-3">
                  {selectedWorkspace.chats.length === 0 ? (
                    <div className="text-center py-12 text-[#6B7280] dark:text-[#A3A3A3] text-sm">
                      No AI Chats linked to this workspace yet. Start a new chat from the top button!
                    </div>
                  ) : (
                    selectedWorkspace.chats.map((c: any, i: number) => (
                      <div key={i} className="p-4 rounded-xl border border-[#E5E7EB] dark:border-[#2A2A2A] bg-white dark:bg-[#0A0A0A] flex items-center justify-between hover:bg-[#F9FAFB] dark:hover:bg-[#232323] transition">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[#F3F4F6] dark:bg-[#232323] text-[#111827] dark:text-[#FAFAFA] flex items-center justify-center shrink-0">
                            <MessageSquare size={16} />
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-[#111827] dark:text-[#FAFAFA]">{c.title || 'Untitled Chat'}</h4>
                            <p className="text-xs text-[#6B7280] dark:text-[#A3A3A3]">Session ID: {c.id}</p>
                          </div>
                        </div>
                        <button onClick={() => navigate('/dashboard')} className="text-xs text-[#111827] dark:text-[#FAFAFA] font-medium flex items-center gap-1 hover:underline cursor-pointer">
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
                    <div className="text-center py-12 text-[#6B7280] dark:text-[#A3A3A3] text-sm">
                      No uploaded documents in this workspace.
                    </div>
                  ) : (
                    selectedWorkspace.documents.map((d: any, i: number) => (
                      <div key={i} className="p-4 rounded-xl border border-[#E5E7EB] dark:border-[#2A2A2A] bg-white dark:bg-[#0A0A0A] flex items-center justify-between hover:bg-[#F9FAFB] dark:hover:bg-[#232323] transition">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[#F3F4F6] dark:bg-[#232323] text-[#111827] dark:text-[#FAFAFA] flex items-center justify-center shrink-0">
                            <FileText size={16} />
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-[#111827] dark:text-[#FAFAFA]">{d.filename}</h4>
                            <p className="text-xs text-[#6B7280] dark:text-[#A3A3A3]">Type: {d.file_type || 'PDF/Doc'}</p>
                          </div>
                        </div>
                        <button onClick={() => navigate('/documents')} className="text-xs text-[#111827] dark:text-[#FAFAFA] font-medium flex items-center gap-1 hover:underline cursor-pointer">
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
                    <div className="text-center py-12 text-[#6B7280] dark:text-[#A3A3A3] text-sm">
                      No AI Notes generated in this workspace yet.
                    </div>
                  ) : (
                    selectedWorkspace.notes.map((n: any, i: number) => (
                      <div key={i} className="p-4 rounded-xl border border-[#E5E7EB] dark:border-[#2A2A2A] bg-white dark:bg-[#0A0A0A] flex items-center justify-between hover:bg-[#F9FAFB] dark:hover:bg-[#232323] transition">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[#F3F4F6] dark:bg-[#232323] text-[#111827] dark:text-[#FAFAFA] flex items-center justify-center shrink-0">
                            <Sparkles size={16} />
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-[#111827] dark:text-[#FAFAFA]">{n.title}</h4>
                            <p className="text-xs text-[#6B7280] dark:text-[#A3A3A3]">Source: {n.document_name}</p>
                          </div>
                        </div>
                        <button onClick={() => navigate('/ai-notes')} className="text-xs text-[#111827] dark:text-[#FAFAFA] font-medium flex items-center gap-1 hover:underline cursor-pointer">
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
                    <div className="text-center py-12 text-[#6B7280] dark:text-[#A3A3A3] text-sm">
                      No Quizzes linked to this workspace.
                    </div>
                  ) : (
                    selectedWorkspace.quizzes.map((q: any, i: number) => (
                      <div key={i} className="p-4 rounded-xl border border-[#E5E7EB] dark:border-[#2A2A2A] bg-white dark:bg-[#0A0A0A] flex items-center justify-between hover:bg-[#F9FAFB] dark:hover:bg-[#232323] transition">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[#F3F4F6] dark:bg-[#232323] text-[#111827] dark:text-[#FAFAFA] flex items-center justify-center shrink-0">
                            <HelpCircle size={16} />
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-[#111827] dark:text-[#FAFAFA]">{q.title}</h4>
                            <p className="text-xs text-[#6B7280] dark:text-[#A3A3A3]">Subject: {q.subject}</p>
                          </div>
                        </div>
                        <button onClick={() => navigate('/quiz')} className="text-xs text-[#111827] dark:text-[#FAFAFA] font-medium flex items-center gap-1 hover:underline cursor-pointer">
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
                  <h4 className="text-xs font-semibold text-[#6B7280] dark:text-[#A3A3A3] uppercase tracking-wider">Workspace Event Log</h4>
                  <div className="border-l-2 border-[#E5E7EB] dark:border-[#2A2A2A] pl-4 space-y-4 text-xs">
                    <div>
                      <span className="text-[#9CA3AF] font-mono text-[11px]">Today</span>
                      <p className="font-medium text-[#111827] dark:text-[#FAFAFA]">Workspace created and configured.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* ── 3. DASHBOARD GRID VIEW ── */
          <div className="space-y-6">
            
            {/* ── Filter Bar & Search Toolbar ── */}
            <div className="bg-white dark:bg-[#181818] p-4 rounded-xl border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-[0_1px_3px_rgba(0,0,0,0.08)] flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Filter Chips */}
              <div className="flex items-center gap-1.5 p-1 bg-[#F3F4F6] dark:bg-[#232323] rounded-lg overflow-x-auto no-scrollbar">
                {[
                  { id: 'all', label: 'All Workspaces' },
                  { id: 'pinned', label: 'Pinned' },
                  { id: 'favorites', label: 'Favorites' },
                  { id: 'archived', label: 'Archived' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveFilter(tab.id as any)}
                    className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition cursor-pointer whitespace-nowrap ${
                      activeFilter === tab.id
                        ? 'bg-[#111827] text-white dark:bg-[#FAFAFA] dark:text-[#111111] shadow-[0_1px_3px_rgba(0,0,0,0.08)]'
                        : 'text-[#6B7280] dark:text-[#A3A3A3] hover:text-[#111827] dark:hover:text-[#FAFAFA]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Search Bar Input */}
              <div className="relative w-full md:w-72">
                <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] dark:text-[#6B7280] pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search workspaces..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-10 pl-10 pr-4 bg-white dark:bg-[#0A0A0A] border border-[#D1D5DB] dark:border-[#2A2A2A] rounded-lg text-sm text-[#111827] dark:text-[#FAFAFA] placeholder-[#9CA3AF] dark:placeholder-[#6B7280] focus:outline-none focus:border-[#111827] dark:focus:border-[#FAFAFA] transition-all"
                />
              </div>
            </div>

            {/* ── Grid of Workspaces ── */}
            {loading ? (
              <div className="text-center py-20 text-[#6B7280] dark:text-[#A3A3A3] text-sm">
                <RefreshCw className="h-6 w-6 animate-spin mx-auto text-[#111827] dark:text-[#FAFAFA] mb-3" />
                <span>Loading AI Workspaces...</span>
              </div>
            ) : filteredWorkspaces.length === 0 ? (
              /* ── 4. Empty State ── */
              <div className="bg-white dark:bg-[#181818] p-12 text-center rounded-xl border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-[0_1px_3px_rgba(0,0,0,0.08)] space-y-4">
                <div className="w-16 h-16 rounded-[12px] bg-[#F3F4F6] dark:bg-[#232323] text-[#6B7280] dark:text-[#A3A3A3] flex items-center justify-center mx-auto border border-[#E5E7EB] dark:border-[#2A2A2A]">
                  <FolderKanban size={32} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-[#111827] dark:text-[#FAFAFA]">No Workspaces Yet</h3>
                  <p className="text-sm text-[#6B7280] dark:text-[#A3A3A3] max-w-md mx-auto">
                    Create your first AI Workspace to organize chats, notes, documents, quizzes, and study resources.
                  </p>
                </div>
                <button
                  onClick={handleOpenCreateModal}
                  className="px-5 py-2.5 rounded-[10px] bg-[#111827] hover:bg-[#000000] dark:bg-[#FAFAFA] dark:hover:bg-white text-white dark:text-[#111111] text-sm font-medium inline-flex items-center gap-2 shadow-[0_1px_3px_rgba(0,0,0,0.08)] transition cursor-pointer"
                >
                  <Plus size={16} />
                  <span>Create Workspace</span>
                </button>
              </div>
            ) : (
              /* ── 5. Workspace Cards Grid ── */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredWorkspaces.map((ws) => (
                  <div
                    key={ws.id}
                    onClick={() => {
                      setSelectedWorkspace(null);
                      navigate(`/workspaces/${ws.id}`);
                    }}
                    className="group bg-white dark:bg-[#181818] p-6 rounded-xl border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-[0_1px_3px_rgba(0,0,0,0.08)] hover:shadow-md transition-all duration-150 hover:-translate-y-1 cursor-pointer flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 rounded-[10px] bg-[#F3F4F6] dark:bg-[#232323] text-[#111827] dark:text-[#FAFAFA] flex items-center justify-center border border-[#E5E7EB] dark:border-[#2A2A2A] shrink-0">
                          {renderIcon(ws.icon, 20)}
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => handleTogglePin(ws, e)}
                            className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                              ws.is_pinned 
                                ? 'text-[#111827] dark:text-[#FAFAFA] bg-[#F3F4F6] dark:bg-[#232323]' 
                                : 'text-[#9CA3AF] hover:text-[#111827] dark:hover:text-[#FAFAFA]'
                            }`}
                            title={ws.is_pinned ? 'Unpin' : 'Pin'}
                          >
                            <Star size={16} className={ws.is_pinned ? 'fill-current' : ''} />
                          </button>

                          <button
                            onClick={(e) => handleToggleFavorite(ws, e)}
                            className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                              ws.is_favorite 
                                ? 'text-[#111827] dark:text-[#FAFAFA] bg-[#F3F4F6] dark:bg-[#232323]' 
                                : 'text-[#9CA3AF] hover:text-[#111827] dark:hover:text-[#FAFAFA]'
                            }`}
                            title={ws.is_favorite ? 'Remove Favorite' : 'Favorite'}
                          >
                            <Heart size={16} className={ws.is_favorite ? 'fill-current' : ''} />
                          </button>

                          <button
                            onClick={(e) => handleDelete(ws.id, e)}
                            className="p-1.5 rounded-md text-[#9CA3AF] hover:text-rose-600 hover:bg-[#F3F4F6] dark:hover:bg-[#232323] transition-colors cursor-pointer"
                            title="Delete Workspace"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      <h3 className="text-base font-bold text-[#111827] dark:text-[#FAFAFA] group-hover:text-[#000000] dark:group-hover:text-white transition-colors">
                        {ws.title}
                      </h3>
                      <p className="text-xs text-[#6B7280] dark:text-[#A3A3A3] line-clamp-2 mt-1">
                        {ws.description || 'No description added for this workspace.'}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[#E5E7EB] dark:border-[#2A2A2A] flex items-center justify-between text-xs text-[#6B7280] dark:text-[#A3A3A3]">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1"><MessageSquare size={13} /> {ws.chat_count} Chats</span>
                        <span className="flex items-center gap-1"><FileText size={13} /> {ws.document_count} Docs</span>
                        <span className="flex items-center gap-1"><Sparkles size={13} /> {ws.note_count} Notes</span>
                      </div>
                      <ArrowRight size={16} className="text-[#9CA3AF] group-hover:text-[#111827] dark:group-hover:text-[#FAFAFA] transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── 6. CREATE / EDIT WORKSPACE MODAL ── */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 bg-[#111827]/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#181818] rounded-xl border border-[#E5E7EB] dark:border-[#2A2A2A] w-full max-w-md p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-[#E5E7EB] dark:border-[#2A2A2A] pb-3">
                <h3 className="text-base font-bold text-[#111827] dark:text-[#FAFAFA]">
                  {editingId ? 'Edit Workspace' : 'Create New AI Workspace'}
                </h3>
                <button onClick={() => setModalOpen(false)} className="text-[#9CA3AF] hover:text-[#111827] dark:hover:text-[#FAFAFA] cursor-pointer">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveWorkspace} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-[#111827] dark:text-[#FAFAFA] block mb-1">
                    Workspace Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Operating Systems & Architecture"
                    value={titleInput}
                    onChange={(e) => setTitleInput(e.target.value)}
                    className="w-full h-10 px-3.5 rounded-lg border border-[#D1D5DB] dark:border-[#2A2A2A] bg-white dark:bg-[#0A0A0A] text-sm text-[#111827] dark:text-[#FAFAFA] placeholder-[#9CA3AF] focus:outline-none focus:border-[#111827] dark:focus:border-[#FAFAFA] transition-all"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#111827] dark:text-[#FAFAFA] block mb-1">
                    Description (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Brief objective or course outline for this workspace..."
                    value={descInput}
                    onChange={(e) => setDescInput(e.target.value)}
                    className="w-full p-3 rounded-lg border border-[#D1D5DB] dark:border-[#2A2A2A] bg-white dark:bg-[#0A0A0A] text-sm text-[#111827] dark:text-[#FAFAFA] placeholder-[#9CA3AF] focus:outline-none focus:border-[#111827] dark:focus:border-[#FAFAFA] transition-all"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#111827] dark:text-[#FAFAFA] block mb-1.5">
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
                          className={`p-2.5 rounded-lg border text-xs font-medium flex items-center gap-2 transition cursor-pointer ${
                            isSelected
                              ? 'bg-[#111827] text-white dark:bg-[#FAFAFA] dark:text-[#111111] border-[#111827]'
                              : 'bg-[#F9FAFB] dark:bg-[#0A0A0A] border-[#E5E7EB] dark:border-[#2A2A2A] text-[#6B7280] dark:text-[#A3A3A3] hover:text-[#111827] dark:hover:text-[#FAFAFA]'
                          }`}
                        >
                          <IconComponent size={16} />
                          <span className="truncate">{ico.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-3 flex justify-end gap-2 border-t border-[#E5E7EB] dark:border-[#2A2A2A]">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 rounded-[10px] border border-[#D1D5DB] dark:border-[#2A2A2A] bg-white dark:bg-[#0A0A0A] text-xs font-medium text-[#111827] dark:text-[#FAFAFA] hover:bg-[#F9FAFB] transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 rounded-[10px] bg-[#111827] hover:bg-[#000000] dark:bg-[#FAFAFA] dark:hover:bg-white text-white dark:text-[#111111] text-xs font-medium transition cursor-pointer shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
                  >
                    {isSubmitting ? 'Saving...' : editingId ? 'Save Changes' : 'Create Workspace'}
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
