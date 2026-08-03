import { fetchApi } from '../lib/api';

export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: string;
  priority: string;
  icon: string | null;
  is_read: boolean;
  is_pinned?: boolean;
  action_url: string | null;
  created_at: string;
  updated_at: string;
}

export const getNotifications = async (skip = 0, limit = 50, filterType?: string, unreadOnly = false): Promise<Notification[]> => {
  const params = new URLSearchParams();
  params.append('skip', skip.toString());
  params.append('limit', limit.toString());
  if (filterType && filterType !== 'all') params.append('filter', filterType);
  if (unreadOnly) params.append('unread_only', 'true');
  
  return await fetchApi(`/notifications?${params.toString()}`);
};

export const getUnreadCount = async (): Promise<{ unread_count: number }> => {
  return await fetchApi('/notifications/unread-count');
};

export const markAsRead = async (id: number): Promise<Notification> => {
  return await fetchApi(`/notifications/${id}/read`, { method: 'POST' });
};

export const markAllAsRead = async (): Promise<{ success: boolean }> => {
  return await fetchApi('/notifications/read-all', { method: 'POST' });
};

export const togglePin = async (id: number): Promise<Notification> => {
  return await fetchApi(`/notifications/${id}/pin`, { method: 'POST' });
};

export const clearAll = async (): Promise<{ success: boolean }> => {
  return await fetchApi('/notifications/clear-all', { method: 'DELETE' });
};

export const deleteNotification = async (id: number): Promise<{ success: boolean }> => {
  return await fetchApi(`/notifications/${id}`, { method: 'DELETE' });
};
