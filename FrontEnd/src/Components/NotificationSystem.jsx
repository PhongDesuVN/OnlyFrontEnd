import React, { useState, useEffect, createContext, useContext } from 'react';

/**
 * Notification context for managing global notifications
 */
const NotificationContext = createContext();

/**
 * Hook to use notification system
 */
export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};

/**
 * Individual notification component
 */
const NotificationItem = ({ notification, onRemove }) => {
    const { id, type, title, message, duration } = notification;

    useEffect(() => {
        if (duration > 0) {
            const timer = setTimeout(() => {
                onRemove(id);
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [id, duration, onRemove]);

    const getIcon = () => {
        switch (type) {
            case 'success':
                return (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                        <polyline points="22,4 12,14.01 9,11.01"/>
                    </svg>
                );
            case 'error':
                return (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="15" y1="9" x2="9" y2="15"/>
                        <line x1="9" y1="9" x2="15" y2="15"/>
                    </svg>
                );
            case 'warning':
                return (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                        <line x1="12" y1="9" x2="12" y2="13"/>
                        <line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                );
            case 'info':
            default:
                return (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M12 16v-4"/>
                        <path d="M12 8h.01"/>
                    </svg>
                );
        }
    };

    return (
        <div className={`notification notification-${type}`}>
            <div className="notification-content">
                <div className="notification-icon">
                    {getIcon()}
                </div>
                <div className="notification-text">
                    {title && <h5 className="notification-title">{title}</h5>}
                    <p className="notification-message">{message}</p>
                </div>
                <button 
                    className="notification-close"
                    onClick={() => onRemove(id)}
                    aria-label="Đóng thông báo"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>
            </div>
        </div>
    );
};

/**
 * Notification container component
 */
const NotificationContainer = ({ notifications, removeNotification }) => {
    if (notifications.length === 0) return null;

    return (
        <div className="notification-container">
            {notifications.map(notification => (
                <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onRemove={removeNotification}
                />
            ))}
        </div>
    );
};

/**
 * Notification provider component
 */
export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);

    const addNotification = (notification) => {
        const id = Date.now() + Math.random();
        const newNotification = {
            id,
            type: 'info',
            duration: 5000,
            ...notification
        };

        setNotifications(prev => [...prev, newNotification]);
        return id;
    };

    const removeNotification = (id) => {
        setNotifications(prev => prev.filter(notification => notification.id !== id));
    };

    const clearAllNotifications = () => {
        setNotifications([]);
    };

    // Convenience methods for different notification types
    const showSuccess = (message, title = 'Thành công', duration = 3000) => {
        return addNotification({ type: 'success', title, message, duration });
    };

    const showError = (message, title = 'Lỗi', duration = 5000) => {
        return addNotification({ type: 'error', title, message, duration });
    };

    const showWarning = (message, title = 'Cảnh báo', duration = 4000) => {
        return addNotification({ type: 'warning', title, message, duration });
    };

    const showInfo = (message, title = 'Thông tin', duration = 3000) => {
        return addNotification({ type: 'info', title, message, duration });
    };

    const contextValue = {
        notifications,
        addNotification,
        removeNotification,
        clearAllNotifications,
        showSuccess,
        showError,
        showWarning,
        showInfo
    };

    return (
        <NotificationContext.Provider value={contextValue}>
            {children}
            <NotificationContainer 
                notifications={notifications}
                removeNotification={removeNotification}
            />
        </NotificationContext.Provider>
    );
};