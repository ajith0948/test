// NOT USED - superseded by the real ActivityLog model + controllers/activityLogController.js.
// This file can be deleted.
/**
 * Activity Log Mock Data (Owned by Member 4 - Likitha)
 * Phase 4: Replace with Mongoose calls `ActivityLog.find(...)`.
 */
const mockLogs = [
  {
    _id: 'log_1',
    user: { _id: 'u1', name: 'Naveed', email: 'naveed@assetflow.com' },
    action: 'Registered Asset AF-0045 (MacBook Pro)',
    module: 'Asset',
    metadata: { assetTag: 'AF-0045' },
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString()
  },
  {
    _id: 'log_2',
    user: { _id: 'u2', name: 'Naveed', email: 'naveed@assetflow.com' },
    action: 'Approved Transfer #123 for Office Chair',
    module: 'Allocation',
    metadata: { transferId: 'trans_123', assetId: 'a_99' },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
  },
  {
    _id: 'log_3',
    user: { _id: 'u3', name: 'Praveen', email: 'praveen@assetflow.com' },
    action: 'Booked Conference Room A',
    module: 'Booking',
    metadata: { bookingId: 'b_111', startTime: '2026-07-15T10:00:00Z' },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
  },
  {
    _id: 'log_4',
    user: { _id: 'u4', name: 'Praveen', email: 'praveen@assetflow.com' },
    action: 'Raised Maintenance for Dell Monitor',
    module: 'Maintenance',
    metadata: { maintenanceId: 'm_456', priority: 'High' },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString()
  },
  {
    _id: 'log_5',
    user: { _id: 'u5', name: 'Likitha', email: 'likitha@assetflow.com' },
    action: 'Closed Q3 Electronics Audit',
    module: 'Audit',
    metadata: { auditCycleId: 'audit_789' },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString()
  }
];

exports.getMockLogs = async (moduleFilter) => {
  let logs = [...mockLogs];
  if (moduleFilter && moduleFilter !== 'All') {
    logs = logs.filter(log => log.module === moduleFilter);
  }
  return logs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};
