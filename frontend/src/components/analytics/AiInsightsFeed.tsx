import React, { useState } from 'react';
import {
  Brain,
  TrendingDown,
  TrendingUp,
  Activity,
  BookOpen,
  Target,
  RefreshCw,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  Info,
  Lightbulb,
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
    <div className="p-5 rounded-[12px] bg-[#FFFFFF] dark:bg-[#181818] border border-[#D1D5DB] dark:border-[#3F3F46] shadow-xs flex flex-col justify-between space-y-3">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Brain size={16} />
            <span className="text-[14px] font-bold text-[#111827] dark:text-[#FAFAFA]">{insight.title}</span>
          </div>
          <span className="px-2.5 py-0.5 rounded-[6px] text-[12px] font-medium bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA]">
            {insight.type === 'warning' ? 'Action Required' : insight.type === 'success' ? 'On Track' : 'AI Insight'}
          </span>
        </div>
        <p className="text-[14px] text-[#4B5563] dark:text-[#D4D4D4] leading-relaxed">{insight.message}</p>
      </div>

      {insight.action_url && insight.action_label && (
        <div className="pt-3 border-t border-[#E5E7EB] dark:border-[#2A2A2A] flex justify-end">
          <button
            onClick={() => navigate(insight.action_url!)}
            className="h-8 px-3 rounded-[6px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#181818] text-[#111827] dark:text-[#FAFAFA] text-[12px] font-medium hover:bg-[#F9FAFB] dark:hover:bg-[#232323] transition flex items-center gap-1 cursor-pointer"
          >
            <span>{insight.action_label}</span>
            <ChevronRight size={13} />
          </button>
        </div>
      )}
    </div>
  );
};

export const AiInsightsFeed: React.FC<Props> = ({ insights, loading, onRefresh }) => {
  const [expanded, setExpanded] = useState(false);
  const displayed = expanded ? insights : insights.slice(0, 4);

  return (
    <div className="bg-[#FFFFFF] dark:bg-[#181818] p-6 rounded-[12px] border border-[#D1D5DB] dark:border-[#3F3F46] shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-4 border-b border-[#F3F4F6] dark:border-[#2A2A2A]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[10px] bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] flex items-center justify-center shrink-0">
            <Brain size={20} />
          </div>
          <div>
            <h2 className="text-[18px] font-bold text-[#111827] dark:text-[#FAFAFA]">AI Personalized Insights</h2>
            <p className="text-[12px] text-[#6B7280] dark:text-[#A3A3A3]">
              {loading ? 'Generating insights...' : `${insights.length} insights generated`}
            </p>
          </div>
        </div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={loading}
            className="h-9 w-9 rounded-[8px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#181818] text-[#111827] dark:text-[#FAFAFA] hover:bg-[#F9FAFB] dark:hover:bg-[#232323] flex items-center justify-center cursor-pointer disabled:opacity-50"
            title="Refresh AI Insights"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        )}
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#111827] dark:border-[#FAFAFA] border-t-transparent mb-3" />
            <p className="text-[14px] font-medium text-[#6B7280] dark:text-[#A3A3A3]">Loading AI Insights...</p>
          </div>
        ) : insights.length === 0 ? (
          <div className="py-12 text-center text-[#6B7280] dark:text-[#A3A3A3] text-[14px]">
            No insights available yet. Complete more activities to receive personalized insights.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayed.map((insight, idx) => (
              <InsightCard key={idx} insight={insight} />
            ))}
          </div>
        )}

        {!loading && insights.length > 4 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full h-10 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] text-[#111827] dark:text-[#FAFAFA] text-[14px] font-medium hover:bg-[#F9FAFB] dark:hover:bg-[#232323] transition cursor-pointer"
          >
            {expanded ? 'Show fewer insights' : `Show ${insights.length - 4} more insights`}
          </button>
        )}
      </div>
    </div>
  );
};
