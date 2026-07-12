import StatusBadge from '../common/StatusBadge';
import { AUDIT_STATUS, AUDIT_RESULT } from '../../utils/constants';
import { formatDate } from '../../utils/dateFormatter';

export default function AuditDetailModal({ audit, onClose, onUpdateItem, onCloseAudit }) {
  if (!audit) return null;

  return (
    <div
      className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex justify-center items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="relative p-8 border border-slate-200 w-full max-w-3xl shadow-xl rounded-2xl bg-white">
        <div className="flex justify-between items-center mb-6">
          <h3 id="modal-title" className="text-2xl font-bold tracking-tight text-slate-900">{audit.name} Details</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
            aria-label="Close modal"
          >
            <span className="text-3xl" aria-hidden="true">&times;</span>
          </button>
        </div>

        <div className="mb-8 grid grid-cols-2 gap-6 text-sm text-slate-700 bg-slate-50 p-6 rounded-xl border border-slate-100 shadow-sm font-medium">
          <div><span className="font-bold text-slate-900">Scope:</span> {audit.scopeType} - {audit.scopeValue}</div>
          <div><span className="font-bold text-slate-900">Status:</span> <StatusBadge status={audit.status} /></div>
          <div><span className="font-bold text-slate-900">Assigned Auditors:</span> {audit.auditors.join(', ')}</div>
          <div><span className="font-bold text-slate-900">Timeline:</span> {formatDate(audit.startDate)} to {formatDate(audit.endDate)}</div>
        </div>

        <h4 className="text-lg font-bold tracking-tight text-slate-900 mb-4">Audit Items</h4>
        <div className="overflow-x-auto border border-slate-200 rounded-xl mb-8 max-h-72 overflow-y-auto shadow-sm">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Asset Tag</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Name</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Result</th>
                <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {audit.items.map((item) => (
                <tr key={item.assetTag} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{item.assetTag}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-700">{item.assetName}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={item.result} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    {audit.status === AUDIT_STATUS.OPEN && (
                      <select
                        className="border border-slate-200 rounded-lg text-sm p-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium bg-white shadow-sm"
                        value={item.result}
                        onChange={(e) => onUpdateItem(audit.id, item.assetTag, e.target.value)}
                        aria-label={`Update result for ${item.assetName}`}
                      >
                        <option value={AUDIT_RESULT.PENDING}>Pending</option>
                        <option value={AUDIT_RESULT.VERIFIED}>Verified</option>
                        <option value={AUDIT_RESULT.MISSING}>Missing</option>
                        <option value={AUDIT_RESULT.DAMAGED}>Damaged</option>
                      </select>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-all shadow-sm"
          >
            Close Viewer
          </button>
          {audit.status === AUDIT_STATUS.OPEN && (
            <button
              onClick={() => onCloseAudit(audit.id)}
              className="px-5 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-all shadow-sm"
            >
              Close Audit Cycle
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
