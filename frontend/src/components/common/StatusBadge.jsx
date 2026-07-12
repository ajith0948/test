const COLORS = {
    // Asset lifecycle
    Available: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    Allocated: 'bg-brand-50 text-brand-700 ring-brand-600/20',
    Reserved: 'bg-amber-50 text-amber-700 ring-amber-600/20',
    'Under Maintenance': 'bg-orange-50 text-orange-700 ring-orange-600/20',
    Lost: 'bg-rose-50 text-rose-700 ring-rose-600/20',
    Retired: 'bg-slate-100 text-slate-600 ring-slate-500/20',
    Disposed: 'bg-slate-100 text-slate-600 ring-slate-500/20',
    // Allocation / transfer status
    Active: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    'Return Requested': 'bg-amber-50 text-amber-700 ring-amber-600/20',
    Returned: 'bg-slate-100 text-slate-600 ring-slate-500/20',
    Transferred: 'bg-brand-50 text-brand-700 ring-brand-600/20',
    Requested: 'bg-amber-50 text-amber-700 ring-amber-600/20',
    Approved: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    Rejected: 'bg-rose-50 text-rose-700 ring-rose-600/20',
    // Booking status
    Upcoming: 'bg-brand-50 text-brand-700 ring-brand-600/20',
    Ongoing: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    Completed: 'bg-slate-100 text-slate-600 ring-slate-500/20',
    Cancelled: 'bg-rose-50 text-rose-700 ring-rose-600/20',
    // Maintenance request status
    Pending: 'bg-amber-50 text-amber-700 ring-amber-600/20',
    TechnicianAssigned: 'bg-brand-50 text-brand-700 ring-brand-600/20',
    InProgress: 'bg-orange-50 text-orange-700 ring-orange-600/20',
    Resolved: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    // Audit cycle / item status
    Open: 'bg-brand-50 text-brand-700 ring-brand-600/20',
    Closed: 'bg-slate-100 text-slate-600 ring-slate-500/20',
    Verified: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    Missing: 'bg-rose-50 text-rose-700 ring-rose-600/20',
    Damaged: 'bg-orange-50 text-orange-700 ring-orange-600/20',
    // Report/dashboard-only status label
    Overdue: 'bg-rose-50 text-rose-700 ring-rose-600/20',
};

// Accepts either `value` (used by Asset/Allocation/Booking/Maintenance pages)
// or `status` (used by the Dashboard/Audit/Reports pages) - both render the
// same way, just different prop names inherited from each contributor.
export default function StatusBadge({ value, status }) {
    const label = value ?? status ?? 'Unknown';
    const classes = COLORS[label] || 'bg-slate-100 text-slate-600 ring-slate-500/20';
    return (
        <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${classes}`}>
            {label}
        </span>
    );
}
