import { fetchApi } from '../lib/api';

export interface MockInterview {
  id: number;
  user_id: number;
  title: string;
  interview_type: 'HR' | 'Technical' | 'Coding' | 'Aptitude' | 'Group Discussion';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  duration_minutes: number;
  target_role: string;
  overall_score: number;
  communication_score: number;
  confidence_score: number;
  grammar_score: number;
  technical_accuracy_score: number;
  fluency_score: number;
  professionalism_score: number;
  completeness_score: number;
  status: 'In Progress' | 'Completed' | 'Abandoned';
  feedback_summary?: string;
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
  created_at: string;
  completed_at?: string;
}

export interface InterviewQaLog {
  id: number;
  interview_id: number;
  question_number: number;
  question_text: string;
  student_answer?: string;
  audio_url?: string;
  score: number;
  feedback?: string;
  model_answer?: string;
  created_at: string;
}

export interface MockInterviewStartInput {
  title: string;
  interview_type: string;
  difficulty: string;
  duration_minutes: number;
  target_role: string;
}

export interface AnswerSubmitResponse {
  interview_id: number;
  question_number: number;
  evaluation_score: number;
  feedback: string;
  model_answer: string;
  next_question?: string;
  is_finished: boolean;
}

export interface InterviewEvaluation {
  interview_id: number;
  overall_score: number;
  communication_score: number;
  confidence_score: number;
  grammar_score: number;
  technical_accuracy_score: number;
  fluency_score: number;
  professionalism_score: number;
  completeness_score: number;
  feedback_summary: string;
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
  qa_logs: InterviewQaLog[];
}

export interface MockInterviewDashboardStats {
  total_interviews: number;
  average_score: number;
  best_score: number;
  completed_count: number;
  recent_interviews: MockInterview[];
}

export interface InterviewReport {
  interview: MockInterview;
  qa_logs: InterviewQaLog[];
  student_name: string;
  college_name: string;
}

export const getMockInterviews = async (params?: {
  interview_type?: string;
  status_filter?: string;
  min_score?: number;
  search?: string;
}): Promise<MockInterview[]> => {
  const searchParams = new URLSearchParams();
  if (params?.interview_type) searchParams.append('interview_type', params.interview_type);
  if (params?.status_filter) searchParams.append('status_filter', params.status_filter);
  if (params?.min_score) searchParams.append('min_score', String(params.min_score));
  if (params?.search) searchParams.append('search', params.search);

  const queryString = searchParams.toString();
  return fetchApi(`/mock-interviews${queryString ? `?${queryString}` : ''}`);
};

export const startMockInterview = async (input: MockInterviewStartInput): Promise<MockInterview> => {
  return fetchApi('/mock-interviews/start', {
    method: 'POST',
    body: JSON.stringify(input),
  });
};

export const getMockInterviewDetails = async (
  id: number
): Promise<{ interview: MockInterview; qa_logs: InterviewQaLog[] }> => {
  return fetchApi(`/mock-interviews/${id}`);
};

export const submitInterviewAnswer = async (
  id: number,
  student_answer: string,
  audio_url?: string
): Promise<AnswerSubmitResponse> => {
  return fetchApi(`/mock-interviews/${id}/submit-answer`, {
    method: 'POST',
    body: JSON.stringify({ student_answer, audio_url }),
  });
};

export const evaluateMockInterview = async (id: number): Promise<InterviewEvaluation> => {
  return fetchApi(`/mock-interviews/${id}/evaluate`, {
    method: 'POST',
  });
};

export const getInterviewDashboardStats = async (): Promise<MockInterviewDashboardStats> => {
  return fetchApi('/mock-interviews/dashboard/stats');
};

export const getInterviewReport = async (id: number): Promise<InterviewReport> => {
  return fetchApi(`/mock-interviews/${id}/report`);
};

export const deleteMockInterview = async (id: number): Promise<{ message: string; id: number }> => {
  return fetchApi(`/mock-interviews/${id}`, {
    method: 'DELETE',
  });
};
