import { useState, useEffect, useRef } from 'react';
import userService from '../../services/userService';
import { toast } from 'sonner';

const NotificationDropdown = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await userService.getNotifications();
      if (data.success) {
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll for new notifications every 5 seconds for pseudo real-time
    const interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (notificationId) => {
    try {
      const data = await userService.markNotificationRead(notificationId);
      if (data.success) {
        setUnreadCount(prev => Math.max(0, prev - 1));
        setNotifications(prev => prev.map(n => 
          n._id === notificationId ? { ...n, isRead: true } : n
        ));
      }
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
        const data = await userService.markNotificationRead();
        if (data.success) {
            setUnreadCount(0);
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            toast.success("Đã đánh dấu tất cả là đã đọc");
        }
    } catch (error) {
        console.error("Failed to mark all as read", error);
    }
  }

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      handleMarkAsRead(notification._id);
    }
    // Navigate based on notification type if needed
    // if (notification.type === 'admin_message') { ... }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all relative"
      >
        <span className="text-xl">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-100 dark:border-slate-800 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-sm">
            <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-200">Thông báo</h3>
            {unreadCount > 0 && (
                <button 
                    onClick={handleMarkAllAsRead}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
                >
                    Đọc tất cả
                </button>
            )}
          </div>
          
          <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
            {loading && notifications.length === 0 ? (
              <div className="p-4 text-center text-slate-500 text-sm">
                Đang tải...
              </div>
            ) : notifications.length > 0 ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {notifications.map((notification) => (
                  <div 
                    key={notification._id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer flex gap-3 ${!notification.isRead ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                  >
                    <div className={`mt-1 size-2 rounded-full shrink-0 ${!notification.isRead ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-700'}`} />
                    <div className="flex-1 space-y-1">
                      <p className={`text-sm leading-snug ${!notification.isRead ? 'font-medium text-slate-800 dark:text-slate-100' : 'text-slate-600 dark:text-slate-400'}`}>
                        {notification.message}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {new Date(notification.createdAt).toLocaleString('vi-VN')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500 dark:text-slate-400 flex flex-col items-center gap-2">
                <span className="text-2xl opacity-50">🔕</span>
                <span className="text-sm">Không có thông báo mới</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
