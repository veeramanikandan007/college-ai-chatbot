import { fetchApi, API_URL } from '../lib/api';

export interface FlashcardItem {
  front: string;
  back: string;
}

export interface MCQItem {
  question: string;
  options: string[];
  correct_answer: string;
  explanation?: string;
}

export interface QuestionsGroup {
  two_marks: string[];
  five_marks: string[];
  ten_marks: string[];
  viva_questions: string[];
}

export interface NoteContentSchema {
  title: string;
  executive_summary: string;
  chapter_summary: string;
  key_concepts: string[];
  definitions: { term: string; definition: string }[];
  formulae: { formula: string; description: string }[];
  important_dates: { date_or_event: string; significance: string }[];
  questions: QuestionsGroup;
  flashcards: FlashcardItem[];
  mcqs: MCQItem[];
  checklist: string[];
}

export interface NoteResponse {
  id: number;
  user_id: number;
  document_id?: number;
  document_name: string;
  title: string;
  created_at: string;
  content?: NoteContentSchema;
  summary?: string;
  key_concepts?: string;
  definitions?: string;
  formulae?: string;
  important_dates?: string;
  questions?: string;
  flashcards?: string;
  mcqs?: string;
  checklist?: string;
}

export interface NoteListItem {
  id: number;
  user_id: number;
  document_name: string;
  title: string;
  created_at: string;
}

export const generateNote = async (file: File): Promise<NoteResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}/notes/generate`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to generate AI notes');
  }

  return await response.json();
};

export const getNotesHistory = async (): Promise<NoteListItem[]> => {
  return await fetchApi('/notes');
};

export const getNoteById = async (id: number): Promise<NoteResponse> => {
  return await fetchApi(`/notes/${id}`);
};

export const deleteNote = async (id: number): Promise<void> => {
  await fetchApi(`/notes/${id}`, { method: 'DELETE' });
};
