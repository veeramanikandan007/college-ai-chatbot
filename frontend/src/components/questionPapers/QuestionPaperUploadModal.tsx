import React, { useState } from 'react';
import { X, Upload, FileText, CheckCircle2, CircleAlert } from 'lucide-react';
import { uploadQuestionPapers, FilterMeta } from '../../api/questionPapers';
import { useToast } from '../../context/ToastContext';

interface QuestionPaperUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  meta: FilterMeta | null;
}

export const QuestionPaperUploadModal: React.FC<QuestionPaperUploadModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  meta,
}) => {
  const { showToast } = useToast();

  const [files, setFiles] = useState<File[]>([]);
  const [department, setDepartment] = useState<string>('Computer Science & Engineering');
  const [semester, setSemester] = useState<number>(5);
  const [subjectCode, setSubjectCode] = useState<string>('CS8591');
  const [subjectName, setSubjectName] = useState<string>('Computer Networks');
  const [academicYear, setAcademicYear] = useState<number>(2023);
  const [regulation, setRegulation] = useState<string>('R2021');
  const [examType, setExamType] = useState<string>('University Exam');
  const [facultyName, setFacultyName] = useState<string>('Dr. Aris Thorne');

  const [uploading, setUploading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selected = Array.from(e.target.files);
      const validPdfs = selected.filter((f) => f.name.toLowerCase().endsWith('.pdf'));
      if (validPdfs.length < selected.length) {
        showToast('Only PDF files are allowed. Non-PDF files were filtered out.', 'warning');
      }
      setFiles(validPdfs);
    }
  };

  const handleSubjectSelect = (code: string) => {
    setSubjectCode(code);
    const found = meta?.subjects.find((s) => s.code === code);
    if (found) {
      setSubjectName(found.name);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0) {
      setErrorMsg('Please select at least one PDF file to upload.');
      return;
    }

    setUploading(true);
    setErrorMsg(null);

    try {
      await uploadQuestionPapers(files, {
        department,
        semester,
        subject_code: subjectCode,
        subject_name: subjectName,
        academic_year: academicYear,
        regulation,
        exam_type: examType,
        faculty_name: facultyName,
      });

      showToast(`Successfully uploaded and indexed ${files.length} paper(s)!`, 'success');
      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#1E293B] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 my-8 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
          <h2 className="text-xl font-bold font-heading text-slate-900 dark:text-white flex items-center gap-2">
            <Upload className="text-[#0E2A6D] dark:text-[#60A5FA]" size={22} />
            <span>Upload Question Papers (Single/Bulk)</span>
          </h2>
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

          {/* Department & Semester */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                Department *
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0E2A6D] dark:focus:ring-[#60A5FA]"
              >
                {(meta?.departments || [
                  'Computer Science & Engineering',
                  'Artificial Intelligence & Data Science',
                  'Electronics & Communication Engineering',
                  'Electrical & Electronics Engineering',
                  'Mechanical Engineering',
                  'Civil Engineering',
                ]).map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                Semester *
              </label>
              <select
                value={semester}
                onChange={(e) => setSemester(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0E2A6D] dark:focus:ring-[#60A5FA]"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>
                    Semester {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Subject Code & Subject Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                Subject Code *
              </label>
              <input
                type="text"
                required
                value={subjectCode}
                onChange={(e) => handleSubjectSelect(e.target.value)}
                placeholder="e.g. CS8591"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0E2A6D] dark:focus:ring-[#60A5FA]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                Subject Name *
              </label>
              <input
                type="text"
                required
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                placeholder="e.g. Computer Networks"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0E2A6D] dark:focus:ring-[#60A5FA]"
              />
            </div>
          </div>

          {/* Year, Regulation, Exam Type */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                Academic Year *
              </label>
              <select
                value={academicYear}
                onChange={(e) => setAcademicYear(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0E2A6D] dark:focus:ring-[#60A5FA]"
              >
                {[2024, 2023, 2022, 2021, 2020, 2019, 2018].map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                Regulation *
              </label>
              <select
                value={regulation}
                onChange={(e) => setRegulation(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0E2A6D] dark:focus:ring-[#60A5FA]"
              >
                {['R2021', 'R2017', 'R2023'].map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                Exam Type *
              </label>
              <select
                value={examType}
                onChange={(e) => setExamType(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0E2A6D] dark:focus:ring-[#60A5FA]"
              >
                <option value="University Exam">University Exam</option>
                <option value="Model Exam">Model Exam</option>
                <option value="Internal">Internal</option>
              </select>
            </div>
          </div>

          {/* Faculty Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
              Faculty / Instructor
            </label>
            <input
              type="text"
              value={facultyName}
              onChange={(e) => setFacultyName(e.target.value)}
              placeholder="e.g. Dr. Aris Thorne"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0E2A6D] dark:focus:ring-[#60A5FA]"
            />
          </div>

          {/* PDF Files Dropzone */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
              Select PDF Files (Single or Bulk)
            </label>
            <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-6 text-center hover:border-[#0E2A6D] dark:hover:border-[#60A5FA] transition-colors">
              <Upload className="mx-auto text-slate-400 mb-2" size={32} />
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Click to browse or drag PDF question papers here
              </p>
              <p className="text-[11px] text-slate-400 mt-1">PDF format only. Maximum 15MB per file.</p>
              <input
                type="file"
                multiple
                accept=".pdf"
                onChange={handleFileChange}
                className="mt-3 text-xs font-semibold text-slate-600 dark:text-slate-300 mx-auto"
              />
            </div>

            {files.length > 0 && (
              <div className="mt-3 space-y-1.5 max-h-36 overflow-y-auto">
                {files.map((f, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-xl bg-blue-50/50 dark:bg-blue-950/30 text-xs font-medium text-blue-900 dark:text-blue-200 border border-blue-200 dark:border-blue-900/50"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileText size={15} />
                      <span className="truncate">{f.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-400">({(f.size / 1048576).toFixed(1)} MB)</span>
                  </div>
                ))}
              </div>
            )}
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
              disabled={uploading || files.length === 0}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-[#0E2A6D] text-white hover:bg-[#0E2A6D]/90 disabled:opacity-50 transition-all shadow-xs"
            >
              <CheckCircle2 size={16} />
              <span>{uploading ? 'Uploading & Indexing RAG...' : `Upload ${files.length} Paper(s)`}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
