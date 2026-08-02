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
    <div className="space-y-6 font-body">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#1E293B] p-5 rounded-2xl border border-[#E2E8F0] dark:border-[#334155] shadow-xs">
        <div>
          <h3 className="font-heading font-bold text-card text-[#1F2937] dark:text-[#F8FAFC]">AI Document Hub & RAG Index Manager</h3>
          <p className="text-small text-[#64748B] dark:text-[#94A3B8]">Upload syllabus PDFs, college regulation manuals, and trigger ChromaDB vector index rebuilds.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRebuildIndex}
            disabled={rebuilding}
            className="h-10 px-3.5 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#1E293B] hover:bg-[#F5F7FB] text-caption font-bold text-[#0E2A6D] dark:text-[#60A5FA] flex items-center gap-2 transition disabled:opacity-50"
          >
            <RefreshCw size={16} className={rebuilding ? 'animate-spin' : ''} /> {rebuilding ? 'Rebuilding...' : 'Rebuild RAG Index'}
          </button>

          <label className="h-10 px-4 rounded-xl bg-[#0E2A6D] hover:bg-[#153B8A] text-white text-caption font-bold flex items-center gap-2 transition cursor-pointer shrink-0">
            <Upload size={18} /> {uploading ? 'Uploading...' : 'Upload PDF / DOCX'}
            <input type="file" accept=".pdf,.docx,.txt" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>
      </div>

      {/* Document Roster */}
      <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-[#E2E8F0] dark:border-[#334155] shadow-xs p-6 space-y-4">
        <h3 className="font-heading font-bold text-card text-[#1F2937] dark:text-[#F8FAFC] flex items-center gap-2">
          <FileText className="text-[#0E2A6D] dark:text-[#60A5FA]" size={20} />
          Indexed Knowledge Documents ({documents.length})
        </h3>

        <div className="space-y-3">
          {documents.map((doc, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-[#F5F7FB] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <FileText size={20} className="text-[#1E4DB7] dark:text-[#60A5FA]" />
                <span className="font-heading font-bold text-body text-[#1F2937] dark:text-[#F8FAFC]">{typeof doc === 'string' ? doc : (doc as any).filename || 'Indexed Document'}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-caption font-bold px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  Indexed
                </span>
                <button
                  onClick={() => handleDeleteDocument(typeof doc === 'string' ? doc : (doc as any).filename)}
                  className="p-1.5 text-[#64748B] hover:text-rose-600 rounded"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
