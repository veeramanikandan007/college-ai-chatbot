import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient, QueryClient } from '@tanstack/react-query';
import * as NotificationAPI from '../api/notifications';

let wsInstance: WebSocket | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let disconnectTimer: ReturnType<typeof setTimeout> | null = null;
let currentBackoff = 1000;
let activeSubscribers = 0;
let isIntentionalDisconnect = false;

function connectWebSocket(token: string, queryClient: QueryClient) {
  if (!token) return;

  if (wsInstance) {
    if (wsInstance.readyState === WebSocket.CONNECTING || wsInstance.readyState === WebSocket.OPEN) {
      return;
    }
  }

  isIntentionalDisconnect = false;
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsUrl = import.meta.env.VITE_API_URL 
      ? import.meta.env.VITE_API_URL.replace('http', 'ws') 
      : `${protocol}//127.0.0.1:8000`;
      
  console.log("[Socket] Created");
  wsInstance = new WebSocket(`${wsUrl}/api/v1/notifications/ws/${token}`);

  wsInstance.onopen = () => {
    console.log("[Socket] Connected");
    currentBackoff = 1000;
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
      // Parse error ignored
    }
  };

  wsInstance.onclose = (event) => {
    wsInstance = null;
    
    // Code 1008 means the backend explicitly kicked us because a newer connection for this user opened
    if (event.code === 1008) {
      console.log("[Socket] Closed (Superseded by new connection)");
      return; // Do not reconnect! Let the new connection handle it.
    }

    if (!isIntentionalDisconnect && activeSubscribers > 0) {
      console.log(`[Socket] Reconnecting in ${currentBackoff}ms...`);
      reconnectTimer = setTimeout(() => connectWebSocket(token, queryClient), currentBackoff);
      currentBackoff = Math.min(currentBackoff * 2, 30000);
    } else {
      console.log("[Socket] Closed");
    }
  };

  wsInstance.onerror = (err) => {
    console.error("[Socket] Error", err);
  };
}

function disconnectWebSocket() {
  console.log("[Socket] Cleanup");
  isIntentionalDisconnect = true;
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  if (wsInstance) {
    const state = wsInstance.readyState;
    if (state === WebSocket.CONNECTING || state === WebSocket.OPEN) {
      wsInstance.close();
    }
    wsInstance = null;
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

  // WebSocket Connection (Singleton Pooled with StrictMode Debounce)
  useEffect(() => {
    if (!token) return;

    activeSubscribers++;
    if (disconnectTimer) {
      clearTimeout(disconnectTimer);
      disconnectTimer = null;
    }
    
    connectWebSocket(token, queryClient);

    return () => {
      activeSubscribers--;
      if (activeSubscribers <= 0) {
        activeSubscribers = 0;
        // 500ms debounce to prevent StrictMode double-unmount from killing the connection
        disconnectTimer = setTimeout(() => {
          disconnectWebSocket();
        }, 500);
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

  const togglePin = useMutation({
    mutationFn: NotificationAPI.togglePin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    },
  });

  const clearAll = useMutation({
    mutationFn: NotificationAPI.clearAll,
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
    togglePin: togglePin.mutate,
    clearAll: clearAll.mutate,
    deleteNotification: deleteNotification.mutate,
  };
};
