import { useState, useEffect, useCallback, useRef } from 'react';
import { apiCall } from '../utils/api';

function useNotifications() {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const pollingRef = useRef(null);
    const retryCount = useRef(0);

    const fetchNotifications = useCallback(async () => {
        try {
            const response = await apiCall('/api/customer/notifications', {
                headers: {
                    'Authorization': `Bearer ${sessionStorage.getItem('token')}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                setNotifications(data);
                setUnreadCount(data.filter(n => !n.read).length);
                setError(null);
                retryCount.current = 0;
            } else {
                throw new Error('Failed to fetch notifications');
            }
        } catch (err) {
            console.error('Error fetching notifications:', err);
            setError(err.message);
            retryCount.current += 1;
            if (retryCount.current < 3) {
                setTimeout(fetchNotifications, 2000 * retryCount.current);
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNotifications();
        pollingRef.current = setInterval(fetchNotifications, 30000);

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') fetchNotifications();
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            if (pollingRef.current) {
                clearInterval(pollingRef.current);
            }
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [fetchNotifications]);

    const markAsRead = useCallback(async (notificationId) => {
        try {
            const response = await apiCall(`/api/customer/notifications/${notificationId}/read`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${sessionStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                setNotifications((prev) =>
                    prev.map(n =>
                        n.id === notificationId ? { ...n, read: true } : n
                    )
                );
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (err) {
            console.error('Error marking notification as read:', err);
        }
    }, []);

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