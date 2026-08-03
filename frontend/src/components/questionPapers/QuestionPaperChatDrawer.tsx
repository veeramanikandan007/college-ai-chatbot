import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles, MessageSquare, BookOpen, Bot, User } from 'lucide-react';
import { QuestionPaper, askPaperRagChat } from '../../api/questionPapers';
import { useToast } from '../../context/ToastContext';

interface QuestionPaperChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  paper: QuestionPaper | null;
}

interface ChatMessageItem {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export const QuestionPaperChatDrawer: React.FC<QuestionPaperChatDrawerProps> = ({
  isOpen,
  onClose,
  paper,
}) => {
  const { showToast } = useToast();

  const [inputQuery, setInputQuery] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [sending, setSending] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (paper && isOpen && messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          sender: 'ai',
          text: `Hello! I am your AI assistant for ${paper.subject_name} (${paper.subject_code}). Ask me to explain any question, summarize units, or predict exam questions!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  }, [paper, isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen || !paper) return null;

  const quickPrompts = [
    'Explain Question 5',
    'Generate answer',
    'Summarize Unit 3',
    'Predict important questions',
    'Show repeated questions',
  ];

  const handleSend = async (queryText?: string) => {
    const textToSend = (queryText || inputQuery).trim();
    if (!textToSend || sending) return;

    const userMsg: ChatMessageItem = {
      id: Math.random().toString(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setSending(true);

    try {
      const response = await askPaperRagChat(paper.id, textToSend);
      const aiMsg: ChatMessageItem = {
        id: Math.random().toString(),
        sender: 'ai',
        text: response.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      showToast(err.message || 'AI RAG response failed', 'error');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-lg bg-[#FFFFFF] dark:bg-[#181818] h-full shadow-lg flex flex-col border-l border-[#D1D5DB] dark:border-[#3F3F46]">
        {/* Drawer Header */}
        <div className="p-4 border-b border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#F8FAFC] dark:bg-[#111111] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[10px] bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] flex items-center justify-center shrink-0">
              <MessageSquare size={20} />
            </div>
            <div className="min-w-0">
              <h3 className="text-[14px] font-bold text-[#111827] dark:text-[#FAFAFA] truncate">
                AI Question Paper Chat
              </h3>
              <p className="text-[12px] text-[#6B7280] dark:text-[#A3A3A3] truncate">
                {paper.subject_code} - {paper.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#6B7280] dark:text-[#A3A3A3] hover:text-[#111827] dark:hover:text-[#FAFAFA] cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Quick Prompts Bar */}
        <div className="px-4 py-2.5 bg-[#F8FAFC] dark:bg-[#111111] border-b border-[#E5E7EB] dark:border-[#2A2A2A] overflow-x-auto flex items-center gap-2">
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              disabled={sending}
              className="h-8 px-3 rounded-[6px] bg-[#FFFFFF] dark:bg-[#181818] text-[#111827] dark:text-[#FAFAFA] border border-[#D1D5DB] dark:border-[#3F3F46] text-[12px] font-medium hover:bg-[#F9FAFB] dark:hover:bg-[#232323] transition-colors whitespace-nowrap cursor-pointer"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Chat Messages */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${
                msg.sender === 'user' ? 'flex-row-reverse' : ''
              }`}
            >
              <div
                className={`w-8 h-8 rounded-[8px] flex items-center justify-center shrink-0 ${
                  msg.sender === 'user'
                    ? 'bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111]'
                    : 'bg-[#F8FAFC] dark:bg-[#111111] text-[#111827] dark:text-[#FAFAFA] border border-[#D1D5DB] dark:border-[#3F3F46]'
                }`}
              >
                {msg.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>

              <div
                className={`max-w-[80%] p-4 rounded-[12px] text-[14px] leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-[#111827] text-[#FFFFFF] dark:bg-[#FAFAFA] dark:text-[#111111] rounded-tr-none'
                    : 'bg-[#F8FAFC] dark:bg-[#111111] text-[#111827] dark:text-[#FAFAFA] rounded-tl-none border border-[#E5E7EB] dark:border-[#2A2A2A] whitespace-pre-wrap'
                }`}
              >
                <p>{msg.text}</p>
                <span
                  className={`block text-[10px] mt-1.5 text-right ${
                    msg.sender === 'user' ? 'opacity-70' : 'text-[#6B7280] dark:text-[#A3A3A3]'
                  }`}
                >
                  {msg.timestamp}
                </span>
              </div>
            </div>
          ))}

          {sending && (
            <div className="flex items-center gap-2 text-[14px] font-medium text-[#6B7280] dark:text-[#A3A3A3] p-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#111827] dark:border-[#FAFAFA] border-t-transparent" />
              <span>Analyzing paper & generating answer...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#FFFFFF] dark:bg-[#181818]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask a question about this paper..."
              className="flex-1 h-10 px-4 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#181818] text-[#111827] dark:text-[#FAFAFA] text-[14px] outline-none"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim() || sending}
              className="h-10 px-4 rounded-[10px] bg-[#111827] hover:bg-[#000000] dark:bg-[#FAFAFA] dark:hover:bg-[#E5E5E5] text-[#FFFFFF] dark:text-[#111111] font-medium text-[14px] shadow-xs cursor-pointer disabled:opacity-50 flex items-center justify-center"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
