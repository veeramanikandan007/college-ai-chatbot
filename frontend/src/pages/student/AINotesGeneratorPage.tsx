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
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#FFFFFF] dark:bg-[#0A0A0A] text-[#111827] dark:text-[#FAFAFA] font-sans transition-colors duration-300 space-y-6">
      <div className="mx-auto max-w-6xl space-y-6">
        
        {/* ==================================================
            PAGE HEADER (Monochrome Header Card)
            ================================================== */}
        <div className="bg-[#FFFFFF] dark:bg-[#181818] p-6 rounded-[12px] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-150">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-[10px] bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] flex items-center justify-center shrink-0 shadow-xs">
              <Book size={24} className="stroke-[2.2]" />
            </div>
            <div>
              <h1 className="text-[32px] font-bold tracking-tight text-[#111827] dark:text-[#FAFAFA] leading-tight">
                AI Notes Generator
              </h1>
              <p className="text-[14px] text-[#4B5563] dark:text-[#A3A3A3] mt-1">
                Transform textbooks, PDFs, and slides into structured study notes, flashcards & MCQs.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setHistoryOpen(!historyOpen)}
              className="h-10 px-4 rounded-[10px] border border-[#D1D5DB] dark:border-[#2A2A2A] bg-[#FFFFFF] dark:bg-[#181818] text-[#111827] dark:text-[#FAFAFA] hover:bg-[#F9FAFB] dark:hover:bg-[#232323] transition-all duration-150 text-[14px] font-medium flex items-center space-x-2 cursor-pointer"
            >
              <History size={16} className="text-[#111827] dark:text-[#FAFAFA]" />
              <span>Notes History</span>
            </button>

            <button
              onClick={handleGenerate}
              disabled={isGenerating || !selectedFile}
              className="h-10 px-5 rounded-[10px] bg-[#111827] hover:bg-[#000000] dark:bg-[#FAFAFA] dark:hover:bg-[#E5E7EB] text-[#FFFFFF] dark:text-[#111111] font-medium text-[14px] shadow-xs transition-all duration-150 disabled:opacity-40 flex items-center space-x-2 cursor-pointer"
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

        {/* ==================================================
            UPLOAD SECTION & DOCUMENT PREVIEW
            ================================================== */}
        <div className="grid grid-cols-1 gap-6">
          {!selectedFile ? (
            /* Upload Section */
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="bg-[#FFFFFF] dark:bg-[#181818] rounded-[12px] border-2 border-dashed border-[#E5E7EB] dark:border-[#2A2A2A] p-8 text-center transition-all duration-150 hover:border-[#111827] dark:hover:border-[#A3A3A3] flex flex-col items-center justify-center space-y-4 shadow-xs"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf,.docx,.pptx,.txt"
                className="hidden"
              />

              <div className="w-12 h-12 rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] text-[#111827] dark:text-[#FAFAFA] flex items-center justify-center border border-[#E5E7EB] dark:border-[#2A2A2A]">
                <Upload size={22} className="text-[#111827] dark:text-[#FAFAFA]" />
              </div>

              <div className="max-w-md space-y-1">
                <h3 className="text-[18px] font-semibold text-[#111827] dark:text-[#FAFAFA]">
                  Upload Study Document
                </h3>
                <p className="text-[14px] text-[#4B5563] dark:text-[#A3A3A3]">
                  Drag & drop your file here or click to select from computer
                </p>
              </div>

              <div className="flex items-center space-x-2 pt-1 text-[14px] text-[#6B7280]">
                <span className="font-medium text-[#4B5563] dark:text-[#A3A3A3]">Supported Files:</span>
                <span className="px-2 py-0.5 rounded-[6px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[12px] font-semibold text-[#111827] dark:text-[#FAFAFA]">PDF</span>
                <span className="px-2 py-0.5 rounded-[6px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[12px] font-semibold text-[#111827] dark:text-[#FAFAFA]">DOCX</span>
                <span className="px-2 py-0.5 rounded-[6px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[12px] font-semibold text-[#111827] dark:text-[#FAFAFA]">PPTX</span>
                <span className="px-2 py-0.5 rounded-[6px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[12px] font-semibold text-[#111827] dark:text-[#FAFAFA]">TXT</span>
              </div>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="mt-2 px-5 py-2.5 rounded-[10px] bg-[#FFFFFF] dark:bg-[#181818] border border-[#D1D5DB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA] font-medium text-[14px] hover:bg-[#F9FAFB] dark:hover:bg-[#232323] transition-all duration-150 cursor-pointer"
              >
                Browse Files
              </button>
            </div>
          ) : (
            /* Document Preview Card */
            <div className="bg-[#FFFFFF] dark:bg-[#181818] rounded-[12px] border border-[#E5E7EB] dark:border-[#2A2A2A] p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] flex items-center justify-center shrink-0">
                  <FileText size={24} className="text-[#111827] dark:text-[#FAFAFA]" />
                </div>
                <div>
                  <h3 className="text-[18px] font-semibold text-[#111827] dark:text-[#FAFAFA]">
                    {selectedFile.name}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 text-[14px] text-[#4B5563] dark:text-[#A3A3A3] mt-1">
                    <span>Size: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</span>
                    <span>•</span>
                    <span>Type: {selectedFile.name.split('.').pop()?.toUpperCase()}</span>
                    <span>•</span>
                    <span>Uploaded: Today</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 rounded-[10px] bg-[#FFFFFF] dark:bg-[#181818] border border-[#D1D5DB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA] font-medium text-[14px] hover:bg-[#F9FAFB] dark:hover:bg-[#232323] transition-all duration-150 cursor-pointer"
                >
                  Replace Document
                </button>
                <button
                  onClick={() => setSelectedFile(null)}
                  className="px-4 py-2 rounded-[10px] bg-[#FFFFFF] dark:bg-[#181818] border border-[#D1D5DB] dark:border-[#2A2A2A] text-[#6B7280] dark:text-[#A3A3A3] hover:text-[#111827] dark:hover:text-[#FAFAFA] hover:bg-[#F9FAFB] dark:hover:bg-[#232323] transition-all duration-150 text-[14px] font-medium cursor-pointer"
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

        {/* ==================================================
            LOADING SKELETON LOADER
            ================================================== */}
        {isGenerating && (
          <div className="bg-[#FFFFFF] dark:bg-[#181818] p-6 rounded-[12px] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs space-y-6 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="h-6 bg-[#E5E7EB] dark:bg-[#2A2A2A] rounded w-1/3"></div>
              <div className="h-6 bg-[#E5E7EB] dark:bg-[#2A2A2A] rounded w-1/6"></div>
            </div>
            <div className="h-2.5 bg-[#E5E7EB] dark:bg-[#2A2A2A] rounded-full w-full overflow-hidden relative">
              <div className="bg-[#111827] dark:bg-[#FAFAFA] h-full w-1/2 animate-pulse"></div>
            </div>
            <div className="space-y-3 pt-2">
              <div className="h-4 bg-[#E5E7EB] dark:bg-[#2A2A2A] rounded w-full"></div>
              <div className="h-4 bg-[#E5E7EB] dark:bg-[#2A2A2A] rounded w-5/6"></div>
              <div className="h-4 bg-[#E5E7EB] dark:bg-[#2A2A2A] rounded w-4/6"></div>
            </div>
          </div>
        )}

        {/* ==================================================
            SEARCH & FILTER CHIPS BAR
            ================================================== */}
        <div className="bg-[#FFFFFF] dark:bg-[#181818] p-4 rounded-[12px] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
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
                  className={`px-4 py-1.5 rounded-[20px] text-[14px] font-medium transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111]'
                      : 'bg-[#F8FAFC] dark:bg-[#111111] text-[#4B5563] dark:text-[#A3A3A3] hover:bg-[#E5E7EB] dark:hover:bg-[#232323]'
                  }`}
                >
                  {chip.label}
                </button>
              );
            })}
          </div>

          <div className="relative w-full md:w-72">
            <Search size={16} className="absolute left-3.5 top-3 text-[#111827] dark:text-[#FAFAFA]" />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#FFFFFF] dark:bg-[#181818] border border-[#E5E7EB] dark:border-[#2A2A2A] rounded-[10px] text-[14px] text-[#111827] dark:text-[#FAFAFA] placeholder-[#6B7280] dark:placeholder-[#A3A3A3] focus:outline-none focus:border-[#111827] dark:focus:border-[#FAFAFA] transition-colors"
            />
          </div>
        </div>

        {/* ==================================================
            GENERATED NOTES (Monochrome Reading Layout)
            ================================================== */}
        {content ? (
          <div className="space-y-6">
            {/* AI ACTIONS BUTTONS BAR */}
            <div className="bg-[#FFFFFF] dark:bg-[#181818] rounded-[12px] border border-[#E5E7EB] dark:border-[#2A2A2A] p-4 shadow-xs">
              <div className="text-[14px] font-semibold text-[#111827] dark:text-[#FAFAFA] mb-3">
                AI Actions
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'summary', label: 'Generate Summary', icon: FileText },
                  { id: 'concepts', label: 'Key Points', icon: Layers },
                  { id: 'formulae', label: 'Definitions', icon: BookOpen },
                  { id: 'questions', label: 'Generate Questions', icon: QuestionIcon },
                  { id: 'flashcards', label: 'Generate Flashcards', icon: RotateCcw },
                  { id: 'mcqs', label: 'Generate MCQs', icon: CheckSquare },
                  { id: 'checklist', label: 'Revision Notes', icon: CheckCircle2 },
                ].map((act) => {
                  const IconComp = act.icon;
                  const isActive = activeTab === act.id;
                  return (
                    <button
                      key={act.id}
                      onClick={() => setActiveTab(act.id as any)}
                      className={`h-9 px-3.5 rounded-[10px] text-[14px] font-medium border transition-all duration-150 flex items-center space-x-2 cursor-pointer ${
                        isActive
                          ? 'bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] border-[#111827] dark:border-[#FAFAFA]'
                          : 'bg-[#FFFFFF] dark:bg-[#181818] text-[#111827] dark:text-[#FAFAFA] border-[#D1D5DB] dark:border-[#2A2A2A] hover:bg-[#F9FAFB] dark:hover:bg-[#232323]'
                      }`}
                    >
                      <IconComp size={16} className={isActive ? 'text-[#FFFFFF] dark:text-[#111111]' : 'text-[#111827] dark:text-[#FAFAFA]'} />
                      <span>{act.label}</span>
                    </button>
                  );
                })}

                <button
                  onClick={exportAsMarkdown}
                  className="h-9 px-3.5 rounded-[10px] bg-[#FFFFFF] dark:bg-[#181818] text-[#111827] dark:text-[#FAFAFA] border border-[#D1D5DB] dark:border-[#2A2A2A] hover:bg-[#F9FAFB] dark:hover:bg-[#232323] transition-all duration-150 text-[14px] font-medium flex items-center space-x-2 cursor-pointer"
                >
                  <FileCode size={16} className="text-[#111827] dark:text-[#FAFAFA]" />
                  <span>Markdown</span>
                </button>

                <button
                  onClick={exportAsTextDoc}
                  className="h-9 px-3.5 rounded-[10px] bg-[#111827] hover:bg-[#000000] dark:bg-[#FAFAFA] dark:hover:bg-[#E5E7EB] text-[#FFFFFF] dark:text-[#111111] font-medium text-[14px] shadow-xs transition-all duration-150 flex items-center space-x-2 cursor-pointer"
                >
                  <Download size={16} />
                  <span>Download Notes</span>
                </button>
              </div>
            </div>

            {/* Note Reading Layout Container */}
            <div className="bg-[#FFFFFF] dark:bg-[#181818] p-6 lg:p-8 rounded-[12px] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs min-h-[400px]">
              {/* Header Title inside Reading Document */}
              <div className="border-b border-[#F3F4F6] dark:border-[#2A2A2A] pb-4 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div>
                  <h2 className="text-[22px] font-bold text-[#111827] dark:text-[#FAFAFA]">
                    {content.title}
                  </h2>
                  <p className="text-[14px] text-[#6B7280] dark:text-[#A3A3A3] mt-0.5">
                    Generated Study Material
                  </p>
                </div>
                <div className="text-[14px] text-[#6B7280] dark:text-[#A3A3A3]">
                  Section: <span className="font-semibold text-[#111827] dark:text-[#FAFAFA] capitalize">{activeTab}</span>
                </div>
              </div>

              {/* Section Content Views */}
              {activeTab === 'summary' && (
                <div className="space-y-6 max-w-4xl">
                  {/* Summary Section Card */}
                  <div className="bg-[#F8FAFC] dark:bg-[#111111] p-6 rounded-[12px] border border-[#E5E7EB] dark:border-[#2A2A2A]">
                    <h3 className="text-[18px] font-semibold text-[#111827] dark:text-[#FAFAFA] mb-3 flex items-center space-x-2">
                      <FileText size={18} className="text-[#111827] dark:text-[#FAFAFA]" />
                      <span>Executive Summary</span>
                    </h3>
                    <p className="text-[16px] text-[#4B5563] dark:text-[#D4D4D4] leading-relaxed">
                      {content.executive_summary}
                    </p>
                  </div>

                  {/* Chapter Summary Section Card */}
                  <div className="bg-[#F8FAFC] dark:bg-[#111111] p-6 rounded-[12px] border border-[#E5E7EB] dark:border-[#2A2A2A]">
                    <h3 className="text-[18px] font-semibold text-[#111827] dark:text-[#FAFAFA] mb-3 flex items-center space-x-2">
                      <BookOpen size={18} className="text-[#111827] dark:text-[#FAFAFA]" />
                      <span>Detailed Overview</span>
                    </h3>
                    <p className="text-[16px] text-[#4B5563] dark:text-[#D4D4D4] leading-relaxed whitespace-pre-line">
                      {content.chapter_summary}
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'concepts' && (
                <div className="space-y-4 max-w-4xl">
                  <h3 className="text-[18px] font-semibold text-[#111827] dark:text-[#FAFAFA]">
                    Key Points & Concepts
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {content.key_concepts?.map((kc, idx) => (
                      <div key={idx} className="bg-[#F8FAFC] dark:bg-[#111111] p-5 rounded-[12px] border border-[#E5E7EB] dark:border-[#2A2A2A] flex items-start space-x-3">
                        <span className="w-6 h-6 rounded-[6px] bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] text-[14px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <p className="text-[16px] text-[#111827] dark:text-[#FAFAFA] leading-relaxed">{kc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'formulae' && (
                <div className="space-y-4 max-w-4xl">
                  <h3 className="text-[18px] font-semibold text-[#111827] dark:text-[#FAFAFA]">
                    Definitions & Key Terms
                  </h3>
                  <div className="space-y-3">
                    {content.definitions?.map((df, idx) => (
                      <div key={idx} className="bg-[#F8FAFC] dark:bg-[#111111] p-5 rounded-[12px] border border-[#E5E7EB] dark:border-[#2A2A2A]">
                        <h4 className="text-[16px] font-bold text-[#111827] dark:text-[#FAFAFA] mb-1">{df.term}</h4>
                        <p className="text-[16px] text-[#4B5563] dark:text-[#D4D4D4]">{df.definition}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'questions' && (
                <div className="space-y-6 max-w-4xl">
                  {content.questions?.two_marks && (
                    <div className="space-y-3">
                      <h4 className="text-[18px] font-semibold text-[#111827] dark:text-[#FAFAFA]">Short Important Questions (2 Marks)</h4>
                      <div className="space-y-2">
                        {content.questions.two_marks.map((q, i) => (
                          <div key={i} className="bg-[#F8FAFC] dark:bg-[#111111] p-4 rounded-[12px] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[16px] text-[#111827] dark:text-[#FAFAFA]">
                            <span className="font-bold mr-2">{i + 1}.</span>{q}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {content.questions?.five_marks && (
                    <div className="space-y-3 pt-2">
                      <h4 className="text-[18px] font-semibold text-[#111827] dark:text-[#FAFAFA]">Long Important Questions (5 Marks)</h4>
                      <div className="space-y-2">
                        {content.questions.five_marks.map((q, i) => (
                          <div key={i} className="bg-[#F8FAFC] dark:bg-[#111111] p-4 rounded-[12px] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[16px] text-[#111827] dark:text-[#FAFAFA]">
                            <span className="font-bold mr-2">{i + 1}.</span>{q}
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
                        className="h-48 p-6 rounded-[12px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#FFFFFF] dark:bg-[#181818] shadow-xs hover:border-[#111827] dark:hover:border-[#FAFAFA] transition-all duration-150 cursor-pointer flex flex-col justify-between text-center select-none"
                      >
                        <span className="text-[12px] font-medium uppercase tracking-wider text-[#6B7280] dark:text-[#A3A3A3]">
                          {isFlipped ? 'Answer Side' : 'Question (Click to Flip)'}
                        </span>
                        <p className="text-[16px] font-semibold text-[#111827] dark:text-[#FAFAFA] my-auto">
                          {isFlipped ? fc.back : fc.front}
                        </p>
                        <span className="text-[12px] text-[#6B7280] dark:text-[#A3A3A3]">Flashcard #{i + 1}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {activeTab === 'mcqs' && (
                <div className="space-y-6 max-w-4xl">
                  {content.mcqs?.map((m, i) => (
                    <div key={i} className="bg-[#F8FAFC] dark:bg-[#111111] p-6 rounded-[12px] border border-[#E5E7EB] dark:border-[#2A2A2A] space-y-4">
                      <h4 className="text-[16px] font-bold text-[#111827] dark:text-[#FAFAFA]">
                        Q{i + 1}. {m.question}
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {m.options?.map((opt, oIdx) => (
                          <button
                            key={oIdx}
                            onClick={() => setMcqAnswers((prev) => ({ ...prev, [i]: opt }))}
                            className={`p-3 rounded-[10px] border text-[14px] text-left transition-all duration-150 cursor-pointer ${
                              mcqAnswers[i] === opt
                                ? opt === m.correct_answer
                                  ? 'bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] border-[#111827] dark:border-[#FAFAFA] font-semibold'
                                  : 'bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] border-[#111827] dark:border-[#FAFAFA] font-semibold'
                                : 'bg-[#FFFFFF] dark:bg-[#181818] border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA] hover:bg-[#F9FAFB] dark:hover:bg-[#232323]'
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
                      className="bg-[#F8FAFC] dark:bg-[#111111] p-4 rounded-[12px] border border-[#E5E7EB] dark:border-[#2A2A2A] flex items-center space-x-3 cursor-pointer"
                    >
                      <button className="text-[#111827] dark:text-[#FAFAFA]">
                        {checklistState[i] ? <CheckSquare size={18} /> : <Square size={18} className="text-[#6B7280] dark:text-[#A3A3A3]" />}
                      </button>
                      <span className={`text-[16px] ${checklistState[i] ? 'line-through text-[#6B7280] dark:text-[#A3A3A3]' : 'text-[#111827] dark:text-[#FAFAFA]'}`}>
                        {chk}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* EMPTY STATE */
          !isGenerating && (
            <div className="p-12 text-center bg-[#FFFFFF] dark:bg-[#181818] rounded-[12px] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs flex flex-col items-center justify-center space-y-4">
              <div className="w-16 h-16 rounded-[12px] bg-[#F8FAFC] dark:bg-[#111111] text-[#111827] dark:text-[#FAFAFA] flex items-center justify-center border border-[#E5E7EB] dark:border-[#2A2A2A]">
                <Book size={32} className="text-[#111827] dark:text-[#FAFAFA]" />
              </div>
              <div className="max-w-md space-y-1">
                <h3 className="text-[18px] font-bold text-[#111827] dark:text-[#FAFAFA]">
                  No Notes Generated Yet
                </h3>
                <p className="text-[14px] text-[#4B5563] dark:text-[#A3A3A3]">
                  Upload a document and let AI generate smart study notes.
                </p>
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="mt-2 px-5 py-2.5 rounded-[10px] bg-[#111827] hover:bg-[#000000] dark:bg-[#FAFAFA] dark:hover:bg-[#E5E7EB] text-[#FFFFFF] dark:text-[#111111] font-medium text-[14px] shadow-xs transition-all duration-150 cursor-pointer"
              >
                Upload Document
              </button>
            </div>
          )
        )}

        {/* ==================================================
            NOTES HISTORY TABLE
            ================================================== */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[22px] font-bold text-[#111827] dark:text-[#FAFAFA]">
              Notes History
            </h2>
            <span className="text-[14px] text-[#6B7280] dark:text-[#A3A3A3]">
              Total: {historyList.length}
            </span>
          </div>

          <div className="bg-[#FFFFFF] dark:bg-[#181818] rounded-[12px] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs overflow-hidden">
            {historyList.length === 0 ? (
              <div className="p-8 text-center text-[#6B7280] dark:text-[#A3A3A3] text-[14px]">
                No generated notes in history.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#F8FAFC] dark:bg-[#111111] text-[14px] font-semibold text-[#4B5563] dark:text-[#A3A3A3]">
                      <th className="py-3.5 px-5">Document</th>
                      <th className="py-3.5 px-5">Created Date</th>
                      <th className="py-3.5 px-5">Status</th>
                      <th className="py-3.5 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F3F4F6] dark:divide-[#2A2A2A] text-[14px] text-[#111827] dark:text-[#FAFAFA]">
                    {filteredHistory.map((item) => (
                      <tr
                        key={item.id}
                        className="hover:bg-[#F9FAFB] dark:hover:bg-[#232323] transition-colors duration-150 cursor-pointer"
                        onClick={() => handleSelectHistoryNote(item.id)}
                      >
                        <td className="py-4 px-5 font-semibold">
                          <div className="flex items-center space-x-3">
                            <FileText size={18} className="text-[#111827] dark:text-[#FAFAFA] shrink-0" />
                            <div>
                              <div className="font-semibold text-[#111827] dark:text-[#FAFAFA]">{item.title}</div>
                              <div className="text-[12px] text-[#6B7280] dark:text-[#A3A3A3]">{item.document_name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-5 text-[#4B5563] dark:text-[#A3A3A3]">
                          {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Recent'}
                        </td>
                        <td className="py-4 px-5">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-medium bg-[#111827] text-[#FFFFFF] dark:bg-[#FAFAFA] dark:text-[#111111]">
                            Generated
                          </span>
                        </td>
                        <td className="py-4 px-5 text-right">
                          <div className="flex items-center justify-end space-x-2" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => handleSelectHistoryNote(item.id)}
                              className="p-1.5 text-[#111827] hover:bg-[#F3F4F6] dark:text-[#FAFAFA] dark:hover:bg-[#232323] rounded-[6px] transition-colors"
                              title="View Note"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={(e) => handleDeleteNote(item.id, e)}
                              className="p-1.5 text-[#6B7280] dark:text-[#A3A3A3] hover:text-[#111827] dark:hover:text-[#FAFAFA] hover:bg-[#F3F4F6] dark:hover:bg-[#232323] rounded-[6px] transition-colors"
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


