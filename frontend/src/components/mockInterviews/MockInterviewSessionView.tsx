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
      <div className="py-16 text-center text-[#6B7280] dark:text-[#A3A3A3] text-[14px]">
        Loading active question...
      </div>
    );
  }

  return (
    <div className="bg-[#FFFFFF] dark:bg-[#181818] p-6 md:p-8 rounded-[12px] border border-[#D1D5DB] dark:border-[#3F3F46] shadow-xs space-y-6">
      {/* Session Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#F3F4F6] dark:border-[#2A2A2A]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[10px] bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111] flex items-center justify-center shrink-0">
            <Brain size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-[6px] text-[12px] font-medium bg-[#111827] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#111111]">
                {session.interview_type}
              </span>
              <span className="px-2.5 py-0.5 rounded-[6px] text-[12px] font-medium bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA]">
                {session.difficulty}
              </span>
            </div>
            <h2 className="text-[18px] font-bold text-[#111827] dark:text-[#FAFAFA] mt-1">
              {session.title}
            </h2>
          </div>
        </div>

        {/* Live Timer & Exit */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-[10px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111827] dark:text-[#FAFAFA] font-bold text-[14px] flex items-center gap-2">
            <Clock3 size={18} />
            <span>Time Left: {formatTimer(timeLeftSeconds)}</span>
          </div>

          <button
            onClick={onCancelSession}
            className="h-10 px-4 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] text-[#111827] dark:text-[#FAFAFA] text-[14px] font-medium cursor-pointer"
          >
            End Early
          </button>
        </div>
      </div>

      {/* Question Card Box */}
      <div className="p-6 rounded-[12px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[12px] font-medium uppercase tracking-wider text-[#111827] dark:text-[#FAFAFA]">
            Question #{currentQa.question_number}
          </span>

          {/* TTS Audio Controls */}
          <button
            onClick={() => (isSpeaking ? stopSpeaking() : speakText(currentQa.question_text))}
            className="h-8 px-3 rounded-[6px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#181818] text-[#111827] dark:text-[#FAFAFA] text-[12px] font-medium hover:bg-[#F9FAFB] dark:hover:bg-[#232323] transition flex items-center gap-1.5 cursor-pointer"
          >
            {isSpeaking ? <VolumeX size={15} /> : <Volume2 size={15} />}
            <span>{isSpeaking ? 'Stop Speaking' : 'Replay Question'}</span>
          </button>
        </div>

        <p className="text-[18px] font-bold text-[#111827] dark:text-[#FAFAFA] leading-relaxed">
          {currentQa.question_text}
        </p>
      </div>

      {/* Voice Recorder & Audio Controls */}
      <div className="p-5 rounded-[12px] bg-[#F8FAFC] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2A2A] space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[14px] font-medium text-[#111827] dark:text-[#FAFAFA]">
              Answer Mode: <strong className="font-bold">Voice or Keyboard</strong>
            </span>
            {isRecording && (
              <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#111827] dark:text-[#FAFAFA] animate-pulse">
                <span className="h-2 w-2 rounded-full bg-[#111827] dark:bg-[#FAFAFA]" />
                Live Recording STT...
              </span>
            )}
          </div>

          {/* Voice Action Buttons */}
          <div className="flex items-center gap-2">
            {!isRecording && !isPaused ? (
              <button
                onClick={startRecording}
                className="h-9 px-3.5 rounded-[8px] bg-[#111827] hover:bg-[#000000] dark:bg-[#FAFAFA] dark:hover:bg-[#E5E5E5] text-[#FFFFFF] dark:text-[#111111] text-[12px] font-medium transition flex items-center gap-1.5 cursor-pointer"
              >
                <Mic size={15} />
                <span>Start Recording</span>
              </button>
            ) : isRecording ? (
              <button
                onClick={pauseRecording}
                className="h-9 px-3.5 rounded-[8px] bg-[#111827] hover:bg-[#000000] dark:bg-[#FAFAFA] dark:hover:bg-[#E5E5E5] text-[#FFFFFF] dark:text-[#111111] text-[12px] font-medium transition flex items-center gap-1.5 cursor-pointer"
              >
                <Pause size={15} />
                <span>Pause</span>
              </button>
            ) : (
              <button
                onClick={resumeRecording}
                className="h-9 px-3.5 rounded-[8px] bg-[#111827] hover:bg-[#000000] dark:bg-[#FAFAFA] dark:hover:bg-[#E5E5E5] text-[#FFFFFF] dark:text-[#111111] text-[12px] font-medium transition flex items-center gap-1.5 cursor-pointer"
              >
                <Play size={15} />
                <span>Resume</span>
              </button>
            )}

            {(isRecording || isPaused) && (
              <button
                onClick={stopRecording}
                className="h-9 px-3.5 rounded-[8px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#181818] text-[#111827] dark:text-[#FAFAFA] text-[12px] font-medium hover:bg-[#F9FAFB] dark:hover:bg-[#232323] transition flex items-center gap-1.5 cursor-pointer"
              >
                <Square size={15} />
                <span>Stop</span>
              </button>
            )}

            <button
              onClick={clearAnswer}
              title="Clear Answer Text"
              className="h-9 w-9 rounded-[8px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#181818] text-[#111827] dark:text-[#FAFAFA] hover:bg-[#F9FAFB] dark:hover:bg-[#232323] flex items-center justify-center cursor-pointer"
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
          className="w-full p-4 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] bg-[#FFFFFF] dark:bg-[#181818] text-[#111827] dark:text-[#FAFAFA] text-[14px] outline-none leading-relaxed"
        />
      </div>

      {/* Footer Submit Buttons */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={handleFinalEvaluation}
          disabled={evaluating}
          className="h-10 px-5 rounded-[10px] border border-[#D1D5DB] dark:border-[#3F3F46] text-[#111827] dark:text-[#FAFAFA] text-[14px] font-medium cursor-pointer flex items-center gap-2"
        >
          <Award size={16} />
          <span>{evaluating ? 'Evaluating...' : 'Finish & View Evaluation'}</span>
        </button>

        <button
          onClick={handleSubmitAnswer}
          disabled={submitting || !studentAnswer.trim()}
          className="h-10 px-6 rounded-[10px] bg-[#111827] hover:bg-[#000000] dark:bg-[#FAFAFA] dark:hover:bg-[#E5E5E5] text-[#FFFFFF] dark:text-[#111111] font-medium text-[14px] shadow-xs cursor-pointer disabled:opacity-50 inline-flex items-center gap-2"
        >
          <Send size={16} />
          <span>{submitting ? 'Evaluating Answer...' : 'Submit Answer & Next'}</span>
        </button>
      </div>
    </div>
  );
};
