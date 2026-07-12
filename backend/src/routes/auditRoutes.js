const express = require('express');
const router = express.Router();
const auditController = require('../controllers/auditController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', auditController.getAuditCycles);
router.post('/', authorizeRoles('Admin', 'Asset Manager'), auditController.createAuditCycle);
router.put('/:id/items', authorizeRoles('Admin', 'Asset Manager'), auditController.updateAuditItemResult);
router.post('/:id/close', authorizeRoles('Admin', 'Asset Manager'), auditController.closeAuditCycle);

module.exports = router;
