import React from 'react';
import {
  FileText,
  BookOpen,
  Download,
  Eye,
  Calendar,
  Building2,
  GraduationCap,
} from 'lucide-react';
import { QuestionPaper } from '../../api/questionPapers';
import { PaperActionsDropdown } from './PaperActionsDropdown';

interface QuestionPaperCardProps {
  paper: QuestionPaper;
  onPreview: (paper: QuestionPaper) => void;
  onAnalysis: (paper: QuestionPaper) => void;
  onChat: (paper: QuestionPaper) => void;
  onToggleBookmark: (id: number) => void;
  onDelete?: (id: number) => void;
  onShare: (paper: QuestionPaper) => void;
}

export const QuestionPaperCard: React.FC<QuestionPaperCardProps> = ({
  paper,
  onPreview,
  onAnalysis,
  onChat,
  onToggleBookmark,
  onDelete,
  onShare,
}) => {
  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (paper.file_url) {
      const link = document.createElement('a');
      link.href = paper.file_url;
      link.download = paper.file_name || `${paper.subject_code}_${paper.academic_year}.pdf`;
      link.click();
    }
  };

  return (
    <div className="w-full p-6 rounded-[16px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#FFFFFF] dark:bg-[#18181B] shadow-xs hover:shadow-md transition-all duration-150 ease-in-out hover:-translate-y-[2px] flex flex-col justify-between select-none space-y-4">
      {/* Header Info */}
      <div className="space-y-3">
        {/* Top Header with Code Pill and Actions Dropdown */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-[12px] bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] flex items-center justify-center shrink-0">
              <FileText size={22} />
            </div>
            <div className="flex flex-wrap items-center gap-1.5 min-w-0">
              <span className="h-6 inline-flex items-center rounded-full border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#F8FAFC] dark:bg-[#111111] px-3 text-[12px] font-medium text-[#111827] dark:text-[#FAFAFA] shrink-0">
                {paper.subject_code}
              </span>
              <span className="h-6 inline-flex items-center rounded-full border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#F8FAFC] dark:bg-[#111111] px-3 text-[12px] font-medium text-[#6B7280] dark:text-[#A1A1AA] shrink-0">
                {paper.regulation}
              </span>
            </div>
          </div>

          <PaperActionsDropdown
            paper={paper}
            onAnalysis={onAnalysis}
            onChat={onChat}
            onToggleBookmark={onToggleBookmark}
            onShare={onShare}
            onDelete={onDelete}
          />
        </div>

        <div>
          <h3 className="text-[17px] font-semibold text-[#111827] dark:text-[#FAFAFA] leading-snug line-clamp-2">
            {paper.title}
          </h3>

          {/* Metadata Rows: Subject, Semester, Year, University */}
          <div className="mt-3 space-y-1.5 text-[14px] font-normal text-[#6B7280] dark:text-[#A1A1AA]">
            <div className="flex items-center gap-2 truncate">
              <BookOpen size={16} className="shrink-0 text-[#6B7280] dark:text-[#A1A1AA]" />
              <span className="truncate">{paper.subject_name}</span>
            </div>
            <div className="flex items-center gap-2 truncate">
              <Calendar size={16} className="shrink-0 text-[#6B7280] dark:text-[#A1A1AA]" />
              <span className="truncate">Sem {paper.semester} • Year {paper.academic_year} ({paper.exam_type})</span>
            </div>
            <div className="flex items-center gap-2 truncate">
              <GraduationCap size={16} className="shrink-0 text-[#6B7280] dark:text-[#A1A1AA]" />
              <span className="truncate">{paper.department} • Mount Zion / Anna Univ</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer & Action Bar: Download & Preview */}
      <div className="pt-4 border-t border-[#E5E7EB] dark:border-[#2A2A2A] space-y-3">
        <div className="flex items-center justify-between text-[12px] font-normal text-[#6B7280] dark:text-[#A1A1AA]">
          <span className="inline-flex items-center gap-1.5"><Eye size={14} /> {paper.view_count} views</span>
          <span className="inline-flex items-center gap-1.5"><Download size={14} /> {paper.download_count} downloads</span>
          <span className="inline-flex items-center gap-1.5"><FileText size={14} /> {paper.page_count || 4} pgs</span>
        </div>

        {/* Primary Action Buttons: [ Preview ] [ Download ] */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onPreview(paper)}
            className="flex-1 h-[40px] px-4 rounded-[10px] bg-[#111827] hover:bg-[#1F2937] dark:bg-[#FAFAFA] dark:hover:bg-[#E5E5E5] text-[#FFFFFF] dark:text-[#111111] text-[14px] font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Eye size={16} className="shrink-0" />
            <span>Preview</span>
          </button>

          <button
            onClick={handleDownload}
            className="flex-1 h-[40px] px-4 rounded-[10px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#FFFFFF] dark:bg-[#18181B] hover:bg-[#F8FAFC] dark:hover:bg-[#232323] text-[#111827] dark:text-[#FAFAFA] text-[14px] font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download size={16} className="shrink-0" />
            <span>Download</span>
          </button>
        </div>
      </div>
    </div>
  );
};