import React, { useState } from 'react';
import { X, Sparkles, CircleCheck, CheckSquare, Clock3, CalendarDays, BookOpen } from 'lucide-react';
import { Assignment, AssignmentAiResponseData } from '../../api/assignments';

interface AssignmentAiModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignment: Assignment | null;
  aiData: AssignmentAiResponseData | null;
  loading: boolean;
}

export const AssignmentAiModal: React.FC<AssignmentAiModalProps> = ({
  isOpen,
  onClose,
  assignment,
  aiData,
  loading,
}) => {
  const [completedChecklist, setCompletedChecklist] = useState<Record<number, boolean>>({});

  if (!isOpen || !assignment) return null;

  const handleChecklistToggle = (index: number) => {
    setCompletedChecklist((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const actionTitles: Record<string, string> = {
    summarize: 'AI Assignment Summary',
    explain: 'AI Question & Concept Explanation',
    solution_outline: 'AI Solution Outline',
    checklist: 'AI Actionable Checklist',
    estimate_time: 'AI Effort & Completion Time Estimate',
    study_plan: 'AI Suggested Study Plan',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#1E293B] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 my-8 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-purple-50/50 dark:bg-purple-950/20">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold font-heading text-slate-900 dark:text-white">
                {aiData?.action ? actionTitles[aiData.action] || 'AI Assistant' : 'AI Assistant'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {assignment.title} ({assignment.subject})
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

        {/* Modal Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center text-center">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-purple-600 border-t-transparent mb-4" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                Synthesizing AI Response...
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Analyzing assignment details with Gemini / Groq engine.
              </p>
            </div>
          ) : aiData ? (
            <div className="space-y-4">
              {/* Main Result Text */}
              {aiData.result && (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap font-sans">
                  {aiData.result}
                </div>
              )}

              {/* Action: Checklist View */}
              {aiData.action === 'checklist' && aiData.checklist && (
                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <CheckSquare size={16} className="text-purple-500" />
                    Interactive Sub-task Checklist
                  </h4>
                  <div className="space-y-2">
                    {aiData.checklist.map((item, idx) => {
                      const isChecked = !!completedChecklist[idx];
                      return (
                        <div
                          key={idx}
                          onClick={() => handleChecklistToggle(idx)}
                          className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                            isChecked
                              ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800 text-slate-400 dark:text-slate-500 line-through'
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-purple-300 dark:hover:border-purple-800'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            className="h-4 w-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                          />
                          <span className="text-xs sm:text-sm font-medium">{item}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Action: Study Plan View */}
              {aiData.action === 'study_plan' && aiData.study_plan && (
                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <CalendarDays size={16} className="text-purple-500" />
                    Day-by-Day Milestone Roadmap
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {aiData.study_plan.map((step, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-purple-50/40 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/40"
                      >
                        <span className="text-xs font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider">
                          {step.day}
                        </span>
                        <p className="mt-1 text-xs text-slate-700 dark:text-slate-300 leading-normal">
                          {step.task}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-500 dark:text-slate-400 text-sm">
              No AI results generated yet. Select an AI tool from the options.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#0E2A6D] text-white hover:bg-[#0E2A6D]/90 transition-colors shadow-xs"
          >
            Close AI Insights
          </button>
        </div>
      </div>
    </div>
  );
};
