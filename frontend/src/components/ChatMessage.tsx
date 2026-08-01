import { useState } from 'react';
import { motion } from 'framer-motion';
import { userMessageVariants, aiMessageVariants } from '../lib/animations';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import toast from 'react-hot-toast';
import { useVoiceStore } from '../store/useVoiceStore';
import { useAuth } from '../hooks/useAuth';
import UserAvatar from './UserAvatar';
import {
  Bot,
  CircleUserRound,
  Copy,
  Check,
  Volume2,
  VolumeX,
  RotateCcw,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  Loader2,
  Pencil,
  Trash2,
  X,
  Share2,
  FileText,
} from 'lucide-react';

export interface ChatMessageData {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  isStreaming?: boolean;
  isThinking?: boolean;
  reaction?: 'like' | 'dislike' | null;
  sources?: Array<{ title: string; page?: number; score?: number }>;
}

interface ChatMessageProps {
  message: ChatMessageData;
  onRegenerate?: () => void;
  onSpeak?: (text: string) => void;
  onStopSpeak?: () => void;
  isSpeakingThis?: boolean;
  onReact?: (id: string, reaction: 'like' | 'dislike') => void;
  onEdit?: (id: string, newText: string) => void;
  onDelete?: (id: string) => void;
  onRetry?: (id: string) => void;
}

