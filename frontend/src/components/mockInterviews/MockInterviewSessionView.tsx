import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Play,
  Pause,
  Square,
  RefreshCw,
  Volume2,
  VolumeX,
  Brain,
  Clock3,
  Send,
  Sparkles,
  Award,
  CircleAlert
} from 'lucide-react';
import {
  MockInterview,
  InterviewQaLog,
  getMockInterviewDetails,
  submitInterviewAnswer,
  evaluateMockInterview,
  InterviewEvaluation
} from '../../api/mockInterviews';
import { useToast } from '../../context/ToastContext';

interface MockInterviewSessionViewProps {
  session: MockInterview;
  onSessionComplete: (evaluation: InterviewEvaluation) => void;
  onCancelSession: () => void;
}

export const MockInterviewSessionView: React.FC<MockInterviewSessionViewProps> = ({
  session,
  onSessionComplete,
  onCancelSession,
}) => {
  const { showToast } = useToast();

  const [qaLogs, setQaLogs] = useState<InterviewQaLog[]>([]);
  const [currentQa, setCurrentQa] = useState<InterviewQaLog | null>(null);
  const [studentAnswer, setStudentAnswer] = useState<string>('');

  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [evaluating, setEvaluating] = useState<boolean>(false);

  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(session.duration_minutes * 60);

  const recognitionRef = useRef<any>(null);

  // Fetch session details on load
  const loadSessionDetails = async () => {
    try {
      const data = await getMockInterviewDetails(session.id);
      setQaLogs(data.qa_logs);
      if (data.qa_logs.length > 0) {
        const latest = data.qa_logs[data.qa_logs.length - 1];
        setCurrentQa(latest);
        // Automatically trigger TTS speak for new question
        speakText(latest.question_text);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to load session questions', 'error');
    }
  };

  useEffect(() => {
    loadSessionDetails();
  }, [session.id]);

  // Session Timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          showToast('Time is up! Submitting for evaluation...', 'info');
          handleFinalEvaluation();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Text-To-Speech Synthesis function
  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Speech-To-Text Recognition controls
  const startRecording = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      showToast('Web Speech API is not supported in this browser. Please type your answer.', 'info');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsRecording(true);
        setIsPaused(false);
      };

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          }
        }
        if (finalTranscript) {
          setStudentAnswer((prev) => (prev ? prev + ' ' + finalTranscript : finalTranscript));
        }
      };

      recognition.onerror = (event: any) => {
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (err) {
      showToast('Microphone access permission error', 'error');
    }
  };

  const pauseRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
      setIsPaused(true);
    }
  };

  const resumeRecording = () => {
    startRecording();
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
    }
  };

  const clearAnswer = () => {
    setStudentAnswer('');
  };

  // Submit Answer
  const handleSubmitAnswer = async () => {
    if (!studentAnswer.trim()) {
      showToast('Please provide your answer before submitting', 'error');
      return;
    }

    stopRecording();
    stopSpeaking();
    setSubmitting(true);

    try {
      const res = await submitInterviewAnswer(session.id, studentAnswer);

      showToast(`Question ${res.question_number} score: ${res.evaluation_score}%`, 'success');
      setStudentAnswer('');

      if (res.is_finished) {
        await handleFinalEvaluation();
      } else {
        await loadSessionDetails();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to submit answer', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Final Evaluation
  const handleFinalEvaluation = async () => {
    stopRecording();
    stopSpeaking();
    setEvaluating(true);

    try {
      const evalRes = await evaluateMockInterview(session.id);
      showToast('Interview completed and evaluated!', 'success');
      onSessionComplete(evalRes);
    } catch (err: any) {
      showToast(err.message || 'Evaluation failed', 'error');
    } finally {
      setEvaluating(false);
    }
  };

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!currentQa) {
    return (
      <div className="py-16 text-center text-slate-400 text-xs">
        Loading active question...
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#1E293B] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
      {/* Session Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#0E2A6D] text-white dark:bg-[#60A5FA] dark:text-slate-950">
            <Brain size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-[#0E2A6D] text-white dark:bg-[#D9A441] dark:text-slate-950">
                {session.interview_type}
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400">
                {session.difficulty}
              </span>
            </div>
            <h2 className="text-lg font-bold font-heading text-slate-900 dark:text-white mt-0.5">
              {session.title}
            </h2>
          </div>
        </div>

        {/* Live Timer & Exit */}
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 font-extrabold text-sm border border-amber-200 dark:border-amber-900/50">
            <Clock3 size={18} />
            <span>Time Left: {formatTimer(timeLeftSeconds)}</span>
          </div>

          <button
            onClick={onCancelSession}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            End Early
          </button>
        </div>
      </div>

      {/* Question Card Box */}
      <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold uppercase tracking-wider text-[#0E2A6D] dark:text-[#60A5FA]">
            Question #{currentQa.question_number}
          </span>

          {/* TTS Audio Controls */}
          <button
            onClick={() => (isSpeaking ? stopSpeaking() : speakText(currentQa.question_text))}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              isSpeaking
                ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                : 'bg-[#0E2A6D]/10 text-[#0E2A6D] dark:bg-[#60A5FA]/10 dark:text-[#60A5FA]'
            }`}
          >
            {isSpeaking ? <VolumeX size={15} /> : <Volume2 size={15} />}
            <span>{isSpeaking ? 'Stop Speaking' : 'Replay Question'}</span>
          </button>
        </div>

        <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-relaxed">
          {currentQa.question_text}
        </p>
      </div>

      {/* Voice Recorder & Audio Controls */}
      <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Answer Mode: <strong className="text-purple-600 dark:text-purple-400">Voice or Keyboard</strong>
            </span>
            {isRecording && (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 animate-pulse">
                <span className="h-2 w-2 rounded-full bg-rose-500" />
                Live Recording STT...
              </span>
            )}
          </div>

          {/* Voice Action Buttons */}
          <div className="flex items-center gap-2">
            {!isRecording && !isPaused ? (
              <button
                onClick={startRecording}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-all shadow-xs"
              >
                <Mic size={15} />
                <span>Start Recording</span>
              </button>
            ) : isRecording ? (
              <button
                onClick={pauseRecording}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500 text-white text-xs font-bold hover:bg-amber-600 transition-all shadow-xs"
              >
                <Pause size={15} />
                <span>Pause</span>
              </button>
            ) : (
              <button
                onClick={resumeRecording}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-all shadow-xs"
              >
                <Play size={15} />
                <span>Resume</span>
              </button>
            )}

            {(isRecording || isPaused) && (
              <button
                onClick={stopRecording}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold hover:bg-slate-300 transition-all"
              >
                <Square size={15} />
                <span>Stop</span>
              </button>
            )}

            <button
              onClick={clearAnswer}
              title="Clear Answer Text"
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <RefreshCw size={15} />
            </button>
          </div>
        </div>

        {/* Answer Textarea */}
        <textarea
          rows={5}
          value={studentAnswer}
          onChange={(e) => setStudentAnswer(e.target.value)}
          placeholder="Speak using the microphone controls above or type your detailed response here..."
          className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0E2A6D] dark:focus:ring-[#60A5FA] leading-relaxed"
        />
      </div>

      {/* Footer Submit Buttons */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={handleFinalEvaluation}
          disabled={evaluating}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
        >
          <Award size={16} />
          <span>{evaluating ? 'Evaluating...' : 'Finish & View Evaluation'}</span>
        </button>

        <button
          onClick={handleSubmitAnswer}
          disabled={submitting || !studentAnswer.trim()}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#0E2A6D] text-white text-xs font-bold hover:bg-[#0E2A6D]/90 disabled:opacity-50 transition-all shadow-xs"
        >
          <Send size={16} />
          <span>{submitting ? 'Evaluating Answer...' : 'Submit Answer & Next'}</span>
        </button>
      </div>
    </div>
  );
};
