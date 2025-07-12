import React from 'react';
import NotificationItem from './NotificationItem';

const NotificationDropdown = ({ notifications, loading, error, onNotificationClick }) => {
  return (
    <div className="absolute right-0 mt-2 w-[350px] max-w-[95vw] sm:w-[350px] sm:max-w-[350px] bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-[400px] overflow-y-auto animate-fadeIn">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <span className="font-bold text-lg text-gray-800">Thông báo</span>
        {notifications && notifications.length > 0 && (
          <span className="ml-2 text-xs text-white bg-red-500 rounded-full px-2 py-0.5 font-semibold">
            {notifications.filter(n => !n.read).length} mới
          </span>
        )}
      </div>
      <div className="divide-y divide-gray-100">
        {loading ? (
          <div className="py-8 text-center text-gray-500">Đang tải...</div>
        ) : error ? (
          <div className="py-8 text-center text-red-500">{error}</div>
        ) : notifications && notifications.length > 0 ? (
          notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onClick={() => onNotificationClick(notification.id)}
            />
          ))
        ) : (
          <div className="py-8 text-center text-gray-500">Không có thông báo nào</div>
        )}
      </div>
    </div>
  );
};

export default NotificationDropdown; 