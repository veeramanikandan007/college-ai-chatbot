import { fetchApi } from './api';

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  department?: string;
  year?: number;
  semester?: number;
  student_id?: string;
  employee_id?: string;
  designation?: string;
  qualification?: string;
  office_location?: string;
  specialization?: string;
  phone?: string;
  avatar_url?: string;
}

export const getMe = async (): Promise<User> => {
  return fetchApi('/auth/me');
};

export const logout = () => {
  localStorage.removeItem('token');
  window.location.href = '/login';
};
