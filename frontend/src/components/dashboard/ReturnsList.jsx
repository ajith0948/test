import { UI_MESSAGES } from '../../utils/constants';
import StatusBadge from '../common/StatusBadge';

export default function ReturnsList({ returns }) {
  if (!returns || returns.length === 0) {
    return (
      <div className="card p-8 text-center text-sm font-medium text-slate-500">
        {UI_MESSAGES.RETURNS_EMPTY}
      </div>
    );
  }

  return (
    <div className="card overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-100 text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Asset</th>
            <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Allocated To</th>
            <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Expected Return</th>
            <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {returns.map((item) => {
            const isOverdue = item.status === 'Overdue';
            return (
              <tr key={item.allocationId} className={`transition-colors ${isOverdue ? 'bg-rose-50/50 hover:bg-rose-50' : 'hover:bg-slate-50/80'}`}>
                <td className="px-4 py-3 align-top">
                  <div className="font-medium text-slate-900">{item.assetName}</div>
                  <div className="font-mono text-xs text-slate-400">{item.assetTag}</div>
                </td>
                <td className="px-4 py-3 align-top text-slate-700">
                  {item.allocatedTo}
                </td>
                <td className="px-4 py-3 align-top text-slate-700">
                  {new Date(item.expectedReturnDate).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 align-top">
                  <StatusBadge status={item.status} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
