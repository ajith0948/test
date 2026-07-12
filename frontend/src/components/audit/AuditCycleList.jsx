import StatusBadge from '../common/StatusBadge';
import { formatDate } from '../../utils/dateFormatter';

export default function AuditCycleList({ audits, onViewDetails }) {
  if (!audits || audits.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 bg-white rounded-2xl border border-slate-200 shadow-sm font-medium">
        No audit cycles found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm bg-white">
      <table className="min-w-full divide-y divide-slate-100">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Audit Name</th>
            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Scope</th>
            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Date Range</th>
            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {audits.map((audit) => (
            <tr key={audit.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-bold text-slate-900">{audit.name}</div>
                <div className="text-sm text-slate-500 font-medium mt-0.5">Auditor: {audit.auditors.join(', ')}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 font-medium">
                {audit.scopeType}: {audit.scopeValue}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 font-medium">
                {formatDate(audit.startDate)} - {formatDate(audit.endDate)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <StatusBadge status={audit.status} />
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  onClick={() => onViewDetails(audit)}
                  className="text-indigo-600 hover:text-indigo-800 transition-colors focus:outline-none"
                  aria-label={`View details for ${audit.name}`}
                >
                  View Details
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
