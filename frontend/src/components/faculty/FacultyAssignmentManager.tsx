import React, { useState, useEffect } from 'react';
import { ClipboardList, Plus, Trash2, Edit2, FileText, CheckCircle2, Upload, X, Save, Eye } from 'lucide-react';
import { facultyApi, FacultyAssignment, FacultySubmission } from '../../api/faculty';
import { useToast } from '../../context/ToastContext';

export const FacultyAssignmentManager: React.FC = () => {
  const { showToast } = useToast();
  const [assignments, setAssignments] = useState<FacultyAssignment[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<FacultyAssignment | null>(null);
  const [submissions, setSubmissions] = useState<FacultySubmission[]>([]);
  const [showSubmissionsDrawer, setShowSubmissionsDrawer] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [subjectCode, setSubjectCode] = useState('CS8591');
  const [section, setSection] = useState('A');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('2026-08-20');
  const [maxMarks, setMaxMarks] = useState(100);

  // Grading Modal State
  const [gradingSubmission, setGradingSubmission] = useState<FacultySubmission | null>(null);
  const [gradeInput, setGradeInput] = useState('A');
  const [remarksInput, setRemarksInput] = useState('Excellent structure.');

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const data = await facultyApi.getAssignments();
      setAssignments(data);
    } catch (err) {
      console.error('Error fetching assignments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      if (selectedAssignment) {
        await facultyApi.editAssignment(selectedAssignment.id, {
          title,
          subject_code: subjectCode,
          section,
          description,
          due_date: dueDate,
          max_marks: maxMarks,
        });
        showToast('Assignment updated successfully.', 'success');
      } else {
        await facultyApi.createAssignment({
          title,
          subject_code: subjectCode,
          section,
          description,
          due_date: dueDate,
          max_marks: maxMarks,
        });
        showToast('Assignment created successfully.', 'success');
      }
      setShowCreateModal(false);
      resetForm();
      fetchAssignments();
    } catch (err) {
      console.error('Error saving assignment:', err);
      showToast('Failed to save assignment.', 'error');
    }
  };

  const handleDeleteAssignment = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this assignment?')) return;
    try {
      await facultyApi.deleteAssignment(id);
      showToast('Assignment deleted.', 'info');
      fetchAssignments();
    } catch (err) {
      console.error('Error deleting assignment:', err);
    }
  };

  const handleOpenSubmissions = async (assg: FacultyAssignment) => {
    setSelectedAssignment(assg);
    setShowSubmissionsDrawer(true);
    try {
      const subs = await facultyApi.getSubmissions(assg.id);
      setSubmissions(subs);
    } catch (err) {
      console.error('Error fetching submissions:', err);
    }
  };

  const handleSaveGrade = async () => {
    if (!gradingSubmission) return;
    try {
      await facultyApi.gradeSubmission(gradingSubmission.id, gradeInput, remarksInput);
      showToast(`Graded submission for ${gradingSubmission.student_name}.`, 'success');
      setGradingSubmission(null);
      if (selectedAssignment) {
        const subs = await facultyApi.getSubmissions(selectedAssignment.id);
        setSubmissions(subs);
      }
    } catch (err) {
      console.error('Error grading submission:', err);
    }
  };

  const resetForm = () => {
    setSelectedAssignment(null);
    setTitle('');
    setSubjectCode('CS8591');
    setSection('A');
    setDescription('');
    setDueDate('2026-08-20');
    setMaxMarks(100);
  };

  return (
    <div className="space-y-6 font-body">
      {/* ── Top Bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#1E293B] p-5 rounded-2xl border border-[#E2E8F0] dark:border-[#334155] shadow-xs">
        <div>
          <h3 className="font-heading font-bold text-card text-[#1F2937] dark:text-[#F8FAFC]">Course Assignments</h3>
          <p className="text-small text-[#64748B] dark:text-[#94A3B8]">Create tasks, review student submissions, and award grades.</p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setShowCreateModal(true);
          }}
          className="h-10 px-4 rounded-xl bg-[#0E2A6D] hover:bg-[#153B8A] text-white text-caption font-bold flex items-center gap-2 transition shrink-0"
        >
          <Plus size={18} /> Create Assignment
        </button>
      </div>

      {/* ── Assignment Cards Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {assignments.map((a) => (
          <div
            key={a.id}
            className="bg-white dark:bg-[#1E293B] p-5 rounded-2xl border border-[#E2E8F0] dark:border-[#334155] shadow-xs flex flex-col justify-between space-y-4 hover:border-[#1E4DB7]/40 transition"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-caption font-bold uppercase px-2.5 py-0.5 rounded bg-[#0E2A6D]/10 text-[#0E2A6D] dark:bg-[#60A5FA]/20 dark:text-[#60A5FA]">
                  {a.subject_code} · Sec {a.section}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setSelectedAssignment(a);
                      setTitle(a.title);
                      setSubjectCode(a.subject_code);
                      setSection(a.section);
                      setDescription(a.description || '');
                      setDueDate(a.due_date);
                      setMaxMarks(a.max_marks);
                      setShowCreateModal(true);
                    }}
                    className="p-1 text-[#64748B] hover:text-[#0E2A6D] rounded"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDeleteAssignment(a.id)} className="p-1 text-[#64748B] hover:text-rose-600 rounded">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <h4 className="font-heading font-bold text-card text-[#1F2937] dark:text-[#F8FAFC]">{a.title}</h4>
              <p className="text-caption text-[#64748B] dark:text-[#94A3B8] line-clamp-2">{a.description || 'No description specified.'}</p>
            </div>

            <div className="pt-3 border-t border-[#E2E8F0] dark:border-[#334155] space-y-3">
              <div className="flex items-center justify-between text-caption text-[#64748B]">
                <span>Due: <strong className="text-[#1F2937] dark:text-[#F8FAFC]">{a.due_date}</strong></span>
                <span>Max Marks: <strong className="text-[#1F2937] dark:text-[#F8FAFC]">{a.max_marks}</strong></span>
              </div>

              <button
                onClick={() => handleOpenSubmissions(a)}
                className="w-full h-9 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F5F7FB] dark:bg-[#0F172A] hover:bg-[#1E4DB7]/10 text-caption font-bold text-[#0E2A6D] dark:text-[#60A5FA] flex items-center justify-center gap-2 transition"
              >
                <Eye size={16} /> Review Submissions ({a.submissions_count})
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ── Create / Edit Modal ── */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-[#1E293B] rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-[#E2E8F0] dark:border-[#334155]">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#334155] pb-3">
              <h3 className="font-heading font-bold text-card text-[#1F2937] dark:text-[#F8FAFC]">
                {selectedAssignment ? 'Edit Assignment' : 'Create New Assignment'}
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-[#64748B] hover:text-[#1F2937]">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateOrEdit} className="space-y-3">
              <div>
                <label className="text-caption font-bold text-[#64748B]">Assignment Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. TCP/IP Protocol Analysis"
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-caption font-bold text-[#64748B]">Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F5F7FB] dark:bg-[#0F172A] text-body text-[#1F2937] dark:text-[#F8FAFC] outline-none"
                  />
                </div>
                <div>
                  <label className="text-caption font-bold text-[#64748B]">Max Marks</label>
                  <input
                    type="number"
                    value={maxMarks}
                    onChange={(e) => setMaxMarks(Number(e.target.value))}
                    className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F5F7FB] dark:bg-[#0F172A] text-body text-[#1F2937] dark:text-[#F8FAFC] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-caption font-bold text-[#64748B]">Description & Guidelines</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full p-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F5F7FB] dark:bg-[#0F172A] text-body text-[#1F2937] dark:text-[#F8FAFC] outline-none"
                />
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
                  {selectedAssignment ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Submissions Review Drawer / Modal ── */}
      {showSubmissionsDrawer && selectedAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-[#1E293B] rounded-2xl max-w-3xl w-full p-6 space-y-4 shadow-xl border border-[#E2E8F0] dark:border-[#334155]">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#334155] pb-3">
              <div>
                <h3 className="font-heading font-bold text-card text-[#1F2937] dark:text-[#F8FAFC]">
                  Submissions for {selectedAssignment.title}
                </h3>
                <p className="text-caption text-[#64748B]">{selectedAssignment.subject_code} · Sec {selectedAssignment.section}</p>
              </div>
              <button onClick={() => setShowSubmissionsDrawer(false)} className="text-[#64748B] hover:text-[#1F2937]">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {submissions.length === 0 ? (
                <p className="py-8 text-center text-caption text-[#64748B]">No submissions yet for this assignment.</p>
              ) : (
                submissions.map((sub) => (
                  <div key={sub.id} className="p-4 rounded-xl bg-[#F5F7FB] dark:bg-[#0F172A] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-heading font-bold text-body text-[#1F2937] dark:text-[#F8FAFC]">{sub.student_name}</h4>
                        <span className="font-mono text-caption text-[#0E2A6D] dark:text-[#60A5FA]">({sub.register_number})</span>
                      </div>
                      <p className="text-caption text-[#64748B]">{sub.submission_text || 'Submitted document attached.'}</p>
                      {sub.grade && (
                        <p className="text-caption font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                          Grade: {sub.grade} · Remark: {sub.remarks || 'None'}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => {
                          setGradingSubmission(sub);
                          setGradeInput(sub.grade || 'A');
                          setRemarksInput(sub.remarks || 'Good work.');
                        }}
                        className="h-8 px-3 rounded-lg bg-[#0E2A6D] text-white text-caption font-bold"
                      >
                        {sub.status === 'Graded' ? 'Edit Grade' : 'Grade'}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Grade Submission Sub-Modal ── */}
      {gradingSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white dark:bg-[#1E293B] rounded-2xl max-w-md w-full p-5 space-y-4 shadow-xl border border-[#E2E8F0] dark:border-[#334155]">
            <h4 className="font-heading font-bold text-card text-[#1F2937] dark:text-[#F8FAFC]">
              Grade {gradingSubmission.student_name}
            </h4>

            <div>
              <label className="text-caption font-bold text-[#64748B]">Grade Awarded</label>
              <select
                value={gradeInput}
                onChange={(e) => setGradeInput(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F5F7FB] dark:bg-[#0F172A] text-body text-[#1F2937] dark:text-[#F8FAFC] outline-none"
              >
                <option value="O (Outstanding)">O (Outstanding)</option>
                <option value="A+ (Excellent)">A+ (Excellent)</option>
                <option value="A (Very Good)">A (Very Good)</option>
                <option value="B+ (Good)">B+ (Good)</option>
                <option value="B (Average)">B (Average)</option>
                <option value="RA (Re-appear)">RA (Re-appear)</option>
              </select>
            </div>

            <div>
              <label className="text-caption font-bold text-[#64748B]">Faculty Remarks</label>
              <textarea
                value={remarksInput}
                onChange={(e) => setRemarksInput(e.target.value)}
                rows={2}
                className="w-full p-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F5F7FB] dark:bg-[#0F172A] text-body text-[#1F2937] dark:text-[#F8FAFC] outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2">
              <button onClick={() => setGradingSubmission(null)} className="h-9 px-3 text-caption font-bold text-[#64748B]">
                Cancel
              </button>
              <button onClick={handleSaveGrade} className="h-9 px-4 rounded-xl bg-[#0E2A6D] text-white text-caption font-bold">
                Save Grade
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
