import React from 'react';
import {
  FileText,
  BookOpen,
  Download,
  Eye,
  Sparkles,
  Calendar,
  User
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
  return (
    <div className="w-full p-[20px] rounded-[16px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#18181B] shadow-xs hover:shadow-md transition-all duration-150 ease-in-out hover:-translate-y-[2px] flex flex-col justify-between select-none space-y-4">
      {/* Header Info */}
      <div className="space-y-3">
        {/* Top Header with 3-Dot Icon Menu at the Top Right */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-[48px] h-[48px] rounded-[12px] bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] flex items-center justify-center shrink-0">
              <FileText size={22} />
            </div>
            <div className="flex flex-wrap items-center gap-1.5 min-w-0">
              <span className="h-[24px] inline-flex items-center rounded-full border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#F8FAFC] dark:bg-[#18181B] px-3 text-[12px] font-[500] text-[#6B7280] dark:text-[#A1A1AA] shrink-0">
                {paper.subject_code}
              </span>
              <span className="h-[24px] inline-flex items-center rounded-full border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#F8FAFC] dark:bg-[#18181B] px-3 text-[12px] font-[500] text-[#6B7280] dark:text-[#A1A1AA] shrink-0">
                {paper.regulation}
              </span>
            </div>
          </div>

          {/* 3-Dot Icon Menu Pinned to Top-Right Header */}
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
          <h3 className="text-[18px] font-[600] text-[#111827] dark:text-[#FAFAFA] leading-snug line-clamp-2">
            {paper.title}
          </h3>

          {/* 3 Rows Metadata */}
          <div className="mt-3 space-y-1.5 text-[14px] font-[400] text-[#6B7280] dark:text-[#A1A1AA]">
            <div className="flex items-center gap-2 truncate">
              <Calendar size={16} className="shrink-0 text-[#6B7280] dark:text-[#A1A1AA]" />
              <span className="truncate">AY {paper.academic_year} • Sem {paper.semester} ({paper.exam_type})</span>
            </div>
            <div className="flex items-center gap-2 truncate">
              <User size={16} className="shrink-0 text-[#6B7280] dark:text-[#A1A1AA]" />
              <span className="truncate">{paper.faculty_name || 'Department Faculty'}</span>
            </div>
            <div className="flex items-center gap-2 truncate">
              <BookOpen size={16} className="shrink-0 text-[#6B7280] dark:text-[#A1A1AA]" />
              <span className="truncate">{paper.department}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer & Action Bar */}
      <div className="pt-3 border-t border-[#D1D5DB] dark:border-[#3F3F46] space-y-3">
        {/* Horizontal Statistics */}
        <div className="flex items-center justify-between text-[13px] font-[400] text-[#6B7280] dark:text-[#A1A1AA]">
          <span className="inline-flex items-center gap-1.5"><Eye size={15} /> {paper.view_count} views</span>
          <span className="inline-flex items-center gap-1.5"><Download size={15} /> {paper.download_count} downloads</span>
          <span className="inline-flex items-center gap-1.5"><FileText size={15} /> {paper.page_count || 4} pgs</span>
        </div>

        {/* Action Bar: [ Preview ] [ AI Insights ] */}
        <div className="flex items-center gap-[8px]">
          <button
            onClick={() => onPreview(paper)}
            className="flex-1 h-[40px] px-[18px] py-[10px] rounded-[12px] bg-[#111827] hover:bg-[#1F2937] active:bg-[#0F172A] dark:bg-[#FAFAFA] dark:hover:bg-[#F3F4F6] text-[#FFFFFF] dark:text-[#111827] text-[14px] font-[600] tracking-normal transition-all duration-150 ease-in-out hover:-translate-y-[1px] shadow-xs active:scale-[0.98] flex items-center justify-center gap-[8px] cursor-pointer"
          >
            <Eye size={16} className="shrink-0" />
            <span>Preview</span>
          </button>

          <button
            onClick={() => onAnalysis(paper)}
            className="flex-1 h-[40px] px-[14px] py-[10px] rounded-[12px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#18181B] hover:bg-[#F8FAFC] dark:hover:bg-[#232323] text-[#111827] dark:text-[#FAFAFA] text-[14px] font-[600] tracking-normal transition-all duration-150 ease-in-out hover:-translate-y-[1px] active:scale-[0.98] flex items-center justify-center gap-[8px] cursor-pointer whitespace-nowrap"
          >
            <Sparkles size={16} className="shrink-0" />
            <span className="truncate">AI Insights</span>
          </button>
        </div>
      </div>
    </div>
  );
};
