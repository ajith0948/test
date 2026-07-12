import { useState, useEffect, useRef } from 'react';
import axiosInstance from '../api/axiosInstance';
import NotificationList from '../components/notifications/NotificationList';
import NotificationSkeleton from '../components/notifications/NotificationSkeleton';
import { UI_MESSAGES } from '../utils/constants';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const [processingAll, setProcessingAll] = useState(false);

  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    fetchNotifications();
    return () => {
      isMounted.current = false;
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      if (isMounted.current) setLoading(true);
      if (isMounted.current) setError(null);
      const response = await axiosInstance.get('/notifications');
      if (isMounted.current) setNotifications(response.data);
    } catch (err) {
      if (isMounted.current) {
        const errorMessage = err.response?.data?.message || err.message || UI_MESSAGES.NOTIFICATIONS_LOAD_ERROR;
        setError(errorMessage);
      }
    } finally {
      if (isMounted.current) setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    if (processingId || processingAll) return;

    const previous = JSON.parse(JSON.stringify(notifications));

    if (isMounted.current) {
      setProcessingId(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setActionError(null);
    }

    try {
      await axiosInstance.put(`/notifications/${id}/read`);
    } catch (err) {
      if (isMounted.current) {
        setNotifications(previous);
        setActionError(UI_MESSAGES.MARK_READ_ERROR);
      }
    } finally {
      if (isMounted.current) {
        setProcessingId(null);
      }
    }
  };

  const handleMarkAllAsRead = async () => {
    if (processingId || processingAll) return;

    const previous = JSON.parse(JSON.stringify(notifications));

    if (isMounted.current) {
      setProcessingAll(true);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setActionError(null);
    }

    try {
      await axiosInstance.put('/notifications/read-all');
    } catch (err) {
      if (isMounted.current) {
        setNotifications(previous);
        setActionError(UI_MESSAGES.MARK_ALL_READ_ERROR);
      }
    } finally {
      if (isMounted.current) {
        setProcessingAll(false);
      }
    }
  };

  const hasUnread = notifications.some(n => !n.isRead);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Notifications</h1>
          <p className="text-slate-500 font-medium mt-1">Alerts and recent activities</p>
        </div>
        {hasUnread && !loading && !error && (
          <button
            onClick={handleMarkAllAsRead}
            disabled={processingAll || processingId !== null}
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors focus:outline-none px-4 py-2 bg-indigo-50 hover:bg-indigo-100 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Mark all notifications as read"
          >
            {processingAll ? 'Updating...' : 'Mark all as read'}
          </button>
        )}
      </div>

      {actionError && (
        <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-600 p-4 rounded-2xl flex justify-between items-center shadow-sm" role="alert">
          <span className="text-sm font-medium">{actionError}</span>
          <button onClick={() => setActionError(null)} className="text-rose-500 hover:text-rose-700 focus:outline-none transition-colors" aria-label="Dismiss alert">
            <span className="text-2xl font-bold">&times;</span>
          </button>
        </div>
      )}

      {error ? (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-8 text-center shadow-sm" role="alert">
          <p className="text-rose-600 font-medium mb-6">{error}</p>
          <button
            onClick={fetchNotifications}
            className="px-5 py-2.5 bg-rose-600 text-white font-semibold rounded-xl hover:bg-rose-700 transition-all shadow-sm"
          >
            Retry Connection
          </button>
        </div>
      ) : loading ? (
        <NotificationSkeleton />
      ) : (
        <NotificationList
          notifications={notifications}
          onMarkRead={handleMarkAsRead}
          processingId={processingId}
          processingAll={processingAll}
        />
      )}
    </div>
  );
}
