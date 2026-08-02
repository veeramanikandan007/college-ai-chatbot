import React, { useState, useEffect } from 'react';
import { Files, Upload, Trash2, Download, Search, Filter, Plus, FileText, X } from 'lucide-react';
import { facultyApi, FacultyQuestionPaper } from '../../api/faculty';
import { useToast } from '../../context/ToastContext';

export const FacultyQuestionPaperManager: React.FC = () => {
  const { showToast } = useToast();
  const [papers, setPapers] = useState<FacultyQuestionPaper[]>([]);
  const [loading, setLoading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterExamType, setFilterExamType] = useState('All');

  // Upload Form State
  const [title, setTitle] = useState('');
  const [subjectName, setSubjectName] = useState('Computer Networks');
  const [subjectCode, setSubjectCode] = useState('CS8591');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [semester, setSemester] = useState(6);
  const [academicYear, setAcademicYear] = useState('2025-2026');
  const [examType, setExamType] = useState('Model Exam');

  useEffect(() => {
    fetchPapers();
  }, []);

  const fetchPapers = async () => {
    try {
      setLoading(true);
      const data = await facultyApi.getQuestionPapers();
      setPapers(data);
    } catch (err) {
      console.error('Error fetching question papers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadPaper = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      await facultyApi.uploadQuestionPaper({
        title,
        subject_name: subjectName,
        subject_code: subjectCode,
        department,
        semester,
        academic_year: academicYear,
        exam_type: examType,
        pdf_url: 'https://example.com/papers/' + subjectCode + '.pdf',
      });
      showToast('Question paper uploaded successfully.', 'success');
      setShowUploadModal(false);
      setTitle('');
      fetchPapers();
    } catch (err) {
      console.error('Error uploading question paper:', err);
      showToast('Failed to upload paper.', 'error');
    }
  };

  const handleDeletePaper = async (id: number) => {
    if (!window.confirm('Delete this question paper?')) return;
    try {
      await facultyApi.deleteQuestionPaper(id);
      showToast('Question paper deleted.', 'info');
      fetchPapers();
    } catch (err) {
      console.error('Error deleting paper:', err);
    }
  };

  const filteredPapers = papers.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.subject_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.subject_code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterExamType === 'All' || p.exam_type === filterExamType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6 font-body">
      {/* ── Top Bar Controls ── */}
      <div className="bg-white dark:bg-[#1E293B] p-5 rounded-2xl border border-[#E2E8F0] dark:border-[#334155] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex items-center">
            <Search size={16} className="absolute left-3 text-[#64748B]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search paper or code..."
              className="h-10 pl-9 pr-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F5F7FB] dark:bg-[#0F172A] text-body text-[#1F2937] dark:text-[#F8FAFC] outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter size={16} className="text-[#64748B]" />
            <select
              value={filterExamType}
              onChange={(e) => setFilterExamType(e.target.value)}
              className="h-10 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F5F7FB] dark:bg-[#0F172A] px-3 text-body font-semibold text-[#1F2937] dark:text-[#F8FAFC] outline-none"
            >
              <option value="All">All Exam Types</option>
              <option value="Model Exam">Model Exam</option>
              <option value="End Semester">End Semester</option>
              <option value="Internal Assessment">Internal Assessment</option>
            </select>
          </div>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="h-10 px-4 rounded-xl bg-[#0E2A6D] hover:bg-[#153B8A] text-white text-caption font-bold flex items-center gap-2 transition shrink-0"
        >
          <Upload size={18} /> Upload Question Paper
        </button>
      </div>

      {/* ── Question Paper Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredPapers.map((p) => (
          <div
            key={p.id}
            className="bg-white dark:bg-[#1E293B] p-5 rounded-2xl border border-[#E2E8F0] dark:border-[#334155] shadow-xs flex flex-col justify-between space-y-4 hover:border-[#D9A441]/40 transition"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-caption font-bold uppercase px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  {p.exam_type}
                </span>
                <button onClick={() => handleDeletePaper(p.id)} className="p-1 text-[#64748B] hover:text-rose-600 rounded">
                  <Trash2 size={16} />
                </button>
              </div>

              <h4 className="font-heading font-bold text-card text-[#1F2937] dark:text-[#F8FAFC]">{p.title}</h4>
              <p className="text-caption text-[#64748B] dark:text-[#94A3B8]">
                {p.subject_name} ({p.subject_code}) · Sem {p.semester}
              </p>
            </div>

            <div className="pt-3 border-t border-[#E2E8F0] dark:border-[#334155] flex items-center justify-between text-caption text-[#64748B]">
              <span>Academic Year: <strong className="text-[#1F2937] dark:text-[#F8FAFC]">{p.academic_year}</strong></span>
              <a
                href={p.pdf_url || '#'}
                target="_blank"
                rel="noreferrer"
                className="h-8 px-3 rounded-lg bg-[#F5F7FB] dark:bg-[#0F172A] hover:bg-[#1E4DB7]/10 text-caption font-bold text-[#0E2A6D] dark:text-[#60A5FA] flex items-center gap-1 transition"
              >
                <FileText size={14} /> PDF
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* ── Upload Modal ── */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-[#1E293B] rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-[#E2E8F0] dark:border-[#334155]">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#334155] pb-3">
              <h3 className="font-heading font-bold text-card text-[#1F2937] dark:text-[#F8FAFC]">Upload Question Paper</h3>
              <button onClick={() => setShowUploadModal(false)} className="text-[#64748B] hover:text-[#1F2937]">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUploadPaper} className="space-y-3">
              <div>
                <label className="text-caption font-bold text-[#64748B]">Paper Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Computer Networks Model Exam 2026"
                  required
                  className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F5F7FB] dark:bg-[#0F172A] text-body text-[#1F2937] dark:text-[#F8FAFC] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-caption font-bold text-[#64748B]">Subject Name</label>
                  <input
                    type="text"
                    value={subjectName}
                    onChange={(e) => setSubjectName(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F5F7FB] dark:bg-[#0F172A] text-body text-[#1F2937] dark:text-[#F8FAFC] outline-none"
                  />
                </div>
                <div>
                  <label className="text-caption font-bold text-[#64748B]">Subject Code</label>
                  <input
                    type="text"
                    value={subjectCode}
                    onChange={(e) => setSubjectCode(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F5F7FB] dark:bg-[#0F172A] text-body text-[#1F2937] dark:text-[#F8FAFC] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-caption font-bold text-[#64748B]">Semester</label>
                  <input
                    type="number"
                    value={semester}
                    onChange={(e) => setSemester(Number(e.target.value))}
                    className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F5F7FB] dark:bg-[#0F172A] text-body text-[#1F2937] dark:text-[#F8FAFC] outline-none"
                  />
                </div>
                <div>
                  <label className="text-caption font-bold text-[#64748B]">Exam Type</label>
                  <select
                    value={examType}
                    onChange={(e) => setExamType(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F5F7FB] dark:bg-[#0F172A] text-body text-[#1F2937] dark:text-[#F8FAFC] outline-none"
                  >
                    <option value="Model Exam">Model Exam</option>
                    <option value="End Semester">End Semester</option>
                    <option value="Internal Assessment">Internal Assessment</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="h-10 px-4 rounded-xl border border-[#E2E8F0] dark:border-[#334155] text-caption font-bold text-[#64748B]"
                >
                  Cancel
                </button>
                <button type="submit" className="h-10 px-4 rounded-xl bg-[#0E2A6D] text-white text-caption font-bold">
                  Upload Paper
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
