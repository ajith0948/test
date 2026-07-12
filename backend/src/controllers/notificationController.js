/**
 * Notification Controller (Owned by Member 4 - Likitha)
 *
 * Handles fetching and updating read status for user notifications.
 * Currently uses mock data.
 */
const mockHelper = require('../utils/notificationMocks');

exports.getUserNotifications = async (req, res, next) => {
  try {
    // TODO (Phase 4): Replace with `Notification.find({ user: req.user._id }).sort({ createdAt: -1 })`
    const data = await mockHelper.getMockNotifications();
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

exports.markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    // TODO (Phase 4): Replace with `Notification.findByIdAndUpdate(id, { isRead: true }, { new: true })`
    const updated = await mockHelper.markMockNotificationAsRead(id);
    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};

exports.markAllAsRead = async (req, res, next) => {
  try {
    // TODO (Phase 4): Replace with `Notification.updateMany({ user: req.user._id, isRead: false }, { $set: { isRead: true } })`
    await mockHelper.markAllMockNotificationsAsRead();
    res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
};
