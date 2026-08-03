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
    <div className="w-full h-full overflow-y-auto bg-[#FFFFFF] dark:bg-[#0A0A0A] text-[#111827] dark:text-[#FAFAFA] p-4 md:p-8 transition-colors">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* ========================================================================= */}
        {/* 1. PAGE HEADER CARD                                                       */}
        {/* ========================================================================= */}
        <div className="bg-[#FFFFFF] dark:bg-[#181818] p-6 md:p-8 rounded-[12px] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-[10px] bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] flex items-center justify-center shrink-0">
              <Brain size={24} />
            </div>
            <div>
              <h1 className="text-[32px] font-bold text-[#111827] dark:text-[#FAFAFA] tracking-tight flex items-center gap-3">
                AI Quiz Generator
                <span className="text-[12px] font-medium px-2.5 py-0.5 rounded-[6px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA]">
                  Grounded AI Engine
                </span>
              </h1>
              <p className="text-[14px] text-[#6B7280] dark:text-[#A3A3A3] mt-1">
                Generate document-based quizzes, test your understanding, and view instant AI explanations.
              </p>
            </div>
          </div>

          {/* Tab Navigation Buttons */}
          <div className="flex items-center bg-[#F8FAFC] dark:bg-[#111111] p-1.5 rounded-[10px] border border-[#E5E7EB] dark:border-[#2A2A2A] shrink-0">
            <button
              onClick={() => {
                setActiveTab('create');
                setViewState('config');
              }}
              className={`h-10 px-5 text-[14px] font-medium rounded-[8px] transition-all duration-150 flex items-center gap-2 cursor-pointer ${
                activeTab === 'create'
                  ? 'bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111]'
                  : 'text-[#4B5563] dark:text-[#A3A3A3] hover:bg-[#F9FAFB] dark:hover:bg-[#232323]'
              }`}
            >
              <Zap size={16} />
              Quiz Studio
            </button>
            <button
              onClick={() => {
                setActiveTab('history');
                fetchHistory();
              }}
              className={`h-10 px-5 text-[14px] font-medium rounded-[8px] transition-all duration-150 flex items-center gap-2 cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111]'
                  : 'text-[#4B5563] dark:text-[#A3A3A3] hover:bg-[#F9FAFB] dark:hover:bg-[#232323]'
              }`}
            >
              <History size={16} />
              Quiz History
              {quizHistory.length > 0 && (
                <span className="ml-1 px-2 py-0.5 bg-[#FFFFFF] dark:bg-[#181818] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA] text-[12px] font-bold rounded-[6px]">
                  {quizHistory.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. QUIZ DASHBOARD OVERVIEW CARDS                                           */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-6 rounded-[12px] bg-[#FFFFFF] dark:bg-[#181818] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[14px] font-medium text-[#6B7280] dark:text-[#A3A3A3]">Total Quizzes</p>
              <p className="text-[32px] font-bold text-[#111827] dark:text-[#FAFAFA] mt-1">{totalQuizzesCount}</p>
            </div>
            <div className="w-10 h-10 rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA] flex items-center justify-center">
              <BookOpen size={20} />
            </div>
          </div>

          <div className="p-6 rounded-[12px] bg-[#FFFFFF] dark:bg-[#181818] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[14px] font-medium text-[#6B7280] dark:text-[#A3A3A3]">Passed Quizzes</p>
              <p className="text-[32px] font-bold text-[#111827] dark:text-[#FAFAFA] mt-1">{completedCount}</p>
            </div>
            <div className="w-10 h-10 rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA] flex items-center justify-center">
              <CheckCircle2 size={20} />
            </div>
          </div>

          <div className="p-6 rounded-[12px] bg-[#FFFFFF] dark:bg-[#181818] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[14px] font-medium text-[#6B7280] dark:text-[#A3A3A3]">Needs Review</p>
              <p className="text-[32px] font-bold text-[#111827] dark:text-[#FAFAFA] mt-1">{pendingCount}</p>
            </div>
            <div className="w-10 h-10 rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA] flex items-center justify-center">
              <AlertTriangle size={20} />
            </div>
          </div>

          <div className="p-6 rounded-[12px] bg-[#FFFFFF] dark:bg-[#181818] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[14px] font-medium text-[#6B7280] dark:text-[#A3A3A3]">Average Accuracy</p>
              <p className="text-[32px] font-bold text-[#111827] dark:text-[#FAFAFA] mt-1">{averageScore}%</p>
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
            
            {/* ----------------------------------------------------------------------- */}
            {/* VIEW STATE 1: CONFIGURATION / SETUP SCREEN                              */}
            {/* ----------------------------------------------------------------------- */}
            {viewState === 'config' && (
              <motion.div
                key="config-screen"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-6"
              >
                {/* Left Side: Select Document & Upload (7 cols) */}
                <div className="lg:col-span-7 bg-[#FFFFFF] dark:bg-[#181818] p-6 rounded-[12px] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-[22px] font-bold text-[#111827] dark:text-[#FAFAFA] flex items-center gap-2">
                        <FileText size={20} />
                        <span>1. Select Source Document</span>
                      </h2>
                      <p className="text-[14px] text-[#6B7280] dark:text-[#A3A3A3] mt-0.5">
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
                      className="h-9 px-4 text-[14px] font-medium rounded-[8px] bg-[#FFFFFF] dark:bg-[#181818] border border-[#D1D5DB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA] hover:bg-[#F9FAFB] dark:hover:bg-[#232323] transition flex items-center gap-2 cursor-pointer"
                    >
                      <FileUp size={16} />
                      <span>{uploading ? 'Uploading...' : 'Upload File'}</span>
                    </button>
                  </div>

                  {/* Document Grid / List */}
                  {loadingDocs ? (
                    <div className="py-12 text-center text-[#6B7280] dark:text-[#A3A3A3] text-[14px]">
                      Loading your documents...
                    </div>
                  ) : documents.length === 0 ? (
                    <div className="p-8 border-2 border-dashed border-[#D1D5DB] dark:border-[#2A2A2A] rounded-[12px] bg-[#FFFFFF] dark:bg-[#181818] text-center space-y-3">
                      <div className="w-12 h-12 mx-auto rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA] flex items-center justify-center">
                        <UploadCloud size={24} />
                      </div>
                      <p className="text-[16px] font-bold text-[#111827] dark:text-[#FAFAFA]">No uploaded documents found.</p>
                      <p className="text-[14px] text-[#6B7280] dark:text-[#A3A3A3]">Upload a PDF, DOCX, or PPT file to generate your first AI quiz.</p>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="h-10 px-5 bg-[#111827] hover:bg-[#000000] dark:bg-[#FAFAFA] dark:hover:bg-[#E5E7EB] text-[#FFFFFF] dark:text-[#111111] text-[14px] font-medium rounded-[10px] shadow-xs cursor-pointer"
                      >
                        Upload Document Now
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
                      {documents.map((doc) => {
                        const isSelected = selectedDoc?.id === doc.id;
                        return (
                          <motion.div
                            key={doc.id}
                            whileHover={{ scale: 1.01 }}
                            onClick={() => setSelectedDoc(doc)}
                            className={`p-4 rounded-[12px] border cursor-pointer transition-all duration-150 flex flex-col justify-between ${
                              isSelected
                                ? 'border-[#111827] dark:border-[#FAFAFA] bg-[#F9FAFB] dark:bg-[#232323]'
                                : 'border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#FFFFFF] dark:bg-[#181818] hover:border-[#111827] dark:hover:border-[#FAFAFA]'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div className="flex items-center gap-2 overflow-hidden">
                                <FileText size={18} className="text-[#111827] dark:text-[#FAFAFA]" />
                                <span className="font-bold text-[14px] truncate text-[#111827] dark:text-[#FAFAFA]">
                                  {doc.original_name}
                                </span>
                              </div>
                              {isSelected && (
                                <div className="w-5 h-5 rounded-full bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] flex items-center justify-center shrink-0">
                                  <Check size={12} strokeWidth={3} />
                                </div>
                              )}
                            </div>

                            <div className="flex items-center justify-between text-[12px] text-[#6B7280] dark:text-[#A3A3A3]">
                              <span className="uppercase px-2 py-0.5 rounded-[6px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA] font-medium">
                                {doc.file_type}
                              </span>
                              <span>{doc.folder_name || doc.category || 'General'}</span>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}

                  {/* Supported files pill banner */}
                  <div className="p-3 bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] rounded-[10px] text-[12px] text-[#6B7280] dark:text-[#A3A3A3] flex items-center gap-2">
                    <span className="font-semibold text-[#111827] dark:text-[#FAFAFA]">Supported Formats:</span>
                    <span>PDF • DOCX • PPT • PPTX • TXT</span>
                  </div>
                </div>

                {/* Right Side: Quiz Settings Form (5 cols) */}
                <div className="lg:col-span-5 bg-[#FFFFFF] dark:bg-[#181818] p-6 rounded-[12px] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs space-y-6 flex flex-col justify-between">
                  <div className="space-y-5">
                    <h2 className="text-[22px] font-bold text-[#111827] dark:text-[#FAFAFA] flex items-center gap-2">
                      <Sliders size={20} />
                      <span>2. Quiz Settings</span>
                    </h2>

                    {/* Question Count */}
                    <div className="space-y-2">
                      <label className="text-[12px] font-medium uppercase tracking-wider text-[#6B7280] dark:text-[#A3A3A3]">
                        Number of Questions
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {[5, 10, 15, 20].map((count) => (
                          <button
                            key={count}
                            onClick={() => setNumQuestions(count)}
                            className={`h-10 rounded-[8px] text-[14px] font-medium transition cursor-pointer ${
                              numQuestions === count
                                ? 'bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111]'
                                : 'bg-[#FFFFFF] dark:bg-[#181818] border border-[#D1D5DB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA] hover:bg-[#F9FAFB] dark:hover:bg-[#232323]'
                            }`}
                          >
                            {count}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Difficulty */}
                    <div className="space-y-2">
                      <label className="text-[12px] font-medium uppercase tracking-wider text-[#6B7280] dark:text-[#A3A3A3]">
                        Difficulty Level
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['Easy', 'Medium', 'Hard'] as const).map((diff) => (
                          <button
                            key={diff}
                            onClick={() => setDifficulty(diff)}
                            className={`h-10 rounded-[8px] text-[14px] font-medium transition cursor-pointer ${
                              difficulty === diff
                                ? 'bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111]'
                                : 'bg-[#FFFFFF] dark:bg-[#181818] border border-[#D1D5DB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA] hover:bg-[#F9FAFB] dark:hover:bg-[#232323]'
                            }`}
                          >
                            {diff}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Quiz Type */}
                    <div className="space-y-2">
                      <label className="text-[12px] font-medium uppercase tracking-wider text-[#6B7280] dark:text-[#A3A3A3]">
                        Question Type
                      </label>
                      <div className="grid grid-cols-2 gap-2">
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
                            className={`h-10 px-3 rounded-[8px] text-[12px] font-medium transition text-left cursor-pointer ${
                              quizType === t.id
                                ? 'bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111]'
                                : 'bg-[#FFFFFF] dark:bg-[#181818] border border-[#D1D5DB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA] hover:bg-[#F9FAFB] dark:hover:bg-[#232323]'
                            }`}
                          >
                            {t.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Timer setting */}
                    <div className="space-y-2">
                      <label className="text-[12px] font-medium uppercase tracking-wider text-[#6B7280] dark:text-[#A3A3A3]">
                        Timer Limit
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { secs: 0, label: 'Off' },
                          { secs: 300, label: '5 min' },
                          { secs: 600, label: '10 min' },
                          { secs: 900, label: '15 min' },
                        ].map((tm) => (
                          <button
                            key={tm.secs}
                            onClick={() => setTimerOption(tm.secs)}
                            className={`h-10 rounded-[8px] text-[12px] font-medium transition cursor-pointer ${
                              timerOption === tm.secs
                                ? 'bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111]'
                                : 'bg-[#FFFFFF] dark:bg-[#181818] border border-[#D1D5DB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA] hover:bg-[#F9FAFB] dark:hover:bg-[#232323]'
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
                    className="w-full h-12 rounded-[10px] bg-[#111827] hover:bg-[#000000] dark:bg-[#FAFAFA] dark:hover:bg-[#E5E7EB] text-[#FFFFFF] dark:text-[#111111] font-medium text-[16px] shadow-xs transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 mt-4"
                  >
                    {generating ? (
                      <>
                        <div className="w-5 h-5 rounded-full border-2 border-white dark:border-black border-t-transparent animate-spin" />
                        Generating Grounded AI Quiz...
                      </>
                    ) : (
                      <>
                        <Sparkles size={20} />
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
            {/* ----------------------------------------------------------------------- */}
            {viewState === 'results' && completedResult && (
              <motion.div
                key="results-screen"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="max-w-4xl mx-auto space-y-6"
              >
                {/* Hero Score Box */}
                <div className="bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] p-8 rounded-[12px] shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="space-y-3 text-center md:text-left">
                    <span className="px-3 py-1 bg-[#FFFFFF] dark:bg-[#111111] text-[#111827] dark:text-[#FAFAFA] font-medium text-[12px] rounded-[6px] uppercase tracking-wider">
                      Quiz Complete
                    </span>
                    <h2 className="text-[32px] font-bold">
                      {completedResult.percentage >= 80
                        ? 'Outstanding Master!'
                        : completedResult.percentage >= 60
                        ? 'Good Performance!'
                        : 'Needs Review'}
                    </h2>
                    <p className="text-[14px] opacity-80 max-w-md">
                      Quiz generated from <strong>{completedResult.document_name}</strong> in {completedResult.subject}.
                    </p>
                  </div>

                  {/* Score Metric */}
                  <div className="flex flex-col items-center justify-center p-6 rounded-[10px] border border-white/20 dark:border-black/20 shrink-0">
                    <div className="text-[48px] font-bold">
                      {completedResult.percentage}%
                    </div>
                    <div className="text-[12px] font-medium mt-1">
                      Score: {completedResult.score} / {completedResult.total_questions} Correct
                    </div>
                  </div>
                </div>

                {/* Metrics Breakdown Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-[#FFFFFF] dark:bg-[#181818] p-5 rounded-[12px] border border-[#E5E7EB] dark:border-[#2A2A2A] text-center space-y-1">
                    <div className="text-[12px] text-[#6B7280] dark:text-[#A3A3A3] font-medium uppercase">Correct</div>
                    <div className="text-[24px] font-bold text-[#111827] dark:text-[#FAFAFA] flex items-center justify-center gap-1">
                      <CheckCircle2 size={20} />
                      {completedResult.correct_answers}
                    </div>
                  </div>
                  <div className="bg-[#FFFFFF] dark:bg-[#181818] p-5 rounded-[12px] border border-[#E5E7EB] dark:border-[#2A2A2A] text-center space-y-1">
                    <div className="text-[12px] text-[#6B7280] dark:text-[#A3A3A3] font-medium uppercase">Wrong</div>
                    <div className="text-[24px] font-bold text-[#111827] dark:text-[#FAFAFA] flex items-center justify-center gap-1">
                      <XCircle size={20} />
                      {completedResult.wrong_answers}
                    </div>
                  </div>
                  <div className="bg-[#FFFFFF] dark:bg-[#181818] p-5 rounded-[12px] border border-[#E5E7EB] dark:border-[#2A2A2A] text-center space-y-1">
                    <div className="text-[12px] text-[#6B7280] dark:text-[#A3A3A3] font-medium uppercase">Time Taken</div>
                    <div className="text-[24px] font-bold text-[#111827] dark:text-[#FAFAFA]">
                      {formatTime(completedResult.time_taken_seconds)}
                    </div>
                  </div>
                  <div className="bg-[#FFFFFF] dark:bg-[#181818] p-5 rounded-[12px] border border-[#E5E7EB] dark:border-[#2A2A2A] text-center space-y-1">
                    <div className="text-[12px] text-[#6B7280] dark:text-[#A3A3A3] font-medium uppercase">Difficulty</div>
                    <div className="text-[24px] font-bold text-[#111827] dark:text-[#FAFAFA]">
                      {completedResult.difficulty}
                    </div>
                  </div>
                </div>

                {/* AI Recommendations Section */}
                <div className="p-6 rounded-[12px] bg-[#FFFFFF] dark:bg-[#181818] border border-[#E5E7EB] dark:border-[#2A2A2A] space-y-4">
                  <h3 className="text-[18px] font-bold text-[#111827] dark:text-[#FAFAFA] flex items-center gap-2">
                    <Sparkles size={20} />
                    <span>AI Study Recommendations</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      onClick={() => navigate('/notes')}
                      className="p-4 rounded-[10px] border border-[#D1D5DB] dark:border-[#2A2A2A] bg-[#FFFFFF] dark:bg-[#181818] hover:bg-[#F9FAFB] dark:hover:bg-[#232323] text-left transition cursor-pointer space-y-1"
                    >
                      <BookOpen size={18} className="text-[#111827] dark:text-[#FAFAFA]" />
                      <p className="font-bold text-[14px] text-[#111827] dark:text-[#FAFAFA]">Generate Notes</p>
                      <p className="text-[12px] text-[#6B7280] dark:text-[#A3A3A3]">Build structured revision notes from this document.</p>
                    </button>
                    <button
                      onClick={() => navigate('/documents')}
                      className="p-4 rounded-[10px] border border-[#D1D5DB] dark:border-[#2A2A2A] bg-[#FFFFFF] dark:bg-[#181818] hover:bg-[#F9FAFB] dark:hover:bg-[#232323] text-left transition cursor-pointer space-y-1"
                    >
                      <FileText size={18} className="text-[#111827] dark:text-[#FAFAFA]" />
                      <p className="font-bold text-[14px] text-[#111827] dark:text-[#FAFAFA]">Review Document</p>
                      <p className="text-[12px] text-[#6B7280] dark:text-[#A3A3A3]">Re-read extracted sections and source materials.</p>
                    </button>
                    <button
                      onClick={() => setViewState('config')}
                      className="p-4 rounded-[10px] border border-[#D1D5DB] dark:border-[#2A2A2A] bg-[#FFFFFF] dark:bg-[#181818] hover:bg-[#F9FAFB] dark:hover:bg-[#232323] text-left transition cursor-pointer space-y-1"
                    >
                      <RotateCcw size={18} className="text-[#111827] dark:text-[#FAFAFA]" />
                      <p className="font-bold text-[14px] text-[#111827] dark:text-[#FAFAFA]">Practice Weak Areas</p>
                      <p className="text-[12px] text-[#6B7280] dark:text-[#A3A3A3]">Generate a new targeted quiz with harder questions.</p>
                    </button>
                  </div>
                </div>

                {/* Retake & Action Buttons */}
                <div className="flex items-center justify-end gap-3">
                  <button
                    onClick={() => setViewState('config')}
                    className="h-10 px-5 rounded-[10px] bg-[#FFFFFF] dark:bg-[#181818] border border-[#D1D5DB] dark:border-[#2A2A2A] text-[14px] font-medium text-[#111827] dark:text-[#FAFAFA] hover:bg-[#F9FAFB] dark:hover:bg-[#232323] transition flex items-center gap-2 cursor-pointer"
                  >
                    <RotateCcw size={16} />
                    New Quiz Setup
                  </button>
                  <button
                    onClick={handleStartQuiz}
                    className="h-10 px-5 rounded-[10px] bg-[#111827] hover:bg-[#000000] dark:bg-[#FAFAFA] dark:hover:bg-[#E5E7EB] text-[#FFFFFF] dark:text-[#111111] text-[14px] font-medium shadow-xs transition flex items-center gap-2 cursor-pointer"
                  >
                    <Zap size={16} />
                    Retake Same Quiz
                  </button>
                </div>

                {/* Detailed Questions & AI Grounded Explanations */}
                <div className="space-y-4 pt-4">
                  <h3 className="text-[22px] font-bold text-[#111827] dark:text-[#FAFAFA] flex items-center gap-2">
                    <BarChart2 size={22} />
                    <span>Question Review & AI Explanations</span>
                  </h3>

                  {completedResult.questions_data?.map((q, idx) => (
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
          <div className="bg-[#FFFFFF] dark:bg-[#181818] p-6 rounded-[12px] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-[22px] font-bold text-[#111827] dark:text-[#FAFAFA] flex items-center gap-2">
                  <History size={22} />
                  <span>Saved Quiz Attempts & History</span>
                </h2>
                <p className="text-[14px] text-[#6B7280] dark:text-[#A3A3A3]">Track your test history, review scores, and delete past attempts</p>
              </div>
              <span className="text-[12px] font-medium text-[#6B7280] dark:text-[#A3A3A3]">Total: {quizHistory.length} Attempts</span>
            </div>

            {/* Search & Filters Toolbar */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-2">
              {/* Search Bar */}
              <div className="relative w-full md:w-80">
                <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7280] dark:text-[#A3A3A3]" />
                <input
                  type="text"
                  placeholder="Search quizzes by title or topic..."
                  value={historySearchQuery}
                  onChange={(e) => setHistorySearchQuery(e.target.value)}
                  className="w-full h-10 pl-10 pr-4 rounded-[10px] border border-[#D1D5DB] dark:border-[#2A2A2A] bg-[#FFFFFF] dark:bg-[#181818] text-[14px] text-[#111827] dark:text-[#FAFAFA] outline-none"
                />
              </div>

              {/* Filter Chips */}
              <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
                {(['All', 'Completed', 'Pending'] as const).map((flt) => (
                  <button
                    key={flt}
                    onClick={() => setHistoryFilter(flt)}
                    className={`h-9 px-4 rounded-[8px] text-[14px] font-medium transition cursor-pointer whitespace-nowrap ${
                      historyFilter === flt
                        ? 'bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111]'
                        : 'bg-[#FFFFFF] dark:bg-[#181818] border border-[#D1D5DB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA] hover:bg-[#F9FAFB] dark:hover:bg-[#232323]'
                    }`}
                  >
                    {flt}
                  </button>
                ))}
              </div>
            </div>

            {historyLoading ? (
              <div className="py-12 text-center text-[#6B7280] dark:text-[#A3A3A3] text-[14px]">Loading quiz history...</div>
            ) : filteredHistory.length === 0 ? (
              <div className="p-12 text-center border-2 border-dashed border-[#D1D5DB] dark:border-[#2A2A2A] rounded-[12px] bg-[#FFFFFF] dark:bg-[#181818] space-y-3">
                <div className="w-12 h-12 mx-auto rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA] flex items-center justify-center">
                  <History size={24} />
                </div>
                <h3 className="text-[18px] font-bold text-[#111827] dark:text-[#FAFAFA]">No Quizzes Yet</h3>
                <p className="text-[14px] text-[#6B7280] dark:text-[#A3A3A3]">Generate your first AI quiz to see your performance history here.</p>
                <button
                  onClick={() => setActiveTab('create')}
                  className="h-10 px-5 bg-[#111827] hover:bg-[#000000] dark:bg-[#FAFAFA] dark:hover:bg-[#E5E7EB] text-[#FFFFFF] dark:text-[#111111] text-[14px] font-medium rounded-[10px] shadow-xs cursor-pointer"
                >
                  Generate First Quiz
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredHistory.map((item) => (
                  <div
                    key={item.id}
                    className="p-5 rounded-[12px] border border-[#E5E7EB] dark:border-[#2A2A2A] bg-[#FFFFFF] dark:bg-[#181818] hover:border-[#111827] dark:hover:border-[#FAFAFA] transition duration-150 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[16px] text-[#111827] dark:text-[#FAFAFA]">
                          {item.title}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-[6px] text-[12px] font-medium bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA]">
                          {item.difficulty}
                        </span>
                      </div>
                      <div className="text-[12px] text-[#6B7280] dark:text-[#A3A3A3] flex items-center gap-3">
                        <span>Doc: {item.document_name}</span>
                        <span>•</span>
                        <span>Date: {new Date(item.created_at).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>Type: {item.quiz_type}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                      <div className="text-right">
                        <div className="text-[20px] font-bold text-[#111827] dark:text-[#FAFAFA]">{item.percentage}%</div>
                        <div className="text-[12px] text-[#6B7280] dark:text-[#A3A3A3]">
                          {item.score} / {item.total_questions} Correct
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteHistory(item.id)}
                        className="p-2 rounded-[8px] text-[#6B7280] hover:text-[#DC2626] transition cursor-pointer"
                        title="Delete History Entry"
                      >
                        <Trash2 size={18} />
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
