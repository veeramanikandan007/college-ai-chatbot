import { motion, AnimatePresence } from 'framer-motion';
import {
  Download,
  X,
  FileText,
  FileCode,
  Database,
  Printer,
  ArrowRight,
} from 'lucide-react';
import { ChatMessageData } from './ChatMessage';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  chatTitle: string;
  messages: ChatMessageData[];
}

export default function ExportModal({
  isOpen,
  onClose,
  chatTitle,
  messages,
}: ExportModalProps) {
  if (!isOpen) return null;

  const downloadText = (format: 'txt' | 'md' | 'json') => {
    let content = '';
    let filename = `${chatTitle.replace(/\s+/g, '_').toLowerCase()}.${format}`;

    if (format === 'json') {
      content = JSON.stringify({ title: chatTitle, messages }, null, 2);
    } else {
      content = `# ${chatTitle}\n\n` +
        messages
          .map(
            (m) =>
              `[${m.timestamp}] ${m.role === 'user' ? 'You' : 'CollegeMate AI'}:\n${m.text}\n`
          )
          .join('\n---\n\n');
    }

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
    onClose();
  };

  const handlePrintPDF = () => {
    window.print();
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#0A2A6A]/30 backdrop-blur-xs"
        />

        {/* Export Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-sm rounded-3xl border border-[#E2E8F0] bg-white p-5 shadow-2xl overflow-hidden select-none"
        >
          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3 mb-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#0A2A6A] text-white">
                <Download className="h-4 w-4" />
              </div>
              <h3 className="text-base font-bold text-[#0A2A6A]">Export Conversation</h3>
            </div>
            <button onClick={onClose} className="rounded-lg p-1 text-[#64748B] hover:bg-[#F1F5F9]">
              <X className="h-4 w-4" />
            </button>
          </div>

          <p className="text-xs text-[#64748B] mb-4">
            Select format to export <span className="font-semibold text-[#0A2A6A]">"{chatTitle}"</span>:
          </p>

          <div className="space-y-2">
            <button
              onClick={() => downloadText('txt')}
              className="flex w-full items-center justify-between rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3 text-xs font-bold text-[#0A2A6A] hover:bg-[#F1F5F9]"
            >
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-[#163D8C]" />
                <span>Plain Text (.txt)</span>
              </div>
              <span className="text-[11px] font-normal text-[#64748B]">Download ↓</span>
            </button>

            <button
              onClick={() => downloadText('md')}
              className="flex w-full items-center justify-between rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3 text-xs font-bold text-[#0A2A6A] hover:bg-[#F1F5F9]"
            >
              <div className="flex items-center gap-2">
                <FileCode className="h-4 w-4 text-[#163D8C]" />
                <span>Markdown File (.md)</span>
              </div>
              <span className="text-[11px] font-normal text-[#64748B]">Download ↓</span>
            </button>

            <button
              onClick={() => downloadText('json')}
              className="flex w-full items-center justify-between rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3 text-xs font-bold text-[#0A2A6A] hover:bg-[#F1F5F9]"
            >
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-[#163D8C]" />
                <span>Raw Data (.json)</span>
              </div>
              <span className="text-[11px] font-normal text-[#64748B]">Download ↓</span>
            </button>

            <button
              onClick={handlePrintPDF}
              className="flex w-full items-center justify-between rounded-xl bg-[#0A2A6A] p-3 text-xs font-bold text-white shadow-md hover:bg-[#163D8C]"
            >
              <div className="flex items-center gap-2">
                <Printer className="h-4 w-4" />
                <span>Print to PDF</span>
              </div>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
