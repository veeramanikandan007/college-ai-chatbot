import React from 'react';
import {
  FileText,
  BookOpen,
  Download,
  Eye,
  Bookmark,
  Share2,
  Sparkles,
  MessageSquare,
  Trash2,
  Calendar,
  User
} from 'lucide-react';
import { QuestionPaper } from '../../api/questionPapers';

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
  const isBookmarked = paper.is_bookmarked;

  return (
    <div className="p-6 rounded-[12px] bg-[#FFFFFF] dark:bg-[#181818] border border-[#D1D5DB] dark:border-[#3F3F46] shadow-xs flex flex-col justify-between space-y-4">
      <div className="space-y-3">
        {/* Header Metadata Pills */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-[6px] text-[12px] font-medium bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] flex items-center gap-1">
              <BookOpen size={12} />
              {paper.subject_code}
            </span>

            <span className="px-2.5 py-0.5 rounded-[6px] text-[12px] font-medium bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA]">
              {paper.regulation}
            </span>

            <span className="px-2.5 py-0.5 rounded-[6px] text-[12px] font-medium bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA]">
              {paper.exam_type}
            </span>
          </div>

          <button
            onClick={() => onToggleBookmark(paper.id)}
            title={isBookmarked ? 'Remove Bookmark' : 'Bookmark Paper'}
            className="h-8 w-8 rounded-[6px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#181818] text-[#111827] dark:text-[#FAFAFA] hover:bg-[#F9FAFB] dark:hover:bg-[#232323] flex items-center justify-center transition cursor-pointer"
          >
            <Bookmark size={16} className={isBookmarked ? 'fill-current' : ''} />
          </button>
        </div>

        {/* Paper Title */}
        <h3 className="text-[18px] font-bold text-[#111827] dark:text-[#FAFAFA] leading-snug">
          {paper.title}
        </h3>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[14px] text-[#6B7280] dark:text-[#A3A3A3]">
          <span className="inline-flex items-center gap-1">
            <Calendar size={14} />
            Year: <strong className="text-[#111827] dark:text-[#FAFAFA]">{paper.academic_year}</strong> (Sem {paper.semester})
          </span>

          {paper.faculty_name && (
            <span className="inline-flex items-center gap-1">
              <User size={14} />
              Faculty: <strong className="text-[#111827] dark:text-[#FAFAFA]">{paper.faculty_name}</strong>
            </span>
          )}
        </div>

        <p className="text-[14px] text-[#6B7280] dark:text-[#A3A3A3]">
          Department: <span className="text-[#111827] dark:text-[#FAFAFA] font-medium">{paper.department}</span>
        </p>
      </div>

      {/* Footer Metrics & Actions */}
      <div className="pt-3 border-t border-[#E5E7EB] dark:border-[#2A2A2A] flex flex-wrap items-center justify-between gap-3">
        {/* Metric Badges */}
        <div className="flex items-center gap-3 text-[12px] font-medium text-[#6B7280] dark:text-[#A3A3A3]">
          <span className="inline-flex items-center gap-1" title="Views">
            <Eye size={14} />
            {paper.view_count}
          </span>
          <span className="inline-flex items-center gap-1" title="Downloads">
            <Download size={14} />
            {paper.download_count}
          </span>
          <span className="inline-flex items-center gap-1" title="Pages">
            <FileText size={14} />
            {paper.page_count || 4} pgs
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onPreview(paper)}
            className="h-9 px-3.5 rounded-[8px] bg-[#111827] hover:bg-[#000000] dark:bg-[#FAFAFA] dark:hover:bg-[#E5E5E5] text-[#FFFFFF] dark:text-[#111111] text-[12px] font-medium shadow-xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <Eye size={14} />
            <span>Preview</span>
          </button>

          <button
            onClick={() => onAnalysis(paper)}
            className="h-9 px-3 rounded-[8px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#181818] text-[#111827] dark:text-[#FAFAFA] text-[12px] font-medium hover:bg-[#F9FAFB] dark:hover:bg-[#232323] transition flex items-center gap-1 cursor-pointer"
            title="AI Analysis & Pattern"
          >
            <Sparkles size={14} />
            <span>AI Insights</span>
          </button>

          <button
            onClick={() => onChat(paper)}
            className="h-9 px-3 rounded-[8px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#181818] text-[#111827] dark:text-[#FAFAFA] text-[12px] font-medium hover:bg-[#F9FAFB] dark:hover:bg-[#232323] transition flex items-center gap-1 cursor-pointer"
            title="Ask AI about this Paper"
          >
            <MessageSquare size={14} />
            <span>Ask AI</span>
          </button>

          <button
            onClick={() => onShare(paper)}
            title="Share Paper"
            className="h-9 w-9 rounded-[8px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#181818] text-[#111827] dark:text-[#FAFAFA] hover:bg-[#F9FAFB] dark:hover:bg-[#232323] flex items-center justify-center cursor-pointer"
          >
            <Share2 size={16} />
          </button>

          {onDelete && (
            <button
              onClick={() => onDelete(paper.id)}
              title="Delete Paper"
              className="h-9 w-9 rounded-[8px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#181818] text-[#111827] dark:text-[#FAFAFA] hover:bg-[#F9FAFB] dark:hover:bg-[#232323] flex items-center justify-center cursor-pointer"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
