import { formatTimeAgo } from '../../utils/dateFormatter';
import { ACTIVITY_MODULES } from '../../utils/constants';

function getModuleIconStyles(module) {
  switch (module) {
    case ACTIVITY_MODULES.ASSET:
      return { bg: 'bg-emerald-50', text: 'text-emerald-700', icon: 'A' };
    case ACTIVITY_MODULES.ALLOCATION:
      return { bg: 'bg-brand-50', text: 'text-brand-700', icon: 'T' };
    case ACTIVITY_MODULES.BOOKING:
      return { bg: 'bg-violet-50', text: 'text-violet-700', icon: 'B' };
    case ACTIVITY_MODULES.MAINTENANCE:
      return { bg: 'bg-orange-50', text: 'text-orange-700', icon: 'M' };
    case ACTIVITY_MODULES.AUDIT:
      return { bg: 'bg-brand-50', text: 'text-brand-700', icon: 'R' };
    default:
      return { bg: 'bg-slate-100', text: 'text-slate-600', icon: 'C' };
  }
}

export default function ActivityLogItem({ log, isLast }) {
  const { user, action, module, createdAt } = log;
  const styles = getModuleIconStyles(module);

  return (
    <div role="listitem" className="relative flex items-start gap-3.5 border-b border-slate-100 bg-white p-4 transition-colors last:border-0 hover:bg-slate-50/80">
      {!isLast && <div className="absolute bottom-0 left-[35px] top-12 w-px bg-slate-100" aria-hidden="true"></div>}

      <div className={`z-10 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md ring-1 ring-inset ring-black/5 ${styles.bg} ${styles.text}`}>
        <span className="text-sm font-semibold" aria-hidden="true">{styles.icon}</span>
      </div>

      <div className="min-w-0 flex-1 pt-0.5">
        <p className="text-sm text-slate-700">
          <span className="font-semibold text-slate-900">{user?.name || 'Unknown User'}</span>{' '}
          <span className="text-slate-600">{action}</span>
        </p>
        <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
          <span>{formatTimeAgo(createdAt)}</span>
          <span aria-hidden="true">&bull;</span>
          <span className="font-medium uppercase tracking-wide">{module}</span>
        </div>
      </div>
    </div>
  );
}
