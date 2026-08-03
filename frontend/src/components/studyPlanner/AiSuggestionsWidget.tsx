import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Brain, ArrowRight } from 'lucide-react';
import { AiSuggestion } from '../../api/studyPlanner';

interface AiSuggestionsWidgetProps {
  suggestions: AiSuggestion[];
  loading: boolean;
}

export const AiSuggestionsWidget: React.FC<AiSuggestionsWidgetProps> = ({
  suggestions,
  loading,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  if (loading) {
    return (
      <div className="h-[80px] rounded-[16px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#F8FAFC] dark:bg-[#111111] animate-pulse" />
    );
  }

  if (suggestions.length === 0) return null;

  return (
    <div className="rounded-[16px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#18181B] shadow-xs overflow-hidden transition-all select-none">
      {/* Header Bar */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-[#F8FAFC] dark:hover:bg-[#232323] transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-[40px] h-[40px] rounded-[10px] bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] flex items-center justify-center shrink-0">
            <Brain size={20} />
          </div>
          <div>
            <h3 className="text-[18px] font-[600] text-[#111827] dark:text-[#FAFAFA] flex items-center gap-2">
              AI Recommendations
              <span className="h-[20px] inline-flex items-center rounded-full border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#F8FAFC] dark:bg-[#111111] px-2.5 text-[12px] font-[500] text-[#6B7280] dark:text-[#A1A1AA]">
                {suggestions.length} hints
              </span>
            </h3>
            <p className="text-[13px] font-[400] text-[#6B7280] dark:text-[#A1A1AA]">
              Adaptive recommendations calculated from exam dates & module progress
            </p>
          </div>
        </div>

        <button className="h-8 w-8 rounded-[8px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#18181B] text-[#111827] dark:text-[#FAFAFA] flex items-center justify-center shrink-0">
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {/* Collapsible Content - Generous Padding & Distinct Background */}
      {isExpanded && (
        <div className="p-4 sm:p-5 border-t border-[#D1D5DB] dark:border-[#3F3F46] bg-[#F8FAFC]/50 dark:bg-[#111111]/50 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {suggestions.map((item, idx) => (
              <div
                key={idx}
                className="p-4 sm:p-5 rounded-[16px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#18181B] shadow-xs flex flex-col justify-between space-y-3 h-full transition-all duration-150 hover:-translate-y-[2px]"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="h-[22px] inline-flex items-center rounded-full border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#F8FAFC] dark:bg-[#111111] px-2.5 text-[11px] font-[600] text-[#111827] dark:text-[#FAFAFA] uppercase tracking-wider">
                      {item.suggestion_type}
                    </span>
                    <span className="text-[12px] font-[500] text-[#6B7280] dark:text-[#A1A1AA]">
                      {item.priority} Priority
                    </span>
                  </div>

                  <h4 className="text-[18px] font-[600] text-[#111827] dark:text-[#FAFAFA] leading-snug">
                    {item.title}
                  </h4>
                  <p className="text-[14px] font-[400] text-[#6B7280] dark:text-[#A1A1AA] leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Bottom Bar with Spacing */}
                <div className="pt-3 border-t border-[#E5E7EB] dark:border-[#2A2A2A] flex items-center justify-between text-[14px] font-[500] text-[#111827] dark:text-[#FAFAFA]">
                  <span className="text-[#6B7280] dark:text-[#A1A1AA] font-[400]">{item.subject_name}</span>
                  <span className="flex items-center gap-1 cursor-pointer hover:underline">
                    {item.action_label || 'Apply Action'} <ArrowRight size={14} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
