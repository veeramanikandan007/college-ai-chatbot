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
        <div className="flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-[12px]
                        bg-[#111827] dark:bg-[#FFFFFF]
                        text-[#FFFFFF] dark:text-[#111111]
                        border border-[#111827] dark:border-[#FFFFFF]
                        shadow-[0_1px_4px_rgba(0,0,0,0.08)]">
          <Bot size={20} strokeWidth={1.75} />
        </div>
      )}

      <div
        className={`group relative max-w-[92%] sm:max-w-[88%] md:max-w-[85%] lg:max-w-[82%] rounded-xl p-3.5 sm:p-4 shadow-xs transition-all duration-200 break-words font-body text-[14px] font-normal leading-[1.6] ${
          isUser
            ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded-tr-xs'
            : 'bg-white dark:bg-zinc-900/90 text-zinc-900 dark:text-zinc-100 border border-zinc-200/80 dark:border-zinc-800 rounded-tl-xs'
        }`}
      >
        {/* Thinking Indicator */}
        {message.isThinking && (
          <div className="flex items-center gap-2 text-xs font-semibold text-[#6B7280] dark:text-[#A3A3A3] py-1">
            <Loader2 className="h-4 w-4 animate-spin text-[#111827] dark:text-[#FAFAFA]" />
            <span>Analyzing college knowledge base…</span>
          </div>
        )}

        {/* Editing Inline Form */}
        {isEditing ? (
          <div className="space-y-2">
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="w-full rounded-[8px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#181818] p-2 text-sm text-[#111827] dark:text-[#FAFAFA] outline-none focus:border-[#111827] dark:focus:border-[#FAFAFA] focus:ring-1 focus:ring-[#111827]/10 dark:focus:ring-[#FAFAFA]/10"
              rows={3}
            />
            <div className="flex items-center justify-end gap-2 text-xs">
              <button
                onClick={() => setIsEditing(false)}
                className="flex items-center gap-1 rounded-[6px] px-2.5 py-1 text-[#6B7280] dark:text-[#A3A3A3] hover:bg-[#F9FAFB] dark:hover:bg-[#232323] transition"
              >
                <X className="h-3.5 w-3.5" />
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="flex items-center gap-1 rounded-[6px] bg-[#111827] dark:bg-[#FFFFFF] px-3 py-1 text-[#FFFFFF] dark:text-[#111111] font-semibold shadow-xs transition hover:bg-[#1F2937] dark:hover:bg-[#F0F0F0]"
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
                      <div className="my-2 overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-900 text-zinc-100 shadow-xs">
                        <div className="flex items-center justify-between bg-zinc-800/80 px-3 py-1.5 text-[11px] font-mono text-zinc-400">
                          <span>{match ? match[1] : 'code'}</span>
                          <button
                            onClick={() => copyToClipboard(codeString, 1)}
                            className="flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-sans hover:bg-white/10 transition text-zinc-300"
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
                        className="rounded bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 text-xs font-mono text-zinc-900 dark:text-zinc-100"
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
                <span className="inline-block h-4 w-1.5 ml-1 bg-[#111827] dark:bg-[#FAFAFA] opacity-70 animate-pulse" />
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
              <span className="text-[#111827] dark:text-[#FAFAFA] flex items-center gap-1 font-bold">
                <span className="w-1 h-1 rounded-full bg-[#111827] dark:bg-[#FAFAFA] animate-ping" />
                Speaking...
              </span>
            )}
            {!isSpeakingThisMsg && isFinishedThisMsg && (
              <span className="text-[#6B7280] dark:text-[#A3A3A3] font-semibold flex items-center gap-1">
                <Check size={14} strokeWidth={1.75} />
                <span>Read</span>
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
                  className={`rounded-[6px] p-1 transition ${
                    isSpeakingThisMsg
                      ? 'bg-[#111827]/10 dark:bg-[#FAFAFA]/10 text-[#111827] dark:text-[#FAFAFA]'
                      : 'hover:bg-[#F9FAFB] dark:hover:bg-[#232323] text-[#6B7280] dark:text-[#A3A3A3]'
                  }`}
                >
                  {isSpeakingThisMsg ? (
                    <div className="flex items-center gap-[1.5px] h-3 px-0.5">
                      {[1, 2, 3].map((b) => (
                        <motion.span
                          key={b}
                          animate={{ scaleY: [0.3, 1, 0.3] }}
                          transition={{ duration: 0.8, repeat: Infinity, delay: b * 0.15 }}
                          className="w-[1.5px] h-full bg-[#111827] dark:bg-[#FAFAFA] rounded-full"
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
                {copied ? <Check size={16} strokeWidth={1.75} className="text-[#111827] dark:text-[#FAFAFA]" /> : <Copy size={16} strokeWidth={1.75} />}
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
                      className="rounded-[6px] p-1 hover:bg-[#F9FAFB] dark:hover:bg-[#232323] text-[#6B7280] dark:text-[#A3A3A3] transition"
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
                          message.reaction === 'like' ? 'text-[#111827] dark:text-[#FAFAFA] font-bold' : 'text-[#6B7280] dark:text-[#A3A3A3]'
                        }`}
                      >
                        <ThumbsUp size={16} strokeWidth={1.75} />
                      </button>
                      <button
                        onClick={() => onReact(message.id, 'dislike')}
                        title="Dislike response"
                        className={`rounded p-1 hover:bg-[#F1F5F9] dark:hover:bg-slate-800 transition ${
                          message.reaction === 'dislike' ? 'text-[#111827] dark:text-[#FAFAFA] font-bold' : 'text-[#6B7280] dark:text-[#A3A3A3]'
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


