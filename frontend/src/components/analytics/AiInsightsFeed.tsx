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

const insightConfig = {
  warning: {
    icon: <AlertTriangle size={16} />,
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    border: 'border-amber-200 dark:border-amber-800',
    iconBg: 'bg-amber-100 dark:bg-amber-900/40',
    iconColor: 'text-amber-600 dark:text-amber-400',
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    badgeLabel: 'Action Required',
  },
  tip: {
    icon: <Lightbulb size={16} />,
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-200 dark:border-blue-800',
    iconBg: 'bg-blue-100 dark:bg-blue-900/40',
    iconColor: 'text-blue-600 dark:text-blue-400',
    badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    badgeLabel: 'AI Tip',
  },
  success: {
    icon: <CheckCircle2 size={16} />,
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    border: 'border-emerald-200 dark:border-emerald-800',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/40',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    badgeLabel: 'On Track',
  },
  info: {
    icon: <Info size={16} />,
    bg: 'bg-slate-50 dark:bg-slate-800/50',
    border: 'border-slate-200 dark:border-slate-700',
    iconBg: 'bg-slate-100 dark:bg-slate-700',
    iconColor: 'text-slate-600 dark:text-slate-400',
    badge: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
    badgeLabel: 'Insight',
  },
};

const InsightCard: React.FC<{ insight: AiInsightItem }> = ({ insight }) => {
  const navigate = useNavigate();
  const config = insightConfig[insight.type] || insightConfig.info;

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-xl border ${config.bg} ${config.border} hover:shadow-sm transition-all duration-200`}
    >
      <div className={`flex-shrink-0 p-2 rounded-lg ${config.iconBg} ${config.iconColor} mt-0.5`}>
        {config.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span className="text-sm font-bold text-slate-900 dark:text-white">{insight.title}</span>
          <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${config.badge}`}>
            {config.badgeLabel}
          </span>
          {insight.subject && (
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700/50 px-2 py-0.5 rounded-full">
              {insight.subject}
            </span>
          )}
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{insight.message}</p>
        {insight.action_url && insight.action_label && (
          <button
            onClick={() => navigate(insight.action_url!)}
            className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#1E4DB7] dark:text-[#60A5FA] hover:underline"
          >
            {insight.action_label}
            <ChevronRight size={12} />
          </button>
        )}
      </div>
    </div>
  );
};

export const AiInsightsFeed: React.FC<Props> = ({ insights, loading, onRefresh }) => {
  const [expanded, setExpanded] = useState(false);
  const displayed = expanded ? insights : insights.slice(0, 4);

  return (
    <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400">
            <Brain size={18} />
          </div>
          <div>
            <h2 className="text-sm font-bold font-heading text-slate-900 dark:text-white">AI Personalized Insights</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {loading ? 'Generating insights...' : `${insights.length} insights generated`}
            </p>
          </div>
        </div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={loading}
            className="btn-icon hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50"
            title="Refresh AI Insights"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
        )}
      </div>

      <div className="p-5 space-y-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse flex items-start gap-3 p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <div className="h-8 w-8 rounded-lg bg-slate-200 dark:bg-slate-700 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-40 rounded bg-slate-200 dark:bg-slate-700" />
                <div className="h-3 w-full rounded bg-slate-200 dark:bg-slate-700" />
                <div className="h-3 w-3/4 rounded bg-slate-200 dark:bg-slate-700" />
              </div>
            </div>
          ))
        ) : insights.length === 0 ? (
          <div className="text-center py-8 text-slate-400 dark:text-slate-500">
            <Brain size={32} className="mx-auto mb-2 opacity-40" />
            <p className="text-sm font-medium">No insights available yet.</p>
            <p className="text-xs mt-1">Complete more activities to receive personalized insights.</p>
          </div>
        ) : (
          displayed.map((insight, idx) => <InsightCard key={idx} insight={insight} />)
        )}

        {!loading && insights.length > 4 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full text-xs font-semibold text-[#1E4DB7] dark:text-[#60A5FA] hover:underline py-2"
          >
            {expanded ? 'Show fewer insights' : `Show ${insights.length - 4} more insights`}
          </button>
        )}
      </div>
    </div>
  );
};
