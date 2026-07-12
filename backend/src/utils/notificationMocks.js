// NOT USED - superseded by the real Notification model + controllers/notificationController.js.
// This file can be deleted.
/**
 * Notification Mock Data (Owned by Member 4 - Likitha)
 *
 * Provides mock notification data reflecting the DB schema exactly.
 * Phase 4: Replace with Mongoose calls `Notification.find({ user: req.user._id })`.
 */

const mockNotifications = [
  {
    _id: 'notif_1',
    user: 'user_123',
    type: 'AssetAssigned',
    message: 'MacBook Pro (AF-0012) has been assigned to you.',
    relatedEntity: 'alloc_987',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString()
  },
  {
    _id: 'notif_2',
    user: 'user_123',
    type: 'MaintenanceApproved',
    message: 'Maintenance request for Dell Monitor (AF-0045) was approved.',
    relatedEntity: 'maint_456',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
  },
  {
    _id: 'notif_3',
    user: 'user_123',
    type: 'BookingConfirmed',
    message: 'Your booking for Conference Room A is confirmed.',
    relatedEntity: 'book_111',
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
  },
  {
    _id: 'notif_4',
    user: 'user_123',
    type: 'TransferApproved',
    message: 'Your transfer request for Office Chair (AF-0089) was approved.',
    relatedEntity: 'trans_222',
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString()
  },
  {
    _id: 'notif_5',
    user: 'user_123',
    type: 'OverdueReturn',
    message: 'You have an overdue return: iPad Pro (AF-0056).',
    relatedEntity: 'alloc_777',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString()
  }
];

let inMemoryNotifications = [...mockNotifications];

exports.getMockNotifications = async () => {
  return [...inMemoryNotifications].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

exports.markMockNotificationAsRead = async (id) => {
  const notif = inMemoryNotifications.find(n => n._id === id);
  if (!notif) throw new Error('Notification not found');
  notif.isRead = true;
  return notif;
};

exports.markAllMockNotificationsAsRead = async () => {
  inMemoryNotifications = inMemoryNotifications.map(n => ({ ...n, isRead: true }));
  return true;
};
