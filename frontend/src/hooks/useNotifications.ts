import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as NotificationAPI from '../api/notifications';

export const useNotifications = (filterType?: string, unreadOnly = false) => {
  const queryClient = useQueryClient();
  const token = localStorage.getItem('token');

  // Fetch list of notifications
  const notificationsQuery = useQuery({
    queryKey: ['notifications', filterType, unreadOnly],
    queryFn: () => NotificationAPI.getNotifications(0, 50, filterType, unreadOnly),
  });

  // Fetch unread count
  const unreadCountQuery = useQuery({
    queryKey: ['notifications-unread-count'],
    queryFn: NotificationAPI.getUnreadCount,
  });

  // WebSocket Connection
  useEffect(() => {
    if (!token) return;

    // Use wss:// for production, ws:// for local
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    // Use the backend host or local dev server host
    const wsUrl = import.meta.env.VITE_API_URL 
        ? import.meta.env.VITE_API_URL.replace('http', 'ws') 
        : `${protocol}//127.0.0.1:8000`;
        
    const ws = new WebSocket(`${wsUrl}/api/v1/notifications/ws/${token}`);

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.event === 'new_notification') {
          // Invalidate queries to refetch data when a new notification arrives
          queryClient.invalidateQueries({ queryKey: ['notifications'] });
          queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
        }
      } catch (err) {
        console.error("Failed to parse websocket message", err);
      }
    };

    return () => {
      ws.close();
    };
  }, [token, queryClient]);

  // Mutations for actions
  const markAsRead = useMutation({
    mutationFn: NotificationAPI.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    },
  });

  const markAllAsRead = useMutation({
    mutationFn: NotificationAPI.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    },
  });

  const deleteNotification = useMutation({
    mutationFn: NotificationAPI.deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    },
  });

  return {
    notifications: notificationsQuery.data || [],
    isLoading: notificationsQuery.isLoading,
    isError: notificationsQuery.isError,
    unreadCount: unreadCountQuery.data?.unread_count || 0,
    markAsRead: markAsRead.mutate,
    markAllAsRead: markAllAsRead.mutate,
    deleteNotification: deleteNotification.mutate,
  };
};
