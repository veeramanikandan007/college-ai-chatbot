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
      const file = e.target.files[0];
      setSelectedFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
    }
  };

  const handleGenerate = async () => {
    if (!selectedFile) {
      showToast('Please select a file to generate notes from.', 'error');
      return;
    }

    setIsGenerating(true);
    try {
      const note = await generateNote(selectedFile);
      setCurrentNote(note);
      showToast('AI Smart Notes generated successfully!', 'success');
      fetchHistory();
    } catch (err: any) {
      showToast(err.message || 'Notes generation failed.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectHistoryNote = async (id: number) => {
    try {
      const note = await getNoteById(id);
      setCurrentNote(note);
      setHistoryOpen(false);
      showToast(`Loaded note: ${note.title}`, 'info');
    } catch (err) {
      showToast('Failed to load note details', 'error');
    }
  };

  const handleDeleteHistoryNote = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    try {
      await deleteNote(id);
      setHistoryList((prev) => prev.filter((item) => item.id !== id));
      if (currentNote?.id === id) {
        setCurrentNote(null);
      }
      showToast('Note deleted', 'success');
    } catch (err) {
      showToast('Failed to delete note', 'error');
    }
  };

  const content: NoteContentSchema | null = currentNote?.content || null;

  return (
    <div className="w-full h-full overflow-x-hidden overflow-y-auto bg-[#F8FAFC] dark:bg-[#0A0A0A] text-[#111827] dark:text-[#FAFAFA] p-4 sm:p-6 lg:p-8 transition-colors select-none font-sans">
      {/* 1440px Centered Container with 32px (space-y-8) Section Gap */}
      <div className="w-full max-w-[1440px] mx-auto space-y-8">

        {/* Page Hero Header (With Dedicated Covered Image Background) */}
        <div className="relative overflow-hidden bg-[#FFFFFF] dark:bg-[#18181B] p-6 rounded-[16px] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6 min-h-[120px]">

          <div className="relative z-10 flex items-center gap-4 min-w-0">
            <div className="w-12 h-12 rounded-[12px] bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] flex items-center justify-center shrink-0 shadow-sm">
              <Book size={24} />
            </div>
            <div className="min-w-0 space-y-1">
              <h1 className="text-[30px] font-semibold text-[#111827] dark:text-[#FAFAFA] tracking-tight leading-tight truncate">
                AI Smart Notes Generator
              </h1>
              <p className="text-[15px] font-normal text-[#6B7280] dark:text-[#A1A1AA] truncate">
                Transform syllabus documents, PDFs, and textbook chapters into revision notes, MCQs, and flashcards.
              </p>
            </div>
          </div>

          <button
            onClick={() => setHistoryOpen(true)}
            className="relative z-10 h-[40px] px-5 rounded-[10px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#FFFFFF] dark:bg-[#18181B] hover:bg-[#F8FAFC] dark:hover:bg-[#232323] text-[#111827] dark:text-[#FAFAFA] font-medium text-[14px] transition flex items-center justify-center gap-2 cursor-pointer shrink-0 w-full sm:w-auto shadow-xs"
          >
            <History size={18} />
            <span>Saved Notes ({historyList.length})</span>
          </button>
        </div>

        {/* 4 Statistics Cards Grid (2x2 Mobile, 4-Col Desktop, 24px Gap) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-[16px] bg-[#FFFFFF] dark:bg-[#18181B] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs flex items-center justify-between">
            <div className="min-w-0 flex-1 space-y-1">
              <p className="text-[14px] font-normal text-[#6B7280] dark:text-[#A1A1AA] truncate">Saved Notes</p>
              <p className="text-[28px] font-semibold text-[#111827] dark:text-[#FAFAFA] leading-tight truncate">{historyList.length}</p>
              <p className="text-[12px] font-normal text-[#6B7280] dark:text-[#A1A1AA] truncate">Study repository</p>
            </div>
            <div className="w-10 h-10 rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA] flex items-center justify-center shrink-0 ml-3">
              <Book size={20} />
            </div>
          </div>

          <div className="p-6 rounded-[16px] bg-[#FFFFFF] dark:bg-[#18181B] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs flex items-center justify-between">
            <div className="min-w-0 flex-1 space-y-1">
              <p className="text-[14px] font-normal text-[#6B7280] dark:text-[#A1A1AA] truncate">Flashcard Decks</p>
              <p className="text-[28px] font-semibold text-[#111827] dark:text-[#FAFAFA] leading-tight truncate">
                {content?.flashcards ? content.flashcards.length : 0} Cards
              </p>
              <p className="text-[12px] font-normal text-[#6B7280] dark:text-[#A1A1AA] truncate">Interactive revision</p>
            </div>
            <div className="w-10 h-10 rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA] flex items-center justify-center shrink-0 ml-3">
              <RotateCcw size={20} />
            </div>
          </div>

          <div className="p-6 rounded-[16px] bg-[#FFFFFF] dark:bg-[#18181B] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs flex items-center justify-between">
            <div className="min-w-0 flex-1 space-y-1">
              <p className="text-[14px] font-normal text-[#6B7280] dark:text-[#A1A1AA] truncate">MCQ Practice</p>
              <p className="text-[28px] font-semibold text-[#111827] dark:text-[#FAFAFA] leading-tight truncate">
                {content?.mcqs ? content.mcqs.length : 0} Items
              </p>
              <p className="text-[12px] font-normal text-[#6B7280] dark:text-[#A1A1AA] truncate">Auto-graded quiz</p>
            </div>
            <div className="w-10 h-10 rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA] flex items-center justify-center shrink-0 ml-3">
              <CheckSquare size={20} />
            </div>
          </div>

          <div className="p-6 rounded-[16px] bg-[#FFFFFF] dark:bg-[#18181B] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs flex items-center justify-between">
            <div className="min-w-0 flex-1 space-y-1">
              <p className="text-[14px] font-normal text-[#6B7280] dark:text-[#A1A1AA] truncate">Synthesis AI</p>
              <p className="text-[28px] font-semibold text-[#111827] dark:text-[#FAFAFA] leading-tight truncate">Ready</p>
              <p className="text-[12px] font-normal text-[#6B7280] dark:text-[#A1A1AA] truncate">Deep comprehension</p>
            </div>
            <div className="w-10 h-10 rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA] flex items-center justify-center shrink-0 ml-3">
              <Sparkles size={20} />
            </div>
          </div>
        </div>

        {/* Upload Dropzone Container */}
        <div className="p-6 rounded-[16px] bg-[#FFFFFF] dark:bg-[#18181B] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-[20px] font-semibold text-[#111827] dark:text-[#FAFAFA] flex items-center gap-2">
              <Upload size={20} />
              <span>Upload Document for AI Synthesis</span>
            </h2>
            {selectedFile && (
              <button
                onClick={() => setSelectedFile(null)}
                className="h-8 px-3 rounded-[8px] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA] text-[12px] font-medium hover:bg-[#F8FAFC] dark:hover:bg-[#232323] cursor-pointer"
              >
                Clear Selected
              </button>
            )}
          </div>

          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="w-full min-h-[160px] rounded-[16px] border-2 border-dashed border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#F8FAFC] dark:bg-[#111111] hover:border-[#111827] dark:hover:border-[#FAFAFA] transition flex flex-col items-center justify-center p-6 text-center cursor-pointer"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={handleFileChange}
              className="hidden"
            />
            {selectedFile ? (
              <div className="flex items-center gap-3">
                <FileText size={28} className="text-[#111827] dark:text-[#FAFAFA]" />
                <div className="text-left">
                  <p className="text-[15px] font-semibold text-[#111827] dark:text-[#FAFAFA] truncate max-w-sm">{selectedFile.name}</p>
                  <p className="text-[13px] text-[#6B7280] dark:text-[#A1A1AA]">{(selectedFile.size / 1024).toFixed(1)} KB • Ready for generation</p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload size={28} className="mx-auto text-[#6B7280] dark:text-[#A1A1AA]" />
                <p className="text-[15px] font-semibold text-[#111827] dark:text-[#FAFAFA]">Drag and drop your document here or click to browse</p>
                <p className="text-[13px] text-[#6B7280] dark:text-[#A1A1AA]">Supports PDF, DOCX, and TXT files up to 25MB</p>
              </div>
            )}
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating || !selectedFile}
            className="w-full h-[44px] rounded-[10px] bg-[#111827] hover:bg-[#1F2937] dark:bg-[#FAFAFA] dark:hover:bg-[#E5E5E5] text-[#FFFFFF] dark:text-[#111111] font-medium text-[14px] transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
          >
            {isGenerating ? (
              <>
                <RefreshCw size={18} className="animate-spin" />
                <span>Generating Smart Notes & Decks...</span>
              </>
            ) : (
              <>
                <Sparkles size={18} />
                <span>Generate Smart Notes</span>
              </>
            )}
          </button>
        </div>

        {/* Generated Note Workspace Display */}
        {currentNote && content && (
          <div className="bg-[#FFFFFF] dark:bg-[#18181B] p-6 rounded-[16px] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#E5E7EB] dark:border-[#2A2A2A]">
              <h2 className="text-[20px] font-semibold text-[#111827] dark:text-[#FAFAFA] truncate">
                {currentNote.title}
              </h2>

              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                {[
                  { id: 'summary', label: 'Summary' },
                  { id: 'concepts', label: 'Concepts' },
                  { id: 'formulae', label: 'Formulae' },
                  { id: 'questions', label: 'Questions' },
                  { id: 'flashcards', label: 'Flashcards' },
                  { id: 'mcqs', label: 'MCQs' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`h-[36px] px-4 rounded-[8px] text-[14px] font-medium transition cursor-pointer shrink-0 ${
                      activeTab === tab.id
                        ? 'bg-[#111827] text-[#FFFFFF] dark:bg-[#FAFAFA] dark:text-[#111111]'
                        : 'bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content Display */}
            {activeTab === 'summary' && (
              <div className="p-6 rounded-[16px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[14px] font-normal leading-relaxed text-[#374151] dark:text-[#D4D4D4] whitespace-pre-wrap">
                {content.executive_summary || content.chapter_summary || 'No summary available.'}
              </div>
            )}

            {activeTab === 'concepts' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {content.key_concepts?.map((c, i) => (
                  <div key={i} className="p-6 rounded-[16px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#FFFFFF] dark:bg-[#18181B] space-y-2 shadow-xs">
                    <h3 className="text-[17px] font-semibold text-[#111827] dark:text-[#FAFAFA]">
                      {typeof c === 'string' ? `Key Concept ${i + 1}` : (c as any).title}
                    </h3>
                    <p className="text-[14px] font-normal text-[#6B7280] dark:text-[#A1A1AA]">
                      {typeof c === 'string' ? c : (c as any).description}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'flashcards' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {content.flashcards?.map((fc, idx) => (
                  <div
                    key={idx}
                    onClick={() => setFlippedCards((prev) => ({ ...prev, [idx]: !prev[idx] }))}
                    className="p-6 rounded-[16px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#FFFFFF] dark:bg-[#18181B] min-h-[160px] flex flex-col justify-between cursor-pointer shadow-xs hover:shadow-md transition"
                  >
                    <span className="text-[12px] font-medium text-[#6B7280] dark:text-[#A1A1AA]">
                      {flippedCards[idx] ? 'Answer (Click to flip)' : 'Question (Click to flip)'}
                    </span>
                    <p className="text-[15px] font-semibold text-[#111827] dark:text-[#FAFAFA] my-3">
                      {flippedCards[idx] ? fc.back : fc.front}
                    </p>
                    <span className="text-[12px] font-medium text-[#111827] dark:text-[#FAFAFA]">Card {idx + 1} of {content.flashcards.length}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* History Side Drawer */}
      {historyOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end" onClick={() => setHistoryOpen(false)}>
          <div className="w-full max-w-md bg-[#FFFFFF] dark:bg-[#18181B] h-full p-6 border-l border-[#E5E7EB] dark:border-[#2A2A2A] shadow-2xl flex flex-col justify-between space-y-6" onClick={(e) => e.stopPropagation()}>
            <div className="space-y-4 overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-[#E5E7EB] dark:border-[#2A2A2A]">
                <div className="flex items-center gap-2">
                  <History size={20} className="text-[#111827] dark:text-[#FAFAFA]" />
                  <h3 className="text-[20px] font-semibold text-[#111827] dark:text-[#FAFAFA]">Saved Notes History</h3>
                </div>
                <button onClick={() => setHistoryOpen(false)} className="h-8 w-8 rounded-[8px] border border-[#E5E7EB] dark:border-[#2A2A2A] flex items-center justify-center text-[#111827] dark:text-[#FAFAFA]">
                  <X size={16} />
                </button>
              </div>

              {loadingHistory ? (
                <div className="py-12 text-center text-[14px] text-[#6B7280] dark:text-[#A1A1AA]">Loading saved notes...</div>
              ) : historyList.length > 0 ? (
                <div className="space-y-3">
                  {historyList.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleSelectHistoryNote(item.id)}
                      className="p-4 rounded-[12px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#FFFFFF] dark:bg-[#18181B] hover:bg-[#F8FAFC] dark:hover:bg-[#232323] cursor-pointer transition flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0 flex-1 space-y-1">
                        <p className="text-[14px] font-semibold text-[#111827] dark:text-[#FAFAFA] truncate">{item.title}</p>
                        <p className="text-[12px] font-normal text-[#6B7280] dark:text-[#A1A1AA] truncate">
                          {new Date(item.created_at).toLocaleDateString()} • {item.document_name}
                        </p>
                      </div>
                      <button
                        onClick={(e) => handleDeleteHistoryNote(e, item.id)}
                        className="h-8 w-8 rounded-[8px] text-[#6B7280] dark:text-[#A1A1AA] hover:text-rose-500 hover:bg-[#F8FAFC] dark:hover:bg-[#232323] flex items-center justify-center shrink-0"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-[14px] text-[#6B7280] dark:text-[#A1A1AA]">No saved notes yet.</div>
              )}
            </div>

            <button
              onClick={() => setHistoryOpen(false)}
              className="w-full h-[40px] rounded-[10px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#FFFFFF] dark:bg-[#18181B] text-[14px] font-medium text-[#111827] dark:text-[#FAFAFA]"
            >
              Close Drawer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
