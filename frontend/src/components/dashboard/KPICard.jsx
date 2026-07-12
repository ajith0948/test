export default function KPICard({ title, value, icon, urgent }) {
  return (
    <div className={`card flex flex-col justify-between p-5 ${urgent ? 'border-rose-200 bg-rose-50/40' : ''}`}>
      <div className="mb-3 flex items-start justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</p>
        {icon && (
          <div className={`rounded-md p-2 ${urgent ? 'bg-rose-100 text-rose-600' : 'bg-brand-50 text-brand-700'}`}>
            {icon}
          </div>
        )}
      </div>
      <p className={`text-3xl font-semibold tracking-tight ${urgent ? 'text-rose-700' : 'text-slate-900'}`}>{value}</p>
    </div>
  );
}
