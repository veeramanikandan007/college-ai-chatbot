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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div
        ref={containerRef}
        className={`relative w-full max-w-5xl bg-[#FFFFFF] dark:bg-[#181818] rounded-[16px] shadow-lg border border-[#D1D5DB] dark:border-[#3F3F46] flex flex-col overflow-hidden ${
          isFullscreen ? 'h-screen w-screen max-w-none rounded-none' : 'h-[90vh]'
        }`}
      >
        {/* Toolbar Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#F8FAFC] dark:bg-[#111111]">
          {/* Document Title */}
          <div className="flex items-center gap-2 min-w-0">
            <FileText className="shrink-0" size={20} />
            <h3 className="text-[14px] font-bold text-[#111827] dark:text-[#FAFAFA] truncate max-w-md">
              {title}
            </h3>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-2 bg-[#FFFFFF] dark:bg-[#181818] rounded-[8px] px-3 py-1 border border-[#D1D5DB] dark:border-[#3F3F46]">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage <= 1}
              className="p-1 rounded hover:bg-[#F9FAFB] dark:hover:bg-[#232323] disabled:opacity-30 text-[#111827] dark:text-[#FAFAFA] cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-[12px] font-medium text-[#111827] dark:text-[#FAFAFA] whitespace-nowrap">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage >= totalPages}
              className="p-1 rounded hover:bg-[#F9FAFB] dark:hover:bg-[#232323] disabled:opacity-30 text-[#111827] dark:text-[#FAFAFA] cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Zoom, Rotate, Print, Fullscreen, Download, Close */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Zoom Controls */}
            <div className="flex items-center gap-1 bg-[#FFFFFF] dark:bg-[#181818] rounded-[8px] p-1 border border-[#D1D5DB] dark:border-[#3F3F46]">
              <button
                onClick={handleZoomOut}
                title="Zoom Out"
                className="p-1 rounded text-[#111827] dark:text-[#FAFAFA] hover:bg-[#F9FAFB] dark:hover:bg-[#232323] cursor-pointer"
              >
                <ZoomOut size={15} />
              </button>
              <span className="text-[12px] font-medium px-1 text-[#111827] dark:text-[#FAFAFA] min-w-[38px] text-center">
                {zoomLevel}%
              </span>
              <button
                onClick={handleZoomIn}
                title="Zoom In"
                className="p-1 rounded text-[#111827] dark:text-[#FAFAFA] hover:bg-[#F9FAFB] dark:hover:bg-[#232323] cursor-pointer"
              >
                <ZoomIn size={15} />
              </button>
            </div>

            {/* Rotate */}
            <button
              onClick={handleRotate}
              title="Rotate 90°"
              className="h-9 w-9 rounded-[8px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#181818] text-[#111827] dark:text-[#FAFAFA] hover:bg-[#F9FAFB] dark:hover:bg-[#232323] flex items-center justify-center cursor-pointer"
            >
              <RotateCw size={15} />
            </button>

            {/* Print */}
            <button
              onClick={handlePrint}
              title="Print Question Paper"
              className="h-9 w-9 rounded-[8px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#181818] text-[#111827] dark:text-[#FAFAFA] hover:bg-[#F9FAFB] dark:hover:bg-[#232323] flex items-center justify-center cursor-pointer"
            >
              <Printer size={15} />
            </button>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              title="Toggle Fullscreen"
              className="h-9 w-9 rounded-[8px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#181818] text-[#111827] dark:text-[#FAFAFA] hover:bg-[#F9FAFB] dark:hover:bg-[#232323] flex items-center justify-center cursor-pointer"
            >
              <Expand size={15} />
            </button>

            {/* Download */}
            <a
              href={pdfUrl}
              download={fileName}
              title="Download PDF"
              className="h-9 px-4 rounded-[8px] bg-[#111827] hover:bg-[#000000] dark:bg-[#FAFAFA] dark:hover:bg-[#E5E5E5] text-[#FFFFFF] dark:text-[#111111] text-[12px] font-medium shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <Download size={14} />
              <span>Download</span>
            </a>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-1 rounded text-[#6B7280] dark:text-[#A3A3A3] hover:text-[#111827] dark:hover:text-[#FAFAFA] cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* PDF Frame Container */}
        <div className="flex-1 bg-[#F8FAFC] dark:bg-[#111111] overflow-auto flex items-center justify-center p-4">
          <div
            className="w-full h-full max-w-4xl bg-[#FFFFFF] dark:bg-[#181818] shadow-lg rounded-[12px] overflow-hidden transition-transform duration-200"
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
