export default function ReportTable({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 bg-white rounded-2xl border border-slate-200 shadow-sm font-medium">
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
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Summary Overview</h3>
        {rows.map((row) => (
          <div key={row.status} className="flex items-center space-x-4">
            <span className="text-sm font-medium text-slate-700 w-40 flex-shrink-0 truncate">{row.status}</span>
            <div
              className="flex-1 bg-slate-100 rounded-full h-2.5 overflow-hidden"
              role="progressbar"
              aria-valuenow={row.pct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${row.status}: ${row.pct}%`}
            >
              <div
                className="bg-indigo-500 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${row.pct}%` }}
              ></div>
            </div>
            <span className="text-sm font-bold text-slate-900 w-10 text-right flex-shrink-0">{row.count}</span>
            <span className="text-xs font-medium text-slate-400 w-10 text-right flex-shrink-0">{row.pct}%</span>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm bg-white">
        <table className="min-w-full divide-y divide-slate-100">
          <thead className="bg-slate-50">
            <tr>
              <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Count</th>
              <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">% of Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => (
              <tr key={row.status} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{row.status}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-700 text-right">{row.count}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-400 text-right">{row.pct}%</td>
              </tr>
            ))}
            <tr className="bg-slate-50 border-t-2 border-slate-200">
              <td className="px-6 py-4 text-sm font-bold text-slate-900">Total</td>
              <td className="px-6 py-4 text-sm font-bold text-slate-900 text-right">{total}</td>
              <td className="px-6 py-4 text-sm font-bold text-slate-500 text-right">100%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
