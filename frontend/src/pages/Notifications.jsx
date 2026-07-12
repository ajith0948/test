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
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="page-eyebrow">Alerts</p>
          <h1 className="page-title">Notifications</h1>
          <p className="page-subtitle">Alerts and recent activities.</p>
        </div>
        {hasUnread && !loading && !error && (
          <button
            onClick={handleMarkAllAsRead}
            disabled={processingAll || processingId !== null}
            className="btn-secondary"
            aria-label="Mark all notifications as read"
          >
            {processingAll ? 'Updating…' : 'Mark all as read'}
          </button>
        )}
      </div>

      {actionError && (
        <div className="mb-5 flex items-center justify-between rounded-md border border-rose-200 bg-rose-50 p-4 text-rose-700" role="alert">
          <span className="text-sm font-medium">{actionError}</span>
          <button onClick={() => setActionError(null)} className="text-rose-500 hover:text-rose-700 focus:outline-none" aria-label="Dismiss alert">
            <span className="text-lg font-semibold">&times;</span>
          </button>
        </div>
      )}

      {error ? (
        <div className="card border-rose-200 bg-rose-50 p-8 text-center" role="alert">
          <p className="mb-4 text-sm font-medium text-rose-700">{error}</p>
          <button onClick={fetchNotifications} className="btn-danger-solid">
            Retry connection
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
