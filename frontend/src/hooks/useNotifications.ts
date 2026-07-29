import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient, QueryClient } from '@tanstack/react-query';
import * as NotificationAPI from '../api/notifications';

let wsInstance: WebSocket | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let currentBackoff = 1000;
let activeSubscribers = 0;

function connectWebSocket(token: string, queryClient: QueryClient) {
  if (!token) return;
  if (wsInstance && (wsInstance.readyState === WebSocket.OPEN || wsInstance.readyState === WebSocket.CONNECTING)) {
    return;
  }

  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsUrl = import.meta.env.VITE_API_URL 
      ? import.meta.env.VITE_API_URL.replace('http', 'ws') 
      : `${protocol}//127.0.0.1:8000`;
      
  wsInstance = new WebSocket(`${wsUrl}/api/v1/notifications/ws/${token}`);

  wsInstance.onopen = () => {
    console.log("[Notifications] WebSocket connected");
    currentBackoff = 1000; // reset backoff
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
  };

  wsInstance.onmessage = (event) => {
    try {
      const message = JSON.parse(event.data);
      if (message.event === 'new_notification') {
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
        queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
      }
    } catch (err) {
      console.error("Failed to parse websocket message", err);
    }
  };

  wsInstance.onclose = () => {
    console.warn(`[Notifications] WebSocket closed. Active subscribers: ${activeSubscribers}`);
    wsInstance = null;
    if (activeSubscribers > 0) {
      // Exponential backoff reconnect
      console.log(`[Notifications] Reconnecting in ${currentBackoff}ms...`);
      reconnectTimer = setTimeout(() => connectWebSocket(token, queryClient), currentBackoff);
      currentBackoff = Math.min(currentBackoff * 2, 30000); // max 30s
    }
  };

  wsInstance.onerror = (err) => {
    console.error("[Notifications] WebSocket error", err);
  };
}

function disconnectWebSocket() {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  if (wsInstance) {
    wsInstance.onclose = null; // prevent reconnect loop
    wsInstance.close();
    wsInstance = null;
    console.log("[Notifications] WebSocket disconnected");
  }
}

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

  // WebSocket Connection (Singleton Pooled)
  useEffect(() => {
    if (!token) return;

    activeSubscribers++;
    connectWebSocket(token, queryClient);

    return () => {
      activeSubscribers--;
      if (activeSubscribers <= 0) {
        activeSubscribers = 0;
        disconnectWebSocket();
      }
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
