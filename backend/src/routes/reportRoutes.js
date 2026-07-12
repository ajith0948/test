const express = require('express');
const router  = express.Router();
const reportController = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

// Mounted at /api/reports - namespaced to avoid colliding with the real
// /api/maintenance and /api/allocations resource routes.
router.get('/utilization', reportController.getUtilizationReport);
router.get('/maintenance',  reportController.getMaintenanceReport);
router.get('/allocations',  reportController.getAllocationReport);

module.exports = router;
