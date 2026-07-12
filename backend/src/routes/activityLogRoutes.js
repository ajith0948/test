const express = require('express');
const router  = express.Router();
const activityLogController = require('../controllers/activityLogController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

// GET /logs -> fetch activity logs (optional ?module= filter)
router.get('/', activityLogController.getActivityLogs);

module.exports = router;
