import { useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Sidebar from '../components/Sidebar';
import ChatBubble from '../components/ChatBubble';
import { useAutoScroll } from '../hooks/useAutoScroll';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
}

const initialMessages: Message[] = [
  {
    id: 'welcome',
    role: 'assistant',
    text: 'Hello! I am CollegeMate AI. Ask me about attendance, fees, timetable, certificates, or campus life and I will help you politely.',
  },
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useAutoScroll(scrollRef, [messages]);

  const conversation = useMemo(
    () => messages.map((message) => `${message.role === 'user' ? 'You' : 'CollegeMate'}: ${message.text}`).join('\n'),
    [messages],
  );

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!prompt.trim()) return;

    const userMessage: Message = {
      id: String(Date.now()),
      role: 'user',
      text: prompt.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setPrompt('');
    setIsLoading(true);

    window.setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          text: `I’m reviewing your question about campus services. I’ll reply with facts from the college knowledge base and keep my answer polite.`,
        },
      ]);
      setIsLoading(false);
    }, 1000);
  }

  return (
    <div className="container grid gap-10 py-10 lg:grid-cols-[280px_1fr]">
      <Sidebar />

      <main className="flex min-h-[calc(100vh-4rem)] flex-col gap-6 rounded-[32px] border border-slate-800/80 bg-slate-950/75 p-6 shadow-glass backdrop-blur-xl">
        <div className="flex flex-col gap-3 rounded-3xl border border-slate-800/80 bg-slate-900/80 p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-sky-400/80">Chat assistant</p>
              <h2 className="text-2xl font-semibold text-white">CollegeMate AI</h2>
            </div>
            <div className="rounded-3xl bg-slate-800/80 px-4 py-2 text-sm text-slate-300">RAG-powered answers</div>
          </div>
          <p className="text-slate-400">Ask anything about the college, from attendance to bus timings. Your chat history will be stored here for convenience.</p>
        </div>

        <section className="flex-1 overflow-hidden rounded-3xl border border-slate-800/80 bg-slate-900/80">
          <div ref={scrollRef} className="flex h-[560px] flex-col gap-4 overflow-y-auto p-6 md:h-[620px]">
            {messages.map((message) => (
              <ChatBubble key={message.id} role={message.role} message={message.text} />
            ))}
            {isLoading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="inline-flex items-center gap-3 rounded-3xl bg-slate-800/90 px-4 py-3 text-slate-300">
                <span className="h-3 w-3 animate-pulse rounded-full bg-sky-400" />
                CollegeMate AI is typing...
              </motion.div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="border-t border-slate-800/80 bg-slate-950/90 p-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <label className="sr-only" htmlFor="prompt">
                Ask a question
              </label>
              <input
                id="prompt"
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                placeholder="Ask about exam schedules, library timings, fees, or college rules..."
                className="flex-1 rounded-3xl border border-slate-800/90 bg-slate-950/90 px-4 py-4 text-slate-100 outline-none transition focus:border-sky-400"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center justify-center rounded-3xl bg-gradient-to-r from-sky-500 to-violet-500 px-6 py-4 text-sm font-semibold text-slate-950 transition disabled:cursor-not-allowed disabled:opacity-60 hover:scale-[1.01]"
              >
                Send
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
