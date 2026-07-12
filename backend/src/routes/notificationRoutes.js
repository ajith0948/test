const express = require('express');
const router  = express.Router();
const notificationController = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

// GET /notifications -> fetch user's notifications
router.get('/', notificationController.getUserNotifications);

// PUT /notifications/read-all -> mark all as read
router.put('/read-all', notificationController.markAllAsRead);

// PUT /notifications/:id/read -> mark a specific notification as read
router.put('/:id/read', notificationController.markAsRead);

module.exports = router;
