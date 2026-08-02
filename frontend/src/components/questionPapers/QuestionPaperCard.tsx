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

  const examTypeBadge =
    paper.exam_type === 'University Exam'
      ? 'bg-[#0E2A6D]/10 text-[#0E2A6D] dark:bg-[#60A5FA]/10 dark:text-[#60A5FA] border-[#0E2A6D]/20 dark:border-[#60A5FA]/20'
      : paper.exam_type === 'Model Exam'
      ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-900/50'
      : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/50';

  return (
    <div className="group relative flex flex-col justify-between bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs hover:shadow-md hover:border-[#0E2A6D]/40 dark:hover:border-[#D9A441]/40 transition-all duration-200">
      <div>
        {/* Header Metadata Pills */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
          <div className="flex flex-wrap items-center gap-2">
            {/* Subject Code & Regulation */}
            <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-md bg-[#0E2A6D] text-white dark:bg-[#D9A441] dark:text-slate-950">
              <BookOpen size={12} />
              {paper.subject_code}
            </span>

            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              {paper.regulation}
            </span>

            {/* Exam Type Pill */}
            <span className={`inline-flex items-center text-xs font-bold px-2.5 py-0.5 rounded-md border ${examTypeBadge}`}>
              {paper.exam_type}
            </span>
          </div>

          {/* Bookmark Button */}
          <button
            onClick={() => onToggleBookmark(paper.id)}
            title={isBookmarked ? 'Remove Bookmark' : 'Bookmark Paper'}
            className={`p-1.5 rounded-lg transition-colors ${
              isBookmarked
                ? 'bg-amber-500/10 text-amber-500 dark:text-amber-400'
                : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Bookmark size={18} className={isBookmarked ? 'fill-current' : ''} />
          </button>
        </div>

        {/* Paper Title */}
        <h3 className="text-base font-bold font-heading text-slate-900 dark:text-white group-hover:text-[#0E2A6D] dark:group-hover:text-[#60A5FA] transition-colors leading-snug">
          {paper.title}
        </h3>

        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
          <span className="inline-flex items-center gap-1 font-medium">
            <Calendar size={13} className="text-slate-400" />
            Year: <strong className="text-slate-700 dark:text-slate-300">{paper.academic_year}</strong> (Sem {paper.semester})
          </span>

          {paper.faculty_name && (
            <span className="inline-flex items-center gap-1 font-medium">
              <User size={13} className="text-slate-400" />
              Faculty: <strong className="text-slate-700 dark:text-slate-300">{paper.faculty_name}</strong>
            </span>
          )}
        </div>

        <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 font-medium">
          Department: <span className="text-slate-800 dark:text-slate-200 font-semibold">{paper.department}</span>
        </p>
      </div>

      {/* Footer Metrics & Actions */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        {/* Metric Badges */}
        <div className="flex items-center gap-3 text-xs font-semibold text-slate-400">
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
          {/* PDF Preview Button */}
          <button
            onClick={() => onPreview(paper)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#0E2A6D] text-white hover:bg-[#0E2A6D]/90 transition-all shadow-xs"
          >
            <Eye size={14} />
            <span>Preview</span>
          </button>

          {/* AI Analysis Button */}
          <button
            onClick={() => onAnalysis(paper)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 hover:bg-purple-500/20 border border-purple-200 dark:border-purple-900/50 transition-all"
            title="AI Analysis & Pattern"
          >
            <Sparkles size={14} />
            <span>AI Insights</span>
          </button>

          {/* AI RAG Chat Button */}
          <button
            onClick={() => onChat(paper)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-900/50 transition-all"
            title="Ask AI about this Paper"
          >
            <MessageSquare size={14} />
            <span>RAG Chat</span>
          </button>

          {/* Share Button */}
          <button
            onClick={() => onShare(paper)}
            title="Share Paper"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Share2 size={16} />
          </button>

          {/* Delete Button */}
          {onDelete && (
            <button
              onClick={() => onDelete(paper.id)}
              title="Delete Paper"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
