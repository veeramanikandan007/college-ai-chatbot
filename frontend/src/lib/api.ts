const DEFAULT_TIMEOUT_MS = 10000;

export const API_URL = '/api/v1';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

export const fetchApi = async (endpoint: string, options: RequestInit = {}, timeoutMs: number = DEFAULT_TIMEOUT_MS) => {
  const token = localStorage.getItem('token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const detail = errorData.detail;
      let errorMessage: string;
      if (!detail) {
        errorMessage = response.statusText || 'An error occurred';
      } else if (typeof detail === 'string') {
        errorMessage = detail;
      } else if (Array.isArray(detail)) {
        // FastAPI validation errors: [{loc, msg, type}, ...]
        errorMessage = detail.map((e: any) => e?.msg || JSON.stringify(e)).join(', ');
      } else if (typeof detail === 'object') {
        errorMessage = detail.msg || detail.message || JSON.stringify(detail);
      } else {
        errorMessage = String(detail);
      }
      throw new ApiError(response.status, errorMessage);
    }

    const text = await response.text();
    return text ? JSON.parse(text) : {};
  } catch (err) {
    clearTimeout(timeoutId);
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new ApiError(0, 'Request timed out. Please check your connection and try again.');
    }
    if (err instanceof ApiError) {
      throw err;
    }
    throw new ApiError(0, 'Network error. Please check if the server is running.');
  }
};
