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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl bg-[#FFFFFF] dark:bg-[#181818] rounded-[16px] shadow-lg border border-[#D1D5DB] dark:border-[#3F3F46] my-8 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#F8FAFC] dark:bg-[#111111]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[10px] bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] flex items-center justify-center shrink-0">
              <Brain size={20} />
            </div>
            <div>
              <h2 className="text-[18px] font-bold text-[#111827] dark:text-[#FAFAFA]">
                Start AI Mock Interview
              </h2>
              <p className="text-[12px] text-[#6B7280] dark:text-[#A3A3A3]">
                Configure your interview domain, difficulty, and duration
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

          {/* Session Title */}
          <div>
            <label className="block text-[12px] font-medium uppercase tracking-wider text-[#6B7280] dark:text-[#A3A3A3] mb-1">
              Interview Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Technical React Developer Interview"
              className="w-full h-10 px-3.5 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#181818] text-[#111827] dark:text-[#FAFAFA] text-[14px] outline-none"
            />
          </div>

          {/* Interview Type & Target Role */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-medium uppercase tracking-wider text-[#6B7280] dark:text-[#A3A3A3] mb-1">
                Interview Category *
              </label>
              <select
                value={interviewType}
                onChange={(e) => setInterviewType(e.target.value)}
                className="w-full h-10 px-3.5 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#181818] text-[#111827] dark:text-[#FAFAFA] text-[14px] outline-none cursor-pointer"
              >
                <option value="HR">HR Interview</option>
                <option value="Technical">Technical Interview</option>
                <option value="Coding">Coding Interview</option>
                <option value="Aptitude">Aptitude Interview</option>
                <option value="Group Discussion">Group Discussion Practice</option>
              </select>
            </div>

            <div>
              <label className="block text-[12px] font-medium uppercase tracking-wider text-[#6B7280] dark:text-[#A3A3A3] mb-1">
                Target Job Role *
              </label>
              <input
                type="text"
                required
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g. Software Engineer"
                className="w-full h-10 px-3.5 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#181818] text-[#111827] dark:text-[#FAFAFA] text-[14px] outline-none"
              />
            </div>
          </div>

          {/* Difficulty & Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-medium uppercase tracking-wider text-[#6B7280] dark:text-[#A3A3A3] mb-1">
                Difficulty Level *
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['Easy', 'Medium', 'Hard'].map((diff) => (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => setDifficulty(diff)}
                    className={`h-9 rounded-[8px] text-[12px] font-medium transition cursor-pointer ${
                      difficulty === diff
                        ? 'bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111]'
                        : 'border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#181818] text-[#111827] dark:text-[#FAFAFA]'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-medium uppercase tracking-wider text-[#6B7280] dark:text-[#A3A3A3] mb-1">
                Session Duration *
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[10, 20, 30].map((dur) => (
                  <button
                    key={dur}
                    type="button"
                    onClick={() => setDurationMinutes(dur)}
                    className={`h-9 rounded-[8px] text-[12px] font-medium transition cursor-pointer ${
                      durationMinutes === dur
                        ? 'bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111]'
                        : 'border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#181818] text-[#111827] dark:text-[#FAFAFA]'
                    }`}
                  >
                    {dur} min
                  </button>
                ))}
              </div>
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
              disabled={loading}
              className="h-10 px-6 rounded-[10px] bg-[#111827] hover:bg-[#000000] dark:bg-[#FAFAFA] dark:hover:bg-[#E5E5E5] text-[#FFFFFF] dark:text-[#111111] font-medium text-[14px] shadow-xs cursor-pointer disabled:opacity-50 inline-flex items-center gap-2"
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
