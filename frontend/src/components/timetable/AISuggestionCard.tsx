import React from 'react';
import { Lightbulb, Sparkles } from 'lucide-react';
import { TimetableItem } from './types';

interface Props {
  ongoingClass: TimetableItem | null;
  nextClass: TimetableItem | null;
}

export default function AISuggestionCard({ ongoingClass, nextClass }: Props) {
  // Simple insight generation based on schedule
  const generateInsight = () => {
    if (!ongoingClass && !nextClass) {
      return {
        insight: "You have no more classes today.",
        suggestions: [
          "Review notes from today's lectures.",
          "Start working on pending assignments.",
          "Rest and recharge for tomorrow."
        ]
      };
    }
    if (!ongoingClass && nextClass) {
      return {
        insight: `You have some free time before ${nextClass.subject_name}.`,
        suggestions: [
          `Review material for ${nextClass.subject_name}.`,
          "Grab a quick coffee or snack.",
          "Check notifications for any upcoming deadlines."
        ]
      };
    }
    if (ongoingClass && nextClass) {
      return {
        insight: `You have ${nextClass.subject_name} right after this class.`,
        suggestions: [
          "Make sure to save your current notes.",
          `Check the syllabus for ${nextClass.subject_name}.`,
          "Head to the next room immediately after."
        ]
      };
    }
    return {
      insight: "You're in your last class of the day.",
      suggestions: [
        "Focus on the lecture content.",
        "Prepare questions for the faculty.",
        "Plan your evening study session."
      ]
    };
  };

  const { insight, suggestions } = generateInsight();

  return (
    <div className="p-6 rounded-[16px] bg-[#FFFFFF] dark:bg-[#181818] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-[0_2px_8px_rgba(0,0,0,0.05)] hover:-translate-y-[2px] transition-transform duration-200">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-full bg-[#F3F4F6] dark:bg-[#2A2A2A] flex items-center justify-center">
          <Lightbulb size={16} className="text-[#111827] dark:text-[#FAFAFA]" />
        </div>
        <h3 className="font-bold text-[16px] text-[#111827] dark:text-[#FAFAFA] flex items-center gap-1.5">
          AI Insight <Sparkles size={14} className="text-[#6B7280]" />
        </h3>
      </div>

      <p className="text-[14px] font-medium leading-relaxed mb-4 text-[#111827] dark:text-[#FAFAFA]">
        "{insight}"
      </p>

      <ul className="space-y-2">
        {suggestions.map((s, i) => (
          <li key={i} className="flex items-start gap-2 text-[13px] text-[#6B7280] dark:text-[#A3A3A3]">
            <span className="text-[#111827] dark:text-[#FAFAFA] mt-0.5">•</span>
            <span>{s}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
