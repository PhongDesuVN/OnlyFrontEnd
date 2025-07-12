import { useState, useEffect, useRef, useCallback } from 'react';

const API_URL = 'http://localhost:8083/api/customer/notifications';

function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const pollingRef = useRef();
  const retryCount = useRef(0);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Không thể tải thông báo');
      const data = await res.json();
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.read).length);
      setLoading(false);
      retryCount.current = 0;
    } catch (err) {
      setError(err.message || 'Lỗi không xác định');
      setLoading(false);
      // Retry tối đa 3 lần
      if (retryCount.current < 3) {
        retryCount.current++;
        setTimeout(fetchNotifications, 2000 * retryCount.current);
      }
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    // Polling mỗi 30s
    pollingRef.current = setInterval(fetchNotifications, 30000);
    // Auto-refresh khi user quay lại tab
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') fetchNotifications();
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      clearInterval(pollingRef.current);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [fetchNotifications]);

  const markAsRead = async (id) => {
    const token = localStorage.getItem('token');
    try {
      await fetch(`${API_URL}/${id}/read`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => prev - 1);
    } catch (err) {
      setError('Không thể đánh dấu đã đọc');
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    refresh: fetchNotifications,
  };
}

export default useNotifications; 