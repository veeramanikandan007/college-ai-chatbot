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
    <div className="w-full h-full overflow-x-hidden overflow-y-auto bg-[#F8FAFC] dark:bg-[#0A0A0A] text-[#111827] dark:text-[#FAFAFA] p-4 sm:p-6 lg:p-8 transition-colors select-none font-sans">
      {/* 1440px Centered Container with 32px (space-y-8) Section Gap */}
      <div className="w-full max-w-[1440px] mx-auto space-y-8">

        {/* Page Hero Header (With Dedicated Covered Image Background) */}
        <div className="relative overflow-hidden bg-[#FFFFFF] dark:bg-[#18181B] p-6 rounded-[16px] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6 min-h-[120px]">

          <div className="relative z-10 flex items-center gap-4 min-w-0">
            <div className="w-12 h-12 rounded-[12px] bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] flex items-center justify-center shrink-0 shadow-sm">
              <Scan size={24} />
            </div>
            <div className="min-w-0 space-y-1">
              <h1 className="text-[30px] font-semibold text-[#111827] dark:text-[#FAFAFA] tracking-tight leading-tight truncate">
                AI OCR Document Scanner
              </h1>
              <p className="text-[15px] font-normal text-[#6B7280] dark:text-[#A1A1AA] truncate">
                Extract printed or handwritten text from textbook photos, notes, and PDF scans using AI.
              </p>
            </div>
          </div>

          <button
            onClick={() => setHistoryOpen(true)}
            className="relative z-10 h-[40px] px-5 rounded-[10px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#FFFFFF] dark:bg-[#18181B] hover:bg-[#F8FAFC] dark:hover:bg-[#232323] text-[#111827] dark:text-[#FAFAFA] font-medium text-[14px] transition flex items-center justify-center gap-2 cursor-pointer shrink-0 w-full sm:w-auto shadow-xs"
          >
            <History size={18} />
            <span>Scan History ({historyList.length})</span>
          </button>
        </div>

        {/* 4 Statistics Cards Grid (2x2 Mobile, 4-Col Desktop, Responsive Padding & Font Sizes) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          <div className="p-3.5 sm:p-5 lg:p-6 rounded-[16px] bg-[#FFFFFF] dark:bg-[#18181B] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs flex items-center justify-between min-w-0">
            <div className="min-w-0 flex-1 space-y-0.5 sm:space-y-1">
              <p className="text-[12px] sm:text-[14px] font-normal text-[#6B7280] dark:text-[#A1A1AA] truncate">Total Scans</p>
              <p className="text-[15px] sm:text-[22px] lg:text-[28px] font-semibold text-[#111827] dark:text-[#FAFAFA] leading-tight truncate">{historyList.length}</p>
              <p className="text-[11px] sm:text-[12px] font-normal text-[#6B7280] dark:text-[#A1A1AA] truncate">Indexed documents</p>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-[8px] sm:rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA] flex items-center justify-center shrink-0 ml-1.5 sm:ml-3">
              <Scan className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>

          <div className="p-3.5 sm:p-5 lg:p-6 rounded-[16px] bg-[#FFFFFF] dark:bg-[#18181B] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs flex items-center justify-between min-w-0">
            <div className="min-w-0 flex-1 space-y-0.5 sm:space-y-1">
              <p className="text-[12px] sm:text-[14px] font-normal text-[#6B7280] dark:text-[#A1A1AA] truncate">OCR Accuracy</p>
              <p className="text-[15px] sm:text-[22px] lg:text-[28px] font-semibold text-[#111827] dark:text-[#FAFAFA] leading-tight truncate">99.4%</p>
              <p className="text-[11px] sm:text-[12px] font-normal text-[#6B7280] dark:text-[#A1A1AA] truncate">Multilingual engine</p>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-[8px] sm:rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA] flex items-center justify-center shrink-0 ml-1.5 sm:ml-3">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>

          <div className="p-3.5 sm:p-5 lg:p-6 rounded-[16px] bg-[#FFFFFF] dark:bg-[#18181B] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs flex items-center justify-between min-w-0">
            <div className="min-w-0 flex-1 space-y-0.5 sm:space-y-1">
              <p className="text-[12px] sm:text-[14px] font-normal text-[#6B7280] dark:text-[#A1A1AA] truncate">ChromaDB Sync</p>
              <p className="text-[15px] sm:text-[22px] lg:text-[28px] font-semibold text-[#111827] dark:text-[#FAFAFA] leading-tight truncate">Active</p>
              <p className="text-[11px] sm:text-[12px] font-normal text-[#6B7280] dark:text-[#A1A1AA] truncate">Vector indexed</p>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-[8px] sm:rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA] flex items-center justify-center shrink-0 ml-1.5 sm:ml-3">
              <Layers className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>

          <div className="p-3.5 sm:p-5 lg:p-6 rounded-[16px] bg-[#FFFFFF] dark:bg-[#18181B] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs flex items-center justify-between min-w-0">
            <div className="min-w-0 flex-1 space-y-0.5 sm:space-y-1">
              <p className="text-[12px] sm:text-[14px] font-normal text-[#6B7280] dark:text-[#A1A1AA] truncate">Supported Lang</p>
              <p className="text-[15px] sm:text-[22px] lg:text-[28px] font-semibold text-[#111827] dark:text-[#FAFAFA] leading-tight truncate">Eng / Tam</p>
              <p className="text-[11px] sm:text-[12px] font-normal text-[#6B7280] dark:text-[#A1A1AA] truncate">Automated detection</p>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-[8px] sm:rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA] flex items-center justify-center shrink-0 ml-1.5 sm:ml-3">
              <Languages className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
        </div>

        {/* Workspace Content split into Upload & Extracted Result Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Left Panel: Image Dropzone & Preview */}
          <div className="p-6 rounded-[16px] bg-[#FFFFFF] dark:bg-[#18181B] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-[20px] font-semibold text-[#111827] dark:text-[#FAFAFA] flex items-center gap-2">
                  <Upload size={20} />
                  <span>Upload & Preview Image</span>
                </h2>
                {previewUrl && (
                  <button
                    onClick={handleRotate}
                    className="h-8 px-3 rounded-[8px] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA] text-[12px] font-medium flex items-center gap-1.5 hover:bg-[#F8FAFC] dark:hover:bg-[#232323] cursor-pointer"
                  >
                    <RotateCw size={14} /> Rotate
                  </button>
                )}
              </div>

              {/* Upload Dropzone */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`w-full min-h-[280px] rounded-[16px] border-2 border-dashed transition flex flex-col items-center justify-center p-6 text-center cursor-pointer ${
                  previewUrl
                    ? 'border-[#111827] dark:border-[#FAFAFA] bg-[#F8FAFC] dark:bg-[#111111]'
                    : 'border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#F8FAFC] dark:bg-[#111111] hover:border-[#111827] dark:hover:border-[#FAFAFA]'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/heic,application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {previewUrl ? (
                  <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden">
                    <img
                      src={previewUrl}
                      alt="Scan Preview"
                      style={{ transform: `rotate(${rotationAngle}deg)` }}
                      className="max-h-[240px] w-auto object-contain rounded-[12px] shadow-sm transition-transform duration-200"
                    />
                    <p className="text-[13px] font-medium text-[#111827] dark:text-[#FAFAFA] mt-3 truncate max-w-xs">
                      {selectedFile?.name}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-[12px] bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] flex items-center justify-center mx-auto">
                      <Upload size={22} />
                    </div>
                    <div>
                      <p className="text-[15px] font-semibold text-[#111827] dark:text-[#FAFAFA]">
                        Drag and drop your image file here
                      </p>
                      <p className="text-[13px] font-normal text-[#6B7280] dark:text-[#A1A1AA] mt-1">
                        Supports JPG, PNG, WEBP, HEIC & PDF scans up to 25MB
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={handleExtract}
              disabled={isProcessing || !selectedFile}
              className="w-full h-[44px] rounded-[10px] bg-[#111827] hover:bg-[#1F2937] dark:bg-[#FAFAFA] dark:hover:bg-[#E5E5E5] text-[#FFFFFF] dark:text-[#111111] font-medium text-[14px] transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
            >
              {isProcessing ? (
                <>
                  <RefreshCw size={18} className="animate-spin" />
                  <span>Extracting Text via AI OCR...</span>
                </>
              ) : (
                <>
                  <Zap size={18} />
                  <span>Extract Text Now</span>
                </>
              )}
            </button>
          </div>

          {/* Right Panel: Extracted Text & AI Analysis Actions */}
          <div className="p-6 rounded-[16px] bg-[#FFFFFF] dark:bg-[#18181B] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-[20px] font-semibold text-[#111827] dark:text-[#FAFAFA] flex items-center gap-2">
                  <FileText size={20} />
                  <span>Extracted Content</span>
                </h2>
                {extractedText && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyText}
                      className="h-8 px-3 rounded-[8px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#FFFFFF] dark:bg-[#18181B] text-[#111827] dark:text-[#FAFAFA] text-[12px] font-medium flex items-center gap-1.5 cursor-pointer"
                    >
                      {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                    <button
                      onClick={exportAsTXT}
                      className="h-8 px-3 rounded-[8px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#FFFFFF] dark:bg-[#18181B] text-[#111827] dark:text-[#FAFAFA] text-[12px] font-medium flex items-center gap-1.5 cursor-pointer"
                    >
                      <Download size={14} /> TXT
                    </button>
                  </div>
                )}
              </div>

              {/* AI Action Quick Trigger Chips */}
              {extractedText && (
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                  {[
                    { id: 'summary', label: 'Summarize', icon: Sparkles },
                    { id: 'explain', label: 'Explain Key Terms', icon: HelpCircle },
                    { id: 'mcqs', label: 'Generate MCQs', icon: Check },
                    { id: 'translate', label: 'Translate (Tamil)', icon: Languages },
                  ].map((act) => {
                    const IconComp = act.icon;
                    return (
                      <button
                        key={act.id}
                        onClick={() => handleRunAIAction(act.id as any)}
                        disabled={actionLoading}
                        className={`h-[36px] px-3.5 rounded-[8px] text-[13px] font-medium transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer shrink-0 ${
                          activeAction === act.id
                            ? 'bg-[#111827] text-[#FFFFFF] dark:bg-[#FAFAFA] dark:text-[#111111]'
                            : 'bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA] hover:bg-[#FFFFFF] dark:hover:bg-[#232323]'
                        }`}
                      >
                        <IconComp size={14} />
                        <span>{act.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Search within Extracted Text */}
              {extractedText && (
                <div className="relative w-full">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7280] dark:text-[#A1A1AA]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search keywords within extracted text..."
                    className="w-full h-[38px] pl-10 pr-4 rounded-[10px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#FFFFFF] dark:bg-[#18181B] text-[13px] text-[#111827] dark:text-[#FAFAFA] outline-none"
                  />
                </div>
              )}

              {/* Extracted Text Content Box */}
              <div className="w-full min-h-[220px] max-h-[300px] overflow-y-auto p-4 rounded-[12px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[14px] font-normal leading-relaxed text-[#111827] dark:text-[#FAFAFA] whitespace-pre-wrap">
                {extractedText ? highlightText(extractedText) : <span className="text-[#6B7280] dark:text-[#A1A1AA]">No OCR scan extracted yet. Upload an image to start.</span>}
              </div>
            </div>

            {/* AI Action Result Panel */}
            {actionResult && (
              <div className="p-4 rounded-[12px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] space-y-2 text-[14px] font-normal leading-relaxed text-[#374151] dark:text-[#D4D4D4] whitespace-pre-wrap">
                <div className="flex items-center gap-2 font-semibold text-[#111827] dark:text-[#FAFAFA]">
                  <Sparkles size={16} /> AI Output ({activeAction})
                </div>
                <div>{actionResult}</div>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* History Side Drawer */}
      {historyOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end" onClick={() => setHistoryOpen(false)}>
          <div className="w-full max-w-md bg-[#FFFFFF] dark:bg-[#18181B] h-full p-6 border-l border-[#E5E7EB] dark:border-[#2A2A2A] shadow-2xl flex flex-col justify-between space-y-6" onClick={(e) => e.stopPropagation()}>
            <div className="space-y-4 overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-[#E5E7EB] dark:border-[#2A2A2A]">
                <div className="flex items-center gap-2">
                  <History size={20} className="text-[#111827] dark:text-[#FAFAFA]" />
                  <h3 className="text-[20px] font-semibold text-[#111827] dark:text-[#FAFAFA]">OCR Scan History</h3>
                </div>
                <button onClick={() => setHistoryOpen(false)} className="h-8 w-8 rounded-[8px] border border-[#E5E7EB] dark:border-[#2A2A2A] flex items-center justify-center text-[#111827] dark:text-[#FAFAFA]">
                  <X size={16} />
                </button>
              </div>

              {loadingHistory ? (
                <div className="py-12 text-center text-[14px] text-[#6B7280] dark:text-[#A1A1AA]">Loading scan history...</div>
              ) : historyList.length > 0 ? (
                <div className="space-y-3">
                  {historyList.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleSelectHistoryScan(item.id)}
                      className="p-4 rounded-[12px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#FFFFFF] dark:bg-[#18181B] hover:bg-[#F8FAFC] dark:hover:bg-[#232323] cursor-pointer transition flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0 flex-1 space-y-1">
                        <p className="text-[14px] font-semibold text-[#111827] dark:text-[#FAFAFA] truncate">{item.image_name}</p>
                        <p className="text-[12px] font-normal text-[#6B7280] dark:text-[#A1A1AA] truncate">
                          {new Date(item.created_at).toLocaleString()} • {item.language_detected}
                        </p>
                      </div>
                      <button
                        onClick={(e) => handleDeleteHistoryScan(e, item.id)}
                        className="h-8 w-8 rounded-[8px] text-[#6B7280] dark:text-[#A1A1AA] hover:text-rose-500 hover:bg-[#F8FAFC] dark:hover:bg-[#232323] flex items-center justify-center shrink-0"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-[14px] text-[#6B7280] dark:text-[#A1A1AA]">No previous OCR scans stored yet.</div>
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
