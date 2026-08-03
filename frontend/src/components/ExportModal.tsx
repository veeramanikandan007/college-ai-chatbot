import { motion, AnimatePresence } from "framer-motion";
import { Download, X, FileText, FileCode, Database, Printer, ArrowRight } from "lucide-react";
import { ChatMessageData } from "./ChatMessage";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  chatTitle: string;
  messages: ChatMessageData[];
}

const formats = [
  { id: "txt",  label: "Plain Text",      ext: ".txt",  icon: FileText },
  { id: "md",   label: "Markdown",        ext: ".md",   icon: FileCode },
  { id: "json", label: "JSON Export",     ext: ".json", icon: Database },
  { id: "pdf",  label: "Print / Save as PDF", ext: "",  icon: Printer  },
] as const;

export default function ExportModal({ isOpen, onClose, chatTitle, messages }: ExportModalProps) {
  if (!isOpen) return null;

  const downloadText = (format: "txt" | "md" | "json") => {
    let content = "";
    const filename = `${chatTitle.replace(/\s+/g, "_").toLowerCase()}.${format}`;
    if (format === "json") {
      content = JSON.stringify({ title: chatTitle, messages }, null, 2);
    } else {
      content = `# ${chatTitle}\n\n` +
        messages.map((m) => `[${m.timestamp}] ${m.role === "user" ? "You" : "CollegeMate AI"}:\n${m.text}\n`).join("\n---\n\n");
    }
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
    onClose();
  };

  const handleAction = (id: string) => {
    if (id === "pdf") { window.print(); onClose(); }
    else downloadText(id as "txt" | "md" | "json");
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-[3px]"
        />

        {/* Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.93, y: 16, filter: "blur(4px)" }}
          animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, scale: 0.95, y: 8 }}
          transition={{ type: "spring", stiffness: 420, damping: 30 }}
          className="relative w-full max-w-[360px] rounded-[20px]
                     bg-[#FFFFFF] dark:bg-[#111111]
                     border border-[#E5E7EB] dark:border-[#2A2A2A]
                     shadow-[0_24px_64px_-8px_rgba(0,0,0,0.18)] dark:shadow-[0_24px_64px_-8px_rgba(0,0,0,0.6)]
                     p-5 select-none overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#111827] dark:bg-[#FAFAFA] text-white dark:text-[#111111]">
                <Download size={17} strokeWidth={1.75} />
              </div>
              <div>
                <h3 className="text-[14px] font-semibold text-[#111827] dark:text-[#FAFAFA] leading-tight">Export Conversation</h3>
                <p className="text-[11px] text-[#9CA3AF] dark:text-[#737373] leading-tight mt-0.5 truncate max-w-[200px]">"{chatTitle}"</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-[8px] text-[#9CA3AF] dark:text-[#737373] hover:bg-[#F3F4F6] dark:hover:bg-[#1A1A1A] transition-colors"
            >
              <X size={16} strokeWidth={1.75} />
            </motion.button>
          </div>

          <p className="text-[12px] text-[#6B7280] dark:text-[#A3A3A3] mb-3">
            Choose a format to download:
          </p>

          {/* Format buttons — staggered */}
          <div className="space-y-2">
            {formats.map((fmt, i) => {
              const Icon = fmt.icon;
              return (
                <motion.button
                  key={fmt.id}
                  onClick={() => handleAction(fmt.id)}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.16, delay: i * 0.05, ease: "easeOut" }}
                  whileHover={{ x: 3 }}
                  whileTap={{ scale: 0.98 }}
                  className="group flex h-[44px] w-full items-center justify-between
                             rounded-[12px] px-3.5
                             border border-[#E5E7EB] dark:border-[#2A2A2A]
                             bg-[#F9FAFB] dark:bg-[#1A1A1A]
                             hover:bg-[#F3F4F6] dark:hover:bg-[#252525]
                             hover:border-[#D1D5DB] dark:hover:border-[#3F3F46]
                             transition-colors duration-150"
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      size={16}
                      strokeWidth={1.75}
                      className="text-[#6B7280] dark:text-[#A3A3A3] group-hover:text-[#111827] dark:group-hover:text-[#FAFAFA] transition-colors duration-150 shrink-0"
                    />
                    <span className="text-[13px] font-medium text-[#374151] dark:text-[#D4D4D4] group-hover:text-[#111827] dark:group-hover:text-[#FAFAFA] transition-colors duration-150">
                      {fmt.label}
                      {fmt.ext && <span className="ml-1 text-[11px] text-[#9CA3AF] dark:text-[#737373]">{fmt.ext}</span>}
                    </span>
                  </div>
                  <motion.div
                    initial={{ opacity: 0, x: -4 }}
                    whileHover={{ opacity: 1, x: 0 }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                  >
                    <ArrowRight size={14} strokeWidth={1.75} className="text-[#9CA3AF] dark:text-[#737373]" />
                  </motion.div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}