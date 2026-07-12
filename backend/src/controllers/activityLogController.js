/**
 * Activity Log Controller (Owned by Member 4 - Likitha)
 *
 * Handles fetching activity logs.
 * Currently uses mock data.
 */
const mockHelper = require('../utils/activityLogMocks');

exports.getActivityLogs = async (req, res, next) => {
  try {
    const { module } = req.query;

    // TODO (Phase 4):
    // const filter = req.query.module && req.query.module !== 'All' ? { module: req.query.module } : {};
    // const logs = await ActivityLog.find(filter)
    //   .populate('user', 'name email')
    //   .sort({ createdAt: -1 });
    // return res.status(200).json(logs);

    const data = await mockHelper.getMockLogs(module);
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};
