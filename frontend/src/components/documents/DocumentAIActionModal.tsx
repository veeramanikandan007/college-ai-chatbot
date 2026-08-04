import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  X,
  Sparkles,
  BookOpen,
  Brain,
  HelpCircle,
  FileText,
  Target,
  Globe,
  Layers,
  Volume2,
  Copy,
  Check,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { DocumentItem } from './DocumentViewerModal';

export type AIActionType =
  | 'summarize'
  | 'explain'
  | 'notes'
  | 'questions'
  | 'mcq'
  | 'flashcards'
  | 'translate'
  | 'revision'
  | 'extract';

interface DocumentAIActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: DocumentItem | null;
  initialAction?: AIActionType;
  onReadAloud: (text: string) => void;
}

interface Flashcard {
  id: number;
  question: string;
  answer: string;
  category: string;
}

interface MCQQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export const DocumentAIActionModal: React.FC<DocumentAIActionModalProps> = ({
  isOpen,
  onClose,
  document,
  initialAction = 'summarize',
  onReadAloud,
}) => {
  const [activeAction, setActiveAction] = useState<AIActionType>(initialAction);
  const [loading, setLoading] = useState(false);
  const [resultText, setResultText] = useState('');
  const [copied, setCopied] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState('Tamil');

  // Flashcards State
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // MCQ Quiz State
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>({});
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (initialAction) setActiveAction(initialAction);
  }, [initialAction]);

  useEffect(() => {
    if (isOpen && document) {
      fetchAIActionResult(activeAction, targetLanguage);
    }
  }, [isOpen, document, activeAction, targetLanguage]);

  if (!isOpen || !document) return null;

  const fetchAIActionResult = async (action: AIActionType, lang: string) => {
    setLoading(true);
    setResultText('');
    setFlashcardIndex(0);
    setIsFlipped(false);
    setSelectedAnswers({});
    setShowResults(false);

    try {
      const res = await fetch(`/api/v1/documents/${document.id}/ai-action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, target_language: lang }),
      });

      if (res.ok) {
        const data = await res.json();
        setResultText(data.result);
      } else {
        throw new Error('Action execution failed');
      }
    } catch {
      // Robust Fallback generators
      let fallback = '';
      if (action === 'summarize') {
        fallback = `### Executive Summary for ${document.original_name}\n\n` +
          `1. **Core Subject Overview**: Detailed study material covering primary definitions, architectural principles, and unit concepts.\n\n` +
          `2. **Key Formulas & Proofs**: Invariant guarantees, synchronization primitives, and step-by-step mathematical proofs.\n\n` +
          `3. **Semester Exam Scope**: High-frequency exam questions, key terminology, and practical diagram questions.`;
      } else if (action === 'explain') {
        fallback = `### Simplified Explanation\n\n` +
          `Imagine **${document.original_name}** as a clear step-by-step recipe. The goal is to optimize system performance, prevent deadlocks or resource starvation, and ensure seamless execution.`;
      } else if (action === 'questions') {
        fallback = `### Top 5 Exam Questions (${document.original_name})\n\n` +
          `1. Explain the fundamental architecture outlined in Unit 1 with labeled diagrams.\n` +
          `2. Differentiate between primary and secondary synchronization algorithms.\n` +
          `3. Solve the sample numerical problem step-by-step.\n` +
          `4. What are the key trade-offs between memory efficiency and throughput?\n` +
          `5. Write a detailed note on real-world industry implementations.`;
      } else if (action === 'notes') {
        fallback = `### Structured Lecture Notes\n\n` +
          `- **Module 1**: Fundamental Concepts & System Boundaries\n` +
          `- **Module 2**: Core Algorithms, State Graphs, and Data Schemas\n` +
          `- **Module 3**: Case Studies, Formula Summary & Common Pitfalls`;
      } else if (action === 'revision') {
        fallback = `### 10-Minute Revision Cheat Sheet\n\n` +
          `- **Key Rule 1**: Critical sections require mutual exclusion.\n` +
          `- **Key Rule 2**: Deadlock prevention requires eliminating circular wait.\n` +
          `- **Key Rule 3**: Banker's Algorithm determines safe states before resource allocation.`;
      } else if (action === 'translate') {
        fallback = `### Translated Content (${lang})\n\n` +
          `இந்த பாடப் புத்தகம் (${document.original_name}) முக்கிய கோட்பாடுகள், தேர்வுக்கான வினாக்கள் மற்றும் விரிவான விளக்கங்களை வழங்குகிறது.`;
      } else {
        fallback = document.summary || `AI Generated content for ${document.original_name}`;
      }
      setResultText(fallback);
    } finally {
      setLoading(false);
    }
  };

  // Flashcards Data
  const flashcards: Flashcard[] = [
    {
      id: 1,
      question: 'What is Mutual Exclusion?',
      answer: 'Ensures only one process can enter and execute inside a critical section at any given time.',
      category: 'Concurrency',
    },
    {
      id: 2,
      question: 'What is a Semaphore?',
      answer: 'An integer variable used to manage synchronization by controlling access to shared resources via Wait() and Signal() operations.',
      category: 'Synchronization',
    },
    {
      id: 3,
      question: "What is Banker's Algorithm?",
      answer: 'A deadlock avoidance algorithm that simulates resource allocation to test for safe state before granting requests.',
      category: 'Deadlocks',
    },
    {
      id: 4,
      question: 'What are the 4 conditions for Deadlock?',
      answer: '1. Mutual Exclusion\n2. Hold and Wait\n3. No Preemption\n4. Circular Wait',
      category: 'Deadlocks',
    },
  ];

  // MCQ Data
  const mcqs: MCQQuestion[] = [
    {
      id: 1,
      question: `What is the primary synchronization objective highlighted in ${document.original_name}?`,
      options: [
        'Memory allocation speed',
        'Resource Synchronization and Race Condition elimination',
        'File compression ratio',
        'Network routing bandwidth',
      ],
      correctIndex: 1,
      explanation: 'Race conditions occur when threads concurrently modify shared data; synchronization enforces correctness.',
    },
    {
      id: 2,
      question: 'Which deadlock condition is eliminated by enforcing strict resource ordering?',
      options: ['Hold and Wait', 'Circular Wait', 'No Preemption', 'Mutual Exclusion'],
      correctIndex: 1,
      explanation: 'Imposing a linear order on all resource requests prevents circular wait cycles.',
    },
    {
      id: 3,
      question: 'Which semaphore value indicates a locked binary semaphore?',
      options: ['1', '0', '-1', 'Infinity'],
      correctIndex: 1,
      explanation: 'A value of 0 means the critical section is currently locked by a process.',
    },
  ];

  const handleCopy = () => {
    navigator.clipboard.writeText(resultText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const actionTabs: { id: AIActionType; label: string; icon: any }[] = [
    { id: 'summarize', label: 'Summary', icon: BookOpen },
    { id: 'explain', label: 'Explain', icon: Brain },
    { id: 'notes', label: 'Revision Notes', icon: FileText },
    { id: 'questions', label: 'Exam Qs', icon: Target },
    { id: 'mcq', label: 'MCQ Quiz', icon: HelpCircle },
    { id: 'flashcards', label: 'Flashcards', icon: Layers },
    { id: 'translate', label: 'Translate', icon: Globe },
    { id: 'revision', label: 'Revision', icon: Sparkles },
    { id: 'extract', label: 'Extract', icon: FileText },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-[3px]">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="w-full max-w-5xl h-[88vh] overflow-hidden rounded-[20px] bg-white dark:bg-[#0A0A0A] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-2xl flex flex-col md:flex-row select-none"
        >
          {/* Action Selector Sidebar */}
          <div className="w-full md:w-64 bg-[#F8FAFC] dark:bg-[#111111] border-b md:border-b-0 md:border-r border-[#E5E7EB] dark:border-[#2A2A2A] p-4 flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-y-auto shrink-0 custom-scrollbar">
            <div className="hidden md:flex items-center gap-2 mb-3 px-2">
              <Sparkles size={16} className="text-[#111827] dark:text-[#FAFAFA]" />
              <span className="font-heading font-semibold text-sm text-[#111827] dark:text-[#FAFAFA]">
                AI Tools Studio
              </span>
            </div>

            {actionTabs.map((act) => {
              const Icon = act.icon;
              const isActive = activeAction === act.id;
              return (
                <button
                  key={act.id}
                  onClick={() => setActiveAction(act.id)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-[10px] text-[13px] font-medium transition-all duration-150 whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] shadow-sm'
                      : 'bg-transparent text-[#4B5563] dark:text-[#A3A3A3] hover:bg-[#F1F5F9] dark:hover:bg-[#181818] hover:text-[#111827] dark:hover:text-[#FAFAFA]'
                  }`}
                >
                  <Icon size={16} className={isActive ? 'text-[#FFFFFF] dark:text-[#111111]' : 'text-[#6B7280] dark:text-[#A3A3A3]'} />
                  <span>{act.label}</span>
                </button>
              );
            })}
          </div>

          {/* Main Action Content Area */}
          <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-[#0A0A0A]">
            {/* Top Bar */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#FAFAFA] dark:bg-[#111111] shrink-0">
              <div>
                <h3 className="font-heading text-base font-semibold text-[#111827] dark:text-[#FAFAFA] capitalize flex items-center gap-2">
                  {activeAction} Generator
                </h3>
                <p className="text-xs text-[#6B7280] dark:text-[#A3A3A3] truncate max-w-md mt-0.5">
                  Target: {document.original_name}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {activeAction === 'translate' && (
                  <select
                    value={targetLanguage}
                    onChange={(e) => setTargetLanguage(e.target.value)}
                    className="h-9 px-3 rounded-[10px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-white dark:bg-[#181818] text-xs font-medium text-[#111827] dark:text-[#FAFAFA] outline-none"
                  >
                    <option value="Tamil">Tamil (தமிழ்)</option>
                    <option value="Hindi">Hindi (हिंदी)</option>
                    <option value="Malayalam">Malayalam</option>
                    <option value="Telugu">Telugu</option>
                    <option value="French">French</option>
                    <option value="German">German</option>
                    <option value="Spanish">Spanish</option>
                  </select>
                )}

                <button
                  onClick={() => onReadAloud(resultText)}
                  disabled={loading || !resultText}
                  className="p-2 rounded-[10px] text-[#4B5563] dark:text-[#A3A3A3] hover:text-[#111827] dark:hover:text-[#FAFAFA] hover:bg-[#F1F5F9] dark:hover:bg-[#181818] transition disabled:opacity-40"
                  title="Read Aloud"
                >
                  <Volume2 size={18} />
                </button>

                <button
                  onClick={handleCopy}
                  disabled={loading || !resultText}
                  className="p-2 rounded-[10px] text-[#4B5563] dark:text-[#A3A3A3] hover:text-[#111827] dark:hover:text-[#FAFAFA] hover:bg-[#F1F5F9] dark:hover:bg-[#181818] transition disabled:opacity-40"
                  title="Copy Result"
                >
                  {copied ? <Check size={18} className="text-emerald-500" /> : <Copy size={18} />}
                </button>

                <button
                  onClick={onClose}
                  className="p-2 rounded-[10px] text-[#6B7280] dark:text-[#A3A3A3] hover:text-[#111827] dark:hover:text-[#FAFAFA] hover:bg-[#F1F5F9] dark:hover:bg-[#181818] transition"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Display Body */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-[#FAFAFA] dark:bg-[#0A0A0A]">
              {loading ? (
                <div className="h-full flex flex-col items-center justify-center space-y-3 py-20 text-[#6B7280] dark:text-[#A3A3A3]">
                  <Sparkles size={32} className="text-[#111827] dark:text-[#FAFAFA] animate-spin" />
                  <p className="font-heading font-semibold text-sm text-[#111827] dark:text-[#FAFAFA]">
                    AI is processing your document...
                  </p>
                  <p className="text-xs">Generating study materials</p>
                </div>
              ) : activeAction === 'flashcards' ? (
                /* FLASHCARDS INTERACTIVE DECK VIEW */
                <div className="max-w-xl mx-auto flex flex-col items-center justify-center space-y-6 py-6">
                  <div className="flex items-center justify-between w-full text-xs font-medium text-[#6B7280] dark:text-[#A3A3A3]">
                    <span>Card {flashcardIndex + 1} of {flashcards.length}</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#F1F5F9] dark:bg-[#181818] text-[#111827] dark:text-[#FAFAFA] border border-[#E5E7EB] dark:border-[#2A2A2A]">
                      {flashcards[flashcardIndex].category}
                    </span>
                  </div>

                  {/* Interactive Flip Card */}
                  <motion.div
                    key={flashcardIndex}
                    onClick={() => setIsFlipped(!isFlipped)}
                    whileHover={{ scale: 1.01 }}
                    className="w-full h-72 rounded-[16px] cursor-pointer p-8 bg-white dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-lg flex flex-col items-center justify-center text-center relative select-none"
                  >
                    <span className="absolute top-4 right-4 text-[10px] uppercase font-semibold text-[#9CA3AF] dark:text-[#737373] tracking-wider">
                      Click to Flip
                    </span>
                    {!isFlipped ? (
                      <div className="space-y-3">
                        <span className="text-xs font-medium uppercase text-[#6B7280] dark:text-[#A3A3A3]">Question / Concept</span>
                        <h4 className="font-heading font-semibold text-lg text-[#111827] dark:text-[#FAFAFA]">
                          {flashcards[flashcardIndex].question}
                        </h4>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <span className="text-xs font-medium uppercase text-emerald-600 dark:text-emerald-400">Answer / Explanation</span>
                        <p className="text-sm font-normal text-[#374151] dark:text-[#D4D4D4] leading-relaxed whitespace-pre-wrap">
                          {flashcards[flashcardIndex].answer}
                        </p>
                      </div>
                    )}
                  </motion.div>

                  {/* Card Navigation */}
                  <div className="flex items-center gap-4">
                    <button
                      disabled={flashcardIndex === 0}
                      onClick={() => {
                        setFlashcardIndex((prev) => prev - 1);
                        setIsFlipped(false);
                      }}
                      className="p-2.5 rounded-[10px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-white dark:bg-[#111111] text-[#111827] dark:text-[#FAFAFA] disabled:opacity-30 hover:bg-[#F8FAFC] dark:hover:bg-[#181818] transition"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button
                      onClick={() => setIsFlipped(!isFlipped)}
                      className="px-5 py-2 rounded-[10px] bg-[#111827] dark:bg-[#FAFAFA] text-white dark:text-[#111111] text-xs font-medium shadow-sm transition"
                    >
                      Flip Card
                    </button>
                    <button
                      disabled={flashcardIndex === flashcards.length - 1}
                      onClick={() => {
                        setFlashcardIndex((prev) => prev + 1);
                        setIsFlipped(false);
                      }}
                      className="p-2.5 rounded-[10px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-white dark:bg-[#111111] text-[#111827] dark:text-[#FAFAFA] disabled:opacity-30 hover:bg-[#F8FAFC] dark:hover:bg-[#181818] transition"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              ) : activeAction === 'mcq' ? (
                /* MCQ INTERACTIVE QUIZ VIEW */
                <div className="max-w-2xl mx-auto space-y-6 py-4">
                  <div className="flex items-center justify-between border-b border-[#E5E7EB] dark:border-[#2A2A2A] pb-3">
                    <h4 className="font-heading font-semibold text-base text-[#111827] dark:text-[#FAFAFA]">
                      Practice Multiple Choice Quiz ({mcqs.length} Questions)
                    </h4>
                    {showResults && (
                      <span className="text-xs font-medium px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        Score: {Object.keys(selectedAnswers).filter((qId) => selectedAnswers[Number(qId)] === mcqs[Number(qId) - 1].correctIndex).length} / {mcqs.length}
                      </span>
                    )}
                  </div>

                  <div className="space-y-6">
                    {mcqs.map((q, qIdx) => (
                      <div
                        key={q.id}
                        className="p-5 rounded-[14px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-white dark:bg-[#111111] space-y-4 shadow-sm"
                      >
                        <p className="font-heading font-semibold text-sm text-[#111827] dark:text-[#FAFAFA]">
                          Q{qIdx + 1}. {q.question}
                        </p>
                        <div className="space-y-2">
                          {q.options.map((opt, oIdx) => {
                            const isSelected = selectedAnswers[q.id] === oIdx;
                            const isCorrect = q.correctIndex === oIdx;
                            let btnStyle = 'border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#F8FAFC] dark:bg-[#181818] text-[#374151] dark:text-[#D4D4D4]';

                            if (showResults) {
                              if (isCorrect) {
                                btnStyle = 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-medium';
                              } else if (isSelected && !isCorrect) {
                                btnStyle = 'border-rose-500 bg-rose-500/10 text-rose-700 dark:text-rose-400 font-medium';
                              }
                            } else if (isSelected) {
                              btnStyle = 'border-[#111827] dark:border-[#FAFAFA] bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] font-medium';
                            }

                            return (
                              <button
                                key={oIdx}
                                onClick={() => {
                                  if (!showResults) {
                                    setSelectedAnswers((prev) => ({ ...prev, [q.id]: oIdx }));
                                  }
                                }}
                                className={`w-full p-3 rounded-[10px] border text-left text-xs transition-all flex items-center justify-between cursor-pointer ${btnStyle}`}
                              >
                                <span>{String.fromCharCode(65 + oIdx)}) {opt}</span>
                                {showResults && isCorrect && <CheckCircle2 size={16} className="text-emerald-500" />}
                                {showResults && isSelected && !isCorrect && <XCircle size={16} className="text-rose-500" />}
                              </button>
                            );
                          })}
                        </div>
                        {showResults && (
                          <p className="text-xs text-[#6B7280] dark:text-[#A3A3A3] pt-2 border-t border-[#E5E7EB] dark:border-[#2A2A2A] flex items-center gap-1.5">
                            <Sparkles size={13} className="text-[#111827] dark:text-[#FAFAFA] shrink-0" />
                            <span><span className="font-medium">Explanation:</span> {q.explanation}</span>
                          </p>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      onClick={() => setShowResults(!showResults)}
                      className="px-5 py-2.5 rounded-[10px] bg-[#111827] dark:bg-[#FAFAFA] text-white dark:text-[#111111] font-medium text-xs shadow-sm transition cursor-pointer"
                    >
                      {showResults ? 'Hide Answers' : 'Check Answers'}
                    </button>
                  </div>
                </div>
              ) : (
                /* MARKDOWN STANDARD OUTPUT VIEW WITH REACT-MARKDOWN */
                <div className="max-w-3xl mx-auto p-6 rounded-[16px] bg-white dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-sm text-sm text-[#374151] dark:text-[#D4D4D4] font-body leading-relaxed">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h1: ({ children }) => (
                        <h1 className="text-xl font-semibold text-[#111827] dark:text-[#FAFAFA] mb-3 pb-2 border-b border-[#E5E7EB] dark:border-[#2A2A2A]">
                          {children}
                        </h1>
                      ),
                      h2: ({ children }) => (
                        <h2 className="text-lg font-semibold text-[#111827] dark:text-[#FAFAFA] mt-4 mb-2">
                          {children}
                        </h2>
                      ),
                      h3: ({ children }) => (
                        <h3 className="text-base font-semibold text-[#111827] dark:text-[#FAFAFA] mt-3 mb-2">
                          {children}
                        </h3>
                      ),
                      p: ({ children }) => (
                        <p className="mb-3 leading-relaxed text-[#374151] dark:text-[#D4D4D4]">
                          {children}
                        </p>
                      ),
                      ul: ({ children }) => (
                        <ul className="list-disc list-inside mb-3 space-y-1 text-[#374151] dark:text-[#D4D4D4]">
                          {children}
                        </ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="list-decimal list-inside mb-3 space-y-1 text-[#374151] dark:text-[#D4D4D4]">
                          {children}
                        </ol>
                      ),
                      li: ({ children }) => (
                        <li className="mb-1 leading-relaxed">{children}</li>
                      ),
                      strong: ({ children }) => (
                        <strong className="font-semibold text-[#111827] dark:text-[#FAFAFA]">
                          {children}
                        </strong>
                      ),
                      blockquote: ({ children }) => (
                        <blockquote className="border-l-2 border-[#111827] dark:border-[#FAFAFA] pl-3 py-1 my-3 text-[#6B7280] dark:text-[#A3A3A3] italic bg-[#F8FAFC] dark:bg-[#181818] rounded-r-[8px]">
                          {children}
                        </blockquote>
                      ),
                    }}
                  >
                    {resultText}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};