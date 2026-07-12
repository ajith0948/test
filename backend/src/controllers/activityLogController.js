/**
 * Activity Log Controller
 *
 * Real DB-backed implementation (formerly mock-backed - see ActivityLog model
 * and utils/logActivity.js, which other controllers call to write these).
 */
const ActivityLog = require('../models/ActivityLog');

// @desc    Get activity logs, optionally filtered by module, newest first
// @route   GET /api/logs?module=Asset|Allocation|Booking|Maintenance|Audit
// @access  Private
exports.getActivityLogs = async (req, res, next) => {
  try {
    const { module } = req.query;
    const filter = module && module !== 'All' ? { module } : {};

    const logs = await ActivityLog.find(filter)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(200);

    res.status(200).json(logs);
  } catch (error) {
    next(error);
  }
};
