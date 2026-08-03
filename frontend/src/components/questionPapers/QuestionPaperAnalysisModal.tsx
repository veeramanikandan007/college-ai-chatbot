import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  BookOpen,
  CheckCircle2,
  ListFilter,
  Copy,
  Brain,
  HelpCircle
} from 'lucide-react';
import {
  QuestionPaper,
  PaperAnalysis,
  QuestionGeneratedItem,
  getPaperAnalysis,
  generateAiQuestions
} from '../../api/questionPapers';
import { useToast } from '../../context/ToastContext';

interface QuestionPaperAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  paper: QuestionPaper | null;
}

export const QuestionPaperAnalysisModal: React.FC<QuestionPaperAnalysisModalProps> = ({
  isOpen,
  onClose,
  paper,
}) => {
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'pattern' | 'repeated' | 'difficulty' | 'generator'>('pattern');
  const [analysis, setAnalysis] = useState<PaperAnalysis | null>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState<boolean>(true);

  // Question Generator state
  const [genType, setGenType] = useState<'mcqs' | '2_marks' | '5_marks' | '10_marks' | '16_marks' | 'viva'>('2_marks');
  const [generatedQuestions, setGeneratedQuestions] = useState<QuestionGeneratedItem[]>([]);
  const [loadingGen, setLoadingGen] = useState<boolean>(false);

  useEffect(() => {
    if (paper && isOpen) {
      setLoadingAnalysis(true);
      getPaperAnalysis(paper.id)
        .then((res) => setAnalysis(res))
        .catch(() => showToast('Failed to load paper analysis', 'error'))
        .finally(() => setLoadingAnalysis(false));
    }
  }, [paper, isOpen]);

  if (!isOpen || !paper) return null;

  const handleGenerateQuestions = async (type: 'mcqs' | '2_marks' | '5_marks' | '10_marks' | '16_marks' | 'viva') => {
    setGenType(type);
    setLoadingGen(true);
    try {
      const res = await generateAiQuestions(paper.id, type);
      setGeneratedQuestions(res.questions);
      showToast(`Generated AI ${type.replace('_', ' ')} questions`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Question generation failed', 'error');
    } finally {
      setLoadingGen(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('Copied to clipboard', 'info');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#FFFFFF] dark:bg-[#181818] rounded-[16px] shadow-lg border border-[#D1D5DB] dark:border-[#3F3F46] my-8 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#F8FAFC] dark:bg-[#111111]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[10px] bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] flex items-center justify-center shrink-0">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="text-[18px] font-bold text-[#111827] dark:text-[#FAFAFA]">
                AI Question Paper Analysis
              </h2>
              <p className="text-[12px] text-[#6B7280] dark:text-[#A3A3A3]">
                {paper.subject_name} ({paper.subject_code}) - {paper.academic_year}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#6B7280] dark:text-[#A3A3A3] hover:text-[#111827] dark:hover:text-[#FAFAFA] cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 border-b border-[#E5E7EB] dark:border-[#2A2A2A] px-6 pt-3 bg-[#F8FAFC] dark:bg-[#111111] overflow-x-auto">
          {[
            { id: 'pattern', label: 'Pattern & Weightage' },
            { id: 'repeated', label: 'Important & Repeated' },
            { id: 'difficulty', label: 'Difficulty & Units' },
            { id: 'generator', label: 'AI Question Generator' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`h-9 px-4 text-[14px] font-medium rounded-[8px] transition-all whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111]'
                  : 'text-[#4B5563] dark:text-[#A3A3A3] hover:bg-[#F9FAFB] dark:hover:bg-[#232323]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Body Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-4">
          {loadingAnalysis ? (
            <div className="py-16 flex flex-col items-center justify-center text-center">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#111827] dark:border-[#FAFAFA] border-t-transparent mb-4" />
              <p className="text-[14px] font-bold text-[#111827] dark:text-[#FAFAFA]">
                Synthesizing AI Analysis...
              </p>
            </div>
          ) : analysis ? (
            <>
              {/* Tab 1: Pattern & Weightage */}
              {activeTab === 'pattern' && (
                <div className="space-y-4">
                  {/* Pattern Box */}
                  <div className="p-4 rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A]">
                    <h4 className="text-[12px] font-bold uppercase tracking-wider text-[#111827] dark:text-[#FAFAFA] mb-1 flex items-center gap-1.5">
                      <ListFilter size={15} />
                      Question Paper Pattern
                    </h4>
                    <p className="text-[14px] text-[#4B5563] dark:text-[#D4D4D4] whitespace-pre-wrap leading-relaxed">
                      {analysis.question_pattern}
                    </p>
                  </div>

                  {/* Weightage Analysis */}
                  <div className="space-y-2">
                    <h4 className="text-[12px] font-bold uppercase tracking-wider text-[#6B7280] dark:text-[#A3A3A3]">
                      Topic Weightage Breakdown
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {analysis.weightage_analysis.map((w, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A]"
                        >
                          <span className="text-[12px] font-medium text-[#6B7280] dark:text-[#A3A3A3]">
                            {w.topic}
                          </span>
                          <p className="text-[24px] font-bold text-[#111827] dark:text-[#FAFAFA] mt-1">
                            {w.weightage}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Repeated & Important */}
              {activeTab === 'repeated' && (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-[12px] font-bold uppercase tracking-wider text-[#6B7280] dark:text-[#A3A3A3] mb-2">
                      Repeated Questions Across Years
                    </h4>
                    <div className="space-y-2">
                      {analysis.repeated_questions.map((q, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] flex items-start justify-between gap-3 text-[14px]"
                        >
                          <p className="text-[#4B5563] dark:text-[#D4D4D4] leading-normal">
                            {q}
                          </p>
                          <button
                            onClick={() => copyToClipboard(q)}
                            className="p-1 rounded text-[#6B7280] hover:text-[#111827] dark:hover:text-[#FAFAFA] cursor-pointer"
                            title="Copy question"
                          >
                            <Copy size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-[12px] font-bold uppercase tracking-wider text-[#6B7280] dark:text-[#A3A3A3] mb-2">
                      Frequently Asked Topics
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {analysis.frequently_asked_topics.map((t, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 rounded-[6px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA] text-[12px] font-medium"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Difficulty & Unit Distribution */}
              {activeTab === 'difficulty' && (
                <div className="space-y-4">
                  {/* Difficulty Cards */}
                  <div>
                    <h4 className="text-[12px] font-bold uppercase tracking-wider text-[#6B7280] dark:text-[#A3A3A3] mb-2">
                      Difficulty Level Breakdown
                    </h4>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-4 rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-center">
                        <span className="text-[12px] font-bold text-[#111827] dark:text-[#FAFAFA]">Easy</span>
                        <p className="text-[24px] font-bold text-[#111827] dark:text-[#FAFAFA] mt-1">
                          {analysis.difficulty_analysis.easy_percentage}%
                        </p>
                      </div>
                      <div className="p-4 rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-center">
                        <span className="text-[12px] font-bold text-[#111827] dark:text-[#FAFAFA]">Medium</span>
                        <p className="text-[24px] font-bold text-[#111827] dark:text-[#FAFAFA] mt-1">
                          {analysis.difficulty_analysis.medium_percentage}%
                        </p>
                      </div>
                      <div className="p-4 rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-center">
                        <span className="text-[12px] font-bold text-[#111827] dark:text-[#FAFAFA]">Hard</span>
                        <p className="text-[24px] font-bold text-[#111827] dark:text-[#FAFAFA] mt-1">
                          {analysis.difficulty_analysis.hard_percentage}%
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Unit-wise Distribution */}
                  <div>
                    <h4 className="text-[12px] font-bold uppercase tracking-wider text-[#6B7280] dark:text-[#A3A3A3] mb-2">
                      Unit-wise Marks Distribution
                    </h4>
                    <div className="space-y-2">
                      {analysis.unit_wise_distribution.map((u, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[14px]">
                          <span className="font-bold text-[#111827] dark:text-[#FAFAFA]">{u.unit}</span>
                          <span className="font-medium text-[#6B7280] dark:text-[#A3A3A3]">{u.marks} Marks ({u.percentage}%)</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 4: AI Question Generator */}
              {activeTab === 'generator' && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-[#E5E7EB] dark:border-[#2A2A2A]">
                    {[
                      { id: 'mcqs', label: 'MCQs' },
                      { id: '2_marks', label: '2 Marks' },
                      { id: '5_marks', label: '5 Marks' },
                      { id: '10_marks', label: '10 Marks' },
                      { id: '16_marks', label: '16 Marks' },
                      { id: 'viva', label: 'Viva Questions' },
                    ].map((t) => (
                      <button
                        key={t.id}
                        onClick={() => handleGenerateQuestions(t.id as any)}
                        className={`h-9 px-3.5 rounded-[8px] text-[12px] font-medium transition-all cursor-pointer ${
                          genType === t.id
                            ? 'bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111]'
                            : 'bg-[#FFFFFF] dark:bg-[#181818] border border-[#D1D5DB] dark:border-[#3F3F46] text-[#111827] dark:text-[#FAFAFA] hover:bg-[#F9FAFB] dark:hover:bg-[#232323]'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>

                  {loadingGen ? (
                    <div className="py-12 flex flex-col items-center justify-center text-center">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#111827] dark:border-[#FAFAFA] border-t-transparent mb-2" />
                      <p className="text-[14px] font-medium text-[#6B7280] dark:text-[#A3A3A3]">Generating AI Questions...</p>
                    </div>
                  ) : generatedQuestions.length > 0 ? (
                    <div className="space-y-3">
                      {generatedQuestions.map((q, idx) => (
                        <div key={idx} className="p-4 rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[14px] space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-bold text-[#111827] dark:text-[#FAFAFA]">
                              {idx + 1}. {q.question}
                            </p>
                            <button
                              onClick={() => copyToClipboard(`${q.question}\n${q.answer || ''}`)}
                              className="p-1 rounded text-[#6B7280] hover:text-[#111827] cursor-pointer"
                              title="Copy"
                            >
                              <Copy size={16} />
                            </button>
                          </div>

                          {q.options && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                              {q.options.map((opt, oIdx) => (
                                <span key={oIdx} className="px-2.5 py-1 rounded-[6px] bg-[#FFFFFF] dark:bg-[#181818] text-[#111827] dark:text-[#FAFAFA] border border-[#D1D5DB] dark:border-[#3F3F46] font-medium text-[12px]">
                                  {opt}
                                </span>
                              ))}
                            </div>
                          )}

                          {q.answer && (
                            <div className="p-2.5 rounded-[6px] bg-[#FFFFFF] dark:bg-[#181818] text-[#111827] dark:text-[#FAFAFA] border border-[#D1D5DB] dark:border-[#3F3F46] font-medium text-[12px]">
                              <strong>Answer:</strong> {q.answer}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center text-[#6B7280] dark:text-[#A3A3A3] text-[14px]">
                      Click any question type above to generate AI practice questions.
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="py-12 text-center text-[#6B7280] dark:text-[#A3A3A3] text-[14px]">
              No analysis data available.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-4 border-t border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#F8FAFC] dark:bg-[#111111]">
          <button
            onClick={onClose}
            className="h-10 px-5 rounded-[10px] bg-[#111827] hover:bg-[#000000] dark:bg-[#FAFAFA] dark:hover:bg-[#E5E5E5] text-[#FFFFFF] dark:text-[#111111] font-medium text-[14px] shadow-xs cursor-pointer"
          >
            Close Analysis
          </button>
        </div>
      </div>
    </div>
  );
};
