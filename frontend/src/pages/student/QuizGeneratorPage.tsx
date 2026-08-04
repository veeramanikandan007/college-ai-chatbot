import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Brain,
  Sparkles,
  HelpCircle,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  Award,
  BarChart2,
  BookOpen,
  Sliders,
  Check,
  AlertTriangle,
  History,
  Trash2,
  ArrowRight,
  UploadCloud,
  Layers,
  Zap,
  Target,
  FileCode,
  FileUp,
  Search,
  CheckCircle,
  Share2,
  Download,
  Filter,
} from 'lucide-react';

interface DocumentItem {
  id: number;
  filename: string;
  original_name: string;
  file_type: string;
  folder_name?: string;
  category?: string;
  summary?: string;
}

interface Question {
  id: number;
  type: 'MCQ' | 'True/False' | 'Fill in the Blanks' | 'Short Answer' | string;
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
  user_answer?: string;
  is_correct?: boolean;
}

interface QuizAttempt {
  id: number;
  title: string;
  document_name: string;
  subject: string;
  difficulty: string;
  quiz_type: string;
  score: number;
  total_questions: number;
  percentage: number;
  correct_answers: number;
  wrong_answers: number;
  time_taken_seconds: number;
  created_at: string;
  questions_data?: Question[];
}

export default function QuizGeneratorPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // Navigation & Tab State
  const [activeTab, setActiveTab] = useState<'create' | 'history'>('create');
  const [viewState, setViewState] = useState<'config' | 'active' | 'results'>('config');

  // Documents & Selection
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);
  const [loadingDocs, setLoadingDocs] = useState(true);

  // Quiz Configuration State
  const [numQuestions, setNumQuestions] = useState<number>(5);
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [quizType, setQuizType] = useState<'MCQ' | 'True/False' | 'Fill in the Blanks' | 'Short Answer' | 'Mixed'>('MCQ');
  const [timerOption, setTimerOption] = useState<number>(0); // 0 = off, 300 = 5m, 600 = 10m, 900 = 15m

  // Active Quiz State
  const [generating, setGenerating] = useState(false);
  const [currentQuestions, setCurrentQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: string }>({});
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const timerRef = useRef<any>(null);
  const [isSubmitConfirmOpen, setIsSubmitConfirmOpen] = useState(false);

  // Result & History State
  const [completedResult, setCompletedResult] = useState<QuizAttempt | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [quizHistory, setQuizHistory] = useState<QuizAttempt[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<QuizAttempt | null>(null);

  // History Filter & Search State
  const [historySearchQuery, setHistorySearchQuery] = useState('');
  const [historyFilter, setHistoryFilter] = useState<'All' | 'Completed' | 'Pending' | 'Draft' | 'Recent' | 'Favorites'>('All');

  // Document upload inline state
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch uploaded documents on mount
  useEffect(() => {
    fetchDocuments();
    fetchHistory();
  }, []);

  // Pre-select document if passed via location state or URL params
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const docIdParam = searchParams.get('docId') || location.state?.documentId;
    const docNameParam = searchParams.get('docName') || location.state?.documentName;

    if (documents.length > 0) {
      if (docIdParam) {
        const found = documents.find((d) => d.id === Number(docIdParam));
        if (found) setSelectedDoc(found);
      } else if (docNameParam) {
        const found = documents.find((d) => d.original_name === docNameParam || d.filename === docNameParam);
        if (found) setSelectedDoc(found);
      } else if (!selectedDoc) {
        setSelectedDoc(documents[0]);
      }
    }
  }, [documents, location]);

  // Timer countdown during active quiz
  useEffect(() => {
    if (viewState === 'active') {
      const interval = setInterval(() => {
        setElapsedTime((prev) => prev + 1);

        if (timerOption > 0) {
          setSecondsRemaining((prev) => {
            if (prev <= 1) {
              clearInterval(interval);
              handleFinalSubmit(); // Auto-submit when time expires
              return 0;
            }
            return prev - 1;
          });
        }
      }, 1000);

      timerRef.current = interval;
      return () => clearInterval(interval);
    }
  }, [viewState, timerOption]);

  const fetchDocuments = async () => {
    setLoadingDocs(true);
    try {
      const res = await fetch('/api/v1/documents');
      if (res.ok) {
        const data = await res.json();
        setDocuments(data.documents || []);
        if (data.documents && data.documents.length > 0 && !selectedDoc) {
          setSelectedDoc(data.documents[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load documents for quiz generator:', err);
    } finally {
      setLoadingDocs(false);
    }
  };

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await fetch('/api/v1/quiz/history');
      if (res.ok) {
        const data = await res.json();
        setQuizHistory(data.history || []);
      }
    } catch (err) {
      console.error('Failed to load quiz history:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder_name', 'Quiz Documents');

    try {
      const res = await fetch('/api/v1/documents/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        await fetchDocuments();
        if (data.document) {
          setSelectedDoc(data.document);
        }
      } else {
        alert('File upload failed. Please try again.');
      }
    } catch (err) {
      console.error('Document upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  // Start Generating AI Quiz
  const handleStartQuiz = async () => {
    if (!selectedDoc) {
      alert('Please select or upload a document to generate a quiz.');
      return;
    }

    setGenerating(true);
    setUserAnswers({});
    setCurrentQuestionIndex(0);
    setElapsedTime(0);
    if (timerOption > 0) setSecondsRemaining(timerOption);

    try {
      const res = await fetch('/api/v1/quiz/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          document_name: selectedDoc.original_name || selectedDoc.filename,
          document_id: selectedDoc.id,
          num_questions: numQuestions,
          difficulty,
          quiz_type: quizType,
          subject: selectedDoc.folder_name || selectedDoc.category || 'General',
        }),
      });

      if (res.ok) {
        const quizData = await res.json();
        setCurrentQuestions(quizData.questions || []);
        setViewState('active');
      } else {
        const errData = await res.json();
        alert(errData.detail || 'Failed to generate quiz.');
      }
    } catch (err) {
      console.error('Error generating quiz:', err);
      alert('Network error while generating quiz.');
    } finally {
      setGenerating(false);
    }
  };

  // Select Option / Type Answer
  const handleAnswerSelect = (answer: string) => {
    const qId = currentQuestions[currentQuestionIndex]?.id;
    if (qId) {
      setUserAnswers((prev) => ({ ...prev, [qId]: answer }));
    }
  };

  // Confirm and Submit Quiz Answers
  const handleFinalSubmit = async () => {
    setIsSubmitConfirmOpen(false);
    setSubmitting(true);

    if (timerRef.current) clearInterval(timerRef.current);

    const submissions = currentQuestions.map((q) => ({
      question_id: q.id,
      question: q.question,
      user_answer: userAnswers[q.id] || '',
      correct_answer: q.correct_answer,
      explanation: q.explanation,
      type: q.type,
      options: q.options || [],
    }));

    try {
      const res = await fetch('/api/v1/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          document_name: selectedDoc?.original_name || selectedDoc?.filename || 'Document',
          subject: selectedDoc?.folder_name || selectedDoc?.category || 'General',
          difficulty,
          quiz_type: quizType,
          time_taken_seconds: elapsedTime,
          submissions,
        }),
      });

      if (res.ok) {
        const resultData = await res.json();
        setCompletedResult(resultData);
        setViewState('results');
        fetchHistory(); // Refresh history
      } else {
        alert('Failed to submit quiz results.');
      }
    } catch (err) {
      console.error('Error submitting quiz:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteHistory = async (attemptId: number) => {
    if (!confirm('Are you sure you want to delete this quiz history entry?')) return;
    try {
      const res = await fetch(`/api/v1/quiz/history/${attemptId}`, { method: 'DELETE' });
      if (res.ok) {
        setQuizHistory((prev) => prev.filter((item) => item.id !== attemptId));
        if (selectedHistoryItem?.id === attemptId) setSelectedHistoryItem(null);
      }
    } catch (err) {
      console.error('Failed to delete history item:', err);
    }
  };

  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Dashboard Overview Statistics Calculation
  const totalQuizzesCount = quizHistory.length;
  const completedCount = quizHistory.filter((q) => q.percentage >= 60).length;
  const pendingCount = quizHistory.filter((q) => q.percentage < 60).length;
  const averageScore = totalQuizzesCount > 0
    ? Math.round(quizHistory.reduce((acc, curr) => acc + curr.percentage, 0) / totalQuizzesCount)
    : 0;

  // Filtered History List
  const filteredHistory = quizHistory.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(historySearchQuery.toLowerCase()) ||
      item.document_name.toLowerCase().includes(historySearchQuery.toLowerCase()) ||
      item.subject.toLowerCase().includes(historySearchQuery.toLowerCase());
    
    if (!matchesSearch) return false;

    if (historyFilter === 'Completed') return item.percentage >= 60;
    if (historyFilter === 'Pending') return item.percentage < 60;
    return true;
  });

  return (
    <div className="w-full h-full overflow-x-hidden overflow-y-auto bg-[#F8FAFC] dark:bg-[#0A0A0A] text-[#111827] dark:text-[#FAFAFA] p-4 sm:p-6 lg:p-8 transition-colors select-none font-sans">
      {/* 1440px Centered Max Content Width Container */}
      <div className="w-full max-w-[1440px] mx-auto space-y-8">
        
        {/* Page Hero Header (With Dedicated Covered Image Background) */}
        <div className="relative overflow-hidden bg-[#FFFFFF] dark:bg-[#18181B] p-6 rounded-[16px] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6 min-h-[120px]">

          <div className="relative z-10 flex items-center gap-4 min-w-0">
            <div className="w-12 h-12 rounded-[12px] bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] flex items-center justify-center shrink-0 shadow-sm">
              <Brain size={24} />
            </div>
            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-[30px] font-semibold text-[#111827] dark:text-[#FAFAFA] tracking-tight leading-tight">
                  AI Quiz Generator
                </h1>
                <span className="text-[12px] font-medium px-3 py-1 rounded-[8px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA] shrink-0">
                  Grounded AI Engine
                </span>
              </div>
              <p className="text-[15px] font-normal text-[#6B7280] dark:text-[#A1A1AA] truncate">
                Generate document-based quizzes, test your understanding, and view instant AI explanations.
              </p>
            </div>
          </div>

          {/* Segmented Tab Control Bar */}
          <div className="relative z-10 flex items-center bg-[#F8FAFC] dark:bg-[#111111] p-1.5 rounded-[12px] border border-[#E5E7EB] dark:border-[#2A2A2A] overflow-x-auto no-scrollbar w-full lg:w-auto">
            <button
              onClick={() => {
                setActiveTab('create');
                setViewState('config');
              }}
              className={`h-[36px] px-4 rounded-[8px] text-[14px] font-medium transition flex items-center justify-center gap-2 whitespace-nowrap flex-1 lg:flex-initial cursor-pointer ${
                activeTab === 'create'
                  ? 'bg-[#111827] text-[#FFFFFF] dark:bg-[#FAFAFA] dark:text-[#111111]'
                  : 'text-[#6B7280] dark:text-[#A1A1AA] hover:bg-[#FFFFFF] dark:hover:bg-[#18181B]'
              }`}
            >
              <Zap size={16} />
              <span>Quiz Studio</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('history');
                fetchHistory();
              }}
              className={`h-[36px] px-4 rounded-[8px] text-[14px] font-medium transition flex items-center justify-center gap-2 whitespace-nowrap flex-1 lg:flex-initial cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-[#111827] text-[#FFFFFF] dark:bg-[#FAFAFA] dark:text-[#111111]'
                  : 'text-[#6B7280] dark:text-[#A1A1AA] hover:bg-[#FFFFFF] dark:hover:bg-[#18181B]'
              }`}
            >
              <History size={16} />
              <span>Quiz History</span>
              {quizHistory.length > 0 && (
                <span className="ml-1 px-2 py-0.5 bg-[#FFFFFF] dark:bg-[#18181B] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA] text-[11px] font-medium rounded-[6px]">
                  {quizHistory.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* 4 Statistics Cards Grid (2x2 Mobile, 4-Col Desktop, 24px Gap) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 select-none">
          <div className="p-6 rounded-[16px] bg-[#FFFFFF] dark:bg-[#18181B] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs flex items-center justify-between">
            <div className="min-w-0 flex-1 space-y-1">
              <p className="text-[14px] font-normal text-[#6B7280] dark:text-[#A1A1AA] truncate">Total Quizzes</p>
              <p className="text-[28px] font-semibold text-[#111827] dark:text-[#FAFAFA] leading-tight truncate">{totalQuizzesCount}</p>
              <p className="text-[12px] font-normal text-[#6B7280] dark:text-[#A1A1AA] truncate">Generated decks</p>
            </div>
            <div className="w-10 h-10 rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA] flex items-center justify-center shrink-0 ml-3">
              <BookOpen size={20} />
            </div>
          </div>

          <div className="p-6 rounded-[16px] bg-[#FFFFFF] dark:bg-[#18181B] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs flex items-center justify-between">
            <div className="min-w-0 flex-1 space-y-1">
              <p className="text-[14px] font-normal text-[#6B7280] dark:text-[#A1A1AA] truncate">Passed Quizzes</p>
              <p className="text-[28px] font-semibold text-[#111827] dark:text-[#FAFAFA] leading-tight truncate">{completedCount}</p>
              <p className="text-[12px] font-normal text-[#6B7280] dark:text-[#A1A1AA] truncate">&ge; 60% accuracy</p>
            </div>
            <div className="w-10 h-10 rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA] flex items-center justify-center shrink-0 ml-3">
              <CheckCircle2 size={20} />
            </div>
          </div>

          <div className="p-6 rounded-[16px] bg-[#FFFFFF] dark:bg-[#18181B] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs flex items-center justify-between">
            <div className="min-w-0 flex-1 space-y-1">
              <p className="text-[14px] font-normal text-[#6B7280] dark:text-[#A1A1AA] truncate">Needs Review</p>
              <p className="text-[28px] font-semibold text-[#111827] dark:text-[#FAFAFA] leading-tight truncate">{pendingCount}</p>
              <p className="text-[12px] font-normal text-[#6B7280] dark:text-[#A1A1AA] truncate">&lt; 60% score</p>
            </div>
            <div className="w-10 h-10 rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA] flex items-center justify-center shrink-0 ml-3">
              <AlertTriangle size={20} />
            </div>
          </div>

          <div className="p-6 rounded-[16px] bg-[#FFFFFF] dark:bg-[#18181B] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs flex items-center justify-between">
            <div className="min-w-0 flex-1 space-y-1">
              <p className="text-[14px] font-normal text-[#6B7280] dark:text-[#A1A1AA] truncate">Average Accuracy</p>
              <p className="text-[28px] font-semibold text-[#111827] dark:text-[#FAFAFA] leading-tight truncate">{averageScore}%</p>
              <p className="text-[12px] font-normal text-[#6B7280] dark:text-[#A1A1AA] truncate">Overall rating</p>
            </div>
            <div className="w-10 h-10 rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA] flex items-center justify-center shrink-0 ml-3">
              <Award size={20} />
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. QUIZ DASHBOARD OVERVIEW CARDS                                           */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 h-full">
          <div className="p-6 rounded-[12px] bg-[#FFFFFF] dark:bg-[#181818] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[14px] font-medium text-[#6B7280] dark:text-[#A3A3A3]">Total Quizzes</p>
              <p className="text-[36px] font-bold text-[#111827] dark:text-[#FAFAFA] mt-1">{totalQuizzesCount}</p>
            </div>
            <div className="w-10 h-10 rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA] flex items-center justify-center">
              <BookOpen size={20} />
            </div>
          </div>

          <div className="p-6 rounded-[12px] bg-[#FFFFFF] dark:bg-[#181818] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[14px] font-medium text-[#6B7280] dark:text-[#A3A3A3]">Passed Quizzes</p>
              <p className="text-[36px] font-bold text-[#111827] dark:text-[#FAFAFA] mt-1">{completedCount}</p>
            </div>
            <div className="w-10 h-10 rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA] flex items-center justify-center">
              <CheckCircle2 size={20} />
            </div>
          </div>

          <div className="p-6 rounded-[12px] bg-[#FFFFFF] dark:bg-[#181818] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[14px] font-medium text-[#6B7280] dark:text-[#A3A3A3]">Needs Review</p>
              <p className="text-[36px] font-bold text-[#111827] dark:text-[#FAFAFA] mt-1">{pendingCount}</p>
            </div>
            <div className="w-10 h-10 rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA] flex items-center justify-center">
              <AlertTriangle size={20} />
            </div>
          </div>

          <div className="p-6 rounded-[12px] bg-[#FFFFFF] dark:bg-[#181818] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[14px] font-medium text-[#6B7280] dark:text-[#A3A3A3]">Average Accuracy</p>
              <p className="text-[36px] font-bold text-[#111827] dark:text-[#FAFAFA] mt-1">{averageScore}%</p>
            </div>
            <div className="w-10 h-10 rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA] flex items-center justify-center">
              <Award size={20} />
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: CREATE & RUN QUIZ                                                   */}
        {/* ========================================================================= */}
        {activeTab === 'create' && (
          <AnimatePresence mode="wait">
            
            {/* VIEW STATE 1: CONFIGURATION / SETUP SCREEN */}
            {viewState === 'config' && (
              <motion.div
                key="config-screen"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-6 select-none"
              >
                {/* Left Side: Select Document & Upload (7 cols) */}
                <div className="lg:col-span-7 bg-[#FFFFFF] dark:bg-[#18181B] p-4 sm:p-6 rounded-[16px] border border-[#D1D5DB] dark:border-[#3F3F46] shadow-xs space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h2 className="text-[16px] sm:text-[17px] font-[600] text-[#111827] dark:text-[#FAFAFA] flex items-center gap-2">
                        <FileText size={20} className="shrink-0" />
                        <span>1. Select Source Document</span>
                      </h2>
                      <p className="text-[12px] sm:text-[13px] font-[500] text-[#6B7280] dark:text-[#A1A1AA] mt-0.5">
                        Questions will be generated strictly from the content of the selected file.
                      </p>
                    </div>

                    {/* Upload file inline */}
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept=".pdf,.docx,.doc,.ppt,.pptx,.txt"
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="h-[36px] sm:h-[38px] px-3.5 sm:px-4 text-[14px] font-[500] rounded-[10px] bg-[#FFFFFF] dark:bg-[#18181B] border border-[#D1D5DB] dark:border-[#3F3F46] text-[#111827] dark:text-[#FAFAFA] hover:bg-[#F8FAFC] dark:hover:bg-[#232323] transition flex items-center justify-center gap-2 cursor-pointer shrink-0 active:scale-[0.98] w-full sm:w-auto"
                    >
                      <FileUp size={16} />
                      <span>{uploading ? 'Uploading...' : 'Upload File'}</span>
                    </button>
                  </div>

                  {/* Document Grid / List */}
                  {loadingDocs ? (
                    <div className="py-12 text-center text-[#6B7280] dark:text-[#A1A1AA] text-[14px] font-[500]">
                      Loading your documents...
                    </div>
                  ) : documents.length === 0 ? (
                    <div className="p-6 sm:p-8 border-2 border-dashed border-[#D1D5DB] dark:border-[#3F3F46] rounded-[16px] bg-[#FFFFFF] dark:bg-[#18181B] text-center space-y-3">
                      <div className="w-[48px] h-[48px] sm:w-[52px] sm:h-[52px] mx-auto rounded-[12px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#D1D5DB] dark:border-[#3F3F46] text-[#111827] dark:text-[#FAFAFA] flex items-center justify-center">
                        <UploadCloud size={24} />
                      </div>
                      <p className="text-[15px] sm:text-[16px] font-[700] text-[#111827] dark:text-[#FAFAFA]">No uploaded documents found.</p>
                      <p className="text-[12px] sm:text-[13px] font-[500] text-[#6B7280] dark:text-[#A1A1AA]">Upload a PDF, DOCX, or PPT file to generate your first AI quiz.</p>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="h-[38px] sm:h-[40px] px-5 bg-[#111827] hover:bg-[#1F2937] active:bg-[#0F172A] dark:bg-[#FAFAFA] dark:hover:bg-[#F3F4F6] text-[#FFFFFF] dark:text-[#111111] text-[13px] sm:text-[14px] font-[500] rounded-[12px] shadow-xs cursor-pointer active:scale-[0.98] w-full sm:w-auto"
                      >
                        Upload Document Now
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1 no-scrollbar">
                      {documents.map((doc) => {
                        const isSelected = selectedDoc?.id === doc.id;
                        return (
                          <motion.div
                            key={doc.id}
                            whileHover={{ scale: 1.01 }}
                            onClick={() => setSelectedDoc(doc)}
                            className={`p-3.5 sm:p-4 rounded-[14px] border cursor-pointer transition-all duration-150 flex flex-col justify-between gap-2.5 min-w-0 ${
                              isSelected
                                ? 'border-[#111827] dark:border-[#FAFAFA] bg-[#111827] text-[#FFFFFF] dark:bg-[#FAFAFA] dark:text-[#111111]'
                                : 'border-[#D1D5DB] dark:border-[#3F3F46] bg-[#F8FAFC] dark:bg-[#111111] text-[#111827] dark:text-[#FAFAFA] hover:border-[#111827]'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2 min-w-0">
                              <div className="flex items-center gap-2 min-w-0 flex-1">
                                <FileText size={16} className="shrink-0" />
                                <span className="text-[14px] font-[500] truncate leading-tight">
                                  {doc.original_name}
                                </span>
                              </div>
                              {isSelected && (
                                <div className="w-5 h-5 rounded-full bg-[#FFFFFF] text-[#111827] dark:bg-[#111111] dark:text-[#FAFAFA] flex items-center justify-center shrink-0">
                                  <Check size={12} strokeWidth={3} />
                                </div>
                              )}
                            </div>

                            <div className={`flex items-center justify-between gap-2 text-[11px] sm:text-[12px] font-[500] min-w-0 ${isSelected ? 'opacity-80' : 'text-[#6B7280] dark:text-[#A1A1AA]'}`}>
                              <span className="uppercase px-2 py-0.5 rounded-[6px] border border-[#D1D5DB] dark:border-[#3F3F46] font-[700] shrink-0">
                                {doc.file_type}
                              </span>
                              <span className="truncate">{doc.folder_name || doc.category || 'General'}</span>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}

                  {/* Supported files pill banner */}
                  <div className="p-3 bg-[#F8FAFC] dark:bg-[#111111] border border-[#D1D5DB] dark:border-[#3F3F46] rounded-[12px] text-[11px] sm:text-[12px] text-[#6B7280] dark:text-[#A1A1AA] flex flex-wrap items-center gap-1.5 sm:gap-2">
                    <span className="font-[700] text-[#111827] dark:text-[#FAFAFA]">Supported Formats:</span>
                    <span className="truncate">PDF • DOCX • PPT • PPTX • TXT</span>
                  </div>
                </div>

                {/* Right Side: Quiz Settings Form (5 cols) */}
                <div className="lg:col-span-5 bg-[#FFFFFF] dark:bg-[#18181B] p-6 rounded-[16px] border border-[#D1D5DB] dark:border-[#3F3F46] shadow-xs space-y-6 flex flex-col justify-between">
                  <div className="space-y-5">
                    <h2 className="text-[20px] font-[700] text-[#111827] dark:text-[#FAFAFA] flex items-center gap-2">
                      <Sliders size={20} />
                      <span>2. Quiz Settings</span>
                    </h2>

                    {/* Question Count */}
                    <div className="space-y-2">
                      <label className="text-[12px] font-[400] uppercase tracking-wider text-[#6B7280] dark:text-[#A1A1AA]">
                        Number of Questions
                      </label>
                      <div className="grid grid-cols-4 gap-3">
                        {[5, 10, 15, 20].map((count) => (
                          <button
                            key={count}
                            onClick={() => setNumQuestions(count)}
                            className={`h-[38px] rounded-[10px] text-[14px] font-[500] transition cursor-pointer active:scale-[0.98] ${
                              numQuestions === count
                                ? 'bg-[#111827] text-[#FFFFFF] dark:bg-[#FAFAFA] dark:text-[#111111]'
                                : 'bg-[#FFFFFF] dark:bg-[#18181B] border border-[#D1D5DB] dark:border-[#3F3F46] text-[#111827] dark:text-[#FAFAFA] hover:bg-[#F8FAFC] dark:hover:bg-[#232323]'
                            }`}
                          >
                            {count}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Difficulty */}
                    <div className="space-y-2">
                      <label className="text-[12px] font-[400] uppercase tracking-wider text-[#6B7280] dark:text-[#A1A1AA]">
                        Difficulty Level
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {(['Easy', 'Medium', 'Hard'] as const).map((diff) => (
                          <button
                            key={diff}
                            onClick={() => setDifficulty(diff)}
                            className={`h-[38px] rounded-[10px] text-[14px] font-[500] transition cursor-pointer active:scale-[0.98] ${
                              difficulty === diff
                                ? 'bg-[#111827] text-[#FFFFFF] dark:bg-[#FAFAFA] dark:text-[#111111]'
                                : 'bg-[#FFFFFF] dark:bg-[#18181B] border border-[#D1D5DB] dark:border-[#3F3F46] text-[#111827] dark:text-[#FAFAFA] hover:bg-[#F8FAFC] dark:hover:bg-[#232323]'
                            }`}
                          >
                            {diff}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Quiz Type */}
                    <div className="space-y-2">
                      <label className="text-[12px] font-[400] uppercase tracking-wider text-[#6B7280] dark:text-[#A1A1AA]">
                        Question Type
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { id: 'MCQ', label: 'MCQ (Choices)' },
                          { id: 'True/False', label: 'True / False' },
                          { id: 'Fill in the Blanks', label: 'Fill in Blanks' },
                          { id: 'Short Answer', label: 'Short Answer' },
                          { id: 'Mixed', label: 'Mixed Format' },
                        ].map((t) => (
                          <button
                            key={t.id}
                            onClick={() => setQuizType(t.id as any)}
                            className={`h-[38px] px-3 rounded-[10px] text-[12px] font-[400] transition text-left cursor-pointer active:scale-[0.98] ${
                              quizType === t.id
                                ? 'bg-[#111827] text-[#FFFFFF] dark:bg-[#FAFAFA] dark:text-[#111111]'
                                : 'bg-[#FFFFFF] dark:bg-[#18181B] border border-[#D1D5DB] dark:border-[#3F3F46] text-[#111827] dark:text-[#FAFAFA] hover:bg-[#F8FAFC] dark:hover:bg-[#232323]'
                            }`}
                          >
                            {t.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Timer setting */}
                    <div className="space-y-2">
                      <label className="text-[12px] font-[400] uppercase tracking-wider text-[#6B7280] dark:text-[#A1A1AA]">
                        Timer Limit
                      </label>
                      <div className="grid grid-cols-4 gap-3">
                        {[
                          { secs: 0, label: 'Off' },
                          { secs: 300, label: '5 min' },
                          { secs: 600, label: '10 min' },
                          { secs: 900, label: '15 min' },
                        ].map((tm) => (
                          <button
                            key={tm.secs}
                            onClick={() => setTimerOption(tm.secs)}
                            className={`h-[38px] rounded-[10px] text-[12px] font-[400] transition cursor-pointer active:scale-[0.98] ${
                              timerOption === tm.secs
                                ? 'bg-[#111827] text-[#FFFFFF] dark:bg-[#FAFAFA] dark:text-[#111111]'
                                : 'bg-[#FFFFFF] dark:bg-[#18181B] border border-[#D1D5DB] dark:border-[#3F3F46] text-[#111827] dark:text-[#FAFAFA] hover:bg-[#F8FAFC] dark:hover:bg-[#232323]'
                            }`}
                          >
                            {tm.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Generate Button */}
                  <button
                    onClick={handleStartQuiz}
                    disabled={generating || !selectedDoc}
                    className="w-full h-[42px] sm:h-[44px] rounded-[12px] bg-[#111827] hover:bg-[#1F2937] active:bg-[#0F172A] dark:bg-[#FAFAFA] dark:hover:bg-[#F3F4F6] text-[#FFFFFF] dark:text-[#111111] font-[700] text-[15px] shadow-xs transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 mt-4 active:scale-[0.98]"
                  >
                    {generating ? (
                      <>
                        <div className="w-5 h-5 rounded-full border-2 border-white dark:border-black border-t-transparent animate-spin" />
                        Generating Grounded AI Quiz...
                      </>
                    ) : (
                      <>
                        <Sparkles size={18} />
                        <span>Generate Quiz Now</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {/* ----------------------------------------------------------------------- */}
            {/* VIEW STATE 2: ACTIVE QUIZ RUNNER SCREEN                                 */}
            {/* ----------------------------------------------------------------------- */}
            {viewState === 'active' && currentQuestions.length > 0 && (
              <motion.div
                key="active-quiz-screen"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="max-w-4xl mx-auto space-y-6"
              >
                {/* Top Status Bar */}
                <div className="bg-[#FFFFFF] dark:bg-[#181818] p-5 rounded-[12px] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="px-3 py-1 bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA] font-medium text-[12px] rounded-[6px]">
                      Question {currentQuestionIndex + 1} of {currentQuestions.length}
                    </div>
                    <span className="text-[12px] font-medium px-2.5 py-1 bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA] rounded-[6px]">
                      {difficulty}
                    </span>
                    <span className="text-[12px] font-medium px-2.5 py-1 bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA] rounded-[6px]">
                      {currentQuestions[currentQuestionIndex]?.type}
                    </span>
                  </div>

                  {/* Progress & Timer */}
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    {timerOption > 0 && (
                      <div className="flex items-center gap-1.5 text-[14px] font-mono font-medium px-3.5 py-1.5 rounded-[8px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA]">
                        <Clock size={16} />
                        {formatTime(secondsRemaining)}
                      </div>
                    )}
                    
                    <button
                      onClick={() => setIsSubmitConfirmOpen(true)}
                      className="h-10 px-5 bg-[#111827] hover:bg-[#000000] dark:bg-[#FAFAFA] dark:hover:bg-[#E5E7EB] text-[#FFFFFF] dark:text-[#111111] font-medium text-[14px] rounded-[8px] shadow-xs transition cursor-pointer"
                    >
                      Submit Quiz
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-[#E5E7EB] dark:bg-[#2A2A2A] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#111827] dark:bg-[#FAFAFA] h-full transition-all duration-300"
                    style={{
                      width: `${((currentQuestionIndex + 1) / currentQuestions.length) * 100}%`,
                    }}
                  />
                </div>

                {/* Question Box */}
                <div className="bg-[#FFFFFF] dark:bg-[#181818] p-8 rounded-[12px] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs space-y-6">
                  <h3 className="text-[22px] font-bold text-[#111827] dark:text-[#FAFAFA] leading-relaxed">
                    {currentQuestions[currentQuestionIndex]?.question}
                  </h3>

                  {/* MCQ / Options list */}
                  {currentQuestions[currentQuestionIndex]?.options &&
                  currentQuestions[currentQuestionIndex]?.options.length > 0 ? (
                    <div className="grid grid-cols-1 gap-3">
                      {currentQuestions[currentQuestionIndex].options.map((opt, idx) => {
                        const qId = currentQuestions[currentQuestionIndex].id;
                        const isSelected = userAnswers[qId] === opt;
                        const optionLabels = ['A', 'B', 'C', 'D', 'E'];

                        return (
                          <div
                            key={idx}
                            onClick={() => handleAnswerSelect(opt)}
                            className={`p-4 rounded-[10px] border cursor-pointer transition-all duration-150 flex items-center justify-between ${
                              isSelected
                                ? 'bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] border-[#111827] dark:border-[#FAFAFA]'
                                : 'bg-[#FFFFFF] dark:bg-[#181818] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA] hover:bg-[#F9FAFB] dark:hover:bg-[#232323]'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-8 h-8 rounded-[6px] font-medium text-[12px] flex items-center justify-center ${
                                  isSelected
                                    ? 'bg-[#FFFFFF] dark:bg-[#111111] text-[#111827] dark:text-[#FAFAFA]'
                                    : 'bg-[#F8FAFC] dark:bg-[#111111] border border-[#D1D5DB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA]'
                                }`}
                              >
                                {optionLabels[idx] || idx + 1}
                              </div>
                              <span className="text-[16px]">{opt}</span>
                            </div>
                            {isSelected && (
                              <div className="w-5 h-5 rounded-full bg-[#FFFFFF] dark:bg-[#111111] text-[#111827] dark:text-[#FAFAFA] flex items-center justify-center">
                                <Check size={12} strokeWidth={3} />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    /* Short Answer Input Area */
                    <div className="space-y-3">
                      <label className="text-[12px] font-medium uppercase tracking-wider text-[#6B7280] dark:text-[#A3A3A3]">
                        Your Answer
                      </label>
                      <textarea
                        rows={4}
                        value={userAnswers[currentQuestions[currentQuestionIndex].id] || ''}
                        onChange={(e) => handleAnswerSelect(e.target.value)}
                        placeholder="Type your brief answer here derived from the document content..."
                        className="w-full p-4 rounded-[10px] bg-[#FFFFFF] dark:bg-[#181818] border border-[#D1D5DB] dark:border-[#2A2A2A] text-[14px] text-[#111827] dark:text-[#FAFAFA] outline-none"
                      />
                    </div>
                  )}

                  {/* Navigation controls */}
                  <div className="flex items-center justify-between pt-4 border-t border-[#F3F4F6] dark:border-[#2A2A2A]">
                    <button
                      onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                      disabled={currentQuestionIndex === 0}
                      className="h-10 px-4 rounded-[8px] text-[14px] font-medium border border-[#D1D5DB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA] hover:bg-[#F9FAFB] dark:hover:bg-[#232323] transition disabled:opacity-40 flex items-center gap-1 cursor-pointer"
                    >
                      <ChevronLeft size={18} />
                      Previous
                    </button>

                    {currentQuestionIndex < currentQuestions.length - 1 ? (
                      <button
                        onClick={() =>
                          setCurrentQuestionIndex((prev) =>
                            Math.min(currentQuestions.length - 1, prev + 1)
                          )
                        }
                        className="h-10 px-5 rounded-[8px] bg-[#111827] hover:bg-[#000000] dark:bg-[#FAFAFA] dark:hover:bg-[#E5E7EB] text-[#FFFFFF] dark:text-[#111111] font-medium text-[14px] shadow-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        Next Question
                        <ChevronRight size={18} />
                      </button>
                    ) : (
                      <button
                        onClick={() => setIsSubmitConfirmOpen(true)}
                        className="h-10 px-6 rounded-[8px] bg-[#111827] hover:bg-[#000000] dark:bg-[#FAFAFA] dark:hover:bg-[#E5E7EB] text-[#FFFFFF] dark:text-[#111111] font-medium text-[14px] shadow-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        Submit Quiz
                        <CheckCircle2 size={18} />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ----------------------------------------------------------------------- */}
            {/* VIEW STATE 3: RESULTS SCREEN & AI EXPLANATIONS                          */}
            {/* VIEW STATE 3: QUIZ RESULTS SCREEN */}
            {viewState === 'results' && completedResult && (
              <motion.div
                key="results-screen"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="max-w-4xl mx-auto space-y-6 select-none"
              >
                {/* Hero Score Box */}
                <div className="bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] p-6 sm:p-8 rounded-[16px] shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="space-y-3 text-center md:text-left">
                    <span className="px-3 py-1 bg-[#FFFFFF] dark:bg-[#111111] text-[#111827] dark:text-[#FAFAFA] font-[700] text-[12px] rounded-[6px] uppercase tracking-wider">
                      Quiz Complete
                    </span>
                    <h2 className="text-[28px] sm:text-[32px] font-[700]">
                      {(completedResult?.percentage ?? 0) >= 80
                        ? 'Outstanding Master!'
                        : (completedResult?.percentage ?? 0) >= 60
                        ? 'Good Performance!'
                        : 'Needs Review'}
                    </h2>
                    <p className="text-[13px] sm:text-[14px] font-[500] opacity-80 max-w-md">
                      Quiz generated from <strong>{completedResult?.document_name}</strong> in {completedResult?.subject}.
                    </p>
                  </div>

                  {/* Score Metric */}
                  <div className="flex flex-col items-center justify-center p-6 rounded-[14px] border border-white/20 dark:border-black/20 shrink-0 min-w-[140px]">
                    <div className="text-[40px] sm:text-[48px] font-[700]">
                      {completedResult?.percentage}%
                    </div>
                    <div className="text-[12px] font-[600] mt-1">
                      Score: {completedResult?.score} / {completedResult?.total_questions} Correct
                    </div>
                  </div>
                </div>

                {/* Metrics Breakdown Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-[#FFFFFF] dark:bg-[#18181B] p-4 sm:p-5 rounded-[16px] border border-[#D1D5DB] dark:border-[#3F3F46] text-center space-y-1">
                    <div className="text-[12px] text-[#6B7280] dark:text-[#A1A1AA] font-[700] uppercase">Correct</div>
                    <div className="text-[22px] sm:text-[24px] font-[700] text-[#111827] dark:text-[#FAFAFA] flex items-center justify-center gap-1">
                      <CheckCircle2 size={18} />
                      {completedResult?.correct_answers}
                    </div>
                  </div>
                  <div className="bg-[#FFFFFF] dark:bg-[#18181B] p-4 sm:p-5 rounded-[16px] border border-[#D1D5DB] dark:border-[#3F3F46] text-center space-y-1">
                    <div className="text-[12px] text-[#6B7280] dark:text-[#A1A1AA] font-[700] uppercase">Wrong</div>
                    <div className="text-[22px] sm:text-[24px] font-[700] text-[#111827] dark:text-[#FAFAFA] flex items-center justify-center gap-1">
                      <XCircle size={18} />
                      {completedResult?.wrong_answers}
                    </div>
                  </div>
                  <div className="bg-[#FFFFFF] dark:bg-[#18181B] p-4 sm:p-5 rounded-[16px] border border-[#D1D5DB] dark:border-[#3F3F46] text-center space-y-1">
                    <div className="text-[12px] text-[#6B7280] dark:text-[#A1A1AA] font-[700] uppercase">Time Taken</div>
                    <div className="text-[22px] sm:text-[24px] font-[700] text-[#111827] dark:text-[#FAFAFA]">
                      {formatTime(completedResult?.time_taken_seconds ?? 0)}
                    </div>
                  </div>
                  <div className="bg-[#FFFFFF] dark:bg-[#18181B] p-4 sm:p-5 rounded-[16px] border border-[#D1D5DB] dark:border-[#3F3F46] text-center space-y-1">
                    <div className="text-[12px] text-[#6B7280] dark:text-[#A1A1AA] font-[700] uppercase">Difficulty</div>
                    <div className="text-[22px] sm:text-[24px] font-[700] text-[#111827] dark:text-[#FAFAFA]">
                      {completedResult?.difficulty}
                    </div>
                  </div>
                </div>

                {/* AI Recommendations Section */}
                <div className="p-5 sm:p-6 rounded-[16px] bg-[#FFFFFF] dark:bg-[#18181B] border border-[#D1D5DB] dark:border-[#3F3F46] space-y-4 shadow-xs">
                  <h3 className="text-[18px] font-[700] text-[#111827] dark:text-[#FAFAFA] flex items-center gap-2">
                    <Sparkles size={18} />
                    <span>AI Study Recommendations</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      onClick={() => navigate('/notes')}
                      className="p-4 rounded-[12px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#18181B] hover:bg-[#F8FAFC] dark:hover:bg-[#232323] text-left transition cursor-pointer space-y-1 active:scale-[0.98]"
                    >
                      <BookOpen size={18} className="text-[#111827] dark:text-[#FAFAFA]" />
                      <p className="font-[700] text-[14px] text-[#111827] dark:text-[#FAFAFA]">Generate Notes</p>
                      <p className="text-[12px] font-[500] text-[#6B7280] dark:text-[#A1A1AA]">Build structured revision notes from this document.</p>
                    </button>
                    <button
                      onClick={() => navigate('/documents')}
                      className="p-4 rounded-[12px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#18181B] hover:bg-[#F8FAFC] dark:hover:bg-[#232323] text-left transition cursor-pointer space-y-1 active:scale-[0.98]"
                    >
                      <FileText size={18} className="text-[#111827] dark:text-[#FAFAFA]" />
                      <p className="font-[700] text-[14px] text-[#111827] dark:text-[#FAFAFA]">Review Document</p>
                      <p className="text-[12px] font-[500] text-[#6B7280] dark:text-[#A1A1AA]">Re-read extracted sections and source materials.</p>
                    </button>
                    <button
                      onClick={() => setViewState('config')}
                      className="p-4 rounded-[12px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#18181B] hover:bg-[#F8FAFC] dark:hover:bg-[#232323] text-left transition cursor-pointer space-y-1 active:scale-[0.98]"
                    >
                      <RotateCcw size={18} className="text-[#111827] dark:text-[#FAFAFA]" />
                      <p className="font-[700] text-[14px] text-[#111827] dark:text-[#FAFAFA]">Practice Weak Areas</p>
                      <p className="text-[12px] font-[500] text-[#6B7280] dark:text-[#A1A1AA]">Generate a new targeted quiz with harder questions.</p>
                    </button>
                  </div>
                </div>

                {/* Retake & Action Buttons */}
                <div className="flex items-center justify-end gap-3">
                  <button
                    onClick={() => setViewState('config')}
                    className="h-[38px] sm:h-[40px] px-5 rounded-[12px] bg-[#FFFFFF] dark:bg-[#18181B] border border-[#D1D5DB] dark:border-[#3F3F46] text-[13px] sm:text-[14px] font-[500] text-[#111827] dark:text-[#FAFAFA] hover:bg-[#F8FAFC] dark:hover:bg-[#232323] transition flex items-center gap-2 cursor-pointer active:scale-[0.98]"
                  >
                    <RotateCcw size={16} />
                    New Quiz Setup
                  </button>
                  <button
                    onClick={handleStartQuiz}
                    className="h-[38px] sm:h-[40px] px-5 rounded-[12px] bg-[#111827] hover:bg-[#1F2937] active:bg-[#0F172A] dark:bg-[#FAFAFA] dark:hover:bg-[#F3F4F6] text-[#FFFFFF] dark:text-[#111111] text-[13px] sm:text-[14px] font-[500] shadow-xs transition flex items-center gap-2 cursor-pointer active:scale-[0.98]"
                  >
                    <Zap size={16} />
                    Retake Same Quiz
                  </button>
                </div>

                {/* Detailed Questions & AI Grounded Explanations */}
                <div className="space-y-4 pt-4">
                  <h3 className="text-[20px] sm:text-[17px] font-[600] text-[#111827] dark:text-[#FAFAFA] flex items-center gap-2">
                    <BarChart2 size={20} />
                    <span>Question Review & AI Explanations</span>
                  </h3>

                  {completedResult?.questions_data?.map((q, idx) => (
                    <div
                      key={idx}
                      className="p-6 rounded-[12px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#FFFFFF] dark:bg-[#181818] shadow-xs space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <span className="font-bold text-[16px] text-[#111827] dark:text-[#FAFAFA]">
                          Q{idx + 1}. {q.question}
                        </span>
                        {q.is_correct ? (
                          <span className="px-3 py-1 bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA] font-medium text-[12px] rounded-[6px] flex items-center gap-1 shrink-0">
                            <CheckCircle2 size={14} /> Correct
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-[#F8FAFC] dark:bg-[#111111] border border-[#DC2626] text-[#DC2626] font-medium text-[12px] rounded-[6px] flex items-center gap-1 shrink-0">
                            <XCircle size={14} /> Incorrect
                          </span>
                        )}
                      </div>

                      {/* Answers comparison */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[14px] pt-1">
                        <div className="p-3 rounded-[8px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A]">
                          <span className="text-[#6B7280] dark:text-[#A3A3A3] block font-medium mb-1">Your Answer:</span>
                          <span className="font-bold text-[#111827] dark:text-[#FAFAFA]">
                            {q.user_answer || '(No answer provided)'}
                          </span>
                        </div>
                        <div className="p-3 rounded-[8px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A]">
                          <span className="text-[#6B7280] dark:text-[#A3A3A3] block font-medium mb-1">Correct Answer:</span>
                          <span className="font-bold text-[#111827] dark:text-[#FAFAFA]">{q.correct_answer}</span>
                        </div>
                      </div>

                      {/* Grounded Explanation Box */}
                      <div className="p-4 rounded-[8px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[14px] text-[#4B5563] dark:text-[#D4D4D4] space-y-1">
                        <div className="font-bold text-[#111827] dark:text-[#FAFAFA] flex items-center gap-1.5">
                          <Brain size={14} />
                          <span>Document Grounded Explanation:</span>
                        </div>
                        <p className="leading-relaxed">{q.explanation}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: QUIZ HISTORY VIEW                                                   */}
        {/* ========================================================================= */}
        {activeTab === 'history' && (
          <div className="bg-[#FFFFFF] dark:bg-[#18181B] p-4 sm:p-6 rounded-[16px] border border-[#D1D5DB] dark:border-[#3F3F46] shadow-xs space-y-5 select-none">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-[18px] sm:text-[17px] font-[600] text-[#111827] dark:text-[#FAFAFA] flex items-center gap-2">
                  <History size={20} className="shrink-0" />
                  <span>Saved Quiz Attempts & History</span>
                </h2>
                <p className="text-[14px] sm:text-[15px] font-[400] text-[#6B7280] dark:text-[#A1A1AA] mt-0.5">
                  Track your test history, review scores, and delete past attempts
                </p>
              </div>
              <span className="text-[12px] font-[400] px-2.5 py-1 rounded-[6px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#D1D5DB] dark:border-[#3F3F46] text-[#111827] dark:text-[#FAFAFA] shrink-0">
                Total: {quizHistory.length} Attempts
              </span>
            </div>

            {/* Search & Filters Toolbar */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-3 pt-1">
              {/* Search Bar */}
              <div className="relative w-full md:w-80">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7280] dark:text-[#A1A1AA]" />
                <input
                  type="text"
                  placeholder="Search quizzes by title or topic..."
                  value={historySearchQuery}
                  onChange={(e) => setHistorySearchQuery(e.target.value)}
                  className="w-full h-[38px] sm:h-[40px] pl-10 pr-4 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#18181B] text-[13px] sm:text-[14px] font-sans text-[#111827] dark:text-[#FAFAFA] outline-none"
                />
              </div>

              {/* Filter Chips */}
              <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 no-scrollbar">
                {(['All', 'Completed', 'Pending'] as const).map((flt) => (
                  <button
                    key={flt}
                    onClick={() => setHistoryFilter(flt)}
                    className={`h-[36px] px-4 rounded-[8px] text-[14px] font-[500] transition cursor-pointer whitespace-nowrap shrink-0 active:scale-[0.98] ${
                      historyFilter === flt
                        ? 'bg-[#111827] text-[#FFFFFF] dark:bg-[#FAFAFA] dark:text-[#111111]'
                        : 'bg-[#FFFFFF] dark:bg-[#18181B] border border-[#D1D5DB] dark:border-[#3F3F46] text-[#111827] dark:text-[#FAFAFA] hover:bg-[#F8FAFC] dark:hover:bg-[#232323]'
                    }`}
                  >
                    {flt}
                  </button>
                ))}
              </div>
            </div>

            {historyLoading ? (
              <div className="py-12 text-center text-[#6B7280] dark:text-[#A1A1AA] text-[14px] font-[500]">Loading quiz history...</div>
            ) : filteredHistory.length === 0 ? (
              <div className="p-8 sm:p-12 text-center border-2 border-dashed border-[#D1D5DB] dark:border-[#3F3F46] rounded-[16px] bg-[#FFFFFF] dark:bg-[#18181B] space-y-3">
                <div className="w-[48px] h-[48px] sm:w-[52px] sm:h-[52px] mx-auto rounded-[12px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#D1D5DB] dark:border-[#3F3F46] text-[#111827] dark:text-[#FAFAFA] flex items-center justify-center">
                  <History size={24} />
                </div>
                <h3 className="text-[16px] sm:text-[17px] font-[600] text-[#111827] dark:text-[#FAFAFA]">No Quizzes Yet</h3>
                <p className="text-[12px] sm:text-[13px] font-[500] text-[#6B7280] dark:text-[#A1A1AA]">Generate your first AI quiz to see your performance history here.</p>
                <button
                  onClick={() => setActiveTab('create')}
                  className="h-[38px] sm:h-[40px] px-5 bg-[#111827] hover:bg-[#1F2937] active:bg-[#0F172A] dark:bg-[#FAFAFA] dark:hover:bg-[#F3F4F6] text-[#FFFFFF] dark:text-[#111111] text-[13px] sm:text-[14px] font-[500] rounded-[12px] shadow-xs cursor-pointer active:scale-[0.98] w-full sm:w-auto"
                >
                  Generate First Quiz
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {filteredHistory.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 sm:p-5 rounded-[14px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#18181B] hover:border-[#111827] dark:hover:border-[#FAFAFA] transition duration-150 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 min-w-0"
                  >
                    <div className="space-y-1.5 min-w-0 flex-1 w-full">
                      <div className="flex flex-wrap items-center justify-between sm:justify-start gap-2">
                        <span className="font-[700] text-[14px] sm:text-[16px] text-[#111827] dark:text-[#FAFAFA] leading-tight min-w-0 flex-1">
                          {item.title}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-[6px] text-[11px] sm:text-[12px] font-[400] bg-[#F8FAFC] dark:bg-[#111111] border border-[#D1D5DB] dark:border-[#3F3F46] text-[#111827] dark:text-[#FAFAFA] shrink-0">
                          {item.difficulty}
                        </span>
                      </div>
                      <div className="text-[11px] sm:text-[12px] font-[500] text-[#6B7280] dark:text-[#A1A1AA] flex flex-wrap items-center gap-1.5 sm:gap-2">
                        <span className="truncate max-w-[200px] sm:max-w-xs">Doc: {item.document_name}</span>
                        <span>•</span>
                        <span>Date: {new Date(item.created_at).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>Type: {item.quiz_type}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-[#D1D5DB] dark:border-[#3F3F46] shrink-0">
                      <div className="text-left sm:text-right">
                        <div className="text-[16px] sm:text-[17px] font-[600] text-[#111827] dark:text-[#FAFAFA] leading-none">{item.percentage}%</div>
                        <div className="text-[11px] sm:text-[12px] font-[500] text-[#6B7280] dark:text-[#A1A1AA] mt-1">
                          {item.score} / {item.total_questions} Correct
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteHistory(item.id)}
                        className="p-2 rounded-[8px] border border-[#D1D5DB] dark:border-[#3F3F46] text-[#6B7280] dark:text-[#A1A1AA] hover:text-[#DC2626] dark:hover:text-[#EF4444] hover:bg-[#F8FAFC] dark:hover:bg-[#232323] transition cursor-pointer shrink-0"
                        title="Delete History Entry"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Submit Confirmation Modal */}
        {isSubmitConfirmOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-[#FFFFFF] dark:bg-[#181818] max-w-md w-full p-6 rounded-[12px] shadow-lg space-y-4 border border-[#E5E7EB] dark:border-[#2A2A2A]">
              <div className="flex items-center gap-3 text-[#111827] dark:text-[#FAFAFA]">
                <AlertTriangle size={24} />
                <h3 className="font-bold text-[18px] text-[#111827] dark:text-[#FAFAFA]">
                  Confirm Quiz Submission
                </h3>
              </div>
              <p className="text-[14px] text-[#4B5563] dark:text-[#D4D4D4]">
                You have answered {Object.keys(userAnswers).length} out of {currentQuestions.length} questions. Are you ready to submit your answers for AI scoring?
              </p>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setIsSubmitConfirmOpen(false)}
                  className="h-10 px-4 rounded-[8px] border border-[#D1D5DB] dark:border-[#2A2A2A] text-[14px] font-medium text-[#111827] dark:text-[#FAFAFA] hover:bg-[#F9FAFB] dark:hover:bg-[#232323] cursor-pointer"
                >
                  Continue Quiz
                </button>
                <button
                  onClick={handleFinalSubmit}
                  disabled={submitting}
                  className="h-10 px-5 rounded-[8px] bg-[#111827] hover:bg-[#000000] dark:bg-[#FAFAFA] dark:hover:bg-[#E5E7EB] text-[#FFFFFF] dark:text-[#111111] font-medium text-[14px] shadow-xs cursor-pointer disabled:opacity-40"
                >
                  {submitting ? 'Submitting...' : 'Yes, Submit Now'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
