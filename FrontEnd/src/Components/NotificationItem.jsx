import React from 'react';

function formatTimeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now - date) / 1000);
  if (diff < 60) return 'Vừa xong';
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
  return date.toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}

const NotificationItem = ({ notification, onClick }) => {
  return (
    <div
      className={`flex items-start gap-3 px-5 py-4 cursor-pointer transition-colors ${
        notification.read ? 'bg-white hover:bg-gray-50' : 'bg-yellow-50 hover:bg-yellow-100'
      }`}
      onClick={onClick}
    >
      <span className={`mt-1 w-2 h-2 rounded-full ${notification.read ? 'bg-gray-300' : 'bg-red-500'}`}></span>
      <div className="flex-1">
        <div className="font-semibold text-gray-800 text-sm mb-1 line-clamp-1">{notification.title}</div>
        <div className="text-gray-600 text-xs mb-1 line-clamp-2">{notification.content}</div>
        <div className="text-gray-400 text-xs">{formatTimeAgo(notification.createdAt)}</div>
      </div>
    </div>
  );
};

export default NotificationItem; 