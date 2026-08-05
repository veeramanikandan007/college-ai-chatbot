import React, { useState, useEffect } from 'react';
import { Brain, Plus, Trash2, Eye, CheckCircle2, X, Play } from 'lucide-react';
import { facultyApi, FacultyQuiz, FacultyQuizResult } from '../../api/faculty';
import { useToast } from '../../context/ToastContext';

export const FacultyQuizManager: React.FC = () => {
  const { showToast } = useToast();
  const [quizzes, setQuizzes] = useState<FacultyQuiz[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<FacultyQuiz | null>(null);
  const [quizScores, setQuizScores] = useState<FacultyQuizResult[]>([]);
  const [showScoresModal, setShowScoresModal] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [subjectCode, setSubjectCode] = useState('CS8492');
  const [section, setSection] = useState('A');
  const [numQuestions, setNumQuestions] = useState(5);
  const [durationMinutes, setDurationMinutes] = useState(15);
  const [totalMarks, setTotalMarks] = useState(50);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const data = await facultyApi.getQuizzes();
      setQuizzes(data);
    } catch (err) {
      console.error('Error fetching quizzes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      await facultyApi.createQuiz({
        title,
        subject_code: subjectCode,
        section,
        num_questions: numQuestions,
        duration_minutes: durationMinutes,
        total_marks: totalMarks,
      });
      showToast('Quiz created successfully.', 'success');
      setShowCreateModal(false);
      setTitle('');
      fetchQuizzes();
    } catch (err) {
      console.error('Error creating quiz:', err);
      showToast('Failed to create quiz.', 'error');
    }
  };

  const handleTogglePublish = async (id: number) => {
    try {
      const updated = await facultyApi.togglePublishQuiz(id);
      showToast(`Quiz ${updated.is_published ? 'published' : 'unpublished'}.`, 'info');
      fetchQuizzes();
    } catch (err) {
      console.error('Error toggling publish state:', err);
    }
  };

  const handleDeleteQuiz = async (id: number) => {
    if (!window.confirm('Delete this quiz?')) return;
    try {
      await facultyApi.deleteQuiz(id);
      showToast('Quiz deleted.', 'info');
      fetchQuizzes();
    } catch (err) {
      console.error('Error deleting quiz:', err);
    }
  };

  const handleViewScores = async (quiz: FacultyQuiz) => {
    setSelectedQuiz(quiz);
    setShowScoresModal(true);
    try {
      const scores = await facultyApi.getQuizScores(quiz.id);
      setQuizScores(scores);
    } catch (err) {
      console.error('Error fetching quiz scores:', err);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* ── Page Hero Header ── */}
      <div className="bg-[#FFFFFF] dark:bg-[#18181B] p-6 rounded-[16px] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-12 h-12 rounded-[12px] bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] flex items-center justify-center shrink-0">
            <Brain size={24} />
          </div>
          <div className="min-w-0 space-y-1">
            <h1 className="text-[30px] font-semibold text-[#111827] dark:text-[#FAFAFA] tracking-tight leading-tight truncate">
              Course Quizzes
            </h1>
            <p className="text-[15px] font-normal text-[#6B7280] dark:text-[#A1A1AA] truncate">
              Create online quizzes, control publishing, and inspect student performance scores.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="h-[40px] px-5 rounded-[10px] bg-[#111827] hover:bg-[#1F2937] dark:bg-[#FAFAFA] dark:hover:bg-[#E5E5E5] text-[#FFFFFF] dark:text-[#111111] font-medium text-[14px] transition flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <Plus size={18} />
          <span>Create Quiz</span>
        </button>
      </div>

      {/* ── Quizzes Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quizzes.map((q) => (
          <div
            key={q.id}
            className="bg-[#FFFFFF] dark:bg-[#18181B] p-6 rounded-[16px] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs flex flex-col justify-between space-y-4 hover:border-[#111827]/40 dark:hover:border-[#FAFAFA]/40 transition group"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className={`text-[12px] font-normal uppercase px-2.5 py-0.5 rounded-[6px] border border-[#E5E7EB] dark:border-[#2A2A2A] ${
                  q.is_published ? 'bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111]' : 'bg-[#F8FAFC] dark:bg-[#111111] text-[#6B7280] dark:text-[#A1A1AA]'
                }`}>
                  {q.is_published ? 'Published' : 'Draft'}
                </span>
                <button onClick={() => handleDeleteQuiz(q.id)} className="p-1.5 text-[#6B7280] hover:text-rose-600 rounded-[6px] transition cursor-pointer">
                  <Trash2 size={16} />
                </button>
              </div>

              <h4 className="text-[18px] font-semibold text-[#111827] dark:text-[#FAFAFA] leading-snug line-clamp-2">{q.title}</h4>
              <p className="text-[13px] font-normal text-[#6B7280] dark:text-[#A1A1AA]">
                {q.subject_code} · Sec {q.section} · {q.num_questions} Questions
              </p>
            </div>

            <div className="pt-4 border-t border-[#E5E7EB] dark:border-[#2A2A2A] space-y-3">
              <div className="flex items-center justify-between text-[14px] font-normal text-[#6B7280] dark:text-[#A1A1AA]">
                <span>Duration: <strong className="font-semibold text-[#111827] dark:text-[#FAFAFA]">{q.duration_minutes} mins</strong></span>
                <span>Total Marks: <strong className="font-semibold text-[#111827] dark:text-[#FAFAFA]">{q.total_marks}</strong></span>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => handleTogglePublish(q.id)}
                  className={`flex-1 h-[38px] rounded-[10px] text-[14px] font-medium flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    q.is_published
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20'
                      : 'bg-[#111827] text-white dark:bg-[#FAFAFA] dark:text-[#111111]'
                  }`}
                >
                  <Play size={14} /> {q.is_published ? 'Unpublish' : 'Publish'}
                </button>
                <button
                  onClick={() => handleViewScores(q)}
                  className="h-[38px] px-4 rounded-[10px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#F8FAFC] dark:bg-[#111111] hover:bg-[#FFFFFF] dark:hover:bg-[#18181B] text-[14px] font-medium text-[#111827] dark:text-[#FAFAFA] flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Eye size={14} /> Scores
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Create Quiz Modal ── */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4" onClick={() => setShowCreateModal(false)}>
          <div className="w-full max-w-md bg-[#FFFFFF] dark:bg-[#18181B] p-6 rounded-[16px] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-2xl space-y-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB] dark:border-[#2A2A2A]">
              <h3 className="text-[20px] font-semibold text-[#111827] dark:text-[#FAFAFA]">Create Quiz</h3>
              <button onClick={() => setShowCreateModal(false)} className="h-8 w-8 rounded-[8px] border border-[#E5E7EB] dark:border-[#2A2A2A] flex items-center justify-center text-[#111827] dark:text-[#FAFAFA]">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateQuiz} className="space-y-4">
              <div>
                <label className="text-[14px] font-medium text-[#111827] dark:text-[#FAFAFA] block mb-1">Quiz Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Database Systems Unit 2 Quiz"
                  required
                  className="w-full h-[40px] px-3.5 rounded-[10px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#FFFFFF] dark:bg-[#18181B] text-[14px] text-[#111827] dark:text-[#FAFAFA] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[14px] font-medium text-[#111827] dark:text-[#FAFAFA] block mb-1">Subject Code</label>
                  <input
                    type="text"
                    value={subjectCode}
                    onChange={(e) => setSubjectCode(e.target.value)}
                    className="w-full h-[40px] px-3.5 rounded-[10px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#FFFFFF] dark:bg-[#18181B] text-[14px] text-[#111827] dark:text-[#FAFAFA] outline-none"
                  />
                </div>
                <div>
                  <label className="text-[14px] font-medium text-[#111827] dark:text-[#FAFAFA] block mb-1">Section</label>
                  <input
                    type="text"
                    value={section}
                    onChange={(e) => setSection(e.target.value)}
                    className="w-full h-[40px] px-3.5 rounded-[10px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#FFFFFF] dark:bg-[#18181B] text-[14px] text-[#111827] dark:text-[#FAFAFA] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[14px] font-medium text-[#111827] dark:text-[#FAFAFA] block mb-1">Questions</label>
                  <input
                    type="number"
                    value={numQuestions}
                    onChange={(e) => setNumQuestions(Number(e.target.value))}
                    className="w-full h-[40px] px-3.5 rounded-[10px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#FFFFFF] dark:bg-[#18181B] text-[14px] text-[#111827] dark:text-[#FAFAFA] outline-none"
                  />
                </div>
                <div>
                  <label className="text-[14px] font-medium text-[#111827] dark:text-[#FAFAFA] block mb-1">Duration (Mins)</label>
                  <input
                    type="number"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full h-[40px] px-3.5 rounded-[10px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#FFFFFF] dark:bg-[#18181B] text-[14px] text-[#111827] dark:text-[#FAFAFA] outline-none"
                  />
                </div>
                <div>
                  <label className="text-[14px] font-medium text-[#111827] dark:text-[#FAFAFA] block mb-1">Total Marks</label>
                  <input
                    type="number"
                    value={totalMarks}
                    onChange={(e) => setTotalMarks(Number(e.target.value))}
                    className="w-full h-[40px] px-3.5 rounded-[10px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#FFFFFF] dark:bg-[#18181B] text-[14px] text-[#111827] dark:text-[#FAFAFA] outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#E5E7EB] dark:border-[#2A2A2A] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="h-[40px] px-4 rounded-[10px] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[14px] font-medium text-[#111827] dark:text-[#FAFAFA]"
                >
                  Cancel
                </button>
                <button type="submit" className="h-[40px] px-5 rounded-[10px] bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] text-[14px] font-medium cursor-pointer">
                  Create Quiz
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── View Scores Modal ── */}
      {showScoresModal && selectedQuiz && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4" onClick={() => setShowScoresModal(false)}>
          <div className="w-full max-w-xl bg-[#FFFFFF] dark:bg-[#18181B] p-6 rounded-[16px] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-2xl space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB] dark:border-[#2A2A2A]">
              <div>
                <h3 className="text-[20px] font-semibold text-[#111827] dark:text-[#FAFAFA]">
                  Student Performance Scores: {selectedQuiz.title}
                </h3>
                <p className="text-[14px] font-normal text-[#6B7280] dark:text-[#A1A1AA]">{selectedQuiz.subject_code} · Sec {selectedQuiz.section}</p>
              </div>
              <button onClick={() => setShowScoresModal(false)} className="h-8 w-8 rounded-[8px] border border-[#E5E7EB] dark:border-[#2A2A2A] flex items-center justify-center text-[#111827] dark:text-[#FAFAFA]">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto no-scrollbar">
              {quizScores.length === 0 ? (
                <p className="py-8 text-center text-[14px] font-normal text-[#6B7280] dark:text-[#A1A1AA]">No student attempts recorded yet.</p>
              ) : (
                quizScores.map((sc) => (
                  <div key={sc.id} className="p-3.5 rounded-[12px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] flex items-center justify-between">
                    <span className="font-semibold text-[15px] text-[#111827] dark:text-[#FAFAFA]">{sc.student_name}</span>
                    <span className="font-semibold text-[15px] text-emerald-600 dark:text-emerald-400">
                      {sc.score} / {sc.total_marks} ({Math.round((sc.score / sc.total_marks) * 100)}%)
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
