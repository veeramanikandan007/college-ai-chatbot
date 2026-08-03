import React, { useState } from 'react';
import {
  Brain,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import type { AiInsightItem } from '../../api/studentAnalytics';
import { useNavigate } from 'react-router-dom';

interface Props {
  insights: AiInsightItem[];
  loading: boolean;
  onRefresh?: () => void;
}

const InsightCard: React.FC<{ insight: AiInsightItem }> = ({ insight }) => {
  const navigate = useNavigate();

  return (
    <div className="p-4 sm:p-5 rounded-[16px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#18181B] shadow-xs flex flex-col justify-between space-y-3 h-full transition-all duration-150 hover:-translate-y-[2px] select-none">
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <span className="h-[22px] inline-flex items-center rounded-full border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#F8FAFC] dark:bg-[#111111] px-2.5 text-[11px] font-[600] text-[#111827] dark:text-[#FAFAFA] uppercase tracking-wider">
            {insight.type === 'warning' ? 'Action Required' : insight.type === 'success' ? 'On Track' : 'AI Recommendation'}
          </span>
          {insight.subject && (
            <span className="text-[12px] font-[500] text-[#6B7280] dark:text-[#A1A1AA]">
              {insight.subject}
            </span>
          )}
        </div>

        <h4 className="text-[18px] font-[600] text-[#111827] dark:text-[#FAFAFA] leading-snug">
          {insight.title}
        </h4>
        <p className="text-[14px] font-[400] text-[#6B7280] dark:text-[#A1A1AA] leading-relaxed">
          {insight.message}
        </p>
      </div>

      {insight.action_url && insight.action_label && (
        <div className="pt-3 border-t border-[#E5E7EB] dark:border-[#2A2A2A] flex items-center justify-between text-[14px] font-[500] text-[#111827] dark:text-[#FAFAFA]">
          <span className="text-[#6B7280] dark:text-[#A1A1AA] font-[400]">Personalized Insight</span>
          <button
            onClick={() => navigate(insight.action_url!)}
            className="flex items-center gap-1 cursor-pointer hover:underline text-[#111827] dark:text-[#FAFAFA] font-[600]"
          >
            <span>{insight.action_label}</span>
            <ArrowRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
};

export const AiInsightsFeed: React.FC<Props> = ({ insights, loading, onRefresh }) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  if (loading) {
    return (
      <div className="h-[80px] rounded-[16px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#F8FAFC] dark:bg-[#111111] animate-pulse" />
    );
  }

  if (insights.length === 0) return null;

  return (
    <div className="rounded-[16px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#18181B] shadow-xs overflow-hidden transition-all select-none">
      {/* Header Bar */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-3.5 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 cursor-pointer hover:bg-[#F8FAFC] dark:hover:bg-[#232323] transition-colors"
      >
        <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
          <div className="w-[38px] h-[38px] sm:w-[40px] sm:h-[40px] rounded-[10px] bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
            <Brain size={20} />
          </div>
          <div className="min-w-0 flex-1 space-y-0.5">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <h3 className="text-[16px] sm:text-[17px] font-[600] text-[#111827] dark:text-[#FAFAFA] leading-snug">
                AI Recommendations
              </h3>
              <span className="h-[20px] inline-flex items-center rounded-full border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#F8FAFC] dark:bg-[#111111] px-2 text-[11px] sm:text-[12px] font-[600] text-[#6B7280] dark:text-[#A1A1AA] whitespace-nowrap shrink-0">
                {insights.length} hints
              </span>
            </div>
            <p className="text-[12px] sm:text-[13px] font-[400] text-[#6B7280] dark:text-[#A1A1AA] leading-tight sm:leading-normal">
              Adaptive telemetry insights calculated from student activity, attendance & quiz metrics
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 shrink-0 self-end sm:self-center pt-2 sm:pt-0 border-t sm:border-t-0 border-[#E5E7EB] dark:border-[#27272A] w-full sm:w-auto">
          {onRefresh && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRefresh();
              }}
              className="h-8 px-2.5 sm:w-8 rounded-[8px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#18181B] text-[#111827] dark:text-[#FAFAFA] flex items-center justify-center shrink-0 text-[12px] gap-1 font-[600]"
              title="Refresh Insights"
            >
              <RefreshCw size={14} />
              <span className="sm:hidden">Refresh</span>
            </button>
          )}
          <button className="h-8 w-8 rounded-[8px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#18181B] text-[#111827] dark:text-[#FAFAFA] flex items-center justify-center shrink-0">
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* Collapsible Content */}
      {isExpanded && (
        <div className="p-4 sm:p-5 border-t border-[#D1D5DB] dark:border-[#3F3F46] bg-[#F8FAFC]/50 dark:bg-[#111111]/50 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.map((item, idx) => (
              <InsightCard key={idx} insight={item} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

