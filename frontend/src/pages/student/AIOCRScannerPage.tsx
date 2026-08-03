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
    <div className="w-full h-full overflow-x-hidden overflow-y-auto bg-[#FFFFFF] dark:bg-[#0A0A0A] text-[#111827] dark:text-[#FAFAFA] p-4 sm:p-6 md:p-8 transition-colors select-none">
      {/* 1440px Centered Max Content Width Container */}
      <div className="w-full max-w-[1440px] mx-auto space-y-6">

        {/* Compact Hero Header (Matching AI Study Planner layout) */}
        <div className="bg-[#FFFFFF] dark:bg-[#18181B] p-4 sm:p-5 rounded-[16px] border border-[#D1D5DB] dark:border-[#3F3F46] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
            <div className="w-[40px] h-[40px] sm:w-[44px] sm:h-[44px] rounded-[10px] bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] flex items-center justify-center shrink-0">
              <Scan size={22} />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-[20px] sm:text-[30px] font-[600] text-[#111827] dark:text-[#FAFAFA] tracking-tight leading-[1.2] truncate">
                AI OCR Scanner
              </h1>
              <p className="text-[13px] sm:text-[14px] font-[500] text-[#6B7280] dark:text-[#A1A1AA] mt-0.5 truncate">
                Scan handwritten notes, textbooks, whiteboards & formulas. Auto-index directly into AI Chat.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2 sm:gap-3 shrink-0 w-full lg:w-auto pt-2 lg:pt-0 border-t lg:border-t-0 border-[#E5E7EB] dark:border-[#27272A]">
            <button
              onClick={() => setHistoryOpen(true)}
              className="h-[38px] sm:h-[40px] px-3.5 sm:px-4 rounded-[12px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#18181B] text-[#111827] dark:text-[#FAFAFA] text-[13px] sm:text-[14px] font-[500] hover:bg-[#F8FAFC] dark:hover:bg-[#232323] transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0 active:scale-[0.98]"
            >
              <History size={16} />
              <span>History ({historyList.length})</span>
            </button>

            {extractedText && (
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={exportAsTXT}
                  className="h-[38px] sm:h-[40px] px-3 sm:px-3.5 rounded-[12px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#18181B] text-[#111827] dark:text-[#FAFAFA] text-[13px] sm:text-[14px] font-[500] hover:bg-[#F8FAFC] transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0 active:scale-[0.98]"
                >
                  <FileText size={16} />
                  <span>Export TXT</span>
                </button>
                <button
                  onClick={exportAsMarkdown}
                  className="h-[38px] sm:h-[40px] px-3.5 sm:px-4 rounded-[12px] bg-[#111827] hover:bg-[#1F2937] active:bg-[#0F172A] dark:bg-[#FAFAFA] dark:hover:bg-[#F3F4F6] text-[#FFFFFF] dark:text-[#111111] text-[14px] font-[500] transition flex items-center justify-center gap-2 cursor-pointer shrink-0 active:scale-[0.98]"
                >
                  <Download size={16} />
                  <span>Markdown</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Overview Cards Banner (88px Height matching Study Analytics Banner) */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 select-none">
          <div className="h-[88px] p-3.5 sm:p-[16px] rounded-[16px] bg-[#FFFFFF] dark:bg-[#18181B] border border-[#D1D5DB] dark:border-[#3F3F46] shadow-xs flex items-center justify-between transition-all duration-150 ease-in-out hover:-translate-y-[2px] hover:shadow-md">
            <div className="min-w-0 flex-1 space-y-0.5">
              <p className="text-[12px] sm:text-[13px] font-[400] text-[#6B7280] dark:text-[#A1A1AA] truncate">Scanned Records</p>
              <p className="text-[26px] sm:text-[30px] font-[600] text-[#111827] dark:text-[#FAFAFA] leading-none truncate">{historyList.length}</p>
              <p className="text-[11px] sm:text-[13px] font-[400] text-[#6B7280] dark:text-[#A1A1AA] truncate pt-0.5">History index</p>
            </div>
            <div className="w-[34px] h-[34px] sm:w-[40px] sm:h-[40px] rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#D1D5DB] dark:border-[#3F3F46] text-[#111827] dark:text-[#FAFAFA] flex items-center justify-center shrink-0 ml-2 sm:ml-3">
              <Scan size={18} />
            </div>
          </div>

          <div className="h-[88px] p-3.5 sm:p-[16px] rounded-[16px] bg-[#FFFFFF] dark:bg-[#18181B] border border-[#D1D5DB] dark:border-[#3F3F46] shadow-xs flex items-center justify-between transition-all duration-150 ease-in-out hover:-translate-y-[2px] hover:shadow-md">
            <div className="min-w-0 flex-1 space-y-0.5">
              <p className="text-[12px] sm:text-[13px] font-[400] text-[#6B7280] dark:text-[#A1A1AA] truncate">Language Detected</p>
              <p className="text-[26px] sm:text-[30px] font-[600] text-[#111827] dark:text-[#FAFAFA] leading-none truncate">{currentScan?.language_detected || 'English'}</p>
              <p className="text-[11px] sm:text-[13px] font-[400] text-[#6B7280] dark:text-[#A1A1AA] truncate pt-0.5">Vision engine</p>
            </div>
            <div className="w-[34px] h-[34px] sm:w-[40px] sm:h-[40px] rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#D1D5DB] dark:border-[#3F3F46] text-[#111827] dark:text-[#FAFAFA] flex items-center justify-center shrink-0 ml-2 sm:ml-3">
              <Languages size={18} />
            </div>
          </div>

          <div className="h-[88px] p-3.5 sm:p-[16px] rounded-[16px] bg-[#FFFFFF] dark:bg-[#18181B] border border-[#D1D5DB] dark:border-[#3F3F46] shadow-xs flex items-center justify-between transition-all duration-150 ease-in-out hover:-translate-y-[2px] hover:shadow-md">
            <div className="min-w-0 flex-1 space-y-0.5">
              <p className="text-[12px] sm:text-[13px] font-[400] text-[#6B7280] dark:text-[#A1A1AA] truncate">Extracted Words</p>
              <p className="text-[26px] sm:text-[30px] font-[600] text-[#111827] dark:text-[#FAFAFA] leading-none truncate">
                {extractedText ? extractedText.split(/\s+/).length : 0}
              </p>
              <p className="text-[11px] sm:text-[13px] font-[400] text-[#6B7280] dark:text-[#A1A1AA] truncate pt-0.5">Current scan</p>
            </div>
            <div className="w-[34px] h-[34px] sm:w-[40px] sm:h-[40px] rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#D1D5DB] dark:border-[#3F3F46] text-[#111827] dark:text-[#FAFAFA] flex items-center justify-center shrink-0 ml-2 sm:ml-3">
              <FileText size={18} />
            </div>
          </div>

          <div className="h-[88px] p-3.5 sm:p-[16px] rounded-[16px] bg-[#FFFFFF] dark:bg-[#18181B] border border-[#D1D5DB] dark:border-[#3F3F46] shadow-xs flex items-center justify-between transition-all duration-150 ease-in-out hover:-translate-y-[2px] hover:shadow-md">
            <div className="min-w-0 flex-1 space-y-0.5">
              <p className="text-[12px] sm:text-[13px] font-[400] text-[#6B7280] dark:text-[#A1A1AA] truncate">AI Action Toolkit</p>
              <p className="text-[26px] sm:text-[30px] font-[600] text-[#111827] dark:text-[#FAFAFA] leading-none truncate">6 Tools</p>
              <p className="text-[11px] sm:text-[13px] font-[400] text-[#6B7280] dark:text-[#A1A1AA] truncate pt-0.5">MCQs, summary & translate</p>
            </div>
            <div className="w-[34px] h-[34px] sm:w-[40px] sm:h-[40px] rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#D1D5DB] dark:border-[#3F3F46] text-[#111827] dark:text-[#FAFAFA] flex items-center justify-center shrink-0 ml-2 sm:ml-3">
              <Sparkles size={18} />
            </div>
          </div>
        </div>

        {/* Upload & Live Preview Cards (Matching Study Planner section containers) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 select-none">
          {/* Upload Dropzone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="bg-[#FFFFFF] dark:bg-[#18181B] rounded-[16px] border-2 border-dashed border-[#D1D5DB] dark:border-[#3F3F46] p-6 sm:p-8 text-center transition-all hover:border-[#111827] dark:hover:border-[#FAFAFA] flex flex-col items-center justify-center min-h-[320px] shadow-xs"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".jpg,.jpeg,.png,.webp,.heic"
              className="hidden"
            />

            <div className="space-y-4 max-w-sm">
              <div className="w-[52px] h-[52px] rounded-[12px] bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] flex items-center justify-center mx-auto">
                <Upload size={24} />
              </div>

              <div>
                <h3 className="text-[18px] font-[700] text-[#111827] dark:text-[#FAFAFA]">
                  {selectedFile ? selectedFile.name : 'Upload Image / Handwritten Notes'}
                </h3>
                <p className="text-[13px] font-[500] text-[#6B7280] dark:text-[#A1A1AA] mt-1">
                  Supports PNG, JPG, JPEG, WEBP, HEIC
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="h-[40px] px-4 rounded-[12px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#18181B] text-[#111827] dark:text-[#FAFAFA] text-[14px] font-[500] hover:bg-[#F8FAFC] dark:hover:bg-[#232323] transition cursor-pointer active:scale-[0.98]"
                >
                  Select Image
                </button>

                <button
                  onClick={handleExtract}
                  disabled={isProcessing || !selectedFile}
                  className="h-[40px] px-5 rounded-[12px] bg-[#111827] hover:bg-[#1F2937] active:bg-[#0F172A] dark:bg-[#FAFAFA] dark:hover:bg-[#F3F4F6] text-[#FFFFFF] dark:text-[#111111] font-[700] text-[13px] transition disabled:opacity-40 flex items-center gap-2 cursor-pointer active:scale-[0.98]"
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
          <div className="bg-[#FFFFFF] dark:bg-[#18181B] rounded-[16px] border border-[#D1D5DB] dark:border-[#3F3F46] p-6 flex flex-col justify-between min-h-[320px] shadow-xs">
            <div className="flex items-center justify-between border-b border-[#D1D5DB] dark:border-[#3F3F46] pb-3 mb-4">
              <span className="text-[12px] font-[400] uppercase tracking-wider text-[#6B7280] dark:text-[#A1A1AA]">
                Image Preview
              </span>
              {previewUrl && (
                <button
                  onClick={handleRotate}
                  className="h-[34px] px-3 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#18181B] text-[#111827] dark:text-[#FAFAFA] text-[12px] font-[400] hover:bg-[#F8FAFC] dark:hover:bg-[#232323] transition flex items-center gap-1.5 cursor-pointer active:scale-[0.98]"
                >
                  <RotateCw size={14} />
                  <span>Rotate (90°)</span>
                </button>
              )}
            </div>

            {previewUrl ? (
              <div className="flex-1 flex items-center justify-center overflow-hidden rounded-[12px] bg-[#F8FAFC] dark:bg-[#111111] p-3 border border-[#D1D5DB] dark:border-[#3F3F46]">
                <img
                  src={previewUrl}
                  alt="Preview"
                  style={{ transform: `rotate(${rotationAngle}deg)` }}
                  className="max-h-64 object-contain rounded-[8px] transition-transform duration-300"
                />
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-[#6B7280] dark:text-[#A1A1AA] text-[13px] font-[500]">
                <Scan size={36} className="mb-2 opacity-50" />
                <span>No image selected for preview</span>
              </div>
            )}
          </div>
        </div>

        {/* Extracted Text Viewer & AI Toolkit Container */}
        {extractedText && (
          <div className="space-y-6 select-none">
            {/* Metadata & Quick Actions */}
            <div className="bg-[#FFFFFF] dark:bg-[#18181B] rounded-[16px] border border-[#D1D5DB] dark:border-[#3F3F46] p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-[14px] font-[500] text-[#6B7280] dark:text-[#A1A1AA]">
                <span className="px-3 py-1 rounded-[8px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#D1D5DB] dark:border-[#3F3F46] text-[#111827] dark:text-[#FAFAFA] font-[700]">
                  Language: {currentScan?.language_detected || 'English'}
                </span>
                <span>• {extractedText.length} characters</span>
                <span>• {extractedText.split(/\s+/).length} words</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyText}
                  className="h-[38px] px-3.5 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#18181B] text-[#111827] dark:text-[#FAFAFA] text-[14px] font-[500] hover:bg-[#F8FAFC] dark:hover:bg-[#232323] transition flex items-center gap-1.5 cursor-pointer active:scale-[0.98]"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copied ? 'Copied' : 'Copy Text'}</span>
                </button>

                <button
                  onClick={() => navigate('/dashboard')}
                  className="h-[38px] px-4 rounded-[10px] bg-[#111827] hover:bg-[#1F2937] active:bg-[#0F172A] dark:bg-[#FAFAFA] dark:hover:bg-[#F3F4F6] text-[#FFFFFF] dark:text-[#111111] text-[14px] font-[500] transition flex items-center gap-2 cursor-pointer active:scale-[0.98]"
                >
                  <MessageSquare size={14} />
                  <span>Chat with OCR Text</span>
                </button>
              </div>
            </div>

            {/* Extracted Text View Box */}
            <div className="bg-[#FFFFFF] dark:bg-[#18181B] rounded-[16px] border border-[#D1D5DB] dark:border-[#3F3F46] p-4 sm:p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D1D5DB] dark:border-[#3F3F46] pb-3">
                <h3 className="text-[16px] sm:text-[17px] font-[600] text-[#111827] dark:text-[#FAFAFA] flex items-center gap-2 shrink-0">
                  <FileText size={18} />
                  <span>Extracted Document Text</span>
                </h3>

                {/* Search Bar */}
                <div className="relative w-full sm:w-64">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7280] dark:text-[#A1A1AA]" />
                  <input
                    type="text"
                    placeholder="Search keywords..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-[38px] pl-9 pr-3 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#18181B] text-[14px] font-[500] text-[#111827] dark:text-[#FAFAFA] outline-none"
                  />
                </div>
              </div>

              <div className="bg-[#F8FAFC] dark:bg-[#111111] p-5 rounded-[12px] text-[14px] font-sans text-[#111827] dark:text-[#FAFAFA] leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto border border-[#D1D5DB] dark:border-[#3F3F46] no-scrollbar">
                {highlightText(extractedText)}
              </div>
            </div>

            {/* AI Action Toolkit Bar */}
            <div className="bg-[#FFFFFF] dark:bg-[#18181B] rounded-[16px] border border-[#D1D5DB] dark:border-[#3F3F46] p-6 shadow-xs space-y-4">
              <h3 className="text-[18px] font-[700] text-[#111827] dark:text-[#FAFAFA] flex items-center gap-2 border-b border-[#D1D5DB] dark:border-[#3F3F46] pb-3">
                <Sparkles size={18} />
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
                      className="h-[38px] px-4 rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] text-[#111827] dark:text-[#FAFAFA] border border-[#D1D5DB] dark:border-[#3F3F46] font-[700] text-[13px] hover:bg-[#111827] hover:text-[#FFFFFF] dark:hover:bg-[#FAFAFA] dark:hover:text-[#111111] transition flex items-center gap-2 cursor-pointer disabled:opacity-50 active:scale-[0.98]"
                    >
                      {isLoading ? <RefreshCw size={14} className="animate-spin" /> : <Icon size={14} />}
                      <span>{btn.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Action Output Display */}
              {actionResult && (
                <div className="mt-4 p-5 bg-[#F8FAFC] dark:bg-[#111111] rounded-[12px] border border-[#D1D5DB] dark:border-[#3F3F46] space-y-2">
                  <div className="flex items-center justify-between border-b border-[#D1D5DB] dark:border-[#3F3F46] pb-2">
                    <span className="font-[700] text-[12px] uppercase text-[#111827] dark:text-[#FAFAFA]">
                      AI Result: {activeAction}
                    </span>
                    <button onClick={() => setActionResult(null)} className="text-[#6B7280] dark:text-[#A1A1AA] hover:text-[#111827] dark:hover:text-[#FAFAFA] cursor-pointer">
                      <X size={16} />
                    </button>
                  </div>
                  <div className="text-[13px] font-[500] text-[#111827] dark:text-[#FAFAFA] leading-relaxed whitespace-pre-wrap">
                    {actionResult}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* History Sidebar Drawer */}
        {historyOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end">
            <div className="w-full max-w-md bg-[#FFFFFF] dark:bg-[#18181B] h-full shadow-2xl p-6 overflow-y-auto space-y-6 border-l border-[#D1D5DB] dark:border-[#3F3F46] select-none">
              <div className="flex items-center justify-between border-b border-[#D1D5DB] dark:border-[#3F3F46] pb-4">
                <h3 className="text-[18px] font-[700] text-[#111827] dark:text-[#FAFAFA] flex items-center gap-2">
                  <History size={18} />
                  <span>OCR Scan History</span>
                </h3>
                <button
                  onClick={() => setHistoryOpen(false)}
                  className="h-8 w-8 rounded-[8px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#18181B] text-[#111827] dark:text-[#FAFAFA] flex items-center justify-center shrink-0 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {loadingHistory ? (
                <div className="text-center py-12">
                  <RefreshCw size={24} className="animate-spin mx-auto text-[#111827] dark:text-[#FAFAFA]" />
                  <p className="text-[14px] text-[#6B7280] dark:text-[#A1A1AA] mt-2 font-[500]">Loading OCR history...</p>
                </div>
              ) : historyList.length === 0 ? (
                <div className="text-center py-12 text-[#6B7280] dark:text-[#A1A1AA] text-[14px] font-[500]">
                  No previous OCR scans available.
                </div>
              ) : (
                <div className="space-y-3">
                  {historyList.map((item) => {
                    const isCurrent = currentScan?.id === item.id;
                    return (
                      <div
                        key={item.id}
                        onClick={() => handleSelectHistoryScan(item.id)}
                        className={`p-4 rounded-[12px] border transition cursor-pointer flex items-start justify-between ${
                          isCurrent
                            ? 'bg-[#111827] text-[#FFFFFF] dark:bg-[#FAFAFA] dark:text-[#111111] border-[#111827]'
                            : 'bg-[#F8FAFC] dark:bg-[#111111] border-[#D1D5DB] dark:border-[#3F3F46] hover:border-[#111827] text-[#111827] dark:text-[#FAFAFA]'
                        }`}
                      >
                        <div className="space-y-1 pr-2 min-w-0 flex-1">
                          <h4 className="text-[14px] font-[500] truncate">
                            {item.image_name || item.extracted_text?.slice(0, 30) || `OCR Scan #${item.id}`}
                          </h4>
                          <p className={`text-[12px] font-[500] ${isCurrent ? 'text-[#D1D5DB] dark:text-[#3F3F46]' : 'text-[#6B7280] dark:text-[#A1A1AA]'}`}>
                            {item.language_detected || 'English'} • {new Date(item.created_at).toLocaleDateString()}
                          </p>
                        </div>

                        <button
                          onClick={(e) => handleDeleteHistoryScan(e, item.id)}
                          className={`p-1.5 rounded-[8px] transition cursor-pointer shrink-0 ml-2 ${
                            isCurrent
                              ? 'text-[#FFFFFF]/70 hover:text-[#FFFFFF] dark:text-[#111111]/70 dark:hover:text-[#111111]'
                              : 'text-[#6B7280] dark:text-[#A1A1AA] hover:text-[#DC2626] hover:bg-[#E5E7EB] dark:hover:bg-[#232323]'
                          }`}
                          title="Delete Scan"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

