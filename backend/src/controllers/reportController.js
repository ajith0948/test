/**
 * Report Controller (Owned by Member 4 - Likitha)
 *
 * Handles Dashboard KPIs, Analytics, and Reports.
 * Currently uses mock data to adhere to the final API contract (Phase 2).
 */
const dashboardMockHelper = require('../utils/dashboardMocks');
const reportMockHelper    = require('../utils/reportMocks');

// ─── Dashboard ────────────────────────────────────────────────────────────────

exports.getDashboardKPIs = async (req, res, next) => {
  try {
    // TODO (Phase 4): Replace with MongoDB aggregate queries across Asset, Allocation, Booking, and MaintenanceRequest collections.
    const dashboardData = await dashboardMockHelper.getMockDashboardData();
    res.status(200).json(dashboardData);
  } catch (error) {
    next(error);
  }
};

// ─── Reports ──────────────────────────────────────────────────────────────────

exports.getUtilizationReport = async (req, res, next) => {
  try {
    // TODO (Phase 4): Replace with Asset.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }])
    const data = await reportMockHelper.getMockUtilizationData();
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

exports.getMaintenanceReport = async (req, res, next) => {
  try {
    // TODO (Phase 4): Replace with MaintenanceRequest.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }])
    const data = await reportMockHelper.getMockMaintenanceData();
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

exports.getAllocationReport = async (req, res, next) => {
  try {
    // TODO (Phase 4): Replace with Allocation.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }])
    const data = await reportMockHelper.getMockAllocationData();
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};
