import React, { useState, useEffect, useCallback } from 'react';
import {
  FileText,
  BookOpen,
  Search,
  Bookmark,
  History,
  RotateCcw,
  Sparkles,
  Layers,
  CircleAlert,
  Plus,
  Eye,
  Download,
  Brain,
  SlidersHorizontal,
  X,
  LayoutGrid,
  List,
  Table as TableIcon,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import {
  QuestionPaper,
  FilterMeta,
  getQuestionPapers,
  getFilterMetadata,
  togglePaperBookmark,
  deleteQuestionPaper,
  getUserBookmarks,
  getUserHistory
} from '../../api/questionPapers';
import { QuestionPaperCard } from '../../components/questionPapers/QuestionPaperCard';
import { QuestionPaperListItem } from '../../components/questionPapers/QuestionPaperListItem';
import { PaperActionsDropdown } from '../../components/questionPapers/PaperActionsDropdown';
import { QuestionPaperPdfViewer } from '../../components/questionPapers/QuestionPaperPdfViewer';
import { QuestionPaperAnalysisModal } from '../../components/questionPapers/QuestionPaperAnalysisModal';
import { QuestionPaperChatDrawer } from '../../components/questionPapers/QuestionPaperChatDrawer';
import { QuestionPaperUploadModal } from '../../components/questionPapers/QuestionPaperUploadModal';
import { useToast } from '../../context/ToastContext';

export const QuestionPapersPage: React.FC = () => {
  const { showToast } = useToast();

  const [papers, setPapers] = useState<QuestionPaper[]>([]);
  const [meta, setMeta] = useState<FilterMeta | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Tab & View filters
  const [activeTab, setActiveTab] = useState<'all' | 'bookmarks' | 'history'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'table'>('grid');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDept, setSelectedDept] = useState<string>('');
  const [selectedSem, setSelectedSem] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedRegulation, setSelectedRegulation] = useState<string>('');
  const [selectedExamType, setSelectedExamType] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('academic_year');
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState<boolean>(false);

  // Table Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 8;

  // Modals state
  const [previewPaper, setPreviewPaper] = useState<QuestionPaper | null>(null);
  const [analysisPaper, setAnalysisPaper] = useState<QuestionPaper | null>(null);
  const [chatPaper, setChatPaper] = useState<QuestionPaper | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);

  // Fetch filter metadata
  useEffect(() => {
    getFilterMetadata()
      .then((data) => setMeta(data))
      .catch(() => {});
  }, []);

  // Fetch Papers list
  const fetchPapers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (activeTab === 'bookmarks') {
        const res = await getUserBookmarks();
        setPapers(res);
      } else if (activeTab === 'history') {
        const res = await getUserHistory();
        setPapers(res);
      } else {
        const res = await getQuestionPapers({
          department: selectedDept || undefined,
          semester: selectedSem ? Number(selectedSem) : undefined,
          subject: selectedSubject || undefined,
          academic_year: selectedYear ? Number(selectedYear) : undefined,
          regulation: selectedRegulation || undefined,
          exam_type: selectedExamType || undefined,
          search: searchQuery.trim() || undefined,
          sort_by: sortBy,
        });
        setPapers(res);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch question papers');
    } finally {
      setLoading(false);
    }
  }, [
    activeTab,
    selectedDept,
    selectedSem,
    selectedSubject,
    selectedYear,
    selectedRegulation,
    selectedExamType,
    searchQuery,
    sortBy,
  ]);

  useEffect(() => {
    fetchPapers();
  }, [fetchPapers]);

  // Handlers
  const handleToggleBookmark = async (id: number) => {
    try {
      const res = await togglePaperBookmark(id);
      showToast(res.message, 'success');
      fetchPapers();
    } catch (err: any) {
      showToast(err.message || 'Bookmark action failed', 'error');
    }
  };

  const handleDeletePaper = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this question paper?')) return;
    try {
      await deleteQuestionPaper(id);
      showToast('Question paper deleted successfully', 'info');
      fetchPapers();
    } catch (err: any) {
      showToast(err.message || 'Delete failed', 'error');
    }
  };

  const handleSharePaper = (paper: QuestionPaper) => {
    const text = `CollegeMate AI Question Paper: ${paper.title}\nSubject Code: ${paper.subject_code}\nYear: ${paper.academic_year}\nDownload: ${window.location.origin}${paper.file_url}`;
    navigator.clipboard.writeText(text);
    showToast('Paper details & link copied to clipboard!', 'info');
  };

  const handleResetFilters = () => {
    setSelectedDept('');
    setSelectedSem('');
    setSelectedSubject('');
    setSelectedYear('');
    setSelectedRegulation('');
    setSelectedExamType('');
    setSearchQuery('');
    setSortBy('academic_year');
    setActiveTab('all');
  };

  // Metrics
  const totalPapersCount = papers.length;

  // Pagination logic
  const totalPages = Math.ceil(papers.length / itemsPerPage) || 1;
  const paginatedPapers = papers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="w-full h-full overflow-x-hidden overflow-y-auto bg-[#FFFFFF] dark:bg-[#0A0A0A] text-[#111827] dark:text-[#FAFAFA] p-4 sm:p-6 md:p-8 transition-colors select-none">
      <div className="w-full max-w-[1600px] mx-auto space-y-6">
        {/* Page Header */}
        <div className="bg-[#FFFFFF] dark:bg-[#18181B] p-6 rounded-[16px] border border-[#D1D5DB] dark:border-[#3F3F46] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-[48px] h-[48px] rounded-[12px] bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] flex items-center justify-center shrink-0">
              <FileText size={24} />
            </div>
            <div className="min-w-0">
              <h1 className="text-[30px] font-[700] text-[#111827] dark:text-[#FAFAFA] tracking-tight leading-tight truncate">
                Previous Year Question Papers
              </h1>
              <p className="text-[14px] font-[400] text-[#6B7280] dark:text-[#A1A1AA] mt-1 truncate">
                Search, preview, download, bookmark, and analyze university papers in one workspace.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsUploadOpen(true)}
            className="h-[40px] px-[18px] rounded-[12px] bg-[#111827] hover:bg-[#1F2937] active:bg-[#0F172A] dark:bg-[#FAFAFA] dark:hover:bg-[#F3F4F6] text-[#FFFFFF] dark:text-[#111111] font-[600] text-[14px] transition flex items-center justify-center gap-2 cursor-pointer shrink-0 active:scale-[0.98]"
          >
            <Plus size={18} />
            <span>Upload Paper</span>
          </button>
        </div>

        {/* Dashboard Overview Metrics (Matching AI Study Planner Quick Stats style) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 select-none">
          <div className="h-[88px] p-3.5 sm:p-[16px] rounded-[16px] bg-[#FFFFFF] dark:bg-[#18181B] border border-[#D1D5DB] dark:border-[#3F3F46] shadow-xs flex items-center justify-between transition-all duration-150 ease-in-out hover:-translate-y-[2px] hover:shadow-md">
            <div className="min-w-0 flex-1 space-y-0.5">
              <p className="text-[12px] sm:text-[13px] font-[500] text-[#6B7280] dark:text-[#A1A1AA] truncate">Total Papers</p>
              <p className="text-[26px] sm:text-[30px] font-[600] text-[#111827] dark:text-[#FAFAFA] leading-none truncate">{totalPapersCount}</p>
              <p className="text-[11px] sm:text-[13px] font-[500] text-[#6B7280] dark:text-[#A1A1AA] truncate pt-0.5">University archive</p>
            </div>
            <div className="w-[34px] h-[34px] sm:w-[40px] sm:h-[40px] rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#D1D5DB] dark:border-[#3F3F46] text-[#111827] dark:text-[#FAFAFA] flex items-center justify-center shrink-0 ml-2 sm:ml-3">
              <FileText size={18} />
            </div>
          </div>

          <div className="h-[88px] p-3.5 sm:p-[16px] rounded-[16px] bg-[#FFFFFF] dark:bg-[#18181B] border border-[#D1D5DB] dark:border-[#3F3F46] shadow-xs flex items-center justify-between transition-all duration-150 ease-in-out hover:-translate-y-[2px] hover:shadow-md">
            <div className="min-w-0 flex-1 space-y-0.5">
              <p className="text-[12px] sm:text-[13px] font-[500] text-[#6B7280] dark:text-[#A1A1AA] truncate">Subjects</p>
              <p className="text-[26px] sm:text-[30px] font-[600] text-[#111827] dark:text-[#FAFAFA] leading-none truncate">{meta?.subjects.length || 0}</p>
              <p className="text-[11px] sm:text-[13px] font-[500] text-[#6B7280] dark:text-[#A1A1AA] truncate pt-0.5">Active courses</p>
            </div>
            <div className="w-[34px] h-[34px] sm:w-[40px] sm:h-[40px] rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#D1D5DB] dark:border-[#3F3F46] text-[#111827] dark:text-[#FAFAFA] flex items-center justify-center shrink-0 ml-2 sm:ml-3">
              <BookOpen size={18} />
            </div>
          </div>

          <div className="h-[88px] p-3.5 sm:p-[16px] rounded-[16px] bg-[#FFFFFF] dark:bg-[#18181B] border border-[#D1D5DB] dark:border-[#3F3F46] shadow-xs flex items-center justify-between transition-all duration-150 ease-in-out hover:-translate-y-[2px] hover:shadow-md">
            <div className="min-w-0 flex-1 space-y-0.5">
              <p className="text-[12px] sm:text-[13px] font-[500] text-[#6B7280] dark:text-[#A1A1AA] truncate">Downloaded</p>
              <p className="text-[26px] sm:text-[30px] font-[600] text-[#111827] dark:text-[#FAFAFA] leading-none truncate">{papers.reduce((acc, paper) => acc + (paper.download_count || 0), 0)}</p>
              <p className="text-[11px] sm:text-[13px] font-[500] text-[#6B7280] dark:text-[#A1A1AA] truncate pt-0.5">Total downloads</p>
            </div>
            <div className="w-[34px] h-[34px] sm:w-[40px] sm:h-[40px] rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#D1D5DB] dark:border-[#3F3F46] text-[#111827] dark:text-[#FAFAFA] flex items-center justify-center shrink-0 ml-2 sm:ml-3">
              <Download size={18} />
            </div>
          </div>

          <div className="h-[88px] p-3.5 sm:p-[16px] rounded-[16px] bg-[#FFFFFF] dark:bg-[#18181B] border border-[#D1D5DB] dark:border-[#3F3F46] shadow-xs flex items-center justify-between transition-all duration-150 ease-in-out hover:-translate-y-[2px] hover:shadow-md">
            <div className="min-w-0 flex-1 space-y-0.5">
              <p className="text-[12px] sm:text-[13px] font-[500] text-[#6B7280] dark:text-[#A1A1AA] truncate">AI Analysis</p>
              <p className="text-[26px] sm:text-[30px] font-[600] text-[#111827] dark:text-[#FAFAFA] leading-none truncate">{papers.length > 0 ? 'On' : 'Idle'}</p>
              <p className="text-[11px] sm:text-[13px] font-[500] text-[#6B7280] dark:text-[#A1A1AA] truncate pt-0.5">Cross-exam AI engine</p>
            </div>
            <div className="w-[34px] h-[34px] sm:w-[40px] sm:h-[40px] rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#D1D5DB] dark:border-[#3F3F46] text-[#111827] dark:text-[#FAFAFA] flex items-center justify-center shrink-0 ml-2 sm:ml-3">
              <Brain size={18} />
            </div>
          </div>
        </div>

        {/* Controls Bar: Search, View Switcher & Filters */}
        <div className="bg-[#FFFFFF] dark:bg-[#18181B] p-5 rounded-[16px] border border-[#D1D5DB] dark:border-[#3F3F46] space-y-4">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            {/* Tabs Navigation */}
            <div className="flex items-center bg-[#F8FAFC] dark:bg-[#111111] p-1 rounded-[12px] border border-[#D1D5DB] dark:border-[#3F3F46] overflow-x-auto no-scrollbar w-full lg:w-auto">
              {[
                { id: 'all', label: 'All Papers', icon: Layers },
                { id: 'bookmarks', label: 'Bookmarks', icon: Bookmark },
                { id: 'history', label: 'Recently Viewed', icon: History },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as 'all' | 'bookmarks' | 'history')}
                    className={`h-[38px] px-4 rounded-[10px] text-[14px] font-[600] transition flex items-center justify-center gap-2 whitespace-nowrap flex-1 lg:flex-initial cursor-pointer ${
                      activeTab === tab.id
                        ? 'bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111]'
                        : 'text-[#6B7280] dark:text-[#A1A1AA] hover:bg-[#FFFFFF] dark:hover:bg-[#18181B]'
                    }`}
                  >
                    <Icon size={16} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Search Bar & View Switcher */}
            <div className="flex items-center gap-3 w-full lg:w-auto">
              {/* Search Bar */}
              <div className="relative flex-1 lg:w-[420px]">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7280] dark:text-[#A1A1AA]" size={18} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search papers, subjects, code, year..."
                  className="w-full h-[42px] pl-10 pr-4 rounded-[12px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#18181B] text-[14px] text-[#111827] dark:text-[#FAFAFA] outline-none focus:border-[#111827] dark:focus:border-[#FAFAFA] transition"
                />
              </div>

              {/* View Switcher - 40px Height Segmented Control */}
              <div className="flex items-center bg-[#F8FAFC] dark:bg-[#111111] p-1 rounded-[12px] border border-[#D1D5DB] dark:border-[#3F3F46] h-[40px] shrink-0">
                {[
                  { mode: 'grid', label: 'Grid', icon: LayoutGrid },
                  { mode: 'list', label: 'List', icon: List },
                  { mode: 'table', label: 'Table', icon: TableIcon },
                ].map(({ mode, label, icon: Icon }) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode as 'grid' | 'list' | 'table')}
                    title={`${label} View`}
                    className={`h-[32px] px-3.5 rounded-[8px] text-[14px] font-[500] transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      viewMode === mode
                        ? 'bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111]'
                        : 'text-[#6B7280] dark:text-[#A1A1AA] hover:bg-[#FFFFFF] dark:hover:bg-[#18181B]'
                    }`}
                  >
                    <Icon size={15} />
                    <span className="hidden sm:inline">{label}</span>
                  </button>
                ))}
              </div>

              {/* Mobile Filter Trigger */}
              <button
                onClick={() => setIsFilterSheetOpen(true)}
                className="md:hidden h-[42px] px-3.5 rounded-[12px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#18181B] text-[14px] font-[600] text-[#111827] dark:text-[#FAFAFA] flex items-center justify-center gap-2 cursor-pointer shrink-0"
              >
                <SlidersHorizontal size={16} />
                <span>Filters</span>
              </button>
            </div>
          </div>

          {/* Desktop Inline Filters */}
          {activeTab === 'all' && (
            <div className="hidden md:block pt-4 border-t border-[#D1D5DB] dark:border-[#3F3F46]">
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
                <select value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)} className="h-[40px] px-3 rounded-[12px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#18181B] text-[14px] text-[#111827] dark:text-[#FAFAFA] outline-none cursor-pointer">
                  <option value="">Department</option>
                  {meta?.departments.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
                <select value={selectedSem} onChange={(e) => setSelectedSem(e.target.value)} className="h-[40px] px-3 rounded-[12px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#18181B] text-[14px] text-[#111827] dark:text-[#FAFAFA] outline-none cursor-pointer">
                  <option value="">Semester</option>
                  {[1,2,3,4,5,6,7,8].map((s) => <option key={s} value={String(s)}>Sem {s}</option>)}
                </select>
                <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} className="h-[40px] px-3 rounded-[12px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#18181B] text-[14px] text-[#111827] dark:text-[#FAFAFA] outline-none cursor-pointer">
                  <option value="">Subject</option>
                  {meta?.subjects.map((sub) => <option key={sub.code} value={sub.code}>{sub.name}</option>)}
                </select>
                <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="h-[40px] px-3 rounded-[12px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#18181B] text-[14px] text-[#111827] dark:text-[#FAFAFA] outline-none cursor-pointer">
                  <option value="">Academic Year</option>
                  {meta?.years.map((y) => <option key={y} value={String(y)}>{y}</option>)}
                </select>
                <select value={selectedRegulation} onChange={(e) => setSelectedRegulation(e.target.value)} className="h-[40px] px-3 rounded-[12px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#18181B] text-[14px] text-[#111827] dark:text-[#FAFAFA] outline-none cursor-pointer">
                  <option value="">Regulation</option>
                  {meta?.regulations.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
                <select value={selectedExamType} onChange={(e) => setSelectedExamType(e.target.value)} className="h-[40px] px-3 rounded-[12px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#18181B] text-[14px] text-[#111827] dark:text-[#FAFAFA] outline-none cursor-pointer">
                  <option value="">Exam Type</option>
                  <option value="University Exam">University Exam</option>
                  <option value="Model Exam">Model Exam</option>
                  <option value="Internal">Internal</option>
                </select>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="h-[40px] px-3 rounded-[12px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#18181B] text-[14px] text-[#111827] dark:text-[#FAFAFA] outline-none cursor-pointer">
                  <option value="academic_year">Sort: Year</option>
                  <option value="created_at">Sort: Newest</option>
                  <option value="subject_name">Sort: Subject</option>
                </select>
                <button onClick={handleResetFilters} className="h-[40px] px-3 rounded-[12px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#18181B] text-[14px] font-[600] text-[#111827] dark:text-[#FAFAFA] hover:bg-[#F8FAFC] dark:hover:bg-[#232323] transition flex items-center justify-center gap-1.5 cursor-pointer">
                  <RotateCcw size={15} />
                  <span>Reset</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Filter Drawer */}
        {isFilterSheetOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs md:hidden flex flex-col justify-end" onClick={() => setIsFilterSheetOpen(false)}>
            <div className="w-full max-h-[85vh] rounded-t-[24px] bg-[#FFFFFF] dark:bg-[#18181B] p-5 border-t border-[#D1D5DB] dark:border-[#3F3F46] shadow-2xl flex flex-col" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between pb-3 border-b border-[#D1D5DB] dark:border-[#3F3F46]">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal size={18} className="text-[#111827] dark:text-[#FAFAFA]" />
                  <h3 className="text-[20px] font-[600] text-[#111827] dark:text-[#FAFAFA]">Filter Question Papers</h3>
                </div>
                <button onClick={() => setIsFilterSheetOpen(false)} className="h-9 w-9 rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#D1D5DB] dark:border-[#3F3F46] flex items-center justify-center text-[#111827] dark:text-[#FAFAFA]">
                  <X size={18} />
                </button>
              </div>

              <div className="overflow-y-auto py-4 space-y-4">
                <div>
                  <label className="text-[14px] font-[500] text-[#6B7280] dark:text-[#A1A1AA] mb-1 block">Department</label>
                  <select value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)} className="w-full h-[42px] px-3 rounded-[12px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#18181B] text-[14px] text-[#111827] dark:text-[#FAFAFA] outline-none">
                    <option value="">All Departments</option>
                    {meta?.departments.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[14px] font-[500] text-[#6B7280] dark:text-[#A1A1AA] mb-1 block">Semester</label>
                  <select value={selectedSem} onChange={(e) => setSelectedSem(e.target.value)} className="w-full h-[42px] px-3 rounded-[12px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#18181B] text-[14px] text-[#111827] dark:text-[#FAFAFA] outline-none">
                    <option value="">All Semesters</option>
                    {[1,2,3,4,5,6,7,8].map((s) => <option key={s} value={String(s)}>Semester {s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[14px] font-[500] text-[#6B7280] dark:text-[#A1A1AA] mb-1 block">Subject</label>
                  <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} className="w-full h-[42px] px-3 rounded-[12px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#18181B] text-[14px] text-[#111827] dark:text-[#FAFAFA] outline-none">
                    <option value="">All Subjects</option>
                    {meta?.subjects.map((sub) => <option key={sub.code} value={sub.code}>{sub.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[14px] font-[500] text-[#6B7280] dark:text-[#A1A1AA] mb-1 block">Academic Year</label>
                  <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="w-full h-[42px] px-3 rounded-[12px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#18181B] text-[14px] text-[#111827] dark:text-[#FAFAFA] outline-none">
                    <option value="">All Academic Years</option>
                    {meta?.years.map((y) => <option key={y} value={String(y)}>{y}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[14px] font-[500] text-[#6B7280] dark:text-[#A1A1AA] mb-1 block">Regulation</label>
                  <select value={selectedRegulation} onChange={(e) => setSelectedRegulation(e.target.value)} className="w-full h-[42px] px-3 rounded-[12px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#18181B] text-[14px] text-[#111827] dark:text-[#FAFAFA] outline-none">
                    <option value="">All Regulations</option>
                    {meta?.regulations.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[14px] font-[500] text-[#6B7280] dark:text-[#A1A1AA] mb-1 block">Sort Order</label>
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-full h-[42px] px-3 rounded-[12px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#18181B] text-[14px] text-[#111827] dark:text-[#FAFAFA] outline-none">
                    <option value="academic_year">Academic Year</option>
                    <option value="created_at">Newest First</option>
                    <option value="subject_name">Subject Name</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-[#D1D5DB] dark:border-[#3F3F46] flex items-center gap-3">
                <button onClick={() => { handleResetFilters(); setIsFilterSheetOpen(false); }} className="flex-1 h-[42px] rounded-[12px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#18181B] text-[14px] font-[600] text-[#111827] dark:text-[#FAFAFA] active:scale-[0.98]">
                  Reset All
                </button>
                <button onClick={() => setIsFilterSheetOpen(false)} className="flex-1 h-[42px] rounded-[12px] bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] text-[14px] font-[600] active:scale-[0.98]">
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content View Rendering */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="h-[320px] rounded-[16px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#F8FAFC] dark:bg-[#111111] animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="p-8 rounded-[16px] bg-[#FFFFFF] dark:bg-[#18181B] border border-[#D1D5DB] dark:border-[#3F3F46] text-center space-y-2">
            <CircleAlert className="mx-auto text-[#6B7280] dark:text-[#A1A1AA]" size={36} />
            <h3 className="text-[20px] font-[600] text-[#111827] dark:text-[#FAFAFA]">Failed to load question papers</h3>
            <p className="text-[14px] text-[#6B7280] dark:text-[#A1A1AA]">{error}</p>
          </div>
        ) : papers.length > 0 ? (
          <>
            {/* LIST VIEW */}
            {viewMode === 'list' && (
              <div className="space-y-3">
                {papers.map((paper) => (
                  <QuestionPaperListItem
                    key={paper.id}
                    paper={paper}
                    onPreview={(p) => setPreviewPaper(p)}
                    onAnalysis={(p) => setAnalysisPaper(p)}
                    onChat={(p) => setChatPaper(p)}
                    onToggleBookmark={handleToggleBookmark}
                    onDelete={handleDeletePaper}
                    onShare={handleSharePaper}
                  />
                ))}
              </div>
            )}

            {/* TABLE VIEW */}
            {viewMode === 'table' && (
              <div className="space-y-4">
                {/* Desktop Data Grid */}
                <div className="hidden md:block rounded-[16px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#18181B] overflow-hidden shadow-xs">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-[#F8FAFC] dark:bg-[#111111] border-b border-[#D1D5DB] dark:border-[#3F3F46] text-[14px] font-[500] text-[#6B7280] dark:text-[#A1A1AA] uppercase tracking-wider sticky top-0">
                      <tr>
                        <th className="py-3.5 px-4">Document / Code</th>
                        <th className="py-3.5 px-4">Regulation & Exam</th>
                        <th className="py-3.5 px-4">Year & Sem</th>
                        <th className="py-3.5 px-4">Department & Faculty</th>
                        <th className="py-3.5 px-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#D1D5DB] dark:divide-[#3F3F46]">
                      {paginatedPapers.map((paper) => (
                        <tr key={paper.id} className="h-[56px] even:bg-[#F8FAFC]/50 dark:even:bg-[#111111]/50 hover:bg-[#F8FAFC] dark:hover:bg-[#232323] transition-colors text-[14px] text-[#111827] dark:text-[#FAFAFA]">
                          <td className="py-3 px-4">
                            <div className="font-[600] truncate max-w-[280px]">{paper.title}</div>
                            <div className="text-[13px] text-[#6B7280] dark:text-[#A1A1AA]">{paper.subject_code} • {paper.subject_name}</div>
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <div>{paper.regulation}</div>
                            <div className="text-[13px] text-[#6B7280] dark:text-[#A1A1AA]">{paper.exam_type}</div>
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <div>AY {paper.academic_year}</div>
                            <div className="text-[13px] text-[#6B7280] dark:text-[#A1A1AA]">Semester {paper.semester}</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="truncate max-w-[200px]">{paper.department}</div>
                            <div className="text-[13px] text-[#6B7280] dark:text-[#A1A1AA] truncate max-w-[200px]">{paper.faculty_name || 'N/A'}</div>
                          </td>
                          <td className="py-3 px-4 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-[8px]">
                              <button
                                onClick={() => setPreviewPaper(paper)}
                                className="h-[40px] px-[18px] py-[10px] rounded-[12px] bg-[#111827] hover:bg-[#1F2937] active:bg-[#0F172A] dark:bg-[#FAFAFA] dark:hover:bg-[#F3F4F6] text-[#FFFFFF] dark:text-[#111827] text-[14px] font-[600] tracking-normal transition-all duration-150 ease-in-out hover:-translate-y-[1px] shadow-xs active:scale-[0.98] flex items-center justify-center gap-[8px] cursor-pointer"
                              >
                                <Eye size={16} className="shrink-0" />
                                <span>Preview</span>
                              </button>

                              <button
                                onClick={() => setAnalysisPaper(paper)}
                                className="h-[40px] px-[14px] py-[10px] rounded-[12px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#18181B] hover:bg-[#F8FAFC] dark:hover:bg-[#232323] text-[#111827] dark:text-[#FAFAFA] text-[14px] font-[600] tracking-normal transition-all duration-150 ease-in-out hover:-translate-y-[1px] active:scale-[0.98] flex items-center justify-center gap-[8px] cursor-pointer whitespace-nowrap"
                              >
                                <Sparkles size={16} className="shrink-0" />
                                <span>AI Insights</span>
                              </button>

                              <PaperActionsDropdown
                                paper={paper}
                                onAnalysis={(p) => setAnalysisPaper(p)}
                                onChat={(p) => setChatPaper(p)}
                                onToggleBookmark={handleToggleBookmark}
                                onShare={handleSharePaper}
                                onDelete={handleDeletePaper}
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Table Pagination */}
                  <div className="p-4 border-t border-[#D1D5DB] dark:border-[#3F3F46] bg-[#F8FAFC] dark:bg-[#111111] flex items-center justify-between text-[14px] text-[#6B7280] dark:text-[#A1A1AA]">
                    <div>
                      Showing {Math.min((currentPage - 1) * itemsPerPage + 1, papers.length)} to {Math.min(currentPage * itemsPerPage, papers.length)} of {papers.length} papers
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        className="h-[36px] px-3 rounded-[8px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#18181B] text-[#111827] dark:text-[#FAFAFA] disabled:opacity-40 flex items-center gap-1 cursor-pointer"
                      >
                        <ChevronLeft size={16} />
                        <span>Previous</span>
                      </button>
                      <span className="font-[600] text-[#111827] dark:text-[#FAFAFA] px-2">{currentPage} / {totalPages}</span>
                      <button
                        disabled={currentPage >= totalPages}
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        className="h-[36px] px-3 rounded-[8px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#18181B] text-[#111827] dark:text-[#FAFAFA] disabled:opacity-40 flex items-center gap-1 cursor-pointer"
                      >
                        <span>Next</span>
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Mobile Table Cards */}
                <div className="md:hidden space-y-3">
                  {papers.map((paper) => (
                    <div key={paper.id} className="p-5 rounded-[16px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#18181B] space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="inline-block rounded-full border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#F8FAFC] dark:bg-[#111111] px-3 py-0.5 text-[12px] font-[500] text-[#6B7280] dark:text-[#A1A1AA] mb-1">
                            {paper.subject_code}
                          </span>
                          <h4 className="text-[18px] font-[600] text-[#111827] dark:text-[#FAFAFA] leading-snug">{paper.title}</h4>
                        </div>
                      </div>

                      <div className="text-[14px] font-[400] text-[#6B7280] dark:text-[#A1A1AA] space-y-1">
                        <div>Subject: {paper.subject_name}</div>
                        <div>AY {paper.academic_year} • Semester {paper.semester} ({paper.exam_type})</div>
                        <div>Department: {paper.department}</div>
                      </div>

                      <div className="pt-3 border-t border-[#D1D5DB] dark:border-[#3F3F46] flex items-center gap-[8px]">
                        <button
                          onClick={() => setPreviewPaper(paper)}
                          className="flex-1 h-[40px] px-[18px] py-[10px] rounded-[12px] bg-[#111827] hover:bg-[#1F2937] active:bg-[#0F172A] dark:bg-[#FAFAFA] dark:hover:bg-[#F3F4F6] text-[#FFFFFF] dark:text-[#111827] text-[14px] font-[600] tracking-normal transition-all duration-150 ease-in-out hover:-translate-y-[1px] shadow-xs active:scale-[0.98] flex items-center justify-center gap-[8px] cursor-pointer"
                        >
                          <Eye size={16} className="shrink-0" />
                          <span>Preview</span>
                        </button>

                        <button
                          onClick={() => setAnalysisPaper(paper)}
                          className="flex-1 h-[40px] px-[14px] py-[10px] rounded-[12px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#18181B] hover:bg-[#F8FAFC] dark:hover:bg-[#232323] text-[#111827] dark:text-[#FAFAFA] text-[14px] font-[600] tracking-normal transition-all duration-150 ease-in-out hover:-translate-y-[1px] active:scale-[0.98] flex items-center justify-center gap-[8px] cursor-pointer whitespace-nowrap"
                        >
                          <Sparkles size={16} className="shrink-0" />
                          <span className="truncate">AI Insights</span>
                        </button>

                        <PaperActionsDropdown
                          paper={paper}
                          onAnalysis={(p) => setAnalysisPaper(p)}
                          onChat={(p) => setChatPaper(p)}
                          onToggleBookmark={handleToggleBookmark}
                          onShare={handleSharePaper}
                          onDelete={handleDeletePaper}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* GRID VIEW (DEFAULT) */}
            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
                {papers.map((paper) => (
                  <QuestionPaperCard
                    key={paper.id}
                    paper={paper}
                    onPreview={(p) => setPreviewPaper(p)}
                    onAnalysis={(p) => setAnalysisPaper(p)}
                    onChat={(p) => setChatPaper(p)}
                    onToggleBookmark={handleToggleBookmark}
                    onDelete={handleDeletePaper}
                    onShare={handleSharePaper}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="py-16 text-center bg-[#FFFFFF] dark:bg-[#18181B] rounded-[16px] border border-[#D1D5DB] dark:border-[#3F3F46] p-8 space-y-3">
            <FileText className="mx-auto text-[#6B7280] dark:text-[#A1A1AA]" size={48} />
            <h3 className="text-[20px] font-[600] text-[#111827] dark:text-[#FAFAFA]">No Question Papers Found</h3>
            <p className="text-[14px] text-[#6B7280] dark:text-[#A1A1AA] max-w-sm mx-auto">Try changing filters or upload a new paper.</p>
            <div className="flex items-center justify-center gap-3">
              <button onClick={() => setIsUploadOpen(true)} className="h-[40px] px-4 rounded-[12px] bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] text-[14px] font-[600] active:scale-[0.98]">Upload Paper</button>
              <button onClick={handleResetFilters} className="h-[40px] px-4 rounded-[12px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#18181B] text-[14px] font-[600] text-[#111827] dark:text-[#FAFAFA] active:scale-[0.98]">Clear Filters</button>
            </div>
          </div>
        )}

        {/* Modals & Slide-over Drawers */}
        <QuestionPaperPdfViewer
          isOpen={!!previewPaper}
          onClose={() => setPreviewPaper(null)}
          title={previewPaper?.title || ''}
          pdfUrl={previewPaper?.file_url || ''}
          fileName={previewPaper?.file_name || 'paper.pdf'}
        />

        <QuestionPaperAnalysisModal
          isOpen={!!analysisPaper}
          onClose={() => setAnalysisPaper(null)}
          paper={analysisPaper}
        />

        <QuestionPaperChatDrawer
          isOpen={!!chatPaper}
          onClose={() => setChatPaper(null)}
          paper={chatPaper}
        />

        <QuestionPaperUploadModal
          isOpen={isUploadOpen}
          onClose={() => setIsUploadOpen(false)}
          onSuccess={fetchPapers}
          meta={meta}
        />
      </div>
    </div>
  );
};

export default QuestionPapersPage;
