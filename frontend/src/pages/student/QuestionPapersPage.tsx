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
  Plus
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

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50/50 dark:bg-slate-950 p-4 sm:p-6 md:p-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white dark:bg-[#1E293B] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-[#0E2A6D] text-white dark:bg-[#60A5FA] dark:text-slate-950">
              <FileText size={22} />
            </div>
            <h1 className="text-2xl font-bold font-heading text-slate-900 dark:text-white">
              Previous Year Question Papers
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Browse, search, preview, analyze, download, and ask AI questions about university & internal exam papers.
          </p>
        </div>

        {/* Upload Action Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsUploadOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0E2A6D] text-white text-xs font-bold hover:bg-[#0E2A6D]/90 transition-all shadow-xs"
          >
            <Plus size={16} />
            <span>Upload Papers (Admin)</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white dark:bg-[#1E293B] p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        {/* Top Controls Bar */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Navigation Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'all'
                  ? 'bg-white dark:bg-[#1E293B] text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Layers size={14} />
              <span>All Papers</span>
            </button>

            <button
              onClick={() => setActiveTab('bookmarks')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'bookmarks'
                  ? 'bg-white dark:bg-[#1E293B] text-amber-600 dark:text-amber-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Bookmark size={14} />
              <span>Bookmarks</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'history'
                  ? 'bg-white dark:bg-[#1E293B] text-[#0E2A6D] dark:text-[#60A5FA] shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <History size={14} />
              <span>Recently Viewed</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by subject name, code, faculty, year..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#0E2A6D] dark:focus:ring-[#60A5FA]"
            />
          </div>
        </div>

        {/* Dropdown Filters (Department, Semester, Year, Regulation, Exam Type, Sort) */}
        {activeTab === 'all' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
            {/* Department */}
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs font-medium focus:outline-none"
            >
              <option value="">All Departments</option>
              {meta?.departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>

            {/* Semester */}
            <select
              value={selectedSem}
              onChange={(e) => setSelectedSem(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs font-medium focus:outline-none"
            >
              <option value="">All Semesters</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                <option key={s} value={String(s)}>
                  Semester {s}
                </option>
              ))}
            </select>

            {/* Year */}
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs font-medium focus:outline-none"
            >
              <option value="">All Academic Years</option>
              {meta?.years.map((y) => (
                <option key={y} value={String(y)}>
                  {y}
                </option>
              ))}
            </select>

            {/* Regulation */}
            <select
              value={selectedRegulation}
              onChange={(e) => setSelectedRegulation(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs font-medium focus:outline-none"
            >
              <option value="">All Regulations</option>
              {meta?.regulations.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>

            {/* Exam Type */}
            <select
              value={selectedExamType}
              onChange={(e) => setSelectedExamType(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs font-medium focus:outline-none"
            >
              <option value="">All Exam Types</option>
              <option value="University Exam">University Exam</option>
              <option value="Model Exam">Model Exam</option>
              <option value="Internal">Internal</option>
            </select>

            {/* Reset Filters */}
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-colors"
            >
              <RotateCcw size={14} />
              <span>Reset</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Papers Grid / List */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#0E2A6D] dark:border-[#60A5FA] border-t-transparent mb-4" />
          <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
            Loading Question Papers Database...
          </p>
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-center">
          <CircleAlert className="mx-auto text-rose-500 mb-2" size={28} />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Failed to load question papers</h3>
          <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">{error}</p>
        </div>
      ) : papers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
        <div className="py-20 text-center bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-xs">
          <FileText className="mx-auto text-slate-300 dark:text-slate-600 mb-3" size={44} />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            No question papers found
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
            There are no question papers matching your search or filter options.
          </p>
          <button
            onClick={handleResetFilters}
            className="mt-4 px-4 py-2 rounded-xl text-xs font-bold bg-[#0E2A6D] text-white hover:bg-[#0E2A6D]/90 shadow-xs"
          >
            Clear Filters
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
  );
};

export default QuestionPapersPage;
