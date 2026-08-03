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
      <div className="bg-[#FFFFFF] dark:bg-[#181818] p-6 rounded-[12px] border border-[#D1D5DB] dark:border-[#3F3F46] shadow-xs animate-pulse space-y-3">
        <div className="h-6 w-36 bg-[#F8FAFC] dark:bg-[#111111] rounded-[6px]" />
        <div className="h-16 bg-[#F8FAFC] dark:bg-[#111111] rounded-[10px]" />
        <div className="h-16 bg-[#F8FAFC] dark:bg-[#111111] rounded-[10px]" />
      </div>
    );
  }

  if (!suggestions || suggestions.length === 0) return null;

  return (
    <div className="bg-[#FFFFFF] dark:bg-[#181818] p-6 rounded-[12px] border border-[#D1D5DB] dark:border-[#3F3F46] shadow-xs space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-[10px] bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] flex items-center justify-center shrink-0">
          <Sparkles size={20} />
        </div>
        <div>
          <h3 className="text-[18px] font-bold text-[#111827] dark:text-[#FAFAFA]">
            Smart AI Study Suggestions
          </h3>
          <p className="text-[12px] text-[#6B7280] dark:text-[#A3A3A3]">
            Real-time recommendations based on your attendance, upcoming deadlines, and quiz performance
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {suggestions.map((sug) => (
          <div
            key={sug.id}
            className="flex flex-col justify-between p-5 rounded-[12px] bg-[#FFFFFF] dark:bg-[#181818] border border-[#D1D5DB] dark:border-[#3F3F46] hover:bg-[#F9FAFB] dark:hover:bg-[#232323] transition-all space-y-3"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Brain size={16} />
                  <span className="text-[14px] font-bold text-[#111827] dark:text-[#FAFAFA]">
                    {sug.title}
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded-[6px] text-[12px] font-medium bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA]">
                  {sug.priority} Priority
                </span>
              </div>
              <p className="text-[14px] text-[#4B5563] dark:text-[#D4D4D4] leading-relaxed">
                {sug.description}
              </p>
            </div>

            <div className="pt-3 border-t border-[#E5E7EB] dark:border-[#2A2A2A] flex items-center justify-between text-[14px]">
              <span className="text-[#6B7280] dark:text-[#A3A3A3]">
                Subject: <strong className="text-[#111827] dark:text-[#FAFAFA]">{sug.subject_name}</strong>
              </span>

              {sug.module_link && (
                <button
                  onClick={() => navigate(sug.module_link!)}
                  className="h-8 px-3 rounded-[6px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#181818] text-[#111827] dark:text-[#FAFAFA] text-[12px] font-medium hover:bg-[#F9FAFB] dark:hover:bg-[#232323] transition flex items-center gap-1 cursor-pointer"
                >
                  <span>{sug.action_label}</span>
                  <ArrowRight size={13} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
