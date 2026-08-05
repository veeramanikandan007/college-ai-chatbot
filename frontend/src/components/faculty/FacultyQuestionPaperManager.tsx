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
    <div className="space-y-6 font-sans">
      {/* ── Page Hero Header ── */}
      <div className="bg-[#FFFFFF] dark:bg-[#18181B] p-6 rounded-[16px] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-12 h-12 rounded-[12px] bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] flex items-center justify-center shrink-0">
            <Files size={24} />
          </div>
          <div className="min-w-0 space-y-1">
            <h1 className="text-[30px] font-semibold text-[#111827] dark:text-[#FAFAFA] tracking-tight leading-tight truncate">
              Question Paper Repository
            </h1>
            <p className="text-[15px] font-normal text-[#6B7280] dark:text-[#A1A1AA] truncate">
              Manage and upload past question papers for student access.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="h-[40px] px-5 rounded-[10px] bg-[#111827] hover:bg-[#1F2937] dark:bg-[#FAFAFA] dark:hover:bg-[#E5E5E5] text-[#FFFFFF] dark:text-[#111111] font-medium text-[14px] transition flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <Upload size={18} />
          <span>Upload Paper</span>
        </button>
      </div>

      {/* ── Search & Filter Bar ── */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-[#FFFFFF] dark:bg-[#18181B] p-3.5 sm:p-4 rounded-[16px] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs select-none">
        <div className="relative w-full md:w-64">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7280] dark:text-[#A1A1AA]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search paper or code..."
            className="w-full h-[38px] sm:h-[40px] pl-10 pr-4 rounded-[10px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#FFFFFF] dark:bg-[#18181B] text-[13px] sm:text-[14px] font-sans text-[#111827] dark:text-[#FAFAFA] outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter size={16} className="text-[#6B7280] dark:text-[#A1A1AA]" />
          <select
            value={filterExamType}
            onChange={(e) => setFilterExamType(e.target.value)}
            className="h-[38px] sm:h-[40px] rounded-[10px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#FFFFFF] dark:bg-[#18181B] px-3.5 text-[13px] sm:text-[14px] font-normal text-[#111827] dark:text-[#FAFAFA] outline-none cursor-pointer w-full md:w-auto"
          >
            <option value="All">All Exam Types</option>
            <option value="Model Exam">Model Exam</option>
            <option value="End Semester">End Semester</option>
            <option value="Internal Assessment">Internal Assessment</option>
          </select>
        </div>
      </div>

      {/* ── Question Paper Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPapers.map((p) => (
          <div
            key={p.id}
            className="bg-white dark:bg-[#18181B] p-6 rounded-[16px] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs flex flex-col justify-between space-y-4 hover:border-[#111827]/40 dark:hover:border-[#FAFAFA]/40 transition group"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-normal uppercase px-2.5 py-0.5 rounded-[6px] bg-[#F3F4F6] dark:bg-[#27272A] text-[#111827] dark:text-[#FAFAFA] border border-[#E5E7EB] dark:border-[#3F3F46]">
                  {p.exam_type}
                </span>
                <button onClick={() => handleDeletePaper(p.id)} className="p-1.5 text-[#6B7280] hover:text-rose-600 rounded-[6px] transition cursor-pointer">
                  <Trash2 size={16} />
                </button>
              </div>

              <h4 className="text-[18px] font-semibold text-[#111827] dark:text-[#FAFAFA] leading-snug line-clamp-2">{p.title}</h4>

              <p className="text-[13px] font-normal text-[#6B7280] dark:text-[#A1A1AA]">
                {p.subject_name} ({p.subject_code}) · Sem {p.semester}
              </p>
            </div>

            <div className="pt-4 border-t border-[#E5E7EB] dark:border-[#2A2A2A] flex items-center justify-between text-[13px] font-normal text-[#6B7280] dark:text-[#A1A1AA]">
              <span>Academic Year: <strong className="text-[#111827] dark:text-[#FAFAFA]">{p.academic_year}</strong></span>
              <a
                href={p.pdf_url || '#'}
                target="_blank"
                rel="noreferrer"
                className="h-8 px-3 rounded-[8px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[13px] font-medium text-[#111827] dark:text-[#FAFAFA] hover:bg-[#FFFFFF] dark:hover:bg-[#18181B] flex items-center gap-1.5 transition"
              >
                <FileText size={14} /> PDF
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* ── Upload Modal ── */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4" onClick={() => setShowUploadModal(false)}>
          <div className="w-full max-w-md bg-[#FFFFFF] dark:bg-[#18181B] p-6 rounded-[16px] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-2xl space-y-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB] dark:border-[#2A2A2A]">
              <h3 className="text-[20px] font-semibold text-[#111827] dark:text-[#FAFAFA]">Upload Question Paper</h3>
              <button onClick={() => setShowUploadModal(false)} className="h-8 w-8 rounded-[8px] border border-[#E5E7EB] dark:border-[#2A2A2A] flex items-center justify-center text-[#111827] dark:text-[#FAFAFA]">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleUploadPaper} className="space-y-4">
              <div>
                <label className="text-[14px] font-medium text-[#111827] dark:text-[#FAFAFA] block mb-1">Paper Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Computer Networks Model Exam 2026"
                  required
                  className="w-full h-[40px] px-3.5 rounded-[10px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#FFFFFF] dark:bg-[#18181B] text-[14px] text-[#111827] dark:text-[#FAFAFA] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[14px] font-medium text-[#111827] dark:text-[#FAFAFA] block mb-1">Subject Name</label>
                  <input
                    type="text"
                    value={subjectName}
                    onChange={(e) => setSubjectName(e.target.value)}
                    className="w-full h-[40px] px-3.5 rounded-[10px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#FFFFFF] dark:bg-[#18181B] text-[14px] text-[#111827] dark:text-[#FAFAFA] outline-none"
                  />
                </div>
                <div>
                  <label className="text-[14px] font-medium text-[#111827] dark:text-[#FAFAFA] block mb-1">Subject Code</label>
                  <input
                    type="text"
                    value={subjectCode}
                    onChange={(e) => setSubjectCode(e.target.value)}
                    className="w-full h-[40px] px-3.5 rounded-[10px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#FFFFFF] dark:bg-[#18181B] text-[14px] text-[#111827] dark:text-[#FAFAFA] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[14px] font-medium text-[#111827] dark:text-[#FAFAFA] block mb-1">Semester</label>
                  <input
                    type="number"
                    value={semester}
                    onChange={(e) => setSemester(Number(e.target.value))}
                    className="w-full h-[40px] px-3.5 rounded-[10px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#FFFFFF] dark:bg-[#18181B] text-[14px] text-[#111827] dark:text-[#FAFAFA] outline-none"
                  />
                </div>
                <div>
                  <label className="text-[14px] font-medium text-[#111827] dark:text-[#FAFAFA] block mb-1">Exam Type</label>
                  <select
                    value={examType}
                    onChange={(e) => setExamType(e.target.value)}
                    className="w-full h-[40px] px-3.5 rounded-[10px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#FFFFFF] dark:bg-[#18181B] text-[14px] text-[#111827] dark:text-[#FAFAFA] outline-none cursor-pointer"
                  >
                    <option value="Model Exam">Model Exam</option>
                    <option value="End Semester">End Semester</option>
                    <option value="Internal Assessment">Internal Assessment</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-[#E5E7EB] dark:border-[#2A2A2A] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="h-[40px] px-4 rounded-[10px] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[14px] font-medium text-[#111827] dark:text-[#FAFAFA]"
                >
                  Cancel
                </button>
                <button type="submit" className="h-[40px] px-5 rounded-[10px] bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] text-[14px] font-medium cursor-pointer">
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
