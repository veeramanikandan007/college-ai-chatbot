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

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B0F19] text-[#1E293B] dark:text-[#F8FAFC] p-4 md:p-8 font-body transition-colors">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* ========================================================================= */}
        {/* TOP HEADER & TABS BAR                                                      */}
        {/* ========================================================================= */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#111827] p-6 rounded-2xl border border-[#E2E8F0] dark:border-[#1E293B] shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0E2A6D] to-[#1E4DB7] text-white flex items-center justify-center shadow-md border border-[#D9A441]/30">
              <Brain size={26} strokeWidth={1.75} />
            </div>
            <div>
              <h1 className="font-heading font-bold text-2xl md:text-3xl text-[#0E2A6D] dark:text-white tracking-wide flex items-center gap-2">
                AI Quiz Generator
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#D9A441]/20 text-[#0E2A6D] dark:text-[#D9A441] font-semibold border border-[#D9A441]/30">
                  Grounded AI
                </span>
              </h1>
              <p className="text-sm text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                Generate document-based quizzes, test your understanding, and view instant AI explanations.
              </p>
            </div>
          </div>

          {/* Tab buttons */}
          <div className="flex items-center bg-[#F1F5F9] dark:bg-[#1E293B] p-1 rounded-xl shrink-0">
            <button
              onClick={() => {
                setActiveTab('create');
                setViewState('config');
              }}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 flex items-center gap-2 ${
                activeTab === 'create'
                  ? 'bg-[#0E2A6D] text-white shadow-xs'
                  : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0E2A6D] dark:hover:text-white'
              }`}
            >
              <Zap size={16} />
              Quiz Generator
            </button>
            <button
              onClick={() => {
                setActiveTab('history');
                fetchHistory();
              }}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 flex items-center gap-2 ${
                activeTab === 'history'
                  ? 'bg-[#0E2A6D] text-white shadow-xs'
                  : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0E2A6D] dark:hover:text-white'
              }`}
            >
              <History size={16} />
              Quiz History
              {quizHistory.length > 0 && (
                <span className="ml-1 px-1.5 py-0.2 bg-[#D9A441] text-[#0E2A6D] font-bold text-xs rounded-full">
                  {quizHistory.length}
                </span>
              )}
            </button>
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
                <div className="lg:col-span-7 bg-white dark:bg-[#111827] p-6 rounded-2xl border border-[#E2E8F0] dark:border-[#1E293B] shadow-xs space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-heading font-bold text-lg text-[#0E2A6D] dark:text-white flex items-center gap-2">
                        <FileText size={20} className="text-[#1E4DB7] dark:text-[#60A5FA]" />
                        1. Select Source Document
                      </h2>
                      <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                        Questions will be generated ONLY from the content of the selected file.
                      </p>
                    </div>

                    {/* Upload new doc inline */}
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
                      className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-[#1E4DB7]/10 hover:bg-[#1E4DB7]/20 text-[#1E4DB7] dark:text-[#60A5FA] border border-[#1E4DB7]/20 transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <FileUp size={15} />
                      {uploading ? 'Uploading...' : 'Upload File'}
                    </button>
                  </div>

                  {/* Document Grid / List */}
                  {loadingDocs ? (
                    <div className="py-12 text-center text-[#64748B]">Loading your documents...</div>
                  ) : documents.length === 0 ? (
                    <div className="p-8 border-2 border-dashed border-[#E2E8F0] dark:border-[#1E293B] rounded-xl text-center space-y-3">
                      <UploadCloud size={36} className="mx-auto text-[#64748B]" />
                      <p className="text-sm font-medium text-[#64748B]">No uploaded documents found.</p>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 bg-[#0E2A6D] text-white text-sm font-semibold rounded-xl"
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
                            className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                              isSelected
                                ? 'border-[#1E4DB7] bg-[#1E4DB7]/5 dark:bg-[#1E4DB7]/20 shadow-xs'
                                : 'border-[#E2E8F0] dark:border-[#1E293B] bg-[#F8FAFC] dark:bg-[#1E293B]/40 hover:border-[#1E4DB7]/40'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div className="flex items-center gap-2 overflow-hidden">
                                <FileText
                                  size={18}
                                  className={isSelected ? 'text-[#1E4DB7] dark:text-[#60A5FA]' : 'text-[#64748B]'}
                                />
                                <span className="font-semibold text-sm truncate text-[#1E293B] dark:text-white">
                                  {doc.original_name}
                                </span>
                              </div>
                              {isSelected && (
                                <div className="w-5 h-5 rounded-full bg-[#1E4DB7] text-white flex items-center justify-center shrink-0">
                                  <Check size={12} strokeWidth={3} />
                                </div>
                              )}
                            </div>

                            <div className="flex items-center justify-between text-xs text-[#64748B] dark:text-[#94A3B8]">
                              <span className="uppercase px-2 py-0.5 rounded bg-white dark:bg-[#111827] font-semibold border border-[#E2E8F0] dark:border-[#334155]">
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
                  <div className="p-3 bg-[#F1F5F9] dark:bg-[#1E293B]/60 rounded-xl text-xs text-[#64748B] dark:text-[#94A3B8] flex items-center gap-2">
                    <span className="font-bold text-[#0E2A6D] dark:text-[#D9A441]">Supported Sources:</span>
                    <span>PDF • DOCX • PPT • PPTX • TXT</span>
                  </div>
                </div>

                {/* Right Side: Quiz Settings Form (5 cols) */}
                <div className="lg:col-span-5 bg-white dark:bg-[#111827] p-6 rounded-2xl border border-[#E2E8F0] dark:border-[#1E293B] shadow-xs space-y-6 flex flex-col justify-between">
                  <div className="space-y-5">
                    <h2 className="font-heading font-bold text-lg text-[#0E2A6D] dark:text-white flex items-center gap-2">
                      <Sliders size={20} className="text-[#D9A441]" />
                      2. Customize Settings
                    </h2>

                    {/* Question Count */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">
                        Number of Questions
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {[5, 10, 15, 20].map((count) => (
                          <button
                            key={count}
                            onClick={() => setNumQuestions(count)}
                            className={`py-2 rounded-xl text-sm font-bold border transition ${
                              numQuestions === count
                                ? 'bg-[#0E2A6D] text-white border-[#0E2A6D]'
                                : 'bg-[#F8FAFC] dark:bg-[#1E293B] text-[#475569] dark:text-[#CBD5E1] border-[#E2E8F0] dark:border-[#334155]'
                            }`}
                          >
                            {count}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Difficulty */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">
                        Difficulty Level
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['Easy', 'Medium', 'Hard'] as const).map((diff) => (
                          <button
                            key={diff}
                            onClick={() => setDifficulty(diff)}
                            className={`py-2 rounded-xl text-sm font-bold border transition ${
                              difficulty === diff
                                ? diff === 'Easy'
                                  ? 'bg-emerald-600 text-white border-emerald-600'
                                  : diff === 'Medium'
                                  ? 'bg-[#1E4DB7] text-white border-[#1E4DB7]'
                                  : 'bg-purple-600 text-white border-purple-600'
                                : 'bg-[#F8FAFC] dark:bg-[#1E293B] text-[#475569] dark:text-[#CBD5E1] border-[#E2E8F0] dark:border-[#334155]'
                            }`}
                          >
                            {diff}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Quiz Type */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">
                        Quiz Format / Question Type
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
                            className={`py-2 px-3 rounded-xl text-xs font-bold border text-left transition ${
                              quizType === t.id
                                ? 'bg-[#0E2A6D] text-white border-[#0E2A6D]'
                                : 'bg-[#F8FAFC] dark:bg-[#1E293B] text-[#475569] dark:text-[#CBD5E1] border-[#E2E8F0] dark:border-[#334155]'
                            }`}
                          >
                            {t.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Timer setting */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">
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
                            className={`py-2 rounded-xl text-xs font-bold border transition ${
                              timerOption === tm.secs
                                ? 'bg-[#D9A441] text-[#0E2A6D] border-[#D9A441]'
                                : 'bg-[#F8FAFC] dark:bg-[#1E293B] text-[#475569] dark:text-[#CBD5E1] border-[#E2E8F0] dark:border-[#334155]'
                            }`}
                          >
                            {tm.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Generate Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleStartQuiz}
                    disabled={generating || !selectedDoc}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-[#0E2A6D] to-[#1E4DB7] text-white font-heading font-bold text-base shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-4 border border-[#D9A441]/30"
                  >
                    {generating ? (
                      <>
                        <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                        Generating Grounded AI Quiz...
                      </>
                    ) : (
                      <>
                        <Sparkles size={20} className="text-[#D9A441]" />
                        Generate AI Quiz Now
                      </>
                    )}
                  </motion.button>
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
                {/* Top Status Card */}
                <div className="bg-white dark:bg-[#111827] p-5 rounded-2xl border border-[#E2E8F0] dark:border-[#1E293B] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="px-3 py-1 bg-[#0E2A6D]/10 text-[#0E2A6D] dark:text-[#60A5FA] font-bold text-xs rounded-lg">
                      Question {currentQuestionIndex + 1} of {currentQuestions.length}
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg">
                      {difficulty}
                    </span>
                    <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg">
                      {currentQuestions[currentQuestionIndex]?.type}
                    </span>
                  </div>

                  {/* Progress & Timer */}
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    {timerOption > 0 && (
                      <div
                        className={`flex items-center gap-1.5 text-sm font-mono font-bold px-3 py-1.5 rounded-xl border ${
                          secondsRemaining < 60
                            ? 'bg-red-500/10 text-red-600 border-red-500/30 animate-pulse'
                            : 'bg-slate-100 dark:bg-slate-800 text-[#0E2A6D] dark:text-[#D9A441] border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        <Clock size={16} />
                        {formatTime(secondsRemaining)}
                      </div>
                    )}
                    
                    <button
                      onClick={() => setIsSubmitConfirmOpen(true)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
                    >
                      Submit Quiz
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-[#E2E8F0] dark:bg-[#1E293B] h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-[#0E2A6D] to-[#1E4DB7] h-full transition-all duration-300"
                    style={{
                      width: `${((currentQuestionIndex + 1) / currentQuestions.length) * 100}%`,
                    }}
                  />
                </div>

                {/* Question Box */}
                <div className="bg-white dark:bg-[#111827] p-8 rounded-2xl border border-[#E2E8F0] dark:border-[#1E293B] shadow-md space-y-6">
                  <h3 className="font-heading font-bold text-xl md:text-2xl text-[#0E2A6D] dark:text-white leading-relaxed">
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
                          <motion.div
                            key={idx}
                            whileHover={{ scale: 1.005 }}
                            whileTap={{ scale: 0.995 }}
                            onClick={() => handleAnswerSelect(opt)}
                            className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 flex items-center justify-between ${
                              isSelected
                                ? 'border-[#1E4DB7] bg-[#1E4DB7]/10 dark:bg-[#1E4DB7]/25 text-[#0E2A6D] dark:text-white font-semibold'
                                : 'border-[#E2E8F0] dark:border-[#1E293B] bg-[#F8FAFC] dark:bg-[#1E293B]/40 hover:border-[#1E4DB7]/40 text-[#334155] dark:text-[#CBD5E1]'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-8 h-8 rounded-lg font-bold text-xs flex items-center justify-center ${
                                  isSelected
                                    ? 'bg-[#1E4DB7] text-white'
                                    : 'bg-white dark:bg-[#111827] border border-[#CBD5E1] dark:border-[#475569] text-[#64748B]'
                                }`}
                              >
                                {optionLabels[idx] || idx + 1}
                              </div>
                              <span className="text-base">{opt}</span>
                            </div>
                            {isSelected && (
                              <div className="w-6 h-6 rounded-full bg-[#1E4DB7] text-white flex items-center justify-center">
                                <Check size={14} strokeWidth={3} />
                              </div>
                            )}
                          </motion.div>
                        );
                      })}
                    </div>
                  ) : (
                    /* Short Answer Input Area */
                    <div className="space-y-3">
                      <label className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
                        Your Answer
                      </label>
                      <textarea
                        rows={4}
                        value={userAnswers[currentQuestions[currentQuestionIndex].id] || ''}
                        onChange={(e) => handleAnswerSelect(e.target.value)}
                        placeholder="Type your brief answer here derived from the document content..."
                        className="w-full p-4 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-sm text-[#1E293B] dark:text-white outline-none focus:border-[#1E4DB7]"
                      />
                    </div>
                  )}

                  {/* Navigation controls */}
                  <div className="flex items-center justify-between pt-4 border-t border-[#E2E8F0] dark:border-[#1E293B]">
                    <button
                      onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                      disabled={currentQuestionIndex === 0}
                      className="px-4 py-2 rounded-xl text-sm font-semibold text-[#64748B] hover:text-[#0E2A6D] dark:hover:text-white disabled:opacity-40 flex items-center gap-1 cursor-pointer"
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
                        className="px-5 py-2.5 rounded-xl bg-[#0E2A6D] hover:bg-[#153B8A] text-white font-semibold text-sm shadow-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        Next Question
                        <ChevronRight size={18} />
                      </button>
                    ) : (
                      <button
                        onClick={() => setIsSubmitConfirmOpen(true)}
                        className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md flex items-center gap-1.5 cursor-pointer"
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
                <div className="bg-gradient-to-br from-[#0E2A6D] to-[#1E4DB7] text-white p-8 rounded-3xl shadow-lg border border-[#D9A441]/30 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="space-y-3 text-center md:text-left z-10">
                    <span className="px-3 py-1 bg-[#D9A441] text-[#0E2A6D] font-bold text-xs rounded-full uppercase tracking-wider">
                      Quiz Complete
                    </span>
                    <h2 className="font-heading font-extrabold text-3xl md:text-4xl">
                      {completedResult.percentage >= 80
                        ? 'Outstanding Master!'
                        : completedResult.percentage >= 60
                        ? 'Good Performance!'
                        : 'Needs Review'}
                    </h2>
                    <p className="text-sm text-slate-200 max-w-md">
                      Quiz generated from <strong>{completedResult.document_name}</strong> in {completedResult.subject}.
                    </p>
                  </div>

                  {/* Circular Score Metric */}
                  <div className="flex flex-col items-center justify-center bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 shrink-0 z-10">
                    <div className="text-5xl font-extrabold text-[#D9A441] font-heading">
                      {completedResult.percentage}%
                    </div>
                    <div className="text-xs text-slate-200 font-semibold mt-1">
                      Score: {completedResult.score} / {completedResult.total_questions} Correct
                    </div>
                  </div>
                </div>

                {/* Metrics Breakdown Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-white dark:bg-[#111827] p-4 rounded-xl border border-[#E2E8F0] dark:border-[#1E293B] text-center space-y-1">
                    <div className="text-xs text-[#64748B] font-bold uppercase">Correct</div>
                    <div className="text-2xl font-bold text-emerald-600 flex items-center justify-center gap-1">
                      <CheckCircle2 size={20} />
                      {completedResult.correct_answers}
                    </div>
                  </div>
                  <div className="bg-white dark:bg-[#111827] p-4 rounded-xl border border-[#E2E8F0] dark:border-[#1E293B] text-center space-y-1">
                    <div className="text-xs text-[#64748B] font-bold uppercase">Wrong</div>
                    <div className="text-2xl font-bold text-rose-500 flex items-center justify-center gap-1">
                      <XCircle size={20} />
                      {completedResult.wrong_answers}
                    </div>
                  </div>
                  <div className="bg-white dark:bg-[#111827] p-4 rounded-xl border border-[#E2E8F0] dark:border-[#1E293B] text-center space-y-1">
                    <div className="text-xs text-[#64748B] font-bold uppercase">Time Taken</div>
                    <div className="text-2xl font-bold text-[#0E2A6D] dark:text-[#D9A441]">
                      {formatTime(completedResult.time_taken_seconds)}
                    </div>
                  </div>
                  <div className="bg-white dark:bg-[#111827] p-4 rounded-xl border border-[#E2E8F0] dark:border-[#1E293B] text-center space-y-1">
                    <div className="text-xs text-[#64748B] font-bold uppercase">Difficulty</div>
                    <div className="text-2xl font-bold text-[#1E4DB7] dark:text-[#60A5FA]">
                      {completedResult.difficulty}
                    </div>
                  </div>
                </div>

                {/* Retake & Action Buttons */}
                <div className="flex items-center justify-end gap-3">
                  <button
                    onClick={() => setViewState('config')}
                    className="px-5 py-2.5 rounded-xl bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#1E293B] text-sm font-bold text-[#0E2A6D] dark:text-white hover:bg-[#F1F5F9] transition flex items-center gap-2 cursor-pointer"
                  >
                    <RotateCcw size={16} />
                    New Quiz Setup
                  </button>
                  <button
                    onClick={handleStartQuiz}
                    className="px-5 py-2.5 rounded-xl bg-[#0E2A6D] text-white text-sm font-bold shadow-md hover:bg-[#153B8A] transition flex items-center gap-2 cursor-pointer"
                  >
                    <Zap size={16} />
                    Retake Same Quiz
                  </button>
                </div>

                {/* Detailed Questions & AI Grounded Explanations */}
                <div className="space-y-4 pt-4">
                  <h3 className="font-heading font-bold text-xl text-[#0E2A6D] dark:text-white flex items-center gap-2">
                    <BarChart2 size={22} className="text-[#1E4DB7]" />
                    Question Review & AI Explanations
                  </h3>

                  {completedResult.questions_data?.map((q, idx) => (
                    <div
                      key={idx}
                      className={`p-6 rounded-2xl border bg-white dark:bg-[#111827] shadow-xs space-y-3 ${
                        q.is_correct
                          ? 'border-emerald-500/30'
                          : 'border-rose-500/30'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <span className="font-heading font-bold text-base text-[#1E293B] dark:text-white">
                          Q{idx + 1}. {q.question}
                        </span>
                        {q.is_correct ? (
                          <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 font-bold text-xs rounded-lg flex items-center gap-1 shrink-0">
                            <CheckCircle2 size={14} /> Correct
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-rose-500/10 text-rose-600 font-bold text-xs rounded-lg flex items-center gap-1 shrink-0">
                            <XCircle size={14} /> Incorrect
                          </span>
                        )}
                      </div>

                      {/* Answers comparison */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                        <div className="p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B]">
                          <span className="text-[#64748B] block font-bold mb-1">Your Answer:</span>
                          <span
                            className={`font-semibold ${
                              q.is_correct ? 'text-emerald-600' : 'text-rose-500'
                            }`}
                          >
                            {q.user_answer || '(No answer provided)'}
                          </span>
                        </div>
                        <div className="p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B]">
                          <span className="text-[#64748B] block font-bold mb-1">Correct Answer:</span>
                          <span className="font-semibold text-emerald-600">{q.correct_answer}</span>
                        </div>
                      </div>

                      {/* Grounded Explanation Box */}
                      <div className="p-4 rounded-xl bg-[#1E4DB7]/5 dark:bg-[#1E4DB7]/15 border border-[#1E4DB7]/20 text-xs text-[#1E293B] dark:text-[#CBD5E1] space-y-1">
                        <div className="font-bold text-[#1E4DB7] dark:text-[#60A5FA] flex items-center gap-1.5">
                          <Brain size={14} />
                          Document Grounded Explanation:
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
          <div className="bg-white dark:bg-[#111827] p-6 rounded-2xl border border-[#E2E8F0] dark:border-[#1E293B] shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-heading font-bold text-xl text-[#0E2A6D] dark:text-white flex items-center gap-2">
                <History size={22} className="text-[#D9A441]" />
                Saved Quiz Attempts & Performance
              </h2>
              <span className="text-xs text-[#64748B]">Total: {quizHistory.length} Quizzes</span>
            </div>

            {historyLoading ? (
              <div className="py-12 text-center text-[#64748B]">Loading quiz history...</div>
            ) : quizHistory.length === 0 ? (
              <div className="py-12 text-center text-[#64748B] space-y-2">
                <p>No past quizzes found. Generate your first quiz today!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {quizHistory.map((item) => (
                  <div
                    key={item.id}
                    className="p-5 rounded-2xl border border-[#E2E8F0] dark:border-[#1E293B] bg-[#F8FAFC] dark:bg-[#1E293B]/40 hover:border-[#1E4DB7]/40 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-heading font-bold text-base text-[#0E2A6D] dark:text-white">
                          {item.title}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#1E4DB7]/10 text-[#1E4DB7] dark:text-[#60A5FA]">
                          {item.difficulty}
                        </span>
                      </div>
                      <div className="text-xs text-[#64748B] flex items-center gap-3">
                        <span>Doc: {item.document_name}</span>
                        <span>•</span>
                        <span>Date: {new Date(item.created_at).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>Type: {item.quiz_type}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                      <div className="text-right">
                        <div className="text-xl font-extrabold text-[#D9A441]">{item.percentage}%</div>
                        <div className="text-xs text-[#64748B]">
                          {item.score} / {item.total_questions} Correct
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteHistory(item.id)}
                        className="p-2 rounded-xl text-[#64748B] hover:text-rose-500 hover:bg-rose-500/10 transition"
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
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#111827] max-w-md w-full p-6 rounded-2xl shadow-xl space-y-4 border border-[#E2E8F0] dark:border-[#1E293B]">
              <div className="flex items-center gap-3 text-amber-500">
                <AlertTriangle size={28} />
                <h3 className="font-heading font-bold text-lg text-[#1E293B] dark:text-white">
                  Confirm Quiz Submission
                </h3>
              </div>
              <p className="text-sm text-[#64748B] dark:text-[#94A3B8]">
                You have answered {Object.keys(userAnswers).length} out of {currentQuestions.length} questions. Are you ready to finish and submit?
              </p>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setIsSubmitConfirmOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-[#64748B] hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Continue Quiz
                </button>
                <button
                  onClick={handleFinalSubmit}
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold text-sm shadow-md"
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
