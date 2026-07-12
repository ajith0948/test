import StatusBadge from '../common/StatusBadge';
import { AUDIT_STATUS, AUDIT_RESULT } from '../../utils/constants';
import { formatDate } from '../../utils/dateFormatter';

export default function AuditDetailModal({ audit, onClose, onUpdateItem, onCloseAudit, canManage }) {
  if (!audit) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="relative w-full max-w-3xl rounded-lg border border-slate-200 bg-white p-6 shadow-lg">
        <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
          <h3 id="modal-title" className="text-base font-semibold text-slate-900">{audit.name} details</h3>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close modal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-4 rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
          <div><span className="font-semibold text-slate-900">Scope:</span> {audit.scopeType} - {audit.scopeValue}</div>
          <div><span className="font-semibold text-slate-900">Status:</span> <StatusBadge status={audit.status} /></div>
          <div><span className="font-semibold text-slate-900">Assigned auditors:</span> {audit.auditors.join(', ')}</div>
          <div><span className="font-semibold text-slate-900">Timeline:</span> {formatDate(audit.startDate)} to {formatDate(audit.endDate)}</div>
        </div>

        <h4 className="mb-3 text-sm font-semibold text-slate-900">Audit items</h4>
        <div className="mb-6 max-h-72 overflow-y-auto overflow-x-auto rounded-md border border-slate-200">
          <table className="min-w-full divide-y divide-slate-100 text-sm">
            <thead className="sticky top-0 z-10 bg-slate-50">
              <tr>
                <th scope="col" className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Asset Tag</th>
                <th scope="col" className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Name</th>
                <th scope="col" className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Result</th>
                <th scope="col" className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {audit.items.map((item) => (
                <tr key={item.assetTag} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3 align-top font-medium text-slate-900">{item.assetTag}</td>
                  <td className="px-4 py-3 align-top text-slate-700">{item.assetName}</td>
                  <td className="px-4 py-3 align-top">
                    <StatusBadge status={item.result} />
                  </td>
                  <td className="px-4 py-3 align-top text-right">
                    {audit.status === AUDIT_STATUS.OPEN && canManage && (
                      <select
                        className="field-input !w-auto py-1.5"
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

        <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
          <button onClick={onClose} className="btn-secondary">
            Close viewer
          </button>
          {audit.status === AUDIT_STATUS.OPEN && canManage && (
            <button onClick={() => onCloseAudit(audit.id)} className="btn-primary">
              Close audit cycle
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
