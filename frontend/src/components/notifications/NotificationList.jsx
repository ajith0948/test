import NotificationItem from './NotificationItem';
import { UI_MESSAGES } from '../../utils/constants';

export default function NotificationList({ notifications, onMarkRead, processingId, processingAll }) {
  if (!notifications || notifications.length === 0) {
    return (
      <div className="card p-8 text-center text-sm font-medium text-slate-500">
        {UI_MESSAGES.NOTIFICATIONS_EMPTY}
      </div>
    );
  }

  return (
    <div role="list" className="card overflow-hidden divide-y divide-slate-100">
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
