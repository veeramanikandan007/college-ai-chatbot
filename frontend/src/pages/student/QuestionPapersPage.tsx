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
  ChevronRight,
} from 'lucide-react';
import {
  QuestionPaper,
  FilterMeta,
  getQuestionPapers,
  getFilterMetadata,
  togglePaperBookmark,
  deleteQuestionPaper,
  getUserBookmarks,
  getUserHistory,
} from '../../api/questionPapers';
import { QuestionPaperCard } from '../../components/questionPapers/QuestionPaperCard';
import { QuestionPaperListItem } from '../../components/questionPapers/QuestionPaperListItem';
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
    <div className="w-full h-full overflow-x-hidden overflow-y-auto bg-[#F8FAFC] dark:bg-[#0A0A0A] text-[#111827] dark:text-[#FAFAFA] p-4 sm:p-6 lg:p-8 transition-colors select-none font-sans">
      <div className="w-full max-w-[1440px] mx-auto space-y-8">
        
        {/* Page Hero Header */}
        <div className="bg-[#FFFFFF] dark:bg-[#18181B] p-6 rounded-[16px] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-12 h-12 rounded-[12px] bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] flex items-center justify-center shrink-0">
              <FileText size={24} />
            </div>
            <div className="min-w-0 space-y-1">
              <h1 className="text-[30px] font-semibold text-[#111827] dark:text-[#FAFAFA] tracking-tight leading-tight truncate">
                Previous Year Question Papers
              </h1>
              <p className="text-[14px] font-normal text-[#6B7280] dark:text-[#A1A1AA] truncate">
                Search, preview, download, bookmark, and analyze university papers in one workspace.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsUploadOpen(true)}
            className="h-[40px] px-5 rounded-[10px] bg-[#111827] hover:bg-[#1F2937] dark:bg-[#FAFAFA] dark:hover:bg-[#E5E5E5] text-[#FFFFFF] dark:text-[#111111] font-medium text-[14px] transition flex items-center justify-center gap-2 cursor-pointer shrink-0 w-full sm:w-auto"
          >
            <Plus size={18} />
            <span>Upload Paper</span>
          </button>
        </div>

        {/* 4 Statistics Cards Grid (2x2 Mobile, 4-Col Desktop, Responsive Padding & Font Sizes) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          <div className="p-3.5 sm:p-5 lg:p-6 rounded-[16px] bg-[#FFFFFF] dark:bg-[#18181B] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs flex items-center justify-between min-w-0">
            <div className="min-w-0 flex-1 space-y-0.5 sm:space-y-1">
              <p className="text-[12px] sm:text-[14px] font-normal text-[#6B7280] dark:text-[#A1A1AA] truncate">Total Papers</p>
              <p className="text-[15px] sm:text-[22px] lg:text-[28px] font-semibold text-[#111827] dark:text-[#FAFAFA] leading-tight truncate">{totalPapersCount}</p>
              <p className="text-[11px] sm:text-[12px] font-normal text-[#6B7280] dark:text-[#A1A1AA] truncate">University archive</p>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-[8px] sm:rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA] flex items-center justify-center shrink-0 ml-1.5 sm:ml-3">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>

          <div className="p-3.5 sm:p-5 lg:p-6 rounded-[16px] bg-[#FFFFFF] dark:bg-[#18181B] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs flex items-center justify-between min-w-0">
            <div className="min-w-0 flex-1 space-y-0.5 sm:space-y-1">
              <p className="text-[12px] sm:text-[14px] font-normal text-[#6B7280] dark:text-[#A1A1AA] truncate">Subjects</p>
              <p className="text-[15px] sm:text-[22px] lg:text-[28px] font-semibold text-[#111827] dark:text-[#FAFAFA] leading-tight truncate">{meta?.subjects.length || 0}</p>
              <p className="text-[11px] sm:text-[12px] font-normal text-[#6B7280] dark:text-[#A1A1AA] truncate">Active courses</p>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-[8px] sm:rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA] flex items-center justify-center shrink-0 ml-1.5 sm:ml-3">
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>

          <div className="p-3.5 sm:p-5 lg:p-6 rounded-[16px] bg-[#FFFFFF] dark:bg-[#18181B] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs flex items-center justify-between min-w-0">
            <div className="min-w-0 flex-1 space-y-0.5 sm:space-y-1">
              <p className="text-[12px] sm:text-[14px] font-normal text-[#6B7280] dark:text-[#A1A1AA] truncate">Downloaded</p>
              <p className="text-[15px] sm:text-[22px] lg:text-[28px] font-semibold text-[#111827] dark:text-[#FAFAFA] leading-tight truncate">{papers.reduce((acc, paper) => acc + (paper.download_count || 0), 0)}</p>
              <p className="text-[11px] sm:text-[12px] font-normal text-[#6B7280] dark:text-[#A1A1AA] truncate">Total downloads</p>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-[8px] sm:rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA] flex items-center justify-center shrink-0 ml-1.5 sm:ml-3">
              <Download className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>

          <div className="p-3.5 sm:p-5 lg:p-6 rounded-[16px] bg-[#FFFFFF] dark:bg-[#18181B] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs flex items-center justify-between min-w-0">
            <div className="min-w-0 flex-1 space-y-0.5 sm:space-y-1">
              <p className="text-[12px] sm:text-[14px] font-normal text-[#6B7280] dark:text-[#A1A1AA] truncate">AI Analysis</p>
              <p className="text-[15px] sm:text-[22px] lg:text-[28px] font-semibold text-[#111827] dark:text-[#FAFAFA] leading-tight truncate">{papers.length > 0 ? 'Active' : 'Idle'}</p>
              <p className="text-[11px] sm:text-[12px] font-normal text-[#6B7280] dark:text-[#A1A1AA] truncate">Cross-exam AI engine</p>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-[8px] sm:rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA] flex items-center justify-center shrink-0 ml-1.5 sm:ml-3">
              <Brain className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
        </div>

        {/* Controls Bar: Search, View Switcher & Filters */}
        <div className="bg-[#FFFFFF] dark:bg-[#18181B] p-6 rounded-[16px] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs space-y-6">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6">
            {/* Tabs Navigation */}
            <div className="flex items-center bg-[#F8FAFC] dark:bg-[#111111] p-1.5 rounded-[12px] border border-[#E5E7EB] dark:border-[#2A2A2A] overflow-x-auto no-scrollbar w-full lg:w-auto">
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
                    className={`h-[36px] px-4 rounded-[8px] text-[14px] font-medium transition flex items-center justify-center gap-2 whitespace-nowrap flex-1 lg:flex-initial cursor-pointer ${
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
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
              {/* 100% width Search Bar on Mobile */}
              <div className="relative w-full sm:w-[320px] lg:w-[380px]">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7280] dark:text-[#A1A1AA]" size={18} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search papers, subjects, code, year..."
                  className="w-full h-[40px] pl-10 pr-4 rounded-[10px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#FFFFFF] dark:bg-[#18181B] text-[14px] text-[#111827] dark:text-[#FAFAFA] outline-none"
                />
              </div>

              {/* View Switcher */}
              <div className="flex items-center bg-[#F8FAFC] dark:bg-[#111111] p-1 rounded-[12px] border border-[#E5E7EB] dark:border-[#2A2A2A] h-[40px] shrink-0 w-full sm:w-auto justify-center">
                {[
                  { mode: 'grid', label: 'Grid', icon: LayoutGrid },
                  { mode: 'list', label: 'List', icon: List },
                  { mode: 'table', label: 'Table', icon: TableIcon },
                ].map(({ mode, label, icon: Icon }) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode as 'grid' | 'list' | 'table')}
                    title={`${label} View`}
                    className={`h-[32px] px-3.5 rounded-[8px] text-[14px] font-medium transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      viewMode === mode
                        ? 'bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111]'
                        : 'text-[#6B7280] dark:text-[#A1A1AA] hover:bg-[#FFFFFF] dark:hover:bg-[#18181B]'
                    }`}
                  >
                    <Icon size={15} />
                    <span>{label}</span>
                  </button>
                ))}
              </div>

              {/* Mobile Filter Trigger */}
              <button
                onClick={() => setIsFilterSheetOpen(true)}
                className="md:hidden h-[40px] w-full px-4 rounded-[10px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#FFFFFF] dark:bg-[#18181B] text-[14px] font-medium text-[#111827] dark:text-[#FAFAFA] flex items-center justify-center gap-2 cursor-pointer shrink-0"
              >
                <SlidersHorizontal size={16} />
                <span>Filters</span>
              </button>
            </div>
          </div>

          {/* Desktop Inline Filters (Auto Wrapping Filters) */}
          {activeTab === 'all' && (
            <div className="hidden md:block pt-4 border-t border-[#E5E7EB] dark:border-[#2A2A2A]">
              <div className="flex flex-wrap items-center gap-3">
                <select value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)} className="h-[40px] px-3.5 rounded-[10px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#FFFFFF] dark:bg-[#18181B] text-[14px] text-[#111827] dark:text-[#FAFAFA] outline-none cursor-pointer">
                  <option value="">Department</option>
                  {meta?.departments.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
                <select value={selectedSem} onChange={(e) => setSelectedSem(e.target.value)} className="h-[40px] px-3.5 rounded-[10px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#FFFFFF] dark:bg-[#18181B] text-[14px] text-[#111827] dark:text-[#FAFAFA] outline-none cursor-pointer">
                  <option value="">Semester</option>
                  {[1,2,3,4,5,6,7,8].map((s) => <option key={s} value={String(s)}>Sem {s}</option>)}
                </select>
                <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} className="h-[40px] px-3.5 rounded-[10px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#FFFFFF] dark:bg-[#18181B] text-[14px] text-[#111827] dark:text-[#FAFAFA] outline-none cursor-pointer">
                  <option value="">Subject</option>
                  {meta?.subjects.map((sub) => <option key={sub.code} value={sub.code}>{sub.name}</option>)}
                </select>
                <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="h-[40px] px-3.5 rounded-[10px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#FFFFFF] dark:bg-[#18181B] text-[14px] text-[#111827] dark:text-[#FAFAFA] outline-none cursor-pointer">
                  <option value="">Academic Year</option>
                  {meta?.years.map((y) => <option key={y} value={String(y)}>{y}</option>)}
                </select>
                <select value={selectedRegulation} onChange={(e) => setSelectedRegulation(e.target.value)} className="h-[40px] px-3.5 rounded-[10px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#FFFFFF] dark:bg-[#18181B] text-[14px] text-[#111827] dark:text-[#FAFAFA] outline-none cursor-pointer">
                  <option value="">Regulation</option>
                  {meta?.regulations.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
                <select value={selectedExamType} onChange={(e) => setSelectedExamType(e.target.value)} className="h-[40px] px-3.5 rounded-[10px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#FFFFFF] dark:bg-[#18181B] text-[14px] text-[#111827] dark:text-[#FAFAFA] outline-none cursor-pointer">
                  <option value="">Exam Type</option>
                  <option value="University Exam">University Exam</option>
                  <option value="Model Exam">Model Exam</option>
                  <option value="Internal">Internal</option>
                </select>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="h-[40px] px-3.5 rounded-[10px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#FFFFFF] dark:bg-[#18181B] text-[14px] text-[#111827] dark:text-[#FAFAFA] outline-none cursor-pointer">
                  <option value="academic_year">Sort: Year</option>
                  <option value="created_at">Sort: Newest</option>
                  <option value="subject_name">Sort: Subject</option>
                </select>
                <button onClick={handleResetFilters} className="h-[40px] px-4 rounded-[10px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#FFFFFF] dark:bg-[#18181B] text-[14px] font-medium text-[#111827] dark:text-[#FAFAFA] hover:bg-[#F8FAFC] dark:hover:bg-[#232323] transition flex items-center justify-center gap-1.5 cursor-pointer ml-auto">
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
            <div className="w-full max-h-[85vh] rounded-t-[20px] bg-[#FFFFFF] dark:bg-[#18181B] p-6 border-t border-[#E5E7EB] dark:border-[#2A2A2A] shadow-2xl flex flex-col" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between pb-4 border-b border-[#E5E7EB] dark:border-[#2A2A2A]">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal size={18} className="text-[#111827] dark:text-[#FAFAFA]" />
                  <h3 className="text-[20px] font-semibold text-[#111827] dark:text-[#FAFAFA]">Filter Question Papers</h3>
                </div>
                <button onClick={() => setIsFilterSheetOpen(false)} className="h-9 w-9 rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] flex items-center justify-center text-[#111827] dark:text-[#FAFAFA]">
                  <X size={18} />
                </button>
              </div>

              <div className="overflow-y-auto py-4 space-y-4">
                <div>
                  <label className="text-[14px] font-medium text-[#6B7280] dark:text-[#A1A1AA] mb-1 block">Department</label>
                  <select value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)} className="w-full h-[40px] px-3 rounded-[10px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#FFFFFF] dark:bg-[#18181B] text-[14px] text-[#111827] dark:text-[#FAFAFA] outline-none">
                    <option value="">All Departments</option>
                    {meta?.departments.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[14px] font-medium text-[#6B7280] dark:text-[#A1A1AA] mb-1 block">Semester</label>
                  <select value={selectedSem} onChange={(e) => setSelectedSem(e.target.value)} className="w-full h-[40px] px-3 rounded-[10px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#FFFFFF] dark:bg-[#18181B] text-[14px] text-[#111827] dark:text-[#FAFAFA] outline-none">
                    <option value="">All Semesters</option>
                    {[1,2,3,4,5,6,7,8].map((s) => <option key={s} value={String(s)}>Semester {s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[14px] font-medium text-[#6B7280] dark:text-[#A1A1AA] mb-1 block">Subject</label>
                  <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} className="w-full h-[40px] px-3 rounded-[10px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#FFFFFF] dark:bg-[#18181B] text-[14px] text-[#111827] dark:text-[#FAFAFA] outline-none">
                    <option value="">All Subjects</option>
                    {meta?.subjects.map((sub) => <option key={sub.code} value={sub.code}>{sub.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[14px] font-medium text-[#6B7280] dark:text-[#A1A1AA] mb-1 block">Academic Year</label>
                  <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="w-full h-[40px] px-3 rounded-[10px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#FFFFFF] dark:bg-[#18181B] text-[14px] text-[#111827] dark:text-[#FAFAFA] outline-none">
                    <option value="">All Academic Years</option>
                    {meta?.years.map((y) => <option key={y} value={String(y)}>{y}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[14px] font-medium text-[#6B7280] dark:text-[#A1A1AA] mb-1 block">Regulation</label>
                  <select value={selectedRegulation} onChange={(e) => setSelectedRegulation(e.target.value)} className="w-full h-[40px] px-3 rounded-[10px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#FFFFFF] dark:bg-[#18181B] text-[14px] text-[#111827] dark:text-[#FAFAFA] outline-none">
                    <option value="">All Regulations</option>
                    {meta?.regulations.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-[#E5E7EB] dark:border-[#2A2A2A] flex items-center gap-3">
                <button onClick={() => { handleResetFilters(); setIsFilterSheetOpen(false); }} className="flex-1 h-[40px] rounded-[10px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#FFFFFF] dark:bg-[#18181B] text-[14px] font-medium text-[#111827] dark:text-[#FAFAFA]">
                  Reset All
                </button>
                <button onClick={() => setIsFilterSheetOpen(false)} className="flex-1 h-[40px] rounded-[10px] bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] text-[14px] font-medium">
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content View Rendering */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-[280px] rounded-[16px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#F8FAFC] dark:bg-[#111111] animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="p-8 rounded-[16px] bg-[#FFFFFF] dark:bg-[#18181B] border border-[#E5E7EB] dark:border-[#2A2A2A] text-center space-y-2">
            <CircleAlert className="mx-auto text-[#6B7280] dark:text-[#A1A1AA]" size={36} />
            <h3 className="text-[20px] font-semibold text-[#111827] dark:text-[#FAFAFA]">Failed to load question papers</h3>
            <p className="text-[14px] text-[#6B7280] dark:text-[#A1A1AA]">{error}</p>
          </div>
        ) : papers.length > 0 ? (
          <>
            {/* GRID VIEW (3 Columns Desktop, 2 Columns Tablet, 1 Column Mobile, 24px Gap) */}
            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

            {/* LIST VIEW */}
            {viewMode === 'list' && (
              <div className="space-y-4">
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
                <div className="hidden md:block rounded-[16px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#FFFFFF] dark:bg-[#18181B] overflow-hidden shadow-xs">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-[#F8FAFC] dark:bg-[#111111] border-b border-[#E5E7EB] dark:border-[#2A2A2A] text-[13px] font-semibold text-[#6B7280] dark:text-[#A1A1AA] uppercase tracking-wider">
                      <tr>
                        <th className="py-3.5 px-4">Document / Code</th>
                        <th className="py-3.5 px-4">Regulation & Exam</th>
                        <th className="py-3.5 px-4">Year & Sem</th>
                        <th className="py-3.5 px-4">Department</th>
                        <th className="py-3.5 px-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E7EB] dark:divide-[#2A2A2A]">
                      {paginatedPapers.map((paper) => (
                        <tr key={paper.id} className="h-[56px] hover:bg-[#F8FAFC] dark:hover:bg-[#232323] transition-colors text-[14px] text-[#111827] dark:text-[#FAFAFA]">
                          <td className="py-3 px-4">
                            <div className="font-semibold truncate max-w-[280px]">{paper.title}</div>
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
                          <td className="py-3 px-4 whitespace-nowrap">
                            <div>{paper.department}</div>
                            <div className="text-[13px] text-[#6B7280] dark:text-[#A1A1AA]">Mount Zion</div>
                          </td>
                          <td className="py-3 px-4 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => setPreviewPaper(paper)}
                                className="h-[32px] px-3 rounded-[8px] bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] text-[13px] font-medium flex items-center gap-1 cursor-pointer"
                              >
                                <Eye size={14} /> Preview
                              </button>
                              <a
                                href={paper.file_url}
                                download
                                className="h-[32px] px-3 rounded-[8px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#FFFFFF] dark:bg-[#18181B] text-[#111827] dark:text-[#FAFAFA] text-[13px] font-medium flex items-center gap-1 cursor-pointer"
                              >
                                <Download size={14} /> Download
                              </a>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Fallback List for Table Mode */}
                <div className="md:hidden space-y-4">
                  {paginatedPapers.map((paper) => (
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

                {/* Table Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between p-4 rounded-[16px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#FFFFFF] dark:bg-[#18181B]">
                    <span className="text-[14px] text-[#6B7280] dark:text-[#A1A1AA]">
                      Page {currentPage} of {totalPages}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="h-[36px] px-3 rounded-[8px] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA] disabled:opacity-30 cursor-pointer"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <button
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="h-[36px] px-3 rounded-[8px] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA] disabled:opacity-30 cursor-pointer"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="p-12 rounded-[16px] bg-[#FFFFFF] dark:bg-[#18181B] border border-[#E5E7EB] dark:border-[#2A2A2A] text-center space-y-3">
            <BookOpen className="mx-auto text-[#6B7280] dark:text-[#A1A1AA]" size={40} />
            <h3 className="text-[20px] font-semibold text-[#111827] dark:text-[#FAFAFA]">No question papers found</h3>
            <p className="text-[14px] text-[#6B7280] dark:text-[#A1A1AA]">Try adjusting your search query or reset active filters.</p>
            <button
              onClick={handleResetFilters}
              className="mt-2 h-[40px] px-5 rounded-[10px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#FFFFFF] dark:bg-[#18181B] text-[14px] font-medium text-[#111827] dark:text-[#FAFAFA] inline-flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw size={16} /> Reset Filters
            </button>
          </div>
        )}

      </div>

      {/* PDF Viewer Modal */}
      {previewPaper && (
        <QuestionPaperPdfViewer
          isOpen={!!previewPaper}
          title={previewPaper.title}
          pdfUrl={previewPaper.file_url}
          fileName={previewPaper.file_name || `${previewPaper.subject_code}.pdf`}
          onClose={() => setPreviewPaper(null)}
        />
      )}

      {/* Analysis Modal */}
      <QuestionPaperAnalysisModal
        isOpen={!!analysisPaper}
        paper={analysisPaper}
        onClose={() => setAnalysisPaper(null)}
      />

      {/* AI Chat Drawer */}
      <QuestionPaperChatDrawer
        isOpen={!!chatPaper}
        paper={chatPaper}
        onClose={() => setChatPaper(null)}
      />

      {/* Upload Modal */}
      <QuestionPaperUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={() => { setIsUploadOpen(false); fetchPapers(); }}
        meta={meta}
      />
    </div>
  );
};

export default QuestionPapersPage;
