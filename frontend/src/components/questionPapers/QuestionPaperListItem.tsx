import React from 'react';
import {
  FileText,
  Eye,
  Download,
  Calendar,
  Sparkles
} from 'lucide-react';
import { QuestionPaper } from '../../api/questionPapers';
import { PaperActionsDropdown } from './PaperActionsDropdown';

interface QuestionPaperListItemProps {
  paper: QuestionPaper;
  onPreview: (paper: QuestionPaper) => void;
  onAnalysis: (paper: QuestionPaper) => void;
  onChat: (paper: QuestionPaper) => void;
  onToggleBookmark: (id: number) => void;
  onDelete?: (id: number) => void;
  onShare: (paper: QuestionPaper) => void;
}

export const QuestionPaperListItem: React.FC<QuestionPaperListItemProps> = ({
  paper,
  onPreview,
  onAnalysis,
  onChat,
  onToggleBookmark,
  onDelete,
  onShare,
}) => {
  return (
    <div className="w-full min-h-[110px] p-[20px] rounded-[16px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#18181B] hover:border-[#111827] dark:hover:border-[#FAFAFA] transition-all duration-150 ease-in-out flex flex-col md:flex-row md:items-center justify-between gap-4 select-none">
      {/* Left Section: Document Icon & Document Info */}
      <div className="flex items-center gap-4 min-w-0 flex-1">
        <div className="w-[48px] h-[48px] rounded-[12px] bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] flex items-center justify-center shrink-0">
          <FileText size={22} />
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="h-[24px] inline-flex items-center rounded-full border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#F8FAFC] dark:bg-[#18181B] px-3 text-[12px] font-[500] text-[#6B7280] dark:text-[#A1A1AA]">
              {paper.subject_code}
            </span>
            <span className="h-[24px] inline-flex items-center rounded-full border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#F8FAFC] dark:bg-[#18181B] px-3 text-[12px] font-[500] text-[#6B7280] dark:text-[#A1A1AA]">
              {paper.regulation}
            </span>
          </div>

          <h3 className="text-[18px] font-[600] text-[#111827] dark:text-[#FAFAFA] leading-snug truncate">
            {paper.title}
          </h3>

          <p className="text-[14px] font-[400] text-[#6B7280] dark:text-[#A1A1AA] truncate">
            {paper.department} {paper.faculty_name ? `• ${paper.faculty_name}` : ''}
          </p>
        </div>
      </div>

      {/* Right Section: Metadata Stats & Single Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 shrink-0 justify-between md:justify-end">
        <div className="text-[13px] font-[400] text-[#6B7280] dark:text-[#A1A1AA] space-y-1 min-w-[140px]">
          <div className="flex items-center gap-1.5">
            <Calendar size={15} className="text-[#6B7280] dark:text-[#A1A1AA]" />
            <span>AY {paper.academic_year} • Sem {paper.semester}</span>
          </div>
          <div className="flex items-center gap-3 text-[12px]">
            <span className="inline-flex items-center gap-1"><Eye size={14} /> {paper.view_count}</span>
            <span className="inline-flex items-center gap-1"><Download size={14} /> {paper.download_count}</span>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center gap-[8px] w-full sm:w-auto">
          <button
            onClick={() => onPreview(paper)}
            className="h-[40px] px-[18px] py-[10px] rounded-[12px] bg-[#111827] hover:bg-[#1F2937] active:bg-[#0F172A] dark:bg-[#FAFAFA] dark:hover:bg-[#F3F4F6] text-[#FFFFFF] dark:text-[#111827] text-[14px] font-[600] tracking-normal transition-all duration-150 ease-in-out hover:-translate-y-[1px] shadow-xs active:scale-[0.98] flex items-center justify-center gap-[8px] cursor-pointer flex-1 sm:flex-initial"
          >
            <Eye size={16} className="shrink-0" />
            <span>Preview</span>
          </button>

          <button
            onClick={() => onAnalysis(paper)}
            className="h-[40px] px-[14px] py-[10px] rounded-[12px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#18181B] hover:bg-[#F8FAFC] dark:hover:bg-[#232323] text-[#111827] dark:text-[#FAFAFA] text-[14px] font-[600] tracking-normal transition-all duration-150 ease-in-out hover:-translate-y-[1px] active:scale-[0.98] flex items-center justify-center gap-[8px] cursor-pointer whitespace-nowrap flex-1 sm:flex-initial"
          >
            <Sparkles size={16} className="shrink-0" />
            <span className="hidden lg:inline">AI Insights</span>
          </button>

          <PaperActionsDropdown
            paper={paper}
            onAnalysis={onAnalysis}
            onChat={onChat}
            onToggleBookmark={onToggleBookmark}
            onShare={onShare}
            onDelete={onDelete}
          />
        </div>
      </div>
    </div>
  );
};
