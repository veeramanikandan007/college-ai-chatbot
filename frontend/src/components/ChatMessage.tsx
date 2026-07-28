import { useState } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Bot,
  User,
  Copy,
  Check,
  Volume2,
  VolumeX,
  RotateCw,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export interface ChatMessageData {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  isStreaming?: boolean;
  isThinking?: boolean;
  reaction?: 'like' | 'dislike' | null;
}

interface ChatMessageProps {
  message: ChatMessageData;
  onRegenerate?: () => void;
  onSpeak?: (text: string) => void;
  onStopSpeech?: () => void;
  onReact?: (id: string, reaction: 'like' | 'dislike') => void;
  isSpeaking?: boolean;
}

// ── Thinking animation (3 pulsing dots) ────────────────────────────────────────
function ThinkingDots() {
  return (
    <div className="flex items-center gap-1.5 py-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-2 w-2 rounded-full bg-[#163D8C]"
          animate={{ scale: [0.6, 1, 0.6], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.18, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}

// ── Inline code component ───────────────────────────────────────────────────────
function InlineCode({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded bg-[#0A2A6A]/8 px-1.5 py-0.5 text-[0.8em] font-mono text-[#0A2A6A]">
      {children}
    </code>
  );
}

export default function ChatMessage({
  message,
  onRegenerate,
  onSpeak,
  onStopSpeech,
  onReact,
  isSpeaking = false,
}: ChatMessageProps) {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const userInitials = user?.initials ?? 'ME';

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API not available
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
      className={`flex w-full items-start gap-3 py-2 px-1 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {/* Assistant Avatar */}
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-[#0A2A6A] to-[#163D8C] text-white shadow-sm shadow-[#0A2A6A]/20 mt-0.5">
          <Bot className="h-4 w-4" />
        </div>
      )}

      <div
        className={`group relative max-w-[88%] sm:max-w-[80%] rounded-2xl p-3.5 text-sm leading-relaxed shadow-sm ${
          isUser
            ? 'bg-[#0A2A6A] text-white rounded-tr-sm'
            : 'bg-white text-[#1F2937] border border-[#E2E8F0] rounded-tl-sm'
        }`}
      >
        {/* ── Thinking State ───────────────────────────────────── */}
        {message.isThinking && (
          <div className="flex items-center gap-2.5">
            <Sparkles className="h-3.5 w-3.5 text-[#E8B24D] shrink-0" />
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#163D8C]">
              <span>Thinking</span>
              <ThinkingDots />
            </div>
          </div>
        )}

        {/* ── Markdown Content ─────────────────────────────────── */}
        {!message.isThinking && (
          <>
            <div className={`prose prose-sm max-w-none ${isUser ? 'prose-invert' : 'prose-[#1F2937]'}`}>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  // Block code with copy button
                  code({ className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    const isBlock = !!match;
                    const codeString = String(children).replace(/\n$/, '');

                    if (!isBlock) {
                      return <InlineCode>{children}</InlineCode>;
                    }

                    return (
                      <div className="my-2 overflow-hidden rounded-xl border border-[#E2E8F0]">
                        <div className="flex items-center justify-between bg-[#163D8C] px-3 py-1.5 text-[11px] font-mono text-slate-300">
                          <span>{match[1]}</span>
                          <button
                            onClick={() => copyToClipboard(codeString)}
                            className="flex items-center gap-1.5 rounded px-2 py-0.5 text-[10px] font-sans hover:bg-white/20 transition"
                          >
                            {copied
                              ? <Check className="h-3 w-3 text-emerald-400" />
                              : <Copy className="h-3 w-3" />
                            }
                            <span>{copied ? 'Copied!' : 'Copy'}</span>
                          </button>
                        </div>
                        <pre className="overflow-x-auto bg-[#0A2A6A] p-3 text-xs font-mono text-slate-100">
                          <code>{children}</code>
                        </pre>
                      </div>
                    );
                  },
                  // Tables
                  table({ children }) {
                    return (
                      <div className="overflow-x-auto rounded-xl border border-[#E2E8F0] my-2">
                        <table className="w-full text-xs">{children}</table>
                      </div>
                    );
                  },
                  th({ children }) {
                    return <th className="bg-[#F8FAFC] px-3 py-2 text-left text-[#0A2A6A] font-bold border-b border-[#E2E8F0]">{children}</th>;
                  },
                  td({ children }) {
                    return <td className="px-3 py-2 border-b border-[#F1F5F9] text-[#1F2937]">{children}</td>;
                  },
                  blockquote({ children }) {
                    return (
                      <blockquote className="border-l-4 border-[#E8B24D] bg-[#FFF9ED] pl-3 py-1 rounded-r-lg my-2 text-[#0A2A6A] italic">
                        {children}
                      </blockquote>
                    );
                  },
                }}
              >
                {message.text}
              </ReactMarkdown>

              {/* Streaming cursor */}
              {message.isStreaming && (
                <span className="typing-cursor" aria-hidden="true" />
              )}
            </div>

            {/* ── Footer: timestamp + actions ─────────────────── */}
            <div className={`mt-2 flex items-center justify-between text-[10px] font-medium ${isUser ? 'text-blue-200' : 'text-[#94A3B8]'}`}>
              <span>{message.timestamp}</span>

              {!isUser && !message.isStreaming && (
                <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  {/* Copy message */}
                  <button
                    onClick={() => copyToClipboard(message.text)}
                    title="Copy message"
                    className="rounded-lg p-1 hover:bg-[#F1F5F9] text-[#64748B] hover:text-[#0A2A6A] transition"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>

                  {/* Text-to-Speech */}
                  {onSpeak && (
                    <button
                      onClick={() => isSpeaking ? onStopSpeech?.() : onSpeak(message.text)}
                      title={isSpeaking ? 'Stop reading' : 'Read aloud'}
                      className={`rounded-lg p-1 hover:bg-[#F1F5F9] transition ${isSpeaking ? 'text-rose-500' : 'text-[#64748B] hover:text-[#163D8C]'}`}
                    >
                      {isSpeaking ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
                    </button>
                  )}

                  {/* Regenerate */}
                  {onRegenerate && (
                    <button
                      onClick={onRegenerate}
                      title="Regenerate response"
                      className="rounded-lg p-1 hover:bg-[#F1F5F9] text-[#64748B] hover:text-[#163D8C] transition"
                    >
                      <RotateCw className="h-3.5 w-3.5" />
                    </button>
                  )}

                  {/* Reactions */}
                  {onReact && (
                    <>
                      <button
                        onClick={() => onReact(message.id, 'like')}
                        title="Helpful"
                        className={`rounded-lg p-1 hover:bg-[#F1F5F9] transition ${message.reaction === 'like' ? 'text-emerald-600' : 'text-[#64748B]'}`}
                      >
                        <ThumbsUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => onReact(message.id, 'dislike')}
                        title="Not helpful"
                        className={`rounded-lg p-1 hover:bg-[#F1F5F9] transition ${message.reaction === 'dislike' ? 'text-rose-600' : 'text-[#64748B]'}`}
                      >
                        <ThumbsDown className="h-3.5 w-3.5" />
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#E8B24D] text-xs font-bold text-[#0A2A6A] shadow-sm mt-0.5">
          {userInitials}
        </div>
      )}
    </motion.div>
  );
}
