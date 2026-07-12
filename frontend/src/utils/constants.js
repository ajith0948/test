export const AUDIT_STATUS = {
  OPEN:   'Open',
  CLOSED: 'Closed'
};

export const AUDIT_RESULT = {
  PENDING:  'Pending',
  VERIFIED: 'Verified',
  MISSING:  'Missing',
  DAMAGED:  'Damaged'
};

export const REPORT_TYPES = {
  UTILIZATION: 'utilization',
  MAINTENANCE: 'maintenance',
  ALLOCATIONS: 'allocations'
};

export const NOTIFICATION_TYPES = {
  ASSET_ASSIGNED: 'AssetAssigned',
  MAINTENANCE_APPROVED: 'MaintenanceApproved',
  MAINTENANCE_REJECTED: 'MaintenanceRejected',
  BOOKING_CONFIRMED: 'BookingConfirmed',
  BOOKING_CANCELLED: 'BookingCancelled',
  BOOKING_REMINDER: 'BookingReminder',
  TRANSFER_APPROVED: 'TransferApproved',
  OVERDUE_RETURN: 'OverdueReturn',
  AUDIT_DISCREPANCY: 'AuditDiscrepancy'
};

export const NOTIFICATION_CONFIG = {
  [NOTIFICATION_TYPES.ASSET_ASSIGNED]:       { icon: 'A', bgClass: 'bg-green-100 text-green-600' },
  [NOTIFICATION_TYPES.TRANSFER_APPROVED]:    { icon: 'T', bgClass: 'bg-green-100 text-green-600' },
  [NOTIFICATION_TYPES.BOOKING_CONFIRMED]:    { icon: 'B', bgClass: 'bg-green-100 text-green-600' },
  [NOTIFICATION_TYPES.MAINTENANCE_APPROVED]: { icon: 'M', bgClass: 'bg-green-100 text-green-600' },
  [NOTIFICATION_TYPES.OVERDUE_RETURN]:       { icon: 'O', bgClass: 'bg-red-100 text-red-600' },
  [NOTIFICATION_TYPES.AUDIT_DISCREPANCY]:    { icon: 'D', bgClass: 'bg-red-100 text-red-600' },
  [NOTIFICATION_TYPES.MAINTENANCE_REJECTED]: { icon: 'M', bgClass: 'bg-red-100 text-red-600' },
  [NOTIFICATION_TYPES.BOOKING_CANCELLED]:    { icon: 'B', bgClass: 'bg-red-100 text-red-600' },
  [NOTIFICATION_TYPES.BOOKING_REMINDER]:     { icon: 'R', bgClass: 'bg-blue-100 text-blue-600' }
};

export const UI_MESSAGES = {
  NOTIFICATIONS_EMPTY: "You're all caught up! No notifications.",
  NOTIFICATIONS_LOAD_ERROR: "Failed to load notifications.",
  MARK_READ_ERROR: "Failed to mark notification as read.",
  MARK_ALL_READ_ERROR: "Failed to mark all as read.",
  ACTIVITY_LOGS_EMPTY: "No recent activity found.",
  ACTIVITY_LOGS_LOAD_ERROR: "Failed to load activity logs.",
  DASHBOARD_LOAD_ERROR: "An unexpected error occurred while fetching dashboard data.",
  DASHBOARD_EMPTY: "No activity to report.",
  RETURNS_EMPTY: "No upcoming or overdue returns at this time.",
  AUDIT_LOAD_ERROR: "An unexpected error occurred while fetching audits.",
  AUDIT_UPDATE_ERROR: "Failed to update item result. Reverting to previous state.",
  AUDIT_CLOSE_CONFIRM: "Are you sure you want to close this audit cycle? Missing items will be marked as Lost.",
  AUDIT_CLOSE_ERROR: "Failed to close audit cycle. Please try again.",
  AUDIT_CREATE_MOCK: "Create Audit flow will be implemented when User/Role module is integrated.",
  REPORTS_LOAD_ERROR: "An unexpected error occurred while fetching the report."
};

export const ACTIVITY_MODULES = {
  ALL: 'All',
  ASSET: 'Asset',
  ALLOCATION: 'Allocation',
  BOOKING: 'Booking',
  MAINTENANCE: 'Maintenance',
  AUDIT: 'Audit'
};
