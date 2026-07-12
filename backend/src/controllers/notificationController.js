/**
 * Notification Controller
 *
 * Real DB-backed implementation (formerly mock-backed - see Notification model
 * and utils/notify.js, which other controllers call to create these).
 */
const Notification = require('../models/Notification');

// @desc    Get the logged-in user's notifications, newest first
// @route   GET /api/notifications
// @access  Private
exports.getUserNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(notifications);
  } catch (error) {
    next(error);
  }
};

// @desc    Mark a single notification as read (only if it belongs to the caller)
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = await Notification.findOneAndUpdate(
      { _id: id, user: req.user._id },
      { $set: { isRead: true } },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Notification not found.' });
    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};

// @desc    Mark all of the logged-in user's notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
exports.markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ user: req.user._id, isRead: false }, { $set: { isRead: true } });
    res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
};
