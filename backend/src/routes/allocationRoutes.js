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
    createAllocationRequest,
    getAllocationRequests,
    reviewAllocationRequest,
} = require('../controllers/allocationController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

// Everyone logged in can view allocations / transfers and request a return or transfer
router.get('/', protect, getAllocations);
router.post('/', protect, authorizeRoles('Admin', 'Asset Manager'), createAllocation);
router.post('/:allocationId/return-request', protect, requestReturn);

router.get('/transfers', protect, getTransferRequests);
router.post('/transfers', protect, createTransferRequest);

// Self-service request for a currently unowned (Available) asset - the
// counterpart to the manager-driven POST / above. Employees may only request
// for themselves; Department Heads may request for themselves or their dept.
router.get('/requests', protect, getAllocationRequests);
router.post('/requests', protect, authorizeRoles('Employee', 'Department Head'), createAllocationRequest);
router.patch('/requests/:requestId/review', protect, authorizeRoles('Admin', 'Asset Manager', 'Department Head'), reviewAllocationRequest);

// Only Admins and Asset Managers can directly return assets (bypasses approval)
router.patch('/:allocationId/return', protect, authorizeRoles('Admin', 'Asset Manager'), returnAllocation);

// Admins and Asset Managers can review anything; Department Heads can review
// too, but the controller scopes them to requests within their own department
router.patch('/:allocationId/return-review', protect, authorizeRoles('Admin', 'Asset Manager', 'Department Head'), reviewReturnRequest);
router.patch('/transfers/:transferId/review', protect, authorizeRoles('Admin', 'Asset Manager', 'Department Head'), reviewTransferRequest);

module.exports = router;
