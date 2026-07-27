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
  RotateCw,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  Loader2,
} from 'lucide-react';

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
  onReact?: (id: string, reaction: 'like' | 'dislike') => void;
}

export default function ChatMessage({
  message,
  onRegenerate,
  onSpeak,
  onReact,
}: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex w-full gap-3 py-3 px-2 sm:px-4 ${
        isUser ? 'justify-end' : 'justify-start'
      }`}
    >
      {/* Avatar for Assistant */}
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-[#0A2A6A] to-[#163D8C] text-white font-bold shadow-xs">
          <Bot className="h-4 w-4" />
        </div>
      )}

      <div
        className={`group relative max-w-[88%] sm:max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed shadow-2xs ${
          isUser
            ? 'bg-[#0A2A6A] text-white rounded-tr-xs'
            : 'bg-white text-[#1F2937] border border-[#E2E8F0] rounded-tl-xs'
        }`}
      >
        {/* Thinking Indicator */}
        {message.isThinking && (
          <div className="flex items-center gap-2 text-xs font-semibold text-[#163D8C]">
            <Loader2 className="h-4 w-4 animate-spin text-[#E8B24D]" />
            <Sparkles className="h-3.5 w-3.5 text-[#163D8C]" />
            <span>Analyzing college knowledge base...</span>
          </div>
        )}

        {/* Markdown Content */}
        {!message.isThinking && (
          <div className="prose prose-sm max-w-none text-current prose-headings:font-bold prose-[#0A2A6A]">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ node, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '');
                  const isInline = !match;
                  const codeString = String(children).replace(/\n$/, '');

                  return !isInline ? (
                    <div className="my-2 overflow-hidden rounded-xl border border-[#E2E8F0] bg-[#0A2A6A] text-slate-100">
                      <div className="flex items-center justify-between bg-[#163D8C] px-3 py-1.5 text-[11px] font-mono text-slate-300">
                        <span>{match ? match[1] : 'code'}</span>
                        <button
                          onClick={() => copyToClipboard(codeString)}
                          className="flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-sans hover:bg-white/20"
                        >
                          {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                          <span>{copied ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                      <pre className="overflow-x-auto p-3 text-xs font-mono">
                        <code>{children}</code>
                      </pre>
                    </div>
                  ) : (
                    <code
                      className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono text-[#0A2A6A]"
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
        )}

        {/* Footer Actions & Timestamp */}
        <div className="mt-2 flex items-center justify-between text-[10px] font-medium text-[#64748B]">
          <span className={isUser ? 'text-slate-300' : 'text-[#64748B]'}>
            {message.timestamp}
          </span>

          {/* Action buttons for assistant messages */}
          {!isUser && !message.isThinking && (
            <div className="flex items-center gap-1.5 opacity-0 transition group-hover:opacity-100">
              <button
                onClick={() => copyToClipboard(message.text)}
                title="Copy message"
                className="rounded p-1 hover:bg-[#F1F5F9] text-[#1F2937]"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
              {onSpeak && (
                <button
                  onClick={() => onSpeak(message.text)}
                  title="Read aloud"
                  className="rounded p-1 hover:bg-[#F1F5F9] text-[#1F2937]"
                >
                  <Volume2 className="h-3.5 w-3.5 text-[#163D8C]" />
                </button>
              )}
              {onRegenerate && (
                <button
                  onClick={onRegenerate}
                  title="Regenerate response"
                  className="rounded p-1 hover:bg-[#F1F5F9] text-[#1F2937]"
                >
                  <RotateCw className="h-3.5 w-3.5 text-[#163D8C]" />
                </button>
              )}
              {onReact && (
                <>
                  <button
                    onClick={() => onReact(message.id, 'like')}
                    title="Like response"
                    className={`rounded p-1 hover:bg-[#F1F5F9] ${
                      message.reaction === 'like' ? 'text-emerald-600 font-bold' : 'text-[#64748B]'
                    }`}
                  >
                    <ThumbsUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => onReact(message.id, 'dislike')}
                    title="Dislike response"
                    className={`rounded p-1 hover:bg-[#F1F5F9] ${
                      message.reaction === 'dislike' ? 'text-rose-600 font-bold' : 'text-[#64748B]'
                    }`}
                  >
                    <ThumbsDown className="h-3.5 w-3.5" />
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Avatar for User */}
      {isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#E8B24D] text-xs font-bold text-[#0A2A6A] shadow-xs">
          <User className="h-4 w-4" />
        </div>
      )}
    </motion.div>
  );
}
