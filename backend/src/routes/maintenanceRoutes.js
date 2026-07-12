const express = require('express');
const { createRequest, getMaintenanceRequests, approveRequest, resolveRequest } = require('../controllers/maintenanceController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/', getMaintenanceRequests);
router.post('/', createRequest);

// Asset Managers, Admins, and Department Heads can approve/reject requests
router.patch('/:id/approve', authorizeRoles('Asset Manager', 'Admin', 'Department Head'), approveRequest);

// Only Asset Managers and Admins mark a request resolved
router.patch('/:id/resolve', authorizeRoles('Asset Manager', 'Admin'), resolveRequest);

module.exports = router;
