import StatusBadge from '../common/StatusBadge';
import { formatDate } from '../../utils/dateFormatter';

export default function AuditCycleList({ audits, onViewDetails }) {
  if (!audits || audits.length === 0) {
    return (
      <div className="card p-8 text-center text-sm font-medium text-slate-500">
        No audit cycles found.
      </div>
    );
  }

  return (
    <div className="card overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-100 text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Audit Name</th>
            <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Scope</th>
            <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Date Range</th>
            <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
            <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {audits.map((audit) => (
            <tr key={audit.id} className="hover:bg-slate-50/80 transition-colors">
              <td className="px-4 py-3 align-top">
                <div className="font-medium text-slate-900">{audit.name}</div>
                <div className="mt-0.5 text-xs text-slate-500">Auditor: {audit.auditors.join(', ')}</div>
              </td>
              <td className="px-4 py-3 align-top text-slate-700">
                {audit.scopeType}: {audit.scopeValue}
              </td>
              <td className="px-4 py-3 align-top text-slate-700">
                {formatDate(audit.startDate)} - {formatDate(audit.endDate)}
              </td>
              <td className="px-4 py-3 align-top">
                <StatusBadge status={audit.status} />
              </td>
              <td className="px-4 py-3 align-top text-right">
                <button
                  onClick={() => onViewDetails(audit)}
                  className="font-medium text-brand-700 hover:text-brand-800 focus:outline-none"
                  aria-label={`View details for ${audit.name}`}
                >
                  View details
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
