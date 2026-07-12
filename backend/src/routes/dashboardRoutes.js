const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

// Mounted at /api/dashboard
router.get('/kpis', reportController.getDashboardKPIs);

module.exports = router;
