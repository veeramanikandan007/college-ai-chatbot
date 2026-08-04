import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Upload, Trash2, RefreshCw } from 'lucide-react';
import { adminDashboardApi } from '../../api/adminDashboard';
import { useToast } from '../../context/ToastContext';
import { PageHeader } from '../ui/PageHeader';
import { Button } from '../ui/Button';
import { Table, Column } from '../ui/Table';
import { Badge } from '../ui/Badge';
import { DashboardCard } from '../ui/DashboardCard';
import { PageContainer } from '../ui/PageContainer';

export const AdminDocumentManager: React.FC = () => {
  const { showToast } = useToast();
  const [documents, setDocuments] = useState<any[]>([]);
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
      const docs = res.documents || [];
      const mappedDocs = docs.map((d: any, i: number) => ({
        id: i,
        filename: typeof d === 'string' ? d : d.filename,
      }));
      setDocuments(mappedDocs);
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

  const columns: Column<any>[] = [
    {
      key: 'filename',
      header: 'Document Name',
      sortable: true,
      render: (doc) => (
        <div className="flex items-center gap-3">
          <FileText size={18} className="text-blue-500" />
          <span className="font-semibold text-zinc-900 dark:text-zinc-100">{doc.filename}</span>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: () => <Badge variant="success">Indexed</Badge>
    },
    {
      key: 'actions',
      header: '',
      render: (doc) => (
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" onClick={() => handleDeleteDocument(doc.filename)}>
            <Trash2 size={16} className="text-red-500" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <PageContainer>
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex-1">
          <PageHeader
            title="AI Document Hub & RAG Index Manager"
            description="Upload syllabus PDFs, college regulation manuals, and trigger ChromaDB vector index rebuilds."
            icon={FileText}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2 mt-2 sm:mt-0">
          <Button variant="outline" onClick={handleRebuildIndex} isLoading={rebuilding} leftIcon={<RefreshCw size={16} />}>
            Rebuild RAG Index
          </Button>
          <Button variant="primary" isLoading={uploading} leftIcon={<Upload size={16} />} onClick={() => document.getElementById('doc-upload')?.click()}>
            Upload PDF / DOCX
          </Button>
          <input type="file" id="doc-upload" accept=".pdf,.docx,.txt" onChange={handleFileUpload} className="hidden" />
        </div>
      </div>

      <DashboardCard className="p-0 md:p-0 overflow-hidden">
        <Table
          columns={columns}
          data={documents}
          isLoading={loading}
          searchable={true}
          searchPlaceholder="Search documents..."
          emptyMessage="No documents found."
        />
      </DashboardCard>
    </PageContainer>
  );
};
