import React, { useState, useEffect, useRef } from 'react';
import {
  Book,
  Upload,
  Sparkles,
  Download,
  Search,
  History,
  Trash2,
  CheckCircle2,
  HelpCircle,
  BookOpen,
  Layers,
  Zap,
  RefreshCw,
  X,
  FileCode,
  CheckSquare,
  Square,
  ChevronRight,
  RotateCcw,
  FileText,
  MessageSquare,
  Globe,
  HelpCircle as QuestionIcon,
  Eye,
  Clock,
  Filter
} from 'lucide-react';
import {
  generateNote,
  getNotesHistory,
  getNoteById,
  deleteNote,
  NoteResponse,
  NoteListItem,
  NoteContentSchema
} from '../../api/notes';
import { useToast } from '../../hooks/useToast';

export default function AINotesGeneratorPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [currentNote, setCurrentNote] = useState<NoteResponse | null>(null);
  const [activeTab, setActiveTab] = useState<
    'summary' | 'concepts' | 'formulae' | 'questions' | 'flashcards' | 'mcqs' | 'checklist'
  >('summary');

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<'all' | 'recent' | 'favorites' | 'pinned' | 'generated'>('all');

  // History List
  const [historyOpen, setHistoryOpen] = useState<boolean>(false);
  const [historyList, setHistoryList] = useState<NoteListItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);

  // Flashcards & MCQ interactive states
  const [flippedCards, setFlippedCards] = useState<{ [index: number]: boolean }>({});
  const [mcqAnswers, setMcqAnswers] = useState<{ [index: number]: string }>({});
  const [checklistState, setChecklistState] = useState<{ [index: number]: boolean }>({});

  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const data = await getNotesHistory();
      setHistoryList(data);
    } catch (err) {
      console.error('Failed to load notes history', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleGenerate = async () => {
    if (!selectedFile) {
      showToast('Please select or drag a document file (.pdf, .docx, .pptx, .txt)', 'error');
      return;
    }

    setIsGenerating(true);
    try {
      const note = await generateNote(selectedFile);
      setCurrentNote(note);
      setFlippedCards({});
      setMcqAnswers({});
      setChecklistState({});
      showToast('AI Study Notes generated successfully!', 'success');
      fetchHistory();
    } catch (err: any) {
      console.error(err);
      showToast(err?.response?.data?.detail || 'Failed to generate AI notes. Please try again.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectHistoryNote = async (id: number) => {
    try {
      const note = await getNoteById(id);
      setCurrentNote(note);
      setFlippedCards({});
      setMcqAnswers({});
      setChecklistState({});
      setHistoryOpen(false);
      showToast(`Loaded note: ${note.title}`, 'info');
    } catch (err) {
      showToast('Failed to load note details', 'error');
    }
  };

  const handleDeleteNote = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this note?')) return;
    try {
      await deleteNote(id);
      showToast('Note deleted successfully', 'success');
      if (currentNote && currentNote.id === id) {
        setCurrentNote(null);
      }
      fetchHistory();
    } catch (err) {
      showToast('Failed to delete note', 'error');
    }
  };

  const content: NoteContentSchema | null = currentNote ? (currentNote.content || null) : null;

  const exportAsMarkdown = () => {
    if (!content) return;
    let md = `# ${content.title}\n\n`;
    md += `## Executive Summary\n${content.executive_summary}\n\n`;
    md += `## Chapter Summary\n${content.chapter_summary}\n\n`;
    md += `## Key Concepts\n`;
    content.key_concepts?.forEach((c) => (md += `- ${c}\n`));
    md += `\n`;
    md += `## Definitions\n`;
    content.definitions?.forEach((d) => (md += `- **${d.term}**: ${d.definition}\n`));
    md += `\n`;

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${content.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_notes.md`;
    a.click();
    showToast('Exported as Markdown!', 'success');
  };

  const exportAsTextDoc = () => {
    if (!content) return;
    let docText = `${content.title.toUpperCase()}\n\n`;
    docText += `EXECUTIVE SUMMARY:\n${content.executive_summary}\n\n`;
    docText += `CHAPTER SUMMARY:\n${content.chapter_summary}\n\n`;

    const blob = new Blob([docText], { type: 'application/msword;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${content.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_notes.doc`;
    a.click();
    showToast('Exported as DOCX format!', 'success');
  };

  // Filter history notes based on search & filter category
  const filteredHistory = historyList.filter((item) => {
    const matchesSearch = searchQuery === '' || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.document_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="w-full h-full overflow-x-hidden overflow-y-auto bg-[#FFFFFF] dark:bg-[#0A0A0A] text-[#111827] dark:text-[#FAFAFA] p-4 sm:p-6 md:p-8 transition-colors select-none">
      {/* 1440px Centered Max Content Width Container */}
      <div className="w-full max-w-[1440px] mx-auto space-y-6">

        {/* Compact Hero Header (Matching AI Study Planner layout) */}
        <div className="bg-[#FFFFFF] dark:bg-[#18181B] p-4 sm:p-5 rounded-[16px] border border-[#D1D5DB] dark:border-[#3F3F46] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
            <div className="w-[40px] h-[40px] sm:w-[44px] sm:h-[44px] rounded-[10px] bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] flex items-center justify-center shrink-0">
              <Book size={22} />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-[20px] sm:text-[30px] font-[600] text-[#111827] dark:text-[#FAFAFA] tracking-tight leading-[1.2] truncate">
                AI Notes Generator
              </h1>
              <p className="text-[13px] sm:text-[14px] font-[500] text-[#6B7280] dark:text-[#A1A1AA] mt-0.5 truncate">
                Transform textbooks, PDFs, and slides into structured study notes, flashcards & MCQs.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3 shrink-0 w-full lg:w-auto pt-2 lg:pt-0 border-t lg:border-t-0 border-[#E5E7EB] dark:border-[#27272A]">
            <button
              onClick={() => setHistoryOpen(!historyOpen)}
              className="h-[38px] sm:h-[40px] px-3.5 sm:px-4 rounded-[12px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#18181B] text-[#111827] dark:text-[#FAFAFA] text-[13px] sm:text-[14px] font-[500] hover:bg-[#F8FAFC] dark:hover:bg-[#232323] transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0 active:scale-[0.98]"
            >
              <History size={16} />
              <span>History ({historyList.length})</span>
            </button>

            <button
              onClick={handleGenerate}
              disabled={isGenerating || !selectedFile}
              className="h-[38px] sm:h-[40px] px-[16px] sm:px-[18px] rounded-[12px] bg-[#111827] hover:bg-[#1F2937] active:bg-[#0F172A] dark:bg-[#FAFAFA] dark:hover:bg-[#F3F4F6] text-[#FFFFFF] dark:text-[#111111] text-[14px] font-[500] transition flex items-center justify-center gap-2 cursor-pointer shrink-0 active:scale-[0.98] disabled:opacity-40"
            >
              {isGenerating ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  <span>Generating Notes...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Generate Notes</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Overview Cards Banner (88px Height matching Study Analytics Banner) */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 select-none">
          <div className="h-[88px] p-3.5 sm:p-[16px] rounded-[16px] bg-[#FFFFFF] dark:bg-[#18181B] border border-[#D1D5DB] dark:border-[#3F3F46] shadow-xs flex items-center justify-between transition-all duration-150 ease-in-out hover:-translate-y-[2px] hover:shadow-md">
            <div className="min-w-0 flex-1 space-y-0.5">
              <p className="text-[12px] sm:text-[13px] font-[400] text-[#6B7280] dark:text-[#A1A1AA] truncate">Saved Notes</p>
              <p className="text-[26px] sm:text-[30px] font-[600] text-[#111827] dark:text-[#FAFAFA] leading-none truncate">{historyList.length}</p>
              <p className="text-[11px] sm:text-[13px] font-[400] text-[#6B7280] dark:text-[#A1A1AA] truncate pt-0.5">Study repository</p>
            </div>
            <div className="w-[34px] h-[34px] sm:w-[40px] sm:h-[40px] rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#D1D5DB] dark:border-[#3F3F46] text-[#111827] dark:text-[#FAFAFA] flex items-center justify-center shrink-0 ml-2 sm:ml-3">
              <Book size={18} />
            </div>
          </div>

          <div className="h-[88px] p-3.5 sm:p-[16px] rounded-[16px] bg-[#FFFFFF] dark:bg-[#18181B] border border-[#D1D5DB] dark:border-[#3F3F46] shadow-xs flex items-center justify-between transition-all duration-150 ease-in-out hover:-translate-y-[2px] hover:shadow-md">
            <div className="min-w-0 flex-1 space-y-0.5">
              <p className="text-[12px] sm:text-[13px] font-[400] text-[#6B7280] dark:text-[#A1A1AA] truncate">Flashcard Decks</p>
              <p className="text-[26px] sm:text-[30px] font-[600] text-[#111827] dark:text-[#FAFAFA] leading-none truncate">
                {content?.flashcards ? content.flashcards.length : 0} Cards
              </p>
              <p className="text-[11px] sm:text-[13px] font-[400] text-[#6B7280] dark:text-[#A1A1AA] truncate pt-0.5">Interactive revision</p>
            </div>
            <div className="w-[34px] h-[34px] sm:w-[40px] sm:h-[40px] rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#D1D5DB] dark:border-[#3F3F46] text-[#111827] dark:text-[#FAFAFA] flex items-center justify-center shrink-0 ml-2 sm:ml-3">
              <RotateCcw size={18} />
            </div>
          </div>

          <div className="h-[88px] p-3.5 sm:p-[16px] rounded-[16px] bg-[#FFFFFF] dark:bg-[#18181B] border border-[#D1D5DB] dark:border-[#3F3F46] shadow-xs flex items-center justify-between transition-all duration-150 ease-in-out hover:-translate-y-[2px] hover:shadow-md">
            <div className="min-w-0 flex-1 space-y-0.5">
              <p className="text-[12px] sm:text-[13px] font-[400] text-[#6B7280] dark:text-[#A1A1AA] truncate">MCQ Practice</p>
              <p className="text-[26px] sm:text-[30px] font-[600] text-[#111827] dark:text-[#FAFAFA] leading-none truncate">
                {content?.mcqs ? content.mcqs.length : 0} Questions
              </p>
              <p className="text-[11px] sm:text-[13px] font-[400] text-[#6B7280] dark:text-[#A1A1AA] truncate pt-0.5">Auto-graded quiz</p>
            </div>
            <div className="w-[34px] h-[34px] sm:w-[40px] sm:h-[40px] rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#D1D5DB] dark:border-[#3F3F46] text-[#111827] dark:text-[#FAFAFA] flex items-center justify-center shrink-0 ml-2 sm:ml-3">
              <CheckSquare size={18} />
            </div>
          </div>

          <div className="h-[88px] p-3.5 sm:p-[16px] rounded-[16px] bg-[#FFFFFF] dark:bg-[#18181B] border border-[#D1D5DB] dark:border-[#3F3F46] shadow-xs flex items-center justify-between transition-all duration-150 ease-in-out hover:-translate-y-[2px] hover:shadow-md">
            <div className="min-w-0 flex-1 space-y-0.5">
              <p className="text-[12px] sm:text-[13px] font-[400] text-[#6B7280] dark:text-[#A1A1AA] truncate">Synthesis Mode</p>
              <p className="text-[26px] sm:text-[30px] font-[600] text-[#111827] dark:text-[#FAFAFA] leading-none truncate">GPT-4o Vision</p>
              <p className="text-[11px] sm:text-[13px] font-[400] text-[#6B7280] dark:text-[#A1A1AA] truncate pt-0.5">Deep comprehension</p>
            </div>
            <div className="w-[34px] h-[34px] sm:w-[40px] sm:h-[40px] rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#D1D5DB] dark:border-[#3F3F46] text-[#111827] dark:text-[#FAFAFA] flex items-center justify-center shrink-0 ml-2 sm:ml-3">
              <Sparkles size={18} />
            </div>
          </div>
        </div>

        {/* Upload & Document Preview Card */}
        <div className="grid grid-cols-1 gap-6 select-none">
          {!selectedFile ? (
            /* Upload Section Dropzone */
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="bg-[#FFFFFF] dark:bg-[#18181B] rounded-[16px] border-2 border-dashed border-[#D1D5DB] dark:border-[#3F3F46] p-6 sm:p-8 text-center transition-all hover:border-[#111827] dark:hover:border-[#FAFAFA] flex flex-col items-center justify-center min-h-[260px] shadow-xs space-y-4"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf,.docx,.pptx,.txt"
                className="hidden"
              />

              <div className="w-[52px] h-[52px] rounded-[12px] bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] flex items-center justify-center mx-auto">
                <Upload size={24} />
              </div>

              <div className="max-w-md space-y-1">
                <h3 className="text-[18px] font-[700] text-[#111827] dark:text-[#FAFAFA]">
                  Upload Study Document
                </h3>
                <p className="text-[13px] font-[500] text-[#6B7280] dark:text-[#A1A1AA]">
                  Drag & drop your file here or click to select from computer
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 text-[13px] text-[#6B7280] dark:text-[#A1A1AA]">
                <span className="font-[600]">Supported Files:</span>
                <span className="px-2.5 py-1 rounded-[8px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#D1D5DB] dark:border-[#3F3F46] text-[12px] font-[400] text-[#111827] dark:text-[#FAFAFA]">PDF</span>
                <span className="px-2.5 py-1 rounded-[8px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#D1D5DB] dark:border-[#3F3F46] text-[12px] font-[400] text-[#111827] dark:text-[#FAFAFA]">DOCX</span>
                <span className="px-2.5 py-1 rounded-[8px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#D1D5DB] dark:border-[#3F3F46] text-[12px] font-[400] text-[#111827] dark:text-[#FAFAFA]">PPTX</span>
                <span className="px-2.5 py-1 rounded-[8px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#D1D5DB] dark:border-[#3F3F46] text-[12px] font-[400] text-[#111827] dark:text-[#FAFAFA]">TXT</span>
              </div>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="h-[40px] px-5 rounded-[12px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#18181B] text-[#111827] dark:text-[#FAFAFA] font-[700] text-[14px] hover:bg-[#F8FAFC] dark:hover:bg-[#232323] transition cursor-pointer active:scale-[0.98]"
              >
                Browse Files
              </button>
            </div>
          ) : (
            /* Selected Document Preview Card */
            <div className="bg-[#FFFFFF] dark:bg-[#18181B] rounded-[16px] border border-[#D1D5DB] dark:border-[#3F3F46] p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-[44px] h-[44px] rounded-[10px] bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] flex items-center justify-center shrink-0">
                  <FileText size={22} />
                </div>
                <div>
                  <h3 className="text-[18px] font-[700] text-[#111827] dark:text-[#FAFAFA]">
                    {selectedFile.name}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 text-[13px] font-[500] text-[#6B7280] dark:text-[#A1A1AA] mt-1">
                    <span>Size: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</span>
                    <span>•</span>
                    <span>Type: {selectedFile.name.split('.').pop()?.toUpperCase()}</span>
                    <span>•</span>
                    <span>Uploaded: Today</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="h-[38px] px-4 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#18181B] text-[#111827] dark:text-[#FAFAFA] text-[14px] font-[500] hover:bg-[#F8FAFC] dark:hover:bg-[#232323] transition cursor-pointer active:scale-[0.98]"
                >
                  Replace Document
                </button>
                <button
                  onClick={() => setSelectedFile(null)}
                  className="h-[38px] px-4 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#18181B] text-[#6B7280] dark:text-[#A1A1AA] hover:text-[#DC2626] transition text-[14px] font-[500] cursor-pointer active:scale-[0.98]"
                >
                  Remove
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf,.docx,.pptx,.txt"
                  className="hidden"
                />
              </div>
            </div>
          )}
        </div>

        {/* Loading Skeleton Loader */}
        {isGenerating && (
          <div className="bg-[#FFFFFF] dark:bg-[#18181B] p-6 rounded-[16px] border border-[#D1D5DB] dark:border-[#3F3F46] shadow-xs space-y-6 animate-pulse select-none">
            <div className="flex items-center justify-between">
              <div className="h-6 bg-[#E5E7EB] dark:bg-[#27272A] rounded w-1/3"></div>
              <div className="h-6 bg-[#E5E7EB] dark:bg-[#27272A] rounded w-1/6"></div>
            </div>
            <div className="h-2.5 bg-[#E5E7EB] dark:bg-[#27272A] rounded-full w-full overflow-hidden relative">
              <div className="bg-[#111827] dark:bg-[#FAFAFA] h-full w-1/2 animate-pulse"></div>
            </div>
            <div className="space-y-3 pt-2">
              <div className="h-4 bg-[#E5E7EB] dark:bg-[#27272A] rounded w-full"></div>
              <div className="h-4 bg-[#E5E7EB] dark:bg-[#27272A] rounded w-5/6"></div>
              <div className="h-4 bg-[#E5E7EB] dark:bg-[#27272A] rounded w-4/6"></div>
            </div>
          </div>
        )}

        {/* Search & Filter Toolbar */}
        <div className="bg-[#FFFFFF] dark:bg-[#18181B] p-3 sm:p-4 rounded-[16px] border border-[#D1D5DB] dark:border-[#3F3F46] flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4 select-none">
          {/* Segmented Filter Pills Toolbar */}
          <div className="flex items-center bg-[#F8FAFC] dark:bg-[#111111] p-1 rounded-[12px] border border-[#D1D5DB] dark:border-[#3F3F46] min-h-[44px] max-w-full overflow-x-auto no-scrollbar">
            {[
              { id: 'all', label: 'All' },
              { id: 'recent', label: 'Recent' },
              { id: 'favorites', label: 'Favorites' },
              { id: 'pinned', label: 'Pinned' },
              { id: 'generated', label: 'Generated' },
            ].map((chip) => {
              const isActive = filterCategory === chip.id;
              return (
                <button
                  key={chip.id}
                  onClick={() => setFilterCategory(chip.id as any)}
                  className={`h-[36px] px-3.5 sm:px-4 rounded-[8px] text-[14px] font-[500] transition cursor-pointer whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-[#111827] text-[#FFFFFF] dark:bg-[#FAFAFA] dark:text-[#111111]'
                      : 'text-[#6B7280] dark:text-[#A1A1AA] hover:bg-[#FFFFFF] dark:hover:bg-[#18181B]'
                  }`}
                >
                  {chip.label}
                </button>
              );
            })}
          </div>

          <div className="relative flex-1 lg:w-64">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7280] dark:text-[#A1A1AA]" />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-[38px] sm:h-[40px] pl-9 pr-4 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#18181B] text-[13px] sm:text-[14px] font-[600] text-[#111827] dark:text-[#FAFAFA] outline-none"
            />
          </div>
        </div>

        {/* GENERATED NOTES DISPLAY */}
        {content ? (
          <div className="space-y-6 select-none">
            {/* Sub-Tabs AI Actions Toolbar */}
            <div className="bg-[#FFFFFF] dark:bg-[#18181B] rounded-[16px] border border-[#D1D5DB] dark:border-[#3F3F46] p-3 sm:p-4 shadow-xs space-y-3">
              <div className="text-[12px] font-[400] uppercase tracking-wider text-[#6B7280] dark:text-[#A1A1AA]">
                AI Notes Toolkit & Actions
              </div>
              <div className="flex items-center gap-2 bg-[#F8FAFC] dark:bg-[#111111] p-1 rounded-[12px] border border-[#D1D5DB] dark:border-[#3F3F46] min-h-[44px] max-w-full overflow-x-auto no-scrollbar">
                {[
                  { id: 'summary', label: 'Summary', icon: FileText },
                  { id: 'concepts', label: 'Key Points', icon: Layers },
                  { id: 'formulae', label: 'Definitions', icon: BookOpen },
                  { id: 'questions', label: 'Questions', icon: QuestionIcon },
                  { id: 'flashcards', label: 'Flashcards', icon: RotateCcw },
                  { id: 'mcqs', label: 'MCQs', icon: CheckSquare },
                  { id: 'checklist', label: 'Revision Notes', icon: CheckCircle2 },
                ].map((act) => {
                  const IconComp = act.icon;
                  const isActive = activeTab === act.id;
                  return (
                    <button
                      key={act.id}
                      onClick={() => setActiveTab(act.id as any)}
                      className={`h-[36px] px-3.5 sm:px-4 rounded-[8px] text-[14px] font-[500] transition flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 active:scale-[0.98] ${
                        isActive
                          ? 'bg-[#111827] text-[#FFFFFF] dark:bg-[#FAFAFA] dark:text-[#111111]'
                          : 'text-[#6B7280] dark:text-[#A1A1AA] hover:bg-[#FFFFFF] dark:hover:bg-[#18181B]'
                      }`}
                    >
                      <IconComp size={15} />
                      <span>{act.label}</span>
                    </button>
                  );
                })}

                <div className="h-5 w-[1px] bg-[#D1D5DB] dark:bg-[#3F3F46] mx-1 shrink-0" />

                <button
                  onClick={exportAsMarkdown}
                  className="h-[36px] px-3.5 rounded-[8px] bg-[#FFFFFF] dark:bg-[#18181B] text-[#111827] dark:text-[#FAFAFA] border border-[#D1D5DB] dark:border-[#3F3F46] text-[14px] font-[500] hover:bg-[#F8FAFC] transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0 active:scale-[0.98]"
                >
                  <FileCode size={15} />
                  <span>Markdown</span>
                </button>

                <button
                  onClick={exportAsTextDoc}
                  className="h-[36px] px-4 rounded-[8px] bg-[#111827] hover:bg-[#1F2937] active:bg-[#0F172A] dark:bg-[#FAFAFA] dark:hover:bg-[#F3F4F6] text-[#FFFFFF] dark:text-[#111111] font-[700] text-[13px] transition flex items-center justify-center gap-2 cursor-pointer shrink-0 active:scale-[0.98]"
                >
                  <Download size={15} />
                  <span>Download Notes</span>
                </button>
              </div>
            </div>

            {/* Main Reading Document Container */}
            <div className="bg-[#FFFFFF] dark:bg-[#18181B] p-6 lg:p-8 rounded-[16px] border border-[#D1D5DB] dark:border-[#3F3F46] shadow-xs min-h-[400px]">
              <div className="border-b border-[#D1D5DB] dark:border-[#3F3F46] pb-4 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div>
                  <h2 className="text-[24px] font-[700] text-[#111827] dark:text-[#FAFAFA]">
                    {content.title}
                  </h2>
                  <p className="text-[14px] font-[500] text-[#6B7280] dark:text-[#A1A1AA] mt-0.5">
                    Generated Study Material
                  </p>
                </div>
                <div className="text-[14px] font-[500] text-[#6B7280] dark:text-[#A1A1AA]">
                  Active Section: <span className="font-[700] text-[#111827] dark:text-[#FAFAFA] capitalize">{activeTab}</span>
                </div>
              </div>

              {activeTab === 'summary' && (
                <div className="space-y-6 max-w-4xl">
                  <div className="bg-[#F8FAFC] dark:bg-[#111111] p-6 rounded-[12px] border border-[#D1D5DB] dark:border-[#3F3F46]">
                    <h3 className="text-[18px] font-[700] text-[#111827] dark:text-[#FAFAFA] mb-3 flex items-center gap-2">
                      <FileText size={18} />
                      <span>Executive Summary</span>
                    </h3>
                    <p className="text-[15px] font-[500] text-[#111827] dark:text-[#FAFAFA] leading-relaxed">
                      {content.executive_summary}
                    </p>
                  </div>

                  <div className="bg-[#F8FAFC] dark:bg-[#111111] p-6 rounded-[12px] border border-[#D1D5DB] dark:border-[#3F3F46]">
                    <h3 className="text-[18px] font-[700] text-[#111827] dark:text-[#FAFAFA] mb-3 flex items-center gap-2">
                      <BookOpen size={18} />
                      <span>Detailed Overview</span>
                    </h3>
                    <p className="text-[15px] font-[500] text-[#111827] dark:text-[#FAFAFA] leading-relaxed whitespace-pre-line">
                      {content.chapter_summary}
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'concepts' && (
                <div className="space-y-4 max-w-4xl">
                  <h3 className="text-[18px] font-[700] text-[#111827] dark:text-[#FAFAFA]">
                    Key Points & Concepts
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {content.key_concepts?.map((kc, idx) => (
                      <div key={idx} className="bg-[#F8FAFC] dark:bg-[#111111] p-5 rounded-[12px] border border-[#D1D5DB] dark:border-[#3F3F46] flex items-start gap-3">
                        <span className="w-6 h-6 rounded-[6px] bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] text-[14px] font-[500] flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <p className="text-[14px] font-[600] text-[#111827] dark:text-[#FAFAFA] leading-relaxed">{kc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'formulae' && (
                <div className="space-y-4 max-w-4xl">
                  <h3 className="text-[18px] font-[700] text-[#111827] dark:text-[#FAFAFA]">
                    Definitions & Key Terms
                  </h3>
                  <div className="space-y-3">
                    {content.definitions?.map((df, idx) => (
                      <div key={idx} className="bg-[#F8FAFC] dark:bg-[#111111] p-5 rounded-[12px] border border-[#D1D5DB] dark:border-[#3F3F46]">
                        <h4 className="text-[16px] font-[700] text-[#111827] dark:text-[#FAFAFA] mb-1">{df.term}</h4>
                        <p className="text-[14px] font-[500] text-[#6B7280] dark:text-[#A1A1AA]">{df.definition}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'questions' && (
                <div className="space-y-6 max-w-4xl">
                  {content.questions?.two_marks && (
                    <div className="space-y-3">
                      <h4 className="text-[18px] font-[700] text-[#111827] dark:text-[#FAFAFA]">Short Important Questions (2 Marks)</h4>
                      <div className="space-y-2">
                        {content.questions.two_marks.map((q, i) => (
                          <div key={i} className="bg-[#F8FAFC] dark:bg-[#111111] p-4 rounded-[12px] border border-[#D1D5DB] dark:border-[#3F3F46] text-[14px] font-[600] text-[#111827] dark:text-[#FAFAFA]">
                            <span className="font-[700] mr-2">{i + 1}.</span>{q}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {content.questions?.five_marks && (
                    <div className="space-y-3 pt-2">
                      <h4 className="text-[18px] font-[700] text-[#111827] dark:text-[#FAFAFA]">Long Important Questions (5 Marks)</h4>
                      <div className="space-y-2">
                        {content.questions.five_marks.map((q, i) => (
                          <div key={i} className="bg-[#F8FAFC] dark:bg-[#111111] p-4 rounded-[12px] border border-[#D1D5DB] dark:border-[#3F3F46] text-[14px] font-[600] text-[#111827] dark:text-[#FAFAFA]">
                            <span className="font-[700] mr-2">{i + 1}.</span>{q}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'flashcards' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {content.flashcards?.map((fc, i) => {
                    const isFlipped = flippedCards[i];
                    return (
                      <div
                        key={i}
                        onClick={() => setFlippedCards((prev) => ({ ...prev, [i]: !prev[i] }))}
                        className="h-48 p-6 rounded-[16px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#18181B] shadow-xs hover:shadow-md transition-all duration-150 ease-in-out hover:-translate-y-[2px] cursor-pointer flex flex-col justify-between text-center select-none"
                      >
                        <span className="text-[11px] font-[400] uppercase tracking-wider text-[#6B7280] dark:text-[#A1A1AA]">
                          {isFlipped ? 'Answer Side' : 'Question (Click to Flip)'}
                        </span>
                        <p className="text-[15px] font-[400] text-[#111827] dark:text-[#FAFAFA] my-auto">
                          {isFlipped ? fc.back : fc.front}
                        </p>
                        <span className="text-[12px] font-[600] text-[#6B7280] dark:text-[#A1A1AA]">Flashcard #{i + 1}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {activeTab === 'mcqs' && (
                <div className="space-y-6 max-w-4xl">
                  {content.mcqs?.map((m, i) => (
                    <div key={i} className="bg-[#F8FAFC] dark:bg-[#111111] p-6 rounded-[12px] border border-[#D1D5DB] dark:border-[#3F3F46] space-y-4">
                      <h4 className="text-[16px] font-[700] text-[#111827] dark:text-[#FAFAFA]">
                        Q{i + 1}. {m.question}
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {m.options?.map((opt, oIdx) => (
                          <button
                            key={oIdx}
                            onClick={() => setMcqAnswers((prev) => ({ ...prev, [i]: opt }))}
                            className={`p-3.5 rounded-[10px] border text-[14px] font-[500] text-left transition cursor-pointer active:scale-[0.98] ${
                              mcqAnswers[i] === opt
                                ? 'bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] border-[#111827]'
                                : 'bg-[#FFFFFF] dark:bg-[#18181B] border-[#D1D5DB] dark:border-[#3F3F46] text-[#111827] dark:text-[#FAFAFA] hover:bg-[#F8FAFC] dark:hover:bg-[#232323]'
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'checklist' && (
                <div className="space-y-3 max-w-4xl">
                  {content.checklist?.map((chk, i) => (
                    <div
                      key={i}
                      onClick={() => setChecklistState((prev) => ({ ...prev, [i]: !prev[i] }))}
                      className="bg-[#F8FAFC] dark:bg-[#111111] p-4 rounded-[12px] border border-[#D1D5DB] dark:border-[#3F3F46] flex items-center gap-3 cursor-pointer"
                    >
                      <button className="text-[#111827] dark:text-[#FAFAFA]">
                        {checklistState[i] ? <CheckSquare size={18} /> : <Square size={18} className="text-[#6B7280] dark:text-[#A1A1AA]" />}
                      </button>
                      <span className={`text-[14px] font-[600] ${checklistState[i] ? 'line-through text-[#6B7280] dark:text-[#A1A1AA]' : 'text-[#111827] dark:text-[#FAFAFA]'}`}>
                        {chk}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* EMPTY STATE CARD */
          !isGenerating && (
            <div className="bg-[#FFFFFF] dark:bg-[#18181B] p-12 text-center rounded-[16px] border border-[#D1D5DB] dark:border-[#3F3F46] shadow-xs space-y-4 select-none">
              <div className="w-[80px] h-[80px] rounded-[16px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#D1D5DB] dark:border-[#3F3F46] flex items-center justify-center mx-auto text-[#111827] dark:text-[#FAFAFA]">
                <Book size={36} />
              </div>
              <div>
                <h3 className="text-[20px] font-[700] text-[#111827] dark:text-[#FAFAFA]">No Notes Generated Yet</h3>
                <p className="text-[14px] font-[500] text-[#6B7280] dark:text-[#A1A1AA] max-w-md mx-auto mt-1">
                  Upload a document and let AI generate smart study notes, summaries, flashcards, and MCQs.
                </p>
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="h-[40px] px-5 rounded-[12px] bg-[#111827] hover:bg-[#1F2937] dark:bg-[#FAFAFA] dark:hover:bg-[#F3F4F6] text-[#FFFFFF] dark:text-[#111111] font-[700] text-[14px] transition flex items-center justify-center gap-2 cursor-pointer mx-auto active:scale-[0.98]"
              >
                <Upload size={16} />
                <span>Upload Document</span>
              </button>
            </div>
          )
        )}

        {/* NOTES HISTORY TABLE SECTION */}
        <div className="space-y-4 select-none">
          <div className="flex items-center justify-between">
            <h2 className="text-[22px] font-[700] text-[#111827] dark:text-[#FAFAFA]">
              Notes History
            </h2>
            <span className="text-[14px] font-[500] text-[#6B7280] dark:text-[#A1A1AA]">
              Total Records: {historyList.length}
            </span>
          </div>

          <div className="bg-[#FFFFFF] dark:bg-[#18181B] rounded-[16px] border border-[#D1D5DB] dark:border-[#3F3F46] shadow-xs overflow-hidden">
            {historyList.length === 0 ? (
              <div className="p-8 text-center text-[#6B7280] dark:text-[#A1A1AA] text-[14px] font-[500]">
                No generated notes in history.
              </div>
            ) : (
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#D1D5DB] dark:border-[#3F3F46] bg-[#F8FAFC] dark:bg-[#111111] text-[12px] font-[400] uppercase tracking-wider text-[#6B7280] dark:text-[#A1A1AA]">
                      <th className="py-3.5 px-5">Document & Title</th>
                      <th className="py-3.5 px-5">Created Date</th>
                      <th className="py-3.5 px-5">Status</th>
                      <th className="py-3.5 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D1D5DB] dark:divide-[#3F3F46] text-[14px] font-[600] text-[#111827] dark:text-[#FAFAFA]">
                    {filteredHistory.map((item) => (
                      <tr
                        key={item.id}
                        className="hover:bg-[#F8FAFC] dark:hover:bg-[#232323] transition cursor-pointer"
                        onClick={() => handleSelectHistoryNote(item.id)}
                      >
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3">
                            <div className="w-[36px] h-[36px] rounded-[10px] bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] flex items-center justify-center shrink-0">
                              <FileText size={18} />
                            </div>
                            <div>
                              <div className="font-[700] text-[#111827] dark:text-[#FAFAFA]">{item.title}</div>
                              <div className="text-[12px] font-[500] text-[#6B7280] dark:text-[#A1A1AA]">{item.document_name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-5 text-[#6B7280] dark:text-[#A1A1AA] font-[500]">
                          {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Recent'}
                        </td>
                        <td className="py-4 px-5">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-[400] bg-[#111827] text-[#FFFFFF] dark:bg-[#FAFAFA] dark:text-[#111111]">
                            Generated
                          </span>
                        </td>
                        <td className="py-4 px-5 text-right">
                          <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => handleSelectHistoryNote(item.id)}
                              className="h-[34px] w-[34px] rounded-[8px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#18181B] text-[#111827] dark:text-[#FAFAFA] flex items-center justify-center hover:bg-[#F8FAFC] dark:hover:bg-[#232323] transition cursor-pointer shrink-0 active:scale-[0.98]"
                              title="View Note"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={(e) => handleDeleteNote(item.id, e)}
                              className="h-[34px] w-[34px] rounded-[8px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#18181B] text-[#6B7280] dark:text-[#A1A1AA] hover:text-[#DC2626] flex items-center justify-center hover:bg-[#F8FAFC] dark:hover:bg-[#232323] transition cursor-pointer shrink-0 active:scale-[0.98]"
                              title="Delete Note"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}



