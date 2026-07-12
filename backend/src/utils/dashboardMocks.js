// NOT USED - superseded by real Mongoose aggregate queries in
// controllers/reportController.js (getDashboardKPIs). This file can be deleted.
/**
 * Dashboard Mock Data (Owned by Member 4 - Likitha)
 * Phase 4: Replace with MongoDB aggregate queries across Asset, Allocation, Booking, and MaintenanceRequest.
 */
const mockData = {
  kpis: {
    assetsAvailable: 142,
    assetsAllocated: 315,
    maintenanceToday: 8,
    activeBookings: 12,
    pendingTransfers: 4
  },
  returns: [
    {
      allocationId: "64a2f8b1",
      assetName: "MacBook Pro M2",
      assetTag: "AF-0114",
      allocatedTo: "Priya Sharma",
      expectedReturnDate: "2026-07-10T00:00:00.000Z",
      status: "Overdue"
    },
    {
      allocationId: "64a2f8b2",
      assetName: "Conference Room Projector",
      assetTag: "AF-0089",
      allocatedTo: "Engineering Dept",
      expectedReturnDate: "2026-07-15T00:00:00.000Z",
      status: "Upcoming"
    }
  ]
};

exports.getMockDashboardData = async () => {
  return mockData;
};
