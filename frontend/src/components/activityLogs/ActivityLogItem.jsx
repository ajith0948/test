import { formatTimeAgo } from '../../utils/dateFormatter';
import { ACTIVITY_MODULES } from '../../utils/constants';

function getModuleIconStyles(module) {
  switch (module) {
    case ACTIVITY_MODULES.ASSET:
      return { bg: 'bg-green-100', text: 'text-green-600', icon: 'A' };
    case ACTIVITY_MODULES.ALLOCATION:
      return { bg: 'bg-blue-100', text: 'text-blue-600', icon: 'T' };
    case ACTIVITY_MODULES.BOOKING:
      return { bg: 'bg-purple-100', text: 'text-purple-600', icon: 'B' };
    case ACTIVITY_MODULES.MAINTENANCE:
      return { bg: 'bg-orange-100', text: 'text-orange-600', icon: 'M' };
    case ACTIVITY_MODULES.AUDIT:
      return { bg: 'bg-indigo-100', text: 'text-indigo-600', icon: 'R' };
    default:
      return { bg: 'bg-gray-100', text: 'text-gray-600', icon: 'C' };
  }
}

export default function ActivityLogItem({ log, isLast }) {
  const { user, action, module, createdAt } = log;
  const styles = getModuleIconStyles(module);

  return (
    <div role="listitem" className="p-6 flex items-start space-x-5 relative bg-white transition-colors hover:bg-slate-50 border-b border-slate-100 last:border-0">
      {!isLast && (
        <div className="absolute left-12 top-16 bottom-0 w-0.5 bg-slate-200" aria-hidden="true"></div>
      )}

      <div className={`h-12 w-12 rounded-2xl flex items-center justify-center flex-shrink-0 z-10 shadow-sm ${styles.bg} ${styles.text}`}>
        <span className="font-bold text-lg" aria-hidden="true">{styles.icon}</span>
      </div>

      <div className="flex-1 min-w-0 pt-1">
        <p className="text-sm text-slate-700">
          <span className="font-bold text-slate-900">{user?.name || 'Unknown User'}</span>
          {' '}
          <span className="font-medium text-slate-600">{action}</span>
        </p>
        <div className="mt-1.5 flex items-center text-xs text-slate-400 space-x-2">
          <span className="font-medium">{formatTimeAgo(createdAt)}</span>
          <span aria-hidden="true">&bull;</span>
          <span className="font-bold uppercase tracking-wider">{module}</span>
        </div>
      </div>
    </div>
  );
}
