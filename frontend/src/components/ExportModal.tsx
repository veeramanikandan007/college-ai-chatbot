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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-body">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#0E2A6D]/40 backdrop-blur-xs"
        />

        {/* Export Dialog — Border Radius 18px */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-sm rounded-[18px] border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#1E293B] p-6 shadow-2xl overflow-hidden select-none text-[#1F2937] dark:text-[#F8FAFC]"
        >
          <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#334155] pb-3 mb-4">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0E2A6D] text-white shadow-xs border border-[#D9A441]/30">
                <Download size={18} strokeWidth={1.75} />
              </div>
              <h3 className="font-heading font-bold text-[18px] text-[#0E2A6D] dark:text-[#F8FAFC]">Export Conversation</h3>
            </div>
            <button onClick={onClose} className="rounded-xl p-1.5 text-[#64748B] hover:bg-[#F5F7FB] dark:hover:bg-[#0F172A] transition">
              <X size={18} strokeWidth={1.75} />
            </button>
          </div>

          <p className="text-small text-[#64748B] dark:text-[#94A3B8] mb-4">
            Select format to export <span className="font-semibold text-[#1F2937] dark:text-[#F8FAFC]">"{chatTitle}"</span>:
          </p>

          <div className="space-y-2">
            <button
              onClick={() => downloadText('txt')}
              className="flex h-[44px] w-full items-center justify-between rounded-[14px] border border-[#E2E8F0] dark:border-[#334155] bg-[#F5F7FB] dark:bg-[#0F172A] px-3.5 text-small font-semibold text-[#0E2A6D] dark:text-[#60A5FA] hover:bg-[#E2E8F0] dark:hover:bg-[#1E293B] transition"
            >
              <div className="flex items-center gap-2.5">
                <FileText size={18} strokeWidth={1.75} className="text-[#0E2A6D] dark:text-[#60A5FA]" />
                <span>Plain Text (.txt)</span>
              </div>
              <ArrowRight size={16} strokeWidth={1.75} />
            </button>

            <button
              onClick={() => downloadText('md')}
              className="flex h-[44px] w-full items-center justify-between rounded-[14px] border border-[#E2E8F0] dark:border-[#334155] bg-[#F5F7FB] dark:bg-[#0F172A] px-3.5 text-small font-semibold text-[#0E2A6D] dark:text-[#60A5FA] hover:bg-[#E2E8F0] dark:hover:bg-[#1E293B] transition"
            >
              <div className="flex items-center gap-2.5">
                <FileCode size={18} strokeWidth={1.75} className="text-[#1E4DB7] dark:text-[#60A5FA]" />
                <span>Markdown (.md)</span>
              </div>
              <ArrowRight size={16} strokeWidth={1.75} />
            </button>

            <button
              onClick={() => downloadText('json')}
              className="flex h-[44px] w-full items-center justify-between rounded-[14px] border border-[#E2E8F0] dark:border-[#334155] bg-[#F5F7FB] dark:bg-[#0F172A] px-3.5 text-small font-semibold text-[#0E2A6D] dark:text-[#60A5FA] hover:bg-[#E2E8F0] dark:hover:bg-[#1E293B] transition"
            >
              <div className="flex items-center gap-2.5">
                <Database size={18} strokeWidth={1.75} className="text-[#D9A441]" />
                <span>JSON Export (.json)</span>
              </div>
              <ArrowRight size={16} strokeWidth={1.75} />
            </button>

            <button
              onClick={handlePrintPDF}
              className="flex h-[44px] w-full items-center justify-between rounded-[14px] border border-[#E2E8F0] dark:border-[#334155] bg-[#F5F7FB] dark:bg-[#0F172A] px-3.5 text-small font-semibold text-[#0E2A6D] dark:text-[#60A5FA] hover:bg-[#E2E8F0] dark:hover:bg-[#1E293B] transition"
            >
              <div className="flex items-center gap-2.5">
                <Printer size={18} strokeWidth={1.75} className="text-[#22C55E]" />
                <span>Print / Save as PDF</span>
              </div>
              <ArrowRight size={16} strokeWidth={1.75} />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
