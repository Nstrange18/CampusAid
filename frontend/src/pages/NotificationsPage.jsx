import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { Bell, Check, MailOpen, Calendar } from 'lucide-react';

export const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const data = await api.get("/notifications");
      setNotifications(data);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`, {});
      // Refresh list
      fetchNotifications();
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    // Process all unread notifications sequentially
    const unread = notifications.filter(n => !n.is_read);
    try {
      await Promise.all(unread.map(n => api.put(`/notifications/${n.notification_id}/read`, {})));
      fetchNotifications();
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const hasUnread = notifications.some(n => !n.is_read);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Your Messages</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Inbox alerts and system activity logs</p>
        </div>
        {hasUnread && (
          <button
            onClick={handleMarkAllAsRead}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 hover:bg-blue-100/80 dark:hover:bg-blue-900/50 rounded-xl text-xs font-semibold transition-all"
          >
            <MailOpen className="h-4 w-4" />
            Mark all as read
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent mb-2"></div>
          <p className="text-sm text-slate-500 dark:text-slate-400">Loading notifications...</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm p-8 text-center rounded-2xl max-w-md mx-auto transition-colors duration-300">
          <Bell className="h-12 w-12 text-slate-400 dark:text-slate-650 mx-auto mb-3" />
          <h4 className="font-bold text-slate-700 dark:text-slate-300">Inbox is empty</h4>
          <p className="text-xs text-slate-500 dark:text-slate-450 mt-1">We will notify you here when your request or donation verification changes state.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 transition-colors duration-300">
          {notifications.map((n) => (
            <div 
              key={n.notification_id} 
              className={`p-5 flex gap-4 transition-all duration-200 ${!n.is_read ? 'bg-blue-50/20 dark:bg-blue-950/10' : 'bg-white dark:bg-slate-900'}`}
            >
              <div className={`p-2.5 rounded-xl border shrink-0 flex items-center justify-center h-10 w-10 transition-colors ${
                !n.is_read 
                  ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/30' 
                  : 'bg-slate-50 dark:bg-slate-950/40 text-slate-400 dark:text-slate-500 border-slate-100 dark:border-slate-800'
              }`}>
                <Bell className="h-5 w-5" />
              </div>

              <div className="flex-1 space-y-1.5 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <h4 className={`text-sm ${!n.is_read ? 'font-bold text-slate-800 dark:text-slate-100' : 'font-medium text-slate-700 dark:text-slate-300'}`}>
                    {n.title}
                  </h4>
                  <div className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(n.created_at).toLocaleString()}</span>
                  </div>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed break-words">{n.message}</p>
              </div>

              {!n.is_read && (
                <button
                  onClick={() => handleMarkAsRead(n.notification_id)}
                  title="Mark as read"
                  className="p-1 text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 self-center border border-transparent hover:border-slate-200 dark:hover:border-slate-800 rounded-lg transition-all"
                >
                  <Check className="h-4.5 w-4.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default NotificationsPage;
