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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#FFFFFF] dark:bg-[#181818] rounded-[16px] shadow-lg border border-[#D1D5DB] dark:border-[#3F3F46] my-8 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#F8FAFC] dark:bg-[#111111]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[10px] bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] flex items-center justify-center shrink-0">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="text-[18px] font-bold text-[#111827] dark:text-[#FAFAFA]">
                {aiData?.action ? actionTitles[aiData.action] || 'AI Assistant' : 'AI Assistant'}
              </h2>
              <p className="text-[12px] text-[#6B7280] dark:text-[#A3A3A3]">
                {assignment.title} ({assignment.subject})
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

        {/* Modal Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center text-center">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#111827] dark:border-[#FAFAFA] border-t-transparent mb-4" />
              <p className="text-[14px] font-bold text-[#111827] dark:text-[#FAFAFA]">
                Synthesizing AI Response...
              </p>
              <p className="text-[12px] text-[#6B7280] dark:text-[#A3A3A3] mt-1">
                Analyzing assignment details with Gemini engine.
              </p>
            </div>
          ) : aiData ? (
            <div className="space-y-4">
              {/* Main Result Text */}
              {aiData.result && (
                <div className="p-4 rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[14px] text-[#4B5563] dark:text-[#D4D4D4] leading-relaxed whitespace-pre-wrap font-sans">
                  {aiData.result}
                </div>
              )}

              {/* Action: Checklist View */}
              {aiData.action === 'checklist' && aiData.checklist && (
                <div className="space-y-2 pt-2">
                  <h4 className="text-[12px] font-bold uppercase tracking-wider text-[#6B7280] dark:text-[#A3A3A3] flex items-center gap-1.5">
                    <CheckSquare size={16} />
                    Interactive Sub-task Checklist
                  </h4>
                  <div className="space-y-2">
                    {aiData.checklist.map((item, idx) => {
                      const isChecked = !!completedChecklist[idx];
                      return (
                        <div
                          key={idx}
                          onClick={() => handleChecklistToggle(idx)}
                          className={`flex items-center gap-3 p-3 rounded-[10px] border transition-all cursor-pointer ${
                            isChecked
                              ? 'bg-[#F8FAFC] dark:bg-[#111111] border-[#E5E7EB] dark:border-[#2A2A2A] text-[#6B7280] dark:text-[#A3A3A3] line-through'
                              : 'bg-[#FFFFFF] dark:bg-[#181818] border-[#D1D5DB] dark:border-[#3F3F46] text-[#111827] dark:text-[#FAFAFA]'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            className="h-4 w-4 rounded border-[#D1D5DB]"
                          />
                          <span className="text-[14px] font-medium">{item}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Action: Study Plan View */}
              {aiData.action === 'study_plan' && aiData.study_plan && (
                <div className="space-y-2 pt-2">
                  <h4 className="text-[12px] font-bold uppercase tracking-wider text-[#6B7280] dark:text-[#A3A3A3] flex items-center gap-1.5">
                    <CalendarDays size={16} />
                    Day-by-Day Milestone Roadmap
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {aiData.study_plan.map((step, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A]"
                      >
                        <span className="text-[12px] font-bold text-[#111827] dark:text-[#FAFAFA] uppercase tracking-wider">
                          {step.day}
                        </span>
                        <p className="mt-1 text-[14px] text-[#4B5563] dark:text-[#D4D4D4] leading-normal">
                          {step.task}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="py-12 text-center text-[#6B7280] dark:text-[#A3A3A3] text-[14px]">
              No AI results generated yet. Select an AI tool from the options.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-4 border-t border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#F8FAFC] dark:bg-[#111111]">
          <button
            onClick={onClose}
            className="h-10 px-5 rounded-[10px] bg-[#111827] hover:bg-[#000000] dark:bg-[#FAFAFA] dark:hover:bg-[#E5E5E5] text-[#FFFFFF] dark:text-[#111111] font-medium text-[14px] shadow-xs cursor-pointer"
          >
            Close AI Insights
          </button>
        </div>
      </div>
    </div>
  );
};
