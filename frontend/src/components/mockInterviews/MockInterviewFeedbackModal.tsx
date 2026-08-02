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

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-300 dark:border-emerald-800';
    if (score >= 70) return 'text-[#0E2A6D] dark:text-[#60A5FA] bg-[#0E2A6D]/10 border-[#0E2A6D]/30';
    return 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-300 dark:border-amber-800';
  };

  const metricsList = [
    { label: 'Technical Accuracy', score: evaluation.technical_accuracy_score, color: 'bg-emerald-500' },
    { label: 'Communication', score: evaluation.communication_score, color: 'bg-[#0E2A6D] dark:bg-[#60A5FA]' },
    { label: 'Confidence', score: evaluation.confidence_score, color: 'bg-purple-500' },
    { label: 'Fluency', score: evaluation.fluency_score, color: 'bg-blue-500' },
    { label: 'Grammar', score: evaluation.grammar_score, color: 'bg-[#D9A441]' },
    { label: 'Professionalism', score: evaluation.professionalism_score, color: 'bg-indigo-500' },
    { label: 'Completeness', score: evaluation.completeness_score, color: 'bg-teal-500' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="relative w-full max-w-4xl bg-white dark:bg-[#1E293B] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 my-8 overflow-hidden print:shadow-none print:border-none">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-[#0E2A6D]/5 dark:bg-[#60A5FA]/10 print:bg-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-600 text-white">
              <Award size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold font-heading text-slate-900 dark:text-white">
                AI Interview Evaluation & Feedback Report
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Detailed 7-metric evaluation, strengths, weaknesses, and model answers
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 print:hidden">
            <button
              onClick={handlePrintPdfReport}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0E2A6D] text-white text-xs font-bold hover:bg-[#0E2A6D]/90 transition-all shadow-xs"
            >
              <Download size={16} />
              <span>Download PDF Report</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Evaluation Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto print:max-h-none print:overflow-visible">
          {/* Top Banner: Overall Score & Summary */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6 p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
            <div className="space-y-2 flex-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Overall Interview Score
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white leading-relaxed">
                {evaluation.feedback_summary}
              </h3>
            </div>

            {/* Score Pill */}
            <div className="flex flex-col items-center justify-center p-4 min-w-[140px] rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-3xl font-black font-heading text-purple-600 dark:text-purple-400">
                {evaluation.overall_score}%
              </span>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mt-0.5">
                {evaluation.overall_score >= 85 ? 'Excellent' : evaluation.overall_score >= 70 ? 'Proficient' : 'Needs Practice'}
              </span>
            </div>
          </div>

          {/* 7 Radar/Bar Metrics Grid */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold font-heading text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 size={18} className="text-[#0E2A6D] dark:text-[#60A5FA]" />
              7-Dimension Competency Scores
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {metricsList.map((m) => (
                <div key={m.label} className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-700 dark:text-slate-300">{m.label}</span>
                    <span className="text-slate-900 dark:text-white">{m.score}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${m.color} rounded-full transition-all duration-300`}
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
            <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 space-y-2">
              <h5 className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-emerald-500" />
                Key Strengths
              </h5>
              <ul className="space-y-1 text-xs text-emerald-900 dark:text-emerald-200">
                {evaluation.strengths.map((str, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-emerald-500">•</span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Weaknesses & Improvements */}
            <div className="p-4 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 space-y-2">
              <h5 className="text-xs font-bold text-rose-800 dark:text-rose-300 flex items-center gap-1.5">
                <AlertTriangle size={16} className="text-rose-500" />
                Areas for Improvement
              </h5>
              <ul className="space-y-1 text-xs text-rose-900 dark:text-rose-200">
                {evaluation.weaknesses.map((w, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-rose-500">•</span>
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Question Breakdown with Model Answers */}
          <div className="space-y-3 pt-2">
            <h4 className="text-sm font-bold font-heading text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen size={18} className="text-purple-500" />
              Question-by-Question Transcript & Model Answers
            </h4>

            <div className="space-y-3">
              {evaluation.qa_logs.map((qa) => (
                <div
                  key={qa.id}
                  className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-[#0E2A6D] dark:text-[#60A5FA]">
                      Question #{qa.question_number}
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400">
                      Score: {qa.score}%
                    </span>
                  </div>

                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                    {qa.question_text}
                  </p>

                  <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Student Answer:
                    </span>
                    <p className="text-xs text-slate-700 dark:text-slate-300 italic leading-relaxed">
                      "{qa.student_answer || 'No answer submitted'}"
                    </p>
                  </div>

                  {qa.model_answer && (
                    <div className="p-3 rounded-lg bg-purple-50/40 dark:bg-purple-950/20 border border-purple-200/50 dark:border-purple-900/40 space-y-1">
                      <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                        AI Recommended Model Answer:
                      </span>
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                        {qa.model_answer}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
