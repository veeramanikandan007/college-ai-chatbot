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
    <div className="space-y-6 font-body">
      {/* ── Top Bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#1E293B] p-5 rounded-2xl border border-[#E2E8F0] dark:border-[#334155] shadow-xs">
        <div>
          <h3 className="font-heading font-bold text-card text-[#1F2937] dark:text-[#F8FAFC]">Course Quizzes</h3>
          <p className="text-small text-[#64748B] dark:text-[#94A3B8]">Create online quizzes, control publishing, and inspect student performance scores.</p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="h-10 px-4 rounded-xl bg-[#0E2A6D] hover:bg-[#153B8A] text-white text-caption font-bold flex items-center gap-2 transition shrink-0"
        >
          <Plus size={18} /> Create Quiz
        </button>
      </div>

      {/* ── Quizzes Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {quizzes.map((q) => (
          <div
            key={q.id}
            className="bg-white dark:bg-[#1E293B] p-5 rounded-2xl border border-[#E2E8F0] dark:border-[#334155] shadow-xs flex flex-col justify-between space-y-4 hover:border-[#1E4DB7]/40 transition"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className={`text-caption font-bold uppercase px-2.5 py-0.5 rounded ${
                  q.is_published ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-slate-100 text-[#64748B]'
                }`}>
                  {q.is_published ? 'Published' : 'Draft'}
                </span>
                <button onClick={() => handleDeleteQuiz(q.id)} className="p-1 text-[#64748B] hover:text-rose-600 rounded">
                  <Trash2 size={16} />
                </button>
              </div>

              <h4 className="font-heading font-bold text-card text-[#1F2937] dark:text-[#F8FAFC]">{q.title}</h4>
              <p className="text-caption text-[#64748B] dark:text-[#94A3B8]">
                {q.subject_code} · Sec {q.section} · {q.num_questions} Questions
              </p>
            </div>

            <div className="pt-3 border-t border-[#E2E8F0] dark:border-[#334155] space-y-2">
              <div className="flex items-center justify-between text-caption text-[#64748B]">
                <span>Duration: <strong className="text-[#1F2937] dark:text-[#F8FAFC]">{q.duration_minutes} mins</strong></span>
                <span>Total Marks: <strong className="text-[#1F2937] dark:text-[#F8FAFC]">{q.total_marks}</strong></span>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => handleTogglePublish(q.id)}
                  className={`flex-1 h-9 rounded-xl text-caption font-bold flex items-center justify-center gap-1 transition ${
                    q.is_published
                      ? 'bg-amber-500/10 text-amber-600 hover:bg-amber-500/20'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700'
                  }`}
                >
                  <Play size={14} /> {q.is_published ? 'Unpublish' : 'Publish'}
                </button>
                <button
                  onClick={() => handleViewScores(q)}
                  className="h-9 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F5F7FB] dark:bg-[#0F172A] text-caption font-bold text-[#0E2A6D] dark:text-[#60A5FA] flex items-center gap-1"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-[#1E293B] rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-[#E2E8F0] dark:border-[#334155]">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#334155] pb-3">
              <h3 className="font-heading font-bold text-card text-[#1F2937] dark:text-[#F8FAFC]">Create Quiz</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-[#64748B] hover:text-[#1F2937]">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateQuiz} className="space-y-3">
              <div>
                <label className="text-caption font-bold text-[#64748B]">Quiz Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Database Systems Unit 2 Quiz"
                  required
                  className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F5F7FB] dark:bg-[#0F172A] text-body text-[#1F2937] dark:text-[#F8FAFC] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-caption font-bold text-[#64748B]">Subject Code</label>
                  <input
                    type="text"
                    value={subjectCode}
                    onChange={(e) => setSubjectCode(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F5F7FB] dark:bg-[#0F172A] text-body text-[#1F2937] dark:text-[#F8FAFC] outline-none"
                  />
                </div>
                <div>
                  <label className="text-caption font-bold text-[#64748B]">Section</label>
                  <input
                    type="text"
                    value={section}
                    onChange={(e) => setSection(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F5F7FB] dark:bg-[#0F172A] text-body text-[#1F2937] dark:text-[#F8FAFC] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-caption font-bold text-[#64748B]">Questions</label>
                  <input
                    type="number"
                    value={numQuestions}
                    onChange={(e) => setNumQuestions(Number(e.target.value))}
                    className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F5F7FB] dark:bg-[#0F172A] text-body text-[#1F2937] dark:text-[#F8FAFC] outline-none"
                  />
                </div>
                <div>
                  <label className="text-caption font-bold text-[#64748B]">Duration (Mins)</label>
                  <input
                    type="number"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F5F7FB] dark:bg-[#0F172A] text-body text-[#1F2937] dark:text-[#F8FAFC] outline-none"
                  />
                </div>
                <div>
                  <label className="text-caption font-bold text-[#64748B]">Total Marks</label>
                  <input
                    type="number"
                    value={totalMarks}
                    onChange={(e) => setTotalMarks(Number(e.target.value))}
                    className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F5F7FB] dark:bg-[#0F172A] text-body text-[#1F2937] dark:text-[#F8FAFC] outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="h-10 px-4 rounded-xl border border-[#E2E8F0] dark:border-[#334155] text-caption font-bold text-[#64748B]"
                >
                  Cancel
                </button>
                <button type="submit" className="h-10 px-4 rounded-xl bg-[#0E2A6D] text-white text-caption font-bold">
                  Create Quiz
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── View Scores Modal ── */}
      {showScoresModal && selectedQuiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-[#1E293B] rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-xl border border-[#E2E8F0] dark:border-[#334155]">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#334155] pb-3">
              <div>
                <h3 className="font-heading font-bold text-card text-[#1F2937] dark:text-[#F8FAFC]">
                  Student Performance Scores: {selectedQuiz.title}
                </h3>
                <p className="text-caption text-[#64748B]">{selectedQuiz.subject_code} · Sec {selectedQuiz.section}</p>
              </div>
              <button onClick={() => setShowScoresModal(false)} className="text-[#64748B] hover:text-[#1F2937]">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto">
              {quizScores.length === 0 ? (
                <p className="py-8 text-center text-caption text-[#64748B]">No student attempts recorded yet.</p>
              ) : (
                quizScores.map((sc) => (
                  <div key={sc.id} className="p-3 rounded-xl bg-[#F5F7FB] dark:bg-[#0F172A] flex items-center justify-between text-body">
                    <span className="font-heading font-bold text-[#1F2937] dark:text-[#F8FAFC]">{sc.student_name}</span>
                    <span className="font-heading font-bold text-emerald-600 dark:text-emerald-400">
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
