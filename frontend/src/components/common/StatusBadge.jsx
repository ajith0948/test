const COLORS = {
    // Asset lifecycle
    Available: 'bg-emerald-50 text-emerald-700',
    Allocated: 'bg-indigo-50 text-indigo-700',
    Reserved: 'bg-amber-50 text-amber-700',
    'Under Maintenance': 'bg-orange-50 text-orange-700',
    Lost: 'bg-rose-50 text-rose-700',
    Retired: 'bg-slate-100 text-slate-500',
    Disposed: 'bg-slate-100 text-slate-500',
    // Allocation / transfer status
    Active: 'bg-emerald-50 text-emerald-700',
    'Return Requested': 'bg-amber-50 text-amber-700',
    Returned: 'bg-slate-100 text-slate-600',
    Transferred: 'bg-indigo-50 text-indigo-700',
    Requested: 'bg-amber-50 text-amber-700',
    Approved: 'bg-emerald-50 text-emerald-700',
    Rejected: 'bg-rose-50 text-rose-700',
};

export default function StatusBadge({ value }) {
    const classes = COLORS[value] || 'bg-slate-100 text-slate-600';
    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${classes}`}>
            {value}
        </span>
    );
}
