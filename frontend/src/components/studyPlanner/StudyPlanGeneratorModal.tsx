import React, { useState } from 'react';
import { X, Sparkles, CalendarDays, Clock3, Target, BookOpen, CheckCircle2, CircleAlert } from 'lucide-react';
import { generateStudyPlan } from '../../api/studyPlanner';
import { useToast } from '../../context/ToastContext';

interface StudyPlanGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const StudyPlanGeneratorModal: React.FC<StudyPlanGeneratorModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { showToast } = useToast();

  const availableSubjectsList = [
    'Computer Networks',
    'Database Management Systems',
    'Operating Systems',
    'Data Structures & Algorithms',
    'Machine Learning',
    'Theory of Computation',
  ];

  const [title, setTitle] = useState<string>('Semester 5 End Semester Examination Master Plan');
  const [examName, setExamName] = useState<string>('Anna University Nov/Dec 2024 Examinations');
  const [examDate, setExamDate] = useState<string>(
    new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]
  );
  const [hoursPerDay, setHoursPerDay] = useState<number>(4.5);
  const [preferredTime, setPreferredTime] = useState<string>('Evening');
  const [targetScore, setTargetScore] = useState<number>(90);
  const [weakSubjects, setWeakSubjects] = useState<string[]>(['Computer Networks', 'Database Management Systems']);
  const [strongSubjects, setStrongSubjects] = useState<string[]>(['Operating Systems', 'Data Structures & Algorithms']);

  const [generating, setGenerating] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleWeakSubject = (subj: string) => {
    if (weakSubjects.includes(subj)) {
      setWeakSubjects(weakSubjects.filter((s) => s !== subj));
    } else {
      setWeakSubjects([...weakSubjects, subj]);
      setStrongSubjects(strongSubjects.filter((s) => s !== subj));
    }
  };

  const toggleStrongSubject = (subj: string) => {
    if (strongSubjects.includes(subj)) {
      setStrongSubjects(strongSubjects.filter((s) => s !== subj));
    } else {
      setStrongSubjects([...strongSubjects, subj]);
      setWeakSubjects(weakSubjects.filter((s) => s !== subj));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    setErrorMsg(null);

    try {
      await generateStudyPlan({
        title,
        exam_name: examName,
        exam_date: examDate,
        available_hours_per_day: hoursPerDay,
        preferred_study_time: preferredTime,
        target_score_percentage: targetScore,
        weak_subjects: weakSubjects,
        strong_subjects: strongSubjects,
      });

      showToast('New AI Study Plan generated successfully!', 'success');
      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Plan generation failed');
    } finally {
      setGenerating(false);
    }
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
                Generate Personalized AI Study Plan
              </h2>
              <p className="text-[12px] text-[#6B7280] dark:text-[#A3A3A3]">
                AI analyzes your exam schedule, weak subjects, and available hours to synthesize a daily study roadmap.
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA] text-[12px] font-medium flex items-center gap-2">
              <CircleAlert size={16} />
              {errorMsg}
            </div>
          )}

          {/* Plan Title & Exam Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-medium uppercase tracking-wider text-[#6B7280] dark:text-[#A3A3A3] mb-1">
                Plan Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Sem 5 Exam Plan"
                className="w-full h-10 px-3.5 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#181818] text-[#111827] dark:text-[#FAFAFA] text-[14px] outline-none"
              />
            </div>

            <div>
              <label className="block text-[12px] font-medium uppercase tracking-wider text-[#6B7280] dark:text-[#A3A3A3] mb-1">
                Examination Name *
              </label>
              <input
                type="text"
                required
                value={examName}
                onChange={(e) => setExamName(e.target.value)}
                placeholder="e.g. End Semester Exams 2024"
                className="w-full h-10 px-3.5 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#181818] text-[#111827] dark:text-[#FAFAFA] text-[14px] outline-none"
              />
            </div>
          </div>

          {/* Exam Date & Preferred Study Window */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[12px] font-medium uppercase tracking-wider text-[#6B7280] dark:text-[#A3A3A3] mb-1">
                Target Exam Date *
              </label>
              <input
                type="date"
                required
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="w-full h-10 px-3.5 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#181818] text-[#111827] dark:text-[#FAFAFA] text-[14px] outline-none cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-[12px] font-medium uppercase tracking-wider text-[#6B7280] dark:text-[#A3A3A3] mb-1">
                Daily Study Hours ({hoursPerDay}h)
              </label>
              <input
                type="range"
                min="1.0"
                max="12.0"
                step="0.5"
                value={hoursPerDay}
                onChange={(e) => setHoursPerDay(Number(e.target.value))}
                className="w-full mt-2 accent-[#111827] dark:accent-[#FAFAFA]"
              />
            </div>

            <div>
              <label className="block text-[12px] font-medium uppercase tracking-wider text-[#6B7280] dark:text-[#A3A3A3] mb-1">
                Preferred Study Time
              </label>
              <select
                value={preferredTime}
                onChange={(e) => setPreferredTime(e.target.value)}
                className="w-full h-10 px-3.5 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#181818] text-[#111827] dark:text-[#FAFAFA] text-[14px] outline-none cursor-pointer"
              >
                <option value="Morning">Morning (6 AM - 12 PM)</option>
                <option value="Afternoon">Afternoon (12 PM - 5 PM)</option>
                <option value="Evening">Evening (5 PM - 9 PM)</option>
                <option value="Night">Night (9 PM - 1 AM)</option>
              </select>
            </div>
          </div>

          {/* Subjects Selection */}
          <div className="space-y-2">
            <label className="block text-[12px] font-medium uppercase tracking-wider text-[#6B7280] dark:text-[#A3A3A3]">
              Weak Subjects (AI Prioritized)
            </label>
            <div className="flex flex-wrap gap-2">
              {availableSubjectsList.map((s) => {
                const isWeak = weakSubjects.includes(s);
                return (
                  <button
                    type="button"
                    key={s}
                    onClick={() => toggleWeakSubject(s)}
                    className={`h-9 px-3.5 rounded-[8px] text-[12px] font-medium transition cursor-pointer ${
                      isWeak
                        ? 'bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111]'
                        : 'border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#181818] text-[#111827] dark:text-[#FAFAFA]'
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E5E7EB] dark:border-[#2A2A2A]">
            <button
              type="button"
              onClick={onClose}
              className="h-10 px-5 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] text-[#111827] dark:text-[#FAFAFA] text-[14px] font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={generating}
              className="h-10 px-6 rounded-[10px] bg-[#111827] hover:bg-[#000000] dark:bg-[#FAFAFA] dark:hover:bg-[#E5E5E5] text-[#FFFFFF] dark:text-[#111111] font-medium text-[14px] shadow-xs cursor-pointer disabled:opacity-50 inline-flex items-center gap-2"
            >
              <Sparkles size={16} />
              <span>{generating ? 'Synthesizing Plan...' : 'Generate AI Study Plan'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
