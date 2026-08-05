import React, { useState, useEffect } from 'react';
import { FileText, Upload, Trash2, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { adminDashboardApi } from '../../api/adminDashboard';
import { useToast } from '../../context/ToastContext';

export const AdminDocumentManager: React.FC = () => {
  const { showToast } = useToast();
  const [documents, setDocuments] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [rebuilding, setRebuilding] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const res = await adminDashboardApi.getDocuments();
      setDocuments(res.documents || []);
    } catch (err) {
      console.error('Error fetching documents:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploading(true);
      await fetch('/api/v1/admin/documents/upload', {
        method: 'POST',
        body: formData,
      });
      showToast(`Document ${file.name} uploaded and indexed in ChromaDB.`, 'success');
      fetchDocuments();
    } catch (err) {
      console.error('Error uploading document:', err);
      showToast('Failed to upload document.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDocument = async (filename: string) => {
    if (!window.confirm(`Delete ${filename}?`)) return;
    try {
      await adminDashboardApi.deleteDocument(filename);
      showToast(`Deleted ${filename}.`, 'info');
      fetchDocuments();
    } catch (err) {
      console.error('Error deleting document:', err);
    }
  };

  const handleRebuildIndex = async () => {
    try {
      setRebuilding(true);
      await adminDashboardApi.rebuildRagIndex();
      showToast('Full RAG vector index rebuild triggered.', 'success');
    } catch (err) {
      console.error('Error rebuilding RAG index:', err);
    } finally {
      setRebuilding(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* ── Top Hero Header Card ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FFFFFF] dark:bg-[#18181B] p-6 rounded-[16px] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs">
        <div className="space-y-1">
          <h3 className="text-[18px] font-semibold text-[#111827] dark:text-[#FAFAFA]">AI Document Hub & RAG Index Manager</h3>
          <p className="text-[14px] font-normal text-[#6B7280] dark:text-[#A1A1AA]">Upload syllabus PDFs, college regulation manuals, and trigger ChromaDB vector index rebuilds.</p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleRebuildIndex}
            disabled={rebuilding}
            className="h-[40px] px-4 rounded-[10px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#FFFFFF] dark:bg-[#18181B] hover:bg-[#F8FAFC] dark:hover:bg-[#27272A] text-[#111827] dark:text-[#FAFAFA] text-[14px] font-medium flex items-center gap-2 transition disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw size={16} className={rebuilding ? 'animate-spin' : ''} /> {rebuilding ? 'Rebuilding...' : 'Rebuild RAG Index'}
          </button>

          <label className="h-[40px] px-4 rounded-[10px] bg-[#111827] hover:bg-[#1F2937] dark:bg-[#FAFAFA] dark:hover:bg-[#E5E5E5] text-[#FFFFFF] dark:text-[#111111] text-[14px] font-medium flex items-center gap-2 transition cursor-pointer shrink-0">
            <Upload size={16} /> {uploading ? 'Uploading...' : 'Upload PDF / DOCX'}
            <input type="file" accept=".pdf,.docx,.txt" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>
      </div>

      {/* ── Document Roster Container ── */}
      <div className="bg-[#FFFFFF] dark:bg-[#18181B] rounded-[16px] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs p-6 space-y-4">
        <h3 className="text-[18px] font-semibold text-[#111827] dark:text-[#FAFAFA] flex items-center gap-2">
          <FileText className="text-[#111827] dark:text-[#FAFAFA]" size={20} />
          Indexed Knowledge Documents ({documents.length})
        </h3>

        {documents.length === 0 ? (
          <div className="p-8 text-center rounded-[12px] bg-[#F8FAFC] dark:bg-[#111111] border border-dashed border-[#E5E7EB] dark:border-[#2A2A2A] space-y-2">
            <FileText size={32} className="mx-auto text-[#6B7280] dark:text-[#A1A1AA]" />
            <p className="text-[14px] font-medium text-[#111827] dark:text-[#FAFAFA]">No RAG documents indexed yet</p>
            <p className="text-[13px] font-normal text-[#6B7280] dark:text-[#A1A1AA]">Upload PDFs, syllabus guides or regulation manuals above to train CollegeMate AI.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((doc, idx) => (
              <div
                key={idx}
                className="p-4 rounded-[12px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <FileText size={18} className="text-[#111827] dark:text-[#FAFAFA]" />
                  <span className="text-[14px] font-medium text-[#111827] dark:text-[#FAFAFA]">{typeof doc === 'string' ? doc : (doc as any).filename || 'Indexed Document'}</span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[12px] font-medium px-2.5 py-0.5 rounded-[6px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    Indexed
                  </span>
                  <button
                    onClick={() => handleDeleteDocument(typeof doc === 'string' ? doc : (doc as any).filename)}
                    className="p-1.5 text-[#6B7280] hover:text-rose-600 dark:hover:text-rose-400 rounded-[6px] transition cursor-pointer"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
