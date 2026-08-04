import React from 'react';
import {
  X,
  Award,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Download,
  FileText,
  Brain,
  BookOpen,
  Sparkles
} from 'lucide-react';
import { InterviewEvaluation } from '../../api/mockInterviews';
import { useToast } from '../../context/ToastContext';

interface MockInterviewFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  evaluation: InterviewEvaluation | null;
}

export const MockInterviewFeedbackModal: React.FC<MockInterviewFeedbackModalProps> = ({
  isOpen,
  onClose,
  evaluation,
}) => {
  const { showToast } = useToast();

  if (!isOpen || !evaluation) return null;

  const handlePrintPdfReport = () => {
    window.print();
    showToast('Report print / PDF export initiated', 'info');
  };

  const metricsList = [
    { label: 'Technical Accuracy', score: evaluation.technical_accuracy_score },
    { label: 'Communication', score: evaluation.communication_score },
    { label: 'Confidence', score: evaluation.confidence_score },
    { label: 'Fluency', score: evaluation.fluency_score },
    { label: 'Grammar', score: evaluation.grammar_score },
    { label: 'Professionalism', score: evaluation.professionalism_score },
    { label: 'Completeness', score: evaluation.completeness_score },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="relative w-full max-w-4xl bg-[#FFFFFF] dark:bg-[#181818] rounded-[16px] shadow-lg border border-[#D1D5DB] dark:border-[#3F3F46] my-8 overflow-hidden print:shadow-none print:border-none">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#F8FAFC] dark:bg-[#111111] print:bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[10px] bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] flex items-center justify-center shrink-0">
              <Award size={20} />
            </div>
            <div>
              <h2 className="text-[18px] font-bold text-[#111827] dark:text-[#FAFAFA]">
                AI Interview Evaluation & Feedback Report
              </h2>
              <p className="text-[12px] text-[#6B7280] dark:text-[#A3A3A3]">
                Detailed 7-metric evaluation, strengths, weaknesses, and model answers
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 print:hidden">
            <button
              onClick={handlePrintPdfReport}
              className="h-9 px-4 rounded-[8px] bg-[#111827] hover:bg-[#000000] dark:bg-[#FAFAFA] dark:hover:bg-[#E5E5E5] text-[#FFFFFF] dark:text-[#111111] text-[12px] font-medium shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <Download size={14} />
              <span>Download PDF Report</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded text-[#6B7280] dark:text-[#A3A3A3] hover:text-[#111827] dark:hover:text-[#FAFAFA] cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Evaluation Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto print:max-h-none print:overflow-visible">
          {/* Top Banner: Overall Score & Summary */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6 p-6 rounded-[12px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A]">
            <div className="space-y-2 flex-1">
              <span className="text-[12px] font-medium uppercase tracking-wider text-[#6B7280] dark:text-[#A3A3A3]">
                Overall Interview Score
              </span>
              <h3 className="text-[16px] font-bold text-[#111827] dark:text-[#FAFAFA] leading-relaxed">
                {evaluation.feedback_summary}
              </h3>
            </div>

            {/* Score Pill */}
            <div className="flex flex-col items-center justify-center p-4 min-w-[140px] rounded-[10px] bg-[#FFFFFF] dark:bg-[#181818] border border-[#D1D5DB] dark:border-[#3F3F46] shadow-xs">
              <span className="text-[32px] font-bold text-[#111827] dark:text-[#FAFAFA]">
                {evaluation.overall_score}%
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280] dark:text-[#A3A3A3] mt-0.5">
                {evaluation.overall_score >= 85 ? 'Excellent' : evaluation.overall_score >= 70 ? 'Proficient' : 'Needs Practice'}
              </span>
            </div>
          </div>

          {/* 7 Metrics Grid */}
          <div className="space-y-3">
            <h4 className="text-[14px] font-bold text-[#111827] dark:text-[#FAFAFA] flex items-center gap-2">
              <BarChart3 size={18} />
              7-Dimension Competency Scores
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {metricsList.map((m) => (
                <div key={m.label} className="p-4 rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] space-y-2">
                  <div className="flex items-center justify-between text-[12px] font-medium">
                    <span className="text-[#6B7280] dark:text-[#A3A3A3]">{m.label}</span>
                    <span className="text-[#111827] dark:text-[#FAFAFA] font-bold">{m.score}%</span>
                  </div>
                  <div className="w-full h-2 bg-[#E5E7EB] dark:bg-[#2A2A2A] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#111827] dark:bg-[#FAFAFA] rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(m.score, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Strengths & Weaknesses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Strengths */}
            <div className="p-4 rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] space-y-2">
              <h5 className="text-[12px] font-medium uppercase tracking-wider text-[#111827] dark:text-[#FAFAFA] flex items-center gap-1.5">
                <CheckCircle2 size={16} />
                Key Strengths
              </h5>
              <ul className="space-y-1 text-[14px] text-[#4B5563] dark:text-[#D4D4D4]">
                {evaluation.strengths.map((str, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span>•</span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Weaknesses & Improvements */}
            <div className="p-4 rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] space-y-2">
              <h5 className="text-[12px] font-medium uppercase tracking-wider text-[#111827] dark:text-[#FAFAFA] flex items-center gap-1.5">
                <AlertTriangle size={16} />
                Areas for Improvement
              </h5>
              <ul className="space-y-1 text-[14px] text-[#4B5563] dark:text-[#D4D4D4]">
                {evaluation.weaknesses.map((w, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span>•</span>
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Question Breakdown with Model Answers */}
          <div className="space-y-3 pt-2">
            <h4 className="text-[14px] font-bold text-[#111827] dark:text-[#FAFAFA] flex items-center gap-2">
              <BookOpen size={18} />
              Question-by-Question Transcript & Model Answers
            </h4>

            <div className="space-y-3">
              {evaluation.qa_logs.map((qa) => (
                <div
                  key={qa.id}
                  className="p-4 rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] space-y-2.5 text-[14px]"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-medium uppercase tracking-wider text-[#111827] dark:text-[#FAFAFA]">
                      Question #{qa.question_number}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-[6px] text-[12px] font-medium bg-[#FFFFFF] dark:bg-[#181818] border border-[#D1D5DB] dark:border-[#3F3F46] text-[#111827] dark:text-[#FAFAFA]">
                      Score: {qa.score}%
                    </span>
                  </div>

                  <p className="font-bold text-[#111827] dark:text-[#FAFAFA]">
                    {qa.question_text}
                  </p>

                  {qa.student_answer && (
                    <div className="p-3 rounded-[6px] bg-[#FFFFFF] dark:bg-[#181818] border border-[#D1D5DB] dark:border-[#3F3F46]">
                      <strong className="text-[#6B7280] dark:text-[#A3A3A3] text-[12px] block">Your Answer:</strong>
                      <p className="text-[#111827] dark:text-[#FAFAFA]">{qa.student_answer}</p>
                    </div>
                  )}

                  {qa.model_answer && (
                    <div className="p-3 rounded-[6px] bg-[#FFFFFF] dark:bg-[#181818] border border-[#D1D5DB] dark:border-[#3F3F46]">
                      <strong className="text-[#6B7280] dark:text-[#A3A3A3] text-[12px] block">Suggested Model Answer:</strong>
                      <p className="text-[#111827] dark:text-[#FAFAFA]">{qa.model_answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-4 border-t border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#F8FAFC] dark:bg-[#111111] print:hidden">
          <button
            onClick={onClose}
            className="h-10 px-5 rounded-[10px] bg-[#111827] hover:bg-[#000000] dark:bg-[#FAFAFA] dark:hover:bg-[#E5E5E5] text-[#FFFFFF] dark:text-[#111111] font-medium text-[14px] shadow-xs cursor-pointer"
          >
            Close Evaluation
          </button>
        </div>
      </div>
    </div>
  );
};
