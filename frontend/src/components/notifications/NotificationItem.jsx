import { NOTIFICATION_CONFIG } from '../../utils/constants';
import { formatTimeAgo } from '../../utils/dateFormatter';

export default function NotificationItem({ notification, onMarkRead, isProcessing }) {
  const { _id, type, message, isRead, createdAt } = notification;
  const config = NOTIFICATION_CONFIG[type] || { icon: type.charAt(0), bgClass: 'bg-slate-100 text-slate-600' };

  return (
    <div
      role="listitem"
      className={`p-6 flex items-start space-x-5 transition-colors ${
        isRead ? 'bg-white hover:bg-slate-50' : 'bg-indigo-50/40 hover:bg-indigo-50/60'
      }`}
    >
      <div className={`h-12 w-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm ${config.bgClass}`}>
        <span className="font-bold text-lg">{config.icon}</span>
      </div>

      <div className="flex-1 min-w-0 pt-1">
        <p className={`text-sm ${isRead ? 'text-slate-600 font-medium' : 'text-slate-900 font-bold'}`}>
          {message}
          {!isRead && <span className="sr-only" aria-label="Unread notification"> (Unread)</span>}
        </p>
        <p className="text-xs font-medium text-slate-400 mt-1.5">
          {formatTimeAgo(createdAt)}
        </p>
      </div>

      <div className="flex-shrink-0 flex items-center pt-2">
        {!isRead && (
          <button
            onClick={() => onMarkRead(_id)}
            disabled={isProcessing}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-bold px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Mark notification as read"
          >
            {isProcessing ? 'Updating...' : 'Mark Read'}
          </button>
        )}
      </div>
    </div>
  );
}