export default function ChatMessage({
  message,
  onRegenerate,
  onSpeak,
  onStopSpeak,
  isSpeakingThis = false,
  onReact,
  onEdit,
  onDelete,
  onRetry,
}: ChatMessageProps) {
  const { activeMessageId, finishedMessageIds, voiceState } = useVoiceStore();
  const { user } = useAuth();
  const isSpeakingThisMsg = activeMessageId === message.id && voiceState === 'speaking';
  const isFinishedThisMsg = finishedMessageIds.includes(message.id);

  const [copied, setCopied] = useState(false);
  const [copiedCodeIndex, setCopiedCodeIndex] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.text);
  const isUser = message.role === 'user';

  const copyToClipboard = async (text: string, isCodeBlockIndex?: number) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
      if (isCodeBlockIndex !== undefined) {
        setCopiedCodeIndex(isCodeBlockIndex);
        setTimeout(() => setCopiedCodeIndex(null), 2000);
      } else {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
      toast.success('Copied to clipboard!');
    } catch (err) {
      console.error('Copy failed:', err);
      toast.error('Failed to copy');
    }
  };

  const handleSaveEdit = () => {
    if (editText.trim() && onEdit) {
      onEdit(message.id, editText.trim());
      setIsEditing(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'CollegeMate AI Response',
        text: message.text,
      }).catch(() => {});
    } else {
      copyToClipboard(message.text);
    }
  };

  return (
    <motion.div
      variants={isUser ? userMessageVariants : aiMessageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      layout
      className={`flex w-full gap-3 py-3 px-2 sm:px-4 ${
        isUser ? 'justify-end' : 'justify-start'
      }`}
    >
      {/* Avatar for Assistant */}
      {!isUser && (
        <div className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-[#0E2A6D] to-[#1E4DB7] text-white font-bold shadow-xs border border-[#D9A441]/30">
          <Bot size={16} strokeWidth={1.75} />
        </div>
      )}

      <div
        className={`group relative max-w-[92%] sm:max-w-[88%] md:max-w-[85%] lg:max-w-[82%] rounded-xl p-3.5 sm:p-4 shadow-xs transition-all duration-200 break-words font-body text-[14px] font-medium leading-[1.5] ${
          isUser
            ? 'bg-[#0E2A6D] dark:bg-[#1E293B] text-white rounded-tr-xs'
            : 'bg-white dark:bg-[#1E293B] text-[#1F2937] dark:text-[#F8FAFC] border border-[#E2E8F0] dark:border-[#334155] rounded-tl-xs'
        }`}
      >
        {/* Thinking Indicator */}
        {message.isThinking && (
          <div className="flex items-center gap-2 text-xs font-semibold text-[#1E3A8A] dark:text-[#60A5FA] py-1">
            <Loader2 className="h-4 w-4 animate-spin text-[#F59E0B]" />
            <Sparkles className="h-3.5 w-3.5 text-[#1E3A8A] dark:text-[#60A5FA] animate-pulse" />
            <span>Analyzing college knowledge base...</span>
          </div>
        )}

        {/* Editing Inline Form */}
        {isEditing ? (
          <div className="space-y-2">
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950 p-2 text-sm text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-[#0A2A6A]"
              rows={3}
            />
            <div className="flex items-center justify-end gap-2 text-xs">
              <button
                onClick={() => setIsEditing(false)}
                className="flex items-center gap-1 rounded-md px-2.5 py-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-3.5 w-3.5" />
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="flex items-center gap-1 rounded-md bg-[#0A2A6A] dark:bg-secondary px-3 py-1 text-white dark:text-slate-900 font-semibold shadow-xs"
              >
                Save & Submit
              </button>
            </div>
          </div>
        ) : (
          /* Markdown Content */
          !message.isThinking && (
            <div className="prose prose-sm max-w-none text-current prose-headings:font-bold prose-p:my-1.5 prose-ul:my-1.5 prose-ol:my-1.5 prose-table:border-collapse prose-th:border prose-th:border-slate-300 dark:prose-th:border-slate-700 prose-th:p-2 prose-td:border prose-td:border-slate-300 dark:prose-td:border-slate-700 prose-td:p-2 dark:prose-invert">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ node, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    const isInline = !match;
                    const codeString = String(children).replace(/\n$/, '');

                    return !isInline ? (
                      <div className="my-2 overflow-hidden rounded-xl border border-[#E2E8F0] dark:border-slate-700 bg-[#0A2A6A] text-slate-100 shadow-sm">
                        <div className="flex items-center justify-between bg-[#163D8C] dark:bg-slate-800 px-3 py-1.5 text-[11px] font-mono text-slate-300">
                          <span>{match ? match[1] : 'code'}</span>
                          <button
                            onClick={() => copyToClipboard(codeString, 1)}
                            className="flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-sans hover:bg-white/20 transition active:scale-95 text-slate-200"
                          >
                            {copiedCodeIndex === 1 ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                            <span>{copiedCodeIndex === 1 ? 'Copied' : 'Copy Code'}</span>
                          </button>
                        </div>
                        <pre className="overflow-x-auto p-3 text-xs font-mono">
                          <code>{children}</code>
                        </pre>
                      </div>
                    ) : (
                      <code
                        className="rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-xs font-mono text-[#0A2A6A] dark:text-secondary"
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {message.text}
              </ReactMarkdown>

              {/* Streaming Pulse Cursor */}
              {message.isStreaming && (
                <span className="inline-block h-4 w-1.5 ml-1 bg-[#E8B24D] animate-pulse" />
              )}


            </div>
          )
        )}

        {/* Footer Actions & Timestamp */}
        <div className="mt-2 flex items-center justify-between text-[10px] font-medium text-[#64748B] dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span className={isUser ? 'text-slate-300' : 'text-[#64748B] dark:text-slate-400'}>
              {message.timestamp}
            </span>
            {isSpeakingThisMsg && (
              <span className="text-primary dark:text-[#60A5FA] flex items-center gap-1 font-bold">
                <span className="w-1 h-1 rounded-full bg-primary dark:bg-[#60A5FA] animate-ping" />
                Speaking...
              </span>
            )}
            {!isSpeakingThisMsg && isFinishedThisMsg && (
              <span className="text-[#22C55E] font-bold flex items-center gap-1">
                <Check size={14} strokeWidth={1.75} />
                <span>Read Complete</span>
              </span>
            )}
          </div>

          {/* Action buttons for messages */}
          {!message.isThinking && !isEditing && (
            <div className="flex items-center gap-1.5 opacity-90 sm:opacity-0 transition group-hover:opacity-100">
              {/* Speaker / Read Aloud Button */}
              {!isUser && onSpeak && (
                <button
                  onClick={() => (isSpeakingThisMsg && onStopSpeak ? onStopSpeak() : onSpeak(message.text))}
                  title={isSpeakingThisMsg ? 'Stop speaking' : 'Read response aloud'}
                  className={`rounded p-1 transition ${
                    isSpeakingThisMsg
                      ? 'bg-primary/10 text-primary dark:text-[#60A5FA]'
                      : 'hover:bg-[#F1F5F9] dark:hover:bg-slate-800 text-muted'
                  }`}
                >
                  {isSpeakingThisMsg ? (
                    <div className="flex items-center gap-[1.5px] h-3 px-0.5">
                      {[1, 2, 3].map((b) => (
                        <motion.span
                          key={b}
                          animate={{ scaleY: [0.3, 1, 0.3] }}
                          transition={{ duration: 0.8, repeat: Infinity, delay: b * 0.15 }}
                          className="w-[1.5px] h-full bg-primary dark:bg-[#60A5FA] rounded-full"
                        />
                      ))}
                    </div>
                  ) : (
                    <Volume2 size={16} strokeWidth={1.75} />
                  )}
                </button>
              )}

              {/* Copy Button */}
              <button
                onClick={() => copyToClipboard(message.text)}
                title="Copy message text"
                className={`rounded p-1 transition ${
                  isUser ? 'hover:bg-white/20 text-white' : 'hover:bg-[#F1F5F9] dark:hover:bg-slate-800 text-[#1F2937] dark:text-slate-300'
                }`}
              >
                {copied ? <Check size={16} strokeWidth={1.75} className="text-emerald-400" /> : <Copy size={16} strokeWidth={1.75} />}
              </button>

              {/* User Actions: Edit, Delete, Retry */}
              {isUser && onEdit && (
                <button
                  onClick={() => setIsEditing(true)}
                  title="Edit message"
                  className="rounded p-1 hover:bg-white/20 text-white transition"
                >
                  <Pencil size={16} strokeWidth={1.75} />
                </button>
              )}

              {isUser && onRetry && (
                <button
                  onClick={() => onRetry(message.id)}
                  title="Retry prompt"
                  className="rounded p-1 hover:bg-white/20 text-white transition"
                >
                  <RotateCcw size={16} strokeWidth={1.75} />
                </button>
              )}

              {onDelete && (
                <button
                  onClick={() => onDelete(message.id)}
                  title="Delete message"
                  className={`rounded p-1 transition ${
                    isUser ? 'hover:bg-white/20 text-white' : 'hover:bg-[#F1F5F9] dark:hover:bg-slate-800 text-rose-500'
                  }`}
                >
                  <Trash2 size={16} strokeWidth={1.75} />
                </button>
              )}

              {/* Assistant Actions: Share, Regenerate, Like/Dislike */}
              {!isUser && (
                <>
                  <button
                    onClick={handleShare}
                    title="Share response"
                    className="rounded p-1 hover:bg-[#F1F5F9] dark:hover:bg-slate-800 text-[#64748B] dark:text-slate-400 transition"
                  >
                    <Share2 size={16} strokeWidth={1.75} />
                  </button>

                  {onRegenerate && (
                    <button
                      onClick={onRegenerate}
                      title="Regenerate response"
                      className="rounded p-1 hover:bg-[#F1F5F9] dark:hover:bg-slate-800 text-[#163D8C] dark:text-secondary transition"
                    >
                      <RotateCcw size={16} strokeWidth={1.75} />
                    </button>
                  )}

                  {onReact && (
                    <>
                      <button
                        onClick={() => onReact(message.id, 'like')}
                        title="Like response"
                        className={`rounded p-1 hover:bg-[#F1F5F9] dark:hover:bg-slate-800 transition ${
                          message.reaction === 'like' ? 'text-emerald-600 font-bold' : 'text-[#64748B] dark:text-slate-400'
                        }`}
                      >
                        <ThumbsUp size={16} strokeWidth={1.75} />
                      </button>
                      <button
                        onClick={() => onReact(message.id, 'dislike')}
                        title="Dislike response"
                        className={`rounded p-1 hover:bg-[#F1F5F9] dark:hover:bg-slate-800 transition ${
                          message.reaction === 'dislike' ? 'text-rose-600 font-bold' : 'text-[#64748B] dark:text-slate-400'
                        }`}
                      >
                        <ThumbsDown size={16} strokeWidth={1.75} />
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Avatar for User */}
      {isUser && <UserAvatar user={user} size="sm" />}
    </motion.div>
  );
}


