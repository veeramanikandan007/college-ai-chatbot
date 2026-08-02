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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#1E293B] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 my-8 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-purple-50/50 dark:bg-purple-950/20">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Sparkles size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold font-heading text-slate-900 dark:text-white">
                Generate Personalized AI Study Plan
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                AI analyzes your exam schedule, weak subjects, and available hours to synthesize a daily study roadmap.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
              <CircleAlert size={16} />
              {errorMsg}
            </div>
          )}

          {/* Plan Title & Exam Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                Plan Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Sem 5 Exam Plan"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                Examination Name *
              </label>
              <input
                type="text"
                required
                value={examName}
                onChange={(e) => setExamName(e.target.value)}
                placeholder="e.g. End Semester Exams 2024"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Exam Date & Preferred Study Window */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                Target Exam Date *
              </label>
              <input
                type="date"
                required
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                Daily Study Hours ({hoursPerDay}h)
              </label>
              <input
                type="range"
                min="1.0"
                max="12.0"
                step="0.5"
                value={hoursPerDay}
                onChange={(e) => setHoursPerDay(Number(e.target.value))}
                className="w-full mt-2 accent-purple-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                Preferred Study Time
              </label>
              <select
                value={preferredTime}
                onChange={(e) => setPreferredTime(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="Morning">Morning (6 AM - 12 PM)</option>
                <option value="Afternoon">Afternoon (12 PM - 5 PM)</option>
                <option value="Evening">Evening (5 PM - 9 PM)</option>
                <option value="Night">Night (9 PM - 1 AM)</option>
              </select>
            </div>
          </div>

          {/* Weak Subjects Picker */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
              Select Weak Subjects (AI allocates 50% extra revision time)
            </label>
            <div className="flex flex-wrap gap-2 pt-1">
              {availableSubjectsList.map((subj) => {
                const isSelected = weakSubjects.includes(subj);
                return (
                  <button
                    key={subj}
                    type="button"
                    onClick={() => toggleWeakSubject(subj)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                      isSelected
                        ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-300 dark:border-rose-800'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {subj} {isSelected && '✓'}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Strong Subjects Picker */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
              Select Strong Subjects
            </label>
            <div className="flex flex-wrap gap-2 pt-1">
              {availableSubjectsList.map((subj) => {
                const isSelected = strongSubjects.includes(subj);
                return (
                  <button
                    key={subj}
                    type="button"
                    onClick={() => toggleStrongSubject(subj)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                      isSelected
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {subj} {isSelected && '✓'}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Target Score % */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Target Score Percentage
              </label>
              <span className="text-xs font-bold text-purple-600 dark:text-purple-400">{targetScore}%</span>
            </div>
            <input
              type="range"
              min="60"
              max="100"
              value={targetScore}
              onChange={(e) => setTargetScore(Number(e.target.value))}
              className="w-full accent-purple-600"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={generating}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 transition-all shadow-xs"
            >
              <Sparkles size={16} />
              <span>{generating ? 'Synthesizing AI Plan...' : 'Generate AI Study Schedule'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
