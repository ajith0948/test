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
    // Booking status
    Upcoming: 'bg-indigo-50 text-indigo-700',
    Ongoing: 'bg-emerald-50 text-emerald-700',
    Completed: 'bg-slate-100 text-slate-600',
    Cancelled: 'bg-rose-50 text-rose-700',
    // Maintenance request status
    Pending: 'bg-amber-50 text-amber-700',
    TechnicianAssigned: 'bg-indigo-50 text-indigo-700',
    InProgress: 'bg-orange-50 text-orange-700',
    Resolved: 'bg-emerald-50 text-emerald-700',
    // Audit cycle / item status (Member 4)
    Open: 'bg-indigo-50 text-indigo-700',
    Closed: 'bg-slate-100 text-slate-600',
    Verified: 'bg-emerald-50 text-emerald-700',
    Missing: 'bg-rose-50 text-rose-700',
    Damaged: 'bg-orange-50 text-orange-700',
    // Report/dashboard-only status label
    Overdue: 'bg-rose-50 text-rose-700',
};

// Accepts either `value` (used by Asset/Allocation/Booking/Maintenance pages)
// or `status` (used by the Dashboard/Audit/Reports pages) - both render the
// same way, just different prop names inherited from each contributor.
export default function StatusBadge({ value, status }) {
    const label = value ?? status ?? 'Unknown';
    const classes = COLORS[label] || 'bg-slate-100 text-slate-600';
    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${classes}`}>
            {label}
        </span>
    );
}
