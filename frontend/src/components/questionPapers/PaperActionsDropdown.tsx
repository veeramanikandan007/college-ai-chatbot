import React, { useState, useRef, useEffect } from 'react';
import { MoreHorizontal, Sparkles, MessageSquare, Bookmark, Share2, Download, Copy, Trash2 } from 'lucide-react';
import { QuestionPaper } from '../../api/questionPapers';

interface PaperActionsDropdownProps {
  paper: QuestionPaper;
  onAnalysis: (paper: QuestionPaper) => void;
  onChat: (paper: QuestionPaper) => void;
  onToggleBookmark: (id: number) => void;
  onShare: (paper: QuestionPaper) => void;
  onDelete?: (id: number) => void;
}

export const PaperActionsDropdown: React.FC<PaperActionsDropdownProps> = ({
  paper,
  onAnalysis,
  onChat,
  onToggleBookmark,
  onShare,
  onDelete,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDownload = () => {
    if (paper.file_url) {
      const link = document.createElement('a');
      link.href = paper.file_url;
      link.download = paper.file_name || `${paper.subject_code}_Question_Paper.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="relative shrink-0" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        title="More Actions"
        className="h-[36px] w-[36px] rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#18181B] hover:bg-[#F8FAFC] dark:hover:bg-[#232323] text-[#111827] dark:text-[#FAFAFA] transition-all duration-150 ease-in-out hover:-translate-y-[1px] active:scale-[0.98] flex items-center justify-center shrink-0 cursor-pointer"
      >
        <MoreHorizontal size={18} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1.5 z-50 w-[200px] rounded-[12px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#18181B] shadow-xl py-1 text-[13px] font-[500] text-[#111827] dark:text-[#FAFAFA] animate-in fade-in zoom-in-95 duration-100">
          <button
            onClick={() => {
              onChat(paper);
              setIsOpen(false);
            }}
            className="w-full px-3.5 py-2 text-left hover:bg-[#F8FAFC] dark:hover:bg-[#232323] flex items-center gap-2.5 cursor-pointer transition"
          >
            <MessageSquare size={16} />
            <span>Ask AI Assistant</span>
          </button>

          <button
            onClick={() => {
              onToggleBookmark(paper.id);
              setIsOpen(false);
            }}
            className="w-full px-3.5 py-2 text-left hover:bg-[#F8FAFC] dark:hover:bg-[#232323] flex items-center gap-2.5 cursor-pointer transition"
          >
            <Bookmark size={16} className={paper.is_bookmarked ? 'fill-current' : ''} />
            <span>{paper.is_bookmarked ? 'Remove Bookmark' : 'Bookmark Paper'}</span>
          </button>

          <button
            onClick={() => {
              onShare(paper);
              setIsOpen(false);
            }}
            className="w-full px-3.5 py-2 text-left hover:bg-[#F8FAFC] dark:hover:bg-[#232323] flex items-center gap-2.5 cursor-pointer transition"
          >
            <Share2 size={16} />
            <span>Share Link</span>
          </button>

          <button
            onClick={() => {
              onShare(paper);
              setIsOpen(false);
            }}
            className="w-full px-3.5 py-2 text-left hover:bg-[#F8FAFC] dark:hover:bg-[#232323] flex items-center gap-2.5 cursor-pointer transition"
          >
            <Copy size={16} />
            <span>Copy Link</span>
          </button>

          <button
            onClick={() => {
              handleDownload();
              setIsOpen(false);
            }}
            className="w-full px-3.5 py-2 text-left hover:bg-[#F8FAFC] dark:hover:bg-[#232323] flex items-center gap-2.5 cursor-pointer transition"
          >
            <Download size={16} />
            <span>Download Paper</span>
          </button>

          {onDelete && (
            <button
              onClick={() => {
                onDelete(paper.id);
                setIsOpen(false);
              }}
              className="w-full px-3.5 py-2 text-left hover:bg-[#F8FAFC] dark:hover:bg-[#232323] flex items-center gap-2.5 cursor-pointer transition border-t border-[#E5E7EB] dark:border-[#2A2A2A] mt-1 pt-2"
            >
              <Trash2 size={16} />
              <span>Delete Paper</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
