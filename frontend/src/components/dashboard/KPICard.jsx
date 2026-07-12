export default function KPICard({ title, value, icon, urgent }) {
  return (
    <div className={`p-6 rounded-2xl bg-white shadow-sm border flex flex-col justify-between ${urgent ? 'border-rose-200 bg-rose-50/30' : 'border-slate-200'}`}>
      <div className="flex justify-between items-start mb-4">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{title}</p>
        {icon && (
          <div className={`p-2.5 rounded-xl ${urgent ? 'bg-rose-100 text-rose-600' : 'bg-indigo-50 text-indigo-600'}`}>
            {icon}
          </div>
        )}
      </div>
      <div>
        <h3 className={`text-4xl font-bold tracking-tight ${urgent ? 'text-rose-700' : 'text-slate-900'}`}>{value}</h3>
      </div>
    </div>
  );
}
