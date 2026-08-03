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
    <div className="p-6 rounded-[16px] bg-gradient-to-br from-[#111827] to-[#1F2937] dark:from-[#181818] dark:to-[#222222] border border-[#374151] dark:border-[#333333] text-white shadow-sm hover:-translate-y-[2px] transition-transform duration-200">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
          <Lightbulb size={16} className="text-[#FBBF24]" />
        </div>
        <h3 className="font-bold text-[16px] flex items-center gap-1.5">
          AI Insight <Sparkles size={14} className="text-[#60A5FA]" />
        </h3>
      </div>

      <p className="text-[14px] font-medium leading-relaxed mb-4 text-[#F3F4F6]">
        "{insight}"
      </p>

      <ul className="space-y-2">
        {suggestions.map((s, i) => (
          <li key={i} className="flex items-start gap-2 text-[13px] text-[#D1D5DB]">
            <span className="text-[#60A5FA] mt-0.5">•</span>
            <span>{s}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
