import { NOTIFICATION_CONFIG } from '../../utils/constants';
import { formatTimeAgo } from '../../utils/dateFormatter';

export default function NotificationItem({ notification, onMarkRead, isProcessing }) {
  const { _id, type, message, isRead, createdAt } = notification;
  const config = NOTIFICATION_CONFIG[type] || { icon: type.charAt(0), bgClass: 'bg-slate-100 text-slate-600' };

  return (
    <div
      role="listitem"
      className={`flex items-start gap-3.5 p-4 transition-colors ${
        isRead ? 'bg-white hover:bg-slate-50/80' : 'bg-brand-50/40 hover:bg-brand-50/70'
      }`}
    >
      <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md ring-1 ring-inset ring-black/5 ${config.bgClass}`}>
        <span className="text-sm font-semibold">{config.icon}</span>
      </div>

      <div className="min-w-0 flex-1 pt-0.5">
        <p className={`text-sm ${isRead ? 'font-normal text-slate-600' : 'font-medium text-slate-900'}`}>
          {message}
          {!isRead && <span className="sr-only" aria-label="Unread notification"> (Unread)</span>}
        </p>
        <p className="mt-1 text-xs text-slate-400">
          {formatTimeAgo(createdAt)}
        </p>
      </div>

      <div className="flex flex-shrink-0 items-center pt-1">
        {!isRead && (
          <button
            onClick={() => onMarkRead(_id)}
            disabled={isProcessing}
            className="rounded-md px-2.5 py-1 text-xs font-medium text-brand-700 transition-colors hover:bg-brand-100 focus:outline-none focus:ring-1 focus:ring-brand-500 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Mark notification as read"
          >
            {isProcessing ? 'Updating…' : 'Mark read'}
          </button>
        )}
      </div>
    </div>
  );
}
