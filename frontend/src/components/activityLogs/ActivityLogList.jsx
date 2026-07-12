import ActivityLogItem from './ActivityLogItem';
import { UI_MESSAGES } from '../../utils/constants';

export default function ActivityLogList({ logs }) {
  if (!logs || logs.length === 0) {
    return (
      <div className="card p-8 text-center text-sm font-medium text-slate-500">
        {UI_MESSAGES.ACTIVITY_LOGS_EMPTY}
      </div>
    );
  }

  return (
    <div role="list" className="card overflow-hidden">
      {logs.map((log, index) => (
        <ActivityLogItem
          key={log._id}
          log={log}
          isLast={index === logs.length - 1}
        />
      ))}
    </div>
  );
}
