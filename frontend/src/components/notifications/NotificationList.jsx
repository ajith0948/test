import NotificationItem from './NotificationItem';
import { UI_MESSAGES } from '../../utils/constants';

export default function NotificationList({ notifications, onMarkRead, processingId, processingAll }) {
  if (!notifications || notifications.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 font-medium shadow-sm">
        {UI_MESSAGES.NOTIFICATIONS_EMPTY}
      </div>
    );
  }

  return (
    <div role="list" className="bg-white rounded-2xl border border-slate-200 overflow-hidden divide-y divide-slate-100 shadow-sm">
      {notifications.map((notif) => (
        <NotificationItem
          key={notif._id}
          notification={notif}
          onMarkRead={onMarkRead}
          isProcessing={processingAll || processingId === notif._id}
        />
      ))}
    </div>
  );
}
