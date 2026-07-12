/**
 * Report Controller
 *
 * Real DB-backed implementation (formerly mock-backed) - Dashboard KPIs and
 * the Reports & Analytics aggregates.
 */
const Asset = require('../models/Asset');
const Allocation = require('../models/Allocation');
const Booking = require('../models/Booking');
const MaintenanceRequest = require('../models/MaintenanceRequest');
const TransferRequest = require('../models/TransferRequest');
const { syncBookingStatuses } = require('../utils/syncBookingStatuses');

// ─── Dashboard ────────────────────────────────────────────────────────────────

// @desc    Top-line KPIs + upcoming/overdue returns for the dashboard
// @route   GET /api/dashboard/kpis
// @access  Private
exports.getDashboardKPIs = async (req, res, next) => {
  try {
    await syncBookingStatuses();

    const [assetsAvailable, assetsAllocated, maintenanceToday, activeBookings, pendingTransfers, dueAllocations] =
      await Promise.all([
        Asset.countDocuments({ status: 'Available', isActive: true }),
        Asset.countDocuments({ status: 'Allocated' }),
        MaintenanceRequest.countDocuments({ status: { $in: ['Pending', 'Approved', 'TechnicianAssigned', 'InProgress'] } }),
        Booking.countDocuments({ status: { $in: ['Upcoming', 'Ongoing'] } }),
        TransferRequest.countDocuments({ status: 'Requested' }),
        Allocation.find({ status: 'Active', expectedReturnDate: { $ne: null } })
          .populate('asset', 'name assetTag')
          .populate('employee', 'name')
          .populate('department', 'name')
          .sort({ expectedReturnDate: 1 })
          .limit(20),
      ]);

    const now = new Date();
    const returns = dueAllocations.map((allocation) => ({
      allocationId: allocation._id.toString(),
      assetName: allocation.asset?.name || 'Unknown asset',
      assetTag: allocation.asset?.assetTag || '',
      allocatedTo: allocation.employee?.name || allocation.department?.name || 'Unknown',
      expectedReturnDate: allocation.expectedReturnDate,
      status: new Date(allocation.expectedReturnDate) < now ? 'Overdue' : 'Upcoming',
    }));

    res.status(200).json({
      kpis: { assetsAvailable, assetsAllocated, maintenanceToday, activeBookings, pendingTransfers },
      returns,
    });
  } catch (error) {
    next(error);
  }
};

// ─── Reports ──────────────────────────────────────────────────────────────────

// Groups a collection's `status` field and fills in zero-count rows for every
// enum value the schema allows, so the report always shows the full picture
// (not just statuses that happen to have documents right now).
const groupByStatus = async (Model) => {
  const agg = await Model.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);
  const counts = new Map(agg.map((row) => [row._id, row.count]));
  const enumValues = Model.schema.path('status').enumValues;
  return enumValues.map((status) => ({ status, count: counts.get(status) || 0 }));
};

// @desc    Asset utilization breakdown by status
// @route   GET /api/reports/utilization
// @access  Private
exports.getUtilizationReport = async (req, res, next) => {
  try {
    const agg = await Asset.aggregate([{ $match: { isActive: true } }, { $group: { _id: '$status', count: { $sum: 1 } } }]);
    const counts = new Map(agg.map((row) => [row._id, row.count]));
    const enumValues = Asset.schema.path('status').enumValues;
    res.status(200).json(enumValues.map((status) => ({ status, count: counts.get(status) || 0 })));
  } catch (error) {
    next(error);
  }
};

// @desc    Maintenance request breakdown by status
// @route   GET /api/reports/maintenance
// @access  Private
exports.getMaintenanceReport = async (req, res, next) => {
  try {
    res.status(200).json(await groupByStatus(MaintenanceRequest));
  } catch (error) {
    next(error);
  }
};

// @desc    Allocation breakdown by status
// @route   GET /api/reports/allocations
// @access  Private
exports.getAllocationReport = async (req, res, next) => {
  try {
    res.status(200).json(await groupByStatus(Allocation));
  } catch (error) {
    next(error);
  }
};
