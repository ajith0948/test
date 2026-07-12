import ActivityLogItem from './ActivityLogItem';
import { UI_MESSAGES } from '../../utils/constants';

export default function ActivityLogList({ logs }) {
  if (!logs || logs.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 font-medium shadow-sm">
        {UI_MESSAGES.ACTIVITY_LOGS_EMPTY}
      </div>
    );
  }

  return (
    <div role="list" className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
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
