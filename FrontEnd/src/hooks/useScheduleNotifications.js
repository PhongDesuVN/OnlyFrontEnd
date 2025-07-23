import { useState, useEffect, useCallback, useRef } from 'react';
import scheduleNotificationService from '../Services/scheduleNotificationService';

/**
 * Custom hook for managing schedule notifications
 * Provides real-time notification count and mark-as-read functionality
 * Requirements: 5.4, 5.5
 */
function useScheduleNotifications(operatorId, options = {}) {
  const {
    refreshInterval = 30000, // 30 seconds
    autoRefresh = true,
    onError = null
  } = options;

  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);
  const retryCount = useRef(0);
  const maxRetries = 3;

  // Fetch unread notification count
  const fetchUnreadCount = useCallback(async () => {
    if (!operatorId) {
      setUnreadCount(0);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const count = await scheduleNotificationService.getUnreadNotificationCount(operatorId);
      setUnreadCount(count);
      retryCount.current = 0; // Reset retry count on success
      
    } catch (err) {
      console.error('Error fetching schedule notification count:', err);
      setError(err.message);
      
      // Handle error callback
      if (onError) {
        onError(err);
      }
      
      // Retry logic
      retryCount.current += 1;
      if (retryCount.current < maxRetries) {
        setTimeout(fetchUnreadCount, 2000 * retryCount.current);
      }
    } finally {
      setLoading(false);
    }
  }, [operatorId, onError]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    if (!operatorId || unreadCount === 0) return false;

    try {
      setLoading(true);
      setError(null);
      
      const success = await scheduleNotificationService.markAllNotificationsAsRead(operatorId);
      
      if (success) {
        setUnreadCount(0);
        return true;
      }
      
      return false;
    } catch (err) {
      console.error('Error marking schedule notifications as read:', err);
      setError(err.message);
      
      if (onError) {
        onError(err);
      }
      
      return false;
    } finally {
      setLoading(false);
    }
  }, [operatorId, unreadCount, onError]);

  // Refresh notification count manually
  const refresh = useCallback(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  // Set up auto-refresh
  useEffect(() => {
    if (!autoRefresh || !operatorId) return;

    // Initial fetch
    fetchUnreadCount();

    // Set up interval
    if (refreshInterval > 0) {
      intervalRef.current = setInterval(fetchUnreadCount, refreshInterval);
    }

    // Refresh when tab becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchUnreadCount();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchUnreadCount, refreshInterval, autoRefresh, operatorId]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    unreadCount,
    loading,
    error,
    markAllAsRead,
    refresh,
    hasUnreadNotifications: unreadCount > 0
  };
}

export default useScheduleNotifications;