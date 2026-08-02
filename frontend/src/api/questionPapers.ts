import { fetchApi } from '../lib/api';

export interface QuestionPaper {
  id: number;
  title: string;
  subject_code: string;
  subject_name: string;
  department: string;
  semester: number;
  academic_year: number;
  regulation: string;
  exam_type: 'Internal' | 'Model Exam' | 'University Exam';
  faculty_name?: string;
  file_name: string;
  file_url: string;
  file_size?: string;
  page_count?: number;
  view_count: number;
  download_count: number;
  is_pinned: boolean;
  is_bookmarked: boolean;
  uploaded_by?: number;
  created_at: string;
}

export interface FilterMeta {
  departments: string[];
  semesters: number[];
  regulations: string[];
  years: number[];
  exam_types: string[];
  subjects: { code: string; name: string }[];
}

export interface PaperAnalysis {
  paper_id: number;
  question_pattern: string;
  important_units: string[];
  repeated_questions: string[];
  frequently_asked_topics: string[];
  difficulty_analysis: {
    easy_percentage: number;
    medium_percentage: number;
    hard_percentage: number;
    overall_rating: string;
  };
  unit_wise_distribution: { unit: string; marks: number; percentage: number }[];
  expected_questions: string[];
  weightage_analysis: { topic: string; weightage: string }[];
}

export interface QuestionGeneratedItem {
  question: string;
  options?: string[];
  answer?: string;
  explanation?: string;
  marks?: string;
  breakdown?: string;
}

export interface QuestionGenerateResponse {
  paper_id: number;
  question_type: string;
  questions: QuestionGeneratedItem[];
}

export interface PaperRagChatResponse {
  paper_id: number;
  question: string;
  answer: string;
  sources: string[];
}

export const getQuestionPapers = async (params?: {
  department?: string;
  semester?: number;
  subject?: string;
  academic_year?: number;
  regulation?: string;
  exam_type?: string;
  search?: string;
  sort_by?: string;
  sort_order?: string;
  only_bookmarks?: boolean;
  only_history?: boolean;
}): Promise<QuestionPaper[]> => {
  const searchParams = new URLSearchParams();
  if (params?.department) searchParams.append('department', params.department);
  if (params?.semester) searchParams.append('semester', String(params.semester));
  if (params?.subject) searchParams.append('subject', params.subject);
  if (params?.academic_year) searchParams.append('academic_year', String(params.academic_year));
  if (params?.regulation) searchParams.append('regulation', params.regulation);
  if (params?.exam_type) searchParams.append('exam_type', params.exam_type);
  if (params?.search) searchParams.append('search', params.search);
  if (params?.sort_by) searchParams.append('sort_by', params.sort_by);
  if (params?.sort_order) searchParams.append('sort_order', params.sort_order);
  if (params?.only_bookmarks) searchParams.append('only_bookmarks', 'true');
  if (params?.only_history) searchParams.append('only_history', 'true');

  const queryString = searchParams.toString();
  return fetchApi(`/question-papers${queryString ? `?${queryString}` : ''}`);
};

export const getFilterMetadata = async (): Promise<FilterMeta> => {
  return fetchApi('/question-papers/filters/meta');
};

export const getQuestionPaperById = async (id: number): Promise<QuestionPaper> => {
  return fetchApi(`/question-papers/${id}`);
};

export const uploadQuestionPapers = async (
  files: File[],
  meta: {
    department: string;
    semester: number;
    subject_code: string;
    subject_name: string;
    academic_year: number;
    regulation: string;
    exam_type: string;
    faculty_name?: string;
  }
): Promise<QuestionPaper[]> => {
  const token = localStorage.getItem('token');
  const formData = new FormData();

  files.forEach((f) => formData.append('files', f));
  formData.append('department', meta.department);
  formData.append('semester', String(meta.semester));
  formData.append('subject_code', meta.subject_code);
  formData.append('subject_name', meta.subject_name);
  formData.append('academic_year', String(meta.academic_year));
  formData.append('regulation', meta.regulation);
  formData.append('exam_type', meta.exam_type);
  if (meta.faculty_name) formData.append('faculty_name', meta.faculty_name);

  const response = await fetch('/api/v1/question-papers/upload', {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Paper upload failed');
  }

  return response.json();
};

export const deleteQuestionPaper = async (id: number): Promise<{ message: string; id: number }> => {
  return fetchApi(`/question-papers/${id}`, {
    method: 'DELETE',
  });
};

export const togglePaperBookmark = async (id: number): Promise<{ paper_id: number; is_bookmarked: boolean; message: string }> => {
  return fetchApi(`/question-papers/${id}/bookmark`, {
    method: 'POST',
  });
};

export const getUserBookmarks = async (): Promise<QuestionPaper[]> => {
  return fetchApi('/question-papers/user/bookmarks');
};

export const getUserHistory = async (): Promise<QuestionPaper[]> => {
  return fetchApi('/question-papers/user/history');
};

export const getPaperAnalysis = async (id: number): Promise<PaperAnalysis> => {
  return fetchApi(`/question-papers/${id}/analysis`);
};

export const generateAiQuestions = async (
  id: number,
  question_type: 'mcqs' | '2_marks' | '5_marks' | '10_marks' | '16_marks' | 'viva' | 'similar'
): Promise<QuestionGenerateResponse> => {
  return fetchApi(`/question-papers/${id}/generate-questions`, {
    method: 'POST',
    body: JSON.stringify({ question_type }),
  });
};

export const askPaperRagChat = async (id: number, question: string): Promise<PaperRagChatResponse> => {
  return fetchApi(`/question-papers/${id}/rag-chat`, {
    method: 'POST',
    body: JSON.stringify({ question }),
  });
};
