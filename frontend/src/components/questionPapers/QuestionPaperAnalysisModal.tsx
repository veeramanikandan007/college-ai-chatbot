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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white dark:bg-[#1E293B] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 my-8 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-purple-50/50 dark:bg-purple-950/20">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold font-heading text-slate-900 dark:text-white">
                AI Question Paper Analysis
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {paper.subject_name} ({paper.subject_code}) - {paper.academic_year}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 border-b border-slate-100 dark:border-slate-800 px-6 pt-3 bg-slate-50/30 dark:bg-slate-900/20 overflow-x-auto scrollbar-none">
          {[
            { id: 'pattern', label: 'Pattern & Weightage' },
            { id: 'repeated', label: 'Important & Repeated' },
            { id: 'difficulty', label: 'Difficulty & Units' },
            { id: 'generator', label: 'AI Question Generator' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 text-xs font-bold rounded-t-xl whitespace-nowrap transition-all border-b-2 ${
                activeTab === tab.id
                  ? 'border-purple-600 text-purple-600 dark:border-purple-400 dark:text-purple-400 bg-white dark:bg-[#1E293B]'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Body Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {loadingAnalysis ? (
            <div className="py-16 flex flex-col items-center justify-center text-center">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-purple-600 border-t-transparent mb-4" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                Synthesizing AI Analysis...
              </p>
            </div>
          ) : analysis ? (
            <>
              {/* Tab 1: Pattern & Weightage */}
              {activeTab === 'pattern' && (
                <div className="space-y-4">
                  {/* Pattern Box */}
                  <div className="p-4 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/40">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300 mb-1 flex items-center gap-1.5">
                      <ListFilter size={15} />
                      Question Paper Pattern
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                      {analysis.question_pattern}
                    </p>
                  </div>

                  {/* Weightage Analysis */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Topic Weightage Breakdown
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {analysis.weightage_analysis.map((w, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800"
                        >
                          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                            {w.topic}
                          </span>
                          <p className="text-lg font-bold font-heading text-purple-600 dark:text-purple-400 mt-1">
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
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                      Repeated Questions Across Years
                    </h4>
                    <div className="space-y-2">
                      {analysis.repeated_questions.map((q, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 flex items-start justify-between gap-3"
                        >
                          <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-normal">
                            {q}
                          </p>
                          <button
                            onClick={() => copyToClipboard(q)}
                            className="p-1 rounded-lg text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/40"
                            title="Copy question"
                          >
                            <Copy size={15} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                      Frequently Asked Topics
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {analysis.frequently_asked_topics.map((t, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200 dark:border-slate-700"
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
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                      Difficulty Level Breakdown
                    </h4>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 text-center">
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Easy</span>
                        <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                          {analysis.difficulty_analysis.easy_percentage}%
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-center">
                        <span className="text-xs font-bold text-amber-600 dark:text-amber-400">Medium</span>
                        <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                          {analysis.difficulty_analysis.medium_percentage}%
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 text-center">
                        <span className="text-xs font-bold text-rose-600 dark:text-rose-400">Hard</span>
                        <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                          {analysis.difficulty_analysis.hard_percentage}%
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Unit-wise Distribution */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                      Unit-wise Marks Distribution
                    </h4>
                    <div className="space-y-2">
                      {analysis.unit_wise_distribution.map((u, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs">
                          <span className="font-bold text-slate-700 dark:text-slate-300">{u.unit}</span>
                          <span className="font-semibold text-purple-600 dark:text-purple-400">{u.marks} Marks ({u.percentage}%)</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 4: AI Question Generator */}
              {activeTab === 'generator' && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
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
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          genType === t.id
                            ? 'bg-purple-600 text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>

                  {loadingGen ? (
                    <div className="py-12 flex flex-col items-center justify-center text-center">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-600 border-t-transparent mb-2" />
                      <p className="text-xs font-bold text-slate-500">Generating AI Questions...</p>
                    </div>
                  ) : generatedQuestions.length > 0 ? (
                    <div className="space-y-3">
                      {generatedQuestions.map((q, idx) => (
                        <div key={idx} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-bold text-slate-900 dark:text-white text-sm">
                              {idx + 1}. {q.question}
                            </p>
                            <button
                              onClick={() => copyToClipboard(`${q.question}\n${q.answer || ''}`)}
                              className="p-1 rounded text-slate-400 hover:text-purple-600"
                              title="Copy"
                            >
                              <Copy size={14} />
                            </button>
                          </div>

                          {q.options && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                              {q.options.map((opt, oIdx) => (
                                <span key={oIdx} className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-medium">
                                  {opt}
                                </span>
                              ))}
                            </div>
                          )}

                          {q.answer && (
                            <div className="p-2 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 font-medium border border-emerald-200 dark:border-emerald-900/40">
                              <strong>Answer:</strong> {q.answer}
                            </div>
                          )}

                          {q.explanation && (
                            <p className="text-slate-500 italic">
                              <strong>Explanation:</strong> {q.explanation}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center text-slate-500 text-xs">
                      Click any question type above to generate AI practice questions.
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="py-12 text-center text-slate-500 text-xs">
              No analysis data available.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#0E2A6D] text-white hover:bg-[#0E2A6D]/90 transition-colors shadow-xs"
          >
            Close Analysis
          </button>
        </div>
      </div>
    </div>
  );
};
