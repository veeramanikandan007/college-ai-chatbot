import React, { useState } from 'react';
import { X, Sparkles, Brain, Target, Clock3, CircleAlert, CheckCircle2 } from 'lucide-react';
import { startMockInterview, MockInterview } from '../../api/mockInterviews';
import { useToast } from '../../context/ToastContext';

interface MockInterviewSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartSession: (session: MockInterview) => void;
}

export const MockInterviewSetupModal: React.FC<MockInterviewSetupModalProps> = ({
  isOpen,
  onClose,
  onStartSession,
}) => {
  const { showToast } = useToast();

  const [title, setTitle] = useState<string>('Technical Software Engineer Mock Interview');
  const [interviewType, setInterviewType] = useState<string>('Technical');
  const [targetRole, setTargetRole] = useState<string>('Full Stack Software Engineer');
  const [difficulty, setDifficulty] = useState<string>('Medium');
  const [durationMinutes, setDurationMinutes] = useState<number>(20);

  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const session = await startMockInterview({
        title,
        interview_type: interviewType,
        target_role: targetRole,
        difficulty,
        duration_minutes: durationMinutes,
      });

      showToast('AI Mock Interview session created! Ready to begin.', 'success');
      onStartSession(session);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to start interview');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white dark:bg-[#1E293B] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 my-8 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-[#0E2A6D]/5 dark:bg-[#60A5FA]/10">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#0E2A6D] text-white dark:bg-[#60A5FA] dark:text-slate-950">
              <Brain size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold font-heading text-slate-900 dark:text-white">
                Start AI Mock Interview
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Configure your interview domain, difficulty, and duration
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

          {/* Session Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
              Interview Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Technical React Developer Interview"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#0E2A6D] dark:focus:ring-[#60A5FA]"
            />
          </div>

          {/* Interview Type & Target Role */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                Interview Category *
              </label>
              <select
                value={interviewType}
                onChange={(e) => setInterviewType(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#0E2A6D] dark:focus:ring-[#60A5FA]"
              >
                <option value="HR">HR Interview</option>
                <option value="Technical">Technical Interview</option>
                <option value="Coding">Coding Interview</option>
                <option value="Aptitude">Aptitude Interview</option>
                <option value="Group Discussion">Group Discussion Practice</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                Target Job Role *
              </label>
              <input
                type="text"
                required
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g. Software Engineer"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#0E2A6D] dark:focus:ring-[#60A5FA]"
              />
            </div>
          </div>

          {/* Difficulty & Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                Difficulty Level *
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['Easy', 'Medium', 'Hard'].map((diff) => (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => setDifficulty(diff)}
                    className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                      difficulty === diff
                        ? 'bg-[#0E2A6D] text-white dark:bg-[#60A5FA] dark:text-slate-950 border-transparent shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                Session Duration *
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[10, 20, 30].map((dur) => (
                  <button
                    key={dur}
                    type="button"
                    onClick={() => setDurationMinutes(dur)}
                    className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                      durationMinutes === dur
                        ? 'bg-[#0E2A6D] text-white dark:bg-[#60A5FA] dark:text-slate-950 border-transparent shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {dur} min
                  </button>
                ))}
              </div>
            </div>
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
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-[#0E2A6D] text-white hover:bg-[#0E2A6D]/90 disabled:opacity-50 transition-all shadow-xs"
            >
              <Sparkles size={16} />
              <span>{loading ? 'Initializing AI Session...' : 'Start Interview'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
