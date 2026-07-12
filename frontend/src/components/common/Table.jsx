// Generic table. `columns` is [{ key, header, render? }], `rows` is an array of
// objects. `render(row)` overrides how a cell is displayed; otherwise row[key] is used.
export default function Table({ columns, rows, emptyTitle = 'Nothing to show', emptyText = '' }) {
    return (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100 text-sm">
                    <thead className="bg-slate-50">
                        <tr>
                            {columns.map((col) => (
                                <th key={col.key} className="px-4 py-3 text-left font-semibold text-slate-600">
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {rows.map((row, index) => (
                            <tr key={row._id || index} className="hover:bg-slate-50">
                                {columns.map((col) => (
                                    <td key={col.key} className="px-4 py-3 align-top text-slate-700">
                                        {col.render ? col.render(row) : row[col.key]}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {rows.length === 0 && (
                <div className="px-5 py-12 text-center">
                    <p className="font-medium text-slate-700">{emptyTitle}</p>
                    {emptyText && <p className="mt-1 text-sm text-slate-500">{emptyText}</p>}
                </div>
            )}
        </div>
    );
}
