import { fetchApi, API_URL } from '../lib/api';

export interface OCRScanResponse {
  id: number;
  user_id: number;
  image_name: string;
  image_url?: string;
  extracted_text: string;
  language_detected: string;
  confidence_score: number;
  summary?: string;
  flashcards?: string;
  mcqs?: string;
  created_at: string;
}

export interface OCRScanListItem {
  id: number;
  user_id: number;
  image_name: string;
  language_detected: string;
  created_at: string;
}

export interface OCRActionPayload {
  action: 'summary' | 'explain' | 'mcqs' | 'flashcards' | 'translate' | 'questions';
  extracted_text: string;
  target_language?: string;
}

export const uploadAndExtractOCR = async (file: File): Promise<OCRScanResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}/ocr/upload`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to extract text from image');
  }

  return await response.json();
};

export const executeAIAction = async (payload: OCRActionPayload): Promise<{ action: string; result: string }> => {
  return await fetchApi('/ocr/action', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const getOCRHistory = async (): Promise<OCRScanListItem[]> => {
  return await fetchApi('/ocr/history');
};

export const getOCRScanById = async (id: number): Promise<OCRScanResponse> => {
  return await fetchApi(`/ocr/${id}`);
};

export const deleteOCRScan = async (id: number): Promise<void> => {
  await fetchApi(`/ocr/${id}`, { method: 'DELETE' });
};
