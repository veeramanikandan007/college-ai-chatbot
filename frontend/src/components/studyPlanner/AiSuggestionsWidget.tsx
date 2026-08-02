import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  BookOpen,
  Brain,
  FileText,
  Clock3,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { AiSuggestion } from '../../api/studyPlanner';

interface AiSuggestionsWidgetProps {
  suggestions: AiSuggestion[];
  loading: boolean;
}

export const AiSuggestionsWidget: React.FC<AiSuggestionsWidgetProps> = ({
  suggestions,
  loading,
}) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="bg-white dark:bg-[#1E293B] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs animate-pulse space-y-3">
        <div className="h-6 w-36 bg-slate-200 dark:bg-slate-700 rounded-md" />
        <div className="h-16 bg-slate-100 dark:bg-slate-800 rounded-xl" />
        <div className="h-16 bg-slate-100 dark:bg-slate-800 rounded-xl" />
      </div>
    );
  }

  if (!suggestions || suggestions.length === 0) return null;

  return (
    <div className="bg-white dark:bg-[#1E293B] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
      <div className="flex items-center gap-2">
        <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
          <Sparkles size={20} />
        </div>
        <div>
          <h3 className="text-base font-bold font-heading text-slate-900 dark:text-white">
            Smart AI Study Suggestions
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time recommendations based on your attendance, upcoming deadlines, and quiz performance
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {suggestions.map((sug) => {
          const icon =
            sug.suggestion_type === 'assignment' ? (
              <FileText className="text-amber-500" size={18} />
            ) : sug.suggestion_type === 'attendance' ? (
              <AlertCircle className="text-rose-500" size={18} />
            ) : sug.suggestion_type === 'quiz' ? (
              <Brain className="text-purple-500" size={18} />
            ) : (
              <BookOpen className="text-[#0E2A6D] dark:text-[#60A5FA]" size={18} />
            );

          return (
            <div
              key={sug.id}
              className="group flex flex-col justify-between p-4 rounded-xl bg-slate-50/70 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-800 transition-all"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    {icon}
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {sug.title}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      sug.priority === 'High'
                        ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                        : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                    }`}
                  >
                    {sug.priority} Priority
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {sug.description}
                </p>
              </div>

              <div className="mt-3 pt-2 flex items-center justify-between border-t border-slate-200/60 dark:border-slate-800/60">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  Subject: <strong className="text-slate-700 dark:text-slate-200">{sug.subject_name}</strong>
                </span>

                {sug.module_link && (
                  <button
                    onClick={() => navigate(sug.module_link!)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#0E2A6D] dark:text-[#60A5FA] hover:underline"
                  >
                    <span>{sug.action_label}</span>
                    <ArrowRight size={13} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
