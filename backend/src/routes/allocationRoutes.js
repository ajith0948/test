const express = require('express');
const {
    createAllocation,
    getAllocations,
    returnAllocation,
    requestReturn,
    reviewReturnRequest,
    createTransferRequest,
    getTransferRequests,
    reviewTransferRequest,
} = require('../controllers/allocationController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

// Everyone logged in can view allocations / transfers and request a return or transfer
router.get('/', protect, getAllocations);
router.post('/', protect, authorizeRoles('Admin', 'Asset Manager'), createAllocation);
router.post('/:allocationId/return-request', protect, requestReturn);

router.get('/transfers', protect, getTransferRequests);
router.post('/transfers', protect, createTransferRequest);

// Only Admins and Asset Managers can directly return assets (bypasses approval)
router.patch('/:allocationId/return', protect, authorizeRoles('Admin', 'Asset Manager'), returnAllocation);

// Admins and Asset Managers can review anything; Department Heads can review
// too, but the controller scopes them to requests within their own department
router.patch('/:allocationId/return-review', protect, authorizeRoles('Admin', 'Asset Manager', 'Department Head'), reviewReturnRequest);
router.patch('/transfers/:transferId/review', protect, authorizeRoles('Admin', 'Asset Manager', 'Department Head'), reviewTransferRequest);

module.exports = router;
