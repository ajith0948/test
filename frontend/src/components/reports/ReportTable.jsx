export default function ReportTable({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="card p-8 text-center text-sm font-medium text-slate-500">
        No data available for this report.
      </div>
    );
  }

  const total = data.reduce((sum, row) => sum + row.count, 0);

  const rows = data.map((row) => ({
    ...row,
    pct: total > 0 ? Math.round((row.count / total) * 100) : 0
  }));

  return (
    <div className="space-y-6">
      <div className="card space-y-3.5 p-5">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Summary overview</h3>
        {rows.map((row) => (
          <div key={row.status} className="flex items-center space-x-4">
            <span className="w-40 flex-shrink-0 truncate text-sm font-medium text-slate-700">{row.status}</span>
            <div
              className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100"
              role="progressbar"
              aria-valuenow={row.pct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${row.status}: ${row.pct}%`}
            >
              <div className="h-2 rounded-full bg-brand-600 transition-all duration-500" style={{ width: `${row.pct}%` }}></div>
            </div>
            <span className="w-10 flex-shrink-0 text-right text-sm font-semibold text-slate-900">{row.count}</span>
            <span className="w-10 flex-shrink-0 text-right text-xs font-medium text-slate-400">{row.pct}%</span>
          </div>
        ))}
      </div>

      <div className="card overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-100 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th scope="col" className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
              <th scope="col" className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Count</th>
              <th scope="col" className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">% of Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => (
              <tr key={row.status} className="hover:bg-slate-50/80 transition-colors">
                <td className="px-4 py-3 font-medium text-slate-900">{row.status}</td>
                <td className="px-4 py-3 text-right text-slate-700">{row.count}</td>
                <td className="px-4 py-3 text-right text-slate-400">{row.pct}%</td>
              </tr>
            ))}
            <tr className="border-t-2 border-slate-200 bg-slate-50">
              <td className="px-4 py-3 font-semibold text-slate-900">Total</td>
              <td className="px-4 py-3 text-right font-semibold text-slate-900">{total}</td>
              <td className="px-4 py-3 text-right font-semibold text-slate-500">100%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
