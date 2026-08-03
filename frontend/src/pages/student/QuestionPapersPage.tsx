import React, { useState, useEffect, useCallback } from 'react';
import {
  FileText,
  BookOpen,
  Search,
  Filter,
  Upload,
  Bookmark,
  History,
  RotateCcw,
  Sparkles,
  Layers,
  CircleAlert,
  Plus,
  Building2,
  Calendar,
  Eye,
  Download,
  Brain,
  MessageSquare,
  FileCheck2,
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
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDept, setSelectedDept] = useState<string>('');
  const [selectedSem, setSelectedSem] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedRegulation, setSelectedRegulation] = useState<string>('');
  const [selectedExamType, setSelectedExamType] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('academic_year');

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
    setSelectedYear('');
    setSelectedRegulation('');
    setSelectedExamType('');
    setSearchQuery('');
    setSortBy('academic_year');
    setActiveTab('all');
  };

  // Dashboard Overview Metrics
  const totalPapersCount = papers.length;
  const uniqueDeptsCount = meta?.departments.length || 6;
  const uniqueYearsCount = meta?.years.length || 5;

  return (
    <div className="w-full h-full overflow-y-auto bg-[#FFFFFF] dark:bg-[#0A0A0A] text-[#111827] dark:text-[#FAFAFA] p-4 md:p-8 transition-colors">
      <div className="w-full max-w-[1600px] mx-auto space-y-8">

        {/* ========================================================================= */}
        {/* 1. PAGE HEADER CARD                                                       */}
        {/* ========================================================================= */}
        <div className="bg-[#FFFFFF] dark:bg-[#181818] p-6 md:p-8 rounded-[12px] border border-[#D1D5DB] dark:border-[#3F3F46] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-[10px] bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] flex items-center justify-center shrink-0">
              <FileText size={24} />
            </div>
            <div>
              <h1 className="text-[32px] font-bold text-[#111827] dark:text-[#FAFAFA] tracking-tight flex items-center gap-3">
                Previous Year Question Papers
                <span className="text-[12px] font-medium px-2.5 py-0.5 rounded-[6px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA]">
                  Academic Library
                </span>
              </h1>
              <p className="text-[14px] text-[#6B7280] dark:text-[#A3A3A3] mt-1">
                Browse, search, preview, analyze, download, and ask AI questions about university & internal exam papers.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsUploadOpen(true)}
            className="h-10 px-5 rounded-[10px] bg-[#111827] hover:bg-[#000000] dark:bg-[#FAFAFA] dark:hover:bg-[#E5E5E5] text-[#FFFFFF] dark:text-[#111111] font-medium text-[14px] shadow-xs transition flex items-center gap-2 cursor-pointer shrink-0"
          >
            <Plus size={16} />
            <span>Upload Paper</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* 2. DASHBOARD OVERVIEW CARDS                                               */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-6 rounded-[12px] bg-[#FFFFFF] dark:bg-[#181818] border border-[#D1D5DB] dark:border-[#3F3F46] shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[14px] font-medium text-[#6B7280] dark:text-[#A3A3A3]">Total Papers</p>
              <p className="text-[32px] font-bold text-[#111827] dark:text-[#FAFAFA] mt-1">{totalPapersCount}</p>
            </div>
            <div className="w-10 h-10 rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA] flex items-center justify-center">
              <FileText size={20} />
            </div>
          </div>

          <div className="p-6 rounded-[12px] bg-[#FFFFFF] dark:bg-[#181818] border border-[#D1D5DB] dark:border-[#3F3F46] shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[14px] font-medium text-[#6B7280] dark:text-[#A3A3A3]">Departments</p>
              <p className="text-[32px] font-bold text-[#111827] dark:text-[#FAFAFA] mt-1">{uniqueDeptsCount}</p>
            </div>
            <div className="w-10 h-10 rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA] flex items-center justify-center">
              <Building2 size={20} />
            </div>
          </div>

          <div className="p-6 rounded-[12px] bg-[#FFFFFF] dark:bg-[#181818] border border-[#D1D5DB] dark:border-[#3F3F46] shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[14px] font-medium text-[#6B7280] dark:text-[#A3A3A3]">Academic Years</p>
              <p className="text-[32px] font-bold text-[#111827] dark:text-[#FAFAFA] mt-1">{uniqueYearsCount}</p>
            </div>
            <div className="w-10 h-10 rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA] flex items-center justify-center">
              <Calendar size={20} />
            </div>
          </div>

          <div className="p-6 rounded-[12px] bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] border border-[#111827] dark:border-[#FAFAFA] shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[14px] font-medium opacity-80">AI RAG Analysis</p>
              <p className="text-[32px] font-bold mt-1">Ready</p>
            </div>
            <div className="w-10 h-10 rounded-[10px] bg-[#FFFFFF] dark:bg-[#111111] text-[#111827] dark:text-[#FAFAFA] flex items-center justify-center">
              <Brain size={20} />
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. SEARCH & FILTER TOOLBAR                                                */}
        {/* ========================================================================= */}
        <div className="bg-[#FFFFFF] dark:bg-[#181818] p-4 rounded-[12px] border border-[#D1D5DB] dark:border-[#3F3F46] shadow-xs space-y-4">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            {/* View Tabs */}
            <div className="flex items-center bg-[#F8FAFC] dark:bg-[#111111] p-1.5 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46]">
              <button
                onClick={() => setActiveTab('all')}
                className={`h-9 px-4 text-[14px] font-medium rounded-[8px] transition-all cursor-pointer flex items-center gap-2 ${
                  activeTab === 'all'
                    ? 'bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111]'
                    : 'text-[#4B5563] dark:text-[#A3A3A3] hover:bg-[#F9FAFB] dark:hover:bg-[#232323]'
                }`}
              >
                <Layers size={16} />
                <span>All Papers</span>
              </button>

              <button
                onClick={() => setActiveTab('bookmarks')}
                className={`h-9 px-4 text-[14px] font-medium rounded-[8px] transition-all cursor-pointer flex items-center gap-2 ${
                  activeTab === 'bookmarks'
                    ? 'bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111]'
                    : 'text-[#4B5563] dark:text-[#A3A3A3] hover:bg-[#F9FAFB] dark:hover:bg-[#232323]'
                }`}
              >
                <Bookmark size={16} />
                <span>Bookmarks</span>
              </button>

              <button
                onClick={() => setActiveTab('history')}
                className={`h-9 px-4 text-[14px] font-medium rounded-[8px] transition-all cursor-pointer flex items-center gap-2 ${
                  activeTab === 'history'
                    ? 'bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111]'
                    : 'text-[#4B5563] dark:text-[#A3A3A3] hover:bg-[#F9FAFB] dark:hover:bg-[#232323]'
                }`}
              >
                <History size={16} />
                <span>Recently Viewed</span>
              </button>
            </div>

            {/* Search Input Bar */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7280] dark:text-[#A3A3A3]" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by subject name, code, faculty, year..."
                className="w-full h-10 pl-10 pr-4 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#181818] text-[14px] text-[#111827] dark:text-[#FAFAFA] outline-none"
              />
            </div>
          </div>

          {/* Filter Dropdowns Grid */}
          {activeTab === 'all' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-3 border-t border-[#F3F4F6] dark:border-[#2A2A2A]">
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="h-10 px-3 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#181818] text-[14px] text-[#111827] dark:text-[#FAFAFA] outline-none cursor-pointer"
              >
                <option value="">All Departments</option>
                {meta?.departments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>

              <select
                value={selectedSem}
                onChange={(e) => setSelectedSem(e.target.value)}
                className="h-10 px-3 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#181818] text-[14px] text-[#111827] dark:text-[#FAFAFA] outline-none cursor-pointer"
              >
                <option value="">All Semesters</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={String(s)}>
                    Semester {s}
                  </option>
                ))}
              </select>

              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="h-10 px-3 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#181818] text-[14px] text-[#111827] dark:text-[#FAFAFA] outline-none cursor-pointer"
              >
                <option value="">All Academic Years</option>
                {meta?.years.map((y) => (
                  <option key={y} value={String(y)}>
                    {y}
                  </option>
                ))}
              </select>

              <select
                value={selectedRegulation}
                onChange={(e) => setSelectedRegulation(e.target.value)}
                className="h-10 px-3 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#181818] text-[14px] text-[#111827] dark:text-[#FAFAFA] outline-none cursor-pointer"
              >
                <option value="">All Regulations</option>
                {meta?.regulations.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>

              <select
                value={selectedExamType}
                onChange={(e) => setSelectedExamType(e.target.value)}
                className="h-10 px-3 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#181818] text-[14px] text-[#111827] dark:text-[#FAFAFA] outline-none cursor-pointer"
              >
                <option value="">All Exam Types</option>
                <option value="University Exam">University Exam</option>
                <option value="Model Exam">Model Exam</option>
                <option value="Internal">Internal</option>
              </select>

              <button
                onClick={handleResetFilters}
                className="h-10 px-4 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#181818] text-[14px] font-medium text-[#111827] dark:text-[#FAFAFA] hover:bg-[#F9FAFB] dark:hover:bg-[#232323] transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RotateCcw size={16} />
                <span>Reset</span>
              </button>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* 4. QUESTION PAPERS GRID                                                   */}
        {/* ========================================================================= */}
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center text-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#111827] dark:border-[#FAFAFA] border-t-transparent mb-4" />
            <p className="text-[14px] font-medium text-[#6B7280] dark:text-[#A3A3A3]">
              Loading Question Papers Database...
            </p>
          </div>
        ) : error ? (
          <div className="p-6 rounded-[12px] bg-[#FFFFFF] dark:bg-[#181818] border border-[#D1D5DB] dark:border-[#3F3F46] text-center shadow-xs">
            <CircleAlert className="mx-auto text-[#6B7280] dark:text-[#A3A3A3] mb-2" size={32} />
            <h3 className="text-[18px] font-bold text-[#111827] dark:text-[#FAFAFA]">Failed to load question papers</h3>
            <p className="text-[14px] text-[#6B7280] dark:text-[#A3A3A3] mt-1">{error}</p>
          </div>
        ) : papers.length > 0 ? (
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
        ) : (
          <div className="py-20 text-center bg-[#FFFFFF] dark:bg-[#181818] rounded-[12px] border border-[#D1D5DB] dark:border-[#3F3F46] p-8 shadow-xs space-y-3">
            <FileText className="mx-auto text-[#6B7280] dark:text-[#A3A3A3] opacity-40" size={48} />
            <h3 className="text-[18px] font-bold text-[#111827] dark:text-[#FAFAFA]">
              No Question Papers Available
            </h3>
            <p className="text-[14px] text-[#6B7280] dark:text-[#A3A3A3] max-w-sm mx-auto">
              Upload or import previous year papers to build your academic library.
            </p>
            <button
              onClick={handleResetFilters}
              className="mt-2 h-10 px-5 rounded-[10px] bg-[#111827] hover:bg-[#000000] dark:bg-[#FAFAFA] dark:hover:bg-[#E5E5E5] text-[#FFFFFF] dark:text-[#111111] font-medium text-[14px] shadow-xs cursor-pointer inline-flex items-center gap-2"
            >
              <span>Clear Filters</span>
            </button>
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
