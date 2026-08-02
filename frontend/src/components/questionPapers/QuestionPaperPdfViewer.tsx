import React, { useState, useRef } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Printer,
  Expand,
  Download,
  RotateCw,
  FileText
} from 'lucide-react';

interface QuestionPaperPdfViewerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  pdfUrl: string;
  fileName: string;
}

export const QuestionPaperPdfViewer: React.FC<QuestionPaperPdfViewerProps> = ({
  isOpen,
  onClose,
  title,
  pdfUrl,
  fileName,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [rotation, setRotation] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages] = useState<number>(5);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 25, 50));
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);

  const handlePrint = () => {
    const iframe = document.getElementById('pdf-frame') as HTMLIFrameElement;
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.print();
    } else {
      window.print();
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/70 backdrop-blur-xs">
      <div
        ref={containerRef}
        className={`relative w-full max-w-5xl bg-white dark:bg-[#1E293B] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden ${
          isFullscreen ? 'h-screen w-screen max-w-none rounded-none' : 'h-[90vh]'
        }`}
      >
        {/* Toolbar Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
          {/* Document Title */}
          <div className="flex items-center gap-2 min-w-0">
            <FileText className="text-[#0E2A6D] dark:text-[#60A5FA] shrink-0" size={20} />
            <h3 className="text-sm font-bold font-heading text-slate-900 dark:text-white truncate max-w-md">
              {title}
            </h3>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-2 bg-white dark:bg-slate-800 rounded-xl px-2 py-1 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage <= 1}
              className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 text-slate-700 dark:text-slate-200"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200 whitespace-nowrap">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage >= totalPages}
              className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 text-slate-700 dark:text-slate-200"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Zoom, Rotate, Print, Fullscreen, Download, Close */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Zoom Controls */}
            <div className="flex items-center gap-1 bg-white dark:bg-slate-800 rounded-xl p-0.5 border border-slate-200 dark:border-slate-700">
              <button
                onClick={handleZoomOut}
                title="Zoom Out"
                className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <ZoomOut size={15} />
              </button>
              <span className="text-xs font-bold px-1 text-slate-700 dark:text-slate-200 min-w-[38px] text-center">
                {zoomLevel}%
              </span>
              <button
                onClick={handleZoomIn}
                title="Zoom In"
                className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <ZoomIn size={15} />
              </button>
            </div>

            {/* Rotate */}
            <button
              onClick={handleRotate}
              title="Rotate 90°"
              className="p-1.5 rounded-xl bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
            >
              <RotateCw size={15} />
            </button>

            {/* Print */}
            <button
              onClick={handlePrint}
              title="Print Question Paper"
              className="p-1.5 rounded-xl bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
            >
              <Printer size={15} />
            </button>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              title="Toggle Fullscreen"
              className="p-1.5 rounded-xl bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
            >
              <Expand size={15} />
            </button>

            {/* Download */}
            <a
              href={pdfUrl}
              download={fileName}
              title="Download PDF"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0E2A6D] text-white text-xs font-bold hover:bg-[#0E2A6D]/90 shadow-xs"
            >
              <Download size={14} />
              <span>Download</span>
            </a>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* PDF Frame Container */}
        <div className="flex-1 bg-slate-100 dark:bg-slate-900 overflow-auto flex items-center justify-center p-4">
          <div
            className="w-full h-full max-w-4xl bg-white dark:bg-[#1E293B] shadow-xl rounded-xl overflow-hidden transition-transform duration-200"
            style={{
              transform: `scale(${zoomLevel / 100}) rotate(${rotation}deg)`,
              transformOrigin: 'center center',
            }}
          >
            <iframe
              id="pdf-frame"
              src={`${pdfUrl}#page=${currentPage}`}
              title={title}
              className="w-full h-full border-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
