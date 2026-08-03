import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Scan,
  Upload,
  Sparkles,
  Download,
  Search,
  History,
  Trash2,
  Copy,
  Check,
  RotateCw,
  RefreshCw,
  X,
  FileText,
  Languages,
  HelpCircle,
  Zap,
  MessageSquare,
  Layers
} from 'lucide-react';
import {
  uploadAndExtractOCR,
  executeAIAction,
  getOCRHistory,
  getOCRScanById,
  deleteOCRScan,
  OCRScanResponse,
  OCRScanListItem
} from '../../api/ocr';
import { useToast } from '../../hooks/useToast';
import { PageHeader } from '../../components/ui';

export default function AIOCRScannerPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Upload & State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [rotationAngle, setRotationAngle] = useState<number>(0);

  // Processing & Extraction
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [currentScan, setCurrentScan] = useState<OCRScanResponse | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');

  // AI Action State
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [actionResult, setActionResult] = useState<string | null>(null);

  // Search & Copy
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  // History Drawer
  const [historyOpen, setHistoryOpen] = useState<boolean>(false);
  const [historyList, setHistoryList] = useState<OCRScanListItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const data = await getOCRHistory();
      setHistoryList(data);
    } catch (err) {
      console.error('Failed to load OCR history', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setRotationAngle(0);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setRotationAngle(0);
    }
  };

  const handleRotate = () => {
    setRotationAngle((prev) => (prev + 90) % 360);
  };

  const handleExtract = async () => {
    if (!selectedFile) {
      showToast('Please select or drag an image file (.jpg, .jpeg, .png, .webp, .heic)', 'error');
      return;
    }

    setIsProcessing(true);
    setActionResult(null);
    try {
      const scan = await uploadAndExtractOCR(selectedFile);
      setCurrentScan(scan);
      setExtractedText(scan.extracted_text);
      showToast('Text extracted and indexed in ChromaDB successfully!', 'success');
      fetchHistory();
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'OCR processing failed. Please try again.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRunAIAction = async (action: 'summary' | 'explain' | 'mcqs' | 'flashcards' | 'translate' | 'questions') => {
    if (!extractedText.trim()) {
      showToast('No extracted text available for AI analysis.', 'error');
      return;
    }

    setActiveAction(action);
    setActionLoading(true);
    setActionResult(null);

    try {
      const res = await executeAIAction({
        action,
        extracted_text: extractedText,
        target_language: 'Tamil',
      });
      setActionResult(res.result);
      showToast(`Generated ${action} response!`, 'success');
    } catch (err: any) {
      showToast('AI Action failed. Please try again.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSelectHistoryScan = async (id: number) => {
    try {
      const scan = await getOCRScanById(id);
      setCurrentScan(scan);
      setExtractedText(scan.extracted_text);
      setActionResult(null);
      setHistoryOpen(false);
      showToast(`Loaded scan: ${scan.image_name}`, 'info');
    } catch (err) {
      showToast('Failed to load scan details', 'error');
    }
  };

  const handleDeleteHistoryScan = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    try {
      await deleteOCRScan(id);
      setHistoryList((prev) => prev.filter((item) => item.id !== id));
      if (currentScan?.id === id) {
        setCurrentScan(null);
        setExtractedText('');
      }
      showToast('OCR scan deleted', 'success');
    } catch (err) {
      showToast('Failed to delete scan', 'error');
    }
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(extractedText);
    setCopied(true);
    showToast('Copied extracted text to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  // Export handlers
  const exportAsTXT = () => {
    if (!extractedText) return;
    const blob = new Blob([extractedText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ocr_scan_${Date.now()}.txt`;
    a.click();
    showToast('Exported as TXT!', 'success');
  };

  const exportAsMarkdown = () => {
    if (!extractedText) return;
    let md = `# OCR Extracted Text Document\n\n`;
    md += `**Document Name:** ${currentScan?.image_name || 'Scan'}\n`;
    md += `**Language:** ${currentScan?.language_detected || 'Detected'}\n\n`;
    md += `---\n\n${extractedText}\n`;

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ocr_scan_${Date.now()}.md`;
    a.click();
    showToast('Exported as Markdown!', 'success');
  };

  // Search keyword highlight helper
  const highlightText = (text: string) => {
    if (!searchQuery.trim()) return text;
    const parts = text.split(new RegExp(`(${searchQuery})`, 'gi'));
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === searchQuery.toLowerCase() ? (
            <mark key={i} className="bg-zinc-200 dark:bg-zinc-800 text-[#111827] dark:text-[#FAFAFA] px-1 rounded font-semibold">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-white dark:bg-[#0A0A0A] text-[#111827] dark:text-[#FAFAFA] font-body transition-colors duration-200">
      <div className="mx-auto max-w-7xl space-y-6">
        
        {/* ── 1. Page Header Component ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#181818] p-6 rounded-xl border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-[12px] bg-[#F3F4F6] text-[#111827] dark:bg-zinc-800 dark:text-zinc-100 flex items-center justify-center border border-[#E5E7EB] dark:border-zinc-700 shrink-0">
              <Scan size={22} />
            </div>
            <div>
              <h1 className="font-bold text-2xl md:text-3xl text-[#111827] dark:text-[#FAFAFA]">
                AI OCR Scanner
              </h1>
              <p className="text-sm text-[#6B7280] dark:text-[#A3A3A3] mt-0.5">
                Scan handwritten notes, textbooks, whiteboards & formulas. Auto-index directly into AI Chat.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setHistoryOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-[10px] border border-[#D1D5DB] dark:border-[#2A2A2A] bg-white dark:bg-[#0A0A0A] text-[#111827] dark:text-[#FAFAFA] hover:bg-[#F9FAFB] dark:hover:bg-[#232323] transition font-medium text-sm shadow-[0_1px_3px_rgba(0,0,0,0.08)] cursor-pointer"
            >
              <History size={16} />
              <span>History</span>
            </button>

            {extractedText && (
              <div className="flex items-center gap-2">
                <button
                  onClick={exportAsTXT}
                  className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-[10px] bg-white dark:bg-[#0A0A0A] text-[#111827] dark:text-[#FAFAFA] border border-[#D1D5DB] dark:border-[#2A2A2A] hover:bg-[#F9FAFB] transition font-medium text-sm cursor-pointer"
                >
                  <FileText size={16} />
                  <span>TXT</span>
                </button>
                <button
                  onClick={exportAsMarkdown}
                  className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-[10px] bg-[#111827] hover:bg-[#000000] dark:bg-[#FAFAFA] dark:hover:bg-white text-white dark:text-[#111111] transition font-medium text-sm shadow-[0_1px_3px_rgba(0,0,0,0.08)] cursor-pointer"
                >
                  <Download size={16} />
                  <span>Markdown</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── 2. Image Upload & Live Preview Cards ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upload Dropzone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="bg-white dark:bg-[#181818] rounded-xl border-2 border-dashed border-[#D1D5DB] dark:border-[#2A2A2A] p-6 text-center transition-all hover:border-[#111827] dark:hover:border-[#FAFAFA] flex flex-col items-center justify-center min-h-[300px] shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".jpg,.jpeg,.png,.webp,.heic"
              className="hidden"
            />

            <div className="space-y-4 max-w-sm">
              <div className="w-14 h-14 bg-[#F3F4F6] dark:bg-[#232323] text-[#111827] dark:text-[#FAFAFA] rounded-[12px] flex items-center justify-center mx-auto border border-[#E5E7EB] dark:border-[#2A2A2A]">
                <Upload size={24} />
              </div>

              <div>
                <h3 className="text-base font-bold text-[#111827] dark:text-[#FAFAFA]">
                  {selectedFile ? selectedFile.name : 'Upload Image / Handwritten Notes'}
                </h3>
                <p className="text-xs text-[#6B7280] dark:text-[#A3A3A3] mt-1">
                  Supports PNG, JPG, JPEG, WEBP, HEIC
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2.5 rounded-[10px] bg-white dark:bg-[#0A0A0A] hover:bg-[#F9FAFB] text-[#111827] dark:text-[#FAFAFA] font-medium text-xs transition border border-[#D1D5DB] dark:border-[#2A2A2A] cursor-pointer"
                >
                  Select Image
                </button>

                <button
                  onClick={handleExtract}
                  disabled={isProcessing || !selectedFile}
                  className="px-5 py-2.5 rounded-[10px] bg-[#111827] hover:bg-[#000000] dark:bg-[#FAFAFA] dark:hover:bg-white text-white dark:text-[#111111] font-medium text-xs shadow-[0_1px_3px_rgba(0,0,0,0.08)] transition disabled:opacity-40 flex items-center gap-2 cursor-pointer"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      <span>Extracting Vision Text...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      <span>Start OCR Extract</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Live Preview Box */}
          <div className="bg-white dark:bg-[#181818] rounded-xl border border-[#E5E7EB] dark:border-[#2A2A2A] p-6 flex flex-col justify-between min-h-[300px] shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] dark:border-[#2A2A2A] pb-3 mb-4">
              <span className="font-semibold text-xs text-[#6B7280] dark:text-[#A3A3A3] uppercase tracking-wider">
                Image Preview
              </span>
              {previewUrl && (
                <button
                  onClick={handleRotate}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-[#0A0A0A] border border-[#D1D5DB] dark:border-[#2A2A2A] text-xs text-[#111827] dark:text-[#FAFAFA] rounded-md hover:bg-[#F9FAFB] cursor-pointer"
                >
                  <RotateCw size={14} />
                  <span>Rotate (90°)</span>
                </button>
              )}
            </div>

            {previewUrl ? (
              <div className="flex-1 flex items-center justify-center overflow-hidden rounded-lg bg-[#F9FAFB] dark:bg-[#0A0A0A] p-2 border border-[#E5E7EB] dark:border-[#2A2A2A]">
                <img
                  src={previewUrl}
                  alt="Preview"
                  style={{ transform: `rotate(${rotationAngle}deg)` }}
                  className="max-h-64 object-contain rounded-md transition-transform duration-300"
                />
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-[#9CA3AF] text-xs">
                <Scan size={36} className="mb-2 opacity-50" />
                <span>No image selected for preview</span>
              </div>
            )}
          </div>
        </div>

        {/* ── 3. Extracted Text Viewer & AI Actions Container ── */}
        {extractedText && (
          <div className="space-y-6">
            {/* Action Bar & Metadata */}
            <div className="bg-white dark:bg-[#181818] rounded-xl border border-[#E5E7EB] dark:border-[#2A2A2A] p-4 shadow-[0_1px_3px_rgba(0,0,0,0.08)] flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-xs text-[#6B7280] dark:text-[#A3A3A3]">
                <span className="px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-medium border border-zinc-200 dark:border-zinc-700">
                  Detected Language: {currentScan?.language_detected || 'English'}
                </span>
                <span>• {extractedText.length} characters</span>
                <span>• {extractedText.split(/\s+/).length} words</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyText}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] bg-white dark:bg-[#0A0A0A] border border-[#D1D5DB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA] text-xs font-medium hover:bg-[#F9FAFB] cursor-pointer"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copied ? 'Copied' : 'Copy Text'}</span>
                </button>

                <button
                  onClick={() => navigate('/dashboard')}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-[10px] bg-[#111827] hover:bg-[#000000] dark:bg-[#FAFAFA] dark:hover:bg-white text-white dark:text-[#111111] text-xs font-medium transition cursor-pointer shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
                >
                  <MessageSquare size={14} />
                  <span>Chat with OCR Text</span>
                </button>
              </div>
            </div>

            {/* Extracted Text View Box */}
            <div className="bg-white dark:bg-[#181818] rounded-xl border border-[#E5E7EB] dark:border-[#2A2A2A] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.08)] space-y-4">
              <div className="flex items-center justify-between border-b border-[#E5E7EB] dark:border-[#2A2A2A] pb-3">
                <h3 className="font-bold text-sm text-[#111827] dark:text-[#FAFAFA] flex items-center gap-2">
                  <FileText size={16} />
                  <span>Extracted Document Text</span>
                </h3>

                {/* Search Bar */}
                <div className="relative w-64">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                  <input
                    type="text"
                    placeholder="Search keywords..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-9 pl-9 pr-3 bg-white dark:bg-[#0A0A0A] border border-[#D1D5DB] dark:border-[#2A2A2A] rounded-lg text-xs text-[#111827] dark:text-[#FAFAFA] placeholder-[#9CA3AF] focus:outline-none focus:border-[#111827] dark:focus:border-[#FAFAFA] transition"
                  />
                </div>
              </div>

              <div className="bg-[#F9FAFB] dark:bg-[#0A0A0A] p-4 rounded-lg text-sm font-sans text-[#111827] dark:text-[#FAFAFA] leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto border border-[#E5E7EB] dark:border-[#2A2A2A]">
                {highlightText(extractedText)}
              </div>
            </div>

            {/* AI Action Toolkit Bar */}
            <div className="bg-white dark:bg-[#181818] rounded-xl border border-[#E5E7EB] dark:border-[#2A2A2A] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.08)] space-y-4">
              <h3 className="font-bold text-sm text-[#111827] dark:text-[#FAFAFA] flex items-center gap-2 border-b border-[#E5E7EB] dark:border-[#2A2A2A] pb-3">
                <Sparkles size={16} />
                <span>AI Insights & Action Toolkit</span>
              </h3>

              <div className="flex flex-wrap gap-2.5">
                {[
                  { id: 'summary', label: 'Summarize Text', icon: FileText },
                  { id: 'explain', label: 'Explain Concepts', icon: Layers },
                  { id: 'mcqs', label: 'Generate MCQs', icon: Sparkles },
                  { id: 'flashcards', label: 'Generate Flashcards', icon: Zap },
                  { id: 'questions', label: 'Exam Questions', icon: HelpCircle },
                  { id: 'translate', label: 'Translate (Tamil)', icon: Languages },
                ].map((btn) => {
                  const Icon = btn.icon;
                  const isLoading = actionLoading && activeAction === btn.id;
                  return (
                    <button
                      key={btn.id}
                      onClick={() => handleRunAIAction(btn.id as any)}
                      disabled={actionLoading}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-[10px] bg-[#F3F4F6] dark:bg-[#232323] text-[#111827] dark:text-[#FAFAFA] border border-[#E5E7EB] dark:border-[#2A2A2A] font-medium text-xs hover:bg-[#111827] hover:text-white dark:hover:bg-[#FAFAFA] dark:hover:text-[#111111] transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isLoading ? <RefreshCw size={14} className="animate-spin" /> : <Icon size={14} />}
                      <span>{btn.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Action Output Display */}
              {actionResult && (
                <div className="mt-4 p-5 bg-[#F9FAFB] dark:bg-[#0A0A0A] rounded-lg border border-[#E5E7EB] dark:border-[#2A2A2A] space-y-2">
                  <div className="flex items-center justify-between border-b border-[#E5E7EB] dark:border-[#2A2A2A] pb-2">
                    <span className="font-bold text-xs uppercase text-[#111827] dark:text-[#FAFAFA]">
                      AI Result: {activeAction}
                    </span>
                    <button onClick={() => setActionResult(null)} className="text-[#9CA3AF] hover:text-[#111827] cursor-pointer">
                      <X size={16} />
                    </button>
                  </div>
                  <div className="text-xs text-[#111827] dark:text-[#FAFAFA] leading-relaxed whitespace-pre-wrap">
                    {actionResult}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── 4. History Sidebar Drawer ── */}
        {historyOpen && (
          <div className="fixed inset-0 z-50 bg-[#111827]/40 backdrop-blur-xs flex justify-end">
            <div className="w-full max-w-md bg-white dark:bg-[#181818] h-full shadow-2xl p-6 overflow-y-auto space-y-6 border-l border-[#E5E7EB] dark:border-[#2A2A2A]">
              <div className="flex items-center justify-between border-b border-[#E5E7EB] dark:border-[#2A2A2A] pb-4">
                <h3 className="text-lg font-bold text-[#111827] dark:text-[#FAFAFA] flex items-center gap-2">
                  <History size={18} />
                  <span>OCR Scan History</span>
                </h3>
                <button
                  onClick={() => setHistoryOpen(false)}
                  className="p-1 rounded-lg text-[#9CA3AF] hover:text-[#111827] dark:hover:text-[#FAFAFA] cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {loadingHistory ? (
                <div className="text-center py-12">
                  <RefreshCw size={24} className="animate-spin mx-auto text-[#111827] dark:text-[#FAFAFA]" />
                  <p className="text-sm text-[#6B7280] dark:text-[#A3A3A3] mt-2">Loading OCR history...</p>
                </div>
              ) : historyList.length === 0 ? (
                <div className="text-center py-12 text-[#6B7280] dark:text-[#A3A3A3] text-sm">
                  No previous OCR scans available.
                </div>
              ) : (
                <div className="space-y-3">
                  {historyList.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleSelectHistoryScan(item.id)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start justify-between ${
                        currentScan?.id === item.id
                          ? 'bg-[#111827] text-white dark:bg-[#FAFAFA] dark:text-[#111111] border-[#111827]'
                          : 'bg-[#F9FAFB] dark:bg-[#0A0A0A] border-[#E5E7EB] dark:border-[#2A2A2A] hover:border-[#111827]'
                      }`}
                    >
                      <div className="space-y-1 pr-2">
                        <h4 className="text-sm font-semibold line-clamp-1">
                          {item.image_name}
                        </h4>
                        <p className={`text-xs ${currentScan?.id === item.id ? 'opacity-80' : 'text-[#6B7280] dark:text-[#A3A3A3]'}`}>
                          {item.language_detected} • {new Date(item.created_at).toLocaleDateString()}
                        </p>
                      </div>

                      <button
                        onClick={(e) => handleDeleteHistoryScan(e, item.id)}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          currentScan?.id === item.id
                            ? 'text-white/70 hover:text-white'
                            : 'text-[#9CA3AF] hover:text-rose-600 hover:bg-[#F3F4F6] dark:hover:bg-[#232323]'
                        }`}
                        title="Delete Scan"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
