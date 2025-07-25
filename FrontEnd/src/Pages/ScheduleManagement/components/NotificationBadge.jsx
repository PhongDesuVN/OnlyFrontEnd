import React, { useState, useEffect, useCallback } from 'react';
import { Badge, Tooltip, Spin } from 'antd';
import { BellOutlined, CalendarOutlined } from '@ant-design/icons';
import useScheduleNotifications from '../../../hooks/useScheduleNotifications';

/**
 * NotificationBadge component for schedule-related notifications
 * Shows count of unread schedule notifications and provides mark-as-read functionality
 * Requirements: 5.4, 5.5
 */
const NotificationBadge = ({ 
  operatorId, 
  showIcon = true, 
  size = 'default',
  className = '',
  onNotificationCountChange,
  refreshInterval = 30000 // 30 seconds
}) => {
  // Use custom hook for schedule notifications
  const { 
    unreadCount, 
    loading, 
    error, 
    markAllAsRead, 
    refresh 
  } = useScheduleNotifications(operatorId, {
    refreshInterval,
    onError: (err) => console.error('Schedule notification error:', err)
  });

  // Notify parent component when count changes
  useEffect(() => {
    if (onNotificationCountChange) {
      onNotificationCountChange(unreadCount);
    }
  }, [unreadCount, onNotificationCountChange]);

  // Handle click to mark as read
  const handleClick = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    markAllAsRead();
  }, [markAllAsRead]);

  // Render the badge content
  const renderBadgeContent = () => {
    if (showIcon) {
      return (
        <div className="flex items-center space-x-1">
          <CalendarOutlined className="text-blue-600" />
          <BellOutlined className="text-gray-600" />
        </div>
      );
    }
    return <BellOutlined className="text-gray-600" />;
  };

  // Tooltip content
  const getTooltipTitle = () => {
    if (loading) return 'Đang tải...';
    if (error) return `Lỗi: ${error}`;
    if (unreadCount === 0) return 'Không có thông báo lịch làm việc mới';
    return `${unreadCount} thông báo lịch làm việc chưa đọc. Nhấp để đánh dấu đã đọc.`;
  };

  return (
    <div className={`inline-block ${className}`}>
      <Tooltip title={getTooltipTitle()} placement="bottom">
        <Badge 
          count={unreadCount} 
          size={size}
          showZero={false}
          className="cursor-pointer"
          onClick={handleClick}
        >
          <div className="relative">
            {loading && (
              <div className="absolute -top-1 -right-1 z-10">
                <Spin size="small" />
              </div>
            )}
            {renderBadgeContent()}
          </div>
        </Badge>
      </Tooltip>
    </div>
  );
};

// Higher-order component for easy integration with existing components
export const withScheduleNotifications = (WrappedComponent) => {
  return React.forwardRef((props, ref) => {
    const [scheduleNotificationCount, setScheduleNotificationCount] = useState(0);
    
    return (
      <div className="relative">
        <WrappedComponent 
          {...props} 
          ref={ref}
          scheduleNotificationCount={scheduleNotificationCount}
        />
        {props.operatorId && (
          <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2">
            <NotificationBadge
              operatorId={props.operatorId}
              showIcon={false}
              size="small"
              onNotificationCountChange={setScheduleNotificationCount}
            />
          </div>
        )}
      </div>
    );
  });
};

export default NotificationBadge;