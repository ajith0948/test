export default function KPICard({ label, value, hint }) {
    return (
        <div className="card p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
            <p className="mt-1.5 text-2xl font-semibold text-slate-900">{value}</p>
            {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
        </div>
    );
}
